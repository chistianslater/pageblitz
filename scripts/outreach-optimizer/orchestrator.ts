import * as fs from "fs";
import * as path from "path";
import {
  getActiveExperiment,
  createNewExperiment,
  markExperimentCompleted,
  getUncontactedBusinesses,
  recordEmailSent,
  updateExperimentCounts,
  closePool,
  type ExperimentRow,
} from "./db-client";
import { sendOutreachEmail } from "./resend-client";
import { generateChallenger } from "./claude-client";

const DRY_RUN = process.env.DRY_RUN === "true";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE ?? "10", 10);
const MIN_SENDS_PER_VARIANT = 10;
const MIN_DAYS_RUNNING = 3;

const DIR = path.resolve(__dirname);
const VARIANTS_DIR = path.join(DIR, "variants");
const RESOURCES_PATH = path.join(DIR, "resources.md");
const RESULTS_PATH = path.join(DIR, "results.json");

function log(prefix: string, msg: string) {
  console.log(`[${prefix}] ${msg}`);
}

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function writeFile(filePath: string, content: string) {
  if (DRY_RUN) {
    log("DRY_RUN", `Would write to ${filePath}`);
    return;
  }
  fs.writeFileSync(filePath, content, "utf-8");
}

interface VariantContent {
  hypothesis: string;
  subject: string;
  body: string;
}

function parseVariantFile(content: string): VariantContent {
  const hypothesisMatch = content.match(/## Hypothese\n([\s\S]*?)(?=## Betreff)/);
  const subjectMatch = content.match(/## Betreff\n([\s\S]*?)(?=## Body)/);
  const bodyMatch = content.match(/## Body\n([\s\S]*?)$/);

  return {
    hypothesis: hypothesisMatch?.[1]?.trim() ?? "",
    subject: subjectMatch?.[1]?.trim() ?? "",
    body: bodyMatch?.[1]?.trim() ?? "",
  };
}

function loadVariant(variantName: string): VariantContent | null {
  const filePath = path.join(VARIANTS_DIR, `${variantName}.md`);
  if (!fs.existsSync(filePath)) {
    log("ORCHESTRATOR", `Variant file not found: ${filePath}`);
    return null;
  }
  return parseVariantFile(readFile(filePath));
}

// ── HARVEST: Check if experiment is ready to conclude ────────────────────────

async function harvest(experiment: ExperimentRow): Promise<boolean> {
  log("HARVEST", `Checking experiment #${experiment.id} (${experiment.baselineVariant} vs ${experiment.challengerVariant})`);

  const startedAt = new Date(experiment.startedAt);
  const ageMs = Date.now() - startedAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays < MIN_DAYS_RUNNING) {
    log("HARVEST", `Too young: ${ageDays.toFixed(1)} days (need ${MIN_DAYS_RUNNING})`);
    return false;
  }

  const baselineSends = experiment.baselineSends ?? 0;
  const challengerSends = experiment.challengerSends ?? 0;

  if (baselineSends < MIN_SENDS_PER_VARIANT || challengerSends < MIN_SENDS_PER_VARIANT) {
    log("HARVEST", `Not enough sends: baseline=${baselineSends}, challenger=${challengerSends} (need ${MIN_SENDS_PER_VARIANT} each)`);
    return false;
  }

  // Determine winner by open rate
  const baselineOpenRate = baselineSends > 0 ? (experiment.baselineOpens ?? 0) / baselineSends : 0;
  const challengerOpenRate = challengerSends > 0 ? (experiment.challengerOpens ?? 0) / challengerSends : 0;

  const winner =
    challengerOpenRate > baselineOpenRate
      ? experiment.challengerVariant
      : experiment.baselineVariant;

  log("HARVEST", `Winner: ${winner} (baseline OR: ${(baselineOpenRate * 100).toFixed(1)}%, challenger OR: ${(challengerOpenRate * 100).toFixed(1)}%)`);

  if (!DRY_RUN) {
    await markExperimentCompleted(experiment.id, winner);
  } else {
    log("DRY_RUN", `Would mark experiment #${experiment.id} completed with winner=${winner}`);
  }

  // Save result to results.json
  const results: any[] = JSON.parse(readFile(RESULTS_PATH) || "[]");
  results.push({
    experimentId: experiment.id,
    baseline: experiment.baselineVariant,
    challenger: experiment.challengerVariant,
    winner,
    baselineSends,
    challengerSends,
    baselineOpenRate: (baselineOpenRate * 100).toFixed(1) + "%",
    challengerOpenRate: (challengerOpenRate * 100).toFixed(1) + "%",
    baselineReplies: experiment.baselineReplies ?? 0,
    challengerReplies: experiment.challengerReplies ?? 0,
    concludedAt: new Date().toISOString(),
  });
  writeFile(RESULTS_PATH, JSON.stringify(results, null, 2) + "\n");

  // Update resources.md with learnings
  const loser =
    winner === experiment.challengerVariant
      ? experiment.baselineVariant
      : experiment.challengerVariant;
  const currentResources = readFile(RESOURCES_PATH);
  const learningEntry = `\n- **${new Date().toISOString().split("T")[0]}**: ${winner} beat ${loser} (OR: ${(Math.max(baselineOpenRate, challengerOpenRate) * 100).toFixed(1)}% vs ${(Math.min(baselineOpenRate, challengerOpenRate) * 100).toFixed(1)}%)`;
  const updatedResources = currentResources.replace(
    "## Erkenntnisse aus Experimenten\n(wird automatisch befüllt)",
    `## Erkenntnisse aus Experimenten${learningEntry}`
  );
  writeFile(RESOURCES_PATH, updatedResources);

  log("HARVEST", "Experiment concluded and results saved.");
  return true;
}

// ── GENERATE: Use Claude to create a new challenger variant ──────────────────

async function generate(winnerVariant: string): Promise<{ variantName: string; content: VariantContent } | null> {
  log("GENERATE", `Generating new challenger vs winner=${winnerVariant}`);

  const baselineContent = readFile(path.join(VARIANTS_DIR, "baseline.md"));
  const resourcesContent = readFile(RESOURCES_PATH);
  const resultsContent = readFile(RESULTS_PATH);

  if (!baselineContent) {
    log("GENERATE", "ERROR: baseline.md not found");
    return null;
  }

  // Alternate focus between open_rate and reply_rate
  const results: any[] = JSON.parse(resultsContent || "[]");
  const focus: "open_rate" | "reply_rate" =
    results.length % 2 === 0 ? "open_rate" : "reply_rate";

  log("GENERATE", `Focus: ${focus}`);

  if (DRY_RUN) {
    log("DRY_RUN", "Would call Claude to generate challenger variant");
    return {
      variantName: `challenger-${new Date().toISOString().split("T")[0]}-dry`,
      content: {
        hypothesis: "DRY RUN – no real generation",
        subject: "DRY RUN Betreff",
        body: "DRY RUN Body mit {businessName}",
      },
    };
  }

  try {
    const generated = await generateChallenger({
      baselineContent,
      resourcesContent,
      resultsContent,
      focus,
    });

    const variantPath = path.join(VARIANTS_DIR, `${generated.variantName}.md`);
    const variantContent = `## Hypothese\n${generated.hypothesis}\n\n## Betreff\n${generated.subject}\n\n## Body\n${generated.body}\n`;
    writeFile(variantPath, variantContent);

    log("GENERATE", `New challenger saved: ${generated.variantName}`);
    return { variantName: generated.variantName, content: generated };
  } catch (err: any) {
    log("GENERATE", `ERROR generating challenger: ${err.message}`);
    return null;
  }
}

// ── DEPLOY: Send emails to uncontacted businesses ────────────────────────────

async function deploy(
  baselineVariant: string,
  challengerVariant: string | null,
  experimentId: number | null
): Promise<void> {
  log("DEPLOY", `Fetching up to ${BATCH_SIZE} uncontacted businesses`);

  const businesses = await getUncontactedBusinesses(BATCH_SIZE);
  log("DEPLOY", `Found ${businesses.length} uncontacted businesses with email`);

  if (businesses.length === 0) {
    log("DEPLOY", "No uncontacted businesses available – skipping");
    return;
  }

  const baselineContent = loadVariant(baselineVariant);
  const challengerContent = challengerVariant ? loadVariant(challengerVariant) : null;

  if (!baselineContent) {
    log("DEPLOY", `ERROR: Could not load baseline variant "${baselineVariant}"`);
    return;
  }

  let baselineSent = 0;
  let challengerSent = 0;

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];

    // 50/50 split: even indices → baseline, odd indices → challenger (if available)
    const useChallenger = challengerContent && i % 2 !== 0;
    const variant = useChallenger ? challengerVariant! : baselineVariant;
    const content = useChallenger ? challengerContent! : baselineContent;

    // Personalize
    const subject = content.subject.replace(/{businessName}/g, business.name);
    const body = content.body.replace(/{businessName}/g, business.name);

    log("DEPLOY", `[${i + 1}/${businesses.length}] Sending to ${business.email} (${business.name}) – variant=${variant}`);

    if (DRY_RUN) {
      log("DRY_RUN", `Would send: to=${business.email}, subject="${subject}", variant=${variant}`);
      if (useChallenger) challengerSent++;
      else baselineSent++;
      continue;
    }

    try {
      // Placeholder outreachEmailId – will be updated after send
      const sendResult = await sendOutreachEmail({
        to: business.email,
        subject,
        body,
        businessName: business.name,
        variant,
        outreachEmailId: 0,
      });

      if (sendResult.success && sendResult.resendId) {
        const dbId = await recordEmailSent(
          business.id,
          business.email,
          subject,
          body,
          variant,
          sendResult.resendId
        );
        log("DEPLOY", `  Sent OK – DB id=${dbId}, resend id=${sendResult.resendId}`);

        // Update experiment counters
        if (experimentId) {
          const variantRole: "baseline" | "challenger" = useChallenger ? "challenger" : "baseline";
          await updateExperimentCounts(experimentId, variantRole, "sends");
        }

        if (useChallenger) challengerSent++;
        else baselineSent++;
      } else {
        log("DEPLOY", `  FAILED to send: ${sendResult.error}`);
      }
    } catch (err: any) {
      log("DEPLOY", `  ERROR: ${err.message}`);
    }

    // Small delay between sends to avoid rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  log("DEPLOY", `Done – baseline sent: ${baselineSent}, challenger sent: ${challengerSent}`);
}

// ── MAIN ORCHESTRATOR LOOP ───────────────────────────────────────────────────

async function main() {
  log("ORCHESTRATOR", `Starting – DRY_RUN=${DRY_RUN}, BATCH_SIZE=${BATCH_SIZE}`);

  try {
    let activeExperiment = await getActiveExperiment();
    let experimentId: number | null = activeExperiment?.id ?? null;
    let baselineVariant = "baseline";
    let challengerVariant: string | null = null;

    // ── HARVEST phase ─────────────────────────────────────────────────────────
    if (activeExperiment) {
      const concluded = await harvest(activeExperiment);

      if (concluded) {
        // Winner becomes the new baseline for the next experiment
        const winner = activeExperiment.challengerVariant; // will be overwritten below
        log("HARVEST", `Concluded. Now generating next challenger.`);

        // Use actual winner as new baseline
        const actualWinner =
          (activeExperiment.challengerOpens ?? 0) / Math.max(activeExperiment.challengerSends ?? 1, 1) >
          (activeExperiment.baselineOpens ?? 0) / Math.max(activeExperiment.baselineSends ?? 1, 1)
            ? activeExperiment.challengerVariant
            : activeExperiment.baselineVariant;

        // ── GENERATE phase ─────────────────────────────────────────────────────
        const generated = await generate(actualWinner);

        if (generated && !DRY_RUN) {
          const newExpId = await createNewExperiment(
            actualWinner,
            generated.variantName,
            generated.content.hypothesis
          );
          experimentId = newExpId;
          baselineVariant = actualWinner;
          challengerVariant = generated.variantName;
          log("ORCHESTRATOR", `New experiment #${newExpId} created: ${actualWinner} vs ${generated.variantName}`);
        } else if (generated && DRY_RUN) {
          log("DRY_RUN", `Would create experiment: ${actualWinner} vs ${generated.variantName}`);
          baselineVariant = actualWinner;
          challengerVariant = generated.variantName;
        } else {
          // Generation failed – continue with baseline only
          baselineVariant = actualWinner;
          challengerVariant = null;
          experimentId = null;
        }

        activeExperiment = null; // no active experiment anymore after harvest
      } else {
        // Experiment still running – continue with existing variants
        baselineVariant = activeExperiment.baselineVariant;
        challengerVariant = activeExperiment.challengerVariant;
        experimentId = activeExperiment.id;
        log("ORCHESTRATOR", `Continuing experiment #${experimentId}: ${baselineVariant} vs ${challengerVariant}`);
      }
    } else {
      // No active experiment – first run ever or after a concluded experiment without generation
      log("ORCHESTRATOR", "No active experiment. Checking if we should start one.");

      // Look for an existing challenger variant file
      const files = fs.existsSync(VARIANTS_DIR) ? fs.readdirSync(VARIANTS_DIR) : [];
      const challengerFiles = files.filter(
        (f) => f.endsWith(".md") && f !== "baseline.md"
      );

      if (challengerFiles.length > 0) {
        // Use the most recently modified challenger
        const latestChallenger = challengerFiles.sort((a, b) => {
          const statA = fs.statSync(path.join(VARIANTS_DIR, a)).mtimeMs;
          const statB = fs.statSync(path.join(VARIANTS_DIR, b)).mtimeMs;
          return statB - statA;
        })[0];

        const challengerName = latestChallenger.replace(".md", "");
        const challengerContent = loadVariant(challengerName);

        if (challengerContent && !DRY_RUN) {
          const newExpId = await createNewExperiment(
            "baseline",
            challengerName,
            challengerContent.hypothesis
          );
          experimentId = newExpId;
          challengerVariant = challengerName;
          log("ORCHESTRATOR", `Started new experiment #${newExpId}: baseline vs ${challengerName}`);
        } else if (DRY_RUN) {
          log("DRY_RUN", `Would start experiment: baseline vs ${challengerName}`);
          challengerVariant = challengerName;
          experimentId = 999; // fake id for dry run
        }
      } else {
        // No challenger yet – generate one, but first send a baseline-only batch
        log("ORCHESTRATOR", "First run ever: sending baseline-only batch and generating first challenger");

        const generated = await generate("baseline");

        if (generated && !DRY_RUN) {
          const newExpId = await createNewExperiment(
            "baseline",
            generated.variantName,
            generated.content.hypothesis
          );
          experimentId = newExpId;
          challengerVariant = generated.variantName;
          log("ORCHESTRATOR", `First experiment #${newExpId} created: baseline vs ${generated.variantName}`);
        } else if (generated && DRY_RUN) {
          log("DRY_RUN", `Would create first experiment: baseline vs ${generated.variantName}`);
          challengerVariant = generated.variantName;
          experimentId = 999;
        } else {
          // Even generation failed – send baseline only
          log("ORCHESTRATOR", "Generation failed. Sending baseline-only batch.");
          experimentId = null;
          challengerVariant = null;
        }
      }
    }

    // ── DEPLOY phase ──────────────────────────────────────────────────────────
    await deploy(baselineVariant, challengerVariant, experimentId);

    log("ORCHESTRATOR", "Run complete.");
  } finally {
    await closePool();
  }
}

main().catch((err) => {
  console.error("[ORCHESTRATOR] Fatal error:", err);
  process.exit(1);
});

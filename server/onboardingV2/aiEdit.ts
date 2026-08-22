import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";
import { AiEditResponseSchema, diffDocuments, type AiDiffEntry } from "../../shared/onboardingV2/aiEdit";
import { assertQuota } from "./suggest";
import { restoreFacts } from "./aiEditFacts";
import { AI_EDIT_SYSTEM_PROMPT, buildAiEditPrompt } from "./aiEditPrompt";

/**
 * KI-Chat des Onboarding-v2-Studios ("Was soll anders sein?"). Anders als
 * die Panel-Vorschläge (suggest.ts) kann das Ergebnis drei Formen annehmen:
 * ein validierter Inhalts-Vorschlag mit Diff, ein Stil-Vorschlag (Pack-
 * Wechsel statt Farb-/Font-Patch) oder eine Ablehnung bei Fakten-Wünschen.
 * Nichts wird hier persistiert — das übernimmt `applyAiEdit` in routerAi.ts
 * über `persistDoc`, erst nachdem der Nutzer den Vorschlag bestätigt hat.
 */

export type ProposeAiEditResult =
  | { kind: "content"; next: WebsiteDataV2; diff: AiDiffEntry[] }
  | { kind: "style"; packId: PackId; reason: string }
  | { kind: "reject"; reason: string };

/** Ein Versuch + genau ein Retry (Spec: „genau 1 Retry, dann Fehler"). */
const MAX_AI_EDIT_ATTEMPTS = 2;

const AI_EDIT_FAILED_MESSAGE =
  "Die KI konnte den Wunsch gerade nicht umsetzen — bitte noch einmal versuchen.";

async function withAiEditRetry<T>(attempt: () => Promise<T>): Promise<T> {
  for (let i = 0; i < MAX_AI_EDIT_ATTEMPTS; i++) {
    try {
      return await attempt();
    } catch (err) {
      console.error(
        `[onboardingV2.aiEdit] Versuch ${i + 1}/${MAX_AI_EDIT_ATTEMPTS} fehlgeschlagen:`,
        err
      );
    }
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: AI_EDIT_FAILED_MESSAGE,
  });
}

/**
 * Permissives Antwortschema für den rohen LLM-JSON-Output. Ein strikter
 * json_schema-Vertrag für die volle Sektions-Discriminated-Union ist bei
 * OpenAI-kompatiblen Structured Outputs nicht praktikabel (11 Sektionstypen
 * mit je eigenen Pflichtfeldern) — deshalb wird hier nur die äußere Form
 * geprüft und danach auf `AiEditResponseSchema` (die eigentliche, strikte
 * Validierung inkl. jeder Sektion) gemappt.
 */
const RawAiEditResponseSchema = z.object({
  kind: z.enum(["content", "style", "reject"]),
  content: z
    .object({
      seo: z.object({ title: z.string(), description: z.string() }),
      sections: z.array(z.record(z.string(), z.unknown())),
    })
    .nullable()
    .optional(),
  packId: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});

function mapRawToAiEditResponse(
  raw: z.infer<typeof RawAiEditResponseSchema>
): unknown {
  if (raw.kind === "content") {
    if (!raw.content) throw new Error("KI-Antwort: 'content' fehlt bei kind=content.");
    return {
      kind: "content",
      seo: raw.content.seo,
      sections: raw.content.sections,
    };
  }
  if (raw.kind === "style") {
    if (!raw.packId) throw new Error("KI-Antwort: 'packId' fehlt bei kind=style.");
    return { kind: "style", packId: raw.packId, reason: raw.reason ?? "" };
  }
  return { kind: "reject", reason: raw.reason ?? "" };
}

const AI_EDIT_RESPONSE_FORMAT = {
  type: "json_schema" as const,
  json_schema: {
    name: "ai_edit_response",
    strict: false,
    schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["content", "style", "reject"] },
        content: {
          type: ["object", "null"],
          properties: {
            seo: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
              required: ["title", "description"],
            },
            sections: { type: "array", items: { type: "object" } },
          },
          required: ["seo", "sections"],
        },
        packId: { type: ["string", "null"] },
        reason: { type: ["string", "null"] },
      },
      required: ["kind"],
    },
  },
};

/** Nur nicht-produktiv aktivierbar (Playwright/E2E, Task 10) — liefert einen deterministischen Vorschlag ohne LLM-Aufruf. */
function isLlmMockEnabled(): boolean {
  return (
    process.env.PB_LLM_MOCK === "1" && process.env.NODE_ENV !== "production"
  );
}

function mockAiEditResponse(doc: WebsiteDataV2): ProposeAiEditResult {
  const sections = doc.sections.map(s =>
    s.type === "hero" ? { ...s, headline: `${s.headline} ✓` } : s
  );
  const next = WebsiteDataV2Schema.parse({ ...doc, sections });
  return { kind: "content", next, diff: diffDocuments(doc, next) };
}

/**
 * Verarbeitet einen KI-Chat-Wunsch: baut den Prompt aus Verfassung +
 * aktuellem Inhalt, ruft das LLM, validiert die Antwort strikt und liefert
 * bei "content" ein bereits fakten-restauriertes, schema-valides Dokument
 * samt Diff zurück — persistiert wird hier nichts.
 */
export async function proposeAiEdit(args: {
  doc: WebsiteDataV2;
  message: string;
  category: string;
}): Promise<ProposeAiEditResult> {
  if (isLlmMockEnabled()) {
    return mockAiEditResponse(args.doc);
  }

  const prompt = buildAiEditPrompt(args);

  return withAiEditRetry(async () => {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: AI_EDIT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: AI_EDIT_RESPONSE_FORMAT,
    });
    const rawContent = response.choices?.[0]?.message?.content;
    const text = typeof rawContent === "string" ? rawContent : "";
    const json = JSON.parse(text);
    const raw = RawAiEditResponseSchema.parse(json);
    const mapped = mapRawToAiEditResponse(raw);
    const parsed = AiEditResponseSchema.parse(mapped);

    if (parsed.kind !== "content") return parsed;

    const restored = restoreFacts(args.doc, {
      seo: parsed.seo,
      sections: parsed.sections,
    });
    const next = WebsiteDataV2Schema.parse(restored);
    return { kind: "content" as const, next, diff: diffDocuments(args.doc, next) };
  });
}

/** Quota: 20 Anfragen pro Website und rollierender Stunde (eigener Bucket, siehe suggest.ts). */
const AI_EDIT_QUOTA_LIMIT = 20;

export function assertAiEditQuota(
  websiteId: number,
  now: number = Date.now()
): void {
  assertQuota("aiEdit", websiteId, AI_EDIT_QUOTA_LIMIT, now);
}

interface StoredProposal {
  websiteId: number;
  next: WebsiteDataV2;
  createdAt: number;
}

/** Server-only Zwischenspeicher unbestätigter Vorschläge (Spec §5: TTL 10 min, NIE ohne applyAiEdit persistiert). */
export const proposals = new Map<string, StoredProposal>();

const PROPOSAL_TTL_MS = 10 * 60 * 1000;

function sweepExpiredProposals(now: number): void {
  proposals.forEach((entry, id) => {
    if (now - entry.createdAt > PROPOSAL_TTL_MS) proposals.delete(id);
  });
}

export function storeProposal(websiteId: number, next: WebsiteDataV2): string {
  const now = Date.now();
  sweepExpiredProposals(now);
  const id = nanoid(21);
  proposals.set(id, { websiteId, next, createdAt: now });
  return id;
}

/** Liefert das gespeicherte Dokument nur bei passender websiteId und entfernt es (einmalig einlösbar). Unbekannt/abgelaufen/fremd → null. */
export function takeProposal(id: string, websiteId: number): WebsiteDataV2 | null {
  const now = Date.now();
  sweepExpiredProposals(now);
  const entry = proposals.get(id);
  if (!entry || entry.websiteId !== websiteId) return null;
  proposals.delete(id);
  return entry.next;
}

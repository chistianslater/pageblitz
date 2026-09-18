import { invokeLLM } from "../_core/llm";
import { jsonFromLlm } from "../generationV2/jsonFromLlm";
import { SectionV2Schema } from "../../shared/siteContract/schema";
import { getConstitution } from "../../shared/stylePacks";
import { tonePromptLines } from "../../shared/onboardingV2/tone";
import {
  INSERT_META,
  type InsertableSectionType,
} from "../../shared/onboardingV2/sectionInsert";
import type {
  SectionV2,
  WebsiteDataV2,
} from "../../shared/siteContract/types";

/**
 * Schneller Pfad für die Plus-Zonen (2026-09-18, Betreiber: „dauert extrem
 * lange"). Vorher lief das Einfügen über den KI-Chat, der immer die GANZE
 * Website (alle Sektionen + SEO) neu ausgibt — für eine neue Sektion
 * 10–20× so viel Antwort wie nötig, dazu zuerst das langsame Reasoning-
 * Modell (Timeouts nach 90 s im Log) und Schema-Fehler irgendwo im ganzen
 * Dokument, die den Retry auslösten.
 *
 * Hier schreibt die KI nur die eine neue Sektion. Die einfügbaren Typen
 * (story, usp, notice, stats, process, quote) haben keine Fakten-Felder
 * (Telefon, Adresse, URLs) — deshalb reicht die Schema-Prüfung dieser einen
 * Sektion, eine Fakten-Restauration wie im Chat ist nicht nötig.
 */

const MAX_ATTEMPTS = 2;
/** Eine Sektion ist klein — großzügig, aber weit unter dem 16k-Default des ganzen Dokuments. */
const MAX_OUTPUT_TOKENS = 2048;
const BACKUP_TIMEOUT_MS = 20_000;
const PRIMARY_TIMEOUT_MS = 30_000;
/** Kontext-Budget: bestehende Texte, gekürzt — genug für Ton und Fakten. */
const DIGEST_SECTION_CHARS = 700;
const DIGEST_TOTAL_CHARS = 5000;

const FAILED_MESSAGE =
  "Die Sektion konnte gerade nicht geschrieben werden — bitte noch einmal versuchen.";

const SYSTEM_PROMPT =
  "Du schreibst einzelne Abschnitte für die Website eines kleinen Betriebs und antwortest ausschließlich mit einem JSON-Objekt, ohne Markdown und ohne Erklärung.";

/** Format-Vorgabe je Typ — spiegelt das Zod-Schema in shared/siteContract/schema.ts. */
const SHAPES: Record<InsertableSectionType, string> = {
  story:
    '{"type": "story", "headline": "…", "body": "Absatz 1\\n\\nAbsatz 2"} — headline bis 120 Zeichen, body bis 2500 Zeichen.',
  usp: '{"type": "usp", "headline": "…", "items": [{"title": "…", "text": "…"}]} — 2 bis 6 items, title bis 80, text bis 240 Zeichen (text optional).',
  notice: '{"type": "notice", "text": "…"} — ein Satz, bis 240 Zeichen.',
  stats:
    '{"type": "stats", "headline": "…", "items": [{"value": "25+", "label": "Jahre Erfahrung"}]} — 2 bis 4 items, value bis 20, label bis 80 Zeichen. Jede Zahl in value muss wörtlich in den belegten Fakten oben stehen, keine Prozentwerte oder Schätzungen erfinden.',
  process:
    '{"type": "process", "headline": "…", "steps": [{"title": "…", "text": "…"}]} — 2 bis 5 steps, title bis 80, text bis 240 Zeichen (text optional).',
  quote:
    '{"type": "quote", "text": "…", "author": "…"} — text bis 300 Zeichen, author optional.',
};

const MEDIA_KEY = /url|image|photo|logo|video|src/i;

/** Nur sichtbare Texte, ohne Bild-/Link-Felder — spart Tokens und hält URLs aus dem Prompt. */
function stripMedia(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripMedia);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !MEDIA_KEY.test(key))
        .map(([key, inner]) => [key, stripMedia(inner)])
    );
  }
  return value;
}

function contentDigest(doc: WebsiteDataV2): string {
  const lines: string[] = [];
  let total = 0;
  for (const section of doc.sections) {
    if (section.type === "contact") continue;
    const line = `- ${JSON.stringify(stripMedia(section)).slice(0, DIGEST_SECTION_CHARS)}`;
    if (total + line.length > DIGEST_TOTAL_CHARS) break;
    lines.push(line);
    total += line.length;
  }
  return lines.join("\n");
}

/** Deutsche Zahl mit Komma („4,9"), wie sie auf der Website stünde. */
function formatDe(value: number): string {
  return String(value).replace(".", ",");
}

/**
 * Belegte Fakten außerhalb der Sektionen (Prod-Befund 2026-09-18: Der Salon
 * hat 4,9 Sterne bei 239 Bewertungen, die KI schrieb „5/5" — die Google-
 * Werte fehlten im Kontext). Bewusst ohne „von 5": Sonst gälte „5/5" in der
 * Zahlenprüfung als belegt.
 */
function factLines(doc: WebsiteDataV2): string[] {
  if (!doc.google) return [];
  return [
    `Google-Bewertung: ${formatDe(doc.google.rating)} Sterne, ${doc.google.reviewCount} Bewertungen`,
  ];
}

/** Alles, was die KI als belegt ansehen darf — Grundlage für Prompt UND Zahlenprüfung. */
function evidenceText(doc: WebsiteDataV2): string {
  return [...factLines(doc), contentDigest(doc)].join("\n");
}

const NUMBER = /\d+(?:[.,]\d+)?/g;

function numbersIn(text: string): string[] {
  return (text.match(NUMBER) ?? []).map(n => n.replace(",", "."));
}

/**
 * Kennzahlen dürfen nur Zahlen enthalten, die wörtlich belegt sind — eine
 * Anweisung im Prompt allein reichte nicht (Prod: „100 %" frei erfunden).
 * Andere Typen tragen keine Kennzahlen und bleiben ungeprüft.
 */
function assertNumbersBacked(section: SectionV2, evidence: string): void {
  if (section.type !== "stats") return;
  const known = new Set(numbersIn(evidence));
  for (const item of section.items) {
    const invented = numbersIn(item.value).filter(n => !known.has(n));
    if (invented.length > 0) {
      throw new Error(
        `Kennzahl ohne Beleg: „${item.value}" (${invented.join(", ")})`
      );
    }
  }
}

export function buildInsertSectionPrompt(args: {
  doc: WebsiteDataV2;
  type: InsertableSectionType;
  category: string;
}): string {
  const { doc, type, category } = args;
  const meta = INSERT_META[type];
  const constitution = getConstitution(doc.stylePackId);
  return [
    `Betrieb: ${doc.businessName}${category ? ` (${category})` : ""}`,
    `Stil der Website: ${constitution.essence}`,
    ...(doc.tone ? [``, ...tonePromptLines(doc.tone)] : []),
    ``,
    `Belegte Fakten und bestehende Inhalte der Website (Auszug, JSON je Sektion):`,
    evidenceText(doc),
    ``,
    `Aufgabe: Schreibe nur diese eine Sektion neu — „${meta.label}“. ${meta.hint}`,
    `Die Sektion hat immer "type": "${type}". Format: ${SHAPES[type]}`,
    ``,
    `Regeln:`,
    `- Erfinde keine Zahlen, Namen, Jahreszahlen, Auszeichnungen oder Fakten. Nutze nur, was die bestehenden Inhalte belegen; allgemeine, ehrliche Aussagen sind erlaubt.`,
    `- Keine Telefonnummern, E-Mail-Adressen, Adressen, Öffnungszeiten oder URLs.`,
    `- Deutsch, passend zum Ton der bestehenden Texte, keine Wiederholung ganzer Sätze von dort.`,
    ``,
    `Antworte mit {"section": { … }}.`,
    `Lässt sich die Sektion ohne erfundene Fakten nicht sinnvoll schreiben (etwa Kennzahlen ohne belegbare Zahlen), antworte mit {"reject": "kurze Begründung auf Deutsch, an den Kunden gerichtet"}.`,
  ].join("\n");
}

export type InsertSectionAiResult =
  | { kind: "section"; section: SectionV2 }
  | { kind: "reject"; reason: string };

/** Nur nicht-produktiv (Playwright/E2E): deterministische Sektion ohne LLM. */
function mockSection(type: InsertableSectionType): SectionV2 {
  const byType: Record<InsertableSectionType, unknown> = {
    story: { type, headline: "Unsere Geschichte", body: "Wie alles begann." },
    usp: {
      type,
      items: [{ title: "Persönlich" }, { title: "Verlässlich" }],
    },
    notice: { type, text: "Neu: Termine jetzt auch online." },
    stats: {
      type,
      items: [
        { value: "100 %", label: "Handarbeit" },
        { value: "1", label: "Ansprechpartner" },
      ],
    },
    process: {
      type,
      steps: [{ title: "Anfrage" }, { title: "Umsetzung" }],
    },
    quote: { type, text: "Gute Arbeit braucht Zeit." },
  };
  return SectionV2Schema.parse(byType[type]);
}

function isLlmMockEnabled(): boolean {
  return (
    process.env.PB_LLM_MOCK === "1" && process.env.NODE_ENV !== "production"
  );
}

async function attempt(
  prompt: string,
  type: InsertableSectionType,
  evidence: string
): Promise<InsertSectionAiResult> {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    preferBackup: true,
    maxTokens: MAX_OUTPUT_TOKENS,
    backupTimeoutMs: BACKUP_TIMEOUT_MS,
    primaryTimeoutMs: PRIMARY_TIMEOUT_MS,
    reasoningEffort: "low",
  });
  const choice = response.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error("LLM-Antwort abgeschnitten (finish_reason=length).");
  }
  const raw = choice?.message?.content;
  const json = jsonFromLlm(typeof raw === "string" ? raw : "");
  if (!json) throw new Error("Keine JSON-Antwort.");
  const parsed = JSON.parse(json) as { section?: unknown; reject?: unknown };
  if (typeof parsed.reject === "string" && parsed.reject.trim()) {
    return { kind: "reject", reason: parsed.reject.trim() };
  }
  const section = SectionV2Schema.parse(parsed.section);
  if (section.type !== type) {
    throw new Error(`Falscher Sektionstyp: ${section.type} statt ${type}.`);
  }
  assertNumbersBacked(section, evidence);
  return { kind: "section", section };
}

export async function generateInsertSection(args: {
  doc: WebsiteDataV2;
  type: InsertableSectionType;
  category: string;
}): Promise<InsertSectionAiResult> {
  if (isLlmMockEnabled()) {
    return { kind: "section", section: mockSection(args.type) };
  }
  const prompt = buildInsertSectionPrompt(args);
  const evidence = evidenceText(args.doc);
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const startedAt = Date.now();
    try {
      const result = await attempt(prompt, args.type, evidence);
      console.info(
        `[onboardingV2.insertSection] ${args.type} in ${Date.now() - startedAt} ms (Versuch ${i + 1})`
      );
      return result;
    } catch (err) {
      console.error(
        `[onboardingV2.insertSection] Versuch ${i + 1}/${MAX_ATTEMPTS} fehlgeschlagen nach ${Date.now() - startedAt} ms:`,
        err instanceof Error ? err.message : err
      );
    }
  }
  return {
    kind: "reject",
    reason:
      args.type === "stats"
        ? "Für Kennzahlen fehlen belegbare Zahlen auf deiner Seite — probier lieber „Vorteile“ oder „Ablauf“."
        : FAILED_MESSAGE,
  };
}

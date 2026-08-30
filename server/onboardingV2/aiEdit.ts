import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type {
  PackId,
  Page,
  WebsiteDataV2,
} from "../../shared/siteContract/types";
import {
  AiEditResponseSchema,
  AiPageEditResponseSchema,
  diffDocuments,
  diffPages,
  type AiChatHistoryEntry,
  type AiDiffEntry,
  type AiThemePatch,
} from "../../shared/onboardingV2/aiEdit";
import { assertQuota } from "./suggest";
import { restoreFacts, restorePageFacts } from "./aiEditFacts";
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
  | { kind: "theme"; theme: AiThemePatch; reason: string }
  | { kind: "style"; packId: PackId; reason: string }
  | { kind: "reject"; reason: string }
  | { kind: "question"; question: string };

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
  kind: z.enum(["content", "theme", "style", "reject", "question"]),
  content: z
    .object({
      seo: z.object({ title: z.string(), description: z.string() }),
      sections: z.array(z.record(z.string(), z.unknown())),
    })
    .nullable()
    .optional(),
  theme: z.record(z.string(), z.unknown()).nullable().optional(),
  packId: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  question: z.string().nullable().optional(),
});

function mapRawToAiEditResponse(
  raw: z.infer<typeof RawAiEditResponseSchema>
): unknown {
  if (raw.kind === "content") {
    if (!raw.content)
      throw new Error("KI-Antwort: 'content' fehlt bei kind=content.");
    return {
      kind: "content",
      seo: raw.content.seo,
      sections: raw.content.sections,
    };
  }
  if (raw.kind === "theme") {
    if (!raw.theme)
      throw new Error("KI-Antwort: 'theme' fehlt bei kind=theme.");
    return { kind: "theme", theme: raw.theme, reason: raw.reason ?? "" };
  }
  if (raw.kind === "style") {
    if (!raw.packId)
      throw new Error("KI-Antwort: 'packId' fehlt bei kind=style.");
    return { kind: "style", packId: raw.packId, reason: raw.reason ?? "" };
  }
  if (raw.kind === "question") {
    if (!raw.question)
      throw new Error("KI-Antwort: 'question' fehlt bei kind=question.");
    return { kind: "question", question: raw.question };
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
        kind: {
          type: "string",
          enum: ["content", "theme", "style", "reject", "question"],
        },
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
        theme: { type: ["object", "null"] },
        packId: { type: ["string", "null"] },
        reason: { type: ["string", "null"] },
        question: { type: ["string", "null"] },
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

function mockAiEditResponse(
  doc: WebsiteDataV2,
  page?: Page
): ProposeAiEditResult {
  if (page) {
    const sections = page.sections.map(s =>
      s.type === "pageHeader" ? { ...s, title: `${s.title} ✓` } : s
    );
    const nextPage: Page = { ...page, sections };
    const next = WebsiteDataV2Schema.parse(replacePage(doc, nextPage));
    return { kind: "content", next, diff: diffPages(page, nextPage) };
  }
  const sections = doc.sections.map(s =>
    s.type === "hero" ? { ...s, headline: `${s.headline} ✓` } : s
  );
  const next = WebsiteDataV2Schema.parse({ ...doc, sections });
  return { kind: "content", next, diff: diffDocuments(doc, next) };
}

/** Ersetzt die Page mit demselben Slug im Dokument — alle anderen Pages und die Startseite bleiben unverändert. */
function replacePage(doc: WebsiteDataV2, nextPage: Page): WebsiteDataV2 {
  return {
    ...doc,
    pages: (doc.pages ?? []).map(p =>
      p.slug === nextPage.slug ? nextPage : p
    ),
  };
}

/** Unterseiten-Scope: Page zum Slug — unbekannter Slug ist ein Client-Fehler (BAD_REQUEST), kein LLM-Aufruf. */
function requirePage(doc: WebsiteDataV2, pageSlug: string): Page {
  const page = doc.pages?.find(p => p.slug === pageSlug);
  if (!page) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Diese Unterseite gibt es nicht (mehr) — bitte die Vorschau neu laden.",
    });
  }
  return page;
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
  /**
   * Unterseiten-Scope (Plan B6 Task 5): die KI bearbeitet `pages[i].seo` +
   * `pages[i].sections` statt der Startseite — gleiche Whitelist
   * (PageSectionSchema), gleiche Fakten-Restauration (restorePageFacts),
   * gleicher Retry. Startseite und übrige Pages bleiben byteidentisch.
   */
  pageSlug?: string;
  /**
   * Kurzer Dialog-Kontext (Rückfragen, 2026-08-30): die letzten Wortwechsel
   * — nötig, damit eine Antwort auf eine Rückfrage dem ursprünglichen
   * Wunsch zugeordnet werden kann. Geht 1:1 in den Prompt.
   */
  history?: AiChatHistoryEntry[];
}): Promise<ProposeAiEditResult> {
  const page =
    args.pageSlug !== undefined
      ? requirePage(args.doc, args.pageSlug)
      : undefined;

  if (isLlmMockEnabled()) {
    return mockAiEditResponse(args.doc, page);
  }

  const prompt = buildAiEditPrompt({ ...args, page });

  return withAiEditRetry(async () => {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: AI_EDIT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: AI_EDIT_RESPONSE_FORMAT,
    });
    const choice = response.choices?.[0];
    if (choice?.finish_reason === "length") {
      // Abgeschnittenes JSON würde sonst als kryptischer SyntaxError im
      // Retry-Log landen — so ist die Ursache (max_tokens erschöpft) klar.
      throw new Error(
        "LLM-Antwort abgeschnitten (finish_reason=length) — max_tokens-Budget erschöpft."
      );
    }
    const rawContent = choice?.message?.content;
    const text = typeof rawContent === "string" ? rawContent : "";
    const json = JSON.parse(text);
    const raw = RawAiEditResponseSchema.parse(json);
    const mapped = mapRawToAiEditResponse(raw);

    if (page) {
      const parsed = AiPageEditResponseSchema.parse(mapped);
      if (parsed.kind !== "content") return parsed;
      const nextPage = restorePageFacts(page, {
        seo: parsed.seo,
        sections: parsed.sections,
      });
      const next = WebsiteDataV2Schema.parse(replacePage(args.doc, nextPage));
      return {
        kind: "content" as const,
        next,
        diff: diffPages(page, nextPage),
      };
    }

    const parsed = AiEditResponseSchema.parse(mapped);
    if (parsed.kind !== "content") return parsed;

    const restored = restoreFacts(args.doc, {
      seo: parsed.seo,
      sections: parsed.sections,
    });
    const next = WebsiteDataV2Schema.parse(restored);
    return {
      kind: "content" as const,
      next,
      diff: diffDocuments(args.doc, next),
    };
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
export function takeProposal(
  id: string,
  websiteId: number
): WebsiteDataV2 | null {
  const now = Date.now();
  sweepExpiredProposals(now);
  const entry = proposals.get(id);
  if (!entry || entry.websiteId !== websiteId) return null;
  proposals.delete(id);
  return entry.next;
}

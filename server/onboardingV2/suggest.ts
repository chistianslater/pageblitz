import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM, type InvokeResult } from "../_core/llm";
import {
  getConstitution,
  type PackConstitution,
} from "../../shared/stylePacks";
import {
  OfferPatchSchema,
  type OfferPatch,
} from "../../shared/onboardingV2/patches";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { tonePromptLines } from "../../shared/onboardingV2/tone";

/**
 * KI-Vorschläge für Texte (Panel „Texte") und Angebot (Panel „Angebot") des
 * Onboarding-v2-Studios. Beide Funktionen validieren die LLM-Antwort strikt
 * per zod, versuchen bei ungültigem Ergebnis genau einmal erneut und werfen
 * danach einen einheitlichen Fehler — nichts wird ungeprüft an den Client
 * durchgereicht, und die Panels selbst persistieren nichts (der User
 * bestätigt den Vorschlag explizit über updateTexts/updateOffer).
 */

export type TextField =
  | "headline"
  | "subheadline"
  | "aboutBody"
  | "storyBody"
  | "seoTitle"
  | "seoDescription";

/** Deckt sich mit den Feldgrenzen in shared/onboardingV2/patches.ts (TextsPatchSchema). */
const FIELD_MAX_LENGTH: Record<TextField, number> = {
  headline: 120,
  subheadline: 240,
  aboutBody: 2000,
  storyBody: 2500,
  seoTitle: 70,
  seoDescription: 170,
};

const FIELD_GUIDANCE: Record<TextField, string> = {
  headline: "Max. 6 Wörter, konkret, kein Marketing-Blabla.",
  subheadline: "Ein Satz: Kundennutzen + Ort.",
  aboutBody:
    "120–180 Wörter, Wir-Form, genau 3 Absätze, getrennt durch eine Leerzeile (\\n\\n).",
  storyBody:
    "100–180 Wörter, Wir-Form, erzählt Geschichte/Werdegang des Betriebs chronologisch, 2–3 Absätze, getrennt durch eine Leerzeile (\\n\\n).",
  seoTitle: "Max. 60 Zeichen, inkl. Ort.",
  seoDescription: "Max. 155 Zeichen, mit Handlungsaufforderung.",
};

const FORBIDDEN_CONTENT_RULE =
  "Erfinde niemals URLs, Telefonnummern, E-Mail-Adressen oder Postadressen.";

const TEXT_SUGGESTION_SYSTEM_PROMPT =
  "Du bist ein professioneller Werbetexter für Websites deutscher Kleinunternehmen. Antworte immer mit validem JSON, ohne Markdown, ohne Erklärung.";

const OFFER_SUGGESTION_SYSTEM_PROMPT =
  "Du bist ein Experte für Angebotsstrukturen lokaler Unternehmenswebsites in Deutschland. Antworte immer mit validem JSON, ohne Markdown, ohne Erklärung.";

/**
 * Extrahiert den JSON-Text aus der LLM-Antwort. Läuft das Modell ins
 * max_tokens-Limit (finish_reason=length), ist der Content abgeschnitten —
 * statt eines kryptischen JSON-SyntaxError wird die eigentliche Ursache
 * geworfen, damit Logs/Retry klar sagen, was passiert ist.
 */
function extractJsonText(response: InvokeResult): string {
  const choice = response.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error(
      "LLM-Antwort abgeschnitten (finish_reason=length) — max_tokens-Budget erschöpft."
    );
  }
  const raw = choice?.message?.content;
  return typeof raw === "string" ? raw : "";
}

/** Ein Versuch + genau ein Retry (Spec: „genau 1 Retry, dann Fehler"). */
const MAX_SUGGESTION_ATTEMPTS = 2;

const SUGGESTION_FAILED_MESSAGE =
  "Die KI konnte gerade keinen Vorschlag liefern — bitte noch einmal versuchen.";

const VariantsResponseSchema = z.object({
  variants: z.array(z.string().min(1)).length(3),
});

/**
 * Führt `attempt` bis zu `MAX_SUGGESTION_ATTEMPTS`-mal aus (LLM-Aufruf +
 * Parsing + zod-Validierung liegen jeweils in `attempt`); jeder Fehler
 * (kaputtes JSON, fehlgeschlagene Validierung, LLM-Fehler) löst einen
 * weiteren Versuch aus, danach ein einheitlicher TRPCError.
 */
async function withSuggestionRetry<T>(attempt: () => Promise<T>): Promise<T> {
  for (let i = 0; i < MAX_SUGGESTION_ATTEMPTS; i++) {
    try {
      return await attempt();
    } catch (err) {
      // Fehler wird protokolliert (Netzwerk/JSON/zod) und löst den nächsten
      // Versuch aus bzw. — nach dem letzten Versuch — den TRPCError unten.
      console.error(
        `[onboardingV2.suggest] Versuch ${i + 1}/${MAX_SUGGESTION_ATTEMPTS} fehlgeschlagen:`,
        err
      );
    }
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: SUGGESTION_FAILED_MESSAGE,
  });
}

/** Kappt eine LLM-Antwort defensiv auf die Feldlänge — auch wenn das LLM sich nicht an die Vorgabe hält, bleibt der Vorschlag patch-fähig. */
function clampToLength(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max).trim() : trimmed;
}

export function buildTextVariantPrompt(
  args: {
    field: TextField;
    /** Dokument — liefert die Tonalität (doc.tone). */
    doc: Pick<WebsiteDataV2, "tone">;
    businessName: string;
    category: string;
    city?: string;
    /** Freitext-Kontext des Kunden („Was willst du sagen?“) — optional. */
    hint?: string;
  },
  constitution: PackConstitution
): string {
  const factLines = [
    `Unternehmen: ${args.businessName}`,
    `Branche: ${args.category}`,
    args.city ? `Stadt: ${args.city}` : null,
  ].filter((line): line is string => Boolean(line));

  return [
    `Schlage genau 3 unterschiedliche Varianten für das Textfeld "${args.field}" einer Website vor.`,
    ``,
    `## Geschäft`,
    factLines.join("\n"),
    ``,
    `## Tonalität`,
    constitution.essence,
    ``,
    `## Regeln`,
    ...constitution.llmHints.do.map(rule => `- ${rule}`),
    ``,
    `## Verbote`,
    ...constitution.llmHints.dont.map(rule => `- ${rule}`),
    `- ${FORBIDDEN_CONTENT_RULE}`,
    // Tonalität (2026-09-03): gesetzte Anrede/Ton des Dokuments gilt auch
    // für jede einzelne Variante.
    ...(args.doc.tone ? [``, ...tonePromptLines(args.doc.tone)] : []),
    ``,
    `## Feldvorgabe`,
    FIELD_GUIDANCE[args.field],
    `Maximal ${FIELD_MAX_LENGTH[args.field]} Zeichen.`,
    ...(args.hint
      ? [
          ``,
          `## Wunsch des Kunden`,
          `Der Kunde möchte Folgendes rüberbringen — alle 3 Varianten müssen das aufgreifen:`,
          args.hint,
        ]
      : []),
    ``,
    `Antworte NUR mit JSON: { "variants": ["...", "...", "..."] } — genau 3 Einträge, spürbar unterschiedlich formuliert.`,
  ].join("\n");
}

/**
 * Liefert genau 3 zod-validierte Textvarianten für ein Feld, auf die
 * Feldlänge geklemmt. Nutzt die llmHints der Style-Pack-Verfassung des
 * Dokuments, damit der Vorschlag zur Tonalität des gewählten Packs passt.
 */
/**
 * PB_LLM_MOCK=1 (nicht-produktiv): deterministische Vorschläge ohne LLM —
 * deckt sich mit dem Mock in aiEdit.ts/generateSiteContent.ts und macht
 * den KI-Vorschlag-Flow in Dev-Server und Playwright testbar (2026-08-25;
 * suggest.ts hatte bisher als einziger KI-Pfad keinen Mock).
 */
function mockTextVariants(field: TextField): string[] {
  return [
    `Mock-Vorschlag A für ${field}`,
    `Mock-Vorschlag B für ${field}`,
    `Mock-Vorschlag C für ${field}`,
  ];
}

function mockOffer(mode: OfferSuggestionMode): OfferPatch {
  if (mode === "services") {
    return OfferPatchSchema.parse({
      mode,
      headline: "Unsere Leistungen",
      items: Array.from({ length: 6 }, (_, i) => ({
        title: `Leistung ${i + 1}`,
        description: `Mock-Beschreibung ${i + 1}`,
      })),
    });
  }
  return OfferPatchSchema.parse({
    mode,
    categories: Array.from({ length: 3 }, (_, c) => ({
      name: `Kategorie ${c + 1}`,
      items: Array.from({ length: 3 }, (_, i) => ({
        name: `Position ${c + 1}.${i + 1}`,
        description: "Mock",
        price: "ab 10 €",
      })),
    })),
  });
}

const LLM_MOCK_ACTIVE =
  process.env.PB_LLM_MOCK === "1" && process.env.NODE_ENV !== "production";

export async function suggestTextVariants(args: {
  field: TextField;
  doc: WebsiteDataV2;
  businessName: string;
  category: string;
  city?: string;
  hint?: string;
}): Promise<string[]> {
  if (LLM_MOCK_ACTIVE) return mockTextVariants(args.field);
  const constitution = getConstitution(args.doc.stylePackId);
  const prompt = buildTextVariantPrompt(args, constitution);

  return withSuggestionRetry(async () => {
    const response = await invokeLLM({
      // Kleine Variantenantworten brauchen kein langes Reasoning-Modell als
      // ersten Pfad. Gemini-Backup zuerst; Kimi K3 nur als Fallback.
      preferBackup: true,
      backupTimeoutMs: 20_000,
      primaryTimeoutMs: 75_000,
      reasoningEffort: "low",
      maxTokens: 2_048,
      messages: [
        { role: "system", content: TEXT_SUGGESTION_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "text_variants",
          strict: true,
          schema: {
            type: "object",
            properties: {
              variants: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["variants"],
            additionalProperties: false,
          },
        },
      },
    });
    const json = JSON.parse(extractJsonText(response));
    const { variants } = VariantsResponseSchema.parse(json);
    return variants.map(variant =>
      clampToLength(variant, FIELD_MAX_LENGTH[args.field])
    );
  });
}

export type OfferSuggestionMode = "services" | "menu" | "pricelist";

function buildOfferPrompt(args: {
  mode: OfferSuggestionMode;
  businessName: string;
  category: string;
}): string {
  const factLines = [
    `Unternehmen: ${args.businessName}`,
    `Branche: ${args.category}`,
  ].join("\n");

  if (args.mode === "services") {
    return [
      `Schlage genau 6 verschiedene, typische Leistungen für dieses Unternehmen vor.`,
      ``,
      `## Geschäft`,
      factLines,
      ``,
      `## Vorgaben`,
      `- Titel: klare, kurze Bezeichnung der Leistung.`,
      `- Beschreibung: Kundennutzen in max. 12 Wörtern (was der Kunde dadurch gewinnt).`,
      `- Keine Preise angeben.`,
      `- ${FORBIDDEN_CONTENT_RULE}`,
      ``,
      `Antworte NUR mit JSON: { "headline": "...", "items": [{ "title": "...", "description": "..." }] } — genau 6 Einträge in "items".`,
    ].join("\n");
  }

  const modeLabel = args.mode === "menu" ? "Speisekarte" : "Preisliste";
  return [
    `Schlage genau 3 Kategorien mit je 3 bis 5 Positionen für die ${modeLabel} dieses Unternehmens vor.`,
    ``,
    `## Geschäft`,
    factLines,
    ``,
    `## Vorgaben`,
    `- Jede Position: kurzer Name, optionale kurze Beschreibung, Preis als Platzhalter im Format "ab … €".`,
    `- ${FORBIDDEN_CONTENT_RULE}`,
    ``,
    `Antworte NUR mit JSON: { "categories": [{ "name": "...", "items": [{ "name": "...", "description": "...", "price": "ab 12 €" }] }] } — genau 3 Kategorien, je 3 bis 5 Einträge in "items".`,
  ].join("\n");
}

/**
 * Erlaubte Mengen für Angebots-Vorschläge (Spec: 6 Leistungen bzw. 3
 * Kategorien à 3–5 Positionen) — bewusst als Bereich statt exaktem Wert,
 * damit ein LLM-Ergebnis nahe der Zielgröße nicht unnötig einen Retry
 * auslöst, ein grob falsches Ergebnis (z. B. 1 Kategorie) aber sehr wohl.
 */
const OFFER_SERVICES_ITEM_COUNT = { min: 3, max: 8 };
const OFFER_CATEGORY_COUNT = { min: 2, max: 4 };
const OFFER_CATEGORY_ITEM_COUNT = { min: 3, max: 5 };

/**
 * Prüft die Mengen eines bereits per OfferPatchSchema validierten Vorschlags
 * gegen die Zielgrößen. Wirft bei Abweichung (kein zod-Fehler, da
 * OfferPatchSchema selbst großzügigere Grenzen hat) — der Fehler landet in
 * withSuggestionRetry und löst dort den Retry aus.
 */
function assertOfferCounts(offer: OfferPatch): void {
  if (offer.mode === "services") {
    const count = offer.items.length;
    if (
      count < OFFER_SERVICES_ITEM_COUNT.min ||
      count > OFFER_SERVICES_ITEM_COUNT.max
    ) {
      throw new Error(`Unerwartete Anzahl Leistungen: ${count}`);
    }
    return;
  }
  const categoryCount = offer.categories.length;
  if (
    categoryCount < OFFER_CATEGORY_COUNT.min ||
    categoryCount > OFFER_CATEGORY_COUNT.max
  ) {
    throw new Error(`Unerwartete Anzahl Kategorien: ${categoryCount}`);
  }
  for (const category of offer.categories) {
    const itemCount = category.items.length;
    if (
      itemCount < OFFER_CATEGORY_ITEM_COUNT.min ||
      itemCount > OFFER_CATEGORY_ITEM_COUNT.max
    ) {
      throw new Error(
        `Unerwartete Anzahl Positionen in Kategorie "${category.name}": ${itemCount}`
      );
    }
  }
}

function buildOfferResponseFormat(mode: OfferSuggestionMode) {
  if (mode === "services") {
    return {
      type: "json_schema" as const,
      json_schema: {
        name: "offer_services_suggestion",
        strict: true,
        schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
                required: ["title", "description"],
                additionalProperties: false,
              },
              minItems: OFFER_SERVICES_ITEM_COUNT.min,
              maxItems: OFFER_SERVICES_ITEM_COUNT.max,
            },
          },
          required: ["headline", "items"],
          additionalProperties: false,
        },
      },
    };
  }

  return {
    type: "json_schema" as const,
    json_schema: {
      name: "offer_categories_suggestion",
      strict: true,
      schema: {
        type: "object",
        properties: {
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      price: { type: "string" },
                    },
                    required: ["name", "description", "price"],
                    additionalProperties: false,
                  },
                  minItems: OFFER_CATEGORY_ITEM_COUNT.min,
                  maxItems: OFFER_CATEGORY_ITEM_COUNT.max,
                },
              },
              required: ["name", "items"],
              additionalProperties: false,
            },
            minItems: OFFER_CATEGORY_COUNT.min,
            maxItems: OFFER_CATEGORY_COUNT.max,
          },
        },
        required: ["categories"],
        additionalProperties: false,
      },
    },
  };
}

/**
 * Liefert einen per OfferPatchSchema validierten Angebots-Vorschlag: 6
 * Leistungen (mode "services") bzw. 3 Kategorien à 3–5 Positionen mit
 * Preis-Platzhaltern (mode "menu"/"pricelist"). Ohne Stildokument — das
 * Angebot ist faktisch, nicht tonal, daher keine llmHints nötig.
 */
export async function suggestOffer(args: {
  mode: OfferSuggestionMode;
  businessName: string;
  category: string;
}): Promise<OfferPatch> {
  if (LLM_MOCK_ACTIVE) return mockOffer(args.mode);
  const prompt = buildOfferPrompt(args);
  const responseFormat = buildOfferResponseFormat(args.mode);

  return withSuggestionRetry(async () => {
    const response = await invokeLLM({
      preferBackup: true,
      backupTimeoutMs: 25_000,
      primaryTimeoutMs: 90_000,
      reasoningEffort: "low",
      maxTokens: 4_096,
      messages: [
        { role: "system", content: OFFER_SUGGESTION_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: responseFormat,
    });
    const json = JSON.parse(extractJsonText(response)) as Record<
      string,
      unknown
    >;
    const offer = OfferPatchSchema.parse({ ...json, mode: args.mode });
    assertOfferCounts(offer);
    return offer;
  });
}

/**
 * Prozesslokales Rate-Limit gegen KI-Kostenexplosion: pro Website, Bucket
 * (z. B. "suggest", "aiEdit") und rollierender Stunde ein eigenes Kontingent.
 * Bewusst ohne Persistenz (Instanz-Neustart setzt zurück) — reicht für den
 * Zweck, ein einzelnes Studio-Fenster nicht mit KI-Aufrufen zu fluten.
 */
interface QuotaEntry {
  count: number;
  windowStart: number;
}

const QUOTA_WINDOW_MS = 60 * 60 * 1000;
const QUOTA_LIMIT = 30;
const quota = new Map<string, QuotaEntry>();

/**
 * Generalisiertes Rate-Limit: eigenes Kontingent je (bucket, websiteId).
 * Genutzt von `assertSuggestQuota` unten (bucket "suggest") und von
 * `server/onboardingV2/aiEdit.ts` (bucket "aiEdit", Limit 20/h).
 */
export function assertQuota(
  bucket: string,
  websiteId: number,
  limit: number,
  now: number = Date.now()
): void {
  const key = `${bucket}:${websiteId}`;
  const entry = quota.get(key);
  if (!entry || now - entry.windowStart >= QUOTA_WINDOW_MS) {
    quota.set(key, { count: 1, windowStart: now });
    return;
  }
  if (entry.count >= limit) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Zu viele KI-Anfragen — bitte in einer Stunde erneut.",
    });
  }
  entry.count += 1;
}

export function assertSuggestQuota(
  websiteId: number,
  now: number = Date.now()
): void {
  assertQuota("suggest", websiteId, QUOTA_LIMIT, now);
}

/** Nur für Tests: setzt das prozesslokale Rate-Limit (alle Buckets) zurück. */
export function resetSuggestQuotaForTests(): void {
  quota.clear();
}

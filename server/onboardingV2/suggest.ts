import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import {
  getConstitution,
  type PackConstitution,
} from "../../shared/stylePacks";
import {
  OfferPatchSchema,
  type OfferPatch,
} from "../../shared/onboardingV2/patches";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";

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
  | "seoTitle"
  | "seoDescription";

/** Deckt sich mit den Feldgrenzen in shared/onboardingV2/patches.ts (TextsPatchSchema). */
const FIELD_MAX_LENGTH: Record<TextField, number> = {
  headline: 120,
  subheadline: 240,
  aboutBody: 2000,
  seoTitle: 70,
  seoDescription: 170,
};

const FIELD_GUIDANCE: Record<TextField, string> = {
  headline: "Max. 6 Wörter, konkret, kein Marketing-Blabla.",
  subheadline: "Ein Satz: Kundennutzen + Ort.",
  aboutBody:
    "120–180 Wörter, Wir-Form, genau 3 Absätze, getrennt durch eine Leerzeile (\\n\\n).",
  seoTitle: "Max. 60 Zeichen, inkl. Ort.",
  seoDescription: "Max. 155 Zeichen, mit Handlungsaufforderung.",
};

const FORBIDDEN_CONTENT_RULE =
  "Erfinde niemals URLs, Telefonnummern, E-Mail-Adressen oder Postadressen.";

const TEXT_SUGGESTION_SYSTEM_PROMPT =
  "Du bist ein professioneller Werbetexter für Websites deutscher Kleinunternehmen. Antworte immer mit validem JSON, ohne Markdown, ohne Erklärung.";

const OFFER_SUGGESTION_SYSTEM_PROMPT =
  "Du bist ein Experte für Angebotsstrukturen lokaler Unternehmenswebsites in Deutschland. Antworte immer mit validem JSON, ohne Markdown, ohne Erklärung.";

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
    } catch {
      // nächster Versuch bzw. Fehler nach der Schleife
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

function buildTextVariantPrompt(
  args: {
    field: TextField;
    businessName: string;
    category: string;
    city?: string;
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
    ``,
    `## Feldvorgabe`,
    FIELD_GUIDANCE[args.field],
    `Maximal ${FIELD_MAX_LENGTH[args.field]} Zeichen.`,
    ``,
    `Antworte NUR mit JSON: { "variants": ["...", "...", "..."] } — genau 3 Einträge, spürbar unterschiedlich formuliert.`,
  ].join("\n");
}

/**
 * Liefert genau 3 zod-validierte Textvarianten für ein Feld, auf die
 * Feldlänge geklemmt. Nutzt die llmHints der Style-Pack-Verfassung des
 * Dokuments, damit der Vorschlag zur Tonalität des gewählten Packs passt.
 */
export async function suggestTextVariants(args: {
  field: TextField;
  doc: WebsiteDataV2;
  businessName: string;
  category: string;
  city?: string;
}): Promise<string[]> {
  const constitution = getConstitution(args.doc.stylePackId);
  const prompt = buildTextVariantPrompt(args, constitution);

  return withSuggestionRetry(async () => {
    const response = await invokeLLM({
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
    const rawContent = response.choices?.[0]?.message?.content;
    const text = typeof rawContent === "string" ? rawContent : "";
    const json = JSON.parse(text);
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
                },
              },
              required: ["name", "items"],
              additionalProperties: false,
            },
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
  const prompt = buildOfferPrompt(args);
  const responseFormat = buildOfferResponseFormat(args.mode);

  return withSuggestionRetry(async () => {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: OFFER_SUGGESTION_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: responseFormat,
    });
    const rawContent = response.choices?.[0]?.message?.content;
    const text = typeof rawContent === "string" ? rawContent : "";
    const json = JSON.parse(text) as Record<string, unknown>;
    return OfferPatchSchema.parse({ ...json, mode: args.mode });
  });
}

/**
 * Prozesslokales Rate-Limit gegen KI-Kostenexplosion: max. 30
 * Vorschlags-Aufrufe pro Website und rollierender Stunde. Bewusst ohne
 * Persistenz (Instanz-Neustart setzt zurück) — reicht für den Zweck, ein
 * einzelnes Studio-Fenster nicht mit KI-Aufrufen zu fluten.
 */
interface QuotaEntry {
  count: number;
  windowStart: number;
}

const QUOTA_WINDOW_MS = 60 * 60 * 1000;
const QUOTA_LIMIT = 30;
const suggestQuota = new Map<number, QuotaEntry>();

export function assertSuggestQuota(
  websiteId: number,
  now: number = Date.now()
): void {
  const entry = suggestQuota.get(websiteId);
  if (!entry || now - entry.windowStart >= QUOTA_WINDOW_MS) {
    suggestQuota.set(websiteId, { count: 1, windowStart: now });
    return;
  }
  if (entry.count >= QUOTA_LIMIT) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Zu viele KI-Anfragen — bitte in einer Stunde erneut.",
    });
  }
  entry.count += 1;
}

/** Nur für Tests: setzt das prozesslokale Rate-Limit zurück. */
export function resetSuggestQuotaForTests(): void {
  suggestQuota.clear();
}

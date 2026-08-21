import { getConstitution } from "../../shared/stylePacks";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type {
  PackId,
  SectionType,
  WebsiteDataV2,
} from "../../shared/siteContract/types";
import { buildContentPrompt } from "./contentPrompt";
import { llmComplete } from "./llmClient";

export interface GenerateSiteContentArgs {
  packId: PackId;
  business: { name: string; category: string; city?: string };
}

const DEFAULT_SECTIONS: SectionType[] = [
  "hero",
  "services",
  "about",
  "contact",
];
/** Gastro-Packs (aktuell nur "gusto") bekommen eine Speisekarte statt Leistungen. */
const MENU_SECTIONS: SectionType[] = ["hero", "menu", "about", "contact"];

function resolveSections(packId: PackId): SectionType[] {
  return packId === "gusto" ? MENU_SECTIONS : DEFAULT_SECTIONS;
}

type AttemptResult =
  | { ok: true; data: WebsiteDataV2 }
  | { ok: false; error: string };

/**
 * Ein LLM-Versuch: Prompt senden → JSON.parse → die deterministischen
 * Envelope-Felder (version/stylePackId/businessName) VOR der zod-Validierung
 * hart in ein NEUES Objekt setzen. Der Prompt verlangt vom LLM bewusst nur
 * "seo" + "sections" — WebsiteDataV2Schema ist `.strict()` und verlangt
 * zusätzlich version/stylePackId/businessName als Pflichtfelder; ohne diesen
 * Merge würde jede Antwort, die sich wörtlich an den Prompt hält, an der
 * Validierung scheitern. version und stylePackId kommen dadurch nie vom LLM,
 * sondern immer deterministisch vom System.
 *
 * SICHERHEIT: Aus dem geparsten LLM-Objekt werden NUR "seo" und "sections"
 * übernommen (Whitelist statt Spread). Ein voller `...parsed`-Spread würde
 * dem LLM erlauben, beliebige weitere Felder einzuschmuggeln — insbesondere
 * `legal.impressumHtml`/`datenschutzHtml`, die im SSR (server/ssr/renderSite.tsx)
 * bewusst UNESCAPED gerendert werden (siehe Invariante in
 * shared/siteContract/schema.ts). Ein LLM-kontrolliertes `legal`-Feld wäre
 * damit Stored-XSS auf der Kundenseite. Ebenso dürfen `logo`, `colorOverrides`
 * und alle sonstigen Felder nicht vom LLM kommen.
 */
async function attempt(
  prompt: string,
  packId: PackId,
  businessName: string
): Promise<AttemptResult> {
  const raw = await llmComplete(prompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "JSON.parse fehlgeschlagen";
    return { ok: false, error: message };
  }

  const parsedRecord: Record<string, unknown> =
    typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};

  const envelope = {
    version: 2 as const,
    stylePackId: packId,
    businessName,
    seo: parsedRecord.seo,
    sections: parsedRecord.sections,
  };

  const validated = WebsiteDataV2Schema.safeParse(envelope);
  if (!validated.success) {
    return { ok: false, error: validated.error.message };
  }
  return { ok: true, data: validated.data };
}

/**
 * Erzeugt die v2-Website-Inhalte per LLM: Prompt bauen → llmComplete →
 * JSON.parse → deterministische Envelope-Felder mergen → zod-Validierung.
 * Bei Fehler GENAU EIN Retry mit angehängter Fehlermeldung; scheitert auch
 * der zweite Versuch, wird geworfen (kein stiller Fallback — Spec §4.1/§6).
 */
export async function generateSiteContent(
  args: GenerateSiteContentArgs
): Promise<WebsiteDataV2> {
  const { packId, business } = args;
  const constitution = getConstitution(packId);
  const sections = resolveSections(packId);
  const prompt = buildContentPrompt({ constitution, business, sections });

  const first = await attempt(prompt, packId, business.name);
  const result = first.ok
    ? first
    : await attempt(
        `${prompt}\n\nDeine letzte Antwort war ungültig: ${first.error}. Antworte erneut, nur JSON.`,
        packId,
        business.name
      );

  if (!result.ok) {
    throw new Error(
      "Validierung der LLM-Antwort fehlgeschlagen: " + result.error
    );
  }

  return result.data;
}

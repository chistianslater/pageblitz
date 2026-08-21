import { getConstitution } from "../../shared/stylePacks";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { PackId, SectionType, WebsiteDataV2 } from "../../shared/siteContract/types";
import { buildContentPrompt } from "./contentPrompt";
import { llmComplete } from "./llmClient";

export interface GenerateSiteContentArgs {
  packId: PackId;
  business: { name: string; category: string; city?: string };
}

const DEFAULT_SECTIONS: SectionType[] = ["hero", "services", "about", "contact"];
/** Gastro-Packs (aktuell nur "gusto") bekommen eine Speisekarte statt Leistungen. */
const MENU_SECTIONS: SectionType[] = ["hero", "menu", "about", "contact"];

function resolveSections(packId: PackId): SectionType[] {
  return packId === "gusto" ? MENU_SECTIONS : DEFAULT_SECTIONS;
}

type AttemptResult =
  | { ok: true; data: WebsiteDataV2 }
  | { ok: false; error: string };

async function attempt(prompt: string): Promise<AttemptResult> {
  const raw = await llmComplete(prompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : "JSON.parse fehlgeschlagen";
    return { ok: false, error: message };
  }

  const validated = WebsiteDataV2Schema.safeParse(parsed);
  if (!validated.success) {
    return { ok: false, error: validated.error.message };
  }
  return { ok: true, data: validated.data };
}

/**
 * Erzeugt die v2-Website-Inhalte per LLM: Prompt bauen → llmComplete →
 * JSON.parse → zod-Validierung. Bei Fehler GENAU EIN Retry mit angehängter
 * Fehlermeldung; scheitert auch der zweite Versuch, wird geworfen (kein
 * stiller Fallback — Spec §4.1/§6). `version` und `stylePackId` werden nach
 * erfolgreicher Validierung hart überschrieben, nie dem LLM überlassen.
 */
export async function generateSiteContent(
  args: GenerateSiteContentArgs
): Promise<WebsiteDataV2> {
  const { packId, business } = args;
  const constitution = getConstitution(packId);
  const sections = resolveSections(packId);
  const prompt = buildContentPrompt({ constitution, business, sections });

  const first = await attempt(prompt);
  const result = first.ok
    ? first
    : await attempt(
        `${prompt}\n\nDeine letzte Antwort war ungültig: ${first.error}. Antworte erneut, nur JSON.`
      );

  if (!result.ok) {
    throw new Error("Validierung der LLM-Antwort fehlgeschlagen: " + result.error);
  }

  return {
    ...result.data,
    version: 2,
    stylePackId: packId,
  };
}

import { getConstitution } from "../../shared/stylePacks";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { getFixture } from "../../shared/siteContract/fixtures";
import type {
  PackId,
  SectionOf,
  SectionType,
  WebsiteDataV2,
} from "../../shared/siteContract/types";
import { buildContentPrompt } from "./contentPrompt";
import { llmComplete } from "./llmClient";

/**
 * Deterministische Fakten aus dem Business-Datensatz (nicht vom LLM), die
 * NACH der zod-Validierung der LLM-Antwort ins Dokument gemergt werden.
 * facts.contact ERSETZT die vom LLM gelieferten Kontaktfelder vollständig —
 * das LLM darf laut Prompt ohnehin nur "city" beisteuern (siehe
 * contentPrompt.ts, Verbotszeile), aber der Merge ist die harte Garantie:
 * Telefonnummern/E-Mails/Straßen kommen ausschließlich von hier.
 */
export interface GenerateSiteContentFacts {
  slug?: string;
  businessCategory?: string;
  google?: { rating: number; reviewCount: number };
  contact?: {
    phone?: string;
    email?: string;
    street?: string;
    zip?: string;
    city?: string;
    openingHours?: { day: string; hours: string }[];
  };
  /** Deterministische Bild-URLs (GMB/Stock), nie vom LLM; nur gesetzt, wenn die Sektion existiert. */
  images?: { hero?: string; about?: string };
}

export interface GenerateSiteContentArgs {
  packId: PackId;
  business: { name: string; category: string; city?: string };
  facts?: GenerateSiteContentFacts;
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
 * Mergt deterministische Fakten (Business-Datensatz) in ein bereits
 * zod-validiertes v2-Dokument. facts.contact ERSETZT die contact-Sektion
 * vollständig (nicht partiell mit LLM-Werten mischen — sonst könnte ein
 * vom LLM erfundenes Feld neben einem echten Fakt stehen bleiben).
 * Immutable: gibt ein neues Objekt zurück, mutiert `data` nicht.
 */
function mergeFacts(
  data: WebsiteDataV2,
  facts: GenerateSiteContentFacts
): WebsiteDataV2 {
  let sections = data.sections;
  if (facts.contact) {
    const { phone, email, street, zip, city, openingHours } = facts.contact;
    const existingIndex = data.sections.findIndex(s => s.type === "contact");
    const existing =
      existingIndex >= 0
        ? (data.sections[existingIndex] as SectionOf<"contact">)
        : undefined;
    const newContact: SectionOf<"contact"> = {
      type: "contact",
      ...(existing?.headline !== undefined
        ? { headline: existing.headline }
        : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(street !== undefined ? { street } : {}),
      ...(zip !== undefined ? { zip } : {}),
      ...(city !== undefined ? { city } : {}),
      // Öffnungszeiten kommen NUR aus facts (Business-Datensatz), niemals
      // vom LLM: liefert facts.contact keine, werden vom LLM erfundene
      // Zeiten aus `existing` bewusst GESTRIPPT statt übernommen — sonst
      // könnte das Modell Öffnungszeiten frei erfinden (Halluzination).
      ...(openingHours !== undefined ? { openingHours } : {}),
    };
    sections =
      existingIndex >= 0
        ? data.sections.map((s, i) => (i === existingIndex ? newContact : s))
        : [...data.sections, newContact];
  }

  if (facts.images) {
    const { hero, about } = facts.images;
    sections = sections.map(s => {
      if (s.type === "hero" && hero !== undefined)
        return { ...s, imageUrl: hero };
      if (s.type === "about" && about !== undefined)
        return { ...s, imageUrl: about };
      return s;
    });
  }

  return {
    ...data,
    sections,
    ...(facts.slug !== undefined ? { slug: facts.slug } : {}),
    ...(facts.businessCategory !== undefined
      ? { businessCategory: facts.businessCategory }
      : {}),
    ...(facts.google !== undefined ? { google: facts.google } : {}),
  };
}

/**
 * Nur nicht-produktiv aktivierbar (Playwright/E2E, siehe playwright.config.ts) —
 * macht die Generierung ohne LLM-API-Key/Netzwerk lauffähig, indem statt eines
 * echten LLM-Aufrufs die "full"-Fixture des gewählten Packs verwendet wird.
 */
function isLlmMockEnabled(): boolean {
  return (
    process.env.PB_LLM_MOCK === "1" && process.env.NODE_ENV !== "production"
  );
}

/**
 * Deterministisches Mock-Dokument aus der Fixture "full" des gewählten
 * Packs: Business-Name aus `business` überschreibt den Fixture-Namen, `facts`
 * wird genau wie im echten LLM-Pfad NACH der (impliziten, da Fixtures bereits
 * schema-valide sind) Validierung gemergt und revalidiert.
 */
function mockSiteContent(
  packId: PackId,
  business: { name: string; category: string; city?: string },
  facts: GenerateSiteContentFacts | undefined
): WebsiteDataV2 {
  const fixture = getFixture(packId, "full");
  const base: WebsiteDataV2 = {
    ...fixture,
    businessName: business.name,
    seo: { ...fixture.seo, title: business.name },
  };
  if (!facts) return base;

  const merged = mergeFacts(base, facts);
  const revalidated = WebsiteDataV2Schema.safeParse(merged);
  if (!revalidated.success) {
    throw new Error(
      "Mock-Fixture nach Fakten-Merge ungültig: " + revalidated.error.message
    );
  }
  return revalidated.data;
}

/**
 * Erzeugt die v2-Website-Inhalte per LLM: Prompt bauen → llmComplete →
 * JSON.parse → deterministische Envelope-Felder mergen → zod-Validierung.
 * Bei Fehler GENAU EIN Retry mit angehängter Fehlermeldung; scheitert auch
 * der zweite Versuch, wird geworfen (kein stiller Fallback — Spec §4.1/§6).
 *
 * Optionales `facts`-Objekt (Business-Datensatz, kein LLM-Output) wird ERST
 * NACH dieser Validierung gemergt und das Ergebnis erneut per safeParse
 * geprüft — Merge-Reihenfolge ist bewusst so, dass facts niemals von der
 * LLM-Antwort überschrieben werden können.
 *
 * PB_LLM_MOCK=1 (nicht-produktiv) überspringt den LLM-Aufruf komplett und
 * liefert ein deterministisches Fixture-Dokument (siehe mockSiteContent).
 */
export async function generateSiteContent(
  args: GenerateSiteContentArgs
): Promise<WebsiteDataV2> {
  const { packId, business, facts } = args;

  if (isLlmMockEnabled()) {
    return mockSiteContent(packId, business, facts);
  }

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

  if (!facts) {
    return result.data;
  }

  const merged = mergeFacts(result.data, facts);
  const revalidated = WebsiteDataV2Schema.safeParse(merged);
  if (!revalidated.success) {
    throw new Error(
      "Validierung nach Fakten-Merge fehlgeschlagen: " +
        revalidated.error.message
    );
  }
  return revalidated.data;
}

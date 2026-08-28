import { getConstitution } from "../../shared/stylePacks";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { getFixture } from "../../shared/siteContract/fixtures";
import { isTrustedPlaceholderGallery } from "../../shared/onboardingV2/placeholderImages";
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
interface GenerateSiteContentFacts {
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
  /**
   * Deterministische Bild-URLs (GMB via R2 / Branchen-Stock), nie vom LLM.
   * `gallery` mit ≥ 3 URLs erzeugt/ersetzt die Galerie-Sektion. Fehlt sie,
   * bleiben vorhandene Pack-/Stock-Platzhalter stehen — nur LLM-Fantasie-
   * Galerien (fremde Hosts) werden gestrippt, damit Hero/About/Galerie
   * nicht auf leere/kaputte Sektionen zusammenfallen.
   */
  images?: { hero?: string; about?: string; gallery?: string[] };
  /**
   * Deterministische Testimonials aus echten Google-Reviews
   * (`selectTestimonialReviews` in facts.ts, Spec §2.2): setzt/ersetzt die
   * testimonials-Sektion vollständig — das LLM formuliert NIE Bewertungen.
   * Leeres Array = keine belastbaren Reviews → Sektion wird gestrippt.
   */
  reviews?: { author: string; text: string; rating: number }[];
  /** Googles Editorial Summary — reiner Prompt-Kontext, landet nie im Dokument. */
  editorialSummary?: string;
  /**
   * Crawl-Ergebnis der bestehenden Betriebs-Website (Plan B7 Task 2,
   * `server/gmb/siteCrawl.ts`): Faktenquelle für Leistungen/Selbstbeschreibung
   * im LLM-Prompt — wird NICHT ins Dokument gemergt (mergeFacts ignoriert es),
   * sondern nur in buildContentPrompt gereicht. Fehlt das Feld, fehlt der
   * Prompt-Abschnitt.
   */
  existingSite?: { title?: string; description?: string; text?: string };
}

export interface GenerateSiteContentArgs {
  packId: PackId;
  business: { name: string; category: string; city?: string };
  facts?: GenerateSiteContentFacts;
  /**
   * Fakten-Korrektur-Hinweis des Halluzinations-Guards (factGuard.ts):
   * wird beim Branchen-Retry als eigener Prompt-Abschnitt angehängt.
   */
  retryHint?: string;
}

/**
 * Sektions-Soll der Erstgenerierung (Plan B7 Task 3, Spec §2.2): das LLM
 * schreibt hero, services (4–6), about, faq (4–6) und contact — testimonials
 * (echte Google-Reviews) und gallery (GMB-Fotos via R2) entstehen
 * deterministisch in mergeFacts, nie vom LLM. Ziel: 6–8 Sektionen.
 */
const DEFAULT_SECTIONS: SectionType[] = [
  "hero",
  "services",
  "about",
  "faq",
  "contact",
];
/** Gastro-Packs (aktuell nur "gusto") bekommen eine Speisekarte statt Leistungen. */
const MENU_SECTIONS: SectionType[] = [
  "hero",
  "menu",
  "about",
  "faq",
  "contact",
];

function resolveSections(packId: PackId): SectionType[] {
  return packId === "gusto" ? MENU_SECTIONS : DEFAULT_SECTIONS;
}

/** Galerie erst ab so vielen echten Fotos (Spec §2.2: „wenn ≥ 3 brauchbare"). */
const MIN_GALLERY_IMAGES = 3;

/**
 * Ersetzt eine vorhandene Sektion gleichen Typs oder fügt sie nach der
 * letzten der `afterTypes`-Sektionen ein (Fallback: vor contact, sonst ans
 * Ende) — hält die kanonische Reihenfolge hero → services/menu → about →
 * gallery → testimonials → faq → contact ein.
 */
function upsertSection(
  sections: WebsiteDataV2["sections"],
  section: WebsiteDataV2["sections"][number],
  afterTypes: SectionType[]
): WebsiteDataV2["sections"] {
  const existingIndex = sections.findIndex(s => s.type === section.type);
  if (existingIndex >= 0) {
    return sections.map((s, i) => (i === existingIndex ? section : s));
  }
  let insertAt = -1;
  sections.forEach((s, i) => {
    if (afterTypes.includes(s.type)) insertAt = i;
  });
  if (insertAt === -1) {
    const contactIndex = sections.findIndex(s => s.type === "contact");
    insertAt = contactIndex >= 0 ? contactIndex - 1 : sections.length - 1;
  }
  return [
    ...sections.slice(0, insertAt + 1),
    section,
    ...sections.slice(insertAt + 1),
  ];
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
      // Öffnungszeiten kommen NUR aus facts (GMB oder Mo–Fr-Platzhalter
      // aus resolveOpeningHours), niemals vom LLM: liefert facts.contact
      // keine, werden vom LLM erfundene Zeiten aus `existing` bewusst
      // GESTRIPPT statt übernommen — sonst könnte das Modell Öffnungszeiten
      // frei erfinden (Halluzination).
      ...(openingHours !== undefined ? { openingHours } : {}),
    };
    sections =
      existingIndex >= 0
        ? data.sections.map((s, i) => (i === existingIndex ? newContact : s))
        : [...data.sections, newContact];
  }

  if (facts.images) {
    const { hero, about } = facts.images;
    // Nur setzen, nie leeren: fehlende GMB-/Stock-URLs dürfen vorhandene
    // Pack-Platzhalter (z. B. /demo/… aus dem LLM-Mock) nicht ausreißen.
    sections = sections.map(s => {
      if (s.type === "hero" && hero)
        return { ...s, imageUrl: hero };
      if (s.type === "about" && about)
        return { ...s, imageUrl: about };
      return s;
    });

    // Galerie: ≥ 3 gelieferte URLs (GMB oder Stock) ersetzen die Sektion.
    // Sonst bleiben Pack-/Stock-Platzhalter stehen. Nur eine vom LLM
    // erfundene Galerie mit fremden Hosts wird gestrippt — nie die
    // visuell vollständige Default-Galerie.
    const gallery = facts.images.gallery;
    const existing = sections.find(s => s.type === "gallery") as
      | SectionOf<"gallery">
      | undefined;
    if (gallery && gallery.length >= MIN_GALLERY_IMAGES) {
      const gallerySection: SectionOf<"gallery"> = {
        type: "gallery",
        headline: existing?.headline ?? "Einblicke",
        images: gallery.map((url, i) => ({
          url,
          alt: `${data.businessName} – Eindruck ${i + 1}`,
        })),
      };
      sections = upsertSection(sections, gallerySection, [
        "about",
        "menu",
        "services",
        "hero",
      ]);
    } else if (!isTrustedPlaceholderGallery(existing?.images ?? [])) {
      sections = sections.filter(s => s.type !== "gallery");
    }
  }

  // Testimonials deterministisch aus echten Google-Reviews (Spec §2.2):
  // facts.reviews setzt/ersetzt die Sektion VOLLSTÄNDIG — das LLM formuliert
  // nie Bewertungen. Leeres Array = keine belastbaren Reviews → eine vom LLM
  // erfundene testimonials-Sektion wird gestrippt.
  if (facts.reviews !== undefined) {
    if (facts.reviews.length > 0) {
      const existing = sections.find(s => s.type === "testimonials") as
        | SectionOf<"testimonials">
        | undefined;
      const testimonialSection: SectionOf<"testimonials"> = {
        type: "testimonials",
        headline: existing?.headline ?? "Das sagen unsere Kunden",
        items: facts.reviews.map(r => ({
          author: r.author,
          text: r.text,
          rating: r.rating,
        })),
      };
      sections = upsertSection(sections, testimonialSection, [
        "gallery",
        "about",
        "menu",
        "services",
        "hero",
      ]);
    } else {
      sections = sections.filter(s => s.type !== "testimonials");
    }
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
 * Gastro-Default (Plan B6 Task 6, Spec §5.5): enthält das generierte
 * Dokument eine Speisekarte (Gastro-Packs, `MENU_SECTIONS`), ist das
 * Menü-Add-on im Entwurf vorausgewählt — `addOns.menu: true` macht die
 * Sektion sichtbar (Gating in client/src/components/site/engine.ts), runJob
 * spiegelt das Flag in onboarding_responses (Extras-Panel „Aktiv", Preis im
 * Checkout, abwählbar). Ohne Speisekarte bleibt `addOns` leer — Galerie/
 * Preisliste/Team/Unterseiten entstehen erst im Studio.
 */
function withGeneratedAddOnDefaults(data: WebsiteDataV2): WebsiteDataV2 {
  // Galerie-Analogie (Plan B7 Task 3 / Platzhalter-Fix): eine bei der
  // Generierung entstandene gallery-Sektion (GMB oder Stock-Defaults) ist
  // ohne `addOns.gallery` unsichtbar (Gating in engine.ts) — deshalb wird
  // das Add-on wie beim Gastro-Menü als Entwurfs-Flag vorausgewählt.
  const defaults: NonNullable<WebsiteDataV2["addOns"]> = {
    ...(data.sections.some(s => s.type === "menu") ? { menu: true } : {}),
    ...(data.sections.some(s => s.type === "gallery") ? { gallery: true } : {}),
  };
  if (Object.keys(defaults).length === 0) return data;
  return { ...data, addOns: { ...(data.addOns ?? {}), ...defaults } };
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
  const { packId, business, facts, retryHint } = args;

  if (isLlmMockEnabled()) {
    return mockSiteContent(packId, business, facts);
  }

  const constitution = getConstitution(packId);
  const sections = resolveSections(packId);
  const basePrompt = buildContentPrompt({
    constitution,
    business,
    sections,
    ...(facts?.existingSite ? { existingSite: facts.existingSite } : {}),
    ...(facts?.editorialSummary
      ? { editorialSummary: facts.editorialSummary }
      : {}),
  });
  // Fakten-Korrektur des Guards (factGuard.ts, genau ein Retry) als eigener
  // Abschnitt — bewusst NACH dem regulären Prompt, damit der Hinweis die
  // letzte Instruktion ist.
  const prompt = retryHint
    ? `${basePrompt}\n\n## Faktenkorrektur\n${retryHint}`
    : basePrompt;

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
    return withGeneratedAddOnDefaults(result.data);
  }

  const merged = withGeneratedAddOnDefaults(mergeFacts(result.data, facts));
  const revalidated = WebsiteDataV2Schema.safeParse(merged);
  if (!revalidated.success) {
    throw new Error(
      "Validierung nach Fakten-Merge fehlgeschlagen: " +
        revalidated.error.message
    );
  }
  return revalidated.data;
}

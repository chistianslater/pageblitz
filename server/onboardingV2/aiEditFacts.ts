import type {
  Page,
  PageSection,
  SectionOf,
  SectionV2,
  WebsiteDataV2,
} from "../../shared/siteContract/types";

/** Startseiten- oder Unterseiten-Sektion — die Fakten-Restauration arbeitet für beide gleich. */
type AnySection = SectionV2 | PageSection;

/**
 * Fakten-Garantie für den KI-Chat: die KI darf Sektionstypen weder erfinden
 * noch entfernen. Einzige Ausnahme (2026-08-30, „mehr erzählen"): die
 * Erzähl-Sektion `story` — sie besteht nur aus Text (keine Fakten) und darf
 * hinzugefügt und entfernt werden. Ein Verstoß löst in `proposeAiEdit`
 * einen Retry aus (der zweite Versuch bekommt denselben Prompt, der die
 * Regel explizit nennt).
 */
function assertSameSectionTypeSet(
  originalSections: AnySection[],
  candidateSections: AnySection[]
): void {
  const originalTypes = new Set<string>(originalSections.map(s => s.type));
  for (const section of candidateSections) {
    if (ADDABLE_TYPES.has(section.type)) continue;
    if (!originalTypes.has(section.type)) {
      throw new Error(
        `Die KI hat einen neuen Sektionstyp erfunden: "${section.type}".`
      );
    }
  }
}

/**
 * Faktenfreie Zusatz-Sektionen — die einzigen, die die KI hinzufügen und
 * entfernen darf (story 2026-08-30, usp/notice 2026-08-31).
 */
const ADDABLE_TYPES = new Set<string>(["story", "usp", "notice"]);

/**
 * Kopiert Fakten (imageUrl, ctaHref) einer einzelnen Sektion vom Original in
 * den KI-Kandidaten zurück, feld- bzw. indexweise. Die contact-Sektion wird
 * separat komplett aus dem Original übernommen (siehe `restoreFacts`), weil
 * sie ausschließlich aus Fakten besteht.
 */
function restoreSectionFacts(
  original: AnySection,
  candidate: AnySection
): AnySection {
  if (candidate.type !== original.type) return original;

  switch (original.type) {
    case "hero": {
      const c = candidate as SectionOf<"hero">;
      const merged: SectionOf<"hero"> = { ...c };
      if (original.imageUrl !== undefined) merged.imageUrl = original.imageUrl;
      else delete merged.imageUrl;
      if (original.ctaHref !== undefined) merged.ctaHref = original.ctaHref;
      else delete merged.ctaHref;
      return merged;
    }
    case "about": {
      const c = candidate as SectionOf<"about">;
      const merged: SectionOf<"about"> = { ...c };
      if (original.imageUrl !== undefined) merged.imageUrl = original.imageUrl;
      else delete merged.imageUrl;
      return merged;
    }
    case "gallery": {
      const c = candidate as SectionOf<"gallery">;
      // Nie mehr Bilder als im Original: für Indizes jenseits der
      // Original-Länge gibt es keine Fakten-Quelle zum Zurückkopieren — eine
      // dort von der KI eingesetzte URL bliebe sonst ungeprüft im Dokument
      // stehen. Zusätzliche Kandidaten-Bilder werden deshalb verworfen statt
      // ungeprüft übernommen.
      const images = c.images
        .slice(0, original.images.length)
        .map((img, i) => ({ ...img, url: original.images[i].url }));
      return { ...c, images };
    }
    case "team": {
      const c = candidate as SectionOf<"team">;
      // Gleiche Begründung wie bei "gallery": Teammitglieder jenseits der
      // Original-Länge haben kein Fakten-Original für imageUrl und werden
      // verworfen statt mit einer ungeprüften Kandidaten-URL übernommen.
      const members = c.members
        .slice(0, original.members.length)
        .map((member, i) => {
          const originalImageUrl = original.members[i].imageUrl;
          const merged = { ...member };
          if (originalImageUrl !== undefined)
            merged.imageUrl = originalImageUrl;
          else delete merged.imageUrl;
          return merged;
        });
      return { ...c, members };
    }
    case "cta": {
      const c = candidate as SectionOf<"cta">;
      const merged: SectionOf<"cta"> = { ...c };
      if (original.ctaHref !== undefined) merged.ctaHref = original.ctaHref;
      else delete merged.ctaHref;
      return merged;
    }
    default:
      return candidate;
  }
}

/**
 * Fakten-Garantie (Spec §5): baut aus dem KI-Kandidaten (bereits per
 * envelope-Whitelist auf seo+sections reduziert) ein neues Dokument, das
 * ausschließlich in Text-/Struktur-Feldern vom Original abweicht.
 * - Die contact-Sektion kommt IMMER 1:1 aus dem Original (reine Fakten).
 * - imageUrl/ctaHref (hero/about/gallery/team/cta) werden je Sektion und
 *   Item-Index aus dem Original zurückkopiert; zusätzliche Kandidaten-Items
 *   jenseits der Original-Array-Länge (gallery.images/team.members) werden
 *   verworfen, weil es dafür keine Fakten-Quelle gibt.
 * - Sektionen, die die KI im Kandidaten weggelassen hat, aber im Original
 *   existierten, bleiben unverändert an ihrer ursprünglichen Position.
 * - Reihenfolge und Sektions-Set folgen strikt dem Original.
 *
 * Wirft, wenn der Kandidat einen im Original nicht vorhandenen Sektionstyp
 * enthält (siehe `assertSameSectionTypeSet`) — das signalisiert der Aufrufer
 * als ungültige LLM-Antwort und löst einen Retry aus.
 */
export function restoreFacts(
  original: WebsiteDataV2,
  candidate: { seo: WebsiteDataV2["seo"]; sections: SectionV2[] }
): WebsiteDataV2 {
  const sections = restoreSectionList(
    original.sections,
    candidate.sections
  ) as SectionV2[];
  return { ...original, seo: candidate.seo, sections };
}

/**
 * Fakten-Garantie für eine Unterseite (Plan B6 Task 5, KI-Chat mit
 * `pageSlug`): dieselben Regeln wie `restoreFacts`, angewandt auf
 * `Page.sections` (contact 1:1 aus dem Original, about/gallery-Bilder
 * zurückkopiert, pageHeader hat keine Fakten). Slug/Titel/navLabel der Seite
 * bleiben unverändert — die KI bearbeitet nur SEO + Sektionstexte.
 */
export function restorePageFacts(
  original: Page,
  candidate: { seo: Page["seo"]; sections: PageSection[] }
): Page {
  const sections = restoreSectionList(
    original.sections,
    candidate.sections
  ) as PageSection[];
  return { ...original, seo: candidate.seo, sections };
}

/**
 * Gemeinsamer Kern von restoreFacts/restorePageFacts — Reihenfolge und
 * Sektions-Set folgen strikt dem Original. Ausnahme `story` (2026-08-30):
 * fehlt sie im Kandidaten, wird sie entfernt; ist sie neu, wird sie an der
 * Position eingefügt, die die KI gewählt hat (nach ihrem Vorgänger-Typ im
 * Kandidaten; ohne auffindbaren Vorgänger ans Ende vor contact).
 */
function restoreSectionList(
  originalSections: AnySection[],
  candidateSections: AnySection[]
): AnySection[] {
  assertSameSectionTypeSet(originalSections, candidateSections);

  const candidateByType = new Map<string, AnySection>(
    candidateSections.map(s => [s.type, s])
  );
  const originalTypes = new Set<string>(originalSections.map(s => s.type));

  const restored = originalSections
    // Nur die faktenfreien Zusatz-Sektionen darf die KI entfernen.
    .filter(s => !ADDABLE_TYPES.has(s.type) || candidateByType.has(s.type))
    .map(originalSection => {
      if (originalSection.type === "contact") return originalSection;
      const candidateSection = candidateByType.get(originalSection.type);
      if (!candidateSection) return originalSection;
      return restoreSectionFacts(originalSection, candidateSection);
    });

  // Neue Zusatz-Sektionen an der Position einfügen, die die KI gewählt hat
  // (nach ihrem Vorgänger-Typ im Kandidaten; sonst ans Ende vor contact —
  // "notice" ganz nach vorn, der Banner liegt ohnehin über der Nav).
  for (const type of ADDABLE_TYPES) {
    if (!candidateByType.has(type) || originalTypes.has(type)) continue;
    const added = candidateByType.get(type)!;
    if (type === "notice") {
      restored.unshift(added);
      continue;
    }
    const addedIndex = candidateSections.findIndex(s => s.type === type);
    const predecessorType = candidateSections[addedIndex - 1]?.type;
    const anchor = predecessorType
      ? restored.findIndex(s => s.type === predecessorType)
      : -1;
    if (anchor !== -1) {
      restored.splice(anchor + 1, 0, added);
    } else {
      const contactIndex = restored.findIndex(s => s.type === "contact");
      restored.splice(
        contactIndex === -1 ? restored.length : contactIndex,
        0,
        added
      );
    }
  }
  return restored;
}

import type {
  SectionOf,
  SectionV2,
  WebsiteDataV2,
} from "../../shared/siteContract/types";

/**
 * Fakten-Garantie für den KI-Chat: die KI darf Sektionstypen weder erfinden
 * noch entfernen. Wird geprüft, bevor Fakten zurückkopiert werden — ein
 * Verstoß löst in `proposeAiEdit` einen Retry aus (der zweite Versuch bekommt
 * denselben Prompt, der die Regel explizit nennt).
 */
export function assertSameSectionTypeSet(
  original: WebsiteDataV2,
  candidateSections: SectionV2[]
): void {
  const originalTypes = new Set(original.sections.map(s => s.type));
  for (const section of candidateSections) {
    if (!originalTypes.has(section.type)) {
      throw new Error(
        `Die KI hat einen neuen Sektionstyp erfunden: "${section.type}".`
      );
    }
  }
}

/**
 * Kopiert Fakten (imageUrl, ctaHref) einer einzelnen Sektion vom Original in
 * den KI-Kandidaten zurück, feld- bzw. indexweise. Die contact-Sektion wird
 * separat komplett aus dem Original übernommen (siehe `restoreFacts`), weil
 * sie ausschließlich aus Fakten besteht.
 */
function restoreSectionFacts(
  original: SectionV2,
  candidate: SectionV2
): SectionV2 {
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
      const images = c.images.map((img, i) => ({
        ...img,
        url: original.images[i]?.url ?? img.url,
      }));
      return { ...c, images };
    }
    case "team": {
      const c = candidate as SectionOf<"team">;
      const members = c.members.map((member, i) => {
        const originalImageUrl = original.members[i]?.imageUrl;
        const merged = { ...member };
        if (originalImageUrl !== undefined) merged.imageUrl = originalImageUrl;
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
 *   Item-Index aus dem Original zurückkopiert.
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
  assertSameSectionTypeSet(original, candidate.sections);

  const candidateByType = new Map(candidate.sections.map(s => [s.type, s]));

  const sections = original.sections.map(originalSection => {
    if (originalSection.type === "contact") return originalSection;
    const candidateSection = candidateByType.get(originalSection.type);
    if (!candidateSection) return originalSection;
    return restoreSectionFacts(originalSection, candidateSection);
  });

  return { ...original, seo: candidate.seo, sections };
}

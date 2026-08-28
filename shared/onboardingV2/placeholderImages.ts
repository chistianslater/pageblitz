/**
 * Erkennung von Pack-/Stock-/R2-Platzhalterbildern.
 *
 * Die Erstgenerierung darf eine visuell vollständige Website liefern, auch
 * ohne Google-Fotos. mergeFacts darf diese Defaults nicht leeren, nur weil
 * GMB/Upload nichts geliefert haben — echte GMB-Fotos (≥ 3) ersetzen sie.
 */

export function isTrustedPlaceholderImageUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/demo/")) return true;
  try {
    const host = new URL(url).hostname;
    return (
      host === "images.unsplash.com" ||
      host === "media.pageblitz.de" ||
      host.endsWith(".pageblitz.de")
    );
  } catch {
    return false;
  }
}

/** Vorhandene Galerie aus Pack-/Stock-Defaults, keine LLM-Fantasie-URLs. */
export function isTrustedPlaceholderGallery(
  images: ReadonlyArray<{ url: string }>
): boolean {
  return (
    images.length > 0 &&
    images.every(image => isTrustedPlaceholderImageUrl(image.url))
  );
}

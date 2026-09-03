import React from "react";
import {
  collagePhotoPool,
  heroCollageImages,
  MAX_COLLAGE_IMAGES,
} from "../../../components/site/heroCollage";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";

/**
 * Collage-Fotos wählen (2026-09-03, Betreiber: „beim Stil Collage kann ich
 * die weiteren Fotos nicht auswählen"). Sichtbar nur, wenn das Hero-Layout
 * — auf dem Desktop oder mobil — auf „collage" steht.
 *
 * `onChange(null)` heißt „automatisch" (Feld im Dokument löschen),
 * `onChange([])` heißt bewusst keine Karten. Angeboten wird ausschließlich
 * vorhandenes Material (Galerie, dann Über-uns-Bild) — dieselbe Liste, die
 * der Server beim Speichern gegenprüft.
 */
/**
 * Nächste Auswahl nach einem Klick: gewähltes Foto abwählen, sonst
 * hinzunehmen — und bei voller Auswahl das älteste weichen lassen, damit
 * ein Klick zum Austauschen genügt statt erst abwählen zu müssen.
 */
export function nextCollageSelection(
  active: readonly string[],
  url: string
): string[] {
  if (active.includes(url)) return active.filter(u => u !== url);
  return [...active, url].slice(-MAX_COLLAGE_IMAGES);
}

export function CollagePicker({
  doc,
  onChange,
  busy,
  error,
}: {
  doc: WebsiteDataV2;
  onChange: (urls: string[] | null) => void;
  busy: boolean;
  error: string | null;
}) {
  const profile = doc.designProfile;
  const isCollage =
    profile?.heroLayout === "collage" ||
    profile?.heroLayoutMobile === "collage";
  if (!isCollage) return null;

  const pool = collagePhotoPool(doc);
  const chosen = profile?.heroCollageImages;
  // Ohne eigene Wahl die automatisch genutzten Fotos markieren — der Nutzer
  // sieht so, was gerade in der Collage liegt, statt einer leeren Auswahl.
  const active = heroCollageImages(doc);


  return (
    <section className="pb-studio-collage" aria-label="Collage-Fotos">
      <div className="pb-studio-collage-head">
        <h3>Fotos der Collage</h3>
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          disabled={busy || !chosen}
          onClick={() => onChange(null)}
        >
          Automatisch
        </button>
      </div>
      <p className="pb-studio-hint">
        Bis zu {MAX_COLLAGE_IMAGES} Fotos legen sich über das Hauptbild. Zur
        Auswahl stehen deine Galerie und das Über-uns-Bild.
      </p>
      {pool.length === 0 ? (
        <p className="pb-studio-hint">
          Noch keine Zusatzfotos vorhanden — lade oben Fotos in die Galerie,
          dann kannst du hier auswählen.
        </p>
      ) : (
        <div
          className="pb-studio-collage-grid"
          role="group"
          aria-label="Collage-Fotos"
        >
          {pool.map((url, i) => {
            const on = active.includes(url);
            return (
              <button
                key={url}
                type="button"
                aria-pressed={on}
                aria-label={`Foto ${i + 1}`}
                disabled={busy}
                onClick={() => onChange(nextCollageSelection(active, url))}
              >
                <img src={url} alt="" loading="lazy" />
                {on && (
                  <span className="pb-studio-collage-mark" aria-hidden="true">
                    {active.indexOf(url) + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {error && (
        <p className="pb-studio-error" role="status">
          {error}
        </p>
      )}
    </section>
  );
}

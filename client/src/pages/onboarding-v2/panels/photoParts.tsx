import React, { useState } from "react";
import { addonPrice, formatEuro } from "@shared/pricing";

export type PhotoTarget = "hero" | "about" | "gallery";

const TARGET_LABELS: Record<PhotoTarget, string> = {
  hero: "Hero",
  about: "Über uns",
  gallery: "Galerie",
};

interface PhotoTargetPickerProps {
  target: PhotoTarget;
  onTarget: (target: PhotoTarget) => void;
  hasAbout: boolean;
}

/** Reine Darstellung: Ziel-Auswahl (Hero / Über uns / Galerie) als Segmented Control. */
export function PhotoTargetPicker({
  target,
  onTarget,
  hasAbout,
}: PhotoTargetPickerProps) {
  const targets: PhotoTarget[] = hasAbout
    ? ["hero", "about", "gallery"]
    : ["hero", "gallery"];
  return (
    <div
      className="pb-studio-seg pb-studio-seg--fill"
      role="group"
      aria-label="Ziel wählen"
    >
      {targets.map(t => (
        <button
          key={t}
          type="button"
          aria-pressed={target === t}
          onClick={() => onTarget(t)}
        >
          {TARGET_LABELS[t]}
        </button>
      ))}
    </div>
  );
}

interface GalleryAddonNoticeProps {
  onActivate: () => void;
  busy: boolean;
  error: string | null;
}

/**
 * Reine Darstellung (Plan B6 Task 6): Die Galerie ist Add-on-Inhalt — ohne
 * gebuchtes `addOns.gallery` wird sie nicht gerendert (engine.ts), deshalb
 * zeigt das Fotos-Panel statt des Galerie-Rasters diesen Hinweis mit dem
 * Schalter, der das Extra über `onboardingV2.updateAddons` aktiviert (nach
 * dem Checkout inkl. Stripe-Abrechnung, Fehler erscheint hier als Alert).
 */
export function GalleryAddonNotice({
  onActivate,
  busy,
  error,
}: GalleryAddonNoticeProps) {
  return (
    <div className="pb-studio-rows" data-testid="gallery-addon-notice">
      <p style={{ color: "var(--st-muted)" }}>
        Die Bildergalerie ist ein Extra ({formatEuro(addonPrice("gallery"))}
        /Monat). Aktiviere es, um Galerie-Fotos auszuwählen — die Fotos
        erscheinen erst dann auf deiner Website.
      </p>
      <button
        type="button"
        className="pb-studio-btn"
        data-variant="ghost"
        disabled={busy}
        onClick={onActivate}
      >
        {busy ? "Bitte warten…" : "Galerie aktivieren"}
      </button>
      {error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface PhotoGridProps {
  photos: string[];
  selected: string[];
  onPick: (url: string) => void;
  emptyText: string;
}

/**
 * Reine Darstellung: 3-spaltiges Foto-Raster mit Auswahl-Status. Blendet
 * Kacheln aus, deren Bild nicht lädt (Finding F2) — tote Stock-/GMB-URLs
 * (404, abgelaufene Google-Foto-Referenz) sollen nicht als leere graue
 * Boxen im Raster hängen bleiben. `broken` sammelt die fehlgeschlagenen
 * URLs clientseitig; kein Server-Request nötig.
 */
export function PhotoGrid({
  photos,
  selected,
  onPick,
  emptyText,
}: PhotoGridProps) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const markBroken = (url: string) =>
    setBroken(prev => (prev.has(url) ? prev : new Set(prev).add(url)));
  const visible = photos
    .map((url, i) => ({ url, alt: `Foto ${i + 1}` }))
    .filter(({ url }) => !broken.has(url));

  if (visible.length === 0) {
    return <p style={{ color: "var(--st-muted)" }}>{emptyText}</p>;
  }
  return (
    <div className="pb-studio-photo-grid" role="group" aria-label="Fotos">
      {visible.map(({ url, alt }) => (
        <button
          key={url}
          type="button"
          className="pb-studio-photo"
          aria-pressed={selected.includes(url)}
          onClick={() => onPick(url)}
        >
          <img
            src={url}
            alt={alt}
            loading="lazy"
            onError={() => markBroken(url)}
          />
        </button>
      ))}
    </div>
  );
}

interface SelectedGalleryListProps {
  urls: string[];
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (index: number) => void;
  busy?: boolean;
  /** Sichtbare Bildunterschriften je URL (optional, 2026-08-29). */
  captions?: Record<string, string>;
  /** Commit einer Unterschrift (onBlur) — ohne Handler kein Eingabefeld. */
  onCaptionChange?: (url: string, caption: string) => void;
}

/**
 * Ausgewählte Galerie-Fotos zum Sortieren und Entfernen — ergänzt das
 * Bibliotheks-Raster (hinzufügen per Klick) um die echte Reihenfolge, die
 * `setImages` persistiert.
 */
export function SelectedGalleryList({
  urls,
  onMove,
  onRemove,
  busy = false,
  captions = {},
  onCaptionChange,
}: SelectedGalleryListProps) {
  if (urls.length === 0) {
    return (
      <p className="pb-studio-gallery-empty" style={{ color: "var(--st-muted)" }}>
        Noch keine Galerie-Fotos. Lade eigene Bilder hoch oder wähle sie
        unten aus Google-Fotos bzw. Stockbildern.
      </p>
    );
  }
  return (
    <ol className="pb-studio-gallery-selected" aria-label="Galerie-Fotos">
      {urls.map((url, index) => (
        <li key={`${url}-${index}`} className="pb-studio-gallery-selected-item">
          <img src={url} alt={`Galerie-Foto ${index + 1}`} />
          {onCaptionChange ? (
            <input
              type="text"
              className="pb-studio-input pb-studio-gallery-caption"
              aria-label={`Bildunterschrift für Foto ${index + 1}`}
              placeholder="Bildunterschrift (optional)"
              maxLength={140}
              defaultValue={captions[url] ?? ""}
              disabled={busy}
              onBlur={event => {
                const next = event.target.value.trim();
                if (next !== (captions[url] ?? "")) onCaptionChange(url, next);
              }}
            />
          ) : (
            <span>Foto {index + 1}</span>
          )}
          <div className="pb-studio-team-actions">
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              aria-label={`Foto ${index + 1} nach oben verschieben`}
              disabled={busy || index === 0}
              onClick={() => onMove(index, "up")}
            >
              ↑
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              aria-label={`Foto ${index + 1} nach unten verschieben`}
              disabled={busy || index === urls.length - 1}
              onClick={() => onMove(index, "down")}
            >
              ↓
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              aria-label={`Foto ${index + 1} entfernen`}
              disabled={busy}
              onClick={() => onRemove(index)}
            >
              Entfernen
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}

import React from "react";

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
    <div className="pb-studio-seg" role="group" aria-label="Ziel wählen">
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

interface PhotoGridProps {
  photos: string[];
  selected: string[];
  onPick: (url: string) => void;
  emptyText: string;
}

/** Reine Darstellung: 3-spaltiges Foto-Raster mit Auswahl-Status. */
export function PhotoGrid({
  photos,
  selected,
  onPick,
  emptyText,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return <p style={{ color: "var(--st-muted)" }}>{emptyText}</p>;
  }
  return (
    <div className="pb-studio-photo-grid" role="group" aria-label="Fotos">
      {photos.map(url => (
        <button
          key={url}
          type="button"
          className="pb-studio-photo"
          aria-pressed={selected.includes(url)}
          onClick={() => onPick(url)}
        >
          <img src={url} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  );
}

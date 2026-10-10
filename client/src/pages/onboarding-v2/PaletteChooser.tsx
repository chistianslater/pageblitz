import React, { useRef } from "react";

export interface PaletteOption {
  id: string;
  name: string;
  paper: string;
  accent: string;
}

interface PaletteChooserProps {
  /** Zugänglicher Name der Gruppe, z. B. „Farbstimmung Journal". */
  label: string;
  palettes: readonly PaletteOption[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
  /** Kompakt (Karten) oder mit sichtbarem Namen unter dem Farbfeld. */
  size?: "compact" | "regular";
}

const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown"]);
const PREV_KEYS = new Set(["ArrowLeft", "ArrowUp"]);

/**
 * Farbstimmungen eines Designsystems als Radiogruppe (WAI-ARIA Radio Group):
 * ein Tab-Stopp, Pfeiltasten wechseln und wählen zugleich, Home/End springen.
 * Jedes Feld zeigt den Papier-Grund mit dem Akzent als Punkt — so liest man
 * die Stimmung, ohne die ganze Seite zu laden.
 */
export function PaletteChooser({
  label,
  palettes,
  value,
  onChange,
  disabled = false,
  size = "regular",
}: PaletteChooserProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    0,
    palettes.findIndex(p => p.id === value)
  );

  const choose = (index: number) => {
    if (disabled) return;
    const palette = palettes[index];
    if (!palette) return;
    refs.current[index]?.focus();
    if (palette.id !== value) onChange(palette.id);
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = palettes.length - 1;
    let target: number | null = null;
    if (NEXT_KEYS.has(event.key)) target = index >= last ? 0 : index + 1;
    else if (PREV_KEYS.has(event.key)) target = index <= 0 ? last : index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = last;
    if (target === null) return;
    event.preventDefault();
    choose(target);
  };

  return (
    <div
      className="pb-palette"
      data-size={size}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
    >
      {palettes.map((palette, index) => {
        const checked = index === selectedIndex && value !== null;
        return (
          <button
            key={palette.id}
            ref={el => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            className="pb-palette-option"
            aria-checked={checked}
            aria-disabled={disabled || undefined}
            tabIndex={index === selectedIndex ? 0 : -1}
            onClick={() => choose(index)}
            onKeyDown={event => onKeyDown(event, index)}
          >
            <span
              className="pb-palette-swatch"
              style={{ background: palette.paper }}
              aria-hidden="true"
            >
              <span
                className="pb-palette-dot"
                style={{ background: palette.accent }}
              />
            </span>
            <span className="pb-palette-name">{palette.name}</span>
          </button>
        );
      })}
    </div>
  );
}

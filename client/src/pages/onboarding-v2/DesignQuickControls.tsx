import React, { useEffect, useMemo, useRef, useState } from "react";
import { Palette, Type, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getConstitution, getFontPair } from "@shared/stylePacks";
import { PACK_FONT_PAIRS, PACK_ACCENTS } from "@shared/stylePacks/packVariants";
import {
  getColorWorlds,
  activeColorWorldId,
} from "@shared/stylePacks/colorWorlds";
import type { PackId } from "@shared/siteContract/types";

interface DesignQuickControlsProps {
  token: string;
  packId: PackId;
  accent?: string | null;
  colorOverrides?: Record<string, string>;
  fontPairId?: string | null;
  onApplied: () => void;
}

export function DesignQuickControls({
  token,
  packId,
  accent = null,
  colorOverrides,
  fontPairId = null,
  onApplied,
}: DesignQuickControlsProps) {
  const [open, setOpen] = useState<"accent" | "color" | "font" | null>(null);
  const [custom, setCustom] = useState(accent ?? "#536025");
  const colorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (colorTimer.current) clearTimeout(colorTimer.current);
    },
    [packId]
  );
  const update = trpc.onboardingV2.updateTheme.useMutation();
  const worlds = useMemo(() => getColorWorlds(packId).slice(0, 4), [packId]);
  const fonts = useMemo(
    () => PACK_FONT_PAIRS[packId].map(id => getFontPair(id)!).filter(Boolean),
    [packId]
  );
  const activeWorld = activeColorWorldId(packId, colorOverrides);
  const defaultAccent = getConstitution(packId).palette.find(
    c => c.role === "accent"
  )?.hex;
  useEffect(
    () => setCustom(accent ?? defaultAccent ?? "#536025"),
    [accent, defaultAccent]
  );
  // Load only the three recommended combinations, only when their samples are opened.
  useEffect(() => {
    if (open !== "font") return;
    const families = [
      ...new Set(
        fonts.flatMap(pair => [pair.display.googleCss, pair.body.googleCss])
      ),
    ];
    const href = `https://fonts.googleapis.com/css2?${families.map(font => `family=${font}`).join("&")}&display=swap`;
    if (document.querySelector(`link[data-pb-harmony-fonts="${packId}"]`))
      return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.pbHarmonyFonts = packId;
    document.head.appendChild(link);
  }, [open, fonts, packId]);
  const save = (patch: {
    accent?: string | null;
    colorWorldId?: string | null;
    fontPairId?: string | null;
  }) => update.mutate({ token, ...patch }, { onSuccess: onApplied });
  return (
    <div
      className="pb-harmony"
      onKeyDown={e => {
        if (e.key === "Escape") setOpen(null);
      }}
    >
      <div className="pb-harmony-triggers">
        <button
          type="button"
          className="pb-harmony-accent"
          aria-label="Akzentfarbe"
          aria-expanded={open === "accent"}
          onClick={() => setOpen(open === "accent" ? null : "accent")}
        >
          <i style={{ background: custom }} aria-hidden="true" />
          <span>Akzent</span>
        </button>
        <button
          type="button"
          aria-expanded={open === "color"}
          onClick={() => setOpen(open === "color" ? null : "color")}
        >
          <Palette size={17} />
          <span>Farbwelt</span>
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          aria-expanded={open === "font"}
          onClick={() => setOpen(open === "font" ? null : "font")}
        >
          <Type size={17} />
          <span>Schriftkombination</span>
          <ChevronDown size={16} />
        </button>
      </div>
      {open && (
        <fieldset className="pb-harmony-options" disabled={update.isPending}>
          <legend>
            {open === "accent"
              ? "Passende Akzentfarben für dein Design"
              : open === "color"
                ? "Grundfläche, Text und Akzent im Zusammenspiel"
                : "Überschrift und Lesetext als abgestimmtes Paar"}
          </legend>
          {open === "accent" ? (
            <div className="pb-harmony-grid">
              {PACK_ACCENTS[packId].map((hex, i) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Akzentvorschlag ${i + 1}`}
                  aria-pressed={custom.toLowerCase() === hex.toLowerCase()}
                  onClick={() => {
                    setCustom(hex);
                    save({ accent: hex });
                  }}
                >
                  <span
                    className="pb-harmony-color-chip"
                    style={{ background: hex }}
                  />
                  <small>
                    {i === 0 ? "Originalakzent" : `Variante ${i + 1}`}
                  </small>
                </button>
              ))}
              <label className="pb-harmony-custom-color">
                Eigene Farbe
                <input
                  type="color"
                  aria-label="Eigene Akzentfarbe"
                  value={custom}
                  onChange={e => {
                    const value = e.target.value;
                    setCustom(value);
                    if (colorTimer.current) clearTimeout(colorTimer.current);
                    colorTimer.current = setTimeout(
                      () => save({ accent: value }),
                      450
                    );
                  }}
                />
              </label>
            </div>
          ) : open === "color" ? (
            <>
              {activeWorld === "eigene" && (
                <p className="pb-harmony-current">
                  Deine aktuelle Kombination ist individuell abgestimmt. Sie
                  bleibt erhalten, bis du eine andere wählst.
                </p>
              )}
              <div className="pb-harmony-grid">
                {worlds.map(world => (
                  <button
                    type="button"
                    key={world.id}
                    aria-pressed={activeWorld === world.id}
                    onClick={() => save({ colorWorldId: world.id })}
                  >
                    <span className="pb-harmony-swatches" aria-hidden="true">
                      {world.swatch.map((hex, i) => (
                        <i
                          key={i}
                          style={{ background: i === 2 ? custom : hex }}
                        />
                      ))}
                    </span>
                    <strong>{world.name}</strong>
                    <small>
                      {world.id === "original"
                        ? "Original der Designrichtung"
                        : "Abgestimmte Farbwelt"}
                    </small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="pb-harmony-grid">
              <button
                type="button"
                aria-pressed={fontPairId === null}
                onClick={() => save({ fontPairId: null })}
              >
                <strong>Schriften der Richtung</strong>
                <small>Original beibehalten</small>
              </button>
              {fonts.map((pair, i) => (
                <button
                  key={pair.id}
                  type="button"
                  aria-pressed={fontPairId === pair.id}
                  onClick={() => save({ fontPairId: pair.id })}
                >
                  <strong
                    style={{
                      fontFamily: `"${pair.display.family}", ${pair.display.fallback}`,
                    }}
                  >
                    {pair.label}
                  </strong>
                  <span
                    style={{
                      fontFamily: `"${pair.body.family}", ${pair.body.fallback}`,
                    }}
                  >
                    Ein guter erster Eindruck.
                  </span>
                  <small>{i === 0 ? "Unsere Empfehlung" : pair.vibe}</small>
                </button>
              ))}
            </div>
          )}
        </fieldset>
      )}
      {update.isPending && <p role="status">Deine Vorschau wird angepasst …</p>}
      {update.error && <p role="alert">{update.error.message}</p>}
    </div>
  );
}

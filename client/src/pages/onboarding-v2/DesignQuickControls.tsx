import React, { useEffect, useMemo, useState } from "react";
import { Check, Palette, Type, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  FONT_PAIRS,
  getConstitution,
  getFontPair,
} from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";
import { ACCENT_CHOICES } from "./themeChoices";

interface DesignQuickControlsProps {
  token: string;
  packId: PackId;
  accent?: string | null;
  fontPairId?: string | null;
  onApplied: () => void;
}

/** Kompakte Splash-Steuerung: zwei Buttons, Optionen fächern nach oben auf. */
export function DesignQuickControls({
  token,
  packId,
  accent = null,
  fontPairId = null,
  onApplied,
}: DesignQuickControlsProps) {
  const [open, setOpen] = useState<"color" | "font" | null>(null);
  const [localAccent, setLocalAccent] = useState(accent);
  const [localFontPairId, setLocalFontPairId] = useState(fontPairId);
  const updateTheme = trpc.onboardingV2.updateTheme.useMutation();

  useEffect(() => setLocalAccent(accent), [accent]);
  useEffect(() => setLocalFontPairId(fontPairId), [fontPairId]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const directionAccent =
    getConstitution(packId).palette.find(color => color.role === "accent")
      ?.hex ?? "#1f5f4b";
  const activeColor =
    ACCENT_CHOICES.find(
      color => color.hex.toLowerCase() === localAccent?.toLowerCase()
    )?.name ?? (localAccent ? "Eigene Farbe" : "Richtungsfarbe");
  const activeFont = getFontPair(localFontPairId)?.label ?? "Schriften der Richtung";

  // Font-Chips sollen ihre tatsächliche Richtung zeigen; einmalig laden.
  const fontHref = useMemo(() => {
    const families = Array.from(
      new Set(FONT_PAIRS.flatMap(pair => [pair.display.googleCss, pair.body.googleCss]))
    );
    return `https://fonts.googleapis.com/css2?${families
      .map(font => `family=${font}`)
      .join("&")}&display=swap`;
  }, []);
  useEffect(() => {
    if (document.querySelector(`link[data-pb-quick-fonts="${fontHref}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontHref;
    link.dataset.pbQuickFonts = fontHref;
    document.head.appendChild(link);
  }, [fontHref]);

  const save = (patch: {
    accent?: string | null;
    fontPairId?: string | null;
  }) =>
    updateTheme.mutate(
      { token, ...patch },
      {
        onSuccess: () => {
          onApplied();
          setOpen(null);
        },
      }
    );

  const chooseAccent = (value: string | null) => {
    setLocalAccent(value);
    save({ accent: value });
  };
  const chooseFont = (value: string | null) => {
    setLocalFontPairId(value);
    save({ fontPairId: value });
  };

  return (
    <div className="pb-design-quick">
      <p className="pb-studio-kicker">Schnell anpassen</p>
      <div className="pb-design-quick-row">
        <div className="pb-design-quick-control">
          <button
            type="button"
            className="pb-design-quick-trigger"
            aria-expanded={open === "color"}
            onClick={() => setOpen(value => (value === "color" ? null : "color"))}
          >
            <Palette aria-hidden="true" />
            <span
              className="pb-design-quick-color"
              style={{ background: localAccent ?? directionAccent }}
            />
            <span>
              <small>Farbe</small>
              <strong>{activeColor}</strong>
            </span>
          </button>
          {open === "color" && (
            <div className="pb-design-fan" data-kind="color">
              <div className="pb-design-fan-head">
                <strong>Akzentfarbe</strong>
                <button
                  type="button"
                  aria-label="Farbauswahl schließen"
                  onClick={() => setOpen(null)}
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="pb-design-fan-colors">
                <button
                  type="button"
                  className="pb-design-fan-color"
                  data-active={localAccent === null || undefined}
                  onClick={() => chooseAccent(null)}
                  title="Richtungsfarbe"
                >
                  <span style={{ background: directionAccent }} />
                  {localAccent === null && <Check aria-hidden="true" />}
                </button>
                {ACCENT_CHOICES.map(color => {
                  const active =
                    localAccent?.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      className="pb-design-fan-color"
                      data-active={active || undefined}
                      onClick={() => chooseAccent(color.hex)}
                      title={color.name}
                    >
                      <span style={{ background: color.hex }} />
                      {active && <Check aria-hidden="true" />}
                    </button>
                  );
                })}
                <label className="pb-design-fan-color" title="Eigene Farbe">
                  <input
                    type="color"
                    value={localAccent ?? directionAccent}
                    onChange={event => chooseAccent(event.target.value)}
                    aria-label="Eigene Akzentfarbe"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="pb-design-quick-control">
          <button
            type="button"
            className="pb-design-quick-trigger"
            aria-expanded={open === "font"}
            onClick={() => setOpen(value => (value === "font" ? null : "font"))}
          >
            <Type aria-hidden="true" />
            <span>
              <small>Schrift</small>
              <strong>{activeFont}</strong>
            </span>
          </button>
          {open === "font" && (
            <div className="pb-design-fan" data-kind="font">
              <div className="pb-design-fan-head">
                <strong>Schriftkombination</strong>
                <button
                  type="button"
                  aria-label="Schriftauswahl schließen"
                  onClick={() => setOpen(null)}
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="pb-design-fan-fonts">
                <button
                  type="button"
                  data-active={localFontPairId === null || undefined}
                  onClick={() => chooseFont(null)}
                >
                  <strong>Schriften der Richtung</strong>
                  <span>Standard</span>
                </button>
                {FONT_PAIRS.map(pair => (
                  <button
                    key={pair.id}
                    type="button"
                    data-active={localFontPairId === pair.id || undefined}
                    onClick={() => chooseFont(pair.id)}
                  >
                    <strong
                      style={{
                        fontFamily: `"${pair.display.family}", ${pair.display.fallback}`,
                      }}
                    >
                      {pair.label}
                    </strong>
                    <span>{pair.vibe}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {updateTheme.error && (
        <p role="alert" className="pb-design-error">
          {updateTheme.error.message}
        </p>
      )}
    </div>
  );
}

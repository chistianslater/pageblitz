import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { FONT_PAIRS, getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";
import type { DesignProfile } from "@shared/siteContract/designProfile";
import {
  DEFAULT_DESIGN_PROFILE,
  DESIGN_DENSITIES,
  IMAGE_TREATMENTS,
} from "@shared/siteContract/designProfile";
import { ACCENT_CHOICES } from "../themeChoices";
import {
  activeColorWorldId,
  getColorWorlds,
} from "@shared/stylePacks/colorWorlds";

/**
 * Studio-Theme-Editor (2026-08-24): Akzentfarbe + Schriftpaarung unabhängig
 * vom Stil-Pack wechseln. Sektionslayouts sitzen als Buttons in der
 * Vorschau; hier bleiben seitenweite Abstände und Bildwirkung. Auto-Apply:
 * jede Wahl speichert sofort (updateTheme).
 */

/** WCAG-Relative-Luminanz eines #rrggbb-Hexwerts. */
function relLuminance(hex: string): number {
  const c = [1, 3, 5].map(i => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** WCAG-Kontrastverhältnis zweier #rrggbb-Farben (1..21). */
function contrast(a: string, b: string): number {
  const [la, lb] = [relLuminance(a), relLuminance(b)];
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

interface ThemeEditorProps {
  token: string;
  /** Aktives Pack (lokal nachgeführt im StylePanel) — liefert Standard-Akzent und Canvas für den Kontrast-Hinweis. */
  packId: PackId | null;
  /** Gespeicherter Akzent-Override (doc.colorOverrides?.accent). */
  accent: string | null;
  /** Gespeicherte Schriftpaar-ID (doc.fontPairId). */
  fontPairId: string | null;
  /** Kompositionsprofil innerhalb der Designrichtung. */
  designProfile?: DesignProfile | null;
  /** Splash zeigt nur Farbe/Schrift; Layoutdetails bleiben im Studio. */
  showLayoutControls?: boolean;
  /** Gespeicherte colorOverrides des Dokuments — markiert die aktive Farbwelt. */
  colorOverrides?: Record<string, string> | null;
  onApplied: () => void;
}

export function ThemeEditor({
  token,
  packId,
  accent,
  fontPairId,
  designProfile = null,
  showLayoutControls = true,
  colorOverrides = null,
  onApplied,
}: ThemeEditorProps) {
  const updateTheme = trpc.onboardingV2.updateTheme.useMutation();
  // Optimistisch: Chips zeigen die Wahl sofort, der Server-Refetch folgt.
  const [localAccent, setLocalAccent] = useState(accent);
  const [localPairId, setLocalPairId] = useState(fontPairId);
  const [localWorldId, setLocalWorldId] = useState<string>(() =>
    packId ? activeColorWorldId(packId, colorOverrides ?? undefined) : "original"
  );
  const [localProfile, setLocalProfile] = useState<DesignProfile>(
    designProfile ?? DEFAULT_DESIGN_PROFILE
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Beim Wechsel der Designrichtung leitet der Server ein neues Profil ab.
  // StylePanel bleibt dabei gemountet; deshalb den lokalen Editor-Zustand
  // nach dem Parent-Refetch explizit synchronisieren.
  useEffect(() => {
    if (packId)
      setLocalWorldId(activeColorWorldId(packId, colorOverrides ?? undefined));
  }, [packId, colorOverrides]);

  useEffect(() => {
    setLocalProfile(designProfile ?? DEFAULT_DESIGN_PROFILE);
  }, [designProfile]);

  const packAccent = useMemo(() => {
    if (!packId) return null;
    return (
      getConstitution(packId).palette.find(p => p.role === "accent")?.hex ??
      null
    );
  }, [packId]);
  const packCanvas = useMemo(() => {
    if (!packId) return null;
    return (
      getConstitution(packId).palette.find(p => p.role === "canvas")?.hex ??
      null
    );
  }, [packId]);

  // Alle Paar-Schriften einmalig laden, damit die Chips in ihrer eigenen
  // Typografie rendern (idempotent über data-Attribut, wie SitePage).
  useEffect(() => {
    const families = Array.from(
      new Set(FONT_PAIRS.flatMap(p => [p.display.googleCss, p.body.googleCss]))
    );
    const href = `https://fonts.googleapis.com/css2?${families
      .map(f => `family=${f}`)
      .join("&")}&display=swap`;
    if (document.querySelector(`link[data-pb-fontpairs="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-pb-fontpairs", href);
    document.head.appendChild(link);
  }, []);

  const save = (patch: {
    accent?: string | null;
    fontPairId?: string | null;
    designProfile?: DesignProfile;
    colorWorldId?: string | null;
    colorWorldBase?: string;
  }) => updateTheme.mutate({ token, ...patch }, { onSuccess: onApplied });

  const pickWorld = (id: string) => {
    setLocalWorldId(id);
    save({ colorWorldId: id === "original" ? null : id });
  };

  /** Eigene Grundfarbe — Farbwähler feuert kontinuierlich, debounced. */
  const worldDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localWorldBase, setLocalWorldBase] = useState<string | null>(null);
  const pickWorldBase = (hex: string) => {
    setLocalWorldId("eigene");
    setLocalWorldBase(hex);
    if (worldDebounceRef.current) clearTimeout(worldDebounceRef.current);
    worldDebounceRef.current = setTimeout(
      () => save({ colorWorldBase: hex }),
      300
    );
  };

  const pickAccent = (hex: string | null) => {
    setLocalAccent(hex);
    save({ accent: hex });
  };

  /** Farbwähler feuert kontinuierlich — erst 300ms nach der letzten Bewegung speichern. */
  const pickCustom = (hex: string) => {
    setLocalAccent(hex);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save({ accent: hex }), 300);
  };

  const pickPair = (id: string | null) => {
    setLocalPairId(id);
    save({ fontPairId: id });
  };

  const pickProfile = <
    K extends keyof Omit<DesignProfile, "version" | "seed">,
  >(
    key: K,
    value: DesignProfile[K]
  ) => {
    const next = { ...localProfile, [key]: value };
    setLocalProfile(next);
    save({ designProfile: next });
  };

  const busy = updateTheme.isPending;
  // Ehrlicher Hinweis statt Blockade: Akzent fast unsichtbar auf dem
  // Pack-Hintergrund (Buttons würden „verschwinden"). Schwelle 1,6:1 —
  // darunter wirkt selbst eine große Fläche schwach.
  const weakContrast =
    localAccent && packCanvas && contrast(localAccent, packCanvas) < 1.6;

  return (
    <div className="pb-studio-theme">
      <h3 className="pb-studio-theme-title">
        {showLayoutControls
          ? "Farben, Schriften & Abstände"
          : "Farben & Schriften"}
      </h3>
      <p className="pb-studio-theme-hint">
        Feinschliff für die gewählte Designrichtung — Sektionslayouts stellst
        du rechts in der Vorschau um. Jede Auswahl wird sofort übernommen.
      </p>

      {showLayoutControls && (
        <>
          <p className="pb-studio-theme-label" id="pb-theme-rhythm-label">
            Abstände &amp; Bilder
          </p>
          <div
            className="pb-studio-theme-layouts"
            role="group"
            aria-labelledby="pb-theme-rhythm-label"
          >
        <label className="pb-studio-theme-layout">
          <span>Abstände</span>
          <select
            className="pb-studio-input"
            value={localProfile.density}
            disabled={busy}
            onChange={e =>
              pickProfile(
                "density",
                e.target.value as (typeof DESIGN_DENSITIES)[number]
              )
            }
          >
            <option value="airy">Großzügig</option>
            <option value="compact">Kompakt</option>
          </select>
        </label>
        <label className="pb-studio-theme-layout">
          <span>Bildwirkung</span>
          <select
            className="pb-studio-input"
            value={localProfile.imageTreatment}
            disabled={busy}
            onChange={e =>
              pickProfile(
                "imageTreatment",
                e.target.value as (typeof IMAGE_TREATMENTS)[number]
              )
            }
          >
            <option value="natural">Natürlich</option>
            <option value="framed">Gerahmt</option>
            <option value="bleed">Flächig</option>
          </select>
        </label>
          </div>
        </>
      )}

      {packId && (
        <>
          <p className="pb-studio-theme-label" id="pb-theme-world-label">
            Farbwelt
          </p>
          <div
            className="pb-studio-theme-worlds"
            role="group"
            aria-labelledby="pb-theme-world-label"
          >
            {getColorWorlds(packId).map(world => (
              <button
                key={world.id}
                type="button"
                className="pb-studio-theme-world"
                data-active={localWorldId === world.id ? "true" : undefined}
                disabled={busy}
                onClick={() => pickWorld(world.id)}
              >
                <span className="pb-studio-theme-world-dots" aria-hidden="true">
                  {world.swatch.map((hex: string, i: number) => (
                    <i key={i} style={{ background: hex }} />
                  ))}
                </span>
                {world.name}
              </button>
            ))}
            <label
              className="pb-studio-theme-world pb-studio-theme-custom"
              data-active={localWorldId === "eigene" ? "true" : undefined}
              title="Eigene Grundfarbe"
            >
              <input
                type="color"
                value={
                  localWorldBase ??
                  colorOverrides?.canvas ??
                  packCanvas ??
                  "#f5f0e8"
                }
                disabled={busy}
                onChange={e => pickWorldBase(e.target.value)}
                aria-label="Eigene Grundfarbe wählen"
              />
              <span className="pb-studio-theme-color-wheel" aria-hidden="true">
                <Plus />
              </span>
              Eigene
            </label>
          </div>
        </>
      )}

      <p className="pb-studio-theme-label" id="pb-theme-accent-label">
        Akzentfarbe
      </p>
      <div
        className="pb-studio-theme-swatches"
        role="group"
        aria-labelledby="pb-theme-accent-label"
      >
        <button
          type="button"
          className="pb-studio-theme-swatch"
          data-active={localAccent === null ? "true" : undefined}
          disabled={busy}
          onClick={() => pickAccent(null)}
          title="Farbe der Designrichtung"
          aria-label="Farbe der Designrichtung (Standard)"
        >
          <span
            className="pb-studio-theme-dot"
            style={{ background: packAccent ?? "var(--st-line)" }}
          />
          <span className="pb-studio-theme-swatch-name">Richtungsfarbe</span>
        </button>
        {ACCENT_CHOICES.map(c => (
          <button
            key={c.hex}
            type="button"
            className="pb-studio-theme-swatch"
            data-active={
              localAccent?.toLowerCase() === c.hex.toLowerCase()
                ? "true"
                : undefined
            }
            disabled={busy}
            onClick={() => pickAccent(c.hex)}
            title={c.name}
            aria-label={`Akzentfarbe ${c.name}`}
          >
            <span
              className="pb-studio-theme-dot"
              style={{ background: c.hex }}
            />
            <span className="pb-studio-theme-swatch-name">{c.name}</span>
          </button>
        ))}
        <label
          className="pb-studio-theme-swatch pb-studio-theme-custom"
          data-active={
            localAccent &&
            !ACCENT_CHOICES.some(
              c => c.hex.toLowerCase() === localAccent.toLowerCase()
            )
              ? "true"
              : undefined
          }
          title="Eigene Farbe"
        >
          <input
            type="color"
            value={localAccent ?? packAccent ?? "#1D3FBF"}
            disabled={busy}
            onChange={e => pickCustom(e.target.value)}
            aria-label="Eigene Akzentfarbe wählen"
          />
          <span className="pb-studio-theme-color-wheel" aria-hidden="true">
            <Plus />
          </span>
          <span className="pb-studio-theme-swatch-name">Eigene Farbe</span>
        </label>
      </div>
      {weakContrast && (
        <p className="pb-studio-theme-warn" role="status">
          Diese Farbe liegt sehr nah am Hintergrund — Buttons und Hervorhebungen
          wirken schwach.
        </p>
      )}

      <p className="pb-studio-theme-label" id="pb-theme-font-label">
        Schriften
      </p>
      <div
        className="pb-studio-theme-fonts"
        role="group"
        aria-labelledby="pb-theme-font-label"
      >
        <button
          type="button"
          className="pb-studio-theme-font"
          data-active={localPairId === null ? "true" : undefined}
          disabled={busy}
          onClick={() => pickPair(null)}
        >
          <span className="pb-studio-theme-font-name">
            Schriften der Richtung
          </span>
          <span className="pb-studio-theme-font-vibe">Standard</span>
        </button>
        {FONT_PAIRS.map(p => (
          <button
            key={p.id}
            type="button"
            className="pb-studio-theme-font"
            data-active={localPairId === p.id ? "true" : undefined}
            disabled={busy}
            onClick={() => pickPair(p.id)}
          >
            <span
              className="pb-studio-theme-font-name"
              style={{
                fontFamily: `"${p.display.family}", ${p.display.fallback}`,
              }}
            >
              {p.label}
            </span>
            <span
              className="pb-studio-theme-font-vibe"
              style={{ fontFamily: `"${p.body.family}", ${p.body.fallback}` }}
            >
              {p.vibe}
            </span>
          </button>
        ))}
      </div>
      {updateTheme.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateTheme.error.message}
        </p>
      )}
    </div>
  );
}

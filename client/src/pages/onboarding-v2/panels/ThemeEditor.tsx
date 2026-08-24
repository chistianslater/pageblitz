import React, { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { FONT_PAIRS, getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";

/**
 * Studio-Theme-Editor (2026-08-24): Akzentfarbe + Schriftpaarung unabhängig
 * vom Stil-Pack wechseln. User-Entscheide: kuratierte Palette + optional
 * eigener Akzent per Farbwähler; kuratierte Schriftpaare aus dem Font-Pool
 * der 14 Packs. Wie das Fotos-Panel gilt Auto-Apply: jede Wahl speichert
 * sofort (updateTheme) und bumped über onApplied die Live-Vorschau.
 */

/** Kuratierte Akzente — allesamt erprobte Pack-Farben (shared/stylePacks). */
const ACCENT_CHOICES: readonly { hex: string; name: string }[] = [
  { hex: "#1D3FBF", name: "Royal" },
  { hex: "#2E7E78", name: "Teal" },
  { hex: "#4A6741", name: "Blattgrün" },
  { hex: "#5E1F22", name: "Bordeaux" },
  { hex: "#E0301E", name: "Signalrot" },
  { hex: "#FF4D00", name: "Orange" },
  { hex: "#A8532F", name: "Terrakotta" },
  { hex: "#C99B4A", name: "Gold" },
  { hex: "#D4749C", name: "Rosa" },
  { hex: "#7A5F2E", name: "Bronze" },
];

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
  onApplied: () => void;
}

export function ThemeEditor({
  token,
  packId,
  accent,
  fontPairId,
  onApplied,
}: ThemeEditorProps) {
  const updateTheme = trpc.onboardingV2.updateTheme.useMutation();
  // Optimistisch: Chips zeigen die Wahl sofort, der Server-Refetch folgt.
  const [localAccent, setLocalAccent] = useState(accent);
  const [localPairId, setLocalPairId] = useState(fontPairId);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }) => updateTheme.mutate({ token, ...patch }, { onSuccess: onApplied });

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

  const busy = updateTheme.isPending;
  // Ehrlicher Hinweis statt Blockade: Akzent fast unsichtbar auf dem
  // Pack-Hintergrund (Buttons würden „verschwinden"). Schwelle 1,6:1 —
  // darunter wirkt selbst eine große Fläche schwach.
  const weakContrast =
    localAccent && packCanvas && contrast(localAccent, packCanvas) < 1.6;

  return (
    <div className="pb-studio-theme">
      <h3 className="pb-studio-theme-title">Farben &amp; Schriften</h3>
      <p className="pb-studio-theme-hint">
        Feinschliff für den gewählten Stil — jede Auswahl wird sofort
        übernommen.
      </p>

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
          title="Stilfarbe"
          aria-label="Stilfarbe (Standard des Stils)"
        >
          <span
            className="pb-studio-theme-dot"
            style={{ background: packAccent ?? "var(--st-line)" }}
          />
          <span className="pb-studio-theme-swatch-name">Stilfarbe</span>
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
          <span className="pb-studio-theme-swatch-name">Eigene</span>
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
          <span className="pb-studio-theme-font-name">Stil-Schriften</span>
          <span className="pb-studio-theme-font-vibe">Standard des Stils</span>
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

import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { PackId } from "@shared/siteContract/types";
import type { DesignProfile } from "@shared/siteContract/designProfile";
import {
  DEFAULT_DESIGN_PROFILE,
  DESIGN_DENSITIES,
  IMAGE_TREATMENTS,
} from "@shared/siteContract/designProfile";
import { DesignQuickControls } from "../DesignQuickControls";

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
  const [localProfile, setLocalProfile] = useState(
    designProfile ?? DEFAULT_DESIGN_PROFILE
  );
  useEffect(
    () => setLocalProfile(designProfile ?? DEFAULT_DESIGN_PROFILE),
    [designProfile]
  );
  const busy = updateTheme.isPending;
  const pickProfile = <K extends keyof Omit<DesignProfile, "version" | "seed">>(
    key: K,
    value: DesignProfile[K]
  ) => {
    const next = { ...localProfile, [key]: value };
    setLocalProfile(next);
    updateTheme.mutate(
      { token, designProfile: next },
      { onSuccess: onApplied }
    );
  };
  return (
    <div className="pb-studio-theme">
      <h3 className="pb-studio-theme-title">
        Farben, Schriften &amp; Abstände
      </h3>
      <p className="pb-studio-theme-hint">
        Dieselben abgestimmten Farben und Schriften wie beim Start. Jede Auswahl
        wird direkt übernommen.
      </p>
      {packId && (
        <DesignQuickControls
          token={token}
          packId={packId}
          accent={accent}
          fontPairId={fontPairId}
          colorOverrides={colorOverrides ?? undefined}
          onApplied={onApplied}
        />
      )}
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

      {updateTheme.error && <p role="alert">{updateTheme.error.message}</p>}
    </div>
  );
}

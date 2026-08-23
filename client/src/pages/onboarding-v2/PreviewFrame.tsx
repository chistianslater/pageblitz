import React from "react";
import type { PackId } from "@shared/siteContract/types";

interface PreviewFrameProps {
  token: string;
  version: number;
  device: "desktop" | "mobile";
  packOverride?: PackId;
  /** Unterseiten-Vorschau (Plan B6 Task 5): Slug der Page → `/preview-ssr/<token>/<slug>`; ohne → Startseite. */
  pageSlug?: string;
  /**
   * Zeitmaschine (Plan B7 Task 4): true → `?reveal=1` an die Vorschau-URL —
   * das SSR-HTML fadet seine Sektionen nacheinander ein (nur Preview-Modus,
   * siehe server/ssr/renderSite.tsx). StudioPage setzt das genau für den
   * ersten Load nach einer frisch beobachteten Generierung.
   */
  reveal?: boolean;
}

/** Pfad der Vorschau (Startseite oder Unterseite) — von PreviewFrame und "In neuem Tab öffnen" geteilt. */
export function previewPath(token: string, pageSlug?: string): string {
  return pageSlug
    ? `/preview-ssr/${token}/${pageSlug}`
    : `/preview-ssr/${token}`;
}

export function PreviewFrame({
  token,
  version,
  device,
  packOverride,
  pageSlug,
  reveal,
}: PreviewFrameProps) {
  const params = new URLSearchParams();
  if (packOverride) params.set("pack", packOverride);
  if (reveal) params.set("reveal", "1");
  params.set("v", String(version)); // Cache-Bust nach jedem Patch (Server ist ohnehin no-store)
  const src = `${previewPath(token, pageSlug)}?${params.toString()}`;
  return (
    <div className="pb-studio-device" data-device={device}>
      <iframe
        key={src}
        src={src}
        title="Live-Vorschau deiner Website"
        loading="eager"
      />
    </div>
  );
}

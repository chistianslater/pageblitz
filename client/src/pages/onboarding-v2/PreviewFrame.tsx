import React from "react";
import type { PackId } from "@shared/siteContract/types";

interface PreviewFrameProps {
  token: string;
  version: number;
  device: "desktop" | "mobile";
  packOverride?: PackId;
  /** Unterseiten-Vorschau (Plan B6 Task 5): Slug der Page → `/preview-ssr/<token>/<slug>`; ohne → Startseite. */
  pageSlug?: string;
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
}: PreviewFrameProps) {
  const params = new URLSearchParams();
  if (packOverride) params.set("pack", packOverride);
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

import React from "react";
import type { PackId } from "@shared/siteContract/types";

interface PreviewFrameProps {
  token: string;
  version: number;
  device: "desktop" | "mobile";
  packOverride?: PackId;
}

export function PreviewFrame({
  token,
  version,
  device,
  packOverride,
}: PreviewFrameProps) {
  const params = new URLSearchParams();
  if (packOverride) params.set("pack", packOverride);
  params.set("v", String(version)); // Cache-Bust nach jedem Patch (Server ist ohnehin no-store)
  const src = `/preview-ssr/${token}?${params.toString()}`;
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

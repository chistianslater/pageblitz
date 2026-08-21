import React from "react";
import { getConstitution, toCssVars } from "../../../../shared/stylePacks";
import type {
  PackId,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";

export const SiteRenderer: React.FC<{
  data: WebsiteDataV2;
  basePath?: string;
  now?: Date;
  /**
   * Erzwingt ein anderes registriertes Pack für die Darstellung (Variant-
   * Picker-Preview) — Inhalte (`data`) bleiben unverändert, nur die
   * Verfassung + das Renderer-Modul wechseln. Ein nicht registrierter
   * Override wird ignoriert; dann bleibt der gespeicherte `data.stylePackId`
   * aktiv.
   */
  packOverride?: PackId;
}> = ({ data, basePath = "", now = new Date(), packOverride }) => {
  const effectiveData =
    packOverride && PACK_MODULES[packOverride]
      ? { ...data, stylePackId: packOverride }
      : data;
  const mod = PACK_MODULES[effectiveData.stylePackId];
  if (!mod)
    throw new Error(
      `Pack-Modul nicht registriert: ${effectiveData.stylePackId}`
    );
  const vars = toCssVars(
    getConstitution(effectiveData.stylePackId),
    effectiveData.colorOverrides
  );
  return (
    <div
      className={`pb-site pb-${effectiveData.stylePackId}`}
      style={vars as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: mod.css }} />
      <mod.Page data={effectiveData} basePath={basePath} now={now} />
    </div>
  );
};

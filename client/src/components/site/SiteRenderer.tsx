import React from "react";
import { getConstitution, toCssVars } from "../../../../shared/stylePacks";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { PACK_MODULES } from "./packRegistry";

export const SiteRenderer: React.FC<{
  data: WebsiteDataV2;
  basePath?: string;
  now?: Date;
}> = ({ data, basePath = "", now = new Date() }) => {
  const mod = PACK_MODULES[data.stylePackId];
  if (!mod)
    throw new Error(`Pack-Modul nicht registriert: ${data.stylePackId}`);
  const vars = toCssVars(
    getConstitution(data.stylePackId),
    data.colorOverrides
  );
  return (
    <div
      className={`pb-site pb-${data.stylePackId}`}
      style={vars as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: mod.css }} />
      <mod.Page data={data} basePath={basePath} now={now} />
    </div>
  );
};

import React from "react";
import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "./engine";
import { rich } from "./richText";

/**
 * Saison-/Aktionshinweis (2026-08-31): schmaler Akzent-Balken GANZ OBEN,
 * über der Pack-Navigation — deshalb rendert ihn `SiteRenderer` zentral
 * vor `mod.Page` (die Pack-Switches geben für "notice" null zurück, der
 * Banner gehört nicht in den Sektionsfluss und nie in die Navigation).
 * Respektiert hiddenSections; faktenfrei, von der KI hinzufüg-/entfernbar.
 */
export function NoticeBanner({ data }: { data: WebsiteDataV2 }) {
  if (data.hiddenSections?.includes("notice")) return null;
  const notice = data.sections.find(
    (s): s is SectionOf<"notice"> => s.type === "notice"
  );
  if (!notice) return null;
  return (
    <div id={SECTION_ANCHORS.notice} className="pb-notice" role="note">
      <p>{rich(notice.text)}</p>
    </div>
  );
}

/** Wird von SiteRenderer an jedes Pack-CSS angehängt (wie STORY_CSS). */
export const NOTICE_CSS = `
.pb-notice{background:var(--pb-accent);color:var(--pb-accent-contrast,#fff);padding:9px 20px;text-align:center}
.pb-notice p{margin:0;font-family:var(--pb-font-body);font-size:.92rem;line-height:1.5;font-weight:600}
`;

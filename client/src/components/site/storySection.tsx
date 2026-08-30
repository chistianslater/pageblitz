import React from "react";
import type { SectionOf } from "../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "./engine";
import { rich } from "./richText";

/**
 * Erzähl-Sektion („Unsere Geschichte", 2026-08-30): die einzige Sektion, die
 * der KI-Chat hinzufügen/entfernen darf. Sie wird ZENTRAL gerendert — ein
 * Markup + ein CSS-Block für alle 20 Packs — und zieht ihren Look komplett
 * aus den Pack-Designvariablen (--pb-canvas/-ink/-accent/-font-*), die
 * `toCssVars` am `.pb-site`-Root setzt. So braucht ein neues Pack keinen
 * eigenen story-Case über die eine Zeile im Sektions-Switch hinaus.
 */
export function StorySection({ section }: { section: SectionOf<"story"> }) {
  const paragraphs = section.body
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);
  return (
    <section id={SECTION_ANCHORS.story} className="pb-story">
      <div className="pb-story-inner">
        <span className="pb-story-rule" aria-hidden="true" />
        <h2>{rich(section.headline)}</h2>
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{rich(paragraph)}</p>
        ))}
      </div>
    </section>
  );
}

/** Wird von SiteRenderer an jedes Pack-CSS angehängt (wie RICH_TEXT_CSS). */
export const STORY_CSS = `
.pb-story{padding:clamp(52px,8vw,96px) 24px;background:var(--pb-canvas);color:var(--pb-ink)}
.pb-story-inner{max-width:680px;margin:0 auto}
.pb-story-rule{display:block;width:56px;height:3px;background:var(--pb-accent);margin-bottom:22px}
.pb-story h2{margin:0 0 0.75em;font-family:var(--pb-font-display);font-size:clamp(1.7rem,3.4vw,2.4rem);line-height:1.15;color:var(--pb-ink)}
.pb-story p{margin:0 0 1em;font-family:var(--pb-font-body);font-size:1.05rem;line-height:1.75;color:var(--pb-ink)}
.pb-story p:last-child{margin-bottom:0}
`;

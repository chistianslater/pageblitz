import React from "react";
import type { SectionOf } from "../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "./engine";
import { rich } from "./richText";

/**
 * Vorteile/USP-Sektion (2026-08-31): 2–6 Punkte mit Akzent-Häkchen —
 * zentral gerendert über die Pack-Designvariablen, ein Case je Pack
 * (Muster: storySection.tsx). Faktenfrei, daher von der KI
 * hinzufüg-/entfernbar.
 */
export function UspSection({ section }: { section: SectionOf<"usp"> }) {
  return (
    <section id={SECTION_ANCHORS.usp} className="pb-usp">
      <div className="pb-usp-inner">
        {section.headline && <h2>{rich(section.headline)}</h2>}
        <ul>
          {section.items.map(item => (
            <li key={item.title}>
              <span className="pb-usp-check" aria-hidden="true">
                ✓
              </span>
              <div>
                <strong>{item.title}</strong>
                {item.text && <p>{rich(item.text)}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Wird von SiteRenderer an jedes Pack-CSS angehängt (wie STORY_CSS). */
export const USP_CSS = `
.pb-usp{padding:clamp(48px,7vw,88px) 24px;background:var(--pb-canvas);color:var(--pb-ink)}
.pb-usp-inner{max-width:1020px;margin:0 auto}
.pb-usp h2{margin:0 0 1.1em;font-family:var(--pb-font-display);font-size:clamp(1.6rem,3vw,2.2rem);line-height:1.15;color:var(--pb-ink)}
.pb-usp ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:clamp(18px,3vw,34px)}
.pb-usp li{display:flex;gap:12px;align-items:flex-start}
.pb-usp-check{flex:none;display:grid;place-items:center;width:26px;height:26px;margin-top:1px;border-radius:50%;background:var(--pb-accent);color:var(--pb-accent-contrast,#fff);font-size:.85rem;font-weight:700}
.pb-usp li strong{display:block;font-family:var(--pb-font-body);font-weight:700;font-size:1.02rem;line-height:1.35}
.pb-usp li p{margin:.3em 0 0;font-family:var(--pb-font-body);font-size:.95rem;line-height:1.6;color:var(--pb-muted,var(--pb-ink))}
`;

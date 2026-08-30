import React from "react";
import type { SectionOf } from "../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "./engine";
import { rich } from "./richText";

/**
 * Zahlen / Ablauf / Zitat (2026-08-31): drei weitere faktenfreie
 * Zusatz-Sektionen im Zentral-Muster (storySection.tsx) — ein Markup +
 * CSS über die Pack-Designvariablen, je Pack nur ein Case im Switch.
 * Alle drei sind von der KI hinzufüg-/entfernbar (aiEditFacts).
 */

/** Zahlen-Band: „25+ Jahre / 500 Projekte" — Wert groß, Label klein. */
export function StatsSection({ section }: { section: SectionOf<"stats"> }) {
  return (
    <section id={SECTION_ANCHORS.stats} className="pb-stats">
      <div className="pb-stats-inner">
        {section.headline && <h2>{rich(section.headline)}</h2>}
        <dl>
          {section.items.map(item => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Ablauf: nummerierte Schritte („So läuft's"). */
export function ProcessSection({
  section,
}: {
  section: SectionOf<"process">;
}) {
  return (
    <section id={SECTION_ANCHORS.process} className="pb-process">
      <div className="pb-process-inner">
        {section.headline && <h2>{rich(section.headline)}</h2>}
        <ol>
          {section.steps.map((step, i) => (
            <li key={step.title}>
              <span className="pb-process-num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <strong>{step.title}</strong>
                {step.text && <p>{rich(step.text)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Großes Pull-Quote mit optionalem Urheber. */
export function QuoteSection({ section }: { section: SectionOf<"quote"> }) {
  return (
    <section id={SECTION_ANCHORS.quote} className="pb-quote">
      <figure>
        <span className="pb-quote-mark" aria-hidden="true">
          „
        </span>
        <blockquote>{rich(section.text)}</blockquote>
        {section.author && <figcaption>— {section.author}</figcaption>}
      </figure>
    </section>
  );
}

/** Wird von SiteRenderer an jedes Pack-CSS angehängt (wie STORY_CSS). */
export const EXTRA_SECTIONS_CSS = `
.pb-stats{padding:clamp(40px,6vw,72px) 24px;background:var(--pb-canvas);color:var(--pb-ink)}
.pb-stats-inner{max-width:1020px;margin:0 auto}
.pb-stats h2{margin:0 0 1em;font-family:var(--pb-font-display);font-size:clamp(1.5rem,2.8vw,2rem);line-height:1.15}
.pb-stats dl{margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:clamp(16px,3vw,32px);text-align:center}
.pb-stats dl>div{display:flex;flex-direction:column-reverse;gap:4px}
.pb-stats dd{margin:0;font-family:var(--pb-font-display);font-size:clamp(2rem,4.5vw,3.2rem);line-height:1.05;color:var(--pb-accent-text)}
.pb-stats dt{font-family:var(--pb-font-body);font-size:.92rem;color:var(--pb-muted,var(--pb-ink))}
.pb-process{padding:clamp(48px,7vw,88px) 24px;background:var(--pb-canvas);color:var(--pb-ink)}
.pb-process-inner{max-width:860px;margin:0 auto}
.pb-process h2{margin:0 0 1.1em;font-family:var(--pb-font-display);font-size:clamp(1.6rem,3vw,2.2rem);line-height:1.15}
.pb-process ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:clamp(18px,3vw,28px)}
.pb-process li{display:flex;gap:16px;align-items:flex-start}
.pb-process-num{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--pb-accent);color:var(--pb-accent-contrast,#fff);font-family:var(--pb-font-display);font-size:1.05rem;font-weight:700}
.pb-process li strong{display:block;font-family:var(--pb-font-body);font-weight:700;font-size:1.05rem;line-height:1.4;padding-top:5px}
.pb-process li p{margin:.35em 0 0;font-family:var(--pb-font-body);font-size:.95rem;line-height:1.6;color:var(--pb-muted,var(--pb-ink))}
.pb-quote{padding:clamp(48px,7vw,88px) 24px;background:var(--pb-canvas);color:var(--pb-ink)}
.pb-quote figure{position:relative;max-width:760px;margin:0 auto;text-align:center}
.pb-quote-mark{position:absolute;left:50%;top:-.35em;transform:translateX(-50%);font-family:var(--pb-font-display);font-size:clamp(4rem,9vw,6.5rem);line-height:1;color:var(--pb-accent);opacity:.35;pointer-events:none}
.pb-quote blockquote{margin:0;font-family:var(--pb-font-display);font-style:italic;font-size:clamp(1.35rem,2.8vw,2rem);line-height:1.4}
.pb-quote figcaption{margin-top:14px;font-family:var(--pb-font-body);font-size:.95rem;color:var(--pb-muted,var(--pb-ink))}
`;

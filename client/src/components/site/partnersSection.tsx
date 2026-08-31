import React from "react";
import type { SectionOf } from "../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "./engine";
import { rich } from "./richText";

/**
 * Partner/Zertifikate (2026-08-31): Logo-Leiste — zentral gerendert wie
 * storySection.tsx (ein Markup + CSS für alle 20 Packs, Look aus den
 * Pack-Designvariablen). Logos kommen ausschließlich aus dem Fotos-Panel
 * (uploadLogo, WebP mit Transparenz); die KI legt die Sektion nie an.
 * Logos stehen dezent entsättigt da und färben sich beim Hover.
 */
export function PartnersSection({
  section,
}: {
  section: SectionOf<"partners">;
}) {
  return (
    <section id={SECTION_ANCHORS.partners} className="pb-partners">
      <div className="pb-partners-inner">
        <h2>{rich(section.headline ?? "Partner & Zertifikate")}</h2>
        <ul className="pb-partners-row">
          {section.items.map(item => {
            const media = (
              <>
                <span className="pb-partners-logo">
                  <img src={item.imageUrl} alt={item.name} loading="lazy" />
                </span>
                <span className="pb-partners-name">{item.name}</span>
              </>
            );
            return (
              <li key={item.imageUrl}>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer noopener">
                    {media}
                  </a>
                ) : (
                  media
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Wird von SiteRenderer an jedes Pack-CSS angehängt (wie STORY_CSS). */
export const PARTNERS_CSS = `
.pb-partners{padding:clamp(44px,6vw,80px) 24px;background:var(--pb-canvas);color:var(--pb-ink)}
.pb-partners-inner{max-width:960px;margin:0 auto;text-align:center}
.pb-partners h2{margin:0 0 clamp(22px,3vw,36px);font-family:var(--pb-font-display);font-size:clamp(1.3rem,2.4vw,1.8rem);line-height:1.2;color:var(--pb-ink)}
.pb-partners-row{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(18px,4vw,44px)}
.pb-partners-row li{display:block}
.pb-partners-row a{display:block;text-decoration:none;color:inherit}
.pb-partners-logo{display:flex;align-items:center;justify-content:center;height:64px;width:clamp(110px,14vw,150px)}
.pb-partners-logo img{max-height:100%;max-width:100%;object-fit:contain;filter:grayscale(1);opacity:.72;transition:filter .25s ease,opacity .25s ease}
.pb-partners-row li:hover .pb-partners-logo img{filter:none;opacity:1}
.pb-partners-name{display:block;margin-top:8px;font-family:var(--pb-font-body);font-size:.78rem;letter-spacing:.04em;color:var(--pb-ink);opacity:.65}
@media(prefers-reduced-motion:reduce){.pb-partners-logo img{transition:none}}
`;

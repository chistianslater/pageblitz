/**
 * Abschnitte, die zu den Einstiegen „Bühne"/„Farbfläche" gehören
 * (2026-10-05). Die Packs rendern ihre Leistungen sonst selbst; für die
 * neuen Einstiege gibt es eine gemeinsame Liste — nummeriert (Bühne) bzw.
 * als Karte wie im Café (Farbfläche). Farben und Schriften kommen weiter aus
 * den Pack-Variablen.
 */
import React, { createContext, useContext } from "react";
import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../shared/siteContract/types";
import { artComposition } from "../../../../../shared/stylePacks/artDirection";
import { SECTION_ANCHORS } from "../engine";
import { LAYOUT_SLOT } from "../layoutSlots";
import { rich } from "../richText";

export type EntryComposition = "stage" | "colorfield";

/**
 * Gilt der neue Einstieg? Nur solange das Hero-Layout dazu passt — wählt der
 * Kunde im Studio ein anderes Layout, greift wieder der Pack-Look.
 */
export function activeEntry(
  data: WebsiteDataV2
): EntryComposition | undefined {
  if (data.designRevision !== 2) return undefined;
  const profile = data.designProfile;
  const hero = data.sections.find(s => s.type === "hero");
  const hasImage =
    Boolean(hero && "imageUrl" in hero && hero.imageUrl) &&
    !profile?.hiddenElements?.includes("hero-media");
  if (!hasImage) return undefined;
  const preferred = artComposition(data);
  if (preferred === "stage" && profile?.heroLayout === "banner") return "stage";
  if (preferred === "colorfield" && profile?.heroLayout === "collage")
    return "colorfield";
  return undefined;
}

export const EntryContext = createContext<EntryComposition | undefined>(
  undefined
);

function EntryServices({
  section,
  entry,
}: {
  section: SectionOf<"services">;
  entry: EntryComposition;
}) {
  return (
    <section
      id={SECTION_ANCHORS.services}
      className="pb-entry-services"
      data-entry={entry}
    >
      <header className="pb-entry-head">
        <h2>{rich(section.headline ?? "Leistungen")}</h2>
        {section.intro && <p>{rich(section.intro)}</p>}
      </header>
      <ol className="pb-entry-list" data-pb-slot={LAYOUT_SLOT.servicesItems}>
        {section.items.map((item, i) => (
          <li key={item.title}>
            <span className="pb-entry-index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="pb-entry-copy">
              <h3>{item.title}</h3>
              {item.description && <p>{rich(item.description)}</p>}
            </div>
            {item.price && <span className="pb-entry-price">{item.price}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Wählt zur Renderzeit zwischen Pack-Leistungen und Einstiegs-Leistungen.
 * Als Komponente, weil nur so der Kontext lesbar ist — die Packs rufen
 * `renderSection` als Funktion auf.
 */
export function EntryServicesSwitch({
  section,
  fallback,
  decorate,
}: {
  section: SectionOf<"services">;
  fallback: () => React.ReactNode;
  decorate: (node: React.ReactNode) => React.ReactNode;
}) {
  const entry = useContext(EntryContext);
  return (
    <>
      {decorate(
        entry ? <EntryServices section={section} entry={entry} /> : fallback()
      )}
    </>
  );
}

const S = '.pb-site[data-pb-revision="2"]';
const INLINE =
  "max(var(--pb-shell-pad,6.5%),calc((100% - var(--pb-shell-outer,1600px))/2 + var(--pb-shell-pad,6.5%)))";

export const ENTRY_SECTIONS_CSS = `
${S} .pb-entry-services{box-sizing:border-box;padding:clamp(72px,9vw,140px) ${INLINE};color:var(--pb-ink);background:var(--pb-canvas)}
${S} .pb-entry-head h2{margin:0;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,500);color:var(--pb-ink)}
${S} .pb-entry-head p{margin:18px 0 0;max-width:42ch;color:var(--pb-muted);font:400 clamp(1rem,1.2vw,1.15rem)/1.6 var(--pb-font-body)}
${S} .pb-entry-list{list-style:none;margin:0;padding:0}
${S} .pb-entry-list li{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:8px 18px;align-items:baseline;padding:26px 0;border-bottom:1px solid var(--pb-line)}
${S} .pb-entry-index{font:500 13px/1 var(--pb-font-body);color:var(--pb-art-accent-text,var(--pb-accent));letter-spacing:.06em}
${S} .pb-entry-copy h3{margin:0;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,600);font-size:clamp(1.35rem,2vw,1.9rem);line-height:1.15;letter-spacing:-.02em;color:var(--pb-ink)}
${S} .pb-entry-copy p{margin:8px 0 0;max-width:56ch;color:var(--pb-muted);font:400 16px/1.55 var(--pb-font-body)}
${S} .pb-entry-price{font:600 15px/1.3 var(--pb-font-body);white-space:nowrap;color:var(--pb-ink)}
${S} .pb-entry-services[data-entry="stage"]{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,6vw,96px);align-items:start}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-head{position:sticky;top:110px}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-head h2{font-size:clamp(2.6rem,5.4vw,5.6rem);line-height:.98;letter-spacing:-.045em}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-list{border-top:1px solid var(--pb-line)}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-head{margin-bottom:clamp(32px,4vw,56px)}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-head h2{font-size:clamp(2.4rem,4.6vw,4.6rem);line-height:1.02;letter-spacing:-.035em}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(32px,6vw,96px)}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-list li{grid-template-columns:minmax(0,1fr) auto;border-bottom:1.5px dotted color-mix(in srgb,var(--pb-ink) 30%,transparent)}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-index{display:none}
/* Die Layout-Varianten (designProfileCss, mit !important) gelten den
   Pack-Listen; die Einstiegsliste hat ihre eigene Ordnung. */
${S} #leistungen.pb-entry-services .pb-entry-list[data-pb-slot]{display:block!important;gap:0!important;background:transparent!important}
${S} #leistungen.pb-entry-services[data-entry="colorfield"] .pb-entry-list[data-pb-slot]{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:clamp(32px,6vw,96px)!important;row-gap:0!important}
${S} #leistungen.pb-entry-services .pb-entry-list[data-pb-slot]>li{grid-column:auto!important;width:auto!important}
@media(max-width:760px){
${S} #leistungen.pb-entry-services[data-entry="colorfield"] .pb-entry-list[data-pb-slot]{grid-template-columns:1fr!important}
${S} .pb-entry-services{padding:64px var(--pb-shell-pad,6%)}
${S} .pb-entry-services[data-entry="stage"]{grid-template-columns:1fr;gap:28px}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-head{position:static}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-list{grid-template-columns:1fr}
${S} .pb-entry-list li{grid-template-columns:36px minmax(0,1fr);padding:22px 0}
${S} .pb-entry-price{grid-column:2}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-list li{grid-template-columns:minmax(0,1fr)}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-price{grid-column:1}
}
`;

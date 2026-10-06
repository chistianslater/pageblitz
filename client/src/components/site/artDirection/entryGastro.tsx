/**
 * Bauplan Gastro (2026-10-06): Speisekarte als Tafel, Platzhalter in der
 * Vorschau und die belegten Google-Angaben für die Leiste unter dem
 * Einstieg. Erfunden wird nichts — die Karte erscheint live erst, wenn der
 * Betrieb sie im Studio einträgt (Extra „Speisekarte").
 */
import React from "react";
import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../engine";
import { rich } from "../richText";
import type { EntryState } from "./entrySections";

export type TrustFact = { value: string; label: string };

/** Ist eine echte Speisekarte sichtbar (Abschnitt + gebuchtes Extra)? */
export function menuVisible(data: WebsiteDataV2): boolean {
  return (
    data.sections.some(s => s.type === "menu") &&
    data.addOns?.menu === true &&
    !data.hiddenSections?.includes("menu")
  );
}

/** Zeigt die Vorschau den Karten-Platzhalter? */
export function menuPlaceholderShown(state: EntryState): boolean {
  return (
    state.preview &&
    state.blueprint.placeholders.includes("menu") &&
    !menuVisible(state.data)
  );
}

/** Zweiter Knopf im Einstieg: zur Karte (echt oder Platzhalter). */
export function menuLink(
  state: EntryState | undefined
): { label: string; href: string } | undefined {
  if (state?.blueprint.id !== "gastro") return undefined;
  const label = state.blueprint.navLabels?.menu ?? "Speisekarte";
  if (menuVisible(state.data) || menuPlaceholderShown(state))
    return { label, href: `#${SECTION_ANCHORS.menu}` };
  if (state.data.sections.some(s => s.type === "services"))
    return {
      label: state.blueprint.navLabels?.services ?? "Sortiment",
      href: `#${SECTION_ANCHORS.services}`,
    };
  return undefined;
}

/** Belegte Google-Angaben als Leiste — fehlende Angaben bleiben weg. */
export function gastroTrustFacts(data: WebsiteDataV2): TrustFact[] {
  const a = data.amenities ?? {};
  const facts: TrustFact[] = [];
  if (a.reservable) facts.push({ value: "Reservierung", label: "möglich" });
  if (a.breakfast) facts.push({ value: "Frühstück", label: "wird serviert" });
  if (a.takeout)
    facts.push({ value: "Zum Mitnehmen", label: "auch außer Haus" });
  if (a.delivery) facts.push({ value: "Lieferung", label: "wird angeboten" });
  if (a.vegetarian)
    facts.push({ value: "Vegetarisch", label: "Auswahl vorhanden" });
  if (a.wheelchair)
    facts.push({ value: "Barrierefrei", label: "rollstuhlgerechter Eingang" });
  if (facts.length < 3 && data.google && data.google.reviewCount > 0)
    facts.push({
      value: data.google.reviewCount.toLocaleString("de-DE"),
      label: "Bewertungen auf Google",
    });
  return facts.slice(0, 4);
}

/** Echte Speisekarte im Tafel-Look. */
export function EntryMenu({
  section,
  state,
}: {
  section: SectionOf<"menu">;
  state: EntryState;
}) {
  return (
    <section
      id={SECTION_ANCHORS.menu}
      className="pb-entry-menu"
      data-entry={state.entry}
    >
      <div className="pb-entry-board">
        <h2>{rich(section.headline ?? "Speisekarte")}</h2>
        <div className="pb-entry-board-cols">
          {section.categories.map(category => (
            <div key={category.name} className="pb-entry-board-cat">
              <h3>{category.name}</h3>
              <ul>
                {category.items.map(item => (
                  <li key={item.name}>
                    <span className="pb-entry-board-name">
                      {item.name}
                      {item.description && <small>{item.description}</small>}
                    </span>
                    <span className="pb-entry-board-price">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Platzhalter nur in der Vorschau: zeigt, wo die Karte hinkommt. */
export function EntryMenuPlaceholder({ state }: { state: EntryState }) {
  const title = state.blueprint.headlines.menu ?? "Speisekarte";
  return (
    <section
      id={SECTION_ANCHORS.menu}
      className="pb-entry-menu"
      data-entry={state.entry}
      data-placeholder="yes"
    >
      <aside className="pb-entry-board" aria-label={title}>
        <span className="pb-entry-placeholder-tag">Nur in deiner Vorschau</span>
        <h2>{title}</h2>
        <p className="pb-entry-board-note">
          {state.blueprint.placeholderText.menu}
        </p>
        <div className="pb-entry-board-cols" aria-hidden="true">
          {[0, 1].map(col => (
            <div key={col} className="pb-entry-board-cat">
              <i className="pb-entry-board-bar" data-w="cat" />
              {[0, 1, 2, 3].map(row => (
                <span key={row} className="pb-entry-board-row">
                  <i className="pb-entry-board-bar" />
                  <i className="pb-entry-board-bar" data-w="price" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

const S = '.pb-site[data-pb-revision="2"]';
const INLINE =
  "max(var(--pb-shell-pad,6.5%),calc((100% - var(--pb-shell-outer,1600px))/2 + var(--pb-shell-pad,6.5%)))";

export const ENTRY_GASTRO_CSS = `
${S} .pb-entry-menu{box-sizing:border-box;padding:clamp(64px,8vw,128px) ${INLINE};background:var(--pb-canvas);color:var(--pb-ink)}
${S} .pb-entry-board{position:relative;max-width:1100px;margin:0 auto;padding:clamp(32px,5vw,72px) clamp(22px,5vw,80px);border:2px solid var(--pb-ink);outline:1px solid var(--pb-ink);outline-offset:-10px;text-align:center}
${S} .pb-entry-board h2{margin:0;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,500);font-size:clamp(2.2rem,4.4vw,4.2rem);line-height:1;letter-spacing:-.03em;color:var(--pb-ink)}
${S} .pb-entry-board-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:clamp(28px,4vw,64px);margin-top:clamp(28px,4vw,48px);text-align:left}
${S} .pb-entry-board-cat h3{margin:0 0 14px;font:600 13px/1 var(--pb-font-body);letter-spacing:.14em;text-transform:uppercase;color:var(--pb-art-accent-text,var(--pb-accent))}
${S} .pb-entry-board-cat ul{list-style:none;margin:0;padding:0}
${S} .pb-entry-board-cat li{display:flex;align-items:baseline;gap:10px;padding:10px 0;border-bottom:1px dotted color-mix(in srgb,var(--pb-ink) 35%,transparent)}
${S} .pb-entry-board-name{flex:1;font:500 17px/1.35 var(--pb-font-body);color:var(--pb-ink)}
${S} .pb-entry-board-name small{display:block;margin-top:3px;font-size:14px;font-weight:400;color:var(--pb-muted)}
${S} .pb-entry-board-price{font:600 16px/1.3 var(--pb-font-body);white-space:nowrap;color:var(--pb-ink)}
${S} .pb-entry-menu[data-placeholder] .pb-entry-board{border-style:dashed;outline-style:dashed;background:color-mix(in srgb,var(--pb-surface,var(--pb-canvas)) 70%,transparent)}
${S} .pb-entry-menu[data-placeholder] .pb-entry-placeholder-tag{position:absolute;top:-13px;left:50%;transform:translateX(-50%)}
${S} .pb-entry-board-note{max-width:52ch;margin:16px auto 0;color:var(--pb-muted);font:400 16px/1.55 var(--pb-font-body)}
${S} .pb-entry-board-row{display:flex;justify-content:space-between;gap:24px;padding:14px 0;border-bottom:1px dotted color-mix(in srgb,var(--pb-ink) 30%,transparent)}
${S} .pb-entry-board-bar{display:block;height:10px;width:58%;border-radius:5px;background:color-mix(in srgb,var(--pb-ink) 12%,transparent)}
${S} .pb-entry-board-bar[data-w="cat"]{width:34%;margin-bottom:10px;background:color-mix(in srgb,var(--pb-accent) 45%,transparent)}
${S} .pb-entry-board-bar[data-w="price"]{width:14%}
@media (max-width:760px){
${S} .pb-entry-menu{padding:56px var(--pb-shell-pad,6%)}
${S} .pb-entry-board{outline-offset:-7px}
}
`;

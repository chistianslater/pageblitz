import React from "react";
import type { PackModule } from "../../packRegistry";
import { orderedSections, type NavItem } from "../../engine";
import { useSystem } from "../SystemContext";
import { claimPhotos, shownNavItems, systemShows } from "../shared";
import { PLAKAT_CSS } from "./css";
import { PlakatFoot, PlakatHead, plakatNavItems } from "./Chrome";
import { PlakatDock, PlakatTicker } from "./Band";
import { entryGround, entryVariant } from "./facts";
import { fieldRhythm } from "./rhythm";
import { PlakatLegal, PlakatPageHead, renderPlakatSection } from "./sections";

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item => (item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item));

/**
 * Plakat (rev 3) — Gerüst wie Werkstoff: Startseite über orderedSections
 * (hiddenSections, sectionOrder, Add-on-Gating), nur gezeigte Abschnitte,
 * jedes Foto einmal (claimPhotos). Flächen aus dem Feld-Rhythmus
 * (rhythm.ts); das Laufband steht direkt nach dem Einstieg, der Fuß auf dem
 * tiefen Feld, das Dock auf allen Seiten.
 */
export const PLAKAT_MODULE: PackModule = {
  id: "plakat",
  css: PLAKAT_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    const { data: home, blueprint } = useSystem();
    const hidden = home.designProfile?.hiddenElements ?? [];
    const { list } = claimPhotos(
      legal ? [] : (sections ?? orderedSections(data)).filter(systemShows),
      hidden
    );
    const anchorPrefix = sections || legal ? basePath || "/" : "";
    const homeAll = orderedSections(home);
    const homeShown =
      sections || legal ? claimPhotos(homeAll.filter(systemShows), hidden).list : list;
    const shown = plakatNavItems(
      shownNavItems(navItems, homeAll).filter(
        item => item.sectionType !== "gallery" || homeShown.some(s => s.type === "gallery")
      )
    );
    const nav = legal ? prefixAnchors(shown, anchorPrefix) : shown;
    const ownHead = pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    const hero = list.find(s => s.type === "hero");
    const entry =
      hero && hero.type === "hero"
        ? entryGround(entryVariant(home, hero, blueprint))
        : "ground";
    const fields = fieldRhythm(
      list.map(s => s.type),
      entry
    );
    return (
      <>
        <PlakatHead navItems={nav} anchorPrefix={anchorPrefix} />
        <main className="pk-main" id="inhalt">
          {legal && <PlakatLegal title={legal.title} html={legal.html} />}
          {ownHead && <PlakatPageHead title={pageTitle} />}
          {list.map((s, i) => (
            <React.Fragment key={`${s.type}-${i}`}>
              {renderPlakatSection(s, list, fields[i])}
              {s.type === "hero" && <PlakatTicker />}
            </React.Fragment>
          ))}
        </main>
        <PlakatFoot basePath={basePath} />
        <PlakatDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};

import React from "react";
import type { PackModule } from "../../packRegistry";
import { orderedSections, type NavItem } from "../../engine";
import { useSystem } from "../SystemContext";
import { claimPhotos, shownNavItems, systemShows } from "../shared";
import { KLAR_CSS } from "./css";
import { KlarDock, KlarFoot, KlarHead, klarNavItems } from "./Chrome";
import { KlarLegal, KlarPageHead, renderKlarSection } from "./sections";

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item =>
    item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item
  );

/**
 * Klar (rev 3) — Gerüst wie Plakat: Startseite über orderedSections
 * (hiddenSections, sectionOrder, Add-on-Gating), nur gezeigte Abschnitte,
 * jedes Foto einmal (claimPhotos), Kopf/Fuß/Leiste auf allen Seiten.
 * Gestalt nach docs/designsysteme/klar/systemblatt.html (Anker Luma Dental).
 */
export const KLAR_MODULE: PackModule = {
  id: "klar",
  css: KLAR_CSS,
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
      sections || legal
        ? claimPhotos(homeAll.filter(systemShows), hidden).list
        : list;
    const shown = klarNavItems(
      shownNavItems(navItems, homeAll).filter(
        item =>
          item.sectionType !== "gallery" ||
          homeShown.some(s => s.type === "gallery")
      ),
      blueprint
    );
    const nav = legal ? prefixAnchors(shown, anchorPrefix) : shown;
    const ownHead =
      pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    return (
      <>
        <KlarHead navItems={nav} anchorPrefix={anchorPrefix} />
        <main className="kl-main" id="inhalt">
          {legal && <KlarLegal title={legal.title} html={legal.html} />}
          {ownHead && <KlarPageHead title={pageTitle} />}
          {list.map((s, i) => (
            <React.Fragment key={`${s.type}-${i}`}>
              {renderKlarSection(s, list)}
            </React.Fragment>
          ))}
        </main>
        <KlarFoot basePath={basePath} />
        <KlarDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};

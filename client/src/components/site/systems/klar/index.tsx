import React from "react";
import type { SiteModule } from "../../siteModule";
import { orderedSections, type NavItem } from "../../engine";
import { useSystem } from "../SystemContext";
import {
  galleryIsFree,
  previewSlotAnchors,
  shownNavItems,
  systemShows,
} from "../shared";
import { KLAR_CSS } from "./css";
import { KlarDock, KlarFoot, KlarHead, klarNavItems } from "./Chrome";
import { KlarLegal, KlarPageHead, renderKlarSection } from "./sections";
import { KlarMenuSlot, KlarTeamSlot } from "./Offer";
import { klarPhotos, withoutChipEchoes } from "./content";
import { chipKey, factChips } from "./facts";

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item =>
    item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item
  );

/**
 * Klar (rev 3) — Gerüst wie Plakat: Startseite über orderedSections
 * (hiddenSections, sectionOrder, Add-on-Gating), nur gezeigte Abschnitte,
 * jedes Foto einmal (klarPhotos: Einstieg → Team → Über uns → Galerie),
 * Vorteile ohne Doppel zu den Fakten-Chips (withoutChipEchoes),
 * Vorschau-Platzhalter nur auf der Startseite, Kopf/Fuß/Leiste auf allen
 * Seiten.
 * Gestalt nach docs/designsysteme/klar/systemblatt.html (Anker Luma Dental).
 */
export const KLAR_MODULE: SiteModule = {
  id: "klar",
  css: KLAR_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    const { data: home, blueprint } = useSystem();
    const hidden = home.designProfile?.hiddenElements ?? [];
    // Vorteile, die schon als Chip im Einstieg stehen, nicht noch einmal.
    const chips = factChips(home).map(c => chipKey(c.label));
    const prepare = (all: Parameters<typeof klarPhotos>[0]) =>
      withoutChipEchoes(
        klarPhotos(all, hidden, galleryIsFree(home)).list,
        chips,
        chipKey
      );
    const list = prepare(
      legal ? [] : (sections ?? orderedSections(data)).filter(systemShows)
    );
    const slots = sections || legal ? {} : previewSlotAnchors(list);
    const anchorPrefix = sections || legal ? basePath || "/" : "";
    const homeAll = orderedSections(home);
    const homeShown =
      sections || legal
        ? prepare(homeAll.filter(systemShows))
        : list;
    const shown = klarNavItems(
      shownNavItems(navItems, homeAll).filter(
        item =>
          (item.sectionType !== "gallery" && item.sectionType !== "usp") ||
          homeShown.some(s => s.type === item.sectionType)
      ),
      blueprint
    );
    const nav = legal ? prefixAnchors(shown, anchorPrefix) : shown;
    const ownHead =
      pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    return (
      <>
        <KlarHead
          navItems={nav}
          anchorPrefix={anchorPrefix}
          home={!sections && !legal && list.some(s => s.type === "hero")}
        />
        <main className="kl-main" id="inhalt">
          {legal && <KlarLegal title={legal.title} html={legal.html} />}
          {ownHead && <KlarPageHead title={pageTitle} />}
          {list.map((s, i) => (
            <React.Fragment key={`${s.type}-${i}`}>
              {renderKlarSection(s, list, anchorPrefix)}
              {slots.menu === i && <KlarMenuSlot sections={list} />}
              {slots.team === i && <KlarTeamSlot sections={list} />}
            </React.Fragment>
          ))}
        </main>
        <KlarFoot basePath={basePath} />
        <KlarDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};

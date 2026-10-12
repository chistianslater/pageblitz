import React from "react";
import type { PackModule } from "../../packRegistry";
import { WERKSTOFF_CSS } from "./css";
import { WerkstoffFoot, WerkstoffHead, werkstoffNavItems } from "./Chrome";
import {
  WerkstoffLegal,
  WerkstoffPageHead,
  renderWerkstoffSection,
} from "./sections";
import { orderedSections, type NavItem } from "../../engine";
import { useSystem } from "../SystemContext";
import {
  galleryIsFree,
  previewSlotAnchors,
  shownNavItems,
  systemShows,
} from "../shared";
import { WerkstoffDock } from "./Dock";
import { WerkstoffMenuSlot, WerkstoffTeamSlot } from "./Offer";
import { werkstoffPhotos } from "./offerData";

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item =>
    item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item
  );

/**
 * Werkstoff (rev 3) — Gerüst wie Raster: Startseite über orderedSections
 * (hiddenSections, sectionOrder, Add-on-Gating), nur gezeigte Abschnitte.
 * Heller Grund überall; dunkel ist nur der Fuß. Handy-Leiste auf allen
 * Seiten.
 */
export const WERKSTOFF_MODULE: PackModule = {
  id: "werkstoff",
  css: WERKSTOFF_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    // Startseiten-Dokument (auf Unterseiten trägt `data` die Seiten-Abschnitte).
    const { data: home } = useSystem();
    // Jedes Foto höchstens einmal je Seite (offerData.ts): Einstieg →
    // Ablauf → Über uns → Galerie; vor Abb.-Nummern und Navigation.
    const hidden = home.designProfile?.hiddenElements ?? [];
    const { list, offerPhotos } = werkstoffPhotos(
      legal ? [] : (sections ?? orderedSections(data)).filter(systemShows),
      hidden,
      galleryIsFree(home)
    );
    // Unterseiten und Rechtsseiten: Anker zeigen auf die Startseite.
    const anchorPrefix = sections || legal ? basePath || "/" : "";
    // Vorschau-Platzhalter (Speisekarte, Team) nur auf der Startseite.
    const slots = sections || legal ? {} : previewSlotAnchors(list);
    const homeAll = orderedSections(home);
    // Auf der Startseite ist `list` schon die beanspruchte Startseiten-Liste.
    const homeShown =
      sections || legal
        ? werkstoffPhotos(
            homeAll.filter(systemShows),
            hidden,
            galleryIsFree(home)
          ).list
        : list;
    const shown = werkstoffNavItems(
      shownNavItems(navItems, homeAll).filter(
        item =>
          item.sectionType !== "gallery" ||
          homeShown.some(s => s.type === "gallery")
      )
    );
    const nav = legal ? prefixAnchors(shown, anchorPrefix) : shown;
    // Unterseite ohne eigenen Kopf-Abschnitt: Titel der Seite trägt den Kopf.
    const ownHead =
      pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    return (
      <>
        <WerkstoffHead navItems={nav} anchorPrefix={anchorPrefix} />
        <main className="ws-main" id="inhalt">
          {legal && <WerkstoffLegal title={legal.title} html={legal.html} />}
          {ownHead && <WerkstoffPageHead title={pageTitle} />}
          {list.map((s, i) => (
            <React.Fragment key={`${s.type}-${i}`}>
              {renderWerkstoffSection(s, list, offerPhotos)}
              {slots.menu === i && <WerkstoffMenuSlot sections={list} />}
              {slots.team === i && <WerkstoffTeamSlot sections={list} />}
            </React.Fragment>
          ))}
        </main>
        <WerkstoffFoot
          basePath={basePath}
          anchorPrefix={anchorPrefix}
          navItems={nav}
        />
        <WerkstoffDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};

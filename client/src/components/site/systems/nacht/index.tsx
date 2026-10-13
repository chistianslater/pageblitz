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
import { NACHT_CSS } from "./css";
import { NachtDock, NachtFoot, NachtHead, nachtNavItems } from "./Chrome";
import { NachtLegal, NachtPageHead, renderNachtSection } from "./sections";
import { NachtMenuSlot, NachtTeamSlot } from "./Offer";
import { nachtPhotos } from "./content";

type Shown = Parameters<typeof systemShows>[0];

/**
 * Wie systemShows, dazu: Abschnitte ohne Einträge (leere Liste bei
 * Leistungen, Ablauf, Zahlen, Team, Gut zu wissen, Partner) entfallen
 * samt Anker — kein Kapitel nur aus Überschrift.
 */
export function nachtShows(s: Shown): boolean {
  if (!systemShows(s)) return false;
  switch (s.type) {
    case "services":
    case "stats":
    case "partners":
    case "faq":
      return s.items.length > 0;
    case "process":
      return s.steps.length > 0;
    case "team":
      return s.members.length > 0;
    default:
      return true;
  }
}

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item =>
    item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item
  );

/**
 * Nacht (rev 3) — Gerüst wie Klar: Startseite über orderedSections
 * (hiddenSections, sectionOrder, Add-on-Gating), nur gezeigte Abschnitte,
 * jedes Foto einmal (nachtPhotos: Einstieg → Bildpaar an der Karte →
 * Team → Über uns → Galerie), Vorschau-Platzhalter nur auf der
 * Startseite, Kopf/Fuß/Leiste auf allen Seiten. Liegt der Einstieg als
 * dunkles Foto oben, liegt der Kopf darüber (auch über dem Schein der
 * Fassungen ohne Foto). Gestalt nach docs/designsysteme/nacht/systemblatt.html
 * (Anker Restaurant Zimmerl). Dunkles Papier: `scheme: "dark"` setzt
 * color-scheme/theme-color (SiteRenderer, SSR-Kopf).
 */
export const NACHT_MODULE: SiteModule = {
  id: "nacht",
  css: NACHT_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    const { data: home } = useSystem();
    const hidden = home.designProfile?.hiddenElements ?? [];
    const prepare = (all: Parameters<typeof nachtPhotos>[0]) =>
      nachtPhotos(all, hidden, galleryIsFree(home));
    const { list, pair } = prepare(
      legal ? [] : (sections ?? orderedSections(data)).filter(nachtShows)
    );
    const sub = Boolean(sections || legal);
    const slots = sub ? {} : previewSlotAnchors(list);
    const anchorPrefix = sub ? basePath || "/" : "";
    const back = sub ? basePath || "/" : undefined;
    const homeAll = orderedSections(home);
    const homeShown = sub ? prepare(homeAll.filter(nachtShows)).list : list;
    // Galerie kann nach der Foto-Verteilung leer sein, Listen ohne Einträge
    // entfallen: dann kein Anker dorthin.
    const shown = nachtNavItems(
      shownNavItems(navItems, homeAll).filter(
        item =>
          !item.sectionType ||
          homeShown.some(s => s.type === item.sectionType)
      )
    );
    const nav = legal ? prefixAnchors(shown, anchorPrefix) : shown;
    const ownHead =
      pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    // Startseite mit Einstieg oben: Kopf liegt über Foto bzw. Schein.
    const over = !sub && list[0]?.type === "hero";
    return (
      <>
        {/* Eigener Bezugsrahmen: Der Kopf über dem Einstieg liegt am oberen
            Rand des Einstiegs, nicht der Seite — auch unter dem Hinweisbanner
            (der steht in SiteRenderer davor). */}
        <div className="nc-top">
          <NachtHead navItems={nav} anchorPrefix={anchorPrefix} over={over} />
          <main className="nc-main" id="inhalt">
            {legal && (
              <NachtLegal title={legal.title} html={legal.html} back={back} />
            )}
            {ownHead && <NachtPageHead title={pageTitle} back={back} />}
            {list.map((s, i) => (
              <React.Fragment key={`${s.type}-${i}`}>
                {renderNachtSection(s, list, anchorPrefix, pair, back)}
                {slots.menu === i && <NachtMenuSlot sections={list} />}
                {slots.team === i && <NachtTeamSlot sections={list} />}
              </React.Fragment>
            ))}
          </main>
        </div>
        <NachtFoot basePath={basePath} />
        <NachtDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};

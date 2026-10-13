import React from "react";
import type { SiteModule } from "../../siteModule";
import { orderedSections, type NavItem } from "../../engine";
import { useSystem } from "../SystemContext";
import {
  claimPhotos,
  galleryIsFree,
  shownNavItems,
  systemShows,
} from "../shared";
import { FREUNDLICH_CSS } from "./css";
import {
  FreundlichDock,
  FreundlichFoot,
  FreundlichHead,
  freundlichNavItems,
} from "./Chrome";
import {
  FreundlichLegal,
  FreundlichPageHead,
  renderFreundlichSection,
  type FreundlichSection,
} from "./sections";
import { entryVariant } from "./facts";

type Shown = Parameters<typeof systemShows>[0];

/**
 * Wie systemShows, dazu: Abschnitte ohne Einträge (leere Liste bei
 * Leistungen, Ablauf, Zahlen, Team, Gut zu wissen, Partner, Vorteile)
 * entfallen samt Anker — kein Kapitel nur aus Überschrift.
 */
export function freundlichShows(s: Shown): boolean {
  if (!systemShows(s)) return false;
  switch (s.type) {
    case "services":
    case "stats":
    case "partners":
    case "faq":
    case "usp":
      return s.items.length > 0;
    case "process":
      return s.steps.length > 0;
    case "team":
      return s.members.length > 0;
    default:
      return true;
  }
}

/**
 * Jedes Foto einmal je Seite (claimPhotos): Einstieg → Über uns →
 * Galerie (frei: drei Fotos, die die Seite noch nicht zeigt). Eine danach
 * leere Galerie entfällt.
 */
export function freundlichPhotos<T extends FreundlichSection>(
  sections: readonly T[],
  hidden: readonly string[],
  freeGallery: boolean
): T[] {
  return claimPhotos(sections, hidden, undefined, freeGallery).list.filter(
    s => s.type !== "gallery" || s.images.length > 0
  );
}

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item =>
    item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item
  );

/**
 * Freundlich (rev 3) — Gerüst wie Nacht: Startseite über orderedSections
 * (hiddenSections, sectionOrder, Add-on-Gating), nur gezeigte Abschnitte,
 * jedes Foto einmal, Kopf/Fuß/Leiste auf allen Seiten. Liegt der Einstieg
 * auf der Pastellfläche (schwaches oder kein Foto), steht der Kopf mit
 * darauf. Gestalt nach docs/designsysteme/freundlich/systemblatt.html
 * (Anker Bright Path). Vorschau-Platzhalter baut F3.
 */
export const FREUNDLICH_MODULE: SiteModule = {
  id: "freundlich",
  css: FREUNDLICH_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    const { data: home } = useSystem();
    const hidden = home.designProfile?.hiddenElements ?? [];
    const prepare = (all: FreundlichSection[]) =>
      freundlichPhotos(all, hidden, galleryIsFree(home));
    const list = prepare(
      legal ? [] : (sections ?? orderedSections(data)).filter(freundlichShows)
    );
    const sub = Boolean(sections || legal);
    const anchorPrefix = sub ? basePath || "/" : "";
    const back = sub ? basePath || "/" : undefined;
    const homeAll = orderedSections(home);
    const homeShown = sub ? prepare(homeAll.filter(freundlichShows)) : list;
    const shown = freundlichNavItems(
      shownNavItems(navItems, homeAll).filter(
        item =>
          !item.sectionType ||
          homeShown.some(s => s.type === item.sectionType)
      )
    );
    const nav = legal ? prefixAnchors(shown, anchorPrefix) : shown;
    const ownHead =
      pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    const first = list[0];
    const tintTop =
      !sub &&
      first?.type === "hero" &&
      entryVariant(home, first) !== "photo";
    return (
      <>
        <div className={tintTop ? "fr-top fr-top--tint" : "fr-top"}>
          <FreundlichHead navItems={nav} anchorPrefix={anchorPrefix} />
          <main className="fr-main" id="inhalt">
            {legal && (
              <FreundlichLegal title={legal.title} html={legal.html} back={back} />
            )}
            {ownHead && <FreundlichPageHead title={pageTitle} back={back} />}
            {list.map((s, i) => (
              <React.Fragment key={`${s.type}-${i}`}>
                {renderFreundlichSection(s, list, anchorPrefix, back)}
              </React.Fragment>
            ))}
          </main>
        </div>
        <FreundlichFoot basePath={basePath} />
        <FreundlichDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};

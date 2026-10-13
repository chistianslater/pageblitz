import React from "react";
import type { SiteModule } from "../../siteModule";
import { orderedSections, type NavItem } from "../../engine";
import { useSystem } from "../SystemContext";
import {
  galleryIsFree,
  previewSlotAnchors,
  shownNavItems,
  systemShows,
  unquote,
} from "../shared";
import type { WebsiteDataV2 } from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { ctaButtons } from "./Visit";
import { contactHasContent } from "./facts";
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
import { freundlichPhotos, surfacePlan } from "./content";
import { FreundlichMenuSlot, FreundlichTeamSlot } from "./Offer";

type Shown = Parameters<typeof systemShows>[0];

/** Was nur mit Seite und Bauplan entscheidbar ist (Kontakt, Abschluss-Band). */
export type ShowContext = {
  data: WebsiteDataV2;
  blueprint: Blueprint;
  contactIsland: boolean;
};

/**
 * Wie systemShows, dazu: Abschnitte ohne Inhalt entfallen samt Anker — kein
 * Kapitel nur aus Überschrift: leere Liste (Leistungen, Ablauf, Zahlen,
 * Team, Gut zu wissen, Partner, Vorteile), leere Geschichte bzw. leerer
 * Leitsatz; mit `ctx` auch „Besuch uns" ohne Zeiten, Anschrift, Wege und
 * ohne Kontakt-Insel sowie ein Abschluss-Band ohne jeden Knopf.
 */
export function freundlichShows(s: Shown, ctx?: ShowContext): boolean {
  if (!systemShows(s)) return false;
  switch (s.type) {
    case "story":
      return Boolean(s.body?.trim());
    case "quote":
      return Boolean(unquote(s.text ?? "").trim());
    case "contact":
      return (
        !ctx ||
        contactHasContent(
          s,
          ctx.contactIsland || ctx.data.features?.contactForm === true
        )
      );
    case "cta": {
      if (!ctx) return true;
      const { primary, phone } = ctaButtons(s, ctx.data, ctx.blueprint, "");
      return Boolean(primary || phone);
    }
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
 * (Anker Bright Path). Vorschau-Platzhalter (Karte, Team) nur auf der
 * Startseite und nur in der Vorschau.
 */
export const FREUNDLICH_MODULE: SiteModule = {
  id: "freundlich",
  css: FREUNDLICH_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    const { data: home, blueprint, contactIsland } = useSystem();
    const ctx: ShowContext = {
      data: home,
      blueprint,
      contactIsland: Boolean(contactIsland),
    };
    const shows = (s: Shown) => freundlichShows(s, ctx);
    const hidden = home.designProfile?.hiddenElements ?? [];
    const prepare = (all: FreundlichSection[]) =>
      freundlichPhotos(all, hidden, galleryIsFree(home));
    const list = prepare(
      legal ? [] : (sections ?? orderedSections(data)).filter(shows)
    );
    const sub = Boolean(sections || legal);
    const slots = sub ? {} : previewSlotAnchors(list);
    const anchorPrefix = sub ? basePath || "/" : "";
    const back = sub ? basePath || "/" : undefined;
    const homeAll = orderedSections(home);
    const homeShown = sub ? prepare(homeAll.filter(shows)) : list;
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
    const photoEntry =
      !sub && first?.type === "hero" && entryVariant(home, first) === "photo";
    const tintTop = !sub && first?.type === "hero" && !photoEntry;
    const plan = surfacePlan(list, photoEntry);
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
                {renderFreundlichSection(s, list, anchorPrefix, back, plan)}
                {slots.menu === i && <FreundlichMenuSlot sections={list} />}
                {slots.team === i && <FreundlichTeamSlot sections={list} />}
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

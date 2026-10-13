import React from "react";
import type { SiteModule } from "../../siteModule";
import { JOURNAL_CSS } from "./css";
import { JournalFoot, JournalHead, journalNavItems } from "./Chrome";
import { renderJournalSection, type JournalSection } from "./sections";
import { orderedSections, type NavItem } from "../../engine";
import { JournalMenuSlot, JournalTeamSlot } from "./Offer";
import { JournalDock } from "./Visit";
import { JournalLegal, JournalPageHead } from "./Extras";
import { useSystem } from "../SystemContext";
import { previewSlotAnchors, shownNavItems, systemShows } from "../shared";

/** Rechtsseiten liegen außerhalb der Startseite: Anker dorthin umlenken. */
const prefixAnchors = (items: NavItem[], prefix: string): NavItem[] =>
  items.map(item =>
    item.href.startsWith("#") ? { ...item, href: prefix + item.href } : item
  );

export const JOURNAL_MODULE: SiteModule = {
  id: "journal",
  css: JOURNAL_CSS,
  Page: ({ data, basePath, navItems = [], sections, pageTitle, legal }) => {
    // Startseiten-Dokument (auf Unterseiten trägt `data` die Seiten-Abschnitte).
    const { data: home } = useSystem();
    // Startseite wie in den Packs über orderedSections: hiddenSections,
    // sectionOrder und Add-on-Gating greifen, Kapitel zählen nur Sichtbares.
    const list: JournalSection[] = legal
      ? []
      : (sections ?? orderedSections(data)).filter(systemShows);
    // Unterseiten und Rechtsseiten: Anker zeigen auf die Startseite.
    const anchorPrefix = sections || legal ? basePath || "/" : "";
    // Vorschau-Platzhalter nur auf der Startseite.
    const slots = sections || legal ? {} : previewSlotAnchors(list);
    const shown = shownNavItems(navItems, orderedSections(home));
    // Unterseite ohne eigenen Kopf-Abschnitt: Titel der Seite trägt den Kopf.
    const ownHead =
      pageTitle !== undefined && !list.some(s => s.type === "pageHeader");
    return (
      <>
        <JournalHead
          navItems={journalNavItems(
            legal ? prefixAnchors(shown, anchorPrefix) : shown
          )}
          anchorPrefix={anchorPrefix}
        />
        <main className="jr-main" id="inhalt">
          {legal && <JournalLegal title={legal.title} html={legal.html} />}
          {ownHead && <JournalPageHead title={pageTitle} />}
          {list.map((s, i) => (
            <React.Fragment key={`${s.type}-${i}`}>
              {renderJournalSection(s, list)}
              {slots.menu === i && <JournalMenuSlot sections={list} />}
              {slots.team === i && <JournalTeamSlot sections={list} />}
            </React.Fragment>
          ))}
        </main>
        <JournalFoot basePath={basePath} anchorPrefix={anchorPrefix} />
        <JournalDock anchorPrefix={anchorPrefix} />
      </>
    );
  },
};

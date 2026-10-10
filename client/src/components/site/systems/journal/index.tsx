import React from "react";
import type { PackModule } from "../../packRegistry";
import { JOURNAL_CSS } from "./css";
import { JournalFoot, JournalHead, journalNavItems } from "./Chrome";
import {
  journalShows,
  renderJournalSection,
  type JournalSection,
} from "./sections";
import { orderedSections, type NavItem } from "../../engine";
import { JournalMenuSlot, JournalTeamSlot, previewSlotAnchors } from "./Offer";
import { JournalDock } from "./Visit";

/**
 * Navigation ohne Anker auf Abschnitte, die Journal nicht zeigt (z. B.
 * Stimmen ohne zitierfähige Bewertung). Geprüft wird an der Startseite,
 * weil die Anker auch von Unterseiten dorthin zeigen.
 */
export function shownNavItems(
  items: NavItem[],
  home: readonly JournalSection[]
): NavItem[] {
  const dropped = new Set(
    home.filter(s => !journalShows(s)).map(s => s.type as string)
  );
  return items.filter(
    item => !item.sectionType || !dropped.has(item.sectionType)
  );
}

export const JOURNAL_MODULE: PackModule = {
  id: "journal",
  css: JOURNAL_CSS,
  Page: ({ data, basePath, navItems = [], sections }) => {
    // Startseite wie in den Packs über orderedSections: hiddenSections,
    // sectionOrder und Add-on-Gating greifen, Kapitel zählen nur Sichtbares.
    const list: JournalSection[] = (sections ?? orderedSections(data)).filter(
      journalShows
    );
    // Unterseiten bekommen `sections`; Anker zeigen dann auf die Startseite.
    const anchorPrefix = sections ? basePath || "/" : "";
    // Vorschau-Platzhalter nur auf der Startseite.
    const slots = sections ? {} : previewSlotAnchors(list);
    return (
      <>
        <JournalHead
          navItems={journalNavItems(
            shownNavItems(navItems, orderedSections(data))
          )}
          anchorPrefix={anchorPrefix}
        />
        <main className="jr-main" id="inhalt">
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

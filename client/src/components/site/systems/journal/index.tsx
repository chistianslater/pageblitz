import React from "react";
import type { PackModule } from "../../packRegistry";
import { JOURNAL_CSS } from "./css";
import { JournalFoot, JournalHead, journalNavItems } from "./Chrome";
import { renderJournalSection, type JournalSection } from "./sections";
import { orderedSections } from "../../engine";

export const JOURNAL_MODULE: PackModule = {
  id: "journal",
  css: JOURNAL_CSS,
  Page: ({ data, basePath, navItems = [], sections }) => {
    // Startseite wie in den Packs über orderedSections: hiddenSections,
    // sectionOrder und Add-on-Gating greifen, Kapitel zählen nur Sichtbares.
    const list: JournalSection[] = sections ?? orderedSections(data);
    // Unterseiten bekommen `sections`; Anker zeigen dann auf die Startseite.
    const anchorPrefix = sections ? basePath || "/" : "";
    return (
      <>
        <JournalHead
          navItems={journalNavItems(navItems)}
          anchorPrefix={anchorPrefix}
        />
        <main className="jr-main" id="inhalt">
          {list.map((s, i) => (
            <React.Fragment key={`${s.type}-${i}`}>
              {renderJournalSection(s, list)}
            </React.Fragment>
          ))}
        </main>
        <JournalFoot basePath={basePath} anchorPrefix={anchorPrefix} />
      </>
    );
  },
};

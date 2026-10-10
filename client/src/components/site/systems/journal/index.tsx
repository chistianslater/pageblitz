import React from "react";
import type { PackModule } from "../../packRegistry";
import { JOURNAL_CSS } from "./css";
import { JournalFoot, JournalHead, journalNavItems } from "./Chrome";
import { renderJournalSection } from "./sections";

export const JOURNAL_MODULE: PackModule = {
  id: "journal",
  css: JOURNAL_CSS,
  Page: ({ data, basePath, navItems = [], sections }) => {
    const list = sections ?? data.sections;
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

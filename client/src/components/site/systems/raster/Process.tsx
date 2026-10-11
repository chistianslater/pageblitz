import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import {
  RasterChapter,
  chapterLabel,
  useChapterNo,
  type RasterSection,
} from "./sections";

/**
 * Ablauf als Ziffernzeilen (Systemblatt 7/8/11): große Ziffer 01–05 in
 * `figure`/`accent` links, Titel (h3) und Satz rechts, Haarlinien.
 */
export function RasterProcess({
  section,
  sections,
}: {
  section: SectionOf<"process">;
  sections: readonly RasterSection[];
}) {
  const { blueprint } = useSystem();
  return (
    <RasterChapter
      id={SECTION_ANCHORS.process}
      name="process"
      no={useChapterNo(sections, "process")}
      label={chapterLabel("process", blueprint)}
      title={section.headline}
      full
    >
      <ol className="rs-steps">
        {section.steps.map((s, i) => (
          <li className="rs-step" key={`${s.title}-${i}`}>
            <span className="rs-step-no" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{rich(s.title)}</h3>
              {s.text && <p>{rich(s.text)}</p>}
            </div>
          </li>
        ))}
      </ol>
    </RasterChapter>
  );
}

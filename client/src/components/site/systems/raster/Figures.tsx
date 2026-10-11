import React from "react";
import { RASTER } from "../../../../../../shared/designSystems/raster";
import { SECTION_ANCHORS } from "../../engine";
import { useSystem } from "../SystemContext";
import { wordWidthEm } from "./fit";
import { figuresOf, showsFigures } from "./offerData";
import { RasterChapter, useChapterNo, type RasterSection } from "./sections";

const FIGURE_TRACK = parseFloat(RASTER.type.figure!.track);

/**
 * Zahlenzeile „In Zahlen" (Systemblatt 8/11): nur echte Zahlen aus Google
 * (Note, Anzahl Bewertungen), Ziffern in `figure` mit Tabellenziffern,
 * Haarlinien als Raster. Weniger als zwei Zahlen → entfällt ganz. Eigenes
 * Kapitel direkt nach den Leistungen.
 */
export function RasterFigures({
  sections,
}: {
  sections: readonly RasterSection[];
}) {
  const { data } = useSystem();
  const no = useChapterNo(sections, "figures");
  if (!showsFigures(sections, data.google)) return null;
  const figures = figuresOf(data.google);
  const odd = figures.length % 2 === 1;
  return (
    <RasterChapter
      id={SECTION_ANCHORS.stats}
      name="figures"
      no={no}
      label="In Zahlen"
      full
    >
      <ul
        className={odd ? "rs-figs rs-figs--odd" : "rs-figs"}
        style={{ "--rs-n": figures.length } as React.CSSProperties}
      >
        {figures.map(f => (
          <li className="rs-fig" key={f.label}>
            <span
              className="rs-fig-value"
              style={
                {
                  "--rs-fit": wordWidthEm(f.value, FIGURE_TRACK).toFixed(3),
                } as React.CSSProperties
              }
            >
              {f.value}
            </span>
            <span className="rs-fig-label">{f.label}</span>
          </li>
        ))}
      </ul>
    </RasterChapter>
  );
}

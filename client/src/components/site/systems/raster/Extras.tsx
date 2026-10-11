import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { FigureList } from "./Figures";
import { RasterQuote, paragraphs } from "./Story";
import {
  RasterChapter,
  chapterLabel,
  useChapterNo,
  type RasterSection,
} from "./sections";

/**
 * Übrige Abschnittstypen in Colophons Grammatik (Label-Spalte, Haarlinien):
 * Geschichte und Grundsätze als nummerierte Kapitel (Grundsätze als
 * Ziffernzeilen), Zahlen in der Zahlenzeile, Zitat groß in `lede`, Partner
 * als Logo-Raster — diese drei als Zwischentöne ohne Nummer. Der Aufruf
 * ist ein dunkles Band (`deep`) mit dem Signal-Knopf.
 */

type P<T extends RasterSection["type"]> = {
  section: Extract<RasterSection, { type: T }>;
  sections: readonly RasterSection[];
};

export function RasterStory({ section, sections }: P<"story">) {
  const { blueprint } = useSystem();
  return (
    <RasterChapter
      id={SECTION_ANCHORS.story}
      name="story"
      no={useChapterNo(sections, "story")}
      label={chapterLabel("story", blueprint)}
      title={section.headline}
    >
      <div className="rs-prose">
        {paragraphs(section.body).map((p, i) => (
          <p key={i}>{rich(p)}</p>
        ))}
      </div>
    </RasterChapter>
  );
}

export function RasterUsp({ section, sections }: P<"usp">) {
  const { blueprint } = useSystem();
  return (
    <RasterChapter
      id={SECTION_ANCHORS.usp}
      name="usp"
      no={useChapterNo(sections, "usp")}
      label={chapterLabel("usp", blueprint)}
      title={section.headline}
      full
    >
      <ol className="rs-usps">
        {section.items.map((item, i) => (
          <li className="rs-usp" key={`${item.title}-${i}`}>
            <span className="rs-usp-no" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{rich(item.title)}</h3>
              {item.text && <p>{rich(item.text)}</p>}
            </div>
          </li>
        ))}
      </ol>
    </RasterChapter>
  );
}

export function RasterStats({ section }: P<"stats">) {
  const { blueprint } = useSystem();
  return (
    <RasterChapter
      id={SECTION_ANCHORS.stats}
      name="stats"
      no={0}
      label={chapterLabel("stats", blueprint)}
      title={section.headline}
      full
    >
      <FigureList figures={section.items} />
    </RasterChapter>
  );
}

/** Zitat als Zwischenton: Label „Zitat" links, Satz groß rechts, kein h2. */
export function RasterMotto({ section }: P<"quote">) {
  const { blueprint } = useSystem();
  return (
    <section
      id={SECTION_ANCHORS.quote}
      className="rs-sec rs-motto"
      aria-label="Zitat"
    >
      <div className="rs-wrap rs-g12">
        <p className="rs-lab">
          <span className="rs-lab-text">{chapterLabel("quote", blueprint)}</span>
        </p>
        <div className="rs-body rs-body--full">
          <RasterQuote text={section.text} who={section.author} />
        </div>
      </div>
    </section>
  );
}

export function RasterPartners({ section }: P<"partners">) {
  const { blueprint } = useSystem();
  return (
    <RasterChapter
      id={SECTION_ANCHORS.partners}
      name="partners"
      no={0}
      label={chapterLabel("partners", blueprint)}
      title={section.headline}
      full
    >
      <ul className="rs-logos">
        {section.items.map((item, i) => {
          const img = (
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              decoding="async"
            />
          );
          return (
            <li key={`${item.name}-${i}`}>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {img}
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </RasterChapter>
  );
}

/** Aufruf: dunkles Band, Satz in h2, Hauptaktion als Signal-Knopf. */
export function RasterCta({ section }: P<"cta">) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS.cta;
  return (
    <section
      id={id}
      className="rs-sec rs-cta"
      aria-labelledby={`${id}-titel`}
    >
      <div className="rs-wrap rs-g12">
        <p className="rs-lab">
          <span className="rs-lab-text">{chapterLabel("cta", blueprint)}</span>
        </p>
        <div className="rs-body">
          <h2 className="rs-cta-title" id={`${id}-titel`}>
            {rich(section.headline)}
          </h2>
          <p>
            <a
              className="rs-btn"
              href={section.ctaHref ?? `#${SECTION_ANCHORS.contact}`}
            >
              {section.ctaText}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

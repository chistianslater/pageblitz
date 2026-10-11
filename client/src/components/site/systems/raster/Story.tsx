import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { pickReviewQuote } from "../../artDirection/heroFacts";
import { galleryIsStock } from "../../PhotoCredits";
import { useSystem } from "../SystemContext";
import { figureNumbers } from "../shared";
import {
  RasterChapter,
  chapterLabel,
  useChapterNo,
  type RasterSection,
} from "./sections";

/**
 * Über uns, Einblicke und Stimme nach Systemblatt 7–9 (Anker Colophon):
 * Label-Spalte links, Inhalt rechts. Über uns mit S/W-Bild im Raster und
 * „Abb. n", ohne Bild trägt der erste Satz groß (`lede`). Einblicke als
 * Bildzeilen (Raster-Filter, Abb. fortlaufend), ohne die Fotos, die schon
 * Band-Hintergrund sind (index.tsx, withoutBandPhotos). Stimme: genau ein
 * großes Zitat in `lede`, Name als Kicker, Quelle nur mit Google-Daten.
 */

type P<T extends RasterSection["type"]> = {
  section: Extract<RasterSection, { type: T }>;
  sections: readonly RasterSection[];
};

/**
 * Abbildungsnummern in Raster: Das Einstiegsfoto trägt keine Unterschrift,
 * also zählt es nicht mit — die erste gezeigte Abbildung ist „Abb. 1".
 */
export const rasterFigureNumbers = (
  sections: readonly RasterSection[],
  hidden: readonly string[]
) => figureNumbers(sections, [...hidden, "hero-media"]);

/** Absätze aus Leerzeilen. */
export const paragraphs = (body: string): string[] =>
  body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

/** Erster Satz (≥ 40 Zeichen) und Rest — Fassung ohne Foto. */
const LEAD_SENTENCE = /^(.{40,}?[.!?])\s+(.+)$/s;
/** Längerer Satz steht nicht groß (lede verträgt zwei, drei Zeilen). */
const LEAD_MAX = 160;

function splitLead(parts: string[]): { lead?: string; rest: string[] } {
  const [first, ...more] = parts;
  if (!first) return { rest: [] };
  const match = first.match(LEAD_SENTENCE);
  if (match && match[1].length <= LEAD_MAX)
    return { lead: match[1], rest: [match[2], ...more] };
  if (!match && first.length <= LEAD_MAX) return { lead: first, rest: more };
  return { rest: parts };
}

/** Bildunterschrift: „Abb. n" in ink, Text gedämpft. */
export function Abb({
  n,
  children,
}: {
  n?: number;
  children?: React.ReactNode;
}) {
  if (n === undefined && !children) return null;
  return (
    <figcaption className="rs-figcap">
      {n !== undefined && <span className="rs-abb">Abb. {n}</span>}
      {children && <span className="rs-figcap-text">{children}</span>}
    </figcaption>
  );
}

export function RasterAbout({ section, sections }: P<"about">) {
  const { data, blueprint } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const image = hidden.includes("about-media") ? undefined : section.imageUrl;
  const abb = rasterFigureNumbers(sections, hidden).about;
  const parts = paragraphs(section.body);
  const { lead, rest } = image ? { lead: undefined, rest: parts } : splitLead(parts);
  const hasTeam = sections.some(s => s.type === "team");
  return (
    <RasterChapter
      id={SECTION_ANCHORS.about}
      name="about"
      className={image ? "rs-about--photo" : "rs-about--text"}
      no={useChapterNo(sections, "about")}
      label={chapterLabel("about", blueprint)}
      title={section.headline}
      full
    >
      <div className="rs-about-grid">
        <div className="rs-about-text">
          {lead && <p className="rs-about-lede">{rich(lead)}</p>}
          {rest.map((p, i) => (
            <p key={i}>{rich(p)}</p>
          ))}
          {hasTeam && (
            <p>
              <a className="rs-link" href={`#${SECTION_ANCHORS.team}`}>
                Das Team kennenlernen
              </a>
            </p>
          )}
        </div>
        {image && (
          <figure className="rs-figure rs-about-photo">
            <img
              src={image}
              alt=""
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
            />
            <Abb n={abb} />
          </figure>
        )}
      </div>
    </RasterChapter>
  );
}

export function RasterGallery({ section, sections }: P<"gallery">) {
  const { data, blueprint } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const label = chapterLabel("gallery", blueprint);
  const first = rasterFigureNumbers(sections, hidden).gallery ?? 1;
  // Stockfotos nicht als eigene Arbeiten überschreiben (wie Journal).
  const title = galleryIsStock(data) ? undefined : section.headline;
  const count = section.images.length;
  return (
    <RasterChapter
      id={SECTION_ANCHORS.gallery}
      name="gallery"
      no={useChapterNo(sections, "gallery")}
      label={label}
      title={title}
      full
    >
      <ul
        className="rs-shots"
        data-count={count}
        // Ungerade Anzahl: Das erste Bild läuft am Desktop über die volle Breite.
        data-odd={count % 2 === 1 ? "" : undefined}
      >
        {section.images.map((image, i) => (
          <li key={`${image.url}-${i}`}>
            <figure className="rs-figure">
              <img
                src={image.url}
                alt={image.alt}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
              <Abb n={first + i}>{image.caption}</Abb>
            </figure>
          </li>
        ))}
      </ul>
    </RasterChapter>
  );
}

/** Anführungszeichen setzt das Markup; vorhandene aus dem Text entfernen. */
export const unquote = (text: string) =>
  text.trim().replace(/^[„"“»«‚']+|[“"”«»‘']+$/g, "");

/** Großes Zitat mit hängender Anführung, Name (Kicker) und Quelle. */
export function RasterQuote({
  text,
  who,
  source,
  five = false,
}: {
  text: string;
  who?: string;
  source?: string;
  five?: boolean;
}) {
  return (
    <figure className="rs-quote-figure">
      {five && (
        <p className="rs-stars">
          <span aria-hidden="true">★★★★★</span>
          <span className="rs-sr">5 von 5 Sternen</span>
        </p>
      )}
      <blockquote className="rs-quote">
        <p>„{rich(unquote(text))}“</p>
      </blockquote>
      {(who || source) && (
        <figcaption className="rs-quote-cap">
          {who && <span className="rs-quote-who">{who}</span>}
          {source && <span className="rs-quote-source">{source}</span>}
        </figcaption>
      )}
    </figure>
  );
}

export function RasterReviews({ section, sections }: P<"testimonials">) {
  const { data, blueprint } = useSystem();
  const no = useChapterNo(sections, "testimonials");
  const quote = pickReviewQuote(section.items);
  if (!quote) return null;
  const item = section.items.find(
    i => i.author === quote.author && i.text.includes(quote.text)
  );
  return (
    <RasterChapter
      id={SECTION_ANCHORS.testimonials}
      name="testimonials"
      no={no}
      label={chapterLabel("testimonials", blueprint)}
    >
      <RasterQuote
        text={quote.text}
        who={quote.author}
        source={data.google ? "Google-Bewertung" : undefined}
        five={item?.rating === 5}
      />
    </RasterChapter>
  );
}

/**
 * Team: Porträts S/W im Raster, wenn jedes Mitglied ein Foto hat; sonst
 * Namenszeilen (Name links, Rolle rechts) — kein halb bebildertes Raster.
 */
export function RasterPortraits({
  members,
}: {
  members: SectionOf<"team">["members"];
}) {
  return (
    <ul className="rs-faces">
      {members.map((m, i) => (
        <li key={`${m.name}-${i}`}>
          <figure className="rs-figure">
            <img
              src={m.imageUrl}
              alt={m.name}
              width={600}
              height={750}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="rs-face-cap">
              <span className="rs-face-name">{m.name}</span>
              {m.role && <span className="rs-face-role">{m.role}</span>}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

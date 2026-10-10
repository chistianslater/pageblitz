import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { pickReviewQuote } from "../../artDirection/heroFacts";
import { galleryIsStock } from "../../PhotoCredits";
import { useSystem } from "../SystemContext";
import { figureNumbers } from "./figures";
import {
  JournalChapter,
  chapterIndex,
  chapterLabel,
  sectionClass,
  type JournalSection,
} from "./sections";

/**
 * Geschichte nach Systemblatt: „Über uns" mit Hochformat-Foto, „Abb. n"
 * und Fließtext; „Einblicke" als Wischstreifen gemischter Formate auf dem
 * Handy, als Magazinstrecke ab 64rem; „Stimmen" zentriert mit genau einer
 * großen kursiven Stimme. Abbildungen zählen über die Seite fortlaufend
 * (figures.ts), Bilder laden spät, haben Maße und den alt-Text der Daten.
 */

type P<T extends JournalSection["type"]> = {
  section: Extract<JournalSection, { type: T }>;
  sections: readonly JournalSection[];
};

/** Fassung ohne Foto: Der erste Satz steht groß, der Rest als Fließtext. */
const LEAD_SENTENCE = /^(.{40,}?[.!?])\s+(.+)$/s;

function splitLead(paragraphs: string[]): { lead?: string; rest: string[] } {
  const [first, ...more] = paragraphs;
  const match = first?.match(LEAD_SENTENCE);
  if (!match) return { rest: paragraphs };
  return { lead: match[1], rest: [match[2], ...more] };
}

function Abb({ n, children }: { n?: number; children?: React.ReactNode }) {
  return (
    <figcaption className="jr-figcap">
      <span>
        {n !== undefined && <span className="jr-abb">Abb. {n}</span>}
        {children && <> {children}</>}
      </span>
    </figcaption>
  );
}

export function JournalAbout({ section, sections }: P<"about">) {
  const { data, blueprint } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const index = chapterIndex(sections, "about");
  const id = SECTION_ANCHORS.about;
  const image = hidden.includes("about-media") ? undefined : section.imageUrl;
  const abb = figureNumbers(sections, hidden).about;
  const paragraphs = section.body.split(/\n{2,}/).filter(p => p.trim());
  const { lead, rest } = image
    ? { lead: undefined, rest: paragraphs }
    : splitLead(paragraphs);
  const hasTeam = sections.some(s => s.type === "team");
  const label = chapterLabel("about", blueprint);
  return (
    <section
      id={id}
      className={`${sectionClass("about", index)}${image ? "" : " jr-about--text"}`}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap jr-about-grid">
        <JournalChapter
          id={id}
          index={index}
          label={label}
          title={section.headline || label}
        />
        {image && (
          <figure className="jr-about-photo">
            <img
              src={image}
              alt=""
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
            />
            <Abb n={abb} />
          </figure>
        )}
        <div className="jr-about-body">
          {lead && <p className="jr-about-lede">{rich(lead)}</p>}
          {rest.map((p, i) => (
            <p key={i}>{rich(p)}</p>
          ))}
          {hasTeam && (
            <p className="jr-links jr-section-links">
              <a className="jr-link" href={`#${SECTION_ANCHORS.team}`}>
                Das Team kennenlernen
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function JournalGallery({ section, sections }: P<"gallery">) {
  const { data, blueprint } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const index = chapterIndex(sections, "gallery");
  const id = SECTION_ANCHORS.gallery;
  const label = chapterLabel("gallery", blueprint);
  const numbers = figureNumbers(sections, hidden);
  const first = numbers.gallery ?? 1;
  const last = numbers.galleryLast ?? first;
  // Stockfotos nicht als eigene Arbeiten ausgeben (wie entrySections).
  const title = galleryIsStock(data) ? label : (section.headline ?? label);
  const many = section.images.length > 1;
  return (
    <section
      id={id}
      className={sectionClass("gallery", index)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap">
        <JournalChapter id={id} index={index} label={label} title={title} />
      </div>
      <div
        className="jr-strip"
        data-count={section.images.length}
        tabIndex={many ? 0 : undefined}
        aria-label={many ? "Bilder, seitlich wischen" : undefined}
      >
        {section.images.map((image, i) => (
          <figure key={image.url}>
            <img
              src={image.url}
              alt={image.alt}
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
            />
            <Abb n={first + i}>{image.caption}</Abb>
          </figure>
        ))}
      </div>
      {many && (
        <div className="jr-wrap">
          <p className="jr-figcap jr-strip-note" aria-hidden="true">
            <span>
              <span className="jr-abb">
                Abb. {first} bis {last}
              </span>{" "}
              Wischen für mehr
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

export function JournalReviews({ section, sections }: P<"testimonials">) {
  const { data, blueprint } = useSystem();
  const quote = pickReviewQuote(section.items);
  if (!quote) return null;
  const index = chapterIndex(sections, "testimonials");
  const id = SECTION_ANCHORS.testimonials;
  const source = section.items.find(
    item => item.author === quote.author && item.text.includes(quote.text)
  );
  const five = source?.rating === 5;
  return (
    <section
      id={id}
      className={sectionClass("reviews", index)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap">
        <p className="jr-kicker jr-chapter-label">
          {index > 0 && (
            <span className="jr-chapter-no" aria-hidden="true">
              {String(index).padStart(2, "0")}
            </span>
          )}
          {chapterLabel("testimonials", blueprint)}
        </p>
        <h2 id={`${id}-titel`} className="jr-sr">
          {section.headline ?? "Stimmen"}
        </h2>
        <figure className="jr-quote-figure">
          {five && (
            <p className="jr-stars">
              <span aria-hidden="true">★★★★★</span>
              <span className="jr-sr">5 von 5 Sternen</span>
            </p>
          )}
          <blockquote className="jr-quote">
            <p>„{quote.text}“</p>
          </blockquote>
          <figcaption>
            <span className="jr-kicker jr-quote-who">{quote.author}</span>
            {data.google && (
              <span className="jr-quote-source">Google-Bewertung</span>
            )}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { pickReviewQuote } from "../../artDirection/heroFacts";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import { galleryIsStock } from "../../PhotoCredits";
import { useSystem } from "../SystemContext";
import { figureNumbers } from "../shared";
import {
  WerkstoffChapter,
  chapterTitle,
  type WerkstoffSection,
} from "./sections";
import { galleryGroups } from "./offerData";

/**
 * Über uns, Menschen, Werkbank-Raster und Stimme nach Systemblatt
 * (Abschnitt 09, 11–15). Fotos warm gradiert (`--sys-image-filter`), unter
 * jedem Bild eine Mono-Zeile mit „Abb. n" (fortlaufend, lückenlos; das
 * Einstiegsfoto zählt nicht). Jedes Foto steht nur einmal auf der Seite
 * (werkstoffPhotos läuft vorher). Menschen als Porträts nur, wenn jedes
 * Mitglied ein echtes Foto hat — sonst Namenszeilen.
 */

type Props<T extends WerkstoffSection["type"]> = {
  section: Extract<WerkstoffSection, { type: T }>;
  sections: readonly WerkstoffSection[];
};

/** Abb.-Nummern: Das Einstiegsfoto trägt keine Bildzeile, zählt also nicht. */
export const werkstoffFigureNumbers = (
  sections: readonly WerkstoffSection[],
  hidden: readonly string[]
) => figureNumbers(sections, [...hidden, "hero-media"]);

/** Absätze aus Leerzeilen. */
export const paragraphs = (body: string): string[] =>
  body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

/** Mono-Zeile unter einem Bild: „Abb. n · Bildunterschrift". */
export function Caption({ n, text }: { n?: number; text?: string }) {
  if (n === undefined && !text) return null;
  return (
    <figcaption className="ws-data ws-caption">
      {n !== undefined && <span className="ws-abb">Abb. {n}</span>}
      {text && <span>{text}</span>}
    </figcaption>
  );
}

export function WerkstoffAbout({ section, sections }: Props<"about">) {
  const { data, blueprint } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const image = hidden.includes("about-media") ? undefined : section.imageUrl;
  const abb = werkstoffFigureNumbers(sections, hidden).about;
  const hasTeam = sections.some(s => s.type === "team");
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.about}
      name="about"
      className={image ? "ws-about--photo" : "ws-about--text"}
      title={chapterTitle("about", section.headline, blueprint)}
    >
      <div className="ws-about-grid">
        <div className="ws-about-text">
          {paragraphs(section.body).map((p, i) => (
            <p key={i}>{rich(p)}</p>
          ))}
          {hasTeam && (
            <p>
              <a className="ws-link" href={`#${SECTION_ANCHORS.team}`}>
                Das Team kennenlernen
              </a>
            </p>
          )}
        </div>
        {image && (
          <figure className="ws-about-photo">
            <img
              src={image}
              alt=""
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
            />
            <Caption n={abb} />
          </figure>
        )}
      </div>
    </WerkstoffChapter>
  );
}

export function WerkstoffTeam({ section }: Props<"team">) {
  const { blueprint } = useSystem();
  const portraits = section.members.every(m => m.imageUrl);
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.team}
      name="team"
      title={chapterTitle("team", section.headline, blueprint)}
    >
      {portraits ? (
        <ul className="ws-faces">
          {section.members.map((m, i) => (
            <li key={`${m.name}-${i}`}>
              <figure>
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  width={600}
                  height={750}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <span className="ws-face-name">{m.name}</span>
                  {m.role && (
                    <span className="ws-data ws-face-role">{m.role}</span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="ws-people">
          {section.members.map((m, i) => (
            <li key={`${m.name}-${i}`}>
              <span className="ws-people-name">{m.name}</span>
              {m.role && (
                <span className="ws-data ws-people-role">{m.role}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </WerkstoffChapter>
  );
}

/**
 * Werkbank-Raster: je Raster 2 bis 4 Fotos (großes Querformat, zwei
 * Hochformate, ein Band); viele Fotos → mehrere Raster nacheinander.
 */
export function WerkstoffGallery({ section, sections }: Props<"gallery">) {
  const { data, blueprint } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const first = werkstoffFigureNumbers(sections, hidden).gallery ?? 1;
  // Stockfotos nicht als eigene Arbeiten überschreiben (wie Journal/Raster).
  const own = galleryIsStock(data) ? undefined : section.headline;
  let at = 0;
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.gallery}
      name="gallery"
      title={chapterTitle("gallery", own, blueprint)}
    >
      {galleryGroups(section.images.length).map((n, g) => {
        const start = at;
        at += n;
        return (
          <ul className="ws-bench" data-n={n} key={g}>
            {section.images.slice(start, start + n).map((image, i) => (
              <li key={`${image.url}-${i}`}>
                <figure>
                  <div className="ws-bench-frame">
                    <img
                      src={image.url}
                      alt={image.alt}
                      width={1200}
                      height={900}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <Caption n={first + start + i} text={image.caption} />
                </figure>
              </li>
            ))}
          </ul>
        );
      })}
    </WerkstoffChapter>
  );
}

/** Anführungszeichen setzt das Markup; vorhandene aus dem Text entfernen. */
export const unquote = (text: string) =>
  text.trim().replace(/^[„"“»«‚']+|[“"”«»‘']+$/g, "");

/** Stimme: Google-Zeile (nur mit echten Zahlen), ein Zitat, Name. */
export function WerkstoffReviews({ section }: Props<"testimonials">) {
  const { data, blueprint } = useSystem();
  const quote = pickReviewQuote(section.items);
  if (!quote) return null;
  const id = SECTION_ANCHORS.testimonials;
  const google = data.google;
  const rating =
    google && google.reviewCount > 0 && google.rating > 0
      ? `${formatHeroRating(google.rating)} aus ${google.reviewCount.toLocaleString("de-DE")} Google-${google.reviewCount === 1 ? "Bewertung" : "Bewertungen"}`
      : undefined;
  return (
    <section
      id={id}
      className="ws-sec ws-testimonials"
      aria-labelledby={`${id}-titel`}
    >
      <div className="ws-wrap">
        <h2 className="ws-sr" id={`${id}-titel`}>
          {rich(chapterTitle("testimonials", section.headline, blueprint))}
        </h2>
        {rating && <p className="ws-data ws-rating">{rating}</p>}
        <figure className="ws-voice">
          <blockquote className="ws-quote-text">
            <p>„{rich(unquote(quote.text))}“</p>
          </blockquote>
          {quote.author && (
            <figcaption className="ws-voice-who">
              <span className="ws-voice-name">{quote.author}</span>
              {google && (
                <span className="ws-voice-source">Google-Bewertung</span>
              )}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

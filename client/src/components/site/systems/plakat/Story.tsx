import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import { galleryIsStock } from "../../PhotoCredits";
import { useSystem } from "../SystemContext";
import { versalEszett } from "../shared";
import { PlakatChapter, chapterTitle, type PlakatSection } from "./sections";
import { galleryGroups, unquote, voiceOf } from "./offerData";
import type { Field } from "./rhythm";

/**
 * Über uns, Team, Galerie und Stimme nach Systemblatt (Bausteine 10, Seiten
 * 12–14). Fotos sind Graustufe und multiplizieren sich auf die Farbe ihrer
 * Form (Duoton). Team im Kreis (ohne Foto: Monogramm im Kreis), Galerie als
 * stehende Pille, Bogen, liegende Pille — viele Fotos in Gruppen
 * nacheinander. Die Stimme steht groß in League Gothic, auf dem tiefen
 * Feld, wenn der Rhythmus es ihr gibt. Kein Text über Fotos.
 */

type Props<T extends PlakatSection["type"]> = {
  section: Extract<PlakatSection, { type: T }>;
  sections: readonly PlakatSection[];
  field: Field;
};

/** Absätze aus Leerzeilen. */
export const paragraphs = (body: string): string[] =>
  body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

/** Foto in Form (Duoton per CSS); Maße unbekannt: width/height gegen Sprünge. */
export function ShapePhoto({
  src,
  alt = "",
  shape,
  className = "",
  width = 900,
  height = 900,
}: {
  src: string;
  alt?: string;
  shape: "arch" | "circle" | "pill" | "pill-wide";
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className={`pk-shape pk-shape--${shape}${className ? ` ${className}` : ""}`}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function PlakatAbout({ section, sections, field }: Props<"about">) {
  const { data, blueprint } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const image = hidden.includes("about-media") ? undefined : section.imageUrl;
  const hasTeam = sections.some(s => s.type === "team");
  return (
    <PlakatChapter
      type="about"
      field={field}
      title={chapterTitle("about", section.headline, blueprint)}
      className={image ? "pk-about--photo" : undefined}
      aside={
        image ? (
          <div className="pk-about-media">
            <ShapePhoto src={image} shape="pill" width={900} height={1200} />
          </div>
        ) : undefined
      }
    >
      <div className="pk-prose">
        {paragraphs(section.body).map((p, i) => (
          <p key={i}>{rich(p)}</p>
        ))}
      </div>
      {hasTeam && (
        <p className="pk-more">
          <a className="pk-btn2" href={`#${SECTION_ANCHORS.team}`}>
            Das Team kennenlernen
          </a>
        </p>
      )}
    </PlakatChapter>
  );
}

/** Erster Buchstabe (inkl. Umlaut) für das Monogramm. */
const initial = (name: string) =>
  versalEszett(Array.from(name.trim())[0] ?? "").toUpperCase();

export function PlakatTeam({ section, field }: Props<"team">) {
  const { blueprint } = useSystem();
  return (
    <PlakatChapter
      type="team"
      field={field}
      title={chapterTitle("team", section.headline, blueprint)}
    >
      <ul className="pk-crew" data-n={section.members.length}>
        {section.members.map((m, i) => (
          <li key={`${m.name}-${i}`}>
            <figure>
              {m.imageUrl ? (
                <ShapePhoto src={m.imageUrl} alt={m.name} shape="circle" />
              ) : (
                <span className="pk-mono" aria-hidden="true">
                  {initial(m.name)}
                </span>
              )}
              <figcaption>
                <span className="pk-team-name">{versalEszett(m.name)}</span>
                {m.role && <span className="pk-team-role">{m.role}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </PlakatChapter>
  );
}

/** Formen einer Galerie-Gruppe in Reihenfolge (Systemblatt „Galerie"). */
const GROUP_SHAPES: Record<number, ("pill" | "arch" | "pill-wide")[]> = {
  1: ["pill-wide"],
  2: ["pill", "arch"],
  3: ["pill", "arch", "pill-wide"],
};

export function PlakatGallery({ section, field }: Props<"gallery">) {
  const { data, blueprint } = useSystem();
  // Stockfotos nicht als eigene Arbeiten überschreiben (wie Werkstoff).
  const own = galleryIsStock(data) ? undefined : section.headline;
  let at = 0;
  return (
    <PlakatChapter
      type="gallery"
      field={field}
      title={chapterTitle("gallery", own, blueprint)}
    >
      {galleryGroups(section.images.length).map((n, g) => {
        const start = at;
        at += n;
        const shapes = GROUP_SHAPES[n];
        return (
          <ul className="pk-gal" data-n={n} key={g}>
            {section.images.slice(start, start + n).map((image, i) => (
              <li key={`${image.url}-${i}`} className={`pk-gal-${shapes[i]}`}>
                <figure>
                  <ShapePhoto
                    src={image.url}
                    alt={image.alt}
                    shape={shapes[i]}
                    width={shapes[i] === "pill-wide" ? 1200 : 700}
                    height={shapes[i] === "pill-wide" ? 500 : 1100}
                  />
                  {image.caption && (
                    <figcaption className="pk-gal-cap">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        );
      })}
    </PlakatChapter>
  );
}

/** Lange Zitate laufen eine Stufe kleiner (Systemblatt: bis 90 Zeichen in Display). */
const QUOTE_LONG = 90;

/**
 * Stimme: Bewertungsschnitt als Kicker (nur echte Google-Zahlen), ein Satz
 * groß mit typografischen Anführungszeichen, Name und Quelle. Sterne nur,
 * wenn die gewählte Bewertung ausdrücklich 5 trägt.
 */
export function PlakatReviews({ section, field }: Props<"testimonials">) {
  const { data, blueprint } = useSystem();
  const voice = voiceOf(section.items);
  if (!voice) return null;
  const google = data.google;
  const rating =
    google && google.reviewCount > 0 && google.rating > 0
      ? `${formatHeroRating(google.rating)} von 5 · ${google.reviewCount.toLocaleString("de-DE")} ${google.reviewCount === 1 ? "Bewertung" : "Bewertungen"} bei Google`
      : undefined;
  return (
    <PlakatChapter
      type="testimonials"
      field={field}
      title={chapterTitle("testimonials", section.headline, blueprint)}
      hiddenTitle
    >
      <Voice
        text={voice.text}
        author={voice.author}
        kicker={rating}
        source={google ? "Google-Bewertung" : undefined}
        stars={voice.stars}
      />
    </PlakatChapter>
  );
}

/** Ein großer Satz mit Urheber (Stimme und Motto teilen ihn). */
export function Voice({
  text,
  author,
  kicker,
  source,
  stars = false,
}: {
  text: string;
  author?: string;
  kicker?: string;
  source?: string;
  stars?: boolean;
}) {
  const clean = unquote(text);
  return (
    <figure className="pk-voice">
      {(kicker || stars) && (
        <p className="pk-voice-kicker">
          {stars && (
            <span className="pk-stars" role="img" aria-label="5 von 5 Sternen">
              ★★★★★
            </span>
          )}
          {kicker && <span>{kicker}</span>}
        </p>
      )}
      <blockquote
        className={
          clean.length > QUOTE_LONG
            ? "pk-voice-text pk-voice-text--long"
            : "pk-voice-text"
        }
      >
        <p>„{rich(versalEszett(clean))}“</p>
      </blockquote>
      {author && (
        <figcaption className="pk-voice-who">
          <span className="pk-voice-name">{author}</span>
          {source && <span className="pk-voice-src">{source}</span>}
        </figcaption>
      )}
    </figure>
  );
}

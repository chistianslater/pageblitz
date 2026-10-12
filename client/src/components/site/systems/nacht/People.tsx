import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { rich } from "../../richText";
import { galleryIsStock } from "../../PhotoCredits";
import { useSystem } from "../SystemContext";
import { unquote, voiceList } from "../shared";
import { initials, paragraphs, ratingLine } from "./content";
import { NachtChapter } from "./sections";

/**
 * Menschen und Haus nach Systemblatt 10–13: Fotos mit System-Filter und
 * Schleier in Grundfarbe (dunkel, warm), Galerie versetzt wie das Bildpaar
 * der Karte, Gästestimme groß in Gilda mit Kupferlinie, Quelle und
 * Google-Note (nur echte Zahlen). Kein Text über Fotos.
 */

/** Foto im Nacht-Rahmen: Filter + Schleier (CSS); Maße nur gegen Sprünge. */
export function NightPhoto({
  src,
  alt = "",
  width = 1200,
  height = 1500,
  className = "nc-pic-frame",
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div className={className}>
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

function Prose({ text }: { text: string }) {
  return (
    <div className="nc-prose">
      {paragraphs(text).map((p, i) => (
        <p key={i}>{rich(p)}</p>
      ))}
    </div>
  );
}

export function NachtAbout({ section }: { section: SectionOf<"about"> }) {
  const { data } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const image = hidden.includes("about-media") ? undefined : section.imageUrl;
  return (
    <NachtChapter type="about" own={section.headline}>
      <div className={image ? "nc-about-body nc-about-body--photo" : "nc-about-body"}>
        <Prose text={section.body} />
        {image && <NightPhoto src={image} />}
      </div>
    </NachtChapter>
  );
}

export function NachtTeam({ section }: { section: SectionOf<"team"> }) {
  return (
    <NachtChapter type="team" own={section.headline}>
      <ul className="nc-crew">
        {section.members.map((m, i) => (
          <li className="nc-person" key={`${m.name}-${i}`}>
            {m.imageUrl ? (
              <NightPhoto
                src={m.imageUrl}
                width={600}
                height={800}
                className="nc-portrait"
              />
            ) : (
              <span className="nc-ring nc-ring--mono" aria-hidden="true">
                {initials(m.name)}
              </span>
            )}
            <div className="nc-person-text">
              <h3 className="nc-person-name">{m.name}</h3>
              {m.role && <p className="nc-item-text">{m.role}</p>}
            </div>
          </li>
        ))}
      </ul>
    </NachtChapter>
  );
}

export function NachtGallery({ section }: { section: SectionOf<"gallery"> }) {
  const { data } = useSystem();
  // Stockfotos nicht als eigene Bilder überschreiben (wie Klar).
  const own = galleryIsStock(data) ? undefined : section.headline;
  return (
    <NachtChapter type="gallery" own={own}>
      <ul className="nc-gal" data-n={section.images.length}>
        {section.images.map((image, i) => (
          <li key={`${image.url}-${i}`}>
            <figure className="nc-gal-fig">
              <NightPhoto
                src={image.url}
                alt={image.alt}
                width={800}
                height={1000}
              />
              {image.caption && (
                <figcaption className="nc-gal-cap">{image.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </NachtChapter>
  );
}

/** Höchstens so viele weitere Stimmen unter der großen. */
const MORE_VOICES = 2;

/**
 * Gästestimme (Systemblatt 11/16): die beste Stimme groß (voiceList:
 * zitierfähig, keine Kritik), darunter Name und — nur mit Google-Profil —
 * „Google"; danach bis zu zwei weitere ruhiger; zuletzt die Google-Note
 * (nur echte Zahlen). Kein erfundenes Datum.
 */
export function NachtVoices({
  section,
}: {
  section: SectionOf<"testimonials">;
}) {
  const { data } = useSystem();
  const voices = voiceList(section.items).slice(0, 1 + MORE_VOICES);
  if (voices.length === 0) return null;
  const rating = ratingLine(data);
  const source = data.google ? "Google" : undefined;
  return (
    <NachtChapter type="testimonials" own={section.headline}>
      <span className="nc-cl nc-cl--short" aria-hidden="true" />
      <div className="nc-voices">
        {voices.map((v, i) => (
          <figure
            className={i === 0 ? "nc-voice nc-voice--lead" : "nc-voice"}
            key={`${v.author}-${i}`}
          >
            <blockquote className="nc-voice-text">
              <p>„{rich(v.text)}“</p>
            </blockquote>
            <figcaption className="nc-voice-who">
              <b>{v.author}</b>
              {source && <span>{source}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {rating && (
        <p className="nc-rate">
          <span className="nc-rate-value">{rating.value}</span>
          <span>{rating.text}</span>
        </p>
      )}
    </NachtChapter>
  );
}

/* ── Extras ──────────────────────────────────────────────────────────── */

export function NachtStory({ section }: { section: SectionOf<"story"> }) {
  return (
    <NachtChapter type="story" own={section.headline}>
      <Prose text={section.body} />
    </NachtChapter>
  );
}

/** Leitsatz: mittig in Gilda mit Kupferlinie, Überschrift nur für Vorleser. */
export function NachtMotto({ section }: { section: SectionOf<"quote"> }) {
  return (
    <NachtChapter type="quote" hiddenTitle>
      <figure className="nc-motto">
        <span className="nc-vl" aria-hidden="true" />
        <blockquote>
          <p>„{rich(unquote(section.text))}“</p>
        </blockquote>
        {section.author && (
          <figcaption className="nc-motto-who">{section.author}</figcaption>
        )}
      </figure>
    </NachtChapter>
  );
}

export function NachtPartners({ section }: { section: SectionOf<"partners"> }) {
  return (
    <NachtChapter type="partners" own={section.headline}>
      <ul className="nc-logos">
        {section.items.map((item, i) => {
          // Logo-Maße unbekannt: width/height gegen Sprünge, Höhe regelt CSS.
          const img = (
            <img
              src={item.imageUrl}
              alt={item.name}
              width={160}
              height={64}
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
    </NachtChapter>
  );
}

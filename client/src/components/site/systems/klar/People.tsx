import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { rich } from "../../richText";
import { galleryIsStock } from "../../PhotoCredits";
import { useSystem } from "../SystemContext";
import { unquote } from "../shared";
import { klarVoices, monoInitials, paragraphs } from "./content";
import { ratingFact } from "./facts";
import { Icon } from "./icons";
import { KlarChapter } from "./sections";

/**
 * Menschen und Haus nach Systemblatt 10/13: Team als Monogramm-Kacheln
 * (Lind, Tau, Tief im Wechsel) oder Porträt im weichen Rahmen, Rolle aus
 * den Daten; Über uns mit Foto im Doppelrahmen; Galerie in weichen
 * Rahmen; Stimmen als ruhige Karten (Bewertung nur aus Google-Zahlen,
 * Sterne nur bei 5). Kein Text über Fotos.
 */

/** Foto im weichen Rahmen; Maße unbekannt: width/height nur gegen Sprünge. */
export function SoftPhoto({
  src,
  alt = "",
  width = 1200,
  height = 900,
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div className="kl-pic">
      <div className="kl-pic-in">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

export function KlarAbout({ section }: { section: SectionOf<"about"> }) {
  const { data } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const image = hidden.includes("about-media") ? undefined : section.imageUrl;
  return (
    <KlarChapter type="about" own={section.headline}>
      <div
        className={
          image ? "kl-about-grid kl-about-grid--photo" : "kl-about-grid"
        }
      >
        {image && <SoftPhoto src={image} />}
        <div className="kl-prose">
          {paragraphs(section.body).map((p, i) => (
            <p key={i}>{rich(p)}</p>
          ))}
        </div>
      </div>
    </KlarChapter>
  );
}

/** Kachel-Töne im Wechsel (Systemblatt: Lind, Tau, Tief). */
const MONO_TONES = 3;

export function KlarTeam({ section }: { section: SectionOf<"team"> }) {
  return (
    <KlarChapter type="team" own={section.headline}>
      <ul className="kl-crew" data-n={section.members.length}>
        {section.members.map((m, i) => (
          <li className="kl-person" key={`${m.name}-${i}`}>
            {m.imageUrl ? (
              <div className="kl-portrait">
                <img
                  src={m.imageUrl}
                  alt=""
                  width={600}
                  height={600}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : (
              <span
                className={`kl-mono kl-mono--${(i % MONO_TONES) + 1}`}
                aria-hidden="true"
              >
                {monoInitials(m.name)}
              </span>
            )}
            <div className="kl-person-text">
              <h3 className="kl-person-name">{m.name}</h3>
              {m.role && <p className="kl-person-role">{m.role}</p>}
            </div>
          </li>
        ))}
      </ul>
    </KlarChapter>
  );
}

export function KlarGallery({ section }: { section: SectionOf<"gallery"> }) {
  const { data } = useSystem();
  // Stockfotos nicht als eigene Praxisbilder überschreiben (wie Plakat).
  const own = galleryIsStock(data) ? undefined : section.headline;
  return (
    <KlarChapter type="gallery" own={own}>
      <ul className="kl-gal" data-n={section.images.length}>
        {section.images.map((image, i) => (
          <li key={`${image.url}-${i}`}>
            <figure className="kl-gal-fig">
              <SoftPhoto src={image.url} alt={image.alt} />
              {image.caption && (
                <figcaption className="kl-gal-cap">{image.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </KlarChapter>
  );
}

function Stars() {
  return (
    <p className="kl-stars" role="img" aria-label="5 von 5 Sternen">
      {[0, 1, 2, 3, 4].map(i => (
        <Icon key={i} name="star" />
      ))}
    </p>
  );
}

/**
 * Stimmen: erste Karte mit Google-Schnitt (nur echte Zahlen) und dem
 * besten Zitat groß, danach jede weitere zitierfähige Bewertung als
 * ruhige Karte. Quelle „Google-Bewertung" nur mit Google-Profil.
 */
export function KlarVoices({
  section,
}: {
  section: SectionOf<"testimonials">;
}) {
  const { data } = useSystem();
  const voices = klarVoices(section.items);
  if (voices.length === 0) return null;
  const rating = ratingFact(data);
  const source = data.google ? ", Google-Bewertung" : undefined;
  return (
    <KlarChapter type="testimonials" own={section.headline}>
      <div className="kl-voices" data-n={voices.length}>
        {voices.map((v, i) => (
          <figure
            className={i === 0 ? "kl-voice kl-voice--lead" : "kl-voice"}
            key={`${v.author}-${i}`}
          >
            {i === 0 && rating && (
              <p className="kl-voice-rate">
                <b>{rating.value}</b> <span>{rating.text}</span>
              </p>
            )}
            {v.stars && <Stars />}
            <blockquote className="kl-voice-text">
              <p>„{rich(v.text)}“</p>
            </blockquote>
            <figcaption className="kl-voice-who">
              {v.author}
              {source && <span className="kl-voice-src">{source}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </KlarChapter>
  );
}

/* ── Extras ──────────────────────────────────────────────────────────── */

export function KlarStory({ section }: { section: SectionOf<"story"> }) {
  return (
    <KlarChapter type="story" own={section.headline}>
      <div className="kl-prose">
        {paragraphs(section.body).map((p, i) => (
          <p key={i}>{rich(p)}</p>
        ))}
      </div>
    </KlarChapter>
  );
}

/** Leitsatz: ruhige getönte Karte, Überschrift nur für Vorleser. */
export function KlarMotto({ section }: { section: SectionOf<"quote"> }) {
  return (
    <KlarChapter type="quote" hiddenTitle>
      <figure className="kl-motto">
        <blockquote>
          <p>„{rich(unquote(section.text))}“</p>
        </blockquote>
        {section.author && (
          <figcaption className="kl-motto-who">{section.author}</figcaption>
        )}
      </figure>
    </KlarChapter>
  );
}

export function KlarPartners({ section }: { section: SectionOf<"partners"> }) {
  return (
    <KlarChapter type="partners" own={section.headline}>
      <ul className="kl-logos">
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
    </KlarChapter>
  );
}

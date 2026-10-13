import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { rich } from "../../richText";
import { galleryIsStock } from "../../PhotoCredits";
import { useSystem } from "../SystemContext";
import { unquote, voiceList } from "../shared";
import { initials, paragraphs, ratingBadge, tintOf } from "./content";
import { freundlichSrcSet } from "./Entry";
import { Icon } from "./icons";
import { FreundlichChapter, type Place } from "./sections";

/**
 * Menschen nach Systemblatt 7/8/12/13/17/18: Über uns mit weichem Foto,
 * Team mit Initialen im weißen Kreis auf Pastellkarten (Porträt nur, wenn
 * vorhanden), Galerie „eins groß, zwei klein" (runde Ecken), Stimmen als
 * Zettel in Pastell mit Initialen und Quelle, darunter die Google-Note
 * (nur echte Zahlen). Kein Text über Fotos, kein erfundenes Datum.
 */

const PHOTO_WIDTHS = [480, 640, 960, 1280] as const;

/** Foto im weichen Rahmen; srcSet nur für Unsplash. */
function Photo({
  src,
  alt = "",
  width,
  height,
  sizes,
}: {
  src: string;
  alt?: string;
  width: number;
  height: number;
  sizes: string;
}) {
  const srcSet = freundlichSrcSet(src, PHOTO_WIDTHS);
  return (
    <img
      src={src}
      {...(srcSet ? { srcSet, sizes } : {})}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );
}

function Prose({ text }: { text: string }) {
  return (
    <div className="fr-prose">
      {paragraphs(text).map((p, i) => (
        <p key={i}>{rich(p)}</p>
      ))}
    </div>
  );
}

export function FreundlichAbout({
  section,
  place,
}: {
  section: SectionOf<"about">;
  place: Place;
}) {
  const { data } = useSystem();
  const hidden = data.designProfile?.hiddenElements ?? [];
  const image = hidden.includes("about-media") ? undefined : section.imageUrl;
  return (
    <FreundlichChapter type="about" own={section.headline} place={place}>
      <div className={image ? "fr-about fr-about--photo" : "fr-about"}>
        <Prose text={section.body} />
        {image && (
          <figure className="fr-pic fr-pic--about">
            <Photo
              src={image}
              width={1200}
              height={900}
              sizes="(min-width: 48rem) 40vw, 92vw"
            />
          </figure>
        )}
      </div>
    </FreundlichChapter>
  );
}

/** Team auf Pastell 2: Karten in den übrigen Pastellen, Initialen im Kreis. */
export function FreundlichTeam({
  section,
  place,
}: {
  section: SectionOf<"team">;
  place: Place;
}) {
  if (section.members.length === 0) return null;
  const skip = place.surface === "tint2" ? 2 : undefined;
  return (
    <FreundlichChapter type="team" own={section.headline} place={place}>
      <ul className="fr-people">
        {section.members.map((m, i) => (
          <li
            className={`fr-person fr-tint-${tintOf(i, skip)}`}
            key={`${m.name}-${i}`}
          >
            {m.imageUrl ? (
              <span className="fr-avatar fr-avatar--photo">
                <Photo src={m.imageUrl} width={400} height={400} sizes="5rem" />
              </span>
            ) : (
              <span className="fr-avatar" aria-hidden="true">
                {initials(m.name)}
              </span>
            )}
            <div className="fr-person-text">
              <h3 className="fr-person-name">{m.name}</h3>
              {m.role && <p className="fr-offer-text">{m.role}</p>}
            </div>
          </li>
        ))}
      </ul>
    </FreundlichChapter>
  );
}

/** Galerie: eins groß, zwei klein (Systemblatt 8), danach im Raster. */
export function FreundlichGallery({
  section,
  place,
}: {
  section: SectionOf<"gallery">;
  place: Place;
}) {
  const { data } = useSystem();
  if (section.images.length === 0) return null;
  // Stockfotos nicht als eigene Bilder überschreiben (wie Klar/Nacht).
  const own = galleryIsStock(data) ? undefined : section.headline;
  return (
    <FreundlichChapter type="gallery" own={own} place={place}>
      <ul className="fr-gal" data-n={section.images.length}>
        {section.images.map((image, i) => (
          <li key={`${image.url}-${i}`}>
            <figure className="fr-pic">
              <Photo
                src={image.url}
                alt={image.alt}
                width={i === 0 ? 1200 : 800}
                height={i === 0 ? 900 : 800}
                sizes={
                  i === 0
                    ? "(min-width: 64rem) 56vw, 92vw"
                    : "(min-width: 64rem) 28vw, 46vw"
                }
              />
              {image.caption && (
                <figcaption className="fr-cap">{image.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </FreundlichChapter>
  );
}

/** Höchstens so viele Stimmen (Systemblatt 12/17: drei Zettel). */
const VOICES_MAX = 3;

/**
 * Stimmen: zitierfähige Bewertungen (voiceList: beste zuerst, keine
 * Kritik), je ein Zettel in Pastell, Initialen im weißen Kreis, Name und —
 * nur mit Google-Profil — „Google". Darunter die Note als Pille.
 */
export function FreundlichVoices({
  section,
  place,
}: {
  section: SectionOf<"testimonials">;
  place: Place;
}) {
  const { data } = useSystem();
  const voices = voiceList(section.items).slice(0, VOICES_MAX);
  if (voices.length === 0) return null;
  const rating = ratingBadge(data);
  const source = data.google ? "Google" : undefined;
  return (
    <FreundlichChapter
      type="testimonials"
      own={section.headline}
      place={place}
      layout="center"
    >
      <div className="fr-voices" data-n={voices.length}>
        {voices.map((v, i) => (
          <figure
            className={`fr-voice fr-tint-${tintOf(i + 3)}`}
            key={`${v.author}-${i}`}
          >
            <blockquote className="fr-voice-text">
              <p>„{rich(v.text)}“</p>
            </blockquote>
            <figcaption className="fr-who">
              <span className="fr-avatar fr-avatar--s" aria-hidden="true">
                {initials(v.author)}
              </span>
              <span>
                <b>{v.author}</b>
                {source && <small>{source}</small>}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      {rating && (
        <p className="fr-rate">
          <span className="fr-rate-value">
            <Icon name="star" />
            {rating.value}
          </span>
          <span>{rating.text}</span>
        </p>
      )}
    </FreundlichChapter>
  );
}

/* ── Extras ──────────────────────────────────────────────────────────── */

export function FreundlichStory({
  section,
  place,
}: {
  section: SectionOf<"story">;
  place: Place;
}) {
  if (!section.body?.trim()) return null;
  return (
    <FreundlichChapter type="story" own={section.headline} place={place}>
      <Prose text={section.body} />
    </FreundlichChapter>
  );
}

/** Leitsatz: mittig, groß, Überschrift nur für Vorleser. */
export function FreundlichQuote({
  section,
  place,
}: {
  section: SectionOf<"quote">;
  place: Place;
}) {
  if (!unquote(section.text ?? "").trim()) return null;
  return (
    <FreundlichChapter type="quote" place={place} hiddenTitle layout="center">
      <figure className="fr-motto">
        <blockquote>
          <p>„{rich(unquote(section.text))}“</p>
        </blockquote>
        {section.author && (
          <figcaption className="fr-motto-who">{section.author}</figcaption>
        )}
      </figure>
    </FreundlichChapter>
  );
}

/** Partner als weiße Kacheln mit Logo (Link im neuen Tab, wenn vorhanden). */
export function FreundlichPartners({
  section,
  place,
}: {
  section: SectionOf<"partners">;
  place: Place;
}) {
  if (section.items.length === 0) return null;
  return (
    <FreundlichChapter type="partners" own={section.headline} place={place}>
      <ul className="fr-logos">
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
                  <span className="fr-sr"> (öffnet in neuem Tab)</span>
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </FreundlichChapter>
  );
}

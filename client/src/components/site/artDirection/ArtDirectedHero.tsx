import React from "react";
import { ArrowUpRight } from "lucide-react";
import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../shared/siteContract/types";
import {
  ART_DIRECTIONS,
  artComposition,
} from "../../../../../shared/stylePacks/artDirection";
import { rich, stripMarks } from "../richText";
import { LAYOUT_SLOT } from "../layoutSlots";

type GoogleRating = NonNullable<WebsiteDataV2["google"]>;

/** Deutsche Schreibweise mit einer Nachkommastelle, z. B. „4,9". */
export function formatHeroRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Vertrauenssignal direkt an der Überschrift (Hero-Audit 2026-09-19):
 * Der erste Stern stand sonst erst 3000 px tiefer bei den Bewertungen. */
function HeroRating({ google }: { google: GoogleRating }) {
  const count = google.reviewCount.toLocaleString("de-DE");
  const label = google.reviewCount === 1 ? "Google-Bewertung" : "Google-Bewertungen";
  return (
    <span
      className="pb-art-rating"
      aria-label={`${formatHeroRating(google.rating)} von 5 Sternen bei ${count} ${label}`}
    >
      <span className="pb-art-rating-star" aria-hidden="true">
        ★
      </span>
      <b aria-hidden="true">{formatHeroRating(google.rating)}</b>
      <span aria-hidden="true">
        {count} {label}
      </span>
    </span>
  );
}

/** Server-renderable composition. Only genuine document content is rendered.
 * Layout and image hooks stay compatible with the studio and SSR enhancer.
 */
export function ArtDirectedHero({
  data,
  hero,
}: {
  data: WebsiteDataV2;
  hero: SectionOf<"hero">;
}) {
  const profile = data.designProfile;
  const layout = profile?.heroLayout;
  const hidden = profile?.hiddenElements?.includes("hero-media");
  const hasImage = Boolean(hero.imageUrl) && !hidden;
  const preferred = artComposition(data);
  const composition = !hasImage
    ? "statement"
    : layout === "centered" || layout === "compact"
      ? "statement"
      : layout === "image-first"
        ? "panorama"
        : layout === "collage"
          ? "portrait"
          : layout === "split" && preferred !== "portrait"
            ? "editorial"
            : preferred;
  const about = data.sections.find(
    (s): s is SectionOf<"about"> => s.type === "about"
  );
  const secondary =
    profile?.heroCollageImages !== undefined
      ? profile.heroCollageImages[0]
      : !data.hiddenSections?.includes("about") &&
          !profile?.hiddenElements?.includes("about-media") &&
          about?.imageUrl !== hero.imageUrl
        ? about?.imageUrl
        : undefined;
  const wordmark =
    hasImage &&
    ART_DIRECTIONS[data.stylePackId].emphasis === "expressive" &&
    data.businessName.length <= 18;
  return (
    <section
      id="start"
      className="pb-art-hero"
      data-art-composition={composition}
      data-art-layout={layout}
      data-art-mobile={profile?.heroLayoutMobile}
      data-art-image={hasImage ? "yes" : "no"}
      data-art-wordmark={wordmark ? "yes" : "no"}
    >
      <div className="pb-art-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
        {(data.businessCategory || data.google) && (
          <p className="pb-art-category">
            {data.businessCategory}
            {data.businessCategory && data.google && (
              <span className="pb-art-rating-sep" aria-hidden="true">
                ·
              </span>
            )}
            {data.google && <HeroRating google={data.google} />}
          </p>
        )}
        <h1
          data-art-long={
            stripMarks(hero.headline).length > 65 ? "yes" : undefined
          }
        >
          {rich(hero.headline)}
        </h1>
        {hero.subheadline && (
          <p className="pb-art-intro">{rich(hero.subheadline)}</p>
        )}
        {hero.ctaText && (
          <a className="pb-art-cta" href={hero.ctaHref ?? "#kontakt"}>
            {hero.ctaText}
            <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        )}
      </div>
      {hasImage && (
        <figure className="pb-art-media" data-pb-slot={LAYOUT_SLOT.heroMedia}>
          <img
            src={hero.imageUrl}
            alt=""
            loading="eager"
            fetchPriority="high"
          />
        </figure>
      )}
      {hasImage && composition === "portrait" && secondary && (
        <figure className="pb-art-secondary">
          <img src={secondary} alt="" loading="lazy" />
        </figure>
      )}
      {wordmark && (
        <div className="pb-art-wordmark" aria-hidden="true">
          {data.businessName}
        </div>
      )}
    </section>
  );
}

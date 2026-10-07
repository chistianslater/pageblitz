import {
  blueprintFor,
  tradeLabel,
} from "../../../../../shared/stylePacks/blueprints";
import { EntryContext, EntryMenuSlot, EntryTrust } from "./entrySections";
import { menuLink } from "./entryGastro";
import React, { useContext } from "react";
import { ArrowUpRight } from "lucide-react";
import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../shared/siteContract/types";
import {
  ART_DIRECTIONS,
  artComposition,
  entryVariant,
  entryVariantIndex,
} from "../../../../../shared/stylePacks/artDirection";
import { rich, stripMarks } from "../richText";
import { LAYOUT_SLOT } from "../layoutSlots";
import { bandQuote, streetLine, telHref, todayLine } from "./heroFacts";

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
/** Kategorie für die Kopfzeile — bei Handwerkern das Gewerk statt „Hersteller". */
function categoryLabel(data: WebsiteDataV2): string | undefined {
  return blueprintFor(
    data.businessCategory,
    data.businessName,
    data.blueprintFamily
  ).id === "trade"
    ? tradeLabel(data.businessCategory, data.businessName)
    : data.businessCategory;
}

function HeroRating({ google }: { google: GoogleRating }) {
  const count = google.reviewCount.toLocaleString("de-DE");
  const label =
    google.reviewCount === 1 ? "Google-Bewertung" : "Google-Bewertungen";
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
/** Bewertung als großes Zeichen (Bühne) bzw. runder Aufkleber (Farbfläche). */
function RatingMark({
  google,
  className,
}: {
  google: GoogleRating;
  className: string;
}) {
  const count = google.reviewCount.toLocaleString("de-DE");
  const label =
    google.reviewCount === 1 ? "Google-Bewertung" : "Google-Bewertungen";
  return (
    <p
      className={className}
      aria-label={`${formatHeroRating(google.rating)} von 5 Sternen bei ${count} ${label}`}
    >
      <b aria-hidden="true">{formatHeroRating(google.rating)}</b>
      <span aria-hidden="true">
        <span className="pb-art-stars">★★★★★</span>
        {count} {label}
      </span>
    </p>
  );
}

/** Hauptaktion plus Anruf — die zwei Dinge, für die man die Seite öffnet. */
function EntryActions({
  hero,
  phone,
}: {
  hero: SectionOf<"hero">;
  phone?: string;
}) {
  const tel = telHref(phone);
  // Gastro: neben der Hauptaktion die Karte statt der Telefonnummer.
  const menu = menuLink(useContext(EntryContext));
  if (!hero.ctaText && !tel) return null;
  const external = hero.ctaHref?.startsWith("http");
  return (
    <div className="pb-art-actions">
      {hero.ctaText && (
        <a
          className="pb-art-cta"
          href={hero.ctaHref ?? "#kontakt"}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {hero.ctaText}
          <ArrowUpRight size={19} aria-hidden="true" />
        </a>
      )}
      {menu ? (
        <a className="pb-art-call" href={menu.href}>
          {menu.label}
        </a>
      ) : (
        tel && (
          <a className="pb-art-call" href={tel}>
            {phone}
          </a>
        )
      )}
    </div>
  );
}

/**
 * Einstiege „Bühne" und „Farbfläche" (2026-10-05). Getrennt vom bisherigen
 * Hero, damit dessen Markup für bestehende Seiten unverändert bleibt.
 */
function EntryHero({
  data,
  hero,
  composition,
  secondary,
  third,
  now,
}: {
  data: WebsiteDataV2;
  hero: SectionOf<"hero">;
  composition: "stage" | "colorfield";
  secondary?: string;
  /** Drittes Foto für den Fächer der Farbfläche. */
  third?: string;
  now: Date;
}) {
  const profile = data.designProfile;
  const contact = data.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const today = todayLine(contact?.openingHours, now);
  const place = [streetLine(contact?.street), contact?.city]
    .filter(Boolean)
    .join(" · ");
  const nameLength = data.businessName.length;
  const stage = composition === "stage";
  const testimonials = data.hiddenSections?.includes("testimonials")
    ? undefined
    : data.sections.find(
        (s): s is SectionOf<"testimonials"> => s.type === "testimonials"
      );
  const quote = bandQuote(
    testimonials?.items,
    data.google,
    entryVariantIndex(data.stylePackId, profile?.entryVariant)
  );
  return (
    <>
      <section
        id="start"
        className="pb-art-hero"
        data-art-composition={composition}
        data-art-variant={entryVariant(
          data.stylePackId,
          composition,
          profile?.entryVariant
        )}
        data-art-layout={profile?.heroLayout}
        data-art-mobile={profile?.heroLayoutMobile}
        data-art-image="yes"
        data-art-wordmark="no"
        data-art-name={
          nameLength > 22 ? "long" : nameLength > 12 ? "mid" : "short"
        }
      >
        {stage && (
          <figure className="pb-art-media" data-pb-slot={LAYOUT_SLOT.heroMedia}>
            <img
              src={hero.imageUrl}
              alt=""
              loading="eager"
              fetchPriority="high"
            />
          </figure>
        )}
        <div className="pb-art-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
          {(stage ? today : today || place) && (
            <p className="pb-art-today">
              {stage ? today : [today, place].filter(Boolean).join(" · ")}
            </p>
          )}
          {stage ? (
            <>
              <p className="pb-art-category">
                {[categoryLabel(data), place].filter(Boolean).join(" · ")}
              </p>
              <h1 className="pb-art-name">{data.businessName}</h1>
              <p className="pb-art-intro">{rich(hero.headline)}</p>
            </>
          ) : (
            <>
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
            </>
          )}
          <div className="pb-art-entry-row">
            {stage && data.google && (
              <RatingMark google={data.google} className="pb-art-score" />
            )}
            <EntryActions hero={hero} phone={contact?.phone} />
          </div>
        </div>
        {!stage && (
          <div className="pb-art-cards">
            <figure
              className="pb-art-media"
              data-pb-slot={LAYOUT_SLOT.heroMedia}
            >
              <img
                src={hero.imageUrl}
                alt=""
                loading="eager"
                fetchPriority="high"
              />
            </figure>
            {secondary && (
              <figure className="pb-art-secondary">
                <img src={secondary} alt="" loading="lazy" />
              </figure>
            )}
            {third && (
              <figure className="pb-art-third">
                <img src={third} alt="" loading="lazy" />
              </figure>
            )}
            {data.google && (
              <RatingMark google={data.google} className="pb-art-sticker" />
            )}
          </div>
        )}
      </section>
      <EntryTrust />
      {quote && (
        <aside className="pb-entry-quote" data-entry={composition}>
          <blockquote>
            <p>„{quote.text}“</p>
            <footer>{quote.author} · Google-Bewertung</footer>
          </blockquote>
        </aside>
      )}
      <EntryMenuSlot />
    </>
  );
}

export function ArtDirectedHero({
  data,
  hero,
  now = new Date(),
}: {
  data: WebsiteDataV2;
  hero: SectionOf<"hero">;
  now?: Date;
}) {
  const profile = data.designProfile;
  const layout = profile?.heroLayout;
  const hidden = profile?.hiddenElements?.includes("hero-media");
  const hasImage = Boolean(hero.imageUrl) && !hidden;
  const preferred = artComposition(data);
  // Die neuen Einstiege gelten, solange das Layout zu ihnen passt. Wählt der
  // Kunde im Studio ein anderes Hero-Layout, greift die alte Zuordnung.
  const entry =
    hasImage &&
    ((preferred === "stage" && layout === "banner") ||
      (preferred === "colorfield" && layout === "collage"))
      ? preferred
      : undefined;
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
  if (entry) {
    const gallery = data.sections.find(
      (s): s is SectionOf<"gallery"> => s.type === "gallery"
    );
    // Eine bewusst leere Kartenwahl im Studio bleibt leer.
    const cardImage =
      profile?.heroCollageImages !== undefined
        ? secondary
        : (secondary ??
          gallery?.images.find(img => img.url !== hero.imageUrl)?.url);
    const third =
      profile?.heroCollageImages !== undefined
        ? profile.heroCollageImages[1]
        : gallery?.images.find(
            img => img.url !== hero.imageUrl && img.url !== cardImage
          )?.url;
    return (
      <EntryHero
        data={data}
        hero={hero}
        composition={entry}
        secondary={cardImage}
        third={
          entryVariant(data.stylePackId, entry, profile?.entryVariant) ===
          "stack"
            ? third
            : undefined
        }
        now={now}
      />
    );
  }
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
            {categoryLabel(data)}
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

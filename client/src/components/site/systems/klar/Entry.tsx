import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { useSystem } from "../SystemContext";
import { contactOf, heroPhoto, nameOf, visibleDoc } from "../shared";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import {
  entryHeadline,
  entryKicker,
  entryLede,
  entryVariant,
  factChips,
  hoursLabel,
  klarActions,
  ratingFact,
  type Action,
  type EntryVariant,
} from "./facts";
import { eveningHours, hoursRows, todayHours } from "./hours";
import { KlarHoursCard, KlarTodayCard } from "./HoursCard";
import { Icon } from "./icons";

/**
 * Klar-Einstieg nach Systemblatt 8 (Handy) und 12 (Desktop): helle
 * Fläche mit Kicker-Pille, großer Zeile, Satz, Termin- und Telefon-Knopf;
 * darunter (Desktop rechts) das Bild nach `entryVariant` (facts.ts),
 * dann Fakten-Chips und Bewertung — nur aus Daten. Genau ein h1 mit dem
 * Anzeigenamen: Mit eigener großer Zeile steht der Name in der Pille,
 * sonst ist der Name selbst die große Zeile.
 */

/** Breiten für das Einstiegsfoto (Handy, Tablet, Desktop-Spalte in 2×). */
const ENTRY_WIDTHS = [640, 960, 1400] as const;

/** Unsplash in passenden Breiten; andere Quellen bleiben, wie sie sind. */
export function entrySrcSet(src: string): string | undefined {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }
  if (url.hostname !== "images.unsplash.com") return undefined;
  return ENTRY_WIDTHS.map(w => {
    url.searchParams.set("w", String(w));
    return `${url.toString()} ${w}w`;
  }).join(", ");
}

function Photo({ src, small }: { src: string; small: boolean }) {
  const srcSet = entrySrcSet(src);
  return (
    <figure className="kl-frame">
      <div className="kl-frame-in">
        <img
          src={src}
          {...(srcSet
            ? {
                srcSet,
                sizes: small
                  ? "(min-width: 56.25rem) 20vw, 45vw"
                  : "(min-width: 56.25rem) 45vw, 90vw",
              }
            : {})}
          alt=""
          width={small ? 900 : 1200}
          height={small ? 1200 : 900}
          loading="eager"
          fetchPriority="high"
        />
      </div>
    </figure>
  );
}

function Media({ variant, photo }: { variant: EntryVariant; photo?: string }) {
  const { data, blueprint, now } = useSystem();
  const hours = contactOf(visibleDoc(data).sections)?.openingHours;
  if (variant === "text") return null;
  if (variant === "hours")
    return (
      <div className="kl-entry-media">
        <KlarHoursCard
          id="start-zeiten"
          label={hoursLabel(blueprint)}
          rows={hoursRows(hours, now)}
          className="kl-hours--entry"
        />
      </div>
    );
  const today = todayHours(hours, now);
  if (variant === "photo")
    return (
      <div className="kl-entry-media">
        <div className={today ? "kl-stage kl-stage--card" : "kl-stage"}>
          <Photo src={photo!} small={false} />
          {today && <KlarTodayCard today={today} />}
        </div>
      </div>
    );
  const evening = eveningHours(hours);
  const side = evening ? (
    <div className="kl-side">
      <span className="kl-tile kl-tile--f2">
        <Icon name="moon" />
      </span>
      <p>
        <span className="kl-side-days">{evening.days}</span>
        <b className="kl-side-until">{evening.until}</b>
      </p>
    </div>
  ) : today ? (
    <div className="kl-side">
      <span className="kl-tile kl-tile--f2">
        <Icon name="clock" />
      </span>
      <p>
        <span className="kl-side-days">Heute, {today.day}</span>
        {today.lines.map(line => (
          <b key={line} className="kl-side-line">
            {line}
          </b>
        ))}
      </p>
    </div>
  ) : null;
  return (
    <div className="kl-entry-media">
      <div className={side ? "kl-duo" : "kl-duo kl-duo--solo"}>
        <Photo src={photo!} small />
        {side}
      </div>
    </div>
  );
}

function Buttons({ primary, second }: { primary: Action; second?: Action }) {
  return (
    <div className="kl-entry-actions" {...SYS_ACTIONS}>
      <a className="kl-btn kl-btn--p" href={primary.href}>
        {primary.label}
        <span className="kl-btn-ic">
          <Icon name={primary.href.startsWith("tel:") ? "phone" : "calendar"} />
        </span>
      </a>
      {second && (
        <a className="kl-btn kl-btn--s" href={second.href}>
          {second.href.startsWith("tel:") && <Icon name="phone" />}
          {second.label}
        </a>
      )}
    </div>
  );
}

export function KlarEntry({ hero }: { hero: SectionOf<"hero"> }) {
  const { data, blueprint } = useSystem();
  const variant = entryVariant(data, hero);
  const city = contactOf(visibleDoc(data).sections)?.city?.trim() || undefined;
  const name = nameOf(data);
  const headline = entryHeadline(hero, data, blueprint);
  const lede = entryLede(hero, headline);
  const kicker = entryKicker(data, blueprint);
  const photo = heroPhoto(data, hero);
  const { primary, second } = klarActions(data, blueprint);
  const chips = factChips(data);
  const rating = ratingFact(data);

  return (
    <section
      id={SECTION_ANCHORS.hero}
      className={`kl-entry kl-entry--${variant}`}
      aria-labelledby="start-titel"
    >
      <div className="kl-entry-panel">
        <div className="kl-entry-text">
          {headline ? (
            <div className="kl-pill">
              <h1 id="start-titel" className="kl-pill-name">
                {name}
              </h1>
              {city && <span> in {city}</span>}
            </div>
          ) : (
            kicker && <p className="kl-pill">{kicker}</p>
          )}
          {headline ? (
            <p className="kl-display">{headline}</p>
          ) : (
            <h1 id="start-titel" className="kl-display">
              {name}
            </h1>
          )}
          {lede && <p className="kl-entry-lede">{lede}</p>}
        </div>
        {primary && <Buttons primary={primary} second={second} />}
        <Media variant={variant} photo={photo} />
        {(chips.length > 0 || rating) && (
          <div className="kl-entry-facts">
            {chips.length > 0 && (
              <ul className="kl-chips" aria-label="Auf einen Blick">
                {chips.map(c => (
                  <li key={c.label} className="kl-chip">
                    <Icon name={c.icon} />
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
            {rating && (
              <p className="kl-rate">
                <b>{rating.value}</b> <span>{rating.text}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { displayName } from "../../../../../../shared/designSystems/displayName";
import { RASTER } from "../../../../../../shared/designSystems/raster";
import { SECTION_ANCHORS } from "../../engine";
import { useSystem } from "../SystemContext";
import { contactOf } from "../shared";
import { REFERENCE_COLUMN_REM, fitWordmark, wordWidthEm } from "./fit";
import {
  entryKicker,
  entryLede,
  entryVariant,
  googleFact,
  heroPhoto,
  isRoundTheClock,
  todayFact,
} from "./facts";

/**
 * Raster-Einstieg nach Systemblatt 6 (Erster Blick, Handy) und 10 (Desktop):
 * die Wortmarke füllt die Spalte (Fit aus der Geist-Tabelle, ohne JS),
 * genau ein h1 mit dem Anzeigenamen. Drei Fassungen — welche, entscheidet
 * `entryVariant` aus Foto, Querformat und Papier (Tabelle in facts.ts):
 *  - plate: Papier, Kicker, Wortmarke, Satz, S/W-Tafel unten (Kanzlei)
 *  - bleed: S/W-Foto vollflächig, Wortmarke darüber, Satz unten (Werkstatt)
 *  - type:  nur Schrift zwischen Haarlinien, „24/7" nur bei 24-h-Zeiten
 */

/** Wortmarke: gewandertes Gewerk bleibt für Vorleser im h1 (unsichtbar). */
function Wordmark({ name, tight }: { name: string; tight?: boolean }) {
  const fit = fitWordmark(name, REFERENCE_COLUMN_REM);
  const moved = fit.kickerWord;
  const before = moved && name.startsWith(moved);
  const style = { "--rs-fit": fit.widthEm.toFixed(3) } as React.CSSProperties;
  return (
    <div className="rs-fit">
      <h1
        id="start-titel"
        className={
          fit.belowFloor || tight
            ? "rs-wordmark rs-wordmark--tight"
            : "rs-wordmark"
        }
        style={style}
      >
        {moved && before && <span className="rs-sr">{moved} </span>}
        {fit.wordmark}
        {moved && !before && <span className="rs-sr"> {moved}</span>}
      </h1>
    </div>
  );
}

/** „24/7" in der Ziffern-Stufe, so breit wie die Spalte es trägt. */
const ROUND_CLOCK_FIT = wordWidthEm(
  "24/7",
  parseFloat(RASTER.type.figure!.track)
).toFixed(3);

export function RasterEntry({ hero }: { hero: SectionOf<"hero"> }) {
  const { data, blueprint, now } = useSystem();
  const contact = contactOf(data.sections);
  const city = contact?.city?.trim() || undefined;
  const name = displayName(data.businessName);
  const { kickerWord } = fitWordmark(name, REFERENCE_COLUMN_REM);
  const variant = entryVariant(data, hero);
  const photo = heroPhoto(data, hero);
  const kicker = entryKicker(data, blueprint, city, kickerWord);
  const lede = entryLede(hero, data, city);
  const allDay = isRoundTheClock(contact?.openingHours);
  const facts = [
    todayFact(contact?.openingHours, now),
    googleFact(data.google),
  ].filter((f): f is string => Boolean(f));

  const status = allDay && (
    <p className="rs-entry-status">
      <span className="rs-live">Jetzt erreichbar</span>
    </p>
  );
  const factList = facts.length > 0 && (
    <ul className="rs-entry-facts" aria-label="Auf einen Blick">
      {facts.map(f => (
        <li key={f}>{f}</li>
      ))}
    </ul>
  );

  return (
    <section
      id={SECTION_ANCHORS.hero}
      className={`rs-entry rs-entry--${variant}`}
      aria-labelledby="start-titel"
    >
      {variant === "bleed" && photo && (
        <>
          <img
            className="rs-entry-bg"
            src={photo}
            alt=""
            width={1600}
            height={1000}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="rs-entry-scrim" aria-hidden="true" />
        </>
      )}
      <div className="rs-wrap rs-entry-in">
        {variant === "bleed" ? (
          <div className="rs-entry-top">
            <Wordmark name={name} />
            {kicker && <p className="rs-entry-kicker">{kicker}</p>}
          </div>
        ) : (
          <>
            {(kicker || status) && (
              <div className="rs-entry-row">
                {kicker && <p className="rs-entry-kicker">{kicker}</p>}
                {variant === "type" && status}
              </div>
            )}
            <Wordmark name={name} />
          </>
        )}
        {variant === "type" && allDay && (
          <p className="rs-entry-clock" aria-label="Rund um die Uhr erreichbar">
            <span
              aria-hidden="true"
              style={{ "--rs-fit": ROUND_CLOCK_FIT } as React.CSSProperties}
            >
              24/7
            </span>
          </p>
        )}
        <div className="rs-entry-bottom">
          {lede && <p className="rs-entry-lede">{lede}</p>}
          {variant !== "type" && status}
          {factList}
        </div>
      </div>
      {variant === "plate" && photo && (
        <figure className="rs-entry-plate">
          <img
            src={photo}
            alt=""
            width={1600}
            height={1200}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </figure>
      )}
    </section>
  );
}

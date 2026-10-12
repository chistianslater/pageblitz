import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { WERKSTOFF } from "../../../../../../shared/designSystems/werkstoff";
import { SECTION_ANCHORS } from "../../engine";
import { useSystem } from "../SystemContext";
import { contactOf, googleFact, heroPhoto } from "../shared";
import {
  earlyWeekdays,
  entryActions,
  entryHeadline,
  entryKicker,
  entryLede,
  entryVariant,
  nameOf,
  todayStatus,
  visibleDoc,
  type EntryVariant,
} from "./facts";
import { fitName } from "./fit";
import { WerkstoffSlip } from "./Slip";
import { SYS_ACTIONS } from "../shared/dockAutoHide";

/**
 * Werkstoff-Einstieg nach Systemblatt 8 (Handy) und 14 (Desktop). Genau ein
 * h1 mit dem Anzeigenamen. Welche Fassung, entscheidet `entryVariant`
 * (Tabelle in facts.ts):
 *  - photo/portrait: Kicker mit Name, große Zeile, Satz, Foto randlos,
 *    Werkzettel über der Bildkante; Desktop Text links, Foto rechts
 *  - time: Bäckerei/Café — frühe Öffnung als Ziffer, Satz, Heute-Stand,
 *    dann Foto (ohne Foto: Zettel)
 *  - type: kein brauchbares Foto — Name füllt die Breite, Zettel trägt
 * Ohne eigene große Zeile (Überschrift verdoppelt nur Kicker/Namen) trägt
 * der Name selbst die große Zeile.
 */

const FIT_TRACK = parseFloat(WERKSTOFF.type.display.track);

/** Kicker-Zeile; mit großer Zeile steht das h1 (Name) darin. */
function Kicker({
  name,
  city,
  fallback,
  named,
}: {
  name: string;
  city?: string;
  fallback: string;
  named: boolean;
}) {
  if (!named) return fallback ? <p className="ws-entry-kicker">{fallback}</p> : null;
  return (
    <div className="ws-entry-kicker">
      <h1 id="start-titel" className="ws-entry-name">
        {name}
      </h1>
      {city && <span>, {city}</span>}
    </div>
  );
}

/** Name füllt die Breite (Typo-Einstieg): Zeilen aus fit.ts, Größe per CSS. */
function FitName({ name }: { name: string }) {
  const { lines, widthEm } = fitName(name, 2, FIT_TRACK);
  return (
    <h1
      id="start-titel"
      className="ws-entry-fit"
      style={{ "--ws-fit": widthEm.toFixed(3) } as React.CSSProperties}
    >
      {lines.map((line, i) => (
        <React.Fragment key={`${line}-${i}`}>
          {i > 0 && " "}
          <span>{line}</span>
        </React.Fragment>
      ))}
    </h1>
  );
}

/** Breiten für das Einstiegsfoto (Handy, Tablet, Desktop-Hälfte in 2×). */
const ENTRY_WIDTHS = [640, 960, 1400] as const;

/**
 * Unsplash-Fotos in passenden Breiten (LCP am Handy: kein 1400er-Bild für
 * 412 px). Andere Quellen (Kundenfotos, R2) bleiben, wie sie sind.
 */
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

function Photo({ src, variant }: { src: string; variant: EntryVariant }) {
  const portrait = variant === "portrait";
  const srcSet = entrySrcSet(src);
  return (
    <div className="ws-entry-crop">
      <img
        className="ws-entry-img"
        src={src}
        {...(srcSet
          ? { srcSet, sizes: "(min-width: 56.25rem) 50vw, 100vw" }
          : {})}
        alt=""
        width={portrait ? 1200 : 1600}
        height={portrait ? 1500 : 1000}
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
}

export function WerkstoffEntry({ hero }: { hero: SectionOf<"hero"> }) {
  const { data, blueprint, now } = useSystem();
  const variant = entryVariant(data, hero, blueprint);
  const contact = contactOf(visibleDoc(data).sections);
  const city = contact?.city?.trim() || undefined;
  const name = nameOf(data);
  const kicker = entryKicker(data, blueprint);
  const headline = entryHeadline(hero, data, blueprint);
  const lede = entryLede(hero, headline);
  const photo = heroPhoto(data, hero);
  const actions = entryActions(data, blueprint);
  const fact = googleFact(data.google);

  const big = headline ? (
    <p className="ws-entry-head">{headline}</p>
  ) : (
    <h1 id="start-titel" className="ws-entry-head">
      {name}
    </h1>
  );
  const buttons = actions.length > 0 && (
    <p className="ws-entry-actions" {...SYS_ACTIONS}>
      {actions.map((a, i) => (
        <a key={a.href} className={i === 0 ? "ws-btn" : "ws-btn2"} href={a.href}>
          {a.label}
        </a>
      ))}
    </p>
  );

  let text: React.ReactNode;
  let media: React.ReactNode;
  if (variant === "type") {
    const typeLede = [headline, lede].filter(Boolean).join(" ");
    text = (
      <>
        {kicker && <p className="ws-entry-kicker">{kicker}</p>}
        <FitName name={name} />
        {typeLede && <p className="ws-entry-lede">{typeLede}</p>}
        {buttons}
      </>
    );
    media = <WerkstoffSlip />;
  } else if (variant === "time") {
    const today = todayStatus(contact?.openingHours, now);
    const early = earlyWeekdays(contact?.openingHours);
    text = (
      <>
        <Kicker name={name} city={city} fallback={kicker} named={Boolean(headline)} />
        <p className="ws-entry-figure">
          <span className="ws-sr">{early?.weekdays ? "Werktags ab " : "Ab "}</span>
          {early?.time}
          <span className="ws-sr"> Uhr geöffnet</span>
        </p>
        {big}
        {today && (
          <p className="ws-entry-today">
            <span className="ws-dot" aria-hidden="true" />
            {today.line}
          </p>
        )}
        {buttons}
      </>
    );
    media = photo ? <Photo src={photo} variant={variant} /> : <WerkstoffSlip />;
  } else {
    text = (
      <>
        <Kicker name={name} city={city} fallback={kicker} named={Boolean(headline)} />
        {big}
        {lede && <p className="ws-entry-lede">{lede}</p>}
        {buttons}
      </>
    );
    media = (
      <>
        {photo && <Photo src={photo} variant={variant} />}
        <WerkstoffSlip />
      </>
    );
  }

  return (
    <section
      id={SECTION_ANCHORS.hero}
      className={`ws-entry ws-entry--${variant}`}
      aria-labelledby="start-titel"
    >
      <div className="ws-entry-grid">
        <div className="ws-entry-text">{text}</div>
        <div className="ws-entry-media">{media}</div>
        {fact && variant !== "time" && (
          <ul className="ws-entry-info">
            <li>{fact}</li>
          </ul>
        )}
      </div>
    </section>
  );
}

import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { PLAKAT } from "../../../../../../shared/designSystems/plakat";
import { SECTION_ANCHORS } from "../../engine";
import { useSystem } from "../SystemContext";
import { contactOf, heroPhoto, nameOf, versalEszett, visibleDoc } from "../shared";
import {
  entryFacts,
  entryHeadline,
  entryLede,
  entrySecond,
  entrySticker,
  entryVariant,
  plakatActions,
  type EntryVariant,
} from "./facts";
import { staggerLines } from "./fit";
import { statusLine } from "./hours";
import type { Field } from "./rhythm";
import { PlakatSticker } from "./Sticker";

/**
 * Plakat-Einstieg nach Systemblatt 8 (Handy) und 15 (Desktop). Genau ein
 * h1 mit dem Anzeigenamen: Mit eigener großer Zeile steht der Name klein
 * über ihr, sonst ist der Name selbst die große Zeile. Fassung aus
 * `entryVariant` (Tabelle in facts.ts):
 *  - arch: Grund, Bogen-Foto rechts eingerückt, Sticker an der Bogenkante
 *  - circle: helles Feld, Kreis-Foto (Essen), Sticker tief am Kreis
 *  - type: kein brauchbares Foto — Schrift auf hellem Feld, Sticker in
 *    der Ecke neben der Status-Zeile
 */

const TRACK = parseFloat(PLAKAT.type.display.track);

/** Große Zeile in Staffel (Zeilen und Breite aus fit.ts, Größe per CSS). */
function Display({ text, h1 }: { text: string; h1: boolean }) {
  const { lines, indent, widthEm } = staggerLines(text, TRACK);
  const Tag = h1 ? "h1" : "p";
  const id = h1 ? { id: "start-titel" } : {};
  const flow = lines.length === 0;
  return (
    <div className="pk-fit">
      <Tag
        {...id}
        className={flow ? "pk-display pk-display--flow" : "pk-display"}
        style={flow ? undefined : ({ "--pk-fit": widthEm.toFixed(3) } as React.CSSProperties)}
      >
        {flow
          ? versalEszett(text)
          : lines.map((line, i) => (
              <React.Fragment key={`${line}-${i}`}>
                {i > 0 && " "}
                <span className={i === indent ? "pk-in" : undefined}>{versalEszett(line)}</span>
              </React.Fragment>
            ))}
      </Tag>
    </div>
  );
}

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

/** Foto in Form (Bogen/Kreis), Duoton per CSS (grau + multiply auf Feld). */
function Shape({ src, variant }: { src: string; variant: EntryVariant }) {
  const srcSet = entrySrcSet(src);
  const circle = variant === "circle";
  return (
    <div className={`pk-shape pk-shape--${circle ? "circle" : "arch"}`}>
      <img
        src={src}
        {...(srcSet ? { srcSet, sizes: "(min-width: 56.25rem) 40vw, 80vw" } : {})}
        alt=""
        width={circle ? 1200 : 1200}
        height={circle ? 1200 : 1500}
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
}

export function PlakatEntry({
  hero,
  field,
}: {
  hero: SectionOf<"hero">;
  field: Field;
}) {
  const { data, blueprint, now } = useSystem();
  const variant = entryVariant(data, hero, blueprint);
  const contact = contactOf(visibleDoc(data).sections);
  const city = contact?.city?.trim() || undefined;
  const name = nameOf(data);
  const headline = entryHeadline(hero, data, blueprint);
  const lede = entryLede(hero, headline);
  const photo = heroPhoto(data, hero);
  const status = statusLine(contact?.openingHours, now);
  const sticker = entrySticker(data);
  const facts = entryFacts(data);
  const { primary } = plakatActions(data, blueprint);
  const second = primary ? entrySecond(data, blueprint, primary) : undefined;
  const onField = field !== "ground";

  return (
    <section
      id={SECTION_ANCHORS.hero}
      className={`pk-entry pk-entry--${variant} pk-${field}`}
      aria-labelledby="start-titel"
    >
      <div className="pk-entry-grid">
        <div className="pk-entry-text">
          {(status || (variant === "type" && sticker)) && (
            <div className="pk-entry-top">
              {status && (
                <p className={status.closed ? "pk-status pk-status--closed" : "pk-status"}>
                  {status.text}
                </p>
              )}
              {variant === "type" && sticker && (
                <PlakatSticker sticker={sticker} inv={onField} className="pk-entry-stk" />
              )}
            </div>
          )}
          {headline && (
            <h1 id="start-titel" className="pk-entry-name">
              {name}
              {city && <span>, {city}</span>}
            </h1>
          )}
          <Display text={headline ?? name} h1={!headline} />
        </div>
        {photo && variant !== "type" && (
          <div className="pk-entry-media">
            <Shape src={photo} variant={variant} />
            {sticker && (
              <PlakatSticker sticker={sticker} inv={onField} className="pk-entry-stk" />
            )}
          </div>
        )}
        <div className="pk-entry-copy">
          {lede && <p className="pk-entry-lede">{lede}</p>}
          {primary && (
            <p className="pk-entry-actions">
              <a className="pk-btn" href={primary.href}>
                {primary.label}
                <i aria-hidden="true">→</i>
              </a>
              {second && (
                <a className="pk-btn2" href={second.href}>
                  {second.label}
                </a>
              )}
            </p>
          )}
        </div>
        {facts.length > 0 && (
          <ul className="pk-facts">
            {facts.map(f => (
              <li key={f.strong}>
                <b>{f.strong}</b> <span>{f.sub}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

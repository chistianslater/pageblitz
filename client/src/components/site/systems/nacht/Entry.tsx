import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { useSystem } from "../SystemContext";
import { contactOf, heroPhoto, newTabIfMaps, visibleDoc } from "../shared";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import {
  entryFigure,
  entryLede,
  entryName,
  entryVariant,
  nachtActions,
  todayLine,
  type Action,
  type EntryVariant,
  type Figure,
} from "./facts";
import { Icon, wayIcon } from "./icons";

/**
 * Nacht-Einstieg nach Systemblatt 9 (Handy) und 14 (Desktop):
 *  photo  — Foto gedunkelt über die ganze Breite, Kopf darüber, Name in
 *           Kupfer im Verlauf zur Grundfarbe, Kupferlinie, Satz,
 *           Heute-Zeile mit Küche, Knöpfe.
 *  framed — Name, große Kupferziffer neben kleinem Hochformat, Satz.
 *  plain  — Name und Ziffer (ohne Ziffer nur der Name) auf dem Schein.
 * Genau ein h1 mit dem Anzeigenamen. Ziffer, Heute und Küche nur aus Daten.
 */

/** Breiten fürs Einstiegsfoto (Handy bis Desktop in 2×). */
const WIDTHS = [640, 1024, 1600, 2400] as const;

/** Unsplash in passenden Breiten; andere Quellen bleiben, wie sie sind. */
export function nachtSrcSet(src: string): string | undefined {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }
  if (url.hostname !== "images.unsplash.com") return undefined;
  return WIDTHS.map(w => {
    url.searchParams.set("w", String(w));
    return `${url.toString()} ${w}w`;
  }).join(", ");
}

function Img({ src, sizes, wide }: { src: string; sizes: string; wide: boolean }) {
  const srcSet = nachtSrcSet(src);
  return (
    <img
      src={src}
      {...(srcSet ? { srcSet, sizes } : {})}
      alt=""
      width={wide ? 1600 : 900}
      height={wide ? 1000 : 1200}
      loading="eager"
      fetchPriority="high"
    />
  );
}

function Title({ variant }: { variant: EntryVariant }) {
  const { data, blueprint } = useSystem();
  const { name, mark, kicker, kickerInName } = entryName(data, blueprint);
  const cls = `nc-display${variant === "photo" ? " nc-display--photo" : ""}`;
  if (kickerInName)
    return (
      <h1 id="start-titel" className="nc-title">
        <span className="nc-kicker">{kicker}</span>{" "}
        <span className={cls}>{mark}</span>
      </h1>
    );
  return (
    <>
      {kicker && <p className="nc-kicker">{kicker}</p>}
      <h1 id="start-titel" className={`nc-title ${cls}`}>
        {name}
      </h1>
    </>
  );
}

function FigureBlock({ figure, photo }: { figure?: Figure; photo?: string }) {
  if (!figure && !photo) return null;
  return (
    <div className="nc-figure">
      <div className={photo ? "nc-figrow nc-figrow--pic" : "nc-figrow"}>
        {figure && (
          <p
            className={
              figure.value.length + (figure.minutes ? 1 : 0) > 2
                ? "nc-fig nc-fig--long"
                : "nc-fig"
            }
            aria-hidden="true"
          >
            {figure.value}
            {figure.minutes && <sup>{figure.minutes}</sup>}
          </p>
        )}
        {photo && (
          <figure className={figure ? "nc-pic" : "nc-pic nc-pic--solo"}>
            <Img
              src={photo}
              sizes="(min-width: 48rem) 22vw, 46vw"
              wide={false}
            />
          </figure>
        )}
      </div>
      {figure && (
        <p className="nc-figl">
          <span aria-hidden="true">{figure.label}</span>
          <span className="nc-sr">{figure.sr}</span>
        </p>
      )}
      <span className="nc-cl" aria-hidden="true" />
    </div>
  );
}

function Buttons({ primary, second }: { primary: Action; second?: Action }) {
  return (
    <div className="nc-actions" {...SYS_ACTIONS}>
      <a className="nc-btn nc-btn--p" href={primary.href} {...newTabIfMaps(primary.href)}>
        {primary.label}
        <Icon name={wayIcon(primary.href)} />
      </a>
      {second && (
        <a className="nc-btn nc-btn--s" href={second.href} {...newTabIfMaps(second.href)}>
          <Icon name={wayIcon(second.href)} />
          {second.label}
        </a>
      )}
    </div>
  );
}

export function NachtEntry({ hero }: { hero: SectionOf<"hero"> }) {
  const { data, blueprint, now } = useSystem();
  const variant = entryVariant(data, hero);
  const photo = heroPhoto(data, hero);
  const lede = entryLede(hero, data, blueprint);
  const hours = contactOf(visibleDoc(data).sections)?.openingHours;
  const figure = variant === "photo" ? undefined : entryFigure(data);
  // Steht die Ziffer schon für die Zeiten, wiederholt die Heute-Zeile sie nicht.
  const today = figure?.source === "hours" ? undefined : todayLine(hours, now);
  const { primary, second } = nachtActions(data, blueprint);

  return (
    <section
      id={SECTION_ANCHORS.hero}
      className={`nc-entry nc-entry--${variant}`}
      aria-labelledby="start-titel"
    >
      {variant === "photo" ? (
        <div className="nc-bg">
          <Img src={photo!} sizes="100vw" wide />
        </div>
      ) : (
        <span className="nc-glowbox" aria-hidden="true">
          <span className="nc-glow nc-glow--entry" />
        </span>
      )}
      <div className="nc-entry-in">
        <div className="nc-titlebox">
          <Title variant={variant} />
        </div>
        {variant === "photo" ? (
          <span className="nc-vl" aria-hidden="true" />
        ) : (
          <FigureBlock
            figure={figure}
            photo={variant === "framed" ? photo : undefined}
          />
        )}
        {lede && <p className="nc-lede">{lede}</p>}
        {today && (
          <p className="nc-today">
            <b>{today.open}</b>
            {today.kitchen && <span>{today.kitchen}</span>}
          </p>
        )}
        {primary && <Buttons primary={primary} second={second} />}
      </div>
    </section>
  );
}

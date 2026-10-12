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
  entryRating,
  entryVariant,
  nachtActions,
  todayLine,
  type Action,
  type EntryRating,
  type EntryVariant,
  type Figure,
} from "./facts";
import { Icon, wayIcon } from "./icons";
import { entryFit } from "./fit";

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
const WIDTHS = [640, 828, 1024, 1600, 2400] as const;
/**
 * Breiten für kleine Fotos (Hochformat im Einstieg, Bildpaar, Galerie,
 * Porträts): am Handy oft unter 360 px breit — kein 640er nötig.
 */
export const SMALL_WIDTHS = [360, 480, 640, 960, 1280] as const;

/** Unsplash in passenden Breiten; andere Quellen bleiben, wie sie sind. */
export function nachtSrcSet(
  src: string,
  widths: readonly number[] = WIDTHS
): string | undefined {
  let base: URL;
  try {
    base = new URL(src);
  } catch {
    return undefined;
  }
  if (base.hostname !== "images.unsplash.com") return undefined;
  return widths.map(w => {
    const url = new URL(base);
    url.searchParams.set("w", String(w));
    return `${url.toString()} ${w}w`;
  }).join(", ");
}

function Img({
  src,
  sizes,
  wide,
}: {
  src: string;
  sizes: string;
  wide: boolean;
}) {
  const srcSet = nachtSrcSet(src, wide ? WIDTHS : SMALL_WIDTHS);
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

/** Zeichen des längsten Worts (mindestens 1) — Maß für die Namensgröße. */
export function longestWord(text: string): number {
  return Math.max(1, ...text.split(/[\s\u2013\u2014-]+/).map(w => [...w].length));
}

function Title({ variant }: { variant: EntryVariant }) {
  const { data, blueprint } = useSystem();
  const { name, mark, kicker, kickerInName } = entryName(data, blueprint);
  const cls = `nc-display${variant === "photo" ? " nc-display--photo" : ""}`;
  // Längstes Wort passt in die Breite (kein „HAARSTUDI-O" bei 320 px).
  const fit = {
    "--nc-word": longestWord(kickerInName ? mark : name),
  } as React.CSSProperties;
  if (kickerInName)
    return (
      <h1 id="start-titel" className="nc-title">
        <span className="nc-kicker">{kicker}</span>{" "}
        <span className={cls} style={fit}>
          {mark}
        </span>
      </h1>
    );
  return (
    <>
      {kicker && <p className="nc-kicker">{kicker}</p>}
      <h1 id="start-titel" className={`nc-title ${cls}`} style={fit}>
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
              sizes={
                figure
                  ? "(min-width: 48rem) 22vw, 46vw"
                  : "(max-width: 25rem) 92vw, 22.75rem"
              }
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

/** Google-Note als ruhige Zeile: Stern + Note, Anzahl; Vorleser hören den ganzen Satz. */
function RatingLine({ rating }: { rating: EntryRating }) {
  return (
    <p className="nc-erate">
      <span className="nc-erate-v" aria-hidden="true">
        <Icon name="star" />
        {rating.value}
      </span>
      <span aria-hidden="true">{rating.text}</span>
      <span className="nc-sr">{rating.sr}</span>
    </p>
  );
}

/**
 * Knöpfe des Einstiegs. Jeder Knopf ist eine eigene `data-sys-actions`-
 * Gruppe: Ist der Hauptknopf sichtbar, weicht die Handy-Leiste, auch wenn
 * der zweite Knopf noch unter dem ersten Bildschirm liegt.
 */
function Buttons({ primary, second }: { primary: Action; second?: Action }) {
  return (
    <div className="nc-actions">
      <a
        className="nc-btn nc-btn--p"
        href={primary.href}
        {...newTabIfMaps(primary.href)}
        {...SYS_ACTIONS}
      >
        {primary.label}
        <Icon name={wayIcon(primary.href)} />
      </a>
      {second && (
        <a
          className="nc-btn nc-btn--s"
          href={second.href}
          {...newTabIfMaps(second.href)}
          {...SYS_ACTIONS}
        >
          <Icon name={wayIcon(second.href)} />
          {second.label}
        </a>
      )}
    </div>
  );
}

/**
 * Foto-Einstieg am Handy: Zeilen von Name, Satz und Fakten als CSS-Zahlen
 * (`--nc-*-lines`, `--nc-kick`, `--nc-word`). Daraus rechnet entryCss die
 * Fotohöhe so, dass der Hauptknopf im ersten Bildschirm liegt.
 */
function photoFit(
  data: Parameters<typeof entryName>[0],
  blueprint: Parameters<typeof entryName>[1],
  lede: string | undefined,
  today: ReturnType<typeof todayLine>,
  rating: EntryRating | undefined
): { fitStyle: React.CSSProperties; long: boolean } {
  const { name, mark, kicker, kickerInName } = entryName(data, blueprint);
  const title = kickerInName ? mark : name;
  const facts = [
    ...(today ? [[today.open, today.kitchen].filter(Boolean).join(" ")] : []),
    ...(rating ? [`★ ${rating.value} ${rating.text}`] : []),
  ];
  const fit = entryFit({ title, lede, facts });
  return {
    long: fit.long,
    fitStyle: {
      "--nc-word": longestWord(title),
      "--nc-kick": kicker ? 1 : 0,
      "--nc-name-lines": fit.nameLines,
      "--nc-lede-lines": fit.ledeLines,
      "--nc-fact-lines": fit.factLines,
    } as React.CSSProperties,
  };
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
  const rating = entryRating(data, figure);
  const { primary, second } = nachtActions(data, blueprint);
  const { fitStyle, long } =
    variant === "photo"
      ? photoFit(data, blueprint, lede, today, rating)
      : { fitStyle: undefined, long: false };

  return (
    <section
      id={SECTION_ANCHORS.hero}
      className={`nc-entry nc-entry--${variant}${long ? " nc-entry--long" : ""}`}
      aria-labelledby="start-titel"
      style={fitStyle}
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
        {rating && <RatingLine rating={rating} />}
        {primary && <Buttons primary={primary} second={second} />}
      </div>
    </section>
  );
}

import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { useSystem } from "../SystemContext";
import { heroPhoto, newTabIfMaps } from "../shared";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import {
  entryHeadline,
  entryLede,
  entryTop,
  entryVariant,
  factPills,
  freundlichActions,
  splitHeadline,
  type Action,
  type FactPill,
} from "./facts";
import { Icon, wayIcon } from "./icons";
import type { Surface } from "./content";

/**
 * Freundlich-Einstieg nach Systemblatt 6 (Fotolage), 10 (Handy) und 16/18
 * (Desktop). Genau ein h1 mit dem Anzeigenamen; Pille über dem Titel nur
 * mit Ort; Faktenpillen nur aus Daten. Fassungen siehe facts.ts.
 */

/** Breiten fürs Einstiegsfoto bzw. das kleine Foto. */
const WIDE_WIDTHS = [640, 828, 1024, 1600, 2400] as const;
const SMALL_WIDTHS = [360, 480, 640, 960] as const;

/** Unsplash in passenden Breiten; andere Quellen bleiben, wie sie sind. */
export function freundlichSrcSet(
  src: string,
  widths: readonly number[]
): string | undefined {
  let base: URL;
  try {
    base = new URL(src);
  } catch {
    return undefined;
  }
  if (base.hostname !== "images.unsplash.com") return undefined;
  return widths
    .map(w => {
      const url = new URL(base);
      url.searchParams.set("w", String(w));
      return `${url.toString()} ${w}w`;
    })
    .join(", ");
}

function Img({ src, wide }: { src: string; wide: boolean }) {
  const srcSet = freundlichSrcSet(src, wide ? WIDE_WIDTHS : SMALL_WIDTHS);
  const sizes = wide
    ? "(min-width: 64rem) 60rem, 92vw"
    : "(min-width: 48rem) 18.75rem, 58vw";
  return (
    <img
      src={src}
      {...(srcSet ? { srcSet, sizes } : {})}
      alt=""
      width={wide ? 1600 : 900}
      height={wide ? 900 : 900}
      loading="eager"
      fetchPriority="high"
    />
  );
}

/** Zeichen des längsten Worts (mindestens 1) — Maß für die Titelgröße. */
export function longestWord(text: string): number {
  return Math.max(1, ...text.split(/[\s\u2013\u2014-]+/).map(w => [...w].length));
}

/**
 * Längstes Wort passt in die Breite (kein „Hausgemacht|es" bei 320 px):
 * entryCss deckelt die Titelgröße über `--fr-word`.
 */
const fit = (text: string) =>
  ({ "--fr-word": longestWord(text) }) as React.CSSProperties;

/** Pille bzw. Namenszeile, große Zeile, Satz — genau ein h1 (Name). */
function Text({ hero }: { hero: SectionOf<"hero"> }) {
  const { data, blueprint } = useSystem();
  const top = entryTop(data, blueprint);
  const headline = entryHeadline(hero, data, blueprint);
  const lede = entryLede(hero, headline);
  const parts = headline ? splitHeadline(headline) : undefined;
  // Ort ohne Umbruch am Bindestrich („Leipzig-|Gohlis").
  const city = top.city && <span className="fr-nowrap">{top.city}</span>;
  const nameLine = (
    <>
      <h1 id="start-titel" className="fr-top-name">
        {top.name}
      </h1>
      {top.branch && `\u00a0· ${top.branch}`}
      {city && <> in {city}</>}
    </>
  );
  return (
    <div className="fr-entry-text">
      {headline &&
        (top.pill ? (
          <div className="fr-pill fr-pill--top">
            <i className="fr-dot" aria-hidden="true" />
            <div className="fr-pill-text">{nameLine}</div>
          </div>
        ) : (
          <div className="fr-nameline">{nameLine}</div>
        ))}
      {!headline && top.pill && (
        <p className="fr-pill fr-pill--top">
          <i className="fr-dot" aria-hidden="true" />
          <span className="fr-pill-text">
            {top.kicker.slice(0, top.kicker.length - top.city!.length)}
            {city}
          </span>
        </p>
      )}
      {parts ? (
        <p className="fr-display" style={fit(headline!)}>
          {parts.lead}
          {parts.rest && (
            <>
              {" "}
              <span className="fr-acc">{parts.rest}</span>
            </>
          )}
        </p>
      ) : (
        <h1 id="start-titel" className="fr-display" style={fit(top.name)}>
          {top.name}
        </h1>
      )}
      {lede && <p className="fr-lede">{lede}</p>}
    </div>
  );
}

function Pills({ pills, label }: { pills: FactPill[]; label: string }) {
  if (pills.length === 0) return null;
  return (
    <ul className="fr-facts" aria-label={label}>
      {pills.map(p => (
        <li key={p.label} className="fr-pill fr-fact">
          <Icon name={p.icon} />
          {p.sr ? (
            <>
              <span aria-hidden="true">{p.label}</span>
              <span className="fr-sr">{p.sr}</span>
            </>
          ) : (
            p.label
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Knöpfe des Einstiegs. Jeder Knopf ist eine eigene `data-sys-actions`-
 * Gruppe: Ist der Hauptknopf sichtbar, weicht die Handy-Leiste.
 */
function Buttons({ primary, second }: { primary: Action; second?: Action }) {
  return (
    <div className="fr-ctas">
      <a
        className="fr-btn fr-btn--p"
        href={primary.href}
        {...newTabIfMaps(primary.href)}
        {...SYS_ACTIONS}
      >
        <Icon name={wayIcon(primary.href)} />
        {primary.label}
      </a>
      {second && (
        <a
          className="fr-btn fr-btn--s"
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

/** Wolkenkante (rein CSS, zwei versetzte Kreisreihen) zur nächsten Fläche. */
export function Cloud({ tone }: { tone: Surface | "deep" }) {
  return <span className={`fr-cloud fr-cloud--${tone}`} aria-hidden="true" />;
}

/**
 * `next`: Fläche des ersten Kapitels nach dem Einstieg (surfacePlan) — die
 * Wolke nimmt ihre Farbe an (keine Kante). Nach dem Foto-Einstieg ist das
 * erste Kapitel nie Papier (surfacePlan macht Papier dort zum Band).
 */
export function FreundlichEntry({
  hero,
  next = "paper",
}: {
  hero: SectionOf<"hero">;
  next?: Surface;
}) {
  const { data, blueprint, now } = useSystem();
  const variant = entryVariant(data, hero);
  const photo = heroPhoto(data, hero);
  const top = entryTop(data, blueprint);
  const pills = factPills(data, now, top.pill);
  const { primary, second } = freundlichActions(data, blueprint);

  if (variant === "photo")
    return (
      <section
        id={SECTION_ANCHORS.hero}
        className="fr-entry fr-entry--photo"
        aria-labelledby="start-titel"
      >
        <div className="fr-wrap fr-entry-in">
          <Text hero={hero} />
          {primary && <Buttons primary={primary} second={second} />}
          <div className="fr-heroimg">
            <figure className="fr-frame">
              <Img src={photo!} wide />
            </figure>
            <Pills pills={pills} label="Auf einen Blick" />
          </div>
        </div>
        <Cloud tone={next === "paper" ? "band" : next} />
      </section>
    );

  return (
    <section
      id={SECTION_ANCHORS.hero}
      className={`fr-entry fr-entry--tint fr-entry--${variant}`}
      aria-labelledby="start-titel"
    >
      <div className="fr-wrap fr-entry-in">
        <div className="fr-entry-main">
          <Text hero={hero} />
          <Pills pills={pills} label="Auf einen Blick" />
          {primary && <Buttons primary={primary} second={second} />}
        </div>
        {variant === "small" && photo && (
          <figure className="fr-smallpic">
            <Img src={photo} wide={false} />
          </figure>
        )}
      </div>
      <Cloud tone={next} />
    </section>
  );
}

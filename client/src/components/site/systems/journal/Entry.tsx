import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { tradeLabel } from "../../../../../../shared/stylePacks/blueprints";
import { stripMarks } from "../../richText";
import { SECTION_ANCHORS } from "../../engine";
import {
  shortHours,
  streetLine,
  todayLine,
} from "../../artDirection/heroFacts";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import { useSystem } from "../SystemContext";
import { addressLine, mapsHref, primaryAction } from "./Chrome";
import type { JournalSection } from "./sections";
import { FIT_MAX, FIT_MIN } from "./css";

/**
 * Journal-Einstieg nach Systemblatt („Der Wow-Moment", Anker Aman Venice):
 * Kicker „Branche in Ort", der Betriebsname als Buchtitel (h1, display),
 * genau eine kursive Zeile, dann das Foto mit „Abb. 1" und bis zu drei
 * Faktenzeilen mit Haarlinien. Ohne brauchbares Foto die Typo-Fassung:
 * Name 22 % größer, Fakten, Knopf „Leistungen ansehen" + „Route planen".
 */

/** Die kursive Zeile verträgt nur einen kurzen Satz. */
const LINE_MAX = 60;
/** Ab hier stuft die Namensgröße ab (Zeichen gesamt). */
const LONG_NAME = 24;
const XLONG_NAME = 40;

/**
 * Kursive Zeile: kurze Modell-Überschrift, sonst kurze Tagline, sonst
 * keine. Markierungen fallen weg — die Zeile ist schon die einzige Kursive.
 */
export function entryLine(
  hero: SectionOf<"hero">,
  tagline: string | undefined
): string | undefined {
  return [hero.headline, tagline, hero.subheadline]
    .map(t => (t ? stripMarks(t).trim() : ""))
    .find(t => t.length > 0 && t.length <= LINE_MAX);
}

/**
 * Größenstufen für den Namen, zur Renderzeit aus der Länge berechnet (kein
 * JS im Browser): `jr-fit-N` passt das längste Wort in die Breite,
 * `--long`/`--xlong` stufen lange Namen insgesamt ab.
 */
export function nameFitClasses(name: string): string {
  const longest = Math.max(...name.split(/[\s\-–/]+/).map(fitWidth), 0);
  const classes = ["jr-entry-name"];
  if (name.length > XLONG_NAME) classes.push("jr-entry-name--xlong");
  else if (name.length > LONG_NAME) classes.push("jr-entry-name--long");
  if (longest >= FIT_MIN) classes.push(`jr-fit-${Math.min(longest, FIT_MAX)}`);
  return classes.join(" ");
}

/** Versalien laufen in Newsreader Light rund 1,45-mal so breit. */
const CAPS_WIDTH = 1.45;

/** Wortbreite in „Kleinbuchstaben-Zeichen", aufgerundet. */
function fitWidth(word: string): number {
  const caps = word.replace(/[^\p{Lu}]/gu, "").length;
  return Math.ceil(word.length - caps + caps * CAPS_WIDTH);
}

type Fact = { label: string; note?: string };

/** „Heute geöffnet · 9 bis 18 Uhr" — nur aus echten Öffnungszeiten. */
function todayFact(
  hours: SectionOf<"contact">["openingHours"],
  now: Date
): Fact | undefined {
  const line = todayLine(hours, now);
  if (!line) return undefined;
  const rest = line.replace(/^Heute\s+/, "");
  if (rest === "geschlossen") return { label: "Heute geschlossen" };
  if (rest === shortHours("24 Stunden"))
    return { label: "Heute geöffnet", note: "rund um die Uhr" };
  return { label: "Heute geöffnet", note: rest.replace(/–/g, " bis ") };
}

function entryFacts(
  data: ReturnType<typeof useSystem>["data"],
  contact: SectionOf<"contact"> | undefined,
  now: Date
): Fact[] {
  const google = data.google;
  const street = streetLine(contact?.street);
  const place = [contact?.zip, contact?.city].filter(Boolean).join(" ");
  const facts: (Fact | undefined)[] = [
    todayFact(contact?.openingHours, now),
    google && google.reviewCount > 0
      ? {
          label: `${formatHeroRating(google.rating)} bei Google`,
          note: `${google.reviewCount.toLocaleString("de-DE")} ${google.reviewCount === 1 ? "Bewertung" : "Bewertungen"}`,
        }
      : undefined,
    street ? { label: street, note: place || undefined } : undefined,
  ];
  return facts.filter((f): f is Fact => Boolean(f)).slice(0, 3);
}

export function JournalEntry({
  hero,
  sections,
}: {
  hero: SectionOf<"hero">;
  sections: readonly JournalSection[];
}) {
  const { data, blueprint, now } = useSystem();
  const contact = data.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const hidden = data.designProfile?.hiddenElements?.includes("hero-media");
  const photo = hidden ? undefined : hero.imageUrl;
  const branch =
    blueprint.id === "trade"
      ? tradeLabel(data.businessCategory, data.businessName)
      : data.businessCategory;
  const kicker = [branch, contact?.city].filter(Boolean).join(" in ");
  const line = entryLine(hero, data.tagline);
  const facts = entryFacts(data, contact, now);
  const street = streetLine(contact?.street);
  const address = addressLine(contact);
  const hasServices = sections.some(s => s.type === "services");
  const action = hasServices
    ? { label: "Leistungen ansehen", href: `#${SECTION_ANCHORS.services}` }
    : primaryAction(data, blueprint);

  return (
    <section
      id={SECTION_ANCHORS.hero}
      className={photo ? "jr-entry" : "jr-entry jr-entry--type"}
    >
      <div className="jr-wrap">
        {kicker && <p className="jr-kicker jr-entry-kicker">{kicker}</p>}
        <h1 className={nameFitClasses(data.businessName)}>
          {data.businessName}
        </h1>
        {line && <p className="jr-entry-line">{line}</p>}
        {photo && (
          <figure className="jr-entry-photo">
            <img
              src={photo}
              alt=""
              width={1200}
              height={1500}
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>
              <span>
                <span className="jr-entry-abb">Abb. 1</span>{" "}
                {data.businessName}
              </span>
              {(street || contact?.city) && (
                <span>{street ?? contact?.city}</span>
              )}
            </figcaption>
          </figure>
        )}
        {facts.length > 0 && (
          <div className="jr-entry-facts">
            {facts.map(f => (
              <p className="jr-entry-fact" key={f.label}>
                <span>{f.label}</span>
                {f.note && <span className="jr-entry-fact-note">{f.note}</span>}
              </p>
            ))}
          </div>
        )}
        {!photo && (
          <div className="jr-entry-actions">
            <a className="jr-pill jr-pill--ghost" href={action.href}>
              {action.label}
            </a>
            {address && (
              <a className="jr-link" href={mapsHref(address)}>
                Route planen
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

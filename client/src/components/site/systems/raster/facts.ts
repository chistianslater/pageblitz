import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { tradeLabel } from "../../../../../../shared/stylePacks/blueprints";
import { stripMarks } from "../../richText";
import {
  coversToday,
  isPlaceholderHours,
  shortHours,
  streetLine,
  telHref,
  todayLine,
} from "../../artDirection/heroFacts";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import {
  addressLine,
  contactOf,
  mailHref,
  mapsHref,
  primaryAction,
  systemShows,
} from "../shared";
import { orderedSections } from "../../engine";

/**
 * Reine Daten-Regeln für den Raster-Einstieg und die Handy-Leiste. Nichts
 * wird erfunden: Fehlt eine Angabe, entfällt das Element.
 */

type Hours = SectionOf<"contact">["openingHours"];

/* ── Fassung ──────────────────────────────────────────────────────────── */

/**
 * Drei Einstiege laut Systemblatt 6 — Papier spielt keine Rolle, ein
 * brauchbares Foto des Betriebs fällt nie weg (Betreiber-Entscheid R3):
 *
 * | Hero-Foto (nicht ausgeblendet) | Querformat („Bühne") | Fassung |
 * |--------------------------------|-----------------------|---------|
 * | nein / `hero-media` versteckt  | –                     | type    |
 * | ja                             | ja                    | bleed   |
 * | ja                             | nein                  | plate   |
 *
 * „Querformat" = `designProfile.composition === "stage"`: Das setzt die
 * Erzeugung nur, wenn das Hero-Foto gemessen ein großes Querformat ist
 * (≥ 1000 px breit, Seitenverhältnis ≥ 1,25) und das Bildmodell es als
 * Titelbild taugt (heroScore ≥ 4) — siehe server/generationV2/heroPhoto.ts
 * und withEntryComposition. Hochformat-Handyfotos ergeben die ruhige Tafel
 * unten (auch auf dunklem Papier „Kohle").
 */
export type EntryVariant = "plate" | "bleed" | "type";

export function heroPhoto(
  data: WebsiteDataV2,
  hero: SectionOf<"hero"> | undefined
): string | undefined {
  if (data.designProfile?.hiddenElements?.includes("hero-media"))
    return undefined;
  return hero?.imageUrl || undefined;
}

export function entryVariant(
  data: WebsiteDataV2,
  hero: SectionOf<"hero"> | undefined
): EntryVariant {
  if (!heroPhoto(data, hero)) return "type";
  return data.designProfile?.composition === "stage" ? "bleed" : "plate";
}

/* ── Zeiten ───────────────────────────────────────────────────────────── */

const ROUND_THE_CLOCK = shortHours("24 Stunden");

/** Ein Montag (Berlin, Mittag) — Basis, um alle sieben Tage zu prüfen. */
const MONDAY = Date.UTC(2026, 9, 12, 10);
const DAY_MS = 86_400_000;

/**
 * Rund um die Uhr: echte Zeiten (kein Platzhalter), jeder Eintrag „24
 * Stunden" und alle sieben Tage abgedeckt. Nur dann gibt es „24/7",
 * „Jetzt erreichbar" und die Anrufleiste ohne Sofort-Bauplan.
 */
export function isRoundTheClock(hours: Hours | undefined): boolean {
  if (!hours?.length || isPlaceholderHours(hours)) return false;
  if (!hours.every(h => shortHours(h.hours) === ROUND_THE_CLOCK)) return false;
  return Array.from(
    { length: 7 },
    (_, i) => new Date(MONDAY + i * DAY_MS)
  ).every(day => hours.some(h => coversToday(h.day, day)));
}

/** „Heute geöffnet bis 18 Uhr" / „Heute geschlossen" — nur aus echten Zeiten. */
export function todayFact(
  hours: Hours | undefined,
  now: Date
): string | undefined {
  if (isRoundTheClock(hours)) return undefined; // trägt der Status
  const line = todayLine(hours, now);
  if (!line) return undefined;
  const rest = line.replace(/^Heute\s+/, "");
  if (rest === "geschlossen") return "Heute geschlossen";
  if (rest === ROUND_THE_CLOCK) return "Heute rund um die Uhr geöffnet";
  const ends = [
    ...rest.matchAll(/\d{1,2}(?::\d{2})?(?=\s*(?:Uhr|$|,|\s*\())/g),
  ];
  const end = ends[ends.length - 1]?.[0];
  return end && /–/.test(rest)
    ? `Heute geöffnet bis ${end} Uhr`
    : `Heute ${rest}`;
}

/** „4,8 bei Google · 110 Bewertungen" — nur mit echten Bewertungen. */
export function googleFact(
  google: WebsiteDataV2["google"]
): string | undefined {
  if (!google || !(google.reviewCount > 0)) return undefined;
  const count = google.reviewCount.toLocaleString("de-DE");
  const noun = google.reviewCount === 1 ? "Bewertung" : "Bewertungen";
  return `${formatHeroRating(google.rating)} bei Google · ${count} ${noun}`;
}

/* ── Texte ────────────────────────────────────────────────────────────── */

/** Satz unter der Wortmarke verträgt einen kurzen Satz (Systemblatt). */
const LEDE_MAX = 90;
const CLAUSE_MIN = 20;

/** Ab diesem Anteil an Kicker-Wörtern gilt eine Überschrift als Doppel. */
const KICKER_SHARE = 0.8;

const tokens = (text: string) =>
  text
    .toLocaleLowerCase("de")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

/**
 * Wiederholt die Überschrift nur den Kicker? Gleich, ganz darin enthalten
 * oder zu mehr als 80 % aus Kicker-Wörtern („Friseur in Münster" bei Kicker
 * „Friseur in Münster"). Ort oder Branche allein reichen nicht („Marken mit
 * Substanz aus Bocholt" bleibt).
 */
export function echoesKicker(headline: string, kicker: string): boolean {
  const h = tokens(headline);
  const k = tokens(kicker);
  if (h.length === 0 || k.length === 0) return false;
  if (h.join(" ") === k.join(" ") || k.join(" ").includes(h.join(" ")))
    return true;
  const known = new Set(k);
  return h.filter(t => known.has(t)).length / h.length > KICKER_SHARE;
}

const CLAUSE_END = /\s+[—–]\s+|[.!?]\s+/;

/** Erster Satzteil eines langen Satzes („… für alle Marken — mit …"). */
function firstClause(text: string): string | undefined {
  // Gedankenstrich oder Satzende; das Satzzeichen bleibt am Satzteil.
  // Ohne Lookbehind (Safari < 16.4, siehe fit.ts).
  const end = CLAUSE_END.exec(text);
  const cut = (
    end ? text.slice(0, end.index + (/^[.!?]/.test(end[0]) ? 1 : 0)) : text
  ).trim();
  if (!cut || cut.length < CLAUSE_MIN || cut.length > LEDE_MAX)
    return undefined;
  return /[.!?]$/.test(cut) ? cut : `${cut}.`;
}

/**
 * Satz des Einstiegs (Systemblatt: „Steuern. Klar geregelt."): Überschrift,
 * außer sie verdoppelt nur den Kicker; sonst Tagline; sonst Unterzeile bzw.
 * deren erster Satzteil. Höchstens 90 Zeichen, Markierungen fallen weg.
 */
export function entryLede(
  hero: SectionOf<"hero">,
  data: WebsiteDataV2,
  kicker: string
): string | undefined {
  const plain = (t: string | undefined) => (t ? stripMarks(t).trim() : "");
  const headline = plain(hero.headline);
  const sub = plain(hero.subheadline);
  const candidates = [
    echoesKicker(headline, kicker) ? "" : headline,
    plain(data.tagline),
    sub.length <= LEDE_MAX ? sub : (firstClause(sub) ?? ""),
  ];
  return candidates.find(t => t.length > 0 && t.length <= LEDE_MAX);
}

/** Kicker „Steuerberatung in Münster"; gewandertes Gewerk ersetzt die Branche. */
export function entryKicker(
  data: WebsiteDataV2,
  blueprint: Blueprint,
  city: string | undefined,
  kickerWord?: string
): string {
  const branch =
    kickerWord ??
    (blueprint.id === "trade"
      ? tradeLabel(data.businessCategory, data.businessName)
      : data.businessCategory);
  return [branch, city].filter(Boolean).join(" in ");
}

/* ── Handy-Leiste ─────────────────────────────────────────────────────── */

export type DockField = {
  label: string;
  detail?: string;
  href: string;
  signal?: boolean;
};

export type DockPlan =
  | { kind: "call"; label: string; number: string; href: string }
  | { kind: "fields"; fields: DockField[] };

/**
 * Leiste laut Systemblatt: Sofort-Dienst (Bauplan „urgent") oder echte
 * 24-h-Zeiten → eine Anrufleiste mit Nummer; sonst zwei Felder — Signal-
 * Fläche mit der Hauptaktion und ein zweites Feld (Telefon, sonst E-Mail,
 * sonst Route). Ohne jede Aktion keine Leiste.
 */
export function dockPlan(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): DockPlan | undefined {
  // Nur gezeigte Abschnitte zählen: Ist der Kontakt ausgeblendet
  // (`hiddenSections`), stehen auch Telefon und E-Mail nicht in der Leiste.
  const shown = new Set(
    orderedSections(doc)
      .filter(systemShows)
      .map(s => s.type)
  );
  const data = { ...doc, sections: doc.sections.filter(s => shown.has(s.type)) };
  const contact = contactOf(data.sections);
  const phone = contact?.phone?.trim();
  const tel = telHref(phone);
  if (
    tel &&
    phone &&
    (blueprint.id === "urgent" || isRoundTheClock(contact?.openingHours))
  )
    return { kind: "call", label: "Jetzt anrufen", number: phone, href: tel };

  const address = addressLine(contact);
  const route = address ? mapsHref(address) : undefined;
  const street = streetLine(contact?.street) ?? contact?.city;
  const mail = mailHref(contact?.email);
  const action = primaryAction(data, blueprint, anchorPrefix);
  const detail =
    action.href === tel ? phone : action.href === route ? street : undefined;
  const primary: DockField = {
    ...action,
    signal: true,
    ...(detail ? { detail } : {}),
  };
  const second: DockField | undefined =
    tel && action.href !== tel
      ? { label: "Anrufen", detail: phone, href: tel }
      : mail && !action.href.startsWith("mailto:")
        ? { label: "E-Mail", detail: contact!.email!.trim(), href: mail }
        : route && action.href !== route
          ? { label: "Route", detail: street, href: route }
          : undefined;
  return { kind: "fields", fields: second ? [primary, second] : [primary] };
}

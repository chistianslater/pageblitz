import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import {
  coversToday,
  isPlaceholderHours,
  shortHours,
} from "../../artDirection/heroFacts";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";

/**
 * Einstiegs-Fakten, die alle Designsysteme (rev 3) teilen (aus Raster
 * herausgelöst): Hero-Foto, rund um die Uhr, Google-Fakt, Kicker-Doppel.
 * Nichts wird erfunden — fehlt eine Angabe, gibt es kein Ergebnis.
 */

type Hours = SectionOf<"contact">["openingHours"];

/** Hero-Foto, außer es ist im Studio ausgeblendet (`hero-media`). */
export function heroPhoto(
  data: WebsiteDataV2,
  hero: SectionOf<"hero"> | undefined
): string | undefined {
  if (data.designProfile?.hiddenElements?.includes("hero-media"))
    return undefined;
  return hero?.imageUrl || undefined;
}

const ROUND_THE_CLOCK = shortHours("24 Stunden");

/** Ein Montag (Berlin, Mittag) — Basis, um alle sieben Tage zu prüfen. */
const MONDAY = Date.UTC(2026, 9, 12, 10);
const DAY_MS = 86_400_000;

/**
 * Rund um die Uhr: echte Zeiten (kein Platzhalter), jeder Eintrag „24
 * Stunden" und alle sieben Tage abgedeckt.
 */
export function isRoundTheClock(hours: Hours | undefined): boolean {
  if (!hours?.length || isPlaceholderHours(hours)) return false;
  if (!hours.every(h => shortHours(h.hours) === ROUND_THE_CLOCK)) return false;
  return Array.from(
    { length: 7 },
    (_, i) => new Date(MONDAY + i * DAY_MS)
  ).every(day => hours.some(h => coversToday(h.day, day)));
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

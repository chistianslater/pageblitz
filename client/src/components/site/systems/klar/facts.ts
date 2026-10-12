import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { telHref } from "../../artDirection/heroFacts";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import { stripMarks } from "../../richText";
import { SECTION_ANCHORS } from "../../engine";
import {
  systemShows,
  addressLine,
  branchOf,
  contactOf,
  echoesKicker,
  heroPhoto,
  mailHref,
  mapsHref,
  nameOf,
  visibleDoc,
} from "../shared";
import { realHours } from "./hours";

/**
 * Reine Daten-Regeln für Klar (Einstieg, Wege, Fakten-Chips, Kopf).
 * Nichts wird erfunden: Fehlt eine Angabe, entfällt das Element.
 */

export type Action = { label: string; href: string };

/* ── Wege ─────────────────────────────────────────────────────────────── */

/**
 * Wege nach Systemblatt 8 (Controller-Entscheid K2+K3, Runde 1). Ziel des
 * Hauptknopfs, in dieser Reihenfolge:
 *  1. eigener Buchungslink im Einstieg (echtes http(s), kein Anker)
 *  2. `#kontakt` — nur mit gebuchtem Kontaktformular und sichtbarem
 *     Kontakt-Abschnitt
 *  3. Bauplan-Aktion: `tel` → Anruf, `route` → Karte
 *  4. Anruf
 *  (ohne Telefon zuletzt `#kontakt`, wenn der Kontakt sichtbar ist)
 * Text: Einstieg bzw. Bauplan, sonst „Termin vereinbaren" bzw. „Anrufen".
 * Zweiter Knopf: die Telefonnummer — ruft der Hauptknopf schon an, statt
 * der Nummer die Route (mit Adresse) oder E-Mail. Die Handy-Leiste zeigt
 * dasselbe Paar. Nur sichtbare Abschnitte zählen.
 */
export function klarActions(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): { primary?: Action; second?: Action; phone?: Action } {
  const data = visibleDoc(doc);
  const contact = contactOf(data.sections);
  const hero = data.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const own = plain(hero?.ctaText) || blueprint.ctaText;
  const tel = telHref(contact?.phone);
  const address = addressLine(contact);
  const mail = mailHref(contact?.email);
  const kontakt = `${anchorPrefix}#${SECTION_ANCHORS.contact}`;
  const link = hero?.ctaHref;
  const target =
    link && /^https?:\/\//i.test(link)
      ? link
      : doc.features?.contactForm === true && contact
        ? kontakt
        : blueprint.ctaAction === "route" && address
          ? mapsHref(address)
          : (tel ?? (contact ? kontakt : undefined));
  const phone =
    tel && contact?.phone ? { label: contact.phone.trim(), href: tel } : undefined;
  if (!target) return { phone };
  const calls = target === tel;
  const primary = {
    label: own || (calls ? "Anrufen" : "Termin vereinbaren"),
    href: target,
  };
  const second = !calls
    ? phone
    : address
      ? { label: "Route", href: mapsHref(address) }
      : mail
        ? { label: "E-Mail", href: mail }
        : undefined;
  return { primary, second, phone };
}

/** „Termin vereinbaren" → „Termin" (Kopf und Handy-Leiste). */
const SHORT_VERB = /^(\S+)\s+(vereinbaren|anfragen|buchen|planen|ausmachen)$/i;
export const shortLabel = (label: string) =>
  label.trim().match(SHORT_VERB)?.[1] ?? label.trim();

/* ── Einstieg ─────────────────────────────────────────────────────────── */

/**
 * Vier Einstiege laut Systemblatt 8 (Entscheidungstabelle). Ein
 * brauchbares Foto des Betriebs fällt nie weg.
 *
 * | Foto (heroPhoto) | Querformat („stage") | echte Zeiten | Fassung |
 * |------------------|----------------------|--------------|---------|
 * | ja               | ja                   | egal         | photo   |
 * | ja               | nein                 | egal         | small   |
 * | nein             | –                    | ja           | hours   |
 * | nein             | –                    | nein         | text    |
 *
 * photo: Foto 4:3 im weichen Rahmen, Heute-Karte überlappt die Kante.
 * small: kleines Foto 3:4 neben der Zeiten-Karte (Abendtermine, sonst
 * heute). hours: die Sprechzeiten-Tabelle ist das Bild. „Querformat" wie
 * Werkstoff/Raster: `designProfile.composition === "stage"`.
 */
export type EntryVariant = "photo" | "small" | "hours" | "text";

export function entryVariant(
  data: WebsiteDataV2,
  hero: SectionOf<"hero"> | undefined
): EntryVariant {
  if (heroPhoto(data, hero))
    return data.designProfile?.composition === "stage" ? "photo" : "small";
  const contact = contactOf(visibleDoc(data).sections);
  return realHours(contact?.openingHours) ? "hours" : "text";
}

const plain = (t: string | undefined) => (t ? stripMarks(t).trim() : "");

const HEADLINE_MAX = 90;
const LEDE_MAX = 180;

/** Kicker-Pille („Zahnarztpraxis in Lüneburg"). */
export function entryKicker(data: WebsiteDataV2, blueprint: Blueprint): string {
  const city = contactOf(visibleDoc(data).sections)?.city?.trim();
  return [branchOf(data, blueprint), city].filter(Boolean).join(" in ");
}

/**
 * Rest der Pille hinter dem Namen (h1): Branche, wenn der Name sie nicht
 * schon nennt, dann der Ort — „ · Steuerberater in Hildesheim",
 * „ in Lüneburg" (Zahnarztpraxis Dr. Sommer), leer ohne beides.
 */
export function pillTail(
  name: string,
  branch: string | undefined,
  city: string | undefined
): string {
  const lower = (t: string) => t.toLocaleLowerCase("de");
  const b = branch?.trim();
  const own = b && !lower(name).includes(lower(b)) ? ` · ${b}` : "";
  const c = city?.trim();
  return `${own}${c ? ` in ${c}` : ""}`;
}

/**
 * Große Zeile: die Überschrift — außer sie wiederholt nur Kicker oder
 * Namen; dann die Tagline; sonst keine (der Name trägt).
 */
export function entryHeadline(
  hero: SectionOf<"hero">,
  data: WebsiteDataV2,
  blueprint: Blueprint
): string | undefined {
  const kicker = entryKicker(data, blueprint);
  const name = nameOf(data);
  const echo = (t: string) => echoesKicker(t, kicker) || echoesKicker(t, name);
  return [plain(hero.headline), plain(data.tagline)].find(
    t => t.length > 0 && t.length <= HEADLINE_MAX && !echo(t)
  );
}

const SENTENCE = /[.!?](\s+|$)/g;

/** Satz unter der großen Zeile: Unterzeile, lang → die ersten ganzen Sätze. */
export function entryLede(
  hero: SectionOf<"hero">,
  headline: string | undefined
): string | undefined {
  const sub = plain(hero.subheadline);
  if (!sub || sub === headline) return undefined;
  if (sub.length <= LEDE_MAX) return sub;
  let cut = "";
  for (const m of sub.matchAll(SENTENCE)) {
    const next = sub.slice(0, m.index! + 1);
    if (next.length > LEDE_MAX) break;
    cut = next;
  }
  return cut || undefined;
}

/* ── Fakten-Chips ─────────────────────────────────────────────────────── */

export type ChipIcon = "card" | "car" | "wheelchair" | "check";
export type Chip = { label: string; icon: ChipIcon };

/**
 * Kurze Fakten, die als Vorteil oder Leistung WÖRTLICH im Dokument stehen
 * (ganzer Titel, nicht im Fließtext gesucht). Der Chip zeigt den Titel so,
 * wie er dasteht.
 */
const CHIP_TITLES: [RegExp, ChipIcon][] = [
  [
    /^(alle (gesetzlichen )?kassen|alle krankenkassen|kassenpatienten|gesetzlich versichert(e)?)$/,
    "card",
  ],
  [
    /^(privat|privatpatienten|privat versichert(e)?|privatversichert(e)?|selbstzahler(innen)?|beihilfe)$/,
    "card",
  ],
  [/^(hausbesuch(e)?)$/, "car"],
  [
    /^(abendtermine|termine auch abends|samstagstermine|online-termine|online termine)$/,
    "check",
  ],
];
const MAX_CHIPS = 4;

const norm = (t: string) =>
  plain(t).toLocaleLowerCase("de").replace(/[.!]$/, "").replace(/\s+/g, " ");

/** Vergleichsschlüssel eines Chips bzw. Vorteil-Titels (Groß/klein, Punkt, Leerraum egal). */
export const chipKey = norm;

/**
 * Fakten-Chips (Systemblatt: „Alle Kassen", „Privat", „Hausbesuche",
 * „Barrierefreier Zugang") nur aus Daten: Titel aus Vorteilen und
 * Leistungen (sichtbare Abschnitte, Reihenfolge der Seite) aus der
 * Liste oben, dazu `amenities.wheelchair` des Google-Profils. Keine
 * Daten → keine Chips.
 */
export function factChips(doc: WebsiteDataV2): Chip[] {
  const data = visibleDoc(doc);
  const titles = data.sections.flatMap(s =>
    s.type === "usp" || s.type === "services" ? s.items.map(i => i.title) : []
  );
  const out: Chip[] = [];
  const seen = new Set<string>();
  for (const title of titles) {
    const key = norm(title);
    const hit = CHIP_TITLES.find(([re]) => re.test(key));
    if (!hit || seen.has(key)) continue;
    seen.add(key);
    out.push({ label: plain(title), icon: hit[1] });
  }
  if (data.amenities?.wheelchair === true)
    out.push({ label: "Barrierefreier Zugang", icon: "wheelchair" });
  return out.slice(0, MAX_CHIPS);
}

/** „4,8" + „von 5 · 212 Google-Bewertungen" — nur mit echten Bewertungen. */
export function ratingFact(
  doc: WebsiteDataV2
): { value: string; text: string } | undefined {
  const g = doc.google;
  if (!g || !(g.reviewCount > 0) || !(g.rating > 0) || g.rating > 5)
    return undefined;
  const count = g.reviewCount.toLocaleString("de-DE");
  const noun = g.reviewCount === 1 ? "Google-Bewertung" : "Google-Bewertungen";
  return {
    value: formatHeroRating(g.rating),
    text: `von 5 · ${count} ${noun}`,
  };
}

/* ── Kopf ─────────────────────────────────────────────────────────────── */

/**
 * Monogramm-Kachel im Kopf: Anfangsbuchstabe des letzten Namensworts
 * (meist der Familienname: „Dr. Sommer" → S), sonst das erste Zeichen.
 */
export function monogram(name: string): string {
  const words = name.split(/\s+/).filter(w => /^\p{Lu}/u.test(w));
  const pick = words[words.length - 1] ?? name.trim();
  return pick.charAt(0).toLocaleUpperCase("de") || "·";
}

/** Titel der Zeiten: Bauplan, Beratung „Bürozeiten", sonst „Öffnungszeiten". */
export const hoursLabel = (blueprint: Blueprint) =>
  blueprint.hoursLabel ??
  (blueprint.id === "advice" ? "Bürozeiten" : "Öffnungszeiten");

/* ── Links aus den Daten ──────────────────────────────────────────────── */

/**
 * Ziel eines Links aus den Daten (Aufruf, Abschnitts-Link): absolute
 * http(s)-, tel:- und mailto:-Ziele bleiben; ein Anker nur, wenn sein
 * Abschnitt auf der Startseite sichtbar ist — dann mit Präfix (Unter- und
 * Rechtsseiten zeigen zur Startseite). Alles andere → undefined (der
 * Aufrufer fällt auf den Termin-Weg zurück oder lässt den Link weg).
 */
export function klarHref(
  href: string | undefined,
  doc: WebsiteDataV2,
  anchorPrefix = ""
): string | undefined {
  const h = href?.trim();
  if (!h) return undefined;
  if (/^(https?:\/\/|tel:|mailto:)/i.test(h)) return h;
  if (!h.startsWith("#") || h.length < 2) return undefined;
  const id = h.slice(1);
  const shown = visibleDoc(doc)
    .sections.filter(systemShows)
    .some(s => SECTION_ANCHORS[s.type] === id);
  return shown ? `${anchorPrefix}${h}` : undefined;
}

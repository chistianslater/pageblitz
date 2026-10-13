import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { stripMarks } from "../../richText";
import {
  branchOf,
  contactOf,
  echoesKicker,
  heroPhoto,
  nameOf,
  visibleDoc,
} from "../shared";
import { formatHeroRating, streetLine, telHref } from "../shared/heroFacts";
import { clock, hoursRows, todayHours } from "../shared/hours";
import { addressLine, mailHref } from "../shared";
import { systemActions, type Action } from "../shared/actions";
import type { IconName } from "./icons";

/**
 * Reine Daten-Regeln für Freundlich (Einstieg, Pille, Faktenpillen, Wege).
 * Nichts wird erfunden: Fehlt eine Angabe, entfällt das Element.
 */

const plain = (t: string | undefined) => (t ? stripMarks(t).trim() : "");
const lower = (t: string) => t.toLocaleLowerCase("de");

/* ── Einstieg nach Fotolage ───────────────────────────────────────────── */

/**
 * Drei Einstiege laut Systemblatt 6 (Entscheidungstabelle). Die Fotoprüfung
 * liefert die Stufe: „gut" = großes Querformat (`composition === "stage"`,
 * shared/designSystems/entry.ts), sonst „mittel". Ein Foto des Betriebs
 * fällt nie weg.
 *
 * | Foto (heroPhoto) | Prüfung gut („stage") | Fassung |
 * |------------------|-----------------------|---------|
 * | ja               | ja                    | photo   |
 * | ja               | nein                  | small   |
 * | nein             | –                     | plain   |
 *
 * photo: Satz zentriert, darunter EIN Foto (Ecke 28, ab Desktop −1,5°),
 *        Faktenpillen über der Unterkante, Wolkenkante in Bandfarbe.
 * small: Pastellfläche, Satz links, Faktenpillen in Pastell 2–4, Foto
 *        klein (≤ 58 %, Ecke 20, ab Desktop +1,5°, weißer Rand).
 * plain: wie small ohne Foto — die Faktenpillen tragen.
 */
export type EntryVariant = "photo" | "small" | "plain";

export function entryVariant(
  data: WebsiteDataV2,
  hero: SectionOf<"hero"> | undefined
): EntryVariant {
  if (!heroPhoto(data, hero)) return "plain";
  return data.designProfile?.composition === "stage" ? "photo" : "small";
}

/* ── Pille über dem Titel ─────────────────────────────────────────────── */

/**
 * Name (h1) und Rest der Zeile über dem Titel: „Fellfreunde · Hundesalon
 * in Leipzig-Gohlis". Die Pille (mit Punkt) gibt es nur, wenn der Ort in
 * den Daten steht (Betreiber 2026-10-13; eine Zielgruppe führt das
 * Dokument nicht) — sonst steht der Name ohne Pille als ruhige Zeile.
 * `branch` nur, wenn der Name die Branche nicht schon nennt.
 */
export type EntryTop = {
  name: string;
  branch?: string;
  city?: string;
  /** Pille ohne Namen (Einstieg ohne große Zeile): „Hundesalon in Leipzig". */
  kicker: string;
  pill: boolean;
};

export function entryTop(data: WebsiteDataV2, blueprint: Blueprint): EntryTop {
  const name = nameOf(data);
  const branch = branchOf(data, blueprint);
  const city = contactOf(visibleDoc(data).sections)?.city?.trim() || undefined;
  return {
    name,
    ...(branch && !lower(name).includes(lower(branch)) ? { branch } : {}),
    ...(city ? { city } : {}),
    kicker: [branch, city].filter(Boolean).join(" in "),
    pill: Boolean(city),
  };
}

const HEADLINE_MAX = 90;
const LEDE_MAX = 200;
const SENTENCE = /[.!?](\s+|$)/g;

/**
 * Große Zeile: die Überschrift — außer sie wiederholt nur Name oder
 * Branche; dann die Tagline; sonst keine (der Name trägt als h1).
 */
export function entryHeadline(
  hero: SectionOf<"hero">,
  data: WebsiteDataV2,
  blueprint: Blueprint
): string | undefined {
  const name = nameOf(data);
  const branch = branchOf(data, blueprint) ?? "";
  const echo = (t: string) =>
    echoesKicker(t, name) || (branch !== "" && echoesKicker(t, branch));
  return [plain(hero.headline), plain(data.tagline)].find(
    t => t.length > 0 && t.length <= HEADLINE_MAX && !echo(t)
  );
}

/**
 * Zweiter Satzteil in Akzentfarbe (Systemblatt: „Frisch gebürstet, / ganz
 * entspannt.", „Klein, warm, / mitten im Viertel."): Teilung am letzten
 * Komma, Semikolon, Doppelpunkt, Ausrufe-/Fragezeichen oder Gedankenstrich
 * mit Text dahinter. Ein Punkt teilt nur als Satzschluss: das Wort davor
 * hat mindestens vier Zeichen (keine Abkürzung wie „Dr.", „z. B.", „Nr.")
 * und danach folgt ein Großbuchstabe oder eine Ziffer. Ohne gültige Stelle
 * ab vier Wörtern die letzten zwei Wörter; sonst keine Teilung.
 */
const SEPARATOR = /([,;:!?]|\.|\s[–—-])\s+(?=\S)/g;
const MIN_SENTENCE_WORD = 4;

function validSplit(text: string, at: number, sep: string, after: number): boolean {
  if (sep !== ".") return true;
  const word = text.slice(0, at).match(/([\p{L}\p{N}]+)$/u)?.[1] ?? "";
  if ([...word].length < MIN_SENTENCE_WORD) return false;
  return /^[\p{Lu}\p{N}„"]/u.test(text.slice(after));
}

export function splitHeadline(text: string): { lead: string; rest?: string } {
  let cut: { lead: string; rest: string } | undefined;
  for (const m of text.matchAll(SEPARATOR)) {
    const at = m.index!;
    const after = at + m[0].length;
    if (after >= text.length || !validSplit(text, at, m[1], after)) continue;
    cut = {
      lead: text.slice(0, at + m[1].length).trimEnd(),
      rest: text.slice(after),
    };
  }
  if (cut) return cut;
  const words = text.split(/\s+/);
  if (words.length >= 4)
    return {
      lead: words.slice(0, -2).join(" "),
      rest: words.slice(-2).join(" "),
    };
  return { lead: text };
}

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

/* ── Faktenpillen ─────────────────────────────────────────────────────── */

export type FactPill = {
  label: string;
  icon: IconName;
  /** Ganzer Satz für Vorleser (sonst gilt `label`). */
  sr?: string;
};

/** Google-Note erst ab so vielen Bewertungen. */
export const MIN_REVIEWS = 20;
/** Höchstens drei Pillen (Systemblatt 6). */
export const MAX_PILLS = 3;
const IS_SPAN = /^\d{1,2}:\d{2} bis \d{1,2}:\d{2}$/;
const LITERAL_MAX = 28;

const hourText = (minutes: number) =>
  minutes % 60 === 0 ? `${minutes / 60} Uhr` : `${clock(minutes)} Uhr`;

/**
 * Heute-Pille: „Heute bis 22 Uhr" (Ende der letzten Spanne), „Heute
 * geschlossen", „Heute rund um die Uhr"; kurzer freier Text wörtlich.
 * Nur echte Zeiten (kein Platzhalter) und nur nach Wochentag.
 */
export function todayPill(
  hours: SectionOf<"contact">["openingHours"] | undefined,
  now: Date
): FactPill | undefined {
  const today = todayHours(hours, now);
  if (!today) return undefined;
  if (today.closed) return { label: "Heute geschlossen", icon: "clock" };
  const lines = today.lines.filter(l => l.trim() !== "");
  if (lines.length === 0) return undefined;
  if (lines.length === 1 && /rund um die uhr/i.test(lines[0]))
    return { label: "Heute rund um die Uhr", icon: "clock" };
  if (lines.every(l => IS_SPAN.test(l))) {
    // Ende der letzten Spanne („8:00 bis 12:00, 14:00 bis 18:00" → 18:00).
    const end = Math.max(
      ...lines.map(l => {
        const [, h, m] = l.match(/(\d{1,2}):(\d{2})$/)!;
        return Number(h) * 60 + Number(m);
      })
    );
    if (end >= 24 * 60) return { label: "Heute bis Mitternacht", icon: "clock" };
    return { label: `Heute bis ${hourText(end)}`, icon: "clock" };
  }
  const text = `Heute ${lines.join(", ")}`;
  return text.length <= LITERAL_MAX ? { label: text, icon: "clock" } : undefined;
}

/** Google-Note ab {@link MIN_REVIEWS} Bewertungen. */
export function ratingPill(doc: WebsiteDataV2): FactPill | undefined {
  const g = doc.google;
  if (!g || !(g.rating > 0) || g.rating > 5 || !(g.reviewCount >= MIN_REVIEWS))
    return undefined;
  const count = g.reviewCount.toLocaleString("de-DE");
  const value = formatHeroRating(g.rating);
  return {
    label: `${value} · ${count} Bewertungen`,
    icon: "star",
    sr: `${value} von 5 Sternen bei ${count} Google-Bewertungen`,
  };
}

/** Echte Ausstattung aus dem Google-Profil (nur `true` zählt). */
const AMENITIES: [keyof NonNullable<WebsiteDataV2["amenities"]>, string, IconName][] = [
  ["wheelchair", "Barrierefreier Zugang", "access"],
  ["takeout", "Zum Mitnehmen", "bag"],
  ["delivery", "Lieferung", "truck"],
  ["vegetarian", "Vegetarische Auswahl", "leaf"],
  ["breakfast", "Frühstück", "cup"],
  ["reservable", "Reservierbar", "calendar"],
];

/**
 * Faktenpillen nur aus Daten, in dieser Reihenfolge: Heute (Zeiten),
 * Google-Note (≥ 20 Bewertungen), echte Ausstattung, Adresse (Straße;
 * ohne Straße der Ort, wenn ihn nicht schon die Pille über dem Titel
 * nennt). Höchstens drei; keine Daten → keine Pillen.
 */
export function factPills(
  doc: WebsiteDataV2,
  now: Date,
  cityShown = false
): FactPill[] {
  const contact = contactOf(visibleDoc(doc).sections);
  const out: FactPill[] = [];
  const today = todayPill(contact?.openingHours, now);
  if (today) out.push(today);
  const rating = ratingPill(doc);
  if (rating) out.push(rating);
  for (const [key, label, icon] of AMENITIES)
    if (doc.amenities?.[key] === true) out.push({ label, icon });
  const street = streetLine(contact?.street);
  const city = contact?.city?.trim();
  if (street) out.push({ label: street, icon: "pin" });
  else if (city && !cityShown) out.push({ label: city, icon: "pin" });
  return out.slice(0, MAX_PILLS);
}

/* ── Wege ─────────────────────────────────────────────────────────────── */

/**
 * Hat „Besuch uns" etwas zu zeigen? Zeiten, Anschrift, Telefon, E-Mail —
 * oder das Kontaktformular (`form`: gebucht bzw. die Insel rendert; dann
 * bleibt das Kapitel samt #kontakt als Ziel der Hydration und der Knöpfe).
 * Sonst entfällt es samt Anker (F3-Review).
 */
export function contactHasContent(
  section: SectionOf<"contact">,
  form: boolean
): boolean {
  return (
    form ||
    hoursRows(section.openingHours, new Date(0)).length > 0 ||
    Boolean(addressLine(section)) ||
    Boolean(telHref(section.phone?.trim())) ||
    Boolean(mailHref(section.email?.trim()))
  );
}

/**
 * Wege wie Klar/Nacht (shared/actions.ts): Buchungslink → Formular →
 * Bauplan → Anruf. Ein leerer Kontakt (entfällt, s. contactHasContent) ist
 * kein Ziel: kein Knopf führt auf einen fehlenden Anker #kontakt.
 */
export function freundlichActions(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): ReturnType<typeof systemActions> {
  const contact = contactOf(doc.sections);
  const empty =
    contact && !contactHasContent(contact, doc.features?.contactForm === true);
  const usable = empty
    ? { ...doc, sections: doc.sections.filter(s => s !== contact) }
    : doc;
  return systemActions(usable as WebsiteDataV2, blueprint, anchorPrefix);
}
export type { Action };

/**
 * Kurzform für die Handy-Leiste: „Termin anfragen" → „Termin", „Platz
 * anfragen" → „Anfragen", „Route planen" → „Route".
 */
const VERB = /^(\S+)\s+(reservieren|anfragen|buchen|vereinbaren|planen)$/i;
export function shortLabel(label: string): string {
  const t = label.trim();
  const m = t.match(VERB);
  if (!m) return t;
  if (/^termin$/i.test(m[1])) return "Termin";
  if (/vereinbaren|planen/i.test(m[2])) return m[1];
  return m[2].charAt(0).toLocaleUpperCase("de") + m[2].slice(1).toLowerCase();
}

/**
 * Handy-Leiste (Systemblatt 10): links „Anrufen", rechts der Hauptweg in
 * Kurzform. Ruft schon der Hauptweg an, steht links der zweite Weg.
 */
export function dockPair(actions: {
  primary?: Action;
  second?: Action;
  phone?: Action;
}): { left?: Action; main: Action } | undefined {
  const { primary, second, phone } = actions;
  if (!primary) return undefined;
  const calls = primary.href.startsWith("tel:");
  const left = calls
    ? second
    : phone
      ? { label: "Anrufen", href: phone.href }
      : second;
  return {
    ...(left ? { left } : {}),
    main: { ...primary, label: shortLabel(primary.label) },
  };
}

/** Zeichen im Logo: erster Buchstabe oder erste Ziffer des Namens. */
export function monogramOf(name: string): string {
  const letter = Array.from(name.trim()).find(c => /\p{L}|\p{N}/u.test(c));
  return (letter ?? "·").toLocaleUpperCase("de");
}

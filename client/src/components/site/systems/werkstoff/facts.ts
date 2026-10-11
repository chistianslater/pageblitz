import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { tradeLabel } from "../../../../../../shared/stylePacks/blueprints";
import { displayName } from "../../../../../../shared/designSystems/displayName";
import {
  coversToday,
  isPlaceholderHours,
  telHref,
} from "../../artDirection/heroFacts";
import { stripMarks } from "../../richText";
import { echoesKicker, heroPhoto, isRoundTheClock } from "../raster/facts";
import { orderedSections } from "../../engine";
import {
  addressLine,
  contactOf,
  mailHref,
  mapsHref,
  primaryAction,
  systemShows,
} from "../shared";

/**
 * Reine Daten-Regeln für Werkstoff (Kopf, Zettel, Einstieg, Leiste).
 * Nichts wird erfunden: Fehlt eine Angabe, entfällt das Element.
 */

/** Gewerk bzw. Branche („Schreinerei", „Bäckerei"). */
export function branchOf(
  data: WebsiteDataV2,
  blueprint: Blueprint
): string | undefined {
  const label =
    blueprint.id === "trade"
      ? tradeLabel(data.businessCategory, data.businessName)
      : data.businessCategory;
  return label?.trim() || undefined;
}

const lower = (t: string) => t.toLocaleLowerCase("de");

/**
 * Kopf nach Systemblatt: Name in Slab, Gewerk in Mono darunter
 * („Holtkamp / SCHREINEREI"). Beginnt oder endet der Name mit dem Gewerk,
 * steht es nur einmal (unten); sonst bleibt der Name ganz.
 */
export function brandParts(
  name: string,
  branch: string | undefined
): { mark: string; sub?: string } {
  if (!branch) return { mark: name };
  const n = lower(name);
  const b = lower(branch);
  if (n.startsWith(`${b} `))
    return { mark: name.slice(branch.length).trim(), sub: branch };
  if (n.endsWith(` ${b}`))
    return { mark: name.slice(0, -branch.length).trim(), sub: branch };
  return n.includes(b) ? { mark: name } : { mark: name, sub: branch };
}

/** Anzeigename ohne Rechtsform. */
export const nameOf = (data: WebsiteDataV2) => displayName(data.businessName);

/** Dokument nur mit den Abschnitten, die das System auch zeigt. */
export function visibleDoc(doc: WebsiteDataV2): WebsiteDataV2 {
  const shown = new Set(
    orderedSections(doc)
      .filter(systemShows)
      .map(s => s.type)
  );
  return { ...doc, sections: doc.sections.filter(s => shown.has(s.type)) };
}

export type Action = { label: string; href: string };

/**
 * Zwei Wege laut Systemblatt: Anrufen und Route; Läden (Bauplan mit
 * Route-Aktion) zuerst Route. Fehlt einer, rückt die Hauptaktion des
 * Bauplans nach (sonst E-Mail). Nur aus sichtbaren Abschnitten — ein
 * ausgeblendeter Kontakt liefert weder Telefon noch Route.
 */
export function actionPair(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): Action[] {
  const data = visibleDoc(doc);
  const contact = contactOf(data.sections);
  const tel = telHref(contact?.phone);
  const address = addressLine(contact);
  const call = tel ? { label: "Anrufen", href: tel } : undefined;
  const route = address
    ? { label: "Route", href: mapsHref(address) }
    : undefined;
  const mail = mailHref(contact?.email);
  const ways =
    blueprint.ctaAction === "route" ? [route, call] : [call, route];
  const fallback = [
    primaryAction(data, blueprint, anchorPrefix),
    mail ? { label: "E-Mail", href: mail } : undefined,
  ];
  const out: Action[] = [];
  for (const a of [...ways, ...fallback]) {
    if (a && !out.some(o => o.href === a.href)) out.push(a);
    if (out.length === 2) break;
  }
  return out;
}

/**
 * Knöpfe im Einstieg (Desktop, Systemblatt 14): erster Weg der Leiste in
 * Signal, daneben die Hauptaktion des Bauplans („Aufmaß anfragen"), wenn
 * sie etwas anderes tut — sonst der zweite Weg.
 */
export function entryActions(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): Action[] {
  const pair = actionPair(doc, blueprint, anchorPrefix);
  const primary = primaryAction(visibleDoc(doc), blueprint, anchorPrefix);
  if (!pair.length) return [];
  const second =
    primary.href !== pair[0].href ? primary : (pair[1] ?? undefined);
  return second ? [pair[0], second] : [pair[0]];
}

/* ── Zeiten ───────────────────────────────────────────────────────────── */

type Hours = SectionOf<"contact">["openingHours"];

const RANGE =
  /(\d{1,2})(?:[:.](\d{2}))?\s*(?:Uhr)?\s*[–-]\s*(\d{1,2})(?:[:.](\d{2}))?/g;

/** Minuten seit Mitternacht → „6:00", „17:30" (Systemblatt, Mono). */
export const clock = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;

/** „7:00 – 12:00, 13:00 – 17:00 Uhr" → Zeitspannen in Minuten. */
export function intervals(text: string): { from: number; to: number }[] {
  return [...text.matchAll(RANGE)]
    .map(m => ({
      from: Number(m[1]) * 60 + Number(m[2] ?? 0),
      to: Number(m[3]) * 60 + Number(m[4] ?? 0),
    }))
    .filter(r => r.from < 24 * 60 && r.to <= 24 * 60);
}

/** Echte Zeiten (kein Platzhalter der Erzeugung), sonst nichts. */
const realHours = (hours: Hours | undefined) =>
  hours?.length && !isPlaceholderHours(hours) ? hours : undefined;

const CLOSED = /geschlossen|closed|ruhetag/i;

/**
 * Stand für heute, nur aus echten Zeiten. Bewusst kein „jetzt geöffnet"
 * nach Uhrzeit: Live-Seiten liegen bis zu einer Stunde im Cache. Einzige
 * Ausnahme ist rund um die Uhr — dann stimmt „Jetzt geöffnet" immer.
 *  - `big`/`side`: große Zettelzeile („Heute offen" · „7:00–17:00")
 *  - `status`: kurz für Zettel-Leiste und Einstieg („Heute bis 17:00")
 *  - `line`: Satz im Uhrzeit-Einstieg („Heute geöffnet bis 17:00")
 */
export type TodayStatus = {
  big?: string;
  side?: string;
  status: string;
  line: string;
  allDay?: boolean;
};

export function todayStatus(
  hours: Hours | undefined,
  now: Date
): TodayStatus | undefined {
  const real = realHours(hours);
  if (!real) return undefined;
  if (isRoundTheClock(real))
    return {
      big: "Rund um die Uhr",
      status: "Jetzt geöffnet",
      line: "Rund um die Uhr geöffnet",
      allDay: true,
    };
  const entry = real.find(h => coversToday(h.day, now));
  if (!entry) return undefined;
  if (CLOSED.test(entry.hours))
    return { status: "Heute geschlossen", line: "Heute geschlossen" };
  const spans = intervals(entry.hours);
  if (!spans.length) {
    const text = entry.hours.trim();
    return text
      ? { big: "Heute", side: text, status: `Heute ${text}`, line: `Heute ${text}` }
      : undefined;
  }
  const end = clock(spans[spans.length - 1].to);
  return {
    big: "Heute offen",
    side: spans.map(s => `${clock(s.from)}–${clock(s.to)}`).join(", "),
    status: `Heute bis ${end}`,
    line: `Heute geöffnet bis ${end}`,
  };
}

/** Ein Montag (Berlin, Mittag) — Basis, um die Werktage zu prüfen. */
const MONDAY = Date.UTC(2026, 9, 12, 10);
const DAY_MS = 86_400_000;
/** Ab dieser Öffnungszeit trägt die Uhrzeit den Einstieg (Systemblatt „6:00"). */
export const EARLY_OPENING = 8 * 60;

/**
 * Früheste Öffnung an einem Werktag (Mo–Fr), nur aus echten Zeiten und nur
 * bis 8:00 — sonst nichts. Werktag statt heute, damit die Ziffer nicht mit
 * dem Wochentag springt (Sonntag 7:00, Montag 6:00).
 */
export function earlyOpening(hours: Hours | undefined): string | undefined {
  const real = realHours(hours);
  if (!real || isRoundTheClock(real)) return undefined;
  const starts = Array.from(
    { length: 5 },
    (_, i) => new Date(MONDAY + i * DAY_MS)
  ).flatMap(day => {
    const entry = real.find(h => coversToday(h.day, day));
    if (!entry || CLOSED.test(entry.hours)) return [];
    const [first] = intervals(entry.hours);
    return first ? [first.from] : [];
  });
  if (!starts.length) return undefined;
  const earliest = Math.min(...starts);
  return earliest <= EARLY_OPENING ? clock(earliest) : undefined;
}

/* ── Einstieg ─────────────────────────────────────────────────────────── */

/**
 * Drei Einstiege laut Systemblatt 8 (Entscheidungstabelle). Ein
 * brauchbares Foto des Betriebs fällt nie weg.
 *
 * | Bäckerei/Café + Werktags-Öffnung ≤ 8:00 | Hero-Foto | Querformat | Fassung  |
 * |------------------------------------------|-----------|------------|----------|
 * | ja                                       | egal      | egal       | time     |
 * | nein                                     | ja        | ja         | photo    |
 * | nein                                     | ja        | nein       | portrait |
 * | nein                                     | nein      | –          | type     |
 *
 * „Foto" wie Raster: Hero-Bild vorhanden und nicht als `hero-media`
 * ausgeblendet. „Querformat" = `designProfile.composition === "stage"`
 * (gemessen großes Querformat, siehe server/generationV2/heroPhoto.ts).
 * time: Foto unter Satz und Heute-Stand, ohne Foto der Zettel.
 * photo: Foto randlos, Zettel über der Bildkante (Desktop: über der Kante
 * zur Textspalte). portrait: Hochformat ruhiger unter dem Text, Zettel
 * darunter angesetzt. type: Name füllt die Breite, Zettel trägt.
 */
export type EntryVariant = "time" | "photo" | "portrait" | "type";

const BAKERY = /bäckerei|baeckerei|backhaus|backstube|konditorei|bäcker\b/i;

/** Bäckerei- oder Café-Familie (Bauplan Café oder Bäckerei-Kategorie). */
export function isBakeryOrCafe(data: WebsiteDataV2, blueprint: Blueprint) {
  return (
    blueprint.gastroKind === "cafe" ||
    BAKERY.test(`${data.businessCategory ?? ""} ${data.businessName}`)
  );
}

export function entryVariant(
  data: WebsiteDataV2,
  hero: SectionOf<"hero"> | undefined,
  blueprint: Blueprint
): EntryVariant {
  const contact = contactOf(visibleDoc(data).sections);
  if (isBakeryOrCafe(data, blueprint) && earlyOpening(contact?.openingHours))
    return "time";
  if (!heroPhoto(data, hero)) return "type";
  return data.designProfile?.composition === "stage" ? "photo" : "portrait";
}

const plain = (t: string | undefined) => (t ? stripMarks(t).trim() : "");

/** Große Zeile höchstens so lang (Systemblatt: „Gebaut, um zu bleiben."). */
const HEADLINE_MAX = 90;
/** Satz darunter: ein, zwei kurze Sätze. */
const LEDE_MAX = 160;

/** Kicker wie Raster („Schreinerei in Münster") — Grundlage der Doppel-Prüfung. */
export function entryKicker(
  data: WebsiteDataV2,
  blueprint: Blueprint
): string {
  const city = contactOf(visibleDoc(data).sections)?.city?.trim();
  return [branchOf(data, blueprint), city].filter(Boolean).join(" in ");
}

/**
 * Große Zeile des Einstiegs: die Überschrift — außer sie wiederholt nur den
 * Kicker oder den Namen (echoesKicker wie Raster, z. B. „Schreinerei in
 * Münster"); dann die Tagline; sonst keine (der Name trägt).
 */
export function entryHeadline(
  hero: SectionOf<"hero">,
  data: WebsiteDataV2,
  blueprint: Blueprint
): string | undefined {
  const kicker = entryKicker(data, blueprint);
  const name = nameOf(data);
  const echo = (t: string) =>
    echoesKicker(t, kicker) || echoesKicker(t, name);
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

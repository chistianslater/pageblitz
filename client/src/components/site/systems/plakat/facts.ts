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
  addressLine,
  branchOf,
  contactOf,
  echoesKicker,
  heroPhoto,
  mailHref,
  mapsHref,
  nameOf,
  primaryAction,
  visibleDoc,
} from "../shared";
import { firstHours, lateClose, sundayOpen, uhr } from "./hours";

/**
 * Reine Daten-Regeln für Plakat (Einstieg, Sticker, Laufband, Dock).
 * Nichts wird erfunden: Fehlt eine Angabe, entfällt das Element.
 */

/* ── Wege ─────────────────────────────────────────────────────────────── */

export type Action = { label: string; href: string };

/**
 * Wege nach Systemblatt: Hauptaktion des Bauplans in Signal („Termin
 * buchen", „Anrufen & abholen"), daneben Anrufen — ist die Hauptaktion
 * selbst der Anruf, rückt Route nach (sonst E-Mail). Nur aus sichtbaren
 * Abschnitten: Ein Anker auf einen ausgeblendeten Abschnitt zählt nicht.
 * Ohne jeden Weg: keine Wege.
 */
export function plakatActions(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): { primary?: Action; other?: Action } {
  const data = visibleDoc(doc);
  const contact = contactOf(data.sections);
  const anchors = new Set(data.sections.map(s => `#${SECTION_ANCHORS[s.type]}`));
  const main = primaryAction(data, blueprint, anchorPrefix);
  const hash = main.href.slice(anchorPrefix.length);
  const mainOk =
    !main.href.startsWith(`${anchorPrefix}#`) || anchors.has(hash);
  const tel = telHref(contact?.phone);
  const address = addressLine(contact);
  const mail = mailHref(contact?.email);
  const ways: Action[] = [];
  for (const a of [
    mainOk ? main : undefined,
    tel ? { label: "Anrufen", href: tel } : undefined,
    address ? { label: "Route", href: mapsHref(address) } : undefined,
    mail ? { label: "E-Mail", href: mail } : undefined,
  ])
    if (a && !ways.some(w => w.href === a.href)) ways.push(a);
  return { primary: ways[0], other: ways[1] };
}

/**
 * Zweiter Knopf im Einstieg (Systemblatt: Kontur mit Telefonnummer): die
 * Nummer, wenn die Hauptaktion nicht schon anruft; sonst Route.
 */
export function entrySecond(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  primary: Action
): Action | undefined {
  const contact = contactOf(visibleDoc(doc).sections);
  const tel = telHref(contact?.phone);
  if (tel && contact?.phone && tel !== primary.href)
    return { label: contact.phone.trim(), href: tel };
  const address = addressLine(contact);
  return address && mapsHref(address) !== primary.href
    ? { label: "Route", href: mapsHref(address) }
    : undefined;
}

/* ── Einstieg ─────────────────────────────────────────────────────────── */

/**
 * Drei Einstiege laut Systemblatt 8 (Entscheidungstabelle). Ein
 * brauchbares Foto des Betriebs fällt nie weg.
 *
 * | Foto (heroPhoto) | Imbiss/Gastro-Essen | Fassung | Fläche          |
 * |------------------|---------------------|---------|-----------------|
 * | ja               | ja                  | circle  | helles Feld 1   |
 * | ja               | nein                | arch    | Grund           |
 * | nein             | –                   | type    | helles Feld 1   |
 *
 * „Foto" wie Werkstoff/Raster: Hero-Bild vorhanden und nicht als
 * `hero-media` ausgeblendet. Essen = Bauplan Gastro mit Unterart Imbiss
 * oder Restaurant (Gerichte im Kreis); Café/Bäckerei bleiben beim Bogen.
 */
export type EntryVariant = "arch" | "circle" | "type";

export function entryVariant(
  data: WebsiteDataV2,
  hero: SectionOf<"hero"> | undefined,
  blueprint: Blueprint
): EntryVariant {
  if (!heroPhoto(data, hero)) return "type";
  const food =
    blueprint.gastroKind === "imbiss" || blueprint.gastroKind === "restaurant";
  return food ? "circle" : "arch";
}

/** Einstieg auf Grund (Bogen) oder hellem Feld (Kreis, Schrift). */
export const entryGround = (v: EntryVariant) => (v === "arch" ? "ground" : "field");

const plain = (t: string | undefined) => (t ? stripMarks(t).trim() : "");

/** Große Zeile höchstens so lang. */
const HEADLINE_MAX = 90;
/** Satz darunter: ein, zwei kurze Sätze. */
const LEDE_MAX = 160;

/** Kicker wie Raster/Werkstoff („Barbershop in Münster") — Doppel-Prüfung. */
export function entryKicker(data: WebsiteDataV2, blueprint: Blueprint): string {
  const city = contactOf(visibleDoc(data).sections)?.city?.trim();
  return [branchOf(data, blueprint), city].filter(Boolean).join(" in ");
}

/**
 * Große Zeile: die Überschrift — außer sie wiederholt nur Kicker oder
 * Namen (echoesKicker); dann die Tagline; sonst keine (der Name trägt).
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

/* ── Preise ───────────────────────────────────────────────────────────── */

type Priced = { name: string; price: number; text: string; source: "menu" | "pricelist" | "services" };

/** Zahl direkt vor „€"/„EUR" (z. B. „1 Std. 50 €" → 50, nicht 1). */
const WITH_EURO = /(\d{1,4})(?:[.,](\d{1,2}))?\s*(?:€|eur\b|euro\b)/i;
/** Nur eine Zahl („45", „ab 7,50"). */
const BARE = /^\s*(?:ab\s+)?(\d{1,4})(?:[.,](\d{1,2}))?\s*$/i;
const FREE = /\b(gratis|kostenlos|umsonst)\b/i;

/** „7,50 €" → 7.5; „gratis" → 0; sonst (unklar) → undefined. */
export function priceValue(price: string): number | undefined {
  if (FREE.test(price)) return 0;
  const m = price.match(WITH_EURO) ?? price.match(BARE);
  if (!m) return undefined;
  return Number(m[1]) + (m[2] ? Number(m[2].padEnd(2, "0")) / 100 : 0);
}

/** 7.5 → „7,50", 28 → „28". */
export const euro = (v: number) =>
  Number.isInteger(v) ? String(v) : v.toFixed(2).replace(".", ",");

/** Alle echten Preise aus sichtbaren Preisliste, Karte und Leistungen. */
export function pricedItems(data: WebsiteDataV2): Priced[] {
  return visibleDoc(data).sections.flatMap((s): Priced[] => {
    if (s.type === "menu" || s.type === "pricelist")
      return s.categories.flatMap(c =>
        c.items.flatMap(i => {
          const price = priceValue(i.price);
          return price === undefined
            ? []
            : [{ name: i.name.trim(), price, text: i.price.trim(), source: s.type }];
        })
      );
    if (s.type === "services")
      return s.items.flatMap(i => {
        const price = i.price ? priceValue(i.price) : undefined;
        return price === undefined
          ? []
          : [{ name: i.title.trim(), price, text: i.price!.trim(), source: "services" as const }];
      });
    return [];
  });
}

/* ── Sticker ──────────────────────────────────────────────────────────── */

export type Sticker = {
  /** Große Zeile (League Gothic), z. B. „4,9", „Bis 2", „Gratis". */
  big: string;
  /** Kleine Zeile darunter. */
  small?: string;
  /** Quelle (Allowlist, Test). */
  source: "google" | "late" | "sunday" | "free" | "price" | "amenity";
};

/** Google-Sticker erst ab dieser Bewertung und Anzahl (Systemblatt). */
export const STICKER_RATING = 4.5;
export const STICKER_REVIEWS = 20;
/** Kleine Zeile höchstens so lang (sonst ohne). */
const SMALL_MAX = 20;

/** Belegte Ausstattung → Sticker (nur, was das Google-Profil meldet). */
const AMENITY_STICKERS: [keyof NonNullable<WebsiteDataV2["amenities"]>, string, string][] = [
  ["delivery", "Auch", "Lieferung"],
  ["takeout", "To go", "zum Mitnehmen"],
  ["vegetarian", "Veggie", "auch vegetarisch"],
];

/**
 * Höchstens ein Sticker im Einstieg, nur aus der Quellen-Allowlist des
 * Plans (Systemblatt Abschnitt 08), in dieser Reihenfolge:
 *  1. Öffnungszeiten nach Mitternacht („Bis 2 / Uhr offen")
 *  2. Preis 0 € („Gratis / Probetraining")
 *  3. Google ab 4,5 bei mindestens 20 Bewertungen („4,9 / bei Google")
 *  4. sonntags geöffnet („Sonntag / offen")
 *  5. kleinster echter Preis („Ab 7,50 / Euro")
 *  6. Ausstattung laut Google-Profil („Auch / Lieferung")
 * Kein Gründungsjahr (Feld gibt es nicht). Kein Fakt → kein Sticker.
 */
export function entrySticker(doc: WebsiteDataV2): Sticker | undefined {
  const data = visibleDoc(doc);
  const hours = contactOf(data.sections)?.openingHours;
  const late = lateClose(hours);
  if (late !== undefined)
    return { big: `Bis ${uhr(late).replace(" Uhr", "")}`, small: "Uhr offen", source: "late" };
  const prices = pricedItems(data);
  const free = prices.find(p => p.price === 0);
  if (free)
    return {
      big: "Gratis",
      ...(free.name.length <= SMALL_MAX ? { small: free.name } : {}),
      source: "free",
    };
  const g = data.google;
  if (g && g.rating >= STICKER_RATING && g.reviewCount >= STICKER_REVIEWS && g.rating <= 5)
    return { big: formatHeroRating(g.rating), small: "bei Google", source: "google" };
  if (sundayOpen(hours)) return { big: "Sonntag", small: "offen", source: "sunday" };
  const paid = prices.filter(p => p.price > 0);
  if (paid.length) {
    const min = Math.min(...paid.map(p => p.price));
    return { big: `Ab ${euro(min)}`, small: "Euro", source: "price" };
  }
  const amenity = AMENITY_STICKERS.find(([key]) => data.amenities?.[key] === true);
  if (amenity) return { big: amenity[1], small: amenity[2], source: "amenity" };
  return undefined;
}

/* ── Fakten unter dem Einstieg ────────────────────────────────────────── */

export type Fact = { strong: string; sub: string };

/** Name eines Preises höchstens so lang, sonst nur „Ab 28 €". */
const FACT_NAME_MAX = 18;

/**
 * Bis zu vier Fakten (Systemblatt: „Haarschnitt ab 28 € / aus der
 * Preisliste", „Mo bis Sa / …", Adresse, „312 Bewertungen / bei Google").
 * Nur belegte Angaben.
 */
export function entryFacts(doc: WebsiteDataV2): Fact[] {
  const data = visibleDoc(doc);
  const contact = contactOf(data.sections);
  const out: Fact[] = [];
  const paid = pricedItems(data).filter(p => p.price > 0);
  if (paid.length) {
    const min = paid.reduce((a, b) => (b.price < a.price ? b : a));
    const label = `ab ${euro(min.price)} €`;
    out.push({
      strong:
        min.name.length <= FACT_NAME_MAX ? `${min.name} ${label}` : label.replace(/^a/, "A"),
      sub: min.source === "menu" ? "aus der Karte" : min.source === "pricelist" ? "aus der Preisliste" : "aus den Leistungen",
    });
  }
  const hours = firstHours(contact?.openingHours);
  if (hours) out.push({ strong: hours.day, sub: hours.hours });
  const street = contact?.street?.trim();
  const place = [contact?.zip, contact?.city].filter(Boolean).join(" ").trim();
  if (street || place) out.push(street && place ? { strong: street, sub: place } : { strong: street || place, sub: "Adresse" });
  const g = data.google;
  if (g && g.reviewCount > 0) {
    const noun = g.reviewCount === 1 ? "Bewertung" : "Bewertungen";
    out.push({ strong: `${g.reviewCount.toLocaleString("de-DE")} ${noun}`, sub: "bei Google" });
  }
  return out.slice(0, 4);
}

/* ── Laufband ─────────────────────────────────────────────────────────── */

/** Bis zu fünf Leistungen, Straße, Zeiten-Kurzform (Systemblatt 09). */
const TICKER_SERVICES = 5;
/** Einträge höchstens so lang (sonst weglassen). */
const TICKER_ITEM_MAX = 28;
/** Unter so vielen Einträgen entfällt das Laufband. */
export const TICKER_MIN = 2;

export function tickerItems(doc: WebsiteDataV2): string[] {
  const data = visibleDoc(doc);
  const services = data.sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const contact = contactOf(data.sections);
  const items = (services?.items ?? [])
    .map(i => plain(i.title))
    .filter(t => t.length > 0 && t.length <= TICKER_ITEM_MAX)
    .slice(0, TICKER_SERVICES);
  const street = contact?.street?.trim();
  if (street && street.length <= TICKER_ITEM_MAX) items.push(street);
  const hours = firstHours(contact?.openingHours);
  if (hours) {
    const short = `${hours.day} ${hours.hours.replace(/\s*Uhr$/, "")}`;
    if (short.length <= TICKER_ITEM_MAX) items.push(short);
  }
  const unique = items.filter((t, i) => items.indexOf(t) === i);
  return unique.length >= TICKER_MIN ? unique : [];
}

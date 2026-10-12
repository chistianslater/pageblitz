import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { coversToday } from "../../artDirection/heroFacts";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import { stripMarks } from "../../richText";
import {
  brandParts,
  branchOf,
  contactOf,
  echoesKicker,
  heroPhoto,
  isRoundTheClock,
  nameOf,
  visibleDoc,
} from "../shared";
import {
  clock,
  hoursRows,
  readSpans,
  realHours,
  todayHours,
  type Hours,
  type HoursRow,
} from "../shared/hours";
import { systemActions, type Action } from "../shared/actions";

/**
 * Reine Daten-Regeln für Nacht (Einstieg, Ziffer, Heute/Küche, Wege).
 * Nichts wird erfunden: Fehlt eine Angabe, entfällt das Element.
 */

const plain = (t: string | undefined) => (t ? stripMarks(t).trim() : "");

/* ── Küche ────────────────────────────────────────────────────────────── */

/**
 * Küchenzeit steht nur im Öffnungszeiten-Text („17:30 – 23:00, Küche bis
 * 21:30", „warme Küche bis 21 Uhr", „Küche 17:30–21:30"). Der Teil ab
 * „Küche" bis zum nächsten Komma/Semikolon/Klammer gehört der Küche — er
 * zählt nicht als Öffnungsspanne. Eine Klammer direkt dahinter („(Fr/Sa
 * 22:30)") ist eine Ausnahme für bestimmte Tage: Sie gilt nur an diesen
 * Tagen und nur, wenn `now` bekannt ist. Eine Küchenzeit mit Tagesangabe
 * („Küche Fr/Sa bis 22:30") zählt nur an diesen Tagen. Was sich nicht
 * eindeutig dem heutigen Tag zuordnen lässt, ergibt keine Küchenzeit.
 * Gemeint ist die Zeit direkt nach „bis" oder das Ende einer „–"-Spanne.
 */
const KITCHEN = /(?:warme\s+)?(k(?:ü|ue)che\b[^,;·|()]*)/i;
/** Buchstabe in beiden Schreibweisen: „Fr" → `[Ff][Rr]`. */
const ci = (w: string) =>
  Array.from(w, c => `[${c.toUpperCase()}${c.toLowerCase()}]`).join("");
/**
 * Wochentage ohne Rücksicht auf Groß-/Kleinschreibung — außer „So" und „Do":
 * kleingeschrieben sind das Wörter („so lange"), Tage nur als „So"/„Do" oder
 * mit Punkt/Strich/Schrägstrich („so.", „do–fr", „so/mo").
 */
const DAY_NAME =
  "(?:" +
  ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag", "Mo", "Di", "Mi", "Fr", "Sa"]
    .map(ci)
    .join("|") +
  "|So|Do|(?:so|do)(?=[.–\\-/]))\\.?";
const KITCHEN_WORD = `${ci("k")}(?:[üÜ]|${ci("ue")})${ci("che")}`;
const DAY_WORD = new RegExp(`(?:^|[^\\p{L}])${DAY_NAME}(?![\\p{L}])`, "u");
const LEADING_DAYS = new RegExp(
  `^${KITCHEN_WORD}\\s+(${DAY_NAME}(?:\\s*(?:[–\\-/,&]|und)\\s*${DAY_NAME})*)\\s*`,
  "u"
);
const AT = /(\d{1,2})(?:[:.](\d{2}))?/;
const AFTER_BIS = new RegExp(`bis\\s*${AT.source}`, "i");
const RANGE_END = new RegExp(
  `${AT.source}\\s*(?:Uhr)?\\s*[–-]\\s*${AT.source}`
);
const EXCEPTION = new RegExp(
  `^(${DAY_NAME}(?:\\s*(?:[–\\-/,&]|und)\\s*${DAY_NAME})*)\\s*(?:bis\\s*)?${AT.source}\\s*(?:Uhr)?$`,
  "u"
);

const minutesOf = (h?: string, min?: string): number | undefined => {
  if (h === undefined) return undefined;
  const hh = Number(h);
  const mm = Number(min ?? 0);
  return hh <= 24 && mm < 60 ? hh * 60 + mm : undefined;
};

/** „Fr/Sa", „Fr–So", „Mo, Mi und Fr": gilt das für heute? */
function daysCoverToday(spec: string, now: Date): boolean {
  return spec
    .split(/[/,&]|\bund\b/)
    .map(t => t.replace(/\.$/, "").trim())
    .filter(Boolean)
    .some(t => coversToday(t, now));
}

/**
 * Ende der Küche in einem Zeitblock: Zeit direkt nach „bis" bzw. Ende einer
 * „–"-Spanne (bei mehreren: die letzte); „ab 17:30" ohne Ende: keine Zeit.
 */
function blockEnd(block: string): number | undefined {
  const found: { at: number; minutes: number | undefined }[] = [];
  for (const m of block.matchAll(new RegExp(AFTER_BIS.source, "gi")))
    found.push({ at: m.index!, minutes: minutesOf(m[1], m[2]) });
  for (const m of block.matchAll(new RegExp(RANGE_END.source, "g")))
    found.push({ at: m.index!, minutes: minutesOf(m[3], m[4]) });
  if (found.length === 0) return undefined;
  const last = found.reduce((a, b) => (b.at > a.at ? b : a));
  // Danach beginnt noch ein Block ohne Ende („… und ab 17:30"): unbekannt.
  if (/\bab\s*\d/i.test(block.slice(last.at + 1))) return undefined;
  return last.minutes;
}

/**
 * Mittags- und Abendküche („11:30–14:00 und 17:30–21:30"): Ende des
 * letzten Blocks; hat der letzte Block kein Ende, gibt es keine Zeit.
 */
function kitchenEnd(text: string): number | undefined {
  const blocks = text.split(/\s+und\s+|\s*[/&,]\s*/).filter(b => b.trim());
  return blocks.length ? blockEnd(blocks[blocks.length - 1]) : undefined;
}

function kitchenMinutes(
  segment: string,
  exception: string | undefined,
  now: Date | undefined
): number | undefined {
  const lead = segment.match(LEADING_DAYS);
  if (lead) {
    // Tagesangabe: nur an diesen Tagen, und nur wenn der Tag bekannt ist.
    if (!now || !daysCoverToday(lead[1], now)) return undefined;
    return kitchenEnd(segment.slice(lead[0].length));
  }
  // Tagesangabe an anderer Stelle im Küchenteil: nicht zuordenbar.
  if (DAY_WORD.test(segment.replace(new RegExp(`^${KITCHEN_WORD}`, "u"), ""))) return undefined;
  const base = kitchenEnd(segment);
  const ex = exception?.trim().match(EXCEPTION);
  if (ex && now && daysCoverToday(ex[1], now)) {
    return minutesOf(ex[2], ex[3]) ?? base;
  }
  return base;
}

export type KitchenSplit = {
  /** Zeiten ohne Küchenteil; nur Küche → Originaltext (Spanne als „x bis y"). */
  open: string;
  kitchen?: string;
  /** Der Text nennt nur die Küche — es gibt keine eigene Öffnungsspanne. */
  kitchenOnly?: true;
};

/** Zeit oder Zeitspanne allein („17:30–21:30", „12 – 14 Uhr"). */
const TIME_PART =
  "\\d{1,2}(?:[:.]\\d{2})?(?:\\s*Uhr)?(?:\\s*[–-]\\s*\\d{1,2}(?:[:.]\\d{2})?(?:\\s*Uhr)?)?";
const NEXT_PART = new RegExp(`\\s*,\\s*(${TIME_PART})(?=\\s*(?:[,;·|(]|$))`, "y");
const PAREN = /\s*\(([^)]*)\)/y;
const ENDS_IN_RANGE = /[–-]\s*\d{1,2}(?:[:.]\d{2})?\s*(?:Uhr)?\s*$/;

/**
 * Mittag und Abend mit Komma („Küche 11:30–14:00, 17:30–21:30"): Folgen auf
 * eine Küchenspanne weitere Komma-Teile, die nur aus Zeiten bestehen, gehören
 * sie zur Küche; beim ersten Teil mit einem Wort ist Schluss. Steht die
 * Küche als „bis X", ist ein folgendes Zeitstück meist die Öffnungsspanne
 * („Küche bis 21:30, 17:30 – 23:00"): Es bleibt draußen. Steht davor aber
 * schon eine Spanne, ist es nicht zuzuordnen („12–14:30, Küche bis 14,
 * 17:30–23:00") — dann gibt es keine Küchenzeit.
 */
function kitchenTail(text: string, from: number, segment: string, before: string) {
  let end = from;
  let seg = segment;
  let ambiguous = false;
  const rangeForm = ENDS_IN_RANGE.test(segment.trimEnd());
  for (;;) {
    NEXT_PART.lastIndex = end;
    const part = NEXT_PART.exec(text);
    if (!part) break;
    if (!rangeForm) {
      ambiguous = readSpans(before).length > 0;
      break;
    }
    end = NEXT_PART.lastIndex;
    seg += `, ${part[1]}`;
  }
  PAREN.lastIndex = end;
  const paren = PAREN.exec(text);
  if (paren) end = PAREN.lastIndex;
  return { end, seg, exception: paren?.[1], ambiguous };
}

export function kitchenOf(text: string, now?: Date): KitchenSplit {
  const m = text.match(KITCHEN);
  if (!m) return { open: text };
  const tail = kitchenTail(
    text,
    m.index! + m[0].length,
    m[1],
    text.slice(0, m.index!)
  );
  const open = (text.slice(0, m.index!) + text.slice(tail.end))
    .replace(/\(\s*\)/g, "")
    .replace(/[\s,;·|(]+$/, "")
    .replace(/^[\s,;·|]+/, "")
    .trim();
  const minutes = tail.ambiguous
    ? undefined
    : kitchenMinutes(tail.seg, tail.exception, now);
  const kitchen = minutes === undefined ? undefined : clock(minutes);
  if (!open) {
    // Nur Küche: Originaltext behalten, aber nicht als Öffnungsspanne lesbar.
    const literal = text.trim().replace(/(\d)\s*[–-]\s*(?=\d)/g, "$1 bis ");
    return {
      open: literal,
      ...(kitchen ? { kitchen } : {}),
      kitchenOnly: true,
    };
  }
  return kitchen ? { open, kitchen } : { open };
}

/** Zeiten ohne Küchen-Teil (für Spannen, Ziffer und Heute-Zeile). */
const openHours = (hours: NonNullable<Hours>): NonNullable<Hours> =>
  hours.map(h => ({ ...h, hours: kitchenOf(h.hours).open }));

/* ── Heute ────────────────────────────────────────────────────────────── */

export type TodayLine = { open: string; kitchen?: string };

const IS_SPAN = /^\d{1,2}:\d{2} bis \d{1,2}:\d{2}$/;

/**
 * Heute-Zeile unter dem Einstieg („Heute 17:30 bis 23:00 · Küche bis
 * 21:30") — nur echte Zeiten (kein Platzhalter), nur am Wochentag (kein
 * „jetzt geöffnet" nach Uhrzeit, Seiten liegen im Cache). Halbe Tage als
 * zwei Spannen, geschlossen als „Ruhetag"/„geschlossen", Unlesbares
 * wörtlich. Küche nur, wenn der Text sie nennt und der Tag offen ist.
 */
export function todayLine(
  hours: Hours | undefined,
  now: Date
): TodayLine | undefined {
  const real = realHours(hours);
  if (!real) return undefined;
  if (isRoundTheClock(real)) return { open: "Heute rund um die Uhr geöffnet" };
  const today = todayHours(openHours(real), now);
  if (!today) return undefined;
  const lines = today.lines.filter(l => l.trim() !== "");
  if (lines.length === 0 && !today.closed) return undefined;
  const entry = real.find(h => coversToday(h.day, now))!;
  if (today.closed)
    return {
      open: /ruhetag/i.test(entry.hours)
        ? "Heute Ruhetag"
        : "Heute geschlossen",
    };
  if (lines.length === 1 && lines[0] === "0:00 bis 24:00")
    return { open: "Heute rund um die Uhr geöffnet" };
  const spans = lines.every(l => IS_SPAN.test(l));
  const open = spans
    ? `Heute ${lines.join(", ")}`
    : `Heute: ${lines.join(", ")}`;
  const split = kitchenOf(entry.hours, now);
  // Nur Küche im Text: der Text steht schon in der Zeile, nicht doppeln.
  return split.kitchen && !split.kitchenOnly
    ? { open, kitchen: `Küche bis ${split.kitchen}` }
    : { open };
}

/* ── Ziffer ───────────────────────────────────────────────────────────── */

export type Figure = {
  /** Große Kupferziffer („21", „4,8"). */
  value: string;
  /** Hochgestellte Minuten („30" bei 21:30). */
  minutes?: string;
  /** Zeile darunter („Uhr · Di bis Fr so lange geöffnet"). */
  label: string;
  /** Ganzer Satz für Vorleser. */
  sr: string;
  source: "hours" | "rating";
};

const SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;
const LONG = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;
/** Die sieben Wochentage (Berlin, Mittag), ab Montag. */
const WEEK = SHORT.map((_, i) => new Date(Date.UTC(2026, 9, 12 + i, 10)));
/** Ziffer aus Zeiten erst ab dieser Schließzeit (Abend, wie Klar). */
const EVENING = 19 * 60;
/** Google-Note erst ab so vielen Bewertungen. */
export const MIN_REVIEWS = 20;
const LAST_SLOT = /letzte[rn]?\s+termin\D{0,8}?(\d{1,2})(?:[:.](\d{2}))?/i;

/** Tage kurz: „Di bis Fr", „Fr und Sa", „Mo, Mi und Fr", „täglich". */
function daysText(days: number[], names: readonly string[]): string {
  if (days.length === 7) return "täglich";
  const consecutive = days.every((d, k) => k === 0 || d === days[k - 1] + 1);
  if (days.length > 2 && consecutive)
    return `${names[days[0]]} bis ${names[days[days.length - 1]]}`;
  const list = days.map(d => names[d]);
  return list.length === 1
    ? list[0]
    : `${list.slice(0, -1).join(", ")} und ${list[list.length - 1]}`;
}

/** Späteste Zeit je Wochentag (Minuten, -1 = keine). */
function latestPerDay(
  hours: NonNullable<Hours>,
  read: (text: string) => number | undefined
): number[] {
  return WEEK.map(d => {
    const entry = hours.find(h => coversToday(h.day, d));
    return entry ? (read(entry.hours) ?? -1) : -1;
  });
}

function hoursFigure(real: NonNullable<Hours>): Figure | undefined {
  if (isRoundTheClock(real)) return undefined;
  // „letzter Termin 20:30" im Text: genau diese Worte trägt die Ziffer.
  const slots = latestPerDay(real, text => {
    const m = text.match(LAST_SLOT);
    if (!m || Number(m[1]) > 24 || Number(m[2] ?? 0) > 59) return undefined;
    return Number(m[1]) * 60 + Number(m[2] ?? 0);
  });
  const fromSlots = Math.max(...slots) >= 0;
  const close = fromSlots
    ? slots
    : latestPerDay(openHours(real), text => {
        // 0:00 – 24:00 (ganzer Tag) nennt keine Schließzeit.
        const all = readSpans(text);
        // Ein Tag bis 24:00 oder über Mitternacht fällt aus der Ziffer; das
        // Label nennt nur die Tage, für die sie gilt.
        if (all.some(s => s.to <= s.from || (s.to >= 24 * 60 && s.from > 0)))
          return undefined;
        const ends = all.filter(s => s.to < 24 * 60).map(s => s.to);
        return ends.length ? Math.max(...ends) : undefined;
      });
  const latest = Math.max(...close);
  if (latest < EVENING) return undefined;
  const days = close.flatMap((c, i) => (c === latest ? [i] : []));
  const h = Math.floor(latest / 60);
  const min = latest % 60;
  const at = clock(latest);
  const short = daysText(days, SHORT);
  const long = daysText(days, LONG);
  return {
    value: String(h),
    ...(min ? { minutes: String(min).padStart(2, "0") } : {}),
    label: fromSlots
      ? `Uhr · letzter Termin ${short}`
      : `Uhr · ${short} so lange geöffnet`,
    sr: fromSlots
      ? `Letzter Termin ${long === "täglich" ? "täglich" : long} um ${at} Uhr`
      : `${long === "täglich" ? "Täglich" : long} bis ${at} Uhr geöffnet`,
    source: "hours",
  };
}

/**
 * Große Kupferziffer — nur aus echten Werten (Betreiber 2026-10-12,
 * Variante A: keine neuen Datenfelder, also keine Zimmerzahl und kein
 * Gründungsjahr):
 *  1. „letzter Termin HH:MM" im Zeiten-Text → „20 / Uhr · letzter Termin …"
 *  2. späteste Schließzeit ab 19 Uhr → „21 / Uhr · Di bis Fr so lange
 *     geöffnet" (Platzhalter, rund um die Uhr, über Mitternacht: nein)
 *  3. Google-Note mit mindestens 20 Bewertungen → „4,8 / von 5 · …"
 *  sonst keine Ziffer.
 */
export function entryFigure(doc: WebsiteDataV2): Figure | undefined {
  const contact = contactOf(visibleDoc(doc).sections);
  const real = realHours(contact?.openingHours);
  const fromHours = real ? hoursFigure(real) : undefined;
  if (fromHours) return fromHours;
  const g = doc.google;
  if (!g || !(g.rating > 0) || g.rating > 5 || !(g.reviewCount >= MIN_REVIEWS))
    return undefined;
  const count = g.reviewCount.toLocaleString("de-DE");
  const value = formatHeroRating(g.rating);
  return {
    value,
    label: `von 5 · ${count} Google-Bewertungen`,
    sr: `${value} von 5 Sternen bei ${count} Google-Bewertungen`,
    source: "rating",
  };
}

/**
 * Ruhige Bewertungszeile im Einstieg („★ 4,9 · 82 Google-Bewertungen") —
 * nur mit echter Google-Note ab {@link MIN_REVIEWS} Bewertungen und nur,
 * wenn die Note nicht schon die Kupferziffer ist (Abnahme 2026-10-12: der
 * Foto-Einstieg zeigt keine Ziffer, die Note fehlte ganz).
 */
export type EntryRating = { value: string; text: string; sr: string };

export function entryRating(
  doc: WebsiteDataV2,
  figure: Figure | undefined
): EntryRating | undefined {
  if (figure?.source === "rating") return undefined;
  const g = doc.google;
  if (!g || !(g.rating > 0) || g.rating > 5 || !(g.reviewCount >= MIN_REVIEWS))
    return undefined;
  const count = g.reviewCount.toLocaleString("de-DE");
  const value = formatHeroRating(g.rating);
  return {
    value,
    text: `${count} Google-Bewertungen`,
    sr: `${value} von 5 Sternen bei ${count} Google-Bewertungen`,
  };
}

/* ── Einstieg ─────────────────────────────────────────────────────────── */

/**
 * Drei Einstiege laut Systemblatt 8 (Entscheidungstabelle). Ein
 * brauchbares Foto des Betriebs fällt nie weg.
 *
 * | Foto (heroPhoto) | Querformat („stage") | Fassung |
 * |------------------|----------------------|---------|
 * | ja               | ja                   | photo   |
 * | ja               | nein                 | framed  |
 * | nein             | –                    | plain   |
 *
 * photo: Foto gedunkelt über die ganze Breite, Name im Verlauf zur
 * Grundfarbe (Kontrast garantiert, contrast.test.ts). framed: kleines
 * Hochformat neben der Ziffer (ohne Ziffer etwas größer, allein).
 * plain: Name und Ziffer (ohne Ziffer nur der Name).
 */
export type EntryVariant = "photo" | "framed" | "plain";

export function entryVariant(
  data: WebsiteDataV2,
  hero: SectionOf<"hero"> | undefined
): EntryVariant {
  if (!heroPhoto(data, hero)) return "plain";
  return data.designProfile?.composition === "stage" ? "photo" : "framed";
}

/**
 * Name als Kicker + Wortmarke: Steckt die Branche im Namen („Restaurant
 * Weinberg"), steht sie klein darüber und die Marke groß — beides im h1,
 * damit das h1 den ganzen Anzeigenamen trägt. Sonst: Branche als Kicker
 * (außerhalb des h1), Name groß.
 */
export function entryName(
  data: WebsiteDataV2,
  blueprint: Blueprint
): { name: string; mark: string; kicker?: string; kickerInName: boolean } {
  const name = nameOf(data);
  const branch = branchOf(data, blueprint);
  const { mark, sub } = brandParts(name, branch);
  if (sub && mark !== name)
    return { name, mark, kicker: sub, kickerInName: true };
  return {
    name,
    mark: name,
    ...(branch &&
    !name.toLocaleLowerCase("de").includes(branch.toLocaleLowerCase("de"))
      ? { kicker: branch }
      : {}),
    kickerInName: false,
  };
}

const LEDE_MAX = 200;
const SENTENCE = /[.!?](\s+|$)/g;

/** Satz unter dem Namen: Unterzeile, sonst Überschrift — nie ein Echo des Namens. */
export function entryLede(
  hero: SectionOf<"hero">,
  data: WebsiteDataV2,
  blueprint: Blueprint
): string | undefined {
  const name = nameOf(data);
  const branch = branchOf(data, blueprint) ?? "";
  const echo = (t: string) =>
    echoesKicker(t, name) || (branch !== "" && echoesKicker(t, branch));
  const text = [plain(hero.subheadline), plain(hero.headline)].find(
    t => t.length > 0 && !echo(t)
  );
  if (!text) return undefined;
  if (text.length <= LEDE_MAX) return text;
  let cut = "";
  for (const m of text.matchAll(SENTENCE)) {
    const next = text.slice(0, m.index! + 1);
    if (next.length > LEDE_MAX) break;
    cut = next;
  }
  return cut || undefined;
}

/** Monogramm im Ring: erster Buchstabe der Marke („Haus am See" → H). */
export function monogramOf(mark: string): string {
  const letter = Array.from(mark.trim()).find(c => /\p{L}|\p{N}/u.test(c));
  return (letter ?? "·").toLocaleUpperCase("de");
}

/* ── Wege ─────────────────────────────────────────────────────────────── */

/** Wege wie Klar (shared/actions.ts): Buchungslink → Formular → Bauplan → Anruf. */
export const nachtActions = systemActions;
export type { Action };

/**
 * Kurzform für Kopf und Handy-Leiste: „Tisch reservieren" → „Reservieren",
 * „Termin anfragen" → „Termin", „Zimmer anfragen" → „Anfragen".
 */
const VERB = /^(\S+)\s+(reservieren|anfragen|buchen|vereinbaren|planen)$/i;
export function nachtShort(label: string): string {
  const t = label.trim();
  const m = t.match(VERB);
  if (!m) return t;
  if (/^termin$/i.test(m[1])) return "Termin";
  if (/vereinbaren|planen/i.test(m[2])) return m[1];
  return m[2].charAt(0).toLocaleUpperCase("de") + m[2].slice(1).toLowerCase();
}

/**
 * Handy-Leiste (Systemblatt 9): links „Anrufen", rechts der Hauptweg. Ruft
 * schon der Hauptweg an, steht links der zweite Weg (Route/E-Mail).
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
    main: { ...primary, label: nachtShort(primary.label) },
  };
}

/* ── Zeiten-Tabelle mit Küche ─────────────────────────────────────────── */

export type HoursTableRow = HoursRow & { kitchen?: string };

/** Montag 12.10.2026 (Berlin, Mittag) + i Tage — wie shared/hours. */
const weekday = (i: number) => new Date(Date.UTC(2026, 9, 12 + i, 10));

/**
 * Zeiten Tag für Tag (shared/hoursRows, ohne Küchenteil) und je Zeile die
 * Küchenzeit — nur, wenn der Text des Tages sie nennt (kitchenOf, mit dem
 * Wochentag der Zeile, damit Ausnahmen wie „(Fr/Sa 22:30)" nur dort
 * gelten). Zeilen, die nach dem Abzug leer sind, entfallen.
 */
export function hoursTable(
  hours: Hours | undefined,
  now: Date
): HoursTableRow[] {
  const real = realHours(hours);
  if (!real) return [];
  const rows = hoursRows(
    real.map(h => ({ ...h, hours: kitchenOf(h.hours).open })),
    now
  );
  const literal = real.some(h => !SHORT.some((_, i) => coversToday(h.day, weekday(i))));
  return rows
    .map((row, k): HoursTableRow => {
      if (row.closed) return row;
      const day = literal ? undefined : SHORT.indexOf(row.label as (typeof SHORT)[number]);
      const date = day !== undefined && day >= 0 ? weekday(day) : undefined;
      const entry = literal
        ? real[k]
        : date && real.find(h => coversToday(h.day, date));
      const kitchen = entry && kitchenOf(entry.hours, date).kitchen;
      return kitchen ? { ...row, kitchen } : row;
    })
    .filter(r => r.lines.some(l => l.trim() !== ""));
}

/** „https://tisch.weinberg.example/x" → „tisch.weinberg.example" (ohne www). */
export function hostOf(href: string): string | undefined {
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.hostname.replace(/^www\./, "") || undefined;
  } catch {
    return undefined;
  }
}

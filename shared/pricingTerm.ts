/**
 * Laufzeit- und Kündigungslogik des Jahrestarifs (Betreiber-Entscheidung
 * 2026-10-13) — reine Funktionen ohne Stripe/DB, damit Server (Webhook,
 * Kündigungs-Endpunkt) und Client (Konto-Anzeige) dieselben Daten rechnen.
 *
 * Regeln:
 * - Die Laufzeit beginnt mit der ersten Zahlung nach den Testtagen
 *   (`termStartedAt`, Unix-Sekunden) und dauert 12 Monate.
 * - Sie verlängert sich automatisch um 12 Monate, wenn nicht spätestens
 *   1 Monat vor Laufzeitende gekündigt wird.
 * - Eine frühere Kündigung beendet das Abo zum AKTUELLEN Laufzeitende (nicht
 *   sofort); eine Kündigung im letzten Monat zum NÄCHSTEN Laufzeitende.
 * - In den Testtagen endet das Abo ohne Zahlung zum Testende.
 * - Monatstarif: Ende des laufenden Abrechnungsmonats.
 *
 * Monatsrechnung wie Stripe: vom Anker aus, Tag-des-Monats und Uhrzeit (UTC)
 * bleiben erhalten, in kürzeren Monaten auf den Monatsletzten gekappt — und
 * IMMER vom ursprünglichen Anker aus, nie schrittweise (sonst „wandert" ein
 * 31. nach einem Februar dauerhaft auf den 28.). Fristen vergleichen wir
 * kalendertäglich in Europe/Berlin: „Kündigung bis 20.09.2027" gilt den
 * ganzen 20.09. (deutscher Zeit).
 */
import { PLANS, type Tariff } from "./pricing";

const SECONDS = 1000;

/** Addiert Monate auf einen Unix-Sekunden-Zeitpunkt (UTC, Monatsende gekappt). */
export function addMonthsUtc(sec: number, months: number): number {
  const d = new Date(sec * SECONDS);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + months;
  const day = d.getUTCDate();
  const targetYear = year + Math.floor(month / 12);
  const targetMonth = ((month % 12) + 12) % 12;
  const lastDay = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0)
  ).getUTCDate();
  const result = Date.UTC(
    targetYear,
    targetMonth,
    Math.min(day, lastDay),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds()
  );
  return Math.floor(result / SECONDS);
}

/** Kalendertag in Europe/Berlin als „YYYY-MM-DD" (sortierbar). */
export function berlinDateKey(sec: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(sec * SECONDS));
  return parts; // en-CA liefert bereits YYYY-MM-DD
}

/** „TT.MM.JJJJ" in deutscher Zeit. */
export function formatDateDe(sec: number): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(sec * SECONDS));
}

function monthIndexUtc(sec: number): number {
  const d = new Date(sec * SECONDS);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

/**
 * k-tes Laufzeitende ab `termStartedAt`. Mit `billingAnchor` (Stripe
 * `billing_cycle_anchor`) wird vom Abrechnungsanker aus gezählt — nur so
 * fällt das Ende auch dann auf eine Stripe-Periodengrenze, wenn der
 * Laufzeitbeginn selbst ein gekappter Tag ist (Anker 31.01., Beginn nach
 * Tarifwechsel am 28.02.2027 → Ende 29.02.2028, nicht 28.02.2028).
 */
export function termBoundary(
  termStartedAt: number,
  k: number,
  termMonths: number = PLANS.yearly.termMonths,
  billingAnchor?: number | null
): number {
  if (billingAnchor == null || billingAnchor > termStartedAt) {
    return addMonthsUtc(termStartedAt, termMonths * k);
  }
  const offset = monthIndexUtc(termStartedAt) - monthIndexUtc(billingAnchor);
  return addMonthsUtc(billingAnchor, offset + termMonths * k);
}

/**
 * Ende der Laufzeit-Periode, in der `atSec` liegt: das kleinste
 * k-te Laufzeitende (k ≥ 1), das NACH `atSec` liegt.
 */
export function termEndAt(
  termStartedAt: number,
  atSec: number,
  termMonths: number = PLANS.yearly.termMonths,
  billingAnchor?: number | null
): number {
  let k = 1;
  let end = termBoundary(termStartedAt, k, termMonths, billingAnchor);
  while (end <= atSec) {
    k += 1;
    end = termBoundary(termStartedAt, k, termMonths, billingAnchor);
  }
  return end;
}

/** Das auf `termEnd` folgende Laufzeitende. */
export function nextTermEndAfter(
  termStartedAt: number,
  termEnd: number,
  termMonths: number = PLANS.yearly.termMonths,
  billingAnchor?: number | null
): number {
  return termEndAt(termStartedAt, termEnd, termMonths, billingAnchor);
}

/** Letzter Tag, an dem eine Kündigung noch zum Laufzeitende `termEnd` wirkt. */
export function cancelDeadline(
  termEnd: number,
  noticeMonths: number = PLANS.yearly.noticeMonths
): number {
  return addMonthsUtc(termEnd, -noticeMonths);
}

/** true, wenn eine Kündigung am Tag von `atSec` (Berliner Kalendertag) noch rechtzeitig ist. */
export function isWithinNotice(atSec: number, deadlineSec: number): boolean {
  return berlinDateKey(atSec) <= berlinDateKey(deadlineSec);
}

export interface TermState {
  /** Laufzeitende der aktuellen 12 Monate. */
  termEnd: number;
  /** Letzter Kündigungstag für dieses Laufzeitende. */
  deadline: number;
  /** Ende der folgenden 12 Monate (nach Verlängerung). */
  nextTermEnd: number;
}

/** Laufzeitstand zum Zeitpunkt `atSec` (Jahrestarif mit begonnener Laufzeit). */
export function termStateAt(
  termStartedAt: number,
  atSec: number,
  billingAnchor?: number | null
): TermState {
  const months = PLANS.yearly.termMonths;
  const termEnd = termEndAt(termStartedAt, atSec, months, billingAnchor);
  return {
    termEnd,
    deadline: cancelDeadline(termEnd),
    nextTermEnd: nextTermEndAfter(termStartedAt, termEnd, months, billingAnchor),
  };
}

export type CancellationReason =
  | "trial"
  | "monthly"
  | "term_end"
  | "next_term_end";

export interface CancellationInput {
  tariff: Tariff;
  /** Zeitpunkt der Kündigung (Unix-Sekunden). */
  requestedAt: number;
  /** Abo steckt noch in den Testtagen (Stripe-Status `trialing`). */
  inTrial: boolean;
  /** Ende des laufenden Abrechnungsmonats bzw. der Testtage (Stripe `current_period_end`). */
  currentPeriodEnd: number | null;
  /** Beginn der 12-Monats-Laufzeit (erste Zahlung), null = noch nicht begonnen. */
  termStartedAt: number | null;
  /** Stripe `billing_cycle_anchor` — Laufzeitenden zählen von hier (siehe termBoundary). */
  billingAnchor?: number | null;
}

export interface CancellationResult {
  /**
   * `period_end`: Stripe `cancel_at_period_end` (Testende/Monatsende);
   * `cancel_at`: fester Zeitpunkt (Laufzeitende).
   */
  mode: "period_end" | "cancel_at";
  /** Zeitpunkt, zu dem das Abo endet (Unix-Sekunden). */
  endsAt: number;
  reason: CancellationReason;
}

export class TermUnknownError extends Error {
  constructor() {
    super(
      "Laufzeitbeginn unbekannt — Kündigungsdatum lässt sich nicht berechnen."
    );
    this.name = "TermUnknownError";
  }
}

/**
 * Rechnet aus, wann eine Kündigung zum Zeitpunkt `requestedAt` wirkt.
 * Jahrestarif ohne Laufzeitbeginn außerhalb der Testtage (Daten fehlen)
 * wirft `TermUnknownError` — der Aufrufer muss den Beginn erst ermitteln
 * (Stripe-Metadaten), statt still falsch zu kündigen.
 */
export function computeCancellation(
  input: CancellationInput
): CancellationResult {
  if (input.inTrial || input.tariff === "monthly") {
    if (!input.currentPeriodEnd) throw new TermUnknownError();
    return {
      mode: "period_end",
      endsAt: input.currentPeriodEnd,
      reason: input.inTrial ? "trial" : "monthly",
    };
  }
  if (input.termStartedAt == null) throw new TermUnknownError();
  const state = termStateAt(
    input.termStartedAt,
    input.requestedAt,
    input.billingAnchor
  );
  if (isWithinNotice(input.requestedAt, state.deadline)) {
    return { mode: "cancel_at", endsAt: state.termEnd, reason: "term_end" };
  }
  return {
    mode: "cancel_at",
    endsAt: state.nextTermEnd,
    reason: "next_term_end",
  };
}

/** Felder einer Abo-Zeile, die für die Auswahl des aktuellen Abos zählen. */
export interface SubscriptionPick {
  id: number;
  status: string;
  createdAt: number;
}

/**
 * Das maßgebliche Abo einer Website, wenn es mehrere Zeilen gibt (z. B.
 * abgelaufenes Abo + neuer Checkout): das jüngste nicht beendete, sonst das
 * jüngste überhaupt. Deterministisch: bei gleichem createdAt die höhere id.
 */
export function pickCurrentSubscription<T extends SubscriptionPick>(
  rows: readonly T[]
): T | undefined {
  const newestFirst = [...rows].sort(
    (a, b) => b.createdAt - a.createdAt || b.id - a.id
  );
  return newestFirst.find(r => r.status !== "canceled") ?? newestFirst[0];
}

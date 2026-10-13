import { describe, expect, test } from "vitest";
import {
  addMonthsUtc,
  berlinDateKey,
  cancelDeadline,
  computeCancellation,
  formatDateDe,
  isWithinNotice,
  termEndAt,
  termStateAt,
  TermUnknownError,
} from "./pricingTerm";

const t = (iso: string) => Math.floor(Date.parse(iso) / 1000);
const iso = (sec: number) => new Date(sec * 1000).toISOString();

describe("addMonthsUtc (Stripe-Monatsrechnung, Monatsende gekappt)", () => {
  test.each([
    ["2027-01-31T10:00:00Z", 1, "2027-02-28T10:00:00.000Z"],
    ["2028-01-31T10:00:00Z", 1, "2028-02-29T10:00:00.000Z"],
    ["2027-01-31T10:00:00Z", 12, "2028-01-31T10:00:00.000Z"],
    ["2028-02-29T09:00:00Z", 12, "2029-02-28T09:00:00.000Z"],
    ["2028-02-29T09:00:00Z", 48, "2032-02-29T09:00:00.000Z"],
    ["2027-03-31T00:00:00Z", -1, "2027-02-28T00:00:00.000Z"],
    ["2028-03-31T00:00:00Z", -1, "2028-02-29T00:00:00.000Z"],
    ["2027-12-31T23:59:59Z", 2, "2028-02-29T23:59:59.000Z"],
    ["2027-01-15T12:00:00Z", -13, "2025-12-15T12:00:00.000Z"],
  ])("%s %+d Monate → %s", (start, months, expected) => {
    expect(iso(addMonthsUtc(t(start), months))).toBe(expected);
  });
});

describe("termEndAt / termStateAt", () => {
  const anchor = t("2027-01-31T12:00:00Z");
  test.each([
    ["2027-01-31T12:00:00Z", "2028-01-31T12:00:00.000Z"],
    ["2027-06-01T00:00:00Z", "2028-01-31T12:00:00.000Z"],
    ["2028-01-31T11:59:59Z", "2028-01-31T12:00:00.000Z"],
    ["2028-01-31T12:00:00Z", "2029-01-31T12:00:00.000Z"],
    ["2031-05-05T00:00:00Z", "2032-01-31T12:00:00.000Z"],
  ])("Anker 31.01.2027, Zeitpunkt %s → Laufzeitende %s", (at, end) => {
    expect(iso(termEndAt(anchor, t(at)))).toBe(end);
  });

  test("Schaltjahr-Anker 29.02.2028: Verlängerungen rechnen vom Anker, nicht schrittweise", () => {
    const leap = t("2028-02-29T09:00:00Z");
    expect(iso(termEndAt(leap, t("2028-03-01T00:00:00Z")))).toBe(
      "2029-02-28T09:00:00.000Z"
    );
    expect(iso(termEndAt(leap, t("2031-03-01T00:00:00Z")))).toBe(
      "2032-02-29T09:00:00.000Z"
    );
  });

  test("termStateAt liefert Ende, Frist und Folgeende", () => {
    const state = termStateAt(
      t("2027-03-31T08:00:00Z"),
      t("2027-04-10T00:00:00Z")
    );
    expect(iso(state.termEnd)).toBe("2028-03-31T08:00:00.000Z");
    expect(iso(state.deadline)).toBe("2028-02-29T08:00:00.000Z");
    expect(iso(state.nextTermEnd)).toBe("2029-03-31T08:00:00.000Z");
  });

  test("cancelDeadline: 1 Monat vor Laufzeitende, Monatsende gekappt", () => {
    expect(iso(cancelDeadline(t("2028-01-31T12:00:00Z")))).toBe(
      "2027-12-31T12:00:00.000Z"
    );
    expect(iso(cancelDeadline(t("2029-03-31T12:00:00Z")))).toBe(
      "2029-02-28T12:00:00.000Z"
    );
  });
});

describe("Berliner Kalendertag", () => {
  test("berlinDateKey und formatDateDe nutzen Europe/Berlin", () => {
    // 23:30 UTC im Winter = 00:30 am Folgetag in Berlin
    expect(berlinDateKey(t("2027-12-31T23:30:00Z"))).toBe("2028-01-01");
    expect(formatDateDe(t("2027-12-31T23:30:00Z"))).toBe("01.01.2028");
    // Sommerzeit: 22:30 UTC = 00:30 Berlin
    expect(berlinDateKey(t("2027-06-30T22:30:00Z"))).toBe("2027-07-01");
  });
  test("isWithinNotice: der ganze Fristtag zählt", () => {
    const deadline = t("2027-12-31T12:00:00Z");
    expect(isWithinNotice(t("2027-12-31T22:59:59Z"), deadline)).toBe(true);
    expect(isWithinNotice(t("2027-12-31T23:00:00Z"), deadline)).toBe(false);
  });
});

describe("computeCancellation", () => {
  const anchor = t("2027-01-31T12:00:00Z"); // erste Zahlung nach dem Test
  const base = {
    tariff: "yearly" as const,
    inTrial: false,
    currentPeriodEnd: t("2027-06-30T12:00:00Z"),
    termStartedAt: anchor,
  };

  test.each([
    // Kündigung lange vor der Frist → aktuelles Laufzeitende
    ["2027-05-10T09:00:00Z", "term_end", "2028-01-31T12:00:00.000Z"],
    // Kündigung am ersten Tag der Laufzeit → trotzdem erst zum Laufzeitende
    ["2027-01-31T12:00:01Z", "term_end", "2028-01-31T12:00:00.000Z"],
    // Fristtag 31.12.2027, spätabends deutscher Zeit → noch rechtzeitig
    ["2027-12-31T22:30:00Z", "term_end", "2028-01-31T12:00:00.000Z"],
    // eine Stunde später ist in Berlin der 01.01. → nächstes Laufzeitende
    ["2027-12-31T23:30:00Z", "next_term_end", "2029-01-31T12:00:00.000Z"],
    // im letzten Monat → nächstes Laufzeitende
    ["2028-01-15T10:00:00Z", "next_term_end", "2029-01-31T12:00:00.000Z"],
    // nach einer Verlängerung: Frist bezieht sich auf das neue Ende
    ["2028-06-01T10:00:00Z", "term_end", "2029-01-31T12:00:00.000Z"],
  ])("Kündigung am %s → %s %s", (at, reason, endsAt) => {
    const result = computeCancellation({ ...base, requestedAt: t(at) });
    expect(result.mode).toBe("cancel_at");
    expect(result.reason).toBe(reason);
    expect(iso(result.endsAt)).toBe(endsAt);
  });

  test("Laufzeitstart 31.03. im Schaltjahr: Frist 29.02.", () => {
    const start = t("2027-03-31T08:00:00Z");
    const onTime = computeCancellation({
      ...base,
      termStartedAt: start,
      requestedAt: t("2028-02-29T20:00:00Z"),
    });
    expect(iso(onTime.endsAt)).toBe("2028-03-31T08:00:00.000Z");
    const late = computeCancellation({
      ...base,
      termStartedAt: start,
      requestedAt: t("2028-03-01T08:00:00Z"),
    });
    expect(late.reason).toBe("next_term_end");
    expect(iso(late.endsAt)).toBe("2029-03-31T08:00:00.000Z");
  });

  test("In den Testtagen: Ende zum Testende, kostenlos", () => {
    const trialEnd = t("2027-01-31T12:00:00Z");
    const result = computeCancellation({
      ...base,
      inTrial: true,
      termStartedAt: null,
      currentPeriodEnd: trialEnd,
      requestedAt: t("2027-01-27T08:00:00Z"),
    });
    expect(result).toEqual({
      mode: "period_end",
      endsAt: trialEnd,
      reason: "trial",
    });
  });

  test("Monatstarif: Ende des Abrechnungsmonats", () => {
    const result = computeCancellation({
      ...base,
      tariff: "monthly",
      termStartedAt: null,
      requestedAt: t("2027-06-10T08:00:00Z"),
    });
    expect(result).toEqual({
      mode: "period_end",
      endsAt: base.currentPeriodEnd,
      reason: "monthly",
    });
  });

  test("Jahrestarif ohne Laufzeitbeginn außerhalb des Tests → TermUnknownError", () => {
    expect(() =>
      computeCancellation({
        ...base,
        termStartedAt: null,
        requestedAt: t("2027-06-10T08:00:00Z"),
      })
    ).toThrow(TermUnknownError);
  });
});

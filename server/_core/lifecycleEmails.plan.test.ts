import { describe, expect, test } from "vitest";
import {
  FINAL_WARNING_LEAD_MS,
  INITIAL_RESERVATION_HOURS,
  MAX_EXTENSIONS,
  initialLifecyclePlan,
  renderLifecycleEmail,
} from "./lifecycleEmails";

describe("initialLifecyclePlan", () => {
  test("7 Tage Reservierung, Erinnerung Tag 4 und 24h vorher, keine +2h-Mail", () => {
    const now = Date.parse("2026-08-28T12:00:00.000Z");
    const plan = initialLifecyclePlan(now);
    expect(INITIAL_RESERVATION_HOURS).toBe(7 * 24);
    expect(MAX_EXTENSIONS).toBe(0);
    expect(plan.reservedUntil.toISOString()).toBe("2026-09-04T12:00:00.000Z");
    expect(plan.emails.map(e => e.type)).toEqual([
      "reminder_24h",
      "reminder_final",
    ]);
    expect(plan.emails[0]?.scheduledFor.toISOString()).toBe(
      "2026-09-01T12:00:00.000Z"
    );
    expect(FINAL_WARNING_LEAD_MS).toBe(24 * 60 * 60 * 1000);
    expect(plan.emails[1]?.scheduledFor.toISOString()).toBe(
      "2026-09-03T12:00:00.000Z"
    );
  });
});

describe("renderLifecycleEmail (7-Tage-Texte)", () => {
  const data = {
    firstName: "Anna",
    businessName: "Café Beispiel",
    resumeLink: "https://pageblitz.de/weiter",
    unsubscribeLink: "https://pageblitz.de/abmelden",
  };

  test("Tag-4-Mail spricht von drei Tagen", () => {
    const { subject, text } = renderLifecycleEmail("reminder_24h", data);
    expect(subject).toContain("Noch drei Tage");
    expect(text).toContain("drei Tage");
  });

  test("Final-Mail sagt morgen, nicht wenige Stunden", () => {
    const { subject, text } = renderLifecycleEmail("reminder_final", data);
    expect(subject).toBe("Morgen wird deine Vorschau gelöscht");
    expect(text).toContain("läuft morgen ab");
    expect(text).not.toContain("wenige Stunden");
  });
});

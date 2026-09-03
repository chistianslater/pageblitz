import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../siteContract/types";
import {
  GOAL_KEYS,
  GOALS,
  applyGoal,
  goalCtaHref,
  isGoalDefaultCta,
} from "./goal";

const base: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H", ctaText: "Projekt anfragen" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
    { type: "contact", phone: "0231 555 4471" },
  ],
};

describe("Ziel der Website (2026-09-03)", () => {
  test("vier Ziele mit Label, Erklärung, Button-Text und Extra-Empfehlung", () => {
    expect(GOAL_KEYS).toEqual(["anrufe", "anfragen", "termine", "verkauf"]);
    expect(GOALS.anrufe.addOn).toBeNull();
    expect(GOALS.anfragen.addOn).toBe("contactForm");
    expect(GOALS.termine.addOn).toBe("booking");
    expect(GOALS.verkauf.addOn).toBe("pricelist");
    for (const key of GOAL_KEYS) {
      expect(GOALS[key].label.length).toBeGreaterThan(2);
      expect(GOALS[key].hint.length).toBeGreaterThan(10);
      expect(GOALS[key].ctaText.length).toBeGreaterThan(4);
    }
  });

  test("Button-Ziel: tel: bei Anrufen mit Telefonnummer, sonst Kontakt; Verkauf zeigt aufs Angebot", () => {
    expect(goalCtaHref("anrufe", base)).toBe("tel:+492315554471");
    expect(
      goalCtaHref("anrufe", {
        ...base,
        sections: [{ type: "hero", headline: "H" }],
      })
    ).toBe("#kontakt");
    expect(goalCtaHref("anfragen", base)).toBe("#kontakt");
    expect(goalCtaHref("termine", base)).toBe("#kontakt");
    expect(goalCtaHref("verkauf", base)).toBe("#leistungen");
  });

  test("isGoalDefaultCta erkennt Standard-Texte und leere Felder, nicht eigene", () => {
    expect(isGoalDefaultCta(undefined)).toBe(true);
    expect(isGoalDefaultCta("")).toBe(true);
    expect(isGoalDefaultCta("Termin vereinbaren")).toBe(true);
    expect(isGoalDefaultCta("Projekt anfragen")).toBe(false);
  });

  test("applyGoal setzt goal, Button-Ziel und ersetzt nur Standard-Button-Texte", () => {
    const kept = applyGoal(base, "termine");
    expect(kept.goal).toBe("termine");
    expect(kept.sections[0]).toMatchObject({
      ctaText: "Projekt anfragen",
      ctaHref: "#kontakt",
    });
    const withDefault: WebsiteDataV2 = {
      ...base,
      sections: [{ type: "hero", headline: "H" }, ...base.sections.slice(1)],
    };
    const set = applyGoal(withDefault, "anrufe");
    expect(set.sections[0]).toMatchObject({
      ctaText: "Jetzt anrufen",
      ctaHref: "tel:+492315554471",
    });
    // Ziel wechseln: der vorherige Standard-Text darf ersetzt werden.
    const switched = applyGoal(set, "verkauf");
    expect(switched.sections[0]).toMatchObject({
      ctaText: "Angebot ansehen",
      ctaHref: "#leistungen",
    });
    expect(base.sections[0]).toEqual({
      type: "hero",
      headline: "H",
      ctaText: "Projekt anfragen",
    });
  });
});

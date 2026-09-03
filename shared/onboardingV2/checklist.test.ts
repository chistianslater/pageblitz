import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../siteContract/types";
import {
  CHECKLIST_ORDER,
  deriveChecklistState,
  isCheckoutReady,
  parseStudioProgress,
} from "./checklist";

const base: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "Hallo" },
    {
      type: "services",
      headline: "Leistungen",
      items: [{ title: "Möbelbau" }],
    },
  ],
};
const legalDone = {
  legalOwner: "Max Brandt",
  legalEmail: "m@b.de",
  legalStreet: "Weg 1",
  legalZip: "44135",
  legalCity: "Dortmund",
  legalPhone: "0231 1",
};

describe("parseStudioProgress", () => {
  test("goalAsked (2026-09-03) wird wie die anderen Flags nur bei true übernommen", () => {
    expect(parseStudioProgress({ goalAsked: true })).toEqual({
      goalAsked: true,
    });
    expect(parseStudioProgress({ goalAsked: "ja" })).toEqual({});
  });
});

describe("deriveChecklistState", () => {
  test("Reihenfolge ist fix: style, photos, texts, structure, offer, legal, addons, versions", () => {
    expect(deriveChecklistState(base, {}).map(i => i.id)).toEqual([
      ...CHECKLIST_ORDER,
    ]);
    expect(CHECKLIST_ORDER).toEqual([
      "style",
      "photos",
      "texts",
      "structure",
      "offer",
      "legal",
      "addons",
      "versions",
    ]);
  });
  test("ohne Dokument und ohne Fortschritt ist alles offen (nur die Werkzeuge Struktur/Verlauf zaehlen immer als done)", () => {
    const items = deriveChecklistState(null, {});
    expect(items.filter(i => i.status === "done").map(i => i.id)).toEqual([
      "structure",
      "versions",
    ]);
  });
  test("addons done erst nach addonsReviewed-Flag", () => {
    expect(
      deriveChecklistState(null, {}).find(i => i.id === "addons")?.status
    ).toBe("open");
    expect(
      deriveChecklistState(null, {
        studioProgress: { addonsReviewed: true },
      }).find(i => i.id === "addons")?.status
    ).toBe("done");
  });
  test("photos done sobald hero.imageUrl gesetzt", () => {
    const withImg = {
      ...base,
      sections: [
        {
          type: "hero" as const,
          headline: "Hallo",
          imageUrl: "https://x/1.jpg",
        },
        base.sections[1],
      ],
    };
    expect(
      deriveChecklistState(withImg, {}).find(i => i.id === "photos")?.status
    ).toBe("done");
    expect(
      deriveChecklistState(base, {}).find(i => i.id === "photos")?.status
    ).toBe("open");
  });
  test("offer done bei ≥1 Leistung ODER ≥1 Speisekarten-/Preislisten-Kategorie", () => {
    expect(
      deriveChecklistState(base, {}).find(i => i.id === "offer")?.status
    ).toBe("done");
    const menuOnly: WebsiteDataV2 = {
      ...base,
      sections: [
        base.sections[0],
        {
          type: "menu",
          categories: [
            { name: "Pizza", items: [{ name: "Margherita", price: "9 €" }] },
          ],
        },
      ],
    };
    expect(
      deriveChecklistState(menuOnly, {}).find(i => i.id === "offer")?.status
    ).toBe("done");
    const none: WebsiteDataV2 = { ...base, sections: [base.sections[0]] };
    expect(
      deriveChecklistState(none, {}).find(i => i.id === "offer")?.status
    ).toBe("open");
  });
  test("legal done nur mit allen Pflichtfeldern; legal ist required", () => {
    const legal = deriveChecklistState(base, legalDone).find(
      i => i.id === "legal"
    );
    expect(legal?.status).toBe("done");
    expect(legal?.required).toBe(true);
    expect(
      deriveChecklistState(base, { ...legalDone, legalZip: "" }).find(
        i => i.id === "legal"
      )?.status
    ).toBe("open");
    expect(
      deriveChecklistState(base, { ...legalDone, legalPhone: "" }).find(
        i => i.id === "legal"
      )?.status
    ).toBe("open");
  });
  test("style/texts done über studioProgress-Flags", () => {
    const items = deriveChecklistState(base, {
      studioProgress: { styleConfirmed: true, textsReviewed: true },
    });
    expect(items.find(i => i.id === "style")?.status).toBe("done");
    expect(items.find(i => i.id === "texts")?.status).toBe("done");
  });
});

describe("isCheckoutReady", () => {
  test("bereit = alle required-Punkte done UND E-Mail vorhanden", () => {
    expect(isCheckoutReady(deriveChecklistState(base, legalDone), true)).toBe(
      true
    );
    expect(isCheckoutReady(deriveChecklistState(base, legalDone), false)).toBe(
      false
    );
    expect(isCheckoutReady(deriveChecklistState(base, {}), true)).toBe(false);
  });
});

describe("parseStudioProgress", () => {
  test("toleriert null/Strings/Fremdfelder", () => {
    expect(parseStudioProgress(null)).toEqual({});
    expect(parseStudioProgress("kaputt")).toEqual({});
    expect(parseStudioProgress({ styleConfirmed: true, foo: 1 })).toEqual({
      styleConfirmed: true,
    });
  });
});

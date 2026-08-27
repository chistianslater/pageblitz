import { describe, expect, test } from "vitest";
import { ADDON_KEYS } from "../pricing";
import type { WebsiteDataV2 } from "../siteContract/types";
import {
  ADDON_EDITORS,
  addonContentDone,
  isAddOnKey,
} from "./addonEditors";

const base: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "Hallo" }],
};

describe("ADDON_EDITORS", () => {
  test("jedes Extra hat ein Panel und einen Vorschau-Anker", () => {
    for (const key of ADDON_KEYS) {
      expect(ADDON_EDITORS[key].panel).toMatch(
        /^(photos|offer|addons)$/
      );
      expect(ADDON_EDITORS[key].previewAnchor.length).toBeGreaterThan(0);
    }
  });

  test("Galerie und Speisekarte/Preisliste öffnen Inhaltspanels, nicht den Kauf-Toggle", () => {
    expect(ADDON_EDITORS.gallery.panel).toBe("photos");
    expect(ADDON_EDITORS.gallery.editorDomId).toBeNull();
    expect(ADDON_EDITORS.menu.panel).toBe("offer");
    expect(ADDON_EDITORS.pricelist.panel).toBe("offer");
    expect(ADDON_EDITORS.team.panel).toBe("addons");
    expect(ADDON_EDITORS.team.editorDomId).toBe("pb-addon-editor-team");
    expect(ADDON_EDITORS.subpages.editorDomId).toBe("pb-addon-editor-subpages");
  });
});

describe("isAddOnKey", () => {
  test("kennt alle acht Keys und lehnt Unbekanntes ab", () => {
    expect(isAddOnKey("gallery")).toBe(true);
    expect(isAddOnKey("booking")).toBe(true);
    expect(isAddOnKey("photos")).toBe(false);
    expect(isAddOnKey("")).toBe(false);
  });
});

describe("addonContentDone", () => {
  test("Galerie erledigt sobald Bilder da sind", () => {
    expect(addonContentDone("gallery", base)).toBe(false);
    expect(
      addonContentDone("gallery", {
        ...base,
        sections: [
          ...base.sections,
          {
            type: "gallery",
            headline: "Impressionen",
            images: [{ url: "https://x/1.jpg", alt: "A" }],
          },
        ],
      })
    ).toBe(true);
  });

  test("Team erledigt bei benanntem Mitglied, Unterseiten bei pages[]", () => {
    expect(addonContentDone("team", base)).toBe(false);
    expect(
      addonContentDone("team", {
        ...base,
        sections: [
          ...base.sections,
          { type: "team", members: [{ name: "Anna" }] },
        ],
      })
    ).toBe(true);
    expect(addonContentDone("subpages", base)).toBe(false);
    expect(
      addonContentDone("subpages", {
        ...base,
        pages: [
          {
            slug: "team",
            title: "Team",
            seo: { title: "Team", description: "" },
            sections: [{ type: "pageHeader", title: "Team" }],
          },
        ],
      })
    ).toBe(true);
  });

  test("KI-Chat nutzt die Begrüßung, Terminbuchung bleibt im Studio offen", () => {
    expect(addonContentDone("aiChat", base)).toBe(false);
    expect(
      addonContentDone("aiChat", base, { chatWelcomeMessage: "Hallo!" })
    ).toBe(true);
    expect(addonContentDone("booking", base)).toBe(false);
    expect(addonContentDone("contactForm", base)).toBe(false);
    expect(
      addonContentDone("contactForm", {
        ...base,
        sections: [...base.sections, { type: "contact", headline: "Kontakt" }],
      })
    ).toBe(true);
  });
});

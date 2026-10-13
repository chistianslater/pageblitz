// @vitest-environment jsdom
import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RasterHead, RASTER_MENU_JS } from "./Chrome";
import { SystemContext } from "../SystemContext";
import { blueprintFor } from "../../../../../../shared/blueprints/blueprints";
import type { NavItem } from "../../engine";
import { rasterDoc } from "./testkit";

const data = rasterDoc();
const items: NavItem[] = [
  {
    key: "a",
    href: "#leistungen",
    label: "Leistungen",
    sectionType: "services",
  },
  { key: "p", href: "/preise", label: "Preise", current: true },
];

function mount() {
  document.body.innerHTML = renderToStaticMarkup(
    <SystemContext.Provider
      value={{
        data,
        blueprint: blueprintFor(data.businessCategory, data.businessName),
        preview: false,
        now: new Date(),
      }}
    >
      <RasterHead navItems={items} anchorPrefix="" />
    </SystemContext.Provider>
  );
  new Function(RASTER_MENU_JS)();
  const menu = document.querySelector<HTMLDetailsElement>(".rs-menu")!;
  const toggle = menu.querySelector("summary")!;
  return { menu, toggle };
}

describe("Raster: Menü", () => {
  test("Toggle ist ein <summary> mit zugänglichem Namen „Menü“", () => {
    const { toggle } = mount();
    expect(toggle.tagName).toBe("SUMMARY");
    expect(toggle.textContent!.trim()).toBe("Menü");
    expect(
      document.querySelector(".rs-menu-panel")!.getAttribute("aria-label")
    ).toBe("Menü");
  });

  test("aktueller Eintrag trägt aria-current (Menü und Navigation)", () => {
    mount();
    for (const sel of [".rs-menu-panel", ".rs-nav"]) {
      const current = document.querySelectorAll(
        `${sel} a[aria-current="page"]`
      );
      expect([...current].map(a => a.textContent)).toEqual(["Preise"]);
    }
  });

  test("schließt nach Klick auf einen Eintrag", () => {
    const { menu } = mount();
    menu.open = true;
    document
      .querySelector<HTMLAnchorElement>('.rs-menu-panel a[href="#leistungen"]')!
      .click();
    expect(menu.open).toBe(false);
  });

  test("Escape schließt und gibt den Fokus an „Menü“ zurück", () => {
    const { menu, toggle } = mount();
    menu.open = true;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  test("Klick daneben schließt", () => {
    const { menu } = mount();
    menu.open = true;
    document.querySelector<HTMLAnchorElement>(".rs-brand")!.click();
    expect(menu.open).toBe(false);
  });
});

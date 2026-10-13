// @vitest-environment jsdom
import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WerkstoffHead, WERKSTOFF_MENU_JS } from "./Chrome";
import { RASTER_MENU_JS } from "../raster/Chrome";
import { SystemContext } from "../SystemContext";
import { blueprintFor } from "../../../../../../shared/blueprints/blueprints";
import type { NavItem } from "../../engine";
import { werkstoffDoc } from "./testkit";

const data = werkstoffDoc();
const items: NavItem[] = [
  { key: "a", href: "#leistungen", label: "Leistungen", sectionType: "services" },
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
      <WerkstoffHead navItems={items} anchorPrefix="" />
    </SystemContext.Provider>
  );
  new Function(WERKSTOFF_MENU_JS)();
  const menu = document.querySelector<HTMLDetailsElement>(".ws-menu")!;
  return { menu, toggle: menu.querySelector("summary")! };
}

describe("Werkstoff: Menü", () => {
  test("Script wie Raster, nur mit Werkstoff-Klassen", () => {
    expect(WERKSTOFF_MENU_JS).toBe(RASTER_MENU_JS.replace(/\.rs-/g, ".ws-"));
  });

  test("Toggle ist ein <summary> mit Namen „Menü“", () => {
    const { toggle } = mount();
    expect(toggle.tagName).toBe("SUMMARY");
    expect(toggle.textContent!.trim()).toBe("Menü");
  });

  test("aria-current in Menü und Navigation", () => {
    mount();
    for (const sel of [".ws-menu-panel", ".ws-nav"])
      expect(
        [...document.querySelectorAll(`${sel} a[aria-current="page"]`)].map(a => a.textContent)
      ).toEqual(["Preise"]);
  });

  test("schließt bei Link-Klick, Escape (Fokus zurück) und Klick daneben", () => {
    const { menu, toggle } = mount();
    menu.open = true;
    document.querySelector<HTMLAnchorElement>('.ws-menu-panel a[href="#leistungen"]')!.click();
    expect(menu.open).toBe(false);
    menu.open = true;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(toggle);
    menu.open = true;
    document.querySelector<HTMLAnchorElement>(".ws-brand")!.click();
    expect(menu.open).toBe(false);
  });
});

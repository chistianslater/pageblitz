// @vitest-environment jsdom
import React from "react";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JournalHead, JOURNAL_MENU_JS } from "./Chrome";
import { SystemContext } from "../SystemContext";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { blueprintFor } from "../../../../../../shared/blueprints/blueprints";
import type { NavItem } from "../../engine";

const data = withDesignSystem(getFixture("salon-noir", "full"), "journal");
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
      <JournalHead navItems={items} anchorPrefix="" />
    </SystemContext.Provider>
  );
  new Function(JOURNAL_MENU_JS)();
  const menu = document.querySelector<HTMLDetailsElement>(".jr-menu")!;
  const toggle = menu.querySelector("summary")!;
  return { menu, toggle };
}

describe("Journal: Menü", () => {
  test("Toggle ist ein <summary> mit zugänglichem Namen „Menü“", () => {
    const { toggle } = mount();
    expect(toggle.tagName).toBe("SUMMARY");
    const visible = [...toggle.childNodes]
      .filter(
        n => !(n instanceof Element && n.getAttribute("aria-hidden") === "true")
      )
      .map(n => n.textContent)
      .join("")
      .trim();
    expect(visible).toBe("Menü");
    expect(
      document.querySelector(".jr-menu-panel")!.getAttribute("aria-label")
    ).toBe("Menü");
  });

  test("aktueller Eintrag trägt aria-current", () => {
    mount();
    const current = document.querySelectorAll(
      '.jr-menu-panel a[aria-current="page"]'
    );
    expect([...current].map(a => a.textContent)).toEqual(["Preise"]);
  });

  test("schließt nach Klick auf einen Eintrag", () => {
    const { menu } = mount();
    menu.open = true;
    document
      .querySelector<HTMLAnchorElement>('.jr-menu-panel a[href="#leistungen"]')!
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
    document.querySelector<HTMLAnchorElement>(".jr-brand")!.click();
    expect(menu.open).toBe(false);
  });
});

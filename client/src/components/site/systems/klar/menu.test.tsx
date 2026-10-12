// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { KLAR_MENU_JS } from "./Chrome";
import { render, zahnFullDoc } from "./testkit";

/** Ganze Seite einsetzen und das Inline-Menü-Script ausführen. */
function mount() {
  document.body.innerHTML = render(zahnFullDoc());
  new Function(KLAR_MENU_JS)();
  const more = document.querySelector<HTMLDetailsElement>("details.kl-more")!;
  const main = document.querySelector<HTMLDetailsElement>("details.kl-menu--main")!;
  return { more, main };
}

describe("Klar: Menüs", () => {
  test("„Mehr“ schließt bei Link-Klick, Escape und Klick daneben", () => {
    const { more } = mount();
    expect(more).not.toBeNull();
    more.open = true;
    more.querySelector<HTMLAnchorElement>(".kl-more-panel a")!.click();
    expect(more.open).toBe(false);
    more.open = true;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(more.open).toBe(false);
    more.open = true;
    document.querySelector<HTMLElement>("main")!.click();
    expect(more.open).toBe(false);
  });

  test("Hauptmenü schließt bei Link-Klick", () => {
    const { main } = mount();
    main.open = true;
    main.querySelector<HTMLAnchorElement>(".kl-menu-panel a")!.click();
    expect(main.open).toBe(false);
  });
});

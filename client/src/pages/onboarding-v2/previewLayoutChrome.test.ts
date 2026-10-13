// @vitest-environment jsdom
import { describe, expect, test, vi } from "vitest";
import { DEFAULT_DESIGN_PROFILE } from "@shared/siteContract/designProfile";
import {
  CHROME_CSS,
  HIDEABLE_MEDIA,
  SKELETON_TOP,
  chromeViewportTop,
  enablePreviewChrome,
  insertZoneDocumentTop,
  renderHideToggleHtml,
  renderInsertSkeletonHtml,
  renderInsertZoneHtml,
  skeletonAnchorFor,
} from "./previewLayoutChrome";

describe("HIDEABLE_MEDIA (Bild ausblenden)", () => {
  test("Hero- und Über-uns-Bild mit Anker und deutschen Labels", () => {
    expect(HIDEABLE_MEDIA.map(m => [m.anchor, m.key])).toEqual([
      ["start", "hero-media"],
      ["ueber-uns", "about-media"],
    ]);
    for (const media of HIDEABLE_MEDIA) {
      expect(media.hideLabel).toBe("Bild ausblenden");
      expect(media.showLabel).toBe("Bild einblenden");
    }
  });
});

describe("renderHideToggleHtml", () => {
  test("ein beschrifteter Knopf, aria-pressed folgt dem Zustand — keine Layout-Optionen", () => {
    const shown = renderHideToggleHtml(HIDEABLE_MEDIA[0]!, false);
    expect(shown).toContain('data-pb-hide-element="hero-media"');
    expect(shown).toContain('aria-pressed="false"');
    expect(shown).toContain("Bild ausblenden");
    expect(shown).not.toContain("data-pb-layout-option");
    expect(shown).not.toContain("Layout");
    const hidden = renderHideToggleHtml(HIDEABLE_MEDIA[0]!, true);
    expect(hidden).toContain('aria-pressed="true"');
    expect(hidden).toContain("Bild einblenden");
  });
});

describe("enablePreviewChrome", () => {
  const build = (heroHtml = '<img src="h.jpg" alt="">') => {
    document.head.innerHTML = "";
    document.documentElement.removeAttribute("data-pb-preview-chrome");
    document.body.innerHTML = `<div class="pb-site"><section id="start">${heroHtml}</section><section id="leistungen"></section><section id="ueber-uns"><p>Text</p></section><section id="kontakt"></section></div>`;
    return document;
  };

  test("kein Layout-Wähler, kein Layout-CSS, keine data-pb-Layoutattribute", () => {
    const doc = build();
    enablePreviewChrome(doc, DEFAULT_DESIGN_PROFILE, () => {});
    expect(doc.querySelector("[data-pb-layout-option]")).toBeNull();
    expect(doc.querySelector(".pb-preview-layout-btn")).toBeNull();
    const site = doc.querySelector(".pb-site")!;
    expect(site.getAttribute("data-pb-hero")).toBeNull();
    expect(site.getAttribute("data-pb-services")).toBeNull();
    const css = doc.head.textContent ?? "";
    expect(css).not.toContain("data-pb-hero");
    expect(css).not.toContain("data-pb-he");
  });

  test("„Bild ausblenden“ nur dort, wo ein Bild steht; Klick meldet das Profil mit hiddenElements", () => {
    const doc = build();
    const onPick = vi.fn();
    enablePreviewChrome(doc, DEFAULT_DESIGN_PROFILE, onPick);
    const buttons = Array.from(
      doc.querySelectorAll<HTMLButtonElement>("[data-pb-hide-element]")
    );
    // Über uns hat kein Bild → kein wirkungsloser Schalter.
    expect(buttons.map(b => b.getAttribute("data-pb-hide-element"))).toEqual([
      "hero-media",
    ]);
    buttons[0]!.click();
    expect(onPick).toHaveBeenCalledWith({
      ...DEFAULT_DESIGN_PROFILE,
      hiddenElements: ["hero-media"],
    });
    expect(buttons[0]!.getAttribute("aria-pressed")).toBe("true");
  });

  test("ausgeblendetes Bild (nicht mehr im DOM) bleibt per „Bild einblenden“ erreichbar", () => {
    const doc = build("<h1>Ohne Bild</h1>");
    const onPick = vi.fn();
    enablePreviewChrome(
      doc,
      { ...DEFAULT_DESIGN_PROFILE, hiddenElements: ["hero-media"] },
      onPick
    );
    const button = doc.querySelector<HTMLButtonElement>(
      '[data-pb-hide-element="hero-media"]'
    )!;
    expect(button.textContent).toContain("Bild einblenden");
    button.click();
    const next = onPick.mock.calls[0]![0];
    expect(next.hiddenElements).toBeUndefined();
  });

  test("Plus-Zonen hinter jeder Sektion außer Kontakt, Klick meldet den Typ", () => {
    const doc = build();
    const onInsert = vi.fn();
    enablePreviewChrome(doc, DEFAULT_DESIGN_PROFILE, () => {}, {
      onInsertSection: onInsert,
    });
    const zones = Array.from(doc.querySelectorAll("[data-pb-after]")).map(z =>
      z.getAttribute("data-pb-after")
    );
    expect(zones).toEqual(["hero", "services", "about"]);
    doc.querySelector<HTMLButtonElement>('[data-pb-after="services"] button')!.click();
    expect(onInsert).toHaveBeenCalledWith("services");
  });
});

describe("renderInsertZoneHtml (Plus-Zonen, 2026-09-03)", () => {
  test("rendert eine Zone mit Ziel-Sektion, Beschriftung und zugänglichem Label", () => {
    const html = renderInsertZoneHtml("services", "Leistungen");
    expect(html).toContain('data-pb-after="services"');
    expect(html).toContain('aria-label="Sektion nach Leistungen einfügen"');
    expect(html).toContain("Sektion einfügen");
    expect(html).toContain('class="pb-preview-insert"');
  });

  test("die Linie besteht aus zwei kurzen Stummeln neben dem Knopf, nicht aus einer Linie über die ganze Breite (Befund 2026-09-03: lief durch die Schrift)", () => {
    const html = renderInsertZoneHtml("services", "Leistungen");
    expect(html.match(/pb-preview-insert-stub/g)).toHaveLength(2);
  });
});

describe("skeletonAnchorFor (Sofort-Rückmeldung, 2026-09-03)", () => {
  test("normale Sektion: Skelett hinter die geklickte Sektion", () => {
    expect(skeletonAnchorFor("quote", "leistungen")).toBe("leistungen");
  });

  test("Hinweis-Banner rendert ganz oben — das Skelett auch, nicht an der Klickstelle", () => {
    expect(skeletonAnchorFor("notice", "leistungen")).toBe(SKELETON_TOP);
  });
});

describe("renderInsertSkeletonHtml (Sofort-Rückmeldung, 2026-09-03)", () => {
  test("trägt die Einblende-Klasse pb-in, sonst bleibt die Sektion unsichtbar (Befund 2026-09-03)", () => {
    expect(renderInsertSkeletonHtml("Ablauf")).toContain(
      "pb-preview-skeleton pb-in"
    );
  });

  test("zeigt den Sektionsnamen und einen Schreib-Hinweis", () => {
    const html = renderInsertSkeletonHtml("Ablauf");
    expect(html).toContain("Ablauf");
    expect(html).toMatch(/wird geschrieben/i);
    expect(html).toContain("pb-preview-skeleton");
    expect(html).toContain('aria-live="polite"');
  });
});

describe("chromeViewportTop", () => {
  test("sitzt unter der Sticky-Nav, wenn die Sektion darunter beginnt", () => {
    expect(chromeViewportTop(4, 400, 64, 800, 36)).toBe(72);
  });

  test("folgt dem Sektionsanfang, sobald die Nav ihn nicht mehr überdeckt", () => {
    expect(chromeViewportTop(120, 500, 64, 800, 36)).toBe(128);
  });

  test("blendet aus, wenn die Sektion den Viewport verlassen hat", () => {
    expect(chromeViewportTop(-400, -20, 64, 800, 36)).toBeNull();
  });

  test("klemmt am sichtbaren Sektionsende, damit der Button nicht in den nächsten Block rutscht", () => {
    expect(chromeViewportTop(120, 180, 64, 800, 80)).toBe(92);
  });
});

describe("Plus-Zonen scrollen mit dem Inhalt (Ruckeln am Handy, 2026-09-04)", () => {
  test("die Zone liegt absolut im Dokument, nicht fest im Viewport", () => {
    const rule = CHROME_CSS.match(/\.pb-preview-insert\{[^}]*\}/)?.[0] ?? "";
    expect(rule).toContain("position:absolute");
    expect(rule).not.toContain("position:fixed");
  });

  test("bei statischem body zählt die Dokumentkante inklusive Scrollstand", () => {
    expect(insertZoneDocumentTop(120, 800, -800, false)).toBe(920);
  });

  test("bei positioniertem body zählt der Abstand zur body-Kante", () => {
    expect(insertZoneDocumentTop(120, 800, -50, true)).toBe(170);
  });

  test("rundet auf ganze Pixel, damit die Linie nicht unscharf sitzt", () => {
    expect(insertZoneDocumentTop(120.4, 0.2, 0, false)).toBe(121);
  });
});

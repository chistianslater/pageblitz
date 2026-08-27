import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { deriveChecklistState } from "../../../../shared/onboardingV2/checklist";
import { Checklist } from "./Checklist";

describe("Checklist", () => {
  test("rendert sechs Punkte in fester Reihenfolge, markiert erledigt/aktiv/pflicht", () => {
    const items = deriveChecklistState(null, {
      legalOwner: "",
      studioProgress: { styleConfirmed: true },
    });
    const html = renderToStaticMarkup(
      <Checklist items={items} activeId="photos" onSelect={() => {}} />
    );
    expect(html.match(/class="[^"]*pb-studio-check-item/g)).toHaveLength(6);
    expect(html.indexOf("Designrichtung")).toBeLessThan(
      html.indexOf("Rechtliches")
    );
    expect(html).toContain('data-status="done"');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("Pflicht");
  });

  test("aktivierte Extras erscheinen als eigene anklickbare Unter-Steps", () => {
    const items = deriveChecklistState(null, {
      studioProgress: { addonsReviewed: true },
    });
    const html = renderToStaticMarkup(
      <Checklist
        items={items}
        activeId={null}
        onSelect={() => {}}
        activeAddOns={["aiChat", "booking"]}
        onSelectAddOn={() => {}}
      />
    );
    expect(html).toContain('aria-label="Aktive Extras"');
    expect(html).toContain("KI-Chat");
    expect(html).toContain("Terminbuchung");
    expect(html.match(/>Bearbeiten</g)).toHaveLength(2);
    expect(html).toContain("Begrüßung anpassen");
  });

  test("Galerie-Extra zeigt Bearbeiten-Hinweis und Erledigt-Status", () => {
    const items = deriveChecklistState(null, {
      studioProgress: { addonsReviewed: true },
    });
    const html = renderToStaticMarkup(
      <Checklist
        items={items}
        activeId={null}
        onSelect={() => {}}
        activeAddOns={["gallery"]}
        extraFocus="gallery"
        extraDone={{ gallery: true }}
        onSelectAddOn={() => {}}
      />
    );
    expect(html).toContain("Bildergalerie");
    expect(html).toContain("Fotos hochladen, löschen und sortieren");
    expect(html).toContain(">Erledigt<");
    expect(html).toContain('aria-current="step"');
  });
});

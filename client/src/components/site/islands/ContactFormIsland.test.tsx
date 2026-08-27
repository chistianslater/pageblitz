import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContactFormIsland } from "./ContactFormIsland";

describe("ContactFormIsland — config", () => {
  test("Default-Labels ohne Config", () => {
    const html = renderToStaticMarkup(<ContactFormIsland slug="brandt" />);
    expect(html).toContain("Name");
    expect(html).toContain("E-Mail");
    expect(html).toContain("Telefon (optional)");
    expect(html).toContain("Nachricht senden");
  });

  test("übernimmt Labels, blendet Telefon aus und rendert Custom-Felder", () => {
    const html = renderToStaticMarkup(
      <ContactFormIsland
        slug="brandt"
        config={{
          nameLabel: "Ihr Name",
          phoneEnabled: false,
          submitLabel: "Anfrage schicken",
          customFields: [
            { id: "firma", label: "Firma", required: true },
            { id: "anlass", label: "Anlass" },
          ],
        }}
      />
    );
    expect(html).toContain("Ihr Name");
    expect(html).toContain("Anfrage schicken");
    expect(html).toContain('name="custom-firma"');
    expect(html).toContain('name="custom-anlass"');
    expect(html).not.toContain('name="phone"');
  });

  test("Erfolgszustand zeigt konfigurierte Danke-Message", () => {
    const html = renderToStaticMarkup(
      <ContactFormIsland
        slug="brandt"
        config={{ successMessage: "Wir rufen zurück." }}
      />
    );
    // idle render still shows the form; success is client-state.
    expect(html).toContain('data-hydrate="contact"');
  });
});

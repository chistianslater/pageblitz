import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  GalleryAddonNotice,
  PhotoGrid,
  PhotoTargetPicker,
  SelectedGalleryList,
} from "./photoParts";

describe("PhotoGrid", () => {
  test("rendert Buttons mit aria-pressed für ausgewählte Fotos", () => {
    const html = renderToStaticMarkup(
      <PhotoGrid
        photos={["https://example.com/a.jpg", "https://example.com/b.jpg"]}
        selected={["https://example.com/b.jpg"]}
        onPick={() => {}}
        emptyText="Keine Fotos gefunden."
      />
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("https://example.com/a.jpg");
    expect(html).toContain("https://example.com/b.jpg");
    expect(html).not.toContain("Keine Fotos gefunden.");
  });

  test("Alt-Text nummeriert die Fotos nach Position (Finding F2)", () => {
    const html = renderToStaticMarkup(
      <PhotoGrid
        photos={["https://example.com/a.jpg", "https://example.com/b.jpg"]}
        selected={[]}
        onPick={() => {}}
        emptyText="Keine Fotos gefunden."
      />
    );
    expect(html).toContain('alt="Foto 1"');
    expect(html).toContain('alt="Foto 2"');
  });

  test("zeigt emptyText, wenn keine Fotos vorhanden sind", () => {
    const html = renderToStaticMarkup(
      <PhotoGrid
        photos={[]}
        selected={[]}
        onPick={() => {}}
        emptyText="Keine Fotos gefunden."
      />
    );
    expect(html).toContain("Keine Fotos gefunden.");
  });
});

describe("PhotoTargetPicker", () => {
  test("zeigt Hero, Über uns und Galerie, wenn hasAbout true ist", () => {
    const html = renderToStaticMarkup(
      <PhotoTargetPicker target="hero" onTarget={() => {}} hasAbout={true} />
    );
    expect(html).toContain("Hero");
    expect(html).toContain("Über uns");
    expect(html).toContain("Galerie");
  });

  test("blendet Über-uns-Option aus, wenn hasAbout false ist", () => {
    const html = renderToStaticMarkup(
      <PhotoTargetPicker target="hero" onTarget={() => {}} hasAbout={false} />
    );
    expect(html).not.toContain("Über uns");
    expect(html).toContain("Hero");
    expect(html).toContain("Galerie");
  });
});

describe("GalleryAddonNotice (Plan B6 Task 6: Galerie nur bei gebuchtem Add-on pflegen)", () => {
  test("zeigt Hinweis mit Preis und den Aktivieren-Schalter", () => {
    const html = renderToStaticMarkup(
      <GalleryAddonNotice onActivate={() => {}} busy={false} error={null} />
    );
    expect(html).toContain("Bildergalerie");
    expect(html).toContain("3,90 €");
    expect(html).toContain(">Galerie aktivieren<");
    expect(html).not.toContain('role="alert"');
  });

  test("busy sperrt den Schalter, Fehler erscheint als role=alert", () => {
    const html = renderToStaticMarkup(
      <GalleryAddonNotice
        onActivate={() => {}}
        busy
        error="Add-on-Änderung konnte nicht abgerechnet werden."
      />
    );
    expect(html).toContain("disabled");
    expect(html).toContain('role="alert"');
    expect(html).toContain("nicht abgerechnet");
  });
});

describe("SelectedGalleryList", () => {
  test("leere Liste erklärt Upload und Auswahl", () => {
    const html = renderToStaticMarkup(
      <SelectedGalleryList urls={[]} onMove={() => {}} onRemove={() => {}} />
    );
    expect(html).toContain("Noch keine Galerie-Fotos");
    expect(html).not.toContain('aria-label="Galerie-Fotos"');
  });

  test("zeigt Reihenfolge, Pfeile und Entfernen", () => {
    const html = renderToStaticMarkup(
      <SelectedGalleryList
        urls={["https://example.com/a.jpg", "https://example.com/b.jpg"]}
        onMove={() => {}}
        onRemove={() => {}}
      />
    );
    expect(html).toContain('aria-label="Galerie-Fotos"');
    expect(html).toContain("Foto 1");
    expect(html).toContain("Foto 2");
    expect(html).toContain("nach oben verschieben");
    expect(html).toContain("nach unten verschieben");
    expect(html).toContain("entfernen");
    expect(html).toContain("disabled");
  });
});

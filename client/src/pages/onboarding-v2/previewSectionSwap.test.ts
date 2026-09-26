// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { swapSectionFromHtml } from "./previewSectionSwap";

function vorschau(body: string): Document {
  return new DOMParser().parseFromString(
    `<!doctype html><html><body>${body}</body></html>`,
    "text/html"
  );
}

const NEU = `<!doctype html><html><body><main>
  <section id="start">Hero</section>
  <section id="speisekarte"><h2>Karte</h2><p>Döner 7,50</p></section>
  <section id="kontakt">Kontakt</section>
</main></body></html>`;

describe("swapSectionFromHtml", () => {
  test("ersetzt eine vorhandene Sektion", () => {
    const doc = vorschau(
      `<main><section id="start">Hero</section><section id="speisekarte">alt</section><section id="kontakt">Kontakt</section></main>`
    );
    expect(swapSectionFromHtml(doc, NEU, "speisekarte")).toBe(true);
    expect(doc.getElementById("speisekarte")?.textContent).toContain(
      "Döner 7,50"
    );
    expect(doc.querySelectorAll("#speisekarte")).toHaveLength(1);
  });

  test("fügt eine neue Sektion hinter ihrem Vorgänger ein", () => {
    const doc = vorschau(
      `<main><section id="start">Hero</section><section id="kontakt">Kontakt</section></main>`
    );
    expect(swapSectionFromHtml(doc, NEU, "speisekarte")).toBe(true);
    const ids = Array.from(doc.querySelectorAll("section")).map(s => s.id);
    expect(ids).toEqual(["start", "speisekarte", "kontakt"]);
  });

  test("Sektion fehlt im neuen HTML → alte wird entfernt", () => {
    const doc = vorschau(
      `<main><section id="start">Hero</section><section id="speisekarte">alt</section></main>`
    );
    const ohne = NEU.replace(
      /<section id="speisekarte">[\s\S]*?<\/section>/,
      ""
    );
    expect(swapSectionFromHtml(doc, ohne, "speisekarte")).toBe(true);
    expect(doc.getElementById("speisekarte")).toBeNull();
  });

  test("kein Ankerpunkt auffindbar → false, nichts verändert", () => {
    const doc = vorschau(`<main><section id="anderes">x</section></main>`);
    const vorher = doc.body.innerHTML;
    expect(
      swapSectionFromHtml(
        doc,
        NEU.replace(/id="(start|kontakt)"/g, ""),
        "speisekarte"
      )
    ).toBe(false);
    expect(doc.body.innerHTML).toBe(vorher);
  });
});

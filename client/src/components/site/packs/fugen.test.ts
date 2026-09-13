import { describe, expect, test } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packsDir = dirname(fileURLToPath(import.meta.url));

/**
 * Der 1px-Fugen-Trick: Ein Raster bekommt eine Fläche in Linienfarbe, die
 * Kacheln liegen mit 1px Abstand darauf, und die Fläche scheint als
 * Haarlinie durch. Elegant — solange jede Zeile voll wird.
 *
 * Wird sie es nicht (sechs Fragen in fünf Spalten), stehen die leeren Zellen
 * als grauer Block auf der Seite. Genau das ist zweimal passiert: erst in
 * schimmer, dann — weil ich nur schimmer repariert hatte — nochmal in
 * morgenlicht (Betreiber-Befund 2026-09-13, zweimal dieselbe Meldung).
 *
 * Die Linie gehört deshalb an die Kachel (outline), nicht unter das Raster.
 * Dieser Test hält das für alle Packs fest, statt auf den nächsten Befund zu
 * warten.
 */
describe("Raster-Fugen", () => {
  const dateien = readdirSync(packsDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => join(packsDir, e.name, "css.ts"))
    .filter(p => {
      try {
        readFileSync(p, "utf8");
        return true;
      } catch {
        return false;
      }
    });

  test("findet die CSS-Dateien aller Packs", () => {
    expect(dateien.length).toBeGreaterThanOrEqual(14);
  });

  test("kein Raster mit 1px-Fugen malt eine Fläche darunter", () => {
    for (const datei of dateien) {
      const css = readFileSync(datei, "utf8");
      // Regeln grob trennen; für diesen Zweck reicht der Block bis zur
      // nächsten schließenden Klammer.
      for (const block of css.split("}")) {
        if (!block.includes("gap:1px")) continue;
        const flaeche = block.match(
          /background:\s*(var\(--pb-[a-z-]+\)|#[0-9a-f]{3,8})/i
        );
        expect(
          flaeche?.[0],
          `${datei.split("/").slice(-2).join("/")}: Raster mit 1px-Fugen hat eine Fläche darunter (${flaeche?.[0]}). ` +
            "Die leeren Zellen einer nicht vollen Zeile werden dadurch sichtbar — " +
            "die Linie gehört als outline an die Kachel."
        ).toBeUndefined();
      }
    }
  });
});

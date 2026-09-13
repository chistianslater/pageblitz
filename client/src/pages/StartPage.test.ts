import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "StartPage.tsx"),
  "utf8"
);

describe("StartPage Einstieg", () => {
  test("startet ohne Auswahlschritt direkt in der Google-Suche", () => {
    // Betreiber-Wunsch 2026-09-13: Wer auf /start landet, will anfangen.
    // Die frühere Frage „Wie möchtest du starten?" kostete einen Klick,
    // ohne eine Entscheidung zu ermöglichen, die der nächste Schritt nicht
    // ohnehin anbietet.
    expect(src).toContain('useState<Step>("gmb")');
    expect(src).not.toContain('step === "choice"');
    expect(src).not.toContain("Wie möchtest du starten?");
  });

  test("führt weiter zur manuellen Eingabe, wenn Google nichts Passendes hat", () => {
    // Der Ausweg ersetzt die entfallene Vorab-Auswahl — ohne ihn säßen
    // Betriebe ohne Google-Eintrag fest.
    expect(src).toContain("Mein Unternehmen ist nicht dabei");
    expect(src).toContain('setStep("manual")');
    expect(src).toContain('setStep("gmb")');
  });
});

describe("StartPage Geolocation-Verdrahtung", () => {
  test("Standort-Prompt erst im GMB-/Stadt-Schritt", () => {
    const gmbStart = src.indexOf('{step === "gmb"');
    const standortUi = src.indexOf("<StandortControl");
    expect(gmbStart).toBeGreaterThan(0);
    expect(standortUi).toBeGreaterThan(gmbStart);
  });

  test("Standort und Messpunkt hängen am Öffnen, nicht mehr am Auswahl-Klick", () => {
    expect(src).toContain("ensureLocationIfGranted");
    expect(src).toContain("didEnter");
    expect(src).toContain('clarity?.("event", "start_gmb")');
  });

  test("Hero-Prefill sucht mit ensureLocationIfGranted (granted → nearby, sonst Tipp-Suche)", () => {
    expect(src).toContain("handleUseStandort");
    expect(src).toContain("runGmbSearch");
  });
});

import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AgeGateQuestion } from "./AgeGateQuestion";

const html = (
  ageGate: { enabled: boolean; suspected: boolean; asked: boolean },
  busy = false
) =>
  renderToStaticMarkup(
    <AgeGateQuestion ageGate={ageGate} onAnswer={() => {}} busy={busy} />
  );

describe("AgeGateQuestion (Betreiber-Entscheidung 2026-09-05)", () => {
  test("ohne Verdacht und ohne gesetztes Tor bleibt alles still", () => {
    expect(html({ enabled: false, suspected: false, asked: false })).toBe("");
  });

  test("bei Verdacht wird vor dem Freischalten gefragt", () => {
    const markup = html({ enabled: false, suspected: true, asked: false });
    expect(markup).toContain("Altersprüfung");
    expect(markup).toContain("Ja, Altersprüfung zeigen");
    expect(markup).toContain("Nein, nicht nötig");
  });

  test("beantwortet: keine Frage mehr, aber weiterhin umschaltbar", () => {
    const markup = html({ enabled: true, suspected: true, asked: true });
    expect(markup).not.toContain("Nein, nicht nötig");
    expect(markup).toContain("eingeschaltet");
    expect(markup).toContain("Ausschalten");
  });

  test("eingeschaltet ohne Verdacht (Admin oder Altbestand) bleibt sichtbar", () => {
    const markup = html({ enabled: true, suspected: false, asked: false });
    expect(markup).toContain("eingeschaltet");
  });

  test("während des Speicherns sind die Knöpfe gesperrt", () => {
    const markup = html({ enabled: false, suspected: true, asked: false }, true);
    expect((markup.match(/disabled=""/g) ?? []).length).toBe(2);
  });
});

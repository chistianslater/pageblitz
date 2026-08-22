import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StyleCandidateList } from "./StylePanel";

describe("StyleCandidateList", () => {
  test("rendert je Kandidat Mini-Preview (iframe mit ?pack=), Name, Essenz; aktuelles Pack markiert", () => {
    const html = renderToStaticMarkup(
      <StyleCandidateList
        token={"t".repeat(32)}
        currentPackId="werkbank"
        busyId={null}
        onPick={() => {}}
        candidates={[
          { id: "werkbank", name: "Werkbank", essence: "Robust." },
          { id: "kanzlei", name: "Kanzlei", essence: "Seriös." },
        ]}
      />
    );
    expect(html).toContain(`/preview-ssr/${"t".repeat(32)}?pack=werkbank`);
    expect(html).toContain(`/preview-ssr/${"t".repeat(32)}?pack=kanzlei`);
    expect(html).toContain("Kanzlei");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Aktuell");
    // Gültiges HTML: kein interaktives <iframe> innerhalb eines <button> —
    // die Mini-Previews liegen dekorativ neben dem eigentlichen Auswahl-Button.
    expect(html).not.toMatch(/<button[^>]*>(?:(?!<\/button>)[\s\S])*<iframe/);
  });
});

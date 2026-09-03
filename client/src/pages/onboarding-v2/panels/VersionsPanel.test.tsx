import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { VersionList } from "./VersionsPanel";

const now = new Date("2026-09-03T14:00:00+02:00");
const versions = [
  {
    id: 3,
    trigger: "chat" as const,
    label: "KI-Chat: „Header dunkler“",
    createdAt: new Date(now.getTime() - 30_000),
  },
  {
    id: 2,
    trigger: "panel" as const,
    label: "Fotos geändert",
    createdAt: new Date(now.getTime() - 10 * 60_000),
  },
  {
    id: 1,
    trigger: "generation" as const,
    label: "Website erstellt",
    createdAt: new Date("2026-08-30T18:30:00+02:00"),
  },
];

describe("VersionList (Verlauf, 2026-09-03)", () => {
  test("rendert alle Stände mit Label, Zeit und Auslöser; der jüngste ist als aktuell markiert", () => {
    const html = renderToStaticMarkup(
      <VersionList
        versions={versions}
        previewId={null}
        onPreview={() => {}}
        now={now}
      />
    );
    expect(html).toContain("KI-Chat: „Header dunkler“");
    expect(html).toContain("Fotos geändert");
    expect(html).toContain("Website erstellt");
    expect(html).toContain("gerade eben");
    expect(html).toContain("vor 10 Min.");
    expect(html).toContain("30.08., 18:30");
    expect(html).toContain("Aktueller Stand");
    expect(html.match(/pb-versions-row/g)).toHaveLength(3);
  });

  test("der in der Vorschau gezeigte Stand ist per aria-pressed markiert", () => {
    const html = renderToStaticMarkup(
      <VersionList
        versions={versions}
        previewId={2}
        onPreview={() => {}}
        now={now}
      />
    );
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-pressed="true"[^>]*>[\s\S]*?Fotos geändert/);
  });

  test("ohne Stände erscheint ein Hinweis statt einer Liste", () => {
    const html = renderToStaticMarkup(
      <VersionList
        versions={[]}
        previewId={null}
        onPreview={() => {}}
        now={now}
      />
    );
    expect(html).toContain("Noch keine früheren Stände");
    expect(html).not.toContain("pb-versions-row");
  });
});

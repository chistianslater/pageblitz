import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  COALESCE_WINDOW_MS,
  MAX_VERSIONS,
  planVersionWrite,
  restoreDoc,
  undoTarget,
  versionsToPrune,
  type StoredVersion,
} from "./versions";

const base: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }, { type: "contact" }],
};

function withHeadline(headline: string): WebsiteDataV2 {
  return {
    ...base,
    sections: [{ type: "hero", headline }, { type: "contact" }],
  };
}

const T0 = new Date("2026-09-03T10:00:00Z");
const later = (ms: number) => new Date(T0.getTime() + ms);

function stored(
  overrides: Partial<StoredVersion> & { doc?: WebsiteDataV2 } = {}
): StoredVersion {
  return {
    id: 1,
    trigger: "panel",
    label: "Fotos geändert",
    createdAt: T0,
    doc: base,
    ...overrides,
  };
}

describe("planVersionWrite (Verlauf, 2026-09-03)", () => {
  test("erster Schreibvorgang sichert zuerst den bisherigen Stand als Baseline", () => {
    const plan = planVersionWrite({
      latest: null,
      prevDoc: base,
      nextDoc: withHeadline("Neu"),
      write: { trigger: "panel", label: "Texte geändert" },
      now: later(1000),
    });
    expect(plan).toEqual([
      {
        kind: "insert",
        trigger: "generation",
        label: "Website erstellt",
        doc: base,
      },
      {
        kind: "insert",
        trigger: "panel",
        label: "Texte geändert",
        doc: withHeadline("Neu"),
      },
    ]);
  });

  test("unverändertes Dokument erzeugt keinen neuen Stand", () => {
    const plan = planVersionWrite({
      latest: stored({ doc: base }),
      prevDoc: base,
      nextDoc: { ...base },
      write: { trigger: "panel", label: "Texte geändert" },
      now: later(1000),
    });
    expect(plan).toEqual([]);
  });

  test("Dokument-Gleichheit ignoriert die Schlüsselreihenfolge", () => {
    const reordered = {
      sections: base.sections,
      seo: base.seo,
      businessName: base.businessName,
      stylePackId: base.stylePackId,
      version: 2,
    } as WebsiteDataV2;
    const plan = planVersionWrite({
      latest: stored({ doc: base }),
      prevDoc: base,
      nextDoc: reordered,
      write: { trigger: "panel", label: "Texte geändert" },
      now: later(1000),
    });
    expect(plan).toEqual([]);
  });

  test("gleicher Auslöser und gleiches Label innerhalb des Fensters ersetzt den letzten Stand", () => {
    const plan = planVersionWrite({
      latest: stored({
        id: 7,
        trigger: "inline",
        label: "Text direkt bearbeitet",
      }),
      prevDoc: base,
      nextDoc: withHeadline("Neu"),
      write: { trigger: "inline", label: "Text direkt bearbeitet" },
      now: later(COALESCE_WINDOW_MS - 1),
    });
    expect(plan).toEqual([
      {
        kind: "replace",
        id: 7,
        trigger: "inline",
        label: "Text direkt bearbeitet",
        doc: withHeadline("Neu"),
      },
    ]);
  });

  test("nach Ablauf des Fensters wird ein neuer Stand angehängt", () => {
    const plan = planVersionWrite({
      latest: stored({
        id: 7,
        trigger: "inline",
        label: "Text direkt bearbeitet",
      }),
      prevDoc: base,
      nextDoc: withHeadline("Neu"),
      write: { trigger: "inline", label: "Text direkt bearbeitet" },
      now: later(COALESCE_WINDOW_MS),
    });
    expect(plan.map(op => op.kind)).toEqual(["insert"]);
  });

  test("anderes Label (z. B. neuer Chat-Wunsch) wird nie zusammengefasst", () => {
    const plan = planVersionWrite({
      latest: stored({
        id: 7,
        trigger: "chat",
        label: "KI-Chat: „Header dunkler“",
      }),
      prevDoc: base,
      nextDoc: withHeadline("Neu"),
      write: { trigger: "chat", label: "KI-Chat: „Mehr Bilder“" },
      now: later(1000),
    });
    expect(plan.map(op => op.kind)).toEqual(["insert"]);
  });

  test("Wiederherstellen und Erstellen werden nie zusammengefasst", () => {
    for (const trigger of ["restore", "generation"] as const) {
      const plan = planVersionWrite({
        latest: stored({ id: 7, trigger, label: "x" }),
        prevDoc: base,
        nextDoc: withHeadline("Neu"),
        write: { trigger, label: "x" },
        now: later(1000),
      });
      expect(plan.map(op => op.kind)).toEqual(["insert"]);
    }
  });
});

describe("versionsToPrune", () => {
  test("bis zur Obergrenze wird nichts gelöscht, darüber die Differenz", () => {
    expect(versionsToPrune(MAX_VERSIONS)).toBe(0);
    expect(versionsToPrune(MAX_VERSIONS + 3)).toBe(3);
    expect(versionsToPrune(2)).toBe(0);
  });
});

describe("restoreDoc", () => {
  test("übernimmt den alten Stand, behält aber die aktuellen Add-on-Flags", () => {
    const current: WebsiteDataV2 = {
      ...withHeadline("Aktuell"),
      addOns: { gallery: true, team: true },
    };
    const old: WebsiteDataV2 = {
      ...withHeadline("Alt"),
      addOns: { gallery: true },
    };
    const restored = restoreDoc(current, old);
    expect(restored.sections[0]).toEqual({ type: "hero", headline: "Alt" });
    expect(restored.addOns).toEqual({ gallery: true, team: true });
  });

  test("ohne aktuelle Add-on-Flags trägt der wiederhergestellte Stand auch keine", () => {
    const current = withHeadline("Aktuell");
    const old: WebsiteDataV2 = {
      ...withHeadline("Alt"),
      addOns: { gallery: true },
    };
    expect("addOns" in restoreDoc(current, old)).toBe(false);
  });
});

describe("undoTarget", () => {
  test("liefert den vorletzten Stand (der letzte ist der aktuelle)", () => {
    const list = [
      stored({ id: 3, createdAt: later(3000) }),
      stored({ id: 2, createdAt: later(2000) }),
      stored({ id: 1, createdAt: later(1000) }),
    ];
    expect(undoTarget(list)?.id).toBe(2);
  });

  test("mit weniger als zwei Ständen gibt es nichts rückgängig zu machen", () => {
    expect(undoTarget([stored()])).toBeNull();
    expect(undoTarget([])).toBeNull();
  });
});

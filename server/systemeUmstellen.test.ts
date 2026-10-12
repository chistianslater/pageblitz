import { describe, expect, test } from "vitest";
import { getFixture } from "../shared/siteContract/fixtures";
import type { WebsiteDataV2 } from "../shared/siteContract/types";
import { withDesignSystem } from "../shared/designSystems/apply";
import {
  DEFAULT_IDS_SPEC,
  changedKeys,
  countPhotos,
  forbiddenChanges,
  applySwitch,
  idsFromArgv,
  parseArgs,
  parseIdList,
  planSwitch,
  stableJson,
  type SwitchRepo,
} from "./systemeUmstellen";

/** Erfundener Betrieb (rev 2) auf Basis einer Fixture. */
function rev2(
  category: string,
  name = "Beispiel Muster",
  extra: Partial<WebsiteDataV2> = {}
): WebsiteDataV2 {
  const base = getFixture("werkbank", "full");
  return {
    ...base,
    designRevision: 2,
    businessName: name,
    businessCategory: category,
    fontPairId: base.fontPairId ?? "editorial",
    ...extra,
  } as WebsiteDataV2;
}

describe("parseIdList", () => {
  test("Einzel-IDs und Bereiche, aufsteigend, ohne Doppel", () => {
    expect(parseIdList("613, 504,558-560,559")).toEqual([
      504, 558, 559, 560, 613,
    ]);
  });
  test("Standardliste: 504, 558–607 ohne 593, 613", () => {
    const ids = parseIdList(DEFAULT_IDS_SPEC);
    expect(ids[0]).toBe(504);
    expect(ids).toContain(558);
    expect(ids).toContain(607);
    expect(ids).not.toContain(593);
    expect(ids.at(-1)).toBe(613);
    expect(ids).toHaveLength(1 + 50 - 1 + 1);
  });
  test("Unsinn wirft", () => {
    for (const bad of ["", "abc", "5-3", "0", "1-99999", "12;13", "-4"])
      expect(() => parseIdList(bad), bad).toThrow();
  });
  test("--ids aus der Kommandozeile, sonst Standard", () => {
    expect(idsFromArgv(["--ids", "7,9-10"])).toEqual([7, 9, 10]);
    expect(idsFromArgv(["--schreiben", "--ids=3"])).toEqual([3]);
    expect(idsFromArgv([])).toEqual(parseIdList(DEFAULT_IDS_SPEC));
    expect(() => idsFromArgv(["--ids", "--schreiben"])).toThrow();
  });
});

describe("Diff-Prüfung", () => {
  test("nur geänderte Top-Level-Schlüssel; erlaubt sind Revision, System, Palette, Schriftpaar", () => {
    const a = {
      designRevision: 2,
      fontPairId: "x",
      sections: [1],
      businessName: "A",
    };
    const b = {
      designRevision: 3,
      system: "nacht",
      palette: "p",
      sections: [1],
      businessName: "A",
    };
    expect(changedKeys(a, b)).toEqual([
      "designRevision",
      "fontPairId",
      "palette",
      "system",
    ]);
    expect(forbiddenChanges(a, b)).toEqual([]);
    expect(forbiddenChanges(a, { ...b, sections: [2] })).toEqual(["sections"]);
    expect(forbiddenChanges(a, { ...b, seo: {} })).toEqual(["seo"]);
  });
});

describe("countPhotos", () => {
  test("verschiedene Adressen aus imageUrl und images[].url, auch Unterseiten", () => {
    const doc = {
      sections: [
        { type: "hero", imageUrl: "a" },
        { type: "about", imageUrl: "b" },
        { type: "gallery", images: [{ url: "a" }, { url: "c" }, { url: "c" }] },
        { type: "team", members: [{ name: "X", imageUrl: "d" }] },
      ],
      pages: [{ sections: [{ type: "gallery", images: [{ url: "e" }] }] }],
    };
    expect(countPhotos(doc)).toBe(5);
    expect(countPhotos({})).toBe(0);
  });
});

describe("planSwitch", () => {
  test("Restaurant (rev 2) → Nacht, nur vier Felder ändern sich, Fotos unverändert", () => {
    const doc = rev2("Restaurant", "Gasthaus Linde", {
      blueprintFamily: "gastro",
    });
    const plan = planSwitch(doc);
    expect(plan.kind).toBe("switch");
    if (plan.kind !== "switch") return;
    expect(plan.system).toBe("nacht");
    expect(plan.palette).toBeTruthy();
    expect(plan.next.designRevision).toBe(3);
    expect(plan.next.fontPairId).toBeUndefined();
    expect(forbiddenChanges(doc as never, plan.next as never)).toEqual([]);
    expect(plan.next.sections).toEqual(doc.sections);
    expect(countPhotos(plan.next)).toBe(countPhotos(doc));
    expect(plan.photos).toBe(countPhotos(doc));
  });

  test("Weinstube ohne gespeicherte Familie → Gastro über Stichwort → Nacht", () => {
    const plan = planSwitch(rev2("Weinstube", "Zum Ochsen"));
    expect(plan.kind === "switch" && plan.system).toBe("nacht");
  });

  test("nur rev 2 wird umgestellt: rev 3, rev 1 und ohne Revision → überspringen", () => {
    const plan = planSwitch(withDesignSystem(rev2("Restaurant"), "journal"));
    expect(plan).toMatchObject({
      kind: "skip",
      reason: "schon rev 3",
      revision: 3,
    });
    const r1 = planSwitch(rev2("Restaurant", "Linde", { designRevision: 1 }));
    expect(r1).toMatchObject({ kind: "skip", revision: 1 });
    expect(r1.kind === "skip" && r1.reason).toMatch(/nur rev 2/);
    const { designRevision: _d, ...ohne } = rev2("Restaurant", "Linde");
    const r0 = planSwitch(ohne);
    expect(r0).toMatchObject({ kind: "skip" });
    expect(r0.kind === "skip" && r0.reason).toMatch(/nur rev 2/);
    const ok = planSwitch(
      rev2("Restaurant", "Linde", { blueprintFamily: "gastro" })
    );
    expect(ok).toMatchObject({ kind: "switch", revision: 2 });
  });

  test("nicht parsebar → überspringen", () => {
    expect(planSwitch({ foo: 1 })).toMatchObject({ kind: "skip" });
    expect(planSwitch(null)).toMatchObject({ kind: "skip" });
  });

  test("Familie nicht bestimmt → überspringen", () => {
    const plan = planSwitch(rev2("Xyzq", "Qwertz GmbH"));
    expect(plan).toMatchObject({
      kind: "skip",
      reason: "Familie nicht bestimmt",
    });
  });

  test("unbekannte Felder (strenges Schema) → überspringen, nichts wird still entfernt", () => {
    const doc = {
      ...rev2("Restaurant", "Linde", { blueprintFamily: "gastro" }),
      altFeld: 1,
    };
    expect(planSwitch(doc)).toMatchObject({ kind: "skip" });
  });
});

describe("parseArgs", () => {
  test("erlaubt --schreiben und --ids (beide Schreibweisen)", () => {
    expect(parseArgs(["--ids", "5-6", "--schreiben"])).toEqual({
      ids: [5, 6],
      schreiben: true,
    });
    expect(parseArgs(["--ids=7"])).toEqual({ ids: [7], schreiben: false });
    expect(parseArgs([]).schreiben).toBe(false);
  });
  test("unbekannte Argumente brechen ab (vor jedem DB-Zugriff)", () => {
    expect(() => parseArgs(["--id", "5"])).toThrow(
      /Unbekanntes Argument: --id/
    );
    expect(() => parseArgs(["--schreibe"])).toThrow(/--schreibe/);
    expect(() => parseArgs(["504"])).toThrow(/504/);
  });
});

describe("stableJson", () => {
  test("Schlüsselreihenfolge egal (MySQL-JSON sortiert um)", () => {
    expect(stableJson({ a: 1, b: { c: [1, { d: 2, e: 3 }] } })).toBe(
      stableJson({ b: { c: [1, { e: 3, d: 2 }] }, a: 1 })
    );
    expect(stableJson({ a: 1 })).not.toBe(stableJson({ a: 2 }));
  });
});

describe("applySwitch (Ablauf mit Fake-Repo)", () => {
  const OLD = { designRevision: 2, businessName: "Alt" };
  const NEW = {
    designRevision: 3,
    system: "nacht",
    palette: "p",
    businessName: "Alt",
  };
  function fakeRepo(
    over: Partial<{
      current: unknown;
      latest: unknown;
      failInsertAt: number;
    }> = {}
  ) {
    const log: string[] = [];
    let inserts = 0;
    const repo: SwitchRepo = {
      async readDoc() {
        log.push("read");
        return "current" in over ? over.current : OLD;
      },
      async latestVersionDoc() {
        log.push("latest");
        return "latest" in over ? over.latest : null;
      },
      async insertVersion(v) {
        inserts += 1;
        log.push(
          `insert:${v.label}:${(v.doc as { designRevision: number }).designRevision}`
        );
        return over.failInsertAt === inserts ? 0 : inserts;
      },
      async writeDoc(doc) {
        log.push(`write:${(doc as { designRevision: number }).designRevision}`);
      },
    };
    return { repo, log };
  }

  test("Reihenfolge: lesen → alter Stand → schreiben → neuer Stand", async () => {
    const { repo, log } = fakeRepo();
    expect(await applySwitch(OLD, NEW as never, repo)).toEqual({ ok: true });
    expect(log).toEqual([
      "read",
      "latest",
      "insert:Stand vor Designsystem:2",
      "write:3",
      "insert:Designsystem umgestellt:3",
    ]);
  });

  test("jüngster Stand = alter Stand (andere Schlüsselreihenfolge) → kein doppelter Vorher-Stand", async () => {
    const { repo, log } = fakeRepo({
      latest: { businessName: "Alt", designRevision: 2 },
    });
    expect(await applySwitch(OLD, NEW as never, repo)).toEqual({ ok: true });
    expect(log).toEqual([
      "read",
      "latest",
      "write:3",
      "insert:Designsystem umgestellt:3",
    ]);
  });

  test("Dokument seit der Planung geändert → nichts geschrieben", async () => {
    const { repo, log } = fakeRepo({
      current: { ...OLD, businessName: "Neu" },
    });
    const r = await applySwitch(OLD, NEW as never, repo);
    expect(r).toMatchObject({ ok: false, written: false });
    expect(log).toEqual(["read"]);
  });

  test("Vorher-Stand nicht gespeichert → nichts geschrieben", async () => {
    const { repo, log } = fakeRepo({ failInsertAt: 1 });
    const r = await applySwitch(OLD, NEW as never, repo);
    expect(r).toMatchObject({ ok: false, written: false });
    expect(log.some(l => l.startsWith("write"))).toBe(false);
  });

  test("Nachher-Stand nicht gespeichert → gemeldet, Seite aber schon geschrieben", async () => {
    const { repo, log } = fakeRepo({ failInsertAt: 2 });
    const r = await applySwitch(OLD, NEW as never, repo);
    expect(r).toMatchObject({ ok: false, written: true });
    expect(log).toContain("write:3");
  });
});

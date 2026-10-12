import { describe, expect, test } from "vitest";
import { getFixture } from "../shared/siteContract/fixtures";
import type { WebsiteDataV2 } from "../shared/siteContract/types";
import { withDesignSystem } from "../shared/designSystems/apply";
import {
  DEFAULT_IDS_SPEC,
  changedKeys,
  countPhotos,
  forbiddenChanges,
  idsFromArgv,
  parseIdList,
  planSwitch,
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

  test("schon rev 3 → überspringen", () => {
    const plan = planSwitch(withDesignSystem(rev2("Restaurant"), "journal"));
    expect(plan).toMatchObject({ kind: "skip", reason: "schon rev 3" });
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

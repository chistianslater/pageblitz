import { describe, expect, test } from "vitest";
import { getFixture } from "../shared/siteContract/fixtures";
import { withDesignSystem } from "../shared/designSystems/apply";
import type { WebsiteDataV2 } from "../shared/siteContract/types";
import {
  LABEL_NACHHER,
  LABEL_VORHER,
  NO_TOWN,
  applyPalette,
  classify,
  isUnchanged,
  ownerChoiceReason,
  parseArgs,
  planDistribution,
  summarizeByTown,
  townOf,
  type PaletteRepo,
  type SiteInput,
} from "./palettenVerteilen";

/** Erfundener Salon (rev 3, Journal) in einem Ort. */
function salon(
  name: string,
  city: string | undefined,
  palette = "salbei",
  system: "journal" | "raster" = "journal"
): WebsiteDataV2 {
  const base = withDesignSystem(getFixture("werkbank", "full"), system, palette);
  const sections = base.sections.map(s =>
    s.type === "contact" ? { ...s, city } : s
  );
  if (!sections.some(s => s.type === "contact"))
    sections.push({ type: "contact", city } as never);
  return { ...base, businessName: name, sections } as WebsiteDataV2;
}
const site = (
  id: number,
  doc: unknown,
  versions: SiteInput["versions"] = []
): SiteInput => ({ id, doc, versions });

describe("townOf", () => {
  test("normalisiert Schreibweise, Leerraum und führende PLZ", () => {
    expect(townOf(salon("A", "  Bad   Honnef "))).toBe("bad honnef");
    expect(townOf(salon("A", "53604 Bad Honnef"))).toBe("bad honnef");
    expect(townOf(salon("A", "KÖLN"))).toBe("köln");
  });
  test("ohne Ort → Sammelgruppe", () => {
    expect(townOf(salon("A", undefined))).toBe(NO_TOWN);
    expect(townOf(salon("A", "   "))).toBe(NO_TOWN);
    expect(townOf(null)).toBe(NO_TOWN);
  });
});

describe("ownerChoiceReason", () => {
  test("Studio-Design und Wiederherstellung → Grund", () => {
    expect(
      ownerChoiceReason([{ trigger: "panel", label: "Design: Nacht · Petrol" }])
    ).toMatch(/Design/);
    expect(
      ownerChoiceReason([{ trigger: "panel", label: "Designrichtung: Ton" }])
    ).not.toBeNull();
    expect(
      ownerChoiceReason([
        { trigger: "restore", label: "Wiederhergestellt: Design: Klar · Sand" },
      ])
    ).not.toBeNull();
  });
  test("„Design angepasst“ (nur ausgeblendete Elemente) und dessen Undo zählen nicht", () => {
    expect(
      ownerChoiceReason([
        { trigger: "panel", label: "Design angepasst" },
        { trigger: "restore", label: "Rückgängig: Design angepasst" },
        { trigger: "restore", label: "Wiederhergestellt: Design angepasst" },
      ])
    ).toBeNull();
  });
  test("eigene Werkzeug-Labels und andere Änderungen zählen nicht", () => {
    expect(
      ownerChoiceReason([
        { trigger: "panel", label: "Designsystem umgestellt" },
        { trigger: "panel", label: "Stand vor Designsystem" },
        { trigger: "panel", label: LABEL_NACHHER },
        { trigger: "panel", label: LABEL_VORHER },
        { trigger: "panel", label: "Texte geändert" },
        { trigger: "generation", label: "Website erstellt" },
        { trigger: "chat", label: "Design wärmer" },
      ])
    ).toBeNull();
  });
  test("fremde Farbstimmungs-Änderung → Grund", () => {
    expect(
      ownerChoiceReason([{ trigger: "panel", label: "Farbstimmung: Ton" }])
    ).toMatch(/Farbstimmung/);
  });
});

describe("ownerChoiceReason nach der Systemumstellung", () => {
  const at = (min: number) => new Date(Date.UTC(2026, 9, 12, 10, min));
  const migration = {
    id: 5,
    trigger: "panel",
    label: "Designsystem umgestellt",
    createdAt: at(10),
  };
  test("Pack-Wahl vor der Umstellung zählt nicht", () => {
    expect(
      ownerChoiceReason([
        migration,
        { id: 3, trigger: "panel", label: "Designrichtung: Patina", createdAt: at(0) },
        { id: 4, trigger: "restore", label: "Rückgängig: Designrichtung: Patina", createdAt: at(5) },
      ])
    ).toBeNull();
  });
  test("Wahl nach der Umstellung zählt", () => {
    expect(
      ownerChoiceReason([
        migration,
        { id: 9, trigger: "panel", label: "Design: Nacht · Petrol", createdAt: at(30) },
      ])
    ).toMatch(/Nacht/);
    expect(
      ownerChoiceReason([
        { id: 9, trigger: "restore", label: "Wiederhergestellt: Design: Klar · Sand", createdAt: at(30) },
        migration,
      ])
    ).not.toBeNull();
  });
  test("gleicher Zeitpunkt: höhere ID ist neuer", () => {
    const same = at(10);
    expect(
      ownerChoiceReason([
        { ...migration, createdAt: same },
        { id: 4, trigger: "panel", label: "Designrichtung: Patina", createdAt: same },
      ])
    ).toBeNull();
    expect(
      ownerChoiceReason([
        { ...migration, createdAt: same },
        { id: 6, trigger: "panel", label: "Design: Nacht · Petrol", createdAt: same },
      ])
    ).not.toBeNull();
  });
  test("mehrere Umstellungen: die jüngste zählt", () => {
    expect(
      ownerChoiceReason([
        { id: 8, trigger: "panel", label: "Designsystem umgestellt", createdAt: at(40) },
        { id: 7, trigger: "panel", label: "Design: Nacht · Petrol", createdAt: at(20) },
        migration,
      ])
    ).toBeNull();
  });
  test("ohne Umstellung zählt jede Wahl, auch Pack-Labels", () => {
    expect(
      ownerChoiceReason([
        { id: 1, trigger: "panel", label: "Designrichtung: Patina", createdAt: at(0) },
      ])
    ).not.toBeNull();
  });
});

describe("classify", () => {
  test("rev 2 und Nicht-v2 werden ausgelassen", () => {
    const rev2 = { ...salon("A", "Köln"), designRevision: 2 };
    expect(classify(site(1, rev2)).kind).toBe("skip");
    expect(classify(site(2, { foo: 1 })).kind).toBe("skip");
  });
  test("Inhaber-Wahl wird ausgelassen", () => {
    const r = classify(
      site(1, salon("A", "Köln"), [{ trigger: "panel", label: "Design: Journal · Ton" }])
    );
    expect(r.kind).toBe("skip");
  });
});

describe("planDistribution", () => {
  const palettes = ["papier", "salbei", "ton"];

  test("gleicher Ort + System: reihum, nach ID, Nachbarn verschieden", () => {
    const rows = planDistribution([
      site(30, salon("C", "Köln")),
      site(10, salon("A", "köln")),
      site(20, salon("B", " Köln ")),
      site(40, salon("D", "Köln")),
    ]);
    const byId = Object.fromEntries(
      rows.map(r => [r.id, r.kind === "candidate" ? r.newPalette : "skip"])
    );
    expect(byId).toEqual({
      10: palettes[0],
      20: palettes[1],
      30: palettes[2],
      40: palettes[0],
    });
  });

  test("Orte sind unabhängig, Systeme getrennt", () => {
    const rows = planDistribution([
      site(1, salon("A", "Köln")),
      site(2, salon("B", "Bonn")),
      site(3, salon("C", "Köln", "salbei", "raster")),
    ]);
    const pal = (id: number) => {
      const r = rows.find(x => x.id === id)!;
      return r.kind === "candidate" ? r.newPalette : null;
    };
    expect(pal(1)).toBe(palettes[0]);
    expect(pal(2)).toBe(palettes[0]);
    expect(pal(3)).not.toBeNull();
  });

  test("deterministisch, unabhängig von der Eingabereihenfolge", () => {
    const input = [1, 2, 3, 4, 5].map(i => site(i, salon(`S${i}`, "Köln")));
    const a = planDistribution(input);
    const b = planDistribution([...input].reverse());
    expect(a.map(r => (r.kind === "candidate" ? r.newPalette : "-"))).toEqual(
      b.map(r => (r.kind === "candidate" ? r.newPalette : "-"))
    );
  });

  test("nur palette ändert sich, Rest des Dokuments identisch", () => {
    const doc = salon("A", "Köln", "ton");
    const [row] = planDistribution([site(1, doc)]);
    expect(row.kind).toBe("candidate");
    if (row.kind !== "candidate") return;
    expect(row.oldPalette).toBe("ton");
    expect({ ...row.next, palette: "ton" }).toEqual(doc);
    expect(isUnchanged(row)).toBe(false);
  });

  test("Inhaber-Seiten bleiben, die übrigen werden verteilt", () => {
    const rows = planDistribution([
      site(1, salon("A", "Köln"), [{ trigger: "panel", label: "Design: Journal · Ton" }]),
      site(2, salon("B", "Köln")),
    ]);
    expect(rows[0].kind).toBe("skip");
    expect(rows[1].kind === "candidate" && rows[1].newPalette).toBe(palettes[0]);
  });

  test("ausgelassene Seiten reservieren ihre Palette", () => {
    const owner = [{ trigger: "panel", label: "Design: Journal · Papier" }];
    const rows = planDistribution([
      site(1, salon("A", "Köln", "papier"), owner),
      site(2, salon("B", "Köln")),
      site(3, salon("C", "Köln")),
      site(4, salon("D", "Köln")),
    ]);
    const pal = (id: number) => {
      const r = rows.find(x => x.id === id)!;
      return r.kind === "candidate" ? r.newPalette : null;
    };
    // papier ist belegt → zuerst salbei und ton, dann (Gleichstand) papier.
    expect([pal(2), pal(3), pal(4)]).toEqual(["salbei", "ton", "papier"]);
  });

  test("Reservierung gilt nur im selben Ort und System", () => {
    const owner = [{ trigger: "panel", label: "Design: Journal · Papier" }];
    const rows = planDistribution([
      site(1, salon("A", "Bonn", "papier"), owner),
      site(2, salon("B", "Köln")),
    ]);
    const r = rows.find(x => x.id === 2)!;
    expect(r.kind === "candidate" && r.newPalette).toBe("papier");
  });

  test("Zusammenfassung je Ort", () => {
    const rows = planDistribution([
      site(1, salon("A", "Köln")),
      site(2, salon("B", "Köln")),
      site(3, salon("C", "Köln")),
      site(4, salon("D", "Köln")),
    ]);
    expect(summarizeByTown(rows)).toEqual([
      "köln · journal (4): papier 2, salbei 1, ton 1",
    ]);
  });
});

describe("parseArgs", () => {
  test("Standard und gültige Argumente", () => {
    expect(parseArgs([])).toEqual({ ids: null, schreiben: false });
    expect(parseArgs(["--schreiben", "--ids", "5-7"])).toEqual({
      ids: [5, 6, 7],
      schreiben: true,
    });
    expect(parseArgs(["--ids=9"]).ids).toEqual([9]);
  });
  test("Tippfehler brechen ab", () => {
    expect(() => parseArgs(["--id", "5"])).toThrow(/Unbekannt/);
    expect(() => parseArgs(["--ids"])).toThrow(/Liste/);
  });
});

describe("applyPalette", () => {
  function fakeRepo(current: unknown, latest: unknown | null) {
    const log: string[] = [];
    const repo: PaletteRepo = {
      readDoc: async () => current,
      latestVersionDoc: async () => latest,
      insertVersion: async v => {
        log.push(`version:${v.label}`);
        return 1;
      },
      writeDoc: async () => {
        log.push("write");
      },
    };
    return { repo, log };
  }
  const doc = salon("A", "Köln");
  const next = { ...doc, palette: "ton" } as WebsiteDataV2;

  test("Reihenfolge vorher → schreiben → nachher", async () => {
    const { repo, log } = fakeRepo(doc, null);
    expect(await applyPalette(doc, next, repo)).toEqual({ ok: true });
    expect(log).toEqual([`version:${LABEL_VORHER}`, "write", `version:${LABEL_NACHHER}`]);
  });
  test("jüngster Stand schon gleich → kein Vorher-Eintrag", async () => {
    const { repo, log } = fakeRepo(doc, doc);
    await applyPalette(doc, next, repo);
    expect(log).toEqual(["write", `version:${LABEL_NACHHER}`]);
  });
  test("geändert seit Planung → nichts geschrieben", async () => {
    const { repo, log } = fakeRepo({ ...doc, businessName: "X" }, null);
    const r = await applyPalette(doc, next, repo);
    expect(r.ok).toBe(false);
    expect(log).toEqual([]);
  });
});

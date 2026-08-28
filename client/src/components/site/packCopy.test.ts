import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BANNED_PACK_PHRASES } from "./packCopy";

const PACK_IDS = [
  "atelier",
  "fundament",
  "gusto",
  "kanzlei",
  "klarwerk",
  "landgut",
  "marktplatz",
  "morgenlicht",
  "patina",
  "salon-noir",
  "schimmer",
  "verve",
  "werkbank",
  "zunft",
] as const;

const here = dirname(fileURLToPath(import.meta.url));

describe("Pack-Layouts ohne branchenfremde Hartverdrahtung", () => {
  test("kein Pack-Quelltext behauptet eine Branche, die der Betrieb nicht hat", () => {
    const hits: string[] = [];
    for (const id of PACK_IDS) {
      const source = readFileSync(join(here, "packs", id, "index.tsx"), "utf8");
      for (const phrase of BANNED_PACK_PHRASES) {
        if (source.includes(phrase)) {
          hits.push(`${id}: „${phrase}"`);
        }
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});

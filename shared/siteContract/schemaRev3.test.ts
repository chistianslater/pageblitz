import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "./schema";
import { getFixture } from "./fixtures";

const base = getFixture("salon-noir", "full");

describe("Seitenvertrag rev 3", () => {
  test("akzeptiert rev 3 mit System und Palette", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "journal", palette: "papier",
    });
    expect(r.success).toBe(true);
  });
  test("lehnt unbekanntes System ab", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "barock", palette: "papier",
    });
    expect(r.success).toBe(false);
  });
  test("lehnt Palette mit Sonderzeichen ab", () => {
    const r = WebsiteDataV2Schema.safeParse({
      ...base, designRevision: 3, system: "journal", palette: "x;color:red",
    });
    expect(r.success).toBe(false);
  });
  test("rev 3 ohne System ist ungültig", () => {
    expect(WebsiteDataV2Schema.safeParse({ ...base, designRevision: 3 }).success).toBe(false);
  });
  test("System ohne rev 3 ist ungültig", () => {
    expect(
      WebsiteDataV2Schema.safeParse({ ...base, designRevision: 2, system: "journal" }).success
    ).toBe(false);
  });
});

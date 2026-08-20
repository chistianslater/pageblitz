import { describe, expect, test } from "vitest";
import { WebsiteDataV2Schema } from "./schema";
import { getFixture } from "./fixtures";

describe("fixtures", () => {
  test("werkbank-full validiert gegen Schema und hat alle Kern-Sektionen", () => {
    const d = WebsiteDataV2Schema.parse(getFixture("werkbank", "full"));
    const types = d.sections.map((s) => s.type);
    for (const t of ["hero", "services", "about", "testimonials", "contact"]) {
      expect(types).toContain(t);
    }
  });
  test("werkbank-minimal hat nur hero, services, contact", () => {
    const d = WebsiteDataV2Schema.parse(getFixture("werkbank", "minimal"));
    expect(d.sections.map((s) => s.type).sort()).toEqual(["contact", "hero", "services"]);
  });
  test("Pack ohne Fixture wirft", () => {
    // absichtlich ungültige ID, damit der Test auch nach Plan B/C stabil bleibt
    expect(() => getFixture("nicht-existent" as never, "full")).toThrow(/Fixture fehlt/);
  });
});

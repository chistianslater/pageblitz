import { describe, expect, test, vi } from "vitest";
import { getFixture } from "../../shared/siteContract/fixtures";
import { withArtDirection } from "../../shared/stylePacks/artDirection";

const friseurDoc = () =>
  withArtDirection({
    ...getFixture("salon-noir", "full"),
    blueprintFamily: "beauty",
    businessCategory: "Friseursalon",
    businessName: "Salon Lindner",
  });
const tischlerDoc = () =>
  withArtDirection({
    ...getFixture("werkbank", "full"),
    blueprintFamily: "trade",
    businessCategory: "Tischlerei",
    businessName: "Tischlerei Klähn",
  });

describe("withPrimarySystem", () => {
  test("ohne Freischaltung bleibt rev 2", async () => {
    vi.resetModules();
    vi.doMock("../../shared/designSystems/registry", async orig => ({
      ...(await orig<object>()),
      isReleased: () => false,
    }));
    const { withPrimarySystem } = await import("../../shared/designSystems/apply");
    expect(withPrimarySystem(friseurDoc()).designRevision).toBe(2);
    vi.doUnmock("../../shared/designSystems/registry");
    vi.resetModules();
  });

  test("ohne Mock: Friseur wird Journal, Handwerk Werkstoff", async () => {
    const { withPrimarySystem } = await import("../../shared/designSystems/apply");
    const friseur = withPrimarySystem(friseurDoc());
    expect(friseur.system).toBe("journal");
    expect(friseur.designRevision).toBe(3);
    expect(withPrimarySystem(tischlerDoc()).system).toBe("werkstoff");
  });

  test("mit Freischaltung: Friseur wird Journal, Handwerk bleibt rev 2", async () => {
    vi.resetModules();
    vi.doMock("../../shared/designSystems/registry", async orig => ({
      ...(await orig<object>()),
      isReleased: (id: string) => id === "journal",
    }));
    const { withPrimarySystem } = await import("../../shared/designSystems/apply");
    const friseur = withPrimarySystem(friseurDoc());
    expect(friseur.system).toBe("journal");
    expect(friseur.designRevision).toBe(3);
    expect(withPrimarySystem(tischlerDoc()).designRevision).toBe(2);
    vi.doUnmock("../../shared/designSystems/registry");
    vi.resetModules();
  });
});

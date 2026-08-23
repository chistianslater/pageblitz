import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  CUSTOMER_SITE_DOMAIN,
  ensureUmamiWebsite,
  umamiSiteName,
  type UmamiProvisionDeps,
} from "./umamiProvisioning";

const v2Doc = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Schreinerei Brandt",
  seo: { title: "t", description: "d" },
  sections: [{ type: "hero", headline: "H" }],
};

function makeDeps(
  website: Record<string, unknown> | undefined,
  overrides: Partial<UmamiProvisionDeps> = {}
): UmamiProvisionDeps {
  return {
    getWebsiteById: vi.fn().mockResolvedValue(website) as any,
    updateWebsite: vi.fn().mockResolvedValue(undefined) as any,
    registerUmamiWebsite: vi.fn().mockResolvedValue("umami-new"),
    invalidateSsrCache: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("umamiSiteName", () => {
  test("nimmt den businessName des v2-Dokuments, sonst den Slug", () => {
    expect(umamiSiteName({ slug: "brandt", websiteData: v2Doc })).toBe(
      "Schreinerei Brandt"
    );
    expect(umamiSiteName({ slug: "brandt", websiteData: null })).toBe("brandt");
    expect(
      umamiSiteName({ slug: "brandt", websiteData: { businessName: "  " } })
    ).toBe("brandt");
  });
});

describe("ensureUmamiWebsite (Plan B6 Task 7)", () => {
  test("ohne ID: registriert (Name + <slug>.pageblitz.de), schreibt umamiWebsiteId, invalidiert SSR-Cache", async () => {
    const deps = makeDeps({
      id: 42,
      slug: "brandt",
      websiteData: v2Doc,
      umamiWebsiteId: null,
    });

    const id = await ensureUmamiWebsite(42, deps);

    expect(id).toBe("umami-new");
    expect(CUSTOMER_SITE_DOMAIN).toBe("pageblitz.de");
    expect(deps.registerUmamiWebsite).toHaveBeenCalledWith(
      "Schreinerei Brandt",
      "brandt.pageblitz.de"
    );
    expect(deps.updateWebsite).toHaveBeenCalledWith(42, {
      umamiWebsiteId: "umami-new",
    });
    expect(deps.invalidateSsrCache).toHaveBeenCalledWith("brandt");
  });

  test("idempotent: vorhandene ID → keine Registrierung, kein Write, liefert die ID", async () => {
    const deps = makeDeps({
      id: 42,
      slug: "brandt",
      websiteData: v2Doc,
      umamiWebsiteId: "umami-existing",
    });

    const id = await ensureUmamiWebsite(42, deps);

    expect(id).toBe("umami-existing");
    expect(deps.registerUmamiWebsite).not.toHaveBeenCalled();
    expect(deps.updateWebsite).not.toHaveBeenCalled();
    expect(deps.invalidateSsrCache).not.toHaveBeenCalled();
  });

  test("Registrierung liefert null (nicht konfiguriert/Fehler) → null, kein Write, kein Throw", async () => {
    const deps = makeDeps(
      { id: 42, slug: "brandt", websiteData: v2Doc, umamiWebsiteId: null },
      { registerUmamiWebsite: vi.fn().mockResolvedValue(null) }
    );

    await expect(ensureUmamiWebsite(42, deps)).resolves.toBeNull();
    expect(deps.updateWebsite).not.toHaveBeenCalled();
  });

  test("Registrierung wirft → null, Warnung, kein Throw (Aktivierung läuft weiter)", async () => {
    const deps = makeDeps(
      { id: 42, slug: "brandt", websiteData: v2Doc, umamiWebsiteId: null },
      { registerUmamiWebsite: vi.fn().mockRejectedValue(new Error("boom")) }
    );

    await expect(ensureUmamiWebsite(42, deps)).resolves.toBeNull();
    expect(deps.updateWebsite).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  test("DB-Write wirft → null, kein Throw", async () => {
    const deps = makeDeps(
      { id: 42, slug: "brandt", websiteData: v2Doc, umamiWebsiteId: null },
      { updateWebsite: vi.fn().mockRejectedValue(new Error("db down")) as any }
    );

    await expect(ensureUmamiWebsite(42, deps)).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  test("unbekannte Website → null, keine Registrierung", async () => {
    const deps = makeDeps(undefined);
    await expect(ensureUmamiWebsite(999, deps)).resolves.toBeNull();
    expect(deps.registerUmamiWebsite).not.toHaveBeenCalled();
  });
});

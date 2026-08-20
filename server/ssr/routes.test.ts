import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Mock } from "vitest";
import express, { type Express } from "express";
import request from "supertest";
import { getFixture } from "../../shared/siteContract/fixtures";

vi.mock("../db", () => ({
  getWebsiteBySlug: vi.fn(),
}));

// Import nach vi.mock, damit der Mock vor dem ersten Aufruf von registerSsrRoutes greift.
import { registerSsrRoutes } from "./routes";
import { getWebsiteBySlug } from "../db";

/** App mit SSR-Routen + einem SPA-Fallback-Stand-in (statt echter Vite-/serveStatic-Middleware). */
function buildAppWithFallback(): Express {
  const app = express();
  registerSsrRoutes(app);
  app.use((_req, res) => {
    res.status(404).send("SPA-Fallback");
  });
  return app;
}

describe("SSR routes", () => {
  test("dev-preview liefert HTML für werkbank/full", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get(
      "/dev/site-preview?pack=werkbank&fixture=full"
    );
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="leistungen"');
  });
  test("unbekanntes Pack → 400 mit Meldung", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get(
      "/dev/site-preview?pack=disco&fixture=full"
    );
    expect(res.status).toBe(400);
  });

  describe("Kundenseiten-Middleware (/site/:slug)", () => {
    const originalSsrSites = process.env.SSR_SITES;

    beforeEach(() => {
      (getWebsiteBySlug as Mock).mockReset();
      delete process.env.SSR_SITES;
    });

    afterEach(() => {
      if (originalSsrSites === undefined) {
        delete process.env.SSR_SITES;
      } else {
        process.env.SSR_SITES = originalSsrSites;
      }
    });

    test("v2-Dokument (Mock von getWebsiteBySlug) → 200 mit gerendertem HTML", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res = await request(app).get("/site/schreinerei-brandt-dortmund");

      expect(res.status).toBe(200);
      expect(res.text).toContain('id="leistungen"');
    });

    test("SSR_SITES=off → Middleware ruft next(), SPA-Fallback antwortet", async () => {
      process.env.SSR_SITES = "off";
      (getWebsiteBySlug as Mock).mockResolvedValue({
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res = await request(app).get("/site/schreinerei-brandt-dortmund");

      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
      expect(getWebsiteBySlug).not.toHaveBeenCalled();
    });

    test("v1-Dokument ohne version:2 → next(), SPA-Fallback antwortet", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        websiteData: { businessName: "Alt" },
      });

      const app = buildAppWithFallback();
      const res = await request(app).get("/site/alte-website");

      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
    });

    test("unbekannter Slug (Mock liefert undefined) → next(), SPA-Fallback antwortet", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue(undefined);

      const app = buildAppWithFallback();
      const res = await request(app).get("/site/nicht-vorhanden");

      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
    });
  });
});

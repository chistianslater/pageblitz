import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Mock } from "vitest";
import express, { type Express } from "express";
import request from "supertest";
import { getFixture } from "../../shared/siteContract/fixtures";

vi.mock("../db", () => ({
  getWebsiteBySlug: vi.fn(),
  getWebsiteByToken: vi.fn(),
}));

// Import nach vi.mock, damit der Mock vor dem ersten Aufruf von registerSsrRoutes greift.
import { registerSsrRoutes } from "./routes";
import { getWebsiteBySlug, getWebsiteByToken } from "../db";

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

    test("unbekannter Pfad auf v2-Site (/irgendwas) → next(), SPA-Fallback antwortet, NICHT 200-SSR", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res = await request(app).get(
        "/site/schreinerei-brandt-dortmund/irgendwas"
      );

      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
    });

    test("/impressum ohne legal-Inhalt → Status 404 mit 'nicht gefunden'-Text", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res = await request(app).get(
        "/site/schreinerei-brandt-dortmund/impressum"
      );

      expect(res.status).toBe(404);
      expect(res.text).toContain("nicht gefunden");
    });

    test("/site/:slug-Request rendert Footer-Links mit /site/<slug>-Präfix (basePath)", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res = await request(app).get("/site/schreinerei-brandt-dortmund");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        'href="/site/schreinerei-brandt-dortmund/impressum"'
      );
      expect(res.text).toContain(
        'href="/site/schreinerei-brandt-dortmund/datenschutz"'
      );
    });

    test("/site/FOO (uppercase) und /site/foo treffen denselben Cache-Eintrag — zweiter Request löst keinen weiteren DB-Call aus", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res1 = await request(app).get("/site/FOO");
      const res2 = await request(app).get("/site/foo");

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(getWebsiteBySlug).toHaveBeenCalledTimes(1);
      expect(getWebsiteBySlug).toHaveBeenCalledWith("foo");
    });

    test("Negative-Cache: unbekannter Slug zweimal angefragt → getWebsiteBySlug nur einmal aufgerufen", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue(undefined);

      const app = buildAppWithFallback();
      await request(app).get("/site/nicht-vorhanden-2");
      await request(app).get("/site/nicht-vorhanden-2");

      expect(getWebsiteBySlug).toHaveBeenCalledTimes(1);
    });
  });

  describe("preview-ssr per Token", () => {
    beforeEach(() => {
      (getWebsiteByToken as Mock).mockReset();
    });

    test("unbekannter Token → 404", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue(undefined);
      const res = await request(buildAppWithFallback()).get(
        "/preview-ssr/abcdefghabcdefgh"
      );
      expect(res.status).toBe(404);
    });

    test("v2-Dokument → 200 HTML, noindex, no-store; Rechtsseiten laufen über basePath", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      const app = buildAppWithFallback();
      const res = await request(app).get("/preview-ssr/abcdefghabcdefgh");
      expect(res.status).toBe(200);
      expect(res.headers["x-robots-tag"]).toContain("noindex");
      expect(res.headers["cache-control"]).toContain("no-store");
      expect(res.text).toContain(
        'href="/preview-ssr/abcdefghabcdefgh/impressum"'
      );
      const legal = await request(app).get(
        "/preview-ssr/abcdefghabcdefgh/impressum"
      );
      expect(legal.status).toBe(404);
    });

    test("?pack=kanzlei rendert die Inhalte im anderen Pack, ohne zu persistieren", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      const res = await request(buildAppWithFallback()).get(
        "/preview-ssr/abcdefghabcdefgh?pack=kanzlei"
      );
      expect(res.status).toBe(200);
      expect(res.text).toContain('class="pb-kanzlei');
    });

    test("v1-Dokument → 404, unbekanntes pack → 400", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: { hero: {} },
      });
      expect(
        (
          await request(buildAppWithFallback()).get(
            "/preview-ssr/abcdefghabcdefgh"
          )
        ).status
      ).toBe(404);
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      expect(
        (
          await request(buildAppWithFallback()).get(
            "/preview-ssr/abcdefghabcdefgh?pack=disco"
          )
        ).status
      ).toBe(400);
    });
  });
});

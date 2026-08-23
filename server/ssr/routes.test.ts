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

/**
 * App mit SSR-Routen + einem Fallback, der (anders als `buildAppWithFallback`)
 * 200 statt 404 liefert — macht "die Route hat gar nicht erst gematcht und
 * die Anfrage ist bei der nachfolgenden Middleware gelandet" von "die Route
 * hat gematcht und selbst 404 geliefert" eindeutig unterscheidbar (beide
 * Fälle wären mit einem 404-Fallback nicht zu unterscheiden).
 */
function buildAppWithOkFallback(): Express {
  const app = express();
  registerSsrRoutes(app);
  app.use((_req, res) => {
    res.status(200).send("OK-Fallback");
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
  test("dev-preview reicht eine feste Demo-Begrüßung an die Chat-Insel durch (fixture=features)", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get(
      "/dev/site-preview?pack=werkbank&fixture=features"
    );
    expect(res.status).toBe(200);
    expect(res.text).toContain('data-welcome="Willkommen in der Demo!"');
  });

  test("unbekanntes Pack → 400 mit Meldung", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get(
      "/dev/site-preview?pack=disco&fixture=full"
    );
    expect(res.status).toBe(400);
  });

  test("unbekanntes Pack (Sonderzeichen) → 400-Body reflektiert den Parameter NICHT (kein reflected XSS)", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get(
      "/dev/site-preview?pack=%3Cscript%3E&fixture=full"
    );
    expect(res.status).toBe(400);
    expect(res.text).not.toContain("<script");
  });

  describe("GET /demo/:pack", () => {
    test("gültiges Pack → 200, noindex, 1h-Cache, enthält den Fixture-Business-Namen", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/werkbank");
      const fixture = getFixture("werkbank", "full");

      expect(res.status).toBe(200);
      expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
      expect(res.headers["cache-control"]).toContain("public");
      expect(res.headers["cache-control"]).toContain("max-age=3600");
      expect(res.text).toContain(fixture.businessName);
    });

    test("unbekanntes Pack → 404", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/disco");
      expect(res.status).toBe(404);
    });

    test("unbekanntes Pack → 404-Body reflektiert den Parameter NICHT (kein reflected XSS, generische Meldung)", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/disco");
      expect(res.status).toBe(404);
      expect(res.text).toBe("Unbekanntes Pack");
      expect(res.text).not.toContain("disco");
    });

    test("GET /demo/%3Cscript%3E → 404, Body enthält kein <script (weder über Routing- noch über Handler-Ebene reflektiert)", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/%3Cscript%3E");
      expect(res.status).toBe(404);
      expect(res.text).not.toContain("<script");
    });

    test("Rechtsseiten unter /demo/:pack/impressum|datenschutz → 200, noindex/nofollow, 1h-Cache, enthält den Seitentitel", async () => {
      const app = buildAppWithFallback();
      const impressum = await request(app).get("/demo/werkbank/impressum");
      expect(impressum.status).toBe(200);
      expect(impressum.headers["x-robots-tag"]).toBe("noindex, nofollow");
      expect(impressum.headers["cache-control"]).toContain("public");
      expect(impressum.headers["cache-control"]).toContain("max-age=3600");
      expect(impressum.text).toContain("Impressum");

      const datenschutz = await request(app).get("/demo/werkbank/datenschutz");
      expect(datenschutz.status).toBe(200);
      expect(datenschutz.headers["x-robots-tag"]).toBe("noindex, nofollow");
      expect(datenschutz.text).toContain("Datenschutz");
    });

    test("/demo/:pack/<unbekannte Unterseite> matcht keine Route → SPA-Fallback (404)", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/werkbank/foo");
      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
    });

    test("/demo/<unbekanntes Pack>/impressum → 404, Body reflektiert den Parameter NICHT", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/disco/impressum");
      expect(res.status).toBe(404);
      expect(res.text).toBe("Unbekanntes Pack");
      expect(res.text).not.toContain("disco");
    });

    test("statische Fixture-Assets unter /demo/* (z. B. .svg) matchen die Route nicht — fallen auf die nachfolgende Middleware durch (Regressionsfund: client/public/demo/*.svg wurde vorher von dieser Route abgefangen)", async () => {
      const app = buildAppWithOkFallback();
      const res = await request(app).get("/demo/werkbank-hero.svg");
      expect(res.status).toBe(200);
      expect(res.text).toBe("OK-Fallback");
    });

    test("Pack-Segment mit Großbuchstaben matcht die Route (Express-Routing ist standardmäßig case-insensitive), scheitert aber an isKnownPackId → sichere generische 404", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/Werkbank");
      expect(res.status).toBe(404);
      expect(res.text).toBe("Unbekanntes Pack");
    });

    test("kein DB-Zugriff (Fixture statt echter Website)", async () => {
      (getWebsiteBySlug as Mock).mockReset();
      const app = buildAppWithFallback();
      await request(app).get("/demo/kanzlei");
      expect(getWebsiteBySlug).not.toHaveBeenCalled();
    });
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

    test("unbekannter Pfad auf v2-Site (/irgendwas) → eigenes SSR-404 (nicht SPA-Fallback), NICHT 200-SSR der Startseite", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "schreinerei-brandt-dortmund",
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res = await request(app).get(
        "/site/schreinerei-brandt-dortmund/irgendwas"
      );

      expect(res.status).toBe(404);
      expect(res.text).not.toBe("SPA-Fallback");
      expect(res.type).toBe("text/html");
      expect(res.headers["x-robots-tag"]).toContain("noindex");
      expect(res.text).toContain("Schreinerei Brandt");
      expect(res.text).not.toContain('id="leistungen"');
    });

    test("unbekannter Pfad auf v2-Site: zweiter Request auf denselben Pfad kommt aus dem Cache, Header bleibt erhalten", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "brandt-404-cache-check",
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res1 = await request(app).get(
        "/site/brandt-404-cache-check/irgendwas"
      );
      const res2 = await request(app).get(
        "/site/brandt-404-cache-check/irgendwas"
      );

      expect(res1.status).toBe(404);
      expect(res2.status).toBe(404);
      expect(res2.headers["x-robots-tag"]).toContain("noindex");
      expect(getWebsiteBySlug).toHaveBeenCalledTimes(1);
    });

    test("Asset-artiger Pfad (Dateiendung) unter v2-Site → next(), SPA-Fallback, kein DB-Zugriff", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get(
        "/site/brandt-404-asset-check/favicon.ico"
      );

      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
      expect(getWebsiteBySlug).not.toHaveBeenCalled();
    });

    test("/impressum mit legal-Inhalt bleibt weiterhin 200 (Regression zum neuen 404-Zweig)", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "brandt-impressum-mit-inhalt",
        websiteData: {
          ...getFixture("werkbank", "full"),
          legal: { impressumHtml: "<p>Firma XY, Musterstraße 1</p>" },
        },
      });

      const app = buildAppWithFallback();
      const res = await request(app).get(
        "/site/brandt-impressum-mit-inhalt/impressum"
      );

      expect(res.status).toBe(200);
      expect(res.text).toContain("<p>Firma XY, Musterstraße 1</p>");
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

    test("website.chatWelcomeMessage landet als data-welcome-Attribut im gerenderten HTML (Fixture features)", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "brandt",
        chatWelcomeMessage: "Hallo bei Brandt!",
        websiteData: getFixture("werkbank", "features"),
      });

      const app = buildAppWithFallback();
      const res = await request(app).get("/site/brandt");

      expect(res.status).toBe(200);
      expect(res.text).toContain('data-welcome="Hallo bei Brandt!"');
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

    test("v2-Dokument → 200 HTML, noindex, no-store; Rechtsseiten mit Inhalt laufen über basePath", async () => {
      // Fixture with legal content override
      const fixtureWithLegal = {
        ...getFixture("werkbank", "full"),
        legal: {
          impressumHtml: "<p>Impressum-Test-Inhalt</p>",
        },
      };
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: fixtureWithLegal,
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
      expect(legal.status).toBe(200);
      expect(legal.text).toContain("Impressum-Test-Inhalt");
      expect(legal.headers["x-robots-tag"]).toContain("noindex");
      expect(legal.headers["cache-control"]).toContain("no-store");
    });

    test("website.chatWelcomeMessage landet als data-welcome-Attribut im gerenderten HTML (Fixture features)", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        chatWelcomeMessage: "Willkommen in der Vorschau!",
        websiteData: getFixture("werkbank", "features"),
      });
      const app = buildAppWithFallback();
      const res = await request(app).get("/preview-ssr/abcdefghabcdefgh");
      expect(res.status).toBe(200);
      expect(res.text).toContain('data-welcome="Willkommen in der Vorschau!"');
    });

    test("Rechtsseite ohne Inhalt → 404", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      const app = buildAppWithFallback();
      const res = await request(app).get(
        "/preview-ssr/abcdefghabcdefgh/impressum"
      );
      expect(res.status).toBe(404);
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

    test("unbekanntes ?pack → 400-Body reflektiert den Parameter NICHT (kein reflected XSS)", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      const res = await request(buildAppWithFallback()).get(
        "/preview-ssr/abcdefghabcdefgh?pack=%3Cscript%3E"
      );
      expect(res.status).toBe(400);
      expect(res.text).not.toContain("<script");
    });
  });

  describe("GET /preview/:token (Legacy-Redirect ins Studio)", () => {
    test("gültiger Token → 302 auf /onboarding/<token>", async () => {
      const res = await request(buildAppWithFallback()).get(
        "/preview/abcdefghabcdefgh"
      );
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/onboarding/abcdefghabcdefgh");
    });

    test("zu kurzer Token (< 16 Zeichen) → kein Redirect, SPA-Fallback", async () => {
      const res = await request(buildAppWithFallback()).get(
        "/preview/kurzertoken"
      );
      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
    });

    test("Token mit Sonderzeichen → kein Redirect, SPA-Fallback", async () => {
      const res = await request(buildAppWithFallback()).get(
        "/preview/abcdefgh%3Cscript%3E"
      );
      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
    });

    test("/preview/:token/onboarding matcht diese Route nicht (bleibt SPA-seitig)", async () => {
      const res = await request(buildAppWithFallback()).get(
        "/preview/abcdefghabcdefgh/onboarding"
      );
      expect(res.status).toBe(404);
      expect(res.text).toBe("SPA-Fallback");
    });
  });
});

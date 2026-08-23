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
import { invalidateSsrCache, registerSsrRoutes } from "./routes";
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

    // Seit Plan B6 (Task 3) matcht /demo/:pack/:page([a-z0-9-]+) auch
    // unbekannte Unterseiten (handleDemoPageRoute) — die Route antwortet
    // jetzt selbst mit einem generischen 404 statt next()/SPA-Fallback (vor
    // Task 3 gab es für dieses Pfadmuster gar keine Route).
    test("/demo/:pack/<unbekannte Unterseite> → eigenes 404, Parameter nicht reflektiert", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/werkbank/foo");
      expect(res.status).toBe(404);
      expect(res.text).toBe("Unbekannte Seite");
      expect(res.text).not.toContain("foo");
    });

    test("/demo/<unbekanntes Pack>/impressum → 404, Body reflektiert den Parameter NICHT", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/disco/impressum");
      expect(res.status).toBe(404);
      expect(res.text).toBe("Unbekanntes Pack");
      expect(res.text).not.toContain("disco");
    });

    test("statische Fixture-Assets unter /demo/* (z. B. .svg) matchen die Route nicht — fallen auf die nachfolgende Middleware durch (Regressionsfund: client/public/demo/*.webp wurde vorher von dieser Route abgefangen)", async () => {
      const app = buildAppWithOkFallback();
      const res = await request(app).get("/demo/werkbank-hero.webp");
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

    describe("Demo-Unterseite /demo/:pack/:page (Plan B6, Task 3)", () => {
      test("bekannte Fixture-Page → 200, noindex, 1h-Cache, enthält den Page-Titel", async () => {
        const app = buildAppWithFallback();
        const res = await request(app).get(
          "/demo/werkbank/leistungen-im-detail"
        );
        expect(res.status).toBe(200);
        expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
        expect(res.headers["cache-control"]).toBe("public, max-age=3600");
        expect(res.text).toContain("Leistungen im Detail");
      });

      test("unbekannte Page → 404, Body reflektiert den Parameter NICHT", async () => {
        const app = buildAppWithFallback();
        const res = await request(app).get("/demo/werkbank/%3Cscript%3E");
        expect(res.status).toBe(404);
        expect(res.text).not.toContain("<script");
      });

      test("unbekanntes Pack → 404, Body reflektiert den Parameter NICHT", async () => {
        const app = buildAppWithFallback();
        const res = await request(app).get("/demo/disco/leistungen-im-detail");
        expect(res.status).toBe(404);
        expect(res.text).toBe("Unbekanntes Pack");
        expect(res.text).not.toContain("disco");
      });

      test("Legal-Segmente (impressum/datenschutz) laufen weiterhin über handleDemoLegalRoute, nicht über die Page-Route", async () => {
        const app = buildAppWithFallback();
        const res = await request(app).get("/demo/werkbank/impressum");
        expect(res.status).toBe(200);
        expect(res.text).toContain("Impressum");
        expect(res.text).not.toContain("Leistungen im Detail");
      });

      test("kein DB-Zugriff (Fixture statt echter Website)", async () => {
        (getWebsiteBySlug as Mock).mockReset();
        const app = buildAppWithFallback();
        await request(app).get("/demo/werkbank/leistungen-im-detail");
        expect(getWebsiteBySlug).not.toHaveBeenCalled();
      });
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

    test("Umami-Script nur bei status active UND umamiWebsiteId (Plan B6 Task 7)", async () => {
      invalidateSsrCache("schreinerei-brandt-dortmund");
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "schreinerei-brandt-dortmund",
        status: "active",
        umamiWebsiteId: "umami-uuid-1",
        websiteData: getFixture("werkbank", "full"),
      });
      const app = buildAppWithFallback();
      const active = await request(app).get(
        "/site/schreinerei-brandt-dortmund"
      );
      expect(active.status).toBe(200);
      expect(active.text).toContain('data-website-id="umami-uuid-1"');
      expect(active.text).toMatch(/<script defer src="[^"]+script\.js"/);

      invalidateSsrCache("schreinerei-brandt-dortmund");
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "schreinerei-brandt-dortmund",
        status: "sold",
        umamiWebsiteId: "umami-uuid-1",
        websiteData: getFixture("werkbank", "full"),
      });
      const sold = await request(app).get("/site/schreinerei-brandt-dortmund");
      expect(sold.status).toBe(200);
      expect(sold.text).not.toContain("data-website-id");

      invalidateSsrCache("schreinerei-brandt-dortmund");
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "schreinerei-brandt-dortmund",
        status: "active",
        umamiWebsiteId: null,
        websiteData: getFixture("werkbank", "full"),
      });
      const noId = await request(app).get("/site/schreinerei-brandt-dortmund");
      expect(noId.status).toBe(200);
      expect(noId.text).not.toContain("data-website-id");
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

    test("404-Cache ist je Slug (nicht je Pfad) und wird von invalidateSsrCache() geleert", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "brandt-404-invalidate",
        websiteData: getFixture("werkbank", "full"),
      });
      const app = buildAppWithFallback();
      await request(app).get("/site/brandt-404-invalidate/pfad-a");
      const resB = await request(app).get("/site/brandt-404-invalidate/pfad-b");
      expect(resB.status).toBe(404);
      // zweiter Fantasiepfad kommt aus demselben Slug-Eintrag → kein neuer DB-Zugriff
      expect(getWebsiteBySlug).toHaveBeenCalledTimes(1);

      invalidateSsrCache("brandt-404-invalidate");
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "brandt-404-invalidate",
        websiteData: {
          ...getFixture("werkbank", "full"),
          businessName: "Neuer Name GmbH",
        },
      });
      const resC = await request(app).get("/site/brandt-404-invalidate/pfad-a");
      expect(resC.status).toBe(404);
      expect(resC.text).toContain("Neuer Name GmbH");
      expect(getWebsiteBySlug).toHaveBeenCalledTimes(2);
    });

    test("geteilter 404-Cache liefert NIE eine existierende, noch nicht gerenderte Unterseite als 404 (Final-Review B6 Task 3)", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "brandt-404-vs-page",
        websiteData: getFixture("werkbank", "full"),
      });
      const app = buildAppWithFallback();
      // 1) Tippfehler-Pfad → 404 (geteilter Slug-Eintrag wird befüllt)
      const typo = await request(app).get("/site/brandt-404-vs-page/tippfehler-pfad");
      expect(typo.status).toBe(404);
      // 2) echte Unterseite, noch nie gerendert → MUSS 200 + Page-Inhalt liefern
      const page = await request(app).get("/site/brandt-404-vs-page/leistungen-im-detail");
      expect(page.status).toBe(200);
      expect(page.text).toContain("Leistungen im Detail");
      // 3) weiterer Tippfehler → 404 aus dem Cache, kein neuer DB-Zugriff nötig
      const calls = (getWebsiteBySlug as Mock).mock.calls.length;
      const typo2 = await request(app).get("/site/brandt-404-vs-page/noch-ein-tippfehler");
      expect(typo2.status).toBe(404);
      expect((getWebsiteBySlug as Mock).mock.calls.length).toBe(calls);
    });

    describe("Unterseiten (pages[], Plan B6 Task 3)", () => {
      test("bekannte Unterseite (/site/:slug/<page-slug>) → 200, Page-SEO im <head>, Canonical auf den Page-Pfad", async () => {
        const fixture = getFixture("werkbank", "full");
        const page = fixture.pages![0];
        (getWebsiteBySlug as Mock).mockResolvedValue({
          slug: "brandt-page",
          websiteData: fixture,
        });
        const app = buildAppWithFallback();
        const res = await request(app).get(`/site/brandt-page/${page.slug}`);
        expect(res.status).toBe(200);
        expect(res.text).toContain(`<title>${page.seo.title}</title>`);
        expect(res.text).toContain(`rel="canonical" href="`);
        expect(res.text).toMatch(
          new RegExp(`rel="canonical" href="[^"]*/${page.slug}"`)
        );
      });

      test("Startseite und Unterseite cachen getrennt (eigener Cache-Key je Pfad) — je Pfad nur EIN DB-Call", async () => {
        const fixture = getFixture("werkbank", "full");
        const page = fixture.pages![0];
        (getWebsiteBySlug as Mock).mockResolvedValue({
          slug: "brandt-page-cache",
          websiteData: fixture,
        });
        const app = buildAppWithFallback();
        const home = await request(app).get("/site/brandt-page-cache");
        const page1 = await request(app).get(
          `/site/brandt-page-cache/${page.slug}`
        );
        const page2 = await request(app).get(
          `/site/brandt-page-cache/${page.slug}`
        );
        expect(home.status).toBe(200);
        expect(page1.status).toBe(200);
        expect(page2.status).toBe(200);
        // 1x Startseite + 1x Unterseite — der zweite Aufruf der Unterseite
        // kommt aus dem (eigenen, pfadspezifischen) Cache-Eintrag.
        expect(getWebsiteBySlug).toHaveBeenCalledTimes(2);
      });

      test("Unterseite ohne gebuchtes addOns.subpages → SSR-404 (Gating, Plan B6 Task 6), Startseite weiterhin 200 ohne Page-Link", async () => {
        const fixture = getFixture("werkbank", "full");
        const page = fixture.pages![0];
        const { subpages: _s, ...rest } = fixture.addOns ?? {};
        (getWebsiteBySlug as Mock).mockResolvedValue({
          slug: "brandt-ungebucht",
          websiteData: { ...fixture, addOns: rest },
        });
        const app = buildAppWithFallback();
        const res = await request(app).get(
          `/site/brandt-ungebucht/${page.slug}`
        );
        expect(res.status).toBe(404);
        expect(res.headers["x-robots-tag"]).toBe("noindex");
        expect(res.text).not.toContain(`<title>${page.seo.title}</title>`);
        const home = await request(app).get("/site/brandt-ungebucht");
        expect(home.status).toBe(200);
        expect(home.text).not.toContain(`/brandt-ungebucht/${page.slug}"`);
      });

      test("nicht gebuchte Galerie (addOns.gallery fehlt) erscheint nicht im ausgelieferten HTML", async () => {
        const fixture = getFixture("werkbank", "full");
        const { gallery: _g, ...rest } = fixture.addOns ?? {};
        (getWebsiteBySlug as Mock).mockResolvedValue({
          slug: "brandt-ohne-galerie",
          websiteData: { ...fixture, addOns: rest },
        });
        const app = buildAppWithFallback();
        const res = await request(app).get("/site/brandt-ohne-galerie");
        expect(res.status).toBe(200);
        expect(res.text).not.toContain('id="galerie"');
        expect(res.text).toContain('id="leistungen"');
      });

      test("invalidateSsrCache() löscht per Prefix-Scan auch eine bereits gecachte Unterseite", async () => {
        const fixture = getFixture("werkbank", "full");
        const page = fixture.pages![0];
        (getWebsiteBySlug as Mock).mockResolvedValue({
          slug: "brandt-page-invalidate",
          websiteData: fixture,
        });
        const app = buildAppWithFallback();
        const first = await request(app).get(
          `/site/brandt-page-invalidate/${page.slug}`
        );
        expect(first.status).toBe(200);
        expect(getWebsiteBySlug).toHaveBeenCalledTimes(1);

        invalidateSsrCache("brandt-page-invalidate");
        (getWebsiteBySlug as Mock).mockResolvedValue({
          slug: "brandt-page-invalidate",
          websiteData: { ...fixture, businessName: "Neuer Name GmbH" },
        });
        const second = await request(app).get(
          `/site/brandt-page-invalidate/${page.slug}`
        );
        expect(second.status).toBe(200);
        expect(second.text).toContain("Neuer Name GmbH");
        // Ohne Invalidation käme die zweite Antwort aus dem (jetzt veralteten)
        // Cache-Eintrag der Unterseite und würde erneut den alten Namen
        // zeigen — ein neuer DB-Call beweist, dass der Page-Cache-Eintrag
        // tatsächlich gelöscht wurde.
        expect(getWebsiteBySlug).toHaveBeenCalledTimes(2);
      });

      test("invalidateSsrCache() für einen Slug löscht NICHT den Cache eines Slugs mit demselben Präfix (z. B. 'foo' vs. 'foobar')", async () => {
        const fixture = getFixture("werkbank", "full");
        (getWebsiteBySlug as Mock).mockImplementation(async (slug: string) => ({
          slug,
          websiteData: fixture,
        }));
        const app = buildAppWithFallback();
        await request(app).get("/site/prefixtest");
        await request(app).get("/site/prefixtestextra");
        expect(getWebsiteBySlug).toHaveBeenCalledTimes(2);

        invalidateSsrCache("prefixtest");
        // "prefixtestextra" darf NICHT betroffen sein — ein zweiter Request
        // muss weiterhin aus dem Cache kommen (kein zusätzlicher DB-Call).
        await request(app).get("/site/prefixtestextra");
        expect(getWebsiteBySlug).toHaveBeenCalledTimes(2);

        // "prefixtest" selbst wurde invalidiert → neuer DB-Call.
        await request(app).get("/site/prefixtest");
        expect(getWebsiteBySlug).toHaveBeenCalledTimes(3);
      });
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

    describe("Unterseiten (pages[], Plan B6 Task 3)", () => {
      test("/preview-ssr/:token/:page — bekannte Unterseite → 200, noindex, no-store, Page-Titel im HTML", async () => {
        const fixture = getFixture("werkbank", "full");
        const page = fixture.pages![0];
        (getWebsiteByToken as Mock).mockResolvedValue({
          id: 1,
          slug: "s",
          websiteData: fixture,
        });
        const app = buildAppWithFallback();
        const res = await request(app).get(
          `/preview-ssr/abcdefghabcdefgh/${page.slug}`
        );
        expect(res.status).toBe(200);
        expect(res.headers["x-robots-tag"]).toContain("noindex");
        expect(res.headers["cache-control"]).toContain("no-store");
        expect(res.text).toContain(`<title>${page.seo.title}</title>`);
      });

      test("/preview-ssr/:token/:page — Unterseite ohne gebuchtes addOns.subpages → 404 (gleiches Gating wie Kundenseite)", async () => {
        const fixture = getFixture("werkbank", "full");
        const page = fixture.pages![0];
        const { subpages: _s, ...rest } = fixture.addOns ?? {};
        (getWebsiteByToken as Mock).mockResolvedValue({
          slug: "brandt",
          websiteData: { ...fixture, addOns: rest },
          chatWelcomeMessage: null,
        });
        const app = buildAppWithFallback();
        const res = await request(app).get(
          `/preview-ssr/${"t".repeat(32)}/${page.slug}`
        );
        expect(res.status).toBe(404);
      });

      test("/preview-ssr/:token/:page — unbekannte Unterseite → 404", async () => {
        (getWebsiteByToken as Mock).mockResolvedValue({
          id: 1,
          slug: "s",
          websiteData: getFixture("werkbank", "full"),
        });
        const app = buildAppWithFallback();
        const res = await request(app).get(
          "/preview-ssr/abcdefghabcdefgh/nicht-vorhanden"
        );
        expect(res.status).toBe(404);
      });
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

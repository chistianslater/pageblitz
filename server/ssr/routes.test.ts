import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import type { Mock } from "vitest";
import express, { type Express } from "express";
import supertest from "supertest";
import type { Server } from "http";
import { getFixture } from "../../shared/siteContract/fixtures";
import {
  withDesignSystem,
  withPrimarySystem,
} from "../../shared/designSystems/apply";
import { restoreDoc } from "../onboardingV2/versions";
import { LANDING_SHOWROOM } from "../../shared/landingShowroom";

vi.mock("../db", () => ({
  getWebsiteBySlug: vi.fn(),
  getWebsiteByToken: vi.fn(),
  getWebsiteVersion: vi.fn(),
}));

// Import nach vi.mock, damit der Mock vor dem ersten Aufruf von registerSsrRoutes greift.
import {
  invalidateSsrCache,
  legacyDemoTarget,
  registerSsrRoutes,
} from "./routes";
import { getWebsiteBySlug, getWebsiteByToken, getWebsiteVersion } from "../db";

/**
 * Testserver ausdrücklich an 127.0.0.1 binden (2026-10-07): `supertest(app)`
 * lauscht auf allen Adressen. Unter Volllast belegte auf macOS ein
 * paralleler Testserver denselben Port auf 127.0.0.1 — die Anfrage landete
 * dort (405 eines tRPC-Servers statt 200). Mit fester Adresse vergibt das
 * System den Port nicht doppelt.
 */
const servers: Server[] = [];
function request(app: Express) {
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  return supertest(server);
}
afterAll(() => {
  for (const server of servers) server.close();
});

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
  test("unbekannte Fixture (?pack=) → 400 mit Meldung", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get(
      "/dev/site-preview?pack=disco&fixture=full"
    );
    expect(res.status).toBe(400);
  });

  test("unbekannte Fixture (Sonderzeichen) → 400-Body reflektiert den Parameter NICHT (kein reflected XSS)", async () => {
    const app = express();
    registerSsrRoutes(app);
    const res = await request(app).get(
      "/dev/site-preview?pack=%3Cscript%3E&fixture=full"
    );
    expect(res.status).toBe(400);
    expect(res.text).not.toContain("<script");
  });

  test("dev-preview ohne ?system= rendert das Hauptsystem der Fixture", async () => {
    const app = express();
    registerSsrRoutes(app);
    for (const pack of ["werkbank", "gusto", "salon-noir"] as const) {
      const res = await request(app).get(
        `/dev/site-preview?pack=${pack}&fixture=full`
      );
      const primary = withPrimarySystem(getFixture(pack, "full")).system;
      expect(res.status).toBe(200);
      expect(res.text).toContain(`data-pb-system="${primary}"`);
    }
  });

  test("dev-preview ignoriert ?variant= und ?hero= (Packs entfernt)", async () => {
    const plain = await request(buildAppWithFallback()).get(
      "/dev/site-preview?pack=werkbank&fixture=full"
    );
    const res = await request(buildAppWithFallback()).get(
      "/dev/site-preview?pack=werkbank&fixture=full&variant=7&hero=collage"
    );
    expect(res.status).toBe(200);
    expect(res.text).not.toContain("data-pb-hero");
    expect(res.text.replace(/:\d{4,5}/g, "")).toBe(
      plain.text.replace(/:\d{4,5}/g, "")
    );
  });

  test("dev-preview ?seite= rendert eine Unterseite der Fixture; unbekannt → 404", async () => {
    const app = buildAppWithFallback();
    const page = await request(app).get(
      "/dev/site-preview?system=raster&fixture=full&seite=leistungen-im-detail"
    );
    expect(page.status).toBe(200);
    expect(page.text).toContain(
      "Ein genauerer Blick auf unser Angebot, Schritt für Schritt."
    );
    const unknown = await request(app).get(
      "/dev/site-preview?system=raster&fixture=full&seite=%3Cscript%3E"
    );
    expect(unknown.status).toBe(404);
    expect(unknown.text).not.toContain("<script");
  });

  test("dev-preview ohne ?palette: erste Farbstimmung des Systems (Fixtures, nicht E3)", async () => {
    const app = buildAppWithFallback();
    const raster = await request(app).get(
      "/dev/site-preview?system=raster&fixture=features"
    );
    expect(raster.text).toContain('data-pb-palette="papier"');
    const primary = await request(app).get(
      "/dev/site-preview?pack=salon-noir&fixture=full"
    );
    expect(primary.text).toContain('data-pb-system="journal"');
    expect(primary.text).toContain('data-pb-palette="papier"');
  });

  test("dev-preview: unbekannte Fixture-Art → 400 ohne Reflektieren", async () => {
    const res = await request(buildAppWithFallback()).get(
      "/dev/site-preview?system=journal&fixture=%3Cscript%3E"
    );
    expect(res.status).toBe(400);
    expect(res.text).not.toContain("<script");
  });

  describe("Designsystem-Vorschauen", () => {
    test("Dev-Vorschau rendert Journal mit Palette", async () => {
      const app = express();
      registerSsrRoutes(app);
      const res = await request(app).get(
        "/dev/site-preview?system=journal&palette=ton&fixture=full"
      );
      expect(res.status).toBe(200);
      expect(res.text).toContain('data-pb-system="journal"');
      expect(res.text).toContain('data-pb-palette="ton"');
    });

    test("Dev-Vorschau lehnt unbekanntes System ab, ohne es zu spiegeln", async () => {
      const app = express();
      registerSsrRoutes(app);
      const res = await request(app).get(
        "/dev/site-preview?system=%3Cscript%3E&fixture=full"
      );
      expect(res.status).toBe(400);
      expect(res.text).not.toContain("<script");
    });

    test("Demo-Route Journal x Friseur", async () => {
      const app = express();
      registerSsrRoutes(app);
      const res = await request(app).get("/demo/system/journal/friseur");
      expect(res.status).toBe(200);
      expect(res.text).toContain("jr-entry");
      expect(res.headers["x-robots-tag"]).toContain("noindex");
    });

    test("Raster: Dev-Vorschau und Demo-Route liefern 200", async () => {
      const app = express();
      registerSsrRoutes(app);
      for (const palette of ["papier", "werk", "kohle"]) {
        const dev = await request(app).get(
          `/dev/site-preview?system=raster&palette=${palette}&fixture=full`
        );
        expect(dev.status).toBe(200);
        expect(dev.text).toContain('data-pb-system="raster"');
        expect(dev.text).toContain(`data-pb-palette="${palette}"`);
      }
      const demo = await request(app).get("/demo/system/raster/werkstatt");
      expect(demo.status).toBe(200);
      expect(demo.text).toContain('class="pb-site pb-raster"');
    });

    test("Werkstoff: Dev-Vorschau (3 Paletten) und Demo-Routen liefern 200", async () => {
      const app = express();
      registerSsrRoutes(app);
      for (const palette of ["kiefer", "leinen", "ton"]) {
        const dev = await request(app).get(
          `/dev/site-preview?system=werkstoff&palette=${palette}&fixture=full`
        );
        expect(dev.status).toBe(200);
        expect(dev.text).toContain('data-pb-system="werkstoff"');
        expect(dev.text).toContain(`data-pb-palette="${palette}"`);
      }
      const named = await request(app).get(
        "/dev/site-preview?system=werkstoff&fixture=full&name=Pageblitz%20Demo-Werkstatt"
      );
      expect(named.text).toContain("<span>Demo-Werkstatt</span>");
      for (const showcase of ["schreinerei", "baeckerei", "cafe", "laden"]) {
        const demo = await request(app).get(
          `/demo/system/werkstoff/${showcase}`
        );
        expect(demo.status).toBe(200);
        expect(demo.text).toContain('class="pb-site pb-werkstoff"');
      }
    });

    test("Plakat: Dev-Vorschau (3 Paletten) und Demo-Routen liefern 200", async () => {
      const app = express();
      registerSsrRoutes(app);
      for (const palette of ["kante", "senf", "puls"]) {
        const dev = await request(app).get(
          `/dev/site-preview?system=plakat&palette=${palette}&fixture=full`
        );
        expect(dev.status).toBe(200);
        expect(dev.text).toContain('data-pb-system="plakat"');
        expect(dev.text).toContain(`data-pb-palette="${palette}"`);
      }
      for (const showcase of ["barbier", "imbiss", "training"]) {
        const demo = await request(app).get(`/demo/system/plakat/${showcase}`);
        expect(demo.status).toBe(200);
        expect(demo.text).toContain('class="pb-site pb-plakat"');
        expect(demo.text).toContain('class="pk-entry');
      }
    });

    test("Klar: Dev-Vorschau (3 Paletten) und Demo-Routen liefern 200", async () => {
      const app = express();
      registerSsrRoutes(app);
      for (const palette of ["lind", "wasser", "sand"]) {
        const dev = await request(app).get(
          `/dev/site-preview?system=klar&palette=${palette}&fixture=full`
        );
        expect(dev.status).toBe(200);
        expect(dev.text).toContain('data-pb-system="klar"');
        expect(dev.text).toContain(`data-pb-palette="${palette}"`);
      }
      for (const showcase of ["zahnarzt", "naturheil", "steuerberater"]) {
        const demo = await request(app).get(`/demo/system/klar/${showcase}`);
        expect(demo.status).toBe(200);
        expect(demo.text).toContain('class="pb-site pb-klar"');
        expect(demo.text).toContain('class="kl-entry');
      }
    });

    test("Nacht: Dev-Vorschau (3 Paletten) und Demo-Routen liefern 200, dunkel", async () => {
      const app = express();
      registerSsrRoutes(app);
      for (const palette of ["petrol", "pflaume", "nachtblau"]) {
        const dev = await request(app).get(
          `/dev/site-preview?system=nacht&palette=${palette}&fixture=full`
        );
        expect(dev.status).toBe(200);
        expect(dev.text).toContain('data-pb-system="nacht"');
        expect(dev.text).toContain(`data-pb-palette="${palette}"`);
        expect(dev.text).toContain('<meta name="color-scheme" content="dark" />');
      }
      for (const showcase of ["restaurant", "friseur", "ferienwohnung"]) {
        const demo = await request(app).get(`/demo/system/nacht/${showcase}`);
        expect(demo.status).toBe(200);
        expect(demo.text).toContain('class="pb-site pb-nacht"');
        expect(demo.text).toContain('class="nc-entry');
      }
    });

    test("Freundlich (gebaut, nicht freigeschaltet): Dev-Vorschau (3 Paletten), Demo- und Rechtsseiten liefern 200", async () => {
      const app = express();
      registerSsrRoutes(app);
      for (const palette of ["wald", "himmel", "beere"]) {
        const dev = await request(app).get(
          `/dev/site-preview?system=freundlich&palette=${palette}&fixture=full`
        );
        expect(dev.status).toBe(200);
        expect(dev.text).toContain('data-pb-system="freundlich"');
        expect(dev.text).toContain(`data-pb-palette="${palette}"`);
        expect(dev.text).not.toContain('name="color-scheme"');
      }
      for (const showcase of ["musikschule", "friseur", "cafe"]) {
        const demo = await request(app).get(`/demo/system/freundlich/${showcase}`);
        expect(demo.status).toBe(200);
        expect(demo.text).toContain('class="pb-site pb-freundlich"');
        expect(demo.text).toContain('class="fr-entry');
      }
      for (const page of ["impressum", "datenschutz"]) {
        const res = await request(app).get(`/demo/system/freundlich/musikschule/${page}`);
        expect(res.status).toBe(200);
        expect(res.text).toContain("Beispielseite");
      }
    });

    test("Demo-Rechtsseiten: Impressum/Datenschutz im System, Hinweistext, noindex", async () => {
      const app = express();
      registerSsrRoutes(app);
      for (const page of ["impressum", "datenschutz"]) {
        const res = await request(app).get(
          `/demo/system/journal/friseur/${page}`
        );
        expect(res.status).toBe(200);
        expect(res.text).toContain('data-pb-system="journal"');
        expect(res.text).toContain("Beispielseite");
        expect(res.headers["x-robots-tag"]).toContain("noindex");
      }
    });

    test("Demo-Seite: Footer-Links auf Impressum/Datenschutz lösen auf 200 auf", async () => {
      const app = express();
      registerSsrRoutes(app);
      const demo = await request(app).get("/demo/system/nacht/restaurant");
      const links = [
        ...demo.text.matchAll(
          /href="(\/demo\/system\/nacht\/restaurant\/(?:impressum|datenschutz))"/g
        ),
      ].map(m => m[1]);
      expect(links.length).toBeGreaterThanOrEqual(2);
      for (const href of new Set(links)) {
        expect((await request(app).get(href)).status).toBe(200);
      }
    });

    test("Demo-Rechtsseiten: unbekanntes System/Betrieb -> 404 ohne Echo", async () => {
      const app = express();
      registerSsrRoutes(app);
      const a = await request(app).get("/demo/system/gibtsnicht/friseur/impressum");
      const b = await request(app).get("/demo/system/journal/xyz123/datenschutz");
      expect(a.status).toBe(404);
      expect(b.status).toBe(404);
      expect(a.text + b.text).not.toMatch(/gibtsnicht|xyz123/);
    });

    test("Demo-Route: unbekanntes System, unbekannter Betrieb -> 404", async () => {
      const app = express();
      registerSsrRoutes(app);
      expect(
        (await request(app).get("/demo/system/gibtsnicht/friseur")).status
      ).toBe(404);
      expect(
        (await request(app).get("/demo/system/journal/gibtsnicht")).status
      ).toBe(404);
    });

    test("preview-ssr ?system= rendert nur, ohne zu speichern; unbekannt -> 400", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("salon-noir", "full"),
      });
      const app = express();
      registerSsrRoutes(app);
      const ok = await request(app).get(
        "/preview-ssr/abcdefghabcdefgh?system=journal&palette=salbei"
      );
      expect(ok.status).toBe(200);
      expect(ok.text).toContain('data-pb-system="journal"');
      expect(ok.text).toContain('data-pb-palette="salbei"');
      const bad = await request(app).get(
        "/preview-ssr/abcdefghabcdefgh?system=%3Cscript%3E"
      );
      expect(bad.status).toBe(400);
      expect(bad.text).not.toContain("<script");
      const unknown = await request(app).get(
        "/preview-ssr/abcdefghabcdefgh?system=gibtsnicht"
      );
      expect(unknown.status).toBe(400);
      const nacht = await request(app).get(
        "/preview-ssr/abcdefghabcdefgh?system=nacht&palette=pflaume"
      );
      expect(nacht.status).toBe(200);
      expect(nacht.text).toContain('data-pb-system="nacht"');
      expect(nacht.text).toContain('data-pb-palette="pflaume"');
    });

  });

  describe("alte Pack-Demos /demo/:pack → 301 auf die System-Demo [E9]", () => {
    // Erstes Beispiel mit dieser Fixture in seinem Hauptsystem;
    // raster (keine eigene Fixture unter den Beispielen) → Steuerberater.
    const E9: Record<string, string> = {
      werkbank: "/demo/system/werkstoff/schreinerei",
      patina: "/demo/system/klar/physio",
      kanzlei: "/demo/system/raster/steuerberater",
      "salon-noir": "/demo/system/journal/friseur",
      morgenlicht: "/demo/system/klar/zahnarzt",
      marktplatz: "/demo/system/plakat/musikschule",
      gusto: "/demo/system/nacht/restaurant",
      landgut: "/demo/system/raster/gaertnerei",
      atelier: "/demo/system/journal/fotografie",
      klarwerk: "/demo/system/raster/it",
      verve: "/demo/system/plakat/training",
      zunft: "/demo/system/werkstoff/baeckerei",
      schimmer: "/demo/system/journal/kosmetik",
      fundament: "/demo/system/raster/makler",
      karat: "/demo/system/werkstoff/laden",
      plakat: "/demo/system/journal/tattoo",
      raster: "/demo/system/raster/steuerberater",
      strom: "/demo/system/werkstoff/elektro",
      riviera: "/demo/system/journal/ferienwohnung",
      ernte: "/demo/system/werkstoff/cafe",
    };

    test("Tabelle deckt alle 20 Fixture-Schlüssel ab", () => {
      for (const [pack, target] of Object.entries(E9)) {
        expect(legacyDemoTarget(pack)).toBe(target);
      }
      expect(Object.keys(E9)).toHaveLength(20);
      expect(legacyDemoTarget("disco")).toBeUndefined();
    });

    test("Startseite, Unter- und Rechtsseiten → 301 auf dieselbe Adresse, 1h-Cache", async () => {
      const app = buildAppWithFallback();
      for (const path of [
        "/demo/gusto",
        "/demo/gusto/impressum",
        "/demo/gusto/datenschutz",
        "/demo/gusto/leistungen-im-detail",
      ]) {
        const res = await request(app).get(path);
        expect(res.status).toBe(301);
        expect(res.headers.location).toBe("/demo/system/nacht/restaurant");
        expect(res.headers["cache-control"]).toBe("public, max-age=3600");
      }
      const raster = await request(app).get("/demo/raster");
      expect(raster.status).toBe(301);
      expect(raster.headers.location).toBe("/demo/system/raster/steuerberater");
    });

    test("Showroom-Links der Startseite = Ziele der alten Showroom-Demos und rendern", async () => {
      const app = buildAppWithFallback();
      for (const item of LANDING_SHOWROOM) {
        expect(item.href).toBe(legacyDemoTarget(item.image));
        const res = await request(app).get(item.href);
        expect(res.status, item.href).toBe(200);
      }
    });

    test("jedes Ziel rendert (200)", async () => {
      const app = buildAppWithFallback();
      for (const target of new Set(Object.values(E9))) {
        const res = await request(app).get(target);
        expect(res.status, target).toBe(200);
        expect(res.text).toContain("data-pb-system");
      }
    });

    test("unbekannte Demo → 404, Parameter nicht reflektiert", async () => {
      const app = buildAppWithFallback();
      for (const path of [
        "/demo/disco",
        "/demo/disco/impressum",
        "/demo/disco/leistungen-im-detail",
        "/demo/Werkbank",
      ]) {
        const res = await request(app).get(path);
        expect(res.status).toBe(404);
        expect(res.text).toBe("Unbekannte Demo");
      }
      const xss = await request(app).get("/demo/%3Cscript%3E");
      expect(xss.status).toBe(404);
      expect(xss.text).not.toContain("<script");
    });

    test("alte Bauplan-Übersicht → 301 auf die System-Demo; unbekannt → 404", async () => {
      const app = buildAppWithFallback();
      const res = await request(app).get("/demo/bauplan/friseur/stage");
      expect(res.status).toBe(301);
      expect(res.headers.location).toBe("/demo/system/journal/friseur");
      const cf = await request(app).get("/demo/bauplan/restaurant/colorfield");
      expect(cf.headers.location).toBe("/demo/system/nacht/restaurant");
      const unknown = await request(app).get("/demo/bauplan/gibtsnicht/stage");
      expect(unknown.status).toBe(404);
      expect(unknown.text).not.toContain("gibtsnicht");
    });

    test("statische Fixture-Assets unter /demo/* (z. B. .webp) matchen die Route nicht — fallen auf die nachfolgende Middleware durch", async () => {
      const app = buildAppWithOkFallback();
      const res = await request(app).get("/demo/werkbank-hero.webp");
      expect(res.status).toBe(200);
      expect(res.text).toBe("OK-Fallback");
    });

    test("kein DB-Zugriff", async () => {
      (getWebsiteBySlug as Mock).mockReset();
      const app = buildAppWithFallback();
      await request(app).get("/demo/kanzlei");
      await request(app).get("/demo/werkbank/leistungen-im-detail");
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
      const typo = await request(app).get(
        "/site/brandt-404-vs-page/tippfehler-pfad"
      );
      expect(typo.status).toBe(404);
      // 2) echte Unterseite, noch nie gerendert → MUSS 200 + Page-Inhalt liefern
      const page = await request(app).get(
        "/site/brandt-404-vs-page/leistungen-im-detail"
      );
      expect(page.status).toBe(200);
      expect(page.text).toContain("Leistungen im Detail");
      // 3) weiterer Tippfehler → 404 aus dem Cache, kein neuer DB-Zugriff nötig
      const calls = (getWebsiteBySlug as Mock).mock.calls.length;
      const typo2 = await request(app).get(
        "/site/brandt-404-vs-page/noch-ein-tippfehler"
      );
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

      test("ohne gebuchte Galerie liefert die Seite die drei freien Fotos aus", async () => {
        // Journal zeigt ohne Extra die ersten drei Fotos (die anderen Systeme
        // zeigen jedes Foto genau einmal, siehe freeGalleryBeyondShown).
        const fixture = withDesignSystem(getFixture("werkbank", "full"), "journal");
        const { gallery: _g, ...rest } = fixture.addOns ?? {};
        (getWebsiteBySlug as Mock).mockResolvedValue({
          slug: "brandt-ohne-galerie",
          websiteData: { ...fixture, addOns: rest },
        });
        const app = buildAppWithFallback();
        const res = await request(app).get("/site/brandt-ohne-galerie");
        expect(res.status).toBe(200);
        expect(res.text).toContain('id="galerie"');
        expect(res.text).toContain('id="leistungen"');
        const abschnitt = res.text.slice(res.text.indexOf('id="galerie"'));
        const bilder = (
          abschnitt.slice(0, abschnitt.indexOf("</section>")).match(/<img/g) ??
          []
        ).length;
        expect(bilder).toBe(3);
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

    // Geaendert 2026-09-09 (Betreiber): Ueber den Vorschau-Link im Dashboard
    // stand hier "nicht gefunden". Die Pfadform /site/<slug> ist unsere
    // interne Ansicht — eine live geschaltete Seite laeuft auf eigener
    // Domain mit leerem basePath und behaelt den 404 (Test weiter unten).
    test("/impressum ohne legal-Inhalt → 200 mit beruhigendem Hinweis", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        websiteData: getFixture("werkbank", "full"),
      });

      const app = buildAppWithFallback();
      const res = await request(app).get(
        "/site/schreinerei-brandt-dortmund/impressum"
      );

      expect(res.status).toBe(200);
      expect(res.text).toContain("Keine Sorge");
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

    test("Admin-Demo-Websites sind noindex und laden kein Umami-Tracking", async () => {
      (getWebsiteBySlug as Mock).mockResolvedValue({
        slug: "admin-demo-5",
        status: "active",
        umamiWebsiteId: "umami-demo-id",
        websiteData: getFixture("werkbank", "features"),
      });

      const res = await request(buildAppWithFallback()).get(
        "/site/admin-demo-5"
      );

      expect(res.status).toBe(200);
      expect(res.headers["x-robots-tag"]).toContain("noindex");
      expect(res.text).not.toContain("umami-demo-id");
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

    test("?reveal=1 → Einblendungs-CSS im HTML; ohne Parameter nicht (Zeitmaschine, Task 4)", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      const app = buildAppWithFallback();
      const withReveal = await request(app).get(
        "/preview-ssr/abcdefghabcdefgh?reveal=1"
      );
      expect(withReveal.status).toBe(200);
      expect(withReveal.text).toContain("pb-reveal");
      const without = await request(app).get("/preview-ssr/abcdefghabcdefgh");
      expect(without.text).not.toContain("pb-reveal");
    });

    test("Rechtsseite ohne Inhalt → 200 mit Veröffentlichungs-Hinweis (Betreiber-Wunsch 2026-08-31)", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      const app = buildAppWithFallback();
      const res = await request(app).get(
        "/preview-ssr/abcdefghabcdefgh/impressum"
      );
      expect(res.status).toBe(200);
      // Formulierung 2026-09-09 beruhigend statt belehrend: Der Empfaenger
      // einer Postkarte kennt keinen "Schritt Rechtliches".
      expect(res.text).toContain("Keine Sorge");
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

    test("?version=<id> rendert den gespeicherten Stand statt des Dokuments (Verlauf, 2026-09-03)", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: withDesignSystem(getFixture("werkbank", "full"), "werkstoff"),
      });
      (getWebsiteVersion as Mock).mockResolvedValue({
        id: 5,
        trigger: "panel",
        label: "Designsystem: Klar",
        createdAt: new Date(),
        doc: withDesignSystem(getFixture("kanzlei", "full"), "klar"),
      });
      const res = await request(buildAppWithFallback()).get(
        "/preview-ssr/abcdefghabcdefgh?version=5"
      );
      expect(res.status).toBe(200);
      expect(getWebsiteVersion).toHaveBeenCalledWith(1, 5);
      expect(res.text).toContain('data-pb-system="klar"');
      expect(res.headers["cache-control"]).toBe("no-store");
    });

    test("?version= eines rev-2-Stands zeigt genau die Wiederherstellung (aktuelles System, alte Texte)", async () => {
      const current = withDesignSystem(getFixture("werkbank", "full"), "raster", "kohle");
      const kanzlei = getFixture("kanzlei", "full");
      const stand = {
        ...kanzlei,
        designRevision: 2 as const,
        fontPairId: "modern",
        sections: kanzlei.sections.map(section =>
          section.type === "hero"
            ? { ...section, headline: "Alter Stand vor Designsystem" }
            : section
        ),
      };
      (getWebsiteVersion as Mock).mockResolvedValue({
        id: 7,
        trigger: "panel",
        label: "Stand vor Designsystem",
        createdAt: new Date(),
        doc: stand,
      });
      const agent = request(buildAppWithFallback());
      (getWebsiteByToken as Mock).mockResolvedValue({ id: 1, slug: "s", websiteData: current });
      const preview = await agent.get("/preview-ssr/abcdefghabcdefgh?version=7");
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: restoreDoc(current, stand),
      });
      const restored = await agent.get("/preview-ssr/abcdefghabcdefgh");
      expect(preview.status).toBe(200);
      expect(preview.text).toContain('data-pb-system="raster"');
      expect(preview.text).toContain("Alter Stand vor Designsystem");
      const ohnePort = (html: string) => html.replace(/127\.0\.0\.1:\d+/g, "host");
      expect(ohnePort(preview.text)).toBe(ohnePort(restored.text));
    });

    test("?version= unbekannt oder fremd → 404; ungültiger Wert → 400 ohne Reflektion", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      (getWebsiteVersion as Mock).mockResolvedValue(null);
      const missing = await request(buildAppWithFallback()).get(
        "/preview-ssr/abcdefghabcdefgh?version=99"
      );
      expect(missing.status).toBe(404);
      const bad = await request(buildAppWithFallback()).get(
        "/preview-ssr/abcdefghabcdefgh?version=%3Cscript%3E"
      );
      expect(bad.status).toBe(400);
      expect(bad.text).not.toContain("<script");
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
    });

    test("Pack-Parameter (?pack=&variant=&font=) werden ignoriert und nie reflektiert (Packs entfernen, Task 3)", async () => {
      (getWebsiteByToken as Mock).mockResolvedValue({
        id: 1,
        slug: "s",
        websiteData: getFixture("werkbank", "full"),
      });
      const plain = await request(buildAppWithFallback()).get(
        "/preview-ssr/abcdefghabcdefgh"
      );
      const res = await request(buildAppWithFallback()).get(
        "/preview-ssr/abcdefghabcdefgh?pack=%3Cscript%3Ealert(1)%3C%2Fscript%3E&variant=1&font=elegant"
      );
      expect(res.status).toBe(200);
      expect(res.text).not.toContain("alert(1)");
      expect(res.text).toContain("data-pb-system");
      expect(res.text.replace(/:\d{4,5}/g, "")).toBe(
        plain.text.replace(/:\d{4,5}/g, "")
      );
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

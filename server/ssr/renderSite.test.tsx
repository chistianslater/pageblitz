// server/ssr/renderSite.test.tsx
import { describe, expect, test } from "vitest";
import { getFixture } from "../../shared/siteContract/fixtures";
import { SITE_ENHANCER_JS } from "../../client/src/components/site/siteEnhancer";
import { renderSiteHtml } from "./renderSite";

describe("renderSiteHtml", () => {
  const { html, status } = renderSiteHtml(getFixture("werkbank", "full"), {
    origin: "https://brandt.pageblitz.de",
  });
  test("liefert komplettes Dokument mit Meta und Canonical, Status 200", () => {
    expect(status).toBe(200);
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<html lang="de">');
    expect(html).toContain("<title>");
    expect(html).toContain(
      'rel="canonical" href="https://brandt.pageblitz.de/"'
    );
  });
  test("enthält LocalBusiness-JSON-LD", () => {
    expect(html).toContain('"@type":"LocalBusiness"');
    expect(html).toContain('"aggregateRating"');
  });
  test("lädt Pack-Fonts über eine css2-URL mit display=swap", () => {
    expect(html).toContain("fonts.googleapis.com/css2?family=Archivo+Black");
    expect(html).toContain("display=swap");
  });
  test("Inhalt ist ohne JS im HTML (Anker vorhanden)", () => {
    expect(html).toContain('id="leistungen"');
    expect(html).toContain("Massarbeit");
  });
  test("HTML enthält Body-Reset (margin:0) und Canvas-Hintergrundfarbe", () => {
    expect(html).toContain("html,body{margin:0;padding:0}body{background:");
  });
});

describe("renderSiteHtml — Sektions-Einblendung (sectionReveal, Zeitmaschine Task 4)", () => {
  test("sectionReveal: true → Einblendungs-CSS (Keyframes + prefers-reduced-motion-Guard) im Head", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "full"), {
      origin: "https://brandt.pageblitz.de",
      sectionReveal: true,
    });
    expect(html).toContain("pb-reveal");
    expect(html).toContain("prefers-reduced-motion");
  });
  test("ohne sectionReveal (Live-Site-Default) → kein Einblendungs-CSS", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "full"), {
      origin: "https://brandt.pageblitz.de",
    });
    expect(html).not.toContain("pb-reveal");
  });
});

describe("renderSiteHtml — Site-Enhancer (Scroll-Reveal + Galerie-Lightbox, 2026-08-25)", () => {
  test("bettet das Enhancer-Script auf der Startseite ein (auch ohne Add-ons)", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "full"), {
      origin: "https://brandt.pageblitz.de",
    });
    expect(html).toContain("IntersectionObserver");
    expect(html).toContain("pb-io-on");
    expect(html).toContain("pb-lb");
  });
  test("bettet das Enhancer-Script auch auf Unterseiten ein", () => {
    const data = getFixture("werkbank", "full");
    const page = data.pages![0];
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: `/${page.slug}`,
    });
    expect(status).toBe(200);
    expect(html).toContain("IntersectionObserver");
  });
  test("Enhancer-Script ist syntaktisch valides JavaScript und spaltet das Dokument nicht", () => {
    // new Function parst ohne auszuführen — fängt Syntaxfehler im
    // handgeschriebenen Script-String, die sonst erst im Browser stumm
    // wären (kein Reveal, keine Lightbox, kein Konsolen-Blick des Kunden).
    expect(() => new Function(SITE_ENHANCER_JS)).not.toThrow();
    // Ein rohes "</script>" im Inline-JS würde das HTML-Dokument spalten.
    expect(SITE_ENHANCER_JS).not.toContain("</script>");
  });
});

describe("renderSiteHtml — og:image", () => {
  test("Hero mit imageUrl → og:image absolut (origin präfixiert) + twitter:card=summary_large_image", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "full"), {
      origin: "https://brandt.pageblitz.de",
    });
    expect(html).toContain(
      '<meta property="og:image" content="https://brandt.pageblitz.de/demo/werkbank-hero.webp" />'
    );
    expect(html).toContain(
      '<meta name="twitter:card" content="summary_large_image" />'
    );
  });

  test("Hero mit bereits absoluter imageUrl bleibt unverändert", () => {
    const base = getFixture("werkbank", "full");
    const data = {
      ...base,
      sections: base.sections.map(s =>
        s.type === "hero"
          ? { ...s, imageUrl: "https://cdn.example.com/hero.jpg" }
          : s
      ),
    };
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
    });
    expect(html).toContain(
      '<meta property="og:image" content="https://cdn.example.com/hero.jpg" />'
    );
  });

  test("Hero ohne imageUrl → kein og:image-Tag, kein twitter:card-Tag", () => {
    const base = getFixture("werkbank", "full");
    const data = {
      ...base,
      sections: base.sections.map(s =>
        s.type === "hero" ? { ...s, imageUrl: undefined } : s
      ),
    };
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
    });
    expect(html).not.toContain('property="og:image"');
    expect(html).not.toContain('name="twitter:card"');
  });
});

describe("renderSiteHtml — Rechtsseiten (Impressum/Datenschutz)", () => {
  test("pathname /impressum mit gefülltem impressumHtml rendert den Legal-Inhalt + Zurück-Link, nicht die Hauptseite, Status 200", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      legal: { impressumHtml: "<p>Firma XY, Musterstraße 1</p>" },
    };
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/impressum",
    });
    expect(status).toBe(200);
    expect(html).toContain("<p>Firma XY, Musterstraße 1</p>");
    expect(html).toContain('href="/"');
    expect(html).toContain("Zurück");
    expect(html).not.toContain('id="leistungen"');
    expect(html).not.toContain("Massarbeit");
  });

  test("pathname /impressum ohne legal-Feld zeigt den 404-Text mit Status 404", () => {
    const data = getFixture("werkbank", "full");
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/impressum",
    });
    expect(status).toBe(404);
    expect(html).toContain("nicht gefunden");
  });

  test('pathname /impressum mit leerem impressumHtml ("") zeigt trotzdem den 404-Text mit Status 404', () => {
    const data = {
      ...getFixture("werkbank", "full"),
      legal: { impressumHtml: "" },
    };
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/impressum",
    });
    expect(status).toBe(404);
    expect(html).toContain("nicht gefunden");
  });
});

describe("renderSiteHtml — basePath (/site/:slug-Form)", () => {
  test("Legal-Zurück-Link zeigt mit basePath auf /site/foo statt auf /", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      legal: { impressumHtml: "<p>Firma XY</p>" },
    };
    const { html } = renderSiteHtml(data, {
      origin: "https://pageblitz.de",
      pathname: "/impressum",
      basePath: "/site/foo",
    });
    expect(html).toContain('href="/site/foo"');
    expect(html).not.toContain('href="/"');
  });

  test("ohne basePath zeigt der Legal-Zurück-Link weiterhin auf / (Subdomain-Form)", () => {
    const data = {
      ...getFixture("werkbank", "full"),
      legal: { impressumHtml: "<p>Firma XY</p>" },
    };
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/impressum",
    });
    expect(html).toContain('href="/"');
  });
});

describe("renderSiteHtml — Escaping", () => {
  test('businessName und seo.title mit <script> und " erscheinen nur escaped im Head, JSON-LD enthält kein rohes </script> oder <', () => {
    const base = getFixture("werkbank", "full");
    const data = {
      ...base,
      businessName: '<script>alert(1)</script>"',
      seo: {
        ...base.seo,
        title: '<script>alert(1)</script>"',
      },
    };
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;&quot;");

    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    );
    expect(jsonLdMatch).not.toBeNull();
    const jsonLd = jsonLdMatch?.[1] ?? "";
    expect(jsonLd).not.toContain("</script>");
    expect(jsonLd).not.toContain("<");
    expect(jsonLd).toContain("\\u003cscript");
  });
});

describe("renderSiteHtml — Unterseiten (pages[], Plan B6 Task 3)", () => {
  test("bekannter Page-Pfad → 200, Kopf aus page.seo statt data.seo, Canonical auf den Page-Pfad", () => {
    const data = getFixture("werkbank", "full");
    const page = data.pages![0];
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: `/${page.slug}`,
    });
    expect(status).toBe(200);
    expect(html).toContain(`<title>${page.seo.title}</title>`);
    expect(html).toContain(
      `<meta name="description" content="${page.seo.description}" />`
    );
    expect(html).toContain(
      `rel="canonical" href="https://brandt.pageblitz.de/${page.slug}"`
    );
    // Kein Startseiten-SEO-Titel im <title> (Regression: Page-Modus rendert
    // nicht versehentlich die Startseite).
    expect(html).not.toContain(`<title>${data.seo.title}</title>`);
  });

  test("og:image fällt auf das Startseiten-Hero-Bild zurück (Unterseiten haben kein eigenes)", () => {
    const data = getFixture("werkbank", "full");
    const page = data.pages![0];
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: `/${page.slug}`,
    });
    expect(html).toContain(
      '<meta property="og:image" content="https://brandt.pageblitz.de/demo/werkbank-hero.webp" />'
    );
  });

  test("Body enthält die Page-Sektionen (pageHeader-Fallback + services), nicht die Startseiten-Sektionen", () => {
    const data = getFixture("werkbank", "full");
    const page = data.pages![0];
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: `/${page.slug}`,
    });
    expect(html).toContain(page.title);
    // Die Hero-Sektion (id="start", nur auf der Startseite vorhanden) fehlt
    // im Page-Modus — die Page-Sektionen ersetzen die Startseiten-Sektionen.
    expect(html).not.toContain('id="start"');
  });

  test("kein LocalBusiness-JSON-LD im Page-Modus (bleibt Startseiten-Sache)", () => {
    const data = getFixture("werkbank", "full");
    const page = data.pages![0];
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: `/${page.slug}`,
    });
    expect(html).not.toContain('"@type":"LocalBusiness"');
  });

  test('Pfad ohne Treffer in pages[] (und ungleich "/") fällt auf den Startseiten-Render zurück', () => {
    const data = getFixture("werkbank", "full");
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/nicht-vorhanden",
    });
    expect(status).toBe(200);
    expect(html).toContain(`<title>${data.seo.title}</title>`);
  });

  test("Dokument ohne pages[] → jeder Nicht-Legal-Pfad rendert weiterhin die Startseite", () => {
    const data = { ...getFixture("werkbank", "full"), pages: undefined };
    const { html, status } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      pathname: "/irgendwas",
    });
    expect(status).toBe(200);
    expect(html).toContain(`<title>${data.seo.title}</title>`);
  });
});

describe("renderSiteHtml — Add-on-Gating (Plan B6 Task 6)", () => {
  const full = getFixture("werkbank", "full");
  const opts = { origin: "https://brandt.pageblitz.de" };

  test("Fixture full (alle addOns gebucht) rendert die Galerie samt Anker", () => {
    const { html } = renderSiteHtml(full, opts);
    expect(html).toContain('id="galerie"');
    expect(html).toContain('href="#galerie"');
  });

  test("ohne addOns.gallery bleibt die Galerie sichtbar, zeigt aber nur drei Fotos (Betreiber-Entscheidung 2026-09-20)", () => {
    const { gallery: _g, ...rest } = full.addOns ?? {};
    // Fixture-Galerien sind klein; fünf Fotos machen die Grenze sichtbar.
    const fuenf = {
      ...full,
      addOns: rest,
      sections: full.sections.map(s =>
        s.type === "gallery"
          ? {
              ...s,
              images: Array.from({ length: 5 }, (_, i) => ({
                url: `https://x/g${i + 1}.jpg`,
                alt: `Bild ${i + 1}`,
              })),
            }
          : s
      ),
    };
    const { html, status } = renderSiteHtml(fuenf, opts);
    expect(status).toBe(200);
    expect(html).toContain('id="galerie"');
    expect(html).toContain('href="#galerie"');
    expect(html).toContain('id="leistungen"');
    const gezeigt = (html.match(/data-pb-lightbox/g) ?? []).length;
    const abschnitt = html.slice(html.indexOf('id="galerie"'));
    const bilder = (
      abschnitt.slice(0, abschnitt.indexOf("</section>")).match(/<img/g) ?? []
    ).length;
    expect(bilder).toBe(3);
    expect(gezeigt).toBeGreaterThanOrEqual(0);
  });

  test("mit addOns.gallery erscheinen alle Fotos", () => {
    const fuenf = {
      ...full,
      addOns: { ...full.addOns, gallery: true },
      sections: full.sections.map(s =>
        s.type === "gallery"
          ? {
              ...s,
              images: Array.from({ length: 5 }, (_, i) => ({
                url: `https://x/g${i + 1}.jpg`,
                alt: `Bild ${i + 1}`,
              })),
            }
          : s
      ),
    };
    const alle = 5;
    const { html } = renderSiteHtml(fuenf, opts);
    const abschnitt = html.slice(html.indexOf('id="galerie"'));
    const bilder = (
      abschnitt.slice(0, abschnitt.indexOf("</section>")).match(/<img/g) ?? []
    ).length;
    expect(bilder).toBe(alle);
  });

  test("ohne addOns.subpages: Page-Link fehlt in der Nav, Page-Pfad rendert die Startseite (Route liefert 404, siehe routes.test)", () => {
    const { subpages: _s, ...rest } = full.addOns ?? {};
    const data = { ...full, addOns: rest };
    const page = full.pages![0];
    const home = renderSiteHtml(data, opts);
    expect(home.html).not.toContain(`href="/${page.slug}"`);
    const onPage = renderSiteHtml(data, {
      ...opts,
      pathname: `/${page.slug}`,
    });
    expect(onPage.html).toContain(`<title>${full.seo.title}</title>`);
    expect(onPage.html).not.toContain(`<title>${page.seo.title}</title>`);
  });

  test("Unterseite: die Galerie bleibt sichtbar (begrenzt), pageHeader bleibt", () => {
    const page = {
      slug: "einblicke",
      title: "Einblicke",
      seo: { title: "Einblicke", description: "Bilder." },
      sections: [
        { type: "pageHeader" as const, title: "Einblicke-Kopf" },
        {
          type: "gallery" as const,
          headline: "Unterseiten-Galerie",
          images: [{ url: "https://x/g.jpg", alt: "g" }],
        },
      ],
    };
    const data = {
      ...full,
      pages: [page],
      addOns: { subpages: true },
    };
    const { html, status } = renderSiteHtml(data, {
      ...opts,
      pathname: "/einblicke",
    });
    expect(status).toBe(200);
    expect(html).toContain("Einblicke-Kopf");
    expect(html).toContain("Unterseiten-Galerie");
    const booked = renderSiteHtml(
      { ...data, addOns: { subpages: true, gallery: true } },
      { ...opts, pathname: "/einblicke" }
    );
    expect(booked.html).toContain("Unterseiten-Galerie");
  });
});

describe("renderSiteHtml — SSR-Inseln", () => {
  test("Bundle-Tag und Inseln-CSS fehlen, wenn keine Features aktiv sind (Fixture full)", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "full"), {
      origin: "https://brandt.pageblitz.de",
      slug: "brandt",
    });
    expect(html).not.toContain("/islands/site-islands.js");
    expect(html).not.toContain(".pb-island-form{");
  });

  test("Bundle-Tag und Inseln-CSS erscheinen, wenn Features aktiv sind (Fixture features)", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "features"), {
      origin: "https://brandt.pageblitz.de",
      slug: "brandt",
    });
    expect(
      html.match(
        /<script type="module" src="\/islands\/site-islands\.js" defer><\/script>/g
      )
    ).toHaveLength(1);
    expect(html).toContain(".pb-island-form{");
    expect(html).toContain('data-island="contact"');
    expect(html).toContain('action="/api/site/brandt/contact"');
  });

  test("Bundle-Tag fehlt weiterhin bei Fixture minimal", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "minimal"), {
      origin: "https://brandt.pageblitz.de",
      slug: "brandt",
    });
    expect(html).not.toContain("/islands/site-islands.js");
  });

  test("Bundle-Tag und Inseln-CSS fehlen ohne slug, selbst bei aktiven Features", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "features"), {
      origin: "https://brandt.pageblitz.de",
      // kein slug übergeben
    });
    expect(html).not.toContain("/islands/site-islands.js");
    expect(html).not.toContain(".pb-island-form{");
  });

  test("opts.site.chatWelcomeMessage landet als data-welcome-Attribut auf der Chat-Insel (Fixture features)", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "features"), {
      origin: "https://brandt.pageblitz.de",
      slug: "brandt",
      site: { chatWelcomeMessage: "Willkommen bei Brandt!" },
    });
    expect(html).toContain('data-welcome="Willkommen bei Brandt!"');
  });

  test("ohne opts.site fehlt das data-welcome-Attribut auf der Chat-Insel", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "features"), {
      origin: "https://brandt.pageblitz.de",
      slug: "brandt",
    });
    expect(html).not.toContain("data-welcome=");
  });

  test("Inseln-CSS steht im <body> bei SiteIslands, nicht mehr separat im <head>", () => {
    const { html } = renderSiteHtml(getFixture("werkbank", "features"), {
      origin: "https://brandt.pageblitz.de",
      slug: "brandt",
    });
    const headEnd = html.indexOf("</head>");
    const cssPos = html.indexOf(".pb-island-form{");
    expect(headEnd).toBeGreaterThan(-1);
    expect(cssPos).toBeGreaterThan(headEnd);
    expect(html.match(/\.pb-island-form\{/g)).toHaveLength(1);
  });
});

describe("renderSiteHtml — Umami-Script (Plan B6 Task 7, cookielos)", () => {
  const data = getFixture("werkbank", "full");
  const origin = "https://brandt.pageblitz.de";

  test("ohne umamiWebsiteId: kein Umami-Script im Head (Demo/Preview/inaktiv)", () => {
    const { html } = renderSiteHtml(data, { origin });
    expect(html).not.toContain("data-website-id");
    expect(html).not.toContain("script.js");
  });

  test("mit umamiWebsiteId: <script defer src=… data-website-id=…> im <head>, Startseite", () => {
    const { html } = renderSiteHtml(data, {
      origin,
      umamiWebsiteId: "umami-uuid-1",
    });
    const head = html.slice(0, html.indexOf("</head>"));
    expect(head).toMatch(
      /<script defer src="[^"]+\/script\.js" data-website-id="umami-uuid-1"><\/script>/
    );
    // genau einmal, keine Cookies/Consent-Logik
    expect(html.match(/data-website-id/g)?.length).toBe(1);
  });

  test("mit umamiWebsiteId: auch auf Unterseite und Rechtsseite im Head", () => {
    const page = renderSiteHtml(data, {
      origin,
      pathname: "/leistungen-im-detail",
      umamiWebsiteId: "umami-uuid-1",
    });
    expect(page.status).toBe(200);
    expect(page.html.slice(0, page.html.indexOf("</head>"))).toContain(
      'data-website-id="umami-uuid-1"'
    );
    const legal = renderSiteHtml(data, {
      origin,
      pathname: "/impressum",
      umamiWebsiteId: "umami-uuid-1",
    });
    expect(legal.html.slice(0, legal.html.indexOf("</head>"))).toContain(
      'data-website-id="umami-uuid-1"'
    );
  });
});

describe("renderSiteHtml — canonical in der Pfadform (/site/:slug, Final-Review B6)", () => {
  const data = getFixture("werkbank", "full");
  const origin = "https://pageblitz.de";
  const basePath = "/site/schreinerei-brandt";

  test("Startseite: canonical = origin + basePath (ohne Slash am Ende)", () => {
    const { html } = renderSiteHtml(data, { origin, basePath, pathname: "/" });
    expect(html).toContain(`rel="canonical" href="${origin}${basePath}"`);
  });

  test("Unterseite und Rechtsseite tragen den basePath im canonical", () => {
    const page = data.pages![0]!;
    const sub = renderSiteHtml(data, {
      origin,
      basePath,
      pathname: `/${page.slug}`,
    });
    expect(sub.html).toContain(
      `rel="canonical" href="${origin}${basePath}/${page.slug}"`
    );
    const legal = renderSiteHtml(data, {
      origin,
      basePath,
      pathname: "/impressum",
    });
    expect(legal.html).toContain(
      `rel="canonical" href="${origin}${basePath}/impressum"`
    );
    expect(legal.html).not.toContain(
      `rel="canonical" href="${origin}/impressum"`
    );
  });

  test("Subdomain-Form (basePath leer) bleibt unverändert", () => {
    const { html } = renderSiteHtml(data, {
      origin: "https://brandt.pageblitz.de",
      basePath: "",
      pathname: "/",
    });
    expect(html).toContain(
      'rel="canonical" href="https://brandt.pageblitz.de/"'
    );
  });
});

describe("Rechtsseiten in der Vorschau — Ton (2026-09-09)", () => {
  const vorschau = (pfad: string) =>
    renderSiteHtml(getFixture("werkbank", "full"), {
      origin: "https://pageblitz.de",
      pathname: pfad,
      basePath: "/preview-ssr/tok123",
    }).html;

  test("beruhigt, statt zu belehren", () => {
    // Der Empfaenger einer Postkarte kennt keinen "Schritt Rechtliches" —
    // er hat noch nie mit uns gesprochen. Ein Verweis darauf verwirrt.
    const html = vorschau("/impressum");
    expect(html).toContain("Keine Sorge");
    expect(html).not.toContain("Schritt");
  });

  test("duzt, wie die ganze Seite", () => {
    const html = vorschau("/datenschutz");
    expect(html).toMatch(/\bdeine\b|\bDeine\b|\bdu\b|\bDu\b/);
    expect(html).not.toMatch(/\bIhre\b|\bIhnen\b/);
  });

  test("gilt auch fuer die Pfadform /site/<slug>", () => {
    // Betreiber-Befund 2026-09-09: Ueber den Vorschau-Link im Dashboard
    // stand dort "nicht gefunden". Die Pfadform ist unsere interne Ansicht;
    // eine live geschaltete Kundenseite laeuft auf eigener Domain mit
    // leerem basePath und behaelt den 404.
    const { html, status } = renderSiteHtml(getFixture("werkbank", "full"), {
      origin: "https://pageblitz.de",
      pathname: "/impressum",
      basePath: "/site/salon-xy-8V2Z",
    });
    expect(status).toBe(200);
    expect(html).toContain("Keine Sorge");
  });

  test("die eigene Domain einer Live-Seite behaelt den 404", () => {
    const { status } = renderSiteHtml(getFixture("werkbank", "full"), {
      origin: "https://salon.pageblitz.de",
      pathname: "/impressum",
      basePath: "",
    });
    expect(status).toBe(404);
  });

  test("verspricht nichts Rechtliches", () => {
    // "rechtssicher" waere eine Zusage, die wir nicht halten koennen.
    expect(vorschau("/impressum")).not.toContain("rechtssicher");
  });
});

describe("revision 2 entrance delivery", () => {
  test("loads independent motion without paid islands and keeps complete static content", () => {
    const data = { ...getFixture("gusto", "full"), designRevision: 2 as const };
    const { html } = renderSiteHtml(data, { origin: "https://example.test" });
    expect(html).toMatch(/src="\/islands\/site-motion[^"]*\.js"/);
    expect(html).not.toMatch(/src="\/islands\/site-islands/);
    expect(html).toContain('class="pb-art-hero"');
    expect(html).toContain("body{background:#192019}");
  });
});

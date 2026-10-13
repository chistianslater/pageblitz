import { expect, test, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";

// Konsistent mit client/src/lib/consent.ts (CONSENT_KEY) und dem gleichnamigen
// Helfer in landing.spec.ts/studio.spec.ts — ohne gespeicherte Einwilligung
// legt sich der Cookie-Banner über die Seite und würde axe auf jeder Seite
// zusätzliche (irrelevante) Landmarken-/Fokus-Funde für den Banner selbst
// liefern statt für die eigentlich zu prüfende Seite. Ausnahme von der "kein
// localStorage"-Regel: reiner Test-Consent-Setup für die Marketing-Site.
const CONSENT_KEY = "pageblitz_site_consent_v1";

async function skipCookieBanner(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          analytics: false,
          marketing: false,
          timestamp: Date.now(),
        })
      );
    },
    { key: CONSENT_KEY }
  );
}

// Kein Dark-Mode-Helfer mehr: Seit dem Studio-Redesign der Landingpage
// (2026-08-23, docs/superpowers/specs/2026-08-23-landing-redesign-brief.md)
// ist "/" ausschließlich hell — kein Toggle, kein `localStorage["lp-theme"]`,
// `prefers-color-scheme` wird ignoriert. Die früheren Dark-Mode-Varianten
// dieses Specs (Desktop/Mobile) entfallen damit ersatzlos.

/**
 * Läuft axe-core gegen die aktuelle Seite und schlägt fehl, sobald ein
 * "critical"- oder "serious"-Fund existiert (Spec §2.7/§4: 0 critical/
 * serious). "moderate"/"minor" werden bewusst NICHT durchgesetzt — das wäre
 * eine schärfere Schwelle als die Spec verlangt und würde false positives
 * aus Drittanbieter-Widgets (Fonts, Analytics-Snippets) in einen Build-Fail
 * verwandeln. Der Fehlertext listet jeden Fund mit `id`, `impact` und dem
 * CSS-Selektor des ersten (und ggf. zweiten/dritten) betroffenen Knotens,
 * damit ein Fehlschlag ohne erneuten lokalen Lauf debugbar ist.
 */
test.beforeEach(async ({ page }) => {
  // Statischer Prüfstand: Der Landing-Scroll-Scrub (GSAP) hält Sektionen
  // unterhalb des Folds im Ausgangszustand (Opacity .3) — axe würde den
  // Übergangszustand statt des Lesezustands messen. Mit reduced-motion
  // rendert alles statisch-sichtbar (wie systems.spec/studio.spec).
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function expectNoSeriousViolations(
  page: Page,
  label: string
): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    v => v.impact === "critical" || v.impact === "serious"
  );
  if (serious.length === 0) return;
  const details = serious
    .map(v => {
      const targets = v.nodes
        .slice(0, 3)
        .map(n => n.target.join(" "))
        .join(" | ");
      return `  - ${v.id} [${v.impact}] ${v.help}\n    nodes: ${targets}`;
    })
    .join("\n");
  throw new Error(
    `axe: ${serious.length} critical/serious Verstoß/-öße auf "${label}":\n${details}`
  );
}

test.describe("A11y (axe): Landingpage", () => {
  test("/ Desktop 1280", async ({ page }) => {
    await skipCookieBanner(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expectNoSeriousViolations(page, "/ (Desktop 1280, Consent gesetzt)");
  });

  test("/ Mobile 390", async ({ page }) => {
    await skipCookieBanner(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expectNoSeriousViolations(page, "/ (Mobile 390, Consent gesetzt)");
  });

  // Ohne skipCookieBanner: prüft die Seite MIT sichtbarem Cookie-Banner
  // (PageblitzCookieBanner) — der Banner selbst muss ebenfalls a11y-sauber
  // sein (Fokus, Kontrast, Rollen), nicht nur der Rest der Seite dahinter.
  test("/ Desktop 1280 mit sichtbarem Cookie-Banner", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expectNoSeriousViolations(
      page,
      "/ (Desktop 1280, Cookie-Banner sichtbar)"
    );
  });
});

/**
 * Öffentliche System-Demos (`/demo/system/<System>/<Beispiel>`) — dieselben
 * Ziele, auf die die alten Pack-Demos per 301 zeigen [E9]: je System ein
 * Beispiel, für das es Hauptsystem ist. Gleiches Gate: 0 critical/serious.
 */
const SYSTEM_DEMOS = [
  "/demo/system/journal/friseur",
  "/demo/system/raster/steuerberater",
  "/demo/system/werkstoff/schreinerei",
  "/demo/system/plakat/musikschule",
  "/demo/system/klar/zahnarzt",
  "/demo/system/nacht/restaurant",
] as const;

test.describe("A11y (axe): System-Demos", () => {
  for (const path of SYSTEM_DEMOS) {
    test(path, async ({ page }) => {
      await skipCookieBanner(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectNoSeriousViolations(page, path);
    });
  }
});

test.describe("A11y (axe): System-Demos Mobil 390 (Stichprobe)", () => {
  for (const path of [SYSTEM_DEMOS[0], SYSTEM_DEMOS[3], SYSTEM_DEMOS[5]]) {
    test(`${path} Mobile 390`, async ({ page }) => {
      await skipCookieBanner(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectNoSeriousViolations(page, `${path} (Mobile 390)`);
    });
  }
});

/**
 * Unterseite (pageHeader + `aria-current` in der Navigation) je System über
 * die Dev-Vorschau (`?seite=`): axe braucht echtes Rendering/Layout, das
 * vitest+renderToStaticMarkup nicht prüft.
 */
test.describe("A11y (axe): Unterseite je System", () => {
  for (const system of [
    "journal",
    "raster",
    "werkstoff",
    "plakat",
    "klar",
    "nacht",
  ] as const) {
    test(`${system} /leistungen-im-detail`, async ({ page }) => {
      await skipCookieBanner(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(
        `/dev/site-preview?system=${system}&fixture=full&seite=leistungen-im-detail`
      );
      await page.waitForLoadState("networkidle");
      await expectNoSeriousViolations(page, `${system} /leistungen-im-detail`);
    });
  }
});

const PANEL_IDS: ChecklistItemId[] = [
  "style",
  "photos",
  "texts",
  "offer",
  "legal",
  "addons",
];

async function seedStudioToken(page: Page): Promise<string> {
  const seed = await page.request.get(
    "/dev/studio-seed?pack=werkbank&fixture=full&json=1"
  );
  const { token } = (await seed.json()) as { token: string };
  return token;
}

test.describe("A11y (axe): Studio", () => {
  test("Checkliste", async ({ page }) => {
    await skipCookieBanner(page);
    const token = await seedStudioToken(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/onboarding/${token}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expectNoSeriousViolations(page, "Studio Checkliste");
  });

  for (const panel of PANEL_IDS) {
    test(`Panel ?panel=${panel}`, async ({ page }) => {
      await skipCookieBanner(page);
      const token = await seedStudioToken(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/onboarding/${token}?panel=${panel}`);
      await page.waitForLoadState("networkidle");
      await expectNoSeriousViolations(page, `Studio Panel "${panel}"`);
    });
  }

  // Stichprobe (Plan B6 Task 5): Extras-Panel MIT aufgeklapptem
  // Unterseiten-Editor (PagesEditor.tsx — Seitenkarte, Mini-Editoren für
  // pageHeader/services, Kontakt-Hinweis, Vorlagen-Select) und der
  // Vorschau-Leiste „Startseite | Seite“ über dem iframe. Die "full"-Fixture
  // bringt eine Demo-Unterseite mit, der Schalter blendet den Editor ein.
  test("Panel ?panel=addons mit Unterseiten-Editor", async ({ page }) => {
    await skipCookieBanner(page);
    const token = await seedStudioToken(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/onboarding/${token}?panel=addons`);
    const addonsPanel = page.getByRole("region", { name: "Extras wählen" });
    await expect(addonsPanel).toBeVisible();
    await addonsPanel
      .locator(".pb-studio-addon-grid li")
      .filter({ hasText: "Unterseiten" })
      .getByRole("button", { name: "Hinzufügen" })
      .click();
    await expect(addonsPanel.getByLabel("Seitentitel Seite 1")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expectNoSeriousViolations(
      page,
      'Studio Panel "addons" mit Unterseiten-Editor'
    );
  });
});

/**
 * Dashboard `/my-website`: Login läuft über `/dev/dashboard-seed`
 * (`server/onboardingV2/devDashboardSeed.ts`, nur außerhalb `production`) —
 * legt Kunde + aktives Abo + aktive Website an und setzt das Session-Cookie
 * genau wie der Magic-Link-Verify (`issueSessionCookie`, geteilt mit
 * `server/_core/magicLinkAuth.ts`). `page.goto(...)` (ohne `json=1`) folgt
 * dem Redirect auf `/my-website` im selben Browser-Kontext, wodurch das
 * Cookie dort landet, bevor `CustomerRoute` die Session prüft.
 */
async function seedDashboardSession(page: Page): Promise<void> {
  await page.goto("/dev/dashboard-seed?pack=werkbank&fixture=full");
  await page.waitForLoadState("networkidle");
}

test.describe("A11y (axe): Dashboard", () => {
  test("Übersicht", async ({ page }) => {
    await skipCookieBanner(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await seedDashboardSession(page);
    await expectNoSeriousViolations(page, "Dashboard Übersicht");
  });

  test("Add-ons-Tab", async ({ page }) => {
    await skipCookieBanner(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await seedDashboardSession(page);
    await page.goto("/my-website?tab=addons");
    await page.waitForLoadState("networkidle");
    await expectNoSeriousViolations(page, "Dashboard Add-ons-Tab");
  });

  test("Anfragen-Tab", async ({ page }) => {
    await skipCookieBanner(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await seedDashboardSession(page);
    await page.goto("/my-website?tab=submissions");
    await page.waitForLoadState("networkidle");
    await expectNoSeriousViolations(page, "Dashboard Anfragen-Tab");
  });
});

/**
 * Designsystem Journal (Plan 2026-10-10, Task 17): alle drei
 * Farbstimmungen im vollen Inhaltsstand, Desktop und Handy (Handy zeigt das
 * Termin-Dock und das Galerie-Karussell, die es auf Desktop nicht gibt).
 * Gleiches Gate: 0 critical/serious.
 */
test.describe("A11y (axe): Designsystem Journal", () => {
  for (const palette of ["papier", "salbei", "ton"] as const) {
    for (const width of [1440, 390] as const) {
      test(`journal ${palette} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=journal&palette=${palette}&fixture=full`
        );
        await page.waitForLoadState("networkidle");
        await expectNoSeriousViolations(
          page,
          `journal ${palette} (${width})`
        );
      });
    }
  }
});

/**
 * Designsystem Raster (Plan 2026-10-11, Task R8): drei Paletten (Kohle =
 * dunkles Papier) im vollen Inhaltsstand, Desktop und Handy (Handy zeigt
 * die Leiste unten). Gleiches Gate: 0 critical/serious.
 */
test.describe("A11y (axe): Designsystem Raster", () => {
  for (const palette of ["papier", "werk", "kohle"] as const) {
    for (const width of [1440, 390] as const) {
      test(`raster ${palette} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=raster&palette=${palette}&fixture=full`
        );
        await page.waitForLoadState("networkidle");
        await expectNoSeriousViolations(page, `raster ${palette} (${width})`);
      });
    }
  }
});

/**
 * Designsystem Werkstoff (Plan 2026-10-11, Task W8): drei Paletten im
 * vollen Inhaltsstand plus die drei Beispielbetriebe (Schreinerei, Bäckerei
 * mit Tageszeitleiste und Wochentafel, Laden ohne Einstiegsfoto), Desktop
 * und Handy. Gleiches Gate: 0 critical/serious.
 */
test.describe("A11y (axe): Designsystem Werkstoff", () => {
  for (const palette of ["kiefer", "leinen", "ton"] as const) {
    for (const width of [1440, 390] as const) {
      test(`werkstoff ${palette} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=werkstoff&palette=${palette}&fixture=full`
        );
        await page.waitForLoadState("networkidle");
        await expectNoSeriousViolations(
          page,
          `werkstoff ${palette} (${width})`
        );
      });
    }
  }
  for (const [showcase, palette] of [
    ["schreinerei", "kiefer"],
    ["baeckerei", "ton"],
    ["laden", "leinen"],
  ] as const) {
    for (const width of [1440, 390] as const) {
      test(`werkstoff ${showcase} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/demo/system/werkstoff/${showcase}?palette=${palette}&live=1`
        );
        await page.waitForLoadState("networkidle");
        await expectNoSeriousViolations(
          page,
          `werkstoff ${showcase} ${palette} (${width})`
        );
      });
    }
  }
});

/**
 * Designsystem Plakat (Plan 2026-10-12, Task P8): drei Paletten im vollen
 * Inhaltsstand plus die drei Beispielbetriebe (Kante Barbershop, Döner Ecke,
 * Studio Puls ohne Foto), Desktop und Handy. Reduzierte Bewegung (beforeEach)
 * hält Startzustände fern; zusätzlich wird bis zum Ende gescrollt. Gleiches
 * Gate: 0 critical/serious.
 */
test.describe("A11y (axe): Designsystem Plakat", () => {
  async function scrollThrough(page: Page): Promise<void> {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
  }
  for (const palette of ["kante", "senf", "puls"] as const) {
    for (const width of [1440, 390] as const) {
      test(`plakat ${palette} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=plakat&palette=${palette}&fixture=full`
        );
        await page.waitForLoadState("networkidle");
        await scrollThrough(page);
        await expectNoSeriousViolations(page, `plakat ${palette} (${width})`);
      });
    }
  }
  for (const [showcase, palette] of [
    ["barbier", "kante"],
    ["imbiss", "senf"],
    ["training", "puls"],
  ] as const) {
    for (const width of [1440, 390] as const) {
      test(`plakat ${showcase} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/demo/system/plakat/${showcase}?palette=${palette}&live=1`
        );
        await page.waitForLoadState("networkidle");
        await scrollThrough(page);
        await expectNoSeriousViolations(
          page,
          `plakat ${showcase} ${palette} (${width})`
        );
      });
    }
  }
});

/**
 * Designsystem Klar (Plan 2026-10-12, Task K8): drei Paletten im vollen
 * Inhaltsstand plus die drei Beispielbetriebe (Zahnarzt Lind, Physio Sand mit
 * kleinem Foto, Kanzlei Wasser ohne Foto), Desktop und Handy. Strenger als
 * die übrigen Systeme: 0 Befunde jeder Schwere (Klar zielt auf ältere
 * Besucher). Reduzierte Bewegung + Durchscrollen hält Startzustände fern.
 */
test.describe("A11y (axe): Designsystem Klar", () => {
  async function scrollThrough(page: Page): Promise<void> {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
  }
  async function expectNoViolations(page: Page, label: string): Promise<void> {
    const results = await new AxeBuilder({ page }).analyze();
    const found = results.violations.map(
      v =>
        `  - ${v.id} [${v.impact}] ${v.help}\n    nodes: ${v.nodes
          .slice(0, 3)
          .map(n => n.target.join(" "))
          .join(" | ")}`
    );
    if (found.length)
      throw new Error(`axe: ${found.length} Befund(e) auf "${label}":\n${found.join("\n")}`);
  }
  for (const palette of ["lind", "wasser", "sand"] as const) {
    for (const width of [1440, 390] as const) {
      test(`klar ${palette} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=klar&palette=${palette}&fixture=full`
        );
        await page.waitForLoadState("networkidle");
        await scrollThrough(page);
        await expectNoViolations(page, `klar ${palette} (${width})`);
      });
    }
  }
  for (const [showcase, palette] of [
    ["zahnarzt", "lind"],
    ["physio", "sand"],
    ["kanzlei", "wasser"],
  ] as const) {
    for (const width of [1440, 390] as const) {
      test(`klar ${showcase} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/demo/system/klar/${showcase}?palette=${palette}&live=1`
        );
        await page.waitForLoadState("networkidle");
        await scrollThrough(page);
        await expectNoViolations(page, `klar ${showcase} ${palette} (${width})`);
      });
    }
  }
});

/**
 * Designsystem Nacht (Plan 2026-10-12, Task N7+N8): drei Paletten im vollen
 * Inhaltsstand plus die drei Beispielbetriebe (Weinberg Petrol mit Foto,
 * Salon Noir Pflaume mit kleinem Foto, Haus am See Nachtblau ohne Foto),
 * Desktop und Handy. Wie Klar: 0 Befunde jeder Schwere — dunkles Papier
 * verlangt geprüften Kontrast überall. Reduzierte Bewegung + Durchscrollen.
 */
test.describe("A11y (axe): Designsystem Nacht", () => {
  async function scrollThrough(page: Page): Promise<void> {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
  }
  async function expectNoViolations(page: Page, label: string): Promise<void> {
    const results = await new AxeBuilder({ page }).analyze();
    const found = results.violations.map(
      v =>
        `  - ${v.id} [${v.impact}] ${v.help}\n    nodes: ${v.nodes
          .slice(0, 3)
          .map(n => n.target.join(" "))
          .join(" | ")}`
    );
    if (found.length)
      throw new Error(`axe: ${found.length} Befund(e) auf "${label}":\n${found.join("\n")}`);
  }
  for (const palette of ["petrol", "pflaume", "nachtblau"] as const) {
    for (const width of [1440, 390] as const) {
      test(`nacht ${palette} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        // Ausdrücklich ohne Bewegung: keine Startzustände (opacity 0) im axe-Lauf.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/dev/site-preview?system=nacht&palette=${palette}&fixture=full`
        );
        await page.waitForLoadState("networkidle");
        await scrollThrough(page);
        await expectNoViolations(page, `nacht ${palette} (${width})`);
      });
    }
  }
  for (const [showcase, palette] of [
    ["weinberg", "petrol"],
    ["noir", "pflaume"],
    ["pension", "nachtblau"],
  ] as const) {
    for (const width of [1440, 390] as const) {
      test(`nacht ${showcase} ${width}`, async ({ page }) => {
        await skipCookieBanner(page);
        // Ausdrücklich ohne Bewegung: keine Startzustände (opacity 0) im axe-Lauf.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/demo/system/nacht/${showcase}?palette=${palette}&live=1`
        );
        await page.waitForLoadState("networkidle");
        await scrollThrough(page);
        await expectNoViolations(page, `nacht ${showcase} ${palette} (${width})`);
      });
    }
  }
});

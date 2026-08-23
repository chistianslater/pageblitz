import { expect, test, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PACK_IDS } from "@shared/siteContract/types";
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

// `LandingPage` initialisiert `isDark` aus `localStorage["lp-theme"]`
// (Standard: hell, "dark" nur nach explizitem Toggle) — analog zu
// `skipCookieBanner` setzt dieser Helfer den Zustand VOR der Navigation per
// `addInitScript`, damit die Seite bereits im ersten Render dunkel startet
// (`data-lp-theme="dark"` auf `.lp-root`) statt erst nach einem Klick auf
// den Theme-Toggle-Button.
async function setDarkTheme(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("lp-theme", "dark");
  });
}

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

  // Dark-Mode-Variante (Spec §2.5): `isDark` kommt aus `localStorage["lp-theme"]`
  // (siehe `setDarkTheme` oben) — Kontrastfixes bei Funden gehören in die
  // Dark-Klassen von LandingPage.tsx/PackShowcase.tsx, nicht in die Light-Variante.
  test("/ Desktop 1280 Dark Mode", async ({ page }) => {
    await skipCookieBanner(page);
    await setDarkTheme(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".lp-root")).toHaveAttribute(
      "data-lp-theme",
      "dark"
    );
    await expectNoSeriousViolations(page, "/ (Desktop 1280, Dark Mode)");
  });

  test("/ Mobile 390 Dark Mode", async ({ page }) => {
    await skipCookieBanner(page);
    await setDarkTheme(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".lp-root")).toHaveAttribute(
      "data-lp-theme",
      "dark"
    );
    await expectNoSeriousViolations(page, "/ (Mobile 390, Dark Mode)");
  });
});

test.describe("A11y (axe): Demo-Seiten je Pack", () => {
  for (const pack of PACK_IDS) {
    test(`/demo/${pack}`, async ({ page }) => {
      await skipCookieBanner(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/demo/${pack}`);
      await page.waitForLoadState("networkidle");
      await expectNoSeriousViolations(page, `/demo/${pack}`);
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

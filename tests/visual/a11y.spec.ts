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
 * Dashboard `/my-website` ist bewusst NICHT Teil dieser Spec: Der Route ist
 * über `CustomerRoute` (client/src/components/ProtectedRoute.tsx) an eine
 * echte Session gebunden. Es gibt weder einen Dev-Bypass-Endpunkt noch eine
 * Test-Route, die eine Session-Cookie direkt setzt — der einzige reguläre
 * Weg ist der Magic-Link-Flow (`server/_core/magicLinkAuth.ts`:
 * POST /api/auth/magic-link → E-Mail mit Token → GET
 * /api/auth/magic-link/verify?token=...). Das würde einen echten Kunden mit
 * aktivem Abo + generierter Website UND direkten DB-Zugriff aus dem
 * Playwright-Test heraus voraussetzen (Token aus `magic_link_tokens` lesen,
 * da kein Mail-Fang im Testsetup existiert) — eine eigene Fixture/Route nur
 * für diese eine a11y-Prüfung wäre eine neue Testinfrastruktur-Investition,
 * die über den Rahmen dieses Polish-Tasks hinausgeht (kein neues
 * Produkt-Feature, aber neue Test-Login-Infrastruktur). Bewusste Lücke,
 * siehe Task-7-Bericht — Nachtrag für B5/Testinfrastruktur.
 */
test.skip("Dashboard /my-website — kein stabiler Test-Login-Weg, siehe Kommentar oben", () => {});

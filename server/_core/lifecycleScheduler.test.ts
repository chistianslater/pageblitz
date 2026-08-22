import { describe, expect, test } from "vitest";
import { buildStudioUrl, buildWelcomeBackLink } from "./lifecycleScheduler";

// APP_BASE_URL wird beim Modul-Import einmalig aus process.env.APP_BASE_URL
// gelesen (Default "https://pageblitz.de", siehe lifecycleScheduler.ts) —
// die Tests prüfen daher nur die Pfadform, nicht die konkrete Basis-URL.
describe("buildStudioUrl", () => {
  test("baut /onboarding/<token> statt des defekten /preview/<websiteId>/onboarding-Musters", () => {
    const url = buildStudioUrl("tok_abc123");
    expect(url.endsWith("/onboarding/tok_abc123")).toBe(true);
    expect(url).not.toContain("/preview/");
  });

  test("verwendet den echten previewToken, nicht eine numerische Website-ID", () => {
    const url = buildStudioUrl("tok_xyz789");
    expect(url).toContain("tok_xyz789");
  });
});

describe("buildWelcomeBackLink (Regressionsschutz — unverändert von diesem Task)", () => {
  test("baut /welcome-back?token=<seedToken>", () => {
    const url = buildWelcomeBackLink("seed_1");
    expect(url).toContain("/welcome-back?token=seed_1");
  });
});

import { describe, expect, test } from "vitest";
import { resolveLegacyRedirectTarget } from "./legacyRedirect";

describe("resolveLegacyRedirectTarget", () => {
  test("ungültige id → sofort /my-website", () => {
    expect(
      resolveLegacyRedirectTarget({
        id: 0,
        idIsValid: false,
        hasError: false,
        data: undefined,
      })
    ).toBe("/my-website");
  });

  test("Ladefehler (z.B. nicht eingeloggt) → /my-website", () => {
    expect(
      resolveLegacyRedirectTarget({
        id: 42,
        idIsValid: true,
        hasError: true,
        data: undefined,
      })
    ).toBe("/my-website");
  });

  test("Daten noch nicht geladen → null (nicht navigieren)", () => {
    expect(
      resolveLegacyRedirectTarget({
        id: 42,
        idIsValid: true,
        hasError: false,
        data: undefined,
      })
    ).toBeNull();
  });

  test("Website gefunden mit previewToken → /onboarding/<token>", () => {
    expect(
      resolveLegacyRedirectTarget({
        id: 42,
        idIsValid: true,
        hasError: false,
        data: [{ website: { id: 42, previewToken: "tok-abc" } }],
      })
    ).toBe("/onboarding/tok-abc");
  });

  test("Website gehört nicht der eingeloggten Person (nicht in getMyWebsites) → /my-website", () => {
    expect(
      resolveLegacyRedirectTarget({
        id: 42,
        idIsValid: true,
        hasError: false,
        data: [{ website: { id: 99, previewToken: "tok-other" } }],
      })
    ).toBe("/my-website");
  });

  test("Website gefunden aber ohne previewToken → /my-website", () => {
    expect(
      resolveLegacyRedirectTarget({
        id: 42,
        idIsValid: true,
        hasError: false,
        data: [{ website: { id: 42, previewToken: null } }],
      })
    ).toBe("/my-website");
  });
});

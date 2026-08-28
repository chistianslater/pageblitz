import { describe, expect, test } from "vitest";
import {
  ABANDONED_PREVIEW_TTL_MS,
  isAbandonedPreviewWithoutEmail,
  type AbandonedPreviewCandidate,
} from "./abandonedPreviews";

const now = new Date("2026-08-28T12:00:00.000Z");
const old = new Date(now.getTime() - ABANDONED_PREVIEW_TTL_MS - 1000);
const fresh = new Date(now.getTime() - 60 * 60 * 1000);

function site(
  overrides: Partial<AbandonedPreviewCandidate> = {}
): AbandonedPreviewCandidate {
  return {
    id: 1,
    status: "preview",
    customerEmail: null,
    paidAt: null,
    createdAt: old,
    ...overrides,
  };
}

describe("isAbandonedPreviewWithoutEmail", () => {
  test("löscht alte Preview ohne E-Mail", () => {
    expect(isAbandonedPreviewWithoutEmail(site(), now)).toBe(true);
  });

  test("rührt Live-/Sold-/Active-Sites nicht an", () => {
    expect(
      isAbandonedPreviewWithoutEmail(site({ status: "active" }), now)
    ).toBe(false);
    expect(
      isAbandonedPreviewWithoutEmail(site({ status: "sold" }), now)
    ).toBe(false);
    expect(
      isAbandonedPreviewWithoutEmail(site({ status: "inactive" }), now)
    ).toBe(false);
  });

  test("mit E-Mail keine Löschung (Magic-Link / Dashboard)", () => {
    expect(
      isAbandonedPreviewWithoutEmail(
        site({ customerEmail: "kunde@example.com" }),
        now
      )
    ).toBe(false);
    expect(
      isAbandonedPreviewWithoutEmail(site({ customerEmail: "  " }), now)
    ).toBe(true);
  });

  test("bezahlte Site (paidAt) bleibt, auch ohne E-Mail", () => {
    expect(
      isAbandonedPreviewWithoutEmail(site({ paidAt: now }), now)
    ).toBe(false);
  });

  test("frische Preview unter TTL bleibt stehen", () => {
    expect(
      isAbandonedPreviewWithoutEmail(site({ createdAt: fresh }), now)
    ).toBe(false);
  });

  test("TTL ist 24 Stunden, nicht eine Woche", () => {
    expect(ABANDONED_PREVIEW_TTL_MS).toBe(24 * 60 * 60 * 1000);
    const almost = new Date(now.getTime() - ABANDONED_PREVIEW_TTL_MS + 60_000);
    const justOver = new Date(now.getTime() - ABANDONED_PREVIEW_TTL_MS - 1);
    expect(
      isAbandonedPreviewWithoutEmail(site({ createdAt: almost }), now)
    ).toBe(false);
    expect(
      isAbandonedPreviewWithoutEmail(site({ createdAt: justOver }), now)
    ).toBe(true);
  });
});

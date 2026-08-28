import { beforeEach, describe, expect, test, vi } from "vitest";

const insertValues = vi.fn();
const onDuplicateKeyUpdate = vi.fn().mockResolvedValue(undefined);
const groupBy = vi.fn();
const from = vi.fn();
const select = vi.fn();
const getDb = vi.fn();
const getWebsiteByToken = vi.fn();

vi.mock("../db", () => ({
  getDb: (...args: unknown[]) => getDb(...args),
  getWebsiteByToken: (...args: unknown[]) => getWebsiteByToken(...args),
}));

import {
  getStudioFunnelStats,
  hashFunnelValue,
  isFunnelSessionKey,
  recordStudioFunnelEvent,
  resolveFunnelSessionKey,
  sessionKeyFromToken,
  sessionKeyFromWebsiteId,
  trackStudioFunnelFromClient,
} from "./funnel";

function mockDb() {
  insertValues.mockReturnValue({ onDuplicateKeyUpdate });
  from.mockReturnValue({ groupBy });
  select.mockReturnValue({ from });
  getDb.mockResolvedValue({
    insert: vi.fn().mockReturnValue({ values: insertValues }),
    select,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDb();
  getWebsiteByToken.mockResolvedValue(undefined);
});

describe("resolveFunnelSessionKey", () => {
  test("Token schlägt sessionKey und websiteId", () => {
    const tokenKey = sessionKeyFromToken("tok-1");
    expect(resolveFunnelSessionKey({ token: "tok-1", websiteId: 9 })).toBe(
      tokenKey
    );
    expect(tokenKey).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenKey).not.toBe("tok-1");
  });

  test("akzeptiert nur 64-Hex als anonymen sessionKey", () => {
    const hex = hashFunnelValue("anon");
    expect(isFunnelSessionKey(hex)).toBe(true);
    expect(resolveFunnelSessionKey({ sessionKey: hex })).toBe(hex);
    expect(resolveFunnelSessionKey({ sessionKey: "short" })).toBeNull();
    expect(resolveFunnelSessionKey({ websiteId: 7 })).toBe(
      sessionKeyFromWebsiteId(7)
    );
  });
});

describe("recordStudioFunnelEvent", () => {
  test("schreibt step + gehashtes Token, kein Klartext", async () => {
    const ok = await recordStudioFunnelEvent({
      step: "studio_opened",
      token: "preview-token-secret",
      websiteId: 42,
    });
    expect(ok).toBe(true);
    expect(insertValues).toHaveBeenCalledTimes(1);
    const row = insertValues.mock.calls[0][0];
    expect(row.step).toBe("studio_opened");
    expect(row.websiteId).toBe(42);
    expect(row.sessionKey).toBe(sessionKeyFromToken("preview-token-secret"));
    expect(JSON.stringify(row)).not.toContain("preview-token-secret");
    expect(onDuplicateKeyUpdate).toHaveBeenCalled();
  });

  test("zweiter Write desselben Steps ist idempotent (onDuplicateKeyUpdate)", async () => {
    await recordStudioFunnelEvent({
      step: "step_legal",
      token: "tok",
      websiteId: 1,
    });
    await recordStudioFunnelEvent({
      step: "step_legal",
      token: "tok",
      websiteId: 1,
    });
    expect(insertValues).toHaveBeenCalledTimes(2);
    expect(onDuplicateKeyUpdate).toHaveBeenCalledTimes(2);
    expect(insertValues.mock.calls[0][0].sessionKey).toBe(
      insertValues.mock.calls[1][0].sessionKey
    );
  });

  test("ohne sessionKey/Token/websiteId → kein Insert", async () => {
    const ok = await recordStudioFunnelEvent({
      step: "landing_start",
      sessionKey: "not-a-hash",
    });
    expect(ok).toBe(false);
    expect(insertValues).not.toHaveBeenCalled();
  });

  test("DB-Fehler wird geschluckt", async () => {
    onDuplicateKeyUpdate.mockRejectedValueOnce(new Error("duplicate"));
    const ok = await recordStudioFunnelEvent({
      step: "email_captured",
      websiteId: 3,
    });
    expect(ok).toBe(false);
  });
});

describe("trackStudioFunnelFromClient", () => {
  test("ungültiger Token → kein Record", async () => {
    getWebsiteByToken.mockResolvedValue(undefined);
    const result = await trackStudioFunnelFromClient({
      step: "studio_opened",
      token: "unknown",
    });
    expect(result).toEqual({ ok: false });
    expect(insertValues).not.toHaveBeenCalled();
  });

  test("gültiger Token löst websiteId auf", async () => {
    getWebsiteByToken.mockResolvedValue({ id: 99, previewToken: "tok" });
    const result = await trackStudioFunnelFromClient({
      step: "studio_opened",
      token: "tok",
    });
    expect(result).toEqual({ ok: true });
    expect(insertValues.mock.calls[0][0].websiteId).toBe(99);
  });

  test("Landing ohne Token nutzt den anonymen sessionKey", async () => {
    const sessionKey = hashFunnelValue("landing");
    const result = await trackStudioFunnelFromClient({
      step: "landing_start",
      sessionKey,
    });
    expect(result).toEqual({ ok: true });
    expect(insertValues.mock.calls[0][0]).toMatchObject({
      step: "landing_start",
      sessionKey,
      websiteId: null,
    });
  });
});

describe("getStudioFunnelStats", () => {
  test("aggregiert DISTINCT-Counts und Drop-off", async () => {
    groupBy.mockResolvedValue([
      { step: "landing_start", count: "20" },
      { step: "studio_opened", count: 10 },
      { step: "paid_or_live", count: 2 },
      { step: "abandoned_preview", count: 5 },
    ]);
    const stats = await getStudioFunnelStats();
    expect(stats.steps[0]).toMatchObject({
      step: "landing_start",
      count: 20,
      dropOffRate: null,
    });
    expect(stats.steps[1]).toMatchObject({
      step: "studio_opened",
      count: 10,
      dropOffCount: 10,
      dropOffRate: 0.5,
    });
    expect(stats.abandoned).toMatchObject({
      step: "abandoned_preview",
      count: 5,
    });
    const paid = stats.steps.find(s => s.step === "paid_or_live");
    expect(paid?.count).toBe(2);
  });

  test("ohne DB → leere Aggregation", async () => {
    getDb.mockResolvedValue(null);
    const stats = await getStudioFunnelStats();
    expect(stats.steps.every(s => s.count === 0)).toBe(true);
  });
});

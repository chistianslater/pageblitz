import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./db", () => ({
  listOrphanSubscriptionsByCustomerEmail: vi.fn(),
  updateSubscription: vi.fn(),
}));
import * as db from "./db";
import { linkOrphanSubscriptionsToUser } from "./linkSubscriptions";

const mockedDb = vi.mocked(db);

beforeEach(() => vi.clearAllMocks());

describe("linkOrphanSubscriptionsToUser", () => {
  test("bindet alle verwaisten Abos an den Nutzer und gibt die Anzahl zurück", async () => {
    mockedDb.listOrphanSubscriptionsByCustomerEmail.mockResolvedValue([
      { id: 1 } as any,
      { id: 2 } as any,
    ]);

    const count = await linkOrphanSubscriptionsToUser(42, "kunde@example.com");

    expect(count).toBe(2);
    expect(mockedDb.updateSubscription).toHaveBeenCalledTimes(2);
    expect(mockedDb.updateSubscription).toHaveBeenCalledWith(1, {
      userId: 42,
    });
    expect(mockedDb.updateSubscription).toHaveBeenCalledWith(2, {
      userId: 42,
    });
  });

  test("keine Treffer → 0, keine Updates", async () => {
    mockedDb.listOrphanSubscriptionsByCustomerEmail.mockResolvedValue([]);

    const count = await linkOrphanSubscriptionsToUser(42, "kunde@example.com");

    expect(count).toBe(0);
    expect(mockedDb.updateSubscription).not.toHaveBeenCalled();
  });

  test("idempotent: zweiter Aufruf nach dem Binden findet nichts mehr", async () => {
    mockedDb.listOrphanSubscriptionsByCustomerEmail
      .mockResolvedValueOnce([{ id: 1 } as any])
      .mockResolvedValueOnce([]);

    const first = await linkOrphanSubscriptionsToUser(42, "kunde@example.com");
    const second = await linkOrphanSubscriptionsToUser(42, "kunde@example.com");

    expect(first).toBe(1);
    expect(second).toBe(0);
    expect(mockedDb.updateSubscription).toHaveBeenCalledTimes(1);
  });

  test("gibt die E-Mail unverändert an die DB-Abfrage weiter (Normalisierung liegt in db.ts)", async () => {
    mockedDb.listOrphanSubscriptionsByCustomerEmail.mockResolvedValue([]);

    await linkOrphanSubscriptionsToUser(42, "  Kunde@Example.com ");

    expect(
      mockedDb.listOrphanSubscriptionsByCustomerEmail
    ).toHaveBeenCalledWith("  Kunde@Example.com ");
  });
});

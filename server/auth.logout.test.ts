import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  value?: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

/**
 * Der Test lief lange nicht: server/routers.ts zieht ueber checkout.ts einen
 * Stripe-Client, dessen Konstruktor ohne Schluessel wirft — die Datei brach
 * beim Einlesen ab und stand als "0 test" im Bericht. Seit vitest.config.ts
 * einen Platzhalter-Schluessel setzt, laeuft sie wieder, und dabei kam heraus,
 * dass die Attrappe zur Implementierung nicht mehr passte: logout setzt das
 * Cookie zuerst per res.cookie(…, "", { maxAge: 0 }) und ruft clearCookie nur
 * als Nachhut. Beides wird jetzt aufgezeichnet und geprueft.
 */
function createAuthContext(): {
  ctx: TrpcContext;
  setCookies: CookieCall[];
  clearedCookies: CookieCall[];
} {
  const setCookies: CookieCall[] = [];
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (
        name: string,
        value: string,
        options: Record<string, unknown>
      ) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookies, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, setCookies, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });

    // Ueberschreiben mit leerem Wert und abgelaufener Frist — das ist der
    // Schritt, der die Sitzung im Browser tatsaechlich beendet.
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
    expect(setCookies[0]?.value).toBe("");
    expect(setCookies[0]?.options).toMatchObject({
      maxAge: 0,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });

    // Nachhut: clearCookie mit denselben Attributen, sonst ignoriert der
    // Browser das Loeschen (Attribute muessen zum gesetzten Cookie passen).
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});

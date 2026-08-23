import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  DEFAULT_UMAMI_SCRIPT_URL,
  getUmamiApiUrl,
  getUmamiScriptUrl,
  getUmamiStats,
  isUmamiConfigured,
  registerUmamiWebsite,
  resetUmamiAuthCache,
  umamiScriptTag,
} from "./umami";

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 500) {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

const tokenEnv = {
  UMAMI_API_URL: "https://analytics.example.de/",
  UMAMI_API_TOKEN: "tok-123",
};

beforeEach(() => {
  resetUmamiAuthCache();
});

describe("Umami — Konfiguration aus Env", () => {
  test("getUmamiApiUrl: UMAMI_API_URL vor UMAMI_URL, ohne Slash am Ende; ohne beides null", () => {
    expect(getUmamiApiUrl(tokenEnv)).toBe("https://analytics.example.de");
    expect(getUmamiApiUrl({ UMAMI_URL: "http://localhost:3001/" })).toBe(
      "http://localhost:3001"
    );
    expect(
      getUmamiApiUrl({
        UMAMI_API_URL: "https://a.example.de",
        UMAMI_URL: "https://b.example.de",
      })
    ).toBe("https://a.example.de");
    expect(getUmamiApiUrl({})).toBeNull();
  });

  test("isUmamiConfigured: API-URL plus Token ODER Login-Daten", () => {
    expect(isUmamiConfigured(tokenEnv)).toBe(true);
    expect(
      isUmamiConfigured({
        UMAMI_URL: "https://a.example.de",
        UMAMI_USERNAME: "admin",
        UMAMI_PASSWORD: "geheim",
      })
    ).toBe(true);
    expect(isUmamiConfigured({ UMAMI_API_URL: "https://a.example.de" })).toBe(
      false
    );
    expect(isUmamiConfigured({ UMAMI_API_TOKEN: "tok" })).toBe(false);
    expect(isUmamiConfigured({})).toBe(false);
  });

  test("getUmamiScriptUrl: explizit > aus API-URL abgeleitet > Default", () => {
    expect(
      getUmamiScriptUrl({
        ...tokenEnv,
        UMAMI_SCRIPT_URL: "https://cdn.example.de/u.js",
      })
    ).toBe("https://cdn.example.de/u.js");
    expect(getUmamiScriptUrl(tokenEnv)).toBe(
      "https://analytics.example.de/script.js"
    );
    expect(getUmamiScriptUrl({})).toBe(DEFAULT_UMAMI_SCRIPT_URL);
    expect(DEFAULT_UMAMI_SCRIPT_URL).toBe(
      "https://analytics.pageblitz.de/script.js"
    );
  });

  test("umamiScriptTag: defer, data-website-id, Attribute escaped", () => {
    const tag = umamiScriptTag("abc-123", tokenEnv);
    expect(tag).toBe(
      '<script defer src="https://analytics.example.de/script.js" data-website-id="abc-123"></script>'
    );
    expect(umamiScriptTag('x"><script>', tokenEnv)).not.toContain('"><script>');
    expect(umamiScriptTag('x"><script>', tokenEnv)).toContain(
      'data-website-id="x&quot;&gt;&lt;script&gt;"'
    );
  });
});

describe("registerUmamiWebsite", () => {
  test("POST /api/websites mit Bearer-Token und {name, domain} → id", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ id: "site-uuid-1", name: "Brandt" }));

    const id = await registerUmamiWebsite(
      "Schreinerei Brandt",
      "brandt.pageblitz.de",
      { env: tokenEnv, fetchImpl }
    );

    expect(id).toBe("site-uuid-1");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://analytics.example.de/api/websites");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer tok-123");
    expect(JSON.parse(init.body)).toEqual({
      name: "Schreinerei Brandt",
      domain: "brandt.pageblitz.de",
    });
  });

  test("ohne Konfiguration → null, kein fetch", async () => {
    const fetchImpl = vi.fn();
    expect(
      await registerUmamiWebsite("X", "x.pageblitz.de", { env: {}, fetchImpl })
    ).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test("Login-Fallback (UMAMI_URL + USERNAME/PASSWORD, kein Token): erst /api/auth/login, dann Registrierung; Token wird gecacht", async () => {
    const env = {
      UMAMI_URL: "https://analytics.example.de",
      UMAMI_USERNAME: "admin",
      UMAMI_PASSWORD: "geheim",
    };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ token: "login-jwt" }))
      .mockResolvedValueOnce(jsonResponse({ id: "site-1" }))
      .mockResolvedValueOnce(jsonResponse({ id: "site-2" }));

    const first = await registerUmamiWebsite("A", "a.pageblitz.de", {
      env,
      fetchImpl,
    });
    const second = await registerUmamiWebsite("B", "b.pageblitz.de", {
      env,
      fetchImpl,
    });

    expect(first).toBe("site-1");
    expect(second).toBe("site-2");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    const [loginUrl, loginInit] = fetchImpl.mock.calls[0];
    expect(loginUrl).toBe("https://analytics.example.de/api/auth/login");
    expect(JSON.parse(loginInit.body)).toEqual({
      username: "admin",
      password: "geheim",
    });
    expect(fetchImpl.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer login-jwt"
    );
    expect(fetchImpl.mock.calls[2][1].headers.Authorization).toBe(
      "Bearer login-jwt"
    );
  });

  test("HTTP-Fehler → null (kein Throw)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: "nope" }, false, 401));
    await expect(
      registerUmamiWebsite("X", "x.pageblitz.de", { env: tokenEnv, fetchImpl })
    ).resolves.toBeNull();
  });

  test("Netzwerkfehler (fetch wirft) → null (kein Throw)", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(
      registerUmamiWebsite("X", "x.pageblitz.de", { env: tokenEnv, fetchImpl })
    ).resolves.toBeNull();
  });

  test("Antwort ohne id → null", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ name: "X" }));
    await expect(
      registerUmamiWebsite("X", "x.pageblitz.de", { env: tokenEnv, fetchImpl })
    ).resolves.toBeNull();
  });
});

describe("getUmamiStats", () => {
  test("liest 30-Tage-Statistik und rechnet Absprungrate/Verweildauer um", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        pageviews: { value: 120 },
        visitors: { value: 40 },
        bounces: { value: 10 },
        totaltime: { value: 4000 },
      })
    );

    const stats = await getUmamiStats("site-1", { env: tokenEnv, fetchImpl });

    expect(stats).toEqual({
      pageviews: 120,
      visitors: 40,
      bounceRate: 25,
      avgDuration: 100,
    });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toMatch(
      /^https:\/\/analytics\.example\.de\/api\/websites\/site-1\/stats\?startAt=\d+&endAt=\d+$/
    );
    expect(init.headers.Authorization).toBe("Bearer tok-123");
  });

  test("ohne Konfiguration oder bei Fehler → null", async () => {
    expect(
      await getUmamiStats("site-1", { env: {}, fetchImpl: vi.fn() })
    ).toBeNull();
    const failing = vi.fn().mockRejectedValue(new Error("down"));
    expect(
      await getUmamiStats("site-1", { env: tokenEnv, fetchImpl: failing })
    ).toBeNull();
  });
});

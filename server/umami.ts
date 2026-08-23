/**
 * Umami Analytics — Client für die selbst gehostete Instanz (Plan B6 Task 7).
 *
 * Aufgaben:
 * - `registerUmamiWebsite(name, domain)`: legt die Kundenseite in Umami an
 *   und liefert die Umami-Website-ID (für `data-website-id` im Tracking-
 *   Script und `generatedWebsites.umamiWebsiteId`). Aufrufer:
 *   server/umamiProvisioning.ts (bei Aktivierung einer Website).
 * - `getUmamiStats(websiteId)`: 30-Tage-Statistik fürs Kunden-Dashboard
 *   (`customer.getAnalytics` in server/routers.ts).
 * - `umamiScriptTag(websiteId)` / `getUmamiScriptUrl()`: Script-URL für SSR
 *   (server/ssr/renderSite.tsx) und CSR (`website.get` → SitePage.tsx).
 *
 * Env (alle optional — ohne Konfiguration sind Registrierung und Statistik
 * stille No-ops, die Aktivierung einer Website läuft trotzdem durch):
 * - `UMAMI_API_URL` (bevorzugt) oder `UMAMI_URL`: Basis-URL der Instanz,
 *   z. B. https://analytics.pageblitz.de (API unter /api/…).
 * - `UMAMI_API_TOKEN`: Bearer-Token (Umami: einmal per
 *   `POST /api/auth/login` erzeugt; läuft nicht ab). Fehlt er, loggt sich der
 *   Client mit `UMAMI_USERNAME`/`UMAMI_PASSWORD` ein und cacht das Token 12 h
 *   (Bestandskonfiguration auf dem Prod-Server).
 * - `UMAMI_SCRIPT_URL`: URL des Tracking-Scripts; Default `<API-URL>/script.js`,
 *   ganz ohne Konfiguration https://analytics.pageblitz.de/script.js.
 *
 * DSGVO: Umami ist cookielos und speichert keine personenbezogenen Daten
 * (IP wird nicht gespeichert) — Einbindung ohne Consent, Hinweis in der
 * Datenschutz-Vorlage (server/legalGenerator.ts).
 *
 * Fehlerverhalten: JEDER Fehler (Netz, HTTP ≠ 2xx, unerwartete Antwort) wird
 * geloggt und als `null` zurückgegeben — nie geworfen. Die Aufrufer hängen an
 * Aktivierungs-/Webhook-Pfaden, die nicht an der Statistik scheitern dürfen.
 */

export interface UmamiEnv {
  /** Index-Signatur, damit `process.env` (NodeJS.ProcessEnv) direkt passt. */
  [key: string]: string | undefined;
  UMAMI_API_URL?: string;
  UMAMI_URL?: string;
  UMAMI_API_TOKEN?: string;
  UMAMI_USERNAME?: string;
  UMAMI_PASSWORD?: string;
  UMAMI_SCRIPT_URL?: string;
}

export interface UmamiClientOptions {
  /** Env-Quelle (Default process.env) — Tests übergeben ein eigenes Objekt. */
  env?: UmamiEnv;
  /** fetch-Implementierung (Default globalThis.fetch) — Tests mocken hier. */
  fetchImpl?: typeof fetch;
}

export interface UmamiStats {
  pageviews: number;
  visitors: number;
  /** Absprungrate in Prozent (0–100). */
  bounceRate: number;
  /** Durchschnittliche Verweildauer in Sekunden. */
  avgDuration: number;
}

export const DEFAULT_UMAMI_SCRIPT_URL =
  "https://analytics.pageblitz.de/script.js";

/** Timeout je Umami-Request — Aktivierung/Webhook dürfen nicht hängen. */
const REQUEST_TIMEOUT_MS = 8_000;
/** Login-Token (Fallback ohne UMAMI_API_TOKEN) 12 h wiederverwenden. */
const LOGIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

let cachedLoginToken: string | null = null;
let cachedLoginTokenExpiry = 0;

/** Nur für Tests: Login-Token-Cache leeren. */
export function resetUmamiAuthCache(): void {
  cachedLoginToken = null;
  cachedLoginTokenExpiry = 0;
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Basis-URL der Umami-Instanz (ohne Slash am Ende) oder null. */
export function getUmamiApiUrl(env: UmamiEnv = process.env): string | null {
  const raw = env.UMAMI_API_URL?.trim() || env.UMAMI_URL?.trim() || "";
  return raw ? trimSlash(raw) : null;
}

/** URL des Tracking-Scripts (explizit > aus API-URL abgeleitet > Default). */
export function getUmamiScriptUrl(env: UmamiEnv = process.env): string {
  const explicit = env.UMAMI_SCRIPT_URL?.trim();
  if (explicit) return explicit;
  const apiUrl = getUmamiApiUrl(env);
  return apiUrl ? `${apiUrl}/script.js` : DEFAULT_UMAMI_SCRIPT_URL;
}

/** API-URL plus Token ODER Login-Daten vorhanden? */
export function isUmamiConfigured(env: UmamiEnv = process.env): boolean {
  if (!getUmamiApiUrl(env)) return false;
  if (env.UMAMI_API_TOKEN?.trim()) return true;
  return Boolean(env.UMAMI_USERNAME?.trim() && env.UMAMI_PASSWORD);
}

function escAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * `<script defer src="…/script.js" data-website-id="…"></script>` — cookielos,
 * kein Consent nötig. Nur für aktive Sites mit ID rendern (Aufrufer prüft).
 */
export function umamiScriptTag(
  websiteId: string,
  env: UmamiEnv = process.env
): string {
  return `<script defer src="${escAttr(getUmamiScriptUrl(env))}" data-website-id="${escAttr(websiteId)}"></script>`;
}

function resolveFetch(opts: UmamiClientOptions): typeof fetch | null {
  const impl = opts.fetchImpl ?? globalThis.fetch;
  return typeof impl === "function" ? impl : null;
}

async function loginForToken(
  apiUrl: string,
  env: UmamiEnv,
  fetchImpl: typeof fetch
): Promise<string | null> {
  const username = env.UMAMI_USERNAME?.trim();
  const password = env.UMAMI_PASSWORD;
  if (!username || !password) return null;
  if (cachedLoginToken && Date.now() < cachedLoginTokenExpiry) {
    return cachedLoginToken;
  }
  const res = await fetchImpl(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    console.warn(`[Umami] Login fehlgeschlagen (HTTP ${res.status})`);
    return null;
  }
  const data = (await res.json()) as { token?: string };
  if (!data?.token) return null;
  cachedLoginToken = data.token;
  cachedLoginTokenExpiry = Date.now() + LOGIN_TOKEN_TTL_MS;
  return cachedLoginToken;
}

/** "Bearer <token>" — aus UMAMI_API_TOKEN, sonst per Login; null ohne Konfig. */
async function getAuthorization(
  apiUrl: string,
  env: UmamiEnv,
  fetchImpl: typeof fetch
): Promise<string | null> {
  const staticToken = env.UMAMI_API_TOKEN?.trim();
  if (staticToken) return `Bearer ${staticToken}`;
  const token = await loginForToken(apiUrl, env, fetchImpl);
  return token ? `Bearer ${token}` : null;
}

/**
 * Legt eine Website in Umami an (`POST /api/websites`) und liefert ihre ID.
 * Nicht idempotent auf Umami-Seite — die Idempotenz (keine zweite
 * Registrierung bei vorhandener ID) liegt in server/umamiProvisioning.ts.
 * Liefert null, wenn Umami nicht konfiguriert ist oder der Aufruf scheitert.
 */
export async function registerUmamiWebsite(
  name: string,
  domain: string,
  opts: UmamiClientOptions = {}
): Promise<string | null> {
  const env = opts.env ?? process.env;
  const apiUrl = getUmamiApiUrl(env);
  const fetchImpl = resolveFetch(opts);
  if (!apiUrl || !fetchImpl || !isUmamiConfigured(env)) {
    console.log(
      "[Umami] Nicht konfiguriert (UMAMI_API_URL/UMAMI_URL + UMAMI_API_TOKEN oder UMAMI_USERNAME/UMAMI_PASSWORD) — keine Registrierung"
    );
    return null;
  }
  try {
    const authorization = await getAuthorization(apiUrl, env, fetchImpl);
    if (!authorization) return null;
    const res = await fetchImpl(`${apiUrl}/api/websites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({ name, domain }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(
        `[Umami] Registrierung von ${domain} fehlgeschlagen (HTTP ${res.status})`
      );
      return null;
    }
    const data = (await res.json()) as { id?: unknown };
    if (typeof data?.id !== "string" || !data.id) {
      console.warn(`[Umami] Registrierung von ${domain}: Antwort ohne id`);
      return null;
    }
    return data.id;
  } catch (err) {
    console.warn(`[Umami] Registrierung von ${domain} fehlgeschlagen:`, err);
    return null;
  }
}

/**
 * 30-Tage-Statistik einer Website (`GET /api/websites/:id/stats`).
 * Liefert null, wenn Umami nicht konfiguriert ist oder der Aufruf scheitert.
 */
export async function getUmamiStats(
  websiteId: string,
  opts: UmamiClientOptions = {}
): Promise<UmamiStats | null> {
  const env = opts.env ?? process.env;
  const apiUrl = getUmamiApiUrl(env);
  const fetchImpl = resolveFetch(opts);
  if (!apiUrl || !fetchImpl || !isUmamiConfigured(env)) return null;
  try {
    const authorization = await getAuthorization(apiUrl, env, fetchImpl);
    if (!authorization) return null;
    const endAt = Date.now();
    const startAt = endAt - 30 * 24 * 60 * 60 * 1000;
    const res = await fetchImpl(
      `${apiUrl}/api/websites/${encodeURIComponent(websiteId)}/stats?startAt=${startAt}&endAt=${endAt}`,
      {
        headers: { Authorization: authorization },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      console.warn(
        `[Umami] Statistik für ${websiteId} fehlgeschlagen (HTTP ${res.status})`
      );
      return null;
    }
    const data = (await res.json()) as {
      pageviews?: { value?: number };
      visitors?: { value?: number };
      bounces?: { value?: number };
      totaltime?: { value?: number };
    };
    const visitors = data.visitors?.value ?? 0;
    const bounces = data.bounces?.value ?? 0;
    return {
      pageviews: data.pageviews?.value ?? 0,
      visitors,
      bounceRate: visitors > 0 ? Math.round((bounces / visitors) * 100) : 0,
      avgDuration:
        visitors > 0 ? Math.round((data.totaltime?.value ?? 0) / visitors) : 0,
    };
  } catch (err) {
    console.warn(`[Umami] Statistik für ${websiteId} fehlgeschlagen:`, err);
    return null;
  }
}

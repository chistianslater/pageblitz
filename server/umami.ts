/**
 * Umami Analytics Integration
 * Automatically registers customer websites in the self-hosted Umami instance.
 * DSGVO-compliant: Umami is cookieless and collects no personal data.
 */

const UMAMI_URL = process.env.UMAMI_URL || "http://localhost:3001";
const UMAMI_USERNAME = process.env.UMAMI_USERNAME || "admin";
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD || "";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string | null> {
  if (!UMAMI_PASSWORD) return null;

  // Reuse cached token if still valid (tokens last ~24h, refresh every 12h)
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  try {
    const res = await fetch(`${UMAMI_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: UMAMI_USERNAME, password: UMAMI_PASSWORD }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { token: string };
    cachedToken = data.token;
    tokenExpiry = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
    return cachedToken;
  } catch {
    return null;
  }
}

/**
 * Register a new website in Umami and return its websiteId.
 * Returns null if Umami is not configured or the request fails.
 */
export async function registerUmamiWebsite(name: string, domain: string): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${UMAMI_URL}/api/websites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, domain }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { id: string };
    return data.id;
  } catch {
    return null;
  }
}

/**
 * Fetch 30-day stats for a website from Umami.
 * Returns null if not available.
 */
export async function getUmamiStats(websiteId: string): Promise<{
  pageviews: number;
  visitors: number;
  bounceRate: number;
  avgDuration: number;
} | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const endAt = Date.now();
    const startAt = endAt - 30 * 24 * 60 * 60 * 1000;
    const res = await fetch(
      `${UMAMI_URL}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      pageviews: { value: number };
      visitors: { value: number };
      bounces: { value: number };
      totaltime: { value: number };
    };
    const visitors = data.visitors?.value ?? 0;
    const bounces = data.bounces?.value ?? 0;
    return {
      pageviews: data.pageviews?.value ?? 0,
      visitors,
      bounceRate: visitors > 0 ? Math.round((bounces / visitors) * 100) : 0,
      avgDuration: visitors > 0 ? Math.round((data.totaltime?.value ?? 0) / visitors) : 0,
    };
  } catch {
    return null;
  }
}

/**
 * KI-Bildgenerierung über Cloudflare Workers AI (Flux-1-schnell).
 *
 * Env-Vars:
 * - CLOUDFLARE_API_TOKEN: API-Token mit "Workers AI: Read+Edit"-Rechten
 *   (Dashboard → My Profile → API Tokens). OHNE Token bleibt das Feature
 *   sauber deaktiviert — der Studio-Tab zeigt dann einen Hinweis.
 * - CLOUDFLARE_ACCOUNT_ID: optional; Fallback ist R2_ACCOUNT_ID, weil R2
 *   im selben Cloudflare-Account läuft.
 *
 * Kosten: Flux schnell läuft im täglichen Gratis-Kontingent (Neurons) des
 * Accounts; das Rate-Limit unten schützt zusätzlich vor Missbrauch über
 * den öffentlichen Studio-Token.
 */

const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const GENERATION_TIMEOUT_MS = 60_000;
// Flux schnell erlaubt 1–8 Diffusionsschritte; 8 = beste Qualität.
const FLUX_STEPS = 8;

/** Pro Website und Stunde — großzügig für echte Nutzung, eng für Abuse. */
export const AI_IMAGES_PER_HOUR = 10;
const QUOTA_WINDOW_MS = 60 * 60 * 1000;
const quota = new Map<number, number[]>();

function accountId(): string | undefined {
  return process.env.CLOUDFLARE_ACCOUNT_ID ?? process.env.R2_ACCOUNT_ID;
}

export function isAiImagesConfigured(): boolean {
  return Boolean(process.env.CLOUDFLARE_API_TOKEN && accountId());
}

/**
 * Verbraucht einen Quota-Slot; `false` = Limit erreicht. In-Memory reicht:
 * ein PM2-Prozess, und nach Neustart darf das Fenster ruhig frisch starten.
 */
export function consumeAiImageQuota(websiteId: number): boolean {
  const now = Date.now();
  const recent = (quota.get(websiteId) ?? []).filter(
    t => t > now - QUOTA_WINDOW_MS
  );
  if (recent.length >= AI_IMAGES_PER_HOUR) {
    quota.set(websiteId, recent);
    return false;
  }
  quota.set(websiteId, [...recent, now]);
  return true;
}

/**
 * Kunden tippen deutsch und knapp („Empfangsbereich mit Blumen") — ohne
 * Foto-Rahmen liefert Flux gern Illustrationen/Poster. Der Rahmen zwingt
 * den fotorealistischen Website-Look der Stockbilder.
 */
export function buildAiImagePrompt(subject: string): string {
  return (
    `Professional photograph for a small business website: ${subject.trim()}. ` +
    "Photorealistic, natural soft lighting, high detail, realistic colors, " +
    "no text, no watermark, no logo"
  );
}

/**
 * Generiert ein Bild und liefert es als Base64 (JPEG von Cloudflare)
 * zurück — `null` bei jedem Fehler (Aufrufer übersetzt in eine
 * nutzerfreundliche Meldung). Fehlerdetails landen im Server-Log.
 */
export async function generateAiImage(
  subject: string
): Promise<string | null> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = accountId();
  if (!token || !account) {
    console.warn("[aiImages] CLOUDFLARE_API_TOKEN/ACCOUNT_ID not set");
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: buildAiImagePrompt(subject),
          steps: FLUX_STEPS,
        }),
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      console.error(
        `[aiImages] Cloudflare error ${res.status}: ${(await res.text()).slice(0, 300)}`
      );
      return null;
    }
    const data = (await res.json()) as {
      success?: boolean;
      result?: { image?: string };
    };
    const image = data.result?.image;
    if (!data.success || !image) {
      console.error("[aiImages] unexpected response shape");
      return null;
    }
    return image;
  } catch (e) {
    console.error("[aiImages] fetch failed:", e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

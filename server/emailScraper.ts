/**
 * emailScraper.ts
 *
 * Scrapes business contact email addresses from their websites.
 * German businesses are legally required to list an email in their Impressum (§5 TMG),
 * making /impressum the most reliable source.
 *
 * Uses Node's native http/https modules instead of fetch() because the VPS
 * environment fails TLS verification via fetch (UNABLE_TO_GET_ISSUER_CERT_LOCALLY),
 * while curl/https.request work fine.
 */

import * as https from "https";
import * as http from "http";
import { URL } from "url";

// Patterns to skip – not real contact addresses
const EMAIL_BLACKLIST = [
  "example", "muster", "placeholder", "noreply", "no-reply", "donotreply",
  "test@", "info@example", "@sentry", "@w3", "schema.org",
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp",
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const FETCH_TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 500_000;
const MAX_REDIRECTS = 4;

function extractEmailsFromHtml(html: string): string[] {
  // Decode common HTML obfuscation techniques
  const decoded = html
    .replace(/&#64;/g, "@")
    .replace(/&#x40;/gi, "@")
    .replace(/\[at\]/gi, "@")
    .replace(/\(at\)/gi, "@")
    .replace(/\s+at\s+/gi, "@")
    .replace(/&#46;/g, ".")
    .replace(/\[dot\]/gi, ".")
    .replace(/\(dot\)/gi, ".");

  const found = decoded.match(EMAIL_REGEX) || [];

  return found
    .map((e) => e.toLowerCase().trim())
    .filter((e) => {
      const [, domain] = e.split("@");
      if (!domain || !domain.includes(".")) return false;
      if (EMAIL_BLACKLIST.some((b) => e.includes(b))) return false;
      return true;
    });
}

/** Fetch a URL using Node's http/https modules with redirect following. */
async function fetchPage(rawUrl: string, redirectsLeft = MAX_REDIRECTS): Promise<string | null> {
  if (redirectsLeft < 0) return null;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  const isHttps = parsed.protocol === "https:";
  const mod = isHttps ? https : http;

  return new Promise((resolve) => {
    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: (parsed.pathname || "/") + (parsed.search || ""),
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Pageblitz-Crawler/1.0; +https://pageblitz.de)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "de-DE,de;q=0.9",
        Connection: "close",
      },
      // Ignore certificate errors – many small business sites have self-signed / expired certs
      rejectUnauthorized: false,
      timeout: FETCH_TIMEOUT_MS,
    };

    const req = (mod as typeof https).request(options, (res) => {
      const status = res.statusCode ?? 0;

      // Follow redirects
      if ((status === 301 || status === 302 || status === 303 || status === 307 || status === 308) && res.headers.location) {
        res.resume(); // Drain the response
        let redirectUrl = res.headers.location;
        // Handle relative redirects
        if (!redirectUrl.startsWith("http")) {
          redirectUrl = new URL(redirectUrl, rawUrl).href;
        }
        resolve(fetchPage(redirectUrl, redirectsLeft - 1));
        return;
      }

      if (status < 200 || status >= 400) {
        res.resume();
        resolve(null);
        return;
      }

      const contentType = res.headers["content-type"] || "";
      if (!contentType.includes("text")) {
        res.resume();
        resolve(null);
        return;
      }

      const chunks: Buffer[] = [];
      let totalSize = 0;

      res.on("data", (chunk: Buffer) => {
        totalSize += chunk.length;
        if (totalSize > MAX_BODY_BYTES) {
          req.destroy();
          // Return what we have so far – email is usually near the top of /impressum
          resolve(Buffer.concat(chunks).toString("utf-8"));
          return;
        }
        chunks.push(chunk);
      });

      res.on("end", () => {
        resolve(Buffer.concat(chunks).toString("utf-8"));
      });

      res.on("error", () => resolve(null));
    });

    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

function normaliseBaseUrl(raw: string): string {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.origin; // e.g. https://www.example.de
  } catch {
    return raw;
  }
}

/**
 * Tries to find a contact email for a business by scraping their website.
 * Priority: /impressum → /kontakt → /contact → root page.
 */
export async function scrapeEmailFromWebsite(websiteUrl: string): Promise<string | null> {
  const base = normaliseBaseUrl(websiteUrl);

  const candidates = [
    `${base}/impressum`,
    `${base}/impressum.html`,
    `${base}/impressum.php`,
    `${base}/kontakt`,
    `${base}/kontakt.html`,
    `${base}/contact`,
    `${base}/contact.html`,
    base,
  ];

  // Deduplicate while preserving order
  const pages = [...new Set(candidates)];

  for (const pageUrl of pages) {
    try {
      const html = await fetchPage(pageUrl);
      if (!html) continue;
      const emails = extractEmailsFromHtml(html);
      if (emails.length > 0) {
        // Prefer generic/business addresses over personal-looking ones
        const preferred = emails.find((e) =>
          /^(info|kontakt|contact|mail|hallo|hello|service|anfrage|office|post|anfragen)@/.test(e)
        );
        return preferred || emails[0];
      }
    } catch {
      // ignore per-page errors, try next
    }
  }

  return null;
}

/**
 * Quick MX record check: does this email's domain accept mail?
 * Uses DNS-over-HTTPS (Google). Fails open on errors.
 */
export async function hasMxRecord(email: string): Promise<boolean> {
  try {
    const domain = email.split("@")[1];
    if (!domain) return false;
    const html = await fetchPage(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`
    );
    if (!html) return true; // fail open
    const json = JSON.parse(html) as any;
    return json.Status === 0 && Array.isArray(json.Answer) && json.Answer.length > 0;
  } catch {
    return true; // fail open
  }
}

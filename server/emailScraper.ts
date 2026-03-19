/**
 * emailScraper.ts
 *
 * Scrapes business contact email addresses from their websites.
 * German businesses are legally required to list an email in their Impressum (§5 TMG),
 * making /impressum the most reliable source.
 */

// Patterns to skip – these are not real contact addresses
const EMAIL_BLACKLIST = [
  "example", "muster", "placeholder", "noreply", "no-reply", "donotreply",
  "test@", "info@example", "@sentry", "@w3", "schema.org",
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp",
];

// Common email regex – deliberately broad, we filter afterwards
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const FETCH_TIMEOUT_MS = 7000;

function extractEmailsFromHtml(html: string): string[] {
  // Also decode common HTML entities used to obfuscate emails
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
      // Must contain a dot in the domain part
      const [, domain] = e.split("@");
      if (!domain || !domain.includes(".")) return false;
      // Must not match blacklist
      if (EMAIL_BLACKLIST.some((b) => e.includes(b))) return false;
      return true;
    });
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Pageblitz-Crawler/1.0; +https://pageblitz.de)",
        Accept: "text/html",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text")) return null;
    // Limit to 500 KB to avoid huge pages
    const text = await res.text();
    return text.slice(0, 500_000);
  } catch {
    return null;
  }
}

function normaliseBaseUrl(raw: string): string {
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    // Remove trailing slash
    return url.origin;
  } catch {
    return raw;
  }
}

/**
 * Tries to find a contact email for a business by scraping their website.
 * Checks (in priority order):
 *   1. /impressum  – legally required for German businesses
 *   2. /kontakt
 *   3. /contact
 *   4. Main page (root /)
 *
 * Returns the first plausible email found, or null.
 */
export async function scrapeEmailFromWebsite(websiteUrl: string): Promise<string | null> {
  const base = normaliseBaseUrl(websiteUrl);

  // Pages to check in priority order
  const candidates = [
    `${base}/impressum`,
    `${base}/impressum.html`,
    `${base}/impressum.php`,
    `${base}/kontakt`,
    `${base}/kontakt.html`,
    `${base}/contact`,
    `${base}/contact.html`,
    base, // root page last
  ];

  // Deduplicate
  const seen = new Set<string>();
  const pages = candidates.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  for (const pageUrl of pages) {
    const html = await fetchPage(pageUrl);
    if (!html) continue;
    const emails = extractEmailsFromHtml(html);
    if (emails.length > 0) {
      // Prefer addresses that look like info/kontakt/mail over personal names
      const preferred = emails.find((e) =>
        /^(info|kontakt|contact|mail|hallo|hello|service|anfrage|office|post|anfragen)@/.test(e)
      );
      return preferred || emails[0];
    }
  }

  return null;
}

/**
 * Quick sanity check: does the email domain have MX records?
 * Uses a free DNS-over-HTTPS query so no extra library is needed.
 * Returns true if MX records exist (or if the check fails – we err on the side of inclusion).
 */
export async function hasMxRecord(email: string): Promise<boolean> {
  try {
    const domain = email.split("@")[1];
    if (!domain) return false;
    const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json() as any;
    // Status 0 = NOERROR, Answer array means MX records exist
    return json.Status === 0 && Array.isArray(json.Answer) && json.Answer.length > 0;
  } catch {
    return true; // Fail open – don't discard on network errors
  }
}

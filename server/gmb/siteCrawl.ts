/**
 * Einzelseiten-Crawl der bestehenden Betriebs-Website (Plan B7, Task 2 /
 * Spec §2.1 „Website-Crawl"): holt NUR die eine übergebene URL (typisch die
 * Startseite aus dem GMB-Feld `website`), respektiert robots.txt und liefert
 * Title/Meta-Description/sichtbaren Text (~2.000 Zeichen) als Faktenquelle
 * für den LLM-Prompt (`facts.existingSite`).
 *
 * Sicherheits-Invarianten:
 * - Nur http/https, nur Standard-Ports (80/443).
 * - SSRF-Schutz: Hostname wird per DNS aufgelöst; private/link-local/
 *   loopback-Ziele (localhost, 127.x, 10.x, 172.16–31.x, 192.168.x,
 *   169.254.x, CGNAT 100.64.0.0/10, ::/::1, fc00::/7, fe80::/10) werden
 *   abgelehnt — auch als Redirect-Ziel. IPv6-Adressen werden expandiert
 *   geprüft; IPv4-mapped (::ffff:0:0/96), IPv4-compat (::/96) und NAT64
 *   (64:ff9b::/96) werden auf ihren eingebetteten IPv4-Teil reduziert und
 *   gegen dieselben v4-Sperrlisten geprüft (deckt auch die von Node's URL
 *   erzeugte Hex-Normalform wie `[::ffff:7f00:1]` ab).
 * - Redirects: max. 3, nur derselbe Host oder seine www-Variante.
 * - Timeout 10 s gesamt, Lesen hart bei 200 kB gekappt (Seite UND
 *   robots.txt), kein Cookie/Auth.
 * - JEDER Fehler → `null`, nie Throw: die Generierung läuft ohne Crawl weiter.
 *
 * Bewusst akzeptiertes Restrisiko — DNS-Rebinding (TOCTOU): der DNS-Lookup
 * für die SSRF-Prüfung und der Lookup, den `fetch` intern macht, sind zwei
 * getrennte Auflösungen. Ein Angreifer-DNS mit TTL 0 könnte zwischen beiden
 * die Antwort von einer öffentlichen auf eine private IP wechseln. Der
 * saubere Fix wäre IP-Pinning über einen eigenen undici-Agent (Lookup einmal
 * machen, Socket auf genau diese IP verbinden, Host-Header beibehalten) —
 * für die aktuelle Bedrohungslage (die gecrawlte URL ist die vom Betrieb
 * selbst hinterlegte GMB-Website, kein frei wählbarer User-Input) ist das
 * Fenster klein genug, dass wir es dokumentieren statt es zu schließen.
 * Redirect-Ziele werden immerhin je Hop erneut geprüft.
 *
 * HTTP-Client und DNS-Resolver sind per deps injizierbar (Stil wie
 * `details.ts`) — Tests machen keine echten Netzwerk-Calls.
 */
import { lookup } from "node:dns/promises";
import { isIPv6 } from "node:net";

export type ExistingSiteFacts = {
  title?: string;
  description?: string;
  text?: string;
};

export type SiteCrawlDeps = {
  /** HTTP-Client (Default: globales `fetch`) — in Tests mocken. */
  fetchImpl?: typeof fetch;
  /** DNS-Resolver: Hostname → alle IP-Adressen (Default: node:dns lookup). */
  resolveIps?: (hostname: string) => Promise<string[]>;
  /** Nur für Tests: Gesamt-Timeout überschreiben (Default 10 s). */
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 200 * 1024;
const MAX_TEXT_CHARS = 2_000;
const MAX_TITLE_CHARS = 300;
const MAX_DESCRIPTION_CHARS = 500;
const MAX_REDIRECTS = 3;
/** "" = kein expliziter Port in der URL (Standard-Port des Schemas). */
const ALLOWED_PORTS = new Set(["", "80", "443"]);
const CRAWL_HEADERS: Record<string, string> = {
  "User-Agent": "PageblitzBot/1.0 (+https://pageblitz.de)",
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
  "Accept-Language": "de,en;q=0.5",
};

async function defaultResolveIps(hostname: string): Promise<string[]> {
  const results = await lookup(hostname, { all: true });
  return results.map(r => r.address);
}

function isForbiddenIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n > 255)) {
    return true; // nicht parsebar → als unsicher behandeln
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true; // this-host, privat, loopback
  if (a === 172 && b >= 16 && b <= 31) return true; // privat
  if (a === 192 && b === 168) return true; // privat
  if (a === 169 && b === 254) return true; // link-local (Cloud-Metadaten!)
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  return false;
}

/**
 * Expandiert eine IPv6-Adresse zu ihren 8 Hextets (als Zahlen 0–0xffff).
 * Unterstützt `::`-Kompression und ein eingebettetes dotted-IPv4-Suffix
 * (`::ffff:127.0.0.1`). `null` bei jeder nicht parsebaren Form.
 */
function expandIpv6(ip: string): number[] | null {
  let s = ip.trim().toLowerCase();
  const zone = s.indexOf("%");
  if (zone >= 0) s = s.slice(0, zone);
  // Eingebettetes dotted-IPv4-Suffix → zwei Hextets.
  const v4 = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(s);
  if (v4) {
    const octets = v4[1].split(".").map(Number);
    if (octets.some(o => !Number.isInteger(o) || o > 255)) return null;
    const hi = ((octets[0] << 8) | octets[1]).toString(16);
    const lo = ((octets[2] << 8) | octets[3]).toString(16);
    s = s.slice(0, -v4[1].length) + `${hi}:${lo}`;
  }
  let head: string[];
  let tail: string[];
  const gap = s.indexOf("::");
  if (gap >= 0) {
    if (s.indexOf("::", gap + 1) >= 0) return null; // mehr als ein "::"
    head = s.slice(0, gap).split(":").filter(Boolean);
    tail = s
      .slice(gap + 2)
      .split(":")
      .filter(Boolean);
    if (head.length + tail.length > 7) return null;
  } else {
    head = s.split(":");
    tail = [];
    if (head.length !== 8) return null;
  }
  const groups = [
    ...head,
    ...Array<string>(8 - head.length - tail.length).fill("0"),
    ...tail,
  ];
  const hextets = groups.map(g =>
    /^[0-9a-f]{1,4}$/.test(g) ? parseInt(g, 16) : Number.NaN
  );
  return hextets.some(Number.isNaN) ? null : hextets;
}

/** Extrahiert die in den letzten 32 Bit eingebettete IPv4-Adresse. */
function embeddedIpv4(hextets: number[]): string {
  const hi = hextets[6];
  const lo = hextets[7];
  return `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;
}

/**
 * IPv6-Prüfung über die expandierte Form: IPv4-mapped (::ffff:0:0/96),
 * IPv4-compat (::/96, inkl. `::`/`::1`) und NAT64 (64:ff9b::/96) werden auf
 * den eingebetteten IPv4-Teil reduziert; dazu ULA fc00::/7 und link-local
 * fe80::/10. Nicht parsebar → verboten.
 */
function isForbiddenIpv6(ip: string): boolean {
  const h = expandIpv6(ip);
  if (!h) return true; // nicht parsebar → als unsicher behandeln
  if (h[0] === 0 && h[1] === 0 && h[2] === 0 && h[3] === 0 && h[4] === 0) {
    if (h[5] === 0xffff) return isForbiddenIpv4(embeddedIpv4(h)); // IPv4-mapped
    if (h[5] === 0) {
      // ::/96 (IPv4-compat) — deckt auch `::` (unspecified) und `::1`
      // (loopback) ab: eingebettet 0.0.0.0 bzw. 0.0.0.1 → a === 0 → verboten.
      return isForbiddenIpv4(embeddedIpv4(h));
    }
  }
  if (
    h[0] === 0x64 &&
    h[1] === 0xff9b &&
    h[2] === 0 &&
    h[3] === 0 &&
    h[4] === 0 &&
    h[5] === 0
  ) {
    return isForbiddenIpv4(embeddedIpv4(h)); // NAT64 64:ff9b::/96
  }
  if ((h[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 (ULA)
  if ((h[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  return false;
}

/** Prüft eine einzelne IP (v4 oder v6) gegen private/link-local/loopback-Bereiche. */
function isForbiddenIp(ip: string): boolean {
  const bare = ip.trim().replace(/^\[|\]$/g, "");
  if (isIPv6(bare)) return isForbiddenIpv6(bare);
  if (bare.includes(":")) return true; // sieht aus wie IPv6, parst aber nicht → unsicher
  return isForbiddenIpv4(bare);
}

/**
 * Schema/Port/Hostname-Prüfung inkl. DNS-Auflösung — jede Ziel-URL (auch
 * jedes Redirect-Ziel) muss sie bestehen, sonst wird nicht gefetcht.
 */
async function isSafeTarget(
  url: URL,
  resolveIps: (hostname: string) => Promise<string[]>
): Promise<boolean> {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (!ALLOWED_PORTS.has(url.port)) return false;
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host) return false;
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  // IP-Literal direkt prüfen (kein DNS nötig)
  if (/^[0-9.]+$/.test(host) || host.includes(":")) {
    return !isForbiddenIp(host);
  }
  const ips = await resolveIps(host);
  if (!ips.length) return false;
  return ips.every(ip => !isForbiddenIp(ip));
}

function stripWww(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/** Redirects nur auf denselben Host oder seine www-/non-www-Variante. */
function isSameHostOrWwwVariant(a: string, b: string): boolean {
  return stripWww(a) === stripWww(b);
}

/**
 * Minimaler robots.txt-Parser: sammelt die `Disallow`-Präfixe aller Gruppen,
 * deren `User-agent`-Zeilen `*` enthalten. `Allow`-Regeln werden bewusst
 * ignoriert (konservativ: ein Disallow-Präfix gewinnt immer). Disallow-Werte
 * mit Wildcard-Syntax (`*` oder `$`) können als Präfix nicht korrekt
 * ausgewertet werden — sie werden konservativ als Komplett-Sperre (`"/"`)
 * behandelt: im Zweifel crawlen wir NICHT.
 */
export function parseRobotsDisallow(body: string): string[] {
  const disallow: string[] = [];
  let currentAgents: string[] = [];
  let inRuleBlock = false;
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (field === "user-agent") {
      // Neue Agent-Zeile NACH einem Regelblock beginnt eine neue Gruppe.
      if (inRuleBlock) {
        currentAgents = [];
        inRuleBlock = false;
      }
      currentAgents.push(value);
    } else if (field === "disallow" || field === "allow") {
      inRuleBlock = true;
      if (field === "disallow" && value && currentAgents.includes("*")) {
        // Wildcard-Syntax (`*`/`$`) ist mit Präfix-Matching nicht abbildbar
        // → konservativ alles sperren.
        disallow.push(/[*$]/.test(value) ? "/" : value);
      }
    }
  }
  return disallow;
}

function isDisallowed(pathWithQuery: string, rules: string[]): boolean {
  return rules.some(prefix => pathWithQuery.startsWith(prefix));
}

/**
 * robots.txt des Ziel-Origins holen. Fehler/404/Timeout → leere Regeln
 * (crawlen erlaubt) — nur eine LESBARE robots.txt kann verbieten.
 */
async function fetchRobotsRules(
  origin: string,
  fetchImpl: typeof fetch,
  signal: AbortSignal
): Promise<string[]> {
  try {
    const response = await fetchImpl(`${origin}/robots.txt`, {
      signal,
      redirect: "follow",
      headers: CRAWL_HEADERS,
    });
    if (!response.ok) return [];
    // Gleiche 200-kB-Kappung wie beim Seiten-Body (Stream wird nach dem
    // Limit abgebrochen); nicht lesbar/zu groß angekündigt → keine Regeln.
    const body = await readBodyLimited(response);
    return body === null ? [] : parseRobotsDisallow(body);
  } catch {
    return [];
  }
}

/**
 * Seite mit manuell verfolgten Redirects holen: max. 3 Hops, jedes Ziel nur
 * same-host/www-Variante und SSRF-geprüft. Liefert `null` statt zu werfen.
 */
async function fetchWithGuardedRedirects(
  startUrl: URL,
  fetchImpl: typeof fetch,
  resolveIps: (hostname: string) => Promise<string[]>,
  signal: AbortSignal
): Promise<Response | null> {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!(await isSafeTarget(current, resolveIps))) return null;
    const response = await fetchImpl(current.toString(), {
      signal,
      redirect: "manual",
      headers: CRAWL_HEADERS,
    });
    if (response.status >= 300 && response.status < 400) {
      if (hop === MAX_REDIRECTS) return null;
      const location = response.headers.get("location");
      if (!location) return null;
      const next = new URL(location, current);
      if (!isSameHostOrWwwVariant(current.hostname, next.hostname)) return null;
      current = next;
      continue;
    }
    if (!response.ok) return null;
    return response;
  }
  return null;
}

/**
 * Body lesen, hart bei 200 kB gekappt: meldet der Server vorab mehr
 * (Content-Length), wird gar nicht erst gelesen; ohne Angabe wird der Stream
 * nach dem Limit abgebrochen und der bis dahin gelesene Teil verwendet.
 */
async function readBodyLimited(response: Response): Promise<string | null> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return null;
  }
  const body = response.body;
  if (!body) {
    const text = await response.text();
    return text.slice(0, MAX_BODY_BYTES);
  }
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  if (total >= MAX_BODY_BYTES) {
    await reader.cancel().catch(() => undefined);
  }
  const buffer = new Uint8Array(Math.min(total, MAX_BODY_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    const remaining = buffer.length - offset;
    if (remaining <= 0) break;
    buffer.set(
      remaining < chunk.byteLength ? chunk.subarray(0, remaining) : chunk,
      offset
    );
    offset += Math.min(chunk.byteLength, remaining);
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
  euro: "€",
  ndash: "–",
  mdash: "—",
};

function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10))
    )
    .replace(/&([a-zA-Z]+);/g, (match, name: string) =>
      name in NAMED_ENTITIES ? NAMED_ENTITIES[name] : match
    );
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/**
 * Kappt auf `maxChars`, aber an der Wortgrenze: das letzte Wort bleibt
 * vollständig. Ohne Leerzeichen im Fenster wird hart geschnitten.
 */
function truncateAtWordBoundary(input: string, maxChars: number): string {
  if (input.length <= maxChars) return input;
  const slice = input.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd();
}

/** Title, Meta-Description und sichtbaren Text aus dem HTML ziehen. */
function extractSiteFacts(html: string): ExistingSiteFacts | null {
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = titleMatch
    ? truncateAtWordBoundary(
        normalizeWhitespace(decodeEntities(titleMatch[1])),
        MAX_TITLE_CHARS
      )
    : "";

  const metaTag = /<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/i.exec(
    html
  );
  const contentMatch = metaTag
    ? /content\s*=\s*("([^"]*)"|'([^']*)')/i.exec(metaTag[0])
    : null;
  const description = contentMatch
    ? truncateAtWordBoundary(
        normalizeWhitespace(decodeEntities(contentMatch[2] ?? contentMatch[3])),
        MAX_DESCRIPTION_CHARS
      )
    : "";

  // Unsichtbares/Navigatorisches raus: script/style/noscript/nav/footer
  // (+ head/template/svg/iframe, die nie sichtbaren Fließtext tragen).
  const visible = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(
      /<(script|style|noscript|nav|footer|head|template|svg|iframe)\b[\s\S]*?<\/\1\s*>/gi,
      " "
    )
    .replace(/<[^>]+>/g, " ");
  const text = truncateAtWordBoundary(
    normalizeWhitespace(decodeEntities(visible)),
    MAX_TEXT_CHARS
  );

  if (!title && !description && !text) return null;
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(text ? { text } : {}),
  };
}

/**
 * Crawlt genau EINE URL der bestehenden Betriebs-Website und liefert
 * `{title?, description?, text?}` — oder `null` bei jedem Problem
 * (ungültige/unsichere URL, robots-Verbot, Timeout, HTTP-Fehler, leerer
 * Inhalt). Wirft NIE: der Aufrufer (Generierungs-Job) läuft ohne die
 * Faktenquelle einfach weiter.
 */
export async function crawlExistingSite(
  url: string,
  deps: SiteCrawlDeps = {}
): Promise<ExistingSiteFacts | null> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const resolveIps = deps.resolveIps ?? defaultResolveIps;
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let target: URL;
  try {
    target = new URL(url.trim());
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    if (!(await isSafeTarget(target, resolveIps))) return null;

    const rules = await fetchRobotsRules(
      target.origin,
      fetchImpl,
      controller.signal
    );
    if (isDisallowed(target.pathname + target.search, rules)) return null;

    const response = await fetchWithGuardedRedirects(
      target,
      fetchImpl,
      resolveIps,
      controller.signal
    );
    if (!response) return null;

    const html = await readBodyLimited(response);
    if (html === null) return null;

    return extractSiteFacts(html);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

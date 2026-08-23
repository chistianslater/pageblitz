import { describe, expect, test, vi } from "vitest";
import { crawlExistingSite } from "./siteCrawl";

/**
 * Alle Tests laufen ohne echte HTTP-/DNS-Calls: `fetchImpl` und `resolveIps`
 * werden per deps injiziert (Stil wie server/gmb/details.test.ts).
 */

const PUBLIC_IP = "93.184.216.34";

/** DNS-Mock: jeder Hostname → öffentliche IP. */
function publicDns() {
  return vi.fn(async (_hostname: string) => [PUBLIC_IP]);
}

/**
 * fetch-Mock über eine URL→Response-Tabelle. Unbekannte URLs → 404.
 * Bricht sofort ab, wenn das Signal schon abgebrochen ist (wie undici).
 */
function makeFetch(
  handlers: Record<string, () => Response>
): ReturnType<typeof vi.fn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    if (init?.signal?.aborted) {
      throw new DOMException("Abgebrochen", "AbortError");
    }
    const url = String(input);
    const handler = handlers[url];
    if (!handler) return new Response("nicht gefunden", { status: 404 });
    return handler();
  }) as ReturnType<typeof vi.fn>;
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

const SIMPLE_HTML = `<!doctype html><html><head>
  <title>Müller Metallbau — Schlosserei in Köln</title>
  <meta name="description" content="Geländer, Tore &amp; Türen vom Meisterbetrieb.">
  <style>body { color: red; }</style>
  <script>var geheim = "SKRIPTINHALT";</script>
</head><body>
  <nav>Startseite Leistungen Kontakt NAVINHALT</nav>
  <h1>Willkommen bei M&uuml;ller Metallbau</h1>
  <p>Wir fertigen   Gel&auml;nder, Tore und T&uuml;ren — ma&szlig;geschneidert.</p>
  <noscript>NOSCRIPTINHALT</noscript>
  <footer>Impressum Datenschutz FOOTERINHALT</footer>
</body></html>`;

describe("crawlExistingSite", () => {
  test("extrahiert Title, Meta-Description und sichtbaren Text (Umlaute, ohne script/style/nav/footer/noscript)", async () => {
    const fetchImpl = makeFetch({
      "https://mueller-metallbau.de/robots.txt": () =>
        new Response("nicht da", { status: 404 }),
      "https://mueller-metallbau.de/": () => htmlResponse(SIMPLE_HTML),
    });
    const result = await crawlExistingSite("https://mueller-metallbau.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Müller Metallbau — Schlosserei in Köln");
    expect(result?.description).toBe(
      "Geländer, Tore & Türen vom Meisterbetrieb."
    );
    expect(result?.text).toContain("Willkommen bei Müller Metallbau");
    expect(result?.text).toContain(
      "Geländer, Tore und Türen — maßgeschneidert"
    );
    expect(result?.text).not.toContain("SKRIPTINHALT");
    expect(result?.text).not.toContain("color: red");
    expect(result?.text).not.toContain("NAVINHALT");
    expect(result?.text).not.toContain("FOOTERINHALT");
    expect(result?.text).not.toContain("NOSCRIPTINHALT");
    // Whitespace normalisiert: keine Mehrfach-Leerzeichen/Zeilenumbrüche
    expect(result?.text).not.toMatch(/\s{2}/);
  });

  test("robots.txt Disallow für User-agent * greift → null, Seite wird nie abgerufen", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () =>
        new Response("User-agent: *\nDisallow: /", { status: 200 }),
      "https://example.de/": () => htmlResponse(SIMPLE_HTML),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).toBeNull();
    const calledUrls = fetchImpl.mock.calls.map(c => String(c[0]));
    expect(calledUrls).toEqual(["https://example.de/robots.txt"]);
  });

  test("robots.txt Disallow für anderen Pfad → Crawl erlaubt", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () =>
        new Response("User-agent: *\nDisallow: /intern\nDisallow: /admin", {
          status: 200,
        }),
      "https://example.de/": () => htmlResponse(SIMPLE_HTML),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result?.title).toContain("Müller Metallbau");
  });

  test("robots.txt Disallow nur für fremden User-agent → Crawl erlaubt", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () =>
        new Response("User-agent: Googlebot\nDisallow: /", { status: 200 }),
      "https://example.de/": () => htmlResponse(SIMPLE_HTML),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).not.toBeNull();
  });

  test("robots.txt-Abruf schlägt fehl (Netzwerkfehler) → Crawl trotzdem erlaubt", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/robots.txt")) throw new Error("ECONNRESET");
      return htmlResponse(SIMPLE_HTML);
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      resolveIps: publicDns(),
    });
    expect(result?.title).toContain("Müller Metallbau");
  });

  test("Timeout → null (nie Throw)", async () => {
    const hangingFetch = vi.fn(
      (_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal;
          if (signal?.aborted) {
            reject(new DOMException("Abgebrochen", "AbortError"));
            return;
          }
          signal?.addEventListener("abort", () =>
            reject(new DOMException("Abgebrochen", "AbortError"))
          );
        })
    );
    const result = await crawlExistingSite("https://langsam.de/", {
      fetchImpl: hangingFetch as unknown as typeof fetch,
      resolveIps: publicDns(),
      timeoutMs: 30,
    });
    expect(result).toBeNull();
  });

  test("Content-Length über 200 kB → null (gar nicht erst lesen)", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () => new Response("", { status: 404 }),
      "https://example.de/": () =>
        new Response("x", {
          status: 200,
          headers: { "content-length": String(5 * 1024 * 1024) },
        }),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).toBeNull();
  });

  test("Body größer als 200 kB ohne Content-Length → Lesen wird gekappt, Text bleibt ~2.000 Zeichen", async () => {
    const bigBody =
      "<html><head><title>Groß</title></head><body>" +
      "<p>Sehr viel Inhalt. </p>".repeat(30_000) +
      "</body></html>";
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () => new Response("", { status: 404 }),
      "https://example.de/": () => htmlResponse(bigBody),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).not.toBeNull();
    expect(result?.text?.length ?? 0).toBeLessThanOrEqual(2_000);
  });

  test("Redirect auf fremden Host wird abgelehnt → null", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () => new Response("", { status: 404 }),
      "https://example.de/": () =>
        new Response(null, {
          status: 301,
          headers: { location: "https://boese-seite.example/" },
        }),
      "https://boese-seite.example/": () => htmlResponse(SIMPLE_HTML),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).toBeNull();
    const calledUrls = fetchImpl.mock.calls.map(c => String(c[0]));
    expect(calledUrls).not.toContain("https://boese-seite.example/");
  });

  test("Redirect auf www-Variante desselben Hosts wird gefolgt", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () => new Response("", { status: 404 }),
      "https://example.de/": () =>
        new Response(null, {
          status: 301,
          headers: { location: "https://www.example.de/" },
        }),
      "https://www.example.de/": () => htmlResponse(SIMPLE_HTML),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result?.title).toContain("Müller Metallbau");
  });

  test("mehr als 3 Redirects → null", async () => {
    const redirect = (to: string) => () =>
      new Response(null, { status: 302, headers: { location: to } });
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () => new Response("", { status: 404 }),
      "https://example.de/": redirect("https://example.de/a"),
      "https://example.de/a": redirect("https://example.de/b"),
      "https://example.de/b": redirect("https://example.de/c"),
      "https://example.de/c": redirect("https://example.de/d"),
      "https://example.de/d": () => htmlResponse(SIMPLE_HTML),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).toBeNull();
  });

  test.each([
    "http://localhost/",
    "http://127.0.0.1/",
    "http://10.1.2.3/",
    "http://172.16.0.1/",
    "http://172.31.255.255/",
    "http://192.168.1.5/",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]/",
    "http://[fc00::1]/",
    "http://[fd12:3456::1]/",
  ])("SSRF: %s wird ohne jeden fetch abgelehnt", async url => {
    const fetchImpl = makeFetch({});
    const result = await crawlExistingSite(url, {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test("SSRF: Hostname löst per DNS auf private IP auf → null, kein fetch", async () => {
    const fetchImpl = makeFetch({
      "https://intranet-tarnung.de/robots.txt": () =>
        new Response("", { status: 404 }),
      "https://intranet-tarnung.de/": () => htmlResponse(SIMPLE_HTML),
    });
    const resolveIps = vi.fn(async () => ["10.0.0.5"]);
    const result = await crawlExistingSite("https://intranet-tarnung.de/", {
      fetchImpl,
      resolveIps,
    });
    expect(result).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test("SSRF: Redirect-Ziel (www-Variante) löst auf private IP auf → null", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () => new Response("", { status: 404 }),
      "https://example.de/": () =>
        new Response(null, {
          status: 301,
          headers: { location: "https://www.example.de/" },
        }),
      "https://www.example.de/": () => htmlResponse(SIMPLE_HTML),
    });
    const resolveIps = vi.fn(async (hostname: string) =>
      hostname === "www.example.de" ? ["192.168.0.10"] : [PUBLIC_IP]
    );
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps,
    });
    expect(result).toBeNull();
  });

  test.each([
    "ftp://example.de/",
    "file:///etc/passwd",
    "https://example.de:8443/",
    "http://example.de:8080/",
    "kein-url",
    "",
  ])("ungültiges Schema/Port/URL: %s → null", async url => {
    const result = await crawlExistingSite(url, {
      fetchImpl: makeFetch({}),
      resolveIps: publicDns(),
    });
    expect(result).toBeNull();
  });

  test("HTTP-Fehlerstatus der Seite → null", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () => new Response("", { status: 404 }),
      "https://example.de/": () =>
        new Response("Serverfehler", { status: 500 }),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).toBeNull();
  });

  test("Seite ohne verwertbaren Inhalt (leer) → null", async () => {
    const fetchImpl = makeFetch({
      "https://example.de/robots.txt": () => new Response("", { status: 404 }),
      "https://example.de/": () =>
        htmlResponse(
          "<html><head></head><body><script>x()</script></body></html>"
        ),
    });
    const result = await crawlExistingSite("https://example.de/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).toBeNull();
  });
});

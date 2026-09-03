import { describe, expect, test, vi } from "vitest";
import { crawlSiteBranding } from "./siteCrawl";

const PUBLIC_IP = "93.184.216.34";
const publicDns = () => vi.fn(async (_h: string) => [PUBLIC_IP]);

function makeFetch(handlers: Record<string, () => Response>) {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    if (init?.signal?.aborted)
      throw new DOMException("Abgebrochen", "AbortError");
    const handler = handlers[String(input)];
    return handler ? handler() : new Response("weg", { status: 404 });
  }) as unknown as typeof fetch;
}

const html = `<!doctype html><html><head>
<link rel="stylesheet" href="/a.css">
<link rel="stylesheet" href="https://fremd.example/b.css">
</head><body><header><img src="/logo-mueller.png" alt="Logo"></header></body></html>`;

const ok = (body: string, type = "text/html") =>
  new Response(body, { status: 200, headers: { "content-type": type } });

describe("crawlSiteBranding (2026-09-03)", () => {
  test("liest Seite und eigene Stylesheets, erkennt Logo, Farbe und Schrift", async () => {
    const fetchImpl = makeFetch({
      "https://mueller.example/robots.txt": () =>
        ok("User-agent: *\n", "text/plain"),
      "https://mueller.example/": () => ok(html),
      "https://mueller.example/a.css": () =>
        ok("h1{font-family:'Bebas Neue',sans-serif;color:#2e7e78}", "text/css"),
    });
    const result = await crawlSiteBranding("https://mueller.example/", {
      fetchImpl,
      resolveIps: publicDns(),
    });
    expect(result).toEqual({
      origin: "https://mueller.example",
      logoUrl: "https://mueller.example/logo-mueller.png",
      accent: "#2e7e78",
      fonts: ["Bebas Neue"],
    });
    // Fremdes Stylesheet wird nicht geladen.
    expect(
      (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.map(c =>
        String(c[0])
      )
    ).not.toContain("https://fremd.example/b.css");
  });

  test("robots.txt verbietet die Seite → null, kein Seitenabruf", async () => {
    const fetchImpl = makeFetch({
      "https://mueller.example/robots.txt": () =>
        ok("User-agent: *\nDisallow: /\n", "text/plain"),
      "https://mueller.example/": () => ok(html),
    });
    expect(
      await crawlSiteBranding("https://mueller.example/", {
        fetchImpl,
        resolveIps: publicDns(),
      })
    ).toBeNull();
  });

  test("private Ziele werden abgelehnt (SSRF-Schutz wie beim Fakten-Crawl)", async () => {
    expect(
      await crawlSiteBranding("http://localhost/", {
        fetchImpl: makeFetch({}),
        resolveIps: vi.fn(async () => ["127.0.0.1"]),
      })
    ).toBeNull();
  });

  test("unerreichbare Seite → null statt Fehler", async () => {
    expect(
      await crawlSiteBranding("https://mueller.example/", {
        fetchImpl: makeFetch({}),
        resolveIps: publicDns(),
      })
    ).toBeNull();
  });
});

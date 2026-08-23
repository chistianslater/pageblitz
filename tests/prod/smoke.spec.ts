import { expect, test, type ConsoleMessage } from "@playwright/test";

/**
 * Prod-Build-Smoke (Plan B6 Task 1): läuft NUR gegen `dist/` (Rollup-Chunking,
 * `NODE_ENV=production`, siehe playwright.config.ts `webServer` für
 * PW_PROJECT=prod). Der Hotfix 9875dd9 (eigene Radix/TanStack-Chunks →
 * zirkuläre Chunk-Abhängigkeit → "Cannot read properties of undefined
 * (reading 'forwardRef')", schwarze Seite auf /start, /onboarding/:token,
 * /my-website) wäre von KEINEM `tests/visual/*`-Spec gefangen worden — die
 * laufen alle gegen Vite Dev (kein Rollup-Chunking, siehe dortiger
 * `webServer`). Dieser Spec deckt genau die Lücke.
 */

interface SmokePage {
  path: string;
  /** Kurzbeschreibung für Testnamen/Fehlermeldungen. */
  label: string;
  /**
   * Zusätzliche erlaubte console.error-Muster für diese Seite — z. B. ein
   * bewusst herbeigeführter, erwarteter Anwendungsfehler (ungültiger Token).
   * Wird zusätzlich zu ALLOWED_CONSOLE_ERROR_PATTERNS geprüft.
   */
  extraAllowedConsolePatterns?: RegExp[];
}

const SMOKE_PAGES: SmokePage[] = [
  { path: "/", label: "Landingpage" },
  { path: "/start", label: "Start (GMB-Suche)" },
  {
    path: "/my-website",
    label: "Kunden-Dashboard (ohne Session → Redirect /login)",
  },
  { path: "/demo/werkbank", label: "Style-Pack-Demo (SSR, Inseln-Bundle)" },
  {
    // 32 Hex-Zeichen — wohlgeformt, aber kein existierender Token. Die
    // Studio-Shell (client/src/pages/onboarding-v2/StudioPage.tsx) muss
    // trotzdem laden und einen Fehlerzustand zeigen statt einer leeren/
    // schwarzen Seite. Der fehlgeschlagene tRPC-Query (onboardingV2.getState
    // → NOT_FOUND, verifiziert: HTTP 404 auf /api/trpc/...) löst zusätzlich
    // zur (global erlaubten) Browser-Ressourcen-404-Meldung den eigenen
    // console.error("[API Query Error]", ...)-Handler aus (main.tsx,
    // queryClient-Cache-Subscriber) — der ERWARTETE Fehlerzustand, kein
    // Bundle-Bug.
    path: "/onboarding/0123456789abcdef0123456789abcdef",
    label: "Studio mit ungültigem Token (erwarteter Fehlerzustand)",
    extraAllowedConsolePatterns: [/\[API Query Error\]/],
  },
  {
    // Unbekannter Slug → SPA-Fallback mit Status 200 (server/_core/static.ts
    // isKnownSpaRoute matcht /site/:slug unabhängig davon, ob der Slug
    // existiert), Client zeigt clientseitig einen "nicht gefunden"-Zustand
    // — dafür fragt SitePage den Slug per tRPC ab, was ebenfalls (erwartet)
    // mit HTTP 404 beantwortet wird.
    path: "/site/does-not-exist",
    label: "Kundenseite mit unbekanntem Slug",
  },
];

/**
 * Muster für console.error-Meldungen, die auf JEDER Seite erwartet und für
 * diesen Smoke-Test irrelevant sind — externe Drittanbieter-Ressourcen
 * (Analytics, Fonts) sowie generische fehlgeschlagene Ressourcen-Loads
 * (Bilder u. Ä., z. B. eine unvollständige Fixture — verifiziert an
 * /demo/werkbank: `werkbank-about.jpg` fehlt unter `client/public/demo/`,
 * ein Daten-, kein Bundle-Problem). Der Browser meldet JEDEN
 * fehlgeschlagenen HTTP-Request automatisch als console.error, ohne die URL
 * im Text — bewusst nur 404 (nicht generisch alle Statuscodes), ein echter
 * 500er soll weiter durchschlagen. NICHT hierher gehören eigene
 * Script-/Modul-Fehler: die werden unabhängig davon weiter unten explizit
 * per `request.get` auf jeden im HTML deklarierten Modul-Chunk geprüft — ein
 * echter Bundle-Fehler wie Hotfix 9875dd9 fiele über diesen expliziten
 * Check auf, ganz unabhängig von der hier gewährten Kulanz für generische
 * Ressourcen-404s.
 */
const ALLOWED_CONSOLE_ERROR_PATTERNS: RegExp[] = [
  /favicon/i,
  /fonts\.(googleapis|gstatic)\.com/i,
  /googletagmanager\.com/i,
  /rybbit\.io/i,
  /^Failed to load resource: the server responded with a status of 404/,
];

function isAllowedConsoleError(
  message: ConsoleMessage,
  extraPatterns: RegExp[]
): boolean {
  const text = message.text();
  return [...ALLOWED_CONSOLE_ERROR_PATTERNS, ...extraPatterns].some(pattern =>
    pattern.test(text)
  );
}

/**
 * Extrahiert `<script type="module" src="...">` und
 * `<link rel="modulepreload" href="...">` aus dem rohen, servergesendeten
 * HTML — bewusst attribut-reihenfolge-unabhängig (Vite/esbuild-Ausgabe kann
 * `crossorigin` zwischen `type`/`src` einschieben).
 */
function extractModuleUrls(html: string): string[] {
  const urls = new Set<string>();
  const tagRe = /<(script|link)\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html)) !== null) {
    const tag = match[0];
    const tagName = match[1].toLowerCase();
    if (tagName === "script") {
      if (!/type=["']module["']/i.test(tag)) continue;
      const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/i);
      if (srcMatch) urls.add(srcMatch[1]);
    } else {
      if (!/rel=["']modulepreload["']/i.test(tag)) continue;
      const hrefMatch = tag.match(/\shref=["']([^"']+)["']/i);
      if (hrefMatch) urls.add(hrefMatch[1]);
    }
  }
  return Array.from(urls);
}

for (const smokePage of SMOKE_PAGES) {
  test(`Prod-Smoke: ${smokePage.path} (${smokePage.label}) lädt ohne Bundle-Fehler`, async ({
    page,
    request,
    baseURL,
  }) => {
    const pageErrors: Error[] = [];
    const unexpectedConsoleErrors: string[] = [];

    page.on("pageerror", error => {
      pageErrors.push(error);
    });
    page.on("console", message => {
      if (message.type() !== "error") return;
      if (
        isAllowedConsoleError(
          message,
          smokePage.extraAllowedConsolePatterns ?? []
        )
      )
        return;
      unexpectedConsoleErrors.push(message.text());
    });

    // `domcontentloaded` statt `networkidle` für die Navigation selbst: eine
    // Seite kann clientseitig weiter-navigieren (z. B. /my-website ohne
    // Session → window.location.href = "/login", CustomerRoute/useAuth) —
    // `waitForLoadState("networkidle")` danach verfolgt den ggf. neuen
    // Frame-Zustand statt gegen die ursprüngliche Navigation zu blockieren.
    const response = await page.goto(smokePage.path, {
      waitUntil: "domcontentloaded",
    });
    expect(response, `Keine Antwort für ${smokePage.path}`).not.toBeNull();

    // Rohes, servergesendetes HTML (nicht die clientseitig mutierte DOM) —
    // dort landet %VITE_...% nur, wenn ein Platzhalter nicht ersetzt wurde
    // (siehe Hotfix 9875dd9: toter Umami-Script-Tag mit unersetzten
    // VITE-Platzhaltern in client/index.html). Muss VOR dem
    // networkidle-Wait gelesen werden — auf Seiten mit anschließender
    // Client-Weiter-Navigation (z. B. /my-website → /login) wirft
    // `response.text()` sonst "No resource with given identifier found",
    // weil der Browser den ursprünglichen Response-Body nach der Navigation
    // nicht mehr vorhält.
    const html = await response!.text();
    expect(html).not.toContain("%VITE_");

    await page.waitForLoadState("networkidle");

    // Nicht jede Seite bindet zwingend eigenes JS ein — die reine
    // SSR-Fixture-Demo (/demo/:pack ohne aktive Features) liefert z. B.
    // bewusst KEIN Inseln-Bundle (siehe includeIslands in
    // server/ssr/renderSite.tsx: hasActiveFeatures(data) && Boolean(slug)).
    // Diese Schleife prüft nur: WENN Modul-Scripts/-Preloads im HTML
    // stehen, müssen sie 200 liefern — keine Mindestanzahl gefordert.
    const moduleUrls = extractModuleUrls(html);
    for (const url of moduleUrls) {
      const absoluteUrl = new URL(
        url,
        baseURL ?? "http://localhost:3012"
      ).toString();
      const chunkResponse = await request.get(absoluteUrl);
      expect(
        chunkResponse.status(),
        `Chunk ${url} (referenziert von ${smokePage.path}) antwortet nicht mit 200`
      ).toBe(200);
    }

    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    expect(
      bodyText.length,
      `Leerer document.body.innerText auf ${smokePage.path} (mögliche schwarze Seite wie Hotfix 9875dd9)`
    ).toBeGreaterThan(0);

    expect(
      pageErrors.map(error => error.message),
      `Unerwartete pageerror(s) auf ${smokePage.path}`
    ).toHaveLength(0);
    expect(
      unexpectedConsoleErrors,
      `Unerwartete console.error auf ${smokePage.path}`
    ).toHaveLength(0);
  });
}

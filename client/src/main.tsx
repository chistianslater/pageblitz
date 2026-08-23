// HINWEIS: kein `import "@shared/zodLocale"` mehr hier — die deutsche zod-
// Locale wird von shared/siteContract/schema.ts (Ursprung aller Client-
// Schemas) gesetzt; ein Import an dieser Stelle zog zod (~57 kB) in den
// Entry-Chunk jeder Route, auch "/" (B6 Task 8).

// ── Defensive Node-Patches gegen Translate/Extension-Interferenzen ─────────
// Browser-Übersetzer (Google Translate) und manche Extensions (Grammarly,
// Password-Manager) manipulieren DOM-Text-Knoten direkt. React's reconciler
// merkt das nicht und crasht beim nächsten removeChild/insertBefore mit
// NotFoundError. Wir patchen die DOM-API defensiv: bei Parent-Mismatch
// warnen statt werfen. Standard-Pattern bei großen React-Apps (FB/Airbnb/Atlas).
// Siehe: https://github.com/facebook/react/issues/11538
(function patchDomForTranslateCompat() {
  if (typeof Node === "undefined" || !Node.prototype) return;
  const origRemoveChild = Node.prototype.removeChild;
  const origInsertBefore = Node.prototype.insertBefore;

  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      // Stiller no-op: Child wurde von einer externen DOM-Mutation entfernt
      // (Translate, Extension). React-State und tatsächlicher DOM driften
      // dann auseinander; nicht ideal, aber besser als Crash + White-Screen.
      console.warn(
        "[DOM Patch] removeChild: child is not a child of this node"
      );
      return child;
    }
    return origRemoveChild.call(this, child) as T;
  };

  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn(
        "[DOM Patch] insertBefore: referenceNode is not a child of this node"
      );
      // Fallback: append am Ende statt insertBefore
      return this.appendChild(newNode) as unknown as T;
    }
    return origInsertBefore.call(this, newNode, referenceNode) as T;
  };
})();

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { reportClientError } from "./components/ErrorBoundary";
import { getLoginUrl } from "./const";
import "./index.css";
import "./animations.css";

// ── Global Error-Reporting für non-React Errors ────────────────────────────
// React-Errors werden vom ErrorBoundary gefangen. Hier fangen wir alles ab,
// was außerhalb des Render-Cycles passiert: setTimeout-Crashes, async ohne
// catch, etc. Throttling über Set, damit derselbe Error nicht 1000× geschickt
// wird.
const reportedFingerprints = new Set<string>();
const seen = (key: string) => {
  if (reportedFingerprints.has(key)) return true;
  reportedFingerprints.add(key);
  // Maximal 50 unique errors pro Session merken (Memory-Schutz)
  if (reportedFingerprints.size > 50) reportedFingerprints.clear();
  return false;
};

window.addEventListener("error", event => {
  const msg = event.message || "Unknown window error";
  const fp = `${msg}|${event.filename}|${event.lineno}`;
  if (seen(fp)) return;
  reportClientError({
    source: "window-error",
    message: msg,
    stack:
      event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
  });
});

window.addEventListener("unhandledrejection", event => {
  const reason = event.reason;
  const msg = reason?.message || String(reason ?? "Unhandled rejection");
  const stack = reason?.stack || null;
  const fp = `${msg}|${(stack || "").slice(0, 80)}`;
  if (seen(fp)) return;
  reportClientError({
    source: "unhandled-rejection",
    message: msg,
    stack,
  });
});

// ── Stale-Cache-Recovery: auto-reload bei Chunk-Load-Errors ────────────────
// Nach einem Deploy haben Asset-Bundles neue Hashes. Browser mit alter
// index.html versuchen alte Chunks zu laden → 404 → JS-SyntaxError +
// "Failed to fetch dynamically imported module". Symptom für den User:
// Bilder/Layouts laden nicht. Einmaliger Auto-Reload löst das.
function isStaleChunkError(msg: string): boolean {
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("Loading chunk") ||
    (msg.includes("Unexpected token") && msg.includes("<"))
  );
}

function maybeReloadForStaleCache(msg: string) {
  if (!isStaleChunkError(msg)) return;
  // Einmaliger Reload pro Session – sonst Endlos-Schleife wenn der Reload
  // selbst auch fehlschlägt.
  if (sessionStorage.getItem("stale-cache-reload-done") === "1") return;
  sessionStorage.setItem("stale-cache-reload-done", "1");
  console.warn("[Stale-Cache] Detected chunk-load error, forcing reload");
  // Hard-reload mit cache-bypass
  window.location.reload();
}

window.addEventListener("error", event => {
  maybeReloadForStaleCache(event.message || "");
});
window.addEventListener("unhandledrejection", event => {
  const msg = (event.reason as any)?.message || String(event.reason ?? "");
  maybeReloadForStaleCache(msg);
});

// ── localStorage Sanitization ──────────────────────────────────────────────
// The Manus runtime reads "manus-runtime-user-info" from localStorage and
// sends it via postMessage to the container, which calls JSON.parse() on it.
// If the stored value is the literal string "undefined" (caused by a previous
// bug where JSON.stringify(undefined) was stored), JSON.parse("undefined")
// throws "JSON Parse error: Unexpected identifier 'undefined'".
// Fix: on every startup, validate the stored value and remove it if invalid.
(function sanitizeLocalStorage() {
  const KEY = "manus-runtime-user-info";
  const raw = localStorage.getItem(KEY);
  if (raw !== null) {
    try {
      JSON.parse(raw);
    } catch {
      // Value is not valid JSON (e.g. the string "undefined") – remove it.
      localStorage.removeItem(KEY);
    }
  }
})();

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

function mountApp() {
  createRoot(document.getElementById("root")!).render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// ── Prerender zuerst malen, dann mounten (B6 Task 8) ───────────────────────
// "/" kommt mit einem serverseitigen HTML-Prerender in #root
// (server/seo/homePage.ts). Ohne Verzögerung ersetzt React ihn, BEVOR der
// Browser den ersten Frame präsentiert hat (Modulskript läuft direkt nach
// dem Parsen) — Chrome verwirft LCP-Kandidaten, deren Element vor der
// Frame-Präsentation wieder aus dem DOM fliegt, und der gemessene LCP (Hero-
// H1) rutschte so hinter JS-Download + Hydration (Lighthouse mobil ~2,9 s
// statt ~FCP). Daher: mounten, sobald der Browser den First Contentful Paint
// GEMELDET hat (PerformanceObserver "paint" — die Meldung kommt erst nach
// der Präsentation, der Prerender-H1 ist dann als LCP-Kandidat registriert;
// er hat exakt die Typografie der React-Fassung, siehe homePage.ts, sodass
// React beim Mount keinen größeren Kandidaten erzeugt). Fallback 150 ms bzw.
// sofort, wenn der Browser keine paint-Einträge kennt. Nur mit Prerender —
// alle anderen Routen mounten sofort wie bisher. Ein bereits gemeldeter FCP
// (langsames JS, Prerender längst sichtbar) kommt per `buffered: true`
// sofort an → kein künstlicher Verzug.
function mountAfterFirstPaint() {
  let mounted = false;
  const mountOnce = () => {
    if (mounted) return;
    mounted = true;
    mountApp();
  };
  try {
    const observer = new PerformanceObserver(list => {
      if (list.getEntriesByName("first-contentful-paint").length > 0) {
        observer.disconnect();
        mountOnce();
      }
    });
    observer.observe({ type: "paint", buffered: true });
  } catch {
    mountOnce();
    return;
  }
  setTimeout(mountOnce, 150);
}

if (document.getElementById("prerender")) {
  mountAfterFirstPaint();
} else {
  mountApp();
}

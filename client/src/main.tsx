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
      console.warn("[DOM Patch] removeChild: child is not a child of this node");
      return child;
    }
    return origRemoveChild.call(this, child) as T;
  };

  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn("[DOM Patch] insertBefore: referenceNode is not a child of this node");
      // Fallback: append am Ende statt insertBefore
      return (this.appendChild(newNode) as unknown) as T;
    }
    return origInsertBefore.call(this, newNode, referenceNode) as T;
  };
})();

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
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

window.addEventListener("error", (event) => {
  const msg = event.message || "Unknown window error";
  const fp = `${msg}|${event.filename}|${event.lineno}`;
  if (seen(fp)) return;
  reportClientError({
    source: "window-error",
    message: msg,
    stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
  });
});

window.addEventListener("unhandledrejection", (event) => {
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

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

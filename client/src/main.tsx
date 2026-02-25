import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import "./animations.css";

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

import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map(entry => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", chunk => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

// vitePluginManusRuntime() inlined das komplette App-Bundle als <script> in die
// index.html (~367 KB). Im Prod-Build heißt das: kein Code-Splitting trotz
// manualChunks, nichts separat cachebar (index.html läuft auf max-age=0) und
// 108 KB gzip blockierendes JS bei *jedem* Seitenaufruf. Das Plugin ist ein
// Dev-/Preview-Werkzeug – im Build hat es nichts zu suchen.
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    jsxLocPlugin(),
    ...(command === "serve" ? [vitePluginManusRuntime()] : []),
    vitePluginManusDebugCollector(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          )
            return "vendor-react";
          if (id.includes("node_modules/framer-motion/"))
            return "vendor-motion";
          if (
            id.includes("node_modules/remotion") ||
            id.includes("node_modules/@remotion/")
          )
            return "vendor-remotion";
          // Getrennt von @tanstack: react-query wird am App-Root
          // (QueryClientProvider, main.tsx) für tRPC gebraucht und lädt
          // daher auf JEDER Route mit, Radix nur dort, wo Dialog/Dropdown/
          // Tooltip/etc. tatsächlich verwendet werden (Dashboard/Admin/
          // Studio) — ein gemeinsamer Chunk hätte die Landingpage gezwungen,
          // das komplette Radix-Bundle mitzuladen, nur weil react-query
          // daran hing (Task 6, B4c-Review-Befund).
          // Versuch geprüft, react-slot (die einzige Radix-Abhängigkeit von
          // `ui/button.tsx`, genutzt von Landing/StartPage) aus vendor-radix
          // auszuschließen (eigener manualChunks-Zweig, der `undefined`
          // zurückgibt) — ohne Effekt: `@radix-ui/react-slot` wird intern
          // auch von anderen Radix-Primitiven (Dialog/DropdownMenu/...)
          // verwendet, die selbst in vendor-radix liegen; Rollup dedupliziert
          // das gemeinsame Modul dann in genau diesen Chunk, unabhängig vom
          // manualChunks-Rückgabewert für das Modul selbst (verifiziert:
          // identischer Chunk-Hash mit/ohne Ausschluss-Zweig). vendor-radix
          // bleibt dadurch ein Preload auf "/" (Button→Slot), obwohl die
          // Landingpage sonst kein Radix nutzt — echte Isolation bräuchte
          // einen Slot-freien Button (Radix `asChild` durch eine eigene,
          // minimale Implementierung ersetzen), das ist außerhalb des
          // Task-6-Dateisatzes (Bericht: Task-6-Ergebnis, Budget-Abschnitt).
          // HOTFIX (2026-08-23): eigene Chunks für @radix-ui/@tanstack erzeugten im
          // Produktions-Build eine zirkuläre Chunk-Abhängigkeit — vendor-radix
          // wertete `React.forwardRef` aus, bevor vendor-react initialisiert war
          // ("Cannot read properties of undefined (reading 'forwardRef')",
          // schwarze Seite auf /start, /onboarding/:token, /my-website). Rollup
          // entscheidet für diese Pakete wieder selbst (keine Zyklen).
          if (
            id.includes("node_modules/stripe") ||
            id.includes("node_modules/@stripe/")
          )
            return "vendor-stripe";
          if (
            id.includes("/components/layouts/PremiumLayoutsV2") ||
            (id.includes("/components/layouts/") &&
              !id.includes("WebsiteRenderer"))
          )
            return "layouts";
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));

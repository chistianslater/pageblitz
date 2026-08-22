// Baut das Hydration-Bundle für die SSR-Inseln (Kontaktformular, KI-Chat,
// Terminbuchung) als eigenständiges ESM-Skript. Wird auf Kundenseiten nur
// geladen, wenn mindestens ein Add-on aktiv ist (siehe
// server/ssr/renderSite.tsx, hasActiveFeatures). Läuft vor dem Haupt-Build
// (siehe package.json "build") und muss vor Playwright-Läufen manuell
// ausgeführt werden ("npm run build:islands").
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

await build({
  entryPoints: [path.join(repoRoot, "client/src/site-islands/main.tsx")],
  bundle: true,
  format: "esm",
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  outfile: path.join(repoRoot, "dist/public/islands/site-islands.js"),
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "@shared": path.join(repoRoot, "shared"),
    "@": path.join(repoRoot, "client/src"),
  },
});

console.log("[build-islands] dist/public/islands/site-islands.js gebaut.");

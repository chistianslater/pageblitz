// Baut das Hydration-Bundle für die SSR-Inseln (Kontaktformular, KI-Chat,
// Terminbuchung) als eigenständiges ESM-Skript. Wird auf Kundenseiten nur
// geladen, wenn mindestens ein Add-on aktiv ist (siehe
// server/ssr/renderSite.tsx, hasActiveFeatures). Läuft NACH dem Vite-Build
// (siehe package.json "build", Finding C1) und muss vor Playwright-Läufen
// manuell ausgeführt werden ("npm run build:islands").
//
// Finding M1: Der Dateiname trägt einen Content-Hash
// (site-islands.<hash>.js), analog zu den Vite-Assets unter dist/public/
// assets/ — damit kann der Static-Mount in server/_core/index.ts die Datei
// als `immutable` mit langem `max-age` ausliefern. `manifest.json` neben
// der Datei hält den aktuellen Dateinamen fest; server/ssr/islandsBundle.ts
// liest ihn zur Laufzeit (mit Fallback auf den ungehashten Namen, falls kein
// Manifest existiert — z. B. in Tests oder bei einem Dev-Server ohne Build).
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outdir = path.join(repoRoot, "dist/public/islands");

// Alte Bundle-Dateien + Manifest aus einem vorherigen Standalone-Lauf von
// "build:islands" entfernen (ohne vorangehenden "vite build", der
// dist/public/ sonst komplett leert) — verhindert, dass sich Dateien mit
// veraltetem Hash im Ordner ansammeln.
if (fs.existsSync(outdir)) {
  for (const entry of fs.readdirSync(outdir)) {
    if (entry === "manifest.json" || /^site-islands\.[^/]*\.js$/.test(entry)) {
      fs.rmSync(path.join(outdir, entry));
    }
  }
}

const result = await build({
  entryPoints: [path.join(repoRoot, "client/src/site-islands/main.tsx")],
  bundle: true,
  format: "esm",
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  outdir,
  entryNames: "site-islands.[hash]",
  metafile: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "@shared": path.join(repoRoot, "shared"),
    "@": path.join(repoRoot, "client/src"),
  },
});

const jsOutput = Object.keys(result.metafile.outputs).find(f =>
  f.endsWith(".js")
);
if (!jsOutput) {
  throw new Error(
    "[build-islands] Kein JS-Output im esbuild-Metafile gefunden."
  );
}
const fileName = path.basename(jsOutput);

fs.writeFileSync(
  path.join(outdir, "manifest.json"),
  JSON.stringify({ file: fileName }, null, 2) + "\n"
);

console.log(
  `[build-islands] dist/public/islands/${fileName} gebaut, manifest.json aktualisiert.`
);

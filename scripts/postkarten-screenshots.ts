/**
 * Screenshots für die Postkarten erzeugen (2026-09-13).
 *
 * Die Karte zeigt als `bildUrl` eine Aufnahme der Seite, die der Betrieb
 * hinter dem QR-Code findet. `scripts/postkarten-vorschau.ts` erwartet diese
 * Aufnahmen fertig in einem Ordner (`--bilder`) — erzeugt wurden sie bisher
 * von Hand. Nach jeder Design-Änderung veralten sie still: Die Karte wirbt
 * dann mit einem Stand, den es nicht mehr gibt.
 *
 * Dieses Skript rendert sie aus derselben CSV, aus der auch die Karten
 * entstehen, mit denselben Dateinamen. Es schreibt nur in den Zielordner und
 * fasst weder Datenbank noch HeyMail an.
 *
 * VORAUSSETZUNG: Chromium für Playwright. Einmalig auf dem Server:
 *
 *   npx playwright install --with-deps chromium
 *
 * Aufruf:
 *
 *   npx tsx scripts/postkarten-screenshots.ts \
 *     --csv postkarten-bocholt-friseur.csv --ziel /root/postkarten
 *
 * `--chromium <pfad>` nutzt einen vorhandenen Browser, falls der Server schon
 * einen hat oder `playwright install` eine andere Revision geholt hat.
 *
 * Danach wie gehabt weiter mit postkarten-vorschau.ts --bilder /root/postkarten.
 */
import fs from "fs";
import path from "path";
import { chromium } from "@playwright/test";

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const csvPfad = arg("--csv");
const zielPfad = arg("--ziel") ?? "/root/postkarten";
/** Nur fehlende erzeugen — für den Nachlauf einzelner Betriebe. */
const nurFehlende = process.argv.includes("--nur-fehlende");
/**
 * Eigener Chromium-Pfad, falls `npx playwright install` nicht die Revision
 * geholt hat, die diese Playwright-Version erwartet (oder ein System-Chromium
 * vorhanden ist). Ohne die Angabe nimmt Playwright seinen eigenen Browser.
 */
const chromiumPfad = arg("--chromium");

/** Dateiname-tauglicher Name, identisch zu postkarten-vorschau.ts. */
function dateiname(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[m] || m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ausschnitt der Aufnahme.
 *
 * Bewusst der obere Teil der Seite: Das Motiv auf der Karte soll zeigen, was
 * der Betrieb beim Scannen als Erstes sieht — Hero mit Name, Bild und
 * Aufmacher. Eine ganze Seite als Briefmarke ist auf Papier unlesbar.
 */
const BREITE = 1280;
const HOEHE = 900;

async function main(): Promise<void> {
  // Erst hier pruefen, nicht beim Laden: so landet die Hilfe als Satz in der
  // Konsole statt als Stacktrace.
  if (!csvPfad) {
    throw new Error(
      "Aufruf: --csv <datei> [--ziel /root/postkarten] [--nur-fehlende]"
    );
  }
  const zeilen = fs
    .readFileSync(csvPfad!, "utf8")
    .split("\n")
    .filter(z => z.trim().length > 0);
  const kopf = zeilen[0].split(";");
  const idx = (name: string) => kopf.indexOf(name);
  if (idx("name") < 0 || idx("vorschau_url") < 0) {
    throw new Error(
      `CSV braucht die Spalten "name" und "vorschau_url" — gefunden: ${kopf.join(", ")}`
    );
  }

  fs.mkdirSync(zielPfad, { recursive: true });

  const browser = await chromium.launch(
    chromiumPfad ? { executablePath: chromiumPfad } : {}
  );
  let erzeugt = 0;
  let uebersprungen = 0;
  const fehler: string[] = [];

  try {
    for (const zeile of zeilen.slice(1)) {
      const f = zeile.split(";");
      const name = f[idx("name")];
      const url = f[idx("vorschau_url")];
      if (!name || !url) {
        uebersprungen += 1;
        continue;
      }
      const ziel = path.join(zielPfad, `${dateiname(name)}.png`);
      if (nurFehlende && fs.existsSync(ziel)) {
        uebersprungen += 1;
        continue;
      }

      const page = await browser.newPage({
        viewport: { width: BREITE, height: HOEHE },
      });
      try {
        const antwort = await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 45000,
        });
        // Ohne diese Pruefung landet die Aufnahme einer Fehlerseite auf der
        // Postkarte: page.goto wirft bei 404 nicht, es rendert sie brav.
        const status = antwort?.status() ?? 0;
        if (status >= 400 || status === 0) {
          throw new Error(`Seite antwortet mit HTTP ${status || "?"}`);
        }
        // Der Status allein reicht nicht: Unbekannte Pfade landen im
        // SPA-Fallback und antworten mit 200, obwohl dort keine Kundenseite
        // steht. Jede echte Seite rendert in `.pb-site` — fehlt der Container,
        // ist es eine Fehler- oder Platzhalterseite und gehoert nicht auf eine
        // Postkarte.
        const istKundenseite = await page
          .locator(".pb-site")
          .count()
          .then(n => n > 0);
        if (!istKundenseite) {
          throw new Error("Keine Kundenseite unter dieser Adresse");
        }
        // Einblend-Animationen der Packs zu Ende laufen lassen, sonst steht
        // halb sichtbarer Text auf der Karte.
        await page.waitForTimeout(1200);
        await page.screenshot({
          path: ziel,
          clip: { x: 0, y: 0, width: BREITE, height: HOEHE },
        });
        erzeugt += 1;
        console.log(`  ${dateiname(name)}.png ← ${url}`);
      } catch (err) {
        const grund = err instanceof Error ? err.message : String(err);
        fehler.push(`${name}: ${grund.split("\n")[0]}`);
        console.log(`  FEHLER ${name}: ${grund.split("\n")[0]}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log(
    `\n${erzeugt} Aufnahmen in ${zielPfad}` +
      (uebersprungen ? ` · ${uebersprungen} übersprungen` : "") +
      (fehler.length ? ` · ${fehler.length} Fehler` : "")
  );
  if (fehler.length) {
    console.log(
      "Fehlgeschlagen (ohne Aufnahme gibt es fuer diesen Betrieb keine Karte):"
    );
    for (const f of fehler) console.log(`  ${f}`);
  }
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
);

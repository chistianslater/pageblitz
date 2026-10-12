/**
 * Bestehende rev-2-Seiten auf ihr Hauptsystem umstellen (2026-10-12).
 *
 * Reiner Wechsel: `withPrimarySystem(doc)` — kein LLM, keine neuen Texte,
 * kein Fotowechsel. Je Seite ändern sich nur `designRevision`, `system`,
 * `palette` und `fontPairId`; das prüft das Skript (Top-Level-Diff) und
 * lässt eine Seite sonst aus. Logik und Tests: server/systemeUmstellen.ts.
 *
 * Ziele: `--ids 504,558-607,613` (Standard: 504, 558–607 ohne 593, 613).
 * Übersprungen wird, was schon rev 3 ist, nicht im v2-Format vorliegt,
 * keine bestimmte Familie hat oder dessen Hauptsystem nicht freigeschaltet
 * ist.
 *
 * Nur rev 2 wird umgestellt (rev 1 bzw. ohne Revision: übersprungen).
 * Standardmäßig Trockenlauf. Geschrieben wird erst mit `--schreiben`;
 * unbekannte Argumente brechen vor jedem Datenbank-Zugriff ab. Je Seite
 * (server/systemeUmstellen.ts, applySwitch): neu lesen und abbrechen, wenn
 * sich das Dokument seit der Planung geändert hat → alter Stand in den
 * Verlauf („Stand vor Designsystem") → schreiben → neuer Stand in den
 * Verlauf („Designsystem umgestellt"). So holt „Rückgängig" im Verlauf
 * genau den rev-2-Stand zurück. Das Neu-Lesen verkleinert das Zeitfenster,
 * ist aber keine Sperre: laufen lassen, wenn niemand im Studio bearbeitet.
 *
 *   npx tsx -r dotenv/config scripts/systeme-umstellen.ts [--ids 504,558-607]
 *   npx tsx -r dotenv/config scripts/systeme-umstellen.ts [--ids …] --schreiben
 *
 * Danach `pm2 restart pageblitz` (SSR-Cache lebt im Serverprozess).
 * Rollback: docs/BETRIEB-V2.md, „Designsysteme auf Bestand umstellen".
 */
import {
  getDb,
  getLatestWebsiteVersion,
  getWebsiteById,
  insertWebsiteVersion,
  updateWebsite,
} from "../server/db";
import { applySwitch, parseArgs, planSwitch } from "../server/systemeUmstellen";

async function main(): Promise<void> {
  // Argumente zuerst: ein Tippfehler („--id") bricht ab, bevor die
  // Datenbank angefasst wird.
  const { ids, schreiben } = parseArgs(process.argv.slice(2));
  const db = await getDb();
  if (!db) throw new Error("Keine Datenbank verfügbar — DATABASE_URL fehlt?");
  console.log(
    `${ids.length} Ziel-IDs (${ids[0]}…${ids[ids.length - 1]}) · ${schreiben ? "SCHREIBEN" : "Trockenlauf"}\n`
  );

  let umgestellt = 0;
  let uebersprungen = 0;
  let fehler = 0;
  for (const id of ids) {
    const website = await getWebsiteById(id);
    if (!website) {
      console.log(`${id}  —  nicht gefunden`);
      uebersprungen += 1;
      continue;
    }
    const rev = (website.websiteData as { designRevision?: unknown } | null)
      ?.designRevision;
    const quelle = `rev ${typeof rev === "number" ? rev : "ohne"}`;
    const plan = planSwitch(website.websiteData);
    if (plan.kind === "skip") {
      console.log(
        `${id}  ${plan.name}  ·  ${quelle}  ·  ${plan.family ?? "–"}  ·  Fotos ${plan.photos ?? "–"}  ·  ÜBERSPRUNGEN: ${plan.reason}`
      );
      uebersprungen += 1;
      continue;
    }
    console.log(
      `${id}  ${plan.name}  ·  ${quelle} → rev 3  ·  ${plan.family}  ·  ${plan.system}/${plan.palette}  ·  Fotos ${plan.photos}`
    );
    if (!schreiben) {
      umgestellt += 1;
      continue;
    }
    try {
      const result = await applySwitch(website.websiteData, plan.next, {
        readDoc: async () => (await getWebsiteById(id))?.websiteData,
        latestVersionDoc: async () =>
          (await getLatestWebsiteVersion(id))?.doc ?? null,
        insertVersion: v => insertWebsiteVersion({ websiteId: id, ...v }),
        writeDoc: doc => updateWebsite(id, { websiteData: doc as never }),
      });
      if (result.ok) umgestellt += 1;
      else {
        fehler += 1;
        if (result.written) umgestellt += 1;
        console.error(
          `${id}  ${result.written ? "WARNUNG" : "ABGEBROCHEN"}: ${result.reason}`
        );
      }
    } catch (err) {
      fehler += 1;
      console.error(`${id}  FEHLER beim Schreiben:`, err);
    }
  }

  console.log(
    `\n${umgestellt} ${schreiben ? "umgestellt" : "würden umgestellt"} · ${uebersprungen} übersprungen${fehler ? ` · ${fehler} Fehler` : ""}`
  );
  if (!schreiben && umgestellt > 0)
    console.log("Trockenlauf. Mit --schreiben wird umgestellt.");
  if (schreiben && umgestellt > 0)
    console.log(
      "Danach `pm2 restart pageblitz` — der SSR-Cache lebt im Serverprozess, invalidateSsrCache wirkt aus einem Skript nicht."
    );
  if (fehler > 0) process.exitCode = 1;
}

main().then(
  () => process.exit(process.exitCode ?? 0),
  err => {
    console.error(err);
    process.exit(1);
  }
);

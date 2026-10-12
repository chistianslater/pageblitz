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
 * Standardmäßig Trockenlauf. Geschrieben wird erst mit `--schreiben`. Vor
 * jedem Schreiben sichert das Skript den alten Stand im Verlauf
 * („Stand vor Designsystem", Auslöser `panel`) — der Kunde bzw. Betreiber
 * kann ihn im Verlaufs-Panel wiederherstellen.
 *
 *   npx tsx -r dotenv/config scripts/systeme-umstellen.ts [--ids 504,558-607]
 *   npx tsx -r dotenv/config scripts/systeme-umstellen.ts [--ids …] --schreiben
 *
 * Danach `pm2 restart pageblitz` (SSR-Cache lebt im Serverprozess).
 * Rollback: docs/BETRIEB-V2.md, „Designsysteme auf Bestand umstellen".
 */
import {
  getDb,
  getWebsiteById,
  insertWebsiteVersion,
  updateWebsite,
} from "../server/db";
import { idsFromArgv, planSwitch } from "../server/systemeUmstellen";

const schreiben = process.argv.includes("--schreiben");
const VERSION_LABEL = "Stand vor Designsystem";

async function main(): Promise<void> {
  const ids = idsFromArgv(process.argv.slice(2));
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
    const plan = planSwitch(website.websiteData);
    if (plan.kind === "skip") {
      console.log(
        `${id}  ${plan.name}  ·  ${plan.family ?? "–"}  ·  Fotos ${plan.photos ?? "–"}  ·  ÜBERSPRUNGEN: ${plan.reason}`
      );
      uebersprungen += 1;
      continue;
    }
    console.log(
      `${id}  ${plan.name}  ·  ${plan.family}  ·  ${plan.system}/${plan.palette}  ·  Fotos ${plan.photos}  ·  rev 3: ja`
    );
    if (!schreiben) {
      umgestellt += 1;
      continue;
    }
    try {
      // Alter Stand zuerst in den Verlauf — ohne gesicherten Stand kein Wechsel.
      const versionId = await insertWebsiteVersion({
        websiteId: id,
        trigger: "panel",
        label: VERSION_LABEL,
        doc: website.websiteData,
      });
      if (!versionId) throw new Error("Verlaufs-Stand nicht gespeichert");
      await updateWebsite(id, { websiteData: plan.next as never });
      umgestellt += 1;
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

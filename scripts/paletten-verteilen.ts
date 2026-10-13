/**
 * Farbstimmungen auf Bestand verteilen (2026-10-13).
 *
 * Postkarten-Seiten zeigen oft dasselbe System in derselben Palette; Salons
 * im selben Ort sehen dann gleich aus. Das Skript verteilt je (Ort, System)
 * die Paletten des Systems reihum (nach ID sortiert, deterministisch).
 * Geändert wird nur `palette` — System, Texte, Fotos bleiben (Top-Level-Diff
 * wird geprüft). Logik und Tests: server/palettenVerteilen.ts.
 *
 * Ausgelassen: Seiten, deren Inhaber im Studio ein Design gewählt hat
 * (Verlauf: Auslöser „panel", Label beginnt mit „Design"), nicht rev 3,
 * nicht freigeschaltet. Ort = `city` der Kontakt-Sektion.
 *
 * Standardmäßig Trockenlauf; geschrieben wird erst mit `--schreiben`.
 * Unbekannte Argumente brechen vor jedem DB-Zugriff ab. Je Seite: neu lesen,
 * Verlauf „Stand vor Farbstimmung" → schreiben → „Farbstimmung verteilt".
 *
 *   npx tsx -r dotenv/config scripts/paletten-verteilen.ts [--ids 600-700]
 *   npx tsx -r dotenv/config scripts/paletten-verteilen.ts [--ids …] --schreiben
 *
 * Danach `pm2 restart pageblitz` (SSR-Cache lebt im Serverprozess).
 * Rollback: docs/BETRIEB-V2.md, „Farbstimmungen verteilen".
 */
import {
  getDb,
  getLatestWebsiteVersion,
  getWebsiteById,
  insertWebsiteVersion,
  listWebsiteVersions,
  listWebsites,
  updateWebsite,
} from "../server/db";
import {
  applyPalette,
  isUnchanged,
  parseArgs,
  planDistribution,
  summarizeByTown,
  type SiteInput,
} from "../server/palettenVerteilen";
import { assertV2SafeWrite } from "../server/v2WriteGuard";

async function main(): Promise<void> {
  const { ids, schreiben } = parseArgs(process.argv.slice(2));
  const db = await getDb();
  if (!db) throw new Error("Keine Datenbank verfügbar — DATABASE_URL fehlt?");

  const websites: Awaited<ReturnType<typeof listWebsites>> = [];
  for (let offset = 0; ; offset += 200) {
    const seite = await listWebsites(200, offset);
    websites.push(...seite);
    if (seite.length < 200) break;
  }
  const wanted = ids ? new Set(ids) : null;
  const sites: SiteInput[] = [];
  for (const w of websites) {
    if (wanted && !wanted.has(w.id)) continue;
    const rev = (w.websiteData as { designRevision?: unknown } | null)
      ?.designRevision;
    // Verlauf nur für rev 3 laden — alles andere wird ohnehin ausgelassen.
    const versions = rev === 3 ? await listWebsiteVersions(w.id) : [];
    sites.push({ id: w.id, doc: w.websiteData, versions });
  }

  const rows = planDistribution(sites);
  console.log(
    `${rows.length} Seiten geprüft · ${schreiben ? "SCHREIBEN" : "Trockenlauf"}\n`
  );
  for (const r of rows) {
    if (r.kind === "skip")
      console.log(
        `${r.id}  ${r.name}  ·  ${r.town}  ·  ${r.system ?? "–"}  ·  SKIP: ${r.reason}`
      );
    else
      console.log(
        `${r.id}  ${r.name}  ·  ${r.town}  ·  ${r.system}  ·  ${r.oldPalette} → ${r.newPalette}${isUnchanged(r) ? "  (unverändert)" : ""}`
      );
  }
  console.log("\nVerteilung nach Ort · System:");
  for (const line of summarizeByTown(rows)) console.log(`  ${line}`);

  const changes = rows.filter(
    (r): r is Extract<typeof r, { kind: "candidate" }> =>
      r.kind === "candidate" && !isUnchanged(r)
  );
  let geschrieben = 0;
  let fehler = 0;
  if (schreiben) {
    for (const r of changes) {
      try {
        const site = sites.find(s => s.id === r.id)!;
        const result = await applyPalette(site.doc, r.next, {
          readDoc: async () => (await getWebsiteById(r.id))?.websiteData,
          latestVersionDoc: async () =>
            (await getLatestWebsiteVersion(r.id))?.doc ?? null,
          insertVersion: v => insertWebsiteVersion({ websiteId: r.id, ...v }),
          writeDoc: async doc => {
            assertV2SafeWrite(site.doc, doc);
            await updateWebsite(r.id, { websiteData: doc as never });
          },
        });
        if (result.ok) geschrieben += 1;
        else {
          fehler += 1;
          if (result.written) geschrieben += 1;
          console.error(
            `${r.id}  ${result.written ? "WARNUNG" : "ABGEBROCHEN"}: ${result.reason}`
          );
        }
      } catch (err) {
        fehler += 1;
        console.error(`${r.id}  FEHLER beim Schreiben:`, err);
      }
    }
  }

  const skips = rows.filter(r => r.kind === "skip").length;
  console.log(
    `\n${schreiben ? geschrieben : changes.length} ${schreiben ? "geschrieben" : "würden geändert"} · ${skips} ausgelassen · ${rows.length - skips - changes.length} unverändert${fehler ? ` · ${fehler} Fehler` : ""}`
  );
  if (!schreiben && changes.length > 0)
    console.log("Trockenlauf. Mit --schreiben wird geschrieben.");
  if (schreiben && geschrieben > 0)
    console.log(
      "Danach `pm2 restart pageblitz` — der SSR-Cache lebt im Serverprozess."
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

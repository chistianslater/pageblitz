/**
 * Designsystem-Seiten (rev 3) auf rev 2 zurücksetzen — Rollback-Hilfe
 * (2026-10-11).
 *
 * Anlass: Code vor dem Branch `feat/designsystem-journal` kennt nur
 * `designRevision` 1 und 2. Ein Dokument mit `designRevision: 3` und
 * `system`/`palette` besteht dort die Schema-Prüfung nicht — die Seite wäre
 * nach einem Rollback weg (404 „Noch keine Website im neuen Format").
 *
 * Dieses Skript schreibt `withoutDesignSystem(doc)` zurück: `system` und
 * `palette` entfallen, die Revision wird 2. Inhalte, Fotos, Pack und Profil
 * bleiben unverändert; die Seite zeigt danach wieder ihr Style-Pack.
 *
 * Standardmäßig Trockenlauf. Geschrieben wird erst mit `--schreiben`.
 * Vorher sichern (siehe docs/BETRIEB-V2.md, „Rollback bei Designsystemen"):
 *
 *   npx tsx -r dotenv/config scripts/systeme-zuruecksetzen.ts
 *   npx tsx -r dotenv/config scripts/systeme-zuruecksetzen.ts --schreiben
 *
 * Gespeicherte Stände in `website_versions` fasst das Skript NICHT an.
 */
import { getDb, listWebsites, updateWebsite } from "../server/db";
import { withoutDesignSystem } from "../shared/designSystems/apply";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";

const schreiben = process.argv.includes("--schreiben");
const SEITENGROESSE = 200;

async function alleWebsites() {
  const alle: Awaited<ReturnType<typeof listWebsites>> = [];
  for (let offset = 0; ; offset += SEITENGROESSE) {
    const seite = await listWebsites(SEITENGROESSE, offset);
    alle.push(...seite);
    if (seite.length < SEITENGROESSE) break;
  }
  return alle;
}

async function main(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Keine Datenbank verfügbar — DATABASE_URL fehlt?");

  const alle = await alleWebsites();
  let gelesen = 0;
  const betroffen: Array<{ id: number; slug: string; system: string }> = [];
  const fehler: Array<{ id: number; slug: string; grund: string }> = [];

  for (const website of alle) {
    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (!parsed.success) continue;
    gelesen += 1;
    const doc = parsed.data;
    if (doc.designRevision !== 3) continue;

    // Über das Schema zurückschreiben: ein ungültiges Dokument darf gar
    // nicht erst in die Datenbank kommen.
    const ergebnis = WebsiteDataV2Schema.safeParse(withoutDesignSystem(doc));
    if (!ergebnis.success) {
      fehler.push({
        id: website.id,
        slug: website.slug,
        grund: ergebnis.error.issues
          .map(i => `${i.path.join(".")}: ${i.message}`)
          .join("; ")
          .slice(0, 200),
      });
      continue;
    }
    betroffen.push({
      id: website.id,
      slug: website.slug,
      system: `${doc.system ?? "?"}/${doc.palette ?? "?"}`,
    });
    if (schreiben) {
      await updateWebsite(website.id, {
        websiteData: ergebnis.data as never,
      });
    }
  }

  console.log(
    `\n${alle.length} Websites geladen · ${gelesen} im neuen Format · ${betroffen.length} mit Designsystem (rev 3)`
  );
  for (const e of betroffen) {
    console.log(`  ${e.id} ${e.slug} (${e.system})`);
  }
  if (fehler.length > 0) {
    console.log(`\n${fehler.length} NICHT zurückgesetzt (Schema-Fehler):`);
    for (const e of fehler) console.log(`  ${e.id} ${e.slug}: ${e.grund}`);
  }
  if (!schreiben && betroffen.length > 0) {
    console.log(
      `\nTrockenlauf. Mit --schreiben werden ${betroffen.length} Seiten auf rev 2 gesetzt.`
    );
  }
  if (schreiben) {
    console.log(
      `\n${betroffen.length} Seiten auf rev 2 zurückgesetzt. Danach \`pm2 restart pageblitz\` (SSR-Cache).`
    );
  }
  if (fehler.length > 0) process.exitCode = 1;
}

main().then(
  () => process.exit(process.exitCode ?? 0),
  err => {
    console.error(err);
    process.exit(1);
  }
);

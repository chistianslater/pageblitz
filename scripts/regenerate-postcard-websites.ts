/**
 * Regeneriert bestehende Vorschau-Websites aus Postkarten-CSV-Dateien.
 *
 * Der Fortschritt wird nach jeder Seite gesichert. So kann ein abgebrochener
 * Lauf fortgesetzt werden, ohne bereits erledigte Seiten erneut zu erzeugen.
 * Die CSV-Links werden direkt nach jeder erfolgreichen Regenerierung erneuert.
 *
 *   npx tsx -r dotenv/config scripts/regenerate-postcard-websites.ts \
 *     postkarten-bocholt-friseur.csv postkarten-borken-friseur.csv
 */
import fs from "fs";
import path from "path";
import { appRouter } from "../server/routers";
import {
  getGenerationJobById,
  getWebsiteByBusinessId,
} from "../server/db";

const dateien = process.argv.slice(2);
if (dateien.length === 0) {
  throw new Error("Mindestens eine Postkarten-CSV angeben");
}

const fortschrittPfad = path.join(process.cwd(), ".postkarten-regeneration.json");
const erledigt = new Set<number>(
  fs.existsSync(fortschrittPfad)
    ? (JSON.parse(fs.readFileSync(fortschrittPfad, "utf8")) as number[])
    : []
);

function adminCaller() {
  return appRouter.createCaller({
    user: { id: 0, role: "admin", email: "skript@pageblitz.de" },
    req: { protocol: "https", headers: {} },
    res: {},
  } as never);
}

const schlaf = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function csvAktualisieren(
  datei: string,
  businessId: number,
  previewToken: string
): void {
  const zeilen = fs.readFileSync(datei, "utf8").trimEnd().split("\n");
  const kopf = zeilen[0].split(";");
  const businessIdx = kopf.indexOf("business_id");
  const vorschauIdx = kopf.indexOf("vorschau_url");
  const studioIdx = kopf.indexOf("studio_url");
  if (businessIdx < 0 || vorschauIdx < 0 || studioIdx < 0) {
    throw new Error(`${datei}: Pflichtspalten fehlen`);
  }

  const neu = zeilen.map((zeile, index) => {
    if (index === 0) return zeile;
    const felder = zeile.split(";");
    if (Number(felder[businessIdx]) !== businessId) return zeile;
    felder[vorschauIdx] = `https://pageblitz.de/preview-ssr/${previewToken}`;
    felder[studioIdx] = `https://pageblitz.de/onboarding/${previewToken}`;
    return felder.join(";");
  });
  fs.writeFileSync(datei, `${neu.join("\n")}\n`, "utf8");
}

async function main(): Promise<void> {
  const caller = adminCaller();
  const fehler: string[] = [];
  let gesamt = 0;
  let neu = 0;

  for (const datei of dateien) {
    const zeilen = fs.readFileSync(datei, "utf8").trim().split("\n");
    const kopf = zeilen[0].split(";");
    const nameIdx = kopf.indexOf("name");
    const businessIdx = kopf.indexOf("business_id");
    for (const zeile of zeilen.slice(1)) {
      gesamt += 1;
      const felder = zeile.split(";");
      const name = felder[nameIdx];
      const businessId = Number(felder[businessIdx]);
      if (!businessId) {
        fehler.push(`${name}: business_id fehlt`);
        continue;
      }

      let website = await getWebsiteByBusinessId(businessId);
      if (!website) {
        try {
          const { jobId } = await caller.website.generate({ businessId });
          for (let versuch = 0; versuch < 90; versuch += 1) {
            await schlaf(4000);
            const job = await getGenerationJobById(jobId);
            if (job?.status === "completed") break;
            if (job?.status === "failed") {
              throw new Error(job.error ?? "Generierung fehlgeschlagen");
            }
          }
          website = await getWebsiteByBusinessId(businessId);
          if (!website?.websiteData) throw new Error("Website blieb unvollständig");
          csvAktualisieren(datei, businessId, website.previewToken);
          erledigt.add(businessId);
          fs.writeFileSync(
            fortschrittPfad,
            `${JSON.stringify([...erledigt], null, 2)}\n`,
            "utf8"
          );
          neu += 1;
          console.log(`${name}: fehlende Website neu erzeugt`);
          continue;
        } catch (error) {
          const grund = error instanceof Error ? error.message : String(error);
          fehler.push(`${name}: ${grund}`);
          console.error(`${name}: FEHLER — ${grund}`);
          continue;
        }
      }

      if (erledigt.has(businessId)) {
        csvAktualisieren(datei, businessId, website.previewToken);
        console.log(`${name}: bereits erledigt`);
        continue;
      }

      try {
        const result = await caller.website.regenerate({ websiteId: website.id });
        csvAktualisieren(datei, businessId, result.previewToken);
        erledigt.add(businessId);
        fs.writeFileSync(
          fortschrittPfad,
          `${JSON.stringify([...erledigt], null, 2)}\n`,
          "utf8"
        );
        neu += 1;
        console.log(`${name}: neu erzeugt (${result.packId})`);
      } catch (error) {
        const grund = error instanceof Error ? error.message : String(error);
        fehler.push(`${name}: ${grund}`);
        console.error(`${name}: FEHLER — ${grund}`);
      }
    }
  }

  console.log(`Fertig: ${neu} neu, ${gesamt - neu - fehler.length} übersprungen, ${fehler.length} Fehler`);
  if (fehler.length > 0) {
    console.error(fehler.join("\n"));
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

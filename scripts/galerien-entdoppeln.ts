/**
 * Doppelte Motive aus den Galerien bestehender Vorschau-Seiten entfernen
 * (2026-09-13).
 *
 * Anlass: Dieselbe Stockaufnahme stand zweimal in einer Galerie — einmal als
 * `?w=800&q=80`, einmal als `?w=1400&q=85`. Die Ursache ist in
 * `buildStockFallbackImages` behoben (664be3e), aber bestehende Dokumente
 * tragen ihre Galerie gespeichert und ändern sich davon nicht.
 *
 * Entdoppelt wird nach Motiv (Pfad ohne Query), nicht nach URL. Fällt die
 * Galerie dadurch unter ihre bisherige Größe, wird aus dem Branchen-Stock
 * nachgelegt — Betreiber-Entscheidung 2026-09-13: lieber mit Stockfotos
 * auffüllen als eine dünne Galerie zeigen. Hero und Über-uns sind dabei
 * gesperrt, damit kein Motiv doppelt auf der Seite landet.
 *
 * Kein Sprachmodell, keine Kosten. Texte bleiben unangetastet.
 *
 * ZWEI HARTE GRENZEN, wie beim Design-Lauf:
 *
 *   1. Nur `status = "preview"`. Verkaufte Seiten bleiben unberührt.
 *   2. Standardmäßig Trockenlauf. Geschrieben wird erst mit `--schreiben`.
 *
 * Aufruf auf dem Server:
 *
 *   npx tsx -r dotenv/config scripts/galerien-entdoppeln.ts
 *   npx tsx -r dotenv/config scripts/galerien-entdoppeln.ts --branche Friseur
 *   npx tsx -r dotenv/config scripts/galerien-entdoppeln.ts --branche Friseur --schreiben
 */
import { getDb, listWebsites, updateWebsite } from "../server/db";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import { galerieBereinigen, type GalerieBild } from "../server/galerie";
import { buildStockFallbackImages } from "../server/industryImages";

const schreiben = process.argv.includes("--schreiben");

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const brancheFilter = arg("--branche")?.trim().toLowerCase();

async function main(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Keine Datenbank verfügbar — DATABASE_URL fehlt?");

  const alle: Awaited<ReturnType<typeof listWebsites>> = [];
  for (let offset = 0; ; offset += 200) {
    const seite = await listWebsites(200, offset);
    alle.push(...seite);
    if (seite.length < 200) break;
  }

  let geprueft = 0;
  let uebersprungenVerkauft = 0;
  let ohneGalerie = 0;
  let sauber = 0;
  const geaendert: Array<{
    slug: string;
    vorher: number;
    nachher: number;
    entfernt: number;
    ergaenzt: number;
  }> = [];

  for (const website of alle) {
    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (!parsed.success) continue;
    const doc = parsed.data;

    if (website.status !== "preview") {
      uebersprungenVerkauft += 1;
      continue;
    }
    const kategorie = doc.businessCategory ?? "";
    if (brancheFilter && !kategorie.toLowerCase().includes(brancheFilter)) {
      continue;
    }
    geprueft += 1;

    const galerieIndex = doc.sections.findIndex(s => s.type === "gallery");
    if (galerieIndex < 0) {
      ohneGalerie += 1;
      continue;
    }
    const galerie = doc.sections[galerieIndex] as {
      type: "gallery";
      headline?: string;
      images: GalerieBild[];
    };

    // Hero und Über-uns sperren: ein Motiv, das oben schon steht, gehört
    // nicht noch einmal in die Galerie.
    const belegt: string[] = [];
    for (const s of doc.sections) {
      const url = (s as { imageUrl?: string }).imageUrl;
      if (url) belegt.push(url);
    }

    const stock = buildStockFallbackImages(
      kategorie,
      doc.businessName,
      website.industry ?? undefined
    );
    const nachschub = stock.gallery ?? [];

    const { bilder, entfernt, ergaenzt } = galerieBereinigen(
      galerie.images,
      nachschub,
      belegt
    );
    if (entfernt === 0 && ergaenzt === 0) {
      sauber += 1;
      continue;
    }

    geaendert.push({
      slug: website.slug,
      vorher: galerie.images.length,
      nachher: bilder.length,
      entfernt,
      ergaenzt,
    });

    if (schreiben) {
      const sections = [...doc.sections];
      sections[galerieIndex] = { ...galerie, images: bilder };
      const naechstes = WebsiteDataV2Schema.parse({ ...doc, sections });
      await updateWebsite(website.id, { websiteData: naechstes as never });
    }
  }

  console.log(
    `\n${geprueft} Vorschau-Seiten geprüft · ${uebersprungenVerkauft} verkauft (unangetastet) · ${ohneGalerie} ohne Galerie`
  );
  console.log(`${sauber} Galerien waren bereits ohne Wiederholung.`);
  console.log(
    `${geaendert.length} ${schreiben ? "geändert" : "würden sich ändern"}:`
  );
  for (const e of geaendert.slice(0, 50)) {
    const teile = [
      e.entfernt ? `${e.entfernt} Dublette(n) raus` : "",
      e.ergaenzt ? `${e.ergaenzt} aus dem Stock nachgelegt` : "",
    ].filter(Boolean);
    console.log(
      `  ${e.slug}: ${e.vorher} → ${e.nachher} Bilder (${teile.join(", ")})`
    );
  }
  if (geaendert.length > 50)
    console.log(`  … und ${geaendert.length - 50} weitere`);
  if (!schreiben && geaendert.length > 0) {
    console.log("\nTrockenlauf. Mit --schreiben wird es angewendet.");
  }
  if (schreiben && geaendert.length > 0) {
    console.log(
      "\nGeschrieben. `pm2 restart pageblitz` macht die Galerien sofort sichtbar."
    );
  }
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
);

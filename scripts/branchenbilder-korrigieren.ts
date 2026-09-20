/**
 * Falsch zugeordnete Stockbilder bestehender Vorschau-Seiten ersetzen
 * (2026-09-20).
 *
 * Anlass: Kurze Schlagworte der Bildbibliothek trafen als Teilstring —
 * „it" (Technik) steckt in „City" und „Infinity", „bar" in „Barbier",
 * „bau" in „Baumann". Der Friseursalon „Salon City Cuts Borken" bekam so
 * Laptop- und Bürofotos. Die Ursache ist in `getIndustryImages` behoben,
 * aber bestehende Dokumente tragen ihre Bilder gespeichert.
 *
 * Ersetzt werden ausschließlich Unsplash-URLs, die nicht zum korrekt
 * ermittelten Branchensatz gehören. Eigene Uploads und gespiegelte
 * Google-Fotos (R2) bleiben unangetastet.
 *
 * ZWEI HARTE GRENZEN, wie beim Entdoppeln:
 *
 *   1. Nur `status = "preview"`. Verkaufte Seiten bleiben unberührt.
 *   2. Standardmäßig Trockenlauf. Geschrieben wird erst mit `--schreiben`.
 *
 * Aufruf auf dem Server:
 *
 *   npx tsx -r dotenv/config scripts/branchenbilder-korrigieren.ts
 *   npx tsx -r dotenv/config scripts/branchenbilder-korrigieren.ts --schreiben
 */
import { getDb, listWebsites, updateWebsite } from "../server/db";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import {
  bildIdentitaet,
  buildStockFallbackImages,
  getIndustryImages,
} from "../server/industryImages";

const schreiben = process.argv.includes("--schreiben");

/** Nur kuratierte Stockbilder werden ersetzt, nie Uploads oder Google-Fotos. */
function istStock(url: string): boolean {
  return url.includes("images.unsplash.com");
}

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
  let verkauft = 0;
  const geaendert: Array<{
    slug: string;
    kategorie: string;
    ersetzt: number;
  }> = [];

  for (const website of alle) {
    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (!parsed.success) continue;
    if (website.status !== "preview") {
      verkauft += 1;
      continue;
    }
    const doc = parsed.data;
    const kategorie = doc.businessCategory ?? "";
    geprueft += 1;

    const satz = getIndustryImages(kategorie, doc.businessName, undefined);
    const richtig = new Set(
      [...(satz.gallery ?? []), ...satz.hero, ...(satz.about ?? [])].map(
        bildIdentitaet
      )
    );
    const ersatz = buildStockFallbackImages(kategorie, doc.businessName);
    const vorrat = [
      ...(ersatz.gallery ?? []),
      ...(ersatz.about ? [ersatz.about] : []),
      ersatz.hero,
    ];

    let ersetzt = 0;
    let naechster = 0;
    const benutzt = new Set<string>();
    const hol = (): string | null => {
      while (naechster < vorrat.length) {
        const url = vorrat[naechster++];
        const id = bildIdentitaet(url);
        if (benutzt.has(id)) continue;
        benutzt.add(id);
        return url;
      }
      return null;
    };
    // Bereits vorhandene Motive gelten als vergeben, damit nichts doppelt wird.
    for (const s of doc.sections) {
      const mitBild = s as { imageUrl?: string; images?: { url: string }[] };
      if (mitBild.imageUrl) benutzt.add(bildIdentitaet(mitBild.imageUrl));
      for (const b of mitBild.images ?? []) benutzt.add(bildIdentitaet(b.url));
    }

    const sections = doc.sections.map(s => {
      const mitBild = s as {
        imageUrl?: string;
        images?: { url: string; alt?: string }[];
      };
      let neu = s;
      if (
        mitBild.imageUrl &&
        istStock(mitBild.imageUrl) &&
        !richtig.has(bildIdentitaet(mitBild.imageUrl))
      ) {
        const url = hol();
        if (url) {
          neu = { ...neu, imageUrl: url } as typeof s;
          ersetzt += 1;
        }
      }
      if (mitBild.images?.length) {
        const bilder = mitBild.images.map(b => {
          if (!istStock(b.url) || richtig.has(bildIdentitaet(b.url))) return b;
          const url = hol();
          if (!url) return b;
          ersetzt += 1;
          return { ...b, url };
        });
        neu = { ...neu, images: bilder } as typeof s;
      }
      return neu;
    });

    if (ersetzt === 0) continue;
    geaendert.push({ slug: website.slug, kategorie, ersetzt });
    if (schreiben) {
      await updateWebsite(website.id, {
        websiteData: { ...doc, sections },
      });
    }
  }

  console.log(
    `${geprueft} Vorschau-Seiten geprüft, ${verkauft} verkaufte übersprungen.`
  );
  for (const g of geaendert) {
    console.log(
      `  ${g.slug.padEnd(38)} ${g.kategorie.padEnd(18)} ${g.ersetzt} Bild(er)`
    );
  }
  console.log(
    geaendert.length === 0
      ? "Nichts zu korrigieren."
      : schreiben
        ? `${geaendert.length} Seite(n) geschrieben.`
        : `${geaendert.length} Seite(n) würden geändert — mit --schreiben ausführen.`
  );
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

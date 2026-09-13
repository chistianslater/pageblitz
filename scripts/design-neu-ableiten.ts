/**
 * Design-Silhouette bestehender Vorschau-Seiten neu ableiten (2026-09-13).
 *
 * Anlass: Der Rezept-Zähler drehte bis c67309c auch die Komposition durch —
 * von einem Kampagnenstapel sah nur etwa jede fünfte Seite aus wie das Pack,
 * mit dem die Postkarte wirbt. Die Regel ist korrigiert, aber das Design
 * steckt im gespeicherten Dokument: Solange dort ein `designProfile` liegt,
 * rendert die Seite weiter ihr altes Layout.
 *
 * Dieses Skript leitet das Profil neu ab — mit derselben Logik wie die
 * Generierung, inklusive Verteilung innerhalb einer Stadt. Es ruft KEIN
 * Sprachmodell auf: Texte, Fotos, Öffnungszeiten, Preise bleiben Zeichen für
 * Zeichen, was sie sind. Nur die Gestaltungs-Achse wird ersetzt.
 *
 * ZWEI HARTE GRENZEN:
 *
 *   1. Nur `status = "preview"`. Verkaufte Seiten bleiben unangetastet —
 *      dieselbe Regel wie in `website.regenerate` (server/routers.ts): Wer
 *      bezahlt, bekommt seine Gestaltung nicht über Nacht ausgetauscht
 *      (docs/superpowers/specs/2026-09-12-design-staende-design.md).
 *   2. Standardmäßig Trockenlauf. Geschrieben wird erst mit `--schreiben`.
 *
 * Aufruf auf dem Server (dort sind DATABASE_URL und die Schlüssel gesetzt):
 *
 *   npx tsx -r dotenv/config scripts/design-neu-ableiten.ts
 *   npx tsx -r dotenv/config scripts/design-neu-ableiten.ts --branche Friseur
 *   npx tsx -r dotenv/config scripts/design-neu-ableiten.ts --branche Friseur --schreiben
 */
import { getDb, listWebsites, updateWebsite } from "../server/db";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import {
  CURRENT_DESIGN_REVISION,
  compositionFingerprint,
  deriveArtDirectedProfile,
} from "../shared/stylePacks/artDirection";
import { designIndustryKey } from "../shared/stylePacks/categoryAliases";

const schreiben = process.argv.includes("--schreiben");

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const brancheFilter = arg("--branche")?.trim().toLowerCase();

/** Seiten einer Stadt+Branche bekommen verschiedene Rhythmen, wie bei der Generierung. */
function gruppenschluessel(
  city: string | undefined,
  kategorie: string
): string {
  return `${(city ?? "").trim().toLowerCase()}|${designIndustryKey(kategorie)}`;
}

async function main(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Keine Datenbank verfügbar — DATABASE_URL fehlt?");

  // listWebsites paginiert; in Seiten von 200 durchlaufen, damit auch ein
  // großer Bestand nicht am Limit hängen bleibt.
  const alle: Awaited<ReturnType<typeof listWebsites>> = [];
  for (let offset = 0; ; offset += 200) {
    const seite = await listWebsites(200, offset);
    alle.push(...seite);
    if (seite.length < 200) break;
  }

  const belegt = new Map<string, Set<string>>();
  const zaehler = new Map<string, number>();
  let geprueft = 0;
  let uebersprungenVerkauft = 0;
  let uebersprungenFremd = 0;
  let unveraendert = 0;
  let ohneProfil = 0;
  const rhythmen = new Map<string, number>();
  const geaendert: Array<{
    id: number;
    slug: string;
    von: string;
    nach: string;
  }> = [];

  for (const website of alle) {
    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (!parsed.success) continue;
    const doc = parsed.data;
    geprueft += 1;

    if (website.status !== "preview") {
      uebersprungenVerkauft += 1;
      continue;
    }
    const kategorie = doc.businessCategory ?? "";
    if (brancheFilter && !kategorie.toLowerCase().includes(brancheFilter)) {
      uebersprungenFremd += 1;
      continue;
    }

    // Dokumente ohne gespeichertes Profil leiten beim Rendern ohnehin frisch
    // ab (SiteRenderer/renderSite) — die brauchen keinen Schreibvorgang. Eine
    // ausdrueckliche Revision 1 ist dagegen der alte Referenz-Renderer und
    // wird mitgezogen.
    if (!doc.designProfile && doc.designRevision !== 1) {
      // Getrennt gezaehlt: "kein Profil gespeichert" ist etwas anderes als
      // "Profil stimmt schon". Beides braucht keinen Schreibvorgang, aber nur
      // das erste heisst auch, dass die Seite bei jedem Aufruf denselben
      // Grundrhythmus ableitet — also identisch zu allen anderen ohne Profil.
      ohneProfil += 1;
      continue;
    }

    const stadt = doc.sections.find(s => s.type === "contact")?.city;
    const schluessel = gruppenschluessel(stadt, kategorie);
    const occupied = belegt.get(schluessel) ?? new Set<string>();
    const offset = zaehler.get(schluessel) ?? 0;

    const neu = deriveArtDirectedProfile(
      {
        stylePackId: doc.stylePackId,
        businessName: doc.businessName,
        businessCategory: doc.businessCategory,
        sections: doc.sections,
      },
      occupied,
      offset
    );
    occupied.add(compositionFingerprint(doc.stylePackId, neu));
    belegt.set(schluessel, occupied);
    zaehler.set(schluessel, offset + 1);

    const alt = doc.designProfile;
    const altKurz = alt
      ? `${alt.composition}/${alt.heroLayout}/${alt.servicesLayout}/${alt.galleryLayout}`
      : "ohne Profil";
    const neuKurz = `${neu.composition}/${neu.heroLayout}/${neu.servicesLayout}/${neu.galleryLayout}`;
    const rhythmus = `${neu.servicesLayout}/${neu.galleryLayout}`;
    rhythmen.set(rhythmus, (rhythmen.get(rhythmus) ?? 0) + 1);
    if (altKurz === neuKurz) {
      unveraendert += 1;
      continue;
    }
    geaendert.push({
      id: website.id,
      slug: website.slug,
      von: altKurz,
      nach: neuKurz,
    });

    if (schreiben) {
      // Über das Schema zurückschreiben: ein ungültiges Dokument darf gar
      // nicht erst in die Datenbank kommen.
      const naechstes = WebsiteDataV2Schema.parse({
        ...doc,
        designRevision: CURRENT_DESIGN_REVISION,
        designProfile: neu,
      });
      await updateWebsite(website.id, { websiteData: naechstes as never });
    }
  }

  console.log(
    `\n${geprueft} Vorschau-Dokumente gelesen · ${uebersprungenVerkauft} verkauft (unangetastet)` +
      (brancheFilter ? ` · ${uebersprungenFremd} andere Branche` : "")
  );
  console.log(
    `${ohneProfil} ohne gespeichertes Profil (leiten beim Rendern ab — alle mit demselben Grundrhythmus).`
  );
  console.log(`${unveraendert} mit Profil, das bereits stimmt.`);
  if (rhythmen.size > 0) {
    const verteilung = [...rhythmen.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([r, n]) => `${r}: ${n}`)
      .join(" · ");
    console.log(`Rhythmus-Verteilung der geprüften Profile: ${verteilung}`);
  }
  console.log(
    `${geaendert.length} ${schreiben ? "geändert" : "würden sich ändern"}:`
  );
  for (const e of geaendert.slice(0, 40)) {
    console.log(`  ${e.slug}: ${e.von}  →  ${e.nach}`);
  }
  if (geaendert.length > 40)
    console.log(`  … und ${geaendert.length - 40} weitere`);
  if (!schreiben && geaendert.length > 0) {
    console.log("\nTrockenlauf. Mit --schreiben wird es angewendet.");
  }
  if (schreiben && geaendert.length > 0) {
    console.log(
      "\nGeschrieben. Der SSR-Cache hält Seiten kurz vor — ein `pm2 restart pageblitz` macht die neuen Layouts sofort sichtbar."
    );
  }
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  }
);

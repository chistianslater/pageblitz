/**
 * Stapel-Vorschauen für die Postkarten-Akquise (2026-09-05).
 *
 * Sucht Betriebe einer Branche in einer Stadt über dieselbe Admin-Suche wie
 * das Panel, übernimmt sie in die Datenbank, erzeugt für die besten eine
 * Vorschau-Website und schreibt Name, Postanschrift und Vorschau-Link in
 * eine CSV — die Grundlage für den Postkarten-Versand.
 *
 * Verschickt NICHTS: keine Mail, keine Outreach-Warteschlange.
 *
 * Aufruf auf dem Server (dort sind DB, Places-Schlüssel und R2 gesetzt):
 *   npx tsx scripts/stapel-vorschauen.ts --stadt "Dortmund" --branche "Friseur"
 *   --anzahl 10   wie viele Vorschauen (Standard 10)
 *   --trocken     nur suchen und auflisten, nichts erzeugen
 */
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { appRouter } from "../server/routers";
import {
  getGenerationJobById,
  getWebsiteByBusinessId,
  upsertBusiness,
} from "../server/db";

/** Wie in server/routers.ts — dort lokal, deshalb hier gespiegelt. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[m] || m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

interface Args {
  stadt: string;
  branche: string;
  anzahl: number;
  trocken: boolean;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const stadt = get("--stadt");
  const branche = get("--branche");
  if (!stadt || !branche) {
    throw new Error(
      'Aufruf: npx tsx scripts/stapel-vorschauen.ts --stadt "Dortmund" --branche "Friseur" [--anzahl 10] [--trocken]'
    );
  }
  return {
    stadt,
    branche,
    anzahl: Number(get("--anzahl") ?? 10),
    trocken: argv.includes("--trocken"),
  };
}

/** Admin-Kontext für die bestehenden adminProcedure-Aufrufe. */
function adminCaller() {
  return appRouter.createCaller({
    user: { id: 0, role: "admin", email: "skript@pageblitz.de" },
    req: { protocol: "https", headers: {} },
    res: {},
  } as never);
}

const schlaf = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Für Postkarten zählt die Anschrift, nicht die E-Mail. Zuerst Betriebe ganz
 * ohne Website, danach veraltete — dort ist der Bedarf am größten.
 */
const RANG: Record<string, number> = {
  no_website: 0,
  outdated_website: 1,
  poor_website: 2,
  unknown: 3,
};

type Treffer = Awaited<
  ReturnType<ReturnType<typeof adminCaller>["search"]["gmb"]>
>["results"][number];

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const caller = adminCaller();

  console.log(`Suche „${args.branche}" in ${args.stadt} …`);
  const { results } = await caller.search.gmb({
    query: args.branche,
    region: args.stadt,
    includeOutdated: true,
  });
  console.log(`  ${results.length} Betriebe gefunden.`);

  const kandidaten: Treffer[] = results
    .filter(r => (r.address ?? "").trim().length > 0)
    .sort(
      (a, b) =>
        (RANG[a.leadType] ?? 3) - (RANG[b.leadType] ?? 3) ||
        (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
    )
    .slice(0, args.anzahl);

  console.log(`  ${kandidaten.length} mit Anschrift ausgewählt:\n`);
  for (const b of kandidaten) {
    console.log(
      `  · ${b.name} — ${b.address} [${b.leadType}, ${b.reviewCount ?? 0} Bewertungen]`
    );
  }
  if (args.trocken) {
    console.log("\n--trocken: nichts übernommen, nichts erzeugt.");
    return;
  }

  const zeilen: string[] = [
    "name;anschrift;telefon;bisherige_website;lead;bewertungen;vorschau_url",
  ];
  for (const [i, r] of kandidaten.entries()) {
    console.log(`\n[${i + 1}/${kandidaten.length}] ${r.name}`);
    // Übernahme wie search.saveResults, aber einzeln — wir brauchen die id.
    const businessId = await upsertBusiness({
      placeId: r.placeId,
      name: r.name,
      slug: slugify(r.name) + "-" + nanoid(6),
      address: r.address || null,
      phone: r.phone || null,
      website: r.website || null,
      rating: r.rating?.toString() || null,
      reviewCount: r.reviewCount || 0,
      category: r.category || null,
      editorialSummary: r.editorialSummary || null,
      lat: r.lat?.toString() || null,
      lng: r.lng?.toString() || null,
      openingHours: r.openingHours || [],
      hasWebsite: r.hasWebsite ? 1 : 0,
      leadType: r.leadType || (r.hasWebsite ? "unknown" : "no_website"),
      searchQuery: args.branche,
      searchRegion: args.stadt,
      googleReviews: r.reviews && r.reviews.length > 0 ? r.reviews : null,
    });

    const vorhanden = await getWebsiteByBusinessId(businessId);
    if (vorhanden) {
      console.log("  Vorschau existiert bereits — Generierung übersprungen");
    } else {
      const { jobId } = await caller.website.generate({ businessId });
      // Der Job läuft im Hintergrund; abwarten, damit die CSV nur Links auf
      // fertige Seiten enthält. Rund eine Minute je Seite ist normal.
      for (let versuch = 0; versuch < 90; versuch++) {
        await schlaf(4000);
        const job = await getGenerationJobById(jobId);
        if (!job) continue;
        if (job.status === "completed") break;
        if (job.status === "failed") {
          console.log(`  FEHLGESCHLAGEN: ${job.error ?? "unbekannt"}`);
          break;
        }
      }
    }

    // Ein gescheiterter Job hinterlässt Zeile UND Token, aber kein Dokument
    // — der Link liefe auf 404 (Befund Bocholt 2026-09-05). Nur Seiten mit
    // Inhalt kommen in die Postkarten-Liste.
    const seite = await getWebsiteByBusinessId(businessId);
    const fertig = Boolean(seite?.previewToken && seite?.websiteData);
    const url = fertig
      ? `https://pageblitz.de/onboarding/${seite!.previewToken}`
      : "";
    console.log(`  ${url || "KEINE VORSCHAU — nicht für Postkarte geeignet"}`);
    zeilen.push(
      [
        r.name,
        r.address ?? "",
        r.phone ?? "",
        r.website ?? "",
        r.leadType,
        String(r.reviewCount ?? 0),
        url,
      ]
        .map(f => String(f).replaceAll(";", ","))
        .join(";")
    );
  }

  const datei = path.join(
    process.cwd(),
    `postkarten-${slugify(args.stadt)}-${slugify(args.branche)}.csv`
  );
  fs.writeFileSync(datei, zeilen.join("\n") + "\n", "utf8");
  console.log(`\nListe geschrieben: ${datei}`);
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  }
);

/**
 * Eine Kundenseite diagnostizieren (2026-09-13).
 *
 * Liest ein Dokument aus der Datenbank und beantwortet die Fragen, die bei
 * einem Befund am Telefon zuerst kommen: Welches Pack, welche Gestaltung,
 * welche Bilder — und sind die Bilder überhaupt erreichbar? Die Bild-URLs
 * werden per HEAD geprüft, weil „Bild fehlt" fast immer eines von zwei
 * Dingen heißt: gar keine URL im Dokument, oder eine URL, die ins Leere
 * zeigt (nicht gespiegelte Google-Fotos, abgelaufene Signaturen).
 *
 * Reines Lesen: kein Schreibvorgang, kein Sprachmodell, keine Kosten.
 *
 * Aufruf auf dem Server:
 *
 *   npx tsx -r dotenv/config scripts/seite-pruefen.ts --slug iris-klautke-friseursalon-V0Uo
 *   npx tsx -r dotenv/config scripts/seite-pruefen.ts --slug <slug> --ohne-netz
 */
import { getDb, listWebsites } from "../server/db";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const slug = arg("--slug");
const ohneNetz = process.argv.includes("--ohne-netz");

/**
 * Alle Bild-URLs im Dokument einsammeln, samt Pfad zur Fundstelle.
 *
 * Nicht über die Dateiendung: Google-Fotos kommen als
 * `lh3.googleusercontent.com/p/AF1Qip…=w1600` ohne Endung. Die erste Fassung
 * filterte genau danach und meldete deshalb für eine Seite mit Galerie
 * „2 Bilder", obwohl die Galerie voll war — die Lücke hat den Befund
 * verschleiert statt ihn zu zeigen. Jetzt entscheidet der Feldname.
 */
const BILDFELDER = new Set(["url", "imageurl", "src", "image", "photourl"]);

function bilderSammeln(
  wert: unknown,
  pfad: string,
  treffer: Array<{ pfad: string; url: string }> = [],
  feld = ""
): Array<{ pfad: string; url: string }> {
  if (typeof wert === "string") {
    const istBildfeld = BILDFELDER.has(feld.toLowerCase());
    const hatEndung = /\.(webp|jpe?g|png|avif|gif)(\?|$)/i.test(wert);
    // Auch relative Pfade melden: die zeigen auf die eigene Domain und
    // laufen auf einer Kundenseite ins Leere, wenn dort nichts liegt.
    const istPfad = wert.startsWith("/") && (istBildfeld || hatEndung);
    if ((/^https?:\/\//i.test(wert) && (istBildfeld || hatEndung)) || istPfad) {
      treffer.push({ pfad, url: wert });
    }
    return treffer;
  }
  if (Array.isArray(wert)) {
    wert.forEach((eintrag, i) =>
      bilderSammeln(eintrag, `${pfad}[${i}]`, treffer, feld)
    );
    return treffer;
  }
  if (wert && typeof wert === "object") {
    for (const [schluessel, inhalt] of Object.entries(wert)) {
      bilderSammeln(
        inhalt,
        pfad ? `${pfad}.${schluessel}` : schluessel,
        treffer,
        schluessel
      );
    }
  }
  return treffer;
}

async function erreichbar(url: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) return "relativer Pfad";
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const laenge = res.headers.get("content-length");
    return `${res.status}${res.ok && laenge ? ` · ${Math.round(Number(laenge) / 1024)} KB` : ""}`;
  } catch (err) {
    return `nicht erreichbar (${err instanceof Error ? err.message : "Fehler"})`;
  }
}

async function main(): Promise<void> {
  if (!slug) throw new Error("Aufruf: --slug <slug-der-seite>");
  const db = await getDb();
  if (!db) throw new Error("Keine Datenbank verfügbar — DATABASE_URL fehlt?");

  let website: Awaited<ReturnType<typeof listWebsites>>[number] | undefined;
  for (let offset = 0; ; offset += 200) {
    const seite = await listWebsites(200, offset);
    website = seite.find(w => w.slug === slug);
    if (website || seite.length < 200) break;
  }
  if (!website) throw new Error(`Keine Website mit slug "${slug}" gefunden.`);

  const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
  if (!parsed.success) {
    console.log(
      `Dokument ist nicht schema-valide: ${parsed.error.message.slice(0, 400)}`
    );
    return;
  }
  const doc = parsed.data;
  const profil = doc.designProfile;

  console.log(`\n${doc.businessName} · ${website.slug}`);
  console.log(
    `Status: ${website.status} · Pack: ${doc.stylePackId} · Revision: ${doc.designRevision ?? "ohne (leitet beim Rendern ab)"}`
  );
  console.log(
    `Gestaltung: ${
      profil
        ? `${profil.composition ?? "alt"}/${profil.heroLayout} · ${profil.servicesLayout}/${profil.galleryLayout}`
        : "kein gespeichertes Profil"
    }`
  );
  console.log(`Abschnitte: ${doc.sections.map(s => s.type).join(", ")}`);

  const bilder = bilderSammeln(doc.sections, "sections");
  if (bilder.length === 0) {
    console.log(
      "\nKEINE Bild-URLs im Dokument. Das Layout rechnet dann mit Fotos, die es nicht gibt —\n" +
        "die Seite braucht die Typo-Variante (Komposition 'statement')."
    );
    return;
  }

  // Herkunft ehrlich benennen: die erste Fassung nannte alles "R2", was nicht
  // von Google kam — und wies damit Unsplash-Stockfotos als gespiegelte
  // Kundenfotos aus. Genau die Unterscheidung braucht man hier.
  const herkunftVon = (url: string): string => {
    if (!/^https?:\/\//i.test(url)) return "relativ";
    if (/googleusercontent|ggpht/i.test(url)) return "Google";
    if (/images\.unsplash\.com/i.test(url)) return "Stock";
    if (/r2\.dev|r2\.cloudflarestorage/i.test(url)) return "R2";
    try {
      return new URL(url).hostname.replace(/^www\./, "").slice(0, 18);
    } catch {
      return "?";
    }
  };
  const zaehlung = new Map<string, number>();
  for (const b of bilder) {
    const h = herkunftVon(b.url);
    zaehlung.set(h, (zaehlung.get(h) ?? 0) + 1);
  }
  console.log(
    `\n${bilder.length} Bild-URLs im Dokument — ` +
      [...zaehlung.entries()].map(([h, n]) => `${n}× ${h}`).join(", ")
  );
  const stock = bilder.filter(b => herkunftVon(b.url) === "Stock");
  if (stock.length) {
    console.log(
      `  Hinweis: ${stock.length} davon sind Stockfotos, keine Fotos des Betriebs.`
    );
  }
  for (const { pfad, url } of bilder) {
    const status = ohneNetz ? "(nicht geprüft)" : await erreichbar(url);
    const herkunft = herkunftVon(url);
    console.log(`  ${status.padEnd(22)} ${herkunft.padEnd(7)} ${pfad}`);
    console.log(`  ${" ".repeat(30)} ${url.slice(0, 120)}`);
  }
  const motive = bilder.map(b => {
    try {
      return new URL(b.url).pathname;
    } catch {
      return b.url.split("?")[0];
    }
  });
  const doppelt = motive.filter((m, i) => motive.indexOf(m) !== i);
  if (doppelt.length) {
    console.log(
      `\nACHTUNG: ${doppelt.length} Motiv(e) kommen mehrfach vor — dasselbe Foto\n` +
        "steht zweimal auf der Seite (oft dieselbe Datei in zwei Größen)."
    );
  }
  if (!ohneNetz) {
    console.log(
      "\n200 = Bild liegt und wird ausgeliefert. 403/404 = URL zeigt ins Leere:\n" +
        "dann wurden die Google-Fotos nicht nach R2 gespiegelt oder die Signatur ist abgelaufen."
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

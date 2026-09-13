/**
 * Wer kriegt eine Karte, und was fehlt ihm noch? (2026-09-13)
 *
 * Die Kampagne lief bisher ueber eine CSV auf dem Server: Namen und
 * Anschriften von Hand zusammengestellt, Motive per Skript, Versand per
 * Skript. Im Dashboard war danach nur zu sehen, welche Karte gescannt
 * wurde — nicht, welche Betriebe ueberhaupt eine haben, ob das Motiv zur
 * heutigen Seite passt und was einem Auftrag noch im Weg steht.
 *
 * Diese Liste ist die Antwort darauf. Sie entsteht aus dem, was ohnehin in
 * der Datenbank steht: jede Vorschau-Seite mit ihrem Betrieb und der Karte,
 * falls es schon eine gibt.
 */
import { and, desc, eq, like, or, type SQL } from "drizzle-orm";
import { getDb } from "../db";
import { businesses, generatedWebsites, postcards } from "../../drizzle/schema";
import { anschriftZerlegen, type Empfaenger } from "./heymail";

export interface KandidatZeile {
  businessId: number;
  name: string;
  anschrift: string | null;
  branche: string | null;
  websiteId: number;
  slug: string;
  previewToken: string | null;
  /** Letzte Aenderung an der Seite — Massstab fuer ein veraltetes Motiv. */
  websiteUpdatedAt: Date | null;
  karteId: number | null;
  code: string | null;
  kartenStatus: string | null;
  textVariant: string | null;
  bildUrl: string | null;
  bildAt: Date | null;
  pdfUrl: string | null;
  sentAt: Date | null;
}

export type Zustand =
  | "versendet"
  | "bereit"
  | "motiv-veraltet"
  | "ohne-motiv"
  | "ohne-anschrift"
  | "ohne-vorschau";

export interface Kandidat extends KandidatZeile {
  zustand: Zustand;
  hinweis: string;
  stadt: string | null;
  /** Nur hier true, wenn ein Auftrag jetzt durchginge. */
  beauftragbar: boolean;
}

/**
 * Reihenfolge der Pruefung ist Absicht: Was raus ist, ist raus — daran
 * aendert ein veraltetes Motiv nichts mehr. Danach kommt, was den Versand
 * ganz verhindert (Anschrift, Token), erst dann das Motiv.
 */
export function kandidatBewerten(zeile: KandidatZeile): Kandidat {
  const empfaenger: Empfaenger | null = zeile.anschrift
    ? anschriftZerlegen(zeile.anschrift)
    : null;
  const stadt = empfaenger?.city ?? null;
  const basis = { ...zeile, stadt };

  if (zeile.kartenStatus === "versendet") {
    return {
      ...basis,
      zustand: "versendet",
      hinweis: "Karte ist raus — bleibt unangetastet.",
      beauftragbar: false,
    };
  }
  if (!zeile.previewToken) {
    return {
      ...basis,
      zustand: "ohne-vorschau",
      hinweis: "Die Seite hat keinen Vorschau-Token, der QR haette kein Ziel.",
      beauftragbar: false,
    };
  }
  if (!empfaenger) {
    return {
      ...basis,
      zustand: "ohne-anschrift",
      hinweis: zeile.anschrift
        ? "Anschrift nicht zerlegbar — Straße, Hausnummer und PLZ prüfen."
        : "Keine Anschrift hinterlegt.",
      beauftragbar: false,
    };
  }
  if (!zeile.bildUrl) {
    return {
      ...basis,
      zustand: "ohne-motiv",
      hinweis: "Noch kein Motiv aufgenommen.",
      beauftragbar: false,
    };
  }
  if (
    zeile.bildAt &&
    zeile.websiteUpdatedAt &&
    zeile.websiteUpdatedAt.getTime() > zeile.bildAt.getTime()
  ) {
    return {
      ...basis,
      zustand: "motiv-veraltet",
      hinweis:
        "Die Seite wurde nach der Aufnahme neu erzeugt — Motiv neu aufnehmen.",
      beauftragbar: false,
    };
  }
  return {
    ...basis,
    zustand: "bereit",
    hinweis: "Motiv passt zur aktuellen Seite.",
    beauftragbar: true,
  };
}

export interface KandidatenFilter {
  /** Teilstring in der Kategorie, z. B. "Friseur". */
  branche?: string;
  /** Teilstring in der Anschrift, z. B. "Bocholt". */
  stadt?: string;
  /** Teilstring im Betriebsnamen. */
  suche?: string;
  limit?: number;
}

/**
 * Nur `status = "preview"`. Eine verkaufte Seite bekommt keine
 * Akquise-Karte — das waere Werbung an den eigenen Kunden.
 */
export async function kandidatenLaden(
  filter: KandidatenFilter = {}
): Promise<{ zeilen: Kandidat[]; abgeschnitten: boolean }> {
  const db = await getDb();
  if (!db) return { zeilen: [], abgeschnitten: false };
  const limit = filter.limit ?? 300;

  const bedingungen: SQL[] = [eq(generatedWebsites.status, "preview")];
  if (filter.branche?.trim()) {
    bedingungen.push(like(businesses.category, `%${filter.branche.trim()}%`));
  }
  if (filter.stadt?.trim()) {
    bedingungen.push(like(businesses.address, `%${filter.stadt.trim()}%`));
  }
  if (filter.suche?.trim()) {
    const s = `%${filter.suche.trim()}%`;
    const beides = or(like(businesses.name, s), like(businesses.address, s));
    if (beides) bedingungen.push(beides);
  }

  const zeilen = await db
    .select({
      businessId: businesses.id,
      name: businesses.name,
      anschrift: businesses.address,
      branche: businesses.category,
      websiteId: generatedWebsites.id,
      slug: generatedWebsites.slug,
      previewToken: generatedWebsites.previewToken,
      websiteUpdatedAt: generatedWebsites.updatedAt,
      karteId: postcards.id,
      code: postcards.code,
      kartenStatus: postcards.status,
      textVariant: postcards.textVariant,
      bildUrl: postcards.bildUrl,
      bildAt: postcards.bildAt,
      pdfUrl: postcards.pdfUrl,
      sentAt: postcards.sentAt,
    })
    .from(generatedWebsites)
    .innerJoin(businesses, eq(businesses.id, generatedWebsites.businessId))
    .leftJoin(postcards, eq(postcards.businessId, businesses.id))
    .where(and(...bedingungen))
    .orderBy(desc(generatedWebsites.updatedAt))
    .limit(limit);

  // Ein Betrieb kann mehrere Vorschau-Seiten haben (zweimal generiert, alte
  // nie aufgeraeumt). Die Karte haengt am Betrieb, nicht an der Seite —
  // deshalb bleibt je Betrieb die zuletzt geaenderte Seite stehen, dieselbe,
  // die `kandidatLaden` fuer die Aktionen nimmt.
  const jeBetrieb = new Map<number, (typeof zeilen)[number]>();
  for (const z of zeilen) {
    if (!jeBetrieb.has(z.businessId)) jeBetrieb.set(z.businessId, z);
  }

  return {
    zeilen: [...jeBetrieb.values()].map(z =>
      kandidatBewerten({
        ...z,
        anschrift: z.anschrift ?? null,
        branche: z.branche ?? null,
      })
    ),
    // Ehrlich sagen, dass die Liste endet: Sonst haelt ein Stapel von 400
    // Betrieben die ersten 300 fuer alles, was es gibt.
    abgeschnitten: zeilen.length >= limit,
  };
}

/** Eine Zeile, fuer die Aktionen auf genau einem Betrieb. */
export async function kandidatLaden(
  businessId: number
): Promise<Kandidat | null> {
  const db = await getDb();
  if (!db) return null;
  const zeilen = await db
    .select({
      businessId: businesses.id,
      name: businesses.name,
      anschrift: businesses.address,
      branche: businesses.category,
      websiteId: generatedWebsites.id,
      slug: generatedWebsites.slug,
      previewToken: generatedWebsites.previewToken,
      websiteUpdatedAt: generatedWebsites.updatedAt,
      karteId: postcards.id,
      code: postcards.code,
      kartenStatus: postcards.status,
      textVariant: postcards.textVariant,
      bildUrl: postcards.bildUrl,
      bildAt: postcards.bildAt,
      pdfUrl: postcards.pdfUrl,
      sentAt: postcards.sentAt,
    })
    .from(generatedWebsites)
    .innerJoin(businesses, eq(businesses.id, generatedWebsites.businessId))
    .leftJoin(postcards, eq(postcards.businessId, businesses.id))
    .where(
      and(
        eq(businesses.id, businessId),
        eq(generatedWebsites.status, "preview")
      )
    )
    // Wie in der Liste: die zuletzt geaenderte Seite gilt.
    .orderBy(desc(generatedWebsites.updatedAt))
    .limit(1);
  const z = zeilen[0];
  if (!z) return null;
  return kandidatBewerten({
    ...z,
    anschrift: z.anschrift ?? null,
    branche: z.branche ?? null,
  });
}

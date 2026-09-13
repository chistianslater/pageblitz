import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  generatedWebsites,
  postcardScans,
  postcards,
} from "../../drizzle/schema";
import { kurzcodeErzeugen, type Kanal } from "./kurzcode";
import type { KurzlinkKarte } from "./route";

/** Wie oft wir bei einer Code-Kollision neu wuerfeln, bevor wir aufgeben. */
const MAX_VERSUCHE = 8;

/**
 * Legt eine Karte an — oder gibt die bestehende zurueck. Ein Betrieb
 * bekommt genau einen Code, sonst zeigen zwei gedruckte Karten desselben
 * Salons auf verschiedene Zeilen und die Zaehlung zerfaellt.
 */
export async function postkarteSichern(eintrag: {
  businessId: number;
  websiteId?: number | null;
  city?: string | null;
  textVariant?: string | null;
}): Promise<{ id: number; code: string }> {
  const db = await getDb();
  if (!db) throw new Error("Keine Datenbank verfügbar");

  const vorhanden = await db
    .select({ id: postcards.id, code: postcards.code })
    .from(postcards)
    .where(eq(postcards.businessId, eintrag.businessId))
    .limit(1);
  if (vorhanden[0]) {
    // Der Code bleibt — er steht schon auf Papier. Stadt und Variante
    // duerfen sich aendern, wenn der Stapel neu laeuft.
    await db
      .update(postcards)
      .set({
        city: eintrag.city ?? null,
        textVariant: eintrag.textVariant ?? null,
        websiteId: eintrag.websiteId ?? null,
      })
      .where(eq(postcards.id, vorhanden[0].id));
    return vorhanden[0];
  }

  for (let versuch = 0; versuch < MAX_VERSUCHE; versuch++) {
    const code = kurzcodeErzeugen();
    try {
      await db.insert(postcards).values({
        code,
        businessId: eintrag.businessId,
        websiteId: eintrag.websiteId ?? null,
        city: eintrag.city ?? null,
        textVariant: eintrag.textVariant ?? null,
      });
      const neu = await db
        .select({ id: postcards.id, code: postcards.code })
        .from(postcards)
        .where(eq(postcards.code, code))
        .limit(1);
      if (neu[0]) return neu[0];
    } catch (err) {
      // Nur eine Code-Kollision wird neu gewuerfelt; alles andere fliegt.
      if (!String(err).includes("Duplicate")) throw err;
    }
  }
  throw new Error("Kein freier Kurzcode gefunden");
}

/**
 * Loest den Code zum AKTUELLEN Vorschau-Token auf. Genau hier liegt der
 * Wert des Umwegs: Wird die Vorschau neu erzeugt, aendert sich der Token,
 * die gedruckte Karte bleibt gueltig.
 */
export async function findeKarteNachCode(
  code: string
): Promise<KurzlinkKarte | null> {
  const db = await getDb();
  if (!db) return null;
  const zeilen = await db
    .select({
      id: postcards.id,
      code: postcards.code,
      token: generatedWebsites.previewToken,
    })
    .from(postcards)
    .leftJoin(
      generatedWebsites,
      eq(generatedWebsites.businessId, postcards.businessId)
    )
    .where(eq(postcards.code, code))
    .limit(1);
  const z = zeilen[0];
  if (!z || !z.token) return null;
  return { id: z.id, code: z.code, token: z.token };
}

export async function scanErfassen(
  postcardId: number,
  channel: Kanal
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(postcardScans).values({ postcardId, channel });
}

/**
 * Zuruecklegen statt loeschen: Der Betrieb faellt aus der Kampagne, die
 * Zeile bleibt. Nur so ist spaeter noch zu sehen, dass er dran war und
 * warum er keine Karte bekam.
 */
export async function karteZurueckstellen(
  postcardId: number,
  notiz: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(postcards)
    .set({ status: "zurueckgestellt", notiz })
    .where(eq(postcards.id, postcardId));
}

/** Zurueck in die Kampagne — etwa, wenn die Anschrift nachgetragen wurde. */
export async function karteWiederAufnehmen(postcardId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(postcards)
    .set({ status: "entwurf", notiz: null })
    .where(eq(postcards.id, postcardId));
}

/**
 * Motiv festhalten. `bildAt` ist der Zeitstempel, an dem spaeter haengt, ob
 * die Aufnahme noch zur Seite passt — deshalb immer mitschreiben.
 */
export async function motivGespeichert(
  postcardId: number,
  bildUrl: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(postcards)
    .set({ bildUrl, bildAt: new Date() })
    .where(eq(postcards.id, postcardId));
}

/** Letzte HeyMail-Vorschau (PDF) zur Karte merken. */
export async function vorschauGespeichert(
  postcardId: number,
  pdfUrl: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(postcards)
    .set({ pdfUrl, pdfAt: new Date() })
    .where(eq(postcards.id, postcardId));
}

/** Nach erfolgreichem Versand: Status und Zeitpunkt automatisch setzen. */
export async function postkarteVersendet(
  postcardId: number,
  heymailId: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(postcards)
    .set({ status: "versendet", sentAt: new Date(), heymailId })
    .where(eq(postcards.id, postcardId));
}

export interface KartenZeile {
  id: number;
  code: string;
  betrieb: string;
  city: string | null;
  textVariant: string | null;
  status: string;
  sentAt: Date | null;
  scans: number;
  ersterScan: Date | null;
}

/** Grundlage der Dashboard-Tabelle: eine Zeile je Karte, mit Scans. */
export async function kartenUebersicht(): Promise<KartenZeile[]> {
  const db = await getDb();
  if (!db) return [];
  const { businesses } = await import("../../drizzle/schema");
  const zeilen = await db
    .select({
      id: postcards.id,
      code: postcards.code,
      betrieb: businesses.name,
      city: postcards.city,
      textVariant: postcards.textVariant,
      status: postcards.status,
      sentAt: postcards.sentAt,
      scans: sql<number>`count(${postcardScans.id})`,
      ersterScan: sql<Date | null>`min(${postcardScans.at})`,
    })
    .from(postcards)
    .leftJoin(businesses, eq(businesses.id, postcards.businessId))
    .leftJoin(postcardScans, eq(postcardScans.postcardId, postcards.id))
    .groupBy(postcards.id)
    .orderBy(desc(postcards.createdAt));
  return zeilen.map(z => ({
    ...z,
    betrieb: z.betrieb ?? "—",
    scans: Number(z.scans ?? 0),
  }));
}

/**
 * Reine Logik für scripts/systeme-umstellen.ts (2026-10-12): bestehende
 * rev-2-Seiten auf ihr Hauptsystem umstellen — ohne LLM, ohne Fotowechsel.
 * Kein I/O; die Datenbank-Seite lebt im Skript.
 */
import { withPrimarySystem } from "../shared/designSystems/apply";
import { systemsForDoc } from "../shared/designSystems/assignment";
import { isReleased } from "../shared/designSystems/registry";
import type { DesignSystemId } from "../shared/designSystems/types";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../shared/siteContract/types";
import { blueprintFor } from "../shared/stylePacks/blueprints";

/** Standard-Ziele: 504, 558–607 ohne 593, 613. */
export const DEFAULT_IDS_SPEC = "504,558-592,594-607,613";

/** Nur diese Top-Level-Felder darf die Umstellung ändern. */
export const ALLOWED_KEYS: ReadonlySet<string> = new Set([
  "designRevision",
  "system",
  "palette",
  "fontPairId",
]);

/** Größte erlaubte Bereichsbreite — schützt vor Tippfehlern wie „1-999999". */
const MAX_RANGE = 1000;

/**
 * „504,558-607,613" → [504, 558, …, 607, 613]: aufsteigend, ohne Doppel.
 * Wirft bei allem, was keine positive Ganzzahl bzw. kein gültiger Bereich ist.
 */
export function parseIdList(spec: string): number[] {
  const ids = new Set<number>();
  for (const raw of spec.split(",")) {
    const part = raw.trim();
    if (!part) continue;
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      if (from < 1 || to < from || to - from > MAX_RANGE)
        throw new Error(`Ungültiger Bereich: „${part}"`);
      for (let id = from; id <= to; id++) ids.add(id);
      continue;
    }
    if (!/^\d+$/.test(part) || Number(part) < 1)
      throw new Error(`Ungültige ID: „${part}"`);
    ids.add(Number(part));
  }
  if (ids.size === 0) throw new Error("Keine IDs angegeben");
  return [...ids].sort((a, b) => a - b);
}

/** `--ids 1,2-5` oder `--ids=1,2-5`; ohne Angabe die Standardliste. */
export function idsFromArgv(argv: readonly string[]): number[] {
  const i = argv.findIndex(a => a === "--ids" || a.startsWith("--ids="));
  if (i === -1) return parseIdList(DEFAULT_IDS_SPEC);
  const value = argv[i].includes("=")
    ? argv[i].slice("--ids=".length)
    : argv[i + 1];
  if (!value || value.startsWith("--"))
    throw new Error("--ids braucht eine Liste, z. B. --ids 504,558-607,613");
  return parseIdList(value);
}

/** Top-Level-Schlüssel, deren Wert sich unterscheidet (JSON-Vergleich). */
export function changedKeys(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys]
    .filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]))
    .sort();
}

/** Geänderte Schlüssel außerhalb von ALLOWED_KEYS (leer = in Ordnung). */
export function forbiddenChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): string[] {
  return changedKeys(before, after).filter(k => !ALLOWED_KEYS.has(k));
}

/** Verschiedene Foto-Adressen im Dokument (`imageUrl`, `images[].url`, auch Unterseiten). */
export function countPhotos(doc: unknown): number {
  const urls = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (key === "imageUrl" && typeof value === "string" && value.trim())
        urls.add(value.trim());
      else if (key === "images" && Array.isArray(value)) {
        for (const img of value) {
          const url = (img as { url?: unknown })?.url;
          if (typeof url === "string" && url.trim()) urls.add(url.trim());
        }
      } else walk(value);
    }
  };
  walk(doc);
  return urls.size;
}

export type SwitchPlan =
  | {
      kind: "switch";
      name: string;
      family: string;
      system: DesignSystemId;
      palette: string;
      photos: number;
      next: WebsiteDataV2;
    }
  | {
      kind: "skip";
      name: string;
      reason: string;
      family?: string;
      photos?: number;
    };

/**
 * Entscheidung je Seite (rein): parsebar, noch nicht rev 3, Familie
 * bestimmt, Hauptsystem freigeschaltet, Ergebnis schemagültig, und nur
 * Revision/System/Palette/Schriftpaar ändern sich.
 */
export function planSwitch(raw: unknown): SwitchPlan {
  const parsed = WebsiteDataV2Schema.safeParse(raw);
  const rawName = (raw as { businessName?: unknown } | null)?.businessName;
  const name0 = typeof rawName === "string" ? rawName : "?";
  if (!parsed.success)
    return { kind: "skip", name: name0, reason: "Dokument nicht im v2-Format" };
  const doc = parsed.data;
  const name = doc.businessName;
  const photos = countPhotos(doc);
  if (doc.designRevision === 3)
    return { kind: "skip", name, reason: "schon rev 3", photos };

  const bp = blueprintFor(
    doc.businessCategory,
    doc.businessName,
    doc.blueprintFamily
  );
  const family = `${bp.id}${bp.gastroKind ? `/${bp.gastroKind}` : ""} (${doc.businessCategory ?? "ohne Branche"})`;
  if (!doc.blueprintFamily && bp.id === "standard")
    return {
      kind: "skip",
      name,
      family,
      photos,
      reason: "Familie nicht bestimmt",
    };

  const [primary] = systemsForDoc(doc);
  if (!isReleased(primary))
    return {
      kind: "skip",
      name,
      family,
      photos,
      reason: `Hauptsystem ${primary} nicht freigeschaltet`,
    };

  const next = withPrimarySystem(doc);
  if (next.designRevision !== 3 || !next.system || !next.palette)
    return {
      kind: "skip",
      name,
      family,
      photos,
      reason: "withPrimarySystem ergab kein rev 3",
    };
  const valid = WebsiteDataV2Schema.safeParse(next);
  if (!valid.success)
    return {
      kind: "skip",
      name,
      family,
      photos,
      reason: `Schema: ${valid.error.issues
        .map(i => `${i.path.join(".")}: ${i.message}`)
        .join("; ")
        .slice(0, 200)}`,
    };
  // withPrimarySystem darf nur Revision/System/Palette/Schriftpaar ändern.
  const forbidden = forbiddenChanges(
    doc as Record<string, unknown>,
    valid.data as Record<string, unknown>
  );
  if (forbidden.length > 0)
    return {
      kind: "skip",
      name,
      family,
      photos,
      reason: `unerlaubte Änderung: ${forbidden.join(", ")}`,
    };
  // Geschrieben wird das gespeicherte Dokument selbst (nicht die vom Schema
  // normalisierte Fassung) — nur mit den vier erlaubten Feldern geändert.
  const { fontPairId: _drop, ...rawRest } = raw as Record<string, unknown>;
  const written = {
    ...rawRest,
    designRevision: 3,
    system: next.system,
    palette: next.palette,
  };
  const writtenOk = WebsiteDataV2Schema.safeParse(written);
  const rawForbidden = forbiddenChanges(
    raw as Record<string, unknown>,
    written
  );
  if (!writtenOk.success || rawForbidden.length > 0)
    return {
      kind: "skip",
      name,
      family,
      photos,
      reason: !writtenOk.success
        ? "Schema: geschriebenes Dokument ungültig"
        : `unerlaubte Änderung: ${rawForbidden.join(", ")}`,
    };
  return {
    kind: "switch",
    name,
    family,
    system: next.system,
    palette: next.palette,
    photos,
    next: written as WebsiteDataV2,
  };
}

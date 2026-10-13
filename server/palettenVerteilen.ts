/**
 * Reine Logik für scripts/paletten-verteilen.ts (2026-10-13): bestehende
 * rev-3-Seiten, die alle dasselbe System und dieselbe Farbstimmung zeigen,
 * je Ort und System auf unterschiedliche Paletten verteilen. Nur `palette`
 * ändert sich — kein LLM, keine Texte, keine Fotos. Kein I/O.
 */
import { getSystem, isReleased } from "../shared/designSystems/registry";
import type { DesignSystemId } from "../shared/designSystems/types";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../shared/siteContract/types";
import {
  VERSION_TRIGGER,
  changedKeys,
  parseIdList,
  stableJson,
} from "./systemeUmstellen";

export const LABEL_VORHER = "Stand vor Farbstimmung";
export const LABEL_NACHHER = "Farbstimmung verteilt";
/** Gruppe für Seiten ohne erkennbaren Ort. */
export const NO_TOWN = "ohne Ort";

/** Nur dieses Top-Level-Feld darf sich ändern. */
export const ALLOWED_KEY = "palette";

export interface VersionMeta {
  trigger: string;
  label: string;
}

/**
 * Hat der Betreiber im Studio ein Design gewählt? Studio-Label
 * (server/onboardingV2/router.ts, selectDesignSystem):
 * `Design: <System> · <Palette>` mit Auslöser `panel`; auch „Design
 * angepasst" (updateTheme) beginnt mit „Design" und zählt vorsichtshalber
 * mit. Restore/Undo schreiben „Wiederhergestellt: Design: …" bzw.
 * „Rückgängig: Design: …" (Auslöser `restore`) — ebenfalls Wahl des Kunden.
 *
 * Nicht dazu zählen die Labels der eigenen Werkzeuge: „Designsystem
 * umgestellt" (systeme-umstellen.ts) und „Farbstimmung verteilt" /
 * „Stand vor Farbstimmung" (dieses Skript) — sonst fielen alle bereits
 * umgestellten Seiten bzw. ein zweiter Lauf heraus.
 */
export function ownerChoiceReason(
  versions: readonly VersionMeta[]
): string | null {
  for (const v of versions) {
    const label = v.label.trim();
    if (label === "Designsystem umgestellt" || label === "Stand vor Designsystem")
      continue;
    if (label === LABEL_NACHHER || label === LABEL_VORHER) continue;
    // „Design angepasst" (nur ausgeblendete Elemente) lässt die Palette frei.
    if (v.trigger === "panel" && /^Design(: |richtung)/.test(label))
      return `Design im Studio gewählt („${label}")`;
    if (/^(Wiederhergestellt|Rückgängig): Design(: |richtung)/.test(label))
      return `Design im Studio gewählt („${label}")`;
    // Jede andere Farbstimmungs-Änderung (nicht von uns) bleibt unangetastet.
    if (/Farbstimmung/i.test(label))
      return `Farbstimmung im Studio geändert („${label}")`;
  }
  return null;
}

/**
 * Ort einer Seite: `city` der ersten Kontakt-Sektion der Startseite
 * (WebsiteDataV2.sections[type=contact].city; zip/street stehen daneben).
 * Normalisiert: Kleinschreibung, Leerraum zusammengezogen, führende PLZ
 * entfernt. Fehlt er: NO_TOWN.
 */
export function townOf(doc: unknown): string {
  const sections = (doc as { sections?: unknown } | null)?.sections;
  if (!Array.isArray(sections)) return NO_TOWN;
  for (const s of sections) {
    const rec = s as { type?: unknown; city?: unknown } | null;
    if (rec?.type !== "contact" || typeof rec.city !== "string") continue;
    const town = rec.city
      .replace(/^\s*\d{5}\s+/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (town) return town;
  }
  return NO_TOWN;
}

export interface SiteInput {
  id: number;
  /** Gespeichertes `websiteData`. */
  doc: unknown;
  /** Verlaufs-Einträge (nur Auslöser + Label nötig). */
  versions: readonly VersionMeta[];
}

export type Candidate = {
  kind: "candidate";
  id: number;
  name: string;
  town: string;
  system: DesignSystemId;
  oldPalette: string;
  doc: unknown;
};
export type Skipped = {
  kind: "skip";
  id: number;
  name: string;
  town: string;
  reason: string;
  system?: string;
  oldPalette?: string;
};

/** Eine Seite einordnen: Kandidat oder Auslassung mit Grund. */
export function classify(site: SiteInput): Candidate | Skipped {
  const rawName = (site.doc as { businessName?: unknown } | null)?.businessName;
  const name = typeof rawName === "string" ? rawName : "?";
  const town = townOf(site.doc);
  const skip = (reason: string, extra: Partial<Skipped> = {}): Skipped => ({
    kind: "skip",
    id: site.id,
    name,
    town,
    reason,
    ...extra,
  });
  const parsed = WebsiteDataV2Schema.safeParse(site.doc);
  if (!parsed.success) return skip("Dokument nicht im v2-Format");
  const doc = parsed.data;
  const { system, palette } = doc;
  const info = { system: system ?? undefined, oldPalette: palette ?? undefined };
  if (doc.designRevision !== 3 || !system)
    return skip(`nur rev 3 (hier rev ${doc.designRevision ?? "ohne"})`, info);
  if (!isReleased(system)) return skip(`System ${system} nicht freigeschaltet`, info);
  const def = getSystem(system);
  if (!def || def.palettes.length < 2)
    return skip("System hat nur eine Palette", info);
  const choice = ownerChoiceReason(site.versions);
  if (choice) return skip(choice, info);
  return {
    kind: "candidate",
    id: site.id,
    name,
    town,
    system,
    oldPalette: palette ?? def.palettes[0].id,
    doc: site.doc,
  };
}

export type PlanRow =
  | (Candidate & { newPalette: string; next: WebsiteDataV2 })
  | Skipped;

/**
 * Verteilung: je (Ort, System) nach ID sortiert, jeweils die am wenigsten
 * genutzte Palette des Systems (Gleichstand: Reihenfolge `palettes`), also
 * reihum; Paletten ausgelassener Seiten der Gruppe gelten als belegt.
 * Deterministisch.
 * Orte ohne Angabe (NO_TOWN) bilden eine Gruppe — dort gibt es keinen
 * Nachbarschaftsbezug, die Verteilung schadet aber nicht.
 */
export function planDistribution(sites: readonly SiteInput[]): PlanRow[] {
  const classified = sites.map(classify);
  const groups = new Map<string, Candidate[]>();
  for (const c of classified) {
    if (c.kind !== "candidate") continue;
    const key = `${c.town}\u0000${c.system}`;
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  // Paletten ausgelassener Seiten je (Ort, System) sind belegt.
  const reserved = new Map<string, string[]>();
  for (const c of classified) {
    if (c.kind !== "skip" || !c.system || !c.oldPalette) continue;
    const key = `${c.town}\u0000${c.system}`;
    reserved.set(key, [...(reserved.get(key) ?? []), c.oldPalette]);
  }
  const assigned = new Map<number, string>();
  for (const [key, members] of groups) {
    const palettes = getSystem(members[0].system)!.palettes.map(p => p.id);
    const used = new Map(palettes.map(id => [id, 0]));
    for (const id of reserved.get(key) ?? [])
      if (used.has(id)) used.set(id, used.get(id)! + 1);
    // Je Seite die am wenigsten genutzte Palette (Gleichstand: Reihenfolge
    // des Systems) — ohne Reservierung ist das reihum.
    for (const m of [...members].sort((a, b) => a.id - b.id)) {
      const pick = palettes.reduce((best, id) =>
        used.get(id)! < used.get(best)! ? id : best
      );
      assigned.set(m.id, pick);
      used.set(pick, used.get(pick)! + 1);
    }
  }
  const rows: PlanRow[] = classified.map(c => {
    if (c.kind === "skip") return c;
    const newPalette = assigned.get(c.id)!;
    const next = { ...(c.doc as Record<string, unknown>), palette: newPalette };
    const forbidden = changedKeys(c.doc as Record<string, unknown>, next).filter(
      k => k !== ALLOWED_KEY
    );
    if (forbidden.length > 0 || !WebsiteDataV2Schema.safeParse(next).success)
      return {
        kind: "skip" as const,
        id: c.id,
        name: c.name,
        town: c.town,
        system: c.system,
        oldPalette: c.oldPalette,
        reason: "Ergebnis ungültig oder unerlaubte Änderung",
      };
    return { ...c, newPalette, next: next as unknown as WebsiteDataV2 };
  });
  return rows.sort((a, b) => a.id - b.id);
}

/** Zeile ohne Änderung (alte = neue Palette). */
export function isUnchanged(row: PlanRow): boolean {
  return row.kind === "candidate" && row.oldPalette === row.newPalette;
}

/** Verteilung je Ort/System nach dem Plan: „town · system: salbei 2, sand 1". */
export function summarizeByTown(rows: readonly PlanRow[]): string[] {
  const groups = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (r.kind !== "candidate") continue;
    const key = `${r.town} · ${r.system}`;
    const m = groups.get(key) ?? new Map<string, number>();
    m.set(r.newPalette, (m.get(r.newPalette) ?? 0) + 1);
    groups.set(key, m);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "de"))
    .map(([key, m]) => {
      const parts = [...m.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([p, n]) => `${p} ${n}`);
      const total = [...m.values()].reduce((a, b) => a + b, 0);
      return `${key} (${total}): ${parts.join(", ")}`;
    });
}

/* ── Kommandozeile ───────────────────────────────────────────────────── */

/** Nur `--schreiben` und `--ids <liste>` / `--ids=<liste>`; sonst Abbruch. */
export function parseArgs(argv: readonly string[]): {
  ids: number[] | null;
  schreiben: boolean;
} {
  let ids: number[] | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--schreiben") continue;
    if (a === "--ids" || a.startsWith("--ids=")) {
      const value = a === "--ids" ? argv[++i] : a.slice("--ids=".length);
      if (!value || value.startsWith("--"))
        throw new Error("--ids braucht eine Liste, z. B. --ids 600-620");
      ids = parseIdList(value);
      continue;
    }
    throw new Error(
      `Unbekanntes Argument: ${a} (erlaubt: --ids <liste>, --schreiben)`
    );
  }
  return { ids, schreiben: argv.includes("--schreiben") };
}

/* ── Schreiben ───────────────────────────────────────────────────────── */

export interface PaletteRepo {
  readDoc(): Promise<unknown>;
  latestVersionDoc(): Promise<unknown | null>;
  insertVersion(v: {
    trigger: string;
    label: string;
    doc: unknown;
  }): Promise<number>;
  /** Prüft (assertV2SafeWrite) und schreibt. */
  writeDoc(doc: WebsiteDataV2): Promise<void>;
}

export type PaletteResult =
  | { ok: true }
  | { ok: false; written: boolean; reason: string };

/**
 * Eine Seite schreiben: neu lesen (geändert → abbrechen) → alter Stand in
 * den Verlauf („Stand vor Farbstimmung"; entfällt, wenn der jüngste Stand
 * schon dieses Dokument ist) → schreiben → neuer Stand („Farbstimmung
 * verteilt"). So holt „Rückgängig" im Studio-Verlauf den alten Stand zurück.
 */
export async function applyPalette(
  plannedFrom: unknown,
  next: WebsiteDataV2,
  repo: PaletteRepo
): Promise<PaletteResult> {
  const current = await repo.readDoc();
  if (stableJson(current) !== stableJson(plannedFrom))
    return {
      ok: false,
      written: false,
      reason: "Dokument seit der Planung geändert — nicht geschrieben",
    };
  const latest = await repo.latestVersionDoc();
  if (latest === null || stableJson(latest) !== stableJson(current)) {
    const before = await repo.insertVersion({
      trigger: VERSION_TRIGGER,
      label: LABEL_VORHER,
      doc: current,
    });
    if (!before)
      return {
        ok: false,
        written: false,
        reason: "Verlaufs-Stand vorher nicht gespeichert — nicht geschrieben",
      };
  }
  await repo.writeDoc(next);
  const after = await repo.insertVersion({
    trigger: VERSION_TRIGGER,
    label: LABEL_NACHHER,
    doc: next,
  });
  if (!after)
    return {
      ok: false,
      written: true,
      reason: "geschrieben, aber Verlaufs-Stand nachher nicht gespeichert",
    };
  return { ok: true };
}

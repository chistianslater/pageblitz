import type { WebsiteDataV2 } from "../../shared/siteContract/types";

/**
 * Verlauf (2026-09-03): reine Entscheidungslogik für die Versionierung des
 * v2-Dokuments. Jeder `persistDoc`-Aufruf liefert einen Auslöser + Label;
 * hier wird entschieden, ob daraus ein neuer Stand wird, ob der letzte
 * ersetzt wird (Rauschen wie Inline-Blur alle paar Sekunden) oder ob gar
 * nichts passiert (Dokument unverändert). Kein I/O — die DB-Seite lebt in
 * `server/db.ts`, die Verdrahtung in `state.ts`.
 */

export const VERSION_TRIGGERS = [
  "generation",
  "chat",
  "panel",
  "inline",
  "restore",
] as const;
export type VersionTrigger = (typeof VERSION_TRIGGERS)[number];

/** Obergrenze pro Website — ältere Stände werden beim Einfügen gelöscht. */
export const MAX_VERSIONS = 50;
/** Gleicher Auslöser + gleiches Label innerhalb dieses Fensters → ersetzen statt anhängen. */
export const COALESCE_WINDOW_MS = 2 * 60_000;
export const VERSION_LABEL_MAX = 160;
export const BASELINE_LABEL = "Website erstellt";

export interface VersionWrite {
  trigger: VersionTrigger;
  label: string;
}

export interface VersionMeta {
  id: number;
  trigger: VersionTrigger;
  label: string;
  createdAt: Date;
}

export interface StoredVersion extends VersionMeta {
  doc: WebsiteDataV2;
}

export type VersionOp =
  | {
      kind: "insert";
      trigger: VersionTrigger;
      label: string;
      doc: WebsiteDataV2;
    }
  | {
      kind: "replace";
      id: number;
      trigger: VersionTrigger;
      label: string;
      doc: WebsiteDataV2;
    };

/** Auslöser, die nie mit ihrem Vorgänger zusammengefasst werden. */
const NEVER_COALESCE: ReadonlySet<VersionTrigger> = new Set([
  "generation",
  "restore",
]);

/** Deterministische Serialisierung (sortierte Schlüssel) für Gleichheits-Checks. */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record)
      .filter(key => record[key] !== undefined)
      .sort();
    return `{${keys
      .map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function docsEqual(a: WebsiteDataV2, b: WebsiteDataV2): boolean {
  return stableStringify(a) === stableStringify(b);
}

export function clampLabel(label: string): string {
  const trimmed = label.trim();
  return trimmed.length > VERSION_LABEL_MAX
    ? `${trimmed.slice(0, VERSION_LABEL_MAX - 1)}…`
    : trimmed;
}

export function planVersionWrite(args: {
  latest: StoredVersion | null;
  prevDoc: WebsiteDataV2;
  nextDoc: WebsiteDataV2;
  write: VersionWrite;
  now: Date;
}): VersionOp[] {
  const { latest, prevDoc, nextDoc, write, now } = args;
  const label = clampLabel(write.label);

  if (!latest) {
    const ops: VersionOp[] = [
      {
        kind: "insert",
        trigger: "generation",
        label: BASELINE_LABEL,
        doc: prevDoc,
      },
    ];
    if (!docsEqual(prevDoc, nextDoc)) {
      ops.push({ kind: "insert", trigger: write.trigger, label, doc: nextDoc });
    }
    return ops;
  }

  if (docsEqual(latest.doc, nextDoc)) return [];

  const withinWindow =
    now.getTime() - latest.createdAt.getTime() < COALESCE_WINDOW_MS;
  const sameKind = latest.trigger === write.trigger && latest.label === label;
  if (sameKind && withinWindow && !NEVER_COALESCE.has(write.trigger)) {
    return [
      {
        kind: "replace",
        id: latest.id,
        trigger: write.trigger,
        label,
        doc: nextDoc,
      },
    ];
  }
  return [{ kind: "insert", trigger: write.trigger, label, doc: nextDoc }];
}

export function versionsToPrune(count: number): number {
  return Math.max(0, count - MAX_VERSIONS);
}

/**
 * Wiederherstellen: alter Inhalt, aber die Add-on-Flags des aktuellen Stands
 * — ein später gebuchtes Extra darf durch Zurückspringen nicht verschwinden.
 */
export function restoreDoc(
  current: WebsiteDataV2,
  old: WebsiteDataV2
): WebsiteDataV2 {
  const { addOns: _oldAddOns, ...rest } = old;
  return current.addOns !== undefined
    ? { ...rest, addOns: current.addOns }
    : rest;
}

/** Liste absteigend nach Zeit: Eintrag 0 ist der aktuelle Stand, Eintrag 1 das Undo-Ziel. */
export function undoTarget<T extends VersionMeta>(
  newestFirst: readonly T[]
): T | null {
  return newestFirst.length >= 2 ? newestFirst[1] : null;
}

/** Label für Chat-Stände: der Wunsch des Kunden in Anführungszeichen, gekürzt. */
export function chatLabel(message: string | null | undefined): string {
  const text = (message ?? "").replace(/\s+/g, " ").trim();
  return text
    ? clampLabel(`KI-Chat: „${text}“`)
    : "KI-Chat: Vorschlag übernommen";
}

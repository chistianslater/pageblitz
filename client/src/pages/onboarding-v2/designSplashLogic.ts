/**
 * Reine Ableitungen für den Design-Splash (Alternative ← aktiv → Alternative),
 * ausgelagert aus DesignSplash.tsx, damit sie ohne tRPC-Harness testbar sind.
 */

export interface DesignDirection {
  id: string;
  name: string;
  essence: string;
}

/**
 * Intro-Overlay (2026-09-18, Betreiber-Wunsch): dunkle Bühne mit gestaffeltem
 * Text vor der Design-Auswahl. Einmal pro Browser-Sitzung und Vorschau —
 * ein Reload soll den Kunden nicht erneut ausbremsen.
 */
export function introStorageKey(token: string): string {
  return `pb-splash-intro-done:${token}`;
}

export function shouldShowIntro(stored: string | null): boolean {
  return stored === null;
}

/** Höchstens so viele Richtungen stehen gleichzeitig zur Wahl. */
export const MAX_DIRECTIONS = 3;

/**
 * Kandidaten des Servers plus die aktuell aktive Richtung: Ist sie nicht
 * unter den Kandidaten (z. B. nach „Weitere Richtungen laden"), wird sie
 * vorangestellt, damit die Mitte der Bühne immer zur Auswahl gehört.
 */
export function orderDirections<T extends DesignDirection>(
  candidates: T[],
  activeId: string,
  lookup: (id: string) => T | null
): T[] {
  if (candidates.some(candidate => candidate.id === activeId)) {
    return candidates;
  }
  const active = lookup(activeId);
  if (!active) return candidates;
  return [active, ...candidates].slice(0, MAX_DIRECTIONS);
}

/**
 * Nachbar im Kreis: -1 = links, +1 = rechts. Mit weniger als zwei
 * Richtungen gibt es keine Alternative.
 */
export function neighbourOf<T extends DesignDirection>(
  directions: T[],
  activeId: string,
  offset: -1 | 1
): T | null {
  if (directions.length < 2) return null;
  const activeIndex = Math.max(
    0,
    directions.findIndex(direction => direction.id === activeId)
  );
  const index = (activeIndex + offset + directions.length) % directions.length;
  return directions[index] ?? null;
}

/**
 * Pack- und System-IDs überschneiden sich (z. B. „raster", „plakat") —
 * Richtungen werden deshalb über `kind:id` unterschieden.
 */
export type DirectionKind = "pack" | "system";

export function directionKey(kind: DirectionKind, id: string): string {
  return `${kind}:${id}`;
}

export function parseDirectionKey(
  key: string
): { kind: DirectionKind; id: string } | null {
  const [kind, id] = key.split(":");
  if ((kind !== "pack" && kind !== "system") || !id) return null;
  return { kind, id };
}

import { JOURNAL } from "./journal";
import type { DesignSystemDef, DesignSystemId } from "./types";

export const DESIGN_SYSTEMS: Partial<Record<DesignSystemId, DesignSystemDef>> = {
  journal: JOURNAL,
};

/** Nur abgenommene Systeme gehen an neue Seiten und ins Studio (Spec §6). */
export const RELEASED_SYSTEMS: readonly DesignSystemId[] = [];

export function getSystem(id: DesignSystemId): DesignSystemDef | undefined {
  return DESIGN_SYSTEMS[id];
}

export function isReleased(id: DesignSystemId): boolean {
  return RELEASED_SYSTEMS.includes(id) && Boolean(DESIGN_SYSTEMS[id]);
}

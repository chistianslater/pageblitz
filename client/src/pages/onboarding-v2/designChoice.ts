import type { AlternativeLook } from "@shared/stylePacks/artDirection";
import type { PackId } from "@shared/siteContract/types";
import { getSystem } from "@shared/designSystems/registry";
import type { DesignSystemId } from "@shared/designSystems/types";
import type { PaletteOption } from "./PaletteChooser";

/**
 * Ein Kandidat aus getStyleCandidates (Task 16): Pack wie bisher oder
 * Designsystem mit seinen Farbstimmungen. `kind` fehlt bei Packs, die der
 * Client selbst ergänzt (KI-Vorschlag, aktive Richtung).
 */
export type StudioCandidate =
  | {
      kind?: "pack";
      id: PackId;
      name: string;
      essence: string;
      look?: AlternativeLook;
    }
  | {
      kind: "system";
      id: DesignSystemId;
      name: string;
      essence: string;
      palettes: PaletteOption[];
    };

export type SystemCandidate = Extract<StudioCandidate, { kind: "system" }>;

/** Was die Seite gerade trägt bzw. was im Studio gewählt ist. */
export type DesignChoice =
  | { kind: "pack"; id: PackId }
  | { kind: "system"; id: DesignSystemId; palette: string };

export function isSystemCandidate(c: StudioCandidate): c is SystemCandidate {
  return c.kind === "system";
}

/** Systemkarte aus der Registry (für die aktive Richtung, die der Server nicht mehr anbietet). */
export function systemCandidateFor(id: DesignSystemId): SystemCandidate | null {
  const def = getSystem(id);
  if (!def) return null;
  return {
    kind: "system",
    id: def.id,
    name: def.name,
    essence: def.essence,
    palettes: def.palettes.map(p => ({
      id: p.id,
      name: p.name,
      paper: p.paper,
      accent: p.accent,
    })),
  };
}

/** Startzustand aus dem Dokument: rev 3 → System + Palette, sonst Pack. */
export function initialChoice(args: {
  packId: PackId | null;
  system?: DesignSystemId | null;
  palette?: string | null;
}): DesignChoice | null {
  if (args.system) {
    const def = getSystem(args.system);
    const palette =
      def?.palettes.find(p => p.id === args.palette)?.id ??
      def?.palettes[0]?.id;
    if (def && palette) return { kind: "system", id: def.id, palette };
  }
  return args.packId ? { kind: "pack", id: args.packId } : null;
}

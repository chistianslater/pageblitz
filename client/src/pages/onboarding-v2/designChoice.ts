import { getSystem } from "@shared/designSystems/registry";
import type { DesignSystemId } from "@shared/designSystems/types";
import type { PaletteOption } from "./PaletteChooser";

/** Ein Kandidat aus getStyleCandidates: Designsystem mit seinen Farbstimmungen. */
export type SystemCandidate = {
  kind: "system";
  id: DesignSystemId;
  name: string;
  essence: string;
  palettes: PaletteOption[];
};

/** Was die Seite gerade trägt bzw. was im Studio gewählt ist. */
export type DesignChoice = { id: DesignSystemId; palette: string };

/** Systemkarte aus der Registry (aktive Richtung oder KI-Vorschlag, die der Server gerade nicht anbietet). */
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

/** Startzustand aus dem Dokument: System + gültige Farbstimmung (sonst die erste). */
export function initialChoice(args: {
  system?: DesignSystemId | null;
  palette?: string | null;
}): DesignChoice | null {
  if (!args.system) return null;
  const def = getSystem(args.system);
  const palette =
    def?.palettes.find(p => p.id === args.palette)?.id ?? def?.palettes[0]?.id;
  return def && palette ? { id: def.id, palette } : null;
}

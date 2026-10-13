/**
 * Standard-Farbstimmung der Beispielbetriebe je System (Entscheidung E3,
 * Packs entfernen 2026-10-13). Bis dahin ergab sie sich aus dem Pack-Akzent
 * (Pack-Farbthema → `pickPalette`); die Tabelle hält genau diese Wahl fest,
 * damit `/demo/system/…` ohne `?palette` unverändert aussieht. Fehlt ein
 * Eintrag, gilt die Regel für neue Seiten (`defaultPalette` in
 * `designSystems/apply.ts`: Palette nach `designSeed` von Name und Kategorie).
 */
import type { DesignSystemId } from "../designSystems/types";

export const SHOWCASE_PALETTES: Readonly<
  Record<string, Partial<Record<DesignSystemId, string>>>
> = {
  friseur: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "sand", nacht: "petrol" },
  barbier: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "petrol" },
  kosmetik: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "sand", nacht: "petrol" },
  schreinerei: { journal: "ton", raster: "werk", werkstoff: "kiefer", plakat: "senf", klar: "sand", nacht: "petrol" },
  elektro: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "nachtblau" },
  restaurant: { journal: "papier", raster: "kohle", werkstoff: "kiefer", plakat: "kante", klar: "sand", nacht: "nachtblau" },
  imbiss: { journal: "ton", raster: "werk", werkstoff: "kiefer", plakat: "kante", klar: "sand", nacht: "petrol" },
  baeckerei: { journal: "papier", raster: "werk", werkstoff: "ton", plakat: "senf", klar: "sand", nacht: "petrol" },
  cafe: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "petrol" },
  zahnarzt: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "petrol" },
  physio: { journal: "papier", raster: "papier", werkstoff: "kiefer", plakat: "kante", klar: "sand", nacht: "petrol" },
  naturheil: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "petrol" },
  steuerberater: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "lind", nacht: "petrol" },
  kanzlei: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "lind", nacht: "petrol" },
  makler: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "lind", nacht: "petrol" },
  it: { journal: "ton", raster: "werk", werkstoff: "kiefer", plakat: "senf", klar: "sand", nacht: "petrol" },
  laden: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "petrol" },
  goldschmiede: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "petrol" },
  werkstatt: { journal: "ton", raster: "werk", werkstoff: "ton", plakat: "senf", klar: "sand", nacht: "petrol" },
  musikschule: { journal: "ton", raster: "kohle", werkstoff: "kiefer", plakat: "kante", klar: "sand", nacht: "petrol" },
  training: { journal: "ton", raster: "kohle", werkstoff: "kiefer", plakat: "kante", klar: "sand", nacht: "pflaume" },
  ferienwohnung: { journal: "ton", raster: "werk", werkstoff: "kiefer", plakat: "senf", klar: "sand", nacht: "petrol" },
  fotografie: { journal: "ton", raster: "werk", werkstoff: "kiefer", plakat: "kante", klar: "sand", nacht: "petrol" },
  tattoo: { journal: "ton", raster: "werk", werkstoff: "kiefer", plakat: "kante", klar: "sand", nacht: "petrol" },
  taxi: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "nachtblau" },
  schluesseldienst: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "nachtblau" },
  hersteller: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "petrol" },
  weinberg: { journal: "papier", raster: "kohle", werkstoff: "kiefer", plakat: "kante", klar: "sand", nacht: "nachtblau" },
  noir: { journal: "papier", raster: "werk", werkstoff: "leinen", plakat: "senf", klar: "sand", nacht: "petrol" },
  pension: { journal: "salbei", raster: "papier", werkstoff: "leinen", plakat: "puls", klar: "wasser", nacht: "petrol" },
  gaertnerei: { journal: "papier", raster: "werk", werkstoff: "leinen", plakat: "puls", klar: "lind", nacht: "petrol" },
};

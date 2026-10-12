import type { DesignSystemId } from "../../../../../shared/designSystems/types";
import type { PackModule } from "../packRegistry";
import { JOURNAL_MODULE } from "./journal";
import { RASTER_MODULE } from "./raster";
import { WERKSTOFF_MODULE } from "./werkstoff";
import { PLAKAT_MODULE } from "./plakat";
import { KLAR_MODULE } from "./klar";
import { NACHT_MODULE } from "./nacht";

/** Render-Module der Designsysteme (rev 3) — Gegenstück zu PACK_MODULES. */
export const SYSTEM_MODULES: Partial<Record<DesignSystemId, PackModule>> = {
  journal: JOURNAL_MODULE,
  raster: RASTER_MODULE,
  werkstoff: WERKSTOFF_MODULE,
  plakat: PLAKAT_MODULE,
  klar: KLAR_MODULE,
  // Nacht: in Arbeit, nicht freigeschaltet (Routen nur Vorschau/Demo).
  nacht: NACHT_MODULE,
};

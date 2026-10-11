import type { DesignSystemId } from "../../../../../shared/designSystems/types";
import type { PackModule } from "../packRegistry";
import { JOURNAL_MODULE } from "./journal";
import { RASTER_MODULE } from "./raster";

/** Render-Module der Designsysteme (rev 3) — Gegenstück zu PACK_MODULES. */
export const SYSTEM_MODULES: Partial<Record<DesignSystemId, PackModule>> = {
  journal: JOURNAL_MODULE,
  raster: RASTER_MODULE,
};

import { createContext, useContext } from "react";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../shared/stylePacks/blueprints";

/** Was jedes Designsystem-Modul (rev 3) beim Rendern braucht. */
export type SystemState = {
  data: WebsiteDataV2;
  blueprint: Blueprint;
  preview: boolean;
  now: Date;
  /**
   * True, wenn `SiteIslands` das Kontaktformular wirklich rendert (Add-on
   * aktiv UND echter Slug) — gleiche Bedingung wie dort. Ohne das bliebe im
   * Kontakt-Abschnitt ein Formular-Titel ohne Formular stehen.
   */
  contactIsland?: boolean;
};

export const SystemContext = createContext<SystemState | undefined>(undefined);

export function useSystem(): SystemState {
  const state = useContext(SystemContext);
  if (!state) throw new Error("useSystem außerhalb von SystemContext");
  return state;
}

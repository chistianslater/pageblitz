import { createContext, useContext } from "react";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../shared/stylePacks/blueprints";

/** Was jedes Designsystem-Modul (rev 3) beim Rendern braucht. */
export type SystemState = {
  data: WebsiteDataV2;
  blueprint: Blueprint;
  preview: boolean;
  now: Date;
};

export const SystemContext = createContext<SystemState | undefined>(undefined);

export function useSystem(): SystemState {
  const state = useContext(SystemContext);
  if (!state) throw new Error("useSystem außerhalb von SystemContext");
  return state;
}

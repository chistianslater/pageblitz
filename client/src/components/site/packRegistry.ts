import type React from "react";
import type {
  PackId,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";

export interface PackModule {
  id: PackId;
  css: string;
  Page: React.FC<{ data: WebsiteDataV2; basePath: string }>;
}

export const PACK_MODULES: Partial<Record<PackId, PackModule>> = {};

import { TRPCError } from "@trpc/server";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import {
  PACK_IDS,
  type PackId,
  type WebsiteDataV2,
} from "../../shared/siteContract/types";

export function parsePackId(value: string): PackId {
  if ((PACK_IDS as readonly string[]).includes(value)) return value as PackId;
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: `Unbekanntes Style-Pack: "${value}"`,
  });
}

/** Pure: neues, schema-validiertes Dokument mit anderem Pack; Inhalte bleiben 1:1. */
export function applyStylePack(
  doc: WebsiteDataV2,
  packId: PackId
): WebsiteDataV2 {
  return WebsiteDataV2Schema.parse({ ...doc, stylePackId: packId });
}

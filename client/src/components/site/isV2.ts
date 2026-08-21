import { WebsiteDataV2Schema } from "../../../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";

export function parseV2(data: unknown): WebsiteDataV2 | null {
  if (typeof data !== "object" || data === null) return null;
  if ((data as { version?: unknown }).version !== 2) return null;
  const parsed = WebsiteDataV2Schema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

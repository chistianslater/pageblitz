import { TRPCError } from "@trpc/server";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { getSubscriptionByWebsiteId, getWebsiteByToken } from "../db";

export interface StudioWebsite {
  website: NonNullable<Awaited<ReturnType<typeof getWebsiteByToken>>>;
  doc: WebsiteDataV2 | null;
}

/**
 * Zugriffsregel Studio (Spec §6): Der previewToken (nanoid 32) ist im
 * Preview-Zustand das Zugangsgeheimnis. Sobald die Website verkauft/aktiv
 * ist, muss zusätzlich der eingeloggte Nutzer der Abo-Inhaber sein — sonst
 * könnte ein alter Preview-Link eine bezahlte Website verändern.
 */
export async function loadStudioWebsite(
  token: string,
  user: { id: number } | null
): Promise<StudioWebsite> {
  const website = await getWebsiteByToken(token);
  if (!website) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Diese Vorschau existiert nicht (mehr)." });
  }
  if (website.status !== "preview") {
    const subscription = await getSubscriptionByWebsiteId(website.id);
    if (!user || !subscription || subscription.userId !== user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Diese Website gehört einem anderen Konto." });
    }
  }
  const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
  return { website, doc: parsed.success ? parsed.data : null };
}

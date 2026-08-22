import { TRPCError } from "@trpc/server";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { getSubscriptionByWebsiteId, getWebsiteByToken } from "../db";
import { linkOrphanSubscriptionsToUser } from "../linkSubscriptions";

export interface StudioWebsite {
  website: NonNullable<Awaited<ReturnType<typeof getWebsiteByToken>>>;
  doc: WebsiteDataV2 | null;
  /**
   * true = websiteData ist vorhanden, aber kein v2-valides Dokument (altes
   * Format). Unterscheidet „kein Dokument" (frische Preview vor Generierung)
   * von „v1-Dokument" — sonst würde ensureGeneration ein v1-Dokument mit
   * einem neuen v2-Job überschreiben (Finding #3).
   */
  hasLegacyDoc: boolean;
}

/**
 * Zugriffsregel Studio (Spec §6): Der previewToken (nanoid 32) ist im
 * Preview-Zustand das Zugangsgeheimnis. Sobald die Website verkauft/aktiv
 * ist, muss zusätzlich der eingeloggte Nutzer der Abo-Inhaber sein — sonst
 * könnte ein alter Preview-Link eine bezahlte Website verändern.
 */
export async function loadStudioWebsite(
  token: string,
  user: { id: number; email: string | null } | null
): Promise<StudioWebsite> {
  const website = await getWebsiteByToken(token);
  if (!website) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Diese Vorschau existiert nicht (mehr).",
    });
  }
  if (website.status !== "preview") {
    const subscription = await getSubscriptionByWebsiteId(website.id);
    const isOwner = !!user && !!subscription && subscription.userId === user.id;

    // Heilfall: Anonymer Käufer (Webhook konnte keinen Nutzer zuordnen,
    // userId = 0) hat sich inzwischen mit derselben E-Mail wie beim
    // Checkout registriert/eingeloggt. Zugriff erlauben und das Abo binden.
    //
    // Finding I1 (Account-Takeover): vergleicht gegen die unveränderliche
    // `subscription.checkoutEmail` (vom Webhook einmalig beim Checkout
    // gesetzt), NICHT gegen `website.customerEmail` — dieses Feld ist frei
    // schreibbar (selfService.saveCustomerEmail/onboardingV2.setCustomerEmail)
    // und ließe sich sonst nach dem Kauf auf eine beliebige E-Mail ändern,
    // um ein fremdes verwaistes Abo zu claimen.
    const isOrphanClaim =
      !isOwner &&
      !!user &&
      !!user.email &&
      !!subscription &&
      subscription.userId === 0 &&
      !!subscription.checkoutEmail &&
      subscription.checkoutEmail.trim().toLowerCase() ===
        user.email.trim().toLowerCase();

    if (!isOwner && !isOrphanClaim) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Diese Website gehört einem anderen Konto.",
      });
    }

    if (isOrphanClaim && user) {
      // Fire-and-forget: heilt das Abo im Hintergrund, blockiert den
      // Studio-Zugriff nicht und darf ihn bei einem Fehler nicht verhindern.
      linkOrphanSubscriptionsToUser(user.id, user.email as string).catch(
        err => {
          console.error("[Ownership] Fehler beim Binden verwaister Abos:", err);
        }
      );
    }
  }
  const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
  const hasLegacyDoc = !parsed.success && website.websiteData != null;
  return { website, doc: parsed.success ? parsed.data : null, hasLegacyDoc };
}

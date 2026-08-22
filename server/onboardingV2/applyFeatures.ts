import { getWebsiteById, updateWebsite } from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { assertV2SafeWrite } from "../v2WriteGuard";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { applyFeatures } from "./applyPatch";
import type { SiteFeatures } from "../../shared/siteContract/types";

/**
 * Eine Quelle der Wahrheit für Add-on-Aktivierung (Final-Review Befund 4,
 * Abschluss-Fixwelle B, Task 2).
 *
 * Vorher gab es zwei getrennte Schreibpfade, die auseinanderliefen:
 * - `customer.updateAddons` (Dashboard) schrieb nur `onboarding_responses.
 *   addOnContactForm` bzw. die Spalte `generatedWebsites.addOnAiChat` — NICHT
 *   `websiteData.features.*`. Die v2-Inseln (SiteIslands.tsx) rendern/gaten
 *   aber ausschließlich nach `features.*` → Dashboard-Toggle "aus" hatte
 *   keine Wirkung, Formular/Widget blieben live.
 * - `onboardingV2.updateAddons` (Studio, routerCommerce.ts) schrieb
 *   `features.*` ins v2-Dokument, aber NICHT die Spalte `addOnAiChat` →
 *   `/api/chat/:slug/message` gatet auf die Spalte (chatRoutes.ts) und
 *   antwortete 404, obwohl das Widget laut `features.aiChat` sichtbar war.
 *
 * Dieser Helper schreibt für v2-Dokumente `websiteData.features.*` (über den
 * zentralen Write-Guard `assertV2SafeWrite`, siehe v2WriteGuard.ts) UND die
 * Spalten `addOnAiChat`/`addOnBooking` auf `generatedWebsites` in einem
 * einzigen `updateWebsite`-Aufruf, plus SSR-Cache-Invalidierung — dieselbe
 * Kette wie `handleCheckoutCompleted` (stripeWebhookHandlers.ts) für den
 * Checkout-Webhook bereits nutzt (dort unverändert, da schon konsistent).
 *
 * `contactForm` hat bewusst keine Spalte auf `generatedWebsites` —
 * `isContactFormEnabled()` (contactSubmit.ts) liest für v2-Dokumente
 * ausschließlich `features.contactForm`, eine Spalte wäre eine zweite
 * (überflüssige) Quelle der Wahrheit.
 *
 * v1-Dokumente (kein `features`-Feld im Schema) bekommen nur die Spalten
 * geschrieben — `websiteData` bleibt unangetastet.
 */
export async function applyFeatureFlags(
  websiteId: number,
  patch: SiteFeatures
): Promise<void> {
  const website = await getWebsiteById(websiteId);
  if (!website) return;

  const columnPatch: { addOnAiChat?: boolean; addOnBooking?: boolean } = {};
  if (patch.aiChat !== undefined) columnPatch.addOnAiChat = patch.aiChat;
  if (patch.booking !== undefined) columnPatch.addOnBooking = patch.booking;

  const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
  if (parsed.success) {
    const next = applyFeatures(parsed.data, patch);
    assertV2SafeWrite(website.websiteData, next);
    await updateWebsite(websiteId, {
      ...columnPatch,
      websiteData: next as any,
    });
    invalidateSsrCache(website.slug);
    return;
  }

  // v1-Dokument: kein `features`-Feld möglich — nur die Spalten schreiben
  // (falls überhaupt etwas zu schreiben ist).
  if (Object.keys(columnPatch).length > 0) {
    await updateWebsite(websiteId, columnPatch);
  }
}

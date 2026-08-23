import { getWebsiteById, updateWebsite } from "../db";
import { invalidateSsrCache } from "../ssr/routes";
import { assertV2SafeWrite } from "../v2WriteGuard";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { applyAddOnFlags } from "./applyPatch";
import type { AddOnFlags } from "../../shared/pricing";

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
 * Seit Plan B6 Task 6 nimmt der Helper alle acht Add-on-Flags
 * (shared/pricing.ts `AddOnFlags`): contactForm/aiChat/booking/subpages
 * landen in `features`, gallery/menu/pricelist/team/subpages in `addOns`
 * (Gating-Quelle für Sektionen/Unterseiten, siehe `applyAddOnFlags` in
 * applyPatch.ts) — plus die Spalten addOnAiChat/addOnBooking/addOnTeam/
 * addOnSubpages, alles in EINEM `updateWebsite`. Nur übergebene Keys werden
 * angefasst. Nicht gebuchte Sektionen/Pages bleiben im Dokument stehen
 * (ausblenden statt löschen, Spec B6 §5.4).
 *
 * v1-Dokumente (kein `features`/`addOns`-Feld im Schema) bekommen nur die
 * Spalten geschrieben — `websiteData` bleibt unangetastet.
 */
export async function applyFeatureFlags(
  websiteId: number,
  patch: AddOnFlags
): Promise<void> {
  const website = await getWebsiteById(websiteId);
  if (!website) return;

  const columnPatch: {
    addOnAiChat?: boolean;
    addOnBooking?: boolean;
    addOnTeam?: boolean;
    addOnSubpages?: boolean;
  } = {};
  if (patch.aiChat !== undefined) columnPatch.addOnAiChat = patch.aiChat;
  if (patch.booking !== undefined) columnPatch.addOnBooking = patch.booking;
  // addOnTeam (Plan B5/B6): Spalte auf generatedWebsites, die der
  // Checkout-Webhook ebenfalls schreibt — hier mitziehen, damit
  // Studio-Toggle und Webhook denselben Stand hinterlassen.
  if (patch.team !== undefined) columnPatch.addOnTeam = patch.team;
  // subpages wie aiChat/booking: Spalte generatedWebsites.addOnSubpages
  // (Migration 0029) spiegelt features.subpages — dieselbe Kette wie oben
  // beschrieben (contactForm hat bewusst keine Spalte, subpages schon,
  // weil server/ssr/routes.ts (Task 3) die Spalte für den schnellen
  // Live-Check ohne Dokument-Parse braucht, analog addOnTeam/addOnAiChat).
  if (patch.subpages !== undefined) columnPatch.addOnSubpages = patch.subpages;

  const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
  if (parsed.success) {
    const next = applyAddOnFlags(parsed.data, patch);
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

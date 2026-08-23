/**
 * Umami-Provisionierung bei Aktivierung einer Kundenseite (Plan B6 Task 7).
 *
 * Wird an jeder Stelle aufgerufen, an der eine Website `status: "active"`
 * bekommt (customer.setLive im Setup-Flow, Admin-Prozeduren in
 * server/routers.ts, Stripe-Webhook `customer.subscription.updated` über
 * server/stripeWebhookHandlers.ts `handleWebsiteActivation`). Legt die Site
 * in Umami an und schreibt `generatedWebsites.umamiWebsiteId` — danach
 * rendert das SSR (server/ssr/renderSite.tsx) bzw. die SPA (SitePage.tsx)
 * das cookielose Tracking-Script und `customer.getAnalytics` liefert Werte.
 *
 * Garantien:
 * - idempotent: vorhandene ID → keine zweite Registrierung, kein Write;
 * - fehlertolerant: nie ein Throw — Umami nicht konfiguriert/nicht
 *   erreichbar/DB-Fehler → Log + `null`, die Aktivierung läuft weiter.
 */
import type * as Db from "./db";
import { getWebsiteById, updateWebsite } from "./db";
import { registerUmamiWebsite } from "./umami";
import { invalidateSsrCache } from "./ssr/routes";

/** Basis-Domain der Kundenseiten (`<slug>.pageblitz.de`, siehe state.ts). */
export const CUSTOMER_SITE_DOMAIN = "pageblitz.de";

export interface UmamiProvisionDeps {
  getWebsiteById: typeof Db.getWebsiteById;
  updateWebsite: typeof Db.updateWebsite;
  registerUmamiWebsite: (
    name: string,
    domain: string
  ) => Promise<string | null>;
  invalidateSsrCache: (slug: string) => void;
}

/** Anzeigename in Umami: businessName des v2-Dokuments, sonst der Slug. */
export function umamiSiteName(website: {
  slug: string;
  websiteData: unknown;
}): string {
  const data = website.websiteData as { businessName?: unknown } | null;
  const name =
    data && typeof data.businessName === "string"
      ? data.businessName.trim()
      : "";
  return name || website.slug;
}

/**
 * Stellt sicher, dass die Website eine Umami-ID hat. Liefert die (neue oder
 * vorhandene) ID oder null, wenn keine angelegt werden konnte.
 */
export async function ensureUmamiWebsite(
  websiteId: number,
  deps: UmamiProvisionDeps
): Promise<string | null> {
  try {
    const website = await deps.getWebsiteById(websiteId);
    if (!website) return null;
    if (website.umamiWebsiteId) return website.umamiWebsiteId;

    const domain = `${website.slug}.${CUSTOMER_SITE_DOMAIN}`;
    const umamiId = await deps.registerUmamiWebsite(
      umamiSiteName(website),
      domain
    );
    if (!umamiId) return null;

    await deps.updateWebsite(websiteId, { umamiWebsiteId: umamiId });
    // SSR-Cache leeren, damit die nächste Auslieferung das Script enthält.
    deps.invalidateSsrCache(website.slug);
    console.log(
      `[Umami] Website ${websiteId} (${domain}) registriert: ${umamiId}`
    );
    return umamiId;
  } catch (err) {
    console.warn(
      `[Umami] Provisionierung für Website ${websiteId} fehlgeschlagen (Aktivierung läuft weiter):`,
      err
    );
    return null;
  }
}

/**
 * Produktive Variante mit echten Abhängigkeiten (DB, Umami-Client, SSR-
 * Cache). Router-/Webhook-Tests mocken dieses Modul bzw. übergeben eigene
 * Deps an `ensureUmamiWebsite`/`handleWebsiteActivation`.
 */
export function provisionUmamiForWebsite(
  websiteId: number
): Promise<string | null> {
  return ensureUmamiWebsite(websiteId, {
    getWebsiteById,
    updateWebsite,
    registerUmamiWebsite: (name, domain) => registerUmamiWebsite(name, domain),
    invalidateSsrCache,
  });
}

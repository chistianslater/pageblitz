import React from "react";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import { islandsCss } from "./islandsCss";
import { ContactFormIsland } from "./ContactFormIsland";
import { ChatIsland } from "./ChatIsland";
import { BookingIsland } from "./BookingIsland";

/** True, wenn mindestens ein bezahltes Add-on im Dokument aktiv ist. */
export function hasActiveFeatures(data: WebsiteDataV2): boolean {
  const features = data.features;
  if (!features) return false;
  return Boolean(features.contactForm || features.aiChat || features.booking);
}

/**
 * Rendert die aktiven Inseln (Kontaktformular, KI-Chat, Terminbuchung) als
 * statisches SSR-Markup nach der Pack-Seite. Rendert `null`, wenn kein
 * Add-on aktiv ist ODER kein `slug` vorliegt — Inseln brauchen den Slug für
 * ihre APIs (`/api/site/:slug/contact` usw.), ein leerer Slug würde kaputte
 * Endpunkte erzeugen (siehe CSR-Vorschauen ohne echte Website).
 *
 * `site` trägt DB-Felder, die NICHT Teil des v2-Dokuments (`WebsiteDataV2`)
 * sind — aktuell `chatWelcomeMessage` (Spalte auf `generatedWebsites`,
 * gepflegt im Add-ons-Panel, siehe `server/routers.ts`). `renderSiteHtml`
 * reicht es über `SiteRenderer` bis hierher durch; ohne echte Website (z. B.
 * CSR-Dashboard-Vorschau über `WebsiteRenderer`) bleibt es `undefined` und
 * `ChatIsland` zeigt seinen Default-Begrüßungstext.
 *
 * Das Inseln-CSS wird als erstes Kind von `.pb-islands` inline mitgerendert
 * (analog zu `mod.css` in `SiteRenderer`) — genau wie die Pack-Seite bringt
 * `SiteIslands` sein Styling selbst mit, egal ob es über `renderSiteHtml`
 * (Kundenseiten-SSR) oder client-seitig über `WebsiteRenderer`
 * (Dashboard-/Editor-Vorschau) gerendert wird. `renderSite.tsx` bettet daher
 * kein eigenes Inseln-CSS mehr in den `<head>` ein — eine Quelle statt zwei.
 *
 * `data-target="#kontakt"` sagt der Hydration (`site-islands/main.tsx`), das
 * Kontaktformular vor dem Hydrieren in die Kontakt-Sektion zu verschieben —
 * die Insel selbst wird unabhängig von der Pack-Seite gerendert, weil Packs
 * das `features`-Feld nicht kennen. Die Hydration übernimmt nur die
 * einzelnen Inseln-Wurzeln (nicht `.pb-islands` selbst), das `<style>`-Kind
 * bleibt für React daher unangetastetes, statisches DOM — kein
 * Hydration-Mismatch-Risiko.
 */
export const SiteIslands: React.FC<{
  data: WebsiteDataV2;
  slug: string;
  basePath?: string;
  /** DB-Felder außerhalb des v2-Dokuments, aktuell nur der Chat-Begrüßungstext. */
  site?: { chatWelcomeMessage?: string | null };
}> = ({ data, slug, basePath = "", site }) => {
  if (!slug) return null;
  if (!hasActiveFeatures(data)) return null;
  const features = data.features ?? {};
  const chatWelcomeMessage = site?.chatWelcomeMessage ?? undefined;
  return (
    <div className="pb-islands">
      <style dangerouslySetInnerHTML={{ __html: islandsCss }} />
      {features.contactForm && (
        <div
          className="pb-island"
          data-island="contact"
          data-slug={slug}
          data-target="#kontakt"
          data-base-path={basePath}
        >
          <ContactFormIsland slug={slug} basePath={basePath} />
        </div>
      )}
      {features.aiChat && (
        <div
          className="pb-island pb-island--fab"
          data-island="chat"
          data-slug={slug}
          data-business-name={data.businessName}
          data-welcome={chatWelcomeMessage}
        >
          <ChatIsland
            slug={slug}
            businessName={data.businessName}
            welcomeMessage={chatWelcomeMessage}
          />
        </div>
      )}
      {features.booking && (
        <div
          className="pb-island pb-island--fab"
          data-island="booking"
          data-slug={slug}
          data-business-name={data.businessName}
        >
          <BookingIsland slug={slug} businessName={data.businessName} />
        </div>
      )}
    </div>
  );
};

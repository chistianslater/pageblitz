import React from "react";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
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
 * Add-on aktiv ist — dann bekommt die Seite auch kein Inseln-CSS/-Bundle
 * (siehe `renderSite.tsx`).
 *
 * `data-target="#kontakt"` sagt der Hydration (`site-islands/main.tsx`), das
 * Kontaktformular vor dem Hydrieren in die Kontakt-Sektion zu verschieben —
 * die Insel selbst wird unabhängig von der Pack-Seite gerendert, weil Packs
 * das `features`-Feld nicht kennen.
 */
export const SiteIslands: React.FC<{
  data: WebsiteDataV2;
  slug: string;
  basePath?: string;
}> = ({ data, slug, basePath = "" }) => {
  if (!hasActiveFeatures(data)) return null;
  const features = data.features ?? {};
  return (
    <div className="pb-islands">
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
        >
          <ChatIsland slug={slug} />
        </div>
      )}
      {features.booking && (
        <div
          className="pb-island pb-island--fab"
          data-island="booking"
          data-slug={slug}
        >
          <BookingIsland slug={slug} />
        </div>
      )}
    </div>
  );
};

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
 *
 * `mode` ("live" | "preview", Default "live"): `SiteRenderer` wird sowohl
 * für echte Kundenseiten-SSR (`renderSiteHtml`, immer "live") als auch für
 * CSR-Vorschauen INNERHALB von Pageblitz benutzt (`WebsiteRenderer` →
 * Dashboard/Editor-Vorschauen wie `CustomerDashboard`/
 * `ContentEditorSplitView`). In diesen internen Vorschauen ist derselbe
 * portalierte Chat-/Buchungs-Dialog wie auf der echten Seite voll
 * interaktiv und würde bei einem Klick echte `fetch`-Aufrufe gegen
 * `/api/chat/:slug/message` bzw. `/api/booking/:slug/*` auslösen — aus
 * einem internen Admin-Bildschirm heraus nicht gewollt. Im Preview-Modus
 * bleiben alle Formularfelder sichtbar, aber `disabled` wird an jede Insel
 * durchgereicht (siehe die einzelnen Insel-Komponenten); die Wurzel trägt
 * zusätzlich `data-mode` zur Diagnose/für Tests.
 */
export const SiteIslands: React.FC<{
  data: WebsiteDataV2;
  slug: string;
  basePath?: string;
  /** DB-Felder außerhalb des v2-Dokuments, aktuell nur der Chat-Begrüßungstext. */
  site?: { chatWelcomeMessage?: string | null };
  mode?: "live" | "preview";
}> = ({ data, slug, basePath = "", site, mode = "live" }) => {
  if (!slug) return null;
  if (!hasActiveFeatures(data)) return null;
  const features = data.features ?? {};
  const chatWelcomeMessage = site?.chatWelcomeMessage ?? undefined;
  const isPreview = mode === "preview";
  return (
    <div className="pb-islands" data-mode={mode}>
      <style dangerouslySetInnerHTML={{ __html: islandsCss }} />
      {features.contactForm && (
        <div
          className="pb-island"
          data-island="contact"
          data-slug={slug}
          data-target="#kontakt"
          data-base-path={basePath}
        >
          <ContactFormIsland
            slug={slug}
            basePath={basePath}
            disabled={isPreview}
          />
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
            disabled={isPreview}
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
          <BookingIsland
            slug={slug}
            businessName={data.businessName}
            disabled={isPreview}
          />
        </div>
      )}
    </div>
  );
};

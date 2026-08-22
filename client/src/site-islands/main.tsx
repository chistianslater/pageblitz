import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { ContactFormIsland } from "../components/site/islands/ContactFormIsland";
import { ChatIsland } from "../components/site/islands/ChatIsland";
import { BookingIsland } from "../components/site/islands/BookingIsland";

/**
 * Hydration-Entry für die SSR-Inseln. Wird nur geladen, wenn
 * `hasActiveFeatures(data)` im SSR-Head den Bundle-Tag eingebettet hat
 * (siehe `server/ssr/renderSite.tsx`).
 *
 * Kontaktformular: SSR-Markup und Client-Komponente sind identisch
 * (`ContactFormIsland`) → `hydrateRoot` reaktiviert das bestehende DOM statt
 * es zu ersetzen. Vor dem Hydrieren wird die Insel in die Kontakt-Sektion
 * (`data-target`, i. d. R. "#kontakt") verschoben — Packs kennen das
 * `features`-Feld nicht und rendern die Sektion daher ohne das Formular.
 *
 * KI-Chat: volle Interaktion (Task 8). Terminbuchung: weiterhin
 * Platzhalter-Widget (folgt in Task 9). Beide nutzen `createRoot` statt
 * `hydrateRoot`, weil sie eigenständig vom SSR-Markup übernehmen
 * ("Client-only Widget") — kein Hydration-Mismatch-Risiko, auch wenn sich
 * ihr Markup künftig ändert, ohne dass das SSR-Markup Schritt halten muss.
 *
 * `data-business-name`/`data-welcome` auf der Chat-Wurzel (siehe
 * `SiteIslands.tsx`) tragen den Anzeigenamen und die DB-Begrüßung
 * (`website.chatWelcomeMessage`, kein Teil des v2-Dokuments) — hier gelesen,
 * um dieselben Werte wie beim SSR-Render als React-Props zu rekonstruieren.
 */

function readSlug(el: Element): string {
  return el.getAttribute("data-slug") ?? "";
}

function hydrateContactIslands(): void {
  document.querySelectorAll('[data-island="contact"]').forEach(el => {
    const target = el.getAttribute("data-target");
    const targetEl = target ? document.querySelector(target) : null;
    if (targetEl) {
      targetEl.appendChild(el);
    }
    const slug = readSlug(el);
    const basePath = el.getAttribute("data-base-path") ?? "";
    hydrateRoot(el, <ContactFormIsland slug={slug} basePath={basePath} />);
  });
}

function mountClientOnlyIslands(): void {
  document.querySelectorAll('[data-island="chat"]').forEach(el => {
    const businessName = el.getAttribute("data-business-name") ?? undefined;
    const welcomeMessage = el.getAttribute("data-welcome") ?? undefined;
    createRoot(el).render(
      <ChatIsland
        slug={readSlug(el)}
        businessName={businessName}
        welcomeMessage={welcomeMessage}
      />
    );
  });
  document.querySelectorAll('[data-island="booking"]').forEach(el => {
    createRoot(el).render(<BookingIsland slug={readSlug(el)} />);
  });
}

function init(): void {
  hydrateContactIslands();
  mountClientOnlyIslands();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

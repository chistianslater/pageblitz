/**
 * Motiv einer Postkarte aufnehmen (2026-09-13).
 *
 * Die Karte zeigt als Bild den oberen Teil genau der Seite, die der Betrieb
 * hinter dem QR-Code findet. Aufgenommen wird sie ueber `/preview-ssr/<token>`
 * — und damit ueber dieselbe Route, die den Postkarten-Funnel-Balken anhaengt
 * (`server/ssr/previewCta.ts`). Der blendet sich nur im iframe aus; im
 * obersten Fenster, also auch hier, stuende er sichtbar im Ausschnitt
 * (gemessen y 833–900 bei 1280x900). Ohne das `display:none` unten wirbt die
 * gedruckte Karte mit einem Screenshot, auf dem schon ein Button klebt.
 *
 * Playwright wird bewusst erst beim Aufruf geladen: Es ist eine
 * devDependency und im Serverbetrieb sonst nirgends noetig. Fehlt es, sagt
 * der Fehler, was zu tun ist, statt beim Start des Servers zu knallen.
 */
import type { Browser } from "@playwright/test";

/**
 * Ausschnitt der Aufnahme. Bewusst der obere Teil der Seite: Das Motiv soll
 * zeigen, was der Betrieb beim Scannen als Erstes sieht — Hero mit Name,
 * Bild und Aufmacher. Eine ganze Seite als Briefmarke ist auf Papier
 * unlesbar.
 */
export const MOTIV_BREITE = 1280;
export const MOTIV_HOEHE = 900;

export interface Aufnahmegeraet {
  /** Nimmt eine Seite auf; wirft, wenn dort keine Kundenseite steht. */
  aufnehmen(url: string): Promise<Buffer>;
  schliessen(): Promise<void>;
}

/**
 * Startet den Browser einmal und gibt ein Geraet zurueck, das mehrere
 * Seiten nacheinander aufnimmt. Ein Browserstart je Betrieb waere bei einem
 * Stapel von 40 Karten die halbe Laufzeit.
 */
export async function aufnahmegeraetOeffnen(
  chromiumPfad?: string
): Promise<Aufnahmegeraet> {
  let chromium: typeof import("@playwright/test").chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch {
    throw new Error(
      "Playwright fehlt auf diesem Server — `npm i` mit devDependencies, dann `npx playwright install --with-deps chromium`."
    );
  }
  const browser: Browser = await chromium.launch(
    chromiumPfad ? { executablePath: chromiumPfad } : {}
  );

  return {
    async aufnehmen(url: string): Promise<Buffer> {
      const page = await browser.newPage({
        viewport: { width: MOTIV_BREITE, height: MOTIV_HOEHE },
      });
      try {
        const antwort = await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 45000,
        });
        // Ohne diese Pruefung landet die Aufnahme einer Fehlerseite auf der
        // Postkarte: page.goto wirft bei 404 nicht, es rendert sie brav.
        const status = antwort?.status() ?? 0;
        if (status >= 400 || status === 0) {
          throw new Error(`Seite antwortet mit HTTP ${status || "?"}`);
        }
        // Der Status allein reicht nicht: Unbekannte Pfade landen im
        // SPA-Fallback und antworten mit 200, obwohl dort keine Kundenseite
        // steht. Jede echte Seite rendert in `.pb-site`.
        const istKundenseite = await page
          .locator(".pb-site")
          .count()
          .then(n => n > 0);
        if (!istKundenseite) {
          throw new Error("Keine Kundenseite unter dieser Adresse");
        }
        await page.addStyleTag({
          content: "#pb-preview-cta{display:none!important}",
        });
        // Einblend-Animationen der Packs zu Ende laufen lassen, sonst steht
        // halb sichtbarer Text auf der Karte.
        await page.waitForTimeout(1200);
        return await page.screenshot({
          clip: { x: 0, y: 0, width: MOTIV_BREITE, height: MOTIV_HOEHE },
        });
      } finally {
        await page.close();
      }
    },
    async schliessen(): Promise<void> {
      await browser.close();
    },
  };
}

/** Einzelaufnahme mit eigenem Browser — fuer den Weg ueber das Backend. */
export async function seiteAufnehmen(
  url: string,
  chromiumPfad?: string
): Promise<Buffer> {
  const geraet = await aufnahmegeraetOeffnen(chromiumPfad);
  try {
    return await geraet.aufnehmen(url);
  } finally {
    await geraet.schliessen();
  }
}

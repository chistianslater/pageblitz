import { GA4_MEASUREMENT_ID, hasAnalyticsConsent } from "./consent";

/**
 * Funnel-Ereignisse im Studio (Betreiber-Wunsch 2026-09-19): Postkarte →
 * Design-Auswahl → Studio → Freischalten. Jedes Ereignis geht an
 *
 * - Microsoft Clarity: Aufnahmen und Heatmaps danach filtern („Design
 *   bestätigt, aber nie einen Schritt geöffnet"). Macht auch Klicks in der
 *   Vorschau sichtbar, die Clarity selbst nicht sieht (eingebettetes iframe).
 * - Google Analytics 4: Trichter und Abbruchquoten über Wochen.
 *
 * Beides nur mit Statistik-Einwilligung (lib/consent.ts): Clarity wird ohne
 * Einwilligung gar nicht geladen, und für GA prüfen wir die Einwilligung
 * ausdrücklich — `gtag` existiert wegen Google Ads auch ohne sie. Es gehen
 * keine personenbezogenen Daten raus, nur feste Ereignisnamen und grobe
 * Tags (Quelle, Status, Designrichtung).
 */

export type StudioEvent =
  // Design-Auswahl
  | "intro_geschlossen"
  | "design_angesehen"
  | "design_bestaetigt"
  // Ziel-Frage
  | "ziel_gewaehlt"
  | "ziel_uebersprungen"
  // Einführung
  | "tour_abgeschlossen"
  | "tour_uebersprungen"
  // Schritte (Panel geöffnet)
  | "schritt_design"
  | "schritt_fotos"
  | "schritt_texte"
  | "schritt_struktur"
  | "schritt_angebot"
  | "schritt_recht"
  | "schritt_extras"
  | "schritt_verlauf"
  | "schritt_freischalten"
  // Vorschau (im iframe — Clarity sieht diese Klicks sonst nicht)
  | "vorschau_text_bearbeitet"
  | "vorschau_layout_gewechselt"
  | "vorschau_foto_geklickt"
  | "sektion_einfuegen_geoeffnet"
  | "sektion_eingefuegt"
  | "sektion_abgelehnt"
  // Assistent
  | "ki_assistent_geoeffnet"
  // Abschluss
  | "email_gespeichert"
  | "kauf_blockiert"
  | "kauf_gestartet";

type AnyFn = (...args: unknown[]) => void;

/** Tags dieser Sitzung — gehen bei GA4 als Parameter an jedes Ereignis. */
let sessionTags: Record<string, string> = {};
/**
 * Wurden die Tags schon an Clarity übergeben? Wer erst während der Sitzung
 * im Banner zustimmt, lädt Clarity später — die Tags gehen dann mit dem
 * nächsten Ereignis nach, statt verloren zu sein.
 */
let clarityTagsSent = false;

function flushClarityTags(): void {
  if (clarityTagsSent) return;
  const clarity = windowFn("clarity");
  if (!clarity) return;
  clarityTagsSent = true;
  for (const [key, value] of Object.entries(sessionTags)) {
    try {
      clarity("set", key, value);
    } catch {
      // Analyse darf das Studio nie stören.
    }
  }
}

function windowFn(name: "clarity" | "gtag"): AnyFn | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as Record<string, unknown>)[name];
  return typeof fn === "function" ? (fn as AnyFn) : null;
}

/** Ereignis melden — ohne Einwilligung oder bei Fehlern still ein No-op. */
export function trackStudioEvent(event: StudioEvent): void {
  try {
    flushClarityTags();
    windowFn("clarity")?.("event", event);
  } catch {
    // Analyse darf das Studio nie stören.
  }
  try {
    const gtag = windowFn("gtag");
    if (gtag && hasAnalyticsConsent()) {
      gtag("event", event, {
        send_to: GA4_MEASUREMENT_ID,
        event_category: "studio",
        ...sessionTags,
      });
    }
  } catch {
    // s. o.
  }
}

/** Sitzungs-Tags setzen (Filter in Clarity, Parameter in GA), z. B. Quelle „postkarte". */
export function tagStudioSession(tags: Record<string, string>): void {
  sessionTags = { ...sessionTags, ...tags };
  clarityTagsSent = false;
  flushClarityTags();
}

/** Nur für Tests: Modulzustand zwischen Fällen zurücksetzen. */
export function resetStudioTagsForTests(): void {
  sessionTags = {};
  clarityTagsSent = false;
}

/**
 * Scrollstand der Vorschau (2026-09-03, Betreiber-Befund): Jeder gespeicherte
 * Patch lädt das Vorschau-iframe neu (`?v=` steigt) — der Kunde landete danach
 * wieder ganz oben und musste zur gerade geänderten Sektion zurückscrollen.
 * PreviewFrame merkt sich deshalb den Stand und stellt ihn nach dem Laden
 * wieder her. Reine Entscheidungslogik, damit sie ohne DOM testbar bleibt.
 */
export function scrollRestoreTarget(args: {
  /** Letzter beobachteter Scrollstand des iframes, null wenn unbekannt. */
  savedTop: number | null;
  /** Gesetzter Sektionsanker (Panel/Chat springt bewusst dorthin) — hat Vorrang. */
  focusAnchor: string | null;
  /** Erst-Anzeige nach der Generierung: fängt bewusst oben an. */
  reveal: boolean;
}): number | null {
  const { savedTop, focusAnchor, reveal } = args;
  if (focusAnchor || reveal) return null;
  if (savedTop === null || !Number.isFinite(savedTop) || savedTop <= 0) {
    return null;
  }
  return savedTop;
}

/**
 * Der Sektionsanker ist ein Einmal-Signal: Ein Panel („bearbeite die
 * Galerie") will EINMAL dorthin springen. Vorher blieb der Anker gesetzt
 * und wurde bei jedem Neuladen der Vorschau erneut angesprungen — nach
 * jeder Layout- oder Textänderung landete der Kunde wieder oben
 * (Betreiber-Befund 2026-09-03). Ein verarbeiteter Anker springt nicht
 * erneut; setzt ein Panel denselben Anker neu, ist es wieder ein Signal.
 */
export function shouldConsumeFocus(
  anchor: string | null,
  handled: string | null
): boolean {
  if (!anchor) return false;
  return anchor !== handled;
}

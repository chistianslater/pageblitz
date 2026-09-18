/**
 * Einmalige Studio-Tour (Test-Feedback 2026-09-18): Nutzer:innen verstanden
 * nicht, dass links die Schritte durchzugehen sind, dass Sektionen in der
 * Vorschau Layout-Varianten haben und dass der Kauf erst am Ende kommt.
 * Reine Daten + Geometrie hier, DOM/React in StudioTour.tsx.
 */

/** `data-tour`-Anker im Studio; `null` = Karte mittig ohne Ziel. */
export type TourAnchor = "rail" | "preview" | "assistant" | null;

export interface TourStep {
  anchor: TourAnchor;
  title: string;
  body: string;
}

export const STUDIO_TOUR_STEPS: readonly TourStep[] = [
  {
    anchor: "rail",
    title: "Deine Schritte",
    body: "Hier gehst du Punkt für Punkt durch — Design, Fotos, Texte, Angebot, Rechtliches. Jeder Schritt öffnet ein kleines Panel. Über „Übersicht“ siehst du jederzeit alle Punkte auf einen Blick.",
  },
  {
    anchor: "preview",
    title: "Die Vorschau: sofort das Ergebnis",
    body: "Texte kannst du direkt in der Vorschau anklicken und ändern. Am rechten Rand jeder Sektion sitzt der Knopf „Layout“ — dahinter liegen Varianten, zum Beispiel Bild links, Bild rechts oder zentriert.",
  },
  {
    anchor: "assistant",
    title: "Dein KI-Assistent",
    body: "Sag ihm einfach, was du ändern willst — „Texte kürzer“, „andere Farbe“, „Öffnungszeiten nach oben“. Er setzt es direkt um.",
  },
  {
    anchor: null,
    title: "Bezahlt wird erst zum Schluss",
    body: "Bis dahin ist nichts verbindlich: Du kannst alles ändern, auch das Design. Wenn alles passt, schaltest du die Website im letzten Schritt frei.",
  },
];

export function tourStorageKey(token: string): string {
  return `pb-studio-tour-done:${token}`;
}

/** Tour nur vor dem Kauf und nur, solange sie noch nie abgeschlossen/übersprungen wurde. */
export function shouldStartTour(
  status: string | null | undefined,
  stored: string | null
): boolean {
  return status === "preview" && stored === null;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}
export interface Size {
  width: number;
  height: number;
}

/** Abstand der Karte zum Fensterrand und zum Ziel. */
const TOUR_GAP = 16;
/** Luft zwischen Ziel und Spotlight-Rahmen bzw. Mindestabstand zum Fensterrand. */
const SPOTLIGHT_PAD = 8;

/**
 * Ausschnitt, der beim Abdunkeln frei bleibt (Betreiber-Feedback
 * 2026-09-18: Ziele stärker hervorheben). Etwas größer als das Ziel, aber nie
 * über den Fensterrand — sonst verschwindet der Volt-Rahmen z. B. bei der
 * Rail, die die volle Höhe einnimmt. `null` = kein Ziel, alles abdunkeln.
 */
export function spotlightRect(target: Rect | null, viewport: Size): Rect | null {
  if (!target) return null;
  const left = Math.max(SPOTLIGHT_PAD, target.left - SPOTLIGHT_PAD);
  const top = Math.max(SPOTLIGHT_PAD, target.top - SPOTLIGHT_PAD);
  const right = Math.min(
    viewport.width - SPOTLIGHT_PAD,
    target.left + target.width + SPOTLIGHT_PAD
  );
  const bottom = Math.min(
    viewport.height - SPOTLIGHT_PAD,
    target.top + target.height + SPOTLIGHT_PAD
  );
  return { left, top, width: right - left, height: bottom - top };
}

/**
 * Position der Tour-Karte: bevorzugt rechts neben dem Ziel (die Rail liegt
 * links), sonst unter dem Ziel, sonst darüber — immer mit Rand im Fenster.
 * Ohne Ziel (Anker nicht sichtbar, z. B. Mobil-Tabs) mittig.
 */
export function clampTourCard(
  target: Rect | null,
  card: Size,
  viewport: Size
): { left: number; top: number } {
  const clamp = (value: number, max: number) =>
    Math.max(TOUR_GAP, Math.min(value, max));
  const maxLeft = viewport.width - card.width - TOUR_GAP;
  const maxTop = viewport.height - card.height - TOUR_GAP;
  if (!target) {
    return {
      left: Math.round((viewport.width - card.width) / 2),
      top: Math.round((viewport.height - card.height) / 2),
    };
  }
  const rightOf = target.left + target.width + TOUR_GAP;
  if (rightOf + card.width + TOUR_GAP <= viewport.width) {
    return { left: rightOf, top: clamp(target.top, maxTop) };
  }
  const below = target.top + target.height + TOUR_GAP;
  if (below + card.height + TOUR_GAP <= viewport.height) {
    return { left: clamp(target.left, maxLeft), top: below };
  }
  const above = target.top - card.height - TOUR_GAP;
  return { left: clamp(target.left, maxLeft), top: clamp(above, maxTop) };
}

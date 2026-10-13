/**
 * Exit-Intent im Studio (Betreiber 2026-10-13: „Leute testen, hinterlassen
 * aber keine E-Mail. Wenn man ganz schnell mit der Maus nach oben zum
 * Schließen fährt, soll das E-Mail-Modal kommen.“). Reine Regeln hier,
 * Verdrahtung in LeaveWithoutEmailGuard.tsx — dasselbe Modal wie bei
 * Link-Klick und Browser-Zurück.
 *
 * Bewusst zurückhaltend gegen Fehlalarme:
 * - nur Desktop mit Maus (`pointer: fine` und Hover), nie Touch,
 * - erst 20 s nachdem die Website fertig im Studio steht (Uhr startet mit
 *   der fertigen Seite, nicht beim Laden/Generieren),
 * - nur beim Verlassen über die OBERKANTE (nicht über eine Ecke zur Seite
 *   hinaus) und mit Schwung nach oben — wer langsam zur Adressleiste fährt,
 *   wird nicht unterbrochen; auch aus der Vorschau (gleich-origin-iframe,
 *   Koordinaten in den Viewport umgerechnet),
 * - höchstens einmal pro Sitzung, nie neben einem anderen Dialog, nie im
 *   Checkout.
 */

export const EXIT_INTENT_MIN_DWELL_MS = 20_000;
/** Oberkante: Chrome meldet beim Verlassen 0 oder negative Werte. */
export const EXIT_INTENT_TOP_PX = 8;
/** Mindesttempo nach oben in px/ms (0,3 = 300 px/s) — „ganz schnell“. */
export const EXIT_INTENT_MIN_SPEED = 0.3;
export const EXIT_INTENT_STORAGE_KEY = "pb-exit-intent-shown";

export interface ExitIntentInput {
  /** Guard scharf (Vorschau ohne E-Mail). */
  armed: boolean;
  finePointer: boolean;
  alreadyShown: boolean;
  checkoutInProgress: boolean;
  otherDialogOpen: boolean;
  /** Das Leave-Modal selbst ist schon offen. */
  modalOpen: boolean;
  /** Zeit seit die Website fertig ist; null = noch nicht fertig. */
  dwellMs: number | null;
  /** `mouseout` mit `relatedTarget === null` — Zeiger verlässt das Fenster. */
  leftWindow: boolean;
  /** Austrittspunkt im Viewport des Studios. */
  clientX: number;
  clientY: number;
  viewportWidth: number;
  /** Tempo nach oben in px/ms; null = keine Bewegungsdaten. */
  speed: number | null;
}

export function shouldShowExitIntent(i: ExitIntentInput): boolean {
  if (!i.armed || !i.finePointer) return false;
  if (i.alreadyShown || i.checkoutInProgress) return false;
  if (i.otherDialogOpen || i.modalOpen) return false;
  if (i.dwellMs === null || i.dwellMs < EXIT_INTENT_MIN_DWELL_MS) return false;
  if (!i.leftWindow || i.clientY > EXIT_INTENT_TOP_PX) return false;
  // Ecke: über die Seite hinaus, nicht nach oben zum Schließen.
  if (i.clientX < 0 || i.clientX > i.viewportWidth) return false;
  if (i.speed !== null && i.speed < EXIT_INTENT_MIN_SPEED) return false;
  return true;
}

/** Tempo nach oben zwischen letzter Mausbewegung und Austritt (px/ms). */
export function upwardSpeed(
  prev: { y: number; t: number } | null,
  y: number,
  t: number
): number | null {
  if (!prev) return null;
  const dy = prev.y - y;
  const dt = t - prev.t;
  if (dt <= 0) return dy > 0 ? Infinity : dy < 0 ? -Infinity : 0;
  return dy / dt;
}

/**
 * Punkt im Vorschau-iframe → Studio-Viewport. Die Vorschau kann skaliert
 * sein (Rechteck kleiner als das Dokument), daher mit Faktor.
 */
export function mapFramePoint(
  rect: { top: number; left: number; width: number; height: number },
  frameWidth: number,
  frameHeight: number,
  clientY: number,
  clientX: number
): { x: number; y: number } {
  const sx = frameWidth > 0 ? rect.width / frameWidth : 1;
  const sy = frameHeight > 0 ? rect.height / frameHeight : 1;
  return { x: rect.left + clientX * sx, y: rect.top + clientY * sy };
}

type MatchMediaHost = { matchMedia?: (query: string) => { matches: boolean } };

/** Maus mit Hover — Touch-Geräte (auch Tablets mit Stift) fallen raus. */
export function isFinePointerDevice(host: MatchMediaHost): boolean {
  if (typeof host.matchMedia !== "function") return false;
  try {
    return (
      host.matchMedia("(pointer: fine)").matches &&
      !host.matchMedia("(hover: none)").matches
    );
  } catch {
    return false;
  }
}

type SessionStore = Pick<Storage, "getItem" | "setItem">;

/** Rückfall, wenn sessionStorage gesperrt ist (Privatmodus, Cookies aus). */
let shownInMemory = false;
let checkoutInProgress = false;

function defaultStore(): SessionStore | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function exitIntentAlreadyShown(
  store: SessionStore | null = defaultStore()
): boolean {
  if (shownInMemory) return true;
  try {
    return store?.getItem(EXIT_INTENT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markExitIntentShown(
  store: SessionStore | null = defaultStore()
): void {
  shownInMemory = true;
  try {
    store?.setItem(EXIT_INTENT_STORAGE_KEY, "1");
  } catch {
    // Merker im Modul reicht für diese Seite.
  }
}

/** CheckoutBar meldet den Sprung zu Stripe — dann nie mehr dazwischenfunken. */
export function markStudioCheckoutStarted(active: boolean): void {
  checkoutInProgress = active;
}

export function studioCheckoutInProgress(): boolean {
  return checkoutInProgress;
}

/** Offener Dialog/Modal irgendwo im Studio (Tour, Assistent, Einfügen …). */
export function otherDialogOpen(doc: Document): boolean {
  return (
    doc.querySelector(
      '[aria-modal="true"], [role="dialog"], [role="alertdialog"]'
    ) !== null
  );
}

/**
 * Zeitpunkt, an dem die Website fertig im Studio stand — einmal pro
 * Seitenaufruf gemerkt, damit ein Neu-Mount des Guards die 20 s nicht neu
 * startet.
 */
let siteReadyAt: number | null = null;

export function noteSiteReady(now: number): number {
  if (siteReadyAt === null) siteReadyAt = now;
  return siteReadyAt;
}

export function siteReadySince(): number | null {
  return siteReadyAt;
}

/** Nur für Tests: Modulzustand zurücksetzen. */
export function resetExitIntentForTests(): void {
  shownInMemory = false;
  checkoutInProgress = false;
  siteReadyAt = null;
}

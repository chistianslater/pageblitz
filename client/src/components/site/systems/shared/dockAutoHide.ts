/**
 * Handy-Leiste blendet aus, solange dieselben Knöpfe in der Seite sichtbar
 * sind (Betreiber-Abnahme 2026-10-12: Einstiegs-, Aufruf-, Kontakt- und
 * Fuß-Knöpfe direkt über der Leiste zeigten dieselben Wege doppelt).
 *
 * Markup: die Leiste trägt `data-sys-dock`, jede Knopfgruppe in der Seite
 * `data-sys-actions` (Gruppe oder einzelner Knopf). Zählt nur eine Gruppe,
 * die mindestens einen Weg der Leiste anbietet (gleiches `href`).
 *
 * Ohne JS bleibt die Leiste immer sichtbar: kein CSS versteckt sie, nur
 * dieses Skript setzt Inline-Styles plus `inert`/`aria-hidden`. Die
 * Luft unter der Seite (CSS) bleibt stehen — kein Layout-Sprung.
 */

export const SYS_DOCK = { "data-sys-dock": "" } as const;
export const SYS_ACTIONS = { "data-sys-actions": "" } as const;
/** Gesetzt, solange die Leiste ausgeblendet ist (Tests, Inspektion). */
export const DOCK_HIDDEN_ATTR = "data-sys-dock-hidden";

/** „Spürbar sichtbar": halbe Gruppe oder ein Viertel des Sichtfensters. */
const MIN_RATIO = 0.5;
const MIN_VIEWPORT_SHARE = 0.25;
const THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];
const DURATION_MS = 240;
const EASE = "cubic-bezier(.23,1,.32,1)";
/** Weit genug nach unten, auch für die schwebende Plakat-Pille. */
const HIDDEN_TRANSFORM =
  "translateY(calc(100% + 2.5rem + env(safe-area-inset-bottom, 0px)))";

type Styled = Pick<
  CSSStyleDeclaration,
  "transform" | "opacity" | "pointerEvents" | "visibility" | "transition"
>;
const STYLE_KEYS: readonly (keyof Styled)[] = [
  "transform",
  "opacity",
  "pointerEvents",
  "visibility",
  "transition",
];

function hrefsOf(el: Element): string[] {
  const links =
    el.tagName === "A" ? [el] : Array.from(el.querySelectorAll("a"));
  return links
    .map(a => a.getAttribute("href"))
    .filter((h): h is string => Boolean(h));
}

function reducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isMeaningful(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= MIN_RATIO) return true;
  const view = entry.rootBounds?.height ?? window.innerHeight;
  return view > 0 && entry.intersectionRect.height >= view * MIN_VIEWPORT_SHARE;
}

function transitionFor(hidden: boolean): string {
  if (reducedMotion()) return "none";
  const ms = `${DURATION_MS}ms`;
  // Beim Ausblenden wird `visibility` erst nach der Bewegung umgeschaltet,
  // beim Einblenden sofort — so ist die Leiste nie unsichtbar fokussierbar.
  const visibility = hidden ? `visibility 0s linear ${ms}` : "visibility 0s";
  return `transform ${ms} ${EASE}, opacity ${ms} ${EASE}, ${visibility}`;
}

function setHidden(dock: HTMLElement, hidden: boolean): void {
  if (dock.hasAttribute(DOCK_HIDDEN_ATTR) === hidden) return;
  dock.style.transition = transitionFor(hidden);
  if (hidden) {
    dock.setAttribute(DOCK_HIDDEN_ATTR, "");
    dock.setAttribute("aria-hidden", "true");
    dock.setAttribute("inert", "");
    dock.style.transform = HIDDEN_TRANSFORM;
    dock.style.opacity = "0";
    dock.style.pointerEvents = "none";
    dock.style.visibility = "hidden";
  } else {
    dock.removeAttribute(DOCK_HIDDEN_ATTR);
    dock.removeAttribute("aria-hidden");
    dock.removeAttribute("inert");
    dock.style.transform = "";
    dock.style.opacity = "";
    dock.style.pointerEvents = "";
    dock.style.visibility = "";
  }
}

/**
 * Beobachtet die Knopfgruppen unter `root` und blendet die Leiste aus,
 * solange eine davon spürbar sichtbar ist. Gibt das Aufräumen zurück
 * (Leiste wieder sichtbar, Inline-Styles wie vorher).
 */
export function mountDockAutoHide(root: HTMLElement): () => void {
  const dock = root.querySelector<HTMLElement>("[data-sys-dock]");
  if (!dock || typeof IntersectionObserver === "undefined") return () => {};
  const dockHrefs = new Set(hrefsOf(dock));
  const groups = Array.from(
    root.querySelectorAll<HTMLElement>("[data-sys-actions]")
  ).filter(
    g => !dock.contains(g) && hrefsOf(g).some(h => dockHrefs.has(h))
  );
  if (groups.length === 0) return () => {};

  const before = Object.fromEntries(
    STYLE_KEYS.map(k => [k, dock.style[k]])
  ) as Styled;
  const visible = new Set<Element>();
  const io = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (isMeaningful(entry)) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setHidden(dock, visible.size > 0);
    },
    { threshold: THRESHOLDS }
  );
  groups.forEach(g => io.observe(g));

  return () => {
    io.disconnect();
    setHidden(dock, false);
    STYLE_KEYS.forEach(k => {
      dock.style[k] = before[k];
    });
  };
}

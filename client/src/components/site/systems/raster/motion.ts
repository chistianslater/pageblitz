/**
 * Bewegung des Raster-Designsystems (Systemblatt 08). Läuft nur im Browser,
 * nur nach dem ersten Frame (`data-rs-ready`); ohne Script und bei
 * reduzierter Bewegung bleibt alles sichtbar (CSS-Block in motionCss.ts).
 * Kein Scroll-Listener: Abschnitte per IntersectionObserver (einmalig),
 * Bänder rein per CSS (sticky, optional Scroll-Zeitleiste).
 */

/** Mehr Zeilen verlängern die Wortmarken-Maske nicht weiter. */
const MAX_LINES = 6;

export function mountRasterMotion(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  // Abschnitte: einmalig, sobald ihre Oberkante in die oberen 85 % des
  // Sichtfensters tritt (wie Journal, unabhängig von der Abschnittshöhe).
  const sections = Array.from(root.querySelectorAll<HTMLElement>(".rs-sec"));
  if (typeof IntersectionObserver === "undefined") {
    sections.forEach(s => s.setAttribute("data-rs-in", ""));
  } else {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-rs-in", "");
          io.unobserve(e.target);
        }),
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );
    sections.forEach(s => io.observe(s));
    cleanups.push(() => io.disconnect());
  }

  // Ein Frame: Zeilen der Wortmarke einmal messen (eine Lesung, kein
  // Schreiben dazwischen), dann Startzustände freigeben.
  const frame = requestAnimationFrame(() => {
    markWordmarkLines(root);
    root.setAttribute("data-rs-ready", "");
  });
  cleanups.push(() => cancelAnimationFrame(frame));
  return () => cleanups.forEach(fn => fn());
}

/**
 * Zeilenzahl der Wortmarke als `--rs-wm-lines` am Fit-Rahmen: die Maske
 * läuft je Zeile 60 ms länger (Systemblatt: Zeile für Zeile, 60 ms Versatz).
 * Der Rahmen hat kein React-`style`, das Setzen kollidiert nicht mit dem h1.
 */
function markWordmarkLines(root: HTMLElement): void {
  const wordmark = root.querySelector<HTMLElement>(".rs-entry .rs-wordmark");
  const frame = wordmark?.parentElement;
  if (!wordmark || !frame) return;
  const lineHeight = parseFloat(getComputedStyle(wordmark).lineHeight);
  const height = wordmark.getBoundingClientRect().height;
  const lines =
    lineHeight > 0 ? Math.max(1, Math.round(height / lineHeight)) : 1;
  frame.style.setProperty("--rs-wm-lines", String(Math.min(MAX_LINES, lines)));
}

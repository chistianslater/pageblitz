/**
 * Bewegung des Klar-Designsystems (Systemblatt 7 „Bilder und Bewegung“).
 * Läuft nur im Browser, nur nach dem ersten Frame (`data-kl-ready`); ohne
 * Script und bei reduzierter Bewegung bleibt alles sichtbar (CSS in
 * motionCss.ts). Kein Scroll-Listener: Abschnitte per IntersectionObserver,
 * einmalig. Keine Dauerschleife, kein Laufband.
 */
export function mountKlarMotion(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  // Abschnitte: einmalig, sobald ihre Oberkante in die oberen 85 % des
  // Sichtfensters tritt (wie Journal, Raster, Werkstoff, Plakat).
  const sections = Array.from(root.querySelectorAll<HTMLElement>(".kl-sec"));
  if (typeof IntersectionObserver === "undefined") {
    sections.forEach(s => s.setAttribute("data-kl-in", ""));
  } else {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-kl-in", "");
          io.unobserve(e.target);
        }),
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );
    sections.forEach(s => io.observe(s));
    cleanups.push(() => io.disconnect());
  }

  // Erst nach dem ersten Frame Startzustände freigeben: der erste Paint
  // (LCP) zeigt die fertige Seite, nie einen leeren Einstieg.
  const frame = requestAnimationFrame(() =>
    root.setAttribute("data-kl-ready", "")
  );
  cleanups.push(() => cancelAnimationFrame(frame));
  return () => cleanups.forEach(fn => fn());
}

/**
 * Bewegung von Freundlich (Systemblatt 8 „Bewegung federt leise").
 * Läuft nur im Browser, nur nach dem ersten Frame (`data-fr-ready`); ohne
 * Script und bei reduzierter Bewegung bleibt alles sichtbar (CSS in
 * motionCss.ts). Kein Scroll-Listener: Kapitel per IntersectionObserver,
 * einmalig. Keine Dauerschleife, kein Laufband, kein Parallax.
 */
export function mountFreundlichMotion(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  // Kapitel: einmalig, sobald ihre Oberkante in die oberen 85 % des
  // Sichtfensters tritt (wie Nacht, Klar, Plakat, Werkstoff, Raster, Journal).
  const sections = Array.from(root.querySelectorAll<HTMLElement>(".fr-sec"));
  if (typeof IntersectionObserver === "undefined") {
    sections.forEach(s => s.setAttribute("data-fr-in", ""));
  } else {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-fr-in", "");
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
    root.setAttribute("data-fr-ready", "")
  );
  cleanups.push(() => cancelAnimationFrame(frame));
  return () => cleanups.forEach(fn => fn());
}

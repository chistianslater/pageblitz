/**
 * Bewegung des Werkstoff-Designsystems (Systemblatt 08). Läuft nur im
 * Browser, nur nach dem ersten Frame (`data-ws-ready`); ohne Script und bei
 * reduzierter Bewegung bleibt alles sichtbar (CSS-Block in motionCss.ts).
 * Kein Scroll-Listener: Abschnitte per IntersectionObserver, einmalig.
 */
export function mountWerkstoffMotion(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  // Abschnitte: einmalig, sobald ihre Oberkante in die oberen 85 % des
  // Sichtfensters tritt (wie Journal und Raster).
  const sections = Array.from(root.querySelectorAll<HTMLElement>(".ws-sec"));
  if (typeof IntersectionObserver === "undefined") {
    sections.forEach(s => s.setAttribute("data-ws-in", ""));
  } else {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-ws-in", "");
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
    root.setAttribute("data-ws-ready", "")
  );
  cleanups.push(() => cancelAnimationFrame(frame));
  return () => cleanups.forEach(fn => fn());
}

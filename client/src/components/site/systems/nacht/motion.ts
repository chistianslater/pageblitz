/**
 * Bewegung des Nacht-Designsystems (Systemblatt 7 „Bilder und Bewegung“).
 * Läuft nur im Browser, nur nach dem ersten Frame (`data-nc-ready`); ohne
 * Script und bei reduzierter Bewegung bleibt alles sichtbar (CSS in
 * motionCss.ts). Kein Scroll-Listener: Kapitel per IntersectionObserver,
 * einmalig. Keine Dauerschleife, kein Ken-Burns, kein Karussell.
 */
export function mountNachtMotion(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  // Kapitel: einmalig, sobald ihre Oberkante in die oberen 85 % des
  // Sichtfensters tritt (wie Klar, Plakat, Werkstoff, Raster, Journal).
  const sections = Array.from(root.querySelectorAll<HTMLElement>(".nc-sec"));
  if (typeof IntersectionObserver === "undefined") {
    sections.forEach(s => s.setAttribute("data-nc-in", ""));
  } else {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-nc-in", "");
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
    root.setAttribute("data-nc-ready", "")
  );
  cleanups.push(() => cancelAnimationFrame(frame));
  return () => cleanups.forEach(fn => fn());
}

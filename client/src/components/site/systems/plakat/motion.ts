/**
 * Bewegung des Plakat-Designsystems (Systemblatt 09). Läuft nur im
 * Browser, nur nach dem ersten Frame (`data-pk-ready`); ohne Script und bei
 * reduzierter Bewegung bleibt alles sichtbar und das Laufband steht (CSS in
 * motionCss.ts). Kein Scroll-Listener: Abschnitte per IntersectionObserver,
 * einmalig. Der Pause-Knopf des Laufbands schaltet `data-pk-paused`.
 */
const PAUSE_TITLE = "Laufband anhalten";
const PLAY_TITLE = "Laufband abspielen";

function mountTickerToggles(root: HTMLElement): () => void {
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>(".pk-tick-toggle")
  );
  const offs = buttons.map(button => {
    const onClick = () => {
      const paused = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(paused));
      button.setAttribute("title", paused ? PLAY_TITLE : PAUSE_TITLE);
      const tick = button.closest(".pk-tick");
      if (paused) tick?.setAttribute("data-pk-paused", "");
      else tick?.removeAttribute("data-pk-paused");
    };
    button.addEventListener("click", onClick);
    return () => button.removeEventListener("click", onClick);
  });
  return () => offs.forEach(off => off());
}

export function mountPlakatMotion(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [mountTickerToggles(root)];

  // Abschnitte: einmalig, sobald ihre Oberkante in die oberen 85 % des
  // Sichtfensters tritt (wie Journal, Raster, Werkstoff).
  const sections = Array.from(root.querySelectorAll<HTMLElement>(".pk-sec"));
  if (typeof IntersectionObserver === "undefined") {
    sections.forEach(s => s.setAttribute("data-pk-in", ""));
  } else {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-pk-in", "");
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
    root.setAttribute("data-pk-ready", "")
  );
  cleanups.push(() => cancelAnimationFrame(frame));
  return () => cleanups.forEach(fn => fn());
}

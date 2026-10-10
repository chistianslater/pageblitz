/**
 * Bewegung des Journal-Designsystems. Läuft nur im Browser, nur nach dem
 * ersten Frame (`data-jr-ready`); ohne Script und bei reduzierter Bewegung
 * bleibt alles sichtbar (siehe CSS-Block „Bewegung" in css.ts).
 */
/** 15 % des Abschnitts ODER 15 % des Sichtfensters: hohe Abschnitte sonst nie. */
export function isRevealed(e: {
  intersectionRatio: number;
  intersectionRect: { height: number };
  rootBounds?: { height: number } | null;
}): boolean {
  if (e.intersectionRatio >= 0.15) return true;
  const vh =
    e.rootBounds?.height ??
    (typeof window !== "undefined" ? window.innerHeight : 0);
  return vh > 0 && e.intersectionRect.height >= 0.15 * vh;
}

export function mountJournalMotion(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  // Abschnitte: einmalig einblenden, sobald sie 15 % sichtbar sind.
  const sections = Array.from(
    root.querySelectorAll<HTMLElement>(".jr-section")
  );
  if (typeof IntersectionObserver === "undefined") {
    sections.forEach(s => s.setAttribute("data-jr-in", ""));
  } else {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (!e.isIntersecting || !isRevealed(e)) return;
          e.target.setAttribute("data-jr-in", "");
          io.unobserve(e.target);
        }),
      { threshold: [0, 0.15] }
    );
    sections.forEach(s => io.observe(s));
    cleanups.push(() => io.disconnect());
  }

  // Galerie-Streifen (Handy): Haarlinie unter dem Streifen zeigt scrollLeft.
  root.querySelectorAll<HTMLElement>(".jr-strip").forEach(strip => {
    cleanups.push(mountStripProgress(strip));
  });

  const frame = requestAnimationFrame(() =>
    root.setAttribute("data-jr-ready", "")
  );
  cleanups.push(() => cancelAnimationFrame(frame));
  return () => cleanups.forEach(fn => fn());
}

function mountStripProgress(strip: HTMLElement): () => void {
  const bar = document.createElement("div");
  bar.className = "jr-strip-bar";
  bar.setAttribute("aria-hidden", "true");
  const fill = document.createElement("span");
  bar.append(fill);
  strip.insertAdjacentElement("afterend", bar);

  let pending = 0;
  const paint = () => {
    pending = 0;
    const max = strip.scrollWidth - strip.clientWidth;
    const p = max > 0 ? Math.min(1, Math.max(0, strip.scrollLeft / max)) : 0;
    fill.style.transform = `scaleX(${p})`;
  };
  const update = () => {
    pending = 0;
    if (strip.scrollWidth > strip.clientWidth) bar.setAttribute("data-active", "");
    else bar.removeAttribute("data-active");
    paint();
  };
  const onScroll = () => {
    if (!pending) pending = requestAnimationFrame(paint);
  };
  const onResize = () => {
    if (!pending) pending = requestAnimationFrame(update);
  };
  strip.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  pending = requestAnimationFrame(update);
  return () => {
    strip.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    if (pending) cancelAnimationFrame(pending);
    bar.remove?.();
  };
}

import { lazy, Suspense, useEffect, useState } from "react";

/**
 * Hero-Bühne: LCP bleibt das Werkbank-Preview (`loading="eager"`). Sobald
 * der Browser Luft hat, übernimmt ein Remotion-Player die Fläche — Loop
 * startet auf demselben Screenshot, rewindet, baut die Werkbank-Site
 * cinematic auf und wischt zurück ins Live-Bild.
 *
 * `prefers-reduced-motion: reduce` bleibt beim statischen Preview.
 */

const HeroFilmPlayer = lazy(() => import("./hero-film/HeroFilmPlayer"));

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function HeroBuild() {
  const reduced = usePrefersReducedMotion();
  const [filmReady, setFilmReady] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const arm = () => {
      if (!cancelled) setFilmReady(true);
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(arm, { timeout: 900 });
    } else {
      timer = setTimeout(arm, 400);
    }
    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof w.cancelIdleCallback === "function")
        w.cancelIdleCallback(idleId);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [reduced]);

  const showFilm = filmReady && !reduced;

  return (
    <div
      className="lpb"
      role="img"
      aria-label="Animation: Eine Werkbank-Website rewindet und baut sich Stück für Stück wieder auf — bis zur fertigen Live-Seite"
    >
      <div className="lpb-chrome" aria-hidden="true">
        <span className="lpb-dot" />
        <span className="lpb-dot" />
        <span className="lpb-dot" />
        <span className="lpb-url">deinname.pageblitz.de</span>
      </div>

      <div className="lpb-stage">
        <img
          className="lpb-final"
          src="/pack-previews/werkbank.webp"
          alt=""
          width={800}
          height={500}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        {showFilm ? (
          <Suspense fallback={null}>
            <HeroFilmPlayer />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}

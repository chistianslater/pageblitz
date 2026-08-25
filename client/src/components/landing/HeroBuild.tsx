import { useEffect, useState } from "react";

/**
 * Hero-Bühne (2026-08-25, User-Brief: „Wireframe, das sich Schritt für
 * Schritt aufbaut — und am Ende eine coole fertige Website"). Runde 2:
 * Das Wireframe liegt jetzt in GEOMETRIE UND FARBEN der Ziel-Website
 * (Werkbank: Kohle-Hero #191919, Putz-Balken, Signal #FF4D00), damit der
 * Crossfade glaubwürdig als „Verwandlung" liest — gleiche Zonen, gleiche
 * Proportionen, dann werden nacheinander die Werkbank-Akzente gelegt
 * (dritte Headline-Zeile wird Signal, die Fotokante bekommt den
 * Signal-Border), erst dann fadet das echte Screenshot darüber.
 *
 * Aufbau: Nav/Hero-Schale → Headline-Zeilen → Subline → Foto-Band →
 * Karten → Akzent-Phase → Crossfade → Hold → Loop. Mechanik wie
 * gehabt (Timer-Phasen + CSS-Transitions); bei `prefers-reduced-motion:
 * reduce` steht sofort die fertige Website (keine Timer).
 */

const BUILD_STEPS = 6;
const STEP_MS = 620;
const ACCENT_MS = 750;
const FINAL_FADE_MS = 900;
const HOLD_MS = 4600;
const RESET_FADE_MS = 500;

type Phase =
  | { kind: "build"; step: number }
  | { kind: "accent" }
  | { kind: "final" }
  | { kind: "hold" }
  | { kind: "reset" };

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
  const [phase, setPhase] = useState<Phase>({ kind: "build", step: 0 });

  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const advance = (current: Phase) => {
      switch (current.kind) {
        case "build":
          if (current.step < BUILD_STEPS) {
            const next = current.step + 1;
            setPhase({ kind: "build", step: next });
            timer = setTimeout(() => advance({ kind: "build", step: next }), STEP_MS);
          } else {
            setPhase({ kind: "accent" });
            timer = setTimeout(() => advance({ kind: "accent" }), ACCENT_MS);
          }
          break;
        case "accent":
          setPhase({ kind: "final" });
          timer = setTimeout(() => advance({ kind: "final" }), FINAL_FADE_MS);
          break;
        case "final":
          setPhase({ kind: "hold" });
          timer = setTimeout(() => advance({ kind: "hold" }), HOLD_MS);
          break;
        case "hold":
          setPhase({ kind: "reset" });
          timer = setTimeout(() => advance({ kind: "reset" }), RESET_FADE_MS);
          break;
        case "reset":
          setPhase({ kind: "build", step: 0 });
          timer = setTimeout(() => advance({ kind: "build", step: 0 }), 60);
          break;
      }
    };
    timer = setTimeout(() => advance({ kind: "build", step: 0 }), 350);
    return () => clearTimeout(timer);
  }, [reduced]);

  const buildStep = phase.kind === "build" ? phase.step : BUILD_STEPS;
  const isAccent =
    phase.kind === "accent" || phase.kind === "final" || phase.kind === "hold";
  const showFinal = phase.kind === "final" || phase.kind === "hold";
  const resetting = phase.kind === "reset";

  return (
    <div
      className="lpb"
      role="img"
      aria-label="Animation: Ein Website-Wireframe baut sich Schritt für Schritt auf und verwandelt sich in die fertige Website"
      data-resetting={resetting || undefined}
    >
      {/* Browser-Chrome */}
      <div className="lpb-chrome" aria-hidden="true">
        <span className="lpb-dot" />
        <span className="lpb-dot" />
        <span className="lpb-dot" />
        <span className="lpb-url">deinname.pageblitz.de</span>
      </div>

      <div className="lpb-stage">
        {/* Wireframe in Werkbank-Geometrie: dunkle Hero-Zone oben,
            Foto-Band, helle Karten-Zone — Positionen folgen dem finalen
            Screenshot, damit der Crossfade als Verwandlung liest. */}
        <div className="lpb-wire" data-accent={isAccent || undefined}>
          <div className="lpb-herozone" data-on={buildStep >= 1 || undefined}>
            <div className="lpb-nav">
              <span className="lpb-logo" />
              <span className="lpb-link" />
              <span className="lpb-link" />
              <span className="lpb-link" />
            </div>
            <div className="lpb-hlines">
              <span className="lpb-bar lpb-h1a" data-on={buildStep >= 2 || undefined} />
              <span className="lpb-bar lpb-h1b" data-on={buildStep >= 3 || undefined} />
              <span className="lpb-bar lpb-h1c" data-on={buildStep >= 4 || undefined} />
              <span className="lpb-bar lpb-sub" data-on={buildStep >= 4 || undefined} />
            </div>
          </div>
          <div className="lpb-band" data-on={buildStep >= 5 || undefined} />
          <div className="lpb-cardzone" data-on={buildStep >= 6 || undefined}>
            <span className="lpb-card" />
            <span className="lpb-card" />
            <span className="lpb-card" />
            <span className="lpb-card" />
          </div>
        </div>

        {/* Fertige Website fadet darüber ein */}
        <img
          className="lpb-final"
          src="/pack-previews/werkbank.webp"
          alt=""
          width={800}
          height={500}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          data-on={reduced || showFinal || undefined}
        />
      </div>
    </div>
  );
}

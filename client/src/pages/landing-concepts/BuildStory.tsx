import React, { useEffect, useRef, useState } from "react";
import { Search, Check, RotateCcw, Pause, Play } from "lucide-react";
const steps = [
  [
    "Deinen Betrieb finden.",
    "Dein Name genügt für den Anfang. Vorhandene Informationen werden zum Ausgangspunkt.",
  ],
  [
    "Deinen Entwurf ansehen.",
    "Aus deinen Inhalten werden Design, Bilder und Texte. Dein erster Auftritt nimmt Form an.",
  ],
  [
    "Mit gutem Gefühl online.",
    "Alles prüfen, den letzten Schliff geben und freischalten. So könnte das Ergebnis aussehen.",
  ],
];
export default function BuildStory() {
  const root = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(mq.matches);
      if (mq.matches) {
        elapsed.current = 10000;
        setProgress(100);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      e => setVisible(e[0].isIntersecting),
      { threshold: 0.25 }
    );
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);
  useEffect(() => {
    if (!visible || paused || reduced || progress >= 100) return;
    // The old 100 ms timer moved the reveal in visible 2.4% jumps.
    // Paint the reveal on animation frames; only update React for copy/steps.
    let frame = 0;
    let last = performance.now();
    let previous = Math.floor(elapsed.current / 100);
    const resetClock = () => {
      last = performance.now();
    };
    const tick = (now: number) => {
      if (!document.hidden)
        elapsed.current = Math.min(10000, elapsed.current + now - last);
      last = now;
      const percent = elapsed.current / 100;
      root.current?.style.setProperty(
        "--build-clip",
        `${Math.max(0, 100 - (percent - 30) * 2.4)}%`
      );
      const whole = Math.floor(percent);
      if (whole !== previous) {
        previous = whole;
        setProgress(whole);
      }
      if (elapsed.current < 10000) frame = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", resetClock);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", resetClock);
    };
  }, [visible, paused, reduced, progress >= 100]);
  useEffect(() => {
    if (progress < 100 || paused || reduced || !visible) return;
    const timer = setTimeout(() => {
      elapsed.current = 0;
      root.current?.style.setProperty("--build-clip", "100%");
      setProgress(0);
    }, 3000);
    return () => clearTimeout(timer);
  }, [progress >= 100, paused, reduced, visible]);
  const step = progress < 30 ? 0 : progress < 72 ? 1 : 2;
  return (
    <section
      ref={root}
      className="build-story lc-width"
      id="ablauf"
      data-step={step}
      data-progress={progress}
      data-paused={paused || !visible}
    >
      <div className="build-heading">
        <div>
          <p className="lc-eyebrow">Ein Name. Ein Entwurf. Dein Auftritt.</p>
          <h2>
            Dein Alltag ist voll genug.
            <br />
            Das hier bleibt einfach.
          </h2>
        </div>
        <button
          className="build-play"
          onClick={() => {
            if (progress >= 100) {
              elapsed.current = 0;
              root.current?.style.setProperty("--build-clip", "100%");
              setProgress(0);
              setPaused(false);
            } else setPaused(p => !p);
          }}
          disabled={reduced}
        >
          {progress >= 100 ? (
            <RotateCcw size={16} />
          ) : paused ? (
            <Play size={16} />
          ) : (
            <Pause size={16} />
          )}{" "}
          {progress >= 100
            ? "Noch einmal ansehen"
            : paused
              ? "Fortsetzen"
              : "Animation pausieren"}
        </button>
      </div>
      <ol className="build-chapters">
        {steps.map(([title, text], i) => (
          <li
            key={title}
            className={i === step ? "current" : i < step ? "done" : ""}
          >
            <span>
              {i < step ? <Check size={18} /> : String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="build-stage">
        <div className="build-caption">
          <span>SO ENTSTEHT DEINE WEBSITE</span>
          <span>Animiertes Beispiel</span>
        </div>
        <div className="build-window">
          <div className="build-toolbar">
            <span>● ● ●</span>
            <span>
              {step === 0
                ? "Deinen Betrieb suchen"
                : step === 2
                  ? "Google · Suchsimulation"
                  : "noir-haarstudio.pageblitz.de"}
            </span>
            <span>{step === 2 ? "✓" : "···"}</span>
          </div>
          {step === 0 ? (
            <div className="build-search">
              <Search size={28} />
              <p>Wie heißt dein Betrieb?</p>
              <div className="build-query">
                {"NOIR Haarstudio".slice(
                  0,
                  Math.min(15, Math.floor(progress * 0.85))
                )}
                <i />
              </div>
              {progress >= 18 && (
                <div className="build-result">
                  <img
                    src="/demo/salon-noir-detail-2.webp"
                    alt="Salon-Beispiel"
                  />
                  <div>
                    <strong>NOIR Haarstudio</strong>
                    <span>Friseursalon · Beispielbetrieb</span>
                  </div>
                  <Check size={20} />
                </div>
              )}
            </div>
          ) : step === 2 ? (
            <div className="build-google">
              <div className="build-google-brand" aria-label="Google">
                {Array.from("Google").map((letter, i) => (
                  <span key={i}>{letter}</span>
                ))}
              </div>
              <div className="build-google-query">
                <Search size={17} />
                <span>
                  {"NOIR Haarstudio".slice(
                    0,
                    Math.min(15, Math.floor((progress - 72) * 1.5))
                  )}
                </span>
                <i aria-hidden="true" />
              </div>
              <div className="build-google-tabs">
                <strong>Alle</strong>
                <span>Bilder</span>
                <span>Maps</span>
              </div>
              <div
                className="build-google-hit"
                style={{ visibility: progress >= 84 ? "visible" : "hidden" }}
              >
                <div className="build-google-source">
                  <span>N</span>
                  <div>
                    <strong>NOIR Haarstudio</strong>
                    <small>noir-haarstudio.pageblitz.de</small>
                  </div>
                  <Check size={16} />
                </div>
                <h3>NOIR Haarstudio – Handwerk für Haar.</h3>
                <p>
                  Dein Salon für Schnitt, Farbe und deinen eigenen Stil.
                  Entdecke unser Studio und finde deinen nächsten Termin.
                </p>
                <div className="build-google-links">
                  <span>Leistungen</span>
                  <span>Galerie</span>
                  <span>Termin buchen</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="build-result-site">
              <div className="build-skeleton" aria-hidden="true">
                <div />
                <div />
                <div />
                <div />
              </div>
              <img
                className="build-site-image"
                src="/landing/salon-noir.webp"
                alt="Beispiel eines fertigen Website-Entwurfs"
                style={{
                  clipPath: "inset(0 var(--build-clip, 100%) 0 0)",
                }}
              />
              <span className="build-site-caption">
                Dein Design nimmt Form an …
              </span>
            </div>
          )}
        </div>
        <p className="build-note">
          Beispielhafte Darstellung. Die Google-Aufnahme erfolgt nicht sofort;
          Zeitpunkt und Platzierung bestimmt Google.
        </p>
      </div>
    </section>
  );
}

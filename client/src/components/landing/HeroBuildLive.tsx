import React, { useEffect, useRef, useState } from "react";

/**
 * Hero-Bühne „Website entsteht" (Nachtschicht-Relaunch 2026-08-29, Spec §3):
 * Firmenname wird getippt → Google-Profil-Chips fliegen ein → die Website
 * baut sich aus einem Skeleton auf → „LIVE" mit eigener Subdomain. Ersetzt
 * den Remotion-Film: reine CSS-Phasen (`.lpb`-Block in index.css, Zustände
 * über `data-phase="0…4"`) plus eine setTimeout-Timeline. Kein Bild im
 * LCP-Pfad — der Frame-Inhalt ist die Werkbank-Demo als HTML/CSS.
 *
 * Demo-Betrieb fiktiv („Trattoria Lucia", identisch zur Gusto-Demo in
 * shared/siteContract/fixtures.ts); die Chip-Zahlen sind Demo-Daten,
 * kein Pageblitz-Eigenlob.
 */

export const DEMO_NAME = "Trattoria Lucia";
const TYPE_START = 420;
const TYPE_MS = 55;

/** Millisekunden ab Zyklusstart, an denen die Phasen 2–4 und der Loop feuern. */
export function phaseSchedule(nameLength: number): {
  phase2: number;
  phase3: number;
  phase4: number;
  loop: number;
} {
  const typed = TYPE_START + nameLength * TYPE_MS;
  return {
    phase2: typed + 350,
    phase3: typed + 2350,
    phase4: typed + 4950,
    loop: typed + 7750,
  };
}

export interface HeroTimeline {
  start: () => void;
  stop: () => void;
}

/**
 * Timer-Timeline getrennt von React, damit sie in der node-Testumgebung mit
 * Fake-Timern prüfbar ist. `start()` beginnt einen Zyklus (und setzt einen
 * laufenden zurück), `stop()` räumt alle Timer ab.
 */
export function createHeroTimeline({
  name,
  onType,
  onPhase,
}: {
  name: string;
  onType: (typed: string) => void;
  onPhase: (phase: number) => void;
}): HeroTimeline {
  let timers: ReturnType<typeof setTimeout>[] = [];
  const at = (ms: number, fn: () => void) => {
    timers.push(setTimeout(fn, ms));
  };
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const cycle = () => {
    onType("");
    onPhase(1);
    for (let i = 0; i < name.length; i++) {
      const upto = i + 1;
      at(TYPE_START + i * TYPE_MS, () => onType(name.slice(0, upto)));
    }
    const s = phaseSchedule(name.length);
    at(s.phase2, () => onPhase(2));
    at(s.phase3, () => onPhase(3));
    at(s.phase4, () => onPhase(4));
    at(s.loop, () => {
      clear();
      cycle();
    });
  };
  return {
    start() {
      clear();
      cycle();
    },
    stop() {
      clear();
    },
  };
}

const CHIPS = [
  "★ 4,8 · 214 Bewertungen",
  "18 Fotos",
  "Öffnungszeiten",
  "Adresse & Karte",
];

export function HeroBuildLive() {
  // SSR/erster Paint: Phase 1 (Suchfeld sichtbar, Frame als Skeleton).
  const [phase, setPhase] = useState(1);
  const [typed, setTyped] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(DEMO_NAME);
      setPhase(4);
      return;
    }
    const timeline = createHeroTimeline({
      name: DEMO_NAME,
      onType: setTyped,
      onPhase: setPhase,
    });
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window && rootRef.current) {
      // Außerhalb des Viewports pausieren (Akku/CPU); beim Wiedereintritt
      // startet der Zyklus von vorn — die Geschichte beginnt am Anfang.
      io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) timeline.start();
            else timeline.stop();
          });
        },
        { threshold: 0.2 }
      );
      io.observe(rootRef.current);
    } else {
      timeline.start();
    }
    return () => {
      io?.disconnect();
      timeline.stop();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="lpb"
      data-phase={phase}
      role="img"
      aria-label="Animation: Aus dem Google-Profil der Trattoria Lucia entsteht Schritt für Schritt eine fertige Restaurant-Website — bis sie live ist."
    >
      <div className="lpb-search" aria-hidden="true">
        <span className="lpb-g">G</span>
        <span className="lpb-typed">{typed}</span>
        <span className="lpb-caret" />
      </div>

      <div className="lpb-chips" aria-hidden="true">
        {CHIPS.map(chip => (
          <span key={chip}>{chip}</span>
        ))}
      </div>

      <div className="lpb-frame" aria-hidden="true">
        <div className="lpb-bar">
          <span className="lpb-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="lpb-url">
            <span className="lpb-u1">pageblitz.de/studio</span>
            <span className="lpb-u2">trattoria-lucia.pageblitz.de</span>
          </span>
        </div>
        <div className="lpb-site">
          <div className="lpb-skel">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="lpb-snav">
            <b>Trattoria Lucia</b>
            <span>
              <span>Speisekarte</span>
              <span>Abende</span>
              <span>Kontakt</span>
            </span>
          </div>
          <div className="lpb-shero">
            <div className="lpb-sh1">
              <span className="lpb-l">Ein Tisch.</span>
              <span className="lpb-l">Ein Abend.</span>
              <span className="lpb-l lpb-l-accent">Italien.</span>
            </div>
            <div className="lpb-simg">
              <img
                src="/demo/gusto-hero.webp"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="lpb-srow">
            <span className="lpb-scta">Tisch reservieren</span>
            <span className="lpb-sstars">
              <b>★★★★★</b>&nbsp;4,8 bei Google
            </span>
          </div>
        </div>
      </div>

      <span className="lpb-live" aria-hidden="true">
        <i />
        LIVE
      </span>
    </div>
  );
}

export default HeroBuildLive;

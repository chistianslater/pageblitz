import { gsap } from "gsap";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Check,
  SlidersHorizontal,
  MousePointer2,
} from "lucide-react";
import {
  Logo,
  StartForm,
  DemoLink,
  Price,
  Questions,
  IndustryLinks,
  Footer,
} from "./shared";
import { startHref } from "@/components/landing/primitives";
import ClearFeatures from "./ClearFeatures";
import TypingStart from "./TypingStart";
import BuildStory from "./BuildStory";
import "./clear-flow.css";
const choices = [
  { label: "Salon & Beauty", pack: "salon-noir", name: "NOIR Haarstudio" },
  { label: "Restaurant & Café", pack: "gusto", name: "Trattoria Lucia" },
  { label: "Architektur & Planung", pack: "raster", name: "Studio Raster" },
];
function EditingDemo() {
  const root = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [value, setValue] = useState("Mo–Fr · 09:00–17:00");
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched) return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let tick = 0;
    const stop = () => clearInterval(timer);
    const sync = () => {
      if (mq.matches) {
        stop();
        setFrame(60);
        setValue("Mo–Fr · 09:00–18:00");
      }
    };
    sync();
    const observer = new IntersectionObserver(
      ([entry]) => {
        stop();
        if (!entry.isIntersecting || mq.matches || tick >= 60) return;
        timer = setInterval(() => {
          if (document.hidden) return;
          tick++;
          setFrame(tick);
          if (tick >= 18 && tick < 28)
            setValue("Mo–Fr · 09:00–17:00".slice(0, 18 - (tick - 17)));
          if (tick >= 28)
            setValue(
              "Mo–Fr · 09:00–18:00".slice(
                0,
                Math.min("Mo–Fr · 09:00–18:00".length, 8 + tick - 28)
              )
            );
          if (tick >= 60) stop();
        }, 80);
      },
      { threshold: 0.5 }
    );
    if (root.current) observer.observe(root.current);
    mq.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, [touched]);
  return (
    <div
      ref={root}
      className="clear-edit-demo"
      data-edit-step={
        touched ? "manual" : frame < 12 ? "move" : frame < 45 ? "type" : "done"
      }
      aria-label="Beispiel: Öffnungszeiten bearbeiten"
    >
      <div className="clear-edit-top">
        <span>DEINE WEBSITE / INHALTE</span>
        <span>Interaktives Beispiel</span>
      </div>
      <div className="clear-edit-photo">
        <img
          src="/demo/gusto-detail-1.webp"
          alt="Gericht als Beispiel für ein eigenes Website-Foto"
          loading="lazy"
        />
        <span>Dein Bild</span>
      </div>
      <div className="clear-edit-field">
        <label htmlFor="demo-hours">Öffnungszeiten</label>
        <input
          id="demo-hours"
          value={value}
          onFocus={() => setTouched(true)}
          onPointerDown={() => setTouched(true)}
          onChange={e => {
            setTouched(true);
            setValue(e.target.value);
          }}
        />
        <MousePointer2 size={22} aria-hidden="true" />
      </div>
      <p>
        <Check size={15} />
        {touched
          ? "Deine Änderung – nur in diesem Beispiel."
          : frame >= 45
            ? "Öffnungszeiten aktualisiert. So einfach geht’s."
            : "Ins Feld klicken. Text ändern. Fertig."}
      </p>
    </div>
  );
}
export default function Klarstart() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const rotationElapsed = useRef(0);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || focused || reduced) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (!document.hidden)
        rotationElapsed.current += Math.min(now - last, 100);
      last = now;
      root.current?.style.setProperty(
        "--choice-progress",
        String(Math.min(1, rotationElapsed.current / 3500))
      );
      if (rotationElapsed.current >= 3500) {
        rotationElapsed.current = 0;
        setActive(i => (i + 1) % choices.length);
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, focused, reduced, active]);
  useEffect(() => {
    const elements = root.current?.querySelectorAll(
      "main > section, .cf-section, .cf-foundation"
    );
    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          entry.target.classList.toggle("clear-in-view", entry.isIntersecting);
          if (
            entry.isIntersecting &&
            !entry.target.classList.contains("clear-seen")
          ) {
            entry.target.classList.add("clear-seen");
            if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
              gsap.fromTo(
                entry.target,
                { y: 24 },
                {
                  y: 0,
                  duration: 0.65,
                  ease: "power2.out",
                  clearProps: "transform",
                }
              );
            }
          }
        }),
      { threshold: 0.12 }
    );
    elements?.forEach(el => observer.observe(el));
    return () => {
      observer.disconnect();
      elements?.forEach(el => gsap.killTweensOf(el));
    };
  }, []);
  const item = choices[active];
  return (
    <div ref={root} className="concept concept-clear clear-evolved" id="top">
      <nav className="clear-nav lc-width">
        <Logo />
        <div>
          <a href="#entdecken">Beispiele</a>
          <a href="#ablauf">So geht’s</a>
          <a href="#funktionen">Funktionen</a>
          <a href="#preise">Preise</a>
        </div>
        <span className="clear-nav-actions">
          {/* Bestandskunden: echte Route (/login, Magic-Link + Google), also
              ein normaler Link — kein Hash-Scroll wie die Nav-Punkte. Bleibt
              mobil sichtbar, wo die Nav-Punkte ausgeblendet werden. */}
          <a className="clear-nav-login" href="/login">
            Anmelden
          </a>
          {/* Fuehrt in den Funnel, nicht zum Formular am Seitenende: wer oben
              klickt, will anfangen — nicht scrollen. /start ohne ?name= zeigt
              dort die eigene Betriebssuche. */}
          <a className="lc-button" href={startHref(true)}>
            Kostenlos starten <ArrowRight size={16} />
          </a>
        </span>
      </nav>
      <main>
        <section className="clear-hero lc-width">
          <p className="lc-eyebrow">
            <span /> Deine Website. Mit KI für deinen Betrieb.
          </p>
          <h1>
            Deine Website?
            <br />
            <span>Schon fast fertig.</span>
          </h1>
          <p className="clear-intro">
            Du kennst deinen Betrieb. Unsere KI macht deine Website daraus.
            <br className="desktop-break" /> Mit Texten für dein Angebot, deinen
            Bildern und einem Design, das nach dir aussieht.
          </p>
          <TypingStart />
          <div
            className="clear-workspace"
            id="entdecken"
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={e => {
              if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
            }}
          >
            <aside>
              <div className="clear-workspace-label">
                <SlidersHorizontal size={16} /> Dein Auftritt beginnt hier
              </div>
              <h2>Was machst du?</h2>
              <p>
                Wähle eine Branche und entdecke, wie dein Auftritt aussehen
                könnte.
              </p>
              <div
                className="clear-choices"
                role="group"
                aria-label="Branchenbeispiel"
              >
                {choices.map((c, i) => (
                  <button
                    key={c.pack}
                    aria-pressed={i === active}
                    onClick={() => {
                      setActive(i);
                      rotationElapsed.current = 0;
                      root.current?.style.setProperty("--choice-progress", "0");
                      setPaused(true);
                    }}
                  >
                    <span className="clear-choice-dot" />
                    {c.label}
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
              {!reduced && (
                <button
                  className="clear-rotation"
                  onClick={() => setPaused(p => !p)}
                  aria-pressed={paused}
                >
                  {paused
                    ? "▶ Automatischen Wechsel starten"
                    : "Ⅱ Automatischen Wechsel pausieren"}
                </button>
              )}
              <div className="clear-choice-note">
                <Check size={18} />
                <p>
                  Deine Farben, deine Schriften, deine Inhalte. Du bestimmst den
                  letzten Schliff.
                </p>
              </div>
            </aside>
            <div className="clear-preview">
              <div className="clear-browser">
                <span>● ● ●</span>
                <span>{item.name} · Beispielwebsite</span>
                <span>↗</span>
              </div>
              <a
                href={`/demo/${item.pack}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Demo ${item.name} öffnen`}
              >
                <img
                  key={item.pack}
                  src={`/landing/${item.pack}.webp`}
                  alt={`Pageblitz-Beispielwebsite ${item.name}`}
                  width="1200"
                  height="833"
                />
              </a>
              <div className="clear-preview-foot">
                <span>
                  <i /> Mit Pageblitz gestaltet
                </span>
                <DemoLink id={item.pack}>Live ansehen</DemoLink>
              </div>
            </div>
          </div>
          <div className="clear-benefit-strip">
            <span>
              <Check size={16} /> Ohne Programmieren
            </span>
            <span>
              <Check size={16} /> Für Handy & Desktop
            </span>
            <span>
              <Check size={16} /> Entwurf kostenlos
            </span>
            <span>
              <Check size={16} /> Hosting inklusive
            </span>
          </div>
        </section>
        <BuildStory />
        <section className="clear-control">
          <div className="lc-width clear-control-grid">
            <div>
              <p className="lc-eyebrow">Deine Website bleibt deine Website</p>
              <h2>
                Neue Öffnungszeiten?
                <br />
                Änderst du einfach selbst.
              </h2>
              <p>
                Du brauchst für jede Kleinigkeit weder eine Agentur noch einen
                Kurs. Im Designstudio bearbeitest du Texte und Bilder direkt –
                oder lässt dir von der KI helfen.
              </p>
              <ul>
                <li>
                  <Check size={17} /> Texte und Bilder jederzeit anpassen
                </li>
                <li>
                  <Check size={17} /> Farben und Schriften selbst wählen
                </li>
                <li>
                  <Check size={17} /> Änderungen in der Vorschau prüfen
                </li>
              </ul>
            </div>
            <EditingDemo />
          </div>
        </section>
        <ClearFeatures />
        <section className="clear-pricing lc-width" id="preise">
          <div>
            <p className="lc-eyebrow">Transparent von Anfang an</p>
            <h2>
              Erst überzeugt.
              <br />
              Dann bezahlt.
            </h2>
            <p>
              Deine Vorschau kostet nichts. Für den laufenden Betrieb wählst du
              deinen Tarif und nur die Extras, die du wirklich brauchst.
            </p>
            <div className="clear-price-note">
              <strong>Die Basis ist schon dabei.</strong>
              <p>
                Kein separates Hosting suchen. Kein SSL einrichten. Kein Honorar
                für jede Textänderung.
              </p>
            </div>
          </div>
          <Price />
        </section>
        <section className="clear-questions lc-width">
          <h2>Noch eine Frage?</h2>
          <Questions />
        </section>
        <section className="clear-final" id="start">
          <div className="lc-width">
            <p className="lc-eyebrow">
              Der erste Schritt dauert nur einen Moment
            </p>
            <h2>
              Wie würde deine
              <br />
              neue Website aussehen?
            </h2>
            <StartForm id="clear-business" />
          </div>
        </section>
      </main>
      <div className="lc-width">
        <IndustryLinks />
        <Footer />
      </div>
    </div>
  );
}

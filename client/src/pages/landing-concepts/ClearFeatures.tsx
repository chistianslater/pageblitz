import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  Check,
  ArrowRight,
  MessageCircle,
  CalendarDays,
  Globe,
  LockKeyhole,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ADDON_NAMES,
  addonPrice,
  formatEuro,
  type AddOnKey,
} from "@shared/pricing";
import { LANDING_FEATURES as features } from "@shared/landingFeatures";
const galleryPhotos = [
  "salon-noir-hero",
  "salon-noir-detail-1",
  "salon-noir-detail-2",
  "salon-noir-detail-3",
];
function IllustratedGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected !== null && !dialog.current?.open) dialog.current?.showModal();
  }, [selected]);
  return (
    <div className="cf-real-gallery">
      <div className="cf-gallery-heading">
        <span>NOIR / EINBLICKE</span>
        <span>Beispielgalerie</span>
      </div>
      <h3>Ein Gefühl für deinen Stil.</h3>
      <div className="cf-photo-wall">
        {galleryPhotos.map((src, i) => (
          <button
            key={src}
            onClick={() => setSelected(i)}
            aria-label={`Galeriebild ${i + 1} in Großansicht öffnen`}
          >
            <img
              src={`/demo/${src}.webp`}
              alt={`Salon-Einblick ${i + 1}`}
              loading="lazy"
            />
            <span>
              0{i + 1} <ArrowUpRight size={16} />
            </span>
          </button>
        ))}
      </div>
      <p>Bilder öffnen und durch die Galerie blättern.</p>
      <dialog
        ref={dialog}
        className="cf-lightbox"
        onClose={() => setSelected(null)}
        onClick={e => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onKeyDown={e => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            setSelected(i => ((i ?? 0) + 1) % galleryPhotos.length);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setSelected(
              i => ((i ?? 0) + galleryPhotos.length - 1) % galleryPhotos.length
            );
          }
        }}
        aria-label="Galerie-Großansicht"
      >
        <button
          className="cf-lightbox-close"
          onClick={() => dialog.current?.close()}
          aria-label="Großansicht schließen"
        >
          <X />
        </button>
        {selected !== null && (
          <img
            src={`/demo/${galleryPhotos[selected]}.webp`}
            alt={`Salon-Einblick ${selected + 1} in Großansicht`}
          />
        )}
        <div>
          <button
            onClick={() => setSelected(i => ((i ?? 0) + 3) % 4)}
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft />
          </button>
          <span>{(selected ?? 0) + 1} / 4</span>
          <button
            onClick={() => setSelected(i => ((i ?? 0) + 1) % 4)}
            aria-label="Nächstes Bild"
          >
            <ChevronRight />
          </button>
        </div>
      </dialog>
    </div>
  );
}
function FeatureVisual({ id }: { id: AddOnKey }) {
  return (
    <div className={`cf-visual cf-kind-${id}`}>
      <Example id={id} />
    </div>
  );
}
function AnimatedChat() {
  const root = useRef<HTMLDivElement>(null);
  const [letters, setLetters] = useState(0);
  const question = "Kann ich bei euch einen Termin vereinbaren?";
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let count = 0;
    const stop = () => clearInterval(timer);
    const sync = () => {
      if (motion.matches) {
        stop();
        count = question.length + 12;
        setLetters(count);
      }
    };
    sync();
    const observer = new IntersectionObserver(
      ([entry]) => {
        stop();
        if (
          !entry.isIntersecting ||
          motion.matches ||
          count >= question.length + 12
        )
          return;
        timer = setInterval(() => {
          if (!document.hidden) {
            count++;
            setLetters(count);
            if (count >= question.length + 12) stop();
          }
        }, 65);
      },
      { threshold: 0.5 }
    );
    if (root.current) observer.observe(root.current);
    motion.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      motion.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div className="cf-chat" ref={root}>
      <header>
        <MessageCircle size={18} />
        <div>
          Dein Betrieb<small>KI-Chat · Beispiel</small>
        </div>
      </header>
      <p className="cf-message">Hallo! Wie kann ich dir helfen?</p>
      <p className="cf-message cf-user">
        {question.slice(0, letters)}
        {letters < question.length && <span aria-hidden="true">▍</span>}
      </p>
      <p className="cf-message cf-answer">
        {letters >= question.length + 12 ? (
          "Gerne. Über unsere Terminbuchung kannst du eine passende Uhrzeit auswählen."
        ) : (
          <span aria-label="Antwort wird vorbereitet">•••</span>
        )}
      </p>
      <span className="cf-chat-bottom">
        Eine erste Antwort. Ein klarer nächster Schritt.
        <ArrowRight size={16} />
      </span>
    </div>
  );
}
function Example({ id }: { id: AddOnKey }) {
  const [choice, setChoice] = useState(0);
  const [sent, setSent] = useState(false);
  const [day, setDay] = useState(2);
  const [bookingTouched, setBookingTouched] = useState(false);
  const bookingRoot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (id !== "booking" || bookingTouched) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let frame = 0;
    const stop = () => clearInterval(timer);
    const observer = new IntersectionObserver(
      ([entry]) => {
        stop();
        if (!entry.isIntersecting || motion.matches || frame >= 4) return;
        timer = setInterval(() => {
          if (document.hidden) return;
          frame++;
          setDay(frame < 3 ? 3 : 4);
          setChoice(frame < 2 ? 0 : frame < 4 ? 1 : 2);
          if (frame >= 4) stop();
        }, 1000);
      },
      { threshold: 0.6 }
    );
    const motionChanged = () => {
      if (motion.matches) stop();
    };
    motion.addEventListener("change", motionChanged);
    if (bookingRoot.current) observer.observe(bookingRoot.current);
    return () => {
      stop();
      observer.disconnect();
      motion.removeEventListener("change", motionChanged);
    };
  }, [id, bookingTouched]);
  if (id === "gallery") return <IllustratedGallery />;
  if (id === "booking")
    return (
      <div
        className="cf-book"
        ref={bookingRoot}
        onPointerDown={() => setBookingTouched(true)}
        onFocusCapture={() => setBookingTouched(true)}
      >
        <div className="cf-book-scene">
          <img
            src="/demo/salon-noir-detail-2.webp"
            alt="Atmosphäre im Friseursalon"
            loading="lazy"
          />
          <span>NOIR / DEIN TERMIN</span>
        </div>
        <CalendarDays />
        <h3>Dein nächster Besuch.</h3>
        <p>Schnitt & Styling · 45 Minuten · Beispiel</p>
        <div className="cf-days">
          {["MO", "DI", "MI", "DO", "FR"].map((d, i) => (
            <button
              type="button"
              key={d}
              className={i === day ? "chosen" : ""}
              aria-pressed={i === day}
              onClick={() => {
                setBookingTouched(true);
                setDay(i);
              }}
            >
              {d}
              <strong>{12 + i}</strong>
            </button>
          ))}
        </div>
        <div className="cf-slots">
          {["09:00", "10:30", "14:00"].map((s, i) => (
            <button
              key={s}
              aria-pressed={i === choice}
              onClick={() => setChoice(i)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="cf-confirm">
          <Check size={16} /> {["09:00", "10:30", "14:00"][choice]} ausgewählt ·
          Beispiel, keine Buchung
        </div>
      </div>
    );
  if (id === "aiChat") return <AnimatedChat />;
  if (id === "contactForm")
    return (
      <form
        className="cf-contact flow-contact-form"
        onSubmit={e => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <p className="cf-small">PROBIER ES AUS · ES WIRD NICHTS VERSENDET</p>
        <h3>Erzähl uns von deinem Vorhaben.</h3>
        <label>
          Dein Name
          <input
            autoComplete="off"
            placeholder="Wie dürfen wir dich nennen?"
            required
          />
        </label>
        <label>
          Deine E-Mail-Adresse
          <input
            type="email"
            autoComplete="off"
            placeholder="hallo@beispiel.de"
            required
          />
        </label>
        <label>
          Was hast du vor?
          <textarea
            placeholder="Ich interessiere mich für …"
            rows={3}
            required
          />
        </label>
        <button className="cf-solid" type="submit">
          Beispiel-Anfrage ausprobieren <ArrowUpRight size={18} />
        </button>
        <p role="status" className="flow-form-status">
          {sent
            ? "So einfach kann Kontakt sein. Diese Beispiel-Anfrage wurde nicht versendet."
            : "Ein kurzer Weg vom ersten Interesse zum persönlichen Gespräch."}
        </p>
      </form>
    );
  if (id === "menu")
    return (
      <div className="cf-menu">
        <img
          src="/demo/gusto-hero.webp"
          alt="Pasta als Beispielgericht"
          loading="lazy"
        />
        <div>
          <span className="cf-small">TRATTORIA / BEISPIEL</span>
          <h3>Heute wird’s gut.</h3>
          <div className="cf-tabs">
            {["Speisen", "Getränke"].map((s, i) => (
              <button
                key={s}
                onClick={() => setChoice(i)}
                aria-pressed={i === choice}
              >
                {s}
              </button>
            ))}
          </div>
          {(choice === 0
            ? [
                ["Pasta della casa", "16,50 €"],
                ["Burrata & Tomate", "12,00 €"],
                ["Tiramisù", "7,50 €"],
              ]
            : [
                ["Espresso", "2,80 €"],
                ["Hausgemachte Limonade", "5,50 €"],
                ["Mineralwasser", "3,50 €"],
              ]
          ).map(r => (
            <p key={r[0]}>
              {r[0]}
              <strong>{r[1]}</strong>
            </p>
          ))}
        </div>
      </div>
    );
  if (id === "pricelist")
    return (
      <div className="cf-list">
        <span className="cf-small">LEISTUNGEN / BEISPIELPREISE</span>
        <h3>
          Ein guter Schnitt.
          <br />
          Ein klarer Preis.
        </h3>
        {[
          ["Schnitt & Styling", "ab 49 €"],
          ["Farbe & Pflege", "ab 79 €"],
          ["Beratung", "auf Anfrage"],
        ].map((r, i) => (
          <div key={r[0]}>
            <span>0{i + 1}</span>
            <p>{r[0]}</p>
            <strong>{r[1]}</strong>
          </div>
        ))}
      </div>
    );
  if (id === "team")
    return (
      <div className="flow-people">
        <figure>
          <img
            src="/demo/salon-noir-detail-3.webp"
            alt="Porträt als Beispiel für eine persönliche Teamvorstellung"
            loading="lazy"
          />
          <figcaption>
            <strong>Die Menschen.</strong>
            <span>Eine persönliche Vorstellung</span>
          </figcaption>
        </figure>
        <figure>
          <img
            src="/demo/salon-noir-hero.webp"
            alt="Menschen bei der Arbeit im Salon"
            loading="lazy"
          />
          <figcaption>
            <strong>Das Können.</strong>
            <span>Zeig, was euch ausmacht</span>
          </figcaption>
        </figure>
        <figure>
          <img
            src="/demo/salon-noir-detail-2.webp"
            alt="Einblicke in die Räume des Salons"
            loading="lazy"
          />
          <figcaption>
            <strong>Euer Ort.</strong>
            <span>Schon vor dem Besuch vertraut</span>
          </figcaption>
        </figure>
        <p>
          Beispielbilder · Hier bekommen dein Team, eure Namen und eure Aufgaben
          ihren Platz.
        </p>
      </div>
    );
  return (
    <div className="flow-pages">
      <div
        className="flow-page-tabs"
        role="group"
        aria-label="Beispiel-Unterseite auswählen"
      >
        {["Startseite", "Leistungen", "Unser Studio"].map((name, i) => (
          <button
            key={name}
            aria-pressed={choice === i}
            onClick={() => setChoice(i)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flow-page-stack">
        {[
          {
            name: "Ein erster Eindruck.",
            image: "salon-noir-hero",
            text: "Dein Betrieb auf einen Blick.",
          },
          {
            name: "Mehr als ein guter Schnitt.",
            image: "salon-noir-detail-1",
            text: "Raum für jede einzelne Leistung.",
          },
          {
            name: "Hier bist du richtig.",
            image: "salon-noir-detail-2",
            text: "Zeig deinen Ort und deine Geschichte.",
          },
        ].map((page, i) => (
          <article key={page.name} className={choice === i ? "is-front" : ""}>
            <span>NOIR STUDIO / BEISPIELSEITE 0{i + 1}</span>
            <img
              src={`/demo/${page.image}.webp`}
              alt={page.text}
              loading="lazy"
            />
            <h3>{page.name}</h3>
            <p>{page.text}</p>
          </article>
        ))}
      </div>
      <a
        href="/demo/salon-noir"
        target="_blank"
        rel="noopener noreferrer"
        className="lc-link"
      >
        Vollständigen Beispiel-Auftritt öffnen <ArrowUpRight size={17} />
      </a>
    </div>
  );
}
function FeatureCopy({ id }: { id: AddOnKey }) {
  const f = features.find(f => f.id === id)!;
  return (
    <div className="cf-copy">
      <p className="lc-eyebrow">{ADDON_NAMES[id]}</p>
      <h2>{f.title}</h2>
      <p>{f.text}</p>
      <span className="cf-cost">
        Optional · + {formatEuro(addonPrice(id))}/Monat
      </span>
    </div>
  );
}

/**
 * Die Funktions-Buttons bleiben beim Scrollen unter der Navigation kleben,
 * solange man sich in der Feature-Bühne befindet (Betreiber-Wunsch
 * 2026-09-17: hoch- und runterscrollen, ohne für den nächsten Klick wieder
 * nach oben zu müssen). Der Sentinel liegt direkt über der Leiste; sobald er
 * unter der Nav verschwindet, ist die Leiste „stuck" und bekommt Hintergrund
 * und Schatten.
 */
function useStickyPicker(offsetPx: number) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Der Root ist oben um die Nav-Höhe verkleinert: Der Sentinel verlässt
    // ihn also bereits bei `offsetPx`, nicht erst bei 0.
    const observer = new IntersectionObserver(
      ([entry]) =>
        setIsStuck(
          !entry.isIntersecting && entry.boundingClientRect.top < offsetPx
        ),
      { rootMargin: `-${offsetPx}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [offsetPx]);
  return { sentinel, isStuck };
}

/** Fallback, falls die Nav (noch) nicht im DOM ist — Desktop-Höhe laut clear-flow.css. */
const NAV_OFFSET_FALLBACK = 71;
const NAV_SELECTOR = ".clear-nav";

/** Misst die klebende Navigation live, damit der Sticky-Offset auch bei
 *  CSS-Änderungen oder Breakpoint-Wechseln stimmt. */
function useNavOffset() {
  const [offset, setOffset] = useState(NAV_OFFSET_FALLBACK);
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(NAV_SELECTOR);
    if (!nav || typeof ResizeObserver === "undefined") return;
    const measure = () => setOffset(Math.round(nav.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);
  return offset;
}

export default function ClearFeatures() {
  const [activeFeature, setActiveFeature] = useState<AddOnKey>("gallery");
  const navOffset = useNavOffset();
  const { sentinel, isStuck } = useStickyPicker(navOffset);

  const selectFeature = (id: AddOnKey, button: HTMLButtonElement) => {
    setActiveFeature(id);
    // Auf Mobil ist die Leiste eine Scroll-Reihe: gewählten Button in die
    // Mitte rücken. Über scrollLeft statt scrollIntoView, weil letzteres
    // auch die Seite vertikal scrollt und die Leiste aus dem Blick reißt.
    const row = button.parentElement;
    if (row) {
      const left = button.offsetLeft - (row.clientWidth - button.offsetWidth) / 2;
      row.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
    // Steckt man bereits in der Bühne, springt die neue Funktion nach oben
    // in den Blick statt mitten in die alte Scrollposition. Ziel ist der
    // Sentinel: Er bleibt im normalen Fluss, die Leiste selbst meldet im
    // gestickten Zustand nur die Nav-Unterkante.
    const sentinelTop = sentinel.current?.getBoundingClientRect().top;
    if (sentinelTop !== undefined && sentinelTop < navOffset) {
      window.scrollTo({
        top: sentinelTop + window.scrollY - navOffset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="clear-features clear-features-flow" id="funktionen">
      <div className="lc-width cf-heading">
        <p className="lc-eyebrow">Eine Website, die dir Arbeit abnimmt</p>
        <h2>
          Alles, was dein Betrieb braucht.
          <br />
          Und nur das, was du möchtest.
        </h2>
        <p>
          Starte mit deiner Website. Ergänze die Funktionen, die zu deinem
          Alltag passen.
        </p>
      </div>

      <p className="lc-width cf-picker-hint">
        <ArrowRight size={18} aria-hidden="true" />
        <strong>Wähle eine Funktion. Probiere sie direkt darunter aus.</strong>
        <span>Optionale Extras · einzeln dazubuchbar</span>
      </p>
      <div className="cf-feature-stage">
        <div ref={sentinel} className="cf-picker-sentinel" aria-hidden="true" />
        <div
          className={`cf-feature-picker-bar${isStuck ? " is-stuck" : ""}`}
          style={{ top: navOffset }}
        >
          <div
            className="lc-width cf-feature-picker"
            role="group"
            aria-label="Funktion auswählen"
          >
            {features.map(feature => (
              <button
                key={feature.id}
                type="button"
                aria-pressed={activeFeature === feature.id}
                aria-controls={`feature-${feature.id}`}
                onClick={e => selectFeature(feature.id, e.currentTarget)}
              >
                <span>{ADDON_NAMES[feature.id]}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      <section
        className="cf-section flow-gallery"
        id="feature-gallery"
        hidden={activeFeature !== "gallery"}
      >
        <div className="lc-width">
          <FeatureCopy id="gallery" />
          <FeatureVisual id="gallery" />
        </div>
      </section>
      <section
        className="cf-section flow-booking"
        id="feature-booking"
        hidden={activeFeature !== "booking"}
      >
        <div className="lc-width flow-booking-layout">
          <figure className="flow-booking-photo">
            <img
              src="/demo/salon-noir-detail-2.webp"
              alt="Die Atmosphäre im Salon"
              loading="lazy"
            />
            <figcaption>Hier beginnt dein nächster Besuch.</figcaption>
          </figure>
          <FeatureCopy id="booking" />
          <FeatureVisual id="booking" />
          <span className="flow-side-note">
            DEIN SALON. DEIN TERMIN. DEIN MOMENT.
          </span>
        </div>
      </section>
      <section
        className="cf-section flow-chat"
        id="feature-aiChat"
        hidden={activeFeature !== "aiChat"}
      >
        <div className="lc-width">
          <FeatureCopy id="aiChat" />
          <div className="flow-chat-world">
            <img
              src="/demo/werkbank-hero.webp"
              alt="Ein Betrieb, in dem gearbeitet wird, während die Website Fragen beantwortet"
              loading="lazy"
            />
            <div className="flow-chat-caption">
              <span>DEIN BETRIEB IST BESCHÄFTIGT.</span>
              <strong>
                Deine Website
                <br />
                hat ein offenes Ohr.
              </strong>
            </div>
            <FeatureVisual id="aiChat" />
          </div>
        </div>
      </section>
      <section
        className="cf-section flow-contact"
        id="feature-contactForm"
        hidden={activeFeature !== "contactForm"}
      >
        <div className="lc-width flow-contact-layout">
          <FeatureCopy id="contactForm" />
          <div className="flow-contact-arrow" aria-hidden="true">
            ↗
          </div>
          <FeatureVisual id="contactForm" />
        </div>
      </section>
      <section
        className="cf-section flow-menu"
        id="feature-menu"
        hidden={activeFeature !== "menu"}
      >
        <div className="lc-width">
          <FeatureCopy id="menu" />
          <FeatureVisual id="menu" />
        </div>
      </section>
      <section
        className="cf-section flow-prices"
        id="feature-pricelist"
        hidden={activeFeature !== "pricelist"}
      >
        <div className="lc-width">
          <FeatureCopy id="pricelist" />
          <FeatureVisual id="pricelist" />
          <img
            className="flow-price-photo"
            src="/demo/salon-noir-detail-1.webp"
            alt="Ein Detail der handwerklichen Arbeit im Salon"
            loading="lazy"
          />
        </div>
      </section>
      <section
        className="cf-section flow-team"
        id="feature-team"
        hidden={activeFeature !== "team"}
      >
        <div className="lc-width">
          <FeatureCopy id="team" />
          <FeatureVisual id="team" />
        </div>
      </section>
      <section
        className="cf-section flow-subpages"
        id="feature-subpages"
        hidden={activeFeature !== "subpages"}
      >
        <div className="lc-width">
          <FeatureCopy id="subpages" />
          <FeatureVisual id="subpages" />
        </div>
      </section>
      </div>
      <section className="cf-foundation">
        <div className="lc-width cf-grid">
          <div className="cf-copy">
            <p className="lc-eyebrow">Schon in der Basis enthalten</p>
            <h2>
              Die Technik läuft.
              <br />
              Du machst dein Geschäft.
            </h2>
            <p>
              Hosting, SSL und ein Design für Handy und Desktop gehören dazu.
              Verbinde deine eigene Domain oder starte mit einer
              Pageblitz-Subdomain.
            </p>
            <span className="cf-cost">Website-Basis · Inklusive</span>
          </div>
          <div className="cf-foundation-visual">
            <LockKeyhole size={40} />
            <strong>Ein Zuhause für deine Website.</strong>
            <div>
              <span>Hosting</span>
              <Check />
            </div>
            <div>
              <span>SSL-Verschlüsselung</span>
              <Check />
            </div>
            <div>
              <span>Handy & Desktop</span>
              <Check />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

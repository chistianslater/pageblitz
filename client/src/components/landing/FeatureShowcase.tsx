import React from "react";
import { addonPrice, formatEuro, type AddOnKey } from "@shared/pricing";
import { SectionHead, textLink } from "./primitives";

/**
 * Feature-Bühnen (Conversion-Pass 2, User-Entscheid 2026-08-25, „C"):
 * Die emotional stärksten Extras bekommen systematische Funktionsschemata
 * statt eines wilden Mixes aus Screenshot, Crop und Diagramm. Jede Karte
 * folgt derselben Hierarchie: Kicker → Strukturzeichnung → Nutzen → kurzer
 * Beleg. Das wirkt hochwertiger und macht die Sektion deutlich kürzer.
 *
 * Bewusst nur drei von acht Extras — der Rest bleibt Preisliste, sonst
 * wird die Seite zur Tapete und das Hauptziel (kostenlose Vorschau)
 * verdünnt.
 *
 * Alle Zeichnungen sind pack-neutral und CSS-basiert: immer scharf, keine
 * Wiederholung der Hero-Website, kein Pflegeproblem bei neuen Templates.
 * Die Sektion liegt als dunkle Kontrastbühne zwischen hellen Inhaltsblöcken.
 */
/** KI-Kundenchat als Strukturzeichnung: Besucherfrage → automatische
    Antwort → Anfrage. Bewusst NICHT der Studio-KI-Chat zur Bearbeitung der
    Website — diese zwei Funktionen wurden im ersten Entwurf verwechselt
    (User-Korrektur 2026-08-25). */
function ChatSketch() {
  return (
    <div
      className="lps-sketch"
      role="img"
      aria-label="Animation des KI-Chats: Ein Website-Besucher stellt eine Frage und erhält sofort eine Antwort"
    >
      <div className="lpx-stage">
        <span className="lpx-chat-title">Chat mit deinem Betrieb</span>
        <p className="lpx-msg lpx-msg-a lpx-w1">
          Hallo! Wie kann ich Ihnen helfen?
        </p>
        <p className="lpx-msg lpx-msg-u lpx-w2">
          Bieten Sie auch Reparaturen an?
        </p>
        <span className="lpx-typing lpx-wt" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <p className="lpx-msg lpx-msg-a lpx-w4">
          Ja – wir reparieren Möbel und Türen. Möchten Sie direkt eine Anfrage
          senden?
        </p>
        <span className="lpx-chat-input">
          Nachricht schreiben …<b>↑</b>
        </span>
      </div>
    </div>
  );
}

const GALLERY_PHOTOS = [
  "/demo/gusto-hero.webp",
  "/demo/gusto-detail-1.webp",
  "/demo/gusto-detail-2.webp",
  "/demo/patina-detail-1.webp",
];

function GallerySketch() {
  return (
    <div
      className="lps-sketch"
      role="img"
      aria-label="Animation einer Bildergalerie: vier Projektfotos, eines öffnet sich als Großansicht"
    >
      <div className="lpx-gal">
        {/* Echte Fotos der Gusto-Demo (Trattoria Lucia) — dieselbe Bildwelt
            wie die Hero-Animation, keine Platzhalterflächen. */}
        {GALLERY_PHOTOS.map((src, i) => (
          <span key={src + i} className="lpx-ph">
            <img src={src} alt="" loading="lazy" decoding="async" />
          </span>
        ))}
        <span className="lpx-lb">
          <img
            className="lpx-lb-img"
            src="/demo/gusto-detail-1.webp"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="lpx-lb-bar">
            <span>Aus der Küche · 03/18</span>
            <b>×</b>
          </span>
        </span>
      </div>
    </div>
  );
}

function BookingSketch() {
  return (
    <div
      className="lps-sketch"
      role="img"
      aria-label="Animation einer Terminbuchung: Tag wählen, Uhrzeit auswählen, Termin bestätigt"
    >
      <div className="lpx-book">
        <div className="lpx-cal">
          <span className="lpx-cal-head" />
          <div className="lpx-cal-grid">
            {Array.from({ length: 21 }, (_, i) => (
              <i key={i} className={i === 11 ? "lpx-cal-day" : undefined} />
            ))}
          </div>
        </div>
        <div className="lpx-slots">
          <span className="lpx-slot">09:00</span>
          <span className="lpx-slot lpx-slot-active">10:30</span>
          <span className="lpx-slot">12:00</span>
          <span className="lpx-confirm lpx-w4">Termin bestätigt ✓</span>
        </div>
      </div>
    </div>
  );
}

const FEATURES: ReadonlyArray<{
  id: string;
  addon: AddOnKey;
  kicker: string;
  title: string;
  text: string;
  Diagram: () => React.JSX.Element;
  proof: string;
}> = [
  {
    id: "ki-chat",
    addon: "aiChat",
    kicker: "KI-Chat",
    title: "Antwortet deinen Kunden. Rund um die Uhr.",
    text: "Besucher fragen nach Leistungen, Preisen oder Öffnungszeiten und erhalten sofort eine passende Antwort.",
    Diagram: ChatSketch,
    proof: "Frage stellen → Antwort erhalten → Anfrage senden.",
  },
  {
    id: "galerie",
    addon: "gallery",
    kicker: "Bildergalerie",
    title: "Deine Arbeiten verdienen eine Bühne.",
    text: "Projekte und Referenzen als mobiloptimierte Galerie mit Großansicht. Wer sieht, was du kannst, fragt an.",
    Diagram: GallerySketch,
    proof: "Bilder antippen → groß ansehen → direkt anfragen.",
  },
  {
    id: "buchung",
    addon: "booking",
    kicker: "Terminbuchung",
    title: "Kunden buchen, während du arbeitest.",
    text: "Kunden wählen den passenden Zeitslot direkt auf deiner Website. Weniger Telefonate, kein Hin und Her.",
    Diagram: BookingSketch,
    proof: "Tag wählen → Uhrzeit auswählen → Termin bestätigt.",
  },
] as const;

export function FeatureShowcase() {
  return (
    <section
      aria-labelledby="lp-features-heading"
      className="lp-section lp-glowspot lp-glowspot--right border-t border-lp-line"
    >
      <div className="lp-container">
        <SectionHead
          id="lp-features-heading"
          kicker="Kann mehr"
          title="Deine Website ist kein Plakat. Sie arbeitet."
          text="Drei der stärksten Extras — systematisch erklärt. Alle Extras sind jederzeit zubuch- und kündbar."
        />
        {/* Jedes Extra bekommt eine eigene volle Bühne (User-Feedback
            2026-08-29: „mehr Raum, hochwertiger"): Demo groß auf der einen,
            Copy auf der anderen Seite, alternierend — Premium-Feature-Rhythmus
            statt dreier gequetschter Spalten. */}
        <div className="mt-14 flex flex-col gap-16 lg:mt-20 lg:gap-24">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.id}
              className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
            >
              <div
                className={`lg:col-span-6 xl:col-span-7 ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <feature.Diagram />
              </div>
              <div
                className={`lg:col-span-6 xl:col-span-5 ${
                  index % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                {/* Der Funktionsname muss sofort lesbar sein (User-Feedback
                    2026-08-29) — deutlich größer als ein Kicker, in Volt. */}
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-[family-name:var(--lp-mono)] text-[1rem] font-semibold uppercase tracking-[0.08em] text-lp-volt">
                    {feature.kicker}
                  </p>
                  <span className="rounded-full border border-lp-line px-2.5 py-1 font-[family-name:var(--lp-mono)] text-[0.66rem] font-medium tracking-[0.04em] text-lp-muted">
                    EXTRA · + {formatEuro(addonPrice(feature.addon))}/Monat
                  </span>
                </div>
                <h3 className="mt-3 max-w-[18ch] text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold leading-[1.08] tracking-[-0.025em] text-lp-ink">
                  {feature.title}
                </h3>
                <p className="mt-4 max-w-[28rem] text-[1.05rem] leading-[1.55] text-lp-muted">
                  {feature.text}
                </p>
                <p className="mt-6 border-t border-lp-line pt-4 font-[family-name:var(--lp-mono)] text-[0.78rem] font-medium tracking-[0.02em] text-lp-volt">
                  {feature.proof}
                </p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-12 text-[0.95rem] text-lp-muted">
          Alle Extras im Überblick —{" "}
          <a href="#pricing" className={textLink}>
            zu den Preisen
          </a>
          .
        </p>
      </div>
    </section>
  );
}

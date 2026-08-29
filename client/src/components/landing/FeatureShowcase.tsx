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
      aria-label="Schema des KI-Chats: Ein Website-Besucher stellt eine Frage und erhält sofort eine Antwort"
    >
      <div className="lps-chat">
        <span className="lps-chat-title">Chat mit deinem Betrieb</span>
        <p className="lps-msg-assistant">Hallo! Wie kann ich Ihnen helfen?</p>
        <p className="lps-msg-user">Bieten Sie auch Reparaturen an?</p>
        <p className="lps-msg-assistant">
          Ja – wir reparieren Möbel und Türen. Möchten Sie direkt eine Anfrage
          senden?
        </p>
        <span className="lps-chat-input">
          Nachricht schreiben …<b>↑</b>
        </span>
      </div>
    </div>
  );
}

function GallerySketch() {
  return (
    <div
      className="lps-sketch"
      role="img"
      aria-label="Schema einer Bildergalerie mit vier Bildern und geöffneter Großansicht"
    >
      <div className="lps-gallery">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`lps-gallery-img tone-${i + 1}`} />
        ))}
        <span className="lps-lightbox">
          <i className="lps-lightbox-img" />
          <b>×</b>
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
      aria-label="Schema einer Terminbuchung mit Kalender, Uhrzeiten und bestätigtem Termin"
    >
      <div className="lps-booking">
        <div className="lps-calendar">
          <span className="lps-cal-head" />
          <div className="lps-cal-grid">
            {Array.from({ length: 21 }, (_, i) => (
              <i
                key={i}
                data-active={i === 11 || undefined}
                data-muted={i < 3 || undefined}
              />
            ))}
          </div>
        </div>
        <div className="lps-slots">
          <span className="lps-slot-label" />
          <i>09:00</i>
          <i data-active>10:30</i>
          <i>12:00</i>
          <b>Termin bestätigen</b>
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
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <SectionHead
          id="lp-features-heading"
          kicker="Kann mehr"
          title="Deine Website ist kein Plakat. Sie arbeitet."
          text="Drei der stärksten Extras — systematisch erklärt. Alle Extras sind jederzeit zubuch- und kündbar."
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {FEATURES.map(feature => (
            <article key={feature.id} className="flex flex-col">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="lp-kicker">{feature.kicker}</p>
                <span className="rounded-full border border-lp-line px-2.5 py-1 font-[family-name:var(--lp-mono)] text-[0.66rem] font-medium tracking-[0.04em] text-lp-muted">
                  EXTRA · + {formatEuro(addonPrice(feature.addon))}
                </span>
              </div>
              <h3 className="text-[1.35rem] font-bold leading-[1.15] tracking-[-0.02em] text-lp-ink">
                {feature.title}
              </h3>
              <div className="mt-6">
                <feature.Diagram />
              </div>
              <p className="mt-5 flex-1 text-[0.98rem] leading-[1.5] text-lp-muted">
                {feature.text}
              </p>
              <p className="mt-5 border-t border-lp-line pt-4 text-[0.85rem] font-medium text-lp-volt">
                {feature.proof}
              </p>
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

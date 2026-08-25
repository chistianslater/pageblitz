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
/** Chat-Beweis als Strukturzeichnung statt Screenshot (User-Feedback
    2026-08-25: der hochskalierte Rail-Screenshot war unscharf und zeigte
    wieder dasselbe Pack). Neutrale Beispiel-Texte, kein Pack-Bezug. */
function ChatSketch() {
  return (
    <div
      className="lps-sketch"
      role="img"
      aria-label="Schema des KI-Chats: Wunsch eintippen, Vorschlag prüfen, mit einem Klick übernehmen"
    >
      <div className="lps-chat">
        <p className="lps-msg-user">„Mach die Überschrift knackiger"</p>
        <div className="lps-diff">
          <span className="lps-diff-label">Überschrift wird ersetzt</span>
          <span className="lps-diff-old">Willkommen auf unserer Website</span>
          <span className="lps-diff-new">Handwerk mit Handschrift — seit 2004.</span>
          <span className="lps-diff-actions">
            <i>Verwerfen</i>
            <b>Übernehmen</b>
          </span>
        </div>
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

const FEATURES = [
  {
    id: "ki-chat",
    kicker: "KI-Chat · Extra",
    title: "Sag deiner Website, was sie ändern soll.",
    text: "Texte, Farben und Bilder passt die KI auf Zuruf an – ohne Technik-Wissen oder Warteschleife.",
    Diagram: ChatSketch,
    proof: "Wunsch schreiben → Änderung prüfen → übernehmen.",
  },
  {
    id: "galerie",
    kicker: "Bildergalerie · Extra",
    title: "Deine Arbeiten verdienen eine Bühne.",
    text: "Projekte und Referenzen als mobiloptimierte Galerie mit Großansicht. Wer sieht, was du kannst, fragt an.",
    Diagram: GallerySketch,
    proof: "Bilder antippen → groß ansehen → direkt anfragen.",
  },
  {
    id: "buchung",
    kicker: "Terminbuchung · Extra",
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
      className="lp-section lp-feature-dark"
    >
      <div className="lp-container">
        <SectionHead
          id="lp-features-heading"
          kicker="Kann mehr"
          title="Deine Website ist kein Plakat. Sie arbeitet."
          text="Drei der stärksten Extras — systematisch erklärt. Alle Extras sind jederzeit zubuch- und kündbar."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {FEATURES.map(feature => (
            <article key={feature.id} className="flex flex-col">
              <p className="lp-kicker mb-3">{feature.kicker}</p>
              <feature.Diagram />
              <h3 className="mt-5 text-[1.35rem] leading-[1.15] tracking-[-0.015em]">
                {feature.title}
              </h3>
              <p className="mt-3 flex-1 text-[0.95rem] leading-[1.6] text-lp-muted">
                {feature.text}
              </p>
              <p className="mt-4 border-t border-lp-line pt-3 text-[0.82rem] font-medium text-lp-accent">
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

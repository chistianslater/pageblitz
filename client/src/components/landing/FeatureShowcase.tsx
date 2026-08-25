import { SectionHead, textLink } from "./primitives";

/**
 * Feature-Bühnen (Conversion-Pass 2, User-Entscheid 2026-08-25, „C"):
 * Die emotional stärksten Extras bekommen echte Screenshot-Beweise statt
 * nur eines Preislisten-Eintrags — Snaplove-Prinzip „Beweis statt
 * Behauptung". Platziert VOR dem Preis: Sie verkaufen das Abo indirekt
 * („das kann deine Website alles"), nicht die Extras direkt.
 *
 * Bewusst nur drei von acht Extras — der Rest bleibt Preisliste, sonst
 * wird die Seite zur Tapete und das Hauptziel (kostenlose Vorschau)
 * verdünnt.
 *
 * Quellen der Shots (client/public/feature-shots/): ki-chat = Studio-
 * Test-Baseline, galerie = Werkbank-Demo-Sektion, buchung = Buchungs-
 * Dialog aus der Features-Vorschau. Bei UI-Änderungen neu erzeugen
 * (Kommentar analog StudioProof.tsx).
 */
const FEATURES = [
  {
    id: "ki-chat",
    kicker: "KI-Chat · Extra",
    title: "Sag deiner Website, was sie ändern soll.",
    text: '„Mach die Überschrift kürzer" — fertig. Texte, Farben und Bilder passt die KI auf Zuruf an. Kein Technik-Wissen, keine Warteschleife beim Dienstleister, keine Rechnung pro Änderung.',
    src: "/feature-shots/ki-chat.webp",
    alt: "KI-Chat im Pageblitz Studio: Vorschlag für eine neue Überschrift mit Übernehmen-Button",
    wide: false,
  },
  {
    id: "galerie",
    kicker: "Bildergalerie · Extra",
    title: "Deine Arbeiten verdienen eine Bühne.",
    text: "Projekte, Referenzen, Impressionen: deine Fotos in einer Galerie, die auf dem Handy genauso gut aussieht — mit Großansicht per Klick. Wer sieht, was du kannst, fragt an.",
    src: "/feature-shots/galerie.webp",
    alt: "Galerie-Sektion einer Pageblitz-Website: drei Projektfotos einer Schreinerei mit Bildunterschriften",
    wide: true,
  },
  {
    id: "buchung",
    kicker: "Terminbuchung · Extra",
    title: "Kunden buchen, während du arbeitest.",
    text: "Deine Kunden wählen den passenden Zeitslot selbst — direkt auf deiner Website. Weniger Telefonate, mehr Termine, kein Hin und Her.",
    src: "/feature-shots/buchung.webp",
    alt: "Online-Terminbuchung auf einer Pageblitz-Website: Auswahl von Datum, Uhrzeit und Dauer",
    wide: true,
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
          text="Drei der stärksten Extras — echt gezeigt, nicht versprochen. Alle Extras sind jederzeit zubuch- und kündbar."
        />
        <div className="mt-14 flex flex-col gap-16 lg:gap-20">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.id}
              className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
            >
              <div
                className={`lg:col-span-7 ${index % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <div className="overflow-hidden rounded-[12px] border border-lp-line bg-white shadow-[0_24px_48px_-28px_rgba(29,26,23,0.35)]">
                  <img
                    src={feature.src}
                    alt={feature.alt}
                    loading="lazy"
                    decoding="async"
                    className={`w-full object-cover ${
                      feature.wide
                        ? "aspect-[16/10] object-top"
                        : "aspect-[16/10] object-left-top"
                    }`}
                  />
                </div>
              </div>
              <div
                className={`lg:col-span-5 ${index % 2 === 1 ? "lg:order-1" : ""}`}
              >
                <p className="lp-kicker mb-3">{feature.kicker}</p>
                <h3 className="text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] leading-[1.15] tracking-[-0.015em]">
                  {feature.title}
                </h3>
                <p className="mt-4 max-w-[30rem] text-[1rem] leading-[1.65] text-lp-muted">
                  {feature.text}
                </p>
              </div>
            </div>
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

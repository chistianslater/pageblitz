import React from "react";

/**
 * Altersprüfung: fragen statt automatisch setzen (2026-09-05).
 *
 * Bis dahin setzte die Generierung das Tor selbst, sobald Branche oder Name
 * nach Alkohol, Tabak, Glücksspiel oder Erotik klangen — ein Barbershop
 * bekam so eine Altersabfrage vor die Startseite. Jetzt entscheidet der
 * Betrieb: Bei Verdacht fragt das Rechtliches-Panel einmal vor dem
 * Freischalten, danach bleibt der Schalter zum Umstellen stehen.
 */
export function AgeGateQuestion({
  ageGate,
  onAnswer,
  busy,
}: {
  ageGate: { enabled: boolean; suspected: boolean; asked: boolean };
  onAnswer: (enabled: boolean) => void;
  busy: boolean;
}) {
  const offeneFrage = ageGate.suspected && !ageGate.asked;
  // Ohne Verdacht und ohne gesetztes Tor gibt es nichts zu entscheiden.
  if (!offeneFrage && !ageGate.enabled) return null;

  return (
    <section className="pb-agegate" aria-label="Altersprüfung">
      <h3>Altersprüfung</h3>
      {offeneFrage ? (
        <>
          <p className="pb-studio-hint">
            Deine Branche könnte eine Altersfreigabe verlangen — etwa bei
            Alkohol, Tabak, Glücksspiel oder erotischen Angeboten. Soll deine
            Website Besucher vorab nach dem Alter fragen? Du kannst das später
            jederzeit ändern.
          </p>
          <div className="pb-agegate-actions">
            <button
              type="button"
              className="pb-studio-btn"
              disabled={busy}
              onClick={() => onAnswer(true)}
            >
              Ja, Altersprüfung zeigen
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              disabled={busy}
              onClick={() => onAnswer(false)}
            >
              Nein, nicht nötig
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="pb-studio-hint">
            Besucher bestätigen vor der Startseite, dass sie volljährig sind.
            Die Altersprüfung ist eingeschaltet.
          </p>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={busy}
            onClick={() => onAnswer(false)}
          >
            Ausschalten
          </button>
        </>
      )}
    </section>
  );
}

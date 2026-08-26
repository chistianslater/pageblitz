import React, { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";
import type { DesignProfile } from "@shared/siteContract/designProfile";
import { PanelFrame } from "./PanelFrame";
import { ThemeEditor } from "./ThemeEditor";

interface Candidate {
  id: PackId;
  name: string;
  essence: string;
}

interface StyleCandidateListProps {
  token: string;
  candidates: Candidate[];
  currentPackId: PackId | null;
  busyId: PackId | null;
  onPick: (id: PackId) => void;
  /** Vom KI-Chat vorgeschlagenes Pack — bekommt eine "KI-Vorschlag"-Badge. */
  preselectPackId?: PackId | null;
}

export function StyleCandidateList({
  token,
  candidates,
  currentPackId,
  busyId,
  onPick,
  preselectPackId = null,
}: StyleCandidateListProps) {
  return (
    <div
      className="pb-studio-cands"
      role="group"
      aria-label="Designrichtungen"
    >
      {candidates.map(c => {
        const isCurrent = c.id === currentPackId;
        const isPreselected = c.id === preselectPackId;
        const isBusy = busyId === c.id;
        const label = isCurrent
          ? "Aktuell"
          : isBusy
            ? "Wird übernommen…"
            : "Diese Richtung verwenden";
        return (
          <div
            key={c.id}
            className="pb-studio-cand"
            data-current={isCurrent ? "true" : undefined}
            data-preselected={isPreselected ? "true" : undefined}
          >
            {isPreselected && (
              <span className="pb-studio-cand-badge">KI-Vorschlag</span>
            )}
            <div className="pb-studio-thumb" aria-hidden="true">
              <iframe
                src={`/preview-ssr/${token}?pack=${c.id}`}
                title={`Vorschau ${c.name}`}
                tabIndex={-1}
                // eager statt lazy: Visual-Tests warten deterministisch auf
                // das load-Event jedes iframes vor dem Screenshot — mit
                // lazy loading hängt der Ladezeitpunkt vom Intersection-
                // Observer-Timing des Browsers ab, das im Headless-CI
                // unzuverlässig sein kann (Finding #7).
                loading="eager"
              />
            </div>
            <div className="pb-studio-cand-name">{c.name}</div>
            <p className="pb-studio-cand-ess">{c.essence}</p>
            <button
              type="button"
              className="pb-studio-cand-pick"
              aria-pressed={isCurrent}
              disabled={busyId !== null}
              onClick={() => onPick(c.id)}
            >
              {label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface StylePanelProps {
  token: string;
  currentPackId: PackId | null;
  category: string;
  onApplied: () => void;
  onClose: () => void;
  /** Aus dem KI-Chat übergebenes Pack ("Ansehen" auf einer Stil-Karte) — vorausgewählt und hervorgehoben, notfalls als zusätzlicher erster Kandidat eingeblendet. */
  preselectPackId?: PackId;
  /** Geführter Modus (Studio-Wizard): „Passt so" bestätigt und springt zum nächsten Schritt statt nur zu schließen. */
  onNext?: () => void;
  /** Gespeicherter Akzent-Override (doc.colorOverrides?.accent) — Theme-Editor. */
  accent?: string | null;
  /** Gespeicherte Schriftpaar-ID (doc.fontPairId) — Theme-Editor. */
  fontPairId?: string | null;
  /** Gespeichertes Kompositionsprofil innerhalb der Designrichtung. */
  designProfile?: DesignProfile | null;
}

export function StylePanel({
  token,
  currentPackId,
  onApplied,
  onClose,
  preselectPackId,
  onNext,
  accent = null,
  fontPairId = null,
  designProfile = null,
}: StylePanelProps) {
  const [round, setRound] = useState(0);
  const [busyId, setBusyId] = useState<PackId | null>(null);
  // Lokal nachgeführter Zustand statt der (ggf. veralteten) Prop: verhindert,
  // dass „Passt so" nach einem gerade erfolgreichen Wechsel noch das alte
  // Pack bestätigt, bevor der Eltern-Refetch durchgelaufen ist.
  //
  // Finding F4: startet IMMER auf `currentPackId`, auch wenn der KI-Chat
  // einen anderen Pack vorschlägt (`preselectPackId`) — der Vorschlag wird
  // in `StyleCandidateList` nur als Badge ("KI-Vorschlag") hervorgehoben,
  // gilt aber nicht als aktiv/bestätigt, bevor der Nutzer ihn tatsächlich
  // anklickt. Vorher setzte `preselectPackId ?? currentPackId` den Vorschlag
  // sofort als "Aktuell", wodurch ein Klick auf „Passt so" ohne bewusste
  // Auswahl den Vorschlag übernahm (Race zwischen Vorschlag und Bestätigung).
  const [activePackId, setActivePackId] = useState<PackId | null>(
    currentPackId
  );
  const candidates = trpc.onboardingV2.getStyleCandidates.useQuery({
    token,
    round,
  });
  // Der KI-Vorschlag muss immer sichtbar sein, auch wenn er nicht unter den
  // Kandidaten der aktuellen Runde ist — Name/Essenz kommen dann direkt aus
  // der Pack-Verfassung statt aus der Server-Antwort (client-seitig
  // verfügbar über shared/stylePacks, siehe Task-Brief).
  const displayCandidates = useMemo(() => {
    const base = candidates.data?.candidates ?? [];
    if (!preselectPackId || base.some(c => c.id === preselectPackId)) {
      return base;
    }
    const constitution = getConstitution(preselectPackId);
    return [
      {
        id: preselectPackId,
        name: constitution.name,
        essence: constitution.essence,
      },
      ...base,
    ];
  }, [candidates.data, preselectPackId]);
  // Eine gemeinsame Mutation für Auswahl UND Bestätigung — verhindert das
  // Race, bei dem ein noch laufender Pick von einer separaten
  // Bestätigungs-Mutation überholt/überschrieben wird.
  const select = trpc.onboardingV2.selectStylePack.useMutation();

  const applyPack = (id: PackId, onSuccessExtra?: () => void) => {
    setBusyId(id);
    select.mutate(
      { token, packId: id },
      {
        onSettled: () => setBusyId(null),
        onSuccess: () => {
          setActivePackId(id);
          onApplied();
          onSuccessExtra?.();
        },
      }
    );
  };

  const pick = (id: PackId) => applyPack(id);

  const confirm = () => {
    // Geführter Modus: nach erfolgreicher Bestätigung direkt zum nächsten
    // Schritt (onNext) statt nur zu schließen — ohne Wizard wie bisher
    // einfach zumachen (onClose).
    const after = onNext ?? onClose;
    if (activePackId) {
      applyPack(activePackId, after);
    } else {
      after();
    }
  };

  const busy = busyId !== null;

  // Seit 2026-08-25 nutzt auch das Stil-Panel den PanelFrame (sticky
  // Kopfleiste mit Rückweg, sticky Fuß mit den Hauptaktionen) — vorher
  // Sonderlayout ohne die gemeinsame Panel-Chrome.
  return (
    <PanelFrame
      step="Schritt 1"
      title="Welche Designrichtung passt zu deinem Betrieb?"
      panelId="style"
      onClose={onClose}
      intro="Die Richtung ist dein Ausgangspunkt. Inhalte, Farben, Schriften und Bilder machen daraus deine Website."
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={busy}
            onClick={() => setRound(r => r + 1)}
          >
            Andere Richtungen
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            disabled={busy}
            onClick={confirm}
          >
            {busy ? "Bitte warten…" : onNext ? "Passt so — weiter" : "Passt so"}
          </button>
        </>
      }
    >
      {preselectPackId && (
        <p style={{ color: "var(--st-muted)" }}>Vorschlag aus dem KI-Chat</p>
      )}
      {candidates.isLoading && <p>Lade Vorschläge …</p>}
      {candidates.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {candidates.error.message}
        </p>
      )}
      {displayCandidates.length > 0 && (
        <StyleCandidateList
          token={token}
          candidates={displayCandidates}
          currentPackId={activePackId}
          busyId={busyId}
          onPick={pick}
          preselectPackId={preselectPackId}
        />
      )}
      {select.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {select.error.message}
        </p>
      )}
      {/* Feinschliff hinter Aufklapper (P1): Akzentfarbe + Schriftpaarung
          sind eine zweite, kleinere Entscheidungsebene und sollen die
          Stil-Wahl nicht verdrängen. Natives details = tastaturbedienbar
          ohne eigenen State. Die Hauptaktionen bleiben dank Sticky-Fuß
          auch bei aufgeklapptem Feinschliff erreichbar. */}
      <details className="pb-studio-theme-toggle">
        <summary>Aufbau, Farben &amp; Schriften anpassen</summary>
        <ThemeEditor
          token={token}
          packId={activePackId}
          accent={accent}
          fontPairId={fontPairId}
          designProfile={designProfile}
          onApplied={onApplied}
        />
      </details>
    </PanelFrame>
  );
}

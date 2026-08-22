import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import type { AiDiffEntry } from "@shared/onboardingV2/aiEdit";
import type { PackId } from "@shared/siteContract/types";
import { AiDiffList, AiStyleCard } from "./aiChatParts";

const MIN_MESSAGE_LENGTH = 3;
/** Spec §5: Verlauf der letzten 5 Anfragen im Component-State, kein Storage. */
const MAX_HISTORY = 5;
/** Ablehnungsgründe, die auf Fakten-/Kontaktwünsche hindeuten, bekommen einen Link ins Rechtliches-Panel. */
const LEGAL_HINT_PATTERN = /rechtlich|kontakt|impressum/i;

type AiChatOutcome =
  | { kind: "content"; proposalId: string; diff: AiDiffEntry[] }
  | { kind: "style"; packId: PackId; name: string; reason: string }
  | { kind: "reject"; reason: string };

interface AiExchange {
  message: string;
  outcome: AiChatOutcome;
}

interface AiChatProps {
  token: string;
  /** Nach erfolgreichem "Übernehmen" — lädt den Studio-Zustand neu und zeigt die aktualisierte Vorschau. */
  onApplied: () => void;
  /** "Ansehen" auf einer Stil-Karte — öffnet das Stil-Panel mit diesem Pack vorausgewählt. */
  onOpenStylePanel: (packId: PackId) => void;
  /** Ablehnung mit Rechtliches-/Kontakt-Bezug — öffnet das passende Panel. */
  onOpenPanel: (id: ChecklistItemId) => void;
}

/**
 * Freier KI-Chat im Studio ("Was soll anders sein?", Spec §5): ein
 * Eingabefeld statt eines vollständigen Chat-Verlaufs — nur das jeweils
 * letzte Ergebnis wird als Karte angezeigt. `aiEdit` persistiert nie selbst;
 * ein Inhalts-Vorschlag muss explizit über "Übernehmen" bestätigt werden.
 */
export function AiChat({
  token,
  onApplied,
  onOpenStylePanel,
  onOpenPanel,
}: AiChatProps) {
  const [message, setMessage] = useState("");
  // Verlauf der letzten 5 Anfragen (Spec §5) — bewusst nur als schmale
  // Liste vorheriger Fragen dargestellt (kein voller Chat-Verlauf mit
  // Diffs/Ergebnissen je Eintrag, siehe unten).
  const [history, setHistory] = useState<AiExchange[]>([]);
  const [active, setActive] = useState<AiExchange | null>(null);

  const aiEdit = trpc.onboardingV2.aiEdit.useMutation();
  const applyAiEdit = trpc.onboardingV2.applyAiEdit.useMutation();
  const discardAiEdit = trpc.onboardingV2.discardAiEdit.useMutation();

  const trimmed = message.trim();
  const canSend = trimmed.length >= MIN_MESSAGE_LENGTH && !aiEdit.isPending;

  const handleSend = () => {
    if (!canSend) return;
    aiEdit.mutate(
      { token, message: trimmed },
      {
        onSuccess: outcome => {
          const exchange: AiExchange = { message: trimmed, outcome };
          setHistory(prev => [...prev, exchange].slice(-MAX_HISTORY));
          setActive(exchange);
          setMessage("");
          // Fehler eines vorherigen Übernehmen/Verwerfen dürfen nicht unter
          // der neuen Karte hängen bleiben (andere Karte, anderer Vorschlag).
          applyAiEdit.reset();
          discardAiEdit.reset();
        },
      }
    );
  };

  const activeContent =
    active?.outcome.kind === "content" ? active.outcome : null;
  const activeStyle = active?.outcome.kind === "style" ? active.outcome : null;
  const activeReject =
    active?.outcome.kind === "reject" ? active.outcome : null;

  const handleApply = () => {
    if (!activeContent) return;
    applyAiEdit.mutate(
      { token, proposalId: activeContent.proposalId },
      {
        onSuccess: () => {
          setActive(null);
          onApplied();
        },
      }
    );
  };

  const handleDiscard = () => {
    if (!activeContent) return;
    discardAiEdit.mutate(
      { token, proposalId: activeContent.proposalId },
      { onSuccess: () => setActive(null) }
    );
  };

  const showLegalHint =
    !!activeReject && LEGAL_HINT_PATTERN.test(activeReject.reason);

  return (
    <div className="pb-studio-ai">
      <p className="pb-studio-kicker">KI-Chat</p>
      <div className="pb-studio-field">
        <label htmlFor="pb-ai-input">Was soll anders sein?</label>
        <div className="pb-studio-ai-row">
          <input
            id="pb-ai-input"
            type="text"
            className="pb-studio-input"
            placeholder="z. B. „Mach die Überschrift knackiger“"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            className="pb-studio-btn"
            disabled={!canSend}
            onClick={handleSend}
          >
            {aiEdit.isPending ? "Wird gesendet…" : "Senden"}
          </button>
        </div>
      </div>
      <p className="pb-studio-ai-hint">
        Inhalte &amp; Texte — Kontaktdaten und Rechtliches änderst du in den
        Panels.
      </p>
      {aiEdit.error && (
        <p role="alert" className="pb-studio-ai-error">
          {aiEdit.error.message}
        </p>
      )}
      <div aria-live="polite">
        {activeContent && (
          <div className="pb-studio-ai-result">
            <AiDiffList diff={activeContent.diff} />
            <div className="pb-studio-ai-actions">
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                disabled={discardAiEdit.isPending || applyAiEdit.isPending}
                onClick={handleDiscard}
              >
                Verwerfen
              </button>
              <button
                type="button"
                className="pb-studio-btn"
                disabled={applyAiEdit.isPending || discardAiEdit.isPending}
                onClick={handleApply}
              >
                {applyAiEdit.isPending ? "Wird übernommen…" : "Übernehmen"}
              </button>
            </div>
            {applyAiEdit.error && (
              <p role="alert" className="pb-studio-ai-error">
                {applyAiEdit.error.message}
              </p>
            )}
            {discardAiEdit.error && (
              <p role="alert" className="pb-studio-ai-error">
                {discardAiEdit.error.message}
              </p>
            )}
          </div>
        )}
        {activeStyle && (
          <AiStyleCard
            name={activeStyle.name}
            reason={activeStyle.reason}
            onView={() => onOpenStylePanel(activeStyle.packId)}
          />
        )}
        {activeReject && (
          <div className="pb-studio-ai-reject">
            <p>{activeReject.reason}</p>
            {showLegalHint && (
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                onClick={() => onOpenPanel("legal")}
              >
                Zu Rechtliches
              </button>
            )}
          </div>
        )}
      </div>
      {history.length > 1 && (
        <ul className="pb-studio-ai-history" aria-label="Bisherige Anfragen">
          {history
            .slice(0, -1)
            .reverse()
            .map((exchange, i) => (
              <li key={i}>{exchange.message}</li>
            ))}
        </ul>
      )}
    </div>
  );
}

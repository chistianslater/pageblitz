import React, { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import type { AiDiffEntry } from "@shared/onboardingV2/aiEdit";
import type { PackId } from "@shared/siteContract/types";
import {
  AiDiffList,
  AiStyleCard,
  aiScopeHint,
  canSendMessage,
  type AiChatPageScope,
} from "./aiChatParts";

/** Spec §5: Verlauf der letzten 5 Anfragen im Component-State, kein Storage. */
const MAX_HISTORY = 5;
/** Ablehnungsgründe, die auf Fakten-/Kontaktwünsche hindeuten, bekommen einen Link ins Rechtliches-Panel. */
const LEGAL_HINT_PATTERN = /rechtlich|kontakt|impressum/i;

type AiChatOutcome =
  | { kind: "content"; proposalId: string; diff: AiDiffEntry[] }
  | { kind: "theme"; reason: string; summary: string[] }
  | { kind: "style"; packId: PackId; name: string; reason: string }
  | { kind: "reject"; reason: string };

interface AiExchange {
  /** Stabiler React-Key für die Verlaufsliste — Array-Index wäre instabil, sobald ältere Einträge aus MAX_HISTORY herausfallen. */
  id: number;
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
  /**
   * Unterseiten-Scope (Plan B6 Task 5): die gerade in der Vorschau gewählte
   * Unterseite — der Wunsch wird dann auf deren Sektionen angewandt
   * (`aiEdit` mit `pageSlug`), nicht auf die Startseite.
   */
  page?: AiChatPageScope;
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
  page,
}: AiChatProps) {
  const [message, setMessage] = useState("");
  // Verlauf der letzten 5 Anfragen (Spec §5) — bewusst nur als schmale
  // Liste vorheriger Fragen dargestellt (kein voller Chat-Verlauf mit
  // Diffs/Ergebnissen je Eintrag, siehe unten).
  const [history, setHistory] = useState<AiExchange[]>([]);
  const [active, setActive] = useState<AiExchange | null>(null);
  // Reiner Zähler für stabile React-Keys der Verlaufsliste (kein Re-Render nötig, daher Ref statt State).
  const nextExchangeId = useRef(0);

  const aiEdit = trpc.onboardingV2.aiEdit.useMutation();
  const applyAiEdit = trpc.onboardingV2.applyAiEdit.useMutation();
  const discardAiEdit = trpc.onboardingV2.discardAiEdit.useMutation();

  // Eingabe UND Senden sind gesperrt, solange aiEdit ODER ein laufendes
  // Übernehmen/Verwerfen des aktuellen Vorschlags offen ist. Ohne die
  // beiden letzteren könnte während eines laufenden applyAiEdit/
  // discardAiEdit eine neue Nachricht gesendet werden, deren onSuccess dann
  // applyAiEdit.reset()/discardAiEdit.reset() aufruft — das würde die noch
  // laufende Mutation "kappen": ihr onSuccess (→ onApplied → refetch +
  // bumpPreview) würde nie mehr sichtbar, obwohl der Server bereits
  // persistiert hat (Review-Fund Fix-Runde 1).
  const busy =
    aiEdit.isPending || applyAiEdit.isPending || discardAiEdit.isPending;
  const canSend = canSendMessage({
    text: message,
    aiEditPending: aiEdit.isPending,
    applyPending: applyAiEdit.isPending,
    discardPending: discardAiEdit.isPending,
  });

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = message.trim();
    aiEdit.mutate(
      { token, message: trimmed, ...(page ? { pageSlug: page.slug } : {}) },
      {
        onSuccess: outcome => {
          const exchange: AiExchange = {
            id: nextExchangeId.current++,
            message: trimmed,
            outcome,
          };
          // Theme-Antworten sind bereits serverseitig angewandt — Vorschau
          // und Studio-State sofort nachziehen.
          if (outcome.kind === "theme") onApplied();
          setHistory(prev => [...prev, exchange].slice(-MAX_HISTORY));
          setActive(exchange);
          setMessage("");
          // Fehler eines vorherigen Übernehmen/Verwerfen dürfen nicht unter
          // der neuen Karte hängen bleiben (andere Karte, anderer
          // Vorschlag) — dank `busy`/`canSend` oben kann das nur nach
          // Abschluss eines vorherigen Übernehmen/Verwerfen passieren, nie
          // während es noch läuft.
          applyAiEdit.reset();
          discardAiEdit.reset();
        },
      }
    );
  };

  const activeContent =
    active?.outcome.kind === "content" ? active.outcome : null;
  const activeTheme = active?.outcome.kind === "theme" ? active.outcome : null;
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
            disabled={busy}
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
      <p className="pb-studio-ai-hint">{aiScopeHint(page)}</p>
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
        {activeTheme && (
          <div className="pb-studio-ai-theme">
            <p className="pb-studio-ai-theme-done">✓ Erledigt</p>
            {activeTheme.reason && <p>{activeTheme.reason}</p>}
            <ul>
              {activeTheme.summary.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              onClick={() => onOpenPanel("style")}
            >
              Im Stil-Panel feinjustieren
            </button>
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
            .map(exchange => (
              <li key={exchange.id}>{exchange.message}</li>
            ))}
        </ul>
      )}
    </div>
  );
}

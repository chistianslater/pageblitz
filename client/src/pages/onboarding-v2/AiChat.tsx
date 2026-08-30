import React, { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import type {
  AiChatHistoryEntry,
  AiDiffEntry,
} from "@shared/onboardingV2/aiEdit";
import type { PackId } from "@shared/siteContract/types";
import {
  AiDiffList,
  AiStyleCard,
  aiScopeHint,
  canSendMessage,
  type AiChatPageScope,
} from "./aiChatParts";

/** Obergrenze des Bubble-Verlaufs — Session-only, kein Storage (Spec §5). */
const MAX_MESSAGES = 40;
/** Ablehnungsgründe, die auf Fakten-/Kontaktwünsche hindeuten, bekommen einen Link ins Rechtliches-Panel. */
const LEGAL_HINT_PATTERN = /rechtlich|kontakt|impressum/i;

type AiChatOutcome =
  | { kind: "content"; proposalId: string; diff: AiDiffEntry[] }
  | { kind: "theme"; reason: string; summary: string[] }
  | { kind: "style"; packId: PackId; name: string; reason: string }
  | { kind: "reject"; reason: string }
  | { kind: "question"; question: string };

/**
 * Eine Nachricht im Webchat-Verlauf (2026-08-30, „klassisch wie ein
 * Webchat"): Kunden-Bubbles tragen nur Text, Assistenten-Bubbles das
 * strukturierte Ergebnis. Content-Vorschläge merken sich zusätzlich, ob sie
 * übernommen/verworfen wurden — die Buttons zeigt nur der jüngste offene
 * Vorschlag (ältere verfallen server-seitig ohnehin per TTL).
 */
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text?: string;
  outcome?: AiChatOutcome;
  proposalState?: "open" | "applied" | "discarded";
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

/** Drei hüpfende Punkte, solange die KI arbeitet — hält den Kunden am Ball. */
function TypingIndicator() {
  return (
    <div
      className="pb-studio-chat-msg pb-studio-chat-typing"
      data-role="assistant"
      aria-label="KI denkt nach"
    >
      <span className="pb-studio-chat-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="pb-studio-chat-typing-label">denkt nach …</span>
    </div>
  );
}

/**
 * KI-Assistent als klassischer Webchat (2026-08-30): Bubble-Verlauf mit
 * Kunden-Nachrichten rechts und Assistenten-Antworten links, Tipp-Indikator
 * während der Anfrage, animierte Einblendungen. `aiEdit` persistiert nie
 * selbst; ein Inhalts-Vorschlag muss weiterhin explizit über "Übernehmen"
 * bestätigt werden, Design-Patches (theme) sind sofort angewandt.
 */
export function AiChat({
  token,
  onApplied,
  onOpenStylePanel,
  onOpenPanel,
  page,
}: AiChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Offener Rückfragen-Dialog (2026-08-30): nach einer "question"-Antwort
  // enthält das die Wortwechsel (Wunsch → Rückfrage), die mit der nächsten
  // Nachricht als `history` zum Server gehen. Jede andere Antwortart
  // schließt den Dialog.
  const [pendingDialog, setPendingDialog] = useState<AiChatHistoryEntry[]>([]);
  // Reiner Zähler für stabile React-Keys (kein Re-Render nötig, daher Ref).
  const nextMessageId = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);

  const aiEdit = trpc.onboardingV2.aiEdit.useMutation();
  const applyAiEdit = trpc.onboardingV2.applyAiEdit.useMutation();
  const discardAiEdit = trpc.onboardingV2.discardAiEdit.useMutation();

  // Eingabe UND Senden sind gesperrt, solange aiEdit ODER ein laufendes
  // Übernehmen/Verwerfen offen ist — sonst könnte eine neue Antwort die
  // Fehler-/Erfolgszustände einer noch laufenden Mutation kappen
  // (Review-Fund Fix-Runde 1, unverändert aus der Karten-Fassung).
  const busy =
    aiEdit.isPending || applyAiEdit.isPending || discardAiEdit.isPending;
  const canSend = canSendMessage({
    text: message,
    aiEditPending: aiEdit.isPending,
    applyPending: applyAiEdit.isPending,
    discardPending: discardAiEdit.isPending,
  });

  // Klassisches Chat-Verhalten: neue Bubbles (und der Tipp-Indikator)
  // scrollen den Feed ans Ende.
  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [messages, aiEdit.isPending]);

  const pushMessage = (msg: Omit<ChatMessage, "id">) => {
    setMessages(prev =>
      [...prev, { ...msg, id: nextMessageId.current++ }].slice(-MAX_MESSAGES)
    );
  };

  // Der jüngste offene Content-Vorschlag — nur er zeigt die Buttons.
  const lastOpenProposal = [...messages]
    .reverse()
    .find(m => m.outcome?.kind === "content" && m.proposalState === "open");
  const awaitingAnswer =
    messages[messages.length - 1]?.outcome?.kind === "question";

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = message.trim();
    // Offener Rückfragen-Dialog geht als Kontext mit — die KI ordnet die
    // Antwort so dem ursprünglichen Wunsch zu.
    const dialog = pendingDialog;
    pushMessage({ role: "user", text: trimmed });
    setMessage("");
    aiEdit.mutate(
      {
        token,
        message: trimmed,
        ...(page ? { pageSlug: page.slug } : {}),
        ...(dialog.length > 0 ? { history: dialog } : {}),
      },
      {
        onSuccess: outcome => {
          // Theme-Antworten sind bereits serverseitig angewandt — Vorschau
          // und Studio-State sofort nachziehen.
          if (outcome.kind === "theme") onApplied();
          setPendingDialog(
            outcome.kind === "question"
              ? [
                  ...dialog,
                  { role: "user" as const, text: trimmed },
                  { role: "assistant" as const, text: outcome.question },
                ].slice(-8)
              : []
          );
          pushMessage({
            role: "assistant",
            outcome,
            ...(outcome.kind === "content"
              ? { proposalState: "open" as const }
              : {}),
          });
          // Fehler eines vorherigen Übernehmen/Verwerfen dürfen nicht unter
          // der neuen Bubble hängen bleiben.
          applyAiEdit.reset();
          discardAiEdit.reset();
        },
      }
    );
  };

  const setProposalState = (
    id: number,
    state: "applied" | "discarded"
  ): void => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, proposalState: state } : m))
    );
  };

  const handleApply = (msg: ChatMessage) => {
    if (msg.outcome?.kind !== "content") return;
    applyAiEdit.mutate(
      { token, proposalId: msg.outcome.proposalId },
      {
        onSuccess: () => {
          setProposalState(msg.id, "applied");
          onApplied();
        },
      }
    );
  };

  const handleDiscard = (msg: ChatMessage) => {
    if (msg.outcome?.kind !== "content") return;
    discardAiEdit.mutate(
      { token, proposalId: msg.outcome.proposalId },
      { onSuccess: () => setProposalState(msg.id, "discarded") }
    );
  };

  const renderAssistant = (msg: ChatMessage) => {
    const outcome = msg.outcome;
    if (!outcome) return <p>{msg.text}</p>;
    switch (outcome.kind) {
      case "content": {
        const actionable =
          msg.proposalState === "open" && lastOpenProposal?.id === msg.id;
        return (
          <>
            <p className="pb-studio-chat-lede">So würde ich es ändern:</p>
            <AiDiffList diff={outcome.diff} />
            {actionable && (
              <div className="pb-studio-ai-actions">
                <button
                  type="button"
                  className="pb-studio-btn"
                  data-variant="ghost"
                  disabled={busy}
                  onClick={() => handleDiscard(msg)}
                >
                  Verwerfen
                </button>
                <button
                  type="button"
                  className="pb-studio-btn"
                  disabled={busy}
                  onClick={() => handleApply(msg)}
                >
                  {applyAiEdit.isPending ? "Wird übernommen…" : "Übernehmen"}
                </button>
              </div>
            )}
            {msg.proposalState === "applied" && (
              <p className="pb-studio-chat-status" data-tone="done">
                ✓ Übernommen
              </p>
            )}
            {msg.proposalState === "discarded" && (
              <p className="pb-studio-chat-status">Verworfen</p>
            )}
          </>
        );
      }
      case "theme":
        return (
          <>
            <p className="pb-studio-chat-status" data-tone="done">
              ✓ Erledigt
            </p>
            {outcome.reason && <p>{outcome.reason}</p>}
            <ul className="pb-studio-chat-summary">
              {outcome.summary.map((line, i) => (
                <li key={i} style={{ "--i": i } as React.CSSProperties}>
                  {line}
                </li>
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
          </>
        );
      case "style":
        return (
          <AiStyleCard
            name={outcome.name}
            reason={outcome.reason}
            onView={() => onOpenStylePanel(outcome.packId)}
          />
        );
      case "question":
        return (
          <>
            <p className="pb-studio-chat-lede">Kurze Rückfrage:</p>
            <p>{outcome.question}</p>
          </>
        );
      case "reject":
        return (
          <>
            <p>{outcome.reason}</p>
            {LEGAL_HINT_PATTERN.test(outcome.reason) && (
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                onClick={() => onOpenPanel("legal")}
              >
                Zu Rechtliches
              </button>
            )}
          </>
        );
    }
  };

  return (
    <div className="pb-studio-ai pb-studio-chat">
      <p className="pb-studio-kicker">KI-Assistent</p>
      <div
        ref={feedRef}
        className="pb-studio-chat-feed"
        aria-live="polite"
        aria-label="Chat-Verlauf"
      >
        <div className="pb-studio-chat-msg" data-role="assistant">
          <p>
            Hi! Was möchtest du noch ändern? Ich passe Texte, Farben und
            Layout direkt an.
          </p>
        </div>
        {messages.map(msg =>
          msg.role === "user" ? (
            <div key={msg.id} className="pb-studio-chat-msg" data-role="user">
              <p>{msg.text}</p>
            </div>
          ) : (
            <div
              key={msg.id}
              className="pb-studio-chat-msg"
              data-role="assistant"
            >
              {renderAssistant(msg)}
            </div>
          )
        )}
        {aiEdit.isPending && <TypingIndicator />}
        {aiEdit.error && (
          <p role="alert" className="pb-studio-ai-error">
            {aiEdit.error.message}
          </p>
        )}
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
      <div className="pb-studio-ai-row">
        <input
          id="pb-ai-input"
          type="text"
          className="pb-studio-input"
          aria-label={
            awaitingAnswer ? "Deine Antwort" : "Was möchtest du noch ändern?"
          }
          placeholder={
            awaitingAnswer
              ? "Kurz antworten …"
              : "z. B. „Mach die Überschrift knackiger“"
          }
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
          aria-label="Senden"
        >
          {aiEdit.isPending ? "…" : "Senden"}
        </button>
      </div>
      <p className="pb-studio-ai-hint">{aiScopeHint(page)}</p>
    </div>
  );
}

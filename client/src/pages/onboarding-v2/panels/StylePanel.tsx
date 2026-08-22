import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { PackId } from "@shared/siteContract/types";

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
}

export function StyleCandidateList({
  token,
  candidates,
  currentPackId,
  busyId,
  onPick,
}: StyleCandidateListProps) {
  return (
    <div className="pb-studio-cands" role="group" aria-label="Stil-Kandidaten">
      {candidates.map(c => {
        const isCurrent = c.id === currentPackId;
        const isBusy = busyId === c.id;
        const label = isCurrent
          ? "Aktuell"
          : isBusy
            ? "Wird übernommen…"
            : "Diesen Stil wählen";
        return (
          <div
            key={c.id}
            className="pb-studio-cand"
            data-current={isCurrent ? "true" : undefined}
          >
            <div className="pb-studio-thumb" aria-hidden="true">
              <iframe
                src={`/preview-ssr/${token}?pack=${c.id}`}
                title={`Vorschau ${c.name}`}
                tabIndex={-1}
                loading="lazy"
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
}

export function StylePanel({
  token,
  currentPackId,
  onApplied,
  onClose,
}: StylePanelProps) {
  const [round, setRound] = useState(0);
  const [busyId, setBusyId] = useState<PackId | null>(null);
  // Lokal nachgeführter Zustand statt der (ggf. veralteten) Prop: verhindert,
  // dass „Passt so" nach einem gerade erfolgreichen Wechsel noch das alte
  // Pack bestätigt, bevor der Eltern-Refetch durchgelaufen ist.
  const [activePackId, setActivePackId] = useState<PackId | null>(
    currentPackId
  );
  const candidates = trpc.onboardingV2.getStyleCandidates.useQuery({
    token,
    round,
  });
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
    if (activePackId) {
      applyPack(activePackId, onClose);
    } else {
      onClose();
    }
  };

  const busy = busyId !== null;

  return (
    <section className="pb-studio-panel" aria-label="Stil wählen">
      <div>
        <p className="pb-studio-kicker">Schritt 1</p>
        <h2 className="pb-studio-title" style={{ fontSize: "1.4rem" }}>
          Welcher Stil passt zu dir?
        </h2>
        <p style={{ color: "var(--st-muted)" }}>
          Deine Inhalte bleiben gleich — nur der Look wechselt. Du kannst
          jederzeit zurück.
        </p>
      </div>
      {candidates.isLoading && <p>Lade Vorschläge …</p>}
      {candidates.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {candidates.error.message}
        </p>
      )}
      {candidates.data && (
        <StyleCandidateList
          token={token}
          candidates={candidates.data.candidates}
          currentPackId={activePackId}
          busyId={busyId}
          onPick={pick}
        />
      )}
      {select.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {select.error.message}
        </p>
      )}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="pb-studio-btn"
          data-variant="ghost"
          disabled={busy}
          onClick={() => setRound(r => r + 1)}
        >
          Andere zeigen
        </button>
        <button
          type="button"
          className="pb-studio-btn"
          disabled={busy}
          onClick={confirm}
        >
          {busy ? "Bitte warten…" : "Passt so"}
        </button>
      </div>
    </section>
  );
}

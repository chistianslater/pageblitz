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
        return (
          <button
            key={c.id}
            type="button"
            className="pb-studio-cand"
            aria-pressed={isCurrent}
            disabled={busyId !== null}
            onClick={() => onPick(c.id)}
          >
            <span className="pb-studio-thumb" aria-hidden="true">
              <iframe
                src={`/preview-ssr/${token}?pack=${c.id}`}
                title={`Vorschau ${c.name}`}
                tabIndex={-1}
                loading="lazy"
              />
            </span>
            <span className="pb-studio-cand-name">
              <span>{c.name}</span>
              <span className="pb-studio-kicker">
                {isCurrent
                  ? "Aktuell"
                  : busyId === c.id
                    ? "Wird übernommen…"
                    : ""}
              </span>
            </span>
            <span className="pb-studio-cand-ess">{c.essence}</span>
          </button>
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
  const candidates = trpc.onboardingV2.getStyleCandidates.useQuery({
    token,
    round,
  });
  const select = trpc.onboardingV2.selectStylePack.useMutation();

  const pick = (id: PackId) => {
    setBusyId(id);
    select.mutate(
      { token, packId: id },
      {
        onSettled: () => setBusyId(null),
        onSuccess: () => onApplied(),
      }
    );
  };

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
          currentPackId={currentPackId}
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
          onClick={() => setRound(r => r + 1)}
        >
          Andere zeigen
        </button>
        <button type="button" className="pb-studio-btn" onClick={onClose}>
          Passt so
        </button>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  TONE_LEVELS,
  TONES,
  toneFromIndex,
  toneIndex,
  type ToneLevel,
} from "@shared/onboardingV2/tone";
import type { AiDiffEntry } from "@shared/onboardingV2/aiEdit";
import { AiDiffList } from "../aiChatParts";

/**
 * Tonalität (2026-09-03, Übernahme aus vite-deploy-studio): Regler mit fünf
 * Rastpunkten, darunter der Beispielsatz der gewählten Stufe. Wechsel
 * speichert sofort (updateTone); „Texte anpassen" holt einen Umschreib-
 * Vorschlag über den KI-Chat-Pfad und zeigt Vorher/Nachher, bis der Kunde
 * übernimmt oder verwirft.
 */

export function ToneSlider({
  value,
  onChange,
  disabled,
}: {
  value: ToneLevel | null;
  onChange: (level: ToneLevel) => void;
  disabled?: boolean;
}) {
  const index = value ? toneIndex(value) : 2;
  const spec = value ? TONES[value] : null;
  return (
    <div className="pb-tone">
      <input
        type="range"
        className="pb-tone-range"
        min={0}
        max={TONE_LEVELS.length - 1}
        step={1}
        value={index}
        disabled={disabled}
        aria-label="Tonalität"
        aria-valuetext={spec?.label ?? "Noch nicht gewählt"}
        onChange={e => onChange(toneFromIndex(Number(e.target.value)))}
      />
      <div className="pb-tone-steps" role="group" aria-label="Stufen">
        {TONE_LEVELS.map(level => (
          <button
            key={level}
            type="button"
            className="pb-tone-step"
            aria-pressed={value === level}
            disabled={disabled}
            onClick={() => onChange(level)}
          >
            {TONES[level].label}
          </button>
        ))}
      </div>
      {spec ? (
        <p className="pb-tone-example">
          <q>{spec.example}</q>
          <span className="pb-tone-address">
            {spec.address === "du" ? "Du-Form" : "Sie-Form"}
          </span>
        </p>
      ) : (
        <p className="pb-tone-example pb-tone-example-empty">
          Noch keine Tonalität gewählt — die Designrichtung entscheidet.
        </p>
      )}
    </div>
  );
}

export function ToneControl({
  token,
  tone,
  onToneSaved,
  onTextsRewritten,
}: {
  token: string;
  tone: ToneLevel | null;
  /** Nach dem Speichern der Stufe (State neu laden, Verlauf aktualisieren). */
  onToneSaved: () => void;
  /** Nach Übernahme des Umschreib-Vorschlags (Vorschau + Panel-Felder neu). */
  onTextsRewritten: () => void;
}) {
  const [local, setLocal] = useState<ToneLevel | null>(tone);
  const [proposal, setProposal] = useState<{
    proposalId: string;
    diff: AiDiffEntry[];
  } | null>(null);
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const updateTone = trpc.onboardingV2.updateTone.useMutation();
  const rewrite = trpc.onboardingV2.rewriteForTone.useMutation();
  const applyAiEdit = trpc.onboardingV2.applyAiEdit.useMutation();
  const discardAiEdit = trpc.onboardingV2.discardAiEdit.useMutation();

  React.useEffect(() => setLocal(tone), [tone]);

  const busy =
    updateTone.isPending ||
    rewrite.isPending ||
    applyAiEdit.isPending ||
    discardAiEdit.isPending;

  const handleChange = (level: ToneLevel) => {
    if (level === local) return;
    setLocal(level);
    setProposal(null);
    setRejectReason(null);
    updateTone.mutate({ token, tone: level }, { onSuccess: onToneSaved });
  };

  const handleRewrite = () => {
    setRejectReason(null);
    rewrite.mutate(
      { token },
      {
        onSuccess: result => {
          if (result.kind === "content") setProposal(result);
          else setRejectReason(result.reason);
        },
      }
    );
  };

  const handleApply = () => {
    if (!proposal) return;
    applyAiEdit.mutate(
      { token, proposalId: proposal.proposalId },
      {
        onSuccess: () => {
          setProposal(null);
          onTextsRewritten();
        },
      }
    );
  };

  const handleDiscard = () => {
    if (!proposal) return;
    discardAiEdit.mutate({ token, proposalId: proposal.proposalId });
    setProposal(null);
  };

  const error =
    updateTone.error?.message ??
    rewrite.error?.message ??
    applyAiEdit.error?.message ??
    null;

  return (
    <section className="pb-tone-block" aria-label="Tonalität">
      <h3 className="pb-studio-group-kicker">Tonalität</h3>
      <p className="pb-tone-intro">
        Wie sprichst du deine Kunden an? Die Wahl gilt für KI-Vorschläge und den
        KI-Chat.
      </p>
      <ToneSlider value={local} onChange={handleChange} disabled={busy} />
      {local && !proposal && (
        <button
          type="button"
          className="pb-studio-btn pb-tone-rewrite"
          data-variant="ghost"
          disabled={busy}
          onClick={handleRewrite}
        >
          <Sparkles aria-hidden="true" />
          {rewrite.isPending
            ? "Texte werden umgeschrieben …"
            : "Texte an die Tonalität anpassen"}
        </button>
      )}
      {proposal && (
        <div className="pb-tone-proposal" role="region" aria-label="Vorschlag">
          <p className="pb-tone-proposal-head">
            Vorschlag in „{TONES[local ?? "ausgewogen"].label}“ — noch nichts
            geändert:
          </p>
          <AiDiffList diff={proposal.diff} />
          <div className="pb-tone-proposal-actions">
            <button
              type="button"
              className="pb-studio-btn"
              disabled={busy}
              onClick={handleApply}
            >
              {applyAiEdit.isPending ? "Wird übernommen …" : "Übernehmen"}
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              disabled={busy}
              onClick={handleDiscard}
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}
      {rejectReason && (
        <p className="pb-tone-note" role="status">
          {rejectReason}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {error}
        </p>
      )}
    </section>
  );
}

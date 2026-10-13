import React, { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { DesignSystemId } from "@shared/designSystems/types";
import { PanelFrame } from "./PanelFrame";
import { buildPreviewSrc } from "../PreviewFrame";
import { PaletteChooser } from "../PaletteChooser";
import {
  initialChoice,
  systemCandidateFor,
  type DesignChoice,
  type SystemCandidate,
} from "../designChoice";

interface StyleCandidateListProps {
  token: string;
  candidates: SystemCandidate[];
  /** `system:<id>` der Karte, die gerade übernommen wird. */
  busyId: string | null;
  /** Systemkarte übernehmen — mit der dort angesehenen Farbstimmung. */
  onPickSystem?: (id: DesignSystemId, palette: string) => void;
  /** Vom KI-Chat vorgeschlagenes System — bekommt eine "KI-Vorschlag"-Badge. */
  preselectSystem?: DesignSystemId | null;
  /** Cache-Bust der Systemvorschauen. */
  previewVersion?: number;
}

/**
 * Systemkarte (Task 16): Vorschau mit deinen Inhalten im System, darunter
 * die drei Farbstimmungen. Ein Wechsel lädt nur die Vorschau neu —
 * übernommen wird erst mit dem Knopf.
 */
function SystemCandidateCard({
  token,
  candidate,
  busy,
  disabled,
  previewVersion,
  preselected,
  onPick,
}: {
  token: string;
  candidate: SystemCandidate;
  busy: boolean;
  disabled: boolean;
  previewVersion: number;
  preselected: boolean;
  onPick?: (id: DesignSystemId, palette: string) => void;
}) {
  const [palette, setPalette] = useState(candidate.palettes[0]?.id ?? "");
  return (
    <div
      className="pb-studio-cand"
      data-kind="system"
      data-preselected={preselected ? "true" : undefined}
    >
      {preselected && (
        <span className="pb-studio-cand-badge">KI-Vorschlag</span>
      )}
      <div className="pb-studio-thumb" aria-hidden="true">
        <iframe
          src={buildPreviewSrc({
            token,
            version: previewVersion,
            system: candidate.id,
            palette,
          })}
          title={`Vorschau ${candidate.name}`}
          tabIndex={-1}
          loading="eager"
        />
      </div>
      <div className="pb-studio-cand-name">{candidate.name}</div>
      <p className="pb-studio-cand-ess">{candidate.essence}</p>
      <PaletteChooser
        size="compact"
        label={`Farbstimmung ${candidate.name}`}
        palettes={candidate.palettes}
        value={palette}
        disabled={disabled}
        onChange={setPalette}
      />
      <button
        type="button"
        className="pb-studio-cand-pick"
        disabled={disabled || !onPick}
        onClick={() => onPick?.(candidate.id, palette)}
      >
        {busy ? "Wird übernommen…" : "Dieses Design verwenden"}
      </button>
    </div>
  );
}

export function StyleCandidateList({
  token,
  candidates,
  busyId,
  onPickSystem,
  preselectSystem = null,
  previewVersion = 0,
}: StyleCandidateListProps) {
  return (
    <div className="pb-studio-cands" role="group" aria-label="Designrichtungen">
      {candidates.map(c => (
        <SystemCandidateCard
          key={c.id}
          token={token}
          candidate={c}
          busy={busyId === `system:${c.id}`}
          disabled={busyId !== null}
          previewVersion={previewVersion}
          preselected={c.id === preselectSystem}
          onPick={onPickSystem}
        />
      ))}
    </div>
  );
}

interface StylePanelProps {
  token: string;
  onApplied: () => void;
  onClose: () => void;
  /**
   * Vom KI-Chat vorgeschlagenes System („Ansehen" auf einer Stil-Karte) —
   * hervorgehoben und notfalls als zusätzliche erste Karte eingeblendet,
   * aber erst mit dem Knopf übernommen.
   */
  preselectSystem?: DesignSystemId;
  /** Geführter Modus (Studio-Wizard): „Passt so" bestätigt und springt zum nächsten Schritt statt nur zu schließen. */
  onNext?: () => void;
  /** Designsystem der Seite und seine Farbstimmung. */
  currentSystem?: DesignSystemId | null;
  currentPalette?: string | null;
  /** Cache-Bust für die Systemvorschauen (studio.previewVersion). */
  previewVersion?: number;
}

export function StylePanel({
  token,
  onApplied,
  onClose,
  preselectSystem,
  onNext,
  currentSystem = null,
  currentPalette = null,
  previewVersion = 0,
}: StylePanelProps) {
  const [round, setRound] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Lokal nachgeführter Zustand statt der (ggf. veralteten) Prop: verhindert,
  // dass „Passt so" nach einem gerade erfolgreichen Wechsel noch das alte
  // Design bestätigt, bevor der Eltern-Refetch durchgelaufen ist.
  //
  // Finding F4: startet IMMER auf dem gespeicherten System, auch wenn der
  // KI-Chat ein anderes vorschlägt (`preselectSystem`) — der Vorschlag ist
  // nur hervorgehoben, bis der Nutzer ihn tatsächlich übernimmt.
  const [active, setActive] = useState<DesignChoice | null>(() =>
    initialChoice({ system: currentSystem, palette: currentPalette })
  );
  useEffect(
    () =>
      setActive(initialChoice({ system: currentSystem, palette: currentPalette })),
    [currentSystem, currentPalette]
  );
  const activeSystem = active ? systemCandidateFor(active.id) : null;
  const candidates = trpc.onboardingV2.getStyleCandidates.useQuery({
    token,
    round,
  });
  const displayCandidates = useMemo(() => {
    // Das System, das die Seite gerade trägt, steht oben als Farbstimmung —
    // nicht noch einmal als Alternative (der Server filtert nur den
    // gespeicherten Stand, nicht eine eben getroffene Wahl).
    const base = (candidates.data?.candidates ?? []).filter(
      c => c.id !== active?.id
    );
    if (
      !preselectSystem ||
      preselectSystem === active?.id ||
      base.some(c => c.id === preselectSystem)
    ) {
      return base;
    }
    const suggested = systemCandidateFor(preselectSystem);
    return suggested ? [suggested, ...base] : base;
  }, [candidates.data, preselectSystem, active?.id]);
  const utils = trpc.useUtils();
  // Nach jedem Wechsel bietet der Server andere Kandidaten an (das aktuelle
  // System fällt heraus) — die zwischengespeicherte Antwort wäre veraltet.
  const selectSystem = trpc.onboardingV2.selectDesignSystem.useMutation({
    onSuccess: () => utils.onboardingV2.getStyleCandidates.invalidate({ token }),
  });

  const applySystem = (
    id: DesignSystemId,
    palette: string,
    onSuccessExtra?: () => void,
    confirm = false
  ) => {
    setBusyId(`system:${id}`);
    selectSystem.mutate(
      { token, system: id, palette, confirm },
      {
        onSettled: () => setBusyId(null),
        onSuccess: () => {
          setActive({ id, palette });
          onApplied();
          onSuccessExtra?.();
        },
      }
    );
  };

  const confirm = () => {
    // Geführter Modus: nach erfolgreicher Bestätigung direkt zum nächsten
    // Schritt (onNext) statt nur zu schließen — ohne Wizard wie bisher
    // einfach zumachen (onClose).
    const after = onNext ?? onClose;
    if (active) applySystem(active.id, active.palette, after, true);
    else after();
  };

  const busy = busyId !== null;

  return (
    <PanelFrame
      step="Schritt 1"
      title="Welches Design passt zu deinem Betrieb?"
      panelId="style"
      onClose={onClose}
      intro="Das Design ist dein Ausgangspunkt: Aufbau, Typografie und drei abgestimmte Farbstimmungen. Inhalte und Bilder machen daraus deine Website."
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={busy}
            onClick={() => setRound(r => r + 1)}
          >
            Andere Designs
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
      {active && activeSystem && (
        <section
          className="pb-studio-palette-current"
          aria-labelledby="pb-palette-current-title"
        >
          <h3 id="pb-palette-current-title">
            Farbstimmung für {activeSystem.name}
          </h3>
          <p>
            Drei abgestimmte Stimmungen für dein Design — deine Wahl ist sofort
            in der Vorschau.
          </p>
          <PaletteChooser
            label={`Farbstimmung ${activeSystem.name}`}
            palettes={activeSystem.palettes}
            value={active.palette}
            disabled={busy}
            onChange={palette => applySystem(activeSystem.id, palette)}
          />
        </section>
      )}
      {preselectSystem && (
        <p style={{ color: "var(--st-muted)" }}>Vorschlag aus dem KI-Chat</p>
      )}
      {candidates.isLoading && displayCandidates.length === 0 && (
        <p>Lade Designs …</p>
      )}
      {candidates.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {candidates.error.message}
        </p>
      )}
      {displayCandidates.length > 0 && (
        <StyleCandidateList
          token={token}
          candidates={displayCandidates}
          busyId={busyId}
          onPickSystem={(id, palette) => applySystem(id, palette)}
          preselectSystem={preselectSystem}
          previewVersion={previewVersion}
        />
      )}
      {selectSystem.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {selectSystem.error.message}
        </p>
      )}
    </PanelFrame>
  );
}

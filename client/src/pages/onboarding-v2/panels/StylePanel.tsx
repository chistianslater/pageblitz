import React, { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";
import type { DesignProfile } from "@shared/siteContract/designProfile";
import type { DesignSystemId } from "@shared/designSystems/types";
import { PanelFrame } from "./PanelFrame";
import { BrandImportCard } from "./BrandImportCard";
import { ThemeEditor } from "./ThemeEditor";
import { buildPreviewSrc } from "../PreviewFrame";
import { PaletteChooser } from "../PaletteChooser";
import {
  initialChoice,
  isSystemCandidate,
  systemCandidateFor,
  type DesignChoice,
  type StudioCandidate,
  type SystemCandidate,
} from "../designChoice";

interface StyleCandidateListProps {
  token: string;
  candidates: StudioCandidate[];
  currentPackId: PackId | null;
  /** Pack-ID oder `system:<id>` der Karte, die gerade übernommen wird. */
  busyId: string | null;
  onPick: (id: PackId) => void;
  /** Systemkarte übernehmen — mit der dort angesehenen Farbstimmung. */
  onPickSystem?: (id: DesignSystemId, palette: string) => void;
  /** Vom KI-Chat vorgeschlagenes Pack — bekommt eine "KI-Vorschlag"-Badge. */
  preselectPackId?: PackId | null;
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
  onPick,
}: {
  token: string;
  candidate: SystemCandidate;
  busy: boolean;
  disabled: boolean;
  previewVersion: number;
  onPick?: (id: DesignSystemId, palette: string) => void;
}) {
  const [palette, setPalette] = useState(candidate.palettes[0]?.id ?? "");
  return (
    <div className="pb-studio-cand" data-kind="system">
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
  currentPackId,
  busyId,
  onPick,
  onPickSystem,
  preselectPackId = null,
  previewVersion = 0,
}: StyleCandidateListProps) {
  return (
    <div className="pb-studio-cands" role="group" aria-label="Designrichtungen">
      {candidates.map(c => {
        if (isSystemCandidate(c)) {
          return (
            <SystemCandidateCard
              key={`system:${c.id}`}
              token={token}
              candidate={c}
              busy={busyId === `system:${c.id}`}
              disabled={busyId !== null}
              previewVersion={previewVersion}
              onPick={onPickSystem}
            />
          );
        }
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
  /** colorOverrides des Dokuments — markiert die aktive Farbwelt im Editor. */
  colorOverrides?: Record<string, string> | null;
  /** Designsystem der Seite (nur rev 3) und seine Farbstimmung. */
  currentSystem?: DesignSystemId | null;
  currentPalette?: string | null;
  /** Cache-Bust für die Systemvorschauen (studio.previewVersion). */
  previewVersion?: number;
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
  colorOverrides = null,
  currentSystem = null,
  currentPalette = null,
  previewVersion = 0,
}: StylePanelProps) {
  const [round, setRound] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
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
  //
  // Seit Task 16 kann die Seite statt eines Packs ein Designsystem tragen
  // (rev 3) — `active` hält deshalb Pack ODER System samt Farbstimmung.
  const [active, setActive] = useState<DesignChoice | null>(() =>
    initialChoice({
      packId: currentPackId,
      system: currentSystem,
      palette: currentPalette,
    })
  );
  useEffect(
    () =>
      setActive(
        initialChoice({
          packId: currentPackId,
          system: currentSystem,
          palette: currentPalette,
        })
      ),
    [currentPackId, currentSystem, currentPalette]
  );
  const activePackId = active?.kind === "pack" ? active.id : null;
  const activeSystem =
    active?.kind === "system" ? systemCandidateFor(active.id) : null;
  const candidates = trpc.onboardingV2.getStyleCandidates.useQuery({
    token,
    round,
  });
  // Der KI-Vorschlag muss immer sichtbar sein, auch wenn er nicht unter den
  // Kandidaten der aktuellen Runde ist — Name/Essenz kommen dann direkt aus
  // der Pack-Verfassung statt aus der Server-Antwort (client-seitig
  // verfügbar über shared/stylePacks, siehe Task-Brief).
  const displayCandidates = useMemo(() => {
    // Das System, das die Seite gerade trägt, steht oben als Farbstimmung —
    // nicht noch einmal als Alternative (der Server filtert nur den
    // gespeicherten Stand, nicht eine eben getroffene Wahl).
    const base: StudioCandidate[] = (candidates.data?.candidates ?? []).filter(
      c => !(isSystemCandidate(c) && activeSystem?.id === c.id)
    );
    if (
      !preselectPackId ||
      base.some(c => !isSystemCandidate(c) && c.id === preselectPackId)
    ) {
      return base;
    }
    const constitution = getConstitution(preselectPackId);
    return [
      {
        kind: "pack" as const,
        id: preselectPackId,
        name: constitution.name,
        essence: constitution.essence,
      },
      ...base,
    ];
  }, [candidates.data, preselectPackId, activeSystem?.id]);
  // Eine gemeinsame Mutation für Auswahl UND Bestätigung — verhindert das
  // Race, bei dem ein noch laufender Pick von einer separaten
  // Bestätigungs-Mutation überholt/überschrieben wird.
  const select = trpc.onboardingV2.selectStylePack.useMutation();
  const selectSystem = trpc.onboardingV2.selectDesignSystem.useMutation();

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
          setActive({ kind: "system", id, palette });
          onApplied();
          onSuccessExtra?.();
        },
      }
    );
  };

  const applyPack = (
    id: PackId,
    onSuccessExtra?: () => void,
    confirm = false
  ) => {
    setBusyId(id);
    select.mutate(
      { token, packId: id, confirm },
      {
        onSettled: () => setBusyId(null),
        onSuccess: () => {
          setActive({ kind: "pack", id });
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
    if (active?.kind === "system") {
      applySystem(active.id, active.palette, after, true);
    } else if (active) {
      applyPack(active.id, after, true);
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
      {/* Marken-Import zuerst (2026-09-03): Wer schon eine Website hat,
          soll Logo, Farbe und Schrift übernehmen können, bevor er eine
          Richtung wählt — die Richtung übernimmt die Werte dann. */}
      {/* Marken-Import schreibt Akzent und Schriftpaar — beides nutzt ein
          Designsystem (rev 3) nicht, deshalb dort ausgeblendet. */}
      {!activeSystem && (
        <BrandImportCard token={token} onApplied={onApplied} />
      )}
      {active?.kind === "system" && activeSystem && (
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
          onPickSystem={(id, palette) => applySystem(id, palette)}
          preselectPackId={preselectPackId}
          previewVersion={previewVersion}
        />
      )}
      {(select.error || selectSystem.error) && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {select.error?.message ?? selectSystem.error?.message}
        </p>
      )}
      {/* rev 3: Farben kommen aus der Farbstimmung, Schriften aus dem
          System; Abstände/Bildwirkung ignoriert der System-Renderer —
          der ganze Feinschliff-Block entfällt. */}
      {!activeSystem && (
        <details className="pb-studio-theme-toggle">
          <summary>Farben, Schriften &amp; Abstände anpassen</summary>
          <ThemeEditor
            token={token}
            packId={activePackId}
            accent={accent}
            fontPairId={fontPairId}
            designProfile={designProfile}
            colorOverrides={colorOverrides}
            onApplied={onApplied}
          />
        </details>
      )}
    </PanelFrame>
  );
}

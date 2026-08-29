import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";
import { PreviewFrame } from "./PreviewFrame";
import { DesignQuickControls } from "./DesignQuickControls";

interface Candidate {
  id: PackId;
  name: string;
  essence: string;
}

interface DesignSplashProps {
  token: string;
  businessName: string;
  currentPackId: PackId;
  accent?: string | null;
  fontPairId?: string | null;
  previewVersion: number;
  onApplied: () => void;
  onConfirmed: () => void;
}

/**
 * Vollbild-Design-Splash direkt nach der Generierung:
 * Alternative links ← aktive Live-Vorschau → Alternative rechts,
 * darunter Farbe/Schrift. Erst Bestätigung öffnet das Studio.
 */
export function DesignSplash({
  token,
  businessName,
  currentPackId,
  accent = null,
  fontPairId = null,
  previewVersion,
  onApplied,
  onConfirmed,
}: DesignSplashProps) {
  const [round, setRound] = useState(0);
  const [activePackId, setActivePackId] = useState(currentPackId);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [busyId, setBusyId] = useState<PackId | null>(null);
  const pointerGesture = React.useRef<{
    x: number;
    y: number;
    lastY: number;
  } | null>(null);
  const previewIframe = React.useRef<HTMLIFrameElement | null>(null);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const candidates = trpc.onboardingV2.getStyleCandidates.useQuery({
    token,
    round,
    count: 3,
  });
  const select = trpc.onboardingV2.selectStylePack.useMutation();

  useEffect(() => setActivePackId(currentPackId), [currentPackId]);

  const directions = useMemo<Candidate[]>(() => {
    const base = candidates.data?.candidates ?? [];
    if (base.some(candidate => candidate.id === activePackId)) return base;
    const constitution = getConstitution(activePackId);
    return [
      {
        id: activePackId,
        name: constitution.name,
        essence: constitution.essence,
      },
      ...base,
    ].slice(0, 3);
  }, [activePackId, candidates.data]);

  const activeIndex = Math.max(
    0,
    directions.findIndex(candidate => candidate.id === activePackId)
  );
  const alternative = (offset: -1 | 1): Candidate | null => {
    if (directions.length < 2) return null;
    const index =
      (activeIndex + offset + directions.length) % directions.length;
    return directions[index] ?? null;
  };
  const previous = alternative(-1);
  const next = alternative(1);

  const pick = (packId: PackId, direction: "left" | "right" = "right") => {
    if (busyId || packId === activePackId) return;
    const before = activePackId;
    setSlideDirection(direction);
    setActivePackId(packId);
    setBusyId(packId);
    select.mutate(
      { token, packId, confirm: false },
      {
        onSuccess: onApplied,
        onError: () => setActivePackId(before),
        onSettled: () => setBusyId(null),
      }
    );
  };

  const confirm = () => {
    setBusyId(activePackId);
    select.mutate(
      { token, packId: activePackId, confirm: true },
      {
        onSuccess: () => {
          onApplied();
          onConfirmed();
        },
        onSettled: () => setBusyId(null),
      }
    );
  };

  const sideCard = (candidate: Candidate | null, side: "left" | "right") =>
    candidate ? (
      <button
        type="button"
        className="pb-design-side"
        data-side={side}
        onClick={() => pick(candidate.id, side)}
        disabled={busyId !== null}
        aria-label={`${candidate.name} als Designrichtung verwenden`}
      >
        <span className="pb-design-side-frame" aria-hidden="true">
          <iframe
            src={`/preview-ssr/${token}?pack=${candidate.id}`}
            tabIndex={-1}
            title={`Vorschau ${candidate.name}`}
          />
        </span>
        <strong>{candidate.name}</strong>
        <span>{candidate.essence}</span>
      </button>
    ) : (
      <span />
    );

  return (
    <section className="pb-studio pb-studio-gen pb-studio-gen--dark pb-design-splash">
      <div className="pb-design-splash-inner">
        <header className="pb-design-splash-head">
          <div>
            <p className="pb-studio-kicker">Deine Website ist fertig</p>
            <h1 className="pb-studio-title">
              Gefällt dir das Design für {businessName}?
            </h1>
            <p>
              Wähle eine Richtung, passe Farbe und Schrift an und bestätige erst
              dann den Einstieg ins Studio.
            </p>
          </div>
          <div className="pb-studio-seg" aria-label="Gerät">
            <button
              type="button"
              aria-pressed={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              Desktop
            </button>
            <button
              type="button"
              aria-pressed={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              Mobil
            </button>
          </div>
        </header>

        <div className="pb-design-stage">
          {sideCard(previous, "left")}
          <div
            className="pb-design-center"
            data-enter={slideDirection}
            key={activePackId}
          >
            <div className="pb-design-center-label">
              <button
                type="button"
                aria-label="Vorherige Designrichtung"
                onClick={() => previous && pick(previous.id, "left")}
                disabled={!previous || busyId !== null}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <div>
                <strong>{getConstitution(activePackId).name}</strong>
                <span>Aktive Designrichtung</span>
              </div>
              <button
                type="button"
                aria-label="Nächste Designrichtung"
                onClick={() => next && pick(next.id, "right")}
                disabled={!next || busyId !== null}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
            <PreviewFrame
              token={token}
              version={previewVersion}
              device={device}
              packOverride={activePackId}
              onIframeReady={iframe => {
                previewIframe.current = iframe;
              }}
            />
            <DesignQuickControls
              token={token}
              packId={activePackId}
              accent={accent}
              fontPairId={fontPairId}
              onApplied={onApplied}
            />
            <div
              className="pb-design-swipe-surface"
              aria-hidden="true"
              onWheel={event => {
                event.preventDefault();
                previewIframe.current?.contentWindow?.scrollBy(0, event.deltaY);
              }}
              onPointerDown={event => {
                pointerGesture.current = {
                  x: event.clientX,
                  y: event.clientY,
                  lastY: event.clientY,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={event => {
                const gesture = pointerGesture.current;
                if (!gesture) return;
                const totalX = event.clientX - gesture.x;
                const totalY = event.clientY - gesture.y;
                // Nur überwiegend vertikale Bewegung an die Website
                // weiterreichen. Horizontale Bewegung bleibt für den Swipe.
                if (Math.abs(totalY) > Math.abs(totalX)) {
                  const deltaY = gesture.lastY - event.clientY;
                  previewIframe.current?.contentWindow?.scrollBy(0, deltaY);
                  gesture.lastY = event.clientY;
                }
              }}
              onPointerUp={event => {
                const gesture = pointerGesture.current;
                if (!gesture) return;
                const deltaX = event.clientX - gesture.x;
                const deltaY = event.clientY - gesture.y;
                pointerGesture.current = null;
                if (
                  Math.abs(deltaX) < 45 ||
                  Math.abs(deltaX) <= Math.abs(deltaY)
                )
                  return;
                if (deltaX > 0 && previous) pick(previous.id, "left");
                if (deltaX < 0 && next) pick(next.id, "right");
              }}
              onPointerCancel={() => {
                pointerGesture.current = null;
              }}
            />
            <button
              type="button"
              className="pb-studio-btn pb-design-confirm"
              onClick={confirm}
              disabled={busyId !== null}
            >
              {busyId ? "Wird übernommen …" : "Dieses Design verwenden"}
            </button>
          </div>
          {sideCard(next, "right")}
        </div>

        <button
          type="button"
          className="pb-design-more"
          onClick={() => setRound(value => value + 1)}
          disabled={busyId !== null || candidates.isFetching}
        >
          Weitere Designrichtungen laden
        </button>

        {(select.error || candidates.error) && (
          <p role="alert" className="pb-design-error">
            {select.error?.message ?? candidates.error?.message}
          </p>
        )}
      </div>
    </section>
  );
}

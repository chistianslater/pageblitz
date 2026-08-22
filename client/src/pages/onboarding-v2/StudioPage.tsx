import React, { useState } from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import type { PackId } from "@shared/siteContract/types";
import { useStudioState } from "./useStudioState";
import { GenerationScreen } from "./GenerationScreen";
import { Checklist } from "./Checklist";
import { PreviewFrame } from "./PreviewFrame";
import { AiChat } from "./AiChat";
import { StylePanel } from "./panels/StylePanel";
import { PhotosPanel } from "./panels/PhotosPanel";
import { TextsPanel } from "./panels/TextsPanel";
import { OfferPanel } from "./panels/OfferPanel";
import { LegalPanel } from "./panels/LegalPanel";
import { AddonsPanel } from "./panels/AddonsPanel";
import { CheckoutBar } from "./CheckoutBar";
import { LiveCard } from "./LiveCard";
import { LegacyCard } from "./LegacyCard";
import { deriveGenerationStatus } from "./studioLogic";
import { parsePanelParam, withPanelParam } from "./studioUrl";
import "./studio.css";

export default function StudioPage({ token }: { token: string }) {
  const studio = useStudioState(token);
  const [activeId, setActiveIdState] = useState<ChecklistItemId | null>(() =>
    parsePanelParam(window.location.search)
  );
  // Spiegelt jede Panel-Änderung per history.replaceState in die URL (Task 2,
  // Deep-Link) — kein zusätzlicher History-Eintrag pro Klick, andere
  // Query-Parameter bleiben erhalten (studioUrl.withPanelParam).
  const setActiveId = (id: ChecklistItemId | null) => {
    setActiveIdState(id);
    const nextSearch = withPanelParam(window.location.search, id);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${nextSearch}`
    );
  };
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  // Vom KI-Chat vorgeschlagenes Pack ("Ansehen" auf einer Stil-Karte) — nur
  // für die nächste Öffnung des Stil-Panels relevant, danach zurückgesetzt.
  const [preselectPackId, setPreselectPackId] = useState<PackId | undefined>(
    undefined
  );

  const openStylePanelWithSuggestion = (packId: PackId) => {
    setPreselectPackId(packId);
    setActiveId("style");
  };
  const closeStylePanel = () => {
    setActiveId(null);
    setPreselectPackId(undefined);
  };

  if (studio.isLoading && !studio.state)
    return (
      <div className="pb-studio pb-studio-gen">
        <p>Lade dein Studio …</p>
      </div>
    );
  if (!studio.state)
    return (
      <div className="pb-studio pb-studio-gen">
        <p role="alert">
          {studio.error ?? "Diese Vorschau konnte nicht geladen werden."}
        </p>
      </div>
    );

  const { state } = studio;
  // Verkauft/aktiv/inaktiv (alles außer "preview") → Live-Modus: keine
  // Checkout-Leiste mehr, Bearbeitung im Studio bleibt möglich (Spec §2.1).
  const isLive = state.status !== "preview";
  // Legacy (v1) ohne aktiven Job: statische Meldung ersetzt durch eine Karte
  // mit "Website neu erstellen" (Task 2) — läuft bereits ein per force
  // gestarteter v2-Job, zeigt der übliche Generierungs-Screen den
  // Fortschritt (computeRefetchInterval pollt währenddessen weiter).
  const legacyJobActive =
    state.legacy &&
    !!state.job &&
    (state.job.status === "pending" || state.job.status === "processing");
  if (state.legacy && !legacyJobActive) {
    return (
      <div className="pb-studio pb-studio-gen">
        <LegacyCard
          onRegenerate={studio.forceRegenerate}
          pending={studio.retrying}
          error={studio.ensureError}
        />
      </div>
    );
  }
  if (!state.doc) {
    const job = state.job;
    const { status, error } = deriveGenerationStatus({
      hasDoc: !!state.doc,
      job,
      ensureError: studio.ensureError,
    });
    return (
      <div className="pb-studio">
        <GenerationScreen
          businessName={state.businessName}
          progress={job?.progress ?? 5}
          status={status}
          error={error ?? studio.error}
          onRetry={state.legacy ? studio.forceRegenerate : studio.retry}
          retrying={studio.retrying}
        />
      </div>
    );
  }

  return (
    <div className="pb-studio">
      <div className="pb-studio-layout" data-tab={tab}>
        <aside className="pb-studio-rail">
          <header>
            <p className="pb-studio-kicker">Pageblitz Studio</p>
            <h1 className="pb-studio-title">{state.businessName}</h1>
          </header>
          <div
            className="pb-studio-seg pb-studio-tabs"
            role="tablist"
            aria-label="Ansicht"
          >
            <button
              type="button"
              aria-pressed={tab === "edit"}
              onClick={() => setTab("edit")}
            >
              Bearbeiten
            </button>
            <button
              type="button"
              aria-pressed={tab === "preview"}
              onClick={() => setTab("preview")}
            >
              Vorschau
            </button>
          </div>
          {activeId === "style" ? (
            <StylePanel
              token={token}
              currentPackId={state.stylePackId}
              category={state.category}
              preselectPackId={preselectPackId}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={closeStylePanel}
            />
          ) : activeId === "photos" ? (
            <PhotosPanel
              token={token}
              doc={state.doc}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => setActiveId(null)}
            />
          ) : activeId === "texts" ? (
            <TextsPanel
              token={token}
              doc={state.doc}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => setActiveId(null)}
            />
          ) : activeId === "offer" ? (
            <OfferPanel
              token={token}
              doc={state.doc}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => setActiveId(null)}
            />
          ) : activeId === "legal" ? (
            <LegalPanel
              token={token}
              initial={state.legal}
              openingHours={state.openingHours}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => setActiveId(null)}
            />
          ) : activeId === "addons" ? (
            <AddonsPanel
              token={token}
              addOns={state.addOns}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => setActiveId(null)}
            />
          ) : (
            <>
              <Checklist
                items={state.checklist}
                activeId={activeId}
                onSelect={setActiveId}
              />
              <AiChat
                token={token}
                onApplied={() => {
                  studio.refetch();
                  studio.bumpPreview();
                }}
                onOpenStylePanel={openStylePanelWithSuggestion}
                onOpenPanel={setActiveId}
              />
              {isLive ? (
                <LiveCard slug={state.slug} />
              ) : (
                <CheckoutBar
                  state={state}
                  token={token}
                  onStateChanged={studio.refetch}
                />
              )}
            </>
          )}
        </aside>
        <main className="pb-studio-stage">
          <div className="pb-studio-toolbar">
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
            <a
              className="pb-studio-btn"
              data-variant="ghost"
              href={`/preview-ssr/${token}`}
              target="_blank"
              rel="noreferrer"
            >
              In neuem Tab öffnen
            </a>
          </div>
          <PreviewFrame
            token={token}
            version={studio.previewVersion}
            device={device}
          />
        </main>
      </div>
    </div>
  );
}

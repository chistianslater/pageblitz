import React, { useState } from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import { useStudioState } from "./useStudioState";
import { GenerationScreen } from "./GenerationScreen";
import { Checklist } from "./Checklist";
import { PreviewFrame } from "./PreviewFrame";
import { StylePanel } from "./panels/StylePanel";
import { PhotosPanel } from "./panels/PhotosPanel";
import { TextsPanel } from "./panels/TextsPanel";
import { OfferPanel } from "./panels/OfferPanel";
import { LegalPanel } from "./panels/LegalPanel";
import { AddonsPanel } from "./panels/AddonsPanel";
import { CheckoutBar } from "./CheckoutBar";
import { deriveGenerationStatus } from "./studioLogic";
import "./studio.css";

export default function StudioPage({ token }: { token: string }) {
  const studio = useStudioState(token);
  const [activeId, setActiveId] = useState<ChecklistItemId | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"edit" | "preview">("edit");

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
  if (state.legacy) {
    return (
      <div className="pb-studio pb-studio-gen">
        <p role="alert">
          Diese Website nutzt noch das alte Format und kann im Studio nicht
          bearbeitet werden.
        </p>
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
          onRetry={studio.retry}
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
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => setActiveId(null)}
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
              <CheckoutBar
                state={state}
                token={token}
                onStateChanged={studio.refetch}
              />
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

import React, { useState } from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import { trpc } from "@/lib/trpc";
import { useStudioState } from "./useStudioState";
import { GenerationScreen } from "./GenerationScreen";
import { Checklist } from "./Checklist";
import { PreviewFrame } from "./PreviewFrame";
import { StylePanel } from "./panels/StylePanel";
import "./studio.css";

export default function StudioPage({ token }: { token: string }) {
  const studio = useStudioState(token);
  const [activeId, setActiveId] = useState<ChecklistItemId | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const selectMutation = trpc.onboardingV2.selectStylePack.useMutation();

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
  if (!state.doc) {
    const job = state.job;
    return (
      <div className="pb-studio">
        <GenerationScreen
          businessName={state.businessName}
          progress={job?.progress ?? 5}
          status={
            job?.status === "failed"
              ? "failed"
              : job?.status === "processing"
                ? "processing"
                : "pending"
          }
          error={job?.error ?? studio.error}
          onRetry={studio.retry}
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
              onClose={() => {
                // „Passt so" = Bestätigung des aktuellen Packs → Punkt wird "done"
                if (state.stylePackId) {
                  selectMutation.mutate(
                    { token, packId: state.stylePackId },
                    {
                      onSuccess: () => {
                        studio.refetch();
                        studio.bumpPreview();
                      },
                    }
                  );
                }
                setActiveId(null);
              }}
            />
          ) : activeId ? (
            <section aria-label="Bereich">
              <p className="pb-studio-kicker">
                {state.checklist.find(i => i.id === activeId)?.title}
              </p>
              <p style={{ color: "var(--st-muted)" }}>
                Dieser Bereich kommt im nächsten Schritt.
              </p>
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                onClick={() => setActiveId(null)}
              >
                Zurück
              </button>
            </section>
          ) : (
            <Checklist
              items={state.checklist}
              activeId={activeId}
              onSelect={setActiveId}
            />
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

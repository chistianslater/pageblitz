import React, { useState } from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import type { PackId } from "@shared/siteContract/types";
import { useStudioState } from "./useStudioState";
import { CategoryStep } from "./CategoryStep";
import { GenerationScreen } from "./GenerationScreen";
import { Checklist } from "./Checklist";
import { PreviewFrame, previewPath } from "./PreviewFrame";
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
import {
  deriveGenerationStatus,
  derivePreviewTabs,
  generationInProgress,
  resolvePreviewSlug,
} from "./studioLogic";
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
  // Vorschau-Leiste „Startseite | <Unterseiten…>“ (Plan B6 Task 5): null =
  // Startseite. Der gewählte Slug wird bei jedem Render gegen die aktuell
  // gültigen Seiten aufgelöst (resolvePreviewSlug) — eine entfernte Seite
  // fällt auf die Startseite zurück, kein eigener Effekt nötig.
  const [previewSlugState, setPreviewSlug] = useState<string | null>(null);
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
  // Live-Modus/Status-Unterscheidung (LiveCard) direkt an der Verwendung
  // geprüft (state.status !== "preview"), damit TS den Union-Typ dort ohne
  // Cast auf "sold"|"active"|"inactive" verengt.
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
  // Kategorie-Rückfrage (Plan B7 Task 5): Liefert GMB keine belastbare
  // Branche (needsCategory), erscheint VOR der Zeitmaschine der Schritt
  // „Was macht dein Betrieb?" — ensureGeneration startet nicht (Server
  // lehnt ab, useStudioState kickt gar nicht erst); setCategory persistiert
  // die Branche und stößt die Generierung an. Läuft wider Erwarten schon
  // ein Job, hat der Generierungs-Screen Vorrang.
  if (state.needsCategory && !generationInProgress(state.job)) {
    return (
      <div className="pb-studio">
        <CategoryStep
          businessName={state.businessName}
          onSubmit={studio.submitCategory}
          pending={studio.categoryPending}
          error={studio.categoryError}
        />
      </div>
    );
  }
  // Zeitmaschine (Plan B7 Task 4): Während ein Job läuft, existiert bereits
  // der Zwischenstand (state.doc) — der Generierungs-Screen bleibt trotzdem
  // sichtbar und zeigt ihn im Vorschau-iframe, bis der Job fertig ist.
  if (!state.doc || generationInProgress(state.job)) {
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
          token={token}
          packId={state.stylePackId}
          hasDoc={!!state.doc}
          progress={job?.progress ?? 5}
          status={status}
          error={error ?? studio.error}
          onRetry={state.legacy ? studio.forceRegenerate : studio.retry}
          retrying={studio.retrying}
        />
      </div>
    );
  }

  // Vorschau-Leiste gatet wie SSR/Nav auf das Dokument-Feld `addOns.subpages`
  // (Plan B6 Task 6) — updateAddons/updatePages schreiben es zusammen mit
  // dem Onboarding-Flag, so zeigt die Leiste genau die Seiten, die
  // /preview-ssr auch ausliefert.
  const previewTabs = derivePreviewTabs(
    state.doc.pages,
    state.doc.addOns?.subpages === true
  );
  const previewSlug = resolvePreviewSlug(previewTabs, previewSlugState);
  const previewPage =
    previewSlug === null
      ? undefined
      : state.doc.pages?.find(p => p.slug === previewSlug);
  const aiChatPage = previewPage
    ? { slug: previewPage.slug, title: previewPage.title }
    : undefined;

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
              addOns={state.addOns}
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
              doc={state.doc}
              addOns={state.addOns}
              live={state.status !== "preview"}
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
                page={aiChatPage}
              />
              {state.status !== "preview" ? (
                <LiveCard slug={state.slug} status={state.status} />
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
              href={previewPath(token, previewSlug ?? undefined)}
              target="_blank"
              rel="noreferrer"
            >
              In neuem Tab öffnen
            </a>
          </div>
          {previewTabs.length > 1 && (
            <div
              className="pb-studio-seg pb-studio-pagebar"
              role="group"
              aria-label="Vorschau-Seite"
            >
              {previewTabs.map(t => (
                <button
                  key={t.slug ?? "__home"}
                  type="button"
                  aria-pressed={previewSlug === t.slug}
                  onClick={() => setPreviewSlug(t.slug)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <PreviewFrame
            token={token}
            version={studio.previewVersion}
            device={device}
            pageSlug={previewSlug ?? undefined}
            // Finalstand-Einblendung (Zeitmaschine, Task 4): direkt nach einer
            // in dieser Sitzung beobachteten Generierung faden die Sektionen
            // des fertigen Stands ein — nur bis zum ersten Patch (version 0).
            reveal={studio.justGenerated && studio.previewVersion === 0}
          />
        </main>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  ADDON_EDITORS,
  addonContentDone,
} from "@shared/onboardingV2/addonEditors";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";
import type { PackId } from "@shared/siteContract/types";
import type { DesignProfile } from "@shared/siteContract/designProfile";
import { collectInlineTextTargets } from "@shared/onboardingV2/inlineText";
import { BOOKABLE_ADDON_KEYS, type AddOnKey } from "@shared/pricing";
import { useStudioState } from "./useStudioState";
import { CategoryStep } from "./CategoryStep";
import { GenerationScreen } from "./GenerationScreen";
import { Checklist } from "./Checklist";
import { WizardBar } from "./WizardBar";
import { DesignSplash } from "./DesignSplash";
import { PreviewFrame, previewPath } from "./PreviewFrame";
import { AiChat } from "./AiChat";
import { StylePanel } from "./panels/StylePanel";
import { PhotosPanel } from "./panels/PhotosPanel";
import { TextsPanel } from "./panels/TextsPanel";
import { OfferPanel } from "./panels/OfferPanel";
import { LegalPanel } from "./panels/LegalPanel";
import { AddonsPanel } from "./panels/AddonsPanel";
import { CheckoutBar } from "./CheckoutBar";
import { LeaveWithoutEmailGuard } from "./LeaveWithoutEmailGuard";
import { BrandMark } from "@/components/landing/primitives";
import { LiveCard } from "./LiveCard";
import { LegacyCard } from "./LegacyCard";
import {
  deriveGenerationStatus,
  derivePreviewTabs,
  generationInProgress,
  nextWizardStep,
  resolvePreviewSlug,
  shouldWarnOnLeave,
  WIZARD_PANEL_STEPS,
  WIZARD_STEP_TITLES,
  type WizardPanelStep,
  type WizardStep,
} from "./studioLogic";
import { resolveStudioLocation, withStudioParams } from "./studioUrl";
import "./studio.css";

export default function StudioPage({ token }: { token: string }) {
  const studio = useStudioState(token);
  const initialLocation = resolveStudioLocation(window.location.search);
  const [activeId, setActiveIdState] = useState<ChecklistItemId | null>(
    () => initialLocation.panel
  );
  const [addonFocus, setAddonFocus] = useState<AddOnKey | null>(
    () => initialLocation.extra
  );
  const [previewFocusAnchor, setPreviewFocusAnchor] = useState<string | null>(
    initialLocation.extra
      ? ADDON_EDITORS[initialLocation.extra].previewAnchor
      : "start"
  );
  // Spiegelt jede Panel-Änderung per history.replaceState in die URL (Task 2,
  // Deep-Link) — kein zusätzlicher History-Eintrag pro Klick, andere
  // Query-Parameter bleiben erhalten (studioUrl.withStudioParams). Extra-Klick
  // (Galerie, Speisekarte, …) setzt `?extra=` und öffnet das Inhaltspanel.
  const setActiveId = (
    id: ChecklistItemId | null,
    extra: AddOnKey | null = null
  ) => {
    setAddonFocus(extra);
    setPhotoFocus(null);
    setActiveIdState(id);
    const editor = extra ? ADDON_EDITORS[extra] : null;
    const anchorByPanel: Partial<Record<ChecklistItemId, string>> = {
      style: "start",
      photos: "start",
      texts: "start",
      offer: "leistungen",
      legal: "kontakt",
      addons: "kontakt",
    };
    if (editor) setPreviewFocusAnchor(editor.previewAnchor);
    else if (id && anchorByPanel[id]) setPreviewFocusAnchor(anchorByPanel[id]!);
    const nextSearch = withStudioParams(window.location.search, id, extra);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${nextSearch}`
    );
  };
  // Live-Spiegel des Texte-Panels: Inline-Pfad → Eingabewert (PreviewFrame
  // schreibt die Werte direkt in die Vorschau; Speichern bleibt explizit).
  const [textDraft, setTextDraft] = useState<Record<string, string>>({});
  // Foto-Klick in der Vorschau: Ziel fürs Fotos-Panel (hero/about/gallery).
  const [photoFocus, setPhotoFocus] = useState<
    "hero" | "about" | "gallery" | null
  >(null);
  const openPhotosAt = (target: "hero" | "about" | "gallery") => {
    // Reihenfolge: setActiveId zuerst — es nullt photoFocus für alle
    // anderen Öffnungswege (Checkliste), der Klick-Wert gewinnt danach.
    setActiveId("photos");
    setPhotoFocus(target);
  };
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  // Vorschau-Leiste „Startseite | <Unterseiten…>“ (Plan B6 Task 5): null =
  // Startseite. Der gewählte Slug wird bei jedem Render gegen die aktuell
  // gültigen Seiten aufgelöst (resolvePreviewSlug) — eine entfernte Seite
  // fällt auf die Startseite zurück, kein eigener Effekt nötig.
  const [previewSlugState, setPreviewSlug] = useState<string | null>(null);
  const inlineUpdateText = trpc.onboardingV2.updateInlineText.useMutation();
  const updateTheme = trpc.onboardingV2.updateTheme.useMutation();
  // E-Mail-Erfassung direkt im Leave-Guard-Modal (2026-08-29): der frühere
  // Sprung zu #pb-checkout-email lief auf Screens ohne Checkout-Leiste ins
  // Leere — jetzt speichert das Modal selbst.
  const guardSaveEmail = trpc.onboardingV2.setCustomerEmail.useMutation();
  const applySectionLayout = useCallback(
    (profile: DesignProfile) => {
      updateTheme.mutate(
        { token, designProfile: profile },
        { onSuccess: () => studio.refetch() }
      );
    },
    [token, updateTheme, studio]
  );
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

  // ── Geführter Modus (Wizard) ─────────────────────────────────────────
  // Startet einmal pro Browser-Session automatisch (nur vor dem Kauf) und
  // führt Design → Fotos → Texte → Angebot → Rechtliches → Extras →
  // Veröffentlichen.
  // „Übersicht" beendet jederzeit in den freien Modus; der Fortschritt
  // lebt ausschließlich in der Checkliste (pure Ableitung, reload-sicher).
  const wizardDismissedKey = `pb-wizard-dismissed:${token}`;
  const [wizardActive, setWizardActive] = useState(false);

  useEffect(() => {
    const state = studio.state;
    if (!state || state.status !== "preview" || wizardActive) return;
    // Der initiale Design-Gate läuft VOR dem Studio-Wizard. Solange die
    // Richtung nicht bestätigt ist, darf der Wizard nicht parallel das
    // Stil-Panel öffnen; nach Bestätigung startet er direkt bei Fotos.
    if (state.checklist.find(i => i.id === "style")?.status !== "done") return;
    if (sessionStorage.getItem(wizardDismissedKey) === "1") return;
    setWizardActive(true);
    if (!activeId) {
      const step = nextWizardStep(state.checklist);
      if (step !== "publish") setActiveId(step);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio.state]);

  const exitWizard = () => {
    setWizardActive(false);
    sessionStorage.setItem(wizardDismissedKey, "1");
    setPreselectPackId(undefined);
    setActiveId(null);
  };

  // „Weiter" in einem Panel: nächster offener Schritt; ist keiner mehr
  // offen, landet der Wizard im Veröffentlichen-Schritt (activeId null).
  const goNext = () => {
    if (!studio.state) return;
    const next = nextWizardStep(
      studio.state.checklist,
      (activeId ?? undefined) as WizardPanelStep | undefined
    );
    setPreselectPackId(undefined);
    setActiveId(next === "publish" ? null : next);
  };

  const resumeWizard = () => {
    sessionStorage.removeItem(wizardDismissedKey);
    setWizardActive(true);
    if (!studio.state) return;
    const step = nextWizardStep(studio.state.checklist);
    setActiveId(step === "publish" ? null : step);
  };

  if (studio.isLoading && !studio.state)
    return (
      <div
        className="pb-studio pb-studio-gen"
        role="status"
        aria-label="Dein Studio wird geladen"
      >
        <div className="pb-studio-loader">
          <span className="pb-loader-bolt" aria-hidden="true">
            <BrandMark className="pb-studio-loader-mark" />
          </span>
          <p>Lade dein Studio …</p>
        </div>
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
  const leaveGuard = (
    <LeaveWithoutEmailGuard
      armed={shouldWarnOnLeave(state.status, state.customerEmail)}
      onSubmitEmail={async email => {
        await guardSaveEmail.mutateAsync({ token, email });
        await studio.refetch();
      }}
    />
  );
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
        {leaveGuard}
        <CategoryStep
          businessName={state.businessName}
          initialCategory={state.category}
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
        {leaveGuard}
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

  const styleConfirmed =
    state.checklist.find(item => item.id === "style")?.status === "done";

  // Initialer Design-Gate: Erst die wichtigste visuelle Entscheidung, dann
  // das eigentliche Studio. Die gleiche StylePanel-Komponente bleibt später
  // über die Checkliste erreichbar — eine Quelle für Auswahl/Theme-Logik.
  if (state.status === "preview" && !styleConfirmed) {
    return (
      <>
        {leaveGuard}
        <DesignSplash
          token={token}
          businessName={state.businessName}
          currentPackId={state.doc.stylePackId}
          accent={state.doc.colorOverrides?.accent ?? null}
          fontPairId={state.doc.fontPairId ?? null}
          previewVersion={studio.previewVersion}
          onApplied={() => {
            studio.refetch();
            studio.bumpPreview();
          }}
          onConfirmed={() => studio.refetch()}
        />
      </>
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
  const inlineTargets =
    previewSlug === null ? collectInlineTextTargets(state.doc) : undefined;
  const applyInlineText = (path: string, value: string) => {
    inlineUpdateText.mutate(
      { token, path, value },
      {
        onSuccess: () => {
          studio.refetch();
          studio.bumpPreview();
        },
      }
    );
  };

  // Wizard-Ableitungen fürs Rendering: aktiver Schritt (Panel oder
  // "publish" bei geschlossenem Panel) + Fortschritt (erledigte Schritte).
  const activeIsWizardStep =
    activeId !== null &&
    (WIZARD_PANEL_STEPS as readonly string[]).includes(activeId);
  const wizardStep: WizardStep = activeIsWizardStep
    ? (activeId as WizardPanelStep)
    : "publish";
  const wizardDoneCount = WIZARD_PANEL_STEPS.filter(
    id => state.checklist.find(i => i.id === id)?.status === "done"
  ).length;
  const wizardOpenCount = WIZARD_PANEL_STEPS.length - wizardDoneCount;
  // „Weiter" führt IMMER durch die Schritte (User-Feedback 2026-08-30):
  // Auch aus der Übersicht geöffnete Wizard-Schritte zeigen „Speichern &
  // weiter" und springen zum nächsten offenen Schritt — vorher stand dort
  // nur „Speichern", und die Führung riss ab.
  const panelNext = activeIsWizardStep ? goNext : undefined;
  const panelClose = (panelId: ChecklistItemId | null) =>
    wizardActive ? exitWizard() : setActiveId(panelId);

  return (
    <div className="pb-studio">
      {leaveGuard}
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
          {wizardActive && (activeId === null || activeIsWizardStep) && (
            <WizardBar
              step={wizardStep}
              doneCount={wizardDoneCount}
              onExit={exitWizard}
            />
          )}
          {activeId === "style" ? (
            <StylePanel
              token={token}
              currentPackId={state.stylePackId}
              category={state.category}
              preselectPackId={preselectPackId}
              accent={state.doc?.colorOverrides?.accent ?? null}
              fontPairId={state.doc?.fontPairId ?? null}
              designProfile={state.doc?.designProfile ?? null}
              colorOverrides={state.doc?.colorOverrides ?? null}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={wizardActive ? exitWizard : closeStylePanel}
              onNext={panelNext}
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
              onClose={() => panelClose(null)}
              onNext={panelNext}
              onPreviewFocus={setPreviewFocusAnchor}
              initialTarget={
                addonFocus === "gallery" ? "gallery" : (photoFocus ?? undefined)
              }
            />
          ) : activeId === "texts" ? (
            <TextsPanel
              token={token}
              doc={state.doc}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => {
                setTextDraft({});
                panelClose(null);
              }}
              onNext={panelNext}
              onPreviewFocus={setPreviewFocusAnchor}
              onDraft={setTextDraft}
            />
          ) : activeId === "offer" ? (
            <OfferPanel
              token={token}
              doc={state.doc}
              addOns={state.addOns}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => panelClose(null)}
              onNext={panelNext}
              onPreviewFocus={setPreviewFocusAnchor}
              initialMode={
                addonFocus === "menu" || addonFocus === "pricelist"
                  ? addonFocus
                  : undefined
              }
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
              onClose={() => panelClose(null)}
              onNext={panelNext}
            />
          ) : activeId === "addons" ? (
            <AddonsPanel
              token={token}
              doc={state.doc}
              addOns={state.addOns}
              chatWelcomeMessage={state.chatWelcomeMessage ?? null}
              live={state.status !== "preview"}
              onApplied={() => {
                studio.refetch();
                studio.bumpPreview();
              }}
              onClose={() => panelClose(null)}
              onNext={panelNext}
              onPreviewFocus={setPreviewFocusAnchor}
              initialFocusKey={addonFocus}
              onOpenExtraEditor={key => {
                const editor = ADDON_EDITORS[key];
                setActiveId(editor.panel, key);
              }}
            />
          ) : wizardActive ? (
            // Wizard-Abschluss („publish"): Fokus liegt auf dem Freischalten,
            // deshalb hier bewusst keine Checkliste/KI-Ablenkung.
            <>
              <p className="pb-studio-wizard-note">
                {wizardOpenCount > 0
                  ? `Fast geschafft — noch ${wizardOpenCount} optionale${wizardOpenCount === 1 ? "r" : ""} Schritt${wizardOpenCount === 1 ? "" : "e"} offen. Zum Freischalten genügen Rechtliches und deine E-Mail-Adresse.`
                  : "Alle Schritte erledigt — jetzt nur noch freischalten."}
              </p>
              {state.status !== "preview" ? (
                <LiveCard slug={state.slug} status={state.status} />
              ) : (
                <CheckoutBar
                  state={state}
                  token={token}
                  onStateChanged={studio.refetch}
                  onOpenPanel={id => setActiveId(id)}
                />
              )}
            </>
          ) : (
            <>
              {state.status === "preview" && (
                <div className="pb-studio-wizard-card">
                  <p>
                    {wizardOpenCount > 0
                      ? `Noch ${wizardOpenCount} von ${WIZARD_PANEL_STEPS.length + 1} Schritten bis zur fertigen Website.`
                      : `Alles bereit — letzter Schritt: ${WIZARD_STEP_TITLES.publish}.`}
                  </p>
                  <button
                    type="button"
                    className="pb-studio-btn"
                    onClick={resumeWizard}
                  >
                    Geführt weiter
                  </button>
                </div>
              )}
              <Checklist
                items={state.checklist}
                activeId={activeId}
                onSelect={id => setActiveId(id)}
                activeAddOns={BOOKABLE_ADDON_KEYS.filter(
                  key => state.addOns[key] === true
                )}
                extraFocus={addonFocus}
                extraDone={Object.fromEntries(
                  BOOKABLE_ADDON_KEYS.filter(
                    key => state.addOns[key] === true
                  ).map(key => [
                    key,
                    addonContentDone(key, state.doc, {
                      chatWelcomeMessage: state.chatWelcomeMessage,
                    }),
                  ])
                )}
                onSelectAddOn={key => {
                  const editor = ADDON_EDITORS[key];
                  setActiveId(editor.panel, key);
                }}
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
                  onOpenPanel={id => setActiveId(id)}
                />
              )}
            </>
          )}
        </aside>
        <main className="pb-studio-stage">
          {/* Mobiler Rückweg (2026-08-25): Auf dem Smartphone blendet der
              Vorschau-Tab die Rail komplett aus — der Tab-Umschalter liegt
              aber IN der Rail, es gab also keinen Weg zurück zu den
              Einstellungen. Diese Leiste ist nur mobil und nur im
              Vorschau-Tab sichtbar. */}
          <div className="pb-studio-mobilebar">
            <button
              type="button"
              className="pb-studio-back"
              onClick={() => setTab("edit")}
            >
              ‹ Bearbeiten
            </button>
          </div>
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
          {previewSlug === null && (
            <p className="pb-studio-inline-hint">
              Tipp: Texte kannst du direkt anklicken. Das Layout jeder Sektion
              stellst du rechts in der Vorschau um.
            </p>
          )}
          {inlineUpdateText.error && (
            <p role="alert" className="pb-studio-inline-error">
              Änderung konnte nicht gespeichert werden:{" "}
              {inlineUpdateText.error.message}
            </p>
          )}
          {updateTheme.error && (
            <p role="alert" className="pb-studio-inline-error">
              Layout konnte nicht gespeichert werden:{" "}
              {updateTheme.error.message}
            </p>
          )}
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
            inlineTargets={inlineTargets}
            onInlineTextEdit={applyInlineText}
            draftValues={activeId === "texts" ? textDraft : undefined}
            onPickPhoto={openPhotosAt}
            focusAnchor={previewFocusAnchor}
            designProfile={state.doc.designProfile ?? null}
            onSectionLayout={applySectionLayout}
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

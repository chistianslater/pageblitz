import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import StockPhotoSearch from "@/components/StockPhotoSearch";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
import type { AddOnFlags } from "@shared/pricing";
import type { AddonsPatch, ImagesPatch } from "@shared/onboardingV2/patches";
import { withAddOnEnabled } from "@shared/onboardingV2/addonEditors";
import { SECTION_ANCHORS } from "@/components/site/engine";
import { PanelFrame } from "./PanelFrame";
import { moveGalleryImage, removeGalleryImage, MAX_GALLERY_PHOTOS } from "./galleryLogic";
import {
  GalleryAddonNotice,
  PhotoGrid,
  PhotoTargetPicker,
  SelectedGalleryList,
  type PhotoTarget,
} from "./photoParts";

// Serverseitig ist die base64-Data-URL auf 8.000.000 Zeichen begrenzt
// (ImagesPatchSchema/uploadPhoto-Input) — das entspricht roh ca. 5,7 MB.
// 5 MB clientseitig lässt Luft für den Data-URL-Overhead, damit keine
// clientseitig akzeptierte Datei am Server abgelehnt wird.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
// Deckt sich mit MAX_UPLOADED_PHOTOS in server/onboardingV2/routerContent.ts
// (Finding I4) — Upload-Button wird gesperrt, bevor der Server ohnehin
// ablehnen würde.
const MAX_UPLOADED_PHOTOS = 30;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AcceptedMime = (typeof ACCEPTED_MIME_TYPES)[number];

function isAcceptedMime(type: string): type is AcceptedMime {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(type);
}

type SourceTab = "gmb" | "stock" | "upload";

interface PhotosPanelProps {
  token: string;
  doc: WebsiteDataV2;
  /**
   * Add-on-Flags aus dem Studio-State (`state.addOns`: vor dem Checkout der
   * Entwurf aus onboarding_responses, danach der Ist-Stand aus
   * subscriptions.addOns bzw. dem Dokument, server/onboardingV2/state.ts
   * `resolveAddOns`) — nötig, um den Galerie-Schalter als vollständigen
   * `AddonsPatch` (alle acht Flags, strict) an `onboardingV2.updateAddons`
   * zu schicken. Wird bei jedem Klick direkt aus der Prop gelesen (kein
   * lokaler Entwurf), ist also nie älter als der zuletzt geladene State.
   * Optional, weil ältere Aufrufer/Tests das Panel ohne Flags rendern
   * (dann gilt: alles aus, nur gallery wird eingeschaltet).
   */
  addOns?: AddOnFlags;
  onApplied: () => void;
  onClose: () => void;
  /**
   * Geführter Modus (Studio-Wizard): zeigt einen „Weiter"-Button, der zum
   * nächsten Schritt springt. Nichts zu speichern — jede Auswahl wird
   * sofort übernommen (Auto-Apply, siehe handlePick).
   */
  onNext?: () => void;
  onPreviewFocus?: (anchor: string) => void;
  /**
   * Deep-Link aus einem gebuchten Extra (Checkliste `?extra=gallery`):
   * startet direkt im Galerie-Ziel statt beim Hero.
   */
  initialTarget?: PhotoTarget;
}

export function PhotosPanel({
  token,
  doc,
  addOns = {},
  onApplied,
  onClose,
  onNext,
  onPreviewFocus,
  initialTarget = "hero",
}: PhotosPanelProps) {
  const heroSection = doc.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const aboutSection = doc.sections.find(
    (s): s is SectionOf<"about"> => s.type === "about"
  );
  const gallerySection = doc.sections.find(
    (s): s is SectionOf<"gallery"> => s.type === "gallery"
  );
  const hasAbout = !!aboutSection;
  const hasExistingGallery = !!gallerySection;

  const [target, setTarget] = useState<PhotoTarget>(initialTarget);
  const [sourceTab, setSourceTab] = useState<SourceTab>("gmb");
  const [heroUrl, setHeroUrl] = useState<string | null>(
    heroSection?.imageUrl ?? null
  );
  const [aboutUrl, setAboutUrl] = useState<string | null>(
    aboutSection?.imageUrl ?? null
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    gallerySection?.images.map(i => i.url) ?? []
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sources = trpc.onboardingV2.getPhotoSources.useQuery({ token });
  const upload = trpc.onboardingV2.uploadPhoto.useMutation();
  const setImages = trpc.onboardingV2.setImages.useMutation();
  const updateAddons = trpc.onboardingV2.updateAddons.useMutation();

  // Galerie ist Add-on-Inhalt (Plan B6 Task 6): Gating-Quelle ist
  // `doc.addOns.gallery` (dieselbe wie SSR/CSR, engine.ts). Der Studio-
  // State (`addOns`-Prop) gilt zusätzlich — Dashboard-Kauf schreibt zuerst
  // ins Abo, und Extra-Klick darf den Editor nicht hinter dem Hinweis
  // verstecken, nur weil das Dokument noch nachzieht.
  const openedAsGalleryExtra = initialTarget === "gallery";
  const galleryPersisted =
    doc.addOns?.gallery === true || addOns.gallery === true;
  const galleryBooked = openedAsGalleryExtra || galleryPersisted;
  const activateGallery = () => {
    const patch: AddonsPatch = withAddOnEnabled(addOns, "gallery");
    updateAddons.mutate({ token, addOns: patch }, { onSuccess: onApplied });
  };

  // Extra-Klick auf Galerie: Flag sofort setzen, damit die Vorschau zur
  // Sektion scrollen kann — analog Speisekarte im OfferPanel. Der Hinweis
  // „Galerie aktivieren" bleibt für den normalen Fotos-Schritt.
  useEffect(() => {
    if (initialTarget !== "gallery") return;
    if (galleryPersisted) return;
    activateGallery();
    // Nur beim Öffnen des Extra-Editors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected =
    target === "hero"
      ? heroUrl
        ? [heroUrl]
        : []
      : target === "about"
        ? aboutUrl
          ? [aboutUrl]
          : []
        : galleryUrls;

  /**
   * Sofort-Übernahme (Studio-Befund „Bilder nicht in Echtzeit"): jede
   * Auswahl wird direkt per setImages persistiert; onApplied bumped die
   * Vorschau. Der lokale State bleibt dabei führend fürs Panel, die
   * Vorschau folgt nach dem Refetch. Ein laufender Patch blockiert weitere
   * Klicks (kein Lost-Update durch parallele Galerie-Patches); schlägt der
   * Patch fehl, rollt der State auf den Dokumentstand zurück.
   */
  const applyImages = (patch: ImagesPatch, rollback: () => void) => {
    setImages.mutate(
      { token, patch },
      { onSuccess: onApplied, onError: rollback }
    );
  };

  const handlePick = (url: string) => {
    if (upload.isPending || setImages.isPending) return;
    if (target === "hero") {
      const prev = heroUrl;
      if (prev === url) return;
      setHeroUrl(url);
      applyImages({ hero: url }, () => setHeroUrl(prev));
    } else if (target === "about") {
      const prev = aboutUrl;
      if (prev === url) return;
      setAboutUrl(url);
      applyImages({ about: url }, () => setAboutUrl(prev));
    } else {
      const prev = galleryUrls;
      let next: string[];
      if (prev.includes(url)) next = prev.filter(u => u !== url);
      else if (prev.length >= MAX_GALLERY_PHOTOS) return;
      else next = [...prev, url];
      setGalleryUrls(next);
      // Schutz bleibt: Abwahl des letzten Fotos bei bestehender Galerie
      // wird NICHT sofort gepatcht — das Leeren verlangt weiterhin den
      // expliziten „Galerie entfernen"-Button unten.
      if (next.length === 0 && hasExistingGallery) return;
      applyImages(
        { gallery: next.map(u => ({ url: u, alt: doc.businessName })) },
        () => setGalleryUrls(prev)
      );
    }
  };

  const persistGallery = (prev: string[], next: string[]) => {
    if (next.length === 0 && hasExistingGallery) return;
    applyImages(
      { gallery: next.map(u => ({ url: u, alt: doc.businessName })) },
      () => setGalleryUrls(prev)
    );
  };

  const handleMoveGallery = (index: number, direction: "up" | "down") => {
    if (upload.isPending || setImages.isPending) return;
    const prev = galleryUrls;
    const next = moveGalleryImage(prev, index, direction);
    if (next === prev) return;
    setGalleryUrls(next);
    persistGallery(prev, next);
  };

  const handleRemoveGallery = (index: number) => {
    if (upload.isPending || setImages.isPending) return;
    const prev = galleryUrls;
    const next = removeGalleryImage(prev, index);
    setGalleryUrls(next);
    persistGallery(prev, next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("Bitte ein Bild bis 5 MB wählen.");
      return;
    }
    if (!isAcceptedMime(file.type)) {
      setUploadError("Nur JPEG-, PNG- oder WebP-Dateien sind erlaubt.");
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setUploadError("Datei konnte nicht gelesen werden.");
        return;
      }
      upload.mutate(
        { token, imageData: dataUrl, mimeType: file.type as AcceptedMime },
        {
          onSuccess: result => {
            handlePick(result.url);
            sources.refetch();
          },
          onError: err => setUploadError(err.message),
        }
      );
    };
    reader.onerror = () => setUploadError("Datei konnte nicht gelesen werden.");
    reader.readAsDataURL(file);
  };

  const uploadedCount = sources.data?.uploaded.length ?? 0;
  const uploadLimitReached = uploadedCount >= MAX_UPLOADED_PHOTOS;
  const busy = upload.isPending || setImages.isPending;
  // Abwahl des letzten Galerie-Fotos bei bestehender Galerie: wird bewusst
  // NICHT auto-gepatcht (handlePick), sondern verlangt die explizite
  // „Galerie entfernen"-Aktion — ein versehentlicher Klick soll nie die
  // ganze Sektion löschen.
  const galleryWouldDeleteExisting =
    target === "gallery" && galleryUrls.length === 0 && hasExistingGallery;
  const galleryLocked = target === "gallery" && !galleryBooked;

  const removeGallery = () => {
    setImages.mutate(
      { token, patch: { gallery: [] } },
      { onSuccess: onApplied }
    );
  };

  return (
    <PanelFrame
      step="Schritt 2"
      title={initialTarget === "gallery" ? "Bildergalerie" : "Fotos wählen"}
      panelId="photos"
      onClose={onClose}
      intro={
        initialTarget === "gallery"
          ? "Lade Galerie-Fotos hoch, entferne sie oder sortiere sie mit den Pfeilen. Jede Änderung wird sofort übernommen."
          : "Wähle Fotos für Hero, Über uns und Galerie – aus Google-Fotos, Stockbildern oder eigenem Upload. Jede Auswahl wird sofort übernommen, die Vorschau aktualisiert sich automatisch."
      }
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onClose}
          >
            Schließen
          </button>
          {onNext && (
            <button
              type="button"
              className="pb-studio-btn"
              disabled={busy}
              onClick={onNext}
            >
              {busy ? "Bitte warten…" : "Weiter"}
            </button>
          )}
        </>
      }
    >
      <PhotoTargetPicker
        target={target}
        onTarget={nextTarget => {
          setTarget(nextTarget);
          onPreviewFocus?.(
            nextTarget === "hero"
              ? SECTION_ANCHORS.hero
              : nextTarget === "about"
                ? SECTION_ANCHORS.about
                : SECTION_ANCHORS.gallery
          );
        }}
        hasAbout={hasAbout}
      />
      {galleryLocked && (
        <GalleryAddonNotice
          onActivate={activateGallery}
          busy={updateAddons.isPending}
          error={updateAddons.error?.message ?? null}
        />
      )}
      {!galleryLocked && target === "gallery" && (
        <SelectedGalleryList
          urls={galleryUrls}
          onMove={handleMoveGallery}
          onRemove={handleRemoveGallery}
          busy={busy}
        />
      )}
      {!galleryLocked && (
        <>
          <div
            className="pb-studio-seg pb-studio-seg--fill pb-studio-src-tabs"
            role="group"
            aria-label="Fotoquelle"
          >
            <button
              type="button"
              aria-pressed={sourceTab === "gmb"}
              onClick={() => setSourceTab("gmb")}
            >
              Google-Fotos
            </button>
            <button
              type="button"
              aria-pressed={sourceTab === "stock"}
              onClick={() => setSourceTab("stock")}
            >
              Stockbilder
            </button>
            <button
              type="button"
              aria-pressed={sourceTab === "upload"}
              onClick={() => setSourceTab("upload")}
            >
              Hochladen
            </button>
          </div>
          {sources.isLoading && <p>Lade Fotos …</p>}
          {sources.error && (
            <p role="alert" style={{ color: "var(--st-warn)" }}>
              {sources.error.message}
            </p>
          )}
          {sourceTab === "gmb" && sources.data && (
            <PhotoGrid
              photos={sources.data.gmb}
              selected={selected}
              onPick={handlePick}
              emptyText="Keine Google-Fotos gefunden."
            />
          )}
          {sourceTab === "stock" && sources.data && (
            <>
              <PhotoGrid
                photos={sources.data.stock}
                selected={selected}
                onPick={handlePick}
                emptyText="Keine Vorschläge gefunden."
              />
              <StockPhotoSearch
                onSelect={handlePick}
                selectedUrl={target !== "gallery" ? selected[0] : undefined}
                defaultQuery={doc.businessCategory ?? ""}
              />
            </>
          )}
          {sourceTab === "upload" && (
            <>
              <label
                className="pb-studio-btn"
                data-variant="ghost"
                style={
                  upload.isPending || uploadLimitReached
                    ? { opacity: 0.45, cursor: "not-allowed" }
                    : undefined
                }
              >
                Foto auswählen
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={upload.isPending || uploadLimitReached}
                  style={{ display: "none" }}
                />
              </label>
              {upload.isPending && <p>Lade hoch …</p>}
              {uploadLimitReached && (
                <p style={{ color: "var(--st-muted)" }}>
                  Maximal 30 eigene Fotos erreicht.
                </p>
              )}
              {uploadError && (
                <p role="alert" style={{ color: "var(--st-warn)" }}>
                  {uploadError}
                </p>
              )}
              {sources.data && (
                <PhotoGrid
                  photos={sources.data.uploaded}
                  selected={selected}
                  onPick={handlePick}
                  emptyText="Noch keine eigenen Fotos hochgeladen."
                />
              )}
            </>
          )}
          {galleryWouldDeleteExisting && (
            <div>
              <p style={{ color: "var(--st-warn)" }}>
                Mindestens ein Foto wählen — oder die Galerie bewusst leeren.
              </p>
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                disabled={busy}
                onClick={removeGallery}
              >
                Galerie entfernen
              </button>
            </div>
          )}
        </>
      )}
      {setImages.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {setImages.error.message}
        </p>
      )}
    </PanelFrame>
  );
}

import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import StockPhotoSearch from "@/components/StockPhotoSearch";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
import type { AddOnFlags } from "@shared/pricing";
import type { AddonsPatch, ImagesPatch } from "@shared/onboardingV2/patches";
import { withAddOnEnabled } from "@shared/onboardingV2/addonEditors";
import { SECTION_ANCHORS } from "@/components/site/engine";
import { PanelFrame } from "./PanelFrame";
import {
  moveGalleryImage,
  removeGalleryImage,
  totalGalleryCount,
  withListUrls,
  MAX_GALLERY_ALBUMS,
  MAX_GALLERY_PHOTOS,
  type GalleryAlbumDraft,
  type GalleryListId,
} from "./galleryLogic";
import {
  GalleryAddonNotice,
  PhotoGrid,
  PhotoTargetPicker,
  SelectedGalleryList,
  type PhotoTarget,
} from "./photoParts";
import { AiPhotoGenerator } from "./AiPhotoGenerator";
import { PartnerLogosEditor } from "./PartnerLogosEditor";
import { CollagePicker } from "./CollagePicker";

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

type SourceTab = "gmb" | "stock" | "upload" | "ai";

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
  // Foto-Klick in der Vorschau bei bereits offenem Panel: das neue Ziel
  // nachziehen (initialTarget ändert sich dann, ohne dass das Panel
  // remountet).
  useEffect(() => {
    setTarget(initialTarget);
  }, [initialTarget]);
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
  // Alben (2026-08-30): benannte Zusatzgruppen neben der Hauptliste. Die
  // Chips unter dem Ziel-Umschalter wählen die aktive Liste; Auswahl,
  // Sortierung und Captions wirken immer auf die aktive Liste.
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbumDraft[]>(
    gallerySection?.albums?.map(album => ({
      title: album.title,
      urls: album.images.map(img => img.url),
    })) ?? []
  );
  const [activeList, setActiveList] = useState<GalleryListId>("main");
  // Sichtbare Bildunterschriften je URL (2026-08-29): getrennt vom alt-Text,
  // Packs zeigen nur noch caption an. Start: gespeicherte captions aus dem Doc.
  const [galleryCaptions, setGalleryCaptions] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      [
        ...(gallerySection?.images ?? []),
        ...(gallerySection?.albums ?? []).flatMap(album => album.images),
      ]
        .filter(i => i.caption)
        .map(i => [i.url, i.caption as string])
    )
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sources = trpc.onboardingV2.getPhotoSources.useQuery({ token });
  const upload = trpc.onboardingV2.uploadPhoto.useMutation();
  const setImages = trpc.onboardingV2.setImages.useMutation();
  const updateAddons = trpc.onboardingV2.updateAddons.useMutation();
  // Firmenlogo (2026-08-31): erster Schreibpfad für doc.logo — die Packs
  // rendern die Bild-Marke in Nav/Footer seit jeher, es fehlte nur die UI.
  const updateLogo = trpc.onboardingV2.updateLogo.useMutation();
  // Collage-Fotos (2026-09-03) liegen im designProfile, nicht in den
  // Sektionen — deshalb der Theme-Schreibpfad statt setImages.
  const updateTheme = trpc.onboardingV2.updateTheme.useMutation();
  const handleCollageChange = (urls: string[] | null) => {
    const profile = doc.designProfile;
    if (!profile) return;
    const next = { ...profile };
    if (urls === null) delete next.heroCollageImages;
    else next.heroCollageImages = urls;
    updateTheme.mutate(
      { token, designProfile: next },
      { onSuccess: () => onApplied?.() }
    );
  };
  const [logoError, setLogoError] = useState<string | null>(null);
  const currentLogoUrl = doc.logo?.kind === "image" ? doc.logo.url : null;

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setLogoError("Bitte eine Datei bis 5 MB wählen.");
      return;
    }
    if (!isAcceptedMime(file.type)) {
      setLogoError("Nur JPEG-, PNG- oder WebP-Dateien sind erlaubt.");
      return;
    }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setLogoError("Datei konnte nicht gelesen werden.");
        return;
      }
      updateLogo.mutate(
        {
          token,
          imageData: dataUrl,
          mimeType: file.type as AcceptedMime,
        },
        {
          onSuccess: onApplied,
          onError: err => setLogoError(err.message),
        }
      );
    };
    reader.onerror = () => setLogoError("Datei konnte nicht gelesen werden.");
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoError(null);
    updateLogo.mutate(
      { token, remove: true },
      {
        onSuccess: onApplied,
        onError: err => setLogoError(err.message),
      }
    );
  };

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

  const activeUrls =
    activeList === "main"
      ? galleryUrls
      : (galleryAlbums[activeList]?.urls ?? []);
  const selected =
    target === "hero"
      ? heroUrl
        ? [heroUrl]
        : []
      : target === "about"
        ? aboutUrl
          ? [aboutUrl]
          : []
        : activeUrls;

  /**
   * Sofort-Übernahme (Studio-Befund „Bilder nicht in Echtzeit"): jede
   * Auswahl wird direkt per setImages persistiert; onApplied bumped die
   * Vorschau. Der lokale State bleibt dabei führend fürs Panel, die
   * Vorschau folgt nach dem Refetch. Ein laufender Patch blockiert weitere
   * Klicks (kein Lost-Update durch parallele Galerie-Patches); schlägt der
   * Patch fehl, rollt der State auf den Dokumentstand zurück.
   */
  /** Galerie-Patch-Item: alt bleibt der Firmenname (A11y), caption nur wenn gesetzt. */
  const galleryItem = (url: string, captions = galleryCaptions) => ({
    url,
    alt: doc.businessName,
    ...(captions[url] ? { caption: captions[url] } : {}),
  });

  const applyImages = (patch: ImagesPatch, rollback: () => void) => {
    setImages.mutate(
      { token, patch },
      { onSuccess: onApplied, onError: rollback }
    );
  };

  /** Galerie + Alben als EIN Patch — hält die Zuordnung konsistent. */
  const galleryPatch = (
    main: string[],
    albums: GalleryAlbumDraft[],
    captions = galleryCaptions
  ): ImagesPatch => ({
    gallery: main.map(u => galleryItem(u, captions)),
    galleryAlbums: albums
      .filter(album => album.urls.length > 0)
      .map(album => ({
        title: album.title,
        images: album.urls.map(u => galleryItem(u, captions)),
      })),
  });

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
      const prev = activeUrls;
      let next: string[];
      if (prev.includes(url)) next = prev.filter(u => u !== url);
      else if (prev.length >= MAX_GALLERY_PHOTOS) return;
      else next = [...prev, url];
      const updated = withListUrls(
        galleryUrls,
        galleryAlbums,
        activeList,
        next
      );
      setGalleryUrls(updated.main);
      setGalleryAlbums(updated.albums);
      // Schutz bleibt: Abwahl des LETZTEN Fotos der gesamten Galerie bei
      // bestehender Galerie wird NICHT sofort gepatcht — das Leeren
      // verlangt weiterhin den expliziten „Galerie entfernen"-Button.
      if (
        totalGalleryCount(updated.main, updated.albums) === 0 &&
        hasExistingGallery
      )
        return;
      const prevMain = galleryUrls;
      const prevAlbums = galleryAlbums;
      applyImages(galleryPatch(updated.main, updated.albums), () => {
        setGalleryUrls(prevMain);
        setGalleryAlbums(prevAlbums);
      });
    }
  };

  const handleCaptionChange = (url: string, caption: string) => {
    const prev = galleryCaptions;
    const next = { ...prev };
    if (caption) next[url] = caption;
    else delete next[url];
    setGalleryCaptions(next);
    applyImages(galleryPatch(galleryUrls, galleryAlbums, next), () =>
      setGalleryCaptions(prev)
    );
  };

  const persistLists = (
    prevMain: string[],
    prevAlbums: GalleryAlbumDraft[],
    main: string[],
    albums: GalleryAlbumDraft[]
  ) => {
    if (totalGalleryCount(main, albums) === 0 && hasExistingGallery) return;
    applyImages(galleryPatch(main, albums), () => {
      setGalleryUrls(prevMain);
      setGalleryAlbums(prevAlbums);
    });
  };

  const handleMoveGallery = (index: number, direction: "up" | "down") => {
    if (upload.isPending || setImages.isPending) return;
    const next = moveGalleryImage(activeUrls, index, direction);
    if (next === activeUrls) return;
    const updated = withListUrls(galleryUrls, galleryAlbums, activeList, next);
    const prevMain = galleryUrls;
    const prevAlbums = galleryAlbums;
    setGalleryUrls(updated.main);
    setGalleryAlbums(updated.albums);
    persistLists(prevMain, prevAlbums, updated.main, updated.albums);
  };

  const handleRemoveGallery = (index: number) => {
    if (upload.isPending || setImages.isPending) return;
    const next = removeGalleryImage(activeUrls, index);
    const updated = withListUrls(galleryUrls, galleryAlbums, activeList, next);
    const prevMain = galleryUrls;
    const prevAlbums = galleryAlbums;
    setGalleryUrls(updated.main);
    setGalleryAlbums(updated.albums);
    persistLists(prevMain, prevAlbums, updated.main, updated.albums);
  };

  const handleAddAlbum = () => {
    if (galleryAlbums.length >= MAX_GALLERY_ALBUMS) return;
    const next = [
      ...galleryAlbums,
      { title: `Album ${galleryAlbums.length + 1}`, urls: [] },
    ];
    // Leere Alben werden erst mit dem ersten Bild persistiert — lokal
    // anlegen genügt, damit sofort Bilder zugeordnet werden können.
    setGalleryAlbums(next);
    setActiveList(next.length - 1);
  };

  const handleRenameAlbum = (index: number, title: string) => {
    const prevAlbums = galleryAlbums;
    const next = galleryAlbums.map((album, i) =>
      i === index ? { ...album, title } : album
    );
    setGalleryAlbums(next);
    if (!title.trim() || prevAlbums[index]?.urls.length === 0) return;
    applyImages(galleryPatch(galleryUrls, next), () =>
      setGalleryAlbums(prevAlbums)
    );
  };

  const handleRemoveAlbum = (index: number) => {
    const prevAlbums = galleryAlbums;
    const next = galleryAlbums.filter((_, i) => i !== index);
    setGalleryAlbums(next);
    setActiveList("main");
    if (prevAlbums[index]?.urls.length === 0) return;
    applyImages(galleryPatch(galleryUrls, next), () =>
      setGalleryAlbums(prevAlbums)
    );
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
    target === "gallery" &&
    totalGalleryCount(galleryUrls, galleryAlbums) === 0 &&
    hasExistingGallery;
  const galleryLocked = target === "gallery" && !galleryBooked;

  const removeGallery = () => {
    setGalleryAlbums([]);
    setActiveList("main");
    setImages.mutate(
      { token, patch: { gallery: [], galleryAlbums: [] } },
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
      {initialTarget !== "gallery" && (
        <section className="pb-studio-field-group">
          <p className="pb-studio-group-kicker">Dein Logo</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.9rem",
              flexWrap: "wrap",
            }}
          >
            {currentLogoUrl ? (
              <img
                src={currentLogoUrl}
                alt="Aktuelles Logo"
                style={{
                  height: 44,
                  maxWidth: 160,
                  objectFit: "contain",
                  background: "#fff",
                  borderRadius: 6,
                  padding: "4px 8px",
                }}
              />
            ) : (
              <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                Aktuell zeigt deine Website den Firmennamen als Schriftzug.
              </span>
            )}
            <label className="pb-studio-btn" data-variant="ghost">
              {updateLogo.isPending
                ? "Wird hochgeladen…"
                : currentLogoUrl
                  ? "Logo ersetzen"
                  : "Logo hochladen"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                disabled={updateLogo.isPending}
                onChange={handleLogoFile}
              />
            </label>
            {currentLogoUrl && (
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                disabled={updateLogo.isPending}
                onClick={removeLogo}
              >
                Logo entfernen
              </button>
            )}
          </div>
          {logoError && (
            <p role="alert" style={{ color: "var(--st-warn)", margin: 0 }}>
              {logoError}
            </p>
          )}
          <p style={{ fontSize: "0.78rem", opacity: 0.6, margin: 0 }}>
            PNG mit transparentem Hintergrund wirkt am besten — erscheint in der
            Navigation und im Footer statt des Schriftzugs.
          </p>
        </section>
      )}
      {initialTarget !== "gallery" && (
        <PartnerLogosEditor token={token} doc={doc} onApplied={onApplied} />
      )}
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
      {target === "hero" && (
        <CollagePicker
          doc={doc}
          onChange={handleCollageChange}
          busy={updateTheme.isPending}
          error={updateTheme.error?.message ?? null}
        />
      )}
      {galleryLocked && (
        <GalleryAddonNotice
          onActivate={activateGallery}
          busy={updateAddons.isPending}
          error={updateAddons.error?.message ?? null}
        />
      )}
      {!galleryLocked && target === "gallery" && (
        <>
          <div
            className="pb-studio-album-chips"
            role="group"
            aria-label="Galerie-Alben"
          >
            <button
              type="button"
              aria-pressed={activeList === "main"}
              onClick={() => setActiveList("main")}
            >
              Galerie ({galleryUrls.length})
            </button>
            {galleryAlbums.map((album, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={activeList === i}
                onClick={() => setActiveList(i)}
              >
                {album.title || `Album ${i + 1}`} ({album.urls.length})
              </button>
            ))}
            {galleryAlbums.length < MAX_GALLERY_ALBUMS && (
              <button
                type="button"
                data-variant="add"
                onClick={handleAddAlbum}
                aria-label="Album hinzufügen"
              >
                + Album
              </button>
            )}
          </div>
          {activeList !== "main" && galleryAlbums[activeList] && (
            <div className="pb-studio-album-head">
              <input
                type="text"
                className="pb-studio-input"
                value={galleryAlbums[activeList].title}
                maxLength={60}
                aria-label="Albumtitel"
                onChange={e => handleRenameAlbum(activeList, e.target.value)}
              />
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                disabled={busy}
                onClick={() => handleRemoveAlbum(activeList)}
              >
                Album löschen
              </button>
            </div>
          )}
          <SelectedGalleryList
            urls={activeUrls}
            captions={galleryCaptions}
            onCaptionChange={handleCaptionChange}
            onMove={handleMoveGallery}
            onRemove={handleRemoveGallery}
            busy={busy}
          />
        </>
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
            <button
              type="button"
              aria-pressed={sourceTab === "ai"}
              onClick={() => setSourceTab("ai")}
            >
              KI-Bilder
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
          {sourceTab === "ai" && (
            <AiPhotoGenerator
              token={token}
              onPick={handlePick}
              selected={selected}
              onGenerated={() => sources.refetch()}
            />
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

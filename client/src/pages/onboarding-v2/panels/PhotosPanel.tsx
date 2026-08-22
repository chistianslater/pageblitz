import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import StockPhotoSearch from "@/components/StockPhotoSearch";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
import { PanelFrame } from "./PanelFrame";
import { PhotoGrid, PhotoTargetPicker, type PhotoTarget } from "./photoParts";

// Serverseitig ist die base64-Data-URL auf 8.000.000 Zeichen begrenzt
// (ImagesPatchSchema/uploadPhoto-Input) — das entspricht roh ca. 5,7 MB.
// 5 MB clientseitig lässt Luft für den Data-URL-Overhead, damit keine
// clientseitig akzeptierte Datei am Server abgelehnt wird.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_GALLERY_PHOTOS = 12;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AcceptedMime = (typeof ACCEPTED_MIME_TYPES)[number];

function isAcceptedMime(type: string): type is AcceptedMime {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(type);
}

type SourceTab = "gmb" | "stock" | "upload";

interface PhotosPanelProps {
  token: string;
  doc: WebsiteDataV2;
  onApplied: () => void;
  onClose: () => void;
}

export function PhotosPanel({
  token,
  doc,
  onApplied,
  onClose,
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

  const [target, setTarget] = useState<PhotoTarget>("hero");
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

  const handlePick = (url: string) => {
    if (target === "hero") setHeroUrl(url);
    else if (target === "about") setAboutUrl(url);
    else
      setGalleryUrls(prev => {
        if (prev.includes(url)) return prev.filter(u => u !== url);
        if (prev.length >= MAX_GALLERY_PHOTOS) return prev;
        return [...prev, url];
      });
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

  const handleApply = () => {
    if (target === "hero") {
      if (!heroUrl) return;
      setImages.mutate(
        { token, patch: { hero: heroUrl } },
        { onSuccess: onApplied }
      );
    } else if (target === "about") {
      if (!aboutUrl) return;
      setImages.mutate(
        { token, patch: { about: aboutUrl } },
        { onSuccess: onApplied }
      );
    } else {
      setImages.mutate(
        {
          token,
          patch: {
            gallery: galleryUrls.map(url => ({ url, alt: doc.businessName })),
          },
        },
        { onSuccess: onApplied }
      );
    }
  };

  const busy = upload.isPending || setImages.isPending;
  const hasExistingGallery = !!gallerySection;
  // Bei Ziel "Galerie" ohne Auswahl UND ohne bestehende Galerie ist "leer
  // übernehmen" ein No-op (keine Sektion vorhanden) und erlaubt. Existiert
  // bereits eine Galerie, würde ein leerer Patch sie stillschweigend löschen
  // — das verlangt die explizite "Galerie entfernen"-Aktion unten statt eines
  // versehentlichen Klicks auf "Übernehmen".
  const galleryWouldDeleteExisting =
    target === "gallery" && galleryUrls.length === 0 && hasExistingGallery;
  const canApply =
    target === "gallery"
      ? !galleryWouldDeleteExisting
      : target === "hero"
        ? !!heroUrl
        : !!aboutUrl;

  const removeGallery = () => {
    setImages.mutate(
      { token, patch: { gallery: [] } },
      { onSuccess: onApplied }
    );
  };

  return (
    <PanelFrame
      step="Schritt 2"
      title="Fotos wählen"
      intro="Wähle Fotos für Hero, Über uns und Galerie – aus Google-Fotos, Stockbildern oder eigenem Upload."
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onClose}
          >
            Fertig
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            disabled={busy || !canApply}
            onClick={handleApply}
          >
            {busy ? "Bitte warten…" : "Übernehmen"}
          </button>
        </>
      }
    >
      <PhotoTargetPicker
        target={target}
        onTarget={setTarget}
        hasAbout={hasAbout}
      />
      <div
        className="pb-studio-seg pb-studio-src-tabs"
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
              upload.isPending
                ? { opacity: 0.45, cursor: "not-allowed" }
                : undefined
            }
          >
            Foto auswählen
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={upload.isPending}
              style={{ display: "none" }}
            />
          </label>
          {upload.isPending && <p>Lade hoch …</p>}
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
      {setImages.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {setImages.error.message}
        </p>
      )}
    </PanelFrame>
  );
}

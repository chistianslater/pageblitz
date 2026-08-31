import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";

/**
 * Partner/Zertifikate-Verwaltung (2026-08-31, Fotos-Panel): Logos hochladen
 * (uploadPartnerLogo, WebP mit Transparenz), Namen/Links pflegen, entfernen.
 * Jede Änderung schreibt sofort die komplette Sektion (updatePartners);
 * die letzte Löschung entfernt die Sektion von der Website.
 * Name/Link speichern beim Verlassen des Felds, nicht je Tastendruck.
 */
const MAX_PARTNER_LOGOS = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"] as const;
type AcceptedMime = (typeof ACCEPTED)[number];

interface PartnerItem {
  imageUrl: string;
  name: string;
  url?: string;
}

function itemsFromDoc(doc: WebsiteDataV2): PartnerItem[] {
  const section = doc.sections.find(
    (s): s is SectionOf<"partners"> => s.type === "partners"
  );
  return section?.items.map(item => ({ ...item })) ?? [];
}

export function PartnerLogosEditor({
  token,
  doc,
  onApplied,
}: {
  token: string;
  doc: WebsiteDataV2;
  onApplied: () => void;
}) {
  const [items, setItems] = useState<PartnerItem[]>(() => itemsFromDoc(doc));
  const [error, setError] = useState<string | null>(null);
  const uploadLogo = trpc.onboardingV2.uploadPartnerLogo.useMutation();
  const updatePartners = trpc.onboardingV2.updatePartners.useMutation();
  const busy = uploadLogo.isPending || updatePartners.isPending;

  const save = (next: PartnerItem[]) => {
    setItems(next);
    setError(null);
    updatePartners.mutate(
      {
        token,
        // Leere Namen (noch nicht ausgefüllt) blocken das Speichern nicht —
        // sie gehen als "Partner" raus und bleiben im Feld editierbar.
        items: next.map(item => ({
          imageUrl: item.imageUrl,
          name: item.name.trim() || "Partner",
          ...(item.url?.trim() ? { url: item.url.trim() } : {}),
        })),
      },
      {
        onSuccess: onApplied,
        onError: err => setError(err.message),
      }
    );
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("Bitte eine Datei bis 5 MB wählen.");
      return;
    }
    if (!(ACCEPTED as readonly string[]).includes(file.type)) {
      setError("Nur JPEG-, PNG- oder WebP-Dateien sind erlaubt.");
      return;
    }
    setError(null);
    const defaultName =
      file.name.replace(/\.[^.]+$/, "").trim().slice(0, 60) || "Partner";
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setError("Datei konnte nicht gelesen werden.");
        return;
      }
      uploadLogo.mutate(
        { token, imageData: dataUrl, mimeType: file.type as AcceptedMime },
        {
          onSuccess: result =>
            save([...items, { imageUrl: result.url, name: defaultName }]),
          onError: err => setError(err.message),
        }
      );
    };
    reader.onerror = () => setError("Datei konnte nicht gelesen werden.");
    reader.readAsDataURL(file);
  };

  const patchItem = (index: number, patch: Partial<PartnerItem>) => {
    setItems(current =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  return (
    <section className="pb-studio-field-group">
      <p className="pb-studio-group-kicker">Partner &amp; Zertifikate</p>
      <p style={{ fontSize: "0.78rem", opacity: 0.6, margin: 0 }}>
        Logos von Partnern, Verbänden oder Siegeln — erscheinen als dezente
        Leiste auf deiner Website. Ohne Logos gibt es die Sektion nicht.
      </p>
      {items.map((item, index) => (
        <div
          key={item.imageUrl}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
          }}
        >
          <img
            src={item.imageUrl}
            alt=""
            style={{
              height: 36,
              width: 72,
              objectFit: "contain",
              background: "#fff",
              borderRadius: 6,
              padding: "3px 6px",
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            className="pb-studio-input"
            style={{ flex: "1 1 130px" }}
            maxLength={60}
            placeholder="Name (z. B. Handwerkskammer)"
            aria-label={`Name für Logo ${index + 1}`}
            value={item.name}
            onChange={e => patchItem(index, { name: e.target.value })}
            onBlur={() => save(items)}
          />
          <input
            type="url"
            className="pb-studio-input"
            style={{ flex: "1 1 150px" }}
            placeholder="Link (optional)"
            aria-label={`Link für Logo ${index + 1}`}
            value={item.url ?? ""}
            onChange={e => patchItem(index, { url: e.target.value })}
            onBlur={() => save(items)}
          />
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={busy}
            aria-label={`Logo ${item.name || index + 1} entfernen`}
            onClick={() => save(items.filter((_, i) => i !== index))}
          >
            ✕
          </button>
        </div>
      ))}
      {items.length < MAX_PARTNER_LOGOS && (
        <label className="pb-studio-btn" data-variant="ghost">
          {uploadLogo.isPending
            ? "Wird hochgeladen…"
            : "Partner-Logo hinzufügen"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            disabled={busy}
            onChange={handleFile}
          />
        </label>
      )}
      {error && (
        <p role="alert" style={{ color: "var(--st-warn)", margin: 0 }}>
          {error}
        </p>
      )}
    </section>
  );
}

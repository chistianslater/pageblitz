import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import StockPhotoSearch from "@/components/StockPhotoSearch";
import {
  MAX_TEAM_MEMBERS,
  addMember,
  moveMember,
  removeMember,
  updateMember,
  validateTeam,
  type TeamMember,
  type TeamValue,
} from "./teamLogic";

export type { TeamValue };

// Deckt sich mit PhotosPanel.tsx (MAX_UPLOAD_BYTES/ACCEPTED_MIME_TYPES) —
// derselbe Upload-Weg (onboardingV2.uploadPhoto), nur pro Mitgliederzeile
// statt pro Zielfläche (Hero/Über uns/Galerie).
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AcceptedMime = (typeof ACCEPTED_MIME_TYPES)[number];
function isAcceptedMime(type: string): type is AcceptedMime {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(type);
}

function memberLabel(member: TeamMember, index: number): string {
  const trimmed = member.name.trim();
  return trimmed ? `‚${trimmed}‘` : `Mitglied ${index + 1}`;
}

interface TeamEditorProps {
  token: string;
  value: TeamValue;
  onChange: (next: TeamValue) => void;
}

/**
 * Mitglieder-Editor für den "Team pflegen"-Unterbereich des Extras-Panels
 * (AddonsPanel.tsx). Fotoauswahl nutzt bewusst denselben Weg wie das
 * Fotos-Panel (Stockbilder über StockPhotoSearch, eigener Upload über
 * onboardingV2.uploadPhoto) statt einer neuen Upload-Route — ohne
 * Google-Fotos-Tab, da GMB-Fotos für Mitarbeiterporträts selten passen.
 */
export function TeamEditor({ token, value, onChange }: TeamEditorProps) {
  const { members, headline } = value;
  const [photoRowIndex, setPhotoRowIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const upload = trpc.onboardingV2.uploadPhoto.useMutation();
  const errors = validateTeam(members);

  const setMembers = (next: TeamMember[]) => onChange({ headline, members: next });

  const handlePhotoPicked = (index: number, url: string) => {
    setMembers(updateMember(members, index, { imageUrl: url }));
    setPhotoRowIndex(null);
  };

  const handleFileChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
            onSuccess: result => handlePhotoPicked(index, result.url),
            onError: err => setUploadError(err.message),
          }
        );
      };
      reader.onerror = () => setUploadError("Datei konnte nicht gelesen werden.");
      reader.readAsDataURL(file);
    };

  return (
    <div className="pb-studio-rows">
      <div className="pb-studio-field">
        <label htmlFor="pb-team-headline">Überschrift (optional)</label>
        <input
          id="pb-team-headline"
          type="text"
          className="pb-studio-input"
          maxLength={80}
          value={headline ?? ""}
          onChange={e => onChange({ headline: e.target.value, members })}
        />
      </div>
      {errors.length > 0 && (
        <ul
          role="alert"
          style={{
            color: "var(--st-warn)",
            margin: 0,
            paddingLeft: "1.25rem",
            fontSize: "0.85rem",
          }}
        >
          {errors.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      )}
      {members.length === 0 && (
        <p style={{ color: "var(--st-muted)" }}>
          Noch keine Mitglieder — füge das erste Teammitglied hinzu.
        </p>
      )}
      {members.map((member, i) => (
        <div className="pb-studio-cat" key={i}>
          <div className="pb-studio-team-header">
            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt=""
                className="pb-studio-team-avatar"
              />
            ) : (
              <div className="pb-studio-team-avatar" aria-hidden="true" />
            )}
            <div className="pb-studio-team-fields">
              <input
                aria-label="Name"
                type="text"
                className="pb-studio-input"
                placeholder="Name"
                maxLength={80}
                value={member.name}
                aria-invalid={member.name.trim() === "" ? "true" : undefined}
                onChange={e =>
                  setMembers(updateMember(members, i, { name: e.target.value }))
                }
              />
              <input
                aria-label="Rolle (optional)"
                type="text"
                className="pb-studio-input"
                placeholder="Rolle (optional)"
                maxLength={80}
                value={member.role ?? ""}
                onChange={e =>
                  setMembers(updateMember(members, i, { role: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="pb-studio-team-actions">
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              onClick={() =>
                setPhotoRowIndex(photoRowIndex === i ? null : i)
              }
            >
              {member.imageUrl ? "Foto ändern" : "Foto wählen"}
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              aria-label={`${memberLabel(member, i)} nach oben verschieben`}
              disabled={i === 0}
              onClick={() => setMembers(moveMember(members, i, "up"))}
            >
              ↑
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              aria-label={`${memberLabel(member, i)} nach unten verschieben`}
              disabled={i === members.length - 1}
              onClick={() => setMembers(moveMember(members, i, "down"))}
            >
              ↓
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              aria-label={`${memberLabel(member, i)} entfernen`}
              onClick={() => setMembers(removeMember(members, i))}
            >
              Entfernen
            </button>
          </div>
          {photoRowIndex === i && (
            <div className="pb-studio-rows">
              <label
                className="pb-studio-btn"
                data-variant="ghost"
                style={
                  upload.isPending
                    ? { opacity: 0.45, cursor: "not-allowed" }
                    : undefined
                }
              >
                Foto hochladen
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange(i)}
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
              <StockPhotoSearch
                onSelect={url => handlePhotoPicked(i, url)}
                selectedUrl={member.imageUrl}
              />
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="pb-studio-btn"
        data-variant="ghost"
        disabled={members.length >= MAX_TEAM_MEMBERS}
        onClick={() => setMembers(addMember(members))}
      >
        Mitglied hinzufügen
      </button>
    </div>
  );
}

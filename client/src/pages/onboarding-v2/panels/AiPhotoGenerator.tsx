import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { PhotoGrid } from "./photoParts";

interface AiPhotoGeneratorProps {
  token: string;
  /** Klick auf ein generiertes Bild — gleiche Übernahme wie Stock/Upload. */
  onPick: (url: string) => void;
  selected: string[];
  /** Nach erfolgreicher Generierung (Foto-Quellen neu laden). */
  onGenerated: () => void;
}

/**
 * „KI-Bilder"-Tab im Fotos-Panel: kurze Beschreibung rein, Cloudflare
 * Workers AI (Flux-1-schnell) generiert ein fotorealistisches Bild, das
 * serverseitig wie ein Upload behandelt wird (R2 + photoUrls). Die in
 * dieser Sitzung generierten Bilder bleiben hier sichtbar; dauerhaft
 * liegen sie zusätzlich unter „Hochladen".
 */
export function AiPhotoGenerator({
  token,
  onPick,
  selected,
  onGenerated,
}: AiPhotoGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<string[]>([]);
  const generate = trpc.onboardingV2.generateAiPhoto.useMutation();

  const trimmed = prompt.trim();
  const canGenerate = trimmed.length >= 3 && !generate.isPending;

  const handleGenerate = () => {
    if (!canGenerate) return;
    generate.mutate(
      { token, prompt: trimmed },
      {
        onSuccess: ({ url }) => {
          setGenerated(prev => [url, ...prev]);
          onGenerated();
        },
      }
    );
  };

  return (
    <div className="pb-studio-ai-gen">
      <label htmlFor="pb-ai-photo-prompt">
        Beschreibe das Bild — die KI macht ein Foto daraus.
      </label>
      <input
        id="pb-ai-photo-prompt"
        type="text"
        className="pb-studio-input"
        placeholder="z. B. Moderner Empfangsbereich mit frischen Blumen"
        value={prompt}
        maxLength={300}
        onChange={event => setPrompt(event.target.value)}
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleGenerate();
          }
        }}
      />
      <button
        type="button"
        className="pb-studio-btn"
        disabled={!canGenerate}
        onClick={handleGenerate}
      >
        {generate.isPending
          ? "Wird generiert … (ca. 10 Sek.)"
          : "Bild generieren"}
      </button>
      {generate.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {generate.error.message}
        </p>
      )}
      {generated.length > 0 && (
        <PhotoGrid
          photos={generated}
          selected={selected}
          onPick={onPick}
          emptyText=""
        />
      )}
      <p style={{ color: "var(--st-muted)", fontSize: "0.8rem" }}>
        Generierte Bilder findest du dauerhaft unter „Hochladen". Maximal 10
        Bilder pro Stunde.
      </p>
    </div>
  );
}

import React from "react";
import {
  History,
  MessageSquare,
  Pencil,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { VersionTrigger } from "../../../../../server/onboardingV2/versions";
import { PanelFrame } from "./PanelFrame";
import { formatVersionTime, TRIGGER_LABELS } from "./versionsLogic";

/**
 * Verlauf (2026-09-03, Betreiber: „Liste + Rückgängig-Knopf"): alle
 * gespeicherten Stände der Website, jüngster zuerst. Klick auf einen Stand
 * zeigt ihn nur in der Vorschau (`?version=<id>`, nichts wird geschrieben);
 * erst „Wiederherstellen" übernimmt ihn — als neuer Stand, sodass der
 * Schritt selbst wieder rückgängig gemacht werden kann.
 */

export interface VersionRow {
  id: number;
  trigger: VersionTrigger;
  label: string;
  createdAt: Date;
}

const TRIGGER_ICONS: Record<VersionTrigger, React.ReactNode> = {
  generation: <Sparkles />,
  chat: <MessageSquare />,
  panel: <Pencil />,
  inline: <Pencil />,
  restore: <RotateCcw />,
};

export function VersionList({
  versions,
  previewId,
  onPreview,
  now,
}: {
  versions: VersionRow[];
  previewId: number | null;
  onPreview: (id: number | null) => void;
  /** Nur für Tests: Bezugszeit für die relative Anzeige. */
  now?: Date;
}) {
  if (versions.length === 0) {
    return (
      <p className="pb-versions-empty">
        Noch keine früheren Stände — sobald du etwas änderst, erscheint hier
        jeder Schritt.
      </p>
    );
  }
  return (
    <ol className="pb-versions-list" aria-label="Gespeicherte Stände">
      {versions.map((version, index) => {
        const isCurrent = index === 0;
        const pressed = previewId === version.id;
        return (
          <li key={version.id}>
            <button
              type="button"
              className="pb-versions-row"
              aria-pressed={pressed}
              data-current={isCurrent || undefined}
              title={
                isCurrent
                  ? "Das ist der aktuelle Stand"
                  : "In der Vorschau ansehen"
              }
              onClick={() => onPreview(isCurrent ? null : version.id)}
            >
              <span className="pb-versions-icon" aria-hidden="true">
                {TRIGGER_ICONS[version.trigger]}
              </span>
              <span className="pb-versions-body">
                <span className="pb-versions-label">{version.label}</span>
                <span className="pb-versions-meta">
                  {formatVersionTime(version.createdAt, now)} ·{" "}
                  {TRIGGER_LABELS[version.trigger]}
                </span>
              </span>
              {isCurrent && (
                <span className="pb-versions-badge">Aktueller Stand</span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function VersionsPanel({
  token,
  previewId,
  onPreview,
  onRestored,
  onClose,
}: {
  token: string;
  /** Stand, der gerade in der Vorschau gezeigt wird (null = aktueller Stand). */
  previewId: number | null;
  onPreview: (id: number | null) => void;
  onRestored: () => void;
  onClose: () => void;
}) {
  const list = trpc.onboardingV2.listVersions.useQuery({ token });
  const restore = trpc.onboardingV2.restoreVersion.useMutation();
  const versions = (list.data?.versions ?? []) as VersionRow[];
  const previewed = versions.find(v => v.id === previewId) ?? null;

  const handleRestore = () => {
    if (!previewId) return;
    restore.mutate(
      { token, versionId: previewId },
      {
        onSuccess: () => {
          onPreview(null);
          void list.refetch();
          onRestored();
        },
      }
    );
  };

  return (
    <PanelFrame
      step="Werkzeug"
      title="Verlauf"
      panelId="versions"
      onClose={onClose}
      intro="Jede Änderung wird als Stand gesichert. Klicke einen Stand an, um ihn in der Vorschau zu sehen — erst „Wiederherstellen“ übernimmt ihn."
      footer={
        previewed ? (
          <>
            <button
              type="button"
              className="pb-studio-btn"
              disabled={restore.isPending}
              onClick={handleRestore}
            >
              <History aria-hidden="true" />{" "}
              {restore.isPending
                ? "Wird wiederhergestellt …"
                : "Wiederherstellen"}
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              disabled={restore.isPending}
              onClick={() => onPreview(null)}
            >
              Abbrechen
            </button>
          </>
        ) : (
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onClose}
          >
            Schließen
          </button>
        )
      }
    >
      {previewed && (
        <p className="pb-versions-notice" role="status">
          Vorschau zeigt „{previewed.label}“ (
          {formatVersionTime(previewed.createdAt)}). Noch ist nichts geändert.
        </p>
      )}
      {list.isLoading ? (
        <p className="pb-versions-empty">Lade Verlauf …</p>
      ) : list.error ? (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {list.error.message}
        </p>
      ) : (
        <VersionList
          versions={versions}
          previewId={previewId}
          onPreview={onPreview}
        />
      )}
      {restore.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {restore.error.message}
        </p>
      )}
    </PanelFrame>
  );
}

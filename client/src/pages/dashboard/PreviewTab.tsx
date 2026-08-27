import { ExternalLink } from "lucide-react";
import { StudioCard } from "./StudioCard";

interface PreviewTabProps {
  slug: string;
  status: string;
  previewToken: string;
  /** Erhöht sich nach jeder Studio-Änderung, um den iframe neu zu laden. */
  reloadKey: number;
}

/**
 * Vorschau-Tab: iframe auf `/preview-ssr/<token>` statt eines
 * `SiteRenderer`-Client-Renders. Begründung (Cutover-Spec/Task 4):
 * `/preview-ssr/:token` ist derselbe SSR-Endpunkt, den das Studio bereits
 * für seine Live-Vorschau nutzt (`PreviewFrame.tsx`) — die Dashboard-Vorschau
 * wird damit byte-identisch zur echten Live-Ausgabe, statt eine zweite
 * Render-/Hydrations-Logik im Dashboard zu pflegen (v2-Dokument laden,
 * validieren, `SiteRenderer` mit `islandsMode="preview"` hydrieren). Die
 * robustere Variante ist der iframe: kein Duplikat-Renderpfad, kein
 * Client-seitiges Nachbauen der Inseln-Logik, und jede Studio-Änderung ist
 * sofort sichtbar, weil beide Oberflächen denselben Endpunkt treffen.
 */
export function PreviewTab({
  slug,
  status,
  previewToken,
  reloadKey,
}: PreviewTabProps) {
  return (
    <div className="space-y-4">
      <StudioCard previewToken={previewToken} />
      <div className="bg-lp-surface border border-lp-line rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-lp-line flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 bg-lp-canvas rounded-lg px-3 py-1 text-lp-muted text-xs font-mono">
            {slug}.pageblitz.de
          </div>
          {status === "active" && (
            <a
              href={`/site/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website in neuem Tab öffnen"
              title="Website in neuem Tab öffnen"
              className="text-lp-muted hover:text-lp-ink"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        <div className="relative" style={{ height: "calc(100vh - 340px)" }}>
          <iframe
            key={reloadKey}
            src={`/preview-ssr/${previewToken}`}
            title="Vorschau deiner Website"
            loading="eager"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}

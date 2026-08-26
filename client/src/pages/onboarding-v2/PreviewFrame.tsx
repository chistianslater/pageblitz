import React from "react";
import type { PackId } from "@shared/siteContract/types";

interface PreviewFrameProps {
  token: string;
  version: number;
  device: "desktop" | "mobile";
  packOverride?: PackId;
  /** Unterseiten-Vorschau (Plan B6 Task 5): Slug der Page → `/preview-ssr/<token>/<slug>`; ohne → Startseite. */
  pageSlug?: string;
  /**
   * Zeitmaschine (Plan B7 Task 4): true → `?reveal=1` an die Vorschau-URL —
   * das SSR-HTML fadet seine Sektionen nacheinander ein (nur Preview-Modus,
   * siehe server/ssr/renderSite.tsx). StudioPage setzt das genau für den
   * ersten Load nach einer frisch beobachteten Generierung.
   */
  reveal?: boolean;
  /** Aktuelle Dokumenttexte zum robusten Auffinden im pack-spezifischen DOM. */
  inlineTexts?: Partial<Record<InlineTextField, string>>;
  /** Speichert direkte Änderungen aus dem Preview-iframe. */
  onInlineTextEdit?: (field: InlineTextField, value: string) => void;
}

export type InlineTextField =
  | "headline"
  | "subheadline"
  | "aboutHeadline"
  | "aboutBody";

const INLINE_TARGETS: Record<
  InlineTextField,
  { scope: string; selector: string; maxLength: number; multiline: boolean }
> = {
  headline: {
    scope: "#start",
    selector: "h1",
    maxLength: 120,
    multiline: false,
  },
  subheadline: {
    scope: "#start",
    selector: "p",
    maxLength: 240,
    multiline: false,
  },
  aboutHeadline: {
    scope: "#ueber-uns",
    selector: "h2",
    maxLength: 120,
    multiline: false,
  },
  aboutBody: {
    scope: "#ueber-uns",
    selector: "p",
    maxLength: 2000,
    multiline: true,
  },
};

export function normalizeInlineText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Pfad der Vorschau (Startseite oder Unterseite) — von PreviewFrame und "In neuem Tab öffnen" geteilt. */
export function previewPath(token: string, pageSlug?: string): string {
  return pageSlug
    ? `/preview-ssr/${token}/${pageSlug}`
    : `/preview-ssr/${token}`;
}

export function PreviewFrame({
  token,
  version,
  device,
  packOverride,
  pageSlug,
  reveal,
  inlineTexts,
  onInlineTextEdit,
}: PreviewFrameProps) {
  const params = new URLSearchParams();
  if (packOverride) params.set("pack", packOverride);
  if (reveal) params.set("reveal", "1");
  params.set("v", String(version)); // Cache-Bust nach jedem Patch (Server ist ohnehin no-store)
  const src = `${previewPath(token, pageSlug)}?${params.toString()}`;

  const enableInlineEditing = (
    iframe: React.SyntheticEvent<HTMLIFrameElement>
  ) => {
    if (!inlineTexts || !onInlineTextEdit || pageSlug) return;
    const doc = iframe.currentTarget.contentDocument;
    if (!doc) return;

    const style = doc.createElement("style");
    style.setAttribute("data-pb-inline-style", "");
    style.textContent = `
      [data-pb-inline-edit]{cursor:text;outline:1px dashed transparent;outline-offset:5px;transition:outline-color .15s,background-color .15s}
      [data-pb-inline-edit]:hover{outline-color:rgba(31,95,75,.55);background:rgba(31,95,75,.04)}
      [data-pb-inline-edit]:focus{outline:2px solid #1f5f4b;background:rgba(31,95,75,.07)}
    `;
    doc.head.appendChild(style);

    for (const [field, currentValue] of Object.entries(inlineTexts) as Array<
      [InlineTextField, string]
    >) {
      if (!currentValue) continue;
      const config = INLINE_TARGETS[field];
      const scope = doc.querySelector(config.scope);
      if (!scope) continue;
      const candidates = Array.from(
        scope.querySelectorAll<HTMLElement>(config.selector)
      );
      const normalizedCurrent = normalizeInlineText(currentValue);
      const target =
        candidates.find(
          el => normalizeInlineText(el.innerText) === normalizedCurrent
        ) ?? (candidates.length === 1 ? candidates[0] : null);
      if (!target) continue;

      target.setAttribute("contenteditable", "plaintext-only");
      target.setAttribute("data-pb-inline-edit", field);
      target.setAttribute("title", "Klicken und direkt bearbeiten");
      target.setAttribute("spellcheck", "true");
      let original = target.innerText;

      target.addEventListener("focus", () => {
        original = target.innerText;
      });
      target.addEventListener("paste", event => {
        event.preventDefault();
        const text = event.clipboardData?.getData("text/plain") ?? "";
        doc.execCommand("insertText", false, text);
      });
      target.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          event.preventDefault();
          target.innerText = original;
          target.blur();
        } else if (event.key === "Enter" && !config.multiline) {
          event.preventDefault();
          target.blur();
        }
      });
      target.addEventListener("blur", () => {
        const value = target.innerText.trim();
        if (!value || value.length > config.maxLength) {
          target.innerText = original;
          return;
        }
        if (normalizeInlineText(value) !== normalizeInlineText(original)) {
          onInlineTextEdit(field, value);
        }
      });
    }
  };
  return (
    <div className="pb-studio-device" data-device={device}>
      <iframe
        key={src}
        src={src}
        title="Live-Vorschau deiner Website"
        loading="eager"
        onLoad={enableInlineEditing}
      />
    </div>
  );
}

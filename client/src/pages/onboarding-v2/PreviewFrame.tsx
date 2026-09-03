import React, { useCallback, useEffect, useRef } from "react";
import type { PackId, SectionType } from "@shared/siteContract/types";
import type { DesignProfile } from "@shared/siteContract/designProfile";
import type { InlineTextTarget } from "@shared/onboardingV2/inlineText";
import {
  richHtml,
  serializeRichDom,
  stripMarks,
} from "@/components/site/richText";
import { enableInlineFormatToolbar } from "./previewInlineFormat";
import { enablePreviewLayoutChrome } from "./previewLayoutChrome";

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
  inlineTargets?: InlineTextTarget[];
  /** Speichert direkte Änderungen aus dem Preview-iframe. */
  onInlineTextEdit?: (path: string, value: string) => void;
  /** Sektionsanker, der beim Bearbeiten rechts sichtbar sein soll. */
  focusAnchor?: string | null;
  /** Kompositionsprofil — Layout-Buttons in der Vorschau. */
  designProfile?: DesignProfile | null;
  /** Speichert ein in der Vorschau gewähltes Sektions-Layout. */
  onSectionLayout?: (profile: DesignProfile) => void;
  /** Meldet das geladene iframe z. B. für Scroll-Weiterleitung im Splash. */
  onIframeReady?: (iframe: HTMLIFrameElement) => void;
  /**
   * Live-Spiegel des Texte-Panels (2026-08-30): Inline-Pfad → aktueller
   * Eingabewert. Wird direkt ins DOM der Vorschau geschrieben (richHtml),
   * ohne Server-Roundtrip — Speichern persistiert wie gehabt.
   */
  draftValues?: Record<string, string>;
  /**
   * Foto-Klick (2026-08-30): Klick auf ein Bild in Hero/Über uns/Galerie
   * öffnet das Fotos-Panel mit diesem Ziel. Im Studio ersetzt das die
   * Lightbox der Live-Site (Capture-Listener stoppt deren Handler).
   */
  onPickPhoto?: (target: PhotoClickTarget) => void;
  /**
   * Verlauf (2026-09-03): id eines gespeicherten Stands → `?version=<id>`,
   * die Vorschau zeigt diesen Stand statt des Dokuments (nur lesen).
   */
  versionId?: number | null;
  /** Plus-Zonen (2026-09-03): Klick auf „Sektion einfügen" hinter einer Sektion. */
  onInsertSection?: (afterType: SectionType) => void;
}

export type PhotoClickTarget = "hero" | "about" | "gallery";

/** Ziel des Fotos-Panels anhand der umgebenden Sektion — null außerhalb. */
export function photoClickTargetOf(el: Element): PhotoClickTarget | null {
  const section = el.closest("#start,#ueber-uns,#galerie");
  if (!section) return null;
  if (section.id === "start") return "hero";
  if (section.id === "ueber-uns") return "about";
  return "gallery";
}

export function normalizeInlineText(value: string): string {
  // Case-Fold (2026-08-30): Packs rendern Texte per CSS text-transform in
  // GROSSBUCHSTABEN — innerText liefert den GERENDERTEN Text, sodass der
  // Vergleich mit dem Dokumentwert sonst nie matcht (Werkbank-H1 war
  // dadurch nicht inline-editierbar).
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("de-DE");
}

/** Echte Google-Bewertungen (und andere gesperrte Hosts) nicht editierbar. */
export function isInlineLocked(el: Element): boolean {
  return Boolean(el.closest("[data-pb-readonly]"));
}

/** Pfad der Vorschau (Startseite oder Unterseite) — von PreviewFrame und "In neuem Tab öffnen" geteilt. */
export function previewPath(token: string, pageSlug?: string): string {
  return pageSlug
    ? `/preview-ssr/${token}/${pageSlug}`
    : `/preview-ssr/${token}`;
}

/** Vorschau-URL inkl. Pack-Override, Verlaufs-Stand, Reveal und Cache-Bust. */
export function buildPreviewSrc(args: {
  token: string;
  version: number;
  pageSlug?: string;
  packOverride?: PackId;
  reveal?: boolean;
  versionId?: number | null;
}): string {
  const params = new URLSearchParams();
  if (args.packOverride) params.set("pack", args.packOverride);
  if (args.versionId) params.set("version", String(args.versionId));
  if (args.reveal) params.set("reveal", "1");
  params.set("v", String(args.version)); // Cache-Bust nach jedem Patch (Server ist ohnehin no-store)
  return `${previewPath(args.token, args.pageSlug)}?${params.toString()}`;
}

export function PreviewFrame({
  token,
  version,
  device,
  packOverride,
  pageSlug,
  reveal,
  inlineTargets,
  onInlineTextEdit,
  focusAnchor,
  designProfile,
  onSectionLayout,
  onIframeReady,
  draftValues,
  onPickPhoto,
  versionId,
  onInsertSection,
}: PreviewFrameProps) {
  const src = buildPreviewSrc({
    token,
    version,
    pageSlug,
    packOverride,
    reveal,
    versionId,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const scrollToFocus = useCallback(() => {
    if (!focusAnchor) return;
    const doc = iframeRef.current?.contentDocument;
    const target = doc?.getElementById(focusAnchor);
    if (!target) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
    if (!reduceMotion && typeof target.animate === "function") {
      target.animate(
        [
          { outline: "2px solid rgba(31,95,75,0)", outlineOffset: "10px" },
          { outline: "2px solid rgba(31,95,75,.75)", outlineOffset: "6px" },
          { outline: "2px solid rgba(31,95,75,0)", outlineOffset: "10px" },
        ],
        { duration: 900, easing: "ease-out" }
      );
    }
  }, [focusAnchor]);

  useEffect(() => {
    // Panel-/Feldwechsel nach bereits geladenem iframe.
    const id = window.setTimeout(scrollToFocus, 60);
    return () => window.clearTimeout(id);
  }, [scrollToFocus, src]);

  // Race-Guard (2026-08-30): Das SSR-iframe kann fertig geladen sein, BEVOR
  // React den onLoad-Handler anhängt — dann lief das Inline-Wiring nie und
  // „Klicken und direkt bearbeiten" fehlte komplett. Beim Mount/Target-
  // Wechsel nachziehen; doppelte Verdrahtung verhindert der Style-Marker.
  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    if (el.contentDocument?.readyState === "complete") {
      enableInlineEditing(el);
    }
    // enableInlineEditing ist absichtlich keine Dep (ändert sich je Render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, inlineTargets, pageSlug]);

  // Live-Spiegel: Panel-Eingaben sofort in die passenden Vorschau-Elemente
  // schreiben. Das gerade inline fokussierte Element bleibt unangetastet.
  useEffect(() => {
    if (!draftValues || pageSlug) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    for (const [path, value] of Object.entries(draftValues)) {
      const targets = doc.querySelectorAll<HTMLElement>(
        `[data-pb-inline-edit="${path.replace(/"/g, '\\"')}"]`
      );
      targets.forEach(el => {
        if (el === doc.activeElement) return;
        if (serializeRichDom(el) === value) return;
        el.innerHTML = richHtml(value);
      });
    }
  }, [draftValues, pageSlug]);

  useEffect(() => {
    if (pageSlug || !onSectionLayout) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.documentElement?.hasAttribute("data-pb-layout-chrome")) return;
    enablePreviewLayoutChrome(doc, designProfile, onSectionLayout, {
      viewport: device,
      onInsertSection,
    });
  }, [designProfile, onSectionLayout, pageSlug, device, onInsertSection]);

  const enableInlineEditing = (iframeEl: HTMLIFrameElement) => {
    onIframeReady?.(iframeEl);
    // Neuer iframe-Load (z. B. nach Patch): Fokusposition wiederherstellen.
    window.setTimeout(scrollToFocus, 80);
    const previewDoc = iframeEl.contentDocument;
    if (previewDoc && !pageSlug && onSectionLayout) {
      enablePreviewLayoutChrome(previewDoc, designProfile, onSectionLayout, {
        viewport: device,
        onInsertSection,
      });
    }
    if (!inlineTargets || !onInlineTextEdit || pageSlug) return;
    const doc = iframeEl.contentDocument;
    if (!doc) return;

    if (doc.querySelector("[data-pb-inline-style]")) return;
    const style = doc.createElement("style");
    style.setAttribute("data-pb-inline-style", "");
    style.textContent = `
      [data-pb-inline-edit]{cursor:text;outline:1px dashed transparent;outline-offset:5px;transition:outline-color .15s,background-color .15s}
      [data-pb-inline-edit]:hover{outline-color:rgba(31,95,75,.55);background:rgba(31,95,75,.04)}
      [data-pb-inline-edit]:focus{outline:2px solid #1f5f4b;background:rgba(31,95,75,.07)}
      [data-pb-photo-edit]{cursor:pointer;outline:1px dashed transparent;outline-offset:4px;transition:outline-color .15s}
      [data-pb-photo-edit]:hover,[data-pb-photo-edit]:focus-visible{outline-color:rgba(31,95,75,.65)}
    `;
    doc.head.appendChild(style);

    // Foto-Klick → Fotos-Panel mit passendem Ziel. Capture + stop, damit
    // die Lightbox der Live-Site (siteEnhancer, document-Listener) im
    // Studio nicht zusätzlich aufgeht.
    if (onPickPhoto) {
      doc
        .querySelectorAll<HTMLImageElement>(
          "#start img, #ueber-uns img, #galerie img"
        )
        .forEach(img => {
          const target = photoClickTargetOf(img);
          if (!target) return;
          img.setAttribute("data-pb-photo-edit", target);
          img.setAttribute("title", "Klicken, um das Foto zu tauschen");
          if (!img.hasAttribute("tabindex")) img.tabIndex = 0;
          img.setAttribute("role", "button");
          img.setAttribute("aria-label", "Foto tauschen");
          const openPanel = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            onPickPhoto(target);
          };
          img.addEventListener("click", openPanel, true);
          img.addEventListener(
            "keydown",
            event => {
              const key = (event as KeyboardEvent).key;
              if (key === "Enter" || key === " ") openPanel(event);
            },
            true
          );
        });
    }

    const candidateSelector =
      "h1,h2,h3,h4,p,strong,span,a,button,summary,figcaption,blockquote,footer,address,td,th,li";
    for (const targetConfig of inlineTargets) {
      const scope = doc.querySelector(targetConfig.scope);
      if (!scope) continue;
      const candidates = Array.from(
        scope.querySelectorAll<HTMLElement>(candidateSelector)
      );
      // Marker (**fett**, ==akzent==) stehen im Dokument, aber nicht im
      // gerenderten Text — fürs Auffinden im DOM entfernen.
      const normalizedCurrent = normalizeInlineText(
        stripMarks(targetConfig.value)
      );
      const matches = candidates.filter(el => {
        const text = normalizeInlineText(el.innerText);
        if (text === normalizedCurrent) return true;
        // Testimonials/Autoren tragen typografische Anführungszeichen,
        // Gedankenstrich oder Rating direkt um den eigentlichen Wert.
        return (
          text.includes(normalizedCurrent) &&
          text.length <= normalizedCurrent.length + 20
        );
      });

      for (const target of matches) {
        // Keine Container zusätzlich editierbar machen, wenn ein Kind bereits
        // denselben Text präziser repräsentiert.
        if (
          Array.from(target.children).some(child =>
            normalizeInlineText((child as HTMLElement).innerText).includes(
              normalizedCurrent
            )
          )
        )
          continue;
        if (isInlineLocked(target)) continue;

        target.setAttribute("contenteditable", "plaintext-only");
        target.setAttribute("data-pb-inline-edit", targetConfig.path);
        target.setAttribute("title", "Klicken und direkt bearbeiten");
        target.setAttribute("spellcheck", "true");
        // innerHTML statt Text: Escape/Verwerfen muss auch die gerenderten
        // Auszeichnungen (strong/em aus dem Marker-Subset) wiederherstellen.
        let originalHtml = target.innerHTML;
        let originalValue = serializeRichDom(target);

        target.addEventListener("click", event => {
          if (target.tagName === "A") event.preventDefault();
        });
        target.addEventListener("focus", () => {
          originalHtml = target.innerHTML;
          originalValue = serializeRichDom(target);
        });
        target.addEventListener("paste", event => {
          event.preventDefault();
          const text = event.clipboardData?.getData("text/plain") ?? "";
          doc.execCommand("insertText", false, text);
        });
        target.addEventListener("keydown", event => {
          if (event.key === "Escape") {
            event.preventDefault();
            target.innerHTML = originalHtml;
            target.blur();
          } else if (event.key === "Enter" && !targetConfig.multiline) {
            event.preventDefault();
            target.blur();
          }
        });
        target.addEventListener("blur", () => {
          // Serialisiert strong/em zurück zu Markern — Formatierungen
          // überleben so das Inline-Editieren (früher: textContent).
          const value = serializeRichDom(target).trim();
          if (!value || value.length > targetConfig.maxLength) {
            target.innerHTML = originalHtml;
            return;
          }
          if (
            normalizeInlineText(value) !== normalizeInlineText(originalValue)
          ) {
            onInlineTextEdit(targetConfig.path, value);
          }
        });
      }
    }

    // Format-Toolbar (F/K/A) bei Textauswahl in formatierbaren Feldern.
    enableInlineFormatToolbar(
      doc,
      new Map(
        inlineTargets.filter(t => t.formattable).map(t => [t.path, t.maxLength])
      ),
      onInlineTextEdit
    );
  };
  return (
    <div className="pb-studio-device" data-device={device}>
      <iframe
        ref={iframeRef}
        key={src}
        src={src}
        title="Live-Vorschau deiner Website"
        loading="eager"
        onLoad={event => enableInlineEditing(event.currentTarget)}
      />
    </div>
  );
}

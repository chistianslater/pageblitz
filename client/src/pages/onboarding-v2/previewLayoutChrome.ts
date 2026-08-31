import type {
  DesignProfile,
  LayoutOverlay,
  LayoutViewport,
} from "@shared/siteContract/designProfile";
import {
  DEFAULT_DESIGN_PROFILE,
  MOBILE_LAYOUT_FIELD,
} from "@shared/siteContract/designProfile";
import { DESIGN_PROFILE_CSS } from "@/components/site/designProfileCss";
import { SECTION_ANCHORS } from "@/components/site/engine";

export type PreviewLayoutField =
  | "heroLayout"
  | "servicesLayout"
  | "aboutLayout"
  | "galleryLayout";

export type { LayoutOverlay, LayoutViewport };

export interface LayoutChromeOptions {
  /**
   * Overlay-Modus (Design-Review): nur diese Felder als `data-pb-*` setzen.
   * Leeres Objekt = Buttons anzeigen, Pack-Komposition unverändert.
   */
  overlay?: LayoutOverlay;
  onOverlayChange?: (overlay: LayoutOverlay) => void;
  /** Welche Viewport-Attribute geschrieben werden. Default: desktop. */
  viewport?: LayoutViewport;
}

export interface PreviewLayoutOption {
  value: string;
  label: string;
  /** Smartphone-Label, wenn die Komposition anders gelesen wird. */
  mobileLabel?: string;
  /** Mini-Wireframe der Komposition (inline SVG, currentColor). */
  icon: string;
}

export interface PreviewLayoutSection {
  field: PreviewLayoutField;
  attr:
    | "data-pb-hero"
    | "data-pb-services"
    | "data-pb-about"
    | "data-pb-gallery";
  anchor: string;
  title: string;
  options: readonly PreviewLayoutOption[];
  /**
   * Einzeln ausblendbares Element dieser Sektion (2026-08-31, „Bild weg,
   * Text wird breiter"): rendert einen Auge-Toggle hinter den
   * Layout-Optionen, der `designProfile.hiddenElements` umschaltet.
   */
  hideElement?: {
    key: "hero-media" | "about-media";
    hideLabel: string;
    showLabel: string;
  };
}

const icon = (shapes: string) =>
  `<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">${shapes}</svg>`;

export const PREVIEW_LAYOUT_SECTIONS: readonly PreviewLayoutSection[] = [
  {
    field: "heroLayout",
    attr: "data-pb-hero",
    anchor: SECTION_ANCHORS.hero,
    title: "Hero-Layout",
    options: [
      {
        value: "split",
        label: "Bild & Text",
        mobileLabel: "Text oben",
        icon: icon(
          '<rect x="2" y="5" width="7" height="2" rx="1"/><rect x="2" y="9" width="5" height="2" rx="1"/><rect x="2" y="13" width="4" height="2" rx="1"/><rect x="11" y="4" width="7" height="12" rx="1.5"/>'
        ),
      },
      {
        value: "centered",
        label: "Zentriert",
        icon: icon(
          '<rect x="5" y="5" width="10" height="2" rx="1"/><rect x="6.5" y="9" width="7" height="2" rx="1"/><rect x="8" y="13" width="4" height="2" rx="1"/>'
        ),
      },
      {
        value: "image-first",
        label: "Bild oben",
        icon: icon(
          '<rect x="3" y="3" width="14" height="8" rx="1.5"/><rect x="5" y="13" width="10" height="2" rx="1"/><rect x="6.5" y="16.4" width="7" height="1.6" rx=".8"/>'
        ),
      },
      {
        value: "collage",
        label: "Collage",
        icon: icon(
          '<rect x="2" y="6" width="6" height="2" rx="1"/><rect x="2" y="10" width="4" height="2" rx="1"/><rect x="9" y="4" width="8" height="12" rx="1.5" opacity=".55"/><rect x="12" y="2.6" width="5.4" height="7" rx="1" transform="rotate(6 14.7 6.1)"/><rect x="10.6" y="11" width="5.4" height="7" rx="1" transform="rotate(-6 13.3 14.5)"/>'
        ),
      },
      {
        value: "banner",
        label: "Vollbild",
        icon: icon(
          '<rect x="2" y="3" width="16" height="14" rx="1.5" opacity=".45"/><rect x="4.5" y="8" width="8" height="2" rx="1"/><rect x="4.5" y="11.6" width="5.5" height="1.8" rx=".9"/>'
        ),
      },
    ],
    hideElement: {
      key: "hero-media",
      hideLabel: "Bild ausblenden",
      showLabel: "Bild einblenden",
    },
  },
  {
    field: "servicesLayout",
    attr: "data-pb-services",
    anchor: SECTION_ANCHORS.services,
    title: "Leistungen-Layout",
    options: [
      {
        value: "list",
        label: "Liste",
        icon: icon(
          '<rect x="3" y="3.5" width="14" height="3.4" rx="1"/><rect x="3" y="8.3" width="14" height="3.4" rx="1"/><rect x="3" y="13.1" width="14" height="3.4" rx="1"/>'
        ),
      },
      {
        value: "grid",
        label: "Raster",
        icon: icon(
          '<rect x="3" y="3" width="6.4" height="6.4" rx="1"/><rect x="10.6" y="3" width="6.4" height="6.4" rx="1"/><rect x="3" y="10.6" width="6.4" height="6.4" rx="1"/><rect x="10.6" y="10.6" width="6.4" height="6.4" rx="1"/>'
        ),
      },
      {
        value: "featured",
        label: "Hervorgehoben",
        icon: icon(
          '<rect x="3" y="3" width="8.4" height="14" rx="1.5"/><rect x="13" y="3" width="4" height="6.4" rx="1"/><rect x="13" y="10.6" width="4" height="6.4" rx="1"/>'
        ),
      },
    ],
  },
  {
    field: "aboutLayout",
    attr: "data-pb-about",
    anchor: SECTION_ANCHORS.about,
    title: "Über-uns-Layout",
    options: [
      {
        value: "image-left",
        label: "Bild links",
        mobileLabel: "Bild oben",
        icon: icon(
          '<rect x="3" y="4" width="6.5" height="12" rx="1.5"/><rect x="11.5" y="5.5" width="5.5" height="2" rx="1"/><rect x="11.5" y="9" width="4.5" height="2" rx="1"/><rect x="11.5" y="12.5" width="5.5" height="2" rx="1"/>'
        ),
      },
      {
        value: "image-right",
        label: "Bild rechts",
        mobileLabel: "Bild unten",
        icon: icon(
          '<rect x="10.5" y="4" width="6.5" height="12" rx="1.5"/><rect x="3" y="5.5" width="5.5" height="2" rx="1"/><rect x="3" y="9" width="4.5" height="2" rx="1"/><rect x="3" y="12.5" width="5.5" height="2" rx="1"/>'
        ),
      },
    ],
    hideElement: {
      key: "about-media",
      hideLabel: "Bild ausblenden",
      showLabel: "Bild einblenden",
    },
  },
  {
    field: "galleryLayout",
    attr: "data-pb-gallery",
    anchor: SECTION_ANCHORS.gallery,
    title: "Galerie-Layout",
    options: [
      {
        value: "grid",
        label: "Raster",
        icon: icon(
          '<rect x="3" y="4" width="4" height="5.2" rx=".8"/><rect x="8" y="4" width="4" height="5.2" rx=".8"/><rect x="13" y="4" width="4" height="5.2" rx=".8"/><rect x="3" y="10.8" width="4" height="5.2" rx=".8"/><rect x="8" y="10.8" width="4" height="5.2" rx=".8"/><rect x="13" y="10.8" width="4" height="5.2" rx=".8"/>'
        ),
      },
      {
        value: "mosaic",
        label: "Mosaik",
        icon: icon(
          '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="12" y="3" width="5" height="3.7" rx=".8"/><rect x="12" y="7.3" width="5" height="3.7" rx=".8"/><rect x="3" y="12" width="5" height="5" rx=".8"/><rect x="9" y="12" width="8" height="5" rx=".8"/>'
        ),
      },
      {
        value: "filmstrip",
        label: "Filmstreifen",
        icon: icon(
          '<rect x="1.5" y="7" width="5" height="6" rx=".8"/><rect x="7.5" y="7" width="5" height="6" rx=".8"/><rect x="13.5" y="7" width="5" height="6" rx=".8"/>'
        ),
      },
      {
        value: "masonry",
        label: "Kacheln",
        icon: icon(
          '<rect x="3" y="3" width="4.2" height="7" rx=".8"/><rect x="8.2" y="3" width="4.2" height="4.4" rx=".8"/><rect x="13.4" y="3" width="3.6" height="6" rx=".8"/><rect x="3" y="11" width="4.2" height="6" rx=".8"/><rect x="8.2" y="8.4" width="4.2" height="8.6" rx=".8"/><rect x="13.4" y="10" width="3.6" height="7" rx=".8"/>'
        ),
      },
    ],
  },
];

/** 3×3-Raster wie ein Layout-Grid — Inhalt des runden Auslöser-Buttons. */
export const LAYOUT_GRID_ICON_HTML = `<span class="pb-preview-layout-icon" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>`;

const CHROME_MARK = "data-pb-layout-chrome";
const STYLE_MARK = "data-pb-layout-style";
const workingProfiles = new WeakMap<Document, DesignProfile>();
const overlayState = new WeakMap<Document, LayoutOverlay>();
const chromeViewport = new WeakMap<Document, LayoutViewport>();
const placedChrome = new WeakMap<
  Document,
  { host: HTMLElement; chrome: HTMLElement }[]
>();

const CHROME_CSS = `
.pb-preview-layout{position:fixed;right:12px;z-index:28;display:flex;font-family:"Space Grotesk",system-ui,sans-serif}
.pb-preview-layout-btn{appearance:none;display:grid;place-items:center;width:34px;height:34px;padding:0;border:1px solid rgba(255,255,255,.16);background:rgba(11,11,13,.92);color:#f5f5f2;border-radius:999px;cursor:pointer;box-shadow:0 10px 28px rgba(11,11,13,.35)}
.pb-preview-layout-icon{display:grid;grid-template-columns:repeat(3,3px);gap:1.5px;width:12px;height:12px}
.pb-preview-layout-icon i{display:block;width:3px;height:3px;border-radius:.4px;background:currentColor}
.pb-preview-layout-btn:hover,.pb-preview-layout:hover>.pb-preview-layout-btn,.pb-preview-layout:focus-within>.pb-preview-layout-btn,.pb-preview-layout[data-open="true"]>.pb-preview-layout-btn{background:#ccff00;border-color:#ccff00;color:#0b0b0d}
.pb-preview-layout-menu{position:absolute;top:50%;right:calc(100% + 8px);display:flex;align-items:center;gap:2px;padding:3px;background:rgba(11,11,13,.94);border:1px solid rgba(255,255,255,.14);border-radius:999px;box-shadow:0 14px 34px rgba(11,11,13,.4);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-50%) translateX(8px) scale(.96)}
.pb-preview-layout-menu::after{content:"";position:absolute;left:100%;top:-6px;bottom:-6px;width:14px}
.pb-preview-layout-menu button{appearance:none;display:grid;place-items:center;width:30px;height:30px;padding:0;border:0;background:transparent;color:rgba(245,245,242,.72);border-radius:999px;cursor:pointer}
.pb-preview-layout-menu button svg{width:17px;height:17px}
.pb-preview-layout-menu button:hover{background:rgba(255,255,255,.12);color:#fff}
.pb-preview-layout-menu button[aria-pressed="true"]{background:#ccff00;color:#0b0b0d}
.pb-preview-layout-sep{width:1px;height:18px;margin:0 2px;background:rgba(255,255,255,.2)}
.pb-preview-layout-menu button[data-pb-hide-element][aria-pressed="true"]{background:#ff5d45;color:#0b0b0d}
.pb-preview-layout:hover .pb-preview-layout-menu,.pb-preview-layout:focus-within .pb-preview-layout-menu,.pb-preview-layout[data-open="true"] .pb-preview-layout-menu{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(-50%)}
@media(prefers-reduced-motion:no-preference){
  .pb-preview-layout-menu{transition:opacity .16s ease,transform .22s cubic-bezier(.2,.8,.2,1),visibility .16s}
  .pb-preview-layout-menu button{transition:background .12s,color .12s}
}
`;

type AttrTarget = {
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
};

function mobileAttrName(attr: PreviewLayoutSection["attr"]): string {
  return `${attr}-mobile`;
}

export function applyProfileAttrs(
  site: AttrTarget,
  profile: DesignProfile
): void {
  const hiddenElements = profile.hiddenElements ?? [];
  if (hiddenElements.length > 0)
    site.setAttribute("data-pb-he", hiddenElements.join(" "));
  else site.removeAttribute("data-pb-he");
  site.setAttribute("data-pb-hero", profile.heroLayout);
  site.setAttribute("data-pb-services", profile.servicesLayout);
  site.setAttribute("data-pb-about", profile.aboutLayout);
  site.setAttribute("data-pb-gallery", profile.galleryLayout);
  site.setAttribute("data-pb-density", profile.density);
  site.setAttribute("data-pb-image", profile.imageTreatment);
  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const mobileValue = profile[MOBILE_LAYOUT_FIELD[section.field]];
    const attr = mobileAttrName(section.attr);
    if (mobileValue) site.setAttribute(attr, mobileValue);
    else site.removeAttribute(attr);
  }
}

/**
 * Overlay-Modus (Design-Review): nur den aktuellen Viewport setzen.
 * Ungewählte Felder werden entfernt, damit das Pack-CSS Default bleibt.
 * Desktop- und Mobil-Attribute bleiben unabhängig.
 */
export function applyLayoutOverlay(
  site: AttrTarget,
  overlay: LayoutOverlay,
  viewport: LayoutViewport = "desktop"
): void {
  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const value = overlay[section.field];
    const desktopAttr = section.attr;
    const mobileAttr = mobileAttrName(section.attr);
    if (viewport === "mobile") {
      site.removeAttribute(desktopAttr);
      if (value) site.setAttribute(mobileAttr, value);
      else site.removeAttribute(mobileAttr);
    } else {
      site.removeAttribute(mobileAttr);
      if (value) site.setAttribute(desktopAttr, value);
      else site.removeAttribute(desktopAttr);
    }
  }
}

/**
 * Sticky-Top im iframe-Viewport: unter der Pack-Navigation, innerhalb der
 * sichtbaren Sektion. `null` = Sektion nicht sichtbar, Chrome ausblenden.
 */
export function chromeViewportTop(
  sectionTop: number,
  sectionBottom: number,
  navBottom: number,
  viewHeight: number,
  chromeHeight: number
): number | null {
  const visibleTop = Math.max(sectionTop + 8, navBottom + 8);
  const visibleBottom = Math.min(sectionBottom - 8, viewHeight - 8);
  if (visibleBottom - visibleTop < Math.min(chromeHeight, 36)) return null;
  return Math.min(
    visibleTop,
    Math.max(navBottom + 8, visibleBottom - chromeHeight)
  );
}

export function layoutOptionLabel(
  option: PreviewLayoutOption,
  viewport: LayoutViewport = "desktop"
): string {
  return viewport === "mobile" && option.mobileLabel
    ? option.mobileLabel
    : option.label;
}

export function layoutChromeTitle(
  section: PreviewLayoutSection,
  viewport: LayoutViewport = "desktop"
): string {
  return viewport === "mobile" ? `${section.title} (Mobil)` : section.title;
}

/** Auge-Icon des Element-Toggles — bewusst KEIN 20×20-viewBox-SVG wie die
    Layout-Piktogramme, damit bestehende Icon-Zähl-Tests stabil bleiben. */
const HIDE_EYE_ICON =
  '<svg viewBox="0 0 21 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2.5 10c1.6-3.2 4.6-5.2 8-5.2s6.4 2 8 5.2c-1.6 3.2-4.6 5.2-8 5.2s-6.4-2-8-5.2Z"/><circle cx="10.5" cy="10" r="2.3" fill="currentColor" stroke="none"/></svg>';

export function renderLayoutChromeHtml(
  section: PreviewLayoutSection,
  current: string,
  viewport: LayoutViewport = "desktop",
  elementHidden = false
): string {
  const title = layoutChromeTitle(section, viewport);
  const options = section.options
    .map(option => {
      const label = escapeHtml(layoutOptionLabel(option, viewport));
      return `<button type="button" data-pb-layout-option="${option.value}" aria-pressed="${
        option.value === current ? "true" : "false"
      }" aria-label="${label}" title="${label}">${option.icon}</button>`;
    })
    .join("");
  const hide = section.hideElement
    ? `<span class="pb-preview-layout-sep" aria-hidden="true"></span><button type="button" data-pb-hide-element="${section.hideElement.key}" aria-pressed="${
        elementHidden ? "true" : "false"
      }" aria-label="${escapeHtml(
        elementHidden
          ? section.hideElement.showLabel
          : section.hideElement.hideLabel
      )}" title="${escapeHtml(
        elementHidden
          ? section.hideElement.showLabel
          : section.hideElement.hideLabel
      )}">${HIDE_EYE_ICON}</button>`
    : "";
  return `<div class="pb-preview-layout" data-pb-layout-field="${section.field}">
    <button type="button" class="pb-preview-layout-btn" aria-expanded="false" aria-haspopup="true" aria-label="${escapeHtml(
      title
    )}">${LAYOUT_GRID_ICON_HTML}</button>
    <div class="pb-preview-layout-menu" role="group" aria-label="${escapeHtml(
      title
    )}">${options}${hide}</div>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function viewportOf(doc: Document): LayoutViewport {
  return chromeViewport.get(doc) ?? "desktop";
}

function currentValue(
  profile: DesignProfile,
  field: PreviewLayoutField,
  viewport: LayoutViewport
): string {
  if (viewport === "mobile") {
    return profile[MOBILE_LAYOUT_FIELD[field]] ?? "";
  }
  return profile[field];
}

function syncChromeCopy(doc: Document): void {
  const viewport = viewportOf(doc);
  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const chrome = doc.querySelector(
      `[data-pb-layout-field="${section.field}"]`
    );
    if (!chrome) continue;
    const title = layoutChromeTitle(section, viewport);
    chrome
      .querySelector(".pb-preview-layout-btn")
      ?.setAttribute("aria-label", title);
    chrome
      .querySelector(".pb-preview-layout-menu")
      ?.setAttribute("aria-label", title);
    chrome
      .querySelectorAll<HTMLButtonElement>("[data-pb-layout-option]")
      .forEach(button => {
        const value = button.getAttribute("data-pb-layout-option");
        const option = section.options.find(item => item.value === value);
        if (!option) return;
        const label = layoutOptionLabel(option, viewport);
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
      });
  }
}

function syncPressed(
  root: ParentNode,
  currentOf: (field: PreviewLayoutField) => string,
  hiddenElements: readonly string[] = []
): void {
  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const chrome = root.querySelector(
      `[data-pb-layout-field="${section.field}"]`
    );
    if (!chrome) continue;
    const current = currentOf(section.field);
    chrome
      .querySelectorAll<HTMLButtonElement>("[data-pb-layout-option]")
      .forEach(button => {
        button.setAttribute(
          "aria-pressed",
          button.getAttribute("data-pb-layout-option") === current
            ? "true"
            : "false"
        );
      });
    const hideButton = chrome.querySelector<HTMLButtonElement>(
      "[data-pb-hide-element]"
    );
    if (hideButton && section.hideElement) {
      const hidden = hiddenElements.includes(section.hideElement.key);
      hideButton.setAttribute("aria-pressed", hidden ? "true" : "false");
      const label = hidden
        ? section.hideElement.showLabel
        : section.hideElement.hideLabel;
      hideButton.setAttribute("aria-label", label);
      hideButton.setAttribute("title", label);
    }
  }
}

function isOverlayMode(doc: Document, options?: LayoutChromeOptions): boolean {
  return options?.overlay !== undefined || overlayState.has(doc);
}

function currentOfDoc(doc: Document, field: PreviewLayoutField): string {
  const overlay = overlayState.get(doc);
  if (overlay) return overlay[field] ?? "";
  return currentValue(
    workingProfiles.get(doc) ?? DEFAULT_DESIGN_PROFILE,
    field,
    viewportOf(doc)
  );
}

function closeMenus(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(".pb-preview-layout").forEach(chrome => {
    chrome.removeAttribute("data-open");
    chrome
      .querySelector(".pb-preview-layout-btn")
      ?.setAttribute("aria-expanded", "false");
  });
}

function stickyNavBottom(doc: Document): number {
  const win = doc.defaultView;
  if (!win) return 0;
  let bottom = 0;
  for (const el of Array.from(doc.querySelectorAll("nav, header"))) {
    const style = win.getComputedStyle(el);
    if (style.position !== "sticky" && style.position !== "fixed") continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= 16 && rect.bottom > bottom) bottom = rect.bottom;
  }
  return bottom;
}

function placeChrome(doc: Document): void {
  const win = doc.defaultView;
  const placed = placedChrome.get(doc);
  if (!win || !placed) return;
  const navBottom = stickyNavBottom(doc);
  const viewHeight = win.innerHeight;
  for (const { host, chrome } of placed) {
    const rect = host.getBoundingClientRect();
    const btn = chrome.querySelector<HTMLElement>(".pb-preview-layout-btn");
    const chromeHeight = btn?.offsetHeight || chrome.offsetHeight || 40;
    const top = chromeViewportTop(
      rect.top,
      rect.bottom,
      navBottom,
      viewHeight,
      chromeHeight
    );
    if (top == null) {
      chrome.style.display = "none";
      continue;
    }
    chrome.style.display = "flex";
    chrome.style.top = `${Math.round(top)}px`;
  }
}

function prefersFineHover(doc: Document): boolean {
  return Boolean(
    doc.defaultView?.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches
  );
}

/**
 * Kleine Layout-Buttons rechts in Hero/Leistungen/Über uns/Galerie.
 * Studio-PreviewFrame und Design-Review (same-origin iframe), nicht auf
 * der Live-Kundenseite. `position:fixed` im iframe, z-index unter der
 * Pack-Navigation (40). Overlay-Modus setzt nur bewusst gewählte Felder,
 * damit Pack-Defaults im Design-Review unangetastet bleiben.
 */
export function enablePreviewLayoutChrome(
  doc: Document,
  profile: DesignProfile | null | undefined,
  onPick: (next: DesignProfile) => void,
  options?: LayoutChromeOptions
): void {
  const resolved = profile ?? DEFAULT_DESIGN_PROFILE;
  const site = doc.querySelector<HTMLElement>(".pb-site");
  if (!site) return;
  chromeViewport.set(doc, options?.viewport ?? "desktop");
  workingProfiles.set(doc, resolved);
  const overlayMode = isOverlayMode(doc, options);
  if (overlayMode) {
    overlayState.set(doc, {
      ...(options?.overlay ?? overlayState.get(doc) ?? {}),
    });
  }

  if (!doc.head.querySelector(`style[${STYLE_MARK}]`)) {
    const style = doc.createElement("style");
    style.setAttribute(STYLE_MARK, "");
    style.textContent = `${DESIGN_PROFILE_CSS}\n${CHROME_CSS}`;
    doc.head.appendChild(style);
  }

  const hiddenOfDoc = () =>
    (workingProfiles.get(doc) ?? resolved).hiddenElements ?? [];
  const applyDoc = () => {
    if (overlayMode) {
      applyLayoutOverlay(site, overlayState.get(doc) ?? {}, viewportOf(doc));
    } else {
      applyProfileAttrs(site, workingProfiles.get(doc) ?? resolved);
    }
    syncPressed(doc, field => currentOfDoc(doc, field), hiddenOfDoc());
    syncChromeCopy(doc);
  };

  if (doc.documentElement.hasAttribute(CHROME_MARK)) {
    applyDoc();
    placeChrome(doc);
    return;
  }
  doc.documentElement.setAttribute(CHROME_MARK, "");
  applyDoc();

  const placed: { host: HTMLElement; chrome: HTMLElement }[] = [];
  const fineHover = prefersFineHover(doc);

  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const host = doc.getElementById(section.anchor);
    if (!host) continue;
    const wrap = doc.createElement("div");
    wrap.innerHTML = renderLayoutChromeHtml(
      section,
      currentOfDoc(doc, section.field),
      viewportOf(doc),
      section.hideElement
        ? hiddenOfDoc().includes(section.hideElement.key)
        : false
    );
    const chrome = wrap.firstElementChild as HTMLElement | null;
    if (!chrome) continue;
    doc.body.appendChild(chrome);
    placed.push({ host, chrome });

    const toggle = chrome.querySelector<HTMLButtonElement>(
      ".pb-preview-layout-btn"
    );
    const menu = chrome.querySelector<HTMLElement>(".pb-preview-layout-menu");
    if (!toggle || !menu) continue;

    const setOpen = (open: boolean) => {
      if (open) {
        closeMenus(doc);
        chrome.setAttribute("data-open", "true");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        chrome.removeAttribute("data-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    };

    if (fineHover) {
      chrome.addEventListener("mouseenter", () => setOpen(true));
      chrome.addEventListener("mouseleave", () => setOpen(false));
      chrome.addEventListener("focusin", () => setOpen(true));
      chrome.addEventListener("focusout", event => {
        if (!chrome.contains(event.relatedTarget as Node | null))
          setOpen(false);
      });
    } else {
      toggle.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        setOpen(chrome.getAttribute("data-open") !== "true");
      });
    }

    menu.addEventListener("click", event => {
      // Element-Toggle („Bild ausblenden"): schaltet hiddenElements im
      // Profil um — gleicher onPick-Fluss wie die Layout-Optionen. Im
      // Overlay-Modus (Design-Review) bewusst inaktiv.
      const hideButton = (
        event.target as HTMLElement
      ).closest<HTMLButtonElement>("[data-pb-hide-element]");
      if (hideButton && section.hideElement && !overlayState.has(doc)) {
        event.preventDefault();
        event.stopPropagation();
        const key = section.hideElement.key;
        const profileNow = workingProfiles.get(doc) ?? DEFAULT_DESIGN_PROFILE;
        const nowHidden = profileNow.hiddenElements ?? [];
        const nextHidden = nowHidden.includes(key)
          ? nowHidden.filter(k => k !== key)
          : [...nowHidden, key];
        const working: DesignProfile = { ...profileNow };
        if (nextHidden.length > 0) working.hiddenElements = nextHidden;
        else delete working.hiddenElements;
        workingProfiles.set(doc, working);
        applyProfileAttrs(site, working);
        syncPressed(
          doc,
          field => currentOfDoc(doc, field),
          working.hiddenElements ?? []
        );
        setOpen(false);
        onPick(working);
        return;
      }
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-pb-layout-option]"
      );
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const value = button.getAttribute("data-pb-layout-option");
      const current = currentOfDoc(doc, section.field);
      if (!value || value === current) {
        setOpen(false);
        return;
      }
      if (overlayState.has(doc)) {
        const overlay = {
          ...(overlayState.get(doc) ?? {}),
          [section.field]: value,
        };
        overlayState.set(doc, overlay);
        applyLayoutOverlay(site, overlay, viewportOf(doc));
        syncPressed(doc, field => currentOfDoc(doc, field), hiddenOfDoc());
        setOpen(false);
        options?.onOverlayChange?.(overlay);
        return;
      }
      const key =
        viewportOf(doc) === "mobile"
          ? MOBILE_LAYOUT_FIELD[section.field]
          : section.field;
      const working = {
        ...(workingProfiles.get(doc) ?? DEFAULT_DESIGN_PROFILE),
        [key]: value,
      } as DesignProfile;
      workingProfiles.set(doc, working);
      applyProfileAttrs(site, working);
      syncPressed(doc, field => currentOfDoc(doc, field), hiddenOfDoc());
      setOpen(false);
      onPick(working);
    });
  }

  placedChrome.set(doc, placed);
  placeChrome(doc);

  const win = doc.defaultView;
  win?.addEventListener("scroll", () => placeChrome(doc), { passive: true });
  win?.addEventListener("resize", () => placeChrome(doc));
  if (!fineHover) {
    doc.addEventListener("click", event => {
      const target = event.target;
      if (target instanceof Element && target.closest(".pb-preview-layout")) {
        return;
      }
      closeMenus(doc);
    });
  }
  doc.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenus(doc);
  });
}

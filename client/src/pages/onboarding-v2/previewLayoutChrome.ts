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
  buttonLabel: string;
  options: readonly PreviewLayoutOption[];
}

export const PREVIEW_LAYOUT_SECTIONS: readonly PreviewLayoutSection[] = [
  {
    field: "heroLayout",
    attr: "data-pb-hero",
    anchor: SECTION_ANCHORS.hero,
    title: "Hero-Layout",
    buttonLabel: "Layout",
    options: [
      { value: "split", label: "Bild & Text", mobileLabel: "Text oben" },
      { value: "centered", label: "Zentriert" },
      { value: "image-first", label: "Bild oben" },
    ],
  },
  {
    field: "servicesLayout",
    attr: "data-pb-services",
    anchor: SECTION_ANCHORS.services,
    title: "Leistungen-Layout",
    buttonLabel: "Layout",
    options: [
      { value: "list", label: "Liste" },
      { value: "grid", label: "Raster" },
      { value: "featured", label: "Hervorgehoben" },
    ],
  },
  {
    field: "aboutLayout",
    attr: "data-pb-about",
    anchor: SECTION_ANCHORS.about,
    title: "Über-uns-Layout",
    buttonLabel: "Layout",
    options: [
      { value: "image-left", label: "Bild links", mobileLabel: "Bild oben" },
      { value: "image-right", label: "Bild rechts", mobileLabel: "Bild unten" },
    ],
  },
  {
    field: "galleryLayout",
    attr: "data-pb-gallery",
    anchor: SECTION_ANCHORS.gallery,
    title: "Galerie-Layout",
    buttonLabel: "Layout",
    options: [
      { value: "grid", label: "Raster" },
      { value: "mosaic", label: "Mosaik" },
      { value: "filmstrip", label: "Filmstreifen" },
    ],
  },
];

/** 3×3-Raster wie ein Layout-Grid, neben dem Wort „Layout". */
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
.pb-preview-layout{position:fixed;right:12px;z-index:28;display:flex;flex-direction:column;align-items:flex-end;font-family:"Space Grotesk",system-ui,sans-serif}
.pb-preview-layout-btn{appearance:none;display:inline-flex;align-items:center;gap:.45rem;border:1px solid rgba(20,24,20,.16);background:rgba(255,252,247,.96);color:#141814;font:600 .78rem/1 "Space Grotesk",system-ui,sans-serif;padding:.42rem .72rem .42rem .58rem;border-radius:999px;cursor:pointer;box-shadow:0 10px 28px rgba(20,24,20,.12)}
.pb-preview-layout-icon{display:grid;grid-template-columns:repeat(3,3px);gap:1.5px;width:12px;height:12px}
.pb-preview-layout-icon i{display:block;width:3px;height:3px;border-radius:.4px;background:currentColor}
.pb-preview-layout-btn:hover,.pb-preview-layout:hover>.pb-preview-layout-btn,.pb-preview-layout:focus-within>.pb-preview-layout-btn,.pb-preview-layout[data-open="true"]>.pb-preview-layout-btn{background:#141814;color:#fff}
.pb-preview-layout-menu{position:absolute;top:100%;right:0;display:flex;flex-direction:column;align-items:flex-end;gap:.28rem;padding:.4rem 0 0;pointer-events:none}
.pb-preview-layout[data-fan="up"] .pb-preview-layout-menu{top:auto;bottom:100%;padding:0 0 .4rem;flex-direction:column-reverse}
.pb-preview-layout-menu button{appearance:none;border:1px solid rgba(20,24,20,.16);background:rgba(255,252,247,.96);text-align:left;font:500 .82rem/1.3 "Space Grotesk",system-ui,sans-serif;padding:.48rem .78rem;border-radius:999px;cursor:pointer;color:#141814;box-shadow:0 10px 28px rgba(20,24,20,.12);opacity:0;visibility:hidden;transform:translate3d(10px,-8px,0) scale(.92);pointer-events:none}
.pb-preview-layout[data-fan="up"] .pb-preview-layout-menu button{transform:translate3d(10px,8px,0) scale(.92)}
.pb-preview-layout-menu button:hover{background:#141814;color:#fff}
.pb-preview-layout-menu button[aria-pressed="true"]{background:#141814;color:#fff}
@media(hover:hover) and (pointer:fine){
  .pb-preview-layout:hover .pb-preview-layout-menu,.pb-preview-layout:focus-within .pb-preview-layout-menu{pointer-events:auto}
  .pb-preview-layout:hover .pb-preview-layout-menu button,.pb-preview-layout:focus-within .pb-preview-layout-menu button{opacity:1;visibility:visible;transform:none;pointer-events:auto}
}
.pb-preview-layout[data-open="true"] .pb-preview-layout-menu{pointer-events:auto}
.pb-preview-layout[data-open="true"] .pb-preview-layout-menu button{opacity:1;visibility:visible;transform:none;pointer-events:auto}
@media(prefers-reduced-motion:no-preference){
  .pb-preview-layout-menu button{transition:opacity .16s ease,transform .22s cubic-bezier(.2,.8,.2,1),visibility .16s,background .12s,color .12s}
  .pb-preview-layout:hover .pb-preview-layout-menu button:nth-child(1),.pb-preview-layout:focus-within .pb-preview-layout-menu button:nth-child(1),.pb-preview-layout[data-open="true"] .pb-preview-layout-menu button:nth-child(1){transition-delay:20ms}
  .pb-preview-layout:hover .pb-preview-layout-menu button:nth-child(2),.pb-preview-layout:focus-within .pb-preview-layout-menu button:nth-child(2),.pb-preview-layout[data-open="true"] .pb-preview-layout-menu button:nth-child(2){transition-delay:55ms}
  .pb-preview-layout:hover .pb-preview-layout-menu button:nth-child(3),.pb-preview-layout:focus-within .pb-preview-layout-menu button:nth-child(3),.pb-preview-layout[data-open="true"] .pb-preview-layout-menu button:nth-child(3){transition-delay:90ms}
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

export function renderLayoutChromeHtml(
  section: PreviewLayoutSection,
  current: string,
  viewport: LayoutViewport = "desktop"
): string {
  const title = layoutChromeTitle(section, viewport);
  const options = section.options
    .map(
      option =>
        `<button type="button" data-pb-layout-option="${option.value}" aria-pressed="${
          option.value === current ? "true" : "false"
        }">${escapeHtml(layoutOptionLabel(option, viewport))}</button>`
    )
    .join("");
  return `<div class="pb-preview-layout" data-pb-layout-field="${section.field}">
    <button type="button" class="pb-preview-layout-btn" aria-expanded="false" aria-haspopup="true" aria-label="${escapeHtml(
      title
    )}">${LAYOUT_GRID_ICON_HTML}<span>${escapeHtml(section.buttonLabel)}</span></button>
    <div class="pb-preview-layout-menu" role="group" aria-label="${escapeHtml(
      title
    )}">${options}</div>
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
        if (option) button.textContent = layoutOptionLabel(option, viewport);
      });
  }
}

function syncPressed(
  root: ParentNode,
  currentOf: (field: PreviewLayoutField) => string
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
    chrome.dataset.fan = viewHeight - top - chromeHeight < 148 ? "up" : "down";
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

  const applyDoc = () => {
    if (overlayMode) {
      applyLayoutOverlay(site, overlayState.get(doc) ?? {}, viewportOf(doc));
    } else {
      applyProfileAttrs(site, workingProfiles.get(doc) ?? resolved);
    }
    syncPressed(doc, field => currentOfDoc(doc, field));
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
      viewportOf(doc)
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
        syncPressed(doc, field => currentOfDoc(doc, field));
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
      syncPressed(doc, field => currentOfDoc(doc, field));
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

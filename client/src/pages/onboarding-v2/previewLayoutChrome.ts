import type { DesignProfile } from "@shared/siteContract/designProfile";
import { DEFAULT_DESIGN_PROFILE } from "@shared/siteContract/designProfile";
import { DESIGN_PROFILE_CSS } from "@/components/site/designProfileCss";
import { SECTION_ANCHORS } from "@/components/site/engine";

export type PreviewLayoutField =
  | "heroLayout"
  | "servicesLayout"
  | "aboutLayout"
  | "galleryLayout";

export interface PreviewLayoutOption {
  value: string;
  label: string;
}

export interface PreviewLayoutSection {
  field: PreviewLayoutField;
  attr: "data-pb-hero" | "data-pb-services" | "data-pb-about" | "data-pb-gallery";
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
      { value: "split", label: "Bild & Text" },
      { value: "centered", label: "Zentriert" },
      { value: "compact", label: "Kompakt" },
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
      { value: "image-left", label: "Bild links" },
      { value: "image-right", label: "Bild rechts" },
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

const CHROME_MARK = "data-pb-layout-chrome";
const STYLE_MARK = "data-pb-layout-style";
const workingProfiles = new WeakMap<Document, DesignProfile>();

const CHROME_CSS = `
.pb-preview-layout{position:absolute;top:1rem;right:1rem;z-index:50;display:flex;flex-direction:column;align-items:flex-end;gap:.35rem;font-family:"Space Grotesk",system-ui,sans-serif;pointer-events:auto}
#start>.pb-preview-layout{top:5.25rem}
.pb-preview-layout-btn{appearance:none;border:1px solid rgba(20,24,20,.16);background:rgba(255,252,247,.96);color:#141814;font:600 .72rem/1 "Space Grotesk",system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:.42rem .72rem;border-radius:999px;cursor:pointer;box-shadow:0 10px 28px rgba(20,24,20,.12)}
.pb-preview-layout-btn:hover,.pb-preview-layout-btn[aria-expanded="true"]{background:#141814;color:#fff}
.pb-preview-layout-menu{display:flex;flex-direction:column;min-width:10.75rem;padding:.28rem;background:#fff;border:1px solid rgba(20,24,20,.12);border-radius:14px;box-shadow:0 18px 40px rgba(20,24,20,.16)}
.pb-preview-layout-menu[hidden]{display:none!important}
.pb-preview-layout-menu button{appearance:none;border:0;background:transparent;text-align:left;font:500 .82rem/1.3 "Space Grotesk",system-ui,sans-serif;padding:.48rem .65rem;border-radius:9px;cursor:pointer;color:#141814}
.pb-preview-layout-menu button:hover{background:rgba(20,24,20,.06)}
.pb-preview-layout-menu button[aria-pressed="true"]{background:#141814;color:#fff}
`;

export function applyProfileAttrs(
  site: { setAttribute: (name: string, value: string) => void },
  profile: DesignProfile
): void {
  site.setAttribute("data-pb-hero", profile.heroLayout);
  site.setAttribute("data-pb-services", profile.servicesLayout);
  site.setAttribute("data-pb-about", profile.aboutLayout);
  site.setAttribute("data-pb-gallery", profile.galleryLayout);
  site.setAttribute("data-pb-density", profile.density);
  site.setAttribute("data-pb-image", profile.imageTreatment);
}

export function renderLayoutChromeHtml(
  section: PreviewLayoutSection,
  current: string
): string {
  const options = section.options
    .map(
      option =>
        `<button type="button" data-pb-layout-option="${option.value}" aria-pressed="${
          option.value === current ? "true" : "false"
        }">${escapeHtml(option.label)}</button>`
    )
    .join("");
  return `<div class="pb-preview-layout" data-pb-layout-field="${section.field}">
    <button type="button" class="pb-preview-layout-btn" aria-expanded="false" aria-haspopup="true" aria-label="${escapeHtml(
      section.title
    )}">${escapeHtml(section.buttonLabel)}</button>
    <div class="pb-preview-layout-menu" hidden role="group" aria-label="${escapeHtml(
      section.title
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

function currentValue(
  profile: DesignProfile,
  field: PreviewLayoutField
): string {
  return profile[field];
}

function syncPressed(root: ParentNode, profile: DesignProfile): void {
  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const chrome = root.querySelector(
      `[data-pb-layout-field="${section.field}"]`
    );
    if (!chrome) continue;
    const current = currentValue(profile, section.field);
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

function closeMenus(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(".pb-preview-layout-menu").forEach(menu => {
    menu.hidden = true;
  });
  root
    .querySelectorAll<HTMLButtonElement>(".pb-preview-layout-btn")
    .forEach(button => button.setAttribute("aria-expanded", "false"));
}

function isLayoutChrome(target: EventTarget | null): boolean {
  return (
    target instanceof Element && !!target.closest(".pb-preview-layout")
  );
}

/**
 * Kleine Layout-Buttons rechts in Hero/Leistungen/Über uns/Galerie.
 * Nur Studio-PreviewFrame (same-origin iframe), nicht auf der Live-Seite.
 */
export function enablePreviewLayoutChrome(
  doc: Document,
  profile: DesignProfile | null | undefined,
  onPick: (next: DesignProfile) => void
): void {
  const resolved = profile ?? DEFAULT_DESIGN_PROFILE;
  const site = doc.querySelector<HTMLElement>(".pb-site");
  if (!site) return;
  workingProfiles.set(doc, resolved);

  if (!doc.head.querySelector(`style[${STYLE_MARK}]`)) {
    const style = doc.createElement("style");
    style.setAttribute(STYLE_MARK, "");
    style.textContent = `${DESIGN_PROFILE_CSS}\n${CHROME_CSS}`;
    doc.head.appendChild(style);
  }

  if (doc.documentElement.hasAttribute(CHROME_MARK)) {
    applyProfileAttrs(site, resolved);
    syncPressed(doc, resolved);
    return;
  }
  doc.documentElement.setAttribute(CHROME_MARK, "");
  applyProfileAttrs(site, resolved);

  for (const section of PREVIEW_LAYOUT_SECTIONS) {
    const host = doc.getElementById(section.anchor);
    if (!host) continue;
    const computed = doc.defaultView?.getComputedStyle(host).position;
    if (!computed || computed === "static") host.style.position = "relative";
    host.insertAdjacentHTML(
      "beforeend",
      renderLayoutChromeHtml(section, currentValue(resolved, section.field))
    );
    const chrome = host.querySelector<HTMLElement>(
      `[data-pb-layout-field="${section.field}"]`
    );
    if (!chrome) continue;
    const toggle = chrome.querySelector<HTMLButtonElement>(
      ".pb-preview-layout-btn"
    );
    const menu = chrome.querySelector<HTMLElement>(".pb-preview-layout-menu");
    if (!toggle || !menu) continue;

    toggle.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const open = toggle.getAttribute("aria-expanded") === "true";
      closeMenus(doc);
      if (!open) {
        toggle.setAttribute("aria-expanded", "true");
        menu.hidden = false;
      }
    });

    menu.addEventListener("click", event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-pb-layout-option]"
      );
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const value = button.getAttribute("data-pb-layout-option");
      const current = currentValue(
        workingProfiles.get(doc) ?? DEFAULT_DESIGN_PROFILE,
        section.field
      );
      if (!value || value === current) {
        closeMenus(doc);
        return;
      }
      const working = {
        ...(workingProfiles.get(doc) ?? DEFAULT_DESIGN_PROFILE),
        [section.field]: value,
      } as DesignProfile;
      workingProfiles.set(doc, working);
      applyProfileAttrs(site, working);
      syncPressed(doc, working);
      closeMenus(doc);
      onPick(working);
    });
  }

  doc.addEventListener("click", event => {
    if (!isLayoutChrome(event.target)) closeMenus(doc);
  });
  doc.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenus(doc);
  });
}

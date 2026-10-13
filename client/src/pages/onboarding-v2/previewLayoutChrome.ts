import type { DesignProfile } from "@shared/siteContract/designProfile";
import { DEFAULT_DESIGN_PROFILE } from "@shared/siteContract/designProfile";
import { SECTION_ANCHORS } from "@/components/site/engine";
import type { SectionType } from "@shared/siteContract/types";
import { SECTION_LABELS } from "@shared/onboardingV2/aiEdit";

/**
 * Studio-Werkzeuge in der Vorschau (same-origin iframe, nie auf der
 * Kundenseite): „Bild ausblenden“ für Hero und Über uns, Plus-Zonen zum
 * Einfügen von Sektionen und das Skelett während des Schreibens.
 *
 * Seit den Designsystemen gibt es keine Layout-Wähler mehr — das System
 * bringt seinen Aufbau mit. Das Ausblenden rendert das System selbst
 * (`designProfile.hiddenElements`), die Vorschau lädt nach dem Speichern neu.
 */
export interface PreviewChromeOptions {
  /**
   * Plus-Zonen (2026-09-03): Klick auf „Sektion einfügen" an der Unterkante
   * einer Sektion. Nur gesetzt im Studio auf der Startseite — ohne Callback
   * werden keine Zonen gerendert.
   */
  onInsertSection?: (afterType: SectionType) => void;
}

export interface HideableMedia {
  anchor: string;
  key: "hero-media" | "about-media";
  hideLabel: string;
  showLabel: string;
}

/** Einzeln ausblendbare Bilder („Bild weg, Text wird breiter", 2026-08-31). */
export const HIDEABLE_MEDIA: readonly HideableMedia[] = [
  {
    anchor: SECTION_ANCHORS.hero,
    key: "hero-media",
    hideLabel: "Bild ausblenden",
    showLabel: "Bild einblenden",
  },
  {
    anchor: SECTION_ANCHORS.about,
    key: "about-media",
    hideLabel: "Bild ausblenden",
    showLabel: "Bild einblenden",
  },
];

const CHROME_MARK = "data-pb-preview-chrome";
const STYLE_MARK = "data-pb-preview-chrome-style";
const workingProfiles = new WeakMap<Document, DesignProfile>();
const placedChrome = new WeakMap<
  Document,
  { host: HTMLElement; chrome: HTMLElement }[]
>();
const placedZones = new WeakMap<
  Document,
  { host: HTMLElement; zone: HTMLElement }[]
>();

/** Sektionen, hinter denen nichts eingefügt wird: Kontakt (Seitenende) und der Hinweis-Banner (liegt über der Navigation). */
const NO_INSERT_AFTER: ReadonlySet<SectionType> = new Set([
  "contact",
  "notice",
]);

export const CHROME_CSS = `
.pb-preview-hide{position:fixed;right:12px;z-index:28;display:flex;font-family:"Space Grotesk",system-ui,sans-serif}
.pb-preview-hide-btn{appearance:none;display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 13px 0 11px;border:1px solid rgba(255,255,255,.16);background:rgba(11,11,13,.92);color:#f5f5f2;border-radius:999px;cursor:pointer;box-shadow:0 10px 28px rgba(11,11,13,.35);font:700 11px/1 "Space Grotesk",system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}
.pb-preview-hide-btn svg{width:17px;height:16px;flex:0 0 auto}
.pb-preview-hide-btn:hover,.pb-preview-hide-btn:focus-visible{background:#ccff00;border-color:#ccff00;color:#0b0b0d;outline:none}
.pb-preview-hide-btn[aria-pressed="true"]{background:#ff5d45;border-color:#ff5d45;color:#0b0b0d}
.pb-preview-insert{position:absolute;left:0;right:0;z-index:27;height:0;display:flex;justify-content:center;align-items:center;gap:8px;pointer-events:none;font-family:"Space Grotesk",system-ui,sans-serif}
.pb-preview-insert-stub{display:block;width:44px;height:1px;background:#ccff00;opacity:0;transform:scaleX(.4)}
.pb-preview-insert-btn{appearance:none;pointer-events:auto;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px 0 8px;border:1px solid rgba(255,255,255,.16);background:#0b0b0d;color:#f5f5f2;border-radius:999px;font:600 12px/1 "Space Grotesk",system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 22px rgba(11,11,13,.45);opacity:.6}
.pb-preview-insert-btn b{display:grid;place-items:center;width:16px;height:16px;border-radius:999px;background:#ccff00;color:#0b0b0d;font:700 13px/1 system-ui,sans-serif}
.pb-preview-insert:hover .pb-preview-insert-btn,.pb-preview-insert-btn:focus-visible{opacity:1;border-color:#ccff00}
.pb-preview-insert:hover .pb-preview-insert-stub,.pb-preview-insert:focus-within .pb-preview-insert-stub{opacity:.75;transform:scaleX(1)}
@media(hover:none){.pb-preview-insert-btn{opacity:.9}}
/* Richtungsneutral (Befund 2026-09-03): mit schwarzen Tönungen war das
   Skelett auf dunklen Designs unsichtbar — der Kunde sah nach dem Klick
   scheinbar nichts. Grundfarben kommen aus den --pb-*-Variablen (die
   Systeme setzen sie für Inseln), die Balken aus mittlerem Grau mit Alpha
   (liest auf hellem UND dunklem Grund). */
/* Zusätzlich hart gegen die Einblende-Regel absichern: die Regel greift mit
   gleicher Spezifität, unser Stylesheet wird später eingehängt und gewinnt. */
html .pb-site section.pb-preview-skeleton{opacity:1;transform:none;filter:none;animation:none}
.pb-preview-skeleton{display:block;padding:44px 24px;background:var(--pb-surface,rgba(128,128,128,.08));border-top:2px solid var(--pb-accent,#888);border-bottom:1px solid var(--pb-line,rgba(128,128,128,.3));color:var(--pb-ink,inherit)}
.pb-preview-skeleton-inner{max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.pb-preview-skeleton-kicker{display:inline-flex;align-items:center;gap:10px;font:700 15px/1.2 "Space Grotesk",system-ui,sans-serif;letter-spacing:.04em;color:var(--pb-accent,#888)}
.pb-preview-skeleton-kicker::before{content:"";width:11px;height:11px;flex:0 0 auto;border-radius:999px;background:currentColor}
/* Balken aus der Textfarbe mischen (Befund 2026-09-03): festes Grau war
   auf dunklen Designs kaum zu sehen. */
.pb-preview-skeleton-line{display:block;height:18px;border-radius:9px;background:linear-gradient(90deg,rgba(128,128,128,.28) 0%,rgba(128,128,128,.5) 50%,rgba(128,128,128,.28) 100%);background-size:200% 100%}
@supports (background:color-mix(in srgb,red 10%,transparent)){
  .pb-preview-skeleton-line{background:linear-gradient(90deg,color-mix(in srgb,var(--pb-ink,#888) 20%,transparent) 0%,color-mix(in srgb,var(--pb-ink,#888) 45%,transparent) 50%,color-mix(in srgb,var(--pb-ink,#888) 20%,transparent) 100%);background-size:200% 100%}
}
.pb-preview-skeleton-line[data-w="70"]{width:70%}
.pb-preview-skeleton-line[data-w="92"]{width:92%}
.pb-preview-skeleton-line[data-w="56"]{width:56%}
@media(prefers-reduced-motion:no-preference){
  .pb-preview-skeleton-line{animation:pb-skeleton-shimmer 1.4s linear infinite}
  .pb-preview-skeleton-kicker::before{animation:pb-skeleton-pulse 1.2s ease-in-out infinite}
  @keyframes pb-skeleton-shimmer{0%{background-position:150% 0}100%{background-position:-50% 0}}
  @keyframes pb-skeleton-pulse{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}
}
@media(prefers-reduced-motion:no-preference){.pb-preview-insert-stub{transition:opacity .16s,transform .22s cubic-bezier(.2,.8,.2,1)}}
@media(prefers-reduced-motion:no-preference){
  .pb-preview-hide-btn{transition:background .12s,color .12s,border-color .12s}
  .pb-preview-insert-btn{transition:opacity .14s,border-color .14s}
}
`;

/**
 * Plus-Zone an der Unterkante einer Sektion (Startseite, Studio). Die Linie
 * besteht aus zwei kurzen Stummeln links und rechts des Knopfs — eine Linie
 * über die ganze Breite lief mitten durch die Schrift der Nachbarsektion
 * (Betreiber-Befund 2026-09-03).
 */
export function renderInsertZoneHtml(
  afterType: SectionType,
  label: string
): string {
  const stub = `<i class="pb-preview-insert-stub" aria-hidden="true"></i>`;
  return `<div class="pb-preview-insert" data-pb-after="${escapeHtml(afterType)}">${stub}<button type="button" class="pb-preview-insert-btn" aria-label="Sektion nach ${escapeHtml(label)} einfügen"><b aria-hidden="true">+</b>Sektion einfügen</button>${stub}</div>`;
}

/**
 * Platzhalter direkt nach dem Klick (2026-09-03): Die KI braucht rund eine
 * Minute für den Text. Statt im Dialog zu warten, erscheint die Sektion
 * sofort als Skelett an ihrer Stelle in der Vorschau — nichts davon wird
 * gespeichert, der echte Inhalt kommt mit dem nächsten Laden.
 */
export function renderInsertSkeletonHtml(label: string): string {
  // `pb-in` ist die Klasse, die der Einblende-Beobachter der Kundenseite
  // sonst selbst setzt (motionCss.ts). Ohne sie bleibt jede nachträglich
  // eingefügte Sektion bei `opacity:0` stehen — genau deshalb war das
  // Skelett unsichtbar (Betreiber-Befund 2026-09-03).
  return `<section class="pb-preview-skeleton pb-in" data-pb-insert-skeleton aria-live="polite"><div class="pb-preview-skeleton-inner"><span class="pb-preview-skeleton-kicker">${escapeHtml(label)} · wird geschrieben …</span><span class="pb-preview-skeleton-line" data-w="70"></span><span class="pb-preview-skeleton-line" data-w="92"></span><span class="pb-preview-skeleton-line" data-w="56"></span></div></section>`;
}

/** Sentinel: Skelett ganz oben statt hinter einer Sektion. */
export const SKELETON_TOP = "__top";

/**
 * Wohin das Skelett gehört: normalerweise hinter die geklickte Sektion —
 * der Hinweis-Banner rendert aber immer über der Navigation, dort wäre ein
 * Skelett an der Klickstelle irreführend.
 */
export function skeletonAnchorFor(
  type: SectionType,
  afterAnchor: string
): string {
  return type === "notice" ? SKELETON_TOP : afterAnchor;
}

/**
 * Skelett hinter der Zielsektion (oder ganz oben) einhängen bzw. entfernen.
 * Rein im Vorschau-DOM — das Dokument bleibt unangetastet.
 */
export function applyInsertSkeleton(
  doc: Document,
  pending: { anchor: string; label: string } | null
): void {
  for (const old of Array.from(
    doc.querySelectorAll("[data-pb-insert-skeleton]")
  )) {
    old.remove();
  }
  if (!pending) return;
  const wrap = doc.createElement("div");
  wrap.innerHTML = renderInsertSkeletonHtml(pending.label);
  const skeleton = wrap.firstElementChild;
  if (!skeleton) return;
  if (pending.anchor === SKELETON_TOP) {
    const site = doc.querySelector(".pb-site") ?? doc.body;
    site.insertAdjacentElement("afterbegin", skeleton as Element);
  } else {
    const host = doc.getElementById(pending.anchor);
    if (!host) return;
    host.insertAdjacentElement("afterend", skeleton as Element);
  }
  skeleton.scrollIntoView({ behavior: "smooth", block: "center" });
}

/** Auge-Icon des Ausblenden-Knopfs. */
const HIDE_EYE_ICON =
  '<svg viewBox="0 0 21 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2.5 10c1.6-3.2 4.6-5.2 8-5.2s6.4 2 8 5.2c-1.6 3.2-4.6 5.2-8 5.2s-6.4-2-8-5.2Z"/><circle cx="10.5" cy="10" r="2.3" fill="currentColor" stroke="none"/></svg>';

/** Beschrifteter Knopf „Bild ausblenden“/„Bild einblenden“ rechts an der Sektion. */
export function renderHideToggleHtml(
  media: HideableMedia,
  hidden: boolean
): string {
  const label = escapeHtml(hidden ? media.showLabel : media.hideLabel);
  return `<div class="pb-preview-hide" data-pb-hide-section="${media.key}"><button type="button" class="pb-preview-hide-btn" data-pb-hide-element="${media.key}" aria-pressed="${
    hidden ? "true" : "false"
  }">${HIDE_EYE_ICON}<span>${label}</span></button></div>`;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

/**
 * Position einer Plus-Zone im Dokument (2026-09-04). `position:absolute`
 * bezieht sich auf den nächsten positionierten Vorfahren: bei statischem
 * `body` ist das der Dokumentanfang (Scrollstand zählt mit), bei
 * positioniertem `body` dessen eigene Kante.
 */
export function insertZoneDocumentTop(
  hostBottom: number,
  scrollY: number,
  bodyTop: number,
  bodyPositioned: boolean
): number {
  return Math.round(
    bodyPositioned ? hostBottom - bodyTop : hostBottom + scrollY
  );
}

/**
 * Zonen einmalig setzen — sie scrollen danach mit dem Inhalt. Früher lief
 * das bei jedem Scroll-Ereignis; am Handy kamen die verzögert und der Knopf
 * ruckelte sichtbar hinterher (Betreiber-Meldung 2026-09-04).
 */
function placeInsertZones(doc: Document): void {
  const win = doc.defaultView;
  const zones = placedZones.get(doc);
  if (!win || !zones) return;
  const body = doc.body;
  const bodyPositioned = win.getComputedStyle(body).position !== "static";
  const bodyTop = bodyPositioned ? body.getBoundingClientRect().top : 0;
  const scrollY = win.scrollY;
  // Erst alle Kanten lesen, dann alle Positionen schreiben — verschränktes
  // Lesen und Schreiben erzwingt sonst pro Zone ein neues Layout.
  const tops = zones.map(({ host }) =>
    insertZoneDocumentTop(
      host.getBoundingClientRect().bottom,
      scrollY,
      bodyTop,
      bodyPositioned
    )
  );
  zones.forEach(({ zone }, i) => {
    const next = `${tops[i]}px`;
    if (zone.style.top !== next) zone.style.top = next;
    if (zone.style.display !== "flex") zone.style.display = "flex";
  });
}

function placeChrome(doc: Document): void {
  const win = doc.defaultView;
  const placed = placedChrome.get(doc);
  if (!win || !placed) return;
  const navBottom = stickyNavBottom(doc);
  const viewHeight = win.innerHeight;
  // Lesephase: alle Maße auf einmal, danach erst schreiben.
  const tops = placed.map(({ host, chrome }) => {
    const rect = host.getBoundingClientRect();
    const btn = chrome.querySelector<HTMLElement>(".pb-preview-hide-btn");
    const chromeHeight = btn?.offsetHeight || chrome.offsetHeight || 40;
    return chromeViewportTop(
      rect.top,
      rect.bottom,
      navBottom,
      viewHeight,
      chromeHeight
    );
  });
  placed.forEach(({ chrome }, i) => {
    const top = tops[i];
    if (top == null) {
      if (chrome.style.display !== "none") chrome.style.display = "none";
      return;
    }
    if (chrome.style.display !== "flex") chrome.style.display = "flex";
    const next = `${Math.round(top)}px`;
    if (chrome.style.top !== next) chrome.style.top = next;
  });
}

/**
 * Scrollen darf höchstens einmal pro Bild rechnen. Ohne diese Bremse lief
 * die Platzierung bei jedem einzelnen Scroll-Ereignis.
 */
const zonePending = new WeakSet<Document>();
/**
 * Zonen nachziehen, wenn sich das Layout ändert (nachgeladene Bilder,
 * Schriften, Umbruch). Ohne das blieben sie auf der Position stehen, die
 * beim Einhängen galt — und saßen dann sichtbar neben der Kante.
 */
function schedulePlaceZones(doc: Document): void {
  const win = doc.defaultView;
  if (!win || zonePending.has(doc)) return;
  zonePending.add(doc);
  win.requestAnimationFrame(() => {
    zonePending.delete(doc);
    placeInsertZones(doc);
  });
}

const framePending = new WeakSet<Document>();
function schedulePlaceChrome(doc: Document): void {
  const win = doc.defaultView;
  if (!win) return;
  if (framePending.has(doc)) return;
  framePending.add(doc);
  win.requestAnimationFrame(() => {
    framePending.delete(doc);
    placeChrome(doc);
  });
}

function syncHideButton(
  button: HTMLButtonElement,
  media: HideableMedia,
  hidden: boolean
): void {
  button.setAttribute("aria-pressed", hidden ? "true" : "false");
  const label = button.querySelector("span");
  if (label) label.textContent = hidden ? media.showLabel : media.hideLabel;
}

/**
 * Studio-Werkzeuge in die Vorschau einhängen (einmal je geladenem
 * Dokument; ein erneuter Aufruf aktualisiert nur das Profil). `onPick`
 * bekommt das Profil mit umgeschaltetem `hiddenElements`.
 */
export function enablePreviewChrome(
  doc: Document,
  profile: DesignProfile | null | undefined,
  onPick: (next: DesignProfile) => void,
  options?: PreviewChromeOptions
): void {
  const resolved = profile ?? DEFAULT_DESIGN_PROFILE;
  const site = doc.querySelector<HTMLElement>(".pb-site");
  if (!site) return;
  workingProfiles.set(doc, resolved);

  if (!doc.head.querySelector(`style[${STYLE_MARK}]`)) {
    const style = doc.createElement("style");
    style.setAttribute(STYLE_MARK, "");
    style.textContent = CHROME_CSS;
    doc.head.appendChild(style);
  }

  const hiddenNow = () =>
    (workingProfiles.get(doc) ?? resolved).hiddenElements ?? [];

  if (doc.documentElement.hasAttribute(CHROME_MARK)) {
    for (const media of HIDEABLE_MEDIA) {
      const button = doc.querySelector<HTMLButtonElement>(
        `[data-pb-hide-element="${media.key}"]`
      );
      if (button)
        syncHideButton(button, media, hiddenNow().includes(media.key));
    }
    placeChrome(doc);
    return;
  }
  doc.documentElement.setAttribute(CHROME_MARK, "");

  const placed: { host: HTMLElement; chrome: HTMLElement }[] = [];
  for (const media of HIDEABLE_MEDIA) {
    const host = doc.getElementById(media.anchor);
    if (!host) continue;
    const hidden = hiddenNow().includes(media.key);
    // Nur wo ein Bild steht (oder es gerade ausgeblendet ist) — sonst wäre
    // es ein Schalter ohne Wirkung.
    if (!hidden && !host.querySelector("img")) continue;
    const wrap = doc.createElement("div");
    wrap.innerHTML = renderHideToggleHtml(media, hidden);
    const chrome = wrap.firstElementChild as HTMLElement | null;
    const button = chrome?.querySelector<HTMLButtonElement>("button");
    if (!chrome || !button) continue;
    doc.body.appendChild(chrome);
    placed.push({ host, chrome });
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const current = workingProfiles.get(doc) ?? DEFAULT_DESIGN_PROFILE;
      const before = current.hiddenElements ?? [];
      const nextHidden = before.includes(media.key)
        ? before.filter(k => k !== media.key)
        : [...before, media.key];
      const working: DesignProfile = { ...current };
      if (nextHidden.length > 0) working.hiddenElements = nextHidden;
      else delete working.hiddenElements;
      workingProfiles.set(doc, working);
      syncHideButton(button, media, nextHidden.includes(media.key));
      onPick(working);
    });
  }
  placedChrome.set(doc, placed);

  // Plus-Zonen (2026-09-03): eine je gerenderter Startseiten-Sektion außer
  // Kontakt/Hinweis, sortiert wie im Dokument — Klick meldet den Typ, hinter
  // dem eingefügt werden soll, ans Studio.
  const onInsert = options?.onInsertSection;
  if (onInsert) {
    const zones: { host: HTMLElement; zone: HTMLElement }[] = [];
    for (const [type, anchor] of Object.entries(SECTION_ANCHORS) as [
      SectionType,
      string,
    ][]) {
      if (NO_INSERT_AFTER.has(type)) continue;
      const host = doc.getElementById(anchor);
      if (!host) continue;
      const wrap = doc.createElement("div");
      wrap.innerHTML = renderInsertZoneHtml(type, SECTION_LABELS[type]);
      const zone = wrap.firstElementChild as HTMLElement | null;
      if (!zone) continue;
      doc.body.appendChild(zone);
      zones.push({ host, zone });
      zone.querySelector("button")?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        onInsert(type);
      });
    }
    placedZones.set(doc, zones);
  }
  placeInsertZones(doc);
  placeChrome(doc);

  const win = doc.defaultView;
  // Scrollen bewegt nur noch die Layout-Knöpfe (fest im Viewport). Die
  // Plus-Zonen liegen im Dokument und wandern von selbst mit.
  win?.addEventListener("scroll", () => schedulePlaceChrome(doc), {
    passive: true,
  });
  win?.addEventListener("resize", () => {
    schedulePlaceZones(doc);
    schedulePlaceChrome(doc);
  });
  // Nachgeladene Bilder und Schriften verschieben die Sektionskanten noch
  // nach dem Einhängen — beides beobachten statt bei jedem Scroll zu rechnen.
  win?.addEventListener("load", () => schedulePlaceZones(doc));
  doc.fonts?.ready?.then(() => schedulePlaceZones(doc)).catch(() => {});
  const zoneHosts = placedZones.get(doc)?.map(z => z.host) ?? [];
  if (zoneHosts.length > 0 && typeof win?.ResizeObserver === "function") {
    const observer = new win.ResizeObserver(() => schedulePlaceZones(doc));
    observer.observe(doc.body);
    for (const host of zoneHosts) observer.observe(host);
  }
}

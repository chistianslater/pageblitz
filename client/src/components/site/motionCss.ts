/**
 * Geteiltes Motion-CSS aller 14 Packs (Kundenseiten) — `SiteRenderer` hängt
 * es wie MOBILE_NAV_CSS an das Pack-CSS, damit SSR und CSR identisch
 * animieren. Bewusst CSS-only: Die Pack-Bäume werden nie hydriert, also
 * keine JS-Scroll-Listener — Scroll-Reveals laufen über die native
 * `animation-timeline: view()` (off-main-thread), mit statischem Fallback
 * wo nicht unterstützt.
 *
 * Stilrichtung „dezent-professionell" (User-Entscheid 2026-08-24):
 * - Sektionen faden/sliden beim Hereinscrollen sanft ein (24px, 600ms).
 * - Die Hero-Headline fadet einmalig beim Laden ein (450ms).
 * - CTAs/Buttons heben sich bei Hover 2px und geben Press-Feedback (.98).
 *
 * Barrierefreiheit & Test-Stabilität: Alles läuft nur unter
 * `prefers-reduced-motion: no-preference`; bei `reduce` ist alles statisch.
 * Hover-Effekte nur auf echten Zeigegeräten (`hover: hover`), damit Touch-
 * Geräte kein Fehl-Hover auslösen. Visual-Tests nutzen
 * `animations: "disabled"` (packs/islands) bzw. reduced-motion (landing).
 */
export const MOTION_CSS = `
.pb-site{--pb-ease-out:cubic-bezier(0.23,1,0.32,1);--pb-dur-fast:.18s;--pb-dur-reveal:.6s}
@keyframes pb-sect-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes pb-hero-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:no-preference){
.pb-site h1{animation:pb-hero-in .45s var(--pb-ease-out) both}
@supports (animation-timeline:view()){
.pb-site section{animation:pb-sect-in var(--pb-dur-reveal) var(--pb-ease-out) both;animation-timeline:view();animation-range:entry 0% entry 35%}
}
.pb-site a[class*="-cta"]:active,.pb-site a[class*="-btn"]:active,.pb-site button[class*="-btn"]:active{transform:scale(.98)}
}
@media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
.pb-site a[class*="-cta"],.pb-site a[class*="-btn"]{transition:transform var(--pb-dur-fast) var(--pb-ease-out),color .15s ease,background-color .15s ease,border-color .15s ease}
.pb-site a[class*="-cta"]:hover,.pb-site a[class*="-btn"]:hover{transform:translateY(-2px)}
}
@media (prefers-reduced-motion:reduce){
.pb-site h1,.pb-site section{animation:none}
}
`;

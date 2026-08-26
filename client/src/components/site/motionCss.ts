/**
 * Geteiltes Motion-CSS aller 14 Packs (Kundenseiten) — `SiteRenderer` hängt
 * es wie MOBILE_NAV_CSS an das Pack-CSS, damit SSR und CSR identisch
 * animieren.
 *
 * Der gemeinsame Default bleibt „dezent-professionell", ist seit
 * Design-System 3.0 aber über `--pb-reveal-*`/`--pb-hero-*` pro Pack
 * modulierbar. So teilen sich die Richtungen robuste Infrastruktur, ohne
 * dieselbe wahrgenommene Bewegungssprache zu haben:
 * - Default: Sektionen faden/sliden 24px in 600ms ein.
 * - Default: Die Hero-Headline fadet einmalig in 450ms ein.
 * - CTAs/Buttons heben sich bei Hover 2px und geben Press-Feedback (.98).
 * - Anker-Navigation scrollt weich (scroll-behavior: smooth).
 *
 * Scroll-Reveals laufen über SITE_ENHANCER_JS (IntersectionObserver in
 * renderSite.tsx, 2026-08-25): Die Vorgänger-Lösung mit der nativen
 * `animation-timeline: view()` war zwar JS-frei, aber für einen großen
 * Teil der Nutzer unsichtbar (Safari < 26, ältere Firefox-Versionen
 * kennen scroll-driven Animations nicht) — der IO-Pfad funktioniert in
 * allen relevanten Browsern. Das Script setzt `pb-io-on` auf <html>;
 * nur unter dieser Klasse starten Sektionen versteckt. Ohne JS (oder bei
 * `prefers-reduced-motion: reduce`) bleibt jede Sektion statisch sichtbar
 * — kein No-JS-/SEO-Risiko.
 *
 * Barrierefreiheit & Test-Stabilität: Animationen nur unter
 * `prefers-reduced-motion: no-preference`; bei `reduce` ist alles statisch
 * (Visual-Tests emulieren reduce, siehe tests/visual). Hover-Effekte nur
 * auf echten Zeigegeräten (`hover: hover`).
 */
export const MOTION_CSS = `
.pb-site{--pb-ease-out:cubic-bezier(0.23,1,0.32,1);--pb-dur-fast:.18s;--pb-dur-reveal:.6s;--pb-hero-dur:.45s;--pb-hero-y:14px;--pb-hero-scale:1;--pb-reveal-x:0px;--pb-reveal-y:24px;--pb-reveal-scale:1;--pb-reveal-blur:0px}
@keyframes pb-hero-in{from{opacity:0;transform:translate3d(0,var(--pb-hero-y),0) scale(var(--pb-hero-scale))}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:no-preference){
html{scroll-behavior:smooth}
.pb-site h1{animation:pb-hero-in var(--pb-hero-dur) var(--pb-ease-out) both}
.pb-site a[class*="-cta"]:active,.pb-site a[class*="-btn"]:active,.pb-site button[class*="-btn"]:active{transform:scale(.98)}
}
html.pb-io-on .pb-site section{opacity:0;transform:translate3d(var(--pb-reveal-x),var(--pb-reveal-y),0) scale(var(--pb-reveal-scale));filter:blur(var(--pb-reveal-blur));transition:opacity var(--pb-dur-reveal) var(--pb-ease-out),transform var(--pb-dur-reveal) var(--pb-ease-out),filter var(--pb-dur-reveal) var(--pb-ease-out)}
html.pb-io-on .pb-site section.pb-in{opacity:1;transform:none;filter:none}
@media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
.pb-site a[class*="-cta"],.pb-site a[class*="-btn"]{transition:transform var(--pb-dur-fast) var(--pb-ease-out),color .15s ease,background-color .15s ease,border-color .15s ease}
.pb-site a[class*="-cta"]:hover,.pb-site a[class*="-btn"]:hover{transform:translateY(-2px)}
}
@media (prefers-reduced-motion:reduce){
.pb-site h1{animation:none}
}
/* ── Lightbox (Galerie, 2026-08-25) — Markup baut SITE_ENHANCER_JS zur
   Laufzeit; ohne JS kein Zoom-Cursor und keine Klick-Falle. ── */
html.pb-lb-on .pb-site #galerie img{cursor:zoom-in}
.pb-lb{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.9);padding:4vmin;box-sizing:border-box}
.pb-lb[hidden]{display:none}
.pb-lb-img{max-width:min(1100px,92vw);max-height:82vh;width:auto;height:auto;object-fit:contain;border-radius:6px;box-shadow:0 24px 80px rgba(0,0,0,.5)}
.pb-lb-cap{position:absolute;left:0;right:0;bottom:3vmin;margin:0;text-align:center;color:#f5f2ec;font-size:.95rem;padding:0 16vmin;box-sizing:border-box}
.pb-lb-close,.pb-lb-prev,.pb-lb-next{position:absolute;display:grid;place-items:center;width:44px;height:44px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#f5f2ec;font-size:1.4rem;line-height:1;cursor:pointer}
.pb-lb-close{top:3vmin;right:3vmin}
.pb-lb-prev{left:3vmin;top:50%;transform:translateY(-50%)}
.pb-lb-next{right:3vmin;top:50%;transform:translateY(-50%)}
.pb-lb-close:hover,.pb-lb-prev:hover,.pb-lb-next:hover{background:rgba(255,255,255,.2)}
.pb-lb-close:focus-visible,.pb-lb-prev:focus-visible,.pb-lb-next:focus-visible{outline:2px solid #f5f2ec;outline-offset:2px}
@media (prefers-reduced-motion:no-preference){
.pb-lb{transition:opacity .2s ease}
.pb-lb-img{animation:pb-hero-in .25s var(--pb-ease-out) both}
}
`;

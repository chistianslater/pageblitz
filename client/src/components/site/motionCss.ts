/**
 * Geteiltes Motion-CSS aller 14 Packs (Kundenseiten) — `SiteRenderer` hängt
 * es wie MOBILE_NAV_CSS an das Pack-CSS, damit SSR und CSR identisch
 * animieren.
 *
 * Der gemeinsame Default bleibt „dezent-professionell", ist seit
 * Design-System 3.0 aber über `--pb-enter-*`/`--pb-hero-*` pro Pack
 * modulierbar. So teilen sich die Richtungen robuste Infrastruktur, ohne
 * dieselbe wahrgenommene Bewegungssprache zu haben:
 * - Default: Sektionen faden/sliden 24px in 600ms ein.
 * - Hero-Motion gehört dem jeweiligen Pack; die geteilte Schicht greift
 *   dort nicht ein und kann die authored Motion daher nicht überschreiben.
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
.pb-site{--pb-ease-out:cubic-bezier(0.23,1,0.32,1);--pb-dur-fast:.18s;--pb-dur-enter:.6s;--pb-enter-x:0px;--pb-enter-y:24px;--pb-enter-scale:1;--pb-enter-blur:0px}
.pb-site :is(section,header)[id]{scroll-margin-top:clamp(76px,10vw,132px)}
@media (prefers-reduced-motion:no-preference){
html{scroll-behavior:smooth}
.pb-site a[class*="-cta"]:active,.pb-site a[class*="-btn"]:active,.pb-site button[class*="-btn"]:active{transform:scale(.98)}
}
html.pb-io-on .pb-site section:not(:first-of-type){opacity:0;transform:translate3d(var(--pb-enter-x),var(--pb-enter-y),0) scale(var(--pb-enter-scale));filter:blur(var(--pb-enter-blur));transition:opacity var(--pb-dur-enter) var(--pb-ease-out),transform var(--pb-dur-enter) var(--pb-ease-out),filter var(--pb-dur-enter) var(--pb-ease-out)}
html.pb-io-on .pb-site section:not(:first-of-type).pb-in{opacity:1;transform:none;filter:none}
@media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
.pb-site a[class*="-cta"],.pb-site a[class*="-btn"]{transition:transform var(--pb-dur-fast) var(--pb-ease-out),color .15s ease,background-color .15s ease,border-color .15s ease}
.pb-site a[class*="-cta"]:hover,.pb-site a[class*="-btn"]:hover{transform:translateY(-2px)}
}
/* ── Lightbox (Galerie, 2026-08-25) — Markup baut SITE_ENHANCER_JS zur
   Laufzeit; ohne JS kein Zoom-Cursor und keine Klick-Falle. ── */
html.pb-lb-on .pb-site #galerie img{cursor:zoom-in}
.pb-lb{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.92);padding:4vmin;box-sizing:border-box;opacity:0;visibility:hidden;pointer-events:none}
.pb-lb.pb-lb-open{opacity:1;visibility:visible;pointer-events:auto}
.pb-lb[hidden]{display:none}
.pb-lb-img{max-width:min(1100px,92vw);max-height:82vh;width:auto;height:auto;object-fit:contain;border-radius:6px;box-shadow:0 24px 80px rgba(0,0,0,.5);opacity:0;transform:translate3d(0,12px,0) scale(.965)}
.pb-lb.pb-lb-open .pb-lb-img{opacity:1;transform:none}
.pb-lb-img.pb-lb-changing{opacity:0;transform:scale(.985)}
.pb-lb-cap{position:absolute;left:0;right:0;bottom:max(3vmin,env(safe-area-inset-bottom));margin:0;text-align:center;color:#f5f2ec;font-size:.95rem;padding:0 16vmin;box-sizing:border-box;opacity:0;transform:translateY(6px)}
.pb-lb.pb-lb-open .pb-lb-cap{opacity:1;transform:none}.pb-lb-cap.pb-lb-changing{opacity:0}
.pb-lb-close,.pb-lb-prev,.pb-lb-next{position:absolute;display:grid;place-items:center;width:44px;height:44px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#f5f2ec;font-size:1.4rem;line-height:1;cursor:pointer}
.pb-lb-close{top:max(3vmin,env(safe-area-inset-top));right:3vmin}
.pb-lb-prev{left:3vmin;top:50%;transform:translateY(-50%)}
.pb-lb-next{right:3vmin;top:50%;transform:translateY(-50%)}
.pb-lb-close:hover,.pb-lb-prev:hover,.pb-lb-next:hover{background:rgba(255,255,255,.2)}
.pb-lb-close:focus-visible,.pb-lb-prev:focus-visible,.pb-lb-next:focus-visible{outline:2px solid #f5f2ec;outline-offset:2px}
@media (prefers-reduced-motion:no-preference){
.pb-lb{transition:opacity .28s var(--pb-ease-out),visibility .28s step-end}
.pb-lb.pb-lb-open{transition:opacity .28s var(--pb-ease-out),visibility 0s}
.pb-lb-img{transition:opacity .22s ease,transform .36s var(--pb-ease-out)}
.pb-lb-cap{transition:opacity .2s ease,transform .3s var(--pb-ease-out)}
.pb-lb-close,.pb-lb-prev,.pb-lb-next{transition:background-color .18s ease,border-color .18s ease}
}
@media (prefers-reduced-motion:reduce){.pb-lb,.pb-lb-img,.pb-lb-cap{transition:none!important;transform:none!important}.pb-lb.pb-lb-open .pb-lb-img,.pb-lb.pb-lb-open .pb-lb-cap{opacity:1}}
`;

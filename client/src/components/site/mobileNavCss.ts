/**
 * Geteiltes CSS für das mobile Burger-Menü (`MobileNav`) — `SiteRenderer`
 * hängt es an das Pack-CSS an, damit SSR (renderToStaticMarkup) und CSR
 * (Dashboard/Editor-Vorschau) garantiert dieselbe mobile Navigation
 * bekommen: eine Quelle statt 14 Pack-Kopien, die auseinanderlaufen.
 *
 * 720px ist der packübergreifende Mobil-Breakpoint (Audit P3 — vorher
 * uneinheitlich 640/720px); die Packs blenden ihre Inline-Links unter
 * 720px selbst aus (`.pb-XX-nav-links{display:none}` im Pack-CSS).
 * Schrift/Transform der Panel-Links erben vom umgebenden Pack-Nav
 * (uppercase/letter-spacing bleiben Pack-Identität), nur Größe und
 * Touch-Targets werden hier vereinheitlicht.
 */
export const MOBILE_NAV_CSS = `
.pb-mnav{display:none}
@media(max-width:720px){
.pb-mnav{display:block;position:relative;margin-left:auto;flex-shrink:0}
.pb-mnav-toggle{box-sizing:border-box;list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid var(--pb-line);border-radius:var(--pb-radius-button);background:var(--pb-canvas);color:var(--pb-ink);-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.pb-mnav-toggle::-webkit-details-marker{display:none}
.pb-mnav-toggle:focus-visible{outline:2px solid var(--pb-accent);outline-offset:2px}
.pb-mnav-icon{display:flex;flex-direction:column;justify-content:center;gap:5px;width:20px}
.pb-mnav-icon span{display:block;height:2px;background:currentColor}
@media(prefers-reduced-motion:no-preference){.pb-mnav-icon span{transition:transform .2s ease,opacity .2s ease}}
.pb-mnav[open] .pb-mnav-icon span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.pb-mnav[open] .pb-mnav-icon span:nth-child(2){opacity:0}
.pb-mnav[open] .pb-mnav-icon span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.pb-mnav-panel{position:absolute;top:calc(100% + 8px);right:0;z-index:80;display:flex;flex-direction:column;min-width:min(264px,84vw);max-height:70vh;overflow-y:auto;padding:6px;background:var(--pb-canvas);border:1px solid var(--pb-line);border-radius:var(--pb-radius-card)}
.pb-mnav-panel a{display:flex;align-items:center;min-height:44px;padding:8px 14px;font-family:inherit;font-size:17px;letter-spacing:inherit;text-transform:inherit;color:var(--pb-ink);text-decoration:none;border-radius:var(--pb-radius-button)}
.pb-mnav-panel a:focus-visible{outline:2px solid var(--pb-accent);outline-offset:-2px}
.pb-mnav-panel a[aria-current="page"]{color:var(--pb-accent-text);font-weight:700}
.pb-mnav-panel a.pb-mnav-cta{margin-top:6px;justify-content:center;background:var(--pb-accent);color:var(--pb-accent-contrast);font-weight:700}
}
`;

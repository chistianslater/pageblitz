export const KLARWERK_CSS = `
.pb-klarwerk{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-klarwerk a{color:inherit;text-decoration:none}
.pb-kw-nav{position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--pb-canvas) 90%,transparent);display:flex;align-items:center;gap:20px;padding:16px clamp(20px,4vw,48px);border-bottom:1px solid var(--pb-ink);box-shadow:0 2px 0 var(--pb-accent);backdrop-filter:blur(12px)}
.pb-kw-logo{font-family:var(--pb-font-display);font-weight:700;font-size:17px;letter-spacing:-.03em}
.pb-kw-nav-links{display:flex;align-items:center;gap:20px;margin-left:auto;font-size:13.5px;font-weight:500}
.pb-kw-nav-links a{transition:color .15s}
.pb-kw-nav-links a:hover,.pb-kw-nav-links a:focus-visible{color:var(--pb-accent-text)}
.pb-kw-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-klarwerk a.pb-kw-nav-cta,.pb-klarwerk a.pb-kw-hero-cta{display:inline-flex;align-items:center;background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);padding:10px 16px;font-weight:600;font-size:13px;transition:opacity .15s}
.pb-kw-nav-cta:hover,.pb-kw-nav-cta:focus-visible,.pb-kw-hero-cta:hover,.pb-kw-hero-cta:focus-visible{opacity:.85}
.pb-kw-hero{padding:clamp(32px,5vw,64px) clamp(20px,4vw,48px) 28px}
.pb-kw-split{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(240px,.9fr);gap:clamp(24px,5vw,64px);align-items:center}
.pb-kw-copy{min-width:0}
.pb-kw-eyebrow{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--pb-accent-text);margin:0 0 14px}
.pb-kw-hero h1{font-family:var(--pb-font-display);font-weight:700;font-size:var(--pb-hero-size);letter-spacing:-.04em;line-height:0.98;max-width:11ch;margin:0}
.pb-kw-hero h1 span{color:var(--pb-accent)}
.pb-kw-hero .pb-kw-sub{margin-top:18px;max-width:42ch;color:var(--pb-muted);font-size:16px}
.pb-kw-hero-cta{margin-top:26px}
.pb-kw-photo{margin:0;border:1px solid var(--pb-ink);background:var(--pb-surface)}
.pb-kw-photo img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;filter:saturate(.78) contrast(1.04)}
.pb-kw-hero,.pb-kw-section{scroll-margin-top:5rem}
.pb-kw-readout{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0;margin:8px clamp(20px,4vw,48px) clamp(48px,7vw,80px);border:1px solid var(--pb-ink);background:var(--pb-surface)}
.pb-kw-metric,.pb-kw-cell{padding:16px 18px;border-right:1px solid var(--pb-line);font-size:12px;color:var(--pb-muted)}
.pb-kw-metric b,.pb-kw-cell b{display:block;font-family:var(--pb-font-display);font-weight:700;font-size:1.45rem;color:var(--pb-ink);letter-spacing:-.03em;margin-bottom:2px}
.pb-kw-cell.hi{background:var(--pb-ink);color:color-mix(in srgb,var(--pb-canvas) 72%,transparent);border-right-color:var(--pb-ink)}
.pb-kw-cell.hi b{color:var(--pb-canvas)}
.pb-kw-status{display:flex;align-items:center;gap:10px;padding:16px 18px;font-size:13px;font-weight:500}
.pb-kw-status .dot{flex-shrink:0;width:8px;height:8px;border-radius:50%;background:var(--pb-accent)}
.pb-kw-section{padding:56px clamp(20px,4vw,48px);border-top:1px solid var(--pb-line)}
.pb-kw-section h2{font-family:var(--pb-font-display);font-weight:700;letter-spacing:-.03em;font-size:clamp(1.8rem,3.4vw,2.8rem);margin:0 0 26px;max-width:14ch}
.pb-kw-service{display:flex;gap:18px;padding:16px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-kw-service .idx{font-family:var(--pb-font-display);color:var(--pb-accent-text);font-size:13px;flex-shrink:0}
.pb-kw-service strong{font-weight:600;letter-spacing:-.01em}
.pb-kw-service p{margin-top:4px;font-size:13.5px;max-width:56ch;color:var(--pb-muted)}
.pb-kw-service span.price{margin-left:auto;font-size:12.5px;color:var(--pb-muted);flex-shrink:0;padding-left:12px}
.pb-kw-about-img{width:100%;max-width:420px;aspect-ratio:4/5;object-fit:cover;display:block;margin-bottom:22px;border:1px solid var(--pb-ink)}
.pb-kw-about p{max-width:64ch}
.pb-kw-about-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:44px;align-items:center}
.pb-kw-about-grid>p:only-child{grid-column:1/-1}
.pb-kw-about-grid .pb-kw-about-img{max-width:100%;margin-bottom:0}
.pb-kw-quotes{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:stretch}
.pb-kw-quotes .pb-kw-quote{margin-bottom:0}
.pb-kw-quotes .pb-kw-quote:last-child:nth-child(odd){grid-column:1/-1;max-width:720px}
.pb-kw-quote{display:flex;flex-direction:column;padding:24px 22px 20px;background:var(--pb-surface);border:1px solid var(--pb-line);border-top:3px solid var(--pb-accent);min-height:100%}
.pb-kw-quote p{font-size:15.5px;line-height:1.55;max-width:46ch}
.pb-kw-quote footer{margin-top:auto;padding-top:16px;font-size:12.5px;color:var(--pb-muted)}
.pb-kw-quotes .pb-review-stars{margin-bottom:12px;color:var(--pb-accent)}
.pb-kw-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 44px;align-items:start}
.pb-kw-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-kw-faq strong{display:block;font-weight:600;margin-bottom:6px}
.pb-kw-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-kw-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
.pb-kw-contact address{font-style:normal}
.pb-kw-contact p{margin-bottom:8px}
.pb-klarwerk a[href^="tel:"],.pb-klarwerk a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px}
.pb-kw-hours-block{max-width:380px}
.pb-kw-hours-block h3{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--pb-accent-text);margin-bottom:8px}
.pb-kw-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-kw-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:13px;white-space:nowrap}
.pb-kw-hours tr:last-child td{border-bottom:none}
.pb-kw-hours td:first-child{font-weight:500;color:var(--pb-muted)}
.pb-kw-hours td:last-child{text-align:right}
.pb-kw-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.pb-kw-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;border:1px solid var(--pb-ink)}
.pb-kw-footer{border-top:1px solid var(--pb-ink);padding:28px clamp(20px,4vw,48px);font-size:12px;color:var(--pb-muted)}
.pb-kw-footer a{border-bottom:1px solid var(--pb-line)}
.pb-kw-utility-sticky{position:sticky;bottom:14px;z-index:30;display:flex;align-items:center;gap:16px;width:max-content;max-width:calc(100% - 32px);margin:0 16px 16px auto;padding:8px 8px 8px 16px;background:var(--pb-ink);color:var(--pb-canvas);border-radius:var(--pb-radius-card);box-shadow:0 10px 30px rgba(0,0,0,.16);font-size:13px}
.pb-klarwerk .pb-kw-utility-sticky a{padding:9px 13px;background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);font-weight:600}
.pb-kw-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-kw-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3.2rem);line-height:1.02}
.pb-kw-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted)}
@media(prefers-reduced-motion:no-preference){
  .pb-kw-copy{animation:pb-kw-line .45s ease-out both}
  .pb-kw-photo{animation:pb-kw-check .5s .08s ease-out both}
  .pb-kw-status .dot{animation:pb-kw-status 1.2s ease-in-out 3}
}
@keyframes pb-kw-line{from{transform:translateX(-10px);opacity:0}to{transform:none;opacity:1}}
@keyframes pb-kw-check{from{clip-path:inset(0 100% 0 0);opacity:0}to{clip-path:inset(0);opacity:1}}
@keyframes pb-kw-status{50%{transform:scale(1.45);opacity:.55}}
@media(pointer:fine){.pb-klarwerk .pb-kw-utility-sticky a:hover{filter:brightness(1.08)}.pb-klarwerk a[href^="tel:"]:hover,.pb-klarwerk a[href^="mailto:"]:hover,.pb-kw-footer a:hover{color:var(--pb-accent-text);border-color:var(--pb-accent)}}
@media(prefers-reduced-motion:reduce){.pb-klarwerk *,.pb-klarwerk *::before,.pb-klarwerk *::after{animation:none!important;transition:none!important}}
@media(max-width:840px){.pb-kw-nav-links{display:none}}
@media(max-width:720px){
  .pb-kw-split{grid-template-columns:1fr}
  .pb-kw-readout{grid-template-columns:1fr;margin-inline:20px}
  .pb-kw-metric,.pb-kw-cell{border-right:0;border-bottom:1px solid var(--pb-line)}
  .pb-kw-contact{grid-template-columns:1fr}
  .pb-kw-about-grid{grid-template-columns:1fr;gap:20px}
  .pb-kw-about-grid .pb-kw-about-img{order:-1;max-height:55vw}
  .pb-kw-quotes{grid-template-columns:1fr}
  .pb-kw-faq-grid{grid-template-columns:1fr}
  .pb-kw-hero{padding:28px 20px 18px}
  .pb-kw-section{padding:48px 20px}
}
`;

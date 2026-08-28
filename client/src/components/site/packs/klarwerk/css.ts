export const KLARWERK_CSS = `
.pb-klarwerk{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-klarwerk a{color:inherit;text-decoration:none}
.pb-kw-nav{position:sticky;top:0;z-index:40;background:var(--pb-canvas);display:flex;align-items:center;gap:20px;padding:20px 32px;border-bottom:1px solid var(--pb-line)}
.pb-kw-logo{font-family:var(--pb-font-display);font-weight:700;font-size:15px}
.pb-kw-nav-links{display:flex;align-items:center;gap:22px;margin-left:auto;font-size:13.5px;font-weight:500}
.pb-kw-nav-links a{transition:color .15s}
.pb-kw-nav-links a:hover,.pb-kw-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-kw-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-klarwerk a.pb-kw-nav-cta{background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);padding:9px 18px;font-weight:600;font-size:13px;transition:opacity .15s}
.pb-kw-nav-cta:hover,.pb-kw-nav-cta:focus-visible{opacity:.85}
.pb-kw-hero{padding:64px 32px 8px;max-width:900px}
.pb-kw-eyebrow{font-size:13px;font-weight:600;color:var(--pb-muted);margin-bottom:14px}
.pb-kw-hero h1{font-family:var(--pb-font-display);font-weight:700;font-size:var(--pb-hero-size);letter-spacing:-.03em;line-height:1.05}
.pb-kw-hero h1 span{color:var(--pb-accent)}
.pb-kw-hero p{margin-top:20px;max-width:56ch;color:var(--pb-muted);font-size:16px}
.pb-klarwerk a.pb-kw-hero-cta{display:inline-block;margin-top:28px;background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);padding:13px 26px;font-weight:600;font-size:14.5px;transition:opacity .15s}
.pb-kw-hero-cta:hover,.pb-kw-hero-cta:focus-visible{opacity:.85}
.pb-kw-bento{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto auto;gap:16px;padding:40px 32px 64px;max-width:1176px}
.pb-kw-metric{grid-row:span 2;background:var(--pb-ink);border-radius:var(--pb-radius-card);padding:22px 24px;display:flex;flex-direction:column;justify-content:center;gap:18px;overflow:hidden}
.pb-kw-metric div{font-size:13px;color:#9AA3B0}
.pb-kw-metric b{display:block;font-family:var(--pb-font-display);font-weight:700;font-size:28px;letter-spacing:-.03em;color:#fff;margin-bottom:2px}
.pb-kw-cell{background:var(--pb-surface);border-radius:var(--pb-radius-card);padding:18px 20px;font-size:13px;color:var(--pb-muted)}
.pb-kw-cell b{display:block;font-family:var(--pb-font-display);font-weight:700;font-size:22px;color:var(--pb-ink);letter-spacing:-.02em;margin-bottom:4px}
.pb-kw-cell.hi{background:var(--pb-accent);color:var(--pb-accent-contrast)}
.pb-kw-cell.hi b{color:var(--pb-accent-contrast)}
.pb-kw-status{grid-column:span 2;background:var(--pb-surface);border-radius:var(--pb-radius-card);padding:18px 20px;font-size:13.5px;color:var(--pb-ink);display:flex;align-items:center;gap:10px}
.pb-kw-status .dot{flex-shrink:0;width:9px;height:9px;border-radius:50%;background:#22B573}
.pb-klarwerk a[href^="tel:"],.pb-klarwerk a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:color .15s,border-color .15s}
.pb-klarwerk a[href^="tel:"]:hover,.pb-klarwerk a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-kw-section{padding:56px 32px;border-top:1px solid var(--pb-line)}
.pb-kw-section h2{font-family:var(--pb-font-display);font-weight:700;letter-spacing:-.02em;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:26px}
.pb-kw-service{display:flex;gap:20px;padding:18px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-kw-service .idx{font-family:ui-monospace,SFMono-Regular,monospace;color:var(--pb-accent);font-size:12.5px;flex-shrink:0}
.pb-kw-service strong{font-weight:600;letter-spacing:-.01em}
.pb-kw-service p{margin-top:4px;font-size:13.5px;max-width:56ch}
.pb-kw-service span.price{margin-left:auto;font-family:ui-monospace,SFMono-Regular,monospace;font-size:12.5px;color:var(--pb-muted);flex-shrink:0;padding-left:12px}
.pb-kw-about-img{width:100%;max-width:420px;aspect-ratio:4/3;object-fit:cover;border-radius:var(--pb-radius-card);display:block;margin-bottom:22px}
.pb-kw-about p{max-width:64ch}
.pb-kw-about-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:44px;align-items:center}
.pb-kw-about-grid>p:only-child{grid-column:1/-1}
.pb-kw-about-grid .pb-kw-about-img{max-width:100%;margin-bottom:0;object-fit:contain;background:var(--pb-surface);padding:28px;box-sizing:border-box}
.pb-kw-quotes{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
.pb-kw-quotes .pb-kw-quote{margin-bottom:0}
.pb-kw-quotes .pb-kw-quote:last-child:nth-child(odd){grid-column:1/-1;max-width:720px}
.pb-kw-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 44px;align-items:start}
.pb-kw-quote{padding:20px 22px;background:var(--pb-surface);border-radius:var(--pb-radius-card);margin-bottom:18px}
.pb-kw-quote p{font-size:15px;max-width:52ch}
.pb-kw-quote footer{margin-top:10px;font-size:12.5px;color:var(--pb-muted)}
.pb-kw-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-kw-faq strong{display:block;font-weight:600;margin-bottom:6px}
.pb-kw-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-kw-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.pb-kw-contact address{font-style:normal}
.pb-kw-contact p{margin-bottom:8px}
.pb-kw-contact{align-items:start}
.pb-kw-hours-block{max-width:380px}
.pb-kw-hours-block h3{font-family:ui-monospace,SFMono-Regular,monospace;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:8px}
.pb-kw-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-kw-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-kw-hours tr:last-child td{border-bottom:none}
.pb-kw-hours td:first-child{font-weight:500;color:var(--pb-muted)}
.pb-kw-hours td:last-child{text-align:right}
.pb-kw-footer{border-top:1px solid var(--pb-line);padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-kw-footer a{border-bottom:1px solid var(--pb-line)}
.pb-kw-footer a:hover,.pb-kw-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-kw-utility-sticky{position:sticky;bottom:14px;z-index:30;display:flex;align-items:center;gap:16px;width:max-content;max-width:calc(100% - 32px);margin:0 16px 16px auto;padding:8px 8px 8px 16px;background:var(--pb-ink);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-card);box-shadow:0 10px 30px rgba(0,0,0,.16);font-size:13px}
.pb-klarwerk .pb-kw-utility-sticky a{padding:9px 13px;background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);font-family:var(--pb-font-body);font-weight:600}
@media(prefers-reduced-motion:no-preference){
  .pb-kw-metric div{animation:pb-kw-line .4s ease-out both}
  .pb-kw-metric div:nth-child(2){animation-delay:.12s}.pb-kw-metric div:nth-child(3){animation-delay:.24s}
  .pb-kw-service .idx{animation:pb-kw-check .35s ease-out both}
  .pb-kw-status .dot{animation:pb-kw-status 1.2s ease-in-out 3}
}
@keyframes pb-kw-line{from{transform:translateX(-10px);opacity:0}to{transform:none;opacity:1}}
@keyframes pb-kw-check{from{clip-path:inset(0 100% 0 0);opacity:0}to{clip-path:inset(0);opacity:1}}
@keyframes pb-kw-status{50%{transform:scale(1.45);opacity:.55}}
@media(pointer:fine){.pb-klarwerk .pb-kw-utility-sticky a:hover{filter:brightness(1.08)}}
@media(prefers-reduced-motion:reduce){.pb-klarwerk *,.pb-klarwerk *::before,.pb-klarwerk *::after{animation:none!important;transition:none!important}}
@media(max-width:840px){.pb-kw-nav-links{display:none}}
@media(max-width:720px){
  .pb-kw-bento{grid-template-columns:1fr}
  .pb-kw-metric{grid-row:auto}
  .pb-kw-status{grid-column:auto}
  .pb-kw-contact{grid-template-columns:1fr}
  .pb-kw-about-grid{grid-template-columns:1fr;gap:20px}
  .pb-kw-about-grid .pb-kw-about-img{order:-1;max-height:55vw}
  .pb-kw-quotes{grid-template-columns:1fr}
  .pb-kw-faq-grid{grid-template-columns:1fr}
}
.pb-kw-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-kw-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-kw-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

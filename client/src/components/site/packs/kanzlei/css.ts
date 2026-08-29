export const KANZLEI_CSS = `
.pb-kanzlei{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-kanzlei a{color:inherit;text-decoration:none}
.pb-kz-nav{position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--pb-canvas) 92%,transparent);display:flex;align-items:center;gap:22px;padding:18px clamp(22px,4vw,56px);border-bottom:1px solid var(--pb-line);box-shadow:0 1px 0 var(--pb-ink);backdrop-filter:blur(10px)}
.pb-kz-logo{font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:1.25rem;letter-spacing:-.02em}
.pb-kz-nav-links{display:flex;align-items:center;gap:22px;margin-left:auto;font-size:13px;font-weight:500}
.pb-kz-nav-links a{transition:color .15s}
.pb-kz-nav-links a:focus-visible,.pb-kz-nav-links a[aria-current="page"]{color:var(--pb-accent)}
.pb-kanzlei a.pb-kz-link{display:inline-flex;align-items:center;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:11px 18px;border-radius:var(--pb-radius-button);font-weight:600;font-size:13px;letter-spacing:.01em;transition:opacity .15s}
.pb-kz-link:focus-visible{opacity:.78}
.pb-kz-hero,.pb-kz-section{scroll-margin-top:5.5rem}
.pb-kz-hero{padding:clamp(36px,6vw,72px) clamp(22px,4vw,56px) clamp(48px,7vw,88px)}
.pb-kz-split{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(260px,.95fr);gap:clamp(28px,5vw,72px);align-items:center}
.pb-kz-copy{min-width:0}
.pb-kz-eyebrow{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--pb-accent);margin:0 0 16px}
.pb-kz-hero h1{font-family:var(--pb-font-display);font-weight:500;font-size:var(--pb-hero-size);letter-spacing:-.03em;line-height:1.02;max-width:12ch;margin:0}
.pb-kz-hero h1 span{font-style:italic;color:var(--pb-accent)}
.pb-kz-sub{margin:20px 0 0;max-width:38ch;color:var(--pb-muted);font-size:16px}
.pb-kz-hero .pb-kz-link{margin-top:28px}
.pb-kz-photo{position:relative;margin:0}
.pb-kz-photo img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;background:var(--pb-surface);padding:10px;border:1px solid var(--pb-line);filter:saturate(.72) sepia(.08)}
.pb-kz-idx{position:absolute;left:18px;bottom:22px;z-index:1;padding:10px 12px;background:var(--pb-canvas);border:1px solid var(--pb-ink);font-family:var(--pb-font-utility);font-size:10px;letter-spacing:.08em;text-transform:uppercase;line-height:1.55;color:var(--pb-accent)}
.pb-kz-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0 clamp(22px,4vw,56px);padding:22px 0;border-top:2px solid var(--pb-ink);border-bottom:1px solid var(--pb-line)}
.pb-kz-facts div{padding:0 18px;font-size:12px;color:var(--pb-muted);border-right:1px solid var(--pb-line)}
.pb-kz-facts div:first-child{padding-left:0}
.pb-kz-facts div:last-child{border-right:0}
.pb-kz-facts b{display:block;font-family:var(--pb-font-display);font-size:1.7rem;font-weight:500;color:var(--pb-ink);letter-spacing:-.02em}
.pb-kz-section{padding:clamp(64px,9vw,110px) clamp(22px,4vw,56px);border-top:1px solid var(--pb-line)}
.pb-kz-section h2{font-family:var(--pb-font-display);font-weight:500;letter-spacing:-.025em;font-size:clamp(2rem,4vw,3.4rem);margin:0 0 32px;max-width:16ch}
.pb-kz-services-grid{display:grid;grid-template-columns:minmax(180px,.7fr) minmax(0,1.3fr);gap:clamp(24px,5vw,72px);align-items:start}
.pb-kz-services-grid h2{margin-bottom:0}
.pb-kz-service{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:16px;align-items:baseline;padding:18px 0;border-bottom:1px solid var(--pb-line)}
.pb-kz-service .idx{font-family:var(--pb-font-utility);color:var(--pb-accent);font-size:12px}
.pb-kz-service strong{font-family:var(--pb-font-display);font-weight:500;font-size:1.2rem}
.pb-kz-service p{margin:6px 0 0;font-size:14px;max-width:48ch;color:var(--pb-muted)}
.pb-kz-service .price{font-family:var(--pb-font-utility);font-size:12px;color:var(--pb-muted)}
.pb-kz-about-grid{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:48px;align-items:start}
.pb-kz-about-grid>p:only-child{grid-column:1/-1}
.pb-kz-about-grid p{max-width:58ch;font-size:17px;line-height:1.7}
.pb-kz-about-img{width:100%;aspect-ratio:4/5;object-fit:cover;background:var(--pb-surface);padding:10px;border:1px solid var(--pb-line);filter:saturate(.72) sepia(.08);display:block}
.pb-kz-quotes{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid var(--pb-ink)}
.pb-kz-quote{margin:0;padding:28px 28px 26px 0;border:0;border-bottom:1px solid var(--pb-line);background:transparent}
.pb-kz-quote:nth-child(even){padding-left:28px;border-left:1px solid var(--pb-line)}
.pb-kz-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:clamp(1.1rem,1.8vw,1.4rem);line-height:1.4;max-width:30ch}
.pb-kz-quote footer{margin-top:18px;font-size:12px;color:var(--pb-muted)}
.pb-kz-quotes .pb-review-stars{margin-bottom:16px;color:var(--pb-accent)}
.pb-kz-faq-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));column-gap:clamp(40px,6vw,90px)}
.pb-kz-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-kz-faq strong{display:block;font-family:var(--pb-font-display);font-weight:500;margin-bottom:6px;font-size:1.15rem}
.pb-kz-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-kz-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
.pb-kz-contact address{font-style:normal;font-family:var(--pb-font-display);font-size:1.35rem;line-height:1.45}
.pb-kz-contact p{margin-bottom:10px}
.pb-kanzlei a[href^="tel:"],.pb-kanzlei a[href^="mailto:"]{border-bottom:1px solid var(--pb-line)}
.pb-kz-hours-block h3{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:10px}
.pb-kz-hours{width:100%;border-collapse:collapse}
.pb-kz-hours td{padding:8px 0;border-bottom:1px solid var(--pb-line);font-size:14px}
.pb-kz-hours td:last-child{text-align:right}
.pb-kz-gallery{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}
.pb-kz-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;filter:saturate(.72) sepia(.08);border:1px solid var(--pb-line);display:block;background:var(--pb-surface);padding:6px}
.pb-kz-gallery img:nth-child(3n+1){grid-column:span 7}
.pb-kz-gallery img:nth-child(3n+2){grid-column:span 5;margin-top:40px}
.pb-kz-gallery img:nth-child(3n+3){grid-column:4/span 6}
.pb-kz-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
.pb-kz-member img{width:100%;height:200px;object-fit:cover;filter:saturate(.7) sepia(.06);border:1px solid var(--pb-line);margin-bottom:10px;padding:6px;background:var(--pb-surface)}
.pb-kz-member strong{display:block;font-family:var(--pb-font-display);font-weight:500}
.pb-kz-member p{color:var(--pb-muted);font-size:13px}
.pb-kz-menu-category{margin-bottom:32px}
.pb-kz-menu-category h3{font-family:var(--pb-font-display);font-style:italic;font-size:1.2rem;color:var(--pb-accent);margin-bottom:10px}
.pb-kz-footer{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;padding:28px clamp(22px,4vw,56px);border-top:2px solid var(--pb-ink);font-size:12px;color:var(--pb-muted)}
.pb-kz-footer a{border-bottom:1px solid var(--pb-line)}
.pb-kz-page-header{padding:72px clamp(22px,4vw,56px) 36px;border-bottom:1px solid var(--pb-line)}
.pb-kz-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2.4rem,5vw,4rem);line-height:1.05}
.pb-kz-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted)}
@media(hover:hover) and (pointer:fine){
  .pb-kz-nav-links a:hover{color:var(--pb-accent)}
  .pb-kz-link:hover{opacity:.78}
  .pb-kanzlei a[href^="tel:"]:hover,.pb-kanzlei a[href^="mailto:"]:hover,.pb-kz-footer a:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
}
@media(prefers-reduced-motion:no-preference){
  .pb-kz-copy,.pb-kz-photo{animation:pb-kz-dossier-in .7s ease-out both}
  .pb-kz-photo{animation-delay:.12s}
  .pb-kz-idx{animation:pb-kz-folio .45s .35s ease-out both}
}
@keyframes pb-kz-dossier-in{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
@keyframes pb-kz-folio{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
@media(max-width:840px){
  .pb-kz-nav-links{display:none}
  .pb-kanzlei .pb-mnav{display:block;position:relative;margin-left:auto;flex-shrink:0}
  .pb-kanzlei .pb-mnav-toggle{box-sizing:border-box;list-style:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid var(--pb-line);border-radius:var(--pb-radius-button);background:var(--pb-canvas);color:var(--pb-ink)}
  .pb-kanzlei .pb-mnav-toggle::-webkit-details-marker{display:none}
  .pb-kanzlei .pb-mnav-icon{display:flex;flex-direction:column;gap:5px;width:20px}
  .pb-kanzlei .pb-mnav-icon span{display:block;height:2px;background:currentColor}
  .pb-kanzlei .pb-mnav[open] .pb-mnav-icon span:nth-child(1){transform:translateY(7px) rotate(45deg)}
  .pb-kanzlei .pb-mnav[open] .pb-mnav-icon span:nth-child(2){opacity:0}
  .pb-kanzlei .pb-mnav[open] .pb-mnav-icon span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
  .pb-kanzlei .pb-mnav-panel{position:absolute;top:calc(100% + 8px);right:0;z-index:80;display:flex;flex-direction:column;min-width:min(264px,84vw);padding:6px;background:var(--pb-canvas);border:1px solid var(--pb-line)}
  .pb-kanzlei .pb-mnav-panel a{display:flex;align-items:center;min-height:44px;padding:8px 14px;font-size:17px}
  .pb-kz-split{grid-template-columns:1fr;gap:28px}
  .pb-kz-facts{grid-template-columns:1fr;margin-inline:22px}
  .pb-kz-facts div{padding:12px 0;border-right:0;border-bottom:1px solid var(--pb-line)}
  .pb-kz-facts div:last-child{border-bottom:0}
  .pb-kz-services-grid{grid-template-columns:1fr}
  .pb-kz-contact,.pb-kz-about-grid{grid-template-columns:1fr}
  .pb-kz-about-img{order:-1;max-height:58vw;aspect-ratio:4/3}
  .pb-kz-gallery{grid-template-columns:1fr 1fr;gap:8px}
  .pb-kz-gallery img:nth-child(n){grid-column:auto;margin-top:0}
  .pb-kz-gallery img:first-child{grid-column:1/-1}
}
@media(max-width:720px){.pb-kz-quotes{grid-template-columns:1fr}.pb-kz-quote:nth-child(even){padding-left:0;border-left:0}.pb-kz-hero{padding:36px 20px 48px}.pb-kz-section{padding:56px 20px}}
@media(prefers-reduced-motion:reduce){.pb-kanzlei *,.pb-kanzlei *::before,.pb-kanzlei *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

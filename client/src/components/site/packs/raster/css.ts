export const RASTER_CSS = `
.pb-raster{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-raster a{color:inherit;text-decoration:none}
.pb-ra-nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:24px;padding:16px 32px;background:var(--pb-canvas);border-bottom:1px solid var(--pb-ink)}
.pb-ra-logo{font-family:var(--pb-font-display);font-weight:700;font-size:15px;letter-spacing:-.01em}
.pb-ra-nav-links{display:flex;gap:22px;margin-left:auto;font-size:12.5px;font-weight:500}
.pb-ra-nav-links a{position:relative;padding-left:14px;transition:color .15s}
.pb-ra-nav-links a::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:transparent;transition:background .15s}
.pb-ra-nav-links a:hover::before,.pb-ra-nav-links a:focus-visible::before,.pb-ra-nav-links a[aria-current="page"]::before{background:var(--pb-accent)}
.pb-ra-hero{display:grid;grid-template-columns:64px minmax(0,7fr) minmax(0,5fr);gap:36px;max-width:1200px;margin:0 auto;padding:72px 32px 80px;border-bottom:1px solid var(--pb-ink)}
.pb-ra-hero-margin{display:flex;flex-direction:column;gap:10px;border-right:1px solid var(--pb-line);padding-right:16px}
.pb-ra-index{font-size:12px;font-weight:700;color:var(--pb-accent-text);font-variant-numeric:tabular-nums}
.pb-ra-margin-note{writing-mode:vertical-rl;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--pb-muted)}
.pb-ra-hero h1{font-family:var(--pb-font-display);font-weight:700;font-size:var(--pb-hero-size);line-height:1.02;letter-spacing:-.03em;max-width:16ch}
.pb-raster .pb-rich-accent{font-style:normal;color:var(--pb-accent-text)}
.pb-ra-sub{margin-top:22px;max-width:48ch;color:var(--pb-muted);font-size:16px}
.pb-raster a.pb-ra-cta{display:inline-flex;align-items:center;gap:10px;margin-top:30px;padding:13px 22px;background:var(--pb-ink);color:var(--pb-canvas);font-weight:500;font-size:14px;transition:background .15s}
.pb-ra-cta i{width:7px;height:7px;border-radius:50%;background:var(--pb-accent)}
.pb-ra-cta:hover,.pb-ra-cta:focus-visible{background:var(--pb-accent)}
.pb-ra-figure{margin:0}
.pb-ra-figure img{display:block;width:100%;height:auto}
.pb-ra-hero-figure img{aspect-ratio:4/4.4;object-fit:cover}
.pb-ra-figure figcaption{margin-top:8px;font-size:11px;letter-spacing:.06em;color:var(--pb-muted);border-top:1px solid var(--pb-line);padding-top:6px;font-variant-numeric:tabular-nums}
.pb-ra-section{max-width:1200px;margin:0 auto;padding:64px 32px;border-bottom:1px solid var(--pb-line)}
.pb-ra-head{display:grid;grid-template-columns:64px 1fr;gap:36px;align-items:baseline}
.pb-ra-head h2{font-family:var(--pb-font-display);font-weight:700;font-size:clamp(1.4rem,2.4vw,2rem);letter-spacing:-.02em}
.pb-ra-intro{margin:14px 0 0 100px;max-width:56ch;color:var(--pb-muted)}
.pb-ra-services{margin:36px 0 0 100px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0 48px}
.pb-ra-service{position:relative;padding:18px 0;border-top:1px solid var(--pb-ink)}
.pb-ra-num{display:block;font-size:11.5px;font-weight:700;color:var(--pb-accent-text);font-variant-numeric:tabular-nums;margin-bottom:8px}
.pb-ra-service strong{font-family:var(--pb-font-display);font-weight:600;font-size:16.5px;letter-spacing:-.01em}
.pb-ra-service p{margin-top:6px;font-size:14px;color:var(--pb-muted);max-width:44ch}
.pb-ra-price{display:block;margin-top:8px;font-size:13px;font-weight:500;color:var(--pb-accent-text)}
.pb-ra-about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:48px;align-items:start;margin:32px 0 0 100px}
.pb-ra-about>p:only-child{grid-column:1/-1}
.pb-ra-about p{max-width:60ch;font-size:15.5px}
.pb-ra-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px;margin:36px 0 0 100px}
.pb-ra-gallery img{aspect-ratio:4/3;object-fit:cover}
.pb-ra-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:48px;margin:36px 0 0 100px}
.pb-ra-quote{margin:0;border-top:1px solid var(--pb-ink);padding-top:16px}
.pb-ra-quote p{font-size:15px;line-height:1.55}
.pb-ra-quote footer{margin-top:14px;font-size:12px;color:var(--pb-muted)}
.pb-ra-quotes .pb-review-stars{margin-bottom:10px;color:var(--pb-accent-text)}
.pb-ra-faq-list{margin:28px 0 0 100px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0 48px}
.pb-ra-faq{padding:16px 0;border-top:1px solid var(--pb-line)}
.pb-ra-faq strong{display:block;font-weight:600;font-size:15px;margin-bottom:5px}
.pb-ra-faq p{font-size:14px;color:var(--pb-muted);max-width:58ch}
.pb-ra-contact{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:48px;margin:28px 0 0 100px}
.pb-ra-contact address{font-style:normal}
.pb-ra-contact address p{margin-bottom:8px;font-size:15px}
.pb-raster a[href^="tel:"],.pb-raster a[href^="mailto:"]{border-bottom:1px solid var(--pb-ink);transition:color .15s,border-color .15s}
.pb-raster a[href^="tel:"]:hover,.pb-raster a[href^="mailto:"]:hover{color:var(--pb-accent-text);border-color:var(--pb-accent-text)}
.pb-ra-hours-block h3{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--pb-muted);margin-bottom:8px;font-weight:700}
.pb-ra-hours{width:100%;max-width:340px;border-collapse:collapse}
.pb-ra-hours td{padding:7px 0;border-bottom:1px solid var(--pb-line);font-size:13.5px;font-variant-numeric:tabular-nums}
.pb-ra-hours tr:last-child td{border-bottom:none}
.pb-ra-hours td:last-child{text-align:right}
.pb-ra-menu-category{margin:28px 0 0 100px}
.pb-ra-menu-category h3{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--pb-muted);font-weight:700;margin-bottom:6px}
.pb-ra-menu-row{display:grid;grid-template-columns:1fr auto;gap:4px 20px}
.pb-ra-menu-row .pb-ra-price{grid-column:2;grid-row:1;margin-top:0}
.pb-ra-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:28px;margin:36px 0 0 100px}
.pb-ra-member img{width:100%;aspect-ratio:3/4;object-fit:cover;margin-bottom:10px}
.pb-ra-member strong{display:block;font-weight:600}
.pb-ra-member p{font-size:13px;color:var(--pb-muted)}
.pb-ra-section .pb-ra-cta{margin:26px 0 0 100px}
.pb-ra-page-header{max-width:1200px;margin:0 auto;padding:64px 32px 24px;border-bottom:1px solid var(--pb-ink)}
.pb-ra-page-header h1{font-family:var(--pb-font-display);font-weight:700;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.03em}
.pb-ra-page-header p{margin-top:14px;max-width:58ch;color:var(--pb-muted)}
.pb-ra-footer{max-width:1200px;margin:0 auto;padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-ra-footer p{margin-bottom:4px}
.pb-ra-footer a{border-bottom:1px solid var(--pb-line)}
.pb-ra-footer a:hover,.pb-ra-footer a:focus-visible{color:var(--pb-accent-text);border-color:var(--pb-accent-text)}
@media(prefers-reduced-motion:no-preference){
  .pb-ra-hero h1{animation:pb-ra-in .55s ease-out both}
  .pb-ra-sub,.pb-raster a.pb-ra-cta{animation:pb-ra-in .55s .12s ease-out both}
  .pb-ra-hero-figure{animation:pb-ra-in .6s .2s ease-out both}
}
@keyframes pb-ra-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.pb-raster *,.pb-raster *::before,.pb-raster *::after{animation:none!important;transition:none!important}}
@media(max-width:900px){.pb-ra-nav{padding:14px 18px}.pb-ra-nav-links{display:none}.pb-ra-hero{grid-template-columns:1fr;gap:26px;padding:44px 18px 56px}.pb-ra-hero-margin{flex-direction:row;border-right:none;border-bottom:1px solid var(--pb-line);padding:0 0 10px}.pb-ra-margin-note{writing-mode:horizontal-tb}.pb-ra-section{padding:48px 18px}.pb-ra-head{grid-template-columns:1fr;gap:6px}.pb-ra-intro,.pb-ra-services,.pb-ra-about,.pb-ra-gallery,.pb-ra-quotes,.pb-ra-faq-list,.pb-ra-contact,.pb-ra-menu-category,.pb-ra-team,.pb-ra-section .pb-ra-cta{margin-left:0}}
@media(max-width:390px){.pb-ra-hero{padding-left:14px;padding-right:14px}.pb-ra-section{padding-left:14px;padding-right:14px}}
`;

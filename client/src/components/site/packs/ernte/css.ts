export const ERNTE_CSS = `
.pb-ernte{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-ernte a{color:inherit;text-decoration:none}
.pb-er-nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:22px;padding:16px 30px;background:color-mix(in srgb,var(--pb-canvas) 94%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--pb-line)}
.pb-er-logo{font-family:var(--pb-font-display);font-size:21px;letter-spacing:.04em;color:var(--pb-accent)}
.pb-er-nav-links{display:flex;gap:20px;margin-left:auto;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
.pb-er-nav-links a{color:var(--pb-accent);opacity:.75;transition:opacity .15s}
.pb-er-nav-links a:hover,.pb-er-nav-links a:focus-visible,.pb-er-nav-links a[aria-current="page"]{opacity:1}
.pb-er-nav-links a[aria-current="page"]{border-bottom:2px solid var(--pb-accent-2)}
.pb-er-hero{position:relative;display:grid;grid-template-columns:minmax(0,6.5fr) minmax(0,5.5fr);gap:48px;align-items:center;max-width:1180px;margin:0 auto;padding:76px 30px 96px}\n.pb-er-hero>.pb-er-blob-sage{position:absolute;left:-160px;top:38%;width:280px;height:280px;inset:auto;z-index:0;opacity:.85}\n.pb-er-hero-deco{position:absolute;right:-30px;bottom:-34px;width:230px;height:184px;color:var(--pb-accent);opacity:.5;z-index:0;pointer-events:none}
.pb-er-script{font-family:var(--pb-font-utility);font-size:clamp(1.5rem,2.6vw,2.1rem);color:var(--pb-accent);transform:rotate(-1.5deg);transform-origin:left}
.pb-er-hero h1{margin-top:10px;font-family:var(--pb-font-display);font-weight:400;font-size:var(--pb-hero-size);line-height:.95;letter-spacing:.02em;text-transform:uppercase;color:var(--pb-accent);max-width:15ch}
.pb-ernte .pb-rich-accent{font-style:normal;color:var(--pb-accent);box-shadow:inset 0 -0.28em 0 var(--pb-accent-2)}
.pb-er-sub{margin-top:16px;max-width:44ch;font-family:var(--pb-font-utility);font-size:clamp(1.35rem,2.2vw,1.8rem);line-height:1.35;color:var(--pb-accent)}
.pb-er-dots{display:flex;gap:9px;margin-top:16px}\n.pb-er-dots i{width:7px;height:7px;border-radius:50%;background:var(--pb-accent)}\n.pb-er-hero-actions{display:flex;align-items:center;gap:20px;margin-top:26px;flex-wrap:wrap}
.pb-ernte a.pb-er-cta{display:inline-block;padding:15px 36px;background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);font-weight:600;font-size:13px;letter-spacing:.1em;text-transform:uppercase;transition:transform .18s,box-shadow .18s}
.pb-er-cta:hover,.pb-er-cta:focus-visible{transform:translateY(-2px);box-shadow:0 14px 28px color-mix(in srgb,var(--pb-accent) 28%,transparent)}
.pb-er-rating{font-size:13px;color:var(--pb-muted)}
.pb-er-sprig{width:150px;height:120px;color:var(--pb-accent)}
.pb-er-hero-sprig{display:block;margin-top:34px;opacity:.75}
.pb-er-hero-media{position:relative}
.pb-er-blob{position:absolute;inset:-8% -6%;width:112%;height:116%;z-index:0}\n.pb-er-hero-media .pb-er-blob{inset:auto;right:-13%;top:-11%;width:74%;height:70%;transform:rotate(18deg)}
.pb-er-blob path{fill:var(--pb-accent-2)}
.pb-er-blob-sage path{fill:#A2D3A6}
.pb-er-hero-media img{position:relative;z-index:1;display:block;width:100%;aspect-ratio:4/4.1;object-fit:cover;clip-path:url(#pb-er-clip-a);filter:drop-shadow(-10px 12px 26px rgba(0,0,0,.14))}
.pb-er-section{max-width:1180px;margin:0 auto;padding:72px 30px;border-top:1px solid var(--pb-line)}
.pb-er-title{font-family:var(--pb-font-display);font-weight:400;font-size:clamp(1.8rem,3.2vw,2.6rem);letter-spacing:.03em;text-transform:uppercase;color:var(--pb-accent)}
.pb-er-intro{margin-top:12px;max-width:56ch;color:var(--pb-muted)}
.pb-er-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:32px}
.pb-er-card{background:var(--pb-surface);border-radius:var(--pb-radius-card);padding:22px;box-shadow:-14px 10px 49px rgba(0,0,0,.08);transition:transform .2s}
.pb-er-card:hover{transform:translateY(-3px)}
.pb-er-card strong{display:block;font-weight:600;font-size:16.5px}
.pb-er-card p{margin-top:7px;font-size:14px;color:var(--pb-muted)}
.pb-er-price{display:inline-block;margin-top:10px;font-weight:600;font-size:13.5px;color:var(--pb-accent)}
.pb-er-about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:48px;align-items:center;margin-top:32px}
.pb-er-about>p:only-child{grid-column:1/-1}
.pb-er-about p{max-width:62ch;font-size:15.5px}
.pb-er-media{position:relative;display:block}
.pb-er-media img{position:relative;z-index:1;display:block;width:100%;aspect-ratio:4/3.6;object-fit:cover;clip-path:url(#pb-er-clip-b);filter:drop-shadow(-10px 12px 24px rgba(0,0,0,.12))}\n.pb-er-media .pb-er-blob{inset:auto;left:-9%;bottom:-11%;width:58%;height:58%;transform:rotate(-10deg)}
.pb-er-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:32px}
.pb-er-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--pb-radius-card)}
.pb-er-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-top:32px}
.pb-er-quote{margin:0;background:var(--pb-surface);border-radius:var(--pb-radius-card);padding:24px;box-shadow:-14px 10px 49px rgba(0,0,0,.08)}
.pb-er-quote p{font-size:15px;line-height:1.55}
.pb-er-quote footer{margin-top:14px;font-size:12px;color:var(--pb-muted)}
.pb-er-quotes .pb-review-stars{margin-bottom:10px;color:var(--pb-accent-2)}
.pb-er-faq-list{margin-top:28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0 44px}
.pb-er-faq{padding:17px 0;border-bottom:1px solid var(--pb-line)}
.pb-er-faq strong{display:block;font-weight:600;font-size:15px;margin-bottom:5px;color:var(--pb-accent)}
.pb-er-faq p{font-size:14px;color:var(--pb-muted);max-width:58ch}
.pb-er-contact{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:40px;margin-top:30px}
.pb-er-contact address{font-style:normal}
.pb-er-contact .pb-er-sprig{display:block;margin-bottom:16px;opacity:.7}
.pb-er-contact address p{margin-bottom:9px;font-size:15px}
.pb-ernte a[href^="tel:"],.pb-ernte a[href^="mailto:"]{color:var(--pb-accent);border-bottom:1px solid color-mix(in srgb,var(--pb-accent) 35%,transparent);transition:border-color .15s}
.pb-ernte a[href^="tel:"]:hover,.pb-ernte a[href^="mailto:"]:hover{border-color:var(--pb-accent)}
.pb-er-hours-block h3{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--pb-muted);margin-bottom:10px;font-weight:700}
.pb-er-hours{width:100%;max-width:340px;border-collapse:collapse}
.pb-er-hours td{padding:7px 0;border-bottom:1px solid var(--pb-line);font-size:13.5px}
.pb-er-hours tr:last-child td{border-bottom:none}
.pb-er-hours td:last-child{text-align:right}
.pb-er-menu{margin-top:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:36px}
.pb-er-menu-category h3{font-family:var(--pb-font-utility);font-size:24px;color:var(--pb-accent);margin-bottom:10px;transform:rotate(-1deg);transform-origin:left}
.pb-er-menu-row{display:flex;gap:18px;align-items:baseline;padding:12px 0;border-bottom:1px solid var(--pb-line)}
.pb-er-menu-row strong{font-weight:600}
.pb-er-menu-row p{font-size:13.5px;color:var(--pb-muted);max-width:40ch}
.pb-er-menu-row .pb-er-price{margin-left:auto;margin-top:0;flex-shrink:0;white-space:nowrap}
.pb-er-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-top:32px}
.pb-er-member img{width:100%;aspect-ratio:1/1;object-fit:cover;clip-path:url(#pb-er-clip-b);margin-bottom:12px}
.pb-er-member strong{display:block;font-weight:600}
.pb-er-member p{font-size:13px;color:var(--pb-muted)}
.pb-er-cta-section .pb-er-cta{margin-top:24px}
.pb-er-page-header{max-width:1180px;margin:0 auto;padding:64px 30px 16px}
.pb-er-page-header h1{font-family:var(--pb-font-display);font-weight:400;text-transform:uppercase;letter-spacing:.03em;color:var(--pb-accent);font-size:clamp(2.2rem,4.5vw,3.4rem)}
.pb-er-page-header p{margin-top:14px;max-width:58ch;color:var(--pb-muted)}
.pb-er-footer{border-top:1px solid var(--pb-line);padding:34px 30px;font-size:12.5px;color:var(--pb-muted)}
.pb-er-footer p{margin-bottom:4px}
.pb-er-footer a{border-bottom:1px solid var(--pb-line)}
.pb-er-footer a:hover,.pb-er-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(prefers-reduced-motion:no-preference){
  .pb-er-script{animation:pb-er-write .6s ease-out both}
  .pb-er-hero h1{animation:pb-er-up .55s .08s ease-out both}
  .pb-er-sub,.pb-er-hero-actions{animation:pb-er-up .55s .18s ease-out both}
  .pb-er-hero-sprig{animation:pb-er-up .55s .28s ease-out both}
  .pb-er-hero-media{animation:pb-er-up .65s .16s ease-out both}
  .pb-er-hero-media .pb-er-blob{animation:pb-er-bloom .8s .1s cubic-bezier(.2,.7,.2,1) both}
}
@keyframes pb-er-write{from{opacity:0;transform:rotate(-1.5deg) translateX(-12px)}to{opacity:1;transform:rotate(-1.5deg)}}
@keyframes pb-er-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes pb-er-bloom{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}
@media(prefers-reduced-motion:reduce){.pb-ernte *,.pb-ernte *::before,.pb-ernte *::after{animation:none!important;transition:none!important}}
@media(max-width:880px){.pb-er-nav{padding:14px 18px}.pb-er-nav-links{display:none}.pb-er-hero{grid-template-columns:1fr;gap:36px;padding:44px 18px 72px}.pb-er-hero>.pb-er-blob-sage{left:-120px;top:auto;bottom:24%;width:200px;height:200px}.pb-er-hero-deco{right:-16px;bottom:-20px;width:160px;height:128px}.pb-er-section{padding:52px 18px}.pb-er-about{grid-template-columns:1fr;gap:26px}.pb-er-about .pb-er-media{order:-1;max-width:420px}}
@media(max-width:390px){.pb-er-hero{padding-left:14px;padding-right:14px}.pb-er-section{padding-left:14px;padding-right:14px}}
`;

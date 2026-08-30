export const STROM_CSS = `
.pb-strom{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-strom a{color:inherit;text-decoration:none}
.pb-st-nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:22px;padding:16px 30px;background:color-mix(in srgb,var(--pb-canvas) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--pb-line)}
.pb-st-logo{font-family:var(--pb-font-display);font-weight:700;font-size:16px}
.pb-st-nav-links{display:flex;gap:20px;margin-left:auto;font-size:13px;font-weight:500}
.pb-st-nav-links a{color:var(--pb-muted);transition:color .15s}
.pb-st-nav-links a:hover,.pb-st-nav-links a:focus-visible,.pb-st-nav-links a[aria-current="page"]{color:var(--pb-accent)}
.pb-st-mono{display:flex;align-items:center;gap:9px;font-family:var(--pb-font-utility);font-size:11.5px;letter-spacing:.18em;color:var(--pb-muted)}
.pb-st-mono i{width:7px;height:7px;border-radius:50%;background:var(--pb-accent);box-shadow:0 0 10px var(--pb-accent)}
.pb-st-hero{display:grid;grid-template-columns:minmax(0,6.5fr) minmax(0,5.5fr);gap:48px;align-items:center;max-width:1180px;margin:0 auto;padding:76px 30px 84px}
.pb-st-hero h1{margin-top:20px;font-family:var(--pb-font-display);font-weight:600;font-size:var(--pb-hero-size);line-height:1.06;letter-spacing:-.02em;max-width:16ch}
.pb-st-glow,.pb-strom .pb-rich-accent{font-style:normal;color:var(--pb-accent);text-shadow:0 0 26px color-mix(in srgb,var(--pb-accent) 45%,transparent)}
.pb-st-sub{margin-top:20px;max-width:50ch;color:var(--pb-muted);font-size:16px}
.pb-strom a.pb-st-cta{display:inline-block;margin-top:28px;padding:14px 30px;background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);font-weight:600;font-size:14.5px;box-shadow:0 0 24px color-mix(in srgb,var(--pb-accent) 35%,transparent);transition:box-shadow .2s,transform .2s}
.pb-st-cta:hover,.pb-st-cta:focus-visible{box-shadow:0 0 42px color-mix(in srgb,var(--pb-accent) 55%,transparent);transform:translateY(-1px)}
.pb-st-terminal{display:flex;gap:0;margin-top:36px;border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);background:var(--pb-surface);overflow:hidden;width:max-content;max-width:100%}
.pb-st-terminal div{padding:14px 22px;border-right:1px solid var(--pb-line)}
.pb-st-terminal div:last-child{border-right:none}
.pb-st-terminal b{display:block;font-family:var(--pb-font-utility);font-size:19px;color:var(--pb-accent);font-variant-numeric:tabular-nums}
.pb-st-terminal span{display:block;margin-top:2px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--pb-muted)}
.pb-st-hero-media{position:relative}
.pb-st-aurora{position:absolute;inset:-60px -40px;background:radial-gradient(ellipse at 65% 35%,color-mix(in srgb,var(--pb-accent) 22%,transparent),transparent 62%);filter:blur(6px);pointer-events:none}
.pb-st-screen{position:relative;display:block;border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);background:var(--pb-surface);padding:8px;z-index:1}
.pb-st-screen::before{content:"";display:block;height:8px;margin-bottom:8px;border-bottom:1px solid var(--pb-line);background:radial-gradient(circle 3px at 8px 3px,var(--pb-accent) 2.6px,transparent 3px),radial-gradient(circle 3px at 22px 3px,var(--pb-line) 2.6px,transparent 3px),radial-gradient(circle 3px at 36px 3px,var(--pb-line) 2.6px,transparent 3px)}
.pb-st-screen img{display:block;width:100%;height:auto;border-radius:calc(var(--pb-radius-card) - 5px);filter:saturate(.92) brightness(.94)}
.pb-st-hero-media .pb-st-screen img{aspect-ratio:4/3.4;object-fit:cover}
.pb-st-section{max-width:1180px;margin:0 auto;padding:68px 30px;border-top:1px solid var(--pb-line)}
.pb-st-title{margin-top:14px;font-family:var(--pb-font-display);font-weight:600;font-size:clamp(1.5rem,2.6vw,2.2rem);letter-spacing:-.015em}
.pb-st-intro{margin-top:12px;max-width:56ch;color:var(--pb-muted)}
.pb-st-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:32px}
.pb-st-card{position:relative;background:var(--pb-surface);border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);padding:22px;transition:border-color .2s,box-shadow .2s}
.pb-st-card:hover{border-color:color-mix(in srgb,var(--pb-accent) 55%,var(--pb-line));box-shadow:0 0 22px color-mix(in srgb,var(--pb-accent) 12%,transparent)}
.pb-st-card-id{font-family:var(--pb-font-utility);font-size:11px;color:var(--pb-accent);letter-spacing:.14em}
.pb-st-card strong{display:block;margin-top:8px;font-family:var(--pb-font-display);font-weight:600;font-size:16.5px}
.pb-st-card p{margin-top:7px;font-size:14px;color:var(--pb-muted)}
.pb-st-price{display:inline-block;margin-top:10px;font-family:var(--pb-font-utility);font-size:13px;color:var(--pb-accent)}
.pb-st-about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:44px;align-items:center;margin-top:30px}
.pb-st-about>p:only-child{grid-column:1/-1}
.pb-st-about p{max-width:62ch;font-size:15.5px}
.pb-st-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-top:32px}
.pb-st-gallery .pb-st-screen img{aspect-ratio:4/3;object-fit:cover}
.pb-st-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;margin-top:32px}
.pb-st-quote{margin:0}
.pb-st-quote p{font-size:15px;line-height:1.55}
.pb-st-quote footer{margin-top:14px;font-size:12px;color:var(--pb-muted)}
.pb-st-quotes .pb-review-stars{margin-bottom:10px;color:var(--pb-accent)}
.pb-st-faq-list{margin-top:26px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0 44px}
.pb-st-faq{padding:17px 0;border-bottom:1px solid var(--pb-line)}
.pb-st-faq strong{display:block;font-weight:600;font-size:15px;margin-bottom:5px}
.pb-st-faq p{font-size:14px;color:var(--pb-muted);max-width:58ch}
.pb-st-contact{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:30px}
.pb-st-contact address{font-style:normal}
.pb-st-contact address p{margin-bottom:9px;font-size:15px}
.pb-strom a[href^="tel:"],.pb-strom a[href^="mailto:"]{color:var(--pb-accent);transition:text-shadow .2s}
.pb-strom a[href^="tel:"]:hover,.pb-strom a[href^="mailto:"]:hover{text-shadow:0 0 16px color-mix(in srgb,var(--pb-accent) 60%,transparent)}
.pb-st-hours-block h3{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--pb-muted);margin-bottom:10px}
.pb-st-hours{width:100%;border-collapse:collapse}
.pb-st-hours td{padding:7px 0;border-bottom:1px solid var(--pb-line);font-size:13.5px;font-variant-numeric:tabular-nums}
.pb-st-hours tr:last-child td{border-bottom:none}
.pb-st-hours td:first-child{font-family:var(--pb-font-utility);font-size:11.5px;letter-spacing:.08em;color:var(--pb-muted)}
.pb-st-hours td:last-child{text-align:right}
.pb-st-menu-category{margin-top:28px}
.pb-st-menu-category h3{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:8px}
.pb-st-menu-row{display:flex;gap:18px;align-items:baseline;padding:11px 0;border-bottom:1px solid var(--pb-line)}
.pb-st-menu-row strong{font-weight:600}
.pb-st-menu-row p{font-size:13.5px;color:var(--pb-muted)}
.pb-st-menu-row .pb-st-price{margin-left:auto;margin-top:0;flex-shrink:0}
.pb-st-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:22px;margin-top:32px}
.pb-st-member .pb-st-screen{margin-bottom:12px}
.pb-st-member .pb-st-screen img{aspect-ratio:1/1;object-fit:cover}
.pb-st-member strong{display:block;font-weight:600}
.pb-st-member p{font-size:13px;color:var(--pb-muted)}
.pb-st-page-header{max-width:1180px;margin:0 auto;padding:64px 30px 20px}
.pb-st-page-header h1{font-family:var(--pb-font-display);font-weight:600;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.02em}
.pb-st-page-header p{margin-top:14px;max-width:58ch;color:var(--pb-muted)}
.pb-st-footer{border-top:1px solid var(--pb-line);padding:32px 30px;font-size:12.5px;color:var(--pb-muted)}
.pb-st-footer p{margin-bottom:4px}
.pb-st-footer a:hover,.pb-st-footer a:focus-visible{color:var(--pb-accent)}
@media(prefers-reduced-motion:no-preference){
  .pb-st-mono i{animation:pb-st-pulse 2.4s ease-in-out infinite}
  .pb-st-hero-copy>*{animation:pb-st-in .5s ease-out both}
  .pb-st-hero-copy>h1{animation-delay:.06s}
  .pb-st-hero-copy>.pb-st-sub{animation-delay:.14s}
  .pb-st-hero-copy>.pb-st-cta{animation-delay:.2s}
  .pb-st-hero-copy>.pb-st-terminal{animation-delay:.28s}
  .pb-st-hero-media{animation:pb-st-in .6s .18s ease-out both}
}
@keyframes pb-st-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes pb-st-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.pb-strom *,.pb-strom *::before,.pb-strom *::after{animation:none!important;transition:none!important}}
@media(max-width:880px){.pb-st-nav{padding:14px 18px}.pb-st-nav-links{display:none}.pb-st-hero{grid-template-columns:1fr;gap:32px;padding:48px 18px 56px}.pb-st-section{padding:50px 18px}.pb-st-about{grid-template-columns:1fr;gap:24px}.pb-st-about .pb-st-screen{order:-1}.pb-st-terminal{width:100%}.pb-st-terminal div{flex:1;padding:12px 14px}}
@media(max-width:390px){.pb-st-hero{padding-left:14px;padding-right:14px}.pb-st-section{padding-left:14px;padding-right:14px}.pb-st-terminal{flex-direction:column}.pb-st-terminal div{border-right:none;border-bottom:1px solid var(--pb-line)}.pb-st-terminal div:last-child{border-bottom:none}}
`;

export const PLAKAT_CSS = `
.pb-plakat{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-plakat a{color:inherit;text-decoration:none}
.pb-pl-nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:20px;padding:14px 24px;background:var(--pb-canvas);border-bottom:3px solid var(--pb-ink)}
.pb-pl-logo{font-family:var(--pb-font-display);font-size:17px;text-transform:uppercase;letter-spacing:.02em}
.pb-pl-nav-links{display:flex;gap:4px;margin-left:auto;font-size:13px;font-weight:700}
.pb-pl-nav-links a{padding:6px 10px;border:2px solid transparent;transition:border-color .12s,background .12s}
.pb-pl-nav-links a:hover,.pb-pl-nav-links a:focus-visible{border-color:var(--pb-ink)}
.pb-pl-nav-links a[aria-current="page"]{background:var(--pb-accent);color:var(--pb-accent-contrast);border-color:var(--pb-ink)}
.pb-pl-hero{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:40px;align-items:center;padding:64px 24px 72px;max-width:1160px;margin:0 auto}
.pb-pl-hero h1{font-family:var(--pb-font-display);font-weight:400;font-size:var(--pb-hero-size);line-height:.98;text-transform:uppercase;letter-spacing:.01em;max-width:14ch}
.pb-pl-mark{box-shadow:inset 0 -0.32em 0 var(--pb-accent)}
.pb-plakat .pb-rich-accent{font-style:normal;box-shadow:inset 0 -0.32em 0 var(--pb-accent)}
.pb-pl-sub{margin-top:22px;max-width:46ch;font-size:16.5px;font-weight:400}
.pb-plakat a.pb-pl-cta{display:inline-block;margin-top:28px;padding:15px 30px;background:var(--pb-accent);color:var(--pb-accent-contrast);border:3px solid var(--pb-ink);box-shadow:7px 7px 0 var(--pb-ink);font-weight:700;font-size:15px;text-transform:uppercase;letter-spacing:.04em;transition:transform .12s,box-shadow .12s}
.pb-pl-cta:hover,.pb-pl-cta:focus-visible{transform:translate(3px,3px);box-shadow:3px 3px 0 var(--pb-ink)}
.pb-pl-hero-media{position:relative}
.pb-pl-photo{display:block;width:100%;height:auto;border:3px solid var(--pb-ink);box-shadow:12px 12px 0 var(--pb-ink)}
.pb-pl-hero-media .pb-pl-photo{aspect-ratio:4/4.6;object-fit:cover}
.pb-pl-sticker{position:absolute;top:-22px;right:-14px;display:grid;place-items:center;width:108px;height:108px;background:var(--pb-accent);color:var(--pb-accent-contrast);border:3px solid var(--pb-ink);border-radius:50%;transform:rotate(8deg);font-family:var(--pb-font-display);font-size:22px;line-height:1.05;text-align:center;padding:10px}
.pb-pl-sticker small{font-family:var(--pb-font-body);font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;display:block;margin-top:2px}
.pb-pl-section{max-width:1160px;margin:0 auto;padding:64px 24px;border-top:3px solid var(--pb-ink)}
.pb-pl-title{font-family:var(--pb-font-display);font-weight:400;font-size:clamp(1.7rem,3.6vw,2.6rem);text-transform:uppercase;margin-bottom:8px}
.pb-pl-title::after{content:"";display:block;width:74px;height:8px;background:var(--pb-accent);margin-top:10px}
.pb-pl-intro{margin:16px 0 0;max-width:56ch;color:var(--pb-muted)}
.pb-pl-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:22px;margin-top:32px}
.pb-pl-card{background:var(--pb-surface);border:3px solid var(--pb-ink);box-shadow:7px 7px 0 var(--pb-ink);padding:20px}
.pb-pl-card strong{display:block;font-weight:700;font-size:17px;text-transform:uppercase;letter-spacing:.02em}
.pb-pl-card p{margin-top:8px;font-size:14px;color:var(--pb-muted)}
.pb-pl-price{display:inline-block;margin-top:12px;padding:3px 8px;background:var(--pb-accent);color:var(--pb-accent-contrast);font-weight:700;font-size:13px}
.pb-pl-about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:40px;align-items:center;margin-top:32px}
.pb-pl-about>p:only-child{grid-column:1/-1}
.pb-pl-about p{max-width:60ch;font-size:15.5px}
.pb-pl-about .pb-pl-photo{aspect-ratio:4/3;object-fit:cover}
.pb-pl-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:26px;margin-top:36px}
.pb-pl-gallery img{width:100%;aspect-ratio:1/1;object-fit:cover;border:3px solid var(--pb-ink);box-shadow:7px 7px 0 var(--pb-ink)}
.pb-pl-gallery img.tilt-r{transform:rotate(1.4deg)}
.pb-pl-gallery img.tilt-l{transform:rotate(-1.2deg)}
.pb-pl-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:26px;margin-top:36px}
.pb-pl-quote{margin:0;background:var(--pb-surface);border:3px solid var(--pb-ink);box-shadow:7px 7px 0 var(--pb-ink);padding:22px}
.pb-pl-quote.tilt-r{transform:rotate(.8deg)}
.pb-pl-quote p{font-size:15.5px;line-height:1.5;font-weight:400}
.pb-pl-quote footer{margin-top:14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.03em}
.pb-pl-quotes .pb-review-stars{margin-bottom:10px;color:var(--pb-accent)}
.pb-pl-faq-list{margin-top:32px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0 48px}
.pb-pl-faq{padding:18px 0;border-bottom:2px solid var(--pb-ink)}
.pb-pl-faq strong{display:block;font-weight:700;text-transform:uppercase;font-size:14px;letter-spacing:.02em;margin-bottom:6px}
.pb-pl-faq p{font-size:14px;color:var(--pb-muted);max-width:60ch}
.pb-pl-contact{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:26px;margin-top:32px}
.pb-pl-contact address{font-style:normal}
.pb-pl-contact address p{margin-bottom:10px;font-weight:600}
.pb-plakat a[href^="tel:"],.pb-plakat a[href^="mailto:"]{box-shadow:inset 0 -0.28em 0 var(--pb-accent);transition:box-shadow .12s}
.pb-plakat a[href^="tel:"]:hover,.pb-plakat a[href^="mailto:"]:hover{box-shadow:inset 0 -0.9em 0 var(--pb-accent)}
.pb-pl-hours-block h3{font-weight:700;text-transform:uppercase;font-size:13px;letter-spacing:.05em;margin-bottom:8px}
.pb-pl-hours{width:100%;border-collapse:collapse}
.pb-pl-hours td{padding:7px 0;border-bottom:2px solid var(--pb-line);font-size:13.5px;font-weight:600}
.pb-pl-hours tr:last-child td{border-bottom:none}
.pb-pl-hours td:last-child{text-align:right}
.pb-pl-menu-category{margin-top:30px}
.pb-pl-menu-category h3{font-family:var(--pb-font-display);font-weight:400;text-transform:uppercase;font-size:19px;margin-bottom:10px}
.pb-pl-menu-row{display:flex;gap:18px;align-items:baseline;padding:12px 0;border-bottom:2px solid var(--pb-line)}
.pb-pl-menu-row strong{font-weight:700}
.pb-pl-menu-row p{font-size:13.5px;color:var(--pb-muted)}
.pb-pl-menu-row .pb-pl-price{margin-left:auto;margin-top:0;flex-shrink:0}
.pb-pl-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:26px;margin-top:32px}
.pb-pl-member img{width:100%;aspect-ratio:1/1;object-fit:cover;border:3px solid var(--pb-ink);margin-bottom:12px}
.pb-pl-cta-section{text-align:left}
.pb-pl-page-header{max-width:1160px;margin:0 auto;padding:56px 24px 8px}
.pb-pl-page-header h1{font-family:var(--pb-font-display);font-weight:400;text-transform:uppercase;font-size:clamp(2rem,5vw,3.4rem);line-height:1}
.pb-pl-page-header p{margin-top:14px;max-width:58ch;color:var(--pb-muted)}
.pb-pl-footer{border-top:3px solid var(--pb-ink);padding:30px 24px;font-size:12.5px;font-weight:600}
.pb-pl-footer p{margin-bottom:4px}
.pb-pl-footer a{box-shadow:inset 0 -0.24em 0 var(--pb-accent)}
@media(prefers-reduced-motion:no-preference){
  .pb-pl-hero h1{animation:pb-pl-stamp .5s cubic-bezier(.2,.9,.3,1.2) both}
  .pb-pl-sub,.pb-plakat a.pb-pl-cta{animation:pb-pl-up .45s .14s ease-out both}
  .pb-pl-hero-media{animation:pb-pl-up .5s .22s ease-out both}
  .pb-pl-sticker{animation:pb-pl-spin .55s .4s cubic-bezier(.2,.9,.3,1.3) both}
}
@keyframes pb-pl-stamp{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:none}}
@keyframes pb-pl-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes pb-pl-spin{from{opacity:0;transform:rotate(-14deg) scale(.6)}to{opacity:1;transform:rotate(8deg) scale(1)}}
@media(prefers-reduced-motion:reduce){.pb-plakat *,.pb-plakat *::before,.pb-plakat *::after{animation:none!important;transition:none!important}}
@media(max-width:840px){.pb-pl-nav{padding:12px 16px}.pb-pl-nav-links{display:none}.pb-pl-hero{grid-template-columns:1fr;gap:30px;padding:40px 18px 56px}.pb-pl-hero-media{max-width:420px}.pb-pl-sticker{right:6px}.pb-pl-section{padding:48px 18px}.pb-pl-about{grid-template-columns:1fr;gap:22px}.pb-pl-about .pb-pl-photo{order:-1;max-width:420px}}
@media(max-width:390px){.pb-pl-hero{padding-left:14px;padding-right:14px}.pb-pl-section{padding-left:14px;padding-right:14px}.pb-pl-card,.pb-pl-quote{box-shadow:5px 5px 0 var(--pb-ink)}}
`;

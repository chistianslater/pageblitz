export const KARAT_CSS = `
.pb-karat{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);font-weight:300;line-height:1.6;overflow-x:clip}
.pb-karat a{color:inherit;text-decoration:none}
.pb-ka-nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:24px;padding:18px 36px;background:color-mix(in srgb,var(--pb-canvas) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--pb-line)}
.pb-ka-logo{font-family:var(--pb-font-display);font-size:19px;letter-spacing:.04em}
.pb-ka-nav-links{display:flex;gap:22px;margin-left:auto;font-size:11px;letter-spacing:.16em;text-transform:uppercase}
.pb-ka-nav-links a{padding-bottom:3px;border-bottom:1px solid transparent;transition:border-color .2s,color .2s}
.pb-ka-nav-links a:hover,.pb-ka-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-ka-nav-links a[aria-current="page"]{border-bottom-color:var(--pb-accent)}
.pb-ka-hero{padding:88px 24px 72px;text-align:center}
.pb-ka-kicker{display:inline-flex;align-items:center;gap:16px;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:var(--pb-accent)}
.pb-ka-kicker::before,.pb-ka-kicker::after{content:"";width:52px;height:1px;background:var(--pb-accent);opacity:.65}
.pb-ka-hero h1{margin:26px auto 0;font-family:var(--pb-font-display);font-weight:500;font-size:var(--pb-hero-size);line-height:1.06;letter-spacing:.005em;max-width:18ch}
.pb-ka-hero h1 em,.pb-karat .pb-rich-accent{font-style:italic;color:var(--pb-accent)}
.pb-ka-sub{margin:22px auto 0;max-width:52ch;color:var(--pb-muted);font-size:16px}
.pb-karat a.pb-ka-cta{display:inline-block;margin-top:32px;padding:15px 38px;border:1px solid var(--pb-accent);color:var(--pb-accent);font-size:12px;letter-spacing:.18em;text-transform:uppercase;transition:background .2s,color .2s}
.pb-ka-cta:hover,.pb-ka-cta:focus-visible{background:var(--pb-accent);color:var(--pb-accent-contrast)}
.pb-ka-rating{margin-top:26px;font-size:12px;letter-spacing:.08em;color:var(--pb-muted)}
.pb-ka-hero-media{margin:56px auto 0;max-width:960px;padding:0 12px}
.pb-ka-frame{display:block;border:1px solid var(--pb-accent);padding:10px;background:var(--pb-canvas)}
.pb-ka-frame img{display:block;width:100%;height:auto;border:1px solid var(--pb-line);filter:brightness(.92)}
.pb-ka-hero-media .pb-ka-frame img{aspect-ratio:16/8.5;object-fit:cover}
.pb-ka-section{max-width:960px;margin:0 auto;padding:76px 24px;border-top:1px solid var(--pb-line)}
.pb-ka-title{font-family:var(--pb-font-display);font-weight:500;font-size:clamp(1.7rem,3vw,2.4rem);letter-spacing:.01em;margin-bottom:10px;text-align:center}
.pb-ka-title::after{content:"";display:block;width:52px;height:1px;background:var(--pb-accent);margin:18px auto 0;opacity:.7}
.pb-ka-intro{text-align:center;color:var(--pb-muted);max-width:56ch;margin:0 auto 26px}
.pb-ka-services{margin-top:34px}
.pb-ka-service{display:flex;gap:22px;align-items:baseline;padding:22px 0;border-bottom:1px solid var(--pb-line)}
.pb-ka-service:last-child{border-bottom:none}
.pb-ka-num{font-size:11px;letter-spacing:.2em;color:var(--pb-accent);flex-shrink:0}
.pb-ka-service strong{font-family:var(--pb-font-display);font-weight:600;font-size:19px;letter-spacing:.01em}
.pb-ka-service p{margin-top:4px;color:var(--pb-muted);font-size:14px;max-width:60ch}
.pb-ka-price{margin-left:auto;flex-shrink:0;padding-left:16px;color:var(--pb-accent);font-size:13px;letter-spacing:.06em}
.pb-ka-about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:44px;align-items:center;margin-top:34px}
.pb-ka-about>p:only-child{grid-column:1/-1}
.pb-ka-about p{max-width:62ch;font-size:15.5px}
.pb-ka-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:34px}
.pb-ka-gallery .pb-ka-frame img{aspect-ratio:4/3;object-fit:cover}
.pb-ka-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-top:34px}
.pb-ka-quote{margin:0;padding:28px 24px;background:var(--pb-surface);border:1px solid var(--pb-line);position:relative}
.pb-ka-quote::before{content:"";position:absolute;top:-1px;left:24px;width:44px;height:1px;background:var(--pb-accent)}
.pb-ka-quote p{font-family:var(--pb-font-display);font-size:16.5px;line-height:1.5;font-style:italic}
.pb-ka-quote footer{margin-top:16px;font-size:12px;color:var(--pb-muted)}
.pb-ka-quotes .pb-review-stars{margin-bottom:12px;color:var(--pb-accent)}
.pb-ka-faq-list{margin-top:34px;max-width:720px;margin-left:auto;margin-right:auto}
.pb-ka-faq{padding:20px 0;border-bottom:1px solid var(--pb-line)}
.pb-ka-faq:last-child{border-bottom:none}
.pb-ka-faq strong{display:block;font-family:var(--pb-font-display);font-weight:600;font-size:17px;margin-bottom:6px}
.pb-ka-faq p{color:var(--pb-muted);font-size:14px;max-width:64ch}
.pb-ka-contact{text-align:center}
.pb-ka-contact address{font-style:normal;margin-top:30px}
.pb-ka-contact address p{margin-bottom:10px;font-size:15px}
.pb-karat a[href^="tel:"],.pb-karat a[href^="mailto:"]{border-bottom:1px solid var(--pb-accent);padding-bottom:2px;transition:color .2s}
.pb-karat a[href^="tel:"]:hover,.pb-karat a[href^="mailto:"]:hover{color:var(--pb-accent)}
.pb-ka-hours-block{max-width:340px;margin:30px auto 0}
.pb-ka-hours-block h3{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:12px}
.pb-ka-hours{width:100%;border-collapse:collapse}
.pb-ka-hours td{padding:8px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-ka-hours tr:last-child td{border-bottom:none}
.pb-ka-hours td:first-child{text-align:left;letter-spacing:.08em;text-transform:uppercase;font-size:11px;color:var(--pb-muted)}
.pb-ka-hours td:last-child{text-align:right}
.pb-ka-menu-category{margin-top:30px}
.pb-ka-menu-category h3{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:6px}
.pb-ka-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:26px;margin-top:34px;text-align:center}
.pb-ka-member .pb-ka-frame{margin-bottom:14px}
.pb-ka-member .pb-ka-frame img{aspect-ratio:3/4;object-fit:cover}
.pb-ka-member strong{display:block;font-family:var(--pb-font-display);font-weight:600;font-size:17px}
.pb-ka-member p{color:var(--pb-muted);font-size:13px}
.pb-ka-cta-section{text-align:center}
.pb-ka-page-header{max-width:960px;margin:0 auto;padding:72px 24px 20px;text-align:center}
.pb-ka-page-header h1{font-family:var(--pb-font-display);font-weight:500;font-size:clamp(2rem,4vw,3.2rem)}
.pb-ka-page-header p{margin:16px auto 0;max-width:58ch;color:var(--pb-muted)}
.pb-ka-footer{border-top:1px solid var(--pb-line);padding:38px 24px;text-align:center;font-size:12px;color:var(--pb-muted)}
.pb-ka-footer p{margin-bottom:6px}
.pb-ka-footer a{border-bottom:1px solid var(--pb-line)}
.pb-ka-footer a:hover,.pb-ka-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(prefers-reduced-motion:no-preference){
  .pb-ka-kicker::before,.pb-ka-kicker::after{animation:pb-ka-rule .9s cubic-bezier(.2,.7,.2,1) both}
  .pb-ka-hero h1{animation:pb-ka-rise .7s .1s ease-out both}
  .pb-ka-sub,.pb-karat a.pb-ka-cta,.pb-ka-rating{animation:pb-ka-rise .7s .22s ease-out both}
  .pb-ka-hero-media{animation:pb-ka-rise .8s .34s ease-out both}
}
@keyframes pb-ka-rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes pb-ka-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.pb-karat *,.pb-karat *::before,.pb-karat *::after{animation:none!important;transition:none!important}}
@media(max-width:840px){.pb-ka-nav{padding:16px 20px}.pb-ka-nav-links{display:none}.pb-ka-hero{padding:56px 18px 48px}.pb-ka-section{padding:52px 18px}.pb-ka-about{grid-template-columns:1fr;gap:24px}.pb-ka-about .pb-ka-frame{order:-1}}
@media(max-width:390px){.pb-ka-hero{padding-left:14px;padding-right:14px}.pb-ka-section{padding-left:14px;padding-right:14px}.pb-ka-service{gap:12px}}
`;

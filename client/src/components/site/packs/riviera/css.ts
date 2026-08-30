export const RIVIERA_CSS = `
.pb-riviera{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.62;overflow-x:clip}
.pb-riviera a{color:inherit;text-decoration:none}
.pb-rv-nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:22px;padding:18px 32px;background:color-mix(in srgb,var(--pb-canvas) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--pb-line)}
.pb-rv-logo{font-family:var(--pb-font-display);font-size:19px;letter-spacing:.05em}
.pb-rv-nav-links{display:flex;gap:20px;margin-left:auto;font-size:13.5px;font-weight:500}
.pb-rv-nav-links a{padding-bottom:3px;border-bottom:2px solid transparent;transition:color .15s,border-color .15s}
.pb-rv-nav-links a:hover,.pb-rv-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-rv-nav-links a[aria-current="page"]{border-bottom-color:var(--pb-accent)}
.pb-rv-kicker{display:flex;align-items:center;gap:10px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--pb-accent)}
.pb-rv-kicker svg{width:44px;height:8px;flex-shrink:0}
.pb-rv-hero{position:relative;display:grid;grid-template-columns:minmax(0,6.5fr) minmax(0,5.5fr);gap:52px;align-items:center;max-width:1160px;margin:0 auto;padding:76px 32px 96px}
.pb-rv-hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:26px;background:var(--pb-line);opacity:.45;border-radius:999px 999px 0 0}
.pb-rv-hero h1{margin-top:20px;font-family:var(--pb-font-display);font-weight:400;font-size:var(--pb-hero-size);line-height:1.08;letter-spacing:.01em;max-width:16ch}
.pb-rv-hero h1 em,.pb-riviera .pb-rich-accent{font-style:italic;color:var(--pb-accent)}
.pb-rv-sub{margin-top:20px;max-width:50ch;color:var(--pb-muted);font-size:16.5px}
.pb-rv-hero-actions{display:flex;align-items:center;gap:20px;margin-top:30px;flex-wrap:wrap}
.pb-riviera a.pb-rv-cta{display:inline-block;padding:15px 34px;background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);font-weight:600;font-size:15px;transition:transform .18s,box-shadow .18s}
.pb-rv-cta:hover,.pb-rv-cta:focus-visible{transform:translateY(-2px);box-shadow:0 12px 26px color-mix(in srgb,var(--pb-accent) 30%,transparent)}
.pb-rv-rating{font-size:13px;color:var(--pb-muted)}
.pb-rv-arch{display:block;width:100%;height:auto;border-radius:999px 999px var(--pb-radius-card) var(--pb-radius-card);object-fit:cover}
.pb-rv-hero-photo{aspect-ratio:4/5;border:6px solid var(--pb-surface);box-shadow:0 24px 48px rgba(23,59,76,.16)}
.pb-rv-section{max-width:1160px;margin:0 auto;padding:76px 32px}
.pb-rv-section+.pb-rv-section{border-top:1px solid var(--pb-line)}
.pb-rv-title{margin-top:14px;font-family:var(--pb-font-display);font-weight:400;font-size:clamp(1.7rem,3vw,2.5rem);letter-spacing:.01em}
.pb-rv-intro{margin-top:12px;max-width:56ch;color:var(--pb-muted)}
.pb-rv-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px;margin-top:34px}
.pb-rv-card{background:var(--pb-surface);border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);padding:24px;transition:transform .2s,box-shadow .2s}
.pb-rv-card:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(23,59,76,.1)}
.pb-rv-card strong{display:block;font-family:var(--pb-font-display);font-size:19px;letter-spacing:.01em}
.pb-rv-card p{margin-top:8px;font-size:14px;color:var(--pb-muted)}
.pb-rv-price{display:inline-block;margin-top:12px;font-weight:600;font-size:13.5px;color:var(--pb-accent)}
.pb-rv-about{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:48px;align-items:center;margin-top:34px}
.pb-rv-about>p:only-child{grid-column:1/-1}
.pb-rv-about p{max-width:62ch;font-size:15.5px}
.pb-rv-about .pb-rv-arch{aspect-ratio:4/5;max-width:420px;justify-self:end}
.pb-rv-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-top:34px;align-items:end}
.pb-rv-gallery img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--pb-radius-card)}
.pb-rv-gallery img.pb-rv-arch{border-radius:999px 999px var(--pb-radius-card) var(--pb-radius-card)}
.pb-rv-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px;margin-top:34px}
.pb-rv-quote{margin:0;background:var(--pb-surface);border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);padding:26px}
.pb-rv-quote p{font-family:var(--pb-font-display);font-size:16.5px;line-height:1.55}
.pb-rv-quote footer{margin-top:16px;font-size:12.5px;color:var(--pb-muted)}
.pb-rv-quotes .pb-review-stars{margin-bottom:12px;color:var(--pb-accent)}
.pb-rv-faq-list{margin-top:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:0 48px}
.pb-rv-faq{padding:18px 0;border-bottom:1px solid var(--pb-line)}
.pb-rv-faq strong{display:block;font-weight:600;font-size:15.5px;margin-bottom:6px}
.pb-rv-faq p{font-size:14px;color:var(--pb-muted);max-width:58ch}
.pb-rv-contact{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:44px;margin-top:30px}
.pb-rv-contact address{font-style:normal}
.pb-rv-contact address p{margin-bottom:10px;font-size:15.5px}
.pb-riviera a[href^="tel:"],.pb-riviera a[href^="mailto:"]{color:var(--pb-accent);border-bottom:1px solid color-mix(in srgb,var(--pb-accent) 40%,transparent);transition:border-color .15s}
.pb-riviera a[href^="tel:"]:hover,.pb-riviera a[href^="mailto:"]:hover{border-color:var(--pb-accent)}
.pb-rv-hours-block h3{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:10px;font-weight:600}
.pb-rv-hours{width:100%;max-width:340px;border-collapse:collapse}
.pb-rv-hours td{padding:8px 0;border-bottom:1px solid var(--pb-line);font-size:14px}
.pb-rv-hours tr:last-child td{border-bottom:none}
.pb-rv-hours td:last-child{text-align:right}
.pb-rv-menu-category{margin-top:30px}
.pb-rv-menu-category h3{font-family:var(--pb-font-display);font-size:20px;margin-bottom:10px}
.pb-rv-menu-row{display:flex;gap:18px;align-items:baseline;padding:12px 0;border-bottom:1px solid var(--pb-line)}
.pb-rv-menu-row strong{font-weight:600}
.pb-rv-menu-row p{font-size:13.5px;color:var(--pb-muted)}
.pb-rv-menu-row .pb-rv-price{margin-left:auto;margin-top:0;flex-shrink:0}
.pb-rv-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:26px;margin-top:34px;text-align:center}
.pb-rv-member .pb-rv-arch{aspect-ratio:3/4;margin-bottom:12px}
.pb-rv-member strong{display:block;font-family:var(--pb-font-display);font-size:17px}
.pb-rv-member p{font-size:13px;color:var(--pb-muted)}
.pb-rv-cta-section .pb-rv-cta{margin-top:26px}
.pb-rv-page-header{max-width:1160px;margin:0 auto;padding:68px 32px 16px}
.pb-rv-page-header h1{font-family:var(--pb-font-display);font-weight:400;font-size:clamp(2rem,4vw,3.2rem)}
.pb-rv-page-header p{margin-top:14px;max-width:58ch;color:var(--pb-muted)}
.pb-rv-footer{border-top:1px solid var(--pb-line);padding:36px 32px;text-align:center;font-size:13px;color:var(--pb-muted)}
.pb-rv-footer p{margin-bottom:5px}
.pb-rv-footer a{border-bottom:1px solid var(--pb-line)}
.pb-rv-footer a:hover,.pb-rv-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(prefers-reduced-motion:no-preference){
  .pb-rv-hero-copy>*{animation:pb-rv-drift .6s ease-out both}
  .pb-rv-hero-copy>h1{animation-delay:.08s}
  .pb-rv-hero-copy>.pb-rv-sub{animation-delay:.16s}
  .pb-rv-hero-copy>.pb-rv-hero-actions{animation-delay:.24s}
  .pb-rv-hero-photo{animation:pb-rv-arch-in .75s .18s cubic-bezier(.2,.7,.2,1) both}
}
@keyframes pb-rv-drift{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes pb-rv-arch-in{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.pb-riviera *,.pb-riviera *::before,.pb-riviera *::after{animation:none!important;transition:none!important}}
@media(max-width:880px){.pb-rv-nav{padding:14px 18px}.pb-rv-nav-links{display:none}.pb-rv-hero{grid-template-columns:1fr;gap:34px;padding:48px 18px 72px}.pb-rv-hero-photo{max-width:400px}.pb-rv-section{padding:54px 18px}.pb-rv-about{grid-template-columns:1fr;gap:26px}.pb-rv-about .pb-rv-arch{order:-1;justify-self:start;max-width:340px}}
@media(max-width:390px){.pb-rv-hero{padding-left:14px;padding-right:14px}.pb-rv-section{padding-left:14px;padding-right:14px}}
`;

export const FUNDAMENT_CSS = `
.pb-fundament{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-fundament a{color:inherit;text-decoration:none}
.pb-fd-nav-links a{transition:color .15s}
.pb-fd-nav-links a:hover,.pb-fd-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-fd-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-fundament a[href^="tel:"],.pb-fundament a[href^="mailto:"]{color:var(--pb-ink);border-bottom:2px solid var(--pb-accent);padding-bottom:1px}
.pb-fundament a[href^="tel:"]:hover,.pb-fundament a[href^="mailto:"]:hover{color:var(--pb-accent)}
.pb-fd-nav{position:sticky;top:0;z-index:40;background:var(--pb-canvas);display:flex;align-items:center;gap:20px;padding:20px 32px;border-bottom:1px solid var(--pb-line);font-size:13px;font-weight:500}
.pb-fd-logo{font-family:var(--pb-font-display);font-weight:600;font-size:16px}
.pb-fd-nav-links{display:flex;align-items:center;gap:20px;margin-left:auto}
.pb-fd-hero{position:relative;min-height:620px;overflow:hidden}
.pb-fd-panel{box-sizing:border-box;position:absolute;right:0;top:0;bottom:0;width:42%;background:var(--pb-ink);background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 28px),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,transparent 1px 28px)}
.pb-fd-content{position:absolute;left:0;top:0;z-index:2;padding:76px 40px 64px 32px}
.pb-fd-hero h1{font-family:var(--pb-font-display);font-weight:500;font-size:var(--pb-hero-size);line-height:1.05;max-width:13ch;letter-spacing:-.01em}
.pb-fd-hero h1 em{font-style:italic;color:var(--pb-accent);font-weight:500}
.pb-fd-hero p{margin-top:20px;max-width:260px;color:var(--pb-muted);font-size:15px}
.pb-fundament a.pb-fd-cta{display:inline-block;margin-top:30px;background:var(--pb-ink);color:var(--pb-accent-contrast);padding:14px 28px;font-weight:600;font-size:14px;transition:opacity .15s}
.pb-fd-cta:hover,.pb-fd-cta:focus-visible{opacity:.82}
.pb-fd-photo{position:absolute;left:44%;top:19%;width:26%;height:44%;object-fit:cover;box-shadow:16px 16px 0 var(--pb-ink);z-index:3}
.pb-fd-stats{position:absolute;right:32px;bottom:32px;width:calc(100% - 64px);min-width:0;z-index:2}
.pb-fd-stats div{border-top:1px solid rgba(255,255,255,.25);padding-top:12px;margin-top:12px}
.pb-fd-stats b{display:block;font-family:var(--pb-font-display);font-weight:500;font-size:22px;color:var(--pb-accent-contrast)}
.pb-fd-stats span{display:block;font-size:11px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.04em;margin-top:2px}
.pb-fd-section{padding:72px 32px;border-top:1px solid var(--pb-line)}
.pb-fd-section h2{font-family:var(--pb-font-display);font-weight:600;letter-spacing:-.01em;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:26px}
.pb-fd-intro{color:var(--pb-muted);margin:-14px 0 26px;max-width:56ch}
.pb-fd-services-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:0 48px;align-items:start}
.pb-fd-services-grid h2{margin-bottom:12px}
.pb-fd-services-grid .pb-fd-intro{margin:0}
.pb-fd-service{display:flex;gap:20px;padding:18px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-fd-service .idx{font-family:var(--pb-font-body);font-weight:600;color:var(--pb-accent);font-size:13px;flex-shrink:0}
.pb-fd-service strong{font-weight:600;letter-spacing:-.01em}
.pb-fd-service p{margin-top:4px;font-size:14px;color:var(--pb-muted);max-width:56ch}
.pb-fd-service .price{margin-left:auto;font-size:13px;color:var(--pb-muted);flex-shrink:0;padding-left:12px}
.pb-fd-about-grid{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:48px;align-items:center}
.pb-fd-about-grid>p:only-child{grid-column:1/-1}
.pb-fd-about-grid p{max-width:64ch}
.pb-fd-about-image{width:100%;max-width:520px;justify-self:end;display:block;border:1px solid var(--pb-line)}
.pb-fd-quotes{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.pb-fd-quote{margin:0;padding:24px 24px 22px;background:var(--pb-surface);border-left:3px solid var(--pb-accent)}
.pb-fd-quote p{font-size:16px;line-height:1.5;max-width:42ch}
.pb-fd-quote footer{margin-top:18px;font-size:12px;color:var(--pb-muted)}
.pb-fd-quotes .pb-review-stars{margin-bottom:14px}
.pb-fd-faq-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));column-gap:clamp(40px,6vw,90px)}
.pb-fd-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-fd-faq strong{display:block;font-weight:600;margin-bottom:6px}
.pb-fd-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-fd-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
.pb-fd-contact address{font-style:normal}
.pb-fd-contact p{margin-bottom:8px}
.pb-fd-hours-block{max-width:380px}
.pb-fd-hours-block h3{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:8px;font-weight:600}
.pb-fd-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-fd-hours tr:last-child td{border-bottom:none}
.pb-fd-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-fd-hours td:first-child{text-transform:uppercase;letter-spacing:.04em;color:var(--pb-muted);font-size:12px}
.pb-fd-hours td:last-child{text-align:right}
.pb-fd-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.pb-fd-gallery img{width:100%;height:200px;object-fit:cover;border:1px solid var(--pb-line);display:block}
.pb-fd-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
.pb-fd-member img{width:100%;height:180px;object-fit:cover;border:1px solid var(--pb-line);margin-bottom:10px}
.pb-fd-member strong{display:block;font-weight:600}
.pb-fd-member p{color:var(--pb-muted);font-size:13px}
.pb-fd-menu-category{margin-bottom:32px}
.pb-fd-menu-category h3{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:10px;font-weight:600}
.pb-fd-footer{border-top:1px solid var(--pb-ink);padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-fd-footer a{border-bottom:1px solid var(--pb-line)}
.pb-fd-footer a:hover,.pb-fd-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-fd-contact-sticky{position:sticky;bottom:14px;z-index:30;display:flex;align-items:center;gap:18px;width:max-content;max-width:calc(100% - 32px);margin:0 16px 16px auto;padding:9px 9px 9px 15px;background:var(--pb-canvas);border:1px solid var(--pb-ink);box-shadow:7px 7px 0 var(--pb-accent);font-size:11px}
.pb-fd-contact-sticky span{display:flex;flex-direction:column;color:var(--pb-muted);line-height:1.25}
.pb-fd-contact-sticky b{color:var(--pb-ink);font-family:var(--pb-font-display);font-size:15px}
.pb-fundament .pb-fd-contact-sticky a{padding:10px 13px;background:var(--pb-ink);color:var(--pb-accent-contrast);font-weight:600}
@media(prefers-reduced-motion:no-preference){
  .pb-fd-panel{animation:pb-fd-plan .8s cubic-bezier(.2,.7,.2,1) both}
  .pb-fd-photo{animation:pb-fd-photo .55s .22s ease-out both}
  .pb-fd-stats div{animation:pb-fd-stat .35s ease-out both}
  .pb-fd-stats div:nth-child(2){animation-delay:.12s}.pb-fd-stats div:nth-child(3){animation-delay:.24s}
}
@keyframes pb-fd-plan{from{clip-path:inset(0 0 0 100%);opacity:.5}to{clip-path:inset(0);opacity:1}}
@keyframes pb-fd-photo{from{transform:translate(18px,18px);opacity:0}to{transform:none;opacity:1}}
@keyframes pb-fd-stat{from{clip-path:inset(0 100% 0 0);opacity:0}to{clip-path:inset(0);opacity:1}}
@media(pointer:fine){.pb-fundament .pb-fd-contact-sticky a:hover{transform:translate(-2px,-2px)}}
@media(prefers-reduced-motion:reduce){.pb-fundament *,.pb-fundament *::before,.pb-fundament *::after{animation:none!important;transition:none!important}}
@media(max-width:840px){.pb-fd-nav-links{display:none}.pb-fd-hero{display:flex;flex-direction:column;min-height:0}.pb-fd-content{position:static;order:1;padding:28px 20px 16px}.pb-fd-photo{position:relative;left:auto;top:auto;order:2;width:min(58%,250px);max-width:100%;height:auto;margin:8px 20px -48px;box-shadow:10px 10px 0 var(--pb-ink);z-index:2}.pb-fd-panel{order:3;position:relative;right:auto;top:auto;bottom:auto;width:100%;height:auto;padding:48px 20px 16px}.pb-fd-stats{position:static;width:100%;display:flex;flex-direction:column;gap:0}.pb-fd-stats div{min-width:0;border-top:1px solid rgba(255,255,255,.25);padding-top:12px;margin-top:12px}.pb-fd-stats div:first-child{border-top:none;padding-top:0;margin-top:0}.pb-fd-stats b{font-size:19px}.pb-fd-contact{grid-template-columns:1fr}.pb-fd-section{padding:48px 20px}.pb-fd-services-grid{grid-template-columns:1fr;gap:0}.pb-fd-about-grid{grid-template-columns:1fr;gap:20px}.pb-fd-about-image{order:-1;justify-self:start;max-height:55vw;object-fit:contain;object-position:left}}
@media(max-width:720px){.pb-fd-quotes{grid-template-columns:1fr}}
@media(max-width:390px){.pb-fd-content,.pb-fd-section{padding-left:16px;padding-right:16px}.pb-fd-photo{margin-left:16px}.pb-fd-panel{padding-left:16px;padding-right:16px}.pb-fd-contact-sticky{max-width:calc(100% - 24px);margin-right:12px;gap:10px}}
.pb-fd-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-fd-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-fd-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

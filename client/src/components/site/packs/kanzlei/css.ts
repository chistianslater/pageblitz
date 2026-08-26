export const KANZLEI_CSS = `
.pb-kanzlei{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-kanzlei a{color:inherit;text-decoration:none}
.pb-kz-grid{background-image:linear-gradient(90deg,var(--pb-line) 1px,transparent 1px);background-size:25% 100%;background-position:14px 0}
.pb-kz-nav{position:sticky;top:0;z-index:40;background:var(--pb-canvas);display:flex;align-items:center;gap:20px;padding:20px 32px;border-bottom:1px solid var(--pb-ink);font-size:13px;font-weight:500}
.pb-kz-logo{font-weight:700;font-family:var(--pb-font-display)}
.pb-kz-nav-links{display:flex;align-items:center;gap:20px;margin-left:auto}
.pb-kz-nav-links a{transition:color .15s}
.pb-kz-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-kz-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-kz-idx{position:absolute;right:32px;top:86px;font-family:var(--pb-font-utility);font-size:11px;color:var(--pb-accent);text-align:right;line-height:1.9}
.pb-kz-watermark{position:absolute;right:20px;bottom:-40px;font-family:var(--pb-font-display);font-size:200px;color:var(--pb-accent);opacity:.07;line-height:1;pointer-events:none}
.pb-kz-eyebrow{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.1em;color:var(--pb-accent);margin-bottom:14px;text-transform:uppercase}
.pb-kz-hero{position:relative;padding:64px 32px 48px;overflow:hidden}
.pb-kz-hero h1{font-family:var(--pb-font-display);font-weight:600;font-size:var(--pb-hero-size);letter-spacing:-.035em;line-height:1.0;max-width:14ch}
.pb-kz-hero h1 span{color:var(--pb-muted)}
.pb-kz-hero p{margin-top:22px;max-width:44ch;color:var(--pb-muted);font-size:15px}
.pb-kz-facts{display:grid;grid-template-columns:repeat(4,25%);margin:44px 0 0;border-top:1px solid var(--pb-line)}
.pb-kz-facts div{padding:14px 14px 0 28px;font-size:12px;color:var(--pb-muted)}
.pb-kz-facts b{display:block;font-size:19px;color:var(--pb-ink);font-weight:600;letter-spacing:-.02em}
.pb-kanzlei a.pb-kz-link{color:var(--pb-accent);font-weight:600;text-decoration:none;border-bottom:2px solid var(--pb-accent);padding-bottom:1px;transition:opacity .15s}
.pb-kz-link:focus-visible{opacity:.7}
.pb-kanzlei a[href^="tel:"],.pb-kanzlei a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-kanzlei a[href^="tel:"]:focus-visible,.pb-kanzlei a[href^="mailto:"]:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-kz-section{padding:72px 32px;border-top:1px solid var(--pb-line);position:relative}
.pb-kz-section h2{font-family:var(--pb-font-display);font-weight:600;letter-spacing:-.02em;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:26px}
.pb-kz-services-grid{display:grid;grid-template-columns:1fr 1fr;align-items:start}
.pb-kz-services-grid h2{margin-bottom:0}
.pb-kz-services-list{padding-left:42px}
.pb-kz-service{display:flex;gap:20px;padding:18px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-kz-service .idx{font-family:var(--pb-font-utility);color:var(--pb-accent);font-size:13px;flex-shrink:0}
.pb-kz-service strong{font-weight:600;letter-spacing:-.01em}
.pb-kz-service p{margin-top:4px;font-size:14px;max-width:56ch}
.pb-kz-service .price{margin-left:auto;font-family:var(--pb-font-utility);font-size:13px;color:var(--pb-muted);flex-shrink:0;padding-left:12px}
.pb-kz-quote{padding:20px 0 20px 22px;border-left:2px solid var(--pb-line);margin-bottom:22px}
.pb-kz-quote p{font-size:16px;max-width:52ch}
.pb-kz-quote footer{margin-top:10px;font-family:var(--pb-font-utility);font-size:12px;color:var(--pb-muted)}
.pb-kz-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-kz-faq strong{display:block;font-weight:600;margin-bottom:6px}
.pb-kz-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-kz-about-grid{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:48px;align-items:start}
.pb-kz-about-grid>p:only-child{grid-column:1/-1}
.pb-kz-about-grid p{max-width:64ch}
.pb-kz-about-img{width:100%;aspect-ratio:3/2;object-fit:cover;border:1px solid var(--pb-line);filter:saturate(.7);display:block}
.pb-kz-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
.pb-kz-contact address{font-style:normal}
.pb-kz-contact p{margin-bottom:8px}
.pb-kz-hours-block{max-width:380px}
.pb-kz-hours-block h3{font-family:var(--pb-font-utility);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:8px}
.pb-kz-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-kz-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-kz-hours tr:last-child td{border-bottom:none}
.pb-kz-hours td:first-child{font-family:var(--pb-font-utility);text-transform:uppercase;letter-spacing:.04em;color:var(--pb-muted)}
.pb-kz-hours td:last-child{text-align:right}
.pb-kz-gallery{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}
.pb-kz-gallery img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;filter:saturate(.7);border:1px solid var(--pb-line);display:block}
.pb-kz-gallery img:nth-child(3n+1){grid-column:span 7}
.pb-kz-gallery img:nth-child(3n+2){grid-column:span 5;margin-top:48px}
.pb-kz-gallery img:nth-child(3n+3){grid-column:4/span 6}
.pb-kz-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
.pb-kz-member img{width:100%;height:180px;object-fit:cover;filter:saturate(.7);border:1px solid var(--pb-line);margin-bottom:10px}
.pb-kz-member strong{display:block;font-weight:600}
.pb-kz-member p{color:var(--pb-muted);font-size:13px}
.pb-kz-menu-category{margin-bottom:32px}
.pb-kz-menu-category h3{font-family:var(--pb-font-utility);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:10px}
.pb-kz-footer{border-top:1px solid var(--pb-ink);padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-kz-footer a{border-bottom:1px solid var(--pb-line)}
.pb-kz-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-kz-section-index{position:sticky;top:67px;z-index:32;display:flex;align-items:center;gap:24px;padding:9px 32px;background:color-mix(in srgb,var(--pb-canvas) 94%,transparent);border-bottom:1px solid var(--pb-line);font-family:var(--pb-font-utility);font-size:10px;letter-spacing:.06em;text-transform:uppercase}
.pb-kz-section-index>span{color:var(--pb-accent);font-weight:700}
.pb-kz-section-index>div{display:flex;gap:18px;overflow-x:auto;scrollbar-width:none}
.pb-kz-section-index a{white-space:nowrap;color:var(--pb-muted)}
.pb-kz-section-index a:focus-visible,.pb-kz-section-index a[aria-current="page"]{color:var(--pb-ink)}
.pb-kz-section,.pb-kz-hero{scroll-margin-top:112px}
.pb-kz-hero::before{content:"";position:absolute;inset:18px 0 auto;height:42%;pointer-events:none;opacity:.28;background:linear-gradient(90deg,transparent 24.9%,var(--pb-accent) 25%,transparent 25.1%,transparent 49.9%,var(--pb-accent) 50%,transparent 50.1%,transparent 74.9%,var(--pb-accent) 75%,transparent 75.1%)}
@media(hover:hover) and (pointer:fine){.pb-kz-nav-links a:hover{color:var(--pb-accent)}.pb-kz-link:hover{opacity:.7}.pb-kanzlei a[href^="tel:"]:hover,.pb-kanzlei a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}.pb-kz-footer a:hover{color:var(--pb-accent);border-color:var(--pb-accent)}.pb-kz-section-index a:hover{color:var(--pb-ink)}}
@media(prefers-reduced-motion:no-preference){.pb-kz-hero::before{animation:pb-kz-grid-build 1.4s cubic-bezier(.2,.75,.25,1) both}.pb-kz-hero h1,.pb-kz-eyebrow{animation:pb-kz-copy-in .65s .35s ease-out both}}
@keyframes pb-kz-grid-build{from{clip-path:inset(0 100% 0 0);opacity:0}to{clip-path:inset(0);opacity:.28}}
@keyframes pb-kz-copy-in{from{transform:translateY(10px);opacity:0}to{transform:none;opacity:1}}
@media(max-width:840px){.pb-kz-nav-links{display:none}.pb-kanzlei .pb-mnav{display:block;position:relative;margin-left:auto;flex-shrink:0}.pb-kanzlei .pb-mnav-toggle{box-sizing:border-box;list-style:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid var(--pb-line);border-radius:var(--pb-radius-button);background:var(--pb-canvas);color:var(--pb-ink)}.pb-kanzlei .pb-mnav-toggle::-webkit-details-marker{display:none}.pb-kanzlei .pb-mnav-icon{display:flex;flex-direction:column;gap:5px;width:20px}.pb-kanzlei .pb-mnav-icon span{display:block;height:2px;background:currentColor}.pb-kanzlei .pb-mnav[open] .pb-mnav-icon span:nth-child(1){transform:translateY(7px) rotate(45deg)}.pb-kanzlei .pb-mnav[open] .pb-mnav-icon span:nth-child(2){opacity:0}.pb-kanzlei .pb-mnav[open] .pb-mnav-icon span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}.pb-kanzlei .pb-mnav-panel{position:absolute;top:calc(100% + 8px);right:0;z-index:80;display:flex;flex-direction:column;min-width:min(264px,84vw);padding:6px;background:var(--pb-canvas);border:1px solid var(--pb-line)}.pb-kanzlei .pb-mnav-panel a{display:flex;align-items:center;min-height:44px;padding:8px 14px;font-size:17px}.pb-kz-section-index{top:85px;padding-inline:20px}.pb-kz-section,.pb-kz-hero{scroll-margin-top:136px}.pb-kz-idx{display:block;right:18px;top:18px;font-size:9px}.pb-kz-hero{padding:78px 20px 42px}.pb-kz-facts{grid-template-columns:1fr 1fr}.pb-kz-facts div{padding:14px 10px 0;border-right:1px solid var(--pb-line)}.pb-kz-services-grid{grid-template-columns:1fr}.pb-kz-services-grid h2{margin-bottom:14px}.pb-kz-services-list{padding-left:0}.pb-kz-contact{grid-template-columns:1fr}.pb-kz-about-grid{grid-template-columns:1fr;gap:20px}.pb-kz-about-img{order:-1;max-height:55vw}.pb-kz-gallery{grid-template-columns:1fr 1fr;gap:8px}.pb-kz-gallery img:nth-child(n){grid-column:auto;margin-top:0}.pb-kz-gallery img:first-child{grid-column:1/-1}}
@media(prefers-reduced-motion:reduce){.pb-kanzlei *,.pb-kanzlei *::before,.pb-kanzlei *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
.pb-kz-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-kz-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-kz-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

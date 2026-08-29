export const MARKTPLATZ_CSS = `
.pb-marktplatz{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-marktplatz a{color:inherit;text-decoration:none}
.pb-mp-nav{display:flex;align-items:center;gap:20px;padding:22px 32px;position:sticky;top:0;z-index:40;background:var(--pb-canvas);border-bottom:1px solid var(--pb-line);font-size:14px;font-weight:700}
.pb-mp-logo{font-family:var(--pb-font-display);font-weight:800;font-size:19px;color:var(--pb-accent-text)}
.pb-mp-nav-links{display:flex;align-items:center;gap:20px;margin-left:auto;flex-wrap:wrap}
.pb-mp-nav-links a{transition:color .15s}
.pb-mp-nav-links a:focus-visible{color:var(--pb-accent-text)}
.pb-mp-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-mp-hero{position:relative;overflow:hidden;padding:20px 32px 96px;background-image:radial-gradient(color-mix(in srgb, var(--pb-accent-2) 55%, transparent) 2px,transparent 2.5px),radial-gradient(color-mix(in srgb, var(--pb-accent) 42%, transparent) 2px,transparent 2.5px);background-size:90px 90px,120px 120px;background-position:0 0,45px 60px}
.pb-mp-hero-inner{position:relative;max-width:1180px;margin:0 auto;display:flex;align-items:flex-start;justify-content:space-between;gap:28px}
.pb-mp-card{position:relative;z-index:2;background:var(--pb-surface);border-radius:var(--pb-radius-card);padding:34px 36px 38px;margin-top:26px;flex:0 1 620px;transform:rotate(-1.2deg);box-shadow:0 6px 0 var(--pb-line)}
.pb-mp-eyebrow{font-family:var(--pb-font-display);font-weight:800;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--pb-accent-text)}
.pb-mp-hero h1{font-family:var(--pb-font-display);font-weight:800;font-size:var(--pb-hero-size);line-height:1.05;margin-top:10px;max-width:15ch;overflow-wrap:break-word}
.pb-mp-accent-word{position:relative;display:inline-block;color:var(--pb-accent-text)}
.pb-mp-squiggle{position:absolute;left:0;right:0;bottom:-10px;width:100%;height:10px;overflow:visible}
.pb-mp-sub{margin-top:14px;color:var(--pb-muted);font-size:15px;max-width:44ch}
.pb-marktplatz a.pb-mp-cta{display:inline-block;margin-top:24px;background:var(--pb-accent);color:var(--pb-ink);padding:13px 28px;border-radius:var(--pb-radius-button);font-family:var(--pb-font-display);font-weight:800;font-size:14.5px;box-shadow:0 4px 0 color-mix(in srgb, var(--pb-accent) 80%, black);transition:transform .15s}
.pb-mp-cta:focus-visible{transform:translateY(2px);box-shadow:0 2px 0 color-mix(in srgb, var(--pb-accent) 80%, black)}
.pb-mp-photo-wrap{position:relative;flex:0 1 280px;min-width:150px;margin-top:14px}
.pb-mp-photo{position:relative;z-index:1;display:block;width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--pb-radius-card);transform:rotate(3deg);box-shadow:0 6px 0 var(--pb-line)}
.pb-mp-sticker{position:absolute;font-family:var(--pb-font-display);z-index:3;text-align:center;white-space:nowrap}
.pb-mp-sticker.pill{--mp-rotate:9deg;right:4%;top:2%;background:var(--pb-accent-2);color:var(--pb-ink);border-radius:999px;padding:16px 18px;font-weight:800;font-size:12.5px;line-height:1.15;transform:rotate(var(--mp-rotate));box-shadow:0 3px 0 #E0A81C;max-width:60%;white-space:normal}
.pb-mp-sticker.ink{--mp-rotate:-6deg;right:52%;bottom:32%;background:var(--pb-ink);color:var(--pb-surface);border-radius:var(--pb-radius-button);padding:10px 14px;font-weight:700;font-size:12px;transform:rotate(var(--mp-rotate))}
.pb-mp-sticker.outline{--mp-rotate:4deg;right:2%;bottom:2%;background:var(--pb-surface);border:2px dashed var(--pb-accent);border-radius:var(--pb-radius-button);padding:9px 13px;font-weight:700;font-size:11.5px;color:var(--pb-accent-text);transform:rotate(var(--mp-rotate))}
.pb-mp-scallop{position:absolute;left:0;right:0;bottom:-1px;height:22px;z-index:2;background:radial-gradient(circle at 12px -6px,transparent 16px,var(--pb-canvas) 17px);background-size:44px 32px}
@media(min-width:641px) and (max-width:860px){.pb-mp-hero-inner{gap:16px}.pb-mp-card{flex-basis:58%;padding:26px 24px 28px}.pb-mp-photo-wrap{flex-basis:30%;margin-top:10px}.pb-mp-sticker.pill{font-size:10px;padding:13px 14px;box-shadow:0 2px 0 #E0A81C}.pb-mp-sticker.ink{font-size:9.5px;padding:8px 11px}.pb-mp-sticker.outline{font-size:9px;padding:7px 10px}}
.pb-mp-section{padding:64px 32px;max-width:1180px;margin:0 auto}
.pb-mp-section h2{font-family:var(--pb-font-display);font-weight:800;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:24px}
.pb-mp-intro{color:var(--pb-muted);margin-bottom:24px;max-width:56ch}
.pb-mp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
.pb-mp-card-item{background:var(--pb-surface);border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);padding:22px}
.pb-mp-card-item strong{display:block;font-family:var(--pb-font-display);font-weight:800;font-size:16px;margin-bottom:6px}
.pb-mp-card-item p{color:var(--pb-muted);font-size:14px}
.pb-mp-price{display:inline-block;margin-top:10px;font-family:var(--pb-font-display);font-weight:800;color:var(--pb-accent-text);font-size:14px}
.pb-mp-about{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center}
.pb-mp-about img{width:100%;border-radius:var(--pb-radius-card);display:block;box-shadow:0 6px 0 var(--pb-line)}
.pb-mp-about p{max-width:60ch}
@media(max-width:840px){.pb-mp-about{grid-template-columns:1fr}}
.pb-mp-quote{font-style:normal;box-shadow:0 6px 0 var(--pb-line)}
.pb-mp-quote p{font-size:15.5px;line-height:1.5;color:var(--pb-ink)}
.pb-mp-quote footer{margin-top:16px;font-weight:700;font-family:var(--pb-font-display);font-size:13px;color:var(--pb-accent-text)}
.pb-mp-quote .pb-review-stars{margin-bottom:12px}
.pb-mp-quote .pb-review-avatar{border-radius:var(--pb-radius-button);background:var(--pb-accent);color:var(--pb-ink);border-color:transparent}
.pb-mp-faq strong{color:var(--pb-accent-text)}
.pb-mp-gallery img{width:100%;height:210px;object-fit:cover;border-radius:var(--pb-radius-card);display:block;box-shadow:0 6px 0 var(--pb-line)}
.pb-mp-gallery img:only-child{max-width:720px;height:auto;aspect-ratio:3/2;margin:0 auto}
.pb-mp-team img{width:100%;height:180px;object-fit:cover;border-radius:var(--pb-radius-card);margin-bottom:10px}
.pb-mp-contact{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start}
.pb-mp-contact address{font-style:normal}
.pb-mp-contact p{margin-bottom:8px}
.pb-mp-hours-block{max-width:380px}
.pb-mp-hours-block h3{font-family:var(--pb-font-display);font-weight:800;font-size:14px;color:var(--pb-accent-text);margin-bottom:8px}
.pb-mp-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-mp-hours td{padding:7px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-mp-hours tr:last-child td{border-bottom:none}
.pb-mp-hours td:first-child{font-weight:700}
.pb-mp-hours td:last-child{text-align:right}
@media(max-width:840px){.pb-mp-contact{grid-template-columns:1fr}}
.pb-marktplatz a[href^="tel:"],.pb-marktplatz a[href^="mailto:"]{color:var(--pb-ink);border-bottom:2px solid var(--pb-accent-2);padding-bottom:1px;transition:color .15s}
.pb-marktplatz a[href^="tel:"]:focus-visible,.pb-marktplatz a[href^="mailto:"]:focus-visible{color:var(--pb-accent-text)}
.pb-marktplatz a.pb-mp-link{display:inline-block;color:var(--pb-accent-text);font-weight:800;font-family:var(--pb-font-display)}
.pb-mp-footer{border-top:1px solid var(--pb-line);padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-mp-footer a{border-bottom:1px solid var(--pb-line)}
.pb-mp-footer a:focus-visible{color:var(--pb-accent-text);border-color:var(--pb-accent)}
.pb-mp-trial-cta{position:sticky;top:84px;z-index:32;margin:-52px 32px 14px auto;width:fit-content;display:flex;align-items:center;gap:12px;padding:8px 9px 8px 15px;background:var(--pb-surface);border:2px solid var(--pb-ink);border-radius:999px;box-shadow:0 4px 0 var(--pb-line);font-family:var(--pb-font-display);font-weight:800;font-size:12px}
.pb-mp-trial-cta a{padding:8px 14px;border-radius:999px;background:var(--pb-accent);white-space:nowrap}
.pb-mp-section,.pb-mp-hero{scroll-margin-top:138px}
@media(hover:hover) and (pointer:fine){.pb-mp-nav-links a:hover{color:var(--pb-accent-text)}.pb-mp-cta:hover{transform:translateY(2px);box-shadow:0 2px 0 color-mix(in srgb,var(--pb-accent) 80%,black)}.pb-marktplatz a[href^="tel:"]:hover,.pb-marktplatz a[href^="mailto:"]:hover{color:var(--pb-accent-text)}.pb-mp-footer a:hover{color:var(--pb-accent-text);border-color:var(--pb-accent)}.pb-mp-trial-cta a:hover{transform:translateY(1px)}}
@media(prefers-reduced-motion:no-preference){.pb-mp-sticker{animation:pb-mp-guide-in .65s cubic-bezier(.2,.8,.3,1) both}.pb-mp-sticker.pill{animation-delay:.25s}.pb-mp-sticker.ink{animation-delay:.48s}.pb-mp-sticker.outline{animation-delay:.71s}.pb-mp-squiggle{animation:pb-mp-draw-in .75s .35s ease-out both}}
@keyframes pb-mp-guide-in{from{transform:translateY(14px) rotate(var(--mp-rotate));opacity:0}to{transform:translateY(0) rotate(var(--mp-rotate));opacity:1}}
@keyframes pb-mp-draw-in{from{clip-path:inset(0 100% 0 0);opacity:0}to{clip-path:inset(0);opacity:1}}
@media(max-width:840px){.pb-mp-nav-links{display:none}.pb-marktplatz .pb-mnav{display:block;position:relative;margin-left:auto;flex-shrink:0}.pb-marktplatz .pb-mnav-toggle{box-sizing:border-box;list-style:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid var(--pb-line);border-radius:var(--pb-radius-button);background:var(--pb-canvas);color:var(--pb-ink)}.pb-marktplatz .pb-mnav-toggle::-webkit-details-marker{display:none}.pb-marktplatz .pb-mnav-icon{display:flex;flex-direction:column;gap:5px;width:20px}.pb-marktplatz .pb-mnav-icon span{display:block;height:2px;background:currentColor}.pb-marktplatz .pb-mnav[open] .pb-mnav-icon span:nth-child(1){transform:translateY(7px) rotate(45deg)}.pb-marktplatz .pb-mnav[open] .pb-mnav-icon span:nth-child(2){opacity:0}.pb-marktplatz .pb-mnav[open] .pb-mnav-icon span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}.pb-marktplatz .pb-mnav-panel{position:absolute;top:calc(100% + 8px);right:0;z-index:80;display:flex;flex-direction:column;min-width:min(264px,84vw);padding:6px;background:var(--pb-canvas);border:1px solid var(--pb-line)}.pb-marktplatz .pb-mnav-panel a{display:flex;align-items:center;min-height:44px;padding:8px 14px;font-size:17px}.pb-mp-hero{padding:16px 20px 72px}.pb-mp-hero-inner{display:block}.pb-mp-card{max-width:100%;flex-basis:auto;padding:26px 24px 28px}.pb-mp-photo-wrap{display:block;width:min(72%,280px);min-width:0;margin:28px auto 16px}.pb-mp-photo{aspect-ratio:4/3}.pb-mp-sticker{display:block;max-width:58%;font-size:10px}.pb-mp-sticker.pill{padding:11px 12px}.pb-mp-sticker.ink{right:70%;bottom:28%;padding:7px 9px}.pb-mp-sticker.outline{padding:7px 9px}.pb-mp-nav{padding:18px 20px}.pb-mp-trial-cta{top:84px;margin:-56px 20px 14px auto;max-width:calc(100% - 40px)}.pb-mp-section,.pb-mp-hero{scroll-margin-top:142px}}
@media(prefers-reduced-motion:reduce){.pb-marktplatz *,.pb-marktplatz *::before,.pb-marktplatz *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
.pb-mp-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-mp-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-mp-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

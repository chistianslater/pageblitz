export const SALON_NOIR_CSS = `
.pb-salon-noir{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);font-weight:300;line-height:1.6;overflow-x:clip;position:relative}
.pb-salon-noir a{color:inherit;text-decoration:none}
.pb-sn-frame{position:absolute;inset:12px;border:1px solid color-mix(in srgb, var(--pb-accent) 45%, transparent);pointer-events:none;z-index:50}
.pb-sn-nav{position:sticky;top:0;z-index:40;background:var(--pb-canvas);display:flex;align-items:center;justify-content:center;gap:28px;padding:26px 40px;border-bottom:1px solid var(--pb-line);flex-wrap:wrap}
.pb-sn-nav-links{display:flex;align-items:center;gap:20px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;flex-wrap:wrap;color:var(--pb-muted)}
.pb-sn-nav-links a{transition:color .15s}
.pb-sn-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-sn-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-sn-logo{font-family:var(--pb-font-display);font-style:italic;font-weight:500;letter-spacing:.3em;text-transform:uppercase;font-size:15px;padding:0 8px;white-space:nowrap}
.pb-sn-hero{position:relative;padding:64px 40px 72px}
.pb-sn-hero-inner{position:relative;display:grid;grid-template-columns:1.15fr .85fr;align-items:center;gap:32px}
.pb-sn-copy{position:relative;z-index:2;min-width:0}
.pb-sn-eyebrow{letter-spacing:.3em;text-transform:uppercase;font-size:10px;color:var(--pb-accent);margin:0 0 16px}
.pb-sn-hero h1{font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:var(--pb-hero-size);line-height:1.08;letter-spacing:-.01em;max-width:14ch;margin:0}
/* Signatur "headline-image-overlap" (Verfassung): kontrollierte Überlappung der
   kursiven Headline ins Bild-Panel — begrenzt (64px) und nur auf breiten
   Viewports, damit die Welle-1-Ausrichtung (linksbündig auf Eyebrow-Kante)
   erhalten bleibt; z-index über dem Panel, unter Nav/Inseln. */
@media(min-width:1160px){.pb-sn-hero h1{position:relative;z-index:2;margin-right:-64px;max-width:16ch}}
.pb-sn-sub{margin-top:18px;color:var(--pb-muted);font-size:15px;max-width:44ch}
.pb-salon-noir a.pb-sn-cta{display:inline-block;margin-top:28px;border:1px solid var(--pb-accent);color:var(--pb-accent);background:transparent;padding:13px 30px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;transition:background .15s,color .15s}
.pb-sn-cta:focus-visible{background:var(--pb-accent);color:var(--pb-accent-contrast)}
.pb-sn-photo{position:relative;z-index:1;aspect-ratio:3/4;background-color:var(--pb-surface);background-size:cover;background-position:center;border:1px solid color-mix(in srgb, var(--pb-accent) 45%, transparent)}
.pb-sn-vert{position:absolute;right:14px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:var(--pb-muted);white-space:nowrap;pointer-events:none;margin:0}
.pb-sn-section{padding:64px 40px;border-top:1px solid var(--pb-line)}
.pb-sn-section h2{font-family:var(--pb-font-display);font-style:italic;font-weight:500;letter-spacing:-.01em;font-size:clamp(1.5rem,2.4vw,2rem);margin-bottom:28px}
.pb-sn-intro{color:var(--pb-muted);margin:0 0 28px;max-width:52ch}
.pb-sn-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
.pb-sn-card{background:var(--pb-surface);padding:26px;border:1px solid var(--pb-line);min-width:0}
.pb-sn-card strong{display:block;font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:17px;margin-bottom:8px}
.pb-sn-card p{color:var(--pb-muted);font-size:14px}
.pb-sn-price{color:var(--pb-accent);font-weight:500;font-size:13px;letter-spacing:.04em;display:inline-block;margin-top:10px;white-space:nowrap}
.pb-sn-about{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.pb-sn-about img{width:100%;aspect-ratio:4/3;object-fit:cover;border:1px solid color-mix(in srgb, var(--pb-accent) 40%, transparent);display:block}
.pb-sn-about p{color:var(--pb-ink);max-width:60ch;min-width:0}
.pb-sn-quote{max-width:56ch;margin:0 0 26px;padding:0 0 0 18px;border-left:2px solid var(--pb-accent)}
.pb-sn-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:16px}
.pb-sn-quote footer{margin-top:10px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--pb-muted)}
.pb-sn-price-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 64px;align-items:start}
.pb-sn-price-grid .pb-sn-price-category{max-width:none;margin:0 0 24px}
.pb-sn-price-grid .pb-sn-price-category:last-child:nth-child(odd){grid-column:1/-1;max-width:560px}
.pb-sn-price-category{max-width:560px;margin:0 0 36px}
.pb-sn-price-category h3{font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:16px;letter-spacing:.04em;color:var(--pb-accent);margin-bottom:14px;text-transform:uppercase}
.pb-sn-price-row{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:11px 0;border-bottom:1px dashed var(--pb-line)}
.pb-sn-price-row span:first-child{min-width:0}
.pb-sn-price-row .pb-sn-price{margin-top:0}
.pb-sn-faq{max-width:56ch;margin:0 0 20px;border-bottom:1px solid var(--pb-line);padding-bottom:18px}
.pb-sn-faq strong{display:block;font-family:var(--pb-font-display);font-style:italic;font-weight:500;margin-bottom:6px}
.pb-sn-faq p{color:var(--pb-muted);font-size:14px}
.pb-sn-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.pb-sn-gallery img{width:100%;height:220px;object-fit:cover;border:1px solid var(--pb-line);display:block}
.pb-sn-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
.pb-sn-member img{width:100%;height:200px;object-fit:cover;border:1px solid var(--pb-line);margin-bottom:12px}
.pb-sn-member strong{display:block;font-family:var(--pb-font-display);font-style:italic;font-weight:500}
.pb-sn-member p{color:var(--pb-muted);font-size:13px}
.pb-sn-contact{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start}
.pb-sn-contact address{font-style:normal}
.pb-sn-contact p{margin-bottom:8px}
.pb-sn-hours-block{max-width:380px}
.pb-sn-hours-block h3{font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:8px}
.pb-sn-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-sn-hours td{padding:7px 0;border-bottom:1px dotted var(--pb-line);font-size:13px}
.pb-sn-hours tr:last-child td{border-bottom:none}
.pb-sn-hours td:first-child{text-transform:uppercase;letter-spacing:.06em;color:var(--pb-muted);font-size:11px}
.pb-sn-hours td:last-child{text-align:right}
.pb-sn-cta-card p{max-width:46ch;margin:0 0 22px;color:var(--pb-muted)}
.pb-salon-noir a[href^="tel:"],.pb-salon-noir a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-salon-noir a[href^="tel:"]:focus-visible,.pb-salon-noir a[href^="mailto:"]:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-sn-footer{padding:32px 40px;font-size:12px;color:var(--pb-muted);border-top:1px solid var(--pb-line);text-align:center}
.pb-sn-footer a{border-bottom:1px solid var(--pb-line)}
.pb-sn-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-sn-booking{position:sticky;top:80px;z-index:32;margin:12px 32px 0 auto;width:fit-content;display:flex;align-items:center;gap:16px;padding:8px 9px 8px 16px;border:1px solid color-mix(in srgb,var(--pb-accent) 55%,transparent);background:var(--pb-canvas);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--pb-muted)}
.pb-sn-booking a{padding:8px 14px;background:var(--pb-accent);color:var(--pb-accent-contrast)}
.pb-sn-section,.pb-sn-hero{scroll-margin-top:138px}
@media(hover:hover) and (pointer:fine){.pb-sn-nav-links a:hover{color:var(--pb-accent)}.pb-sn-cta:hover{background:var(--pb-accent);color:var(--pb-accent-contrast)}.pb-salon-noir a[href^="tel:"]:hover,.pb-salon-noir a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}.pb-sn-footer a:hover{color:var(--pb-accent);border-color:var(--pb-accent)}.pb-sn-booking a:hover{opacity:.82}}
@media(prefers-reduced-motion:no-preference){.pb-sn-frame{animation:pb-sn-gold-sweep 2.8s cubic-bezier(.35,0,.15,1) both}.pb-sn-photo{animation:pb-sn-mat-in 1.4s .4s ease-out both}}
@keyframes pb-sn-gold-sweep{from{clip-path:polygon(0 0,0 0,0 0,0 0)}to{clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}}
@keyframes pb-sn-mat-in{from{clip-path:inset(8%);opacity:.2;transform:scale(.985)}to{clip-path:inset(0);opacity:1;transform:none}}
@media(max-width:840px){.pb-sn-frame{inset:8px}.pb-sn-nav{padding:14px 18px}.pb-sn-nav-links{display:none}.pb-salon-noir .pb-mnav{display:block;position:relative;margin-left:auto;flex-shrink:0}.pb-salon-noir .pb-mnav-toggle{box-sizing:border-box;list-style:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid var(--pb-line);border-radius:var(--pb-radius-button);background:var(--pb-canvas);color:var(--pb-ink)}.pb-salon-noir .pb-mnav-toggle::-webkit-details-marker{display:none}.pb-salon-noir .pb-mnav-icon{display:flex;flex-direction:column;gap:5px;width:20px}.pb-salon-noir .pb-mnav-icon span{display:block;height:2px;background:currentColor}.pb-salon-noir .pb-mnav[open] .pb-mnav-icon span:nth-child(1){transform:translateY(7px) rotate(45deg)}.pb-salon-noir .pb-mnav[open] .pb-mnav-icon span:nth-child(2){opacity:0}.pb-salon-noir .pb-mnav[open] .pb-mnav-icon span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}.pb-salon-noir .pb-mnav-panel{position:absolute;top:calc(100% + 8px);right:0;z-index:80;display:flex;flex-direction:column;min-width:min(264px,84vw);padding:6px;background:var(--pb-canvas);border:1px solid var(--pb-line)}.pb-salon-noir .pb-mnav-panel a{display:flex;align-items:center;min-height:44px;padding:8px 14px;font-size:17px}.pb-sn-booking{top:81px;margin-inline:20px;max-width:calc(100% - 40px)}.pb-sn-section,.pb-sn-hero{scroll-margin-top:140px}.pb-sn-price-grid{grid-template-columns:1fr}.pb-sn-hero{padding:40px 20px 44px}.pb-sn-hero-inner{grid-template-columns:1fr;gap:24px}.pb-sn-photo{aspect-ratio:16/9}.pb-sn-vert{display:none}.pb-sn-section{padding:48px 20px}.pb-sn-about{grid-template-columns:1fr}.pb-sn-contact{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.pb-salon-noir *,.pb-salon-noir *::before,.pb-salon-noir *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
.pb-sn-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-sn-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-sn-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

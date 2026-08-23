export const MARKTPLATZ_CSS = `
.pb-marktplatz{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-marktplatz a{color:inherit;text-decoration:none}
.pb-mp-nav{display:flex;align-items:center;gap:20px;padding:22px 32px;position:relative;z-index:5;font-size:14px;font-weight:700}
.pb-mp-logo{font-family:var(--pb-font-display);font-weight:800;font-size:19px;color:var(--pb-accent-text)}
.pb-mp-nav-links{display:flex;align-items:center;gap:20px;margin-left:auto;flex-wrap:wrap}
.pb-mp-nav-links a{transition:color .15s}
.pb-mp-nav-links a:hover,.pb-mp-nav-links a:focus-visible{color:var(--pb-accent-text)}
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
.pb-mp-cta:hover,.pb-mp-cta:focus-visible{transform:translateY(2px);box-shadow:0 2px 0 color-mix(in srgb, var(--pb-accent) 80%, black)}
.pb-mp-photo-wrap{position:relative;flex:0 1 280px;min-width:150px;margin-top:14px}
.pb-mp-photo{position:relative;z-index:1;display:block;width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--pb-radius-card);transform:rotate(3deg);box-shadow:0 6px 0 var(--pb-line)}
.pb-mp-sticker{position:absolute;font-family:var(--pb-font-display);z-index:3;text-align:center;white-space:nowrap}
.pb-mp-sticker.pill{right:4%;top:2%;background:var(--pb-accent-2);color:var(--pb-ink);border-radius:999px;padding:16px 18px;font-weight:800;font-size:12.5px;line-height:1.15;transform:rotate(9deg);box-shadow:0 3px 0 #E0A81C;max-width:60%;white-space:normal}
.pb-mp-sticker.ink{right:52%;bottom:32%;background:var(--pb-ink);color:var(--pb-surface);border-radius:var(--pb-radius-button);padding:10px 14px;font-weight:700;font-size:12px;transform:rotate(-6deg)}
.pb-mp-sticker.outline{right:2%;bottom:2%;background:var(--pb-surface);border:2px dashed var(--pb-accent);border-radius:var(--pb-radius-button);padding:9px 13px;font-weight:700;font-size:11.5px;color:var(--pb-accent-text);transform:rotate(4deg)}
.pb-mp-scallop{position:absolute;left:0;right:0;bottom:-1px;height:22px;z-index:2;background:radial-gradient(circle at 12px -6px,transparent 16px,var(--pb-canvas) 17px);background-size:44px 32px}
@media(min-width:641px) and (max-width:860px){.pb-mp-hero-inner{gap:16px}.pb-mp-card{flex-basis:58%;padding:26px 24px 28px}.pb-mp-photo-wrap{flex-basis:30%;margin-top:10px}.pb-mp-sticker.pill{font-size:10px;padding:13px 14px;box-shadow:0 2px 0 #E0A81C}.pb-mp-sticker.ink{font-size:9.5px;padding:8px 11px}.pb-mp-sticker.outline{font-size:9px;padding:7px 10px}}
@media(max-width:640px){.pb-mp-hero{padding:16px 20px 40px}.pb-mp-hero-inner{display:block}.pb-mp-card{max-width:100%;flex-basis:auto;padding:26px 24px 28px}.pb-mp-photo-wrap,.pb-mp-sticker{display:none}.pb-mp-nav{padding:18px 20px;flex-wrap:wrap;row-gap:10px}}
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
@media(max-width:720px){.pb-mp-about{grid-template-columns:1fr}}
.pb-mp-quote{font-style:normal}
.pb-mp-quote p{font-size:15px}
.pb-mp-quote footer{margin-top:12px;font-weight:700;font-family:var(--pb-font-display);font-size:13px;color:var(--pb-accent-text)}
.pb-mp-faq strong{color:var(--pb-accent-text)}
.pb-mp-gallery img{width:100%;height:210px;object-fit:cover;border-radius:var(--pb-radius-card);display:block}
.pb-mp-team img{width:100%;height:180px;object-fit:cover;border-radius:var(--pb-radius-card);margin-bottom:10px}
.pb-mp-contact{display:grid;grid-template-columns:1fr 1fr;gap:36px}
.pb-mp-contact address{font-style:normal}
.pb-mp-contact p{margin-bottom:8px}
.pb-mp-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-mp-hours td{padding:7px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-mp-hours td:first-child{font-weight:700}
.pb-mp-hours td:last-child{text-align:right}
@media(max-width:720px){.pb-mp-contact{grid-template-columns:1fr}}
.pb-marktplatz a[href^="tel:"],.pb-marktplatz a[href^="mailto:"]{color:var(--pb-ink);border-bottom:2px solid var(--pb-accent-2);padding-bottom:1px;transition:color .15s}
.pb-marktplatz a[href^="tel:"]:hover,.pb-marktplatz a[href^="mailto:"]:hover{color:var(--pb-accent-text)}
.pb-marktplatz a.pb-mp-link{display:inline-block;color:var(--pb-accent-text);font-weight:800;font-family:var(--pb-font-display)}
.pb-mp-footer{border-top:1px solid var(--pb-line);padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-mp-footer a{border-bottom:1px solid var(--pb-line)}
.pb-mp-footer a:hover,.pb-mp-footer a:focus-visible{color:var(--pb-accent-text);border-color:var(--pb-accent)}
.pb-mp-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-mp-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-mp-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

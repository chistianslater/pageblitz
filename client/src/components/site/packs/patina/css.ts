export const PATINA_CSS = `
.pb-patina{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-patina a{color:inherit;text-decoration:none}
.pb-pa-nav{display:flex;align-items:center;gap:20px;padding:22px 32px;border-bottom:1px solid var(--pb-line);font-size:13px;font-weight:500}
.pb-pa-logo{font-family:var(--pb-font-display);font-weight:600;font-size:16px}
.pb-pa-nav-links{display:flex;align-items:center;gap:22px;margin-left:auto;flex-wrap:wrap}
.pb-pa-nav-links a{transition:color .15s}
.pb-pa-nav-links a:hover,.pb-pa-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-pa-hero{position:relative;padding:56px 32px 88px;overflow:hidden}
.pb-pa-init{position:absolute;right:-10px;top:-40px;font-family:var(--pb-font-display);font-style:italic;font-weight:600;font-size:300px;line-height:1;color:color-mix(in srgb, var(--pb-accent) 8%, transparent);pointer-events:none;user-select:none}
.pb-pa-grid{position:relative;display:grid;grid-template-columns:1.2fr 1fr;gap:44px;align-items:center;z-index:1}
.pb-pa-copy{min-width:0;overflow-wrap:break-word}
.pb-pa-eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--pb-accent);font-weight:600}
.pb-pa-hero h1{font-family:var(--pb-font-display);font-weight:400;font-size:var(--pb-hero-size);line-height:1.08;margin-top:14px;max-width:14ch}
.pb-pa-hero h1 span{font-style:italic;color:var(--pb-accent)}
.pb-pa-sub{margin-top:16px;color:var(--pb-muted);font-size:15px;max-width:44ch}
.pb-pa-services-line{margin-top:22px;font-size:13px;color:var(--pb-muted);letter-spacing:.01em}
.pb-pa-services-line .sep{color:var(--pb-accent);padding:0 3px;font-weight:600}
.pb-patina a.pb-pa-cta{display:inline-block;margin-top:28px;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:13px 28px;border-radius:var(--pb-radius-button);font-weight:600;font-size:13.5px;transition:opacity .15s}
.pb-pa-cta:hover,.pb-pa-cta:focus-visible{opacity:.85}
.pb-pa-pics{position:relative;height:280px;margin-top:8px}
.pb-pa-arch{position:absolute;border-radius:200px 200px var(--pb-radius-card) var(--pb-radius-card);background-color:var(--pb-line);background-size:cover;background-position:center}
.pb-pa-arch.a1{width:62%;height:100%;right:26%}
.pb-pa-arch.a2{width:46%;height:64%;right:0;bottom:0;box-shadow:-10px -10px 0 var(--pb-canvas)}
.pb-pa-note{position:absolute;left:0;bottom:-6px;font-family:var(--pb-font-display);font-style:italic;font-size:14px;color:var(--pb-muted);transform:rotate(-4deg);max-width:70%}
.pb-pa-section{padding:72px 32px;border-top:1px solid var(--pb-line)}
.pb-pa-section h2{font-family:var(--pb-font-display);font-weight:600;font-style:italic;font-size:clamp(1.6rem,2.6vw,2.2rem);margin-bottom:26px}
.pb-pa-service{padding:18px 0;border-bottom:1px dashed var(--pb-line)}
.pb-pa-service strong{font-family:var(--pb-font-display);font-weight:600;font-size:16px}
.pb-pa-service p{margin-top:4px;color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-pa-about p{max-width:64ch}
.pb-pa-quote{padding:20px 0 20px 22px;border-left:2px solid var(--pb-accent);margin-bottom:22px}
.pb-pa-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:16px;max-width:52ch}
.pb-pa-quote footer{margin-top:10px;font-size:12px;color:var(--pb-muted)}
.pb-pa-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-pa-faq strong{display:block;font-family:var(--pb-font-display);font-weight:600;margin-bottom:6px}
.pb-pa-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-pa-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.pb-pa-contact address{font-style:normal}
.pb-pa-contact p{margin-bottom:8px}
.pb-pa-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-pa-hours td{padding:6px 0;border-bottom:1px dashed var(--pb-line);font-size:13px}
.pb-pa-hours td:first-child{text-transform:uppercase;letter-spacing:.04em;color:var(--pb-muted)}
.pb-pa-hours td:last-child{text-align:right}
.pb-pa-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.pb-pa-gallery img{width:100%;height:200px;object-fit:cover;border-radius:var(--pb-radius-card);display:block}
.pb-pa-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
.pb-pa-member img{width:100%;height:180px;object-fit:cover;border-radius:var(--pb-radius-card);margin-bottom:10px}
.pb-pa-member strong{display:block;font-family:var(--pb-font-display);font-weight:600}
.pb-pa-member p{color:var(--pb-muted);font-size:13px}
.pb-pa-menu-category{margin-bottom:32px}
.pb-pa-menu-category h3{font-family:var(--pb-font-display);font-style:italic;font-weight:600;font-size:15px;color:var(--pb-accent);margin-bottom:10px}
.pb-patina a.pb-pa-link{color:var(--pb-accent);font-weight:600;border-bottom:2px solid var(--pb-accent);padding-bottom:1px;transition:opacity .15s}
.pb-pa-link:hover,.pb-pa-link:focus-visible{opacity:.7}
.pb-patina a[href^="tel:"],.pb-patina a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-patina a[href^="tel:"]:hover,.pb-patina a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-pa-footer{border-top:1px solid var(--pb-line);padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-pa-footer a{border-bottom:1px solid var(--pb-line)}
.pb-pa-footer a:hover,.pb-pa-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(max-width:720px){.pb-pa-init{font-size:150px;top:-14px}.pb-pa-grid{grid-template-columns:1fr}.pb-pa-pics{height:220px;margin-top:26px}.pb-pa-note{bottom:-24px}.pb-pa-contact{grid-template-columns:1fr}.pb-pa-nav{flex-wrap:wrap;row-gap:10px}}
`;

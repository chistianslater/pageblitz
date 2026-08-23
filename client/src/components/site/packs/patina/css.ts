export const PATINA_CSS = `
.pb-patina{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-patina a{color:inherit;text-decoration:none}
.pb-pa-nav{position:sticky;top:0;z-index:40;background:var(--pb-canvas);display:flex;align-items:center;gap:20px;padding:22px 32px;border-bottom:1px solid var(--pb-line);font-size:13px;font-weight:500}
.pb-pa-logo{font-family:var(--pb-font-display);font-weight:600;font-size:16px}
.pb-pa-nav-links{display:flex;align-items:center;gap:22px;margin-left:auto;flex-wrap:wrap}
.pb-pa-nav-links a{transition:color .15s}
.pb-pa-nav-links a:hover,.pb-pa-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-pa-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-pa-hero{position:relative;padding:56px 32px 88px;overflow:hidden}
.pb-pa-init{position:absolute;right:24px;top:8px;font-family:var(--pb-font-display);font-style:italic;font-weight:600;font-size:clamp(150px,18vw,260px);line-height:1;color:color-mix(in srgb, var(--pb-accent) 8%, transparent);pointer-events:none;user-select:none}
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
.pb-pa-arch.a1{width:60%;height:100%;right:32%}
.pb-pa-arch.a2{width:44%;height:56%;right:0;bottom:-24px;box-shadow:-10px -10px 0 var(--pb-canvas)}
.pb-pa-note{display:block;width:fit-content;margin-top:16px;font-family:var(--pb-font-display);font-style:italic;font-size:14px;color:var(--pb-muted);transform:rotate(-2deg);transform-origin:left center}
.pb-pa-section{padding:72px 32px;border-top:1px solid var(--pb-line)}
.pb-pa-section h2{font-family:var(--pb-font-display);font-weight:600;font-style:italic;font-size:clamp(1.6rem,2.6vw,2.2rem);margin-bottom:26px}
.pb-pa-services-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 56px;align-items:start}
.pb-pa-services-grid .pb-pa-service:last-child:nth-child(odd){grid-column:1/-1}
.pb-pa-service{padding:18px 0;border-bottom:1px dashed var(--pb-line)}
.pb-pa-service strong{font-family:var(--pb-font-display);font-weight:600;font-size:16px}
.pb-pa-service p{margin-top:4px;color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-pa-about p{max-width:64ch}
.pb-pa-about-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:44px;align-items:center}
.pb-pa-about-grid>p:only-child{grid-column:1/-1;max-width:none;columns:2;column-gap:56px}
.pb-pa-about-img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:200px 200px var(--pb-radius-card) var(--pb-radius-card);display:block}
.pb-pa-quotes{display:grid;grid-template-columns:1fr 1fr;gap:22px 56px;align-items:start}
.pb-pa-quotes .pb-pa-quote{margin-bottom:0}
.pb-pa-quotes .pb-pa-quote:last-child:nth-child(odd){grid-column:1/-1;max-width:64ch}
.pb-pa-quote{padding:20px 0 20px 22px;border-left:2px solid var(--pb-accent);margin-bottom:22px}
.pb-pa-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:16px;max-width:52ch}
.pb-pa-quote footer{margin-top:10px;font-size:12px;color:var(--pb-muted)}
.pb-pa-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 56px;align-items:start}
.pb-pa-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-pa-faq strong{display:block;font-family:var(--pb-font-display);font-weight:600;margin-bottom:6px}
.pb-pa-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-pa-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
.pb-pa-contact address{font-style:normal}
.pb-pa-contact p{margin-bottom:8px}
.pb-pa-hours-block{max-width:380px}
.pb-pa-hours-block h3{font-family:var(--pb-font-display);font-style:italic;font-weight:600;font-size:15px;color:var(--pb-accent);margin-bottom:8px}
.pb-pa-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-pa-hours td{padding:6px 0;border-bottom:1px dashed var(--pb-line);font-size:13px}
.pb-pa-hours tr:last-child td{border-bottom:none}
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
@media(max-width:720px){.pb-pa-init{font-size:120px;top:4px;right:8px}.pb-pa-grid{grid-template-columns:1fr}.pb-pa-pics{height:220px;margin-top:26px;margin-bottom:24px}.pb-pa-about-grid{grid-template-columns:1fr;gap:20px}.pb-pa-about-grid>p:only-child{columns:1}.pb-pa-about-img{order:-1;max-height:55vw;aspect-ratio:3/2}.pb-pa-contact{grid-template-columns:1fr}.pb-pa-nav{flex-wrap:wrap;row-gap:10px}.pb-pa-services-grid{grid-template-columns:1fr}.pb-pa-quotes{grid-template-columns:1fr;gap:22px}.pb-pa-faq-grid{grid-template-columns:1fr}}
.pb-pa-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-pa-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-pa-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

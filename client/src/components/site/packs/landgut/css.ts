export const LANDGUT_CSS = `
.pb-landgut{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-landgut a{color:inherit;text-decoration:none}
.pb-lg-nav{display:flex;align-items:center;gap:20px;padding:22px 32px;border-bottom:1px solid var(--pb-line);font-size:13px;font-weight:500}
.pb-lg-logo{font-family:var(--pb-font-display);font-weight:500;font-size:16px}
.pb-lg-nav-links{display:flex;align-items:center;gap:22px;margin-left:auto;flex-wrap:wrap}
.pb-lg-nav-links a{transition:color .15s}
.pb-lg-nav-links a:hover,.pb-lg-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-lg-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-lg-hero{padding:56px 32px 0}
.pb-lg-grid{display:grid;grid-template-columns:1.15fr 1fr;gap:44px;align-items:end}
.pb-lg-copy{min-width:0;overflow-wrap:break-word;padding-bottom:40px}
.pb-lg-eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--pb-accent);font-weight:600}
.pb-lg-hero h1{font-family:var(--pb-font-display);font-weight:500;font-size:var(--pb-hero-size);line-height:1.1;margin-top:14px;max-width:14ch}
.pb-lg-hero h1 span{font-style:italic;color:var(--pb-accent)}
.pb-lg-sub{margin-top:16px;color:var(--pb-muted);font-size:15px;max-width:44ch}
.pb-landgut a.pb-lg-cta{display:inline-block;margin-top:26px;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:13px 28px;border-radius:var(--pb-radius-button);font-weight:600;font-size:13.5px;transition:opacity .15s}
.pb-lg-cta:hover,.pb-lg-cta:focus-visible{opacity:.85}
.pb-lg-rows{display:flex;align-items:flex-end;gap:12px;height:280px}
.pb-lg-row{flex:1;position:relative;border-radius:120px 120px 0 0;min-width:0}
.pb-lg-row.r1{height:100%;background:#41593A}
.pb-lg-row.r2{height:62%;background:#C9BC8F}
.pb-lg-row.r3{height:82%;background:#8FA872}
.pb-lg-row-label{position:absolute;left:0;right:0;bottom:16px;text-align:center;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--pb-accent-contrast);font-weight:600;padding:0 8px}
.pb-lg-ticker{width:100%;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:13px 0;margin-top:40px;white-space:nowrap;overflow:hidden;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;text-align:center}
.pb-lg-ticker em{font-style:normal;opacity:.65;padding:0 16px}
.pb-lg-section{padding:72px 32px;border-top:1px solid var(--pb-line)}
.pb-lg-section h2{font-family:var(--pb-font-display);font-weight:500;font-style:italic;font-size:clamp(1.6rem,2.6vw,2.2rem);margin-bottom:26px}
.pb-lg-service{padding:18px 0;border-bottom:1px dashed var(--pb-line)}
.pb-lg-service strong{font-family:var(--pb-font-display);font-weight:500;font-size:16px}
.pb-lg-service p{margin-top:4px;color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-lg-about{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
.pb-lg-about p{max-width:56ch}
.pb-lg-arch-img{width:100%;height:280px;object-fit:cover;border-radius:120px 120px 16px 16px;display:block}
.pb-lg-quote{padding:20px 0 20px 22px;border-left:2px solid var(--pb-accent);margin-bottom:22px}
.pb-lg-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:16px;max-width:52ch}
.pb-lg-quote footer{margin-top:10px;font-size:12px;color:var(--pb-muted)}
.pb-lg-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-lg-faq strong{display:block;font-family:var(--pb-font-display);font-weight:500;margin-bottom:6px}
.pb-lg-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-lg-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.pb-lg-contact address{font-style:normal}
.pb-lg-contact p{margin-bottom:8px}
.pb-lg-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-lg-hours td{padding:6px 0;border-bottom:1px dashed var(--pb-line);font-size:13px}
.pb-lg-hours td:first-child{text-transform:uppercase;letter-spacing:.04em;color:var(--pb-muted)}
.pb-lg-hours td:last-child{text-align:right}
.pb-lg-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
.pb-lg-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
.pb-lg-member .pb-lg-arch-img{height:200px;margin-bottom:10px}
.pb-lg-member strong{display:block;font-family:var(--pb-font-display);font-weight:500}
.pb-lg-member p{color:var(--pb-muted);font-size:13px}
.pb-lg-menu-category{margin-bottom:32px}
.pb-lg-menu-category h3{font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:15px;color:var(--pb-accent);margin-bottom:10px}
.pb-landgut a.pb-lg-link{color:var(--pb-accent);font-weight:600;border-bottom:2px solid var(--pb-accent);padding-bottom:1px;transition:opacity .15s}
.pb-lg-link:hover,.pb-lg-link:focus-visible{opacity:.7}
.pb-landgut a[href^="tel:"],.pb-landgut a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-landgut a[href^="tel:"]:hover,.pb-landgut a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-lg-footer{border-top:1px solid var(--pb-line);padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-lg-footer a{border-bottom:1px solid var(--pb-line)}
.pb-lg-footer a:hover,.pb-lg-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(max-width:720px){.pb-lg-about{grid-template-columns:1fr}.pb-lg-contact{grid-template-columns:1fr}.pb-lg-nav{flex-wrap:wrap;row-gap:10px}}
@media(max-width:640px){.pb-lg-rows{display:none}.pb-lg-grid{grid-template-columns:1fr}.pb-lg-copy{padding-bottom:0}.pb-lg-ticker{margin-top:26px}}
.pb-lg-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-lg-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-lg-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

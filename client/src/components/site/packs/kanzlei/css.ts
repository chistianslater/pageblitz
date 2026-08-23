export const KANZLEI_CSS = `
.pb-kanzlei{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-kanzlei a{color:inherit;text-decoration:none}
.pb-kz-grid{background-image:linear-gradient(90deg,var(--pb-line) 1px,transparent 1px);background-size:25% 100%;background-position:14px 0}
.pb-kz-nav{display:flex;align-items:center;gap:20px;padding:20px 32px;border-bottom:1px solid var(--pb-ink);font-size:13px;font-weight:500}
.pb-kz-logo{font-weight:700;font-family:var(--pb-font-display)}
.pb-kz-nav-links{display:flex;align-items:center;gap:20px;margin-left:auto}
.pb-kz-nav-links a{transition:color .15s}
.pb-kz-nav-links a:hover,.pb-kz-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-kz-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-kz-idx{position:absolute;right:32px;top:86px;font-family:var(--pb-font-utility);font-size:11px;color:var(--pb-accent);text-align:right;line-height:1.9}
.pb-kz-watermark{position:absolute;right:20px;bottom:-40px;font-family:"Source Serif 4",serif;font-size:200px;color:var(--pb-accent);opacity:.07;line-height:1;pointer-events:none}
.pb-kz-eyebrow{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.1em;color:var(--pb-accent);margin-bottom:14px;text-transform:uppercase}
.pb-kz-hero{position:relative;padding:64px 32px 48px;overflow:hidden}
.pb-kz-hero h1{font-family:var(--pb-font-display);font-weight:600;font-size:var(--pb-hero-size);letter-spacing:-.035em;line-height:1.0;max-width:14ch}
.pb-kz-hero h1 span{color:var(--pb-muted)}
.pb-kz-hero p{margin-top:22px;max-width:44ch;color:var(--pb-muted);font-size:15px}
.pb-kz-facts{display:flex;margin:44px 32px 0;border-top:1px solid var(--pb-line)}
.pb-kz-facts div{flex:1;padding:14px 14px 0 0;font-size:12px;color:var(--pb-muted);border-right:1px solid var(--pb-line);margin-right:14px}
.pb-kz-facts div:last-child{border-right:none}
.pb-kz-facts b{display:block;font-size:19px;color:var(--pb-ink);font-weight:600;letter-spacing:-.02em}
.pb-kanzlei a.pb-kz-link{color:var(--pb-accent);font-weight:600;text-decoration:none;border-bottom:2px solid var(--pb-accent);padding-bottom:1px;transition:opacity .15s}
.pb-kz-link:hover,.pb-kz-link:focus-visible{opacity:.7}
.pb-kanzlei a[href^="tel:"],.pb-kanzlei a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-kanzlei a[href^="tel:"]:hover,.pb-kanzlei a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-kz-section{padding:72px 32px;border-top:1px solid var(--pb-line);position:relative}
.pb-kz-section h2{font-family:var(--pb-font-display);font-weight:600;letter-spacing:-.02em;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:26px}
.pb-kz-service{display:flex;gap:20px;padding:18px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-kz-service .idx{font-family:var(--pb-font-utility);color:var(--pb-accent);font-size:13px;flex-shrink:0}
.pb-kz-service strong{font-weight:600;letter-spacing:-.01em}
.pb-kz-service p{margin-top:4px;font-size:14px;max-width:56ch}
.pb-kz-service span{margin-left:auto;font-family:var(--pb-font-utility);font-size:13px;color:var(--pb-muted);flex-shrink:0;padding-left:12px}
.pb-kz-quote{padding:20px 0 20px 22px;border-left:2px solid var(--pb-line);margin-bottom:22px}
.pb-kz-quote p{font-size:16px;max-width:52ch}
.pb-kz-quote footer{margin-top:10px;font-family:var(--pb-font-utility);font-size:12px;color:var(--pb-muted)}
.pb-kz-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-kz-faq strong{display:block;font-weight:600;margin-bottom:6px}
.pb-kz-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-kz-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.pb-kz-contact address{font-style:normal}
.pb-kz-contact p{margin-bottom:8px}
.pb-kz-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-kz-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-kz-hours td:first-child{font-family:var(--pb-font-utility);text-transform:uppercase;letter-spacing:.04em;color:var(--pb-muted)}
.pb-kz-hours td:last-child{text-align:right}
.pb-kz-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.pb-kz-gallery img{width:100%;height:200px;object-fit:cover;filter:saturate(.7);border:1px solid var(--pb-line);display:block}
.pb-kz-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
.pb-kz-member img{width:100%;height:180px;object-fit:cover;filter:saturate(.7);border:1px solid var(--pb-line);margin-bottom:10px}
.pb-kz-member strong{display:block;font-weight:600}
.pb-kz-member p{color:var(--pb-muted);font-size:13px}
.pb-kz-menu-category{margin-bottom:32px}
.pb-kz-menu-category h3{font-family:var(--pb-font-utility);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:10px}
.pb-kz-footer{border-top:1px solid var(--pb-ink);padding:32px;font-size:12px;color:var(--pb-muted)}
.pb-kz-footer a{border-bottom:1px solid var(--pb-line)}
.pb-kz-footer a:hover,.pb-kz-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(max-width:720px){.pb-kz-idx{display:none}.pb-kz-facts{flex-direction:column;gap:14px}.pb-kz-facts div{border-right:none;margin-right:0;padding-right:0}.pb-kz-contact{grid-template-columns:1fr}.pb-kz-nav{flex-wrap:wrap;row-gap:10px}.pb-kz-nav-links{flex-wrap:wrap;margin-left:0}}
.pb-kz-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-kz-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-kz-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

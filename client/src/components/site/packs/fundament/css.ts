export const FUNDAMENT_CSS = `
.pb-fundament{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-fundament a{color:inherit;text-decoration:none}
.pb-fd-nav-links a{transition:color .15s}
.pb-fd-nav-links a:hover,.pb-fd-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-fundament a[href^="tel:"],.pb-fundament a[href^="mailto:"]{color:var(--pb-ink);border-bottom:2px solid var(--pb-accent);padding-bottom:1px}
.pb-fundament a[href^="tel:"]:hover,.pb-fundament a[href^="mailto:"]:hover{color:var(--pb-accent)}
.pb-fd-nav{display:flex;align-items:center;gap:20px;padding:20px 32px;border-bottom:1px solid var(--pb-line);font-size:13px;font-weight:500}
.pb-fd-logo{font-family:var(--pb-font-display);font-weight:600;font-size:16px}
.pb-fd-nav-links{display:flex;align-items:center;gap:20px;margin-left:auto}
.pb-fd-hero{position:relative;min-height:620px;overflow:hidden}
.pb-fd-panel{position:absolute;right:0;top:0;bottom:0;width:42%;background:var(--pb-ink);background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 28px),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,transparent 1px 28px)}
.pb-fd-content{position:absolute;left:0;top:0;z-index:2;padding:76px 40px 64px 32px}
.pb-fd-hero h1{font-family:var(--pb-font-display);font-weight:500;font-size:var(--pb-hero-size);line-height:1.05;max-width:13ch;letter-spacing:-.01em}
.pb-fd-hero h1 em{font-style:italic;color:var(--pb-accent);font-weight:500}
.pb-fd-hero p{margin-top:20px;max-width:260px;color:var(--pb-muted);font-size:15px}
.pb-fundament a.pb-fd-cta{display:inline-block;margin-top:30px;background:var(--pb-ink);color:var(--pb-accent-contrast);padding:14px 28px;font-weight:600;font-size:14px;transition:opacity .15s}
.pb-fd-cta:hover,.pb-fd-cta:focus-visible{opacity:.82}
.pb-fd-photo{position:absolute;left:44%;top:19%;width:26%;height:44%;object-fit:cover;box-shadow:16px 16px 0 var(--pb-ink);z-index:3}
.pb-fd-stats{position:absolute;right:32px;bottom:32px;width:calc(42% - 64px);z-index:2}
.pb-fd-stats div{border-top:1px solid rgba(255,255,255,.25);padding-top:12px;margin-top:12px}
.pb-fd-stats b{display:block;font-family:var(--pb-font-display);font-weight:500;font-size:22px;color:var(--pb-accent-contrast)}
.pb-fd-stats span{display:block;font-size:11px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.04em;margin-top:2px}
.pb-fd-section{padding:72px 32px;border-top:1px solid var(--pb-line)}
.pb-fd-section h2{font-family:var(--pb-font-display);font-weight:600;letter-spacing:-.01em;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:26px}
.pb-fd-intro{color:var(--pb-muted);margin:-14px 0 26px;max-width:56ch}
.pb-fd-service{display:flex;gap:20px;padding:18px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-fd-service .idx{font-family:var(--pb-font-body);font-weight:600;color:var(--pb-accent);font-size:13px;flex-shrink:0}
.pb-fd-service strong{font-weight:600;letter-spacing:-.01em}
.pb-fd-service p{margin-top:4px;font-size:14px;color:var(--pb-muted);max-width:56ch}
.pb-fd-service span{margin-left:auto;font-size:13px;color:var(--pb-muted);flex-shrink:0;padding-left:12px}
.pb-fd-about-image{width:100%;max-width:480px;display:block;margin-bottom:20px;border:1px solid var(--pb-line)}
.pb-fd-quote{padding:20px 0 20px 22px;border-left:2px solid var(--pb-accent);margin-bottom:22px}
.pb-fd-quote p{font-size:16px;max-width:52ch}
.pb-fd-quote footer{margin-top:10px;font-size:12px;color:var(--pb-muted)}
.pb-fd-faq{border-bottom:1px solid var(--pb-line);padding:18px 0}
.pb-fd-faq strong{display:block;font-weight:600;margin-bottom:6px}
.pb-fd-faq p{color:var(--pb-muted);font-size:14px;max-width:56ch}
.pb-fd-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.pb-fd-contact address{font-style:normal}
.pb-fd-contact p{margin-bottom:8px}
.pb-fd-hours{width:100%;border-collapse:collapse;margin-top:4px}
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
@media(max-width:640px){.pb-fd-hero{display:flex;flex-direction:column;min-height:0}.pb-fd-content{position:static;order:1;padding:48px 20px 32px}.pb-fd-panel{order:2;position:relative;right:auto;top:auto;bottom:auto;width:100%;height:150px}.pb-fd-photo{display:none}.pb-fd-stats{position:absolute;left:20px;right:20px;bottom:20px;top:auto;width:auto;display:flex;gap:12px}.pb-fd-stats div{flex:1;min-width:0;border-top:none;border-left:1px solid rgba(255,255,255,.25);padding:0 0 0 10px;margin:0}.pb-fd-stats b{font-size:18px}.pb-fd-stats span{overflow-wrap:break-word}.pb-fd-contact{grid-template-columns:1fr}.pb-fd-nav{flex-wrap:wrap;row-gap:10px}.pb-fd-nav-links{flex-wrap:wrap;margin-left:0}.pb-fd-section{padding:48px 20px}}
`;

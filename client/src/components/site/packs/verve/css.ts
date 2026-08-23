export const VERVE_CSS = `
.pb-verve{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip;position:relative}
.pb-verve a{color:inherit;text-decoration:none}
.pb-vv-nav{display:flex;align-items:center;gap:20px;padding:20px 28px;position:sticky;top:0;z-index:40;background:var(--pb-canvas);border-bottom:1px solid var(--pb-line)}
.pb-vv-logo{font-family:var(--pb-font-display);font-size:20px;letter-spacing:.04em;color:var(--pb-accent);text-transform:uppercase;white-space:nowrap}
.pb-vv-nav-links{display:flex;gap:22px;margin-left:auto;font-weight:600;font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;flex-wrap:wrap}
.pb-vv-nav-links a{transition:color .15s}
.pb-vv-nav-links a:hover,.pb-vv-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-vv-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-verve a[href^="tel:"],.pb-verve a[href^="mailto:"]{color:var(--pb-ink);border-bottom:2px solid var(--pb-accent);padding-bottom:1px}
.pb-verve a[href^="tel:"]:hover,.pb-verve a[href^="mailto:"]:hover{color:var(--pb-accent)}
.pb-vv-hero{position:relative;padding:36px 28px 76px;overflow:hidden}
.pb-vv-ghost{position:absolute;left:-20px;top:70px;font-family:var(--pb-font-display);font-size:150px;line-height:.82;color:transparent;-webkit-text-stroke:1px var(--pb-line);white-space:nowrap;pointer-events:none;text-transform:uppercase;z-index:0}
.pb-vv-panel{position:absolute;right:-40px;top:56px;width:36%;height:66%;background:linear-gradient(200deg,var(--pb-surface),var(--pb-canvas) 70%);background-size:cover;background-position:center;transform:skewX(-6deg);border-left:4px solid var(--pb-accent);z-index:1}
.pb-vv-copy{position:relative;z-index:2;max-width:62%}
.pb-vv-hero h1{font-family:var(--pb-font-display);font-size:var(--pb-hero-size);line-height:.9;text-transform:uppercase;margin:0}
.pb-vv-hero h1 span{display:block}
.pb-vv-block{display:inline-block;color:var(--pb-accent-contrast);background:var(--pb-accent);padding:0 14px;transform:skewX(-6deg);margin-top:6px}
.pb-vv-hero p{margin-top:18px;color:var(--pb-muted);font-size:15px;max-width:44ch}
.pb-verve a.pb-vv-cta{display:inline-block;margin-top:26px;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:14px 28px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;transform:skewX(-6deg);transition:filter .15s}
.pb-vv-cta:hover,.pb-vv-cta:focus-visible{filter:brightness(1.1)}
.pb-vv-tape{position:absolute;right:-30px;bottom:44px;background:var(--pb-accent);color:var(--pb-accent-contrast);font-family:var(--pb-font-display);font-size:14px;letter-spacing:.14em;padding:7px 40px;transform:rotate(-8deg);z-index:2;text-transform:uppercase;white-space:nowrap}
.pb-vv-stats{position:relative;z-index:2;display:flex;gap:14px;margin-top:34px;flex-wrap:wrap}
.pb-vv-chip{background:var(--pb-surface);border-left:3px solid var(--pb-accent);padding:10px 18px;transform:skewX(-6deg)}
.pb-vv-chip b{display:block;font-family:var(--pb-font-display);font-size:18px;color:var(--pb-accent);letter-spacing:.02em}
.pb-vv-chip span{display:block;font-size:11px;color:var(--pb-muted);text-transform:uppercase;letter-spacing:.04em}
.pb-vv-section{padding:64px 28px;border-top:1px solid var(--pb-line)}
.pb-vv-section h2{font-family:var(--pb-font-display);text-transform:uppercase;font-size:clamp(1.7rem,3.2vw,2.6rem);letter-spacing:.01em;margin-bottom:26px}
.pb-vv-section h3{font-family:var(--pb-font-display);text-transform:uppercase;letter-spacing:.02em;color:var(--pb-accent);font-size:16px;margin:26px 0 12px}
.pb-vv-intro{color:var(--pb-muted);margin:0 0 28px;max-width:52ch}
.pb-vv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}
.pb-vv-card{background:var(--pb-surface);padding:24px;border-top:3px solid var(--pb-accent);min-width:0}
.pb-vv-card strong{display:block;font-family:var(--pb-font-display);letter-spacing:.02em;text-transform:uppercase;font-size:18px;margin-bottom:8px}
.pb-vv-card p{color:var(--pb-muted);font-size:14px}
.pb-vv-price{display:inline-block;margin-top:10px;color:var(--pb-accent);font-weight:700;font-size:14px}
.pb-vv-about{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.pb-vv-about img{width:100%;display:block;border-left:4px solid var(--pb-accent)}
.pb-vv-about p{color:var(--pb-ink);max-width:60ch;min-width:0}
.pb-vv-quotes{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
.pb-vv-quotes .pb-vv-quote{margin-bottom:0;max-width:none}
.pb-vv-quotes .pb-vv-quote:nth-child(even){transform:translateY(14px)}
.pb-vv-quotes .pb-vv-quote:last-child:nth-child(odd){grid-column:1/-1;max-width:64ch}
.pb-vv-quote{background:var(--pb-surface);padding:22px;margin-bottom:16px;border-left:3px solid var(--pb-accent);max-width:56ch}
.pb-vv-quote p{font-size:15px}
.pb-vv-quote footer{margin-top:12px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--pb-muted)}
.pb-vv-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 44px;align-items:start}
.pb-vv-faq-grid .pb-vv-faq{max-width:none}
.pb-vv-faq{max-width:60ch;margin:0 0 20px;border-bottom:1px solid var(--pb-line);padding-bottom:18px}
.pb-vv-faq strong{display:block;font-family:var(--pb-font-display);text-transform:uppercase;letter-spacing:.02em;margin-bottom:6px;font-size:16px}
.pb-vv-faq p{color:var(--pb-muted);font-size:14px}
.pb-vv-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.pb-vv-gallery img{width:100%;height:220px;object-fit:cover;border-left:4px solid var(--pb-accent);display:block}
.pb-vv-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:22px}
.pb-vv-member img{width:100%;height:200px;object-fit:cover;border-left:4px solid var(--pb-accent);margin-bottom:12px}
.pb-vv-member strong{display:block;font-family:var(--pb-font-display);text-transform:uppercase;letter-spacing:.02em}
.pb-vv-member p{color:var(--pb-muted);font-size:13px}
.pb-vv-hours-block{max-width:640px;margin-top:18px}
.pb-vv-hours-block h3{margin:0 0 4px}
.pb-vv-hours{width:100%;border-collapse:collapse;margin-top:6px}
.pb-vv-hours tr:last-child td{border-bottom:none}
.pb-vv-hours td{padding:8px 0;border-bottom:1px solid var(--pb-line);font-size:14px}
.pb-vv-hours td:first-child{font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.pb-vv-hours td:last-child{text-align:right;color:var(--pb-muted)}
.pb-vv-footer{padding:32px 28px;font-size:12px;color:var(--pb-muted);border-top:1px solid var(--pb-line)}
.pb-vv-footer a{border-bottom:1px solid var(--pb-line)}
.pb-vv-footer a:hover,.pb-vv-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(max-width:640px){.pb-vv-ghost{display:none}.pb-vv-panel{display:none}.pb-vv-tape{display:none}.pb-vv-copy{max-width:100%}.pb-vv-stats{margin-top:24px}.pb-vv-hero{padding:28px 20px 48px}.pb-vv-section{padding:44px 20px}.pb-vv-about{grid-template-columns:1fr}.pb-vv-nav{flex-wrap:wrap;row-gap:8px}.pb-vv-nav-links{margin-left:0}.pb-vv-quotes{grid-template-columns:1fr}.pb-vv-quotes .pb-vv-quote:nth-child(even){transform:none}.pb-vv-faq-grid{grid-template-columns:1fr}}
.pb-vv-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-vv-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-vv-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

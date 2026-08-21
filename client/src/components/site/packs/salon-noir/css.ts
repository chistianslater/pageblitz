export const SALON_NOIR_CSS = `
.pb-salon-noir{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);font-weight:300;line-height:1.6;overflow-x:clip;position:relative}
.pb-salon-noir a{color:inherit;text-decoration:none}
.pb-sn-frame{position:absolute;inset:12px;border:1px solid color-mix(in srgb, var(--pb-accent) 45%, transparent);pointer-events:none;z-index:50}
.pb-sn-nav{display:flex;align-items:center;justify-content:center;gap:28px;padding:26px 40px;border-bottom:1px solid var(--pb-line);flex-wrap:wrap}
.pb-sn-nav-links{display:flex;align-items:center;gap:20px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;flex-wrap:wrap;color:var(--pb-muted)}
.pb-sn-nav-links a{transition:color .15s}
.pb-sn-nav-links a:hover,.pb-sn-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-sn-logo{font-family:var(--pb-font-display);font-style:italic;font-weight:500;letter-spacing:.3em;text-transform:uppercase;font-size:15px;padding:0 8px;white-space:nowrap}
.pb-sn-hero{position:relative;padding:64px 40px 72px}
.pb-sn-hero-inner{position:relative;display:grid;grid-template-columns:1.15fr .85fr;align-items:center;gap:32px}
.pb-sn-copy{position:relative;z-index:2;min-width:0}
.pb-sn-eyebrow{letter-spacing:.3em;text-transform:uppercase;font-size:10px;color:var(--pb-accent);margin:0 0 16px}
.pb-sn-hero h1{font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:var(--pb-hero-size);line-height:1.08;letter-spacing:-.01em;max-width:12ch;width:fit-content;margin:0 -56px 0 auto}
.pb-sn-sub{margin-top:18px;color:var(--pb-muted);font-size:15px;max-width:44ch}
.pb-salon-noir a.pb-sn-cta{display:inline-block;margin-top:28px;border:1px solid var(--pb-accent);color:var(--pb-accent);background:transparent;padding:13px 30px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;transition:background .15s,color .15s}
.pb-sn-cta:hover,.pb-sn-cta:focus-visible{background:var(--pb-accent);color:var(--pb-accent-contrast)}
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
.pb-sn-about img{width:100%;border:1px solid color-mix(in srgb, var(--pb-accent) 40%, transparent);display:block}
.pb-sn-about p{color:var(--pb-ink);max-width:60ch;min-width:0}
.pb-sn-quote{max-width:56ch;margin:0 0 26px;padding:0 0 0 18px;border-left:2px solid var(--pb-accent)}
.pb-sn-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:16px}
.pb-sn-quote footer{margin-top:10px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--pb-muted)}
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
.pb-sn-contact{display:grid;grid-template-columns:1fr 1fr;gap:36px}
.pb-sn-contact address{font-style:normal}
.pb-sn-contact p{margin-bottom:8px}
.pb-sn-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-sn-hours td{padding:7px 0;border-bottom:1px dotted var(--pb-line);font-size:13px}
.pb-sn-hours td:first-child{text-transform:uppercase;letter-spacing:.06em;color:var(--pb-muted);font-size:11px}
.pb-sn-hours td:last-child{text-align:right}
.pb-sn-cta-card p{max-width:46ch;margin:0 0 22px;color:var(--pb-muted)}
.pb-salon-noir a[href^="tel:"],.pb-salon-noir a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-salon-noir a[href^="tel:"]:hover,.pb-salon-noir a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-sn-footer{padding:32px 40px;font-size:12px;color:var(--pb-muted);border-top:1px solid var(--pb-line);text-align:center}
.pb-sn-footer a{border-bottom:1px solid var(--pb-line)}
.pb-sn-footer a:hover,.pb-sn-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(max-width:720px){.pb-sn-frame{inset:8px}.pb-sn-nav{gap:14px;padding:18px 20px}.pb-sn-logo{letter-spacing:.18em;font-size:13px}.pb-sn-hero{padding:48px 20px 56px}.pb-sn-hero-inner{grid-template-columns:1fr;gap:24px}.pb-sn-hero h1{max-width:14ch;width:auto;margin:0}.pb-sn-photo{aspect-ratio:16/9}.pb-sn-vert{display:none}.pb-sn-section{padding:48px 20px}.pb-sn-about{grid-template-columns:1fr}.pb-sn-contact{grid-template-columns:1fr}}
`;

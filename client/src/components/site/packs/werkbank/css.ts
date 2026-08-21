export const WERKBANK_CSS = `
.pb-werkbank{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.5;overflow-x:clip}
.pb-werkbank a{color:inherit;text-decoration:none}
.pb-wb-nav-links a{transition:color .15s}
.pb-wb-nav-links a:hover,.pb-wb-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-werkbank a[href^="tel:"],.pb-werkbank a[href^="mailto:"]{color:var(--pb-ink);border-bottom:2px solid var(--pb-accent);padding-bottom:1px}
.pb-werkbank a[href^="tel:"]:hover,.pb-werkbank a[href^="mailto:"]:hover{color:var(--pb-accent)}
.pb-wb-rail{position:fixed;left:0;top:0;bottom:0;width:56px;background:var(--pb-ink);color:var(--pb-canvas);display:flex;align-items:center;justify-content:center;z-index:40}
.pb-wb-rail b{writing-mode:vertical-rl;transform:rotate(180deg);font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.3em;font-weight:400}
.pb-wb-main{margin-left:56px}
.pb-wb-nav{display:flex;align-items:center;gap:20px;padding:18px 28px;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:.06em}
.pb-wb-logo{font-family:var(--pb-font-display);font-size:16px}
.pb-wb-nav-links{display:flex;gap:16px;margin-left:auto}
.pb-wb-hero{position:relative;padding:40px 28px 90px;overflow:hidden}
.pb-wb-hero h1{font-family:var(--pb-font-display);font-size:var(--pb-hero-size);line-height:.92;text-transform:uppercase;max-width:14ch}
.pb-wb-hero .outline{display:block;color:transparent;-webkit-text-stroke:2px var(--pb-ink)}
.pb-wb-hero .accent{display:block;color:var(--pb-accent)}
.pb-wb-photo{position:absolute;right:0;top:0;width:34%;height:82%;object-fit:cover;clip-path:polygon(26% 0,100% 0,100% 100%,0 100%);border-left:8px solid var(--pb-accent)}
.pb-werkbank a.pb-wb-cta{display:inline-block;margin-top:26px;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:14px 26px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;text-decoration:none}
.pb-wb-marquee{background:var(--pb-ink);color:var(--pb-canvas);transform:rotate(-2deg);margin:0 -4%;padding:12px 0;white-space:nowrap;overflow:hidden;font-family:var(--pb-font-display);text-transform:uppercase;font-size:14px;letter-spacing:.08em}
.pb-wb-marquee em{font-style:normal;color:var(--pb-accent);padding:0 16px}
.pb-wb-section{padding:70px 28px;border-top:1px solid var(--pb-line)}
.pb-wb-section h2{font-family:var(--pb-font-display);text-transform:uppercase;font-size:clamp(1.6rem,3vw,2.4rem);margin-bottom:28px}
.pb-wb-service{display:flex;gap:18px;padding:16px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-wb-service .idx{font-family:var(--pb-font-utility);color:var(--pb-accent);font-size:13px}
.pb-wb-footer{background:var(--pb-ink);color:var(--pb-canvas);padding:36px 28px;font-size:13px}
.pb-wb-footer a{text-decoration:underline;text-underline-offset:3px;opacity:.8}
.pb-wb-footer a:hover,.pb-wb-footer a:focus-visible{opacity:1}
.pb-wb-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.pb-wb-gallery img{width:100%;height:220px;object-fit:cover;border-left:8px solid var(--pb-accent);display:block}
.pb-wb-hours{width:100%;border-collapse:collapse;margin-top:12px}
.pb-wb-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:14px}
.pb-wb-hours td:first-child{font-family:var(--pb-font-utility);font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.pb-wb-hours td:last-child{text-align:right;color:var(--pb-muted)}
@media(max-width:720px){.pb-wb-rail{display:none}.pb-wb-main{margin-left:0}.pb-wb-photo{display:none}.pb-wb-nav{flex-wrap:wrap;row-gap:8px}.pb-wb-nav-links{flex-wrap:wrap;margin-left:0}}
`;

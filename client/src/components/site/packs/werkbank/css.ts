export const WERKBANK_CSS = `
.pb-werkbank{position:relative;background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.5;overflow-x:clip}
.pb-werkbank a{color:inherit;text-decoration:none}
.pb-wb-nav-links a{transition:color .15s}
.pb-wb-nav-links a:hover,.pb-wb-nav-links a:focus-visible{color:var(--pb-accent-text)}
.pb-wb-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-werkbank a[href^="tel:"],.pb-werkbank a[href^="mailto:"]{color:var(--pb-ink);border-bottom:2px solid var(--pb-accent);padding-bottom:1px}
.pb-werkbank a[href^="tel:"]:hover,.pb-werkbank a[href^="mailto:"]:hover{color:var(--pb-accent-text)}
.pb-wb-rail{position:absolute;left:0;top:0;bottom:0;width:56px;background:var(--pb-ink);color:var(--pb-canvas);display:flex;align-items:center;justify-content:center;z-index:40}
.pb-wb-rail b{writing-mode:vertical-rl;transform:rotate(180deg);font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.3em;font-weight:400}
.pb-wb-main{margin-left:56px}
.pb-wb-nav{position:sticky;top:0;z-index:30;background:var(--pb-canvas);border-bottom:2px solid var(--pb-ink);display:flex;align-items:center;gap:20px;padding:18px 28px;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:.06em}
.pb-wb-logo{font-family:var(--pb-font-display);font-size:16px}
.pb-wb-nav-links{display:flex;gap:16px;margin-left:auto}
.pb-wb-hero{position:relative;padding:40px 28px 90px;overflow:hidden}
.pb-wb-hero h1{font-family:var(--pb-font-display);font-size:var(--pb-hero-size);line-height:.92;text-transform:uppercase;max-width:14ch}
.pb-wb-hero>p{max-width:52ch;margin-top:18px;padding-right:24px}
.pb-wb-hero .outline{display:block;color:transparent;-webkit-text-stroke:2px var(--pb-ink)}
.pb-wb-hero .accent{display:block;color:var(--pb-accent-text)}
.pb-wb-photo{position:absolute;right:0;top:0;width:34%;height:82%;object-fit:cover;clip-path:polygon(26% 0,100% 0,100% 100%,0 100%);border-left:8px solid var(--pb-accent)}
.pb-werkbank a.pb-wb-cta{display:inline-block;margin-top:26px;background:var(--pb-accent);color:var(--pb-ink);padding:14px 26px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;text-decoration:none}
.pb-wb-marquee{background:var(--pb-ink);color:var(--pb-canvas);transform:rotate(-2deg);margin:0 -4%;padding:12px 0;white-space:nowrap;overflow:hidden;font-family:var(--pb-font-display);text-transform:uppercase;font-size:14px;letter-spacing:.08em}
.pb-wb-marquee em{font-style:normal;color:var(--pb-accent);padding:0 16px}
.pb-wb-section{padding:70px 28px;border-top:1px solid var(--pb-line)}
.pb-wb-section h2{font-family:var(--pb-font-display);text-transform:uppercase;font-size:clamp(1.6rem,3vw,2.4rem);margin-bottom:28px}
.pb-wb-service{display:flex;gap:18px;padding:16px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-wb-service>div{flex:1;min-width:0}
.pb-wb-service .price{margin-left:auto;font-family:var(--pb-font-utility);font-size:13px;color:var(--pb-muted);flex-shrink:0;padding-left:16px;white-space:nowrap}
.pb-wb-service .idx{font-family:var(--pb-font-utility);color:var(--pb-accent-text);font-size:13px}
.pb-wb-about{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,6fr);gap:44px;align-items:start}
.pb-wb-about>p:only-child{grid-column:1/-1}
.pb-wb-about p{max-width:60ch}
.pb-wb-about-img{width:100%;aspect-ratio:3/2;object-fit:cover;border-left:8px solid var(--pb-accent);display:block}
.pb-wb-section blockquote{max-width:60ch;margin:0 0 22px;padding:0 0 18px;border-bottom:1px solid var(--pb-line)}
.pb-wb-section blockquote:last-of-type{border-bottom:none;margin-bottom:0}
.pb-wb-section blockquote footer{margin-top:8px;font-size:13px}
.pb-wb-footer{background:var(--pb-ink);color:var(--pb-canvas);padding:36px 28px;font-size:13px}
.pb-wb-footer a{text-decoration:underline;text-underline-offset:3px;opacity:.8}
.pb-wb-footer a:hover,.pb-wb-footer a:focus-visible{opacity:1}
.pb-wb-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.pb-wb-gallery figure{margin:0}
.pb-wb-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-left:8px solid var(--pb-accent);display:block}
.pb-wb-gallery figcaption{margin-top:8px;font-family:var(--pb-font-utility);font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--pb-muted)}
.pb-wb-hours-block{max-width:640px;margin-top:22px}
.pb-wb-hours-block h3{font-family:var(--pb-font-display);text-transform:uppercase;font-size:15px;letter-spacing:.04em;margin:0}
.pb-wb-hours{width:100%;max-width:640px;border-collapse:collapse;margin-top:12px}
.pb-wb-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:14px}
.pb-wb-hours tr:last-child td{border-bottom:none}
.pb-wb-hours td:first-child{font-family:var(--pb-font-utility);font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.pb-wb-hours td:last-child{text-align:right;color:var(--pb-muted)}
@media(max-width:720px){.pb-wb-rail{display:none}.pb-wb-main{margin-left:0}.pb-wb-photo{display:none}.pb-wb-nav-links{display:none}.pb-wb-about{grid-template-columns:1fr;gap:20px}.pb-wb-about-img{order:-1;max-height:55vw}}
.pb-wb-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-wb-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-wb-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

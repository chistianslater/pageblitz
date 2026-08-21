export const GUSTO_CSS = `
.pb-gusto{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);font-weight:300;line-height:1.65;overflow-x:clip}
.pb-gusto a{color:inherit;text-decoration:none}
.pb-gu-frame{position:relative;margin:14px;border:1px solid color-mix(in srgb, var(--pb-accent) 50%, transparent);outline:1px solid color-mix(in srgb, var(--pb-accent) 25%, transparent);outline-offset:4px}
.pb-gu-nav{display:flex;align-items:center;justify-content:center;gap:28px;padding:26px 24px;border-bottom:1px solid var(--pb-line);flex-wrap:wrap}
.pb-gu-nav-links{display:flex;align-items:center;gap:22px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;flex-wrap:wrap}
.pb-gu-nav-links a{transition:color .15s}
.pb-gu-nav-links a:hover,.pb-gu-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-gu-logo{font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:21px;padding:0 8px}
.pb-gu-eyebrow{letter-spacing:.34em;text-transform:uppercase;font-size:10px;color:var(--pb-accent);text-align:center;margin:0 0 18px}
.pb-gu-div{display:flex;align-items:center;justify-content:center;gap:14px;margin:30px auto}
.pb-gu-div .line{width:60px;height:1px;background:var(--pb-line)}
.pb-gu-div .diamond{font-size:9px;color:var(--pb-accent);line-height:1}
.pb-gu-hero{position:relative;padding:72px 32px 64px;text-align:center;overflow:visible}
.pb-gu-hero h1{font-family:var(--pb-font-display);font-style:italic;font-weight:500;font-size:var(--pb-hero-size);letter-spacing:-.01em;line-height:1.12;max-width:17ch;margin:0 auto}
.pb-gu-hero p{margin:20px auto 0;max-width:46ch;color:var(--pb-muted);font-size:15px;text-align:center}
.pb-gusto a.pb-gu-cta{display:inline-block;margin-top:30px;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:15px 34px;font-weight:700;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;transition:opacity .15s}
.pb-gu-cta:hover,.pb-gu-cta:focus-visible{opacity:.85}
.pb-gu-menu-preview{max-width:420px;margin:34px auto 0;text-align:left}
.pb-gu-menu{display:flex;align-items:baseline;gap:8px;padding:7px 0}
.pb-gu-menu i{flex:1;border-bottom:1px dotted var(--pb-line);font-style:normal}
.pb-gu-price{color:var(--pb-accent);font-weight:700;font-size:13px;white-space:nowrap}
.pb-gu-plate{position:absolute;right:-70px;top:50%;transform:translateY(-50%);width:200px;height:200px;border-radius:50%;background-color:var(--pb-line);background-size:cover;background-position:center;filter:brightness(.4) saturate(1.15);border:10px solid var(--pb-surface);outline:2px solid var(--pb-accent);outline-offset:-2px;z-index:3}
.pb-gu-section{padding:64px 32px;border-top:1px solid var(--pb-line);text-align:center}
.pb-gu-section h2{font-family:var(--pb-font-display);font-style:italic;font-weight:500;letter-spacing:-.01em;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:30px}
.pb-gu-intro{color:var(--pb-muted);margin:0 auto 30px;max-width:46ch}
.pb-gu-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;text-align:left}
.pb-gu-card{background:var(--pb-surface);padding:24px;border:1px solid var(--pb-line)}
.pb-gu-card strong{display:block;font-weight:700;margin-bottom:8px;font-size:15px}
.pb-gu-card p{color:var(--pb-muted);font-size:14px}
.pb-gu-about{max-width:46ch;margin:0 auto}
.pb-gu-about img{width:100%;max-width:420px;filter:brightness(.55) saturate(1.1);border:1px solid var(--pb-line);margin:0 auto 26px;display:block}
.pb-gu-about p{color:var(--pb-ink)}
.pb-gu-menu-category{max-width:520px;margin:0 auto 36px;text-align:left}
.pb-gu-menu-category h3{font-family:var(--pb-font-display);font-style:italic;font-size:15px;letter-spacing:.02em;color:var(--pb-accent);margin-bottom:14px;text-align:center}
.pb-gu-menu-item{margin-bottom:14px}
.pb-gu-menu-item p{margin:2px 0 0;color:var(--pb-muted);font-size:13px}
.pb-gu-quote{max-width:52ch;margin:0 auto 26px;padding:0 0 0 18px;border-left:2px solid var(--pb-accent);text-align:left}
.pb-gu-quote p{font-size:15.5px;font-style:italic}
.pb-gu-quote footer{margin-top:10px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--pb-muted)}
.pb-gu-faq{max-width:52ch;margin:0 auto 20px;text-align:left;border-bottom:1px solid var(--pb-line);padding-bottom:18px}
.pb-gu-faq strong{display:block;font-family:var(--pb-font-display);font-style:italic;font-weight:500;margin-bottom:6px}
.pb-gu-faq p{color:var(--pb-muted);font-size:14px}
.pb-gu-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.pb-gu-gallery img{width:100%;height:220px;object-fit:cover;filter:brightness(.5) saturate(1.1);border:1px solid var(--pb-line);display:block}
.pb-gu-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px;text-align:left}
.pb-gu-member img{width:100%;height:200px;object-fit:cover;filter:brightness(.55) saturate(1.1);border:1px solid var(--pb-line);margin-bottom:12px}
.pb-gu-member strong{display:block;font-weight:700}
.pb-gu-member p{color:var(--pb-muted);font-size:13px}
.pb-gu-contact{display:grid;grid-template-columns:1fr 1fr;gap:32px;max-width:640px;margin:0 auto;text-align:left}
.pb-gu-contact address{font-style:normal}
.pb-gu-contact p{margin-bottom:8px}
.pb-gu-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-gu-hours td{padding:7px 0;border-bottom:1px dotted var(--pb-line);font-size:13px}
.pb-gu-hours td:first-child{text-transform:uppercase;letter-spacing:.06em;color:var(--pb-muted);font-size:11px}
.pb-gu-hours td:last-child{text-align:right}
.pb-gu-cta-card p{max-width:46ch;margin:0 auto 22px;color:var(--pb-muted)}
.pb-gusto a[href^="tel:"],.pb-gusto a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-gusto a[href^="tel:"]:hover,.pb-gusto a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-gu-footer{padding:32px;font-size:12px;color:var(--pb-muted);border-top:1px solid var(--pb-line);text-align:center}
.pb-gu-footer a{border-bottom:1px solid var(--pb-line)}
.pb-gu-footer a:hover,.pb-gu-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(max-width:720px){.pb-gu-plate{display:none}.pb-gu-nav{gap:16px}.pb-gu-contact{grid-template-columns:1fr}.pb-gu-frame{margin:8px}}
`;

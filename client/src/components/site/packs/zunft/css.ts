export const ZUNFT_CSS = `
.pb-zunft{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-zunft a{color:inherit;text-decoration:none}
.pb-zf-borde{border-bottom:1px solid var(--pb-accent-2);padding:9px 0;color:var(--pb-accent-2);font-size:9px;letter-spacing:.9em;text-align:center;overflow:hidden;white-space:nowrap}
.pb-zf-nav{position:sticky;top:0;z-index:40;background:var(--pb-canvas);border-bottom:1px solid var(--pb-line);display:flex;align-items:center;justify-content:center;gap:24px;padding:22px 24px;flex-wrap:wrap}
.pb-zf-nav-links{display:flex;align-items:center;gap:20px;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--pb-muted);flex-wrap:wrap}
.pb-zf-nav-links a{transition:color .15s}
.pb-zf-nav-links a:hover,.pb-zf-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-zf-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-zf-logo{font-family:var(--pb-font-display);font-weight:600;font-size:17px;color:var(--pb-accent);letter-spacing:.03em;padding:0 10px}
.pb-zf-rule2{width:180px;height:5px;margin:22px auto 0;border-top:1px solid var(--pb-ink);border-bottom:1px solid var(--pb-ink)}
.pb-zf-hero{padding:52px 32px 60px;text-align:center;overflow:visible}
.pb-zf-headline{position:relative;z-index:0;display:inline-block;font-family:var(--pb-font-display);font-weight:500;font-size:var(--pb-hero-size);line-height:1.08;margin-top:18px;max-width:16ch}
.pb-zf-headline em{font-style:italic;color:var(--pb-accent)}
.pb-zf-stamp{position:absolute;right:-96px;top:-34px;width:84px;height:84px;border-radius:50%;border:2px solid var(--pb-accent);color:var(--pb-accent);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--pb-font-body);font-weight:500;font-size:9px;letter-spacing:.16em;text-transform:uppercase;line-height:1.5;transform:rotate(12deg);opacity:.85;z-index:-1}
@media(max-width:640px){.pb-zf-stamp{display:none}}
.pb-zf-sub{margin:14px auto 0;max-width:46ch;color:var(--pb-muted);font-size:14px}
.pb-zf-tafel-preview{max-width:360px;margin:26px auto 0;text-align:left}
.pb-zf-tafel{display:flex;align-items:baseline;gap:8px;padding:5px 0;font-size:13px}
.pb-zf-tafel i{flex:1;border-bottom:1px dotted var(--pb-accent-2);font-style:normal}
.pb-zf-price{color:var(--pb-accent-2);font-weight:600;font-size:13px;white-space:nowrap}
.pb-zunft a.pb-zf-cta{display:inline-block;margin-top:26px;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:13px 30px;font-weight:700;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;transition:opacity .15s}
.pb-zf-cta:hover,.pb-zf-cta:focus-visible{opacity:.85}
.pb-zf-section{padding:60px 32px;border-top:1px solid var(--pb-line);text-align:center}
.pb-zf-section h2{font-family:var(--pb-font-display);font-weight:600;font-style:italic;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:28px}
.pb-zf-intro{color:var(--pb-muted);margin:0 auto 28px;max-width:46ch}
.pb-zf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;text-align:left}
.pb-zf-card{background:var(--pb-surface);padding:24px;border:1px solid var(--pb-line)}
.pb-zf-card strong{display:block;font-family:var(--pb-font-display);font-weight:600;margin-bottom:8px;font-size:15px}
.pb-zf-card p{color:var(--pb-muted);font-size:14px}
.pb-zf-about{max-width:680px;margin:0 auto;text-align:left}
.pb-zf-about img{width:100%;max-width:680px;aspect-ratio:3/2;object-fit:cover;border:1px solid var(--pb-line);margin:0 auto 26px;display:block}
.pb-zf-about p{color:var(--pb-ink);max-width:56ch;margin:0 auto}
.pb-zf-tafel-category{max-width:520px;margin:0 auto 34px;text-align:left}
.pb-zf-tafel-category h3{font-family:var(--pb-font-display);font-style:italic;font-weight:600;font-size:15px;color:var(--pb-accent);margin-bottom:12px;text-align:center}
.pb-zf-tafel-item{margin-bottom:6px}
.pb-zf-tafel-item p{margin:2px 0 0;color:var(--pb-muted);font-size:13px}
.pb-zf-quote{max-width:52ch;margin:0 auto 26px;padding:0 0 0 18px;border-left:2px solid var(--pb-accent);text-align:left}
.pb-zf-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:16px}
.pb-zf-quote footer{margin-top:10px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--pb-muted)}
.pb-zf-faq{max-width:56ch;margin:0 auto 20px;text-align:left;border-bottom:1px solid var(--pb-line);padding-bottom:18px}
.pb-zf-faq strong{display:block;font-family:var(--pb-font-display);font-weight:600;margin-bottom:6px}
.pb-zf-faq p{color:var(--pb-muted);font-size:14px}
.pb-zf-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.pb-zf-gallery img{width:100%;height:220px;object-fit:cover;border:1px solid var(--pb-line);display:block}
.pb-zf-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px;text-align:left}
.pb-zf-member img{width:100%;height:200px;object-fit:cover;border:1px solid var(--pb-line);margin-bottom:12px}
.pb-zf-member strong{display:block;font-weight:600}
.pb-zf-member p{color:var(--pb-muted);font-size:13px}
.pb-zf-contact{display:grid;grid-template-columns:1fr 1fr;gap:32px;max-width:640px;margin:0 auto;text-align:left;align-items:start}
.pb-zf-contact address{font-style:normal}
.pb-zf-contact p{margin-bottom:8px}
.pb-zf-hours-block{max-width:380px}
.pb-zf-hours-block h3{font-family:var(--pb-font-display);font-style:italic;font-weight:600;font-size:15px;color:var(--pb-accent);margin-bottom:8px;text-align:left}
.pb-zf-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-zf-hours td{padding:7px 0;border-bottom:1px dotted var(--pb-accent-2);font-size:13px}
.pb-zf-hours tr:last-child td{border-bottom:none}
.pb-zf-hours td:first-child{text-transform:uppercase;letter-spacing:.06em;color:var(--pb-muted);font-size:11px}
.pb-zf-hours td:last-child{text-align:right}
.pb-zf-cta-card p{max-width:46ch;margin:0 auto 22px;color:var(--pb-muted)}
.pb-zunft a[href^="tel:"],.pb-zunft a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-zunft a[href^="tel:"]:hover,.pb-zunft a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-zf-footer{padding:32px;font-size:12px;color:var(--pb-muted);border-top:1px solid var(--pb-line);text-align:center}
.pb-zf-footer a{border-bottom:1px solid var(--pb-line)}
.pb-zf-footer a:hover,.pb-zf-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(max-width:720px){.pb-zf-nav{gap:8px 14px;padding:16px 18px}.pb-zf-logo{order:-1;flex-basis:100%;text-align:center}.pb-zf-nav-links{display:contents}.pb-zf-nav-links a{font-size:10px}.pb-zf-contact{grid-template-columns:1fr}}
.pb-zf-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-zf-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-zf-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

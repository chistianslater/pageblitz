export const SCHIMMER_CSS = `
.pb-schimmer{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip;position:relative}
.pb-schimmer a{color:inherit;text-decoration:none}
.pb-sc-nav{position:sticky;top:12px;z-index:40;display:flex;align-items:center;gap:18px;background:var(--pb-surface);border-radius:999px;box-shadow:0 2px 10px rgba(139,108,232,.08);padding:14px 24px;margin:16px 20px 0;font-size:13px;font-weight:500}
.pb-sc-logo{font-family:var(--pb-font-display);font-weight:600;font-size:15px;letter-spacing:.03em}
.pb-sc-nav-links{display:flex;align-items:center;gap:20px;margin-left:auto;flex-wrap:wrap}
.pb-sc-nav-links a{transition:color .15s}
.pb-sc-nav-links a:hover,.pb-sc-nav-links a:focus-visible{color:var(--pb-accent-text)}
.pb-sc-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-sc-hero{position:relative;z-index:1;padding:64px 24px 80px;overflow:visible}
.pb-sc-hero-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:44px;align-items:center;max-width:1200px}
/* Ohne Hero-Bild (hero.imageUrl optional) darf die rechte 5fr-Spalte nicht
   leer bleiben (Review-Fund W1): einziges Kind → Glaskarte über beide
   Spalten, begrenzte Breite. */
.pb-sc-hero-grid>.pb-sc-glass:only-child{grid-column:1/-1;max-width:640px}
.pb-sc-orbs{position:absolute;z-index:0;pointer-events:none}
.pb-sc-orbs-tr{top:-64px;right:-80px}
.pb-sc-orbs-bl{bottom:-56px;left:-80px}
.pb-sc-orb{position:absolute;top:50%;left:50%;border-radius:50%;transform:translate(-50%,-50%)}
.pb-sc-orb-1{width:380px;height:380px;background:#F6DFE9}
.pb-sc-orb-2{width:270px;height:270px;background:#EFD3F2}
.pb-sc-orb-3{width:160px;height:160px;background:#E7C8F5}
.pb-sc-ring{position:absolute;z-index:1;right:10%;bottom:44px;width:130px;height:130px;border-radius:50%;border:1px solid var(--pb-accent-2)}
.pb-sc-hero-img{position:relative;z-index:2;max-width:420px;justify-self:end;width:100%}
.pb-sc-hero-img img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:200px 200px 40px 200px;display:block;box-shadow:0 18px 44px rgba(139,108,232,.16)}
.pb-sc-hero-img .pb-sc-ring{right:auto;left:-30px;bottom:-24px;z-index:-1}
.pb-sc-hero-img .pb-sc-chip{right:-10px;top:26px}
.pb-sc-chip{position:absolute;z-index:3;right:7%;top:90px;background:rgba(255,255,255,.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.9);border-radius:999px;padding:9px 18px;font-size:12px;color:var(--pb-muted);transform:rotate(3deg)}
.pb-sc-glass{position:relative;z-index:2;max-width:620px;background:rgba(255,255,255,.55);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.9);border-radius:var(--pb-radius-card);padding:36px 34px 38px;box-shadow:0 18px 44px rgba(139,108,232,.14)}
.pb-sc-glass h1{font-family:var(--pb-font-display);font-weight:300;font-size:var(--pb-hero-size);letter-spacing:-.01em;line-height:1.08;max-width:14ch}
.pb-sc-glass h1 em{font-style:normal;font-weight:600;color:var(--pb-accent-text)}
.pb-sc-glass p{margin-top:16px;max-width:44ch;color:var(--pb-muted);font-size:15px}
.pb-sc-cta-row{display:flex;gap:14px;margin-top:26px;flex-wrap:wrap}
.pb-schimmer a.pb-sc-cta{display:inline-block;background:var(--pb-accent);color:var(--pb-ink);padding:14px 30px;border-radius:var(--pb-radius-button);font-weight:600;font-size:14px;transition:opacity .15s}
.pb-sc-cta:hover,.pb-sc-cta:focus-visible{opacity:.85}
.pb-schimmer a.pb-sc-ghost{display:inline-block;border:1px solid var(--pb-line);color:var(--pb-muted);padding:13px 28px;border-radius:var(--pb-radius-button);font-weight:500;font-size:13px;transition:border-color .15s,color .15s}
.pb-sc-ghost:hover,.pb-sc-ghost:focus-visible{border-color:var(--pb-accent);color:var(--pb-accent-text)}
.pb-sc-section{position:relative;z-index:1;padding:56px 24px}
.pb-sc-section h2{font-family:var(--pb-font-display);font-weight:600;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:24px;letter-spacing:-.01em}
.pb-sc-intro{color:var(--pb-muted);margin-bottom:24px;max-width:56ch}
.pb-sc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}
.pb-sc-card{background:var(--pb-surface);border-radius:var(--pb-radius-card);padding:24px;box-shadow:0 2px 14px rgba(139,108,232,.07);display:flex;flex-direction:column}
.pb-sc-card strong{display:block;font-weight:600;margin-bottom:8px;font-size:15px}
.pb-sc-card p{color:var(--pb-muted);font-size:14px}
.pb-sc-price{display:inline-block;margin-top:auto;padding-top:10px;color:var(--pb-accent-text);font-weight:700;font-size:13px}
.pb-sc-about{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:44px;align-items:center}
.pb-sc-about>p:only-child{grid-column:1/-1;max-width:64ch}
.pb-sc-about-img{width:100%;border-radius:var(--pb-radius-card);display:block;object-fit:cover;aspect-ratio:4/3;order:2}
.pb-sc-about p{max-width:60ch;color:var(--pb-ink)}
.pb-sc-quote{padding:24px}
.pb-sc-quote p{font-size:15px;margin-bottom:12px}
.pb-sc-quote footer{font-size:12px;color:var(--pb-muted)}
.pb-sc-faq strong{display:block;font-weight:600;margin-bottom:8px}
.pb-sc-gallery img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:var(--pb-radius-card);display:block}
.pb-sc-gallery img:only-child{aspect-ratio:12/5}
.pb-sc-member{text-align:center}
.pb-sc-member img{width:100%;height:180px;object-fit:cover;border-radius:var(--pb-radius-card);margin-bottom:12px}
.pb-sc-member strong{display:block;font-weight:600}
.pb-sc-member p{color:var(--pb-muted);font-size:13px}
.pb-sc-contact{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.pb-sc-contact address{font-style:normal}
.pb-sc-contact p{margin-bottom:10px}
.pb-sc-hours-block{max-width:380px}
.pb-sc-hours-block h3{font-family:var(--pb-font-display);font-weight:600;font-size:14px;letter-spacing:.02em;color:var(--pb-accent-text);margin-bottom:8px}
.pb-sc-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-sc-hours td{padding:8px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-sc-hours tr:last-child td{border-bottom:none}
.pb-sc-hours td:last-child{text-align:right}
.pb-sc-cta-card{text-align:center}
.pb-sc-menu-category{margin-bottom:24px}
.pb-sc-menu-category h3{font-family:var(--pb-font-display);font-size:13px;letter-spacing:.03em;color:var(--pb-accent-text);margin-bottom:12px}
.pb-schimmer a[href^="tel:"],.pb-schimmer a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-schimmer a[href^="tel:"]:hover,.pb-schimmer a[href^="mailto:"]:hover{color:var(--pb-accent-text);border-color:var(--pb-accent)}
.pb-sc-footer{position:relative;z-index:1;padding:32px 24px;font-size:12px;color:var(--pb-muted);border-top:1px solid var(--pb-line)}
.pb-sc-footer a{border-bottom:1px solid var(--pb-line)}
.pb-sc-footer a:hover,.pb-sc-footer a:focus-visible{color:var(--pb-accent-text);border-color:var(--pb-accent)}
@media(max-width:720px){.pb-sc-chip{display:none}.pb-sc-hero{padding:40px 20px 48px}.pb-sc-ring{display:none}.pb-sc-orb-1{width:220px;height:220px}.pb-sc-orb-2{width:160px;height:160px}.pb-sc-orb-3{width:96px;height:96px}.pb-sc-orbs-tr{top:-40px;right:-60px}.pb-sc-orbs-bl{bottom:-36px;left:-60px}.pb-sc-glass{max-width:100%;padding:28px 22px 30px}.pb-sc-hero-grid{grid-template-columns:1fr;gap:24px}.pb-sc-hero-img{max-width:100%;justify-self:stretch}.pb-sc-hero-img img{aspect-ratio:3/2;max-height:60vw}.pb-sc-contact{grid-template-columns:1fr}.pb-sc-nav{border-radius:20px}.pb-sc-nav-links{display:none}.pb-sc-about{grid-template-columns:1fr;gap:20px}.pb-sc-about-img{order:-1;max-height:55vw}}
.pb-sc-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-sc-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-sc-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

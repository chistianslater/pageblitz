export const MORGENLICHT_CSS = `
.pb-morgenlicht{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.6;overflow-x:clip}
.pb-morgenlicht a{color:inherit;text-decoration:none}
.pb-ml-nav{display:flex;align-items:center;gap:18px;background:var(--pb-surface);border-radius:999px;box-shadow:0 2px 10px rgba(28,60,56,.06);padding:14px 22px;margin:16px 20px 0;position:sticky;top:12px;z-index:30;font-size:13px;font-weight:600}
.pb-ml-logo{color:var(--pb-accent);font-weight:800;font-family:var(--pb-font-display);font-size:14px}
.pb-ml-nav-links{display:flex;align-items:center;gap:18px;margin-left:auto;flex-wrap:wrap}
.pb-ml-nav-links a{transition:color .15s}
.pb-ml-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-ml-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-morgenlicht a.pb-ml-nav-cta{background:var(--pb-accent);color:var(--pb-accent-contrast);border-radius:var(--pb-radius-button);padding:8px 18px;font-size:12px;font-weight:700;transition:opacity .15s;flex-shrink:0}
.pb-ml-nav-cta:focus-visible{opacity:.85}
.pb-ml-hero{position:relative;padding:56px 24px 48px;overflow:hidden}
.pb-ml-blob{position:absolute;right:24px;top:50px;width:46%;height:300px;border-radius:58% 42% 55% 45%/55% 48% 52% 45%;background:linear-gradient(160deg,var(--pb-line),var(--pb-accent) 70%);object-fit:cover;z-index:1}
.pb-ml-hero h1{position:relative;z-index:2;font-family:var(--pb-font-display);font-weight:800;font-size:var(--pb-hero-size);letter-spacing:-.02em;line-height:1.08;max-width:15ch}
.pb-ml-hero h1 em{font-style:normal;color:var(--pb-accent)}
.pb-ml-hero p{position:relative;z-index:2;margin-top:16px;max-width:42ch;color:var(--pb-muted);font-size:15px}
.pb-morgenlicht a.pb-ml-cta{position:relative;z-index:2;display:inline-block;margin-top:24px;background:var(--pb-accent);color:var(--pb-accent-contrast);padding:14px 28px;border-radius:var(--pb-radius-button);font-weight:700;font-size:14px;transition:opacity .15s}
.pb-ml-cta:focus-visible{opacity:.85}
.pb-ml-float{position:absolute;z-index:2;background:var(--pb-surface);border-radius:16px;padding:14px 18px;font-size:12px;color:var(--pb-muted);box-shadow:0 8px 24px rgba(28,60,56,.14)}
.pb-ml-float b{display:block;color:var(--pb-ink);font-size:13px;margin-bottom:2px}
.pb-ml-float.f1{right:16%;top:110px;transform:rotate(3deg)}
.pb-ml-float.f2{right:64px;top:230px;transform:rotate(-2deg)}
.pb-ml-wave{display:block;width:100%;height:30px}
.pb-ml-band{background:var(--pb-line);padding:16px 24px 20px;display:flex;gap:14px;flex-wrap:wrap}
.pb-ml-chip{background:var(--pb-surface);color:var(--pb-accent);border-radius:999px;padding:8px 16px;font-size:12.5px;font-weight:600}
.pb-ml-section{padding:56px 24px}
.pb-ml-section h2{font-family:var(--pb-font-display);font-weight:800;font-size:clamp(1.5rem,2.6vw,2.1rem);margin-bottom:24px;letter-spacing:-.01em}
.pb-ml-intro{color:var(--pb-muted);margin-bottom:24px;max-width:56ch}
.pb-ml-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}
.pb-ml-card{background:var(--pb-surface);border-radius:var(--pb-radius-card);padding:22px;box-shadow:0 2px 10px rgba(28,60,56,.05);display:flex;flex-direction:column;align-items:flex-start}
.pb-ml-card strong{display:block;font-weight:600;margin-bottom:8px;font-size:15px}
.pb-ml-card p{color:var(--pb-muted);font-size:14px}
.pb-ml-price{display:inline-block;margin-top:auto;padding-top:12px;color:var(--pb-accent-text);font-weight:700;font-size:13px}
.pb-ml-about{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:44px;align-items:center}
.pb-ml-about>p:only-child{grid-column:1/-1;max-width:64ch}
.pb-ml-about-img{width:100%;border-radius:var(--pb-radius-card);display:block;object-fit:cover;aspect-ratio:4/3}
.pb-ml-about p{max-width:60ch;color:var(--pb-ink)}
.pb-ml-quote{padding:22px}
.pb-ml-quote p{font-size:15px;margin-bottom:12px}
.pb-ml-quote footer{font-size:12px;color:var(--pb-muted)}
.pb-ml-faq strong{display:block;font-weight:600;margin-bottom:8px}
.pb-ml-gallery img{width:100%;height:200px;object-fit:cover;border-radius:var(--pb-radius-card);display:block}
.pb-ml-member{text-align:center}
.pb-ml-member img{width:100%;height:180px;object-fit:cover;border-radius:var(--pb-radius-card);margin-bottom:12px}
.pb-ml-member strong{display:block;font-weight:600}
.pb-ml-member p{color:var(--pb-muted);font-size:13px}
.pb-ml-contact{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.pb-ml-contact address{font-style:normal}
.pb-ml-contact p{margin-bottom:10px}
.pb-ml-hours-block{max-width:380px}
.pb-ml-hours-block h3{font-family:var(--pb-font-display);font-weight:800;font-size:13px;letter-spacing:.03em;color:var(--pb-accent-text);margin-bottom:8px}
.pb-ml-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-ml-hours td{padding:8px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-ml-hours tr:last-child td{border-bottom:none}
.pb-ml-hours td:last-child{text-align:right}
.pb-ml-menu-category{margin-bottom:24px}
.pb-ml-menu-category h3{font-family:var(--pb-font-display);font-size:13px;letter-spacing:.03em;color:var(--pb-accent);margin-bottom:12px}
.pb-ml-cta-card{text-align:center;align-items:center}
.pb-morgenlicht a[href^="tel:"],.pb-morgenlicht a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:border-color .15s,color .15s}
.pb-morgenlicht a[href^="tel:"]:focus-visible,.pb-morgenlicht a[href^="mailto:"]:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-ml-footer{padding:32px 24px;font-size:12px;color:var(--pb-muted);border-top:1px solid var(--pb-line)}
.pb-ml-footer a{border-bottom:1px solid var(--pb-line)}
.pb-ml-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-ml-practice-dock{position:sticky;top:82px;z-index:28;margin:10px 20px 0 auto;width:fit-content;max-width:calc(100% - 40px);display:flex;align-items:center;gap:14px;padding:8px 9px 8px 16px;background:var(--pb-surface);border:1px solid var(--pb-line);border-radius:999px;box-shadow:0 5px 18px rgba(28,60,56,.1);font-size:12px;color:var(--pb-muted)}
.pb-ml-practice-dock a{padding:8px 14px;border-radius:999px;background:var(--pb-accent);color:var(--pb-accent-contrast);font-weight:700;white-space:nowrap}
.pb-ml-section,.pb-ml-hero{scroll-margin-top:138px}
@media(hover:hover) and (pointer:fine){.pb-ml-nav-links a:hover{color:var(--pb-accent)}.pb-ml-nav-cta:hover,.pb-ml-cta:hover{opacity:.85}.pb-morgenlicht a[href^="tel:"]:hover,.pb-morgenlicht a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}.pb-ml-footer a:hover{color:var(--pb-accent);border-color:var(--pb-accent)}.pb-ml-practice-dock a:hover{opacity:.85}}
@media(prefers-reduced-motion:no-preference){.pb-ml-blob{animation:pb-ml-focus 1.8s cubic-bezier(.2,.7,.25,1) both}.pb-ml-hero h1,.pb-ml-hero>p,.pb-ml-hero>.pb-ml-cta{animation:pb-ml-breathe-in .8s .25s ease-out both}.pb-ml-float{animation:pb-ml-badge-focus .7s .65s ease-out both}}
@keyframes pb-ml-focus{from{transform:scale(.965);opacity:.35}55%{transform:scale(1.012);opacity:1}to{transform:none;opacity:1}}
@keyframes pb-ml-breathe-in{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
@keyframes pb-ml-badge-focus{from{opacity:0}to{opacity:1}}
@media(max-width:840px){.pb-ml-nav{border-radius:20px}.pb-ml-nav-links,.pb-ml-nav-cta{display:none}.pb-morgenlicht .pb-mnav{display:block;position:relative;margin-left:auto;flex-shrink:0}.pb-morgenlicht .pb-mnav-toggle{box-sizing:border-box;list-style:none;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:1px solid var(--pb-line);border-radius:var(--pb-radius-button);background:var(--pb-canvas);color:var(--pb-ink)}.pb-morgenlicht .pb-mnav-toggle::-webkit-details-marker{display:none}.pb-morgenlicht .pb-mnav-icon{display:flex;flex-direction:column;gap:5px;width:20px}.pb-morgenlicht .pb-mnav-icon span{display:block;height:2px;background:currentColor}.pb-morgenlicht .pb-mnav[open] .pb-mnav-icon span:nth-child(1){transform:translateY(7px) rotate(45deg)}.pb-morgenlicht .pb-mnav[open] .pb-mnav-icon span:nth-child(2){opacity:0}.pb-morgenlicht .pb-mnav[open] .pb-mnav-icon span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}.pb-morgenlicht .pb-mnav-panel{position:absolute;top:calc(100% + 8px);right:0;z-index:80;display:flex;flex-direction:column;min-width:min(264px,84vw);padding:6px;background:var(--pb-canvas);border:1px solid var(--pb-line)}.pb-morgenlicht .pb-mnav-panel a{display:flex;align-items:center;min-height:44px;padding:8px 14px;font-size:17px}.pb-ml-practice-dock{top:86px;margin-inline:20px;max-width:calc(100% - 40px);box-sizing:border-box}.pb-ml-practice-dock span{min-width:0;overflow-wrap:anywhere}.pb-ml-section,.pb-ml-hero{scroll-margin-top:145px}.pb-ml-hero{display:flex;flex-direction:column;align-items:flex-start;padding-top:40px;padding-bottom:32px;overflow:visible}.pb-ml-blob{position:static;order:10;width:100%;height:auto;aspect-ratio:16/9;border-radius:24px;margin-top:24px}.pb-ml-float{display:block;position:static;order:11;width:100%;max-width:100%;box-sizing:border-box;transform:none!important;margin-top:10px;box-shadow:none;border:1px solid var(--pb-line);overflow-wrap:anywhere}.pb-ml-contact{grid-template-columns:1fr}.pb-ml-about{grid-template-columns:1fr;gap:20px}.pb-ml-about-img{order:-1;max-height:55vw}}
@media(prefers-reduced-motion:reduce){.pb-morgenlicht *,.pb-morgenlicht *::before,.pb-morgenlicht *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
.pb-ml-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-ml-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-ml-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

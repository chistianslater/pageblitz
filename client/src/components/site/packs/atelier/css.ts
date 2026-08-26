export const ATELIER_CSS = `
.pb-atelier{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-atelier a{color:inherit;text-decoration:none}
.pb-at-nav{position:sticky;top:0;z-index:40;background:var(--pb-canvas);display:flex;align-items:center;justify-content:flex-end;gap:18px;padding:14px 28px;font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid var(--pb-line)}
.pb-at-nav-links{display:flex;flex-wrap:wrap;gap:18px}
.pb-at-nav-links a{transition:color .15s}
.pb-at-nav-links a:hover,.pb-at-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-at-nav-links a[aria-current="page"]{text-decoration:underline;text-decoration-color:var(--pb-accent);text-underline-offset:4px}
.pb-at-masthead-wrap{padding:20px 28px 0}
.pb-at-masthead{font-family:var(--pb-font-display);font-size:clamp(2.1rem,8vw,4.75rem);line-height:.95;letter-spacing:-.01em;border-bottom:3px solid var(--pb-line);padding-bottom:12px;word-break:break-word}
.pb-at-masthead .dot{color:var(--pb-accent);font-weight:400}
.pb-at-meta{display:flex;justify-content:space-between;gap:14px;font-family:var(--pb-font-utility);font-size:11px;color:var(--pb-muted);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--pb-line);padding:10px 0;flex-wrap:wrap}
.pb-at-cover{display:grid;grid-template-columns:1.5fr 1fr;gap:0;border-bottom:3px solid var(--pb-line)}
.pb-at-img{position:relative;min-height:280px;background:var(--pb-ink);border-right:1px solid var(--pb-line);overflow:hidden}
.pb-at-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.pb-at-caption{position:absolute;left:0;bottom:24px;margin:0;max-width:min(80%,18ch);background:var(--pb-ink);color:var(--pb-canvas);padding:12px 20px;font-family:var(--pb-font-display);font-style:italic;font-size:clamp(1.75rem,2.6vw,1.8rem);line-height:1.15}
.pb-at-capcol{padding:22px 24px 26px 24px;display:flex;flex-direction:column;gap:16px}
.pb-at-idx{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.04em;color:var(--pb-accent);text-transform:uppercase}
.pb-at-capcol p{font-size:13px;color:var(--pb-muted);line-height:1.6}
.pb-at-lnk{font-family:var(--pb-font-utility);font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;border-bottom:2px solid var(--pb-ink);align-self:flex-start;padding-bottom:2px;margin-top:auto;transition:color .15s,border-color .15s}
.pb-at-lnk:hover,.pb-at-lnk:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-atelier a[href^="tel:"],.pb-atelier a[href^="mailto:"]{color:var(--pb-ink);border-bottom:1px solid var(--pb-line);padding-bottom:1px;transition:color .15s,border-color .15s}
.pb-atelier a[href^="tel:"]:hover,.pb-atelier a[href^="mailto:"]:hover{color:var(--pb-accent);border-color:var(--pb-accent)}
.pb-at-section{padding:64px 28px;border-top:3px solid var(--pb-line)}
.pb-at-section h2{font-family:var(--pb-font-display);font-weight:400;letter-spacing:-.01em;font-size:clamp(1.7rem,3.2vw,2.6rem);margin-bottom:28px}
.pb-at-service{display:flex;gap:20px;padding:18px 0;border-bottom:1px solid var(--pb-line);align-items:baseline}
.pb-at-service .idx{font-family:var(--pb-font-utility);color:var(--pb-accent);font-size:12px;flex-shrink:0}
.pb-at-service strong{font-weight:500;font-family:var(--pb-font-display);font-size:18px}
.pb-at-service p{margin-top:4px;font-size:13.5px;color:var(--pb-muted);max-width:56ch}
.pb-at-service span.price{margin-left:auto;font-family:var(--pb-font-utility);font-size:12px;color:var(--pb-muted);flex-shrink:0;padding-left:12px}
.pb-at-about-img{width:100%;max-width:420px;aspect-ratio:4/3;object-fit:cover;border:1px solid var(--pb-line);display:block;margin-bottom:24px}
.pb-at-about p{max-width:64ch}
.pb-at-about-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:44px;align-items:center}
.pb-at-about-grid>p:only-child{grid-column:1/-1}
.pb-at-about-grid .pb-at-about-img{max-width:100%;aspect-ratio:3/2;margin-bottom:0}
.pb-at-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2px;background:var(--pb-line);border:1px solid var(--pb-line)}
.pb-at-gallery:has(img:only-child){max-width:980px}
.pb-at-gallery img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;background:var(--pb-canvas)}
.pb-at-quote{padding:22px 0 22px 22px;border-left:3px solid var(--pb-accent);margin-bottom:24px}
.pb-at-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:19px;max-width:52ch}
.pb-at-quote footer{margin-top:12px;font-family:var(--pb-font-utility);font-size:11px;color:var(--pb-muted);text-transform:uppercase;letter-spacing:.03em}
.pb-at-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
.pb-at-contact address{font-style:normal}
.pb-at-contact p{margin-bottom:8px}
.pb-at-hours-block{max-width:380px}
.pb-at-hours-block h3{font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--pb-accent);margin-bottom:8px}
.pb-at-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-at-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-at-hours tr:last-child td{border-bottom:none}
.pb-at-hours td:first-child{font-family:var(--pb-font-utility);text-transform:uppercase;letter-spacing:.04em;color:var(--pb-muted)}
.pb-at-hours td:last-child{text-align:right}
.pb-at-footer{border-top:3px solid var(--pb-ink);padding:32px 28px;font-size:12px;color:var(--pb-muted);font-family:var(--pb-font-utility)}
.pb-at-footer a{border-bottom:1px solid var(--pb-line)}
.pb-at-footer a:hover,.pb-at-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
/* Design-System 2.0: Broadsheet-Rhythmus statt wiederholter Listen/Grids. */
.pb-at-section#leistungen{display:grid;grid-template-columns:minmax(180px,4fr) minmax(0,8fr);column-gap:clamp(32px,6vw,88px);align-items:start}
.pb-at-section#leistungen>h2{position:sticky;top:76px;grid-column:1;grid-row:1/span 20;margin:0;font-size:clamp(2.4rem,5vw,5.5rem);line-height:.92}
.pb-at-section#leistungen>.pb-at-service{grid-column:2}
.pb-at-section#leistungen>.pb-at-service .idx{font-size:clamp(1rem,2vw,1.45rem)}
.pb-at-section#ueber-uns{background:var(--pb-surface)}
.pb-at-section#ueber-uns>h2{max-width:8ch;font-size:clamp(2.8rem,6vw,6rem);line-height:.9}
.pb-at-about-grid p{font-size:clamp(1rem,1.5vw,1.25rem);line-height:1.75}
.pb-at-gallery{grid-template-columns:repeat(12,minmax(0,1fr));gap:3px}
.pb-at-gallery img:nth-child(6n+1){grid-column:span 8;aspect-ratio:16/10}
.pb-at-gallery img:nth-child(6n+2){grid-column:span 4;aspect-ratio:3/4}
.pb-at-gallery img:nth-child(6n+3){grid-column:span 5;aspect-ratio:4/5}
.pb-at-gallery img:nth-child(6n+4){grid-column:span 7;aspect-ratio:16/10}
.pb-at-gallery img:nth-child(6n+5){grid-column:span 7;aspect-ratio:16/10}
.pb-at-gallery img:nth-child(6n+6){grid-column:span 5;aspect-ratio:4/5}
@media(max-width:720px){.pb-at-nav-links{display:none}}
@media(max-width:720px){
  .pb-at-masthead-wrap{padding:16px 18px 0}
  .pb-at-masthead{font-size:clamp(2.7rem,15vw,4.6rem)}
  .pb-at-meta{flex-wrap:nowrap;gap:24px;overflow-x:auto;padding:10px 0;scrollbar-width:none}
  .pb-at-meta span{flex:0 0 auto}
  .pb-at-cover{grid-template-columns:1fr}
  .pb-at-img{min-height:65vw;border-right:0}
  .pb-at-caption{bottom:16px;max-width:85%;font-size:clamp(1.5rem,8vw,2.35rem)}
  .pb-at-capcol{padding:20px 18px 28px}
  .pb-at-section{padding:52px 18px}
  .pb-at-section#leistungen{display:block}
  .pb-at-section#leistungen>h2{position:static;margin-bottom:28px;font-size:clamp(2.7rem,14vw,4.5rem)}
  .pb-at-contact{grid-template-columns:1fr}
  .pb-at-about-grid{grid-template-columns:1fr;gap:20px}
  .pb-at-about-grid .pb-at-about-img{order:-1;max-height:55vw}
  .pb-at-section#ueber-uns>h2{font-size:clamp(2.8rem,15vw,4.8rem)}
  .pb-at-gallery{grid-template-columns:1fr 1fr}
  .pb-at-gallery img:nth-child(n){grid-column:auto;aspect-ratio:4/3}
  .pb-at-gallery img:first-child{grid-column:1/-1;aspect-ratio:16/10}
}
.pb-at-page-header{padding:64px 6vw 32px;border-bottom:1px solid var(--pb-line)}
.pb-at-page-header h1{font-family:var(--pb-font-display);font-size:clamp(2rem,4vw,3rem);line-height:1.05}
.pb-at-page-header p{margin-top:16px;max-width:60ch;color:var(--pb-muted);font-family:var(--pb-font-body)}
`;

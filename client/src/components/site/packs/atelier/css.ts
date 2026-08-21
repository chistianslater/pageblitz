export const ATELIER_CSS = `
.pb-atelier{background:var(--pb-canvas);color:var(--pb-ink);font-family:var(--pb-font-body);line-height:1.55;overflow-x:clip}
.pb-atelier a{color:inherit;text-decoration:none}
.pb-at-nav{display:flex;align-items:center;justify-content:flex-end;gap:18px;padding:14px 28px;font-family:var(--pb-font-utility);font-size:11px;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid var(--pb-line)}
.pb-at-nav-links{display:flex;flex-wrap:wrap;gap:18px}
.pb-at-nav-links a{transition:color .15s}
.pb-at-nav-links a:hover,.pb-at-nav-links a:focus-visible{color:var(--pb-accent)}
.pb-at-masthead-wrap{padding:20px 28px 0}
.pb-at-masthead{font-family:var(--pb-font-display);font-size:clamp(2.1rem,8vw,4.75rem);line-height:.95;letter-spacing:-.01em;border-bottom:3px solid var(--pb-line);padding-bottom:12px;word-break:break-word}
.pb-at-masthead .dot{color:var(--pb-accent);font-weight:400}
.pb-at-meta{display:flex;justify-content:space-between;gap:14px;font-family:var(--pb-font-utility);font-size:11px;color:var(--pb-muted);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--pb-line);padding:10px 0;flex-wrap:wrap}
.pb-at-cover{display:grid;grid-template-columns:1.5fr 1fr;gap:0;border-bottom:3px solid var(--pb-line)}
.pb-at-img{position:relative;min-height:280px;background:var(--pb-ink);border-right:1px solid var(--pb-line);overflow:hidden}
.pb-at-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.pb-at-caption{position:absolute;left:18px;bottom:16px;right:18px;margin:0;font-family:var(--pb-font-display);font-style:italic;font-size:clamp(1.4rem,3vw,2rem);color:var(--pb-accent-contrast);line-height:1.1;text-shadow:0 2px 12px rgba(0,0,0,.35)}
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
.pb-at-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:2px;background:var(--pb-line)}
.pb-at-gallery img{width:100%;height:240px;object-fit:cover;display:block;background:var(--pb-canvas)}
.pb-at-quote{padding:22px 0 22px 22px;border-left:3px solid var(--pb-accent);margin-bottom:24px}
.pb-at-quote p{font-family:var(--pb-font-display);font-style:italic;font-size:19px;max-width:52ch}
.pb-at-quote footer{margin-top:12px;font-family:var(--pb-font-utility);font-size:11px;color:var(--pb-muted);text-transform:uppercase;letter-spacing:.03em}
.pb-at-contact{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.pb-at-contact address{font-style:normal}
.pb-at-contact p{margin-bottom:8px}
.pb-at-hours{width:100%;border-collapse:collapse;margin-top:4px}
.pb-at-hours td{padding:6px 0;border-bottom:1px solid var(--pb-line);font-size:13px}
.pb-at-hours td:first-child{font-family:var(--pb-font-utility);text-transform:uppercase;letter-spacing:.04em;color:var(--pb-muted)}
.pb-at-hours td:last-child{text-align:right}
.pb-at-footer{border-top:3px solid var(--pb-ink);padding:32px 28px;font-size:12px;color:var(--pb-muted);font-family:var(--pb-font-utility)}
.pb-at-footer a{border-bottom:1px solid var(--pb-line)}
.pb-at-footer a:hover,.pb-at-footer a:focus-visible{color:var(--pb-accent);border-color:var(--pb-accent)}
@media(max-width:640px){
  .pb-at-meta{flex-direction:column;gap:6px}
  .pb-at-meta span:last-child{display:none}
  .pb-at-cover{grid-template-columns:1fr}
  .pb-at-img{min-height:220px}
  .pb-at-nav{justify-content:flex-start}
  .pb-at-contact{grid-template-columns:1fr}
}
`;

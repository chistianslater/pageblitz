/**
 * Gemeinsames Chrom für Google-Bewertungen — Sterne, Initialen, Quelle.
 * Packs färben über currentColor / --pb-accent nach; Layout bleibt pack-eigen.
 */
export const REVIEW_CHROME_CSS = `
/* UA-Default (1em 40px) — sonst schieben Review-Blockquotes die
   line-farbenen Hairline-Grids (morgenlicht/schimmer) zu Bändern auf. */
blockquote{margin:0}
[data-pb-readonly]{cursor:default;-webkit-user-select:text;user-select:text}
.pb-review-stars{display:inline-flex;align-items:center;gap:.08em;margin:0 0 .85em;line-height:1;letter-spacing:.04em;color:var(--pb-accent)}
.pb-review-star{font-size:.95em;opacity:.22}
.pb-review-star[data-on]{opacity:1}
.pb-review-byline{display:flex;align-items:center;gap:10px;min-width:0;text-align:left}
.pb-review-avatar{flex:none;display:grid;place-items:center;width:2.15em;height:2.15em;border-radius:50%;border:1px solid var(--pb-line);background:var(--pb-surface);color:var(--pb-ink);font-size:10px;font-weight:700;letter-spacing:.04em;line-height:1}
.pb-review-meta{display:flex;flex-direction:column;gap:2px;min-width:0}
.pb-review-meta b{font-weight:600;color:inherit}
.pb-review-source{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--pb-muted)}
`;

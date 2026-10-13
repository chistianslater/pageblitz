import { H_MIN, LINE, NAV, WIDE, step } from "./step";

/**
 * Abschnitte — F2-Übergangsfassung (Titel, Pastellkarten, schlichte Listen).
 * F3 ersetzt sie nach Systemblatt 7/8/11–18. Text auf Pastell immer in der
 * Tinte des Pastells.
 */
export const CONTENT_CSS = `
.pb-freundlich .fr-sec{position:relative;padding-top:var(--sys-space-section)}
.pb-freundlich .fr-sec--band{background:var(--sys-band);padding-bottom:var(--sys-space-section);margin-top:var(--sys-space-section)}
.pb-freundlich .fr-sec--band+.fr-sec--band{margin-top:0}
.pb-freundlich .fr-entry+.fr-sec--band{margin-top:0}
.pb-freundlich .fr-h2{${step("h2")};max-width:16ch;overflow-wrap:break-word;hyphens:auto}
.pb-freundlich .fr-h3{${step("h3")}}
.pb-freundlich .fr-intro{margin-top:var(--sys-space-s);color:var(--sys-muted);max-width:var(--sys-space-measure)}
.pb-freundlich .fr-body{max-width:var(--sys-space-measure)}
.pb-freundlich .fr-tint-1{--fr-cbg:var(--sys-tint-1-bg);--fr-cink:var(--sys-tint-1-ink);--fr-cmut:var(--sys-tint-1-muted);--fr-cedge:var(--sys-tint-1-edge)}
.pb-freundlich .fr-tint-2{--fr-cbg:var(--sys-tint-2-bg);--fr-cink:var(--sys-tint-2-ink);--fr-cmut:var(--sys-tint-2-muted);--fr-cedge:var(--sys-tint-2-edge)}
.pb-freundlich .fr-tint-3{--fr-cbg:var(--sys-tint-3-bg);--fr-cink:var(--sys-tint-3-ink);--fr-cmut:var(--sys-tint-3-muted);--fr-cedge:var(--sys-tint-3-edge)}
.pb-freundlich .fr-tint-4{--fr-cbg:var(--sys-tint-4-bg);--fr-cink:var(--sys-tint-4-ink);--fr-cmut:var(--sys-tint-4-muted);--fr-cedge:var(--sys-tint-4-edge)}
.pb-freundlich .fr-cards{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;gap:var(--sys-space-s);grid-template-columns:repeat(auto-fill,minmax(min(100%,calc(var(--sys-space-xl) * 4)),1fr))}
.pb-freundlich .fr-card{display:flex;flex-direction:column;gap:calc(var(--sys-space-s) * .75);padding:calc(var(--sys-space-s) * 1.25);border-radius:var(--sys-radius-m);background:var(--fr-cbg,var(--sys-surface));color:var(--fr-cink,var(--sys-ink));min-width:0;overflow-wrap:break-word}
.pb-freundlich .fr-card p{${step("small")};color:var(--fr-cmut,var(--sys-muted))}
.pb-freundlich .fr-price{${step("data")};align-self:flex-start;padding:calc(var(--sys-space-xs) * .75) calc(var(--sys-space-s) * .75);border-radius:var(--sys-radius-pill);background:var(--sys-surface);color:var(--sys-ink)}
.pb-freundlich .fr-avatar{display:grid;place-items:center;width:calc(var(--sys-space-xl) * .9);height:calc(var(--sys-space-xl) * .9);border-radius:var(--sys-radius-pill);background:var(--sys-surface);color:var(--sys-ink);box-shadow:inset 0 0 0 ${LINE} var(--fr-cedge,var(--sys-rule));${step("h3")}}
.pb-freundlich .fr-who{font-weight:600}
.pb-freundlich .fr-tile{display:grid;place-items:center;width:calc(var(--sys-space-l) * 1.15);height:calc(var(--sys-space-l) * 1.15);border-radius:var(--sys-radius-s);background:var(--fr-cbg,var(--sys-surface));color:var(--fr-cink,var(--sys-ink));
  box-shadow:inset 0 0 0 ${LINE} var(--fr-cedge,var(--sys-ink)),var(--sys-tile) var(--sys-tile) 0 var(--fr-cedge,var(--sys-ink));${step("mark")}}
.pb-freundlich .fr-steps{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;gap:var(--sys-space-l)}
.pb-freundlich .fr-steps li{display:grid;gap:var(--sys-space-xs);max-width:var(--sys-space-measure)}
.pb-freundlich .fr-steps p{color:var(--sys-muted)}
.pb-freundlich .fr-stats{display:grid;gap:var(--sys-space-m);margin-top:var(--sys-space-l);grid-template-columns:repeat(auto-fill,minmax(min(100%,calc(var(--sys-space-xl) * 3)),1fr))}
.pb-freundlich .fr-stats div{display:flex;flex-direction:column-reverse}
.pb-freundlich .fr-stats dd{${step("figure")};color:var(--sys-accent)}
.pb-freundlich .fr-stats dt{color:var(--sys-muted)}
.pb-freundlich .fr-about{display:grid;gap:var(--sys-space-l);margin-top:var(--sys-space-l)}
.pb-freundlich .fr-photo{border-radius:var(--sys-radius-m);overflow:hidden;aspect-ratio:4/3}
.pb-freundlich .fr-photo img,.pb-freundlich .fr-gallery img{width:100%;height:100%;object-fit:cover}
.pb-freundlich .fr-gallery{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:grid;gap:var(--sys-space-s);grid-template-columns:repeat(auto-fill,minmax(min(100%,calc(var(--sys-space-xl) * 3.5)),1fr))}
.pb-freundlich .fr-gallery li{border-radius:var(--sys-radius-m);overflow:hidden;aspect-ratio:1}
.pb-freundlich .fr-quote{${step("h3")};max-width:var(--sys-space-measure);margin-top:var(--sys-space-l)}
.pb-freundlich .fr-quote footer{${step("small")};color:var(--sys-muted);margin-top:var(--sys-space-s)}
.pb-freundlich .fr-partners{list-style:none;margin:var(--sys-space-l) 0 0;padding:0;display:flex;flex-wrap:wrap;gap:var(--sys-space-s) var(--sys-space-l)}
.pb-freundlich .fr-faq{display:grid;gap:var(--sys-space-xs);margin-top:var(--sys-space-l);max-width:calc(var(--sys-space-measure) * 1.4)}
.pb-freundlich .fr-faq details{background:var(--sys-surface);border-radius:var(--sys-radius-m);padding:0 calc(var(--sys-space-s) * 1.25)}
.pb-freundlich .fr-faq summary{${step("h3")};font-size:var(--sys-body-size);min-height:${H_MIN};display:flex;align-items:center;padding-block:var(--sys-space-s);cursor:pointer}
.pb-freundlich .fr-faq details p{padding-bottom:var(--sys-space-s);color:var(--sys-muted)}
.pb-freundlich .fr-priced{margin-top:var(--sys-space-l);max-width:calc(var(--sys-space-measure) * 1.4)}
.pb-freundlich .fr-priced ul{list-style:none;margin:var(--sys-space-s) 0 0;padding:0}
.pb-freundlich .fr-priced li{display:flex;justify-content:space-between;gap:var(--sys-space-s);padding-block:var(--sys-space-xs);border-bottom:1px solid var(--sys-rule)}
.pb-freundlich .fr-priced small{display:block;${step("small")};color:var(--sys-muted)}
.pb-freundlich .fr-priced b{${step("data")};white-space:nowrap}
.pb-freundlich .fr-visit{display:grid;gap:var(--sys-space-s);margin-top:var(--sys-space-l)}
.pb-freundlich .fr-hours{display:grid;gap:var(--sys-space-2xs)}
.pb-freundlich .fr-hours div{display:flex;justify-content:space-between;gap:var(--sys-space-s)}
.pb-freundlich .fr-hours dt{font-weight:600}
.pb-freundlich .fr-hours .fr-today{font-weight:600;text-decoration:underline;text-underline-offset:.3em}
.pb-freundlich .fr-ways{list-style:none;margin:0;padding:0;display:grid}
.pb-freundlich .fr-ways a{display:inline-flex;align-items:center;gap:var(--sys-space-xs);min-height:${H_MIN};overflow-wrap:anywhere}
.pb-freundlich .fr-form-title{${step("h3")};margin-top:var(--sys-space-xl)}
.pb-freundlich .fr-ctas--start{justify-content:flex-start}
@media (min-width:${WIDE}){
  .pb-freundlich .fr-about{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start}
  .pb-freundlich .fr-visit{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (min-width:${NAV}){
  .pb-freundlich .fr-steps{grid-template-columns:repeat(auto-fit,minmax(0,1fr))}
}
`;

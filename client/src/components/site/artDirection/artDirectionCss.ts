/** Revision-scoped: legacy pack CSS remains byte-for-byte available. */
export const ART_DIRECTION_CSS = `
.pb-site[data-pb-revision="2"]{--pb-art-grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath fill='%23888' opacity='.075' filter='url(%23n)' d='M0 0h180v180H0z'/%3E%3C/svg%3E");--pb-art-ease:cubic-bezier(.22,.68,.2,1)}
.pb-site[data-pb-revision="2"][data-pb-texture="paper"]>div[class^="pb-"],.pb-site[data-pb-revision="2"][data-pb-texture="linen"]>div[class^="pb-"]{background-image:var(--pb-art-grain)}
.pb-site[data-pb-revision="2"] :is(h1,h2,h3){overflow-wrap:anywhere;text-wrap:balance}
.pb-site[data-pb-revision="2"] section:not(#start) h2{font-size:clamp(2rem,4.8vw,4.8rem);line-height:1.12;letter-spacing:-.045em}
.pb-site[data-pb-revision="2"] section:not(#start){scroll-margin-top:100px}
.pb-site[data-pb-revision="2"] :is(a,button,summary):focus-visible{outline:2px solid var(--pb-accent-text,var(--pb-accent));outline-offset:5px}
.pb-site[data-pb-revision="2"] :is(a,button,summary){-webkit-tap-highlight-color:transparent}
.pb-site[data-pb-revision="2"] :is(input,textarea,select){font-size:max(16px,1em)}
.pb-site[data-pb-revision="2"] details summary{cursor:pointer;transition:color .2s}
.pb-site[data-pb-revision="2"] details[open]>:not(summary){animation:pb-art-detail .25s ease both}
.pb-site[data-pb-revision="2"] #ueber-uns [data-pb-slot="about-grid"]{column-gap:clamp(30px,7vw,110px)}
.pb-site[data-pb-revision="2"] #ueber-uns [data-pb-slot="about-grid"] p{max-width:55ch;line-height:1.7}
.pb-site[data-pb-revision="2"] #galerie [data-pb-slot="gallery-items"]{gap:clamp(18px,3vw,42px)}
.pb-site[data-pb-revision="2"] #bewertungen h2{max-width:22ch;hyphens:none;overflow-wrap:normal}
.pb-site[data-pb-revision="2"] #bewertungen div:has(>blockquote){background:transparent;border:0;padding:0;gap:24px}
.pb-site[data-pb-revision="2"] #bewertungen blockquote{overflow-wrap:anywhere;position:relative;display:flex;flex-direction:column;gap:20px;padding:clamp(22px,3vw,38px);margin:0;border:1px solid var(--pb-line);border-radius:3px;background:transparent;box-shadow:none}
.pb-site[data-pb-revision="2"] #bewertungen blockquote>p{font-family:var(--pb-font-body),"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;font-size:clamp(18px,1.5vw,22px);line-height:1.55;letter-spacing:-.015em;font-style:normal;font-synthesis:none;transform:none;margin:0;max-width:44ch;color:inherit}
.pb-site[data-pb-revision="2"] #bewertungen blockquote>footer{margin-top:auto;padding-top:16px;border-top:1px solid var(--pb-line);background:transparent;text-align:left}
.pb-site[data-pb-revision="2"] #bewertungen .pb-review-stars{font-size:12px;letter-spacing:3px;color:var(--pb-art-accent-text)}
.pb-site[data-pb-revision="2"] #bewertungen .pb-review-byline{display:flex;align-items:center;gap:12px;font-family:var(--pb-font-body);font-style:normal}
.pb-site[data-pb-revision="2"] #bewertungen .pb-review-avatar{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;font-size:12px;background:var(--pb-surface);color:var(--pb-ink);flex-shrink:0}
.pb-site[data-pb-revision="2"] #bewertungen .pb-review-meta{display:grid;gap:3px;font-size:13px;line-height:1.4}
.pb-site[data-pb-revision="2"] #bewertungen .pb-review-source{font-size:11px;opacity:.72}

.pb-site[data-pb-revision="2"] .pb-art-hero{position:relative;isolation:isolate;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:clamp(28px,5vw,75px);max-width:1600px;margin:0 auto;padding:clamp(30px,4vw,65px) 6.5% 70px;background:transparent;color:var(--pb-ink);overflow:hidden;box-sizing:border-box}
.pb-site[data-pb-revision="2"] .pb-art-copy{position:relative;z-index:2;min-width:0;padding:0;text-align:left}
.pb-site[data-pb-revision="2"] .pb-art-category{font:400 12px/1.5 var(--pb-font-body);color:var(--pb-muted);margin:0 0 28px;text-transform:none;letter-spacing:.02em}
.pb-site[data-pb-revision="2"] .pb-art-rating{display:inline-flex;align-items:baseline;gap:.4em;white-space:nowrap}
.pb-site[data-pb-revision="2"] .pb-art-rating-sep{margin:0 .6em;opacity:.6}
.pb-site[data-pb-revision="2"] .pb-art-rating-star{color:var(--pb-art-accent-text,var(--pb-accent))}
.pb-site[data-pb-revision="2"] .pb-art-rating b{font-weight:600;color:var(--pb-ink)}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-layout="banner"][data-art-image="yes"] .pb-art-rating :is(b,.pb-art-rating-star){color:#fff}
.pb-site[data-pb-revision="2"] .pb-art-copy h1{font-family:var(--pb-font-display);font-size:clamp(2.8rem,6.1vw,6.6rem);font-weight:var(--pb-art-weight,400);line-height:1.08;letter-spacing:-.055em;margin:0;max-width:16ch;color:var(--pb-ink);text-shadow:none;word-break:normal}
.pb-site[data-pb-revision="2"] .pb-art-copy h1[data-art-long="yes"]{font-size:clamp(2.1rem,4.4vw,4.7rem);max-width:23ch}
.pb-site[data-pb-revision="2"] .pb-art-intro{font:400 clamp(1rem,1.3vw,1.2rem)/1.65 var(--pb-font-body);color:var(--pb-muted);max-width:38ch;margin:26px 0 30px}
.pb-site[data-pb-revision="2"] .pb-art-cta{display:inline-flex;align-items:center;justify-content:space-between;gap:26px;padding:17px 23px;background:var(--pb-accent);color:var(--pb-accent-contrast);font:500 14px/1.4 var(--pb-font-body);border:1px solid var(--pb-accent);border-radius:var(--pb-radius-button,0);text-decoration:none;max-width:100%;overflow-wrap:anywhere;transition:transform .22s var(--pb-art-ease),box-shadow .22s var(--pb-art-ease)}
.pb-site[data-pb-revision="2"] .pb-art-cta svg{flex-shrink:0;transition:transform .22s var(--pb-art-ease)}
.pb-site[data-pb-revision="2"] .pb-art-media{margin:0;overflow:hidden;min-width:0;position:relative;width:100%;height:clamp(360px,43vw,620px);border:0;border-radius:0}
.pb-site[data-pb-revision="2"] .pb-art-media img{display:block;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;filter:none;transform:none;aspect-ratio:auto;transition:transform .8s var(--pb-art-ease)}
.pb-site[data-pb-revision="2"] .pb-art-secondary{position:absolute;left:40%;bottom:195px;width:19%;height:clamp(160px,18vw,250px);z-index:2;margin:0;border:8px solid var(--pb-canvas);overflow:hidden}
.pb-site[data-pb-revision="2"] .pb-art-secondary img{display:block;width:100%;height:100%;object-fit:cover}
.pb-site[data-pb-revision="2"] .pb-art-wordmark{grid-column:1/-1;font:400 clamp(3rem,10vw,10rem)/1.08 var(--pb-font-display);letter-spacing:-.065em;color:var(--pb-ink);overflow-wrap:anywhere;margin-top:-8px;pointer-events:none}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="portrait"]{grid-template-columns:1.1fr 1fr;gap:6%}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="portrait"] .pb-art-media{height:clamp(440px,48vw,680px)}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="portrait"][data-art-wordmark="no"] .pb-art-secondary{bottom:35px}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="panorama"]{display:block}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="panorama"] .pb-art-copy{display:grid;grid-template-columns:1.5fr 1fr;column-gap:8%;align-items:end;margin-bottom:40px}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="panorama"] .pb-art-category{grid-column:1/-1}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="panorama"] h1{grid-row:2/4}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="panorama"] .pb-art-intro{margin:0 0 22px}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="panorama"] .pb-art-cta{justify-self:start}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="panorama"] .pb-art-media{height:clamp(330px,42vw,600px)}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="statement"]{display:block;text-align:center;padding-top:55px}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="statement"] .pb-art-copy{text-align:center;max-width:1050px;margin:auto}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="statement"] h1{max-width:19ch;margin:auto;font-size:clamp(3rem,7.5vw,8rem)}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="statement"] .pb-art-intro{margin:25px auto}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="statement"] .pb-art-media{margin-top:40px;height:clamp(300px,38vw,520px)}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-image="no"]{padding-bottom:90px;min-height:390px}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-layout="banner"][data-art-image="yes"]{display:block;min-height:620px;background:#141414}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-layout="banner"][data-art-image="yes"] .pb-art-media{position:absolute;inset:0;height:100%;width:100%;border-radius:0}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-layout="banner"][data-art-image="yes"] .pb-art-media:after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.72)}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-layout="banner"][data-art-image="yes"] :is(h1,.pb-art-category,.pb-art-intro){color:#fff}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-layout="banner"] :is(.pb-art-secondary,.pb-art-wordmark){display:none}

.pb-site[data-pb-revision="2"] [class$="-nav-links"]{font-size:12px;letter-spacing:.035em}
.pb-site[data-pb-revision="2"] :is([class$="-logo"],[class$="-brand"]){white-space:normal;overflow-wrap:anywhere;max-width:min(45vw,420px)}
.pb-site[data-pb-revision="2"] [class$="-nav-links"] a{position:relative}
.pb-site[data-pb-revision="2"] [class$="-nav-links"] a:after{content:'';position:absolute;bottom:-5px;left:0;width:100%;height:1px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .22s var(--pb-art-ease)}
.pb-site[data-pb-revision="2"] [class$="-nav-links"] a:is(:hover,:focus-visible):after{transform:scaleX(1)}
/* Approved reference families, carried through the existing section renderers. */
.pb-site[data-pb-revision="2"].pb-raster{--pb-art-weight:500}.pb-site[data-pb-revision="2"] :is(.pb-ra-head .pb-ra-index,.pb-ra-figure figcaption,.pb-sn-frame,.pb-sn-booking,.pb-sn-vert,.pb-at-edition,.pb-kw-readout){display:none}
.pb-site[data-pb-revision="2"] .pb-ra-head{grid-template-columns:1fr}.pb-site[data-pb-revision="2"] .pb-ra-section{padding:90px 6.5%;border-color:var(--pb-line)}
.pb-site[data-pb-revision="2"] .pb-ra-about{align-items:center}.pb-site[data-pb-revision="2"] .pb-ra-services{margin-left:15%}
.pb-site[data-pb-revision="2"] .pb-gu-frame{border:0;padding:0}.pb-site[data-pb-revision="2"] .pb-gu-nav{margin:0 5%;border-bottom:1px solid var(--pb-line)}
.pb-site[data-pb-revision="2"] .pb-gu-section{padding:90px 6.5%}.pb-site[data-pb-revision="2"] .pb-gu-menu-category{border:1px solid var(--pb-line);padding:clamp(24px,4vw,55px);background:var(--pb-surface)}
.pb-site[data-pb-revision="2"] .pb-gu-menu-columns{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:35px!important}
.pb-site[data-pb-revision="2"] .pb-gu-menu{padding:8px 0;border:0}
.pb-site[data-pb-revision="2"] .pb-gu-menu-category>.pb-gu-index{display:none}
.pb-site[data-pb-revision="2"] .pb-sn-nav{border-bottom:1px solid var(--pb-line)}.pb-site[data-pb-revision="2"] .pb-sn-section{padding:90px 6.5%}.pb-site[data-pb-revision="2"] .pb-sn-about{gap:10%;align-items:center}
/* Each remaining family keeps a distinct frame, rhythm and image silhouette. */
.pb-site[data-pb-revision="2"].pb-werkbank{--pb-art-weight:700}.pb-site[data-pb-revision="2"].pb-werkbank .pb-art-media{border-left:8px solid var(--pb-accent)}
.pb-site[data-pb-revision="2"].pb-kanzlei .pb-art-media{border-radius:45% 45% 0 0}.pb-site[data-pb-revision="2"].pb-kanzlei .pb-art-copy h1{letter-spacing:-.04em}
.pb-site[data-pb-revision="2"].pb-morgenlicht .pb-art-media{border-radius:45% 45% 8px 8px}.pb-site[data-pb-revision="2"].pb-morgenlicht .pb-art-secondary{border-radius:50%}
.pb-site[data-pb-revision="2"].pb-patina .pb-art-media{border-radius:4px}.pb-site[data-pb-revision="2"].pb-patina .pb-art-copy h1{font-style:italic;line-height:1.15}
.pb-site[data-pb-revision="2"].pb-marktplatz .pb-art-media{border-radius:50px 10px 50px 10px}.pb-site[data-pb-revision="2"].pb-marktplatz{--pb-art-weight:700}
.pb-site[data-pb-revision="2"].pb-landgut .pb-art-media{border-radius:48% 48% 0 0}.pb-site[data-pb-revision="2"].pb-landgut #ueber-uns img{border-radius:4px}
.pb-site[data-pb-revision="2"].pb-atelier .pb-at-masthead-wrap{display:none}.pb-site[data-pb-revision="2"].pb-atelier .pb-art-media{filter:saturate(.75)}
.pb-site[data-pb-revision="2"].pb-klarwerk .pb-art-media{border:1px solid var(--pb-line);padding:8px;background:var(--pb-surface)}
.pb-site[data-pb-revision="2"].pb-verve{--pb-art-weight:700}.pb-site[data-pb-revision="2"].pb-verve .pb-art-wordmark{color:var(--pb-accent-text,var(--pb-accent))}
.pb-site[data-pb-revision="2"].pb-zunft .pb-art-media{outline:1px solid var(--pb-line);outline-offset:-12px}.pb-site[data-pb-revision="2"].pb-zunft .pb-art-copy h1{letter-spacing:-.035em}
.pb-site[data-pb-revision="2"].pb-schimmer .pb-art-media{border-radius:48% 48% 3px 3px}.pb-site[data-pb-revision="2"].pb-schimmer .pb-art-secondary{border-radius:45% 45% 0 0}
.pb-site[data-pb-revision="2"].pb-fundament{--pb-art-weight:500}.pb-site[data-pb-revision="2"].pb-fundament .pb-art-media{border-bottom:8px solid var(--pb-accent)}
.pb-site[data-pb-revision="2"].pb-karat .pb-art-media{border-radius:48% 48% 0 0;outline:1px solid var(--pb-line);outline-offset:-12px}
.pb-site[data-pb-revision="2"].pb-plakat{--pb-art-weight:700}.pb-site[data-pb-revision="2"].pb-plakat .pb-art-copy h1{letter-spacing:-.06em;text-transform:uppercase}
.pb-site[data-pb-revision="2"].pb-strom .pb-art-media{clip-path:polygon(0 0,92% 0,100% 8%,100% 100%,0 100%)}.pb-site[data-pb-revision="2"].pb-strom{--pb-art-weight:500}
.pb-site[data-pb-revision="2"].pb-riviera .pb-art-media{border-radius:50% 50% 0 0}.pb-site[data-pb-revision="2"].pb-riviera .pb-art-copy h1{letter-spacing:-.04em}
.pb-site[data-pb-revision="2"].pb-ernte .pb-art-media{border-radius:100px 8px 100px 8px}.pb-site[data-pb-revision="2"].pb-ernte .pb-art-wordmark{color:var(--pb-accent-text,var(--pb-accent))}
/* Text uses a contrast-safe accent across canvas and surface variants. */
.pb-site[data-pb-revision="2"] :is(.pb-at-section-head>span,.pb-at-portfolio figcaption b,.pb-at-folio,.pb-ka-num,.pb-ka-contact h3,.pb-rv-price,.pb-st-card-id,.pb-st-contact a,.pb-wb-quote-index){color:var(--pb-art-accent-text)}
.pb-site[data-pb-revision="2"] :is(.pb-mp-trial-cta a,.pb-mp-quote .pb-review-avatar,.pb-wb-image-frame>span){color:var(--pb-accent-contrast)}
.pb-site[data-pb-revision="2"] .pb-fd-contact-sticky a{background:var(--pb-accent);color:var(--pb-accent-contrast)}
.pb-site[data-pb-revision="2"] .pb-wb-material :is(h2,.pb-wb-cross){color:var(--pb-art-inverse-accent)}
.pb-site[data-pb-revision="2"] .pb-wb-contact-sheet{color:var(--pb-accent-contrast)}
.pb-site[data-pb-revision="2"] .pb-wb-contact-sheet :is(h2,h3,a,small,address,td,span){color:inherit!important}
.pb-site[data-pb-revision="2"] .pb-at-contact-page .pb-at-section-head>span{color:var(--pb-art-dark-accent)}
/* Decorative marks occupy their own line; body copy no longer inherits display sizing. */
.pb-site[data-pb-revision="2"] .pb-wb-about-copy{padding-top:0!important;min-width:0}
.pb-site[data-pb-revision="2"] .pb-wb-cross{position:static;display:block;line-height:1;margin-bottom:24px}
.pb-site[data-pb-revision="2"] .pb-wb-about-copy p{font-size:clamp(18px,1.6vw,24px);max-width:46ch;line-height:1.6}
.pb-site[data-pb-revision="2"] [data-pb-slot="about-grid"] > *{min-width:0}
.pb-site[data-pb-revision="2"] section :is(h2,h3){hyphens:auto}
.pb-site[data-pb-revision="2"] .pb-ra-head{text-align:left;justify-items:start}
.pb-site[data-pb-revision="2"] .pb-ra-head h2{margin-left:0}
.pb-site[data-pb-revision="2"] .pb-ra-services{margin-left:0}
.pb-site[data-pb-revision="2"] :is(.pb-kw-support,.pb-fu-contact-dock,.pb-ml-practice-dock,.pb-mp-trial-cta){position:relative;top:auto;margin-top:16px;margin-bottom:16px}
@media(hover:hover) and (pointer:fine){
.pb-site[data-pb-revision="2"] .pb-art-cta:hover{transform:translateY(-2px);box-shadow:0 5px 0 color-mix(in srgb,var(--pb-ink) 12%,transparent)}
.pb-site[data-pb-revision="2"] .pb-art-cta:hover svg{transform:translate(2px,-2px)}
.pb-site[data-pb-revision="2"] .pb-art-cta:active{transform:translateY(1px);box-shadow:none}
.pb-site[data-pb-revision="2"] .pb-art-media:hover img{transform:scale(1.025)}
.pb-site[data-pb-revision="2"] details summary:hover{color:var(--pb-accent-text,var(--pb-accent))}
}
@keyframes pb-art-detail{from{opacity:.5;transform:translateY(5px)}to{opacity:1;transform:none}}
@media(max-width:760px){
.pb-site[data-pb-revision="2"] .pb-gu-menu-columns{grid-template-columns:1fr!important}
.pb-site[data-pb-revision="2"] .pb-art-hero,.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition]{display:flex;flex-direction:column;align-items:stretch;gap:30px;padding:28px 6% 55px}
.pb-site[data-pb-revision="2"] .pb-art-copy h1,.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="statement"] h1{font-size:clamp(2.5rem,10vw,4rem);max-width:none}
.pb-site[data-pb-revision="2"] .pb-art-copy h1[data-art-long="yes"]{font-size:clamp(2rem,8vw,3rem)}
.pb-site[data-pb-revision="2"] .pb-art-category{margin-bottom:20px}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition] .pb-art-intro{margin:20px 0 24px;font-size:16px}
.pb-site[data-pb-revision="2"] .pb-art-media,.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition] .pb-art-media{height:360px;width:100%;margin:0}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-composition="panorama"] .pb-art-copy{display:block;margin:0}
.pb-site[data-pb-revision="2"] .pb-art-secondary{display:none}
.pb-site[data-pb-revision="2"] .pb-art-wordmark{font-size:clamp(2.5rem,12vw,5rem);margin:0}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-mobile="image-first"] .pb-art-media{order:-1}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-mobile="centered"] .pb-art-copy{text-align:center}
.pb-site[data-pb-revision="2"] .pb-art-hero[data-art-mobile="centered"] .pb-art-intro{margin-left:auto;margin-right:auto}
.pb-site[data-pb-revision="2"] :is(.pb-ra-section,.pb-gu-section,.pb-sn-section){padding:60px 6%}
.pb-site[data-pb-revision="2"] .pb-ra-services{margin-left:0}
.pb-site[data-pb-revision="2"] section:not(#start) h2{font-size:clamp(2rem,8vw,3rem)}
}
@media(prefers-reduced-motion:reduce){.pb-site[data-pb-revision="2"] :is(.pb-art-cta,.pb-art-cta svg,.pb-art-media img,details[open]>:not(summary)){animation:none!important;transition:none!important;transform:none!important}}
`;

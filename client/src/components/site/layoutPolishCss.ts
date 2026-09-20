/**
 * Geteilte Layout-Feinschliffe über alle 14 Packs (Stilvorlagen-Audit P7,
 * 2026-08-30) — hängt wie MOBILE_NAV_CSS/MOTION_CSS am Pack-CSS.
 *
 * P7: Eine Galerie mit genau EINEM Bild verwaist sonst in einer
 * Rasterspalte (Landgut/Marktplatz: 720px Bild in ~1300px Container).
 * Das einzelne Bild streckt sich über die volle Breite, gedeckelt in der
 * Höhe. Nur ohne explizite Galerie-Variante — Designprofile
 * (data-pb-gallery, z. B. filmstrip) behalten ihr eigenes Layout.
 */
export const LAYOUT_POLISH_CSS = `
.pb-site:not([data-pb-gallery]) [data-pb-slot="gallery-items"]>:only-child{grid-column:1/-1!important;width:100%!important;margin:0}
.pb-site:not([data-pb-gallery]) [data-pb-slot="gallery-items"]>img:only-child,
.pb-site:not([data-pb-gallery]) [data-pb-slot="gallery-items"]>:only-child img{width:100%!important;max-width:100%!important;aspect-ratio:auto!important;height:auto;max-height:min(60vh,30rem);object-fit:cover}
/* Kontakt-CTA direkt unter der Headline (Betreiber-Screenshot 2026-09-01,
   gusto: 4px Abstand): Mindestluft, wenn ein Link unmittelbar auf die
   Kontakt-Überschrift folgt. Packs mit Zwischeninhalt bleiben unberührt. */
.pb-site #kontakt :is(h1,h2)+a{display:inline-block;margin-top:18px}

/* Fehlendes Bild = volle Breite (2026-09-20, Betreiber-Befund „Text schwebt
   im Raum"): Blendet der Kunde das Foto aus, kollabiert das Über-uns-Raster
   bereits über data-pb-he. Fehlt das Foto dagegen im Dokument, blieb die
   zweite Spalte leer stehen — in allen 20 Richtungen, mit 600 bis 870 px
   ungenutzter Fläche. Alle Richtungen setzen dort ein <img>, deshalb greift
   :has(img) zuverlässig. */
.pb-site [data-pb-slot="about-grid"]:not(:has(img)){display:block;grid-template-columns:1fr}
.pb-site .pb-ra-about:not(:has(img)){margin-left:0}
`;

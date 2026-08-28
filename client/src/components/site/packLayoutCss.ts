/**
 * Packspezifische Feinjustierung der Sektionslayouts.
 *
 * Die generische Schicht in designProfileCss.ts setzt Komposition um.
 * Hier werden Pack-Eigenheiten entwaffnet, die Varianten sonst zerlegen:
 * absolute Overlay-Fotos, Clip-Paths, Schrägen, Prozess-Tabellen.
 *
 * `split` bleibt bewusst das Pack-Original. Nur `centered` und
 * `image-first` (und die Leistungs-/Galerie-Varianten) greifen hier.
 *
 * `rest` wird an jeden Komma-Zweig gehängt — sonst träfe bei Mobil
 * (zwei Selektoren) der Nachfahre nur den Fallback-Zweig.
 */

type Mode = "desktop" | "mobile";

function q(
  pack: string,
  attr: string,
  mobileAttr: string,
  variant: string,
  mode: Mode,
  rest = ""
): string {
  if (mode === "desktop") {
    return `.pb-site.pb-${pack}[${attr}="${variant}"]${rest}`;
  }
  return `.pb-site.pb-${pack}[${mobileAttr}="${variant}"]${rest},.pb-site.pb-${pack}:not([${mobileAttr}])[${attr}="${variant}"]${rest}`;
}

function hero(
  pack: string,
  variant: string,
  mode: Mode,
  rest = ""
): string {
  return q(pack, "data-pb-hero", "data-pb-hero-mobile", variant, mode, rest);
}

function start(pack: string, variant: string, mode: Mode, rest = ""): string {
  return hero(pack, variant, mode, ` #start${rest}`);
}

function both(pack: string, mode: Mode, rest = ""): string {
  return `${start(pack, "centered", mode, rest)},${start(pack, "image-first", mode, rest)}`;
}

function services(
  pack: string,
  variant: string,
  mode: Mode,
  rest = ""
): string {
  return q(
    pack,
    "data-pb-services",
    "data-pb-services-mobile",
    variant,
    mode,
    rest
  );
}

function about(pack: string, variant: string, mode: Mode, rest = ""): string {
  return q(pack, "data-pb-about", "data-pb-about-mobile", variant, mode, rest);
}

function gallery(
  pack: string,
  variant: string,
  mode: Mode,
  rest = ""
): string {
  return q(
    pack,
    "data-pb-gallery",
    "data-pb-gallery-mobile",
    variant,
    mode,
    rest
  );
}

function overlayHeroes(mode: Mode): string {
  const wb = "werkbank";
  const gu = "gusto";
  const fd = "fundament";
  const vv = "verve";
  const ml = "morgenlicht";

  return `
/* ── Werkbank: Absolut-Foto rechts → Stapel ── */
${both(wb, mode)}{display:flex!important;flex-direction:column!important;min-height:auto!important;overflow:visible!important;padding-bottom:clamp(2.5rem,6vw,4.5rem)!important}
${both(wb, mode, " .pb-wb-photo")}{position:relative!important;inset:auto!important;right:auto!important;top:auto!important;height:auto!important;max-height:min(36rem,70vh)!important;aspect-ratio:4/3!important;object-fit:cover!important;clip-path:none!important;border-left-width:10px!important;margin:0!important}
${start(wb, "centered", mode, " .pb-wb-photo")}{width:min(100%,42rem)!important;margin-inline:auto!important;order:2!important}
${start(wb, "image-first", mode, " .pb-wb-photo")}{width:100%!important;order:-1!important;margin-bottom:clamp(1.25rem,3vw,2rem)!important}
${start(wb, "centered", mode, " h1")},${start(wb, "centered", mode, " >p")}{margin-left:auto!important;margin-right:auto!important;text-align:center!important}
${start(wb, "centered", mode, " h1")}{max-width:14ch!important}
${start(wb, "centered", mode, " a.pb-wb-cta")}{margin-left:auto!important;margin-right:auto!important}

/* ── Gusto: Vollflächen-Overlay → Foto im Fluss, Shade weg ── */
${both(gu, mode)}{display:flex!important;flex-direction:column!important;min-height:auto!important;overflow:visible!important;grid-template-columns:1fr!important;align-items:stretch!important;justify-content:flex-start!important;background:var(--pb-canvas)!important}
${both(gu, mode, " .pb-gu-hero-media")}{position:relative!important;inset:auto!important;z-index:0!important;height:auto!important;overflow:hidden!important}
${start(gu, "centered", mode, " .pb-gu-hero-media")}{order:2!important;width:min(100%,46rem)!important;margin-inline:auto!important}
${start(gu, "image-first", mode, " .pb-gu-hero-media")}{order:-1!important;width:100%!important}
${both(gu, mode, " .pb-gu-hero-media img")}{height:auto!important;max-height:min(36rem,70vh)!important;aspect-ratio:16/10!important;animation:none!important;filter:brightness(.92) saturate(.96)!important;transform:none!important}
${both(gu, mode, " .pb-gu-hero-shade")}{display:none!important}
${both(gu, mode, " .pb-gu-hero-copy")}{padding:clamp(2rem,5vw,4.5rem) 0!important;max-width:46rem;position:relative!important;align-self:stretch}
${start(gu, "centered", mode, " .pb-gu-hero-copy")}{margin-inline:auto!important;text-align:center!important}
${start(gu, "centered", mode, " .pb-gu-hero-copy h1")},${start(gu, "centered", mode, " .pb-gu-subline")},${start(gu, "centered", mode, " .pb-gu-eyebrow")}{margin-left:auto!important;margin-right:auto!important}
${both(gu, mode, " .pb-gu-menu-preview")}{display:none!important}

/* ── Fundament: drei Absolut-Ebenen → Stapel ── */
${both(fd, mode)}{display:flex!important;flex-direction:column!important;min-height:auto!important;overflow:visible!important}
${both(fd, mode, " .pb-fd-content")}{position:relative!important;inset:auto!important;left:auto!important;top:auto!important;padding:clamp(2rem,5vw,4rem) 0!important;z-index:1!important;max-width:46rem}
${start(fd, "centered", mode, " .pb-fd-content")}{margin-inline:auto!important;text-align:center!important}
${both(fd, mode, " .pb-fd-photo")}{position:relative!important;inset:auto!important;left:auto!important;top:auto!important;height:auto!important;aspect-ratio:4/3!important;object-fit:cover!important;z-index:1!important;animation:none!important;transform:none!important}
${start(fd, "centered", mode, " .pb-fd-photo")}{width:min(100%,28rem)!important;margin-inline:auto!important;order:2!important}
${start(fd, "image-first", mode, " .pb-fd-photo")}{width:100%!important;order:-1!important;margin-bottom:clamp(1.25rem,3vw,2rem)!important}
${both(fd, mode, " .pb-fd-panel")}{position:relative!important;inset:auto!important;right:auto!important;width:100%!important;height:auto!important;padding:1.5rem 1.25rem!important;order:3!important;animation:none!important}
${both(fd, mode, " .pb-fd-stats")}{position:relative!important;inset:auto!important;right:auto!important;bottom:auto!important;width:100%!important}

/* ── Verve: schräges Overlay-Panel ── */
${both(vv, mode)}{display:flex!important;flex-direction:column!important;overflow:visible!important;min-height:auto!important}
${both(vv, mode, " .pb-vv-panel")}{position:relative!important;inset:auto!important;right:auto!important;top:auto!important;height:auto!important;aspect-ratio:4/5!important;object-fit:cover!important;transform:none!important;z-index:0!important}
${start(vv, "centered", mode, " .pb-vv-panel")}{width:min(100%,28rem)!important;margin-inline:auto!important;order:2!important}
${start(vv, "image-first", mode, " .pb-vv-panel")}{width:100%!important;order:-1!important;margin-bottom:clamp(1.25rem,3vw,2rem)!important}
${both(vv, mode, " .pb-vv-copy")}{max-width:46rem!important;position:relative!important;z-index:1!important}
${start(vv, "centered", mode, " .pb-vv-copy")}{margin-inline:auto!important;text-align:center!important}
${both(vv, mode, " .pb-vv-ghost")}{display:none!important}
${both(vv, mode, " .pb-vv-tape")}{position:relative!important;right:auto!important;bottom:auto!important;transform:none!important;margin:1rem 0 0!important;align-self:flex-start;order:3!important}

/* ── Morgenlicht: Blob-Overlay + Verlauf ── */
${both(ml, mode)}{display:flex!important;flex-direction:column!important;min-height:auto!important;overflow:visible!important}
${both(ml, mode, " .pb-ml-blob")}{position:relative!important;inset:auto!important;z-index:0!important;height:auto!important;aspect-ratio:4/5!important;object-fit:cover!important;animation:none!important;transform:none!important}
${start(ml, "centered", mode, " .pb-ml-blob")}{width:min(100%,32rem)!important;margin-inline:auto!important;order:2!important;border-radius:clamp(48px,8vw,140px)!important}
${start(ml, "image-first", mode, " .pb-ml-blob")}{width:100%!important;order:-1!important;margin:0 0 clamp(1.25rem,3vw,2rem)!important;border-radius:0 0 clamp(48px,8vw,120px) 0!important}
${both(ml, mode, "::after")}{display:none!important}
${start(ml, "centered", mode, " h1")},${start(ml, "centered", mode, " >p")},${start(ml, "centered", mode, " a.pb-ml-cta")}{margin-left:auto!important;margin-right:auto!important;text-align:center!important}
${both(ml, mode, " .pb-ml-float")}{position:relative!important;inset:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;order:3!important;margin-top:.75rem!important;align-self:flex-start}
`;
}

function splitGridHeroes(mode: Mode): string {
  const pa = "patina";
  const sn = "salon-noir";
  const sc = "schimmer";
  const lg = "landgut";
  const at = "atelier";
  const zf = "zunft";
  const mp = "marktplatz";

  return `
/* ── Patina: Collage-Split ── */
${both(pa, mode, " .pb-pa-grid")}{grid-template-columns:1fr!important;justify-items:center!important}
${both(pa, mode, " .pb-pa-pics")}{width:min(100%,28rem)!important;height:auto!important;aspect-ratio:4/5!important}
${start(pa, "image-first", mode, " .pb-pa-pics")}{order:-1!important;width:100%!important}

/* ── Salon Noir: Portrait-Split, negative Headline ── */
${both(sn, mode, " .pb-sn-hero-inner")}{grid-template-columns:1fr!important;gap:clamp(1.5rem,4vw,2.75rem)!important}
${both(sn, mode, " h1")}{margin-right:0!important}
${both(sn, mode, " .pb-sn-photo")}{width:min(100%,28rem)!important;margin-inline:auto!important;aspect-ratio:3/4!important}
${start(sn, "image-first", mode, " .pb-sn-photo")}{order:-1!important;width:100%!important}

/* ── Lichtlabor / Schimmer ── */
${both(sc, mode, " .pb-sc-hero-grid")}{grid-template-columns:1fr!important;justify-items:center!important}
${both(sc, mode, " .pb-sc-hero-img")}{max-width:min(100%,32rem)!important;justify-self:center!important}
${start(sc, "image-first", mode, " .pb-sc-hero-img")}{order:-1!important;max-width:100%!important}
${both(sc, mode, " .pb-sc-hero-img img")}{height:auto!important;min-height:0!important;max-height:min(36rem,70vh)!important;aspect-ratio:4/5!important}
${both(sc, mode, " .pb-sc-aperture")}{display:none!important}

/* ── Landgut: Bogen-Reihen (Pack blendet sie mobil aus) ── */
${both(lg, mode, " .pb-lg-grid")}{grid-template-columns:1fr!important}
${both(lg, mode, " .pb-lg-rows")}{display:flex!important;height:auto!important;min-height:12rem!important;max-height:min(28rem,55vh)!important}
${start(lg, "image-first", mode, " .pb-lg-rows")}{order:-1!important}

/* ── Atelier: Headline sitzt als Caption im Bild ── */
${both(at, mode)}{display:flex!important;flex-direction:column!important;grid-template-columns:1fr!important;min-height:auto!important;margin-inline:0!important}
${both(at, mode, " .pb-at-img")}{display:contents!important;position:relative!important;min-height:0!important;height:auto!important;border-right:0!important}
${both(at, mode, " img")}{position:relative!important;inset:auto!important;height:auto!important;max-height:min(36rem,70vh)!important;width:100%!important;object-fit:cover!important}
${start(at, "centered", mode, " img")}{order:2!important;width:min(100%,42rem)!important;margin-inline:auto!important}
${start(at, "image-first", mode, " img")}{order:-1!important;width:100%!important}
${both(at, mode, " .pb-at-caption")}{position:relative!important;inset:auto!important;left:auto!important;bottom:auto!important;max-width:16ch!important;padding:clamp(1rem,3vw,1.75rem) 0 0!important;background:transparent!important;color:var(--pb-ink)!important;font-size:clamp(2rem,6vw,4.4rem)!important}
${start(at, "centered", mode, " .pb-at-caption")}{order:1!important;margin-inline:auto!important;text-align:center!important}
${start(at, "image-first", mode, " .pb-at-caption")}{order:1!important}
${both(at, mode, " .pb-at-capcol")}{padding:clamp(1.5rem,4vw,2.5rem) 0!important}
${start(at, "centered", mode, " .pb-at-capcol")}{order:1!important;margin-inline:auto!important;text-align:center!important;align-items:center!important}
${start(at, "image-first", mode, " .pb-at-capcol")}{order:2!important}

/* ── Zunft: Foto in Grid-Spalte 2, Copy ungeslottet ── */
${both(zf, mode)}{display:flex!important;flex-direction:column!important;grid-template-columns:1fr!important}
${both(zf, mode, " .pb-zf-hero-photo")}{grid-column:auto!important;grid-row:auto!important;width:min(100%,36rem)!important;height:auto!important;min-height:0!important;max-height:min(36rem,70vh)!important;object-fit:cover!important}
${start(zf, "centered", mode, " .pb-zf-hero-photo")}{margin-inline:auto!important;order:2!important}
${start(zf, "image-first", mode, " .pb-zf-hero-photo")}{width:100%!important;order:-1!important;margin-bottom:clamp(1.25rem,3vw,2rem)!important}
${start(zf, "centered", mode, " .pb-zf-headline")},${start(zf, "centered", mode, " .pb-zf-sub")},${start(zf, "centered", mode, " .pb-zf-cta")},${start(zf, "centered", mode, " .pb-zf-tafel-preview")}{margin-left:auto!important;margin-right:auto!important;text-align:center!important}
${both(zf, mode, " .pb-zf-stamp")}{position:relative!important;right:auto!important;top:auto!important;display:inline-flex!important;margin-top:.5rem}

/* ── Marktplatz: gedrehtes Foto + Sticker ── */
${both(mp, mode, " .pb-mp-hero-inner")}{display:flex!important;flex-direction:column!important;align-items:center!important;gap:clamp(1.5rem,4vw,2.5rem)!important}
${both(mp, mode, " .pb-mp-photo")}{transform:none!important;width:min(100%,28rem)!important}
${start(mp, "image-first", mode, ' [data-pb-slot="hero-media"]')}{order:-1!important;width:100%!important}
${both(mp, mode, " .pb-mp-sticker")}{position:relative!important;inset:auto!important;transform:none!important;margin:.35rem!important}
`;
}

function editorialHeroes(mode: Mode): string {
  return `
/* ── Kanzlei / Klarwerk: textbasiert, Varianten zentrieren nur ── */
${start("kanzlei", "centered", mode)},${start("klarwerk", "centered", mode)}{text-align:center!important}
${start("kanzlei", "centered", mode, " h1")},${start("kanzlei", "centered", mode, " p")},${start("klarwerk", "centered", mode, " h1")},${start("klarwerk", "centered", mode, " p")}{margin-left:auto!important;margin-right:auto!important}
${start("kanzlei", "image-first", mode)},${start("klarwerk", "image-first", mode)}{text-align:left!important}
`;
}

function servicesPacks(mode: Mode): string {
  const variants = ["list", "grid", "featured"] as const;
  const gustoOffset = variants
    .map(v => services("gusto", v, mode, " .pb-gu-service-list"))
    .join(",");
  const schimmerProtocol = variants
    .map(v => services("schimmer", v, mode, " .pb-sc-protocol"))
    .join(",");
  const schimmerP = variants
    .map(v => services("schimmer", v, mode, " .pb-sc-protocol p"))
    .join(",");
  const processShell = ["werkbank", "atelier", "schimmer"]
    .flatMap(pack =>
      variants.map(v =>
        services(
          pack,
          v,
          mode,
          " :is(.pb-wb-process,.pb-at-index-section,.pb-sc-services)"
        )
      )
    )
    .join(",");
  return `
${gustoOffset}{margin-left:0!important}
${schimmerProtocol}{grid-template-columns:auto minmax(0,1fr) auto!important}
${schimmerP}{grid-column:1/-1!important}
${processShell}{grid-template-columns:1fr!important}
${services("werkbank", "grid", mode, " .pb-wb-service")},${services("werkbank", "featured", mode, " .pb-wb-service")}{grid-template-columns:auto minmax(0,1fr)!important}
${services("atelier", "grid", mode, " .pb-at-service")},${services("atelier", "featured", mode, " .pb-at-service")}{grid-template-columns:auto minmax(0,1fr) auto!important}
${services("kanzlei", "grid", mode, " .pb-kz-services-grid")},${services("kanzlei", "featured", mode, " .pb-kz-services-grid")},${services("kanzlei", "list", mode, " .pb-kz-services-grid")}{grid-template-columns:1fr!important}
${services("fundament", "grid", mode, " .pb-fd-services-grid")},${services("fundament", "featured", mode, " .pb-fd-services-grid")},${services("fundament", "list", mode, " .pb-fd-services-grid")}{grid-template-columns:1fr!important}
`;
}

function aboutPacks(mode: Mode): string {
  const bothAbout = (pack: string, rest = "") =>
    `${about(pack, "image-left", mode, rest)},${about(pack, "image-right", mode, rest)}`;
  const orderPacks = [
    "werkbank",
    "atelier",
    "klarwerk",
    "fundament",
    "kanzlei",
  ];
  const forceOrder = orderPacks
    .map(
      pack =>
        `${about(pack, "image-left", mode, ' [data-pb-slot="about-media"]')}{order:-1!important}${about(pack, "image-right", mode, ' [data-pb-slot="about-media"]')}{order:2!important}`
    )
    .join("");
  return `
${bothAbout("zunft", " .pb-zf-about")}{max-width:none!important;margin:0!important;display:grid!important;align-items:center!important;text-align:left!important}
${bothAbout("zunft", " .pb-zf-about img")}{margin:0!important;width:100%!important;max-width:none!important}
${bothAbout("werkbank", " .pb-wb-about-copy")}{padding-top:0!important}
${forceOrder}
`;
}

function galleryPacks(mode: Mode): string {
  const g = (pack: string, variant: string, rest = "") =>
    gallery(pack, variant, mode, rest);
  const mosaicFirst = mode === "mobile" ? "auto" : "span 2";
  const stagger = ["verve", "morgenlicht", "salon-noir", "zunft", "schimmer"]
    .flatMap(pack =>
      (["grid", "mosaic", "filmstrip"] as const).map(v =>
        g(pack, v, ' [data-pb-slot="gallery-items"]>*')
      )
    )
    .join(",");
  return `
${g("werkbank", "grid", " .pb-wb-image-frame img")},${g("werkbank", "mosaic", " .pb-wb-image-frame img")}{aspect-ratio:4/3!important;height:100%!important;min-height:160px!important}
${g("werkbank", "filmstrip", " .pb-wb-image-frame img")}{height:clamp(200px,32vw,320px)!important;aspect-ratio:auto!important}
${g("gusto", "filmstrip", " .pb-gu-film")}{overflow-x:auto!important;overflow-y:hidden!important}
${g("gusto", "grid", " .pb-gu-gallery img")},${g("gusto", "mosaic", " .pb-gu-gallery img")}{height:clamp(180px,28vw,280px)!important}
${g("klarwerk", "grid", ' [data-pb-slot="gallery-items"] img')},${g("klarwerk", "mosaic", ' [data-pb-slot="gallery-items"] img')}{width:100%!important;object-fit:cover!important}
${g("atelier", "mosaic", ' [data-pb-slot="gallery-items"]>:first-child')}{grid-row:${mosaicFirst}!important}
${g("atelier", "grid", " .pb-at-gallery")},${g("atelier", "mosaic", " .pb-at-gallery")},${g("atelier", "filmstrip", " .pb-at-gallery")}{display:grid!important}
${stagger}{margin-top:0!important}
`;
}

export function packLayoutRules(mode: Mode): string {
  return `
${overlayHeroes(mode)}
${splitGridHeroes(mode)}
${editorialHeroes(mode)}
${servicesPacks(mode)}
${aboutPacks(mode)}
${galleryPacks(mode)}
`;
}

import {
  galleryIsStock,
  PhotoCredits,
  PHOTO_CREDITS_CSS,
} from "./PhotoCredits";
import { mountGalleryInteractions } from "./galleryInteractions";
import React, { useEffect, useRef } from "react";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";
import { SYSTEM_MODULES } from "./systems/registry";
import { SystemContext, type SystemState } from "./systems/SystemContext";
import { legacyPackVars } from "./systems/legacyVars";
import { getSystem } from "../../../../shared/designSystems/registry";
import { asSystemDoc } from "../../../../shared/designSystems/apply";
import { getPalette } from "../../../../shared/designSystems/palette";
import { systemCssVars } from "../../../../shared/designSystems/toCss";
import { blueprintFor } from "../../../../shared/blueprints/blueprints";
import { SiteIslands } from "./islands/SiteIslands";
import { RICH_TEXT_CSS } from "./richText";
import { NOTICE_CSS, NoticeBanner } from "./noticeBanner";
import { AGE_GATE_CSS, AgeGateSsr } from "./ageGateSsr";
import {
  ALBUM_CSS,
  albumChromeJson,
  flattenGalleryAlbums,
} from "./galleryAlbums";
import { mountDockAutoHide } from "./systems/shared/dockAutoHide";
import {
  buildNavItems,
  linkPageSections,
  pageContentSections,
  pageForPathname,
  visiblePageSections,
  withAboutFallbackImage,
  withGalleryLimit,
} from "./engine";

/**
 * Dezentes „Mit ♥ erstellt mit ⚡ Pageblitz"-Badge (Dashboard-Schalter
 * showBranding). Der siteEnhancer verschiebt es beim Laden IN den
 * Footer der Seite (Betreiber-Wunsch 2026-08-31: integriert statt
 * „runterhängend"); ohne JS bleibt es als schmale Zeile darunter.
 * color:inherit übernimmt die Footer-Textfarbe des jeweiligen Systems;
 * grid-column deckt Grid-Footer ab, in Flex/Block wirkungslos.
 */
const BRANDING_CSS = `
.pb-made-with{display:block;grid-column:1/-1;width:100%;padding:10px 20px 14px;text-align:center;font-family:var(--pb-font-body,system-ui,sans-serif);font-size:.72rem;letter-spacing:.02em;color:inherit;text-decoration:none;opacity:1}
.pb-made-with:hover{text-decoration:underline}
.pb-made-with strong{font-weight:700}
.pb-made-with svg{display:inline-block;width:.7em;height:.9em;vertical-align:-.08em;margin:0 .1em}
.pb-made-with .pb-mw-heart{margin:0 .1em}
`;

/**
 * Bewegung je Designsystem (rev 3), als eigenes Chunk nachgeladen. Spiegelt
 * `SYSTEMS_WITH_MOTION` (shared/designSystems/registry.ts) und das
 * Motion-Bundle (site-islands/motion.ts).
 */
type MountMotion = (root: HTMLElement) => () => void;
export const SYSTEM_MOTION: Partial<Record<string, () => Promise<MountMotion>>> = {
  journal: () =>
    import("./systems/journal/motion").then(m => m.mountJournalMotion),
  raster: () =>
    import("./systems/raster/motion").then(m => m.mountRasterMotion),
  werkstoff: () =>
    import("./systems/werkstoff/motion").then(m => m.mountWerkstoffMotion),
  plakat: () =>
    import("./systems/plakat/motion").then(m => m.mountPlakatMotion),
  klar: () =>
    import("./systems/klar/motion").then(m => m.mountKlarMotion),
  nacht: () =>
    import("./systems/nacht/motion").then(m => m.mountNachtMotion),
};

/** System-Variablen plus `--pb-*`-Aliase für geteilte Bausteine. */
function withLegacyVars(sys: Record<string, string>): Record<string, string> {
  return { ...sys, ...legacyPackVars(sys) };
}

/**
 * Styles einer Designsystem-Seite (rev 3): Modul-CSS plus nur die geteilten
 * Bausteine, die rev 3 tatsächlich nutzt — kein Pack-, Motion-, Layout-
 * oder rev-2-CSS.
 */
function systemStyles(
  moduleCss: string,
  opts: { album: boolean; ageGate: boolean; photoCredits: boolean }
): string {
  return [
    moduleCss,
    RICH_TEXT_CSS,
    NOTICE_CSS,
    BRANDING_CSS,
    opts.album ? ALBUM_CSS : "",
    opts.ageGate ? AGE_GATE_CSS : "",
    opts.photoCredits ? PHOTO_CREDITS_CSS : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const SiteRenderer: React.FC<{
  data: WebsiteDataV2;
  basePath?: string;
  now?: Date;
  /**
   * Slug der Kundenseite — geht an `SiteIslands` weiter (Formular-Action,
   * Hydration-Ziel). Optional, weil einige Aufrufer (CSR-Vorschauen)
   * keinen echten Slug haben; dann rendert `SiteIslands` mit leerem Slug.
   */
  slug?: string;
  /**
   * DB-Felder außerhalb des v2-Dokuments, die `SiteIslands` trotzdem braucht
   * (aktuell nur `chatWelcomeMessage` für die KI-Chat-Insel, siehe
   * `SiteIslands.tsx`). Wird 1:1 durchgereicht — `SiteRenderer` kennt den
   * Inhalt nicht, nur `renderSiteHtml` füllt es (Kundenseiten-SSR).
   */
  site?: {
    chatWelcomeMessage?: string | null;
    /**
     * Dashboard-Schalter „Pageblitz-Branding im Footer anzeigen"
     * (websites.showBranding, default true). Rendert ein dezentes
     * „Erstellt mit Pageblitz"-Badge unter der Seite — der bislang tote
     * Toggle wird hiermit erstmals im v2-Rendering wirksam (2026-08-31).
     */
    showBranding?: boolean;
    /**
     * FSK-18-Altersabfrage (websites.requiresAgeGate): rendert das
     * SSR-Overlay aus ageGateSsr.tsx VOR dem Seiteninhalt. Wird nur vom
     * Live-Kundenseiten-SSR gesetzt — Studio-/Dashboard-Vorschauen bleiben
     * gate-frei, damit das Bearbeiten nicht blockiert.
     */
    requiresAgeGate?: boolean;
  };
  /**
   * Reicht den Vorschau-Modus 1:1 an `SiteIslands` durch (siehe dort für die
   * Begründung) — `undefined` lässt `SiteIslands` bei seinem eigenen
   * Default "live" bleiben. `renderSiteHtml` (Kundenseiten-SSR) übergibt das
   * nie, `WebsiteRenderer` setzt es an den echten internen Vorschau-Stellen
   * (Dashboard, Editor, ...) explizit auf "preview".
   */
  islandsMode?: "live" | "preview";
  /**
   * Vorschau/Studio (2026-10-06): Platzhalter für fehlende Extras des
   * Branchen-Bauplans zeigen („Deine Preise", „Euer Team"). Live nie.
   */
  preview?: boolean;
  /**
   * Aktueller Pfad relativ zur Kundenseite ("/" für die Startseite,
   * "/<slug>" für eine Unterseite aus `data.pages`) — Plan B6, Task 3.
   * `undefined` verhält sich wie "/" (Startseite, unverändertes Verhalten
   * vor Task 3). Bestimmt, ob eine Unterseite statt der Startseite gerendert
   * wird und geht in `buildNavItems` ein (Anker-Präfix, `current`-Flag).
   */
  pathname?: string;
  /**
   * Rechtsseite im Rahmen des Designsystems: Kopf, Fuß, Schrift und
   * Palette wie die Seite, Inhalt aus dem legalGenerator.
   */
  legal?: { title: string; html: string };
}> = ({
  data,
  basePath = "",
  now = new Date(),
  slug = "",
  site,
  islandsMode,
  preview = false,
  pathname = "/",
  legal,
}) => {
  // Lesegrenze (Packs entfernen): jedes Dokument rendert als Designsystem
  // (rev 3). rev 3 bleibt dasselbe Objekt; alte Stände bekommen das
  // Hauptsystem ihrer Branche.
  data = asSystemDoc(data);
  // Fehlt dem Über-uns-Abschnitt das Foto, rückt ein Galeriebild nach —
  // sonst steht der Abschnitt halb leer (Betreiber-Befund 2026-09-20).
  data = withAboutFallbackImage(data);
  // Ohne gebuchte Galerie bleiben die ersten drei Fotos sichtbar. Systeme
  // mit „jedes Foto einmal" (freeGalleryBeyondShown) kürzen selbst
  // (claimPhotos): drei freie nach Einstieg, Angebotsfotos und Über uns.
  const systemDef = data.system ? getSystem(data.system) : undefined;
  if (systemDef?.freeGalleryBeyondShown !== true) data = withGalleryLimit(data);
  const mod = systemDef ? SYSTEM_MODULES[systemDef.id] : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const motionKey = JSON.stringify(data);
  useEffect(() => {
    if (rootRef.current) return mountGalleryInteractions(rootRef.current);
  }, [motionKey]);
  useEffect(() => {
    const load = systemDef ? SYSTEM_MOTION[systemDef.id] : undefined;
    if (!load || !rootRef.current) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const root = rootRef.current;
    load()
      .then(mount => {
        if (!cancelled) cleanup = mount(root);
      })
      .catch(() => {
        /* Seite bleibt ohne Bewegung vollständig lesbar. */
      });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [motionKey, systemDef?.id]);
  // Handy-Leiste: aus, solange dieselben Knöpfe in der Seite sichtbar sind.
  useEffect(() => {
    if (!systemDef || !rootRef.current) return;
    return mountDockAutoHide(rootRef.current);
  }, [motionKey, systemDef?.id]);
  if (!systemDef || !mod)
    throw new Error(`System-Modul nicht registriert: ${data.system}`);
  const vars = withLegacyVars(systemCssVars(systemDef, data.palette));
  // designProfile bleibt im Dokument (Studio-Schalter wie hiddenElements
  // lesen die Module über data.designProfile).
  const systemState: SystemState = {
    data,
    blueprint: blueprintFor(
      data.businessCategory,
      data.businessName,
      data.blueprintFamily
    ),
    preview,
    now,
    contactIsland: Boolean(slug) && Boolean(data.features?.contactForm),
  };
  const blueprintNav = systemState.blueprint?.navLabels;
  // Stockfotos nicht als „Referenzen" ausgeben (Betreiber 2026-10-07).
  const stockGallery = galleryIsStock(data);
  const navItems = buildNavItems(data, { pathname, basePath }).map(item =>
    item.sectionType === "gallery" && stockGallery
      ? { ...item, label: "Einblicke", fixedLabel: true }
      : blueprintNav && item.sectionType && blueprintNav[item.sectionType]
        ? {
            ...item,
            label: blueprintNav[item.sectionType]!,
            fixedLabel: true,
          }
        : item
  );
  const currentPage = pageForPathname(data, pathname);
  // Eine Unterseite rendert über dasselbe `mod.Page` wie die Startseite —
  // nur mit den Page-Sektionen anstelle der Startseiten-Sektionen (siehe
  // pageContentSections: dieselben Zod-Schemas, strukturell kompatibler
  // Cast). `pageHeader` rendert jedes System-Modul aus dem `sections`-Prop
  // selbst; ein generischer Fallback hier würde die Kopfzeile doppelt
  // rendern (zwei <h1>).
  //
  // Add-on-Gating (Plan B6 Task 6): `currentPage` ist nur gesetzt, wenn
  // `addOns.subpages` gebucht ist (pageForPathname → visiblePages); die
  // Page-Sektionen laufen durch dasselbe Gating wie die Startseite
  // (visiblePageSections: Galerie/Speisekarte/Preisliste ohne Add-on werden
  // auch auf Unterseiten nicht gerendert). Startseiten-Sektionen gatet
  // `orderedSections` (engine.ts) in jedem Modul selbst.
  // Kontakt/Galerie auf Unterseiten lesen die Startseite (linkPageSections)
  // — der Editor verspricht „übernimmt die Kontaktdaten"/„nutzt die
  // Galerie-Bilder", also darf die gespeicherte Kopie nie veralten.
  const pageSections = currentPage
    ? linkPageSections(data, visiblePageSections(data, currentPage))
    : undefined;
  const pageRenderData =
    currentPage && pageSections
      ? {
          ...data,
          sections: pageContentSections({
            ...currentPage,
            sections: pageSections,
          }),
          sectionOrder: undefined,
          hiddenSections: undefined,
        }
      : data;
  // Galerie-Alben (2026-08-30): Module bekommen die geflachte Bildliste;
  // die Zuordnung wandert als JSON-Tag zur Chip-Leiste des siteEnhancers.
  const albumJson = albumChromeJson(pageRenderData);
  const moduleRenderData = flattenGalleryAlbums(pageRenderData);
  return (
    <div
      ref={rootRef}
      className={`pb-site pb-${systemDef.id}`}
      style={
        (systemDef.scheme
          ? { ...vars, colorScheme: systemDef.scheme }
          : vars) as React.CSSProperties
      }
      data-pb-revision={data.designRevision}
      data-pb-system={systemDef.id}
      data-pb-palette={getPalette(systemDef, data.palette).id}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: systemStyles(mod.css, {
            album: Boolean(albumJson),
            ageGate: site?.requiresAgeGate === true,
            photoCredits: Boolean(data.photoCredits?.length),
          }),
        }}
      />
      {/* FSK-18-Overlay VOR allem Inhalt (fail-closed ohne JS); das
          Inline-Script der Komponente räumt es für bestätigte Besucher
          vor dem ersten Paint wieder weg. */}
      {site?.requiresAgeGate === true && (
        <AgeGateSsr slug={slug} businessName={data.businessName} />
      )}
      {albumJson && (
        <script
          type="application/json"
          data-pb-albums=""
          dangerouslySetInnerHTML={{ __html: albumJson }}
        />
      )}
      {/* Saison-/Aktionsbanner GANZ OBEN, über der Navigation — zentral
          statt im Sektionsfluss (siehe noticeBanner.tsx). Nur auf der
          Startseite; Unterseiten bleiben banner-frei. */}
      {!currentPage && !legal && <NoticeBanner data={data} />}
      <SystemContext.Provider value={systemState}>
        <mod.Page
          data={moduleRenderData}
          basePath={basePath}
          now={now}
          navItems={navItems}
          pageTitle={currentPage?.title}
          sections={pageSections}
          legal={legal}
        />
        {!legal && <PhotoCredits data={data} />}
      </SystemContext.Provider>
      {/* „Mit ♥ erstellt mit ⚡ Pageblitz" (Dashboard-Schalter, default an):
          der Backlink-Hebel jedes Baukastens — bewusst ohne nofollow. Der
          siteEnhancer hängt das Badge beim Laden in den Footer. */}
      {site?.showBranding === true && (
        <a className="pb-made-with" href="https://pageblitz.de">
          Mit{" "}
          <span className="pb-mw-heart" aria-hidden="true">
            ♥
          </span>{" "}
          erstellt mit{" "}
          <svg viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
            <path d="M6.2 0 0 8.1h3.4L2.6 14l6.9-8.6H5.8L6.2 0Z" />
          </svg>
          <strong>Pageblitz</strong>
        </a>
      )}
      <SiteIslands
        data={data}
        slug={slug}
        basePath={basePath}
        site={site}
        mode={islandsMode}
      />
    </div>
  );
};

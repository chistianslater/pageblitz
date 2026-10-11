import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich, stripMarks } from "../../richText";
import { useSystem } from "../SystemContext";
import type { SystemSection } from "../shared";
import { RasterEntry } from "./Entry";
import { RasterServices } from "./Bands";
import { RasterProcess } from "./Process";
import { RasterAbout, RasterGallery, RasterReviews } from "./Story";
import { RasterContact, RasterFaq } from "./Visit";
import {
  RasterCta,
  RasterMotto,
  RasterPartners,
  RasterStats,
  RasterStory,
  RasterUsp,
} from "./Extras";
import { RasterPriced, RasterTeam } from "./Offer";
import { chapterNumber, showsFigures, type RasterChapterKey } from "./offerData";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";

/** Startseiten- und Unterseiten-Abschnitte (inkl. pageHeader). */
export type RasterSection = SystemSection;

/** Props einer Abschnitts-Komponente: der Abschnitt und die sichtbare Liste. */
export type SectionProps<T extends RasterSection["type"]> = {
  section: Extract<RasterSection, { type: T }>;
  sections: readonly RasterSection[];
};

/**
 * Kapitelnummer nach Systemblatt: Der Einstieg trägt keine Nummer, der
 * erste Inhaltsabschnitt ist „01" (Colophon zählt die Inhalte). Gleiche
 * lückenlose Zählung wie `chapterIndex`, nur um eins verschoben; 0 für
 * nicht nummerierte Abschnitte.
 */
export function rasterChapterNo(
  sections: readonly RasterSection[],
  type: RasterChapterKey,
  figures = false
): number {
  return chapterNumber(sections, type, figures);
}

/**
 * Kapitelnummer im Render: Zeigt die Startseite die Zahlenzeile (echte
 * Google-Zahlen), zählt sie als Kapitel direkt nach den Leistungen.
 */
export function useChapterNo(
  sections: readonly RasterSection[],
  key: RasterChapterKey
): number {
  const { data } = useSystem();
  return rasterChapterNo(sections, key, showsFigures(sections, data.google));
}

/** Raster-Wortwahl der Kapitel-Labels (Systemblatt); Bauplan-Labels gewinnen. */
const CHAPTER_LABELS: Partial<Record<RasterSection["type"], string>> = {
  services: "Leistungen",
  process: "Ablauf",
  pricelist: "Preise",
  menu: "Speisekarte",
  team: "Team",
  about: "Über uns",
  gallery: "Einblicke",
  testimonials: "Stimme",
  faq: "Gut zu wissen",
  contact: "Zeiten und Kontakt",
  story: "Geschichte",
  usp: "Grundsätze",
  stats: "In Zahlen",
  partners: "Partner",
  quote: "Zitat",
  cta: "Anfrage",
};

export function chapterLabel(
  type: RasterSection["type"],
  blueprint: Blueprint
): string {
  const own = blueprint.navLabels?.[type as keyof typeof blueprint.navLabels];
  return own ?? CHAPTER_LABELS[type] ?? "";
}

const same = (a: string, b: string) =>
  stripMarks(a).trim().toLocaleLowerCase("de") ===
  stripMarks(b).trim().toLocaleLowerCase("de");

/**
 * Kapitel im Colophon-Raster: Haarlinie über die Inhaltsbreite, Label
 * („01 Über uns") oben links, Inhalt rechts (Desktop: Label Sp. 1–3, Text
 * Sp. 4–10, `full` bis Sp. 12); Handy gestapelt. Mit eigenem Titel ist der
 * Titel die h2 und das Label Kicker; ohne Titel trägt das Label die h2.
 */
export function RasterChapter({
  id,
  name,
  no,
  label,
  title,
  intro,
  full = false,
  className = "",
  after,
  children,
}: {
  id: string;
  name: string;
  no: number;
  label: string;
  title?: string;
  intro?: string;
  full?: boolean;
  /** Zusätzliche Klassen an der Section. */
  className?: string;
  /** Randlos nach dem Kapitelkopf (Bänder, Listen darunter). */
  after?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const headingId = `${id}-titel`;
  const ownTitle = Boolean(title && (!label || !same(label, title)));
  const number = no > 0 && (
    <span className="rs-no" aria-hidden="true">
      {String(no).padStart(2, "0")}
    </span>
  );
  return (
    <section
      id={id}
      className={`rs-sec rs-${name}${className ? ` ${className}` : ""}`}
      aria-labelledby={headingId}
    >
      <div className="rs-wrap rs-g12">
        {ownTitle ? (
          <p className="rs-lab">
            {number}
            {label && <span className="rs-lab-text">{label}</span>}
          </p>
        ) : (
          <h2 className="rs-lab" id={headingId}>
            {number}
            <span className="rs-lab-text">{label || title}</span>
          </h2>
        )}
        <div className={full ? "rs-body rs-body--full" : "rs-body"}>
          {ownTitle && (
            <h2 className="rs-title" id={headingId}>
              {rich(title!)}
            </h2>
          )}
          {intro && <p className="rs-intro">{rich(intro)}</p>}
          {children}
        </div>
      </div>
      {after}
    </section>
  );
}

/**
 * Kopf für Unterseiten und Rechtsseiten: Name als Kicker, genau ein h1.
 * Weitere pageHeader derselben Seite werden h2 ohne Anker.
 */
export function RasterPageHead({
  title,
  titleHtml,
  intro,
  secondary = false,
}: {
  title?: string;
  titleHtml?: string;
  intro?: string;
  secondary?: boolean;
}) {
  const { data } = useSystem();
  if (secondary) {
    return (
      <section className="rs-page-head">
        <div className="rs-wrap">
          <h2>{rich(title ?? "")}</h2>
          {intro && <p className="rs-page-intro">{rich(intro)}</p>}
        </div>
      </section>
    );
  }
  return (
    <section
      className="rs-page-head"
      id={SECTION_ANCHORS.pageHeader}
      aria-labelledby="seite-titel"
    >
      <div className="rs-wrap">
        <p className="rs-page-kicker">{data.businessName}</p>
        {titleHtml !== undefined ? (
          <h1
            id="seite-titel"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <h1 id="seite-titel">{rich(title ?? "")}</h1>
        )}
        {intro && <p className="rs-page-intro">{rich(intro)}</p>}
      </div>
    </section>
  );
}

const FIRST_H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i;

/**
 * Rechtsseite im Raster-Rahmen. Das erste h1 des Rechtstexts wird zum
 * Seitentitel gehoben (genau ein h1 je Seite).
 * SICHERHEIT: `html` stammt ausschließlich aus dem legalGenerator (siehe
 * renderLegalPage in server/ssr/renderSite.tsx), nie aus Nutzereingaben.
 */
export function RasterLegal({ title, html }: { title: string; html: string }) {
  const match = html.match(FIRST_H1);
  // Der Generator liefert ein eigenes <style> (body max-width, h2-Linien) —
  // es gälte sonst für die ganze Seite und bräche den Raster-Rahmen.
  const body = (match ? html.replace(FIRST_H1, "") : html).replace(
    /<style[\s\S]*?<\/style>/gi,
    ""
  );
  return (
    <>
      <RasterPageHead title={title} titleHtml={match?.[1]} />
      <article
        className="rs-wrap rs-legal"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}

/** Abschnitts-Weiche (exhaustiv über alle SectionV2-/PageSection-Typen). */
export function renderRasterSection(
  section: RasterSection,
  sections: readonly RasterSection[],
  /** Bandfotos aus claimPhotos (jedes Foto höchstens einmal je Seite). */
  bandPhotos?: readonly string[]
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <RasterEntry hero={section} />;
    case "services":
      return (
        <RasterServices
          section={section}
          sections={sections}
          bandPhotos={bandPhotos}
        />
      );
    case "process":
      return <RasterProcess section={section} sections={sections} />;
    case "pricelist":
    case "menu":
      return <RasterPriced section={section} sections={sections} />;
    case "team":
      return <RasterTeam section={section} sections={sections} />;
    case "about":
      return <RasterAbout section={section} sections={sections} />;
    case "gallery":
      return <RasterGallery section={section} sections={sections} />;
    case "testimonials":
      return <RasterReviews section={section} sections={sections} />;
    case "faq":
      return <RasterFaq section={section} sections={sections} />;
    case "contact":
      return <RasterContact section={section} sections={sections} />;
    case "story":
      return <RasterStory section={section} sections={sections} />;
    case "usp":
      return <RasterUsp section={section} sections={sections} />;
    case "stats":
      return <RasterStats section={section} sections={sections} />;
    case "quote":
      return <RasterMotto section={section} sections={sections} />;
    case "partners":
      return <RasterPartners section={section} sections={sections} />;
    case "cta":
      return <RasterCta section={section} sections={sections} />;
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <RasterPageHead
          title={section.title}
          intro={section.intro}
          secondary={sections.find(s => s.type === "pageHeader") !== section}
        />
      );
    case "notice":
      // Banner über dem Kopf, zentral in SiteRenderer (noticeBanner.tsx).
      return null;
    default: {
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}

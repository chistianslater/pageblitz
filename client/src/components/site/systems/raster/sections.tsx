import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich, stripMarks } from "../../richText";
import { useSystem } from "../SystemContext";
import { chapterIndex, type SystemSection } from "../shared";
import { RasterEntry } from "./Entry";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";

/** Startseiten- und Unterseiten-Abschnitte (inkl. pageHeader). */
export type RasterSection = SystemSection;

/**
 * Kapitelnummer nach Systemblatt: Der Einstieg trägt keine Nummer, der
 * erste Inhaltsabschnitt ist „01" (Colophon zählt die Inhalte). Gleiche
 * lückenlose Zählung wie `chapterIndex`, nur um eins verschoben; 0 für
 * nicht nummerierte Abschnitte.
 */
export function rasterChapterNo(
  sections: readonly RasterSection[],
  type: RasterSection["type"]
): number {
  return Math.max(0, chapterIndex(sections, type) - 1);
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
  testimonials: "Stimmen",
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
  children,
}: {
  id: string;
  name: string;
  no: number;
  label: string;
  title?: string;
  intro?: string;
  full?: boolean;
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
      className={`rs-sec rs-${name}`}
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
    </section>
  );
}

/** Überschrift und Einleitung eines Abschnitts, soweit vorhanden. */
function headOf(section: RasterSection): { title?: string; intro?: string } {
  const s = section as { headline?: unknown; title?: unknown; intro?: unknown };
  const title =
    typeof s.headline === "string"
      ? s.headline
      : typeof s.title === "string"
        ? s.title
        : undefined;
  return {
    title: title?.trim() || undefined,
    intro:
      typeof s.intro === "string" ? s.intro.trim() || undefined : undefined,
  };
}

/**
 * Vorläufiger, neutraler Abschnitt im Kapitel-Raster, bis R4–R6 die
 * eigentliche Gestalt liefern: Label, Titel, Einleitung — keine erfundenen
 * Inhalte, Anker aus SECTION_ANCHORS (Navigation und Insel greifen).
 */
export function RasterBlock({
  section,
  sections,
}: {
  section: Exclude<RasterSection, { type: "hero" | "pageHeader" | "notice" }>;
  sections: readonly RasterSection[];
}) {
  const { blueprint } = useSystem();
  const { title, intro } = headOf(section);
  return (
    <RasterChapter
      id={SECTION_ANCHORS[section.type]}
      name={section.type}
      no={rasterChapterNo(sections, section.type)}
      label={chapterLabel(section.type, blueprint)}
      title={title}
      intro={intro}
    />
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
  const body = match ? html.replace(FIRST_H1, "") : html;
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

/** Abschnitts-Weiche (exhaustiv; R3–R6 ersetzen die vorläufigen Blöcke). */
export function renderRasterSection(
  section: RasterSection,
  sections: readonly RasterSection[]
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <RasterEntry hero={section} />;
    case "services":
    case "process":
    case "pricelist":
    case "menu":
    case "team":
    case "about":
    case "gallery":
    case "testimonials":
    case "faq":
    case "contact":
    case "story":
    case "usp":
    case "stats":
    case "quote":
    case "partners":
    case "cta":
      return <RasterBlock section={section} sections={sections} />;
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

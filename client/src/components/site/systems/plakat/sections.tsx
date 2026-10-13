import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { legalParts, versalEszett, type SystemSection } from "../shared";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { PlakatEntry } from "./Entry";
import type { Field } from "./rhythm";
import {
  PlakatPriced,
  PlakatProcess,
  PlakatServices,
  PlakatStats,
} from "./Offer";
import { PlakatAbout, PlakatGallery, PlakatReviews, PlakatTeam } from "./Story";
import { PlakatContact, PlakatFaq } from "./Visit";
import {
  PlakatCta,
  PlakatMotto,
  PlakatPartners,
  PlakatStory,
  PlakatUsp,
} from "./Extras";

/** Startseiten- und Unterseiten-Abschnitte (inkl. pageHeader). */
export type PlakatSection = SystemSection;

/** Plakat-Wortwahl der Kapitel (Systemblatt); Bauplan-Überschriften gewinnen. */
const CHAPTER_LABELS: Partial<Record<PlakatSection["type"], string>> = {
  services: "Leistungen",
  process: "So läuft's",
  pricelist: "Preise",
  menu: "Karte",
  team: "Team",
  about: "Über uns",
  gallery: "Bilder",
  testimonials: "Stimmen",
  faq: "Fragen",
  contact: "Vorbeikommen",
  story: "Geschichte",
  usp: "Darum wir",
  stats: "In Zahlen",
  partners: "Partner",
  quote: "Motto",
  cta: "Anfrage",
};

/** Titel: eigene Überschrift, sonst Bauplan, sonst Plakat-Wortwahl. */
export function chapterTitle(
  type: PlakatSection["type"],
  own: string | undefined,
  blueprint: Blueprint
): string {
  return (
    own?.trim() ||
    blueprint.headlines[type as keyof Blueprint["headlines"]] ||
    CHAPTER_LABELS[type] ||
    ""
  );
}

/**
 * Kapitel auf seiner Fläche (Feld-Rhythmus): h2 in League Gothic mit
 * Signal-Punkt, gedämpfter Satz in Lesebreite, dann Inhalt. `aside` steht
 * am Handy über dem Inhalt, am Desktop links daneben (Bogen am Ablauf,
 * Pille an „Über uns"). `hiddenTitle`: Überschrift nur für Vorleser
 * (Stimme, Motto — der Satz selbst ist die große Zeile).
 */
export function PlakatChapter({
  type,
  field,
  title,
  intro,
  className,
  aside,
  hiddenTitle = false,
  children,
}: {
  type: PlakatSection["type"];
  field: Field;
  title: string;
  intro?: string;
  className?: string;
  aside?: React.ReactNode;
  hiddenTitle?: boolean;
  children?: React.ReactNode;
}) {
  const id = SECTION_ANCHORS[type];
  const headingId = `${id}-titel`;
  // Nicht „pk-menu": so heißt das Menü im Kopf (Karte heißt pk-karte).
  const name = type === "menu" ? "karte" : type;
  const head = hiddenTitle ? (
    <h2 className="pk-sr" id={headingId}>
      {rich(title)}
    </h2>
  ) : (
    <>
      <h2 className="pk-title" id={headingId}>
        {rich(versalEszett(title))}
        <span className="pk-dot" aria-hidden="true">
          .
        </span>
      </h2>
      {intro && <p className="pk-intro">{rich(intro)}</p>}
    </>
  );
  return (
    <section
      id={id}
      className={`pk-sec pk-${name} pk-${field}${className ? ` ${className}` : ""}`}
      aria-labelledby={headingId}
    >
      {aside ? (
        <div className="pk-wrap pk-split">
          {aside}
          <div className="pk-split-body">
            {head}
            {children}
          </div>
        </div>
      ) : (
        <div className="pk-wrap">
          {head}
          {children}
        </div>
      )}
    </section>
  );
}

/**
 * Kopf für Unterseiten und Rechtsseiten (Systemblatt „Rechtliches,
 * Unterseiten"): Name gedämpft, Seitentitel als einziges h1 in Stufe h2.
 */
export function PlakatPageHead({
  title,
  titleHtml,
  intro,
  secondary = false,
  kicker,
}: {
  title?: string;
  titleHtml?: string;
  intro?: string;
  secondary?: boolean;
  kicker?: string;
}) {
  const { data } = useSystem();
  if (secondary) {
    return (
      <section className="pk-page-head pk-ground">
        <div className="pk-wrap">
          <h2 className="pk-page-title">{rich(versalEszett(title ?? ""))}</h2>
          {intro && <p className="pk-intro">{rich(intro)}</p>}
        </div>
      </section>
    );
  }
  return (
    <section
      className="pk-page-head pk-ground"
      id={SECTION_ANCHORS.pageHeader}
      aria-labelledby="seite-titel"
    >
      <div className="pk-wrap">
        <p className="pk-page-kicker">{kicker ?? data.businessName}</p>
        {titleHtml !== undefined ? (
          <h1
            id="seite-titel"
            className="pk-page-title"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <h1 id="seite-titel" className="pk-page-title">
            {rich(versalEszett(title ?? ""))}
          </h1>
        )}
        {intro && <p className="pk-intro">{rich(intro)}</p>}
      </div>
    </section>
  );
}

/**
 * Rechtsseite im Plakat-Rahmen (legalParts: ohne Generator-Hülle, erstes
 * h1 wird Seitentitel). SICHERHEIT: `html` stammt ausschließlich aus dem
 * legalGenerator (renderLegalPage in server/ssr/renderSite.tsx).
 */
export function PlakatLegal({ title, html }: { title: string; html: string }) {
  const { data } = useSystem();
  const { titleHtml, body } = legalParts(html);
  return (
    <>
      <PlakatPageHead
        title={title}
        titleHtml={titleHtml}
        kicker={`${data.businessName} · Rechtliches`}
      />
      <article
        className="pk-wrap pk-legal"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}

/** Abschnitts-Weiche (exhaustiv über alle SectionV2-/PageSection-Typen). */
export function renderPlakatSection(
  section: PlakatSection,
  sections: readonly PlakatSection[],
  field: Field,
  /** Bogen-Foto am Ablauf aus plakatPhotos (jedes Foto höchstens einmal). */
  processPhoto?: string
): React.ReactNode {
  const props = { sections, field };
  switch (section.type) {
    case "hero":
      return <PlakatEntry hero={section} field={field} />;
    case "services":
      return <PlakatServices section={section} {...props} />;
    case "process":
      return (
        <PlakatProcess section={section} {...props} photo={processPhoto} />
      );
    case "pricelist":
    case "menu":
      return <PlakatPriced section={section} field={field} />;
    case "stats":
      return <PlakatStats section={section} {...props} />;
    case "team":
      return <PlakatTeam section={section} {...props} />;
    case "about":
      return <PlakatAbout section={section} {...props} />;
    case "gallery":
      return <PlakatGallery section={section} {...props} />;
    case "testimonials":
      return <PlakatReviews section={section} {...props} />;
    case "faq":
      return <PlakatFaq section={section} {...props} />;
    case "contact":
      return <PlakatContact section={section} {...props} />;
    case "story":
      return <PlakatStory section={section} {...props} />;
    case "usp":
      return <PlakatUsp section={section} {...props} />;
    case "quote":
      return <PlakatMotto section={section} {...props} />;
    case "partners":
      return <PlakatPartners section={section} {...props} />;
    case "cta":
      return <PlakatCta section={section} {...props} />;
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <PlakatPageHead
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

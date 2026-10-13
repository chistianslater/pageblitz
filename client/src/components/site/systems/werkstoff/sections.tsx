import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { legalParts, type SystemSection } from "../shared";
import { WerkstoffEntry } from "./Entry";
import {
  WerkstoffPriced,
  WerkstoffProcess,
  WerkstoffServices,
  WerkstoffStats,
} from "./Offer";
import {
  WerkstoffAbout,
  WerkstoffGallery,
  WerkstoffReviews,
  WerkstoffTeam,
} from "./Story";
import { WerkstoffContact, WerkstoffFaq } from "./Visit";
import {
  WerkstoffCta,
  WerkstoffMotto,
  WerkstoffPartners,
  WerkstoffStory,
  WerkstoffUsp,
} from "./Extras";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";

/** Startseiten- und Unterseiten-Abschnitte (inkl. pageHeader). */
export type WerkstoffSection = SystemSection;

/** Werkstoff-Wortwahl der Kapitel (Systemblatt); Bauplan-Überschriften gewinnen. */
const CHAPTER_LABELS: Partial<Record<WerkstoffSection["type"], string>> = {
  services: "Leistungen",
  process: "Ablauf",
  pricelist: "Preise",
  menu: "Speisekarte",
  team: "Team",
  about: "Über uns",
  gallery: "Aus der Werkstatt",
  testimonials: "Stimmen",
  faq: "Gut zu wissen",
  contact: "Zeiten und Kontakt",
  story: "Geschichte",
  usp: "Worauf du dich verlassen kannst",
  stats: "In Zahlen",
  partners: "Partner",
  cta: "Anfrage",
};

/**
 * Titel eines Kapitels: eigene Überschrift des Abschnitts, sonst die feste
 * Überschrift des Bauplans, sonst die Werkstoff-Wortwahl.
 */
export function chapterTitle(
  type: WerkstoffSection["type"],
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
 * Kapitelkopf nach Systemblatt: Slab-Überschrift (h2) und ein gedämpfter
 * Satz in Lesebreite — keine Nummern, keine Labels. Abstand nach oben
 * `section`. `after` steht randlos nach dem Kopf (Fotos, Bänder).
 */
export function WerkstoffChapter({
  id,
  name,
  title,
  intro,
  className = "",
  display = false,
  after,
  children,
}: {
  id: string;
  name: string;
  title: string;
  intro?: string;
  className?: string;
  /** Überschrift in Stufe `display` (Systemblatt: Leistungen). */
  display?: boolean;
  after?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const headingId = `${id}-titel`;
  return (
    <section
      id={id}
      className={`ws-sec ws-${name}${className ? ` ${className}` : ""}`}
      aria-labelledby={headingId}
    >
      <div className="ws-wrap">
        <h2
          className={display ? "ws-title ws-title--display" : "ws-title"}
          id={headingId}
        >
          {rich(title)}
        </h2>
        {intro && <p className="ws-intro">{rich(intro)}</p>}
        {children}
      </div>
      {after}
    </section>
  );
}

/**
 * Kopf für Unterseiten und Rechtsseiten (Systemblatt „Rechtliches und
 * Unterseiten"): Mono-Zeile mit dem Namen, genau ein h1 in Stufe h2.
 * Weitere pageHeader derselben Seite werden h2 ohne Anker.
 */
export function WerkstoffPageHead({
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
      <section className="ws-page-head">
        <div className="ws-wrap">
          <h2 className="ws-page-title">{rich(title ?? "")}</h2>
          {intro && <p className="ws-page-intro">{rich(intro)}</p>}
        </div>
      </section>
    );
  }
  return (
    <section
      className="ws-page-head"
      id={SECTION_ANCHORS.pageHeader}
      aria-labelledby="seite-titel"
    >
      <div className="ws-wrap">
        <p className="ws-page-kicker">{kicker ?? data.businessName}</p>
        {titleHtml !== undefined ? (
          <h1
            id="seite-titel"
            className="ws-page-title"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <h1 id="seite-titel" className="ws-page-title">
            {rich(title ?? "")}
          </h1>
        )}
        {intro && <p className="ws-page-intro">{rich(intro)}</p>}
      </div>
    </section>
  );
}

/**
 * Rechtsseite im Werkstoff-Rahmen. Generator-Hülle, `<style>` und Zurück-
 * Link fallen weg (legalParts); das erste h1 wird zum Seitentitel gehoben.
 * SICHERHEIT: `html` stammt ausschließlich aus dem legalGenerator (siehe
 * renderLegalPage in server/ssr/renderSite.tsx), nie aus Nutzereingaben.
 */
export function WerkstoffLegal({ title, html }: { title: string; html: string }) {
  const { data } = useSystem();
  const { titleHtml, body } = legalParts(html);
  return (
    <>
      <WerkstoffPageHead
        title={title}
        titleHtml={titleHtml}
        kicker={`${data.businessName} · Rechtliches`}
      />
      <article
        className="ws-wrap ws-legal"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}

/** Abschnitts-Weiche (exhaustiv über alle SectionV2-/PageSection-Typen). */
export function renderWerkstoffSection(
  section: WerkstoffSection,
  sections: readonly WerkstoffSection[],
  /** Foto am Ablauf aus werkstoffPhotos (jedes Foto höchstens einmal). */
  offerPhotos?: readonly string[]
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <WerkstoffEntry hero={section} />;
    case "services":
      return <WerkstoffServices section={section} sections={sections} />;
    case "process":
      return (
        <WerkstoffProcess
          section={section}
          sections={sections}
          photo={offerPhotos?.[0]}
        />
      );
    case "pricelist":
    case "menu":
      return <WerkstoffPriced section={section} />;
    case "stats":
      return <WerkstoffStats section={section} sections={sections} />;
    case "team":
      return <WerkstoffTeam section={section} sections={sections} />;
    case "about":
      return <WerkstoffAbout section={section} sections={sections} />;
    case "gallery":
      return <WerkstoffGallery section={section} sections={sections} />;
    case "testimonials":
      return <WerkstoffReviews section={section} sections={sections} />;
    case "faq":
      return <WerkstoffFaq section={section} sections={sections} />;
    case "contact":
      return <WerkstoffContact section={section} sections={sections} />;
    case "story":
      return <WerkstoffStory section={section} sections={sections} />;
    case "usp":
      return <WerkstoffUsp section={section} sections={sections} />;
    case "quote":
      return <WerkstoffMotto section={section} sections={sections} />;
    case "partners":
      return <WerkstoffPartners section={section} sections={sections} />;
    case "cta":
      return <WerkstoffCta section={section} sections={sections} />;
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <WerkstoffPageHead
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

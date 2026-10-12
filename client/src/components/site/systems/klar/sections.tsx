import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { legalParts, type SystemSection } from "../shared";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { KlarEntry } from "./Entry";
import {
  KlarPriced,
  KlarProcess,
  KlarServices,
  KlarStats,
  KlarUsp,
} from "./Offer";
import {
  KlarAbout,
  KlarGallery,
  KlarMotto,
  KlarPartners,
  KlarStory,
  KlarTeam,
  KlarVoices,
} from "./People";
import { KlarContact, KlarCta, KlarFaq } from "./Visit";

/**
 * Abschnitte von Klar nach Systemblatt 9–13 (Anker Luma Dental):
 * Einstieg (Entry), Angebot (Offer: Leistungen, Preise, erster Termin,
 * Zahlen, Vorteile), Menschen (People: Über uns, Team, Galerie, Stimmen,
 * Geschichte, Leitsatz, Partner), Besuch (Visit: Fragen, Sprechzeiten und
 * Anfahrt, Aufruf). Jedes Kapitel: ruhige h2 in DM Sans, weiche Karten auf
 * Papier, Felder nur als Fläche.
 */

export type KlarSection = SystemSection;

/** Klar-Wortwahl der Kapitel; eigene und Bauplan-Überschriften gewinnen. */
function chapterLabel(type: KlarSection["type"], blueprint: Blueprint): string {
  const advice = blueprint.id === "advice";
  const labels: Partial<Record<KlarSection["type"], string>> = {
    services: "Leistungen",
    process: advice ? "So läuft das Erstgespräch" : "Ihr erster Termin",
    pricelist: "Preise",
    menu: "Karte",
    team: advice ? "Wer Sie berät" : "Wer Sie behandelt",
    about: "Über uns",
    gallery: "Einblicke",
    testimonials: "Stimmen",
    faq: "Häufige Fragen",
    contact: "So finden Sie uns",
    story: "Geschichte",
    usp: "Ihre Vorteile",
    stats: "In Zahlen",
    partners: "Partner",
    quote: "Leitsatz",
    cta: "Termin",
  };
  return labels[type] ?? "";
}

export function chapterTitle(
  type: KlarSection["type"],
  own: string | undefined,
  blueprint: Blueprint
): string {
  return (
    own?.trim() ||
    blueprint.headlines[type as keyof Blueprint["headlines"]] ||
    chapterLabel(type, blueprint)
  );
}

/**
 * Ein Kapitel: h2 (oder nur für Vorleser), optional Einleitung und ein
 * Knopf rechts neben dem Titel (Desktop), dann der Inhalt. Die Klasse
 * `kl-<typ>` steht nur an der <section> (Speisekarte: `kl-karte`, weil
 * `kl-menu` das Menü im Kopf ist).
 */
export function KlarChapter({
  type,
  own,
  title,
  intro,
  action,
  hiddenTitle = false,
  className,
  titleClass = "kl-title",
  children,
}: {
  type: KlarSection["type"];
  own?: string;
  /** Fester Titel statt eigener/Bauplan-/Klar-Überschrift. */
  title?: string;
  intro?: string;
  action?: React.ReactNode;
  hiddenTitle?: boolean;
  className?: string;
  titleClass?: string;
  children?: React.ReactNode;
}) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS[type];
  const headingId = `${id}-titel`;
  const name = type === "menu" ? "karte" : type;
  const text = title ?? chapterTitle(type, own, blueprint);
  const h2 = (
    <h2 className={hiddenTitle ? "kl-sr" : titleClass} id={headingId}>
      {rich(text)}
    </h2>
  );
  return (
    <section
      id={id}
      className={`kl-sec kl-${name}${className ? ` ${className}` : ""}`}
      aria-labelledby={headingId}
    >
      <div className="kl-wrap">
        {action ? (
          <div className="kl-sec-head">
            {h2}
            {action}
          </div>
        ) : (
          h2
        )}
        {intro && <p className="kl-intro">{rich(intro)}</p>}
        {children}
      </div>
    </section>
  );
}

/**
 * Kopf für Unterseiten und Rechtsseiten: Name gedämpft, Seitentitel als
 * einziges h1 (`secondary` = weiterer Kopf als h2).
 */
export function KlarPageHead({
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
  if (secondary)
    return (
      <section className="kl-page-head">
        <div className="kl-wrap">
          <h2 className="kl-page-title">{rich(title ?? "")}</h2>
          {intro && <p className="kl-intro">{rich(intro)}</p>}
        </div>
      </section>
    );
  return (
    <section
      className="kl-page-head"
      id={SECTION_ANCHORS.pageHeader}
      aria-labelledby="seite-titel"
    >
      <div className="kl-wrap">
        <p className="kl-page-kicker">{kicker ?? data.businessName}</p>
        {titleHtml !== undefined ? (
          <h1
            id="seite-titel"
            className="kl-page-title"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <h1 id="seite-titel" className="kl-page-title">
            {rich(title ?? "")}
          </h1>
        )}
        {intro && <p className="kl-intro">{rich(intro)}</p>}
      </div>
    </section>
  );
}

/**
 * Rechtsseite im Klar-Rahmen (legalParts). SICHERHEIT: `html` stammt
 * ausschließlich aus dem legalGenerator (renderLegalPage in
 * server/ssr/renderSite.tsx).
 */
export function KlarLegal({ title, html }: { title: string; html: string }) {
  const { data } = useSystem();
  const { titleHtml, body } = legalParts(html);
  return (
    <>
      <KlarPageHead
        title={title}
        titleHtml={titleHtml}
        kicker={`${data.businessName} · Rechtliches`}
      />
      <article
        className="kl-wrap kl-legal"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}

/**
 * Abschnitts-Weiche (exhaustiv über alle SectionV2-/PageSection-Typen).
 * `anchorPrefix`: auf Unter- und Rechtsseiten zeigen Anker zur Startseite.
 */
export function renderKlarSection(
  section: KlarSection,
  sections: readonly KlarSection[],
  anchorPrefix = ""
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <KlarEntry hero={section} />;
    case "services":
      return <KlarServices section={section} sections={sections} />;
    case "process":
      return <KlarProcess section={section} />;
    case "pricelist":
    case "menu":
      return <KlarPriced section={section} />;
    case "stats":
      return <KlarStats section={section} />;
    case "team":
      return <KlarTeam section={section} />;
    case "about":
      return <KlarAbout section={section} />;
    case "gallery":
      return <KlarGallery section={section} />;
    case "testimonials":
      return <KlarVoices section={section} />;
    case "faq":
      return <KlarFaq section={section} />;
    case "contact":
      return <KlarContact section={section} sections={sections} />;
    case "story":
      return <KlarStory section={section} />;
    case "usp":
      return <KlarUsp section={section} />;
    case "quote":
      return <KlarMotto section={section} />;
    case "partners":
      return <KlarPartners section={section} />;
    case "cta":
      return <KlarCta section={section} anchorPrefix={anchorPrefix} />;
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <KlarPageHead
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

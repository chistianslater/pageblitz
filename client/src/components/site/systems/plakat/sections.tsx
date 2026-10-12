import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { pickReviewQuote, telHref } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import {
  addressLine,
  formatPrice,
  legalParts,
  versalEszett,
  type SystemSection,
} from "../shared";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { PlakatEntry } from "./Entry";
import type { Field } from "./rhythm";

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
 * Signal-Punkt, dann Inhalt. Grundlage für P4–P6.
 */
export function PlakatChapter({
  type,
  field,
  title,
  children,
}: {
  type: PlakatSection["type"];
  field: Field;
  title: string;
  children?: React.ReactNode;
}) {
  const id = SECTION_ANCHORS[type];
  const headingId = `${id}-titel`;
  return (
    <section
      id={id}
      className={`pk-sec pk-${type} pk-${field}`}
      aria-labelledby={headingId}
    >
      <div className="pk-wrap">
        <h2 className="pk-title" id={headingId}>
          {rich(versalEszett(title))}
          <span className="pk-dot" aria-hidden="true">
            .
          </span>
        </h2>
        {children}
      </div>
    </section>
  );
}

/** Kurze Zeilen eines Abschnitts (vorläufiger Block bis P4–P6). */
function blockLines(s: PlakatSection): { text: string; meta?: string }[] {
  switch (s.type) {
    case "services":
      return s.items.map(i => ({
        text: i.title,
        meta: i.price ? formatPrice(i.price) : undefined,
      }));
    case "menu":
    case "pricelist":
      return s.categories.flatMap(c =>
        c.items.map(i => ({ text: i.name, meta: formatPrice(i.price) }))
      );
    case "process":
      return s.steps.map(st => ({ text: st.title }));
    case "team":
      return s.members.map(m => ({ text: m.name, meta: m.role }));
    case "faq":
      return s.items.map(i => ({ text: i.question }));
    default:
      return [];
  }
}

/** Fließtext eines Abschnitts (vorläufiger Block bis P4–P6). */
function blockText(s: PlakatSection): string | undefined {
  switch (s.type) {
    case "about":
    case "story":
      return s.body;
    case "services":
      return s.intro;
    case "testimonials":
      return pickReviewQuote(s.items)?.text;
    default:
      return undefined;
  }
}

/**
 * Vorläufiger Plakat-Block für alle Inhaltsabschnitte (P4–P6 ersetzen ihn):
 * Kapitelkopf, Satz, kurze Liste — auf der Fläche aus dem Rhythmus.
 */
function PlakatBlock({
  section,
  field,
}: {
  section: PlakatSection;
  field: Field;
}) {
  const { blueprint } = useSystem();
  const own =
    "headline" in section
      ? (section.headline as string | undefined)
      : undefined;
  const lines = blockLines(section);
  const text = blockText(section);
  return (
    <PlakatChapter
      type={section.type}
      field={field}
      title={chapterTitle(section.type, own, blueprint)}
    >
      {text && <p className="pk-intro">{rich(text)}</p>}
      {lines.length > 0 && (
        <ul className="pk-lines">
          {lines.map((l, i) => (
            <li key={`${l.text}-${i}`}>
              <span>{l.text}</span>
              {l.meta && <span className="pk-muted">{l.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </PlakatChapter>
  );
}

/** Kontakt (vorläufig): Adresse, Telefon — Anker `kontakt` bleibt Ziel. */
function PlakatContactBlock({
  section,
  field,
}: {
  section: Extract<PlakatSection, { type: "contact" }>;
  field: Field;
}) {
  const { blueprint } = useSystem();
  const address = addressLine(section);
  const tel = telHref(section.phone);
  return (
    <PlakatChapter
      type="contact"
      field={field}
      title={chapterTitle("contact", section.headline, blueprint)}
    >
      {address && <p className="pk-intro">{address}</p>}
      {tel && section.phone && (
        <p className="pk-intro">
          <a href={tel}>{section.phone.trim()}</a>
        </p>
      )}
    </PlakatChapter>
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
  field: Field
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <PlakatEntry hero={section} field={field} />;
    case "contact":
      return <PlakatContactBlock section={section} field={field} />;
    case "services":
    case "process":
    case "pricelist":
    case "menu":
    case "stats":
    case "team":
    case "about":
    case "gallery":
    case "testimonials":
    case "faq":
    case "story":
    case "usp":
    case "quote":
    case "partners":
    case "cta":
      return <PlakatBlock section={section} field={field} />;
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

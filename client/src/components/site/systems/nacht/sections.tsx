import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { useSystem } from "../SystemContext";
import { legalParts, type SystemSection } from "../shared";
import { NachtEntry } from "./Entry";
import type { Opener, PairPhotos } from "./content";
import { Icon } from "./icons";
import {
  NachtPriced,
  NachtProcess,
  NachtServices,
  NachtStats,
  NachtUsp,
} from "./Offer";
import {
  NachtAbout,
  NachtGallery,
  NachtMotto,
  NachtPartners,
  NachtStory,
  NachtTeam,
  NachtVoices,
} from "./People";
import { NachtContact, NachtCta, NachtKnow } from "./Visit";

/**
 * Abschnitte von Nacht nach Systemblatt 9–16 (Anker Restaurant Zimmerl):
 * Einstieg (Entry), Angebot (Offer: Karte, Leistungen/Zimmer, Preise,
 * Ablauf, Zahlen, Vorteile), Menschen und Haus (People: Über uns, Team,
 * Galerie, Gästestimme, Geschichte, Leitsatz, Partner), Besuch (Visit:
 * Gut zu wissen, Zeiten mit Küche + Anfahrt, Reservierungs-Band).
 * Jedes Kapitel: h2 in Gilda, Kupfer, versal; nur Daten.
 */

export type NachtSection = SystemSection;

const LABELS: Partial<Record<NachtSection["type"], string>> = {
  services: "Leistungen",
  process: "So läuft es ab",
  pricelist: "Preise",
  menu: "Die Karte",
  team: "Das Team",
  about: "Über uns",
  gallery: "Einblicke",
  testimonials: "Was Gäste sagen",
  faq: "Gut zu wissen",
  contact: "Anfahrt",
  story: "Geschichte",
  usp: "Darauf zählt ihr",
  stats: "In Zahlen",
  partners: "Partner",
  quote: "Leitsatz",
  cta: "Reservieren",
};

export function chapterTitle(
  type: NachtSection["type"],
  own: string | undefined,
  blueprint: Blueprint
): string {
  return (
    own?.trim() ||
    blueprint.headlines[type as keyof Blueprint["headlines"]] ||
    LABELS[type] ||
    ""
  );
}

/** Gleiches Wort trotz Versalien, Leerraum, Auszeichnung („**Leistungen**"). */
const sameWord = (a: string, b: string) => {
  const norm = (t: string) =>
    t.replace(/[*_]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase("de");
  return norm(a) === norm(b);
};

/**
 * Große Kupferziffer mit Geisterwort und Kupferlinie (dekorativ). Lautet
 * die Kapitelüberschrift schon wie das Geisterwort („Leistungen"), steht
 * nur die Ziffer — kein Wort doppelt untereinander.
 */
function OpenerFigure({ opener, title }: { opener: Opener; title: string }) {
  const word = sameWord(opener.word, title) ? "" : opener.word;
  return (
    <div
      className="nc-open"
      aria-hidden="true"
      style={
        word
          ? ({ "--nc-chars": word.length } as React.CSSProperties)
          : undefined
      }
    >
      <span className="nc-open-num">
        <span className="nc-open-fig">{opener.value}</span>
        {/* Wort als ::before-Inhalt: reine Zierde (9 % Deckkraft), kein
            Text im Dokument — Vorleser und Kontrastprüfung überspringen es. */}
        {word && <span className="nc-open-ghost" data-word={word} />}
      </span>
      <span className="nc-cl" />
    </div>
  );
}

/**
 * Ein Kapitel: optional Kupferziffer, h2 in Kupfer (oder nur für
 * Vorleser), Einleitung, dann der Inhalt. `split`: am Desktop Kopf links,
 * Inhalt rechts (Systemblatt 15). `aside`: zusätzlicher Inhalt in der
 * Kopfspalte (Bildpaar der Karte). Klasse `nc-<typ>` an der <section>
 * (Speisekarte: `nc-karte`, weil `nc-menu` das Menü im Kopf ist).
 */
export function NachtChapter({
  type,
  own,
  title,
  intro,
  opener,
  split = false,
  aside,
  hiddenTitle = false,
  className,
  children,
}: {
  type: NachtSection["type"];
  own?: string;
  /** Fester Titel statt eigener/Bauplan-/Nacht-Überschrift. */
  title?: string;
  intro?: string;
  opener?: Opener;
  split?: boolean;
  aside?: React.ReactNode;
  hiddenTitle?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS[type];
  const headingId = `${id}-titel`;
  const name = type === "menu" ? "karte" : type;
  const text = title ?? chapterTitle(type, own, blueprint);
  const head = (
    <>
      {opener && <OpenerFigure opener={opener} title={text} />}
      <h2 className={hiddenTitle ? "nc-sr" : "nc-h2"} id={headingId}>
        {rich(text)}
      </h2>
      {intro && <p className="nc-intro">{rich(intro)}</p>}
    </>
  );
  return (
    <section
      id={id}
      className={`nc-sec nc-${name}${className ? ` ${className}` : ""}`}
      aria-labelledby={headingId}
    >
      <div className={split ? "nc-wrap nc-split" : "nc-wrap"}>
        {split ? (
          <>
            <div className="nc-split-head">
              {head}
              {aside}
            </div>
            <div className="nc-split-body">{children}</div>
          </>
        ) : (
          <>
            {head}
            {children}
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Unter- und Rechtsseiten-Kopf (Systemblatt „Unterseite"): Rückweg zur
 * Startseite in Kupfer, Name gedämpft, Titel als einziges h1
 * (`secondary` = weiterer Kopf als h2).
 */
export function NachtPageHead({
  title,
  titleHtml,
  intro,
  secondary = false,
  kicker,
  back,
}: {
  title?: string;
  titleHtml?: string;
  intro?: string;
  secondary?: boolean;
  kicker?: string;
  /** Ziel „Zur Startseite" (nur Unter- und Rechtsseiten). */
  back?: string;
}) {
  const { data } = useSystem();
  if (secondary)
    return (
      <section className="nc-page-head nc-page-head--more">
        <div className="nc-wrap">
          <h2 className="nc-h2">{rich(title ?? "")}</h2>
          {intro && <p className="nc-intro">{rich(intro)}</p>}
        </div>
      </section>
    );
  return (
    <section
      className="nc-page-head"
      id={SECTION_ANCHORS.pageHeader}
      aria-labelledby="seite-titel"
    >
      <div className="nc-wrap">
        {back && (
          <a className="nc-back" href={back}>
            <span className="nc-back-ic">
              <Icon name="arrow" />
            </span>
            Zur Startseite
          </a>
        )}
        <p className="nc-kicker">{kicker ?? data.businessName}</p>
        {titleHtml !== undefined ? (
          <h1
            id="seite-titel"
            className="nc-h2"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <h1 id="seite-titel" className="nc-h2">
            {rich(title ?? "")}
          </h1>
        )}
        {intro && <p className="nc-intro">{rich(intro)}</p>}
      </div>
    </section>
  );
}

/**
 * Rechtsseite im Nacht-Rahmen (legalParts): Fließtext in Tinte/Gedämpft
 * (≥ 9:1 auf Papier), Zeilenlänge über `--sys-space-measure`.
 * SICHERHEIT: `html` stammt ausschließlich aus dem legalGenerator
 * (renderLegalPage in server/ssr/renderSite.tsx).
 */
export function NachtLegal({
  title,
  html,
  back,
}: {
  title: string;
  html: string;
  back?: string;
}) {
  const { data } = useSystem();
  const { titleHtml, body } = legalParts(html);
  return (
    <>
      <NachtPageHead
        title={title}
        titleHtml={titleHtml}
        kicker={`${data.businessName} · Rechtliches`}
        back={back}
      />
      <article
        className="nc-wrap nc-legal"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}

/**
 * Abschnitts-Weiche (exhaustiv über alle SectionV2-/PageSection-Typen).
 * `anchorPrefix`: auf Unter- und Rechtsseiten zeigen Anker zur Startseite.
 * `pair`: zwei Galeriefotos neben der Karte (nachtPhotos).
 */
export function renderNachtSection(
  section: NachtSection,
  sections: readonly NachtSection[],
  anchorPrefix = "",
  pair?: PairPhotos,
  back?: string
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <NachtEntry hero={section} />;
    case "services":
      return (
        <NachtServices
          section={section}
          sections={sections}
          anchorPrefix={anchorPrefix}
        />
      );
    case "pricelist":
    case "menu":
      return (
        <NachtPriced
          section={section}
          sections={sections}
          anchorPrefix={anchorPrefix}
          pair={section.type === "menu" ? pair : undefined}
        />
      );
    case "process":
      return <NachtProcess section={section} />;
    case "stats":
      return <NachtStats section={section} />;
    case "usp":
      return <NachtUsp section={section} />;
    case "team":
      return <NachtTeam section={section} />;
    case "about":
      return <NachtAbout section={section} />;
    case "gallery":
      return <NachtGallery section={section} />;
    case "testimonials":
      return <NachtVoices section={section} />;
    case "story":
      return <NachtStory section={section} />;
    case "quote":
      return <NachtMotto section={section} />;
    case "partners":
      return <NachtPartners section={section} />;
    case "faq":
      return <NachtKnow section={section} />;
    case "contact":
      return <NachtContact section={section} />;
    case "cta":
      return <NachtCta section={section} anchorPrefix={anchorPrefix} />;
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <NachtPageHead
          title={section.title}
          intro={section.intro}
          secondary={sections.find(s => s.type === "pageHeader") !== section}
          back={back}
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

import React from "react";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { legalParts, type SystemSection } from "../shared";
import { FreundlichEntry } from "./Entry";
import { cloudAt, titleSplit, type Surface } from "./content";
import { Icon } from "./icons";
import {
  FreundlichPriced,
  FreundlichProcess,
  FreundlichServices,
  FreundlichStats,
  FreundlichUsp,
} from "./Offer";
import {
  FreundlichAbout,
  FreundlichGallery,
  FreundlichPartners,
  FreundlichQuote,
  FreundlichStory,
  FreundlichTeam,
  FreundlichVoices,
} from "./People";
import { FreundlichContact, FreundlichCta, FreundlichFaq } from "./Visit";

/**
 * Abschnitte von Freundlich nach Systemblatt 7/8/11–18 (Anker Bright Path):
 * Einstieg (Entry), Angebot (Offer: Leistungen, Karte/Preise, Ablauf,
 * Zahlen, Vorteile), Menschen (People: Über uns, Team, Galerie, Stimmen,
 * Geschichte, Leitsatz, Partner), Besuch (Visit: Gut zu wissen, Zeiten +
 * „Besuch uns", Abschluss-Band). Jedes Kapitel: h2 in zwei Tönen, Fläche
 * Papier/Band/Pastell, Wolke beim Wechsel auf eine gefüllte Fläche.
 * Kein Block „Wo steht ihr gerade?" (Betreiber-Entscheid 2026-10-13).
 */

export type FreundlichSection = SystemSection;

const LABELS: Partial<Record<FreundlichSection["type"], string>> = {
  services: "Unser Angebot",
  process: "So läuft es ab",
  pricelist: "Unsere Preise",
  menu: "Was es bei uns gibt",
  team: "Wer bei uns ist",
  about: "Über uns",
  gallery: "Aus dem Alltag",
  testimonials: "Was andere sagen",
  faq: "Gut zu wissen",
  contact: "Besuch uns",
  story: "Unsere Geschichte",
  usp: "Darauf könnt ihr zählen",
  stats: "In Zahlen",
  partners: "Mit wem wir arbeiten",
  quote: "Leitsatz",
  cta: "Meldet euch",
};

export function chapterTitle(
  type: FreundlichSection["type"],
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

/** Lage eines Kapitels: Fläche und Wolke am oberen Rand. */
export type Place = { surface: Surface; cloud: boolean };
export const PAPER: Place = { surface: "paper", cloud: false };

/** h2 in zwei Tönen (titleSplit); der Akzentteil bleibt im Satz. */
export function TwoTone({ text }: { text: string }) {
  const { lead, rest } = titleSplit(text);
  if (!rest) return <>{rich(lead)}</>;
  return (
    <>
      {rich(lead)} <span className="fr-acc">{rest}</span>
    </>
  );
}

/**
 * Ein Kapitel: h2 (zwei Töne, oder nur für Vorleser), Einleitung, Inhalt.
 * `layout`: „split" = am Desktop Kopf links, Inhalt rechts bzw. Einleitung
 * rechts neben dem Titel (Systemblatt 16/17); „center" = Kopf mittig.
 * Klasse `fr-sec--<typ>` (Speisekarte: `karte`), Fläche `fr-sec--<fläche>`.
 */
export function FreundlichChapter({
  type,
  own,
  title,
  intro,
  place = PAPER,
  layout = "stack",
  hiddenTitle = false,
  children,
}: {
  type: FreundlichSection["type"];
  own?: string;
  title?: string;
  intro?: string;
  place?: Place;
  layout?: "stack" | "split" | "aside" | "center";
  hiddenTitle?: boolean;
  children?: React.ReactNode;
}) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS[type];
  const headingId = `${id}-titel`;
  const name = type === "menu" ? "karte" : type;
  const text = title ?? chapterTitle(type, own, blueprint);
  const fill = place.surface !== "paper";
  const head = (
    <div className={`fr-chead fr-chead--${layout}`}>
      <h2 className={hiddenTitle ? "fr-sr" : "fr-h2"} id={headingId}>
        <TwoTone text={text} />
      </h2>
      {intro && <p className="fr-intro">{rich(intro)}</p>}
    </div>
  );
  return (
    <section
      id={id}
      className={`fr-sec fr-sec--${name} fr-sec--${place.surface}${fill ? " fr-sec--fill" : ""}`}
      aria-labelledby={headingId}
    >
      {place.cloud && fill && (
        <span className={`fr-cloud fr-cloud--top fr-cloud--${place.surface}`} aria-hidden="true" />
      )}
      <div className={layout === "aside" ? "fr-wrap fr-aside" : "fr-wrap"}>
        {layout === "aside" ? (
          <>
            {head}
            <div className="fr-aside-body">{children}</div>
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

/** Gestrichelte Karte „Nur in deiner Vorschau" — nie auf der Live-Seite. */
export function FreundlichPreviewCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <aside className="fr-slot" aria-label={title}>
      <p className="fr-slot-kicker">Nur in deiner Vorschau</p>
      <h3 className="fr-h3">{title}</h3>
      {text && <p className="fr-slot-text">{text}</p>}
    </aside>
  );
}

/**
 * Unter- und Rechtsseiten-Kopf (Systemblatt 8 „Unterseite"): „Zur
 * Startseite" zuerst, Name gedämpft, Titel als einziges h1 in h2-Größe,
 * keine Wolke, keine Pastelle (`secondary` = weiterer Kopf als h2).
 */
export function FreundlichPageHead({
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
  back?: string;
}) {
  const { data } = useSystem();
  if (secondary)
    return (
      <section className="fr-page-head fr-page-head--more">
        <div className="fr-wrap">
          <h2 className="fr-h2">{rich(title ?? "")}</h2>
          {intro && <p className="fr-intro">{rich(intro)}</p>}
        </div>
      </section>
    );
  return (
    <section
      className="fr-page-head"
      id={SECTION_ANCHORS.pageHeader}
      aria-labelledby="seite-titel"
    >
      <div className="fr-wrap">
        {back && (
          <a className="fr-back" href={back}>
            <Icon name="arrow" />
            Zur Startseite
          </a>
        )}
        <p className="fr-kicker">{kicker ?? data.businessName}</p>
        {titleHtml !== undefined ? (
          <h1
            id="seite-titel"
            className="fr-h2"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <h1 id="seite-titel" className="fr-h2">
            {rich(title ?? "")}
          </h1>
        )}
        {intro && <p className="fr-intro">{rich(intro)}</p>}
      </div>
    </section>
  );
}

/**
 * Rechtsseite im Freundlich-Rahmen (legalParts): Text 18 px in Tinte bzw.
 * Neben-Grau (≥ 7:1 auf Papier), Links unterstrichen in Akzent.
 * SICHERHEIT: `html` stammt ausschließlich aus dem legalGenerator
 * (renderLegalPage in server/ssr/renderSite.tsx).
 */
export function FreundlichLegal({
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
      <FreundlichPageHead
        title={title}
        titleHtml={titleHtml}
        kicker={`${data.businessName} · Rechtliches`}
        back={back}
      />
      <article
        className="fr-wrap fr-legal"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}

/**
 * Abschnitts-Weiche (exhaustiv über alle SectionV2-/PageSection-Typen).
 * `anchorPrefix`: auf Unter- und Rechtsseiten zeigen Anker zur Startseite.
 * `plan`: Fläche je Abschnitt (surfacePlan); daraus Wolke und die Farbe
 * der Einstiegs-Wolke (nächste Fläche).
 */
export function renderFreundlichSection(
  section: FreundlichSection,
  sections: readonly FreundlichSection[],
  anchorPrefix = "",
  back?: string,
  plan: readonly Surface[] = []
): React.ReactNode {
  const i = sections.indexOf(section);
  const place: Place = {
    surface: plan[i] ?? "paper",
    cloud: cloudAt(sections, plan, i),
  };
  switch (section.type) {
    case "hero":
      return <FreundlichEntry hero={section} next={plan[i + 1] ?? "paper"} />;
    case "services":
      return (
        <FreundlichServices
          section={section}
          sections={sections}
          anchorPrefix={anchorPrefix}
          place={place}
        />
      );
    case "pricelist":
    case "menu":
      return (
        <FreundlichPriced
          section={section}
          anchorPrefix={anchorPrefix}
          place={place}
        />
      );
    case "process":
      return <FreundlichProcess section={section} place={place} />;
    case "stats":
      return <FreundlichStats section={section} place={place} />;
    case "usp":
      return <FreundlichUsp section={section} place={place} />;
    case "team":
      return <FreundlichTeam section={section} place={place} />;
    case "about":
      return <FreundlichAbout section={section} place={place} />;
    case "gallery":
      return <FreundlichGallery section={section} place={place} />;
    case "testimonials":
      return <FreundlichVoices section={section} place={place} />;
    case "story":
      return <FreundlichStory section={section} place={place} />;
    case "quote":
      return <FreundlichQuote section={section} place={place} />;
    case "partners":
      return <FreundlichPartners section={section} place={place} />;
    case "faq":
      return <FreundlichFaq section={section} place={place} />;
    case "contact":
      return <FreundlichContact section={section} place={place} />;
    case "cta":
      return (
        <FreundlichCta
          section={section}
          anchorPrefix={anchorPrefix}
          place={place}
        />
      );
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <FreundlichPageHead
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


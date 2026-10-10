import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import {
  JournalChapter,
  chapterIndex,
  chapterLabel,
  interludeClass,
  sectionClass,
  type JournalSection,
} from "./sections";

/**
 * Übrige Abschnittstypen in der Grammatik des Systemblatts (Label-Zeile +
 * Serifen-H2, Haarlinien, helle Bänder): Geschichte und Grundsätze als
 * nummerierte Kapitel, Zahlen, Zitat und Partner als ruhige Zwischentöne,
 * der Aufruf als einziges dunkles Band. Dazu der Typo-Kopf für Unterseiten
 * und Rechtsseiten (genau ein h1, kein Foto).
 */

type P<T extends JournalSection["type"]> = {
  section: Extract<JournalSection, { type: T }>;
  sections: readonly JournalSection[];
};

/** Absätze aus Leerzeilen („Erster.\n\nZweiter.“). */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
}

export function JournalStory({ section, sections }: P<"story">) {
  const { blueprint } = useSystem();
  const index = chapterIndex(sections, "story");
  const id = SECTION_ANCHORS.story;
  return (
    <section
      id={id}
      className={sectionClass("story", index)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap jr-split">
        <div className="jr-split-head">
          <JournalChapter
            id={id}
            index={index}
            label={chapterLabel("story", blueprint)}
            title={section.headline}
          />
        </div>
        <div className="jr-split-body jr-story-body">
          {paragraphs(section.body).map((p, i) => (
            <p key={i}>{rich(p)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JournalUsp({ section, sections }: P<"usp">) {
  const { blueprint } = useSystem();
  const index = chapterIndex(sections, "usp");
  const id = SECTION_ANCHORS.usp;
  const label = chapterLabel("usp", blueprint);
  return (
    <section
      id={id}
      className={sectionClass("usp", index)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap jr-split">
        <div className="jr-split-head">
          <JournalChapter
            id={id}
            index={index}
            label={label}
            title={section.headline ?? label}
          />
        </div>
        <ul className="jr-split-body jr-usp-list">
          {section.items.map((item, i) => (
            <li key={`${item.title}-${i}`}>
              <h3>{rich(item.title)}</h3>
              {item.text && <p>{rich(item.text)}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function JournalStats({ section, sections }: P<"stats">) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS.stats;
  const label = chapterLabel("stats", blueprint);
  return (
    <section
      id={id}
      className={interludeClass("stats", section, sections)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap">
        {section.headline ? (
          <JournalChapter
            id={id}
            index={0}
            label={label}
            title={section.headline}
          />
        ) : (
          <h2 id={`${id}-titel`} className="jr-sr">
            {label}
          </h2>
        )}
        <ul className="jr-stats-list" data-count={section.items.length}>
          {section.items.map((item, i) => (
            <li key={`${item.label}-${i}`}>
              <span className="jr-stat-value">{item.value}</span>
              <span className="jr-stat-label">{rich(item.label)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Anführungszeichen setzt das CSS; vorhandene aus dem Text entfernen. */
export const unquote = (text: string) =>
  text.trim().replace(/^[„"“»«‚']+|[“"”«»‘']+$/g, "");

export function JournalQuote({ section, sections }: P<"quote">) {
  return (
    <section
      id={SECTION_ANCHORS.quote}
      className={interludeClass("quote-band", section, sections)}
      aria-label="Zitat"
    >
      <div className="jr-wrap">
        <figure className="jr-motto">
          <blockquote>
            <p>{rich(unquote(section.text))}</p>
          </blockquote>
          {section.author && (
            <figcaption className="jr-kicker jr-quote-author">
              {section.author}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

export function JournalPartners({ section, sections }: P<"partners">) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS.partners;
  const label = chapterLabel("partners", blueprint);
  return (
    <section
      id={id}
      className={interludeClass("partners", section, sections)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap">
        <JournalChapter
          id={id}
          index={0}
          label={label}
          title={section.headline ?? "Partner und Zertifikate"}
        />
        <ul className="jr-logos">
          {section.items.map((item, i) => {
            const img = (
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                decoding="async"
              />
            );
            return (
              <li key={`${item.name}-${i}`}>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {img}
                  </a>
                ) : (
                  img
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function JournalCta({ section }: P<"cta">) {
  const id = SECTION_ANCHORS.cta;
  return (
    <section
      id={id}
      className="jr-section jr-cta"
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap">
        <h2 id={`${id}-titel`}>{rich(section.headline)}</h2>
        <p className="jr-cta-action">
          <a
            className="jr-pill jr-pill--light"
            href={section.ctaHref ?? `#${SECTION_ANCHORS.contact}`}
          >
            {section.ctaText}
          </a>
        </p>
      </div>
    </section>
  );
}

/**
 * Typo-Kopf für Unterseiten und Rechtsseiten: Betriebsname als Kicker,
 * Titel als einziges h1, optional eine Einleitung — kein Foto.
 * `titleHtml` nur für systemgenerierte Rechtstexte (legalGenerator).
 */
export function JournalPageHead({
  title,
  titleHtml,
  intro,
}: {
  title?: string;
  titleHtml?: string;
  intro?: string;
}) {
  const { data } = useSystem();
  return (
    <section
      className="jr-page-head"
      id={SECTION_ANCHORS.pageHeader}
      aria-labelledby="seite-titel"
    >
      <div className="jr-wrap">
        <p className="jr-kicker jr-page-kicker">{data.businessName}</p>
        {titleHtml !== undefined ? (
          <h1
            id="seite-titel"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <h1 id="seite-titel">{rich(title ?? "")}</h1>
        )}
        {intro && <p className="jr-page-intro">{rich(intro)}</p>}
      </div>
    </section>
  );
}

const FIRST_H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i;

/**
 * Rechtsseite im Journal-Rahmen. Das erste h1 des Rechtstexts wird zum
 * Seitentitel gehoben (genau ein h1 je Seite); der Rest steht im Textmaß.
 * SICHERHEIT: `html` stammt ausschließlich aus dem legalGenerator (siehe
 * renderLegalPage in server/ssr/renderSite.tsx), nie aus Nutzereingaben.
 */
export function JournalLegal({ title, html }: { title: string; html: string }) {
  const match = html.match(FIRST_H1);
  const body = match ? html.replace(FIRST_H1, "") : html;
  return (
    <>
      <JournalPageHead title={title} titleHtml={match?.[1]} />
      <article
        className="jr-wrap jr-legal"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}

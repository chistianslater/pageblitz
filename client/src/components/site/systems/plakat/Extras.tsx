import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { versalEszett } from "../shared";
import { paragraphs, Voice } from "./Story";
import { PlakatChapter, chapterTitle, type PlakatSection } from "./sections";
import type { Field } from "./rhythm";

/**
 * Übrige Abschnitte in derselben Grammatik (League-Gothic-Überschrift mit
 * Punkt, Grotesk erklärt): Geschichte als Lesetext, Grundsätze als
 * Riesenliste ohne Preis, Motto groß wie die Stimme, Partner als ruhige
 * Logo-Reihe, Aufruf als großer Satz mit Tinte-Pille.
 */

type Props<T extends PlakatSection["type"]> = {
  section: Extract<PlakatSection, { type: T }>;
  sections: readonly PlakatSection[];
  field: Field;
};

export function PlakatStory({ section, field }: Props<"story">) {
  const { blueprint } = useSystem();
  return (
    <PlakatChapter
      type="story"
      field={field}
      title={chapterTitle("story", section.headline, blueprint)}
    >
      <div className="pk-prose">
        {paragraphs(section.body).map((p, i) => (
          <p key={i}>{rich(p)}</p>
        ))}
      </div>
    </PlakatChapter>
  );
}

export function PlakatUsp({ section, field }: Props<"usp">) {
  const { blueprint } = useSystem();
  return (
    <PlakatChapter
      type="usp"
      field={field}
      title={chapterTitle("usp", section.headline, blueprint)}
    >
      <ul className="pk-rows pk-rows--plain">
        {section.items.map((item, i) => (
          <li className="pk-row" key={`${item.title}-${i}`}>
            <h3 className="pk-row-name">{rich(versalEszett(item.title))}</h3>
            {item.text && <p className="pk-row-text">{rich(item.text)}</p>}
          </li>
        ))}
      </ul>
    </PlakatChapter>
  );
}

/** Motto: ein großer Satz wie die Stimme — die Überschrift nur für Vorleser. */
export function PlakatMotto({ section, field }: Props<"quote">) {
  const { blueprint } = useSystem();
  return (
    <PlakatChapter
      type="quote"
      field={field}
      title={chapterTitle("quote", undefined, blueprint)}
      hiddenTitle
    >
      <Voice text={section.text} author={section.author} />
    </PlakatChapter>
  );
}

export function PlakatPartners({ section, field }: Props<"partners">) {
  const { blueprint } = useSystem();
  return (
    <PlakatChapter
      type="partners"
      field={field}
      title={chapterTitle("partners", section.headline, blueprint)}
    >
      <ul className="pk-logos">
        {section.items.map((item, i) => {
          // Logo-Maße unbekannt: width/height gegen Sprünge, Höhe regelt CSS.
          const img = (
            <img
              src={item.imageUrl}
              alt={item.name}
              width={160}
              height={64}
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
    </PlakatChapter>
  );
}

/** Aufruf: großer Satz (h2), Hauptaktion als Tinte-Pille mit Signal-Kreis. */
export function PlakatCta({ section, field }: Props<"cta">) {
  return (
    <PlakatChapter type="cta" field={field} title={section.headline}>
      <p className="pk-more">
        <a
          className="pk-btn"
          href={section.ctaHref ?? `#${SECTION_ANCHORS.contact}`}
        >
          {section.ctaText}
          <i aria-hidden="true">→</i>
        </a>
      </p>
    </PlakatChapter>
  );
}

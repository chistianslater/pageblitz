import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import { paragraphs, unquote } from "./Story";
import {
  WerkstoffChapter,
  chapterTitle,
  type WerkstoffSection,
} from "./sections";

/**
 * Übrige Abschnitte in derselben Grammatik (Slab-Überschrift, Tinte-Linie,
 * Mono-Daten): Geschichte als Lesetext, Grundsätze als Zeilen wie die
 * Leistungen (ohne Pfeil), Zitat groß in Karla, Partner als ruhige
 * Logo-Reihe. Der Aufruf bleibt hell (Hell-bleiben-Regel): Tinte-Linie,
 * Slab-Satz, Signal-Knopf.
 */

type Props<T extends WerkstoffSection["type"]> = {
  section: Extract<WerkstoffSection, { type: T }>;
  sections: readonly WerkstoffSection[];
};

export function WerkstoffStory({ section }: Props<"story">) {
  const { blueprint } = useSystem();
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.story}
      name="story"
      title={chapterTitle("story", section.headline, blueprint)}
    >
      <div className="ws-prose">
        {paragraphs(section.body).map((p, i) => (
          <p key={i}>{rich(p)}</p>
        ))}
      </div>
    </WerkstoffChapter>
  );
}

export function WerkstoffUsp({ section }: Props<"usp">) {
  const { blueprint } = useSystem();
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.usp}
      name="usp"
      title={chapterTitle("usp", section.headline, blueprint)}
    >
      <ul className="ws-list ws-list--plain">
        {section.items.map((item, i) => (
          <li key={`${item.title}-${i}`}>
            <h3 className="ws-list-title">{rich(item.title)}</h3>
            {item.text && <p className="ws-list-text">{rich(item.text)}</p>}
          </li>
        ))}
      </ul>
    </WerkstoffChapter>
  );
}

/** Zitat als Zwischenton: kein h2, Satz groß, Urheber in Slab. */
export function WerkstoffMotto({ section }: Props<"quote">) {
  return (
    <section
      id={SECTION_ANCHORS.quote}
      className="ws-sec ws-motto"
      aria-label="Zitat"
    >
      <div className="ws-wrap">
        <figure className="ws-voice">
          <blockquote className="ws-quote-text">
            <p>„{rich(unquote(section.text))}“</p>
          </blockquote>
          {section.author && (
            <figcaption className="ws-voice-who">
              <span className="ws-voice-name">{section.author}</span>
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

export function WerkstoffPartners({ section }: Props<"partners">) {
  const { blueprint } = useSystem();
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.partners}
      name="partners"
      title={chapterTitle("partners", section.headline, blueprint)}
    >
      <ul className="ws-logos">
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
    </WerkstoffChapter>
  );
}

/** Aufruf, hell: Tinte-Linie, Slab-Satz (h2), Hauptaktion als Signal-Knopf. */
export function WerkstoffCta({ section }: Props<"cta">) {
  return (
    <WerkstoffChapter
      id={SECTION_ANCHORS.cta}
      name="cta"
      title={section.headline}
    >
      <p className="ws-cta-action">
        <a
          className="ws-btn"
          href={section.ctaHref ?? `#${SECTION_ANCHORS.contact}`}
        >
          {section.ctaText}
        </a>
      </p>
    </WerkstoffChapter>
  );
}

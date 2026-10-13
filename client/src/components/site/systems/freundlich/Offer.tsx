import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { menuVisible } from "../shared/heroFacts";
import { useSystem } from "../SystemContext";
import {
  hasSection,
  newTabIfMaps,
  rowPrice,
  systemHref,
  useSlot,
} from "../shared";
import { ITEM_CARDS_MAX, offerIcon, tileLetters, tintOf } from "./content";
import { Icon } from "./icons";
import {
  FreundlichChapter,
  FreundlichPreviewCard,
  type FreundlichSection,
  type Place,
} from "./sections";

/**
 * Angebot nach Systemblatt 7/11/16: Farbkarten, je Angebot ein Pastell im
 * Wechsel (1–4), Kachel mit Symbol (Schlagwort im Titel) oder zwei
 * Buchstaben, Preis als weiße Pille — nur aus den Daten. Ablauf als weiße
 * Karten mit Nummernkachel, Zahlen auf tiefer Fläche, Vorteile als
 * Farbkarten mit Haken. Text auf Pastell immer in der Tinte des Pastells.
 * Keine Fotos in Angebotskarten (content.ts: freundlichPhotos).
 */

type Link = SectionOf<"services">["link"];

/** Weiterführender Link unter dem Angebot — nur mit gültigem Ziel. */
function SectionLink({
  link,
  anchorPrefix,
}: {
  link: Link;
  anchorPrefix: string;
}) {
  const { data } = useSystem();
  const href = systemHref(link?.href, data, anchorPrefix);
  if (!link || !href) return null;
  return (
    <p className="fr-more">
      <a className="fr-btn fr-btn--s" href={href} {...newTabIfMaps(href)}>
        {link.text}
        <Icon name="arrow" />
      </a>
    </p>
  );
}

/** Preis als Pille: kurz → Tabellenziffern, sonst klein und umbrechend. */
function Price({ price }: { price: string | undefined }) {
  const p = rowPrice(price);
  if (!p) return null;
  return "big" in p ? (
    <span className="fr-price">{p.big}</span>
  ) : (
    <span className="fr-price fr-price--note">{p.note}</span>
  );
}

/** Kachel mit Symbol oder zwei Buchstaben (dekorativ, Titel steht daneben). */
function Tile({ title }: { title: string }) {
  const icon = offerIcon(title);
  return (
    <span className="fr-tile" aria-hidden="true">
      {icon ? <Icon name={icon} /> : tileLetters(title)}
    </span>
  );
}

type Offer = { title: string; text?: string; price?: string };

/** Farbkarten (Systemblatt 7: Angebot). */
function OfferCards({ items }: { items: readonly Offer[] }) {
  return (
    <ul className="fr-offers" data-n={items.length}>
      {items.map((item, i) => (
        <li
          className={`fr-offer fr-tint-${tintOf(i)}`}
          key={`${item.title}-${i}`}
        >
          <div className="fr-offer-top">
            <Tile title={item.title} />
            <Price price={item.price} />
          </div>
          <h3 className="fr-offer-name">{rich(item.title)}</h3>
          {item.text && <p className="fr-offer-text">{rich(item.text)}</p>}
        </li>
      ))}
    </ul>
  );
}

/* ── Leistungen ──────────────────────────────────────────────────────── */

export function FreundlichServices({
  section,
  sections,
  anchorPrefix,
  place,
}: {
  section: SectionOf<"services">;
  sections: readonly FreundlichSection[];
  anchorPrefix: string;
  place: Place;
}) {
  const priceSlot = useSlot("pricelist", sections);
  if (section.items.length === 0) return null;
  return (
    <FreundlichChapter
      type="services"
      own={section.headline}
      intro={section.intro}
      place={place}
      layout="split"
    >
      <OfferCards
        items={section.items.map(i => ({
          title: i.title,
          text: i.description,
          price: i.price,
        }))}
      />
      <SectionLink link={section.link} anchorPrefix={anchorPrefix} />
      {priceSlot !== undefined && (
        <FreundlichPreviewCard title="Eure Preise" text={priceSlot} />
      )}
    </FreundlichChapter>
  );
}

/* ── Karte und Preise ────────────────────────────────────────────────── */

/**
 * Karte bzw. Preisliste: Eine kurze Karte (eine Kategorie, höchstens
 * acht Posten) steht als Farbkarten wie das Angebot (Systemblatt 11,
 * Gelato Mio); sonst je Kategorie eine Pastellkarte mit Posten, Beschreibung
 * und Preis rechts. Preise nur aus den Daten.
 */
export function FreundlichPriced({
  section,
  anchorPrefix,
  place,
}: {
  section: SectionOf<"menu"> | SectionOf<"pricelist">;
  anchorPrefix: string;
  place: Place;
}) {
  const categories = section.categories.filter(c => c.items.length > 0);
  if (categories.length === 0) return null;
  const short =
    categories.length === 1 && categories[0].items.length <= ITEM_CARDS_MAX;
  return (
    <FreundlichChapter type={section.type} own={section.headline} place={place}>
      {short ? (
        <OfferCards
          items={categories[0].items.map(item => ({
            title: item.name,
            text: item.description,
            price: item.price,
          }))}
        />
      ) : (
        <div className="fr-cats">
          {categories.map((c, ci) => (
            <div
              className={`fr-cat fr-tint-${tintOf(ci)}`}
              key={`${c.name}-${ci}`}
            >
              {c.name.trim() && <h3 className="fr-cat-name">{rich(c.name)}</h3>}
              <ul className="fr-rows">
                {c.items.map((item, i) => (
                  <li className="fr-row" key={`${item.name}-${i}`}>
                    <span className="fr-row-name">{rich(item.name)}</span>
                    <Price price={item.price} />
                    {item.description && (
                      <span className="fr-row-text">
                        {rich(item.description)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <SectionLink link={section.link} anchorPrefix={anchorPrefix} />
    </FreundlichChapter>
  );
}

/* ── Ablauf, Zahlen, Vorteile ────────────────────────────────────────── */

/** Schritte als weiße Karten mit Nummernkachel (Pastell im Wechsel). */
export function FreundlichProcess({
  section,
  place,
}: {
  section: SectionOf<"process">;
  place: Place;
}) {
  if (section.steps.length === 0) return null;
  return (
    <FreundlichChapter
      type="process"
      own={section.headline}
      place={place}
      layout="aside"
    >
      <ol className="fr-steps">
        {section.steps.map((s, i) => (
          <li className="fr-step" key={`${s.title}-${i}`}>
            <span
              className={`fr-tile fr-tile--no fr-tint-${tintOf(i)}`}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="fr-step-text">
              <h3 className="fr-step-name">{rich(s.title)}</h3>
              {s.text && <p className="fr-muted">{rich(s.text)}</p>}
            </div>
          </li>
        ))}
      </ol>
    </FreundlichChapter>
  );
}

/** Kennzahlen groß auf tiefer Fläche, Beschriftung rechts (Systemblatt 7). */
export function FreundlichStats({
  section,
  place,
}: {
  section: SectionOf<"stats">;
  place: Place;
}) {
  if (section.items.length === 0) return null;
  return (
    <FreundlichChapter
      type="stats"
      own={section.headline}
      place={place}
      layout="center"
    >
      <dl className="fr-figs">
        {section.items.map((item, i) => (
          <div className="fr-fig" key={`${item.value}-${i}`}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </FreundlichChapter>
  );
}

/** Vorteile als Farbkarten mit Haken-Kachel. */
export function FreundlichUsp({
  section,
  place,
}: {
  section: SectionOf<"usp">;
  place: Place;
}) {
  if (section.items.length === 0) return null;
  return (
    <FreundlichChapter type="usp" own={section.headline} place={place}>
      <ul className="fr-offers fr-offers--usp" data-n={section.items.length}>
        {section.items.map((item, i) => (
          <li
            className={`fr-offer fr-tint-${tintOf(i)}`}
            key={`${item.title}-${i}`}
          >
            <span className="fr-tile" aria-hidden="true">
              <Icon name="check" />
            </span>
            <h3 className="fr-offer-name">{rich(item.title)}</h3>
            {item.text && <p className="fr-offer-text">{rich(item.text)}</p>}
          </li>
        ))}
      </ul>
    </FreundlichChapter>
  );
}

/* ── Vorschau-Platzhalter als eigene Abschnitte ──────────────────────── */

function SlotSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="fr-slot-section">
      <div className="fr-wrap">{children}</div>
    </section>
  );
}

export function FreundlichMenuSlot({
  sections,
}: {
  sections: readonly FreundlichSection[];
}) {
  const { data, preview, blueprint } = useSystem();
  const real = menuVisible(data) && hasSection(sections, "menu");
  if (!preview || !blueprint.placeholders.includes("menu") || real) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.menu}>
      <FreundlichPreviewCard
        title={blueprint.headlines.menu ?? "Eure Karte"}
        text={blueprint.placeholderText.menu ?? ""}
      />
    </SlotSection>
  );
}

export function FreundlichTeamSlot({
  sections,
}: {
  sections: readonly FreundlichSection[];
}) {
  const text = useSlot("team", sections);
  if (text === undefined) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.team}>
      <FreundlichPreviewCard title="Euer Team" text={text} />
    </SlotSection>
  );
}

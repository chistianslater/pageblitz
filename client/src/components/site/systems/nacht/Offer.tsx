import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { menuVisible } from "../../artDirection/entryGastro";
import { useSystem } from "../SystemContext";
import {
  hasSection,
  newTabIfMaps,
  rowPrice,
  systemHref,
  useSlot,
} from "../shared";
import { dishCount, openerOf, type PairPhotos } from "./content";
import { NachtChapter, type NachtSection } from "./sections";
import { SMALL_WIDTHS, nachtSrcSet } from "./Entry";

/**
 * Angebot nach Systemblatt 10/15: Speisekarte je Kategorie (Name, Anzahl
 * der Gerichte, Kupferlinie; Gericht mit Beschreibung, Preis rechts in
 * Tabellenziffern — nur aus den Daten), Leistungen als Liste mit Preis
 * (Salon), Zimmer/Angebote als Karten auf der Fläche (Unterkunft), am
 * Desktop Kopf links und Liste rechts. Keine erfundenen Merkmale, Gänge,
 * Flächen oder „pro Nacht"-Zusätze.
 */

/** Gestrichelte Karte „Nur in deiner Vorschau" — nie auf der Live-Seite. */
export function NachtPreviewCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <aside className="nc-slot" aria-label={title}>
      <p className="nc-slot-kicker">Nur in deiner Vorschau</p>
      <h3 className="nc-slot-title">{title}</h3>
      {text && <p className="nc-slot-text">{text}</p>}
    </aside>
  );
}

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
    <a
      className="nc-btn nc-btn--s nc-sec-link"
      href={href}
      {...newTabIfMaps(href)}
    >
      {link.text}
    </a>
  );
}

/** Preis rechts: kurz → Kupfer in Tabellenziffern, sonst klein und umbrechend. */
function Price({ price }: { price: string | undefined }) {
  const p = rowPrice(price);
  if (!p) return null;
  return "big" in p ? (
    <span className="nc-pr">{p.big}</span>
  ) : (
    <span className="nc-pr nc-pr--note">{p.note}</span>
  );
}

/* ── Leistungen ──────────────────────────────────────────────────────── */

export function NachtServices({
  section,
  sections,
  anchorPrefix,
}: {
  section: SectionOf<"services">;
  sections: readonly NachtSection[];
  anchorPrefix: string;
}) {
  const { blueprint } = useSystem();
  const priceSlot = useSlot("pricelist", sections);
  const rooms = blueprint.id === "stay";
  if (section.items.length === 0) return null;
  return (
    <NachtChapter
      type="services"
      own={section.headline}
      intro={section.intro}
      opener={openerOf(section, sections, blueprint)}
      split
    >
      {rooms ? (
        <ul className="nc-rooms">
          {section.items.map((item, i) => (
            <li className="nc-room" key={`${item.title}-${i}`}>
              <h3 className="nc-room-name">{rich(item.title)}</h3>
              {item.description && (
                <p className="nc-room-text">{rich(item.description)}</p>
              )}
              {item.price?.trim() && (
                <p className="nc-room-price">
                  <Price price={item.price} />
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="nc-svc">
          {section.items.map((item, i) => (
            <li key={`${item.title}-${i}`}>
              <h3 className="nc-svc-name">{rich(item.title)}</h3>
              <Price price={item.price} />
              {item.description && (
                <p className="nc-svc-text">{rich(item.description)}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <SectionLink link={section.link} anchorPrefix={anchorPrefix} />
      {priceSlot !== undefined && (
        <NachtPreviewCard title="Deine Preise" text={priceSlot} />
      )}
    </NachtChapter>
  );
}

/* ── Karte und Preise ────────────────────────────────────────────────── */

/** Bildpaar: halbe Breite am Handy, ein Fünftel am Desktop. */
function pairSrcSet(url: string) {
  const srcSet = nachtSrcSet(url, SMALL_WIDTHS);
  return srcSet
    ? { srcSet, sizes: "(min-width: 64rem) 20vw, 50vw" }
    : {};
}

/** Zwei Galeriefotos versetzt (Systemblatt 10/15), Schleier in Grundfarbe. */
function Pair({ pair }: { pair: PairPhotos }) {
  return (
    <div className="nc-pair">
      {pair.map((photo, i) => (
        <figure className="nc-pair-pic" key={photo.url}>
          <img
            src={photo.url}
            {...pairSrcSet(photo.url)}
            alt={photo.alt}
            width={i === 0 ? 800 : 600}
            height={1000}
            loading="lazy"
            decoding="async"
          />
        </figure>
      ))}
    </div>
  );
}

/**
 * Karte bzw. Preisliste: je Kategorie Name (Gilda) und — nur an der
 * Karte — die Anzahl der Gerichte, darunter die Posten mit Beschreibung
 * und Preis. Lange Namen brechen um, der Preis bleibt rechts.
 */
export function NachtPriced({
  section,
  sections,
  anchorPrefix,
  pair,
}: {
  section: SectionOf<"menu"> | SectionOf<"pricelist">;
  sections: readonly NachtSection[];
  anchorPrefix: string;
  pair?: PairPhotos;
}) {
  const { blueprint } = useSystem();
  const categories = section.categories.filter(c => c.items.length > 0);
  const menu = section.type === "menu";
  return (
    <NachtChapter
      type={section.type}
      own={section.headline}
      opener={openerOf(section, sections, blueprint)}
      split
      aside={pair ? <Pair pair={pair} /> : undefined}
    >
      <div
        className={categories.length > 1 ? "nc-cats nc-cats--many" : "nc-cats"}
      >
        {categories.map((c, ci) => (
          <div className="nc-cat" key={`${c.name}-${ci}`}>
            {(c.name.trim() || menu) && (
              <h3 className="nc-cat-head">
                <span className="nc-cat-name">{rich(c.name)}</span>
                {menu && (
                  <small className="nc-cat-count">
                    {dishCount(c.items.length)}
                  </small>
                )}
              </h3>
            )}
            <ul className="nc-dishes">
              {c.items.map((item, i) => (
                <li className="nc-dish" key={`${item.name}-${i}`}>
                  <span className="nc-dish-name">{rich(item.name)}</span>
                  <Price price={item.price} />
                  {item.description && (
                    <span className="nc-dish-text">
                      {rich(item.description)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <SectionLink link={section.link} anchorPrefix={anchorPrefix} />
    </NachtChapter>
  );
}

/* ── Ablauf, Zahlen, Vorteile ────────────────────────────────────────── */

/** Schritte so, wie sie dastehen: Nummer im Kupferring, Titel, Satz. */
export function NachtProcess({ section }: { section: SectionOf<"process"> }) {
  if (section.steps.length === 0) return null;
  return (
    <NachtChapter type="process" own={section.headline}>
      <ol className="nc-steps">
        {section.steps.map((s, i) => (
          <li className="nc-step" key={`${s.title}-${i}`}>
            <span className="nc-ring nc-ring--no" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3 className="nc-item-title">{rich(s.title)}</h3>
              {s.text && <p className="nc-item-text">{rich(s.text)}</p>}
            </div>
          </li>
        ))}
      </ol>
    </NachtChapter>
  );
}

export function NachtStats({ section }: { section: SectionOf<"stats"> }) {
  if (section.items.length === 0) return null;
  return (
    <NachtChapter type="stats" own={section.headline}>
      <dl className="nc-figs">
        {section.items.map((item, i) => (
          <div className="nc-figs-item" key={`${item.value}-${i}`}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </NachtChapter>
  );
}

/** Vorteile als Liste mit Kupferpunkt. */
export function NachtUsp({ section }: { section: SectionOf<"usp"> }) {
  if (section.items.length === 0) return null;
  return (
    <NachtChapter type="usp" own={section.headline}>
      <ul className="nc-points">
        {section.items.map((item, i) => (
          <li className="nc-point" key={`${item.title}-${i}`}>
            <h3 className="nc-item-title">{rich(item.title)}</h3>
            {item.text && <p className="nc-item-text">{rich(item.text)}</p>}
          </li>
        ))}
      </ul>
    </NachtChapter>
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
    <section id={id} className="nc-slot-section">
      <div className="nc-wrap">{children}</div>
    </section>
  );
}

export function NachtMenuSlot({
  sections,
}: {
  sections: readonly NachtSection[];
}) {
  const { data, preview, blueprint } = useSystem();
  const real = menuVisible(data) && hasSection(sections, "menu");
  if (!preview || !blueprint.placeholders.includes("menu") || real) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.menu}>
      <NachtPreviewCard
        title={blueprint.headlines.menu ?? "Die Karte"}
        text={blueprint.placeholderText.menu ?? ""}
      />
    </SlotSection>
  );
}

export function NachtTeamSlot({
  sections,
}: {
  sections: readonly NachtSection[];
}) {
  const text = useSlot("team", sections);
  if (text === undefined) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.team}>
      <NachtPreviewCard title="Euer Team" text={text} />
    </SlotSection>
  );
}

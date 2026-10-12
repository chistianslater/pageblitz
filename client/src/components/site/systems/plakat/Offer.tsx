import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { coversToday } from "../../artDirection/heroFacts";
import { menuVisible } from "../../artDirection/entryGastro";
import { useSystem } from "../SystemContext";
import {
  hasSection,
  isDayName,
  normalizeDay,
  useSlot,
  versalEszett,
} from "../shared";
import { PlakatChapter, chapterTitle, type PlakatSection } from "./sections";
import { rowPrice } from "./offerData";
import type { Field } from "./rhythm";

/**
 * Angebot nach Systemblatt (Bausteine „Leistungen, Preise", „Karte",
 * „01·02·03"): Leistungen und Preise als Riesenliste in League Gothic mit
 * Preis rechts (nur aus den Daten), Karte mit Farbpunkt je Kategorie,
 * Gericht in h3 und Preis in `mark`, Ablauf als riesige 01·02·03 (mit
 * Bogen-Foto aus der Galerie, wenn eins frei ist), Zahlen als Ziffernzeile.
 * Kein Stundenplan (Betreiber 2026-10-12): Kurse stehen als Leistungen.
 */

type Props<T extends PlakatSection["type"]> = {
  section: Extract<PlakatSection, { type: T }>;
  sections: readonly PlakatSection[];
  field: Field;
};

type Link = SectionOf<"services">["link"];

/** Weiterführender Link eines Abschnitts als Tinte-Pille. */
export function SectionLink({ link }: { link: Link }) {
  if (!link) return null;
  return (
    <p className="pk-more">
      <a className="pk-btn" href={link.href}>
        {link.text}
        <i aria-hidden="true">→</i>
      </a>
    </p>
  );
}

/** Gestrichelte Karte „Nur in deiner Vorschau" — nie auf der Live-Seite. */
export function PreviewCard({ title, text }: { title: string; text: string }) {
  return (
    <aside className="pk-slot" aria-label={title}>
      <p className="pk-slot-kicker">Nur in deiner Vorschau</p>
      <h3 className="pk-slot-title">{title}</h3>
      {text && <p className="pk-slot-text">{text}</p>}
    </aside>
  );
}

/** Preis rechts in der Zeile: groß, wenn lesbar; sonst klein. */
function Price({ price, cls }: { price?: string; cls: string }) {
  const p = rowPrice(price);
  if (!p) return null;
  return "big" in p ? (
    <span className={cls}>{p.big}</span>
  ) : (
    <span className="pk-row-note">{p.note}</span>
  );
}

/* ── Leistungen ──────────────────────────────────────────────────────── */

export function PlakatServices({ section, sections, field }: Props<"services">) {
  const { blueprint } = useSystem();
  const priceSlot = useSlot("pricelist", sections);
  return (
    <PlakatChapter
      type="services"
      field={field}
      title={chapterTitle("services", section.headline, blueprint)}
      intro={section.intro}
    >
      <ul className="pk-rows">
        {section.items.map((item, i) => (
          <li className="pk-row" key={`${item.title}-${i}`}>
            <h3 className="pk-row-name">{rich(versalEszett(item.title))}</h3>
            <Price price={item.price} cls="pk-row-price" />
            {item.description && (
              <p className="pk-row-text">{rich(item.description)}</p>
            )}
          </li>
        ))}
      </ul>
      <SectionLink link={section.link} />
      {priceSlot !== undefined && (
        <PreviewCard title="Deine Preise" text={priceSlot} />
      )}
    </PlakatChapter>
  );
}

/* ── Preise und Karte ────────────────────────────────────────────────── */

type Priced = SectionOf<"pricelist"> | SectionOf<"menu">;

/** Tafel-Zeile: „heute" nur bei reinen Wochentagen (Mittagstisch, Kurstag). */
function useToday(name: string): boolean {
  const { now } = useSystem();
  return isDayName(name) && coversToday(normalizeDay(name), now);
}

function TodayMark({ on }: { on: boolean }) {
  return on ? <em className="pk-today">Heute</em> : null;
}

function BigRow({
  item,
  sub,
}: {
  item: Priced["categories"][number]["items"][number];
  /** Unter einer Kategorie-Überschrift: h4 statt h3. */
  sub: boolean;
}) {
  const today = useToday(item.name);
  const Tag = sub ? "h4" : "h3";
  return (
    <li className={today ? "pk-row pk-row--today" : "pk-row"}>
      <Tag className="pk-row-name">
        {rich(versalEszett(item.name))}
        <TodayMark on={today} />
      </Tag>
      <Price price={item.price} cls="pk-row-price" />
      {item.description && (
        <p className="pk-row-text">{rich(item.description)}</p>
      )}
    </li>
  );
}

function MenuRow({ item }: { item: Priced["categories"][number]["items"][number] }) {
  const today = useToday(item.name);
  return (
    <li className={today ? "pk-mrow pk-row--today" : "pk-mrow"}>
      <h4 className="pk-mrow-name">
        {rich(item.name)}
        <TodayMark on={today} />
      </h4>
      <Price price={item.price} cls="pk-mrow-price" />
      {item.description && (
        <p className="pk-mrow-text">{rich(item.description)}</p>
      )}
    </li>
  );
}

/**
 * Preise: Riesenliste wie die Leistungen (mehrere Kategorien mit Farbpunkt
 * davor). Karte: Kategorie mit Farbpunkt in League Gothic, Gerichte in der
 * Grotesk, Preis in `mark`. Beides auf der Fläche des Rhythmus.
 */
export function PlakatPriced({
  section,
  field,
}: {
  section: Priced;
  field: Field;
}) {
  const { blueprint } = useSystem();
  const type = section.type;
  const categories = section.categories.filter(c => c.items.length > 0);
  const single = categories.length === 1;
  const menu = type === "menu";
  return (
    <PlakatChapter
      type={type}
      field={field}
      title={chapterTitle(type, section.headline, blueprint)}
    >
      {categories.map(category => (
        <div className="pk-cat" key={category.name}>
          {(menu || !single) && (
            <h3 className="pk-cat-name">
              <i aria-hidden="true" />
              {rich(versalEszett(category.name))}
            </h3>
          )}
          {menu ? (
            <ul className="pk-mrows">
              {category.items.map((item, i) => (
                <MenuRow item={item} key={`${item.name}-${i}`} />
              ))}
            </ul>
          ) : (
            <ul className="pk-rows">
              {category.items.map((item, i) => (
                <BigRow item={item} sub={!single} key={`${item.name}-${i}`} />
              ))}
            </ul>
          )}
        </div>
      ))}
      <SectionLink link={section.link} />
    </PlakatChapter>
  );
}

/* ── Ablauf 01·02·03 ─────────────────────────────────────────────────── */

const two = (n: number) => String(n).padStart(2, "0");

export function PlakatProcess({
  section,
  field,
  photo,
}: Props<"process"> & { photo?: string }) {
  const { blueprint } = useSystem();
  return (
    <PlakatChapter
      type="process"
      field={field}
      title={chapterTitle("process", section.headline, blueprint)}
      className={photo ? "pk-process--photo" : undefined}
      aside={
        photo ? (
          <div className="pk-process-media">
            <div className="pk-shape pk-shape--arch">
              {/* Galeriefoto, Maße unbekannt: width/height nur gegen Sprünge. */}
              <img
                src={photo}
                alt=""
                width={1200}
                height={1500}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        ) : undefined
      }
    >
      <ol className="pk-steps">
        {section.steps.map((s, i) => (
          <li className="pk-step" key={`${s.title}-${i}`}>
            <span className="pk-step-no" aria-hidden="true">
              {two(i + 1)}
            </span>
            <h3 className="pk-step-title">{rich(s.title)}</h3>
            {s.text && <p className="pk-step-text">{rich(s.text)}</p>}
          </li>
        ))}
      </ol>
    </PlakatChapter>
  );
}

/* ── Zahlen ──────────────────────────────────────────────────────────── */

export function PlakatStats({ section, field }: Props<"stats">) {
  const { blueprint } = useSystem();
  return (
    <PlakatChapter
      type="stats"
      field={field}
      title={chapterTitle("stats", section.headline, blueprint)}
    >
      <ul className="pk-figs">
        {section.items.map((item, i) => (
          <li key={`${item.value}-${i}`}>
            <span className="pk-fig-value">{versalEszett(item.value)}</span>
            <span className="pk-fig-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </PlakatChapter>
  );
}

/* ── Vorschau-Platzhalter als eigene Abschnitte ──────────────────────── */

/** Platzhalter setzt die Fläche des vorigen Abschnitts fort (Rhythmus bleibt). */
function SlotSection({
  id,
  field,
  children,
}: {
  id: string;
  field: Field;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`pk-slot-section pk-${field}`}>
      <div className="pk-wrap">{children}</div>
    </section>
  );
}

export function PlakatMenuSlot({
  sections,
  field,
}: {
  sections: readonly PlakatSection[];
  field: Field;
}) {
  const { data, preview, blueprint } = useSystem();
  const real = menuVisible(data) && hasSection(sections, "menu");
  if (!preview || !blueprint.placeholders.includes("menu") || real) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.menu} field={field}>
      <PreviewCard
        title={blueprint.headlines.menu ?? "Karte"}
        text={blueprint.placeholderText.menu ?? ""}
      />
    </SlotSection>
  );
}

export function PlakatTeamSlot({
  sections,
  field,
}: {
  sections: readonly PlakatSection[];
  field: Field;
}) {
  const text = useSlot("team", sections);
  if (text === undefined) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.team} field={field}>
      <PreviewCard title="Euer Team" text={text} />
    </SlotSection>
  );
}

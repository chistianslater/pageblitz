import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { menuVisible } from "../../artDirection/entryGastro";
import { useSystem } from "../SystemContext";
import { hasSection, rowPrice, useSlot, newTabIfMaps } from "../shared";
import { klarHref } from "./facts";
import { Icon } from "./icons";
import { KlarChapter, type KlarSection } from "./sections";

/**
 * Angebot nach Systemblatt 9/10/13: Leistungen als weiche Karten (bei
 * vier die erste groß auf Lind, die zweite getönt), Preise als klare
 * Tabelle (Betrag rechts, nur aus den Daten), erster Termin als Schritte
 * mit Linie (Desktop: Karten), Zahlen und Vorteile in derselben Ruhe.
 * Keine erfundenen Dauern, keine „Mehr dazu"-Links ohne Ziel.
 */

/** Gestrichelte Karte „Nur in deiner Vorschau" — nie auf der Live-Seite. */
export function KlarPreviewCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <aside className="kl-slot" aria-label={title}>
      <p className="kl-slot-kicker">Nur in deiner Vorschau</p>
      <h3 className="kl-slot-title">{title}</h3>
      {text && <p className="kl-slot-text">{text}</p>}
    </aside>
  );
}

type Link = SectionOf<"services">["link"];

/**
 * Weiterführender Link als Nebenknopf rechts neben dem Titel — nur mit
 * gültigem Ziel (klarHref: absolute Links, Anker nur auf sichtbare
 * Abschnitte, mit Präfix auf Unterseiten); sonst kein Knopf.
 */
function LinkAction({ link, anchorPrefix }: { link: Link; anchorPrefix: string }) {
  const { data } = useSystem();
  const href = klarHref(link?.href, data, anchorPrefix);
  if (!link || !href) return null;
  return (
    <a className="kl-btn kl-btn--s kl-sec-link" href={href} {...newTabIfMaps(href)}>
      {link.text}
    </a>
  );
}

const linkAction = (link: Link, anchorPrefix: string) =>
  link ? <LinkAction link={link} anchorPrefix={anchorPrefix} /> : undefined;

/** Ab so vielen Karten trägt die erste die Lind-Fläche (Desktop groß). */
const LEAD_FROM = 4;

/* ── Leistungen ──────────────────────────────────────────────────────── */

export function KlarServices({
  section,
  sections,
  anchorPrefix,
}: {
  section: SectionOf<"services">;
  sections: readonly KlarSection[];
  anchorPrefix: string;
}) {
  const priceSlot = useSlot("pricelist", sections);
  const n = section.items.length;
  const tone = (i: number) =>
    i === 0 && n >= LEAD_FROM
      ? " kl-svc-card--lead"
      : i === 1
        ? " kl-svc-card--tint"
        : "";
  return (
    <KlarChapter
      type="services"
      own={section.headline}
      intro={section.intro}
      action={linkAction(section.link, anchorPrefix)}
    >
      <ul className="kl-svc" data-n={n}>
        {section.items.map((item, i) => {
          const p = rowPrice(item.price);
          return (
            <li className={`kl-svc-card${tone(i)}`} key={`${item.title}-${i}`}>
              <h3 className="kl-svc-name">{rich(item.title)}</h3>
              {item.description && (
                <p className="kl-svc-text">{rich(item.description)}</p>
              )}
              {p &&
                ("big" in p ? (
                  <p className="kl-svc-price">{p.big}</p>
                ) : (
                  <p className="kl-svc-note">{p.note}</p>
                ))}
            </li>
          );
        })}
      </ul>
      {priceSlot !== undefined && (
        <KlarPreviewCard title="Deine Preise" text={priceSlot} />
      )}
    </KlarChapter>
  );
}

/* ── Preise und Karte ────────────────────────────────────────────────── */

type Priced = SectionOf<"pricelist"> | SectionOf<"menu">;

/** Betrag rechts: kurz → groß (rowPrice ergänzt €), sonst klein und umbrechend. */
function PriceCell({ price }: { price: string }) {
  const p = rowPrice(price);
  if (!p) return <td />;
  return (
    <td>
      {"big" in p ? (
        <span className="kl-pval">{p.big}</span>
      ) : (
        <span className="kl-pnote">{p.note}</span>
      )}
    </td>
  );
}

/**
 * Preisliste und Karte als Tabelle je Kategorie: Kategorie als Titel der
 * Tabelle, Name (und Beschreibung) als Zeilenkopf, Betrag rechts.
 */
export function KlarPriced({
  section,
  anchorPrefix,
}: {
  section: Priced;
  anchorPrefix: string;
}) {
  const categories = section.categories.filter(c => c.items.length > 0);
  return (
    <KlarChapter
      type={section.type}
      own={section.headline}
      action={linkAction(section.link, anchorPrefix)}
    >
      <div className="kl-prices">
        {categories.map(category => (
          <table className="kl-ptable" key={category.name}>
            {category.name.trim() && (
              <caption className="kl-pcat">{category.name}</caption>
            )}
            <tbody>
              {category.items.map((item, i) => (
                <tr key={`${item.name}-${i}`}>
                  <th scope="row">
                    <span className="kl-pname">{rich(item.name)}</span>
                    {item.description && (
                      <span className="kl-pdesc">{rich(item.description)}</span>
                    )}
                  </th>
                  <PriceCell price={item.price} />
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </KlarChapter>
  );
}

/* ── Erster Termin / Erstgespräch ────────────────────────────────────── */

/**
 * Schritte aus dem Ablauf, so wie sie dastehen (keine Dauer dazu). Am
 * Handy eine senkrechte Linie mit Nummern-Kreisen (erster gefüllt), am
 * Desktop Karten in zwei Spalten.
 */
export function KlarProcess({ section }: { section: SectionOf<"process"> }) {
  return (
    <KlarChapter type="process" own={section.headline}>
      <ol className="kl-steps-list">
        {section.steps.map((s, i) => (
          <li className="kl-step" key={`${s.title}-${i}`}>
            <span className="kl-step-no" aria-hidden="true">
              {i + 1}
            </span>
            <div className="kl-step-body">
              <h3 className="kl-step-title">{rich(s.title)}</h3>
              {s.text && <p className="kl-step-text">{rich(s.text)}</p>}
            </div>
          </li>
        ))}
      </ol>
    </KlarChapter>
  );
}

/* ── Zahlen und Vorteile ─────────────────────────────────────────────── */

export function KlarStats({ section }: { section: SectionOf<"stats"> }) {
  return (
    <KlarChapter type="stats" own={section.headline}>
      <dl className="kl-figs">
        {section.items.map((item, i) => (
          <div className="kl-fig" key={`${item.value}-${i}`}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </KlarChapter>
  );
}

/** Vorteile als ruhige Punkte mit Haken (Symbol lokal, dekorativ). */
export function KlarUsp({ section }: { section: SectionOf<"usp"> }) {
  // Doppel zu den Chips entfernt schon withoutChipEchoes (index.tsx).
  if (section.items.length === 0) return null;
  return (
    <KlarChapter type="usp" own={section.headline}>
      <ul className="kl-points">
        {section.items.map((item, i) => (
          <li className="kl-point" key={`${item.title}-${i}`}>
            <span className="kl-point-ic">
              <Icon name="check" />
            </span>
            <div>
              <h3 className="kl-point-title">{rich(item.title)}</h3>
              {item.text && <p className="kl-point-text">{rich(item.text)}</p>}
            </div>
          </li>
        ))}
      </ul>
    </KlarChapter>
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
    <section id={id} className="kl-slot-section">
      <div className="kl-wrap">{children}</div>
    </section>
  );
}

export function KlarMenuSlot({
  sections,
}: {
  sections: readonly KlarSection[];
}) {
  const { data, preview, blueprint } = useSystem();
  const real = menuVisible(data) && hasSection(sections, "menu");
  if (!preview || !blueprint.placeholders.includes("menu") || real) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.menu}>
      <KlarPreviewCard
        title={blueprint.headlines.menu ?? "Karte"}
        text={blueprint.placeholderText.menu ?? ""}
      />
    </SlotSection>
  );
}

export function KlarTeamSlot({
  sections,
}: {
  sections: readonly KlarSection[];
}) {
  const text = useSlot("team", sections);
  if (text === undefined) return null;
  return (
    <SlotSection id={SECTION_ANCHORS.team}>
      <KlarPreviewCard title="Euer Team" text={text} />
    </SlotSection>
  );
}

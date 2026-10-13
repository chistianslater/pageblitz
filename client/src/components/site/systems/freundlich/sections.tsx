import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { useSystem } from "../SystemContext";
import {
  addressLine,
  legalParts,
  mailHref,
  mapsHref,
  newTabIfMaps,
  systemHref,
  type SystemSection,
} from "../shared";
import { telHref } from "../shared/heroFacts";
import { hoursRows } from "../shared/hours";
import { FreundlichEntry } from "./Entry";
import { freundlichActions, monogramOf } from "./facts";
import { Icon, wayIcon } from "./icons";

/**
 * Abschnitte von Freundlich — F2: Einstieg fertig, die übrigen Abschnitte
 * in einer schlichten Übergangsfassung (Titel, Inhalt nur aus Daten,
 * Pastellkarten). F3 baut sie nach Systemblatt 7/8/11–18 aus.
 */

export type FreundlichSection = SystemSection;

const LABELS: Partial<Record<FreundlichSection["type"], string>> = {
  services: "Unser Angebot",
  process: "So läuft es ab",
  pricelist: "Preise",
  menu: "Unsere Karte",
  team: "Wer bei uns ist",
  about: "Über uns",
  gallery: "Einblicke",
  testimonials: "Was andere sagen",
  faq: "Gut zu wissen",
  contact: "Besuch uns",
  story: "Unsere Geschichte",
  usp: "Darauf könnt ihr zählen",
  stats: "In Zahlen",
  partners: "Partner",
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

/**
 * Abschnitte auf dem Band (Wechselfläche). Eine Quelle für die Kapitel und
 * für die Wolke des Einstiegs, die in die nächste Fläche führt.
 */
export const BAND_TYPES: ReadonlySet<FreundlichSection["type"]> = new Set([
  "services",
  "team",
  "testimonials",
  "cta",
]);

/** Pastell je Eintrag (1–4 im Wechsel). */
const tint = (i: number) => `fr-tint-${(i % 4) + 1}`;

/** Ein Kapitel: h2, Einleitung, Inhalt. `band`: Wechselfläche. */
export function FreundlichChapter({
  type,
  own,
  intro,
  children,
}: {
  type: FreundlichSection["type"];
  own?: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  const { blueprint } = useSystem();
  const band = BAND_TYPES.has(type);
  const id = SECTION_ANCHORS[type];
  const headingId = `${id}-titel`;
  const name = type === "menu" ? "karte" : type;
  return (
    <section
      id={id}
      className={`fr-sec fr-sec--${name}${band ? " fr-sec--band" : ""}`}
      aria-labelledby={headingId}
    >
      <div className="fr-wrap">
        <h2 className="fr-h2" id={headingId}>
          {rich(chapterTitle(type, own, blueprint))}
        </h2>
        {intro && <p className="fr-intro">{rich(intro)}</p>}
        {children}
      </div>
    </section>
  );
}

function Cards({
  items,
}: {
  items: { title: string; text?: string; meta?: string }[];
}) {
  return (
    <ul className="fr-cards">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className={`fr-card ${tint(i)}`}>
          {item.meta && <span className="fr-price">{item.meta}</span>}
          <h3 className="fr-h3">{rich(item.title)}</h3>
          {item.text && <p>{rich(item.text)}</p>}
        </li>
      ))}
    </ul>
  );
}

function Priced({ section }: { section: SectionOf<"menu"> | SectionOf<"pricelist"> }) {
  return (
    <FreundlichChapter type={section.type} own={section.headline}>
      {section.categories
        .filter(c => c.items.length > 0)
        .map(c => (
          <div key={c.name} className="fr-priced">
            <h3 className="fr-h3">{rich(c.name)}</h3>
            <ul>
              {c.items.map((item, i) => (
                <li key={`${item.name}-${i}`}>
                  <span>
                    {rich(item.name)}
                    {item.description && (
                      <small>{rich(item.description)}</small>
                    )}
                  </span>
                  <b>{item.price}</b>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </FreundlichChapter>
  );
}

function Contact({ section }: { section: SectionOf<"contact"> }) {
  const { now, contactIsland } = useSystem();
  const tel = telHref(section.phone);
  const mail = mailHref(section.email);
  const address = addressLine(section);
  const rows = hoursRows(section.openingHours, now);
  return (
    <FreundlichChapter type="contact" own={section.headline}>
      <div className="fr-visit">
        {rows.length > 0 && (
          <div className={`fr-card ${tint(0)}`}>
            <h3 className="fr-h3">Öffnungszeiten</h3>
            <dl className="fr-hours">
              {rows.map(r => (
                <div key={r.label} className={r.today ? "fr-today" : undefined}>
                  <dt>{r.label}</dt>
                  <dd>{r.lines.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {(address || tel || mail) && (
          <div className={`fr-card ${tint(2)}`}>
            <h3 className="fr-h3">So findet ihr uns</h3>
            {section.street && (
              <address>
                {section.street}
                <br />
                {[section.zip, section.city].filter(Boolean).join(" ")}
              </address>
            )}
            <ul className="fr-ways">
              {tel && section.phone && (
                <li>
                  <a href={tel}>
                    <Icon name="phone" />
                    {section.phone.trim()}
                  </a>
                </li>
              )}
              {mail && section.email && (
                <li>
                  <a href={mail}>
                    <Icon name="mail" />
                    {section.email.trim()}
                  </a>
                </li>
              )}
              {address && (
                <li>
                  <a href={mapsHref(address)} {...newTabIfMaps(mapsHref(address))}>
                    <Icon name="route" />
                    Route planen
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {contactIsland && <h3 className="fr-form-title">Nachricht schreiben</h3>}
    </FreundlichChapter>
  );
}

function Cta({
  section,
  anchorPrefix,
}: {
  section: SectionOf<"cta">;
  anchorPrefix: string;
}) {
  const { data, blueprint } = useSystem();
  const own = systemHref(section.ctaHref, data, anchorPrefix);
  const { primary } = freundlichActions(data, blueprint, anchorPrefix);
  const target = own
    ? { label: section.ctaText.trim() || primary?.label || "", href: own }
    : primary;
  return (
    <FreundlichChapter type="cta" own={section.headline}>
      {target && (
        <div className="fr-ctas fr-ctas--start">
          <a
            className="fr-btn fr-btn--p"
            href={target.href}
            {...newTabIfMaps(target.href)}
          >
            <Icon name={wayIcon(target.href)} />
            {target.href.startsWith("tel:") ? "Anrufen" : target.label}
          </a>
        </div>
      )}
    </FreundlichChapter>
  );
}

/**
 * Unter- und Rechtsseiten-Kopf: Rückweg zur Startseite, Name gedämpft,
 * Titel als einziges h1 (`secondary` = weiterer Kopf als h2).
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
 * Rechtsseite im Freundlich-Rahmen (legalParts).
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
 */
export function renderFreundlichSection(
  section: FreundlichSection,
  sections: readonly FreundlichSection[],
  anchorPrefix = "",
  back?: string
): React.ReactNode {
  switch (section.type) {
    case "hero": {
      const next = sections[sections.indexOf(section) + 1];
      return (
        <FreundlichEntry
          hero={section}
          nextBand={Boolean(next && BAND_TYPES.has(next.type))}
        />
      );
    }
    case "services":
      return (
        <FreundlichChapter type="services" own={section.headline} intro={section.intro}>
          <Cards
            items={section.items.map(i => ({
              title: i.title,
              text: i.description,
              meta: i.price,
            }))}
          />
        </FreundlichChapter>
      );
    case "pricelist":
    case "menu":
      return <Priced section={section} />;
    case "process":
      return (
        <FreundlichChapter type="process" own={section.headline}>
          <ol className="fr-steps">
            {section.steps.map((s, i) => (
              <li key={`${s.title}-${i}`} className={tint(i)}>
                <span className="fr-tile" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="fr-h3">{rich(s.title)}</h3>
                {s.text && <p>{rich(s.text)}</p>}
              </li>
            ))}
          </ol>
        </FreundlichChapter>
      );
    case "stats":
      return (
        <FreundlichChapter type="stats" own={section.headline}>
          <dl className="fr-stats">
            {section.items.map((s, i) => (
              <div key={`${s.label}-${i}`}>
                <dt>{rich(s.label)}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </FreundlichChapter>
      );
    case "usp":
      return (
        <FreundlichChapter type="usp" own={section.headline}>
          <Cards items={section.items.map(i => ({ title: i.title, text: i.text }))} />
        </FreundlichChapter>
      );
    case "team":
      return (
        <FreundlichChapter type="team" own={section.headline}>
          <ul className="fr-cards">
            {section.members.map((m, i) => (
              <li key={`${m.name}-${i}`} className={`fr-card fr-person ${tint(i)}`}>
                <span className="fr-avatar" aria-hidden="true">
                  {monogramOf(m.name)}
                </span>
                <h3 className="fr-h3">{m.name}</h3>
                {m.role && <p>{m.role}</p>}
              </li>
            ))}
          </ul>
        </FreundlichChapter>
      );
    case "about":
      return (
        <FreundlichChapter type="about" own={section.headline}>
          <div className="fr-about">
            <p className="fr-body">{rich(section.body)}</p>
            {section.imageUrl && (
              <figure className="fr-photo">
                <img src={section.imageUrl} alt="" loading="lazy" width={900} height={675} />
              </figure>
            )}
          </div>
        </FreundlichChapter>
      );
    case "gallery":
      return section.images.length > 0 ? (
        <FreundlichChapter type="gallery" own={section.headline}>
          <ul className="fr-gallery">
            {section.images.map((img, i) => (
              <li key={`${img.url}-${i}`}>
                <img src={img.url} alt={img.alt} loading="lazy" width={800} height={800} />
              </li>
            ))}
          </ul>
        </FreundlichChapter>
      ) : null;
    case "testimonials":
      return (
        <FreundlichChapter type="testimonials" own={section.headline}>
          <ul className="fr-cards">
            {section.items.slice(0, 3).map((t, i) => (
              <li key={`${t.author}-${i}`} className={`fr-card ${tint(i)}`}>
                <blockquote>„{rich(t.text)}“</blockquote>
                <p className="fr-who">{t.author}</p>
              </li>
            ))}
          </ul>
        </FreundlichChapter>
      );
    case "story":
      return (
        <FreundlichChapter type="story" own={section.headline}>
          <p className="fr-body">{rich(section.body)}</p>
        </FreundlichChapter>
      );
    case "quote":
      return (
        <FreundlichChapter type="quote">
          <blockquote className="fr-quote">
            {rich(section.text)}
            {section.author && <footer>{section.author}</footer>}
          </blockquote>
        </FreundlichChapter>
      );
    case "partners":
      return (
        <FreundlichChapter type="partners" own={section.headline}>
          <ul className="fr-partners">
            {section.items.map((p, i) => (
              <li key={`${p.name}-${i}`}>{p.name}</li>
            ))}
          </ul>
        </FreundlichChapter>
      );
    case "faq":
      return (
        <FreundlichChapter type="faq" own={section.headline}>
          <div className="fr-faq">
            {section.items.map((q, i) => (
              <details key={`${q.question}-${i}`}>
                <summary>{rich(q.question)}</summary>
                <p>{rich(q.answer)}</p>
              </details>
            ))}
          </div>
        </FreundlichChapter>
      );
    case "contact":
      return <Contact section={section} />;
    case "cta":
      return <Cta section={section} anchorPrefix={anchorPrefix} />;
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

import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { telHref } from "../../artDirection/heroFacts";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { useSystem } from "../SystemContext";
import {
  addressLine,
  formatPrice,
  legalParts,
  mailHref,
  mapsHref,
  newTabIfMaps,
  unquote,
  type SystemSection,
} from "../shared";
import { hoursRows, realHours } from "../shared/hours";
import { NachtEntry } from "./Entry";
import { kitchenOf, nachtActions } from "./facts";

/**
 * Abschnitte von Nacht. Einstieg nach Systemblatt 9/14 (N2+N3); alle
 * übrigen Kapitel vorerst als ruhige Nacht-Blöcke (Titel in Kupfer, Linien,
 * nur Daten) — N4–N6 ersetzen sie nach Systemblatt 10–16.
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

/** Ein Kapitel: h2 in Kupfer, optional Einleitung, dann der Inhalt. */
export function NachtChapter({
  type,
  own,
  intro,
  children,
}: {
  type: NachtSection["type"];
  own?: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS[type];
  const headingId = `${id}-titel`;
  const name = type === "menu" ? "karte" : type;
  return (
    <section
      id={id}
      className={`nc-sec nc-${name}`}
      aria-labelledby={headingId}
    >
      <div className="nc-wrap">
        <h2 className="nc-h2" id={headingId}>
          {rich(chapterTitle(type, own, blueprint))}
        </h2>
        {intro && <p className="nc-intro">{rich(intro)}</p>}
        {children}
      </div>
    </section>
  );
}

/** Zeilenliste: Titel, Text, Preis rechts (nur aus Daten). */
function Rows({
  rows,
}: {
  rows: { title: string; text?: string; price?: string }[];
}) {
  return (
    <ul className="nc-rows">
      {rows.map((r, i) => (
        <li key={`${r.title}-${i}`}>
          <span className="nc-row-t">{rich(r.title)}</span>
          {r.price?.trim() && (
            <span className="nc-row-p">{formatPrice(r.price)}</span>
          )}
          {r.text?.trim() && <span className="nc-row-d">{rich(r.text)}</span>}
        </li>
      ))}
    </ul>
  );
}

const paragraphs = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

function Body({ text }: { text: string }) {
  return (
    <div className="nc-body">
      {paragraphs(text).map((p, i) => (
        <p key={i}>{rich(p)}</p>
      ))}
    </div>
  );
}

function Priced({
  section,
}: {
  section: SectionOf<"menu"> | SectionOf<"pricelist">;
}) {
  return (
    <NachtChapter type={section.type} own={section.headline}>
      {section.categories.map((c, i) => (
        <div key={`${c.name}-${i}`} className="nc-cat">
          <h3 className="nc-h3">{rich(c.name)}</h3>
          <Rows
            rows={c.items.map(item => ({
              title: item.name,
              text: item.description,
              price: item.price,
            }))}
          />
        </div>
      ))}
    </NachtChapter>
  );
}

function Contact({ section }: { section: SectionOf<"contact"> }) {
  const { now } = useSystem();
  const address = addressLine(section);
  const tel = telHref(section.phone);
  const mail = mailHref(section.email);
  const rows = hoursRows(
    realHours(section.openingHours)?.map(h => ({
      ...h,
      hours: kitchenOf(h.hours, now).open,
    })),
    now
  ).filter(r => r.lines.some(l => l.trim() !== ""));
  return (
    <NachtChapter type="contact" own={section.headline}>
      {address && (
        <p className="nc-adr">
          {section.street}
          {section.street && <br />}
          {[section.zip, section.city].filter(Boolean).join(" ")}
        </p>
      )}
      {(tel || mail) && (
        <p className="nc-ways">
          {tel && section.phone && <a href={tel}>{section.phone.trim()}</a>}
          {mail && section.email && <a href={mail}>{section.email.trim()}</a>}
        </p>
      )}
      {rows.length > 0 && (
        <ul className="nc-rows nc-rows--hours">
          {rows.map((r, i) => (
            <li key={i} className={r.today ? "nc-now" : undefined}>
              <span className="nc-row-t">{r.label}</span>
              <span className="nc-row-p">{r.lines.join(", ")}</span>
            </li>
          ))}
        </ul>
      )}
      {address && (
        <a
          className="nc-btn nc-btn--s"
          href={mapsHref(address)}
          {...newTabIfMaps(mapsHref(address))}
        >
          Route planen
        </a>
      )}
    </NachtChapter>
  );
}

function Cta({ section }: { section: SectionOf<"cta"> }) {
  const { data, blueprint } = useSystem();
  const own = section.ctaHref?.trim();
  const primary = nachtActions(data, blueprint).primary;
  const href =
    own && /^(https?:\/\/|tel:|mailto:)/i.test(own) ? own : primary?.href;
  const label = section.ctaText?.trim() || primary?.label;
  return (
    <NachtChapter type="cta" own={section.headline}>
      {href && label && (
        <a className="nc-btn nc-btn--p" href={href} {...newTabIfMaps(href)}>
          {label}
        </a>
      )}
    </NachtChapter>
  );
}

/** Unter- und Rechtsseiten-Kopf: Name gedämpft, Titel als einziges h1. */
export function NachtPageHead({
  title,
  titleHtml,
  intro,
  secondary = false,
  kicker,
}: {
  title?: string;
  titleHtml?: string;
  intro?: string;
  secondary?: boolean;
  kicker?: string;
}) {
  const { data } = useSystem();
  if (secondary)
    return (
      <section className="nc-page-head">
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
 * Rechtsseite im Nacht-Rahmen. SICHERHEIT: `html` stammt ausschließlich
 * aus dem legalGenerator (renderLegalPage in server/ssr/renderSite.tsx).
 */
export function NachtLegal({ title, html }: { title: string; html: string }) {
  const { data } = useSystem();
  const { titleHtml, body } = legalParts(html);
  return (
    <>
      <NachtPageHead
        title={title}
        titleHtml={titleHtml}
        kicker={`${data.businessName} · Rechtliches`}
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
 */
export function renderNachtSection(
  section: NachtSection,
  sections: readonly NachtSection[]
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <NachtEntry hero={section} />;
    case "services":
      return (
        <NachtChapter
          type="services"
          own={section.headline}
          intro={section.intro}
        >
          <Rows
            rows={section.items.map(i => ({
              title: i.title,
              text: i.description,
              price: i.price,
            }))}
          />
        </NachtChapter>
      );
    case "process":
      return (
        <NachtChapter type="process" own={section.headline}>
          <Rows
            rows={section.steps.map(s => ({ title: s.title, text: s.text }))}
          />
        </NachtChapter>
      );
    case "pricelist":
    case "menu":
      return <Priced section={section} />;
    case "stats":
      return (
        <NachtChapter type="stats" own={section.headline}>
          <Rows
            rows={section.items.map(s => ({ title: s.label, price: s.value }))}
          />
        </NachtChapter>
      );
    case "team":
      return (
        <NachtChapter type="team" own={section.headline}>
          <Rows
            rows={section.members.map(m => ({ title: m.name, text: m.role }))}
          />
        </NachtChapter>
      );
    case "about":
      return (
        <NachtChapter type="about" own={section.headline}>
          {section.imageUrl && (
            <figure className="nc-photo">
              <img
                src={section.imageUrl}
                alt=""
                loading="lazy"
                width={1200}
                height={900}
              />
            </figure>
          )}
          <Body text={section.body} />
        </NachtChapter>
      );
    case "gallery":
      return (
        <NachtChapter type="gallery" own={section.headline}>
          <ul className="nc-grid">
            {section.images.map((img, i) => (
              <li key={`${img.url}-${i}`}>
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  width={800}
                  height={1000}
                />
              </li>
            ))}
          </ul>
        </NachtChapter>
      );
    case "testimonials":
      return (
        <NachtChapter type="testimonials" own={section.headline}>
          {section.items.map((t, i) => (
            <figure key={`${t.author}-${i}`} className="nc-voice">
              <blockquote>{unquote(t.text)}</blockquote>
              <figcaption>{t.author}</figcaption>
            </figure>
          ))}
        </NachtChapter>
      );
    case "faq":
      return (
        <NachtChapter type="faq" own={section.headline}>
          {section.items.map((f, i) => (
            <details key={`${f.question}-${i}`} className="nc-faq">
              <summary>{rich(f.question)}</summary>
              <p>{rich(f.answer)}</p>
            </details>
          ))}
        </NachtChapter>
      );
    case "contact":
      return <Contact section={section} />;
    case "story":
      return (
        <NachtChapter type="story" own={section.headline}>
          <Body text={section.body} />
        </NachtChapter>
      );
    case "usp":
      return (
        <NachtChapter type="usp" own={section.headline}>
          <Rows
            rows={section.items.map(u => ({ title: u.title, text: u.text }))}
          />
        </NachtChapter>
      );
    case "quote":
      return (
        <NachtChapter type="quote">
          <figure className="nc-voice">
            <blockquote>{unquote(section.text)}</blockquote>
            {section.author && <figcaption>{section.author}</figcaption>}
          </figure>
        </NachtChapter>
      );
    case "partners":
      return (
        <NachtChapter type="partners" own={section.headline}>
          <Rows rows={section.items.map(p => ({ title: p.name }))} />
        </NachtChapter>
      );
    case "cta":
      return <Cta section={section} />;
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <NachtPageHead
          title={section.title}
          intro={section.intro}
          secondary={sections.find(s => s.type === "pageHeader") !== section}
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

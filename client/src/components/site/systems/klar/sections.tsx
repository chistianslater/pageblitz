import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { telHref } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import { legalParts, mailHref, type SystemSection } from "../shared";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { KlarEntry } from "./Entry";
import { hoursLabel } from "./facts";
import { hoursRows } from "./hours";
import { KlarHoursCard } from "./HoursCard";

/**
 * Abschnitte von Klar. Einstieg nach Systemblatt (K3); die übrigen
 * Kapitel sind bis K4–K6 schlichte Klar-Blöcke (Titel, Inhalt als Liste
 * bzw. Text) — vollständig und lesbar, aber noch ohne eigene Gestalt.
 */

export type KlarSection = SystemSection;

/** Klar-Wortwahl der Kapitel; eigene und Bauplan-Überschriften gewinnen. */
function chapterLabel(type: KlarSection["type"], blueprint: Blueprint): string {
  const advice = blueprint.id === "advice";
  const labels: Partial<Record<KlarSection["type"], string>> = {
    services: "Leistungen",
    process: advice ? "So läuft das Erstgespräch" : "Ihr erster Termin",
    pricelist: "Preise",
    menu: "Karte",
    team: advice ? "Wer Sie berät" : "Wer Sie behandelt",
    about: "Über uns",
    gallery: "Einblicke",
    testimonials: "Stimmen",
    faq: "Häufige Fragen",
    contact: "So finden Sie uns",
    story: "Geschichte",
    usp: "Gut zu wissen",
    stats: "In Zahlen",
    partners: "Partner",
    quote: "Leitsatz",
    cta: "Termin",
  };
  return labels[type] ?? "";
}

export function chapterTitle(
  type: KlarSection["type"],
  own: string | undefined,
  blueprint: Blueprint
): string {
  return (
    own?.trim() ||
    blueprint.headlines[type as keyof Blueprint["headlines"]] ||
    chapterLabel(type, blueprint)
  );
}

function KlarChapter({
  type,
  own,
  hiddenTitle = false,
  children,
}: {
  type: KlarSection["type"];
  own?: string;
  hiddenTitle?: boolean;
  children?: React.ReactNode;
}) {
  const { blueprint } = useSystem();
  const id = SECTION_ANCHORS[type];
  const headingId = `${id}-titel`;
  // Nicht „kl-menu": so heißt das Menü im Kopf.
  const name = type === "menu" ? "karte" : type;
  return (
    <section
      id={id}
      className={`kl-sec kl-${name}`}
      aria-labelledby={headingId}
    >
      <div className="kl-wrap">
        <h2 className={hiddenTitle ? "kl-sr" : "kl-title"} id={headingId}>
          {rich(chapterTitle(type, own, blueprint))}
        </h2>
        {children}
      </div>
    </section>
  );
}

/** Karte mit Titel, Text und optional Preis (Leistungen, Vorteile). */
function Cards({
  items,
}: {
  items: { title: string; text?: string; price?: string }[];
}) {
  return (
    <ul className="kl-cards">
      {items.map((i, k) => (
        <li key={`${i.title}-${k}`} className="kl-card">
          <h3>{rich(i.title)}</h3>
          {i.text && <p>{rich(i.text)}</p>}
          {i.price && <p className="kl-card-price">{i.price}</p>}
        </li>
      ))}
    </ul>
  );
}

function Priced({
  section,
}: {
  section: SectionOf<"pricelist"> | SectionOf<"menu">;
}) {
  return (
    <>
      {section.categories
        .filter(c => c.items.length > 0)
        .map(c => (
          <div key={c.name} className="kl-price">
            <h3>{c.name}</h3>
            <dl>
              {c.items.map((i, k) => (
                <div key={`${i.name}-${k}`}>
                  <dt>{i.name}</dt>
                  <dd>{i.price}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
    </>
  );
}

function Contact({ section }: { section: SectionOf<"contact"> }) {
  const { blueprint, now } = useSystem();
  const tel = telHref(section.phone);
  const mail = mailHref(section.email);
  const street = section.street?.trim();
  const place = [section.zip, section.city].filter(Boolean).join(" ");
  return (
    <KlarChapter type="contact" own={section.headline}>
      <div className="kl-visit">
        <KlarHoursCard
          id="kontakt-zeiten"
          label={hoursLabel(blueprint)}
          rows={hoursRows(section.openingHours, now)}
        />
        <div className="kl-card">
          {(street || place) && (
            <address>
              {street}
              {street && place && <br />}
              {place}
            </address>
          )}
          {((tel && section.phone) || (mail && section.email)) && (
            <p className="kl-visit-ways" {...SYS_ACTIONS}>
              {tel && section.phone && <a href={tel}>{section.phone.trim()}</a>}
              {mail && section.email && (
                <a href={mail}>{section.email.trim()}</a>
              )}
            </p>
          )}
        </div>
      </div>
    </KlarChapter>
  );
}

/**
 * Kopf für Unterseiten und Rechtsseiten: Name gedämpft, Seitentitel als
 * einziges h1 (`secondary` = weiterer Kopf als h2).
 */
export function KlarPageHead({
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
      <section className="kl-page-head">
        <div className="kl-wrap">
          <h2 className="kl-page-title">{rich(title ?? "")}</h2>
          {intro && <p className="kl-intro">{rich(intro)}</p>}
        </div>
      </section>
    );
  return (
    <section
      className="kl-page-head"
      id={SECTION_ANCHORS.pageHeader}
      aria-labelledby="seite-titel"
    >
      <div className="kl-wrap">
        <p className="kl-page-kicker">{kicker ?? data.businessName}</p>
        {titleHtml !== undefined ? (
          <h1
            id="seite-titel"
            className="kl-page-title"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : (
          <h1 id="seite-titel" className="kl-page-title">
            {rich(title ?? "")}
          </h1>
        )}
        {intro && <p className="kl-intro">{rich(intro)}</p>}
      </div>
    </section>
  );
}

/**
 * Rechtsseite im Klar-Rahmen (legalParts). SICHERHEIT: `html` stammt
 * ausschließlich aus dem legalGenerator (renderLegalPage in
 * server/ssr/renderSite.tsx).
 */
export function KlarLegal({ title, html }: { title: string; html: string }) {
  const { data } = useSystem();
  const { titleHtml, body } = legalParts(html);
  return (
    <>
      <KlarPageHead
        title={title}
        titleHtml={titleHtml}
        kicker={`${data.businessName} · Rechtliches`}
      />
      <article
        className="kl-wrap kl-legal"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}

/** Abschnitts-Weiche (exhaustiv über alle SectionV2-/PageSection-Typen). */
export function renderKlarSection(
  section: KlarSection,
  sections: readonly KlarSection[]
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return <KlarEntry hero={section} />;
    case "services":
      return (
        <KlarChapter type="services" own={section.headline}>
          {section.intro && <p className="kl-intro">{rich(section.intro)}</p>}
          <Cards
            items={section.items.map(i => ({
              title: i.title,
              text: i.description,
              price: i.price,
            }))}
          />
        </KlarChapter>
      );
    case "process":
      return (
        <KlarChapter type="process" own={section.headline}>
          <ol className="kl-steps">
            {section.steps.map((s, k) => (
              <li key={`${s.title}-${k}`}>
                <h3>{rich(s.title)}</h3>
                {s.text && <p>{rich(s.text)}</p>}
              </li>
            ))}
          </ol>
        </KlarChapter>
      );
    case "pricelist":
    case "menu":
      return (
        <KlarChapter type={section.type} own={section.headline}>
          <Priced section={section} />
        </KlarChapter>
      );
    case "stats":
      return (
        <KlarChapter type="stats" own={section.headline}>
          <dl className="kl-stats">
            {section.items.map(i => (
              <div key={i.label}>
                <dt>{i.label}</dt>
                <dd>{i.value}</dd>
              </div>
            ))}
          </dl>
        </KlarChapter>
      );
    case "team":
      return (
        <KlarChapter type="team" own={section.headline}>
          <Cards
            items={section.members.map(m => ({ title: m.name, text: m.role }))}
          />
        </KlarChapter>
      );
    case "about":
      return (
        <KlarChapter type="about" own={section.headline}>
          {section.imageUrl && (
            <img
              className="kl-photo"
              src={section.imageUrl}
              alt=""
              loading="lazy"
              width={1200}
              height={800}
            />
          )}
          <div className="kl-prose">{rich(section.body)}</div>
        </KlarChapter>
      );
    case "gallery":
      return (
        <KlarChapter type="gallery" own={section.headline}>
          <ul className="kl-gallery">
            {section.images.map(img => (
              <li key={img.url}>
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  width={800}
                  height={600}
                />
              </li>
            ))}
          </ul>
        </KlarChapter>
      );
    case "testimonials":
      return (
        <KlarChapter type="testimonials" own={section.headline}>
          <ul className="kl-cards">
            {section.items.slice(0, 3).map((t, k) => (
              <li key={`${t.author}-${k}`} className="kl-card">
                <blockquote>{rich(t.text)}</blockquote>
                <p className="kl-who">{t.author}</p>
              </li>
            ))}
          </ul>
        </KlarChapter>
      );
    case "faq":
      return (
        <KlarChapter type="faq" own={section.headline}>
          <div className="kl-faq">
            {section.items.map((f, k) => (
              <details key={`${f.question}-${k}`}>
                <summary>{f.question}</summary>
                <p>{rich(f.answer)}</p>
              </details>
            ))}
          </div>
        </KlarChapter>
      );
    case "contact":
      return <Contact section={section} />;
    case "story":
      return (
        <KlarChapter type="story" own={section.headline}>
          <div className="kl-prose">{rich(section.body)}</div>
        </KlarChapter>
      );
    case "usp":
      return (
        <KlarChapter type="usp" own={section.headline}>
          <Cards
            items={section.items.map(i => ({ title: i.title, text: i.text }))}
          />
        </KlarChapter>
      );
    case "quote":
      return (
        <KlarChapter type="quote" hiddenTitle>
          <blockquote className="kl-quote">
            {rich(section.text)}
            {section.author && <footer>{section.author}</footer>}
          </blockquote>
        </KlarChapter>
      );
    case "partners":
      return (
        <KlarChapter type="partners" own={section.headline}>
          <ul className="kl-partners">
            {section.items.map(p => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
        </KlarChapter>
      );
    case "cta":
      return (
        <KlarChapter type="cta" own={section.headline}>
          <p {...SYS_ACTIONS}>
            <a
              className="kl-btn kl-btn--p"
              href={section.ctaHref ?? `#${SECTION_ANCHORS.contact}`}
            >
              {section.ctaText}
            </a>
          </p>
        </KlarChapter>
      );
    case "pageHeader":
      // Genau ein h1 je Seite: nur der erste pageHeader trägt den Seitentitel.
      return (
        <KlarPageHead
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

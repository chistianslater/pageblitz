import React from "react";
import type {
  SectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "../../engine";
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { SCHIMMER_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Behandlungen",
  about: "Studio",
  gallery: "Galerie",
  testimonials: "Stimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Karte",
  pricelist: "Preise",
  team: "Team",
  cta: "Anfrage",
};

function renderLogo(data: WebsiteDataV2): React.ReactNode {
  if (data.logo?.kind === "font") {
    return (
      <span style={{ fontFamily: data.logo.font }}>{data.businessName}</span>
    );
  }
  if (data.logo?.kind === "image") {
    return <img src={data.logo.url} alt={data.businessName} />;
  }
  return data.businessName;
}

/** Letztes Wort der Headline als Akzentwort (em, Gewicht 600, solides Rosé). */
function renderHeadline(headline: string): React.ReactNode {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return headline;
  const last = words[words.length - 1];
  const rest = words.slice(0, -1).join(" ");
  return (
    <>
      {rest} <em>{last}</em>
    </>
  );
}

function renderSection(section: SectionV2): React.ReactNode {
  switch (section.type) {
    case "hero":
      return null; // eigenständig im Page-Layout gerendert
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-sc-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-sc-intro">{section.intro}</p>}
          <div className="pb-sc-grid">
            {section.items.map(item => (
              <div className="pb-sc-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && (
                  <span className="pb-sc-price">{item.price}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "about": {
      const title = section.headline ?? FALLBACK_TITLES.about;
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-sc-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sc-about">
            {section.imageUrl && (
              <img
                className="pb-sc-about-img"
                src={section.imageUrl}
                alt=""
                loading="lazy"
              />
            )}
            <p>{section.body}</p>
          </div>
        </section>
      );
    }
    case "gallery": {
      const title = section.headline ?? FALLBACK_TITLES.gallery;
      return (
        <section
          id={SECTION_ANCHORS.gallery}
          className="pb-sc-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sc-grid pb-sc-gallery">
            {section.images.map(img => (
              <img key={img.url} src={img.url} alt={img.alt} loading="lazy" />
            ))}
          </div>
        </section>
      );
    }
    case "testimonials": {
      const title = section.headline ?? FALLBACK_TITLES.testimonials;
      return (
        <section
          id={SECTION_ANCHORS.testimonials}
          className="pb-sc-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sc-grid">
            {section.items.map(item => (
              <blockquote className="pb-sc-card pb-sc-quote" key={item.author}>
                <p>„{item.text}“</p>
                <footer>
                  {item.author}
                  {item.rating ? ` · ${item.rating}/5` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      );
    }
    case "contact": {
      const title = section.headline ?? FALLBACK_TITLES.contact;
      const addressLine = [section.zip, section.city].filter(Boolean).join(" ");
      return (
        <section
          id={SECTION_ANCHORS.contact}
          className="pb-sc-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sc-contact">
            <address>
              {section.phone && (
                <p>
                  <a href={`tel:${section.phone}`}>{section.phone}</a>
                </p>
              )}
              {section.email && (
                <p>
                  <a href={`mailto:${section.email}`}>{section.email}</a>
                </p>
              )}
              {(section.street || addressLine) && (
                <p>
                  {section.street && <span>{section.street}</span>}
                  {section.street && addressLine && <br />}
                  {addressLine && <span>{addressLine}</span>}
                </p>
              )}
            </address>
            {section.openingHours && section.openingHours.length > 0 && (
              <table className="pb-sc-hours">
                <tbody>
                  {section.openingHours.map(oh => (
                    <tr key={oh.day}>
                      <td>{oh.day}</td>
                      <td>{oh.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      );
    }
    case "faq": {
      const title = section.headline ?? FALLBACK_TITLES.faq;
      return (
        <section
          id={SECTION_ANCHORS.faq}
          className="pb-sc-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sc-grid">
            {section.items.map(item => (
              <div className="pb-sc-card pb-sc-faq" key={item.question}>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "menu":
    case "pricelist": {
      const fallback =
        section.type === "menu"
          ? FALLBACK_TITLES.menu
          : FALLBACK_TITLES.pricelist;
      const title = section.headline ?? fallback;
      return (
        <section
          id={SECTION_ANCHORS[section.type]}
          className="pb-sc-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-sc-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              <div className="pb-sc-grid">
                {cat.items.map(item => (
                  <div className="pb-sc-card" key={item.name}>
                    <strong>{item.name}</strong>
                    {item.description && <p>{item.description}</p>}
                    <span className="pb-sc-price">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      );
    }
    case "team": {
      const title = section.headline ?? FALLBACK_TITLES.team;
      return (
        <section
          id={SECTION_ANCHORS.team}
          className="pb-sc-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sc-grid">
            {section.members.map(member => (
              <div className="pb-sc-member" key={member.name}>
                {member.imageUrl && (
                  <img src={member.imageUrl} alt="" loading="lazy" />
                )}
                <strong>{member.name}</strong>
                {member.role && <p>{member.role}</p>}
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "cta": {
      return (
        <section
          id={SECTION_ANCHORS.cta}
          className="pb-sc-section"
          key={section.type}
        >
          <div className="pb-sc-card pb-sc-cta-card">
            <h2>{section.headline}</h2>
            <a className="pb-sc-cta" href={section.ctaHref ?? "#kontakt"}>
              {section.ctaText}
            </a>
          </div>
        </section>
      );
    }
    default: {
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}

const SchimmerPage: React.FC<{
  data: WebsiteDataV2;
  basePath: string;
  now: Date;
}> = ({ data, basePath, now }) => {
  const sections = orderedSections(data);
  const navSections = sections.filter(s => s.type !== "hero");
  const hero = sections.find((s): s is SectionOf<"hero"> => s.type === "hero");
  const services = sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const year = now.getFullYear();
  const firstService = services?.items[0];

  return (
    <div className="pb-schimmer">
      <nav className="pb-sc-nav">
        <span className="pb-sc-logo">{renderLogo(data)}</span>
        <div className="pb-sc-nav-links">
          {navSections.map(s => (
            <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
              {FALLBACK_TITLES[s.type] ?? s.type}
            </a>
          ))}
        </div>
      </nav>
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-sc-hero">
          <div className="pb-sc-orbs pb-sc-orbs-tr" aria-hidden="true">
            <div className="pb-sc-orb pb-sc-orb-1" />
            <div className="pb-sc-orb pb-sc-orb-2" />
            <div className="pb-sc-orb pb-sc-orb-3" />
          </div>
          <div className="pb-sc-orbs pb-sc-orbs-bl" aria-hidden="true">
            <div className="pb-sc-orb pb-sc-orb-1" />
            <div className="pb-sc-orb pb-sc-orb-2" />
            <div className="pb-sc-orb pb-sc-orb-3" />
          </div>
          <div className="pb-sc-ring" aria-hidden="true" />
          {firstService && (
            <div className="pb-sc-chip">✨ Neu: {firstService.title}</div>
          )}
          <div className="pb-sc-glass">
            <h1>{renderHeadline(hero.headline)}</h1>
            {hero.subheadline && <p>{hero.subheadline}</p>}
            <div className="pb-sc-cta-row">
              {hero.ctaText && (
                <a className="pb-sc-cta" href={hero.ctaHref ?? "#kontakt"}>
                  {hero.ctaText}
                </a>
              )}
              {services && (
                <a
                  className="pb-sc-ghost"
                  href={`#${SECTION_ANCHORS.services}`}
                >
                  Mehr erfahren
                </a>
              )}
            </div>
          </div>
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-sc-footer">
        <p>
          {data.businessName} · © {year} {data.businessName}
        </p>
        {data.footerNote && <p>{data.footerNote}</p>}
        <p>
          <a href={`${basePath}/impressum`}>Impressum</a> ·{" "}
          <a href={`${basePath}/datenschutz`}>Datenschutz</a>
        </p>
      </footer>
    </div>
  );
};

export const SCHIMMER_MODULE: PackModule = {
  id: "schimmer",
  css: SCHIMMER_CSS,
  Page: SchimmerPage,
};
PACK_MODULES.schimmer = SCHIMMER_MODULE;

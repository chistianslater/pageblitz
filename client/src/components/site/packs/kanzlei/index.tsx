import React from "react";
import type {
  PageSection,
  PageSectionOf,
  SectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import {
  applyNavLabels,
  buildNavItems,
  orderedSections,
  SECTION_ANCHORS,
  type NavItem,
} from "../../engine";
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { KANZLEI_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Mandantenstimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Speisekarte",
  pricelist: "Preisliste",
  team: "Team",
  cta: "Anfrage",
};

const MUTED_STYLE: React.CSSProperties = { color: "var(--pb-muted)" };

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

/** Letztes Wort der Headline grau abgesetzt — der Rest bleibt Tinte-farben. */
function renderHeadline(headline: string): React.ReactNode {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return headline;
  const last = words[words.length - 1];
  const rest = words.slice(0, -1).join(" ");
  return (
    <>
      {rest} <span>{last}</span>
    </>
  );
}

/** businessCategory versal, wortweise umgebrochen — für den Seiten-Index. */
function idxLines(businessCategory: string | undefined): string[] {
  if (!businessCategory) return [];
  return businessCategory
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.toLocaleUpperCase("de-DE"));
}

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Bis zu 3 Kennzahlen: Leistungsfelder, Google-Rating, Bewertungen. Fehlende weglassen. */
function buildFacts(
  data: WebsiteDataV2,
  services: SectionOf<"services"> | undefined
): { value: string; label: string }[] {
  const facts: { value: string; label: string }[] = [];
  if (services && services.items.length > 0) {
    facts.push({
      value: String(services.items.length),
      label: "Leistungsfelder",
    });
  }
  if (data.google) {
    facts.push({
      value: `★ ${formatRating(data.google.rating)}`,
      label: "Google-Bewertung",
    });
    facts.push({
      value: String(data.google.reviewCount),
      label: "Bewertungen",
    });
  }
  return facts;
}

function renderSection(
  section: SectionV2 | PageSectionOf<"pageHeader">
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return null; // eigenständig im Page-Layout gerendert
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-kz-section"
          key={section.type}
        >
          {/* Zweispalter (R2, B7 Welle 2): h2 in der linken Rasterhälfte,
              alle Items an einer gemeinsamen Kante rechts der 50%-Rasterlinie
              — vorher schob ein zu breiter span-Selektor jede Zeile
              unterschiedlich weit nach rechts (ausgefranste Treppe). */}
          <div className="pb-kz-services-grid">
            <h2>{section.headline}</h2>
            <div className="pb-kz-services-list">
              {section.items.map((item, i) => (
                <div className="pb-kz-service" key={item.title}>
                  <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.title}</strong>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  {item.price && <span className="price">{item.price}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "about": {
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-kz-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-kz-about-grid">
            <p>{section.body}</p>
            {section.imageUrl && (
              <img
                className="pb-kz-about-img"
                src={section.imageUrl}
                alt=""
                loading="lazy"
              />
            )}
          </div>
        </section>
      );
    }
    case "gallery": {
      const title = section.headline ?? FALLBACK_TITLES.gallery;
      return (
        <section
          id={SECTION_ANCHORS.gallery}
          className="pb-kz-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-kz-gallery">
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
          className="pb-kz-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <blockquote className="pb-kz-quote" key={item.author}>
              <p>„{item.text}“</p>
              <footer>
                {item.author}
                {item.rating ? ` · ${item.rating}/5` : ""}
              </footer>
            </blockquote>
          ))}
        </section>
      );
    }
    case "contact": {
      const title = section.headline ?? FALLBACK_TITLES.contact;
      const addressLine = [section.zip, section.city].filter(Boolean).join(" ");
      return (
        <section
          id={SECTION_ANCHORS.contact}
          className="pb-kz-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-kz-contact">
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
              <div className="pb-kz-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-kz-hours">
                  <tbody>
                    {section.openingHours.map(oh => (
                      <tr key={oh.day}>
                        <td>{oh.day}</td>
                        <td>{oh.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          className="pb-kz-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div className="pb-kz-faq" key={item.question}>
              <strong>{item.question}</strong>
              <p>{item.answer}</p>
            </div>
          ))}
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
          className="pb-kz-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-kz-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-kz-service" key={item.name}>
                  <strong>{item.name}</strong>
                  {item.description && (
                    <p className="muted" style={MUTED_STYLE}>
                      {item.description}
                    </p>
                  )}
                  <span className="price">{item.price}</span>
                </div>
              ))}
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
          className="pb-kz-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-kz-team">
            {section.members.map((member, i) => (
              <div className="pb-kz-member" key={`${i}-${member.name}`}>
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
          className="pb-kz-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-kz-link" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText} →
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-kz-page-header" key={section.type}>
          <h1>{section.title}</h1>
          {section.intro && <p>{section.intro}</p>}
        </header>
      );
    }
    default: {
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}

const KanzleiPage: React.FC<{
  data: WebsiteDataV2;
  basePath: string;
  now: Date;
  navItems?: NavItem[];
  pageTitle?: string;
  sections?: PageSection[];
}> = ({ data, basePath, now, navItems, sections: pageSections }) => {
  const sections: (SectionV2 | PageSectionOf<"pageHeader">)[] =
    pageSections ?? orderedSections(data);
  const navList = applyNavLabels(
    navItems ?? buildNavItems(data, { pathname: "/", basePath }),
    FALLBACK_TITLES
  );
  const hero = sections.find((s): s is SectionOf<"hero"> => s.type === "hero");
  const contact = sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const services = sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const eyebrow = [data.businessCategory, contact?.city]
    .filter((v): v is string => Boolean(v))
    .join(" — ");
  const idx = idxLines(data.businessCategory);
  const total = String(sections.length).padStart(2, "0");
  const facts = buildFacts(data, services);
  const year = now.getFullYear();

  return (
    <div className="pb-kanzlei pb-kz-grid">
      <nav className="pb-kz-nav">
        <span className="pb-kz-logo">{renderLogo(data)}</span>
        <div className="pb-kz-nav-links">
          {navList.map(item => (
            <a
              key={item.key}
              href={item.href}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
          {hero?.ctaText && (
            <a className="pb-kz-link" href={hero.ctaHref ?? "#kontakt"}>
              {hero.ctaText} →
            </a>
          )}
        </div>
      </nav>
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-kz-hero">
          <div className="pb-kz-watermark" aria-hidden="true">
            §
          </div>
          {idx.length > 0 && (
            <div className="pb-kz-idx">
              {idx.map((line, i) => (
                <React.Fragment key={line + i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
              — 01 / {total}
            </div>
          )}
          {eyebrow && <p className="pb-kz-eyebrow">{eyebrow}</p>}
          <h1>{renderHeadline(hero.headline)}</h1>
          {hero.subheadline && <p>{hero.subheadline}</p>}
        </section>
      )}
      {/* Kennzahlen-Band nur auf der Startseite (Q1, B7 Welle 0): auf
          Unterseiten muss der pageHeader das erste Element nach der Nav
          sein — ein Stats-Band vor dem Seitentitel wirkt wie eine
          kontextlose Zählung. */}
      {hero && facts.length > 0 && (
        <div className="pb-kz-facts">
          {facts.map((fact, i) => (
            <div key={fact.label + i}>
              <b>{fact.value}</b>
              {fact.label}
            </div>
          ))}
        </div>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-kz-footer">
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

const KANZLEI_MODULE: PackModule = {
  id: "kanzlei",
  css: KANZLEI_CSS,
  Page: KanzleiPage,
};
PACK_MODULES.kanzlei = KANZLEI_MODULE;

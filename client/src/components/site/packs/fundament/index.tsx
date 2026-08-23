import React from "react";
import type {
  SectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "../../engine";
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { FUNDAMENT_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Referenzen",
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

/** Letztes Wort der Headline kursiv in Messing — der Rest bleibt Marine-farben. */
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

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/**
 * Bis zu 3 Kennzahlen fürs Panel: Leistungsfelder, Google-Rating,
 * Bewertungen — aus services und google. Fehlende Quellen weglassen.
 */
function buildStats(
  data: WebsiteDataV2,
  services: SectionOf<"services"> | undefined
): { value: string; label: string }[] {
  const stats: { value: string; label: string }[] = [];
  if (services && services.items.length > 0) {
    stats.push({
      value: String(services.items.length),
      label: "Leistungsfelder",
    });
  }
  if (data.google) {
    stats.push({
      value: `★ ${formatRating(data.google.rating)}`,
      label: "Google-Bewertung",
    });
    stats.push({
      value: String(data.google.reviewCount),
      label: "Bewertungen",
    });
  }
  return stats;
}

function renderSection(section: SectionV2): React.ReactNode {
  switch (section.type) {
    case "hero":
      return null; // eigenständig im Page-Layout gerendert (Panel-Bühne)
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-fd-intro">{section.intro}</p>}
          {section.items.map((item, i) => (
            <div className="pb-fd-service" key={item.title}>
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
              </div>
              {item.price && <span>{item.price}</span>}
            </div>
          ))}
        </section>
      );
    }
    case "about": {
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.imageUrl && (
            <img
              src={section.imageUrl}
              alt=""
              loading="lazy"
              className="pb-fd-about-image"
            />
          )}
          <p style={{ maxWidth: "64ch" }}>{section.body}</p>
        </section>
      );
    }
    case "gallery": {
      const title = section.headline ?? FALLBACK_TITLES.gallery;
      return (
        <section
          id={SECTION_ANCHORS.gallery}
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-fd-gallery">
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
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <blockquote className="pb-fd-quote" key={item.author}>
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
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-fd-contact">
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
              <table className="pb-fd-hours">
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
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div className="pb-fd-faq" key={item.question}>
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
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-fd-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-fd-service" key={item.name}>
                  <strong>{item.name}</strong>
                  {item.description && (
                    <p className="muted" style={MUTED_STYLE}>
                      {item.description}
                    </p>
                  )}
                  <span>{item.price}</span>
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
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-fd-team">
            {section.members.map(member => (
              <div className="pb-fd-member" key={member.name}>
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
          className="pb-fd-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-fd-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    default: {
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}

const FundamentPage: React.FC<{
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
  const stats = buildStats(data, services);
  const year = now.getFullYear();

  return (
    <div className="pb-fundament">
      <nav className="pb-fd-nav">
        <span className="pb-fd-logo">{renderLogo(data)}</span>
        <div className="pb-fd-nav-links">
          {navSections.map(s => (
            <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
              {FALLBACK_TITLES[s.type] ?? s.type}
            </a>
          ))}
        </div>
      </nav>
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-fd-hero">
          <div className="pb-fd-panel">
            {stats.length > 0 && (
              <div className="pb-fd-stats">
                {stats.map((stat, i) => (
                  <div key={stat.label + i}>
                    <b>{stat.value}</b>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pb-fd-content">
            <h1>{renderHeadline(hero.headline)}</h1>
            {hero.subheadline && <p>{hero.subheadline}</p>}
            {hero.ctaText && (
              <a className="pb-fd-cta" href={hero.ctaHref ?? "#kontakt"}>
                {hero.ctaText}
              </a>
            )}
          </div>
          {hero.imageUrl && (
            <img
              className="pb-fd-photo"
              alt=""
              src={hero.imageUrl}
              loading="eager"
              fetchPriority="high"
            />
          )}
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-fd-footer">
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

const FUNDAMENT_MODULE: PackModule = {
  id: "fundament",
  css: FUNDAMENT_CSS,
  Page: FundamentPage,
};
PACK_MODULES.fundament = FUNDAMENT_MODULE;

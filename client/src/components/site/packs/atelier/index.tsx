import React from "react";
import type {
  SectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "../../engine";
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { ATELIER_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Stimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Speisekarte",
  pricelist: "Preisliste",
  team: "Team",
  cta: "Anfrage",
};

const MUTED_STYLE: React.CSSProperties = { color: "var(--pb-muted)" };

/** Erstes 4-stelliges Jahr (19xx/20xx) aus footerNote — für die EST.-Meta-Angabe. */
function extractYear(footerNote: string | undefined): string | undefined {
  if (!footerNote) return undefined;
  const match = footerNote.match(/\b(19|20)\d{2}\b/);
  return match?.[0];
}

/**
 * Mono-Meta-Zeile: Branche — Stadt · Leistungs-Stichworte · EST.-Jahr.
 * Fehlende Teile werden weggelassen (nicht als leerer Slot gerendert).
 */
function buildMeta(
  data: WebsiteDataV2,
  city: string | undefined,
  services: SectionOf<"services"> | undefined
): string[] {
  const parts: string[] = [];
  const catCity = [data.businessCategory, city].filter((v): v is string =>
    Boolean(v)
  );
  if (catCity.length > 0) parts.push(catCity.join(" — "));
  if (services && services.items.length > 0) {
    parts.push(services.items.map(item => item.title).join(" · "));
  }
  const year = extractYear(data.footerNote);
  if (year) parts.push(`EST. ${year}`);
  return parts;
}

/** Roter Mono-Index in der Caption-Spalte: N° 01 — AUS DER SERIE „<erste Leistung>“. */
function buildIndexLabel(
  services: SectionOf<"services"> | undefined
): string | undefined {
  const first = services?.items[0]?.title;
  if (!first) return undefined;
  return `N° 01 — Aus der Serie „${first}“`;
}

function renderSection(section: SectionV2): React.ReactNode {
  switch (section.type) {
    case "hero":
      return null; // eigenständig als Masthead + Cover gerendert
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-at-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.items.map((item, i) => (
            <div className="pb-at-service" key={item.title}>
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
              </div>
              {item.price && <span className="price">{item.price}</span>}
            </div>
          ))}
        </section>
      );
    }
    case "about": {
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-at-section pb-at-about"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.imageUrl && (
            <img
              className="pb-at-about-img"
              src={section.imageUrl}
              alt=""
              loading="lazy"
            />
          )}
          <p>{section.body}</p>
        </section>
      );
    }
    case "gallery": {
      const title = section.headline ?? FALLBACK_TITLES.gallery;
      return (
        <section
          id={SECTION_ANCHORS.gallery}
          className="pb-at-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-at-gallery">
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
          className="pb-at-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <blockquote className="pb-at-quote" key={item.author}>
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
          className="pb-at-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-at-contact">
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
              <table className="pb-at-hours">
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
          className="pb-at-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div className="pb-at-service" key={item.question}>
              <div>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </div>
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
          className="pb-at-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-at-service" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    {item.description && (
                      <p style={MUTED_STYLE}>{item.description}</p>
                    )}
                  </div>
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
          className="pb-at-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.members.map(member => (
            <div className="pb-at-service" key={member.name}>
              {member.imageUrl && (
                <img
                  className="pb-at-about-img"
                  src={member.imageUrl}
                  alt=""
                  loading="lazy"
                />
              )}
              <div>
                <strong>{member.name}</strong>
                {member.role && <p style={MUTED_STYLE}>{member.role}</p>}
              </div>
            </div>
          ))}
        </section>
      );
    }
    case "cta": {
      return (
        <section
          id={SECTION_ANCHORS.cta}
          className="pb-at-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-at-lnk" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText} →
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

const AtelierPage: React.FC<{
  data: WebsiteDataV2;
  basePath: string;
  now: Date;
}> = ({ data, basePath, now }) => {
  const sections = orderedSections(data);
  const navSections = sections.filter(s => s.type !== "hero");
  const hero = sections.find((s): s is SectionOf<"hero"> => s.type === "hero");
  const contact = sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const services = sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const meta = buildMeta(data, contact?.city, services);
  const indexLabel = buildIndexLabel(services);
  const year = now.getFullYear();

  return (
    <div className="pb-atelier">
      <nav className="pb-at-nav">
        <div className="pb-at-nav-links">
          {navSections.map(s => (
            <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
              {FALLBACK_TITLES[s.type] ?? s.type}
            </a>
          ))}
        </div>
      </nav>
      <header className="pb-at-masthead-wrap">
        <div className="pb-at-masthead">
          {data.businessName}
          <span className="dot">.</span>
        </div>
        {meta.length > 0 && (
          <div className="pb-at-meta">
            {meta.map((part, i) => (
              <span key={part + i}>{part}</span>
            ))}
          </div>
        )}
      </header>
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-at-cover">
          <div className="pb-at-img">
            {hero.imageUrl && (
              <img
                src={hero.imageUrl}
                alt=""
                loading="eager"
                fetchPriority="high"
              />
            )}
            <h1 className="pb-at-caption">{hero.headline}</h1>
          </div>
          <div className="pb-at-capcol">
            {indexLabel && <span className="pb-at-idx">{indexLabel}</span>}
            {hero.subheadline && <p>{hero.subheadline}</p>}
            {hero.ctaText && (
              <a className="pb-at-lnk" href={hero.ctaHref ?? "#kontakt"}>
                {hero.ctaText} →
              </a>
            )}
          </div>
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-at-footer">
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

const ATELIER_MODULE: PackModule = {
  id: "atelier",
  css: ATELIER_CSS,
  Page: AtelierPage,
};
PACK_MODULES.atelier = ATELIER_MODULE;

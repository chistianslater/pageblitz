import React from "react";
import type {
  SectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "../../engine";
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { WERKBANK_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Bewertungen",
  contact: "Kontakt",
  faq: "FAQ",
  menu: "Speisekarte",
  pricelist: "Preisliste",
  team: "Team",
  cta: "Anfrage",
};

const MUTED_STYLE: React.CSSProperties = { color: "var(--pb-muted)" };

/**
 * Verteilt eine Headline an Wortgrenzen auf 2 (genau 2 Wörter) oder immer 3
 * Zeilen (≥ 3 Wörter, damit stets eine Outline-Mittelzeile entsteht — das
 * Kernmerkmal der Werkbank-Signatur). Bei 1 Wort: eine Zeile (Accent).
 */
function splitHeadline(headline: string): string[] {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return words.length === 0 ? [headline] : words;
  const parts = 3;
  const base = Math.floor(words.length / parts);
  const remainder = words.length % parts;
  const lines: string[] = [];
  let idx = 0;
  for (let p = 0; p < parts; p++) {
    const count = base + (p < remainder ? 1 : 0);
    lines.push(words.slice(idx, idx + count).join(" "));
    idx += count;
  }
  return lines;
}

/** Rail-Text aus Branche, Stadt (aus der Contact-Sektion) und Tagline — fehlende Teile weglassen. */
function buildRailText(data: WebsiteDataV2, city: string | undefined): string {
  const parts = [data.businessCategory, city].filter((v): v is string =>
    Boolean(v)
  );
  const main = parts.join(" · ");
  if (data.tagline) return main ? `${main} — ${data.tagline}` : data.tagline;
  return main;
}

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

/** Service-Titel 3× wiederholt, getrennt durch ✕ — direkt nach dem Hero. */
function buildMarquee(
  services: SectionOf<"services"> | undefined
): React.ReactNode {
  if (!services || services.items.length === 0) return null;
  const titles = services.items.map(item => item.title);
  const repeated = [...titles, ...titles, ...titles];
  return (
    <div className="pb-wb-marquee">
      {repeated.map((title, i) => (
        <React.Fragment key={`${title}-${i}`}>
          {i > 0 && <em>✕</em>}
          {title}
        </React.Fragment>
      ))}
    </div>
  );
}

function renderSection(
  section: SectionV2,
  servicesSection: SectionOf<"services"> | undefined
): React.ReactNode {
  switch (section.type) {
    case "hero": {
      const lines = splitHeadline(section.headline);
      return (
        <React.Fragment key={section.type}>
          <section id={SECTION_ANCHORS.hero} className="pb-wb-hero">
            <h1 aria-label={section.headline}>
              {lines.map((line, i) => {
                const isLast = i === lines.length - 1;
                const isMiddle = i > 0 && !isLast;
                const cls = isLast
                  ? "accent"
                  : isMiddle
                    ? "outline"
                    : undefined;
                return (
                  <span key={line + i} className={cls} aria-hidden="true">
                    {line}
                  </span>
                );
              })}
            </h1>
            {section.subheadline && <p>{section.subheadline}</p>}
            {section.ctaText && (
              <a className="pb-wb-cta" href={section.ctaHref ?? "#kontakt"}>
                {section.ctaText}
              </a>
            )}
            {section.imageUrl && (
              <img
                className="pb-wb-photo"
                alt=""
                src={section.imageUrl}
                loading="eager"
                fetchPriority="high"
              />
            )}
          </section>
          {buildMarquee(servicesSection)}
        </React.Fragment>
      );
    }
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.items.map((item, i) => (
            <div className="pb-wb-service" key={item.title}>
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.title}</strong>
                {item.description && (
                  <p className="muted" style={MUTED_STYLE}>
                    {item.description}
                  </p>
                )}
                {item.price && <span>{item.price}</span>}
              </div>
            </div>
          ))}
        </section>
      );
    }
    case "about": {
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.imageUrl && (
            <img src={section.imageUrl} alt="" loading="lazy" />
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
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
            }}
          >
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
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <blockquote key={item.author}>
              <p>„{item.text}“</p>
              <footer style={MUTED_STYLE}>
                — {item.author}
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
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{title}</h2>
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
            <address>
              {section.street && <span>{section.street}</span>}
              {section.street && addressLine && <br />}
              {addressLine && <span>{addressLine}</span>}
            </address>
          )}
          {section.openingHours && section.openingHours.length > 0 && (
            <table>
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
        </section>
      );
    }
    case "faq": {
      const title = section.headline ?? FALLBACK_TITLES.faq;
      return (
        <section
          id={SECTION_ANCHORS.faq}
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div key={item.question}>
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
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-wb-service" key={item.name}>
                  <strong>{item.name}</strong>
                  {item.description && (
                    <span className="muted" style={MUTED_STYLE}>
                      {item.description}
                    </span>
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
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.members.map(member => (
            <div className="pb-wb-service" key={member.name}>
              {member.imageUrl && (
                <img src={member.imageUrl} alt="" loading="lazy" />
              )}
              <div>
                <strong>{member.name}</strong>
                {member.role && (
                  <p className="muted" style={MUTED_STYLE}>
                    {member.role}
                  </p>
                )}
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
          className="pb-wb-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-wb-cta" href={section.ctaHref ?? "#kontakt"}>
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

const WerkbankPage: React.FC<{ data: WebsiteDataV2 }> = ({ data }) => {
  const sections = orderedSections(data);
  const navSections = sections.filter(s => s.type !== "hero");
  const contact = sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const services = sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const railText = buildRailText(data, contact?.city);
  const year = new Date().getFullYear();

  return (
    <div className="pb-werkbank">
      <aside className="pb-wb-rail">
        <b>{railText}</b>
      </aside>
      <div className="pb-wb-main">
        <nav className="pb-wb-nav">
          <span className="pb-wb-logo">{renderLogo(data)}</span>
          <div className="pb-wb-nav-links">
            {navSections.map(s => (
              <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
                {FALLBACK_TITLES[s.type] ?? s.type}
              </a>
            ))}
          </div>
        </nav>
        {sections.map(section => renderSection(section, services))}
        <footer className="pb-wb-footer">
          <p>
            {data.businessName} · © {year} {data.businessName}
          </p>
          {data.footerNote && <p>{data.footerNote}</p>}
          <p>
            <a href="/impressum">Impressum</a> ·{" "}
            <a href="/datenschutz">Datenschutz</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export const WERKBANK_MODULE: PackModule = {
  id: "werkbank",
  css: WERKBANK_CSS,
  Page: WerkbankPage,
};
PACK_MODULES.werkbank = WERKBANK_MODULE;

import React from "react";
import type {
  SectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "../../engine";
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { MARKTPLATZ_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Kurse",
  about: "Über uns",
  gallery: "Einblicke",
  testimonials: "Stimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Angebot",
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

/** Kritzel-Unterstreichung als Inline-SVG-Pfad, Sonne-Akzent, runde Kappen. */
function Squiggle(): React.ReactNode {
  return (
    <svg
      className="pb-mp-squiggle"
      viewBox="0 0 120 12"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M2,8 Q20,2 40,7 T80,6 T118,7"
        fill="none"
        stroke="var(--pb-accent-2)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Letztes Wort der Headline als Akzentwort mit Kritzel-Unterstreichung. */
function renderHeadline(headline: string): React.ReactNode {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return headline;
  const last = words[words.length - 1];
  const rest = words.slice(0, -1).join(" ");
  return (
    <>
      {rest}{" "}
      <span className="pb-mp-accent-word">
        {last}
        <Squiggle />
      </span>
    </>
  );
}

/**
 * Baut die Texte für die drei rotierten Sticker deterministisch aus
 * vorhandenen Vertragsfeldern: Sonne-Pille aus der Tagline (Kennenlern-Hook,
 * z. B. "1. Stunde gratis!"), Ink-Karte aus dem ersten Service-Preis
 * (Preis-USP), Outline-Karte aus dem Standort. Der Site-Vertrag kennt kein
 * eigenes Badge-Feld — diese Ableitung hält die Sticker trotzdem für jede
 * Branche sinnvoll gefüllt, mit robusten Fallbacks statt leerer Sticker.
 */
function buildStickers(
  data: WebsiteDataV2,
  services: SectionOf<"services"> | undefined,
  contact: SectionOf<"contact"> | undefined
): { pill: string; ink: string; outline: string } {
  const pill = data.tagline ?? "Jetzt entdecken";
  const price = services?.items.find(item => item.price)?.price;
  const ink = price ?? data.businessCategory ?? "Für die ganze Familie";
  const outline = contact?.city
    ? `Mitten in ${contact.city}`
    : (services?.items[1]?.title ?? "Ohne Vorkenntnisse");
  return { pill, ink, outline };
}

function renderSection(section: SectionV2): React.ReactNode {
  switch (section.type) {
    case "hero":
      return null; // eigenständig im Page-Layout gerendert
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-mp-intro">{section.intro}</p>}
          <div className="pb-mp-grid">
            {section.items.map(item => (
              <div className="pb-mp-card-item" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && (
                  <span className="pb-mp-price">{item.price}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "about": {
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-mp-about">
            {section.imageUrl && (
              <img src={section.imageUrl} alt="" loading="lazy" />
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
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-mp-grid pb-mp-gallery">
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
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-mp-grid">
            {section.items.map(item => (
              <blockquote
                className="pb-mp-card-item pb-mp-quote"
                key={item.author}
              >
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
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-mp-contact">
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
              <table className="pb-mp-hours">
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
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-mp-grid">
            {section.items.map(item => (
              <div className="pb-mp-card-item pb-mp-faq" key={item.question}>
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
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div key={cat.name}>
              <h3>{cat.name}</h3>
              <div className="pb-mp-grid">
                {cat.items.map(item => (
                  <div className="pb-mp-card-item" key={item.name}>
                    <strong>{item.name}</strong>
                    {item.description && <p>{item.description}</p>}
                    <span className="pb-mp-price">{item.price}</span>
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
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-mp-grid pb-mp-team">
            {section.members.map(member => (
              <div key={member.name}>
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
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-mp-link" href={section.ctaHref ?? "#kontakt"}>
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

const MarktplatzPage: React.FC<{
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
  const stickers = buildStickers(data, services, contact);
  const year = now.getFullYear();

  return (
    <div className="pb-marktplatz">
      <nav className="pb-mp-nav">
        <span className="pb-mp-logo">{renderLogo(data)}</span>
        <div className="pb-mp-nav-links">
          {navSections.map(s => (
            <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
              {FALLBACK_TITLES[s.type] ?? s.type}
            </a>
          ))}
        </div>
      </nav>
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-mp-hero">
          <div className="pb-mp-hero-inner">
            <div className="pb-mp-card">
              {data.businessCategory && (
                <p className="pb-mp-eyebrow">{data.businessCategory}</p>
              )}
              <h1>{renderHeadline(hero.headline)}</h1>
              {hero.subheadline && (
                <p className="pb-mp-sub">{hero.subheadline}</p>
              )}
              {hero.ctaText && (
                <a className="pb-mp-cta" href={hero.ctaHref ?? "#kontakt"}>
                  {hero.ctaText}
                </a>
              )}
            </div>
            {hero.imageUrl && (
              <div className="pb-mp-photo-wrap">
                <img
                  className="pb-mp-photo"
                  src={hero.imageUrl}
                  alt=""
                  aria-hidden="true"
                />
                <div className="pb-mp-sticker pill" aria-hidden="true">
                  {stickers.pill}
                </div>
                <div className="pb-mp-sticker ink" aria-hidden="true">
                  {stickers.ink}
                </div>
                <div className="pb-mp-sticker outline" aria-hidden="true">
                  {stickers.outline}
                </div>
              </div>
            )}
          </div>
          <div className="pb-mp-scallop" aria-hidden="true" />
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-mp-footer">
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

export const MARKTPLATZ_MODULE: PackModule = {
  id: "marktplatz",
  css: MARKTPLATZ_CSS,
  Page: MarktplatzPage,
};
PACK_MODULES.marktplatz = MARKTPLATZ_MODULE;

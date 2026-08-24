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
import { MobileNav } from "../../MobileNav";
import { KLARWERK_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Was Kunden sagen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Speisekarte",
  pricelist: "Preisliste",
  team: "Team",
  cta: "Anfrage",
};

const MUTED_STYLE: React.CSSProperties = { color: "var(--pb-muted)" };

/** Letztes Wort der Headline in Accent-Blau abgesetzt. */
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

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

interface BentoFact {
  value: string;
  label: string;
  cmd: string;
  out: string;
}

/**
 * Kennzahlen für Terminal-Zeilen und Bento-Zellen — aus services/google
 * abgeleitet. Fehlt eine Datenquelle, fällt der jeweilige Fact weg
 * (Terminal-Zeile UND zugehörige Zelle werden weggelassen).
 */
function buildFacts(
  data: WebsiteDataV2,
  services: SectionOf<"services"> | undefined
): BentoFact[] {
  const facts: BentoFact[] = [];
  if (services && services.items.length > 0) {
    const count = services.items.length;
    facts.push({
      value: String(count),
      label: count === 1 ? "Leistung" : "Leistungen",
      cmd: "leistungen --list",
      out: `${count} aktiv`,
    });
  }
  if (data.google) {
    const rating = formatRating(data.google.rating);
    facts.push({
      value: `★ ${rating}`,
      label: "Google-Bewertung",
      cmd: "google --rating",
      out: `★ ${rating}`,
    });
    facts.push({
      value: String(data.google.reviewCount),
      label: "Bewertungen",
      cmd: "google --reviews",
      out: `${data.google.reviewCount} Bewertungen`,
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
          className="pb-kw-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.items.map((item, i) => (
            <div className="pb-kw-service" key={item.title}>
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
          className="pb-kw-section pb-kw-about"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-kw-about-grid">
            <p>{section.body}</p>
            {section.imageUrl && (
              <img
                className="pb-kw-about-img"
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
          className="pb-kw-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-kw-gallery">
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
          className="pb-kw-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-kw-quotes">
            {section.items.map(item => (
              <blockquote className="pb-kw-quote" key={item.author}>
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
          className="pb-kw-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-kw-contact">
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
              <div className="pb-kw-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-kw-hours">
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
          className="pb-kw-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-kw-faq-grid">
            {section.items.map(item => (
              <div className="pb-kw-faq" key={item.question}>
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
          className="pb-kw-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-kw-service" key={item.name}>
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
          className="pb-kw-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.members.map((member, i) => (
            <div className="pb-kw-service" key={`${i}-${member.name}`}>
              {member.imageUrl && (
                <img
                  className="pb-kw-about-img"
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
          className="pb-kw-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-kw-hero-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText} →
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-kw-page-header" key={section.type}>
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

const KlarwerkPage: React.FC<{
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
  const facts = buildFacts(data, services);
  const year = now.getFullYear();

  return (
    <div className="pb-klarwerk">
      <nav className="pb-kw-nav">
        <span className="pb-kw-logo">{data.businessName}</span>
        <div className="pb-kw-nav-links">
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
            <a className="pb-kw-nav-cta" href={hero.ctaHref ?? "#kontakt"}>
              {hero.ctaText}
            </a>
          )}
        </div>
        <MobileNav
          items={navList}
          cta={
            hero?.ctaText
              ? { label: hero.ctaText, href: hero.ctaHref ?? "#kontakt" }
              : undefined
          }
        />
      </nav>
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-kw-hero">
          {eyebrow && <p className="pb-kw-eyebrow">{eyebrow}</p>}
          <h1>{renderHeadline(hero.headline)}</h1>
          {hero.subheadline && <p>{hero.subheadline}</p>}
          {hero.ctaText && (
            <a className="pb-kw-hero-cta" href={hero.ctaHref ?? "#kontakt"}>
              {hero.ctaText} →
            </a>
          )}
        </section>
      )}
      {/* Bento-Band (Terminal + Kennzahlen) nur auf der Startseite (Q1, B7
          Welle 0): auf Unterseiten muss der pageHeader das erste Element
          nach der Nav sein — Terminal-Zeilen wie „2 aktiv" vor dem
          Seitentitel wirken wie ein Bug. */}
      {hero && (
        <div className="pb-kw-bento">
          {facts.length > 0 && (
            <div className="pb-kw-term">
              {facts.map(f => (
                <div key={f.cmd}>
                  <span className="dim">$</span> {f.cmd}
                  <br />
                  <span className="dim">→</span> {f.out}
                </div>
              ))}
            </div>
          )}
          {facts[0] && (
            <div className="pb-kw-cell hi">
              <b>{facts[0].value}</b>
              {facts[0].label}
            </div>
          )}
          {facts[1] && (
            <div className="pb-kw-cell">
              <b>{facts[1].value}</b>
              {facts[1].label}
            </div>
          )}
          <div className="pb-kw-status">
            <span className="dot" aria-hidden="true" />
            Alle Systeme betriebsbereit
          </div>
        </div>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-kw-footer">
        <p>
          © {year} {data.businessName}
        </p>
        {/* Q6 (B7): Zeile 1 nennt den Namen bereits — fuehrendes
            „{Name} · “ aus der Notiz kuerzen (→ „Stadt · seit Jahr“). */}
        {data.footerNote && (
          <p>
            {data.footerNote.startsWith(`${data.businessName} · `)
              ? data.footerNote.slice(data.businessName.length + 3)
              : data.footerNote}
          </p>
        )}
        <p>
          <a href={`${basePath}/impressum`}>Impressum</a> ·{" "}
          <a href={`${basePath}/datenschutz`}>Datenschutz</a>
        </p>
      </footer>
    </div>
  );
};

const KLARWERK_MODULE: PackModule = {
  id: "klarwerk",
  css: KLARWERK_CSS,
  Page: KlarwerkPage,
};
PACK_MODULES.klarwerk = KLARWERK_MODULE;

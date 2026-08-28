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
import { LAYOUT_SLOT } from "../../layoutSlots";
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
  const renderGroup = (copy: number): React.ReactNode => (
    <span
      className="pb-wb-marquee-group"
      aria-hidden={copy === 1 ? "true" : undefined}
      key={copy}
    >
      {[...titles, ...titles].map((title, i) => (
        <React.Fragment key={`${title}-${i}`}>
          <span>{title}</span>
          <em>✕</em>
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="pb-wb-marquee" aria-label={titles.join(" · ")}>
      <div className="pb-wb-marquee-track">
        {renderGroup(0)}
        {renderGroup(1)}
      </div>
    </div>
  );
}

function renderSection(
  section: SectionV2 | PageSectionOf<"pageHeader">,
  servicesSection: SectionOf<"services"> | undefined,
  hasPageHeader: boolean
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
                data-pb-slot={LAYOUT_SLOT.heroMedia}
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
          className="pb-wb-section pb-wb-process"
          key={section.type}
        >
          <header className="pb-wb-section-head">
            <span className="pb-wb-kicker">
              {FALLBACK_TITLES.services} / 01—
              {String(section.items.length).padStart(2, "0")}
            </span>
            {!hasPageHeader && <h2>{section.headline}</h2>}
            {section.intro && <p>{section.intro}</p>}
          </header>
          <div
            className="pb-wb-process-list"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map((item, i) => (
              <article className="pb-wb-service" key={item.title}>
                <span className="idx" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pb-wb-service-copy">
                  <h3>{item.title}</h3>
                  {item.description && (
                    <p className="muted">{item.description}</p>
                  )}
                </div>
                {item.price && <span className="price">{item.price}</span>}
              </article>
            ))}
          </div>
        </section>
      );
    }
    case "about": {
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-wb-section pb-wb-material"
          key={section.type}
        >
          <header className="pb-wb-section-head">
            <span className="pb-wb-kicker">{FALLBACK_TITLES.about}</span>
            <h2>{section.headline}</h2>
          </header>
          <div className="pb-wb-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            <div className="pb-wb-about-copy">
              <span className="pb-wb-cross" aria-hidden="true">
                +
              </span>
              <p>{section.body}</p>
            </div>
            {section.imageUrl && (
              <figure
                className="pb-wb-about-figure"
                data-pb-slot={LAYOUT_SLOT.aboutMedia}
              >
                <img
                  className="pb-wb-about-img"
                  src={section.imageUrl}
                  alt=""
                  loading="lazy"
                />
              </figure>
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
          className="pb-wb-section pb-wb-workpieces"
          key={section.type}
        >
          <header className="pb-wb-section-head">
            <span className="pb-wb-kicker">{FALLBACK_TITLES.gallery}</span>
            <h2>{title}</h2>
          </header>
          <div
            className="pb-wb-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
          >
            {section.images.map((img, i) => (
              <figure key={img.url}>
                <div className="pb-wb-image-frame">
                  <img src={img.url} alt={img.alt} loading="lazy" />
                  <span aria-hidden="true">
                    W/{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <figcaption>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  {img.alt && <span>{img.alt}</span>}
                </figcaption>
              </figure>
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
          className="pb-wb-section pb-wb-proof"
          key={section.type}
        >
          <header className="pb-wb-section-head">
            <span className="pb-wb-kicker">{FALLBACK_TITLES.testimonials}</span>
            <h2>{title}</h2>
          </header>
          <div className="pb-wb-proof-grid">
            {section.items.map((item, i) => (
              <blockquote key={item.author}>
                <span className="pb-wb-quote-index" aria-hidden="true">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <p>„{item.text}“</p>
                <footer>
                  <b>{item.author}</b>
                  {item.rating && <span>{item.rating}/5 geprüft</span>}
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
          className="pb-wb-section pb-wb-contact-sheet"
          key={section.type}
        >
          <header className="pb-wb-contact-head">
            <span className="pb-wb-kicker">{FALLBACK_TITLES.contact}</span>
            <h2>{title}</h2>
            <span className="pb-wb-contact-mark" aria-hidden="true">
              ↘
            </span>
          </header>
          <div className="pb-wb-contact-grid">
            <div className="pb-wb-contact-links">
              {section.phone && (
                <a href={`tel:${section.phone}`}>
                  <small>Telefon</small>
                  {section.phone}
                </a>
              )}
              {section.email && (
                <a href={`mailto:${section.email}`}>
                  <small>E-Mail</small>
                  {section.email}
                </a>
              )}
              {(section.street || addressLine) && (
                <address>
                  <small>Adresse</small>
                  {section.street && <span>{section.street}</span>}
                  {section.street && addressLine && <br />}
                  {addressLine && <span>{addressLine}</span>}
                </address>
              )}
            </div>
            {section.openingHours && section.openingHours.length > 0 && (
              <div className="pb-wb-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-wb-hours">
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
                    <span className="muted">{item.description}</span>
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
          {section.members.map((member, i) => (
            <div className="pb-wb-service" key={`${i}-${member.name}`}>
              {member.imageUrl && (
                <img src={member.imageUrl} alt="" loading="lazy" />
              )}
              <div>
                <strong>{member.name}</strong>
                {member.role && <p className="muted">{member.role}</p>}
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
    case "pageHeader": {
      return (
        <header className="pb-wb-page-header" key={section.type}>
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

const WerkbankPage: React.FC<{
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
  const contact = sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const services = sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const hasPageHeader = sections.some(s => s.type === "pageHeader");
  const railText = buildRailText(data, contact?.city);
  const year = now.getFullYear();

  return (
    <div className="pb-werkbank">
      <aside className="pb-wb-rail">
        <b>{railText}</b>
      </aside>
      <div className="pb-wb-main">
        <nav className="pb-wb-nav">
          <span className="pb-wb-logo">{renderLogo(data)}</span>
          <div className="pb-wb-nav-links">
            {navList.map(item => (
              <a
                key={item.key}
                href={item.href}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
          <MobileNav items={navList} />
        </nav>
        {sections.map(section =>
          renderSection(section, services, hasPageHeader)
        )}
        <footer className="pb-wb-footer">
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
    </div>
  );
};

const WERKBANK_MODULE: PackModule = {
  id: "werkbank",
  css: WERKBANK_CSS,
  Page: WerkbankPage,
};
PACK_MODULES.werkbank = WERKBANK_MODULE;

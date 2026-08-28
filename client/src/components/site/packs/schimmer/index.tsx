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
import { SCHIMMER_CSS } from "./css";
import { GENERIC_TITLES, PACK_UI } from "../../packCopy";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  ...GENERIC_TITLES,
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

/** Letztes Wort der Headline als warmer Serifenkontrast. */
function renderHeadline(headline: string | undefined): React.ReactNode {
  if (!headline) return null;
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

function LabLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <p className="pb-sc-label">
      <span>{index}</span>
      {children}
    </p>
  );
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
          className="pb-sc-section pb-sc-services"
          key={section.type}
        >
          <header className="pb-sc-section-head">
            <LabLabel index="01">{FALLBACK_TITLES.services}</LabLabel>
            <h2>{renderHeadline(section.headline)}</h2>
            {section.intro && <p className="pb-sc-intro">{section.intro}</p>}
          </header>
          <div
            className="pb-sc-protocols"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map((item, index) => (
              <article className="pb-sc-protocol" key={item.title}>
                <span className="pb-sc-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && (
                  <span className="pb-sc-price">{item.price}</span>
                )}
              </article>
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
          className="pb-sc-section pb-sc-about-section"
          key={section.type}
        >
          <LabLabel index="02">{FALLBACK_TITLES.about}</LabLabel>
          <div className="pb-sc-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            {section.imageUrl && (
              <figure
                className="pb-sc-about-media"
                data-pb-slot={LAYOUT_SLOT.aboutMedia}
              >
                <img
                  className="pb-sc-about-img"
                  src={section.imageUrl}
                  alt=""
                  loading="lazy"
                />
                <span aria-hidden="true">02</span>
              </figure>
            )}
            <div className="pb-sc-about-copy">
              <h2>{renderHeadline(title)}</h2>
              <p>{section.body}</p>
            </div>
          </div>
        </section>
      );
    }
    case "gallery": {
      const title = section.headline ?? FALLBACK_TITLES.gallery;
      return (
        <section
          id={SECTION_ANCHORS.gallery}
          className="pb-sc-section pb-sc-gallery-section"
          key={section.type}
        >
          <header className="pb-sc-section-head">
            <LabLabel index="03">{FALLBACK_TITLES.gallery}</LabLabel>
            <h2>{renderHeadline(title)}</h2>
          </header>
          <div
            className="pb-sc-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
          >
            {section.images.map((img, index) => (
              <figure key={img.url}>
                <img src={img.url} alt={img.alt} loading="lazy" />
                <figcaption>
                  Fokus {String(index + 1).padStart(2, "0")}
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
          className="pb-sc-section pb-sc-testimonials"
          key={section.type}
        >
          <LabLabel index="04">{FALLBACK_TITLES.testimonials}</LabLabel>
          <div className="pb-sc-testimonial-layout">
            <h2>{renderHeadline(title)}</h2>
            <div className="pb-sc-quotes">
              {section.items.map(item => (
                <blockquote className="pb-sc-quote" key={item.author}>
                  <p>„{item.text}“</p>
                  <footer>
                    {item.author}
                    {item.rating ? ` · ${item.rating}/5` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
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
          className="pb-sc-section pb-sc-contact-section"
          key={section.type}
        >
          <div className="pb-sc-contact-title">
            <LabLabel index="05">{FALLBACK_TITLES.contact}</LabLabel>
            <h2>{renderHeadline(title)}</h2>
            {section.phone && (
              <a className="pb-sc-cta" href={`tel:${section.phone}`}>
                {PACK_UI.contact}
              </a>
            )}
          </div>
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
              <div className="pb-sc-hours-block">
                <h3>Öffnungszeiten</h3>
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
            {section.members.map((member, i) => (
              <div className="pb-sc-member" key={`${i}-${member.name}`}>
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
    case "pageHeader": {
      return (
        <header className="pb-sc-page-header" key={section.type}>
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

const SchimmerPage: React.FC<{
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
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-sc-hero">
          <div className="pb-sc-aperture" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="pb-sc-hero-grid" data-pb-slot={LAYOUT_SLOT.heroSplit}>
            <div
              className="pb-sc-hero-copy"
              data-pb-slot={LAYOUT_SLOT.heroCopy}
            >
              <LabLabel index="L/01">
                {data.businessCategory ?? data.businessName}
              </LabLabel>
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
              {firstService && (
                <p className="pb-sc-current">
                  <span>Aktueller Fokus</span>
                  {firstService.title}
                </p>
              )}
            </div>
            {hero.imageUrl && (
              <div
                className="pb-sc-hero-img"
                data-pb-slot={LAYOUT_SLOT.heroMedia}
              >
                <img
                  src={hero.imageUrl}
                  alt=""
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="pb-sc-focus-mark" aria-hidden="true">
                  <span />
                  <span />
                  <i className="pb-sc-scan-line" />
                </div>
                <p aria-hidden="true">01</p>
              </div>
            )}
          </div>
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-sc-footer">
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

const SCHIMMER_MODULE: PackModule = {
  id: "schimmer",
  css: SCHIMMER_CSS,
  Page: SchimmerPage,
};
PACK_MODULES.schimmer = SCHIMMER_MODULE;

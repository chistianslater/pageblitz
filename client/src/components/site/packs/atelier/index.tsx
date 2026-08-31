import React from "react";
import { ProcessSection, QuoteSection, StatsSection } from "../../extraSections";
import { UspSection } from "../../uspSection";
import { HeroCollage } from "../../heroCollage";
import { StorySection } from "../../storySection";
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
import {
  ReviewAuthor,
  ReviewStars,
  REVIEW_READONLY,
} from "../../googleReview";
import { rich } from "../../richText";
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

function renderSection(
  section: SectionV2 | PageSectionOf<"pageHeader">
): React.ReactNode {
  switch (section.type) {
    case "stats":
      return <StatsSection section={section} key="stats" />;
    case "process":
      return <ProcessSection section={section} key="process" />;
    case "quote":
      return <QuoteSection section={section} key="quote" />;
    case "usp":
      return <UspSection section={section} key="usp" />;
    case "notice":
      // Zentral als Banner über der Nav gerendert (SiteRenderer).
      return null;
    case "story":
      return <StorySection section={section} key="story" />;
    case "hero":
      return null; // eigenständig als Masthead + Cover gerendert
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-at-section pb-at-index-section"
          key={section.type}
        >
          <header className="pb-at-section-head">
            <span>{FALLBACK_TITLES.services}</span>
            <h2>{section.headline}</h2>
          </header>
          <div
            className="pb-at-project-index"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map((item, i) => (
              <article className="pb-at-service" key={item.title}>
                <span className="idx" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                </div>
                {item.price && <span className="price">{item.price}</span>}
                <span className="pb-at-shift" aria-hidden="true">
                  ↗
                </span>
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
          className="pb-at-section pb-at-about"
          key={section.type}
        >
          <header className="pb-at-section-head">
            <span>{FALLBACK_TITLES.about}</span>
            <h2>{section.headline}</h2>
          </header>
          <div
            className="pb-at-about-grid"
            data-pb-slot={LAYOUT_SLOT.aboutGrid}
          >
            <div className="pb-at-about-copy">
              <span className="pb-at-dropcap" aria-hidden="true">
                A
              </span>
              <p>{rich(section.body)}</p>
            </div>
            {section.imageUrl && (
              <figure data-pb-slot={LAYOUT_SLOT.aboutMedia}>
                <img
                  className="pb-at-about-img"
                  src={section.imageUrl}
                  alt=""
                  loading="lazy"
                />
                <figcaption>Abbildung 01</figcaption>
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
          className="pb-at-section pb-at-portfolio"
          key={section.type}
        >
          <header className="pb-at-section-head">
            <span>{FALLBACK_TITLES.gallery}</span>
            <h2>{title}</h2>
          </header>
          <div
            className="pb-at-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
          >
            {section.images.map((img, i) => (
              <figure key={img.url}>
                <div className="pb-at-gallery-image">
                  <img src={img.url} alt={img.alt} loading="lazy" />
                </div>
                <figcaption>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <span>{img.caption || "Ohne Titel"}</span>
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
          className="pb-at-section pb-at-voices"
          key={section.type}
        >
          <header className="pb-at-section-head">
            <span>{FALLBACK_TITLES.testimonials}</span>
            <h2>{title}</h2>
          </header>
          <div className="pb-at-voice-pages">
            {section.items.map((item, i) => (
              <blockquote
                className="pb-at-quote"
                key={item.author}
                {...REVIEW_READONLY}
              >
                <span className="pb-at-folio" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ReviewStars rating={item.rating} />
                <p>{item.text}</p>
                <footer>
                  <ReviewAuthor author={item.author} />
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
          className="pb-at-section pb-at-contact-page"
          key={section.type}
        >
          <header className="pb-at-section-head">
            <span>{FALLBACK_TITLES.contact}</span>
            <h2>{title}</h2>
          </header>
          <div className="pb-at-contact" data-pb-slot={LAYOUT_SLOT.contactGrid}>
            <address>
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
                <p>
                  <small>Adresse</small>
                  {section.street && <span>{section.street}</span>}
                  {section.street && addressLine && <br />}
                  {addressLine && <span>{addressLine}</span>}
                </p>
              )}
            </address>
            {section.openingHours && section.openingHours.length > 0 && (
              <div className="pb-at-hours-block">
                <h3>Öffnungszeiten</h3>
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
                      <p className="muted">{item.description}</p>
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
          {section.members.map((member, i) => (
            <div className="pb-at-service" key={`${i}-${member.name}`}>
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
    case "pageHeader": {
      return (
        <header className="pb-at-page-header" key={section.type}>
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

const AtelierPage: React.FC<{
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
  const meta = buildMeta(data, contact?.city, services);
  const indexLabel = buildIndexLabel(services);
  const year = now.getFullYear();

  return (
    <div className="pb-atelier">
      <nav className="pb-at-nav">
        <div className="pb-at-nav-links">
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
      <header className="pb-at-masthead-wrap">
        <div className="pb-at-edition" aria-hidden="true">
          <span>Living Editorial Index</span>
          <span>Vol. {String(year).slice(-2)}</span>
        </div>
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
          <HeroCollage data={data} />
          <div className="pb-at-img" data-pb-slot={LAYOUT_SLOT.heroMedia}>
            {hero.imageUrl && (
              <img
                src={hero.imageUrl}
                alt=""
                loading="eager"
                fetchPriority="high"
              />
            )}
            <h1 className="pb-at-caption">{rich(hero.headline)}</h1>
          </div>
          <div className="pb-at-capcol" data-pb-slot={LAYOUT_SLOT.heroCopy}>
            {indexLabel && <span className="pb-at-idx">{indexLabel}</span>}
            {hero.subheadline && <p>{rich(hero.subheadline)}</p>}
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

const ATELIER_MODULE: PackModule = {
  id: "atelier",
  css: ATELIER_CSS,
  Page: AtelierPage,
};
PACK_MODULES.atelier = ATELIER_MODULE;

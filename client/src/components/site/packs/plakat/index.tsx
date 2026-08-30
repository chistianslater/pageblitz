import React from "react";
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
import { GoogleReviewBody, REVIEW_READONLY } from "../../googleReview";
import { hasMarks, rich } from "../../richText";
import { PLAKAT_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Arbeiten",
  testimonials: "Sagen die Leute",
  contact: "Kontakt",
  faq: "Kurz geklärt",
  menu: "Karte",
  pricelist: "Preise",
  team: "Crew",
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

/** Letztes Wort mit Elektroblau-Balken unterstrichen. */
function renderHeadline(headline: string): React.ReactNode {
  if (headline && hasMarks(headline)) return rich(headline);
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return headline;
  const last = words[words.length - 1];
  const rest = words.slice(0, -1).join(" ");
  return (
    <>
      {rest} <span className="pb-pl-mark">{last}</span>
    </>
  );
}

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function renderSection(
  section: SectionV2 | PageSectionOf<"pageHeader">
): React.ReactNode {
  switch (section.type) {
    case "usp":
      return <UspSection section={section} key="usp" />;
    case "notice":
      // Zentral als Banner über der Nav gerendert (SiteRenderer).
      return null;
    case "story":
      return <StorySection section={section} key="story" />;
    case "hero":
      return null; // Plakatwand im Page-Layout
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-pl-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{section.headline}</h2>
          {section.intro && <p className="pb-pl-intro">{section.intro}</p>}
          <div
            className="pb-pl-services"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map(item => (
              <div className="pb-pl-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && <span className="pb-pl-price">{item.price}</span>}
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
          className="pb-pl-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{section.headline}</h2>
          <div className="pb-pl-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            <p>{rich(section.body)}</p>
            {section.imageUrl && (
              <img
                className="pb-pl-photo"
                src={section.imageUrl}
                alt=""
                loading="lazy"
                data-pb-slot={LAYOUT_SLOT.aboutMedia}
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
          className="pb-pl-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{title}</h2>
          <div
            className="pb-pl-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
          >
            {section.images.map((img, i) => (
              <img
                key={img.url}
                src={img.url}
                alt={img.alt}
                loading="lazy"
                className={i % 3 === 1 ? "tilt-r" : i % 3 === 2 ? "tilt-l" : undefined}
              />
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
          className="pb-pl-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{title}</h2>
          <div className="pb-pl-quotes">
            {section.items.map((item, i) => (
              <blockquote
                className={`pb-pl-quote${i % 2 === 1 ? " tilt-r" : ""}`}
                key={item.author}
                {...REVIEW_READONLY}
              >
                <GoogleReviewBody
                  author={item.author}
                  text={item.text}
                  rating={item.rating}
                />
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
          className="pb-pl-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{title}</h2>
          <div className="pb-pl-contact">
            <address className="pb-pl-card">
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
              <div className="pb-pl-card pb-pl-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-pl-hours">
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
          className="pb-pl-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{title}</h2>
          <div className="pb-pl-faq-list">
            {section.items.map(item => (
              <div className="pb-pl-faq" key={item.question}>
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
          className="pb-pl-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-pl-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-pl-menu-row" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  <span className="pb-pl-price">{item.price}</span>
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
          className="pb-pl-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{title}</h2>
          <div className="pb-pl-team">
            {section.members.map((member, i) => (
              <div className="pb-pl-card pb-pl-member" key={`${i}-${member.name}`}>
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
          className="pb-pl-section pb-pl-cta-section"
          key={section.type}
        >
          <h2 className="pb-pl-title">{section.headline}</h2>
          <a className="pb-pl-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-pl-page-header" key={section.type}>
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

const PlakatPage: React.FC<{
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
  const year = now.getFullYear();

  return (
    <div className="pb-plakat">
      <nav className="pb-pl-nav">
        <span className="pb-pl-logo">{renderLogo(data)}</span>
        <div className="pb-pl-nav-links">
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
        <section id={SECTION_ANCHORS.hero} className="pb-pl-hero">
          <HeroCollage data={data} />
          <div className="pb-pl-hero-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
            <h1>{renderHeadline(hero.headline)}</h1>
            {hero.subheadline && (
              <p className="pb-pl-sub">{rich(hero.subheadline)}</p>
            )}
            {hero.ctaText && (
              <a className="pb-pl-cta" href={hero.ctaHref ?? "#kontakt"}>
                {hero.ctaText}
              </a>
            )}
          </div>
          <div className="pb-pl-hero-media">
            {hero.imageUrl && (
              <img
                className="pb-pl-photo"
                data-pb-slot={LAYOUT_SLOT.heroMedia}
                src={hero.imageUrl}
                alt=""
                loading="eager"
                fetchPriority="high"
              />
            )}
            {data.google && (
              <span className="pb-pl-sticker" aria-label={`Google-Bewertung ${formatRating(data.google.rating)} von 5`}>
                ★ {formatRating(data.google.rating)}
                <small>{data.google.reviewCount} Bewertungen</small>
              </span>
            )}
          </div>
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-pl-footer">
        <p>
          © {year} {data.businessName}
        </p>
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

const PLAKAT_MODULE: PackModule = {
  id: "plakat",
  css: PLAKAT_CSS,
  Page: PlakatPage,
};
PACK_MODULES.plakat = PLAKAT_MODULE;

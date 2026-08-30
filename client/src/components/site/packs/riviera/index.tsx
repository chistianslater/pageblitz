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
import { GoogleReviewBody, REVIEW_READONLY } from "../../googleReview";
import { hasMarks, rich } from "../../richText";
import { RIVIERA_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Angebot",
  about: "Das Haus",
  gallery: "Einblicke",
  testimonials: "Gästestimmen",
  contact: "Kontakt",
  faq: "Gut zu wissen",
  menu: "Karte",
  pricelist: "Preise",
  team: "Gastgeber",
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

/** Letztes Wort kursiv in Azur. */
function renderHeadline(headline: string): React.ReactNode {
  if (headline && hasMarks(headline)) return rich(headline);
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

/** Kapitälchen-Kicker mit Wellenlinie — die Riviera-Signatur. */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="pb-rv-kicker">
      <svg viewBox="0 0 44 8" aria-hidden="true">
        <path
          d="M1 5 Q6 1 11 5 T21 5 T31 5 T41 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {children}
    </p>
  );
}

function renderSection(
  section: SectionV2 | PageSectionOf<"pageHeader">
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return null;
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-rv-section"
          key={section.type}
        >
          <Kicker>Angebot</Kicker>
          <h2 className="pb-rv-title">{section.headline}</h2>
          {section.intro && <p className="pb-rv-intro">{section.intro}</p>}
          <div
            className="pb-rv-services"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map(item => (
              <div className="pb-rv-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && <span className="pb-rv-price">{item.price}</span>}
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
          className="pb-rv-section"
          key={section.type}
        >
          <Kicker>Willkommen</Kicker>
          <h2 className="pb-rv-title">{section.headline}</h2>
          <div className="pb-rv-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            <p>{rich(section.body)}</p>
            {section.imageUrl && (
              <img
                className="pb-rv-arch"
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
          className="pb-rv-section"
          key={section.type}
        >
          <Kicker>Galerie</Kicker>
          <h2 className="pb-rv-title">{title}</h2>
          <div
            className="pb-rv-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
          >
            {section.images.map((img, i) => (
              <img
                key={img.url}
                src={img.url}
                alt={img.alt}
                loading="lazy"
                className={i % 2 === 0 ? "pb-rv-arch" : undefined}
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
          className="pb-rv-section"
          key={section.type}
        >
          <Kicker>Stimmen</Kicker>
          <h2 className="pb-rv-title">{title}</h2>
          <div className="pb-rv-quotes">
            {section.items.map(item => (
              <blockquote
                className="pb-rv-quote"
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
          className="pb-rv-section"
          key={section.type}
        >
          <Kicker>Anreise</Kicker>
          <h2 className="pb-rv-title">{title}</h2>
          <div className="pb-rv-contact">
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
              <div className="pb-rv-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-rv-hours">
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
          className="pb-rv-section"
          key={section.type}
        >
          <Kicker>Fragen</Kicker>
          <h2 className="pb-rv-title">{title}</h2>
          <div className="pb-rv-faq-list">
            {section.items.map(item => (
              <div className="pb-rv-faq" key={item.question}>
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
          className="pb-rv-section"
          key={section.type}
        >
          <Kicker>{fallback}</Kicker>
          <h2 className="pb-rv-title">{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-rv-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-rv-menu-row" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  <span className="pb-rv-price">{item.price}</span>
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
          className="pb-rv-section"
          key={section.type}
        >
          <Kicker>Menschen</Kicker>
          <h2 className="pb-rv-title">{title}</h2>
          <div className="pb-rv-team">
            {section.members.map((member, i) => (
              <div className="pb-rv-member" key={`${i}-${member.name}`}>
                {member.imageUrl && (
                  <img
                    className="pb-rv-arch"
                    src={member.imageUrl}
                    alt=""
                    loading="lazy"
                  />
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
          className="pb-rv-section pb-rv-cta-section"
          key={section.type}
        >
          <Kicker>Anfrage</Kicker>
          <h2 className="pb-rv-title">{section.headline}</h2>
          <a className="pb-rv-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-rv-page-header" key={section.type}>
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

const RivieraPage: React.FC<{
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
  const city = data.sections
    .map(s => (s.type === "contact" ? s.city : undefined))
    .find(Boolean);

  return (
    <div className="pb-riviera">
      <nav className="pb-rv-nav">
        <span className="pb-rv-logo">{renderLogo(data)}</span>
        <div className="pb-rv-nav-links">
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
        <section id={SECTION_ANCHORS.hero} className="pb-rv-hero">
          <div className="pb-rv-hero-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
            <Kicker>{city ?? data.businessCategory}</Kicker>
            <h1>{renderHeadline(hero.headline)}</h1>
            {hero.subheadline && (
              <p className="pb-rv-sub">{rich(hero.subheadline)}</p>
            )}
            <div className="pb-rv-hero-actions">
              {hero.ctaText && (
                <a className="pb-rv-cta" href={hero.ctaHref ?? "#kontakt"}>
                  {hero.ctaText}
                </a>
              )}
              {data.google && (
                <span className="pb-rv-rating">
                  ★ {formatRating(data.google.rating)} ·{" "}
                  {data.google.reviewCount} Bewertungen
                </span>
              )}
            </div>
          </div>
          {hero.imageUrl && (
            <img
              className="pb-rv-arch pb-rv-hero-photo"
              data-pb-slot={LAYOUT_SLOT.heroMedia}
              src={hero.imageUrl}
              alt=""
              loading="eager"
              fetchPriority="high"
            />
          )}
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-rv-footer">
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

const RIVIERA_MODULE: PackModule = {
  id: "riviera",
  css: RIVIERA_CSS,
  Page: RivieraPage,
};
PACK_MODULES.riviera = RIVIERA_MODULE;

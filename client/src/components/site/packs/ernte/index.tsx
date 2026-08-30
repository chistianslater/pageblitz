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
import { ERNTE_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Sortiment",
  about: "Die Werkstatt",
  gallery: "Einblicke",
  testimonials: "Aus dem Gästebuch",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Sorten",
  pricelist: "Preise",
  team: "Wir",
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

function renderHeadline(headline: string): React.ReactNode {
  if (headline && hasMarks(headline)) return rich(headline);
  return headline;
}

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Organischer Solid-Blob (Honig oder Salbei) — nie Gradient. */
function Blob({ tone }: { tone: "honey" | "sage" }) {
  return (
    <svg
      className={`pb-er-blob pb-er-blob-${tone}`}
      viewBox="0 0 200 200"
      aria-hidden="true"
    >
      <path d="M43 118C29 96 34 62 57 45c22-17 57-19 84-6 28 13 45 41 39 66-5 25-33 44-64 50-31 5-58-14-73-37Z" />
    </svg>
  );
}

/** Botanische Linien-Illustration (Zweig) in Indigo, 1.5px, ohne Füllung. */
function Sprig({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 36C34 26 66 14 116 6M34 26c-2-8 2-16 9-19M34 26c8 2 16-1 20-8M62 17c-1-7 3-13 9-15M62 17c7 1 13-2 16-9M88 10c0-5 3-9 8-10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
          className="pb-er-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{section.headline}</h2>
          {section.intro && <p className="pb-er-intro">{section.intro}</p>}
          <div
            className="pb-er-cards"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map(item => (
              <div className="pb-er-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && <span className="pb-er-price">{item.price}</span>}
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
          className="pb-er-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{section.headline}</h2>
          <div className="pb-er-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            <p>{rich(section.body)}</p>
            {section.imageUrl && (
              <span
                className="pb-er-media"
                data-pb-slot={LAYOUT_SLOT.aboutMedia}
              >
                <Blob tone="sage" />
                <img src={section.imageUrl} alt="" loading="lazy" />
              </span>
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
          className="pb-er-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{title}</h2>
          <div
            className="pb-er-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
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
          className="pb-er-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{title}</h2>
          <div className="pb-er-quotes">
            {section.items.map(item => (
              <blockquote
                className="pb-er-quote"
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
          className="pb-er-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{title}</h2>
          <div className="pb-er-contact">
            <address>
              <Sprig className="pb-er-sprig" />
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
              <div className="pb-er-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-er-hours">
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
          className="pb-er-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{title}</h2>
          <div className="pb-er-faq-list">
            {section.items.map(item => (
              <div className="pb-er-faq" key={item.question}>
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
          className="pb-er-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{title}</h2>
          <div className="pb-er-menu">
            {section.categories.map(cat => (
              <div className="pb-er-menu-category" key={cat.name}>
                <h3>{cat.name}</h3>
                {cat.items.map(item => (
                  <div className="pb-er-menu-row" key={item.name}>
                    <div>
                      <strong>{item.name}</strong>
                      {item.description && <p>{item.description}</p>}
                    </div>
                    <span className="pb-er-price">{item.price}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "team": {
      const title = section.headline ?? FALLBACK_TITLES.team;
      return (
        <section
          id={SECTION_ANCHORS.team}
          className="pb-er-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{title}</h2>
          <div className="pb-er-team">
            {section.members.map((member, i) => (
              <div className="pb-er-member" key={`${i}-${member.name}`}>
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
          className="pb-er-section pb-er-cta-section"
          key={section.type}
        >
          <h2 className="pb-er-title">{section.headline}</h2>
          <a className="pb-er-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-er-page-header" key={section.type}>
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

const ErntePage: React.FC<{
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
    <div className="pb-ernte">
      <nav className="pb-er-nav">
        <span className="pb-er-logo">{renderLogo(data)}</span>
        <div className="pb-er-nav-links">
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
        <section id={SECTION_ANCHORS.hero} className="pb-er-hero">
          <div className="pb-er-hero-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
            {/* Script-Zeile nur, wenn sie nicht bloß die Headline dupliziert. */}
            {data.tagline && data.tagline !== hero.headline && (
              <p className="pb-er-script">{data.tagline}</p>
            )}
            <h1>{renderHeadline(hero.headline)}</h1>
            {hero.subheadline && (
              <p className="pb-er-sub">{rich(hero.subheadline)}</p>
            )}
            <div className="pb-er-hero-actions">
              {hero.ctaText && (
                <a className="pb-er-cta" href={hero.ctaHref ?? "#kontakt"}>
                  {hero.ctaText}
                </a>
              )}
              {data.google && (
                <span className="pb-er-rating">
                  ★ {formatRating(data.google.rating)} ·{" "}
                  {data.google.reviewCount} Bewertungen
                </span>
              )}
            </div>
            <Sprig className="pb-er-sprig pb-er-hero-sprig" />
          </div>
          {hero.imageUrl && (
            <div className="pb-er-hero-media">
              <Blob tone="honey" />
              <img
                data-pb-slot={LAYOUT_SLOT.heroMedia}
                src={hero.imageUrl}
                alt=""
                loading="eager"
                fetchPriority="high"
              />
            </div>
          )}
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-er-footer">
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

const ERNTE_MODULE: PackModule = {
  id: "ernte",
  css: ERNTE_CSS,
  Page: ErntePage,
};
PACK_MODULES.ernte = ERNTE_MODULE;

import React from "react";
import { ProcessSection, QuoteSection, StatsSection } from "../../extraSections";
import { UspSection } from "../../uspSection";
import { HeroCollage } from "../../heroCollage";
import { StorySection } from "../../storySection";
import { PartnersSection } from "../../partnersSection";
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
import { STROM_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Der Betrieb",
  gallery: "Anlagen",
  testimonials: "Kundenstimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Karte",
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

/** Letztes Wort in Elektro-Cyan. */
function renderHeadline(headline: string): React.ReactNode {
  if (headline && hasMarks(headline)) return rich(headline);
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return headline;
  const last = words[words.length - 1];
  const rest = words.slice(0, -1).join(" ");
  return (
    <>
      {rest} <span className="pb-st-glow">{last}</span>
    </>
  );
}

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Mono-Label mit Statuspunkt — die Strom-Signatur. */
function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="pb-st-mono">
      <i aria-hidden="true" />
      {children}
    </p>
  );
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
    case "partners":
      return <PartnersSection section={section} key="partners" />;
    case "story":
      return <StorySection section={section} key="story" />;
    case "hero":
      return null;
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>LEISTUNGEN</MonoLabel>
          <h2 className="pb-st-title">{section.headline}</h2>
          {section.intro && <p className="pb-st-intro">{section.intro}</p>}
          <div
            className="pb-st-services"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map((item, i) => (
              <div className="pb-st-card" key={item.title}>
                <span className="pb-st-card-id">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && <span className="pb-st-price">{item.price}</span>}
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
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>ÜBER UNS</MonoLabel>
          <h2 className="pb-st-title">{section.headline}</h2>
          <div className="pb-st-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            <p>{rich(section.body)}</p>
            {section.imageUrl && (
              <span className="pb-st-screen" data-pb-slot={LAYOUT_SLOT.aboutMedia}>
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
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>GALERIE</MonoLabel>
          <h2 className="pb-st-title">{title}</h2>
          <div
            className="pb-st-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
          >
            {section.images.map(img => (
              <span className="pb-st-screen" key={img.url}>
                <img src={img.url} alt={img.alt} loading="lazy" />
              </span>
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
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>REFERENZEN</MonoLabel>
          <h2 className="pb-st-title">{title}</h2>
          <div className="pb-st-quotes">
            {section.items.map(item => (
              <blockquote
                className="pb-st-card pb-st-quote"
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
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>KONTAKT</MonoLabel>
          <h2 className="pb-st-title">{title}</h2>
          <div className="pb-st-contact" data-pb-slot={LAYOUT_SLOT.contactGrid}>
            <address className="pb-st-card">
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
              <div className="pb-st-card pb-st-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-st-hours">
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
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>FAQ</MonoLabel>
          <h2 className="pb-st-title">{title}</h2>
          <div className="pb-st-faq-list">
            {section.items.map(item => (
              <div className="pb-st-faq" key={item.question}>
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
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>PREISE</MonoLabel>
          <h2 className="pb-st-title">{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-st-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-st-menu-row" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  <span className="pb-st-price">{item.price}</span>
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
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>TEAM</MonoLabel>
          <h2 className="pb-st-title">{title}</h2>
          <div className="pb-st-team">
            {section.members.map((member, i) => (
              <div className="pb-st-member" key={`${i}-${member.name}`}>
                {member.imageUrl && (
                  <span className="pb-st-screen">
                    <img src={member.imageUrl} alt="" loading="lazy" />
                  </span>
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
          className="pb-st-section"
          key={section.type}
        >
          <MonoLabel>ANFRAGE</MonoLabel>
          <h2 className="pb-st-title">{section.headline}</h2>
          <a className="pb-st-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-st-page-header" key={section.type}>
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

const StromPage: React.FC<{
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

  return (
    <div className="pb-strom">
      <nav className="pb-st-nav">
        <span className="pb-st-logo">{renderLogo(data)}</span>
        <div className="pb-st-nav-links">
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
        <section id={SECTION_ANCHORS.hero} className="pb-st-hero">
          <HeroCollage data={data} />
          <div className="pb-st-hero-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
            <MonoLabel>SYSTEME BEREIT</MonoLabel>
            <h1>{renderHeadline(hero.headline)}</h1>
            {hero.subheadline && (
              <p className="pb-st-sub">{rich(hero.subheadline)}</p>
            )}
            {hero.ctaText && (
              <a className="pb-st-cta" href={hero.ctaHref ?? "#kontakt"}>
                {hero.ctaText}
              </a>
            )}
            <div className="pb-st-terminal">
              {services && services.items.length > 0 && (
                <div>
                  <b>{services.items.length}</b>
                  <span>Leistungsfelder</span>
                </div>
              )}
              {data.google && (
                <>
                  <div>
                    <b>{formatRating(data.google.rating)}</b>
                    <span>Google-Wertung</span>
                  </div>
                  <div>
                    <b>{data.google.reviewCount}</b>
                    <span>Bewertungen</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {hero.imageUrl && (
            <div className="pb-st-hero-media">
              <span className="pb-st-aurora" aria-hidden="true" />
              <span className="pb-st-screen">
                <img
                  data-pb-slot={LAYOUT_SLOT.heroMedia}
                  src={hero.imageUrl}
                  alt=""
                  loading="eager"
                  fetchPriority="high"
                />
              </span>
            </div>
          )}
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-st-footer">
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

const STROM_MODULE: PackModule = {
  id: "strom",
  css: STROM_CSS,
  Page: StromPage,
};
PACK_MODULES.strom = STROM_MODULE;

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
import { MARKTPLATZ_CSS } from "./css";
import { PACK_UI } from "../../packCopy";
import { hasMarks, rich } from "../../richText";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
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
      className="pb-mp-squiggle pb-deco"
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
  // Explizite Marker (Studio-Texteditor) ersetzen die Auto-Akzentuierung.
  if (headline && hasMarks(headline)) return rich(headline);
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
  const ink = price ?? data.businessCategory ?? data.businessName;
  const outline = contact?.city
    ? contact.city
    : (services?.items[1]?.title ?? data.businessCategory ?? data.businessName);
  return { pill, ink, outline };
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
          <div className="pb-mp-grid" data-pb-slot={LAYOUT_SLOT.servicesItems}>
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
          <div className="pb-mp-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            {section.imageUrl && (
              <img
                src={section.imageUrl}
                alt=""
                loading="lazy"
                data-pb-slot={LAYOUT_SLOT.aboutMedia}
              />
            )}
            <p>{rich(section.body)}</p>
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
          <div
            className="pb-mp-grid pb-mp-gallery"
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
          className="pb-mp-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-mp-grid">
            {section.items.map(item => (
              <blockquote
                className="pb-mp-card-item pb-mp-quote"
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
              <div className="pb-mp-hours-block">
                <h3>Öffnungszeiten</h3>
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
            {section.members.map((member, i) => (
              <div key={`${i}-${member.name}`}>
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
    case "pageHeader": {
      return (
        <header className="pb-mp-page-header" key={section.type}>
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

const MarktplatzPage: React.FC<{
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
  const stickers = buildStickers(data, services, contact);
  const year = now.getFullYear();

  return (
    <div className="pb-marktplatz">
      <nav className="pb-mp-nav">
        <span className="pb-mp-logo">{renderLogo(data)}</span>
        <div className="pb-mp-nav-links">
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
        <section id={SECTION_ANCHORS.hero} className="pb-mp-hero">
          <HeroCollage data={data} />
          <div
            className="pb-mp-hero-inner"
            data-pb-slot={LAYOUT_SLOT.heroSplit}
          >
            <div className="pb-mp-card" data-pb-slot={LAYOUT_SLOT.heroCopy}>
              {data.businessCategory && (
                <p className="pb-mp-eyebrow">{data.businessCategory}</p>
              )}
              <h1>{renderHeadline(hero.headline)}</h1>
              {hero.subheadline && (
                <p className="pb-mp-sub">{rich(hero.subheadline)}</p>
              )}
              {hero.ctaText && (
                <a className="pb-mp-cta" href={hero.ctaHref ?? "#kontakt"}>
                  {hero.ctaText}
                </a>
              )}
            </div>
            {hero.imageUrl && (
              <div
                className="pb-mp-photo-wrap"
                data-pb-slot={LAYOUT_SLOT.heroMedia}
              >
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
      {hero?.ctaText && (
        <aside className="pb-mp-trial-cta" aria-label={PACK_UI.contact}>
          <a href={hero.ctaHref ?? "#kontakt"}>{hero.ctaText}</a>
        </aside>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-mp-footer">
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

const MARKTPLATZ_MODULE: PackModule = {
  id: "marktplatz",
  css: MARKTPLATZ_CSS,
  Page: MarktplatzPage,
};
PACK_MODULES.marktplatz = MARKTPLATZ_MODULE;

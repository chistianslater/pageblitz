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

import { GoogleReviewBody, REVIEW_READONLY } from "../../googleReview";
import { hasMarks, rich } from "../../richText";
import { ZUNFT_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Unsere Geschichte",
  gallery: "Impressionen",
  testimonials: "Was Kunden sagen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Speisekarte",
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

/** Letztes Wort der Headline kursiv in Bordeaux — der Rest bleibt Ofenschwarz. */
function renderHeadline(headline: string): React.ReactNode {
  // Explizite Marker (Studio-Texteditor) ersetzen die Auto-Akzentuierung.
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

/**
 * Extrahiert eine vierstellige Jahreszahl aus der Footer-Notiz (z. B. „seit
 * 1927"). Ohne erkennbares Jahr wird kein Stempel gerendert (siehe Brief).
 */
function extractYear(footerNote: string | undefined): string | undefined {
  if (!footerNote) return undefined;
  const match = footerNote.match(/(1[5-9]\d{2}|20\d{2})/);
  return match ? match[0] : undefined;
}

/** Ornament-Bordüre: letterspaced ◆-Reihe in Siegelgold über einer Gold-Linie. */
function OrnamentBorder(): React.ReactElement {
  return (
    <div className="pb-zf-borde pb-deco" aria-hidden="true">
      {Array.from({ length: 40 }, () => "◆").join(" ")}
    </div>
  );
}

/** Doppel-Linien-Ornament unter der Nav: zwei dünne Ofenschwarz-Linien. */
function DoubleRule(): React.ReactElement {
  return <div className="pb-zf-rule2" aria-hidden="true" />;
}

/** Eine Punktlinien-Preistafel-Zeile: Name … gepunktete Füllung … Preis in Gold. */
function TafelRow({
  name,
  price,
}: {
  name: string;
  price: string;
}): React.ReactElement {
  return (
    <div className="pb-zf-tafel">
      <span>{name}</span>
      <i />
      <span className="pb-zf-price">{price}</span>
    </div>
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
    case "story":
      return <StorySection section={section} key="story" />;
    case "hero":
      return null; // eigenständig im Page-Layout gerendert
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-zf-intro">{section.intro}</p>}
          <div className="pb-zf-grid" data-pb-slot={LAYOUT_SLOT.servicesItems}>
            {section.items.map(item => (
              <div className="pb-zf-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && (
                  <span className="pb-zf-price">{item.price}</span>
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
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-zf-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
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
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div
            className="pb-zf-gallery"
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
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-zf-quotes">
            {section.items.map(item => (
              <blockquote
                className="pb-zf-quote"
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
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-zf-contact">
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
              <div className="pb-zf-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-zf-hours">
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
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div className="pb-zf-faq" key={item.question}>
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
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-zf-tafel-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-zf-tafel-item" key={item.name}>
                  <TafelRow name={item.name} price={item.price} />
                  {item.description && <p>{item.description}</p>}
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
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-zf-team">
            {section.members.map((member, i) => (
              <div className="pb-zf-member" key={`${i}-${member.name}`}>
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
          className="pb-zf-section pb-zf-cta-card"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-zf-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-zf-page-header" key={section.type}>
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

const ZunftPage: React.FC<{
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
  const half = Math.ceil(navList.length / 2);
  const navLeft = navList.slice(0, half);
  const navRight = navList.slice(half);
  const hero = sections.find((s): s is SectionOf<"hero"> => s.type === "hero");
  const priceSection = sections.find(
    (s): s is SectionOf<"pricelist"> | SectionOf<"menu"> =>
      s.type === "pricelist" || s.type === "menu"
  );
  const previewItems = priceSection?.categories[0]?.items.slice(0, 2) ?? [];
  const year = extractYear(data.footerNote);
  const yearNow = now.getFullYear();
  const contact = sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const routeQuery = contact
    ? [contact.street, contact.zip, contact.city].filter(Boolean).join(" ")
    : "";

  return (
    <div className="pb-zunft">
      <OrnamentBorder />
      <nav className="pb-zf-nav">
        <div className="pb-zf-nav-links">
          {navLeft.map(item => (
            <a
              key={item.key}
              href={item.href}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
        <span className="pb-zf-logo">{renderLogo(data)}</span>
        <div className="pb-zf-nav-links">
          {navRight.map(item => (
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
      <DoubleRule />
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-zf-hero">
          <HeroCollage data={data} />
          {hero.imageUrl && (
            <img
              className="pb-zf-hero-photo"
              data-pb-slot={LAYOUT_SLOT.heroMedia}
              src={hero.imageUrl}
              alt=""
              loading="eager"
              fetchPriority="high"
            />
          )}
          <h1 className="pb-zf-headline">
            {renderHeadline(hero.headline)}
            {year && (
              <span className="pb-zf-stamp" aria-hidden="true">
                Seit
                <br />
                {year}
              </span>
            )}
          </h1>
          {hero.subheadline && <p className="pb-zf-sub">{rich(hero.subheadline)}</p>}
          {previewItems.length > 0 && (
            <div className="pb-zf-tafel-preview">
              {previewItems.map(item => (
                <TafelRow key={item.name} name={item.name} price={item.price} />
              ))}
            </div>
          )}
          {hero.ctaText && (
            <a className="pb-zf-cta" href={hero.ctaHref ?? "#kontakt"}>
              {hero.ctaText}
            </a>
          )}
        </section>
      )}
      {(hero?.ctaText || routeQuery) && (
        <aside
          className="pb-zf-order-sticky"
          aria-label="Kontakt und Route"
        >
          <span aria-hidden="true">◆</span>
          {hero?.ctaText && (
            <a href={hero.ctaHref ?? "#kontakt"}>{hero.ctaText}</a>
          )}
          {routeQuery && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(routeQuery)}`}
              target="_blank"
              rel="noreferrer"
            >
              Route ↗
            </a>
          )}
        </aside>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-zf-footer">
        <p>
          © {yearNow} {data.businessName}
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

const ZUNFT_MODULE: PackModule = {
  id: "zunft",
  css: ZUNFT_CSS,
  Page: ZunftPage,
};
PACK_MODULES.zunft = ZUNFT_MODULE;

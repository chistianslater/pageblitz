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
import { GUSTO_CSS } from "./css";
import { GENERIC_TITLES, PACK_UI } from "../../packCopy";
import { rich } from "../../richText";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  ...GENERIC_TITLES,
  about: "Unsere Geschichte",
  gallery: "Impressionen",
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

/** Ornament-Divider: zwei Hairlines um ein Gold-Diamant-Zeichen. */
function OrnamentDivider(): React.ReactElement {
  return (
    <div className="pb-gu-div pb-deco pb-deco-ornaments" aria-hidden="true">
      <span className="line" />
      <span className="diamond">◆</span>
      <span className="line" />
    </div>
  );
}

/**
 * Nackte Zahlen bekommen ein €-Zeichen („14" → „14 €", „ab 12" → „ab 12 €");
 * Texte ohne Ziffer („auf Anfrage") und vorhandene €/EUR bleiben unverändert.
 * Gleiches Muster wie salon-noir — Konsistenz mit den hellen Packs.
 */
function formatPrice(price: string): string {
  const trimmed = price.trim();
  if (/€|eur/i.test(trimmed) || !/\d/.test(trimmed)) return trimmed;
  return `${trimmed} €`;
}

/** Eine Punktlinien-Menüzeile: Name … gepunktete Füllung … Preis in Gold. */
function MenuRow({
  name,
  price,
}: {
  name: string;
  price: string;
}): React.ReactElement {
  return (
    <div className="pb-gu-menu">
      <span>{name}</span>
      <i />
      <span className="pb-gu-price">{formatPrice(price)}</span>
    </div>
  );
}

function SectionKicker({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <p className="pb-gu-kicker">
      <span>{index}</span>
      {children}
    </p>
  );
}

interface GustoChrome {
  contactCta: string;
  contactHref: string;
}

function renderSection(
  section: SectionV2 | PageSectionOf<"pageHeader">,
  chrome: GustoChrome
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
          className="pb-gu-section pb-gu-services"
          key={section.type}
        >
          <header className="pb-gu-section-head">
            <SectionKicker index="01">{FALLBACK_TITLES.services}</SectionKicker>
            <h2>{section.headline}</h2>
            {section.intro && <p className="pb-gu-intro">{section.intro}</p>}
          </header>
          <div
            className="pb-gu-service-list"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map((item, index) => (
              <article className="pb-gu-service-row" key={item.title}>
                <span className="pb-gu-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                </div>
                {item.price && (
                  <span className="pb-gu-price">{formatPrice(item.price)}</span>
                )}
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
          className="pb-gu-section pb-gu-story"
          key={section.type}
        >
          <SectionKicker index="02">{FALLBACK_TITLES.about}</SectionKicker>
          <div className="pb-gu-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            {section.imageUrl && (
              <figure data-pb-slot={LAYOUT_SLOT.aboutMedia}>
                <img src={section.imageUrl} alt="" loading="lazy" />
              </figure>
            )}
            <div className="pb-gu-about-copy">
              <h2>{section.headline}</h2>
              <p>{rich(section.body)}</p>
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
          className="pb-gu-section pb-gu-film"
          key={section.type}
        >
          <header className="pb-gu-section-head">
            <SectionKicker index="03">{FALLBACK_TITLES.gallery}</SectionKicker>
            <h2>{title}</h2>
          </header>
          <div
            className="pb-gu-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
          >
            {section.images.map((img, index) => (
              <figure key={img.url}>
                <img src={img.url} alt={img.alt} loading="lazy" />
                <figcaption aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
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
          className="pb-gu-section pb-gu-voices"
          key={section.type}
        >
          <SectionKicker index="04">{FALLBACK_TITLES.testimonials}</SectionKicker>
          <div className="pb-gu-voices-grid">
            <h2>{title}</h2>
            <div>
              {section.items.map(item => (
                <blockquote
                  className="pb-gu-quote"
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
          className="pb-gu-section pb-gu-reservation"
          key={section.type}
        >
          <div className="pb-gu-reservation-title">
            <SectionKicker index="05">{FALLBACK_TITLES.contact}</SectionKicker>
            <h2>{title}</h2>
            {section.phone && (
              <a className="pb-gu-cta" href={`tel:${section.phone}`}>
                {chrome.contactCta}
              </a>
            )}
          </div>
          <div className="pb-gu-contact">
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
              {(section.street || addressLine) && (
                <a
                  className="pb-gu-route"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [section.street, addressLine].filter(Boolean).join(" ")
                  )}`}
                >
                  Route öffnen ↗
                </a>
              )}
            </address>
            {section.openingHours && section.openingHours.length > 0 && (
              <div className="pb-gu-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-gu-hours">
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
          className="pb-gu-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div className="pb-gu-faq" key={item.question}>
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
          className="pb-gu-section pb-gu-menu-section"
          key={section.type}
        >
          <header className="pb-gu-section-head">
            <SectionKicker index="06">{fallback}</SectionKicker>
            <h2>{title}</h2>
          </header>
          <div
            className="pb-gu-menu-columns"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.categories.map((cat, index) => (
              <div className="pb-gu-menu-category" key={cat.name}>
                <p className="pb-gu-index">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3>{cat.name}</h3>
                {cat.items.map(item => (
                  <div className="pb-gu-menu-item" key={item.name}>
                    <MenuRow name={item.name} price={item.price} />
                    {item.description && <p>{item.description}</p>}
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
          className="pb-gu-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-gu-team">
            {section.members.map((member, i) => (
              <div className="pb-gu-member" key={`${i}-${member.name}`}>
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
          className="pb-gu-section pb-gu-cta-card"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-gu-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-gu-page-header" key={section.type}>
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

const GustoPage: React.FC<{
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
  const chrome: GustoChrome = {
    contactCta: hero?.ctaText?.trim() || PACK_UI.contact,
    contactHref: hero?.ctaHref ?? "#kontakt",
  };
  const half = Math.ceil(navList.length / 2);
  const navLeft = navList.slice(0, half);
  const navRight = navList.slice(half);
  const menu = sections.find((s): s is SectionOf<"menu"> => s.type === "menu");
  const contact = sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const routeQuery = contact
    ? [contact.street, contact.zip, contact.city].filter(Boolean).join(" ")
    : "";
  /* Menü-Vorschau als Highlights: je Kategorie das erste Gericht (max. 3) —
     statt der ersten drei Zeilen der ersten Kategorie, die den Anfang der
     direkt folgenden Speisekarte 1:1 duplizierten (B7 Welle 2). Die
     Punktlinien-Signatur bleibt. */
  const previewItems = (
    menu?.categories.map(cat => cat.items[0]).filter(Boolean) ?? []
  ).slice(0, 3);
  const year = now.getFullYear();

  return (
    <div className="pb-gusto">
      <div className="pb-gu-frame">
        <nav className="pb-gu-nav">
          <div className="pb-gu-nav-links">
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
          <span className="pb-gu-logo">{renderLogo(data)}</span>
          <div className="pb-gu-nav-links">
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
        {hero && (
          <section id={SECTION_ANCHORS.hero} className="pb-gu-hero">
          <HeroCollage data={data} />
            <div
              className="pb-gu-hero-media"
              data-pb-slot={LAYOUT_SLOT.heroMedia}
              aria-hidden="true"
            >
              {hero.imageUrl && (
                <img
                  src={hero.imageUrl}
                  alt=""
                  loading="eager"
                  fetchPriority="high"
                />
              )}
            </div>
            <div className="pb-gu-hero-shade" aria-hidden="true" />
            <div
              className="pb-gu-hero-copy"
              data-pb-slot={LAYOUT_SLOT.heroCopy}
            >
              {data.businessCategory && (
                <p className="pb-gu-eyebrow">{data.businessCategory}</p>
              )}
              <h1>{rich(hero.headline)}</h1>
              {hero.subheadline && (
                <p className="pb-gu-subline">{rich(hero.subheadline)}</p>
              )}
              <OrnamentDivider />
              {hero.ctaText && (
                <a className="pb-gu-cta" href={hero.ctaHref ?? "#kontakt"}>
                  {hero.ctaText}
                </a>
              )}
            </div>
            {previewItems.length > 0 && (
              <aside
                className="pb-gu-menu-preview"
                aria-label={FALLBACK_TITLES.menu}
              >
                <p className="pb-gu-preview-label">{FALLBACK_TITLES.menu}</p>
                {previewItems.map(item => (
                  <MenuRow
                    key={item.name}
                    name={item.name}
                    price={item.price}
                  />
                ))}
              </aside>
            )}
            <nav className="pb-gu-quick" aria-label="Schnellzugriff">
              {menu && <a href={`#${SECTION_ANCHORS.menu}`}>Speisekarte</a>}
              <a href={chrome.contactHref}>{chrome.contactCta}</a>
              <a
                href={
                  routeQuery
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        routeQuery
                      )}`
                    : "#kontakt"
                }
              >
                Route
              </a>
            </nav>
          </section>
        )}
        {sections
          .filter(s => s.type !== "hero")
          .map(section => renderSection(section, chrome))}
        <footer className="pb-gu-footer">
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

const GUSTO_MODULE: PackModule = {
  id: "gusto",
  css: GUSTO_CSS,
  Page: GustoPage,
};
PACK_MODULES.gusto = GUSTO_MODULE;

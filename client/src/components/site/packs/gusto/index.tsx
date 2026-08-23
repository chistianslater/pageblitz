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
import { GUSTO_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Unsere Geschichte",
  gallery: "Impressionen",
  testimonials: "Was Gäste sagen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Speisekarte",
  pricelist: "Preisliste",
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

/** Ornament-Divider: zwei Hairlines um ein Gold-Diamant-Zeichen. */
function OrnamentDivider(): React.ReactElement {
  return (
    <div className="pb-gu-div" aria-hidden="true">
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
          className="pb-gu-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-gu-intro">{section.intro}</p>}
          <div className="pb-gu-grid">
            {section.items.map(item => (
              <div className="pb-gu-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && (
                  <span className="pb-gu-price">{formatPrice(item.price)}</span>
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
          className="pb-gu-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-gu-about">
            {section.imageUrl && (
              <img src={section.imageUrl} alt="" loading="lazy" />
            )}
            <p>{section.body}</p>
          </div>
        </section>
      );
    }
    case "gallery": {
      const title = section.headline ?? FALLBACK_TITLES.gallery;
      return (
        <section
          id={SECTION_ANCHORS.gallery}
          className="pb-gu-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-gu-gallery">
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
          className="pb-gu-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <blockquote className="pb-gu-quote" key={item.author}>
              <p>„{item.text}“</p>
              <footer>
                {item.author}
                {item.rating ? ` · ${item.rating}/5` : ""}
              </footer>
            </blockquote>
          ))}
        </section>
      );
    }
    case "contact": {
      const title = section.headline ?? FALLBACK_TITLES.contact;
      const addressLine = [section.zip, section.city].filter(Boolean).join(" ");
      return (
        <section
          id={SECTION_ANCHORS.contact}
          className="pb-gu-section"
          key={section.type}
        >
          <h2>{title}</h2>
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
          className="pb-gu-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-gu-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-gu-menu-item" key={item.name}>
                  <MenuRow name={item.name} price={item.price} />
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
  const half = Math.ceil(navList.length / 2);
  const navLeft = navList.slice(0, half);
  const navRight = navList.slice(half);
  const hero = sections.find((s): s is SectionOf<"hero"> => s.type === "hero");
  const menu = sections.find((s): s is SectionOf<"menu"> => s.type === "menu");
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
        </nav>
        {hero && (
          <section id={SECTION_ANCHORS.hero} className="pb-gu-hero">
            {data.businessCategory && (
              <p className="pb-gu-eyebrow">{data.businessCategory}</p>
            )}
            <h1>{hero.headline}</h1>
            {hero.subheadline && <p>{hero.subheadline}</p>}
            <OrnamentDivider />
            {previewItems.length > 0 && (
              <div className="pb-gu-menu-preview">
                {previewItems.map(item => (
                  <MenuRow
                    key={item.name}
                    name={item.name}
                    price={item.price}
                  />
                ))}
              </div>
            )}
            {hero.ctaText && (
              <a className="pb-gu-cta" href={hero.ctaHref ?? "#kontakt"}>
                {hero.ctaText}
              </a>
            )}
            <div
              className="pb-gu-plate"
              aria-hidden="true"
              style={
                hero.imageUrl
                  ? { backgroundImage: `url(${hero.imageUrl})` }
                  : undefined
              }
            />
          </section>
        )}
        {sections
          .filter(s => s.type !== "hero")
          .map(section => renderSection(section))}
        <footer className="pb-gu-footer">
          <p>
            {data.businessName} · © {year} {data.businessName}
          </p>
          {data.footerNote && <p>{data.footerNote}</p>}
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

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
import { LANDGUT_CSS } from "./css";
import { PACK_UI } from "../../packCopy";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Impressionen",
  testimonials: "Was Kund:innen sagen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Angebot",
  pricelist: "Preise",
  team: "Team",
  cta: "Anfrage",
};

/** Statisches Versal-Label unter dem höchsten Pflanzreihen-Bogen. */
const ROW_LABEL = "";

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

/** Letztes Wort der Headline kursiv in Blattgrün — der Rest bleibt Erde-farben. */
function renderHeadline(headline: string): React.ReactNode {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return headline;
  const last = words[words.length - 1];
  const rest = words.slice(0, -1).join(" ");
  return (
    <>
      {rest} <span>{last}</span>
    </>
  );
}

/** Zwei identische Gruppen ergeben eine nahtlose, ruhige Saison-Schleife. */
function buildTicker(
  services: SectionOf<"services"> | undefined
): React.ReactNode {
  if (!services || services.items.length === 0) return null;
  const titles = services.items.map(item => item.title);
  const group = (copy: number) => (
    <span
      className="pb-lg-ticker-group"
      aria-hidden={copy === 1 ? "true" : undefined}
    >
      {titles.map((title, i) => (
        <React.Fragment key={`${title}-${copy}-${i}`}>
          <span>{title}</span>
          <em aria-hidden="true">◦</em>
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="pb-lg-ticker" aria-label={titles.join(", ")}>
      <div className="pb-lg-ticker-track">
        {group(0)}
        {group(1)}
      </div>
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
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p>{section.intro}</p>}
          {section.items.map(item => (
            <div className="pb-lg-service" key={item.title}>
              <strong>{item.title}</strong>
              {item.description && <p>{item.description}</p>}
              {item.price && <p>{item.price}</p>}
            </div>
          ))}
        </section>
      );
    }
    case "about": {
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-lg-about">
            <p>{section.body}</p>
            {section.imageUrl && (
              <img
                className="pb-lg-arch-img"
                src={section.imageUrl}
                alt=""
                loading="lazy"
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
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-lg-gallery">
            {section.images.map(img => (
              <img
                className="pb-lg-arch-img"
                key={img.url}
                src={img.url}
                alt={img.alt}
                loading="lazy"
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
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <blockquote className="pb-lg-quote" key={item.author}>
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
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-lg-contact">
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
              <div className="pb-lg-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-lg-hours">
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
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div className="pb-lg-faq" key={item.question}>
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
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-lg-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-lg-service" key={item.name}>
                  <strong>{item.name}</strong>
                  {item.description && <p>{item.description}</p>}
                  <p>{item.price}</p>
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
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-lg-team">
            {section.members.map((member, i) => (
              <div className="pb-lg-member" key={`${i}-${member.name}`}>
                {member.imageUrl && (
                  <img
                    className="pb-lg-arch-img"
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
          className="pb-lg-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-lg-link" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText} →
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-lg-page-header" key={section.type}>
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

const LandgutPage: React.FC<{
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
  const eyebrow = [data.businessCategory, contact?.city]
    .filter((v): v is string => Boolean(v))
    .join(" · ");
  const year = now.getFullYear();
  const routeQuery = contact
    ? [contact.street, contact.zip, contact.city].filter(Boolean).join(" ")
    : "";

  return (
    <div className="pb-landgut">
      <nav className="pb-lg-nav">
        <span className="pb-lg-logo">{renderLogo(data)}</span>
        <div className="pb-lg-nav-links">
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
        <>
          <section id={SECTION_ANCHORS.hero} className="pb-lg-hero">
            <div className="pb-lg-grid">
              <div className="pb-lg-copy">
                {eyebrow && <p className="pb-lg-eyebrow">{eyebrow}</p>}
                <h1>{renderHeadline(hero.headline)}</h1>
                {hero.subheadline && (
                  <p className="pb-lg-sub">{hero.subheadline}</p>
                )}
                {hero.ctaText && (
                  <a className="pb-lg-cta" href={hero.ctaHref ?? "#kontakt"}>
                    {hero.ctaText}
                  </a>
                )}
              </div>
              {/* Pflanzreihen-Bögen (B7 Welle 2): der höchste Bogen trägt
                  das Hero-Foto in der Bogen-Maske (imageTreatment der
                  Verfassung), die beiden kleineren bleiben Farbflächen als
                  Rhythmus. Ohne Hero-Bild greift die bisherige Komposition
                  mit dem SAISON-Label — auf dem Foto wäre es unlesbar. */}
              <div className="pb-lg-rows" aria-hidden="true">
                <div className="pb-lg-row r1">
                  {hero.imageUrl ? (
                    <img
                      className="pb-lg-row-img"
                      src={hero.imageUrl}
                      alt=""
                      loading="eager"
                      fetchPriority="high"
                    />
                  ) : (
                    <span className="pb-lg-row-label">{ROW_LABEL}</span>
                  )}
                </div>
                <div className="pb-lg-row r2" />
                <div className="pb-lg-row r3" />
              </div>
            </div>
          </section>
          {/* Saison-Ticker nur auf der Startseite (Q1, B7 Welle 0): auf
              Unterseiten muss der pageHeader das erste Element nach der
              Nav sein — ein Laufband davor wirkt kontextlos. */}
          {buildTicker(services)}
        </>
      )}
      {contact && (
        <aside className="pb-lg-visit-sticky" aria-label={PACK_UI.contact}>
          <span>
            <b>{PACK_UI.contact}</b>
            {contact.openingHours?.[0]?.hours ?? contact.city}
          </span>
          <a href="#kontakt">Details</a>
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
      <footer className="pb-lg-footer">
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

const LANDGUT_MODULE: PackModule = {
  id: "landgut",
  css: LANDGUT_CSS,
  Page: LandgutPage,
};
PACK_MODULES.landgut = LANDGUT_MODULE;

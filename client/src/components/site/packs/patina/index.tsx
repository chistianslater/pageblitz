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
import { PATINA_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über mich",
  gallery: "Impressionen",
  testimonials: "Stimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Angebot",
  pricelist: "Preise",
  team: "Team",
  cta: "Termin",
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

/** Letztes Wort der Headline kursiv in Terrakotta — der Rest bleibt Tinte-farben. */
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

/** Erster Buchstabe des Firmennamens, groß — Basis für das Initial-Wasserzeichen. */
function initialLetter(businessName: string): string {
  const trimmed = businessName.trim();
  return trimmed.length > 0 ? trimmed[0].toLocaleUpperCase("de-DE") : "";
}

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Handschriftlich anmutende Randnotiz: Google-Bewertung, sonst Standort. */
function buildNote(
  data: WebsiteDataV2,
  contact: SectionOf<"contact"> | undefined
): string | undefined {
  if (data.google) {
    return `— ★ ${formatRating(data.google.rating)} · ${data.google.reviewCount} Bewertungen`;
  }
  if (contact?.city) return `— mitten in ${contact.city}`;
  return undefined;
}

function renderSection(
  section: SectionV2 | PageSectionOf<"pageHeader">,
  heroArchSrc: string | undefined
): React.ReactNode {
  switch (section.type) {
    case "hero":
      return null; // eigenständig im Page-Layout gerendert
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-pa-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p>{section.intro}</p>}
          <div
            className="pb-pa-services-grid"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map(item => (
              <div className="pb-pa-service" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && <p>{item.price}</p>}
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "about": {
      const showImage = Boolean(
        section.imageUrl && section.imageUrl !== heroArchSrc
      );
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-pa-section pb-pa-about"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div
            className="pb-pa-about-grid"
            data-pb-slot={LAYOUT_SLOT.aboutGrid}
          >
            <p>{section.body}</p>
            {showImage && (
              <img
                className="pb-pa-about-img"
                data-pb-slot={LAYOUT_SLOT.aboutMedia}
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
          className="pb-pa-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div
            className="pb-pa-gallery"
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
          className="pb-pa-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-pa-quotes">
            {section.items.map(item => (
              <blockquote className="pb-pa-quote" key={item.author}>
                <p>„{item.text}“</p>
                <footer>
                  {item.author}
                  {item.rating ? ` · ${item.rating}/5` : ""}
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
          className="pb-pa-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-pa-contact">
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
              <div className="pb-pa-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-pa-hours">
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
          className="pb-pa-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-pa-faq-grid">
            {section.items.map(item => (
              <div className="pb-pa-faq" key={item.question}>
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
          className="pb-pa-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-pa-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-pa-service" key={item.name}>
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
          className="pb-pa-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-pa-team">
            {section.members.map((member, i) => (
              <div className="pb-pa-member" key={`${i}-${member.name}`}>
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
          className="pb-pa-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-pa-link" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText} →
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-pa-page-header" key={section.type}>
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

const PatinaPage: React.FC<{
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
  const about = sections.find(
    (s): s is SectionOf<"about"> => s.type === "about"
  );
  const contact = sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const services = sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const gallery = sections.find(
    (s): s is SectionOf<"gallery"> => s.type === "gallery"
  );
  const archSrc = gallery?.images[0]?.url ?? about?.imageUrl;
  const heroArchSrc = hero ? archSrc : undefined;
  const eyebrow = [data.businessCategory, contact?.city]
    .filter((v): v is string => Boolean(v))
    .join(" · ");
  const serviceTitles = services?.items.map(item => item.title) ?? [];
  const note = buildNote(data, contact);
  const year = now.getFullYear();

  return (
    <div className="pb-patina">
      <nav className="pb-pa-nav">
        <span className="pb-pa-logo">{renderLogo(data)}</span>
        <div className="pb-pa-nav-links">
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
      {navList.length > 0 && (
        <aside className="pb-pa-chapters" aria-label="Kapitel">
          <span>Kapitel</span>
          <div>
            {navList.map((item, i) => (
              <a
                key={item.key}
                href={item.href}
                aria-current={item.current ? "page" : undefined}
              >
                {String(i + 1).padStart(2, "0")}
                <span className="pb-pa-chapter-label">{item.label}</span>
              </a>
            ))}
          </div>
        </aside>
      )}
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-pa-hero">
          <div className="pb-pa-init" aria-hidden="true">
            {initialLetter(data.businessName)}
          </div>
          <div className="pb-pa-grid" data-pb-slot={LAYOUT_SLOT.heroSplit}>
            <div className="pb-pa-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
              {eyebrow && <p className="pb-pa-eyebrow">{eyebrow}</p>}
              <h1>{renderHeadline(hero.headline)}</h1>
              {hero.subheadline && (
                <p className="pb-pa-sub">{hero.subheadline}</p>
              )}
              {serviceTitles.length > 0 && (
                <p className="pb-pa-services-line">
                  {serviceTitles.map((title, i) => (
                    <React.Fragment key={title}>
                      {i > 0 && (
                        <>
                          {" "}
                          <span className="sep" aria-hidden="true">
                            ·
                          </span>{" "}
                        </>
                      )}
                      {title}
                    </React.Fragment>
                  ))}
                </p>
              )}
              {note && <p className="pb-pa-note">{note}</p>}
              {hero.ctaText && (
                <a className="pb-pa-cta" href={hero.ctaHref ?? "#kontakt"}>
                  {hero.ctaText}
                </a>
              )}
            </div>
            <div className="pb-pa-pics" data-pb-slot={LAYOUT_SLOT.heroMedia}>
              <div
                className="pb-pa-arch a1"
                aria-hidden="true"
                style={
                  hero.imageUrl
                    ? { backgroundImage: `url(${hero.imageUrl})` }
                    : undefined
                }
              />
              <div
                className="pb-pa-arch a2"
                aria-hidden="true"
                style={
                  archSrc ? { backgroundImage: `url(${archSrc})` } : undefined
                }
              />
            </div>
          </div>
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section, heroArchSrc))}
      <footer className="pb-pa-footer">
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

const PATINA_MODULE: PackModule = {
  id: "patina",
  css: PATINA_CSS,
  Page: PatinaPage,
};
PACK_MODULES.patina = PATINA_MODULE;

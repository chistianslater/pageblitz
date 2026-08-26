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
import { MORGENLICHT_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Patientenstimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Speisekarte",
  pricelist: "Preisliste",
  team: "Team",
  cta: "Anfrage",
};

/** Wochentags-Reihenfolge, Index == JS Date#getDay() (So=0…Sa=6). */
const DAY_ABBR = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAY_FULL = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

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

/** Letztes Wort der Headline als Akzentwort (em) — der Rest bleibt Tinte-farben. */
function renderHeadline(headline: string): React.ReactNode {
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

/**
 * Findet den Öffnungszeiten-Eintrag, der den heutigen Wochentag abdeckt.
 * Unterstützt Einzeltage ("Montag", "Mo") und Bereiche ("Mo–Fr", "Mo-Fr").
 */
function todaysOpeningHours(
  openingHours: { day: string; hours: string }[] | undefined,
  now: Date
): string | undefined {
  if (!openingHours || openingHours.length === 0) return undefined;
  const today = now.getDay();
  const entry = openingHours.find(oh => {
    const day = oh.day.trim();
    const range = day.match(/^(\p{L}{2,})\s*[–-]\s*(\p{L}{2,})$/u);
    if (range) {
      const start = DAY_ABBR.indexOf(range[1]);
      const end = DAY_ABBR.indexOf(range[2]);
      if (start === -1 || end === -1) return false;
      return start <= end
        ? today >= start && today <= end
        : today >= start || today <= end;
    }
    return (
      day.toLocaleLowerCase("de-DE") ===
        DAY_ABBR[today].toLocaleLowerCase("de-DE") ||
      day.toLocaleLowerCase("de-DE") ===
        DAY_FULL[today].toLocaleLowerCase("de-DE")
    );
  });
  return entry?.hours;
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
          className="pb-ml-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-ml-intro">{section.intro}</p>}
          <div className="pb-ml-grid">
            {section.items.map(item => (
              <div className="pb-ml-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {/* B7 (P3): „auf Anfrage" als Fallback-Preiszeile, damit alle
                    Karten einer Reihe auf derselben Unterkante enden. */}
                <span className="pb-ml-price">
                  {item.price ?? "auf Anfrage"}
                </span>
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
          className="pb-ml-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-ml-about">
            <p>{section.body}</p>
            {section.imageUrl && (
              <img
                className="pb-ml-about-img"
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
          className="pb-ml-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-ml-grid pb-ml-gallery">
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
          className="pb-ml-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-ml-grid">
            {section.items.map(item => (
              <blockquote className="pb-ml-card pb-ml-quote" key={item.author}>
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
          className="pb-ml-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-ml-contact">
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
              <div className="pb-ml-hours-block">
                <h3>Öffnungszeiten</h3>
                <table className="pb-ml-hours">
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
          className="pb-ml-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-ml-grid">
            {section.items.map(item => (
              <div className="pb-ml-card pb-ml-faq" key={item.question}>
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
          className="pb-ml-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-ml-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              <div className="pb-ml-grid">
                {cat.items.map(item => (
                  <div className="pb-ml-card" key={item.name}>
                    <strong>{item.name}</strong>
                    {item.description && <p>{item.description}</p>}
                    <span className="pb-ml-price">{item.price}</span>
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
          className="pb-ml-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-ml-grid">
            {section.members.map((member, i) => (
              <div className="pb-ml-member" key={`${i}-${member.name}`}>
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
          className="pb-ml-section"
          key={section.type}
        >
          <div className="pb-ml-card pb-ml-cta-card">
            <h2>{section.headline}</h2>
            <a className="pb-ml-cta" href={section.ctaHref ?? "#kontakt"}>
              {section.ctaText}
            </a>
          </div>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-ml-page-header" key={section.type}>
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

const MorgenlichtPage: React.FC<{
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
  const year = now.getFullYear();
  const todaysHours = todaysOpeningHours(contact?.openingHours, now);

  return (
    <div className="pb-morgenlicht">
      <nav className="pb-ml-nav">
        <span className="pb-ml-logo">{renderLogo(data)}</span>
        <div className="pb-ml-nav-links">
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
        {hero?.ctaText && (
          <a className="pb-ml-nav-cta" href={hero.ctaHref ?? "#kontakt"}>
            {hero.ctaText}
          </a>
        )}
        <MobileNav
          items={navList}
          cta={
            hero?.ctaText
              ? { label: hero.ctaText, href: hero.ctaHref ?? "#kontakt" }
              : undefined
          }
        />
      </nav>
      {(hero?.ctaText || todaysHours || contact?.city) && (
        <aside className="pb-ml-practice-dock" aria-label="Praxisinformation">
          <span>
            {todaysHours
              ? `Heute ${todaysHours}`
              : (contact?.city ?? "Praxisinformation")}
          </span>
          {hero?.ctaText && (
            <a href={hero.ctaHref ?? "#kontakt"}>{hero.ctaText}</a>
          )}
        </aside>
      )}
      {hero && (
        <>
          <section id={SECTION_ANCHORS.hero} className="pb-ml-hero">
            {hero.imageUrl ? (
              <img
                className="pb-ml-blob"
                src={hero.imageUrl}
                alt=""
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <div className="pb-ml-blob" aria-hidden="true" />
            )}
            {todaysHours && (
              <div className="pb-ml-float f1">
                <b>Heute geöffnet</b>
                {todaysHours}
              </div>
            )}
            {data.google && (
              <div className="pb-ml-float f2">
                <b>★ {formatRating(data.google.rating)}</b>
                {data.google.reviewCount} Google-Bewertungen
              </div>
            )}
            <h1>{renderHeadline(hero.headline)}</h1>
            {hero.subheadline && <p>{hero.subheadline}</p>}
            {hero.ctaText && (
              <a className="pb-ml-cta" href={hero.ctaHref ?? "#kontakt"}>
                {hero.ctaText}
              </a>
            )}
          </section>
          <svg
            className="pb-ml-wave"
            viewBox="0 0 600 30"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,18 C100,32 200,2 300,14 C400,26 500,6 600,16 L600,30 L0,30 Z"
              fill="var(--pb-line)"
            />
          </svg>
          {services && services.items.length > 0 && (
            <div className="pb-ml-band">
              {services.items.map(item => (
                <span className="pb-ml-chip" key={item.title}>
                  {item.title}
                </span>
              ))}
            </div>
          )}
        </>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-ml-footer">
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

const MORGENLICHT_MODULE: PackModule = {
  id: "morgenlicht",
  css: MORGENLICHT_CSS,
  Page: MorgenlichtPage,
};
PACK_MODULES.morgenlicht = MORGENLICHT_MODULE;

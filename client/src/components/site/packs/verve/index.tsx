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
import { hasMarks, rich, stripMarks } from "../../richText";

import { GoogleReviewBody, REVIEW_READONLY } from "../../googleReview";
import { VERVE_CSS } from "./css";
import { PACK_UI } from "../../packCopy";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Stimmen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Angebot",
  pricelist: "Preise",
  team: "Team",
  cta: "Anfrage",
};

const MUTED_STYLE: React.CSSProperties = { color: "var(--pb-muted)" };

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

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/**
 * Zerlegt die Hero-Headline in genau zwei Zeilen — bevorzugt an einer
 * Satzgrenze (". "/"! "/"? "), sonst an der Wortmitte. Die zweite Zeile wird
 * als Volt-Block gerendert (Kernmerkmal der Verve-Signatur). Bei genau einem
 * Wort bleibt die zweite Zeile leer und der Block entfällt.
 */
function splitHeadline(headline: string): [string, string] {
  const trimmed = headline.trim();
  const sentenceSplit = trimmed.match(/^([^.!?]+[.!?])\s+(.+)$/);
  if (sentenceSplit) return [sentenceSplit[1], sentenceSplit[2]];
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [trimmed, ""];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

interface StatChip {
  value: string;
  label: string;
}

/** Google-Bewertung + Programmanzahl als Skew-Stat-Chips — fehlende Quelle wird weggelassen. */
function buildStats(
  data: WebsiteDataV2,
  services: SectionOf<"services"> | undefined
): StatChip[] {
  const stats: StatChip[] = [];
  if (data.google) {
    stats.push({
      value: `★ ${formatRating(data.google.rating)}`,
      label: `${data.google.reviewCount} Bewertungen`,
    });
  }
  if (services && services.items.length > 0) {
    const count = services.items.length;
    stats.push({
      value: String(count),
      label: count === 1 ? "Leistung" : "Leistungen",
    });
  }
  return stats;
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
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-vv-intro">{section.intro}</p>}
          <div className="pb-vv-grid" data-pb-slot={LAYOUT_SLOT.servicesItems}>
            {section.items.map(item => (
              <div className="pb-vv-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && (
                  <span className="pb-vv-price">{item.price}</span>
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
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-vv-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
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
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div
            className="pb-vv-gallery"
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
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-vv-quotes">
            {section.items.map(item => (
              <blockquote
                className="pb-vv-quote"
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
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{title}</h2>
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
            <address>
              {section.street && <span>{section.street}</span>}
              {section.street && addressLine && <br />}
              {addressLine && <span>{addressLine}</span>}
            </address>
          )}
          {section.openingHours && section.openingHours.length > 0 && (
            <div className="pb-vv-hours-block">
              <h3>Öffnungszeiten</h3>
              <table className="pb-vv-hours">
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
        </section>
      );
    }
    case "faq": {
      const title = section.headline ?? FALLBACK_TITLES.faq;
      return (
        <section
          id={SECTION_ANCHORS.faq}
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-vv-faq-grid">
            {section.items.map(item => (
              <div className="pb-vv-faq" key={item.question}>
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
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-vv-card" key={item.name}>
                  <strong>{item.name}</strong>
                  {item.description && (
                    <p className="muted" style={MUTED_STYLE}>
                      {item.description}
                    </p>
                  )}
                  <span className="pb-vv-price">{item.price}</span>
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
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-vv-team">
            {section.members.map((member, i) => (
              <div className="pb-vv-member" key={`${i}-${member.name}`}>
                {member.imageUrl && (
                  <img src={member.imageUrl} alt="" loading="lazy" />
                )}
                <strong>{member.name}</strong>
                {member.role && (
                  <p className="muted" style={MUTED_STYLE}>
                    {member.role}
                  </p>
                )}
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
          className="pb-vv-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-vv-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-vv-page-header" key={section.type}>
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

const VervePage: React.FC<{
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
  const ghostText = `${data.businessName} ${data.businessName}`;
  const tapeText = (
    data.tagline ??
    data.businessCategory ??
    data.businessName
  ).toUpperCase();
  const stats = buildStats(data, services);
  const richHeadline = hero && hasMarks(hero.headline);
  const [line1, line2] =
    hero && !richHeadline ? splitHeadline(hero.headline) : ["", ""];

  return (
    <div className="pb-verve">
      <nav className="pb-vv-nav">
        <span className="pb-vv-logo">{renderLogo(data)}</span>
        <div className="pb-vv-nav-links">
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
        <section id={SECTION_ANCHORS.hero} className="pb-vv-hero">
          <div className="pb-vv-ghost" aria-hidden="true">
            {ghostText}
          </div>
          {hero.imageUrl ? (
            <img
              className="pb-vv-panel"
              data-pb-slot={LAYOUT_SLOT.heroMedia}
              src={hero.imageUrl}
              alt=""
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="pb-vv-panel" aria-hidden="true" />
          )}
          <div className="pb-vv-tape" aria-hidden="true">
            {tapeText}
          </div>
          <div className="pb-vv-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
            <h1 aria-label={stripMarks(hero.headline)}>
              {richHeadline && (
                <span aria-hidden="true">{rich(hero.headline)}</span>
              )}
              {!richHeadline && <span aria-hidden="true">{line1}</span>}
              {line2 && (
                <span className="pb-vv-block" aria-hidden="true">
                  {line2}
                </span>
              )}
            </h1>
            {hero.subheadline && <p>{rich(hero.subheadline)}</p>}
            {hero.ctaText && (
              <a className="pb-vv-cta" href={hero.ctaHref ?? "#kontakt"}>
                {hero.ctaText}
              </a>
            )}
            {stats.length > 0 && (
              <div className="pb-vv-stats">
                {stats.map(s => (
                  <div className="pb-vv-chip" key={s.label}>
                    <b>{s.value}</b>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      {hero?.ctaText && (
        <aside className="pb-vv-trial-sticky" aria-label={PACK_UI.contact}>
          <a href={hero.ctaHref ?? "#kontakt"}>
            {hero.ctaText} <span aria-hidden="true">↗</span>
          </a>
        </aside>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-vv-footer">
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

const VERVE_MODULE: PackModule = {
  id: "verve",
  css: VERVE_CSS,
  Page: VervePage,
};
PACK_MODULES.verve = VERVE_MODULE;

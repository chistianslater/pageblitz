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

/** Gefüllte Blatt-Tropfenform — Fuß bei (0,0), Spitze bei (13,-30). */
const SPRIG_LEAF = "M0 0C9 -5 15 -16 13 -30C3 -26 -5 -12 0 0Z";

/**
 * Blattpositionen auf der Stiel-Kurve (Punkte der Bezier-Kurve bei
 * t=0.2…0.8), alternierend links/rechts, nach oben kleiner werdend.
 */
const SPRIG_LEAVES: { x: number; y: number; r: number; s: number }[] = [
  { x: 51, y: 130, r: -70, s: 1.05 },
  { x: 66, y: 118, r: 15, s: 1 },
  { x: 81, y: 107, r: -65, s: 1 },
  { x: 95, y: 94, r: 18, s: 0.95 },
  { x: 111, y: 81, r: -60, s: 0.9 },
  { x: 126, y: 67, r: 22, s: 0.85 },
  { x: 141, y: 53, r: -55, s: 0.8 },
];

/**
 * Botanischer Zweig in Indigo (Pa'lais-Signatur: „Living Illustration",
 * neu gezeichnet 2026-08-30): geschwungener Stiel mit gefüllten Blättern
 * — die frühere reine Linien-Fassung war als Pflanze nicht erkennbar.
 */
function Sprig({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 150C70 118 120 76 172 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {SPRIG_LEAVES.map((leaf, i) => (
        <path
          key={i}
          d={SPRIG_LEAF}
          fill="currentColor"
          opacity={i % 2 ? 0.55 : 0.8}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}
        />
      ))}
      <path
        d={SPRIG_LEAF}
        fill="currentColor"
        opacity=".9"
        transform="translate(172 22) rotate(-20) scale(0.85)"
      />
    </svg>
  );
}

/**
 * Organische Bild-Masken (Pa'lais: „wilde Ränder"): zwei Blob-Pfade als
 * clipPath in objectBoundingBox-Einheiten (scale 1/200 des 200er-Pfads),
 * einmal pro Seite unsichtbar definiert — CSS referenziert sie per url(#…).
 */
function BlobDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        <clipPath id="pb-er-clip-a" clipPathUnits="objectBoundingBox">
          <path
            transform="scale(0.005)"
            d="M28 104C14 74 26 34 60 16c34-18 82-16 112 6 30 22 36 62 24 96-12 34-44 58-84 60-40 2-70-24-84-74Z"
          />
        </clipPath>
        <clipPath id="pb-er-clip-b" clipPathUnits="objectBoundingBox">
          <path
            transform="scale(0.005) rotate(160 100 100)"
            d="M28 104C14 74 26 34 60 16c34-18 82-16 112 6 30 22 36 62 24 96-12 34-44 58-84 60-40 2-70-24-84-74Z"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Punkte-Reihe unter der Headline — kleines Pa'lais-Markenzeichen. */
function Dots() {
  return (
    <span className="pb-er-dots" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
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
      <BlobDefs />
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
          <Blob tone="sage" />
          <Sprig className="pb-er-sprig pb-er-hero-deco" />
          <div className="pb-er-hero-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
            {/* Script-Zeile nur, wenn sie nicht bloß die Headline dupliziert. */}
            {data.tagline && data.tagline !== hero.headline && (
              <p className="pb-er-script">{data.tagline}</p>
            )}
            <h1>{renderHeadline(hero.headline)}</h1>
            <Dots />
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

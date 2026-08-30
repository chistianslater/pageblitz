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
import { hasMarks, rich } from "../../richText";
import { KARAT_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Aus der Vitrine",
  testimonials: "Stimmen",
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

/** Letztes Wort in kursiver Serifen-Kursive, champagnerfarben. */
function renderHeadline(headline: string): React.ReactNode {
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

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Foto im doppelten Haarlinien-Rahmen — die Karat-Signatur. */
function FramedImage({
  src,
  alt,
  slot,
  eager,
}: {
  src: string;
  alt: string;
  slot?: string;
  eager?: boolean;
}) {
  return (
    <span className="pb-ka-frame" data-pb-slot={slot}>
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
      />
    </span>
  );
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
      return null; // Vitrinen-Bühne im Page-Layout
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-ka-section"
          key={section.type}
        >
          <h2 className="pb-ka-title">{section.headline}</h2>
          {section.intro && <p className="pb-ka-intro">{section.intro}</p>}
          <div
            className="pb-ka-services"
            data-pb-slot={LAYOUT_SLOT.servicesItems}
          >
            {section.items.map((item, i) => (
              <div className="pb-ka-service" key={item.title}>
                <span className="pb-ka-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                </div>
                {item.price && (
                  <span className="pb-ka-price">{item.price}</span>
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
          className="pb-ka-section"
          key={section.type}
        >
          <h2 className="pb-ka-title">{section.headline}</h2>
          <div className="pb-ka-about" data-pb-slot={LAYOUT_SLOT.aboutGrid}>
            <p>{rich(section.body)}</p>
            {section.imageUrl && (
              <FramedImage
                src={section.imageUrl}
                alt=""
                slot={LAYOUT_SLOT.aboutMedia}
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
          className="pb-ka-section"
          key={section.type}
        >
          <h2 className="pb-ka-title">{title}</h2>
          <div
            className="pb-ka-gallery"
            data-pb-slot={LAYOUT_SLOT.galleryItems}
          >
            {section.images.map(img => (
              <FramedImage key={img.url} src={img.url} alt={img.alt} />
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
          className="pb-ka-section"
          key={section.type}
        >
          <h2 className="pb-ka-title">{title}</h2>
          <div className="pb-ka-quotes">
            {section.items.map(item => (
              <blockquote
                className="pb-ka-quote"
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
          className="pb-ka-section pb-ka-contact"
          key={section.type}
        >
          <h2 className="pb-ka-title">{title}</h2>
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
            <div className="pb-ka-hours-block">
              <h3>Öffnungszeiten</h3>
              <table className="pb-ka-hours">
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
          className="pb-ka-section"
          key={section.type}
        >
          <h2 className="pb-ka-title">{title}</h2>
          <div className="pb-ka-faq-list">
            {section.items.map(item => (
              <div className="pb-ka-faq" key={item.question}>
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
          className="pb-ka-section"
          key={section.type}
        >
          <h2 className="pb-ka-title">{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-ka-menu-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-ka-service" key={item.name}>
                  <div>
                    <strong>{item.name}</strong>
                    {item.description && <p>{item.description}</p>}
                  </div>
                  <span className="pb-ka-price">{item.price}</span>
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
          className="pb-ka-section"
          key={section.type}
        >
          <h2 className="pb-ka-title">{title}</h2>
          <div className="pb-ka-team">
            {section.members.map((member, i) => (
              <div className="pb-ka-member" key={`${i}-${member.name}`}>
                {member.imageUrl && (
                  <FramedImage src={member.imageUrl} alt="" />
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
          className="pb-ka-section pb-ka-cta-section"
          key={section.type}
        >
          <h2 className="pb-ka-title">{section.headline}</h2>
          <a className="pb-ka-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    case "pageHeader": {
      return (
        <header className="pb-ka-page-header" key={section.type}>
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

const KaratPage: React.FC<{
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
  const kicker = [data.businessCategory, data.sections
    .map(s => (s.type === "contact" ? s.city : undefined))
    .find(Boolean)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="pb-karat">
      <nav className="pb-ka-nav">
        <span className="pb-ka-logo">{renderLogo(data)}</span>
        <div className="pb-ka-nav-links">
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
        <section id={SECTION_ANCHORS.hero} className="pb-ka-hero">
          <HeroCollage data={data} />
          <div className="pb-ka-hero-copy" data-pb-slot={LAYOUT_SLOT.heroCopy}>
            {kicker && <p className="pb-ka-kicker">{kicker}</p>}
            <h1>{renderHeadline(hero.headline)}</h1>
            {hero.subheadline && <p className="pb-ka-sub">{rich(hero.subheadline)}</p>}
            {hero.ctaText && (
              <a className="pb-ka-cta" href={hero.ctaHref ?? "#kontakt"}>
                {hero.ctaText}
              </a>
            )}
            {data.google && (
              <p className="pb-ka-rating">
                ★ {formatRating(data.google.rating)} ·{" "}
                {data.google.reviewCount} Google-Bewertungen
              </p>
            )}
          </div>
          {hero.imageUrl && (
            <div className="pb-ka-hero-media">
              <FramedImage
                src={hero.imageUrl}
                alt=""
                slot={LAYOUT_SLOT.heroMedia}
                eager
              />
            </div>
          )}
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-ka-footer">
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

const KARAT_MODULE: PackModule = {
  id: "karat",
  css: KARAT_CSS,
  Page: KaratPage,
};
PACK_MODULES.karat = KARAT_MODULE;

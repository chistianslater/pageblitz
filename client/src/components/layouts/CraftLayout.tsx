/**
 * CRAFT Layout – Electrician, Plumber, Roofer, General Contractor
 * Inspired by: Electrician template (dark bg, yellow/orange accent, centered hero, stats)
 * Typography: Oswald (headlines) + Inter (body)
 * Feel: Powerful, trustworthy, professional trades
 * Structure: Dark hero with centered text, trust bar, feature grid with numbers, alternating sections
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Zap, Shield, Award, ArrowRight } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const DISPLAY = "'Oswald', 'Impact', sans-serif";
const BODY = "var(--site-font-body, 'Inter', 'Helvetica Neue', sans-serif)";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  showActivateButton?: boolean;
  onActivate?: () => void;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessEmail?: string | null;
  openingHours?: string[];
  slug?: string | null;
  contactFormLocked?: boolean;
  businessCategory?: string | null;
}

export default function CraftLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  businessCategory,
}: Props) {
  const darkCs = {
    ...cs,
    background: "#111111",
    surface: "#1a1a1a",
    text: "#ffffff",
    textLight: "rgba(255,255,255,0.65)",
  };

  return (
    <div style={{ fontFamily: BODY, backgroundColor: darkCs.background, color: darkCs.text }}>
      {/* Top info bar */}
      <div style={{ backgroundColor: darkCs.surface, borderBottom: `1px solid rgba(255,255,255,0.06)`, padding: "0.5rem 0" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            {businessPhone && <a href={`tel:${businessPhone}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}><Phone className="h-3.5 w-3.5" style={{ color: cs.primary }} />{businessPhone}</a>}
            {businessAddress && <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}><MapPin className="h-3.5 w-3.5" style={{ color: cs.primary }} />{businessAddress}</span>}
          </div>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>Mo–Fr: 8:00–18:00 Uhr</span>
        </div>
      </div>
      <CraftNav websiteData={websiteData} cs={darkCs} businessPhone={businessPhone} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <CraftHero section={section} cs={darkCs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} businessCategory={businessCategory} />}
          {section.type === "about" && <CraftAbout section={section} cs={darkCs} heroImageUrl={heroImageUrl} businessCategory={businessCategory} />}
          {(section.type === "services" || section.type === "features") && <CraftServices section={section} cs={darkCs} />}
          {section.type === "testimonials" && <CraftTestimonials section={section} cs={darkCs} />}
          {section.type === "faq" && <CraftFAQ section={section} cs={darkCs} />}
                    {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <CraftContact section={section} cs={darkCs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
              {contactFormLocked && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.78)",
                  backdropFilter: "blur(3px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  zIndex: 20,
                }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "rgba(59,130,246,0.2)",
                    border: "1px solid rgba(59,130,246,0.5)",
                    borderRadius: "9999px",
                    padding: "0.5rem 1.25rem",
                  }}>
                    <span style={{ fontSize: "0.85rem", color: "#93c5fd", fontWeight: 700 }}>🔒 Kontaktformular</span>
                    <span style={{ fontSize: "0.8rem", color: "#60a5fa", backgroundColor: "rgba(59,130,246,0.25)", padding: "0.15rem 0.6rem", borderRadius: "9999px" }}>+4,90 €/Monat</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", margin: 0 }}>Im nächsten Schritt aktivierbar</p>
                </div>
              )}
            </div>
          )}
          {section.type === "cta" && <CraftCTA section={section} cs={darkCs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <CraftFooter websiteData={websiteData} cs={darkCs} slug={slug} />
    </div>
  );
}

function CraftNav({ websiteData, cs, businessPhone }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null }) {
  return (
    <nav style={{ backgroundColor: cs.background, fontFamily: BODY }} className="sticky top-0 z-50" >
      <div className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: cs.primary, padding: "0.4rem 0.6rem" }}>
            <Zap className="h-5 w-5" style={{ color: "#000" }} />
          </div>
          <div>
            <span style={{ fontFamily: DISPLAY, fontSize: "1.3rem", letterSpacing: "0.08em", color: cs.text, textTransform: "uppercase" }}>{websiteData.businessName}</span>
            {websiteData.tagline && <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{websiteData.tagline.slice(0, 40)}</p>}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 500 }} className="hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#000", padding: "0.65rem 1.5rem", fontSize: "0.8rem", letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.5rem" }} className="btn-premium transition-opacity">
            <Phone className="h-4 w-4" /> Jetzt anrufen
          </a>
        )}
      </div>
    </nav>
  );
}

function CraftHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData; businessCategory?: string | null }) {
  const heroStats = getIndustryStats(businessCategory || "");
  return (
    <section style={{ position: "relative", minHeight: "85vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <img src={heroImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 100%)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 w-full py-20">
        <div className="max-w-2xl">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: `${cs.primary}20`, border: `1px solid ${cs.primary}40`, padding: "0.4rem 1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "6px", height: "6px", backgroundColor: cs.primary, borderRadius: "50%" }} />
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>Zertifiziert & Versichert</span>
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.8rem, 6vw, 5.5rem)", lineHeight: 1, letterSpacing: "0.03em", color: "#fff", marginBottom: "0.5rem", textTransform: "uppercase" }} className="hero-animate-headline">
            {section.headline?.split(" ").slice(0, Math.ceil((section.headline?.split(" ").length || 4) / 2)).join(" ")}
          </h1>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.8rem, 6vw, 5.5rem)", lineHeight: 1, letterSpacing: "0.03em", color: cs.primary, marginBottom: "1.5rem", textTransform: "uppercase" }}>
            {section.headline?.split(" ").slice(Math.ceil((section.headline?.split(" ").length || 4) / 2)).join(" ")}
          </h1>
          {section.subheadline && (
            <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "rgba(255,255,255,0.7)", marginBottom: "0.75rem" }}>{section.subheadline}</p>
          )}
          {section.content && (
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)", marginBottom: "2.5rem" }}>{section.content}</p>
          )}
          {websiteData.googleRating && websiteData.googleReviewCount ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <GoogleRatingBadge rating={websiteData.googleRating} reviewCount={websiteData.googleReviewCount} variant="light" starColor={cs.primary} />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-4">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#000", padding: "1rem 2.5rem", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.5rem" }} className="btn-premium transition-opacity">
                {section.ctaText} <ArrowRight className="h-4 w-4" />
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} style={{ border: `2px solid ${cs.primary}`, color: cs.primary, padding: "1rem 2.5rem", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, backgroundColor: "transparent" }} className="hover:bg-opacity-10 transition-colors">
                Website aktivieren
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Trust badges */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.85)", borderTop: `2px solid ${cs.primary}` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 gap-4">
          {heroStats.map(({ n: num, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: DISPLAY, fontSize: "1.8rem", color: cs.primary, lineHeight: 1 }}>{num}</p>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CraftAbout({ section, cs, heroImageUrl, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; businessCategory?: string | null }) {
  const firstStat = getIndustryStats(businessCategory || "")[1] || { n: "10+", label: "Jahre Erfahrung" };
  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div style={{ position: "relative" }}>
          <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
          <div style={{ position: "absolute", top: "2rem", right: "-2rem", backgroundColor: cs.primary, padding: "1.5rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: DISPLAY, fontSize: "2.5rem", color: "#000", lineHeight: 1 }}>{firstStat.n}</p>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(0,0,0,0.7)", marginTop: "0.25rem" }}>{firstStat.label}</p>
          </div>
        </div>
        <div>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Über uns</span>
          <h2 data-reveal data-delay="0" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 1, marginBottom: "1.5rem" }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {["Festpreisgarantie", "Zertifizierte Fachkräfte", "Schnelle Reaktionszeit"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <CheckCircle className="h-5 w-5" style={{ color: cs.primary, flexShrink: 0 }} />
                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CraftServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Unsere Leistungen</span>
          <h2 data-reveal data-delay="100" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 1 }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.surface, padding: "2rem", borderBottom: `3px solid transparent`, transition: "border-color 0.2s, transform 0.2s" }} className="group hover:-translate-y-1" onMouseEnter={e => (e.currentTarget.style.borderBottomColor = cs.primary)} onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "3rem", height: "3rem", backgroundColor: `${cs.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.1rem", color: cs.primary }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontSize: "1.2rem", letterSpacing: "0.05em", color: cs.text, textTransform: "uppercase" }}>{item.title}</h3>
              </div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CraftTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Kundenstimmen</span>
          <h2 data-reveal data-delay="200" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 1 }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, padding: "2rem", borderLeft: `4px solid ${cs.primary}` }}>
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1.25rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4" style={{ fill: cs.primary, color: cs.primary }} />
                ))}
              </div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
              <p style={{ fontFamily: DISPLAY, fontSize: "0.9rem", letterSpacing: "0.1em", color: cs.primary, textTransform: "uppercase" }}>{item.author || "Kunde"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CraftFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>FAQ</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 1 }}>{section.headline}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.surface }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer", borderLeft: open === i ? `4px solid ${cs.primary}` : "4px solid transparent", transition: "border-color 0.2s" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: cs.text }}>{item.question || item.title}</span>
                {open === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />}
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem 1.75rem", fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>
                  {item.answer || item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CraftCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "0.03em", color: "#000", textTransform: "uppercase", lineHeight: 1, marginBottom: "1.5rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: "rgba(0,0,0,0.7)", marginBottom: "2.5rem" }}>{section.content}</p>}
        <div className="flex flex-wrap gap-4 justify-center">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#000", color: cs.primary, padding: "1rem 3rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }} className="hover:opacity-80 transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: "2px solid #000", color: "#000", padding: "1rem 3rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, backgroundColor: "transparent" }} className="hover:bg-black hover:text-white transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function CraftContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Kontakt</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 1, marginBottom: "2.5rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)", marginBottom: "2.5rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", backgroundColor: cs.background }}><Phone className="h-5 w-5" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ color: cs.text, fontSize: "1rem", fontWeight: 600 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem 1.25rem", backgroundColor: cs.background }}><MapPin className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", backgroundColor: cs.background }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ color: cs.text, fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem 1.25rem", backgroundColor: cs.background }}><Clock className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><div>{hours.map((h, i) => <p key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.background, padding: "2.5rem" }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: "1.5rem", letterSpacing: "0.05em", color: cs.text, textTransform: "uppercase", marginBottom: "1.5rem" }}>Kostenlose Beratung</h3>
          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Vorname" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
              <input type="text" placeholder="Nachname" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
            </div>
            <input type="tel" placeholder="Telefonnummer" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
            <textarea placeholder="Beschreiben Sie Ihr Anliegen" rows={4} style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none", resize: "vertical" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: "#000", padding: "1rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, border: "none", cursor: "pointer" }} className="btn-premium transition-opacity">
              Anfrage senden
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function CraftFooter({ websiteData, cs, slug }: { websiteData: WebsiteData; cs: ColorScheme; slug?: string | null }) {
  return (
    <footer style={{ backgroundColor: "#000", borderTop: `3px solid ${cs.primary}`, padding: "2.5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href={slug ? `/site/${slug}/${l.toLowerCase()}` : "#"} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

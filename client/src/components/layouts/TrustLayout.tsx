/**
 * TRUST Layout – Medical, Legal, Financial, Consulting, Insurance
 * Typography: Instrument Sans (headlines) + Plus Jakarta Sans (body)
 * Feel: Authoritative, calm, institutional, premium
 * Structure: CENTERED headline hero → full-width photo band → stats bar → card-grid services
 * Deliberately different from CleanLayout (which uses split-hero)
 */
import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Shield, Award, ArrowRight, Quote } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import { useScrollReveal } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const SERIF = "var(--site-font-headline, 'Instrument Sans', sans-serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Instrument Sans', sans-serif))";
const SANS = "var(--site-font-body, 'Plus Jakarta Sans', 'Inter', sans-serif)";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  aboutImageUrl?: string;
  showActivateButton?: boolean;
  onActivate?: () => void;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessEmail?: string | null;
  openingHours?: string[];
  slug?: string | null;
  contactFormLocked?: boolean;
  logoUrl?: string | null;
  businessCategory?: string | null;
}

export default function TrustLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: SANS, backgroundColor: cs.background, color: cs.onBackground }}>
      <TrustNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <TrustHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} businessCategory={businessCategory} />}
          {section.type === "about" && <TrustAbout section={section} cs={cs} />}
          {section.type === "gallery" && <TrustGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <TrustServices section={section} cs={cs} />}
          {section.type === "menu" && <TrustMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <TrustPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <TrustTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <TrustFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <TrustContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
              {contactFormLocked && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `${cs.onBackground}CC`, // ~80% opacity
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
                    backgroundColor: `${cs.primary}20`,
                    border: `1px solid ${cs.primary}50`,
                    borderRadius: "9999px",
                    padding: "0.5rem 1.25rem",
                  }}>
                    <span style={{ fontSize: "0.85rem", color: cs.background, fontWeight: 700 }}>🔒 Kontaktformular</span>
                    <span style={{ fontSize: "0.8rem", color: cs.background, backgroundColor: `${cs.primary}40`, padding: "0.15rem 0.6rem", borderRadius: "9999px" }}>Inaktiv</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: cs.background, opacity: 0.65, margin: 0 }}>Im nächsten Schritt aktivierbar</p>
                </div>
              )}
            </div>
          )}
          {section.type === "cta" && <TrustCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <TrustFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function TrustNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: cs.background, borderBottom: `3px solid ${cs.primary}` }} className="sticky top-0 z-50">
      {/* Top bar */}
      <div style={{ backgroundColor: cs.primary, padding: "0.35rem 0" }}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {businessPhone && (
              <a href={`tel:${businessPhone}`} style={{ color: cs.onPrimary, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}>
                <Phone className="h-3 w-3" /> {businessPhone}
              </a>
            )}
          </div>
          <span style={{ color: cs.onPrimary, opacity: 0.85, fontSize: "0.75rem", fontWeight: 600 }}>Ihr Vertrauen – unser Auftrag</span>
        </div>
      </div>
      {/* Main nav */}
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", fontWeight: 800, color: cs.onBackground, letterSpacing: "-0.02em" }}>{websiteData.businessName}</span>}
          {websiteData.tagline && <p style={{ fontSize: "0.65rem", color: cs.primary, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "1px", fontWeight: 700 }}>{websiteData.tagline.slice(0, 50)}</p>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "FAQ", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "0.85rem", color: cs.onBackground, opacity: 0.7, fontWeight: 600, letterSpacing: "0.02em" }} className="hover:text-primary transition-colors">{label}</a>
          ))}
        </div>
        <a href="#kontakt" style={{ backgroundColor: cs.onBackground, color: cs.background, padding: "0.6rem 1.5rem", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.03em" }} className="hidden sm:block hover:opacity-80 transition-opacity">
          Termin anfragen
        </a>
      </div>
    </nav>
  );
}

function TrustHero({ section, cs, heroImageUrl, showActivateButton, onActivate, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; businessCategory?: string | null }) {
  const heroStats = getIndustryStats(businessCategory || "");
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: cs.background }}>
      {/* Background Decorative Frame */}
      <div style={{ position: "absolute", top: "5%", right: "5%", bottom: "5%", left: "5%", border: `1px solid ${cs.onBackground}08`, zIndex: 0 }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-12 gap-16 items-center relative z-10">
        <div className="lg:col-span-6 py-12">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }} className="hero-animate-badge">
            <Shield className="h-5 w-5" style={{ color: cs.primary }} />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.onBackground, opacity: 0.8, fontWeight: 800 }}>Präzision & Vertrauen</span>
          </div>

          <h1 style={{ 
            fontFamily: SERIF, 
            fontSize: "clamp(3rem, 5vw, 4.5rem)", 
            fontWeight: 800, 
            color: cs.onBackground, 
            lineHeight: 1.1, 
            letterSpacing: "-0.01em", 
            marginBottom: "2.5rem" 
          }} className="hero-animate-headline">
            {section.headline}
          </h1>

          <div style={{ marginBottom: "3.5rem" }} className="hero-animate-sub">
            {section.subheadline && <p style={{ fontSize: "1.2rem", color: cs.onBackground, opacity: 0.8, lineHeight: 1.7, marginBottom: "1.5rem", fontWeight: 500 }}>{section.subheadline}</p>}
            {section.content && <p style={{ fontSize: "1rem", color: cs.onBackground, opacity: 0.6, lineHeight: 1.8 }}>{section.content}</p>}
          </div>

          <div className="flex flex-wrap gap-5 hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: cs.onBackground, color: cs.background, padding: "1.25rem 3.5rem", fontSize: "0.95rem", fontWeight: 800, borderRadius: "0px", transition: "all 0.3s ease" }} 
                className="hover:opacity-90 shadow-2xl">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `1px solid ${cs.onBackground}20`, color: cs.onBackground, padding: "1.25rem 3.5rem", fontSize: "0.95rem", fontWeight: 700, backgroundColor: "transparent" }} 
                className="hover:bg-primary/5 transition-all">
                Aktivieren
              </button>
            )}
          </div>
          
          <div style={{ display: "flex", gap: "3rem", marginTop: "4rem", paddingTop: "2.5rem", borderTop: `1px solid ${cs.onBackground}08` }} className="hero-animate-sub">
            {heroStats.slice(0, 3).map(({ n, label }, i) => (
              <div key={i}>
                <div style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 800, color: cs.primary }}>{n}</div>
                <div style={{ fontSize: "0.7rem", color: cs.onBackground, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, marginTop: "0.25rem" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div style={{ position: "absolute", top: "-5%", right: "-5%", bottom: "5%", left: "5%", backgroundColor: cs.surface, zIndex: 0 }} />
          <div className="premium-shadow-lg relative z-10 overflow-hidden" style={{ border: `1px solid ${cs.onBackground}08` }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }} className="hover:scale-105 transition-transform duration-1000" />
          </div>
          {/* Trust badge overlay */}
          <div className="premium-shadow" style={{ position: "absolute", bottom: "10%", right: "-10%", padding: "2.5rem", zIndex: 30, maxWidth: "240px", borderTop: `4px solid ${cs.primary}`, backgroundColor: cs.background }}>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" style={{ color: cs.primary }} />)}
            </div>
            <p style={{ fontSize: "0.85rem", fontWeight: 800, color: cs.onBackground, lineHeight: 1.4 }}>"Exzellente Beratung und absolut zuverlässig."</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustAbout({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section style={{ backgroundColor: cs.surface, padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      {/* Background architectural element */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: `radial-gradient(${cs.onSurface}1A 1px, transparent 0)`, backgroundSize: "40px 40px", opacity: 0.3 }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-24 items-center relative z-10">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div style={{ padding: "4rem", backgroundColor: cs.background, border: `1px solid ${cs.onBackground}08` }} className="premium-shadow">
            <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", color: cs.onBackground, marginBottom: "2rem", lineHeight: 1.2, fontWeight: 800 }}>Unsere Werte für Ihren Erfolg</h3>
            <div className="space-y-6">
              {["Integrität", "Kompetenz", "Nachhaltigkeit", "Innovation"].map((val, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
                  <span style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.onBackground, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 900 }}>Über unsere Kanzlei</span>
          </div>
          
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 800, color: cs.onSurface, marginBottom: "2.5rem", lineHeight: 1.1 }}>{section.headline}</h2>
          
          <p style={{ fontSize: "1.15rem", lineHeight: 1.8, color: cs.onSurface, opacity: 0.8, marginBottom: "2.5rem" }}>
            {section.content}
          </p>
          
          <div className="flex items-center gap-6 pt-10 border-t" style={{ borderColor: `${cs.onSurface}1A` }}>
            <div style={{ width: "4rem", height: "4rem", backgroundColor: `${cs.primary}10`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award className="h-6 w-6" style={{ color: cs.primary }} />
            </div>
            <div>
              <p style={{ fontSize: "1rem", fontWeight: 800, color: cs.onSurface }}>Staatlich geprüft & zertifiziert</p>
              <p style={{ fontSize: "0.85rem", color: cs.onSurface, opacity: 0.6 }}>Sicherheit durch höchste Qualitätsstandards</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" id="leistungen" style={{ backgroundColor: cs.background, padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 900, display: "block", marginBottom: "1.5rem" }}>Expertise & Leistungen</span>
            <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 800, color: cs.onBackground, lineHeight: 1.1 }}>
              {section.headline?.split(" ").map((word, i) => (
                <span key={i} style={{ color: i === (section.headline?.split(" ").length ?? 0) - 1 ? cs.primary : "inherit" }}>{word} </span>
              )) || "Ganzheitliche Ansätze für Ihre Sicherheit."}
            </h2>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px border" style={{ backgroundColor: `${cs.onBackground}0D`, borderColor: `${cs.onBackground}0D` }}>
          {items.map((item, i) => (
            <div key={i} className="group transition-all duration-500 hover:opacity-90" style={{ backgroundColor: cs.background, padding: "4rem 3rem" }}>
              <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: `${cs.onBackground}05`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem", transition: "all 0.3s ease" }} className="group-hover:bg-primary">
                <Shield className="h-6 w-6 group-hover:text-on-primary transition-colors" style={{ color: cs.primary }} />
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: "1.4rem", fontWeight: 800, color: cs.onBackground, marginBottom: "1.25rem" }}>{item.title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.6, marginBottom: "2.5rem" }}>{item.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 900, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em" }} className="opacity-0 group-hover:opacity-100 transition-all">
                Erfahren Sie mehr <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 800, color: cs.onBackground, marginBottom: "0.75rem" }}>{section.headline}</h2>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto" }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "4/3", overflow: "hidden", border: `1px solid ${cs.onBackground}0D`, boxShadow: `0 4px 12px ${cs.onBackground}08`, backgroundColor: cs.surface }}>
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1576091160399 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ padding: "5rem 0", backgroundColor: cs.onBackground }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 800, color: cs.background, marginBottom: "0.5rem" }}>{section.headline}</h2>
          <p style={{ color: cs.background, opacity: 0.5, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Beispiel-Kundenstimmen</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: `${cs.background}0D`, padding: "2rem", borderLeft: `3px solid ${cs.primary}` }}>
              <Quote className="h-6 w-6 mb-4" style={{ color: cs.primary, opacity: 0.6 }} />
              <p style={{ color: cs.background, opacity: 0.85, fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem", fontStyle: "italic" }}>"{item.description}"</p>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: SERIF, fontWeight: 800, color: cs.background, fontSize: "0.9rem" }}>{item.author}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating || 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" style={{ color: cs.primary }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section id="faq" style={{ padding: "5rem 0", backgroundColor: cs.background }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 800, color: cs.onBackground, marginBottom: "0.5rem" }}>{section.headline}</h2>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${cs.onBackground}1A` }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 800, color: cs.onBackground, paddingRight: "2rem" }}>{item.question}</span>
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: cs.onBackground, opacity: 0.4 }} />}
              </button>
              {open === i && (
                <div style={{ paddingBottom: "1.5rem" }}>
                  <p style={{ fontSize: "0.95rem", color: cs.onBackground, opacity: 0.7, lineHeight: 1.75 }}>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ padding: "5rem 0", backgroundColor: cs.primary, textAlign: "center" }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.5rem", fontWeight: 800, color: cs.onPrimary, marginBottom: "1rem" }}>{section.headline}</h2>
        <p style={{ color: cs.onPrimary, opacity: 0.85, fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>{section.content}</p>
        <a href="#kontakt" onClick={showActivateButton ? onActivate : undefined}
          style={{ backgroundColor: cs.onPrimary, color: cs.primary, padding: "1rem 3rem", fontSize: "1rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          className="hover:opacity-90 transition-opacity shadow-xl shadow-primary/20">
          {section.ctaText || "Jetzt Kontakt aufnehmen"} <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function TrustMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: cs.onBackground }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-8">
                <h3 style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 800, color: cs.onBackground, borderBottom: `2px solid ${cs.primary}`, display: "inline-block", paddingBottom: "0.5rem" }}>{cat}</h3>
                <div className="space-y-6">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-4 mb-1">
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: cs.onBackground }}>{item.title}</h4>
                        <div className="flex-1 border-b mx-2" style={{ borderColor: `${cs.onBackground}0D` }} />
                        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: cs.primary }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "0.9rem", color: cs.onBackground, opacity: 0.6, lineHeight: 1.6 }}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline gap-4 mb-1">
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: cs.onBackground }}>{item.title}</h4>
                  <div className="flex-1 border-b mx-2" style={{ borderColor: `${cs.onBackground}0D` }} />
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: cs.primary }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontSize: "0.9rem", color: cs.onBackground, opacity: 0.6, lineHeight: 1.6 }}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TrustPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: cs.onBackground }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map((cat, idx) => (
              <div key={idx} style={{ backgroundColor: cs.surface, padding: "2.5rem", boxShadow: `0 4px 20px ${cs.onBackground}08`, border: `1px solid ${cs.onBackground}05` }}>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 800, color: cs.onSurface, marginBottom: "2rem" }}>{cat}</h3>
                <div className="grid gap-4">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b last:border-0" style={{ borderColor: `${cs.onSurface}0D` }}>
                      <span style={{ fontSize: "1rem", color: cs.onSurface, fontWeight: 600 }}>{item.title}</span>
                      <span style={{ fontSize: "1.1rem", color: cs.primary, fontWeight: 800 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: cs.surface, padding: "3rem", boxShadow: `0 4px 20px ${cs.onBackground}08`, border: `1px solid ${cs.onBackground}05`, maxWidth: "800px", margin: "0 auto" }}>
            <div className="grid gap-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b last:border-0" style={{ borderColor: `${cs.onSurface}0D` }}>
                  <span style={{ fontSize: "1.1rem", color: cs.onSurface, fontWeight: 600 }}>{item.title}</span>
                  <span style={{ fontSize: "1.2rem", color: cs.primary, fontWeight: 800 }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TrustContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ padding: "5rem 0", backgroundColor: cs.surface }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, marginBottom: "1.5rem" }} />
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 800, color: cs.onSurface, marginBottom: "1rem" }}>{section.headline}</h2>
          <p style={{ color: cs.onSurface, opacity: 0.7, fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>{section.content}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Phone className="h-4 w-4" style={{ color: cs.primary }} />
              </div>
              <a href={`tel:${phone}`} style={{ color: cs.onSurface, fontWeight: 700 }}>{phone}</a>
            </div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin className="h-4 w-4" style={{ color: cs.primary }} />
              </div>
              <span style={{ color: cs.onSurface, opacity: 0.8 }}>{address}</span>
            </div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Clock className="h-4 w-4" style={{ color: cs.primary }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {hours.slice(0, 4).map((h, i) => <span key={i} style={{ fontSize: "0.85rem", color: cs.onSurface, opacity: 0.8 }}>{h}</span>)}
              </div>
            </div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.background, padding: "2.5rem", border: `1px solid ${cs.onBackground}0D`, boxShadow: `0 4px 24px ${cs.onBackground}08` }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 800, color: cs.onBackground, marginBottom: "1.5rem" }}>Nachricht senden</h3>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            {[{ label: "Name", type: "text" }, { label: "E-Mail", type: "email" }, { label: "Telefon", type: "tel" }].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: cs.onBackground, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.4rem" }}>{f.label}</label>
                <input type={f.type} style={{ width: "100%", padding: "0.75rem", border: `1px solid ${cs.onBackground}0D`, fontSize: "0.95rem", outline: "none", backgroundColor: cs.surface, color: cs.onSurface }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: cs.onBackground, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.4rem" }}>Anliegen</label>
              <textarea rows={4} style={{ width: "100%", padding: "0.75rem", border: `1px solid ${cs.onBackground}0D`, fontSize: "0.95rem", outline: "none", resize: "none", backgroundColor: cs.surface, color: cs.onSurface }} />
            </div>
            <button type="submit" style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.9rem", fontWeight: 800, fontSize: "0.95rem", border: "none", cursor: "pointer", width: "100%" }}
              className="hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              {section.ctaText || "Anfrage senden"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function TrustFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: cs.onBackground, padding: "3rem 0 1.5rem" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 pb-6 mb-6" style={{ borderBottom: `1px solid ${cs.background}1A` }}>
          <div>
            <span style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 800, color: cs.background }}>{websiteData.businessName}</span>
            {websiteData.tagline && <p style={{ color: cs.background, opacity: 0.5, fontSize: "0.8rem", marginTop: "0.5rem" }}>{websiteData.tagline}</p>}
          </div>
          <div>
            <p style={{ color: cs.background, opacity: 0.4, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", fontWeight: 800 }}>Leistungen</p>
            {["Beratung", "Analyse", "Umsetzung", "Betreuung"].map(l => (
              <a key={l} href="#" style={{ display: "block", color: cs.background, opacity: 0.6, fontSize: "0.85rem", marginBottom: "0.4rem" }} className="hover:opacity-100 transition-opacity">{l}</a>
            ))}
          </div>
          <div>
            <p style={{ color: cs.background, opacity: 0.4, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", fontWeight: 800 }}>Rechtliches</p>
            {["Impressum", "Datenschutz", "AGB"].map(l => (
              <a key={l} href="#" style={{ display: "block", color: cs.background, opacity: 0.6, fontSize: "0.85rem", marginBottom: "0.4rem" }} className="hover:opacity-100 transition-opacity">{l}</a>
            ))}
          </div>
        </div>
        <p style={{ color: cs.background, opacity: 0.3, fontSize: "0.8rem", textAlign: "center" }}>{websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`}</p>
      </div>
    </footer>
  );
}

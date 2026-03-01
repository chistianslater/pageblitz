/**
 * TRUST Layout – Medical, Legal, Financial, Consulting, Insurance
 * Typography: Libre Baskerville (headlines) + Source Sans Pro (body)
 * Feel: Authoritative, calm, institutional, premium
 * Structure: CENTERED headline hero → full-width photo band → stats bar → card-grid services
 * Deliberately different from CleanLayout (which uses split-hero)
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Shield, Award, Users, ArrowRight, Quote } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const SERIF = "var(--site-font-headline, 'Libre Baskerville', Georgia, serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Libre Baskerville', Georgia, serif))";
const SANS = "var(--site-font-body, 'Source Sans Pro', 'Helvetica Neue', sans-serif)";

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

export default function TrustLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#ffffff", color: "#1a2332" }}>
      <TrustNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <TrustHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} businessPhone={businessPhone} businessCategory={businessCategory} />}
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
          {section.type === "cta" && <TrustCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <TrustFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function TrustNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: "#fff", borderBottom: `3px solid ${cs.primary}` }} className="sticky top-0 z-50">
      {/* Top bar */}
      <div style={{ backgroundColor: cs.primary, padding: "0.35rem 0" }}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {businessPhone && (
              <a href={`tel:${businessPhone}`} style={{ color: "#fff", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Phone className="h-3 w-3" /> {businessPhone}
              </a>
            )}
          </div>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75rem" }}>Ihr Vertrauen – unser Auftrag</span>
        </div>
      </div>
      {/* Main nav */}
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", fontWeight: 700, color: "#1a2332", letterSpacing: "-0.02em" }}>{websiteData.businessName}</span>}
          {websiteData.tagline && <p style={{ fontSize: "0.65rem", color: "var(--site-primary-on-surface)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "1px" }}>{websiteData.tagline.slice(0, 50)}</p>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "FAQ", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "0.85rem", color: "#4a5568", fontWeight: 500, letterSpacing: "0.02em" }} className="hover:text-black transition-colors">{label}</a>
          ))}
        </div>
        <a href="#kontakt" style={{ backgroundColor: "#1a2332", color: "#fff", padding: "0.6rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.03em" }} className="hidden sm:block hover:opacity-80 transition-opacity">
          Termin anfragen
        </a>
      </div>
    </nav>
  );
}

function TrustHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData, businessPhone, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData; businessPhone?: string | null; businessCategory?: string | null }) {
  const heroStats = getIndustryStats(businessCategory || "");
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#fff" }}>
      {/* Background Decorative Frame */}
      <div style={{ position: "absolute", top: "5%", right: "5%", bottom: "5%", left: "5%", border: "1px solid #f1f5f9", zIndex: 0 }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-12 gap-16 items-center relative z-10">
        <div className="lg:col-span-6 py-12">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }} className="hero-animate-badge">
            <Shield className="h-5 w-5" style={{ color: cs.primary }} />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1e293b", fontWeight: 800 }}>Präzision & Vertrauen</span>
          </div>

          <h1 style={{ 
            fontFamily: SERIF, 
            fontSize: "clamp(3rem, 5vw, 4.5rem)", 
            fontWeight: 700, 
            color: "#0f172a", 
            lineHeight: 1.1, 
            letterSpacing: "-0.01em", 
            marginBottom: "2.5rem" 
          }} className="hero-animate-headline">
            {section.headline}
          </h1>

          <div style={{ marginBottom: "3.5rem" }} className="hero-animate-sub">
            {section.subheadline && <p style={{ fontSize: "1.2rem", color: "#475569", lineHeight: 1.7, marginBottom: "1.5rem", fontWeight: 500 }}>{section.subheadline}</p>}
            {section.content && <p style={{ fontSize: "1rem", color: "#64748b", lineHeight: 1.8 }}>{section.content}</p>}
          </div>

          <div className="flex flex-wrap gap-5 hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: "#0f172a", color: "#fff", padding: "1.25rem 3.5rem", fontSize: "0.95rem", fontWeight: 700, borderRadius: "0px", transition: "all 0.3s ease" }} 
                className="hover:bg-black shadow-2xl">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `1px solid #0f172a`, color: "#0f172a", padding: "1.25rem 3.5rem", fontSize: "0.95rem", fontWeight: 700, backgroundColor: "transparent" }} 
                className="hover:bg-slate-50 transition-all">
                Website aktivieren
              </button>
            )}
          </div>
          
          <div style={{ display: "flex", gap: "3rem", marginTop: "4rem", paddingTop: "2.5rem", borderTop: "1px solid #f1f5f9" }} className="hero-animate-sub">
            {heroStats.slice(0, 3).map(({ n, label }, i) => (
              <div key={i}>
                <div style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: cs.primary }}>{n}</div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginTop: "0.25rem" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div style={{ position: "absolute", top: "-5%", right: "-5%", bottom: "5%", left: "5%", backgroundColor: "#f8fafc", zIndex: 0 }} />
          <div className="premium-shadow-lg relative z-10 overflow-hidden">
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }} className="hover:scale-105 transition-transform duration-1000" />
          </div>
          {/* Trust badge overlay */}
          <div className="glass-card premium-shadow" style={{ position: "absolute", bottom: "10%", right: "-10%", padding: "2.5rem", zIndex: 30, maxWidth: "240px", borderTop: `4px solid ${cs.primary}` }}>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />)}
            </div>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>"Exzellente Beratung und absolut zuverlässig."</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustAbout({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section style={{ backgroundColor: "#f8fafc", padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      {/* Background architectural element */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 0)", backgroundSize: "40px 40px", opacity: 0.3 }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-24 items-center relative z-10">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div style={{ padding: "4rem", backgroundColor: "#fff", border: "1px solid #e2e8f0" }} className="premium-shadow">
            <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", color: "#0f172a", marginBottom: "2rem", lineHeight: 1.2 }}>Unsere Werte für Ihren Erfolg</h3>
            <div className="space-y-6">
              {["Integrität", "Kompetenz", "Nachhaltigkeit", "Innovation"].map((val, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
                  <span style={{ fontFamily: SANS, fontSize: "0.9rem", color: "#0f172a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Über unsere Kanzlei</span>
          </div>
          
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 700, color: "#0f172a", marginBottom: "2.5rem", lineHeight: 1.1 }}>{section.headline}</h2>
          
          <p style={{ fontSize: "1.15rem", lineHeight: 1.8, color: "#475569", marginBottom: "2.5rem" }}>
            {section.content}
          </p>
          
          <div className="flex items-center gap-6 pt-10 border-t border-slate-200">
            <div style={{ width: "4rem", height: "4rem", backgroundColor: `${cs.primary}10`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award className="h-6 w-6" style={{ color: cs.primary }} />
            </div>
            <div>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Staatlich geprüft & zertifiziert</p>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Sicherheit durch höchste Qualitätsstandards</p>
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
    <section data-section="services" id="leistungen" style={{ backgroundColor: "#fff", padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800, display: "block", marginBottom: "1.5rem" }}>Expertise & Leistungen</span>
            <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>
              {section.headline?.split(" ").map((word, i) => (
                <span key={i} style={{ color: i === section.headline.split(" ").length - 1 ? cs.primary : "inherit" }}>{word} </span>
              )) || "Ganzheitliche Ansätze für Ihre Sicherheit."}
            </h2>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100 border border-slate-100 overflow-hidden">
          {items.map((item, i) => (
            <div key={i} className="group transition-all duration-500 hover:bg-slate-50" style={{ backgroundColor: "#fff", padding: "4rem 3rem" }}>
              <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem", transition: "all 0.3s ease" }} className="group-hover:bg-slate-900">
                <Shield className="h-6 w-6 group-hover:text-white transition-colors" style={{ color: cs.primary }} />
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem" }}>{item.title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#64748b", marginBottom: "2.5rem" }}>{item.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em" }} className="opacity-0 group-hover:opacity-100 transition-all">
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
    <section data-section="gallery" style={{ backgroundColor: "#fff", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: "#1a2332", marginBottom: "0.75rem" }}>{section.headline}</h2>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto" }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "4/3", overflow: "hidden", border: "1px solid #e8edf3", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <img src={`https://images.unsplash.com/photo-${1576091160399 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
    <section style={{ padding: "5rem 0", backgroundColor: "#1a2332" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>{section.headline}</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Beispiel-Kundenstimmen</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "2rem", borderLeft: `3px solid ${cs.primary}` }}>
              <Quote className="h-6 w-6 mb-4" style={{ color: "var(--site-primary-on-surface)", opacity: 0.6 }} />
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem", fontStyle: "italic" }}>"{item.description}"</p>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: SERIF, fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>{item.author}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating || 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" style={{ color: "var(--site-primary-on-surface)" }} />
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
    <section id="faq" style={{ padding: "5rem 0", backgroundColor: "#fff" }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: "#1a2332", marginBottom: "0.5rem" }}>{section.headline}</h2>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e8edf3" }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 700, color: "#1a2332", paddingRight: "2rem" }}>{item.question}</span>
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: "var(--site-primary-on-surface)" }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: "#9aa5b4" }} />}
              </button>
              {open === i && (
                <div style={{ paddingBottom: "1.5rem" }}>
                  <p style={{ fontSize: "0.95rem", color: "#5a6a7e", lineHeight: 1.75 }}>{item.answer}</p>
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
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.5rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>{section.headline}</h2>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>{section.content}</p>
        <a href="#kontakt" onClick={showActivateButton ? onActivate : undefined}
          style={{ backgroundColor: "#fff", color: "var(--site-primary-on-white)", padding: "1rem 3rem", fontSize: "1rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          className="btn-premium transition-opacity">
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
    <section style={{ backgroundColor: "#fff", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#1a2332" }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-8">
                <h3 style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 700, color: "#1a2332", borderBottom: `2px solid ${cs.primary}`, display: "inline-block", paddingBottom: "0.5rem" }}>{cat}</h3>
                <div className="space-y-6">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-4 mb-1">
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1a2332" }}>{item.title}</h4>
                        <div className="flex-1 border-b border-slate-100 mx-2" />
                        <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--site-primary-on-surface)" }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "0.9rem", color: "#4a5568", lineHeight: 1.6 }}>{item.description}</p>
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
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1a2332" }}>{item.title}</h4>
                  <div className="flex-1 border-b border-slate-100 mx-2" />
                  <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--site-primary-on-surface)" }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontSize: "0.9rem", color: "#4a5568", lineHeight: 1.6 }}>{item.description}</p>
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
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#1a2332" }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map((cat, idx) => (
              <div key={idx} style={{ backgroundColor: "#fff", padding: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: "#1a2332", marginBottom: "2rem" }}>{cat}</h3>
                <div className="grid gap-4">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                      <span style={{ fontSize: "1rem", color: "#1a2332", fontWeight: 500 }}>{item.title}</span>
                      <span style={{ fontSize: "1.1rem", color: "var(--site-primary-on-surface)", fontWeight: 700 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: "#fff", padding: "3rem", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", maxWidth: "800px", margin: "0 auto" }}>
            <div className="grid gap-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                  <span style={{ fontSize: "1.1rem", color: "#1a2332", fontWeight: 500 }}>{item.title}</span>
                  <span style={{ fontSize: "1.2rem", color: "var(--site-primary-on-surface)", fontWeight: 700 }}>{item.price}</span>
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
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 700, color: "#1a2332", marginBottom: "1rem" }}>{section.headline}</h2>
          <p style={{ color: "#5a6a7e", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>{section.content}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Phone className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} />
              </div>
              <a href={`tel:${phone}`} style={{ color: "#1a2332", fontWeight: 600 }}>{phone}</a>
            </div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} />
              </div>
              <span style={{ color: "#4a5568" }}>{address}</span>
            </div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Clock className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {hours.slice(0, 4).map((h, i) => <span key={i} style={{ fontSize: "0.85rem", color: "#4a5568" }}>{h}</span>)}
              </div>
            </div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 700, color: "#1a2332", marginBottom: "1.5rem" }}>Nachricht senden</h3>
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
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.4rem" }}>{f.label}</label>
                <input type={f.type} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e8edf3", fontSize: "0.95rem", outline: "none", backgroundColor: cs.surface }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.4rem" }}>Anliegen</label>
              <textarea rows={4} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e8edf3", fontSize: "0.95rem", outline: "none", resize: "none", backgroundColor: cs.surface }} />
            </div>
            <button type="submit" style={{ backgroundColor: cs.primary, color: "var(--site-nav-text)", padding: "0.9rem", fontWeight: 700, fontSize: "0.95rem", border: "none", cursor: "pointer", width: "100%" }}
              className="btn-premium transition-opacity">
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
    <footer data-section="footer" style={{ backgroundColor: "#0f1724", padding: "3rem 0 1.5rem" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 pb-6 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <span style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{websiteData.businessName}</span>
            {websiteData.tagline && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginTop: "0.5rem" }}>{websiteData.tagline}</p>}
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Leistungen</p>
            {["Beratung", "Analyse", "Umsetzung", "Betreuung"].map(l => (
              <a key={l} href="#" style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "0.4rem" }} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Rechtliches</p>
            {["Impressum", "Datenschutz", "AGB"].map(l => (
              <a key={l} href="#" style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "0.4rem" }} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", textAlign: "center" }}>{websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`}</p>
      </div>
    </footer>
  );
}

/**
 * CRAFT Layout – Electrician, Plumber, Roofer, General Contractor
 * Inspired by: Electrician template (dark bg, yellow/orange accent, centered hero, stats)
 * Typography: Oswald (headlines) + Inter (body)
 * Feel: Powerful, trustworthy, professional trades
 * Structure: Dark hero with centered text, trust bar, feature grid with numbers, alternating sections
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Zap, Shield, Award, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const DISPLAY = "'Oswald', 'Impact', sans-serif";
const LOGO_FONT = "var(--logo-font, 'Oswald', 'Impact', sans-serif)";
const BODY = "var(--site-font-body, 'Inter', 'Helvetica Neue', sans-serif)";

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

export default function CraftLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
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
      <CraftNav websiteData={websiteData} cs={darkCs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <CraftHero section={section} cs={darkCs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} businessCategory={businessCategory} />}
          {section.type === "about" && <CraftAbout section={section} cs={darkCs} heroImageUrl={aboutImageUrl || heroImageUrl} businessCategory={businessCategory} />}
          {section.type === "gallery" && <CraftGallery section={section} cs={darkCs} />}
          {(section.type === "services" || section.type === "features") && <CraftServices section={section} cs={darkCs} />}
          {section.type === "menu" && <CraftMenu section={section} cs={darkCs} />}
          {section.type === "pricelist" && <CraftPricelist section={section} cs={darkCs} />}
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

function CraftNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: cs.background, fontFamily: BODY }} className="sticky top-0 z-50" >
      <div className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: cs.primary, padding: "0.4rem 0.6rem" }}>
            <Zap className="h-5 w-5" style={{ color: "#000" }} />
          </div>
          <div>
            {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.3rem", letterSpacing: "0.08em", color: cs.text, textTransform: "uppercase" }}>{websiteData.businessName}</span>}
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
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#000" }}>
      {/* Heavy textured background overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={heroImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5, filter: "grayscale(20%) contrast(120%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 20%, #000 100%)" }} />
      </div>
      
      {/* Centered Industrial Frame */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div style={{ 
          border: `1px solid rgba(255,255,255,0.1)`, 
          padding: "6rem 4rem", 
          position: "relative",
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)"
        }}>
          {/* Corner industrial accents */}
          <div style={{ position: "absolute", top: "20px", left: "20px", width: "40px", height: "40px", borderTop: `4px solid ${cs.primary}`, borderLeft: `4px solid ${cs.primary}` }} />
          <div style={{ position: "absolute", bottom: "20px", right: "20px", width: "40px", height: "40px", borderBottom: `4px solid ${cs.primary}`, borderRight: `4px solid ${cs.primary}` }} />

          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }} className="hero-animate-badge">
            <Zap className="h-5 w-5" style={{ color: cs.primary }} />
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.4em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Hardworking Excellence</span>
          </div>

          <h1 style={{ 
            fontFamily: DISPLAY, 
            fontSize: "clamp(3.5rem, 8vw, 7.5rem)", 
            lineHeight: 0.9, 
            letterSpacing: "0.02em", 
            color: "#fff", 
            marginBottom: "2.5rem", 
            textTransform: "uppercase",
            fontWeight: 700
          }} className="hero-animate-headline">
            {section.headline}
          </h1>

          <div style={{ maxWidth: "600px", margin: "0 auto 4rem" }} className="hero-animate-sub">
            {section.subheadline && <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: "1rem", fontWeight: 500 }}>{section.subheadline}</p>}
            {section.content && <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>{section.content}</p>}
          </div>

          <div className="flex flex-wrap gap-6 justify-center hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: cs.primary, color: "#000", padding: "1.5rem 4rem", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, transition: "all 0.4s ease" }} 
                className="hover:tracking-[0.2em] shadow-2xl">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `2px solid rgba(255,255,255,0.3)`, color: "#fff", padding: "1.5rem 4rem", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, backgroundColor: "transparent" }} 
                className="hover:bg-white hover:text-black transition-all">
                Aktivieren
              </button>
            )}
          </div>
        </div>
        
        {/* Stats integrated as a floating bar */}
        <div style={{ marginTop: "-2rem", position: "relative", zIndex: 20 }}>
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-px bg-white/10 premium-shadow">
            {heroStats.slice(0, 3).map(({ n, label }, i) => (
              <div key={i} style={{ backgroundColor: "#111", padding: "2rem 1rem" }}>
                <p style={{ fontFamily: DISPLAY, fontSize: "2.5rem", color: cs.primary, lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.5rem", fontWeight: 700 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CraftAbout({ section, cs, heroImageUrl, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; businessCategory?: string | null }) {
  return (
    <section style={{ backgroundColor: "#0a0a0a", padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-6 relative">
            <div style={{ position: "absolute", top: "10%", left: "-5%", width: "100%", height: "100%", backgroundColor: cs.primary, zIndex: 0 }} />
            <div className="premium-shadow-lg relative z-10 overflow-hidden">
              <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", filter: "contrast(110%)" }} />
            </div>
          </div>
          
          <div className="lg:col-span-6">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ width: "4rem", height: "4px", backgroundColor: cs.primary }} />
              <span style={{ fontSize: "0.9rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Ehrliches Handwerk</span>
            </div>
            
            <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3rem", lineHeight: 0.9 }}>{section.headline}</h2>
            
            <div className="space-y-8">
              <p style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{section.subheadline}</p>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "rgba(255,255,255,0.5)" }}>{section.content}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-white/10">
              {["Meisterqualität", "24/7 Notdienst", "Termingarantie", "Faire Preise"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" style={{ color: cs.primary }} />
                  <span style={{ fontSize: "1rem", color: "#fff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CraftServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: "#111", padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-6 mb-24">
          <div style={{ width: "5rem", height: "12px", backgroundColor: cs.primary }} />
          <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 6rem)", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.9 }}>
            Unsere <span style={{ color: cs.primary }}>Expertise</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1px bg-white/10 border border-white/10">
          {items.map((item, i) => (
            <div key={i} className="group transition-all duration-500 hover:bg-white/[0.03]" style={{ backgroundColor: "#111", padding: "5rem 3rem" }}>
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)", marginBottom: "3rem" }}>SERVICE — {String(i + 1).padStart(2, "0")}</div>
              
              <h3 style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>{item.title}</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.45)", marginBottom: "3.5rem" }}>{item.description}</p>
              
              <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", fontSize: "0.85rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.2em", borderBottom: `1px solid ${cs.primary}40`, paddingBottom: "0.5rem" }} className="opacity-0 group-hover:opacity-100 group-hover:gap-6 transition-all">
                Details <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CraftGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: cs.background, padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Unsere Projekte</span>
          <h2 data-reveal data-delay="100" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 1 }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "4/3", overflow: "hidden", border: `1px solid ${cs.primary}20`, backgroundColor: cs.surface }}>
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1504307651254 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.9)" }} />
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

function CraftMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", backgroundColor: `${cs.primary}20`, border: `1px solid ${cs.primary}40`, padding: "0.5rem 1.25rem", marginBottom: "2rem" }}>
            <div style={{ width: "8px", height: "8px", backgroundColor: cs.primary, borderRadius: "50%" }} />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Kulinarik & Genuss</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-x-20 gap-y-16">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-8">
                <h3 style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 700, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `1px solid ${cs.primary}30`, paddingBottom: "0.5rem" }}>{cat}</h3>
                <div className="space-y-8">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-4 mb-2">
                        <h4 style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                        <div className="flex-1 border-b border-white/10 mx-2" />
                        <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-x-20 gap-y-12">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline gap-4 mb-2">
                  <h4 style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                  <div className="flex-1 border-b border-white/10 mx-2" />
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CraftPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.surface, padding: "7rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", backgroundColor: cs.primary, padding: "0.5rem 1.25rem", marginBottom: "2rem" }}>
            <div style={{ width: "8px", height: "8px", backgroundColor: "#000", borderRadius: "50%" }} />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", fontWeight: 800 }}>Preise & Leistungen</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {categories.map((cat, idx) => (
              <div key={idx} style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "2.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontFamily: DISPLAY, fontSize: "1.75rem", fontWeight: 700, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem" }}>{cat}</h3>
                <div className="space-y-5">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                      <span style={{ fontFamily: DISPLAY, fontSize: "1.1rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</span>
                      <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "3rem", border: "1px solid rgba(255,255,255,0.06)", maxWidth: "800px", margin: "0 auto" }}>
            <div className="space-y-6">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</span>
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.3rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Vorname" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
              <input type="text" placeholder="Nachname" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
            </div>
            <input type="tel" placeholder="Telefonnummer" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
            <textarea placeholder="Beschreiben Sie Ihr Anliegen" rows={4} style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none", resize: "none" }} />
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
    <footer data-section="footer" style={{ backgroundColor: "#000", borderTop: `3px solid ${cs.primary}`, padding: "2.5rem 0" }}>
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

/**
 * CRAFT Layout – Electrician, Plumber, Roofer, General Contractor
 * Inspired by: Electrician template (dark bg, yellow/orange accent, centered hero, stats)
 * Typography: Bricolage Grotesque (headlines) + Instrument Sans (body)
 * Feel: Powerful, trustworthy, professional trades
 * Structure: Dark hero with centered text, trust bar, feature grid with numbers, alternating sections
 */
import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import { useScrollReveal } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const DISPLAY = "var(--site-font-headline, 'Bricolage Grotesque', 'Impact', sans-serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Bricolage Grotesque', 'Impact', sans-serif))";
const BODY = "var(--site-font-body, 'Instrument Sans', 'Inter', sans-serif)";

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
  useScrollReveal();

  return (
    <div style={{ fontFamily: BODY, backgroundColor: cs.background, color: cs.onBackground }}>
      <div style={{ backgroundColor: cs.surface, borderBottom: `1px solid ${cs.onSurface}10`, padding: "0.5rem 0" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            {businessPhone && <a href={`tel:${businessPhone}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: cs.onSurface, opacity: 0.6 }}><Phone className="h-3.5 w-3.5" style={{ color: cs.primary }} />{businessPhone}</a>}
            {businessAddress && <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: cs.onSurface, opacity: 0.6 }}><MapPin className="h-3.5 w-3.5" style={{ color: cs.primary }} />{businessAddress}</span>}
          </div>
          <span style={{ fontSize: "0.75rem", color: cs.onSurface, opacity: 0.5, letterSpacing: "0.05em" }}>Erreichbar: Mo–Fr: 8:00–18:00 Uhr</span>
        </div>
      </div>
      <CraftNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <CraftHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} businessCategory={businessCategory} />}
          {section.type === "about" && <CraftAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} businessCategory={businessCategory} />}
          {section.type === "gallery" && <CraftGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <CraftServices section={section} cs={cs} />}
          {section.type === "menu" && <CraftMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <CraftPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <CraftTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <CraftFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <CraftContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <CraftCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <CraftFooter websiteData={websiteData} cs={cs} slug={slug} />
    </div>
  );
}

function CraftNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: cs.background, borderBottom: `1px solid ${cs.onBackground}05`, fontFamily: BODY }} className="sticky top-0 z-50" >
      <div className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: cs.primary, padding: "0.4rem 0.6rem" }}>
            <Zap className="h-5 w-5" style={{ color: cs.onPrimary }} />
          </div>
          <div>
            {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.3rem", letterSpacing: "0.08em", color: cs.onBackground, textTransform: "uppercase", fontWeight: 800 }}>{websiteData.businessName}</span>}
            {websiteData.tagline && <p style={{ fontSize: "0.65rem", color: cs.onBackground, opacity: 0.5, letterSpacing: "0.1em" }}>{websiteData.tagline.slice(0, 40)}</p>}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Angebot", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: cs.onBackground, opacity: 0.6, fontWeight: 600 }} className="hover:text-primary transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.65rem 1.5rem", fontSize: "0.8rem", letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.5rem" }} className="hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            <Phone className="h-4 w-4" /> Jetzt anrufen
          </a>
        )}
      </div>
    </nav>
  );
}

function CraftHero({ section, cs, heroImageUrl, showActivateButton, onActivate, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData; businessCategory?: string | null }) {
  const heroStats = getIndustryStats(businessCategory || "");
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: cs.onBackground }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={heroImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5, filter: "grayscale(20%) contrast(120%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle, transparent 20%, ${cs.onBackground} 100%)` }} />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div style={{ 
          border: `1px solid ${cs.background}20`, 
          padding: "6rem 4rem", 
          position: "relative",
          backgroundColor: `${cs.onBackground}66`, // ~40% opacity
          backdropFilter: "blur(10px)"
        }}>
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
            color: cs.background, 
            marginBottom: "2.5rem", 
            textTransform: "uppercase",
            fontWeight: 700
          }} className="hero-animate-headline">
            {section.headline}
          </h1>

          <div style={{ maxWidth: "600px", margin: "0 auto 4rem" }} className="hero-animate-sub">
            {section.subheadline && <p style={{ fontSize: "1.25rem", color: cs.background, opacity: 0.8, lineHeight: 1.6, marginBottom: "1rem", fontWeight: 500 }}>{section.subheadline}</p>}
            {section.content && <p style={{ fontSize: "1rem", color: cs.background, opacity: 0.6, lineHeight: 1.8 }}>{section.content}</p>}
          </div>

          <div className="flex flex-wrap gap-6 justify-center hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1.5rem 4rem", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, transition: "all 0.4s ease" }} 
                className="hover:tracking-[0.2em] shadow-xl">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `2px solid ${cs.background}40`, color: cs.background, padding: "1.5rem 4rem", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, backgroundColor: "transparent" }} 
                className="hover:opacity-70 transition-all">
                Aktivieren
              </button>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: "-2rem", position: "relative", zIndex: 20 }}>
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-px" style={{ backgroundColor: `${cs.onBackground}15` }}>
            {heroStats.slice(0, 3).map(({ n, label }, i) => (
              <div key={i} style={{ backgroundColor: cs.onBackground, padding: "2rem 1rem" }}>
                <p style={{ fontFamily: DISPLAY, fontSize: "2.5rem", color: cs.primary, lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: "0.7rem", color: cs.background, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.5rem", fontWeight: 700 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CraftAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; businessCategory?: string | null }) {
  return (
    <section style={{ backgroundColor: cs.background, padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-6 relative">
            <div style={{ position: "absolute", top: "10%", left: "-5%", width: "100%", height: "100%", backgroundColor: cs.primary, zIndex: 0, opacity: 0.1 }} />
            <div className="premium-shadow-lg relative z-10 overflow-hidden" style={{ border: `1px solid ${cs.onBackground}10` }}>
              <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", filter: "contrast(110%)" }} />
            </div>
          </div>
          
          <div className="lg:col-span-6">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ width: "4rem", height: "4px", backgroundColor: cs.primary }} />
              <span style={{ fontSize: "0.9rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Ehrliches Handwerk</span>
            </div>
            
            <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3rem", lineHeight: 0.9 }}>{section.headline}</h2>
            
            <div className="space-y-8">
              <p style={{ fontSize: "1.2rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.9, fontWeight: 500 }}>{section.subheadline}</p>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: cs.onBackground, opacity: 0.6 }}>{section.content}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t" style={{ borderColor: `${cs.onBackground}10` }}>
              {["Meisterqualität", "24/7 Notdienst", "Termingarantie", "Faire Preise"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" style={{ color: cs.primary }} />
                  <span style={{ fontSize: "1rem", color: cs.onBackground, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item}</span>
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
    <section data-section="services" style={{ backgroundColor: cs.surface, padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-6 mb-24">
          <div style={{ width: "5rem", height: "12px", backgroundColor: cs.primary }} />
          <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 6rem)", fontWeight: 700, color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.9 }}>
            Unsere <span style={{ color: cs.primary }}>Expertise</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px border" style={{ backgroundColor: `${cs.onSurface}15`, borderColor: `${cs.onSurface}15` }}>
          {items.map((item, i) => (
            <div key={i} className="group transition-all duration-500" style={{ backgroundColor: cs.background, padding: "5rem 3rem" }}>
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.3em", color: cs.onBackground, opacity: 0.3, marginBottom: "3rem" }}>SERVICE — {String(i + 1).padStart(2, "0")}</div>
              
              <h3 style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 600, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>{item.title}</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: cs.onBackground, opacity: 0.6, marginBottom: "3.5rem" }}>{item.description}</p>
              
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
          <h2 data-reveal data-delay="100" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 1 }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "4/3", overflow: "hidden", border: `1px solid ${cs.onBackground}10`, backgroundColor: cs.surface }}>
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
          <h2 data-reveal data-delay="200" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.onSurface, textTransform: "uppercase", lineHeight: 1 }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, padding: "2rem", borderLeft: `4px solid ${cs.primary}`, borderTop: `1px solid ${cs.onBackground}05`, borderRight: `1px solid ${cs.onBackground}05`, borderBottom: `1px solid ${cs.onBackground}05` }}>
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1.25rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4" style={{ fill: cs.primary, color: cs.primary }} />
                ))}
              </div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.7, marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
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
          <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 1 }}>{section.headline}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", backgroundColor: `${cs.onBackground}10` }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer", borderLeft: open === i ? `4px solid ${cs.primary}` : "4px solid transparent", transition: "border-color 0.2s" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: cs.onBackground }}>{item.question || item.title}</span>
                {open === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: cs.onBackground, opacity: 0.4 }} />}
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem 1.75rem", fontSize: "0.9rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.6 }}>
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
        <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "0.03em", color: cs.onPrimary, textTransform: "uppercase", lineHeight: 1, marginBottom: "1.5rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: cs.onPrimary, opacity: 0.8, marginBottom: "2.5rem" }}>{section.content}</p>}
        <div className="flex flex-wrap gap-4 justify-center">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.onPrimary, color: cs.primary, padding: "1rem 3rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }} className="hover:opacity-80 transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: `2px solid ${cs.onPrimary}33`, color: cs.onPrimary, padding: "1rem 3rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, backgroundColor: "transparent" }} className="hover:opacity-70 transition-colors">
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
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>{section.headline}</h2>
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
                        <h4 style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                        <div className="flex-1 border-b mx-2" style={{ borderColor: `${cs.onBackground}10` }} />
                        <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: cs.onBackground, opacity: 0.5, lineHeight: 1.6 }}>{item.description}</p>
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
                  <h4 style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                  <div className="flex-1 border-b mx-2" style={{ borderColor: `${cs.onBackground}10` }} />
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontFamily: BODY, fontSize: "0.95rem", color: cs.onBackground, opacity: 0.5, lineHeight: 1.6 }}>{item.description}</p>
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
            <div style={{ width: "8px", height: "8px", backgroundColor: cs.onPrimary, borderRadius: "50%" }} />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.onPrimary, fontWeight: 800 }}>Preise & Leistungen</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {categories.map((cat, idx) => (
              <div key={idx} style={{ backgroundColor: cs.background, padding: "2.5rem", border: `1px solid ${cs.onBackground}10` }}>
                <h3 style={{ fontFamily: DISPLAY, fontSize: "1.75rem", fontWeight: 700, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem" }}>{cat}</h3>
                <div className="space-y-5">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b last:border-0" style={{ borderColor: `${cs.onBackground}05` }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: "1.1rem", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</span>
                      <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: cs.background, padding: "3rem", border: `1px solid ${cs.onBackground}10`, maxWidth: "800px", margin: "0 auto" }}>
            <div className="space-y-6">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b last:border-0" style={{ borderColor: `${cs.onBackground}05` }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</span>
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
          <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "0.03em", color: cs.onSurface, textTransform: "uppercase", lineHeight: 1, marginBottom: "2.5rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: cs.onSurface, opacity: 0.6, marginBottom: "2.5rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", backgroundColor: cs.background, border: `1px solid ${cs.onBackground}05` }}><Phone className="h-5 w-5" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ color: cs.onBackground, fontSize: "1rem", fontWeight: 600 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem 1.25rem", backgroundColor: cs.background, border: `1px solid ${cs.onBackground}05` }}><MapPin className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><span style={{ color: cs.onBackground, opacity: 0.7, fontSize: "0.95rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", backgroundColor: cs.background, border: `1px solid ${cs.onBackground}05` }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ color: cs.onBackground, fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem 1.25rem", backgroundColor: cs.background, border: `1px solid ${cs.onBackground}05` }}><Clock className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><div>{hours.map((h, i) => <p key={i} style={{ color: cs.onBackground, opacity: 0.7, fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.background, padding: "2.5rem", border: `1px solid ${cs.onBackground}10` }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: "1.5rem", letterSpacing: "0.05em", color: cs.onBackground, textTransform: "uppercase", marginBottom: "1.5rem" }}>Kostenlose Beratung</h3>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Vorname" style={{ backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}10`, padding: "0.85rem 1rem", color: cs.onSurface, fontSize: "0.9rem", outline: "none" }} />
              <input type="text" placeholder="Nachname" style={{ backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}10`, padding: "0.85rem 1rem", color: cs.onSurface, fontSize: "0.9rem", outline: "none" }} />
            </div>
            <input type="tel" placeholder="Telefonnummer" style={{ backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}10`, padding: "0.85rem 1rem", color: cs.onSurface, fontSize: "0.9rem", outline: "none" }} />
            <textarea placeholder="Beschreiben Sie Ihr Anliegen" rows={4} style={{ backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}10`, padding: "0.85rem 1rem", color: cs.onSurface, fontSize: "0.9rem", outline: "none", resize: "none" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, border: "none", cursor: "pointer" }} className="hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
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
    <footer data-section="footer" style={{ backgroundColor: cs.onBackground, padding: "2.5rem 0", borderTop: `3px solid ${cs.primary}` }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", letterSpacing: "0.1em", color: cs.background, textTransform: "uppercase" }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: cs.background, opacity: 0.5 }}>{websiteData.footer?.text}</p>
        <div className="flex gap-8">
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href={slug ? `/site/${slug}/${l.toLowerCase()}` : "#"} style={{ fontSize: "0.75rem", color: cs.background, opacity: 0.6, letterSpacing: "0.08em" }} className="hover:opacity-100 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

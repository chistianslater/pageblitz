/**
 * LUXURY Layout – Automotive, Premium Services, Car Detailing, High-End Retail
 * Inspired by: Luxegloss template (dark bg, yellow accents, full-bleed hero)
 * Typography: Fraunces (headlines) + Outfit (body)
 * Feel: Dark, premium, powerful, modern
 * Structure: Full-bleed dark hero, stats bar, alternating dark/slightly-lighter sections
 */
import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import { useScrollReveal } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const DISPLAY = "'Fraunces', 'Impact', sans-serif";
const LOGO_FONT = "var(--logo-font, 'Fraunces', 'Impact', sans-serif)";
const BODY = "var(--site-font-body, 'Outfit', 'Inter', sans-serif)";

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

export default function LuxuryLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();

  return (
    <div style={{ fontFamily: BODY, backgroundColor: cs.background, color: cs.onBackground }}>
      <LuxuryNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <LuxuryHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <LuxuryAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} businessCategory={businessCategory} />}
          {section.type === "gallery" && <LuxuryGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <LuxuryServices section={section} cs={cs} />}
          {section.type === "menu" && <LuxuryMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <LuxuryPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <LuxuryTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <LuxuryFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <LuxuryContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <LuxuryCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <LuxuryFooter websiteData={websiteData} cs={cs} slug={slug} />
    </div>
  );
}

function LuxuryNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: `${cs.background}F2`, borderBottom: `1px solid ${cs.onBackground}15`, fontFamily: BODY, backdropFilter: "blur(10px)" }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: "8px", height: "8px", backgroundColor: cs.primary, borderRadius: "50%" }} />
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", letterSpacing: "0.1em", color: cs.onBackground }}>{websiteData.businessName.toUpperCase()}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Angebot", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: cs.onBackground, opacity: 0.6, fontWeight: 500 }} className="hover:text-primary transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.5rem 1.25rem", fontSize: "0.75rem", letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }} className="hidden sm:flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            <Phone className="h-3 w-3" /> Anrufen
          </a>
        )}
      </div>
    </nav>
  );
}

function LuxuryHero({ section, cs, heroImageUrl, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: cs.onBackground }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={heroImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle, transparent 20%, ${cs.onBackground} 100%)` }} />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div style={{ 
          border: `1px solid ${cs.primary}30`, 
          padding: "5rem 3rem", 
          position: "relative",
          backdropFilter: "blur(4px)",
          backgroundColor: `${cs.onBackground}33` // ~20% opacity
        }}>
          <div style={{ position: "absolute", top: "-1px", left: "-1px", width: "30px", height: "30px", borderTop: `2px solid ${cs.primary}`, borderLeft: `2px solid ${cs.primary}` }} />
          <div style={{ position: "absolute", top: "-1px", right: "-1px", width: "30px", height: "30px", borderTop: `2px solid ${cs.primary}`, borderRight: `2px solid ${cs.primary}` }} />
          <div style={{ position: "absolute", bottom: "-1px", left: "-1px", width: "30px", height: "30px", borderBottom: `2px solid ${cs.primary}`, borderLeft: `2px solid ${cs.primary}` }} />
          <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "30px", height: "30px", borderBottom: `2px solid ${cs.primary}`, borderRight: `2px solid ${cs.primary}` }} />

          <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem" }}>
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.5em", textTransform: "uppercase", color: cs.primary, fontWeight: 500 }}>Excellence Defined</span>
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
          </div>

          <h1 style={{ 
            fontFamily: DISPLAY, 
            fontSize: "clamp(4rem, 10vw, 8rem)", 
            lineHeight: 0.85, 
            letterSpacing: "0.05em", 
            color: cs.background, 
            marginBottom: "2.5rem", 
            textTransform: "uppercase",
            fontWeight: 400
          }} className="hero-animate-headline">
            {section.headline}
          </h1>

          {section.subheadline && (
            <p style={{ fontSize: "1.25rem", lineHeight: 1.6, color: cs.background, opacity: 0.8, marginBottom: "3.5rem", maxWidth: "600px", fontWeight: 300, fontStyle: "italic", margin: "0 auto 3.5rem auto" }}>
              {section.subheadline}
            </p>
          )}

          <div className="flex flex-wrap gap-6 justify-center">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1.25rem 3.5rem", fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 800, transition: "all 0.4s ease" }} 
                className="hover:bg-white hover:tracking-[0.3em] shadow-xl">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `1px solid ${cs.background}66`, color: cs.background, padding: "1.25rem 3.5rem", fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, backgroundColor: "transparent" }} 
                className="hover:opacity-70 transition-all">
                Aktivieren
              </button>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }} className="animate-bounce opacity-40">
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.background }}>Entdecken</span>
          <ChevronDown className="h-5 w-5" style={{ color: cs.background }} />
        </div>
      </div>
    </section>
  );
}

function LuxuryAbout({ section, cs, heroImageUrl, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; businessCategory?: string | null }) {
  const industryStats = getIndustryStats(businessCategory || "");
  return (
    <section style={{ backgroundColor: cs.background, padding: "12rem 0", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="relative order-2 lg:order-1">
            <div style={{ 
              position: "absolute", 
              top: "10%", 
              left: "-10%", 
              width: "100%", 
              height: "100%", 
              border: `1px solid ${cs.primary}15`, 
              zIndex: 0 
            }} />
            <div className="premium-shadow-lg" style={{ position: "relative", zIndex: 1, border: `1px solid ${cs.onBackground}10` }}>
              <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", filter: "grayscale(20%) contrast(110%)" }} />
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
              <span style={{ fontSize: "0.8rem", letterSpacing: "0.4em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>Heritage & Quality</span>
            </div>
            <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 5vw, 5rem)", letterSpacing: "0.02em", color: cs.onBackground, marginBottom: "2.5rem", textTransform: "uppercase", lineHeight: 0.9 }}>
              {section.headline}
            </h2>
            <div style={{ width: "60px", height: "1px", backgroundColor: cs.primary, marginBottom: "2.5rem" }} />
            
            <p style={{ fontSize: "1.15rem", lineHeight: 1.8, color: cs.onBackground, opacity: 0.8, marginBottom: "2rem", fontWeight: 300 }}>
              {section.subheadline}
            </p>
            <p style={{ fontSize: "1rem", lineHeight: 1.9, color: cs.onBackground, opacity: 0.5, marginBottom: "3.5rem" }}>
              {section.content}
            </p>
            
            <div className="grid grid-cols-2 gap-12 border-t pt-10" style={{ borderColor: `${cs.onBackground}15` }}>
              {industryStats.slice(0, 2).map(({ n: num, label }) => (
                <div key={label}>
                  <p style={{ fontFamily: DISPLAY, fontSize: "3rem", color: cs.primary, marginBottom: "0.5rem", lineHeight: 1 }}>{num}</p>
                  <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.onBackground, opacity: 0.4 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LuxuryServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: cs.background, padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <span style={{ fontSize: "0.8rem", letterSpacing: "0.5em", textTransform: "uppercase", color: cs.primary, fontWeight: 500, display: "block", marginBottom: "1.5rem" }}>Our Collection</span>
          <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 6rem)", letterSpacing: "0.05em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 0.85 }}>
            {section.headline}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {items.map((item, i) => (
            <div key={i} 
              className="group"
              style={{ 
                backgroundColor: cs.surface, 
                padding: "4rem 3rem", 
                border: `1px solid ${cs.onSurface}10`,
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative"
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", backgroundColor: cs.primary, transform: "scaleX(0)", transformOrigin: "left", transition: "transform 0.5s ease" }} className="group-hover:scale-x-100" />
              
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.3em", color: cs.onSurface, opacity: 0.3, marginBottom: "2.5rem" }}>ITEM — {String(i + 1).padStart(2, "0")}</div>
              
              <h3 style={{ fontFamily: DISPLAY, fontSize: "1.8rem", letterSpacing: "0.1em", color: cs.onSurface, marginBottom: "1.5rem", textTransform: "uppercase" }}>{item.title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: cs.onSurface, opacity: 0.5, marginBottom: "3rem" }}>{item.description}</p>
              
              <div style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "1rem", 
                fontSize: "0.75rem", 
                letterSpacing: "0.2em", 
                color: cs.primary, 
                textTransform: "uppercase",
                fontWeight: 700,
                borderBottom: `1px solid ${cs.primary}40`,
                paddingBottom: "0.5rem"
              }} className="group-hover:gap-6 transition-all">
                Details <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LuxuryGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: cs.background, padding: "8rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "4rem" }}>
          <div style={{ width: "3rem", height: "2px", backgroundColor: cs.primary }} />
          <h2 data-reveal data-delay="100" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 0.95 }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "1/1", overflow: "hidden", position: "relative", backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}10` }} className="group">
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1503376780353 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8)" }} className="group-hover:scale-110 group-hover:brightness-100 transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LuxuryTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ width: "3rem", height: "2px", backgroundColor: cs.primary }} />
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>Kundenstimmen</span>
        </div>
        <h2 data-reveal data-delay="200" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.onSurface, textTransform: "uppercase", lineHeight: 0.95, marginBottom: "4rem" }}>{section.headline}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, padding: "2.5rem", borderLeft: `3px solid ${cs.primary}`, borderTop: `1px solid ${cs.onBackground}05`, borderRight: `1px solid ${cs.onBackground}05`, borderBottom: `1px solid ${cs.onBackground}05` }}>
              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4" style={{ fill: cs.primary, color: cs.primary }} />
                ))}
              </div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.7, marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
              <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>{item.author || "Kunde"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LuxuryFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "7rem 0" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ width: "3rem", height: "2px", backgroundColor: cs.primary }} />
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>FAQ</span>
        </div>
        <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 0.95, marginBottom: "3rem" }}>{section.headline}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", backgroundColor: `${cs.onBackground}15` }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "1rem", fontWeight: 500, color: cs.onBackground }}>{item.question || item.title}</span>
                {open === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: cs.onBackground, opacity: 0.4 }} />}
              </button>
              {open === i && (
                <div style={{ padding: "0 2rem 1.5rem", fontSize: "0.9rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.6 }}>
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

function LuxuryCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "0.03em", color: cs.onPrimary, textTransform: "uppercase", lineHeight: 0.95, marginBottom: "1.5rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: cs.onPrimary, opacity: 0.8, marginBottom: "2.5rem" }}>{section.content}</p>}
        <div className="flex flex-wrap gap-4 justify-center">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.onPrimary, color: cs.primary, padding: "1rem 3rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }} className="hover:opacity-80 transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: `2px solid ${cs.onPrimary}33`, color: cs.onPrimary, padding: "1rem 3rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, backgroundColor: "transparent" }} className="hover:bg-white/10 transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function LuxuryMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "8rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ width: "4rem", height: "1px", backgroundColor: cs.primary }} />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>Haute Cuisine</span>
            <div style={{ width: "4rem", height: "1px", backgroundColor: cs.primary }} />
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 7vw, 5.5rem)", lineHeight: 0.9, letterSpacing: "0.02em", color: cs.onBackground, textTransform: "uppercase" }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-x-24 gap-y-20">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-10">
                <h3 style={{ fontFamily: DISPLAY, fontSize: "2.2rem", fontWeight: 400, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center", borderBottom: `1px solid ${cs.onBackground}15`, paddingBottom: "1.5rem" }}>{cat}</h3>
                <div className="space-y-10">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-6 mb-3">
                        <h4 style={{ fontFamily: DISPLAY, fontSize: "1.3rem", color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                        <div className="flex-1 border-b" style={{ borderColor: `${cs.onBackground}15` }} />
                        <span style={{ fontFamily: DISPLAY, fontSize: "1.3rem", color: cs.primary }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "1rem", color: cs.onBackground, opacity: 0.5, lineHeight: 1.6, fontWeight: 300, fontStyle: "italic" }}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-x-24 gap-y-16">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline gap-6 mb-3">
                  <h4 style={{ fontFamily: DISPLAY, fontSize: "1.3rem", color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                  <div className="flex-1 border-b" style={{ borderColor: `${cs.onBackground}15` }} />
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.3rem", color: cs.primary }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontSize: "1rem", color: cs.onBackground, opacity: 0.5, lineHeight: 1.6, fontWeight: 300, fontStyle: "italic" }}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LuxuryPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.surface, padding: "8rem 0" }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary }} />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>Elegante Services</span>
            <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary }} />
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 7vw, 5.5rem)", lineHeight: 0.9, letterSpacing: "0.02em", color: cs.onSurface, textTransform: "uppercase" }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-20">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <h3 style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 400, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center", marginBottom: "3rem" }}>{cat}</h3>
                <div className="grid gap-6">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-5 border-b hover:bg-white/[0.02] px-6 transition-colors" style={{ borderColor: `${cs.onSurface}10` }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</span>
                      <span style={{ fontFamily: DISPLAY, fontSize: "1.4rem", color: cs.primary }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 max-w-3xl mx-auto">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-6 border-b hover:bg-white/[0.02] px-8 transition-colors" style={{ borderColor: `${cs.onSurface}10` }}>
                <span style={{ fontFamily: DISPLAY, fontSize: "1.25rem", color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</span>
                <span style={{ fontFamily: DISPLAY, fontSize: "1.5rem", color: cs.primary }}>{item.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LuxuryContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.surface, padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ width: "3rem", height: "2px", backgroundColor: cs.primary }} />
              <span style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>Kontakt</span>
            </div>
            <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.onSurface, textTransform: "uppercase", lineHeight: 0.95, marginBottom: "2.5rem" }}>{section.headline}</h2>
            {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: cs.onSurface, opacity: 0.6, marginBottom: "2.5rem" }}>{section.content}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Phone className="h-5 w-5" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ color: cs.onSurface, fontSize: "1rem" }}>{phone}</a></div>}
              {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><MapPin className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><span style={{ color: cs.onSurface, opacity: 0.7, fontSize: "0.95rem" }}>{address}</span></div>}
              {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ color: cs.onSurface, fontSize: "1rem" }}>{email}</a></div>}
              {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><Clock className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><div>{hours.map((h, i) => <p key={i} style={{ color: cs.onSurface, opacity: 0.7, fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
            </div>
          </div>
        <div style={{ backgroundColor: cs.background, padding: "3rem", border: `1px solid ${cs.onBackground}10` }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: "1.5rem", letterSpacing: "0.05em", color: cs.onBackground, textTransform: "uppercase", marginBottom: "2rem" }}>Nachricht senden</h3>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input type="text" placeholder="Ihr Name" style={{ backgroundColor: `${cs.onBackground}08`, border: `1px solid ${cs.onBackground}15`, padding: "0.9rem 1rem", color: cs.onBackground, fontSize: "0.9rem", outline: "none" }} />
            <input type="email" placeholder="Ihre E-Mail" style={{ backgroundColor: `${cs.onBackground}08`, border: `1px solid ${cs.onBackground}15`, padding: "0.9rem 1rem", color: cs.onBackground, fontSize: "0.9rem", outline: "none" }} />
            <textarea placeholder="Ihre Nachricht" rows={4} style={{ backgroundColor: `${cs.onBackground}08`, border: `1px solid ${cs.onBackground}15`, padding: "0.9rem 1rem", color: cs.onBackground, fontSize: "0.9rem", outline: "none", resize: "none" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, border: "none", cursor: "pointer" }} className="hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              Senden
            </button>
          </form>
        </div>
        </div>
      </div>
    </section>
  );
}

function LuxuryFooter({ websiteData, cs, slug }: { websiteData: WebsiteData; cs: ColorScheme; slug?: string | null }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: cs.onBackground, padding: "3rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", letterSpacing: "0.1em", color: cs.background }}>{websiteData.businessName.toUpperCase()}</span>
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

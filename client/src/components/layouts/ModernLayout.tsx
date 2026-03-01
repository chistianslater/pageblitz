/**
 * MODERN Layout – Tech, Agency, Consulting, Real Estate, Retail
 * Inspired by: Clean modern agency templates with asymmetric layouts
 * Typography: Inter (all) with weight variation
 * Feel: Contemporary, clean, bold typography, minimal decoration
 * Structure: Asymmetric 60/40 hero, horizontal scrolling services, large testimonial quote
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, ArrowRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";

const BODY = "var(--site-font-body, 'Inter', 'Helvetica Neue', sans-serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Inter', 'Helvetica Neue', sans-serif))";

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
}

export default function ModernLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: BODY, backgroundColor: "#ffffff", color: "#0a0a0a" }}>
      <ModernNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <ModernHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <ModernAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} />}
          {section.type === "gallery" && <ModernGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <ModernServices section={section} cs={cs} />}
          {section.type === "menu" && <ModernMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <ModernPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <ModernTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <ModernFAQ section={section} cs={cs} />}
                    {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <ModernContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <ModernCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <ModernFooter websiteData={websiteData} cs={cs} slug={slug} />
    </div>
  );
}

function ModernNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0", fontFamily: BODY }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0a0a0a", fontFamily: LOGO_FONT }}>{websiteData.businessName}</span>}
        <div className="hidden md:flex items-center gap-10">
          {["Leistungen", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.85rem", color: "#666", fontWeight: 500 }} className="hover:text-black transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ fontSize: "0.85rem", color: "#0a0a0a", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }} className="hover:opacity-60 transition-opacity">
            <Phone className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function ModernHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ backgroundColor: "#fff", minHeight: "95vh", display: "flex", position: "relative", overflow: "hidden" }}>
      {/* Background Decorative Element */}
      <div 
        className="floating-element"
        style={{ 
          position: "absolute", 
          top: "10%", 
          right: "-5%", 
          width: "40vw", 
          height: "40vw", 
          background: `radial-gradient(circle, ${cs.primary}10 0%, transparent 70%)`,
          zIndex: 0 
        }} 
      />
      
      <div className="max-w-7xl mx-auto px-8 w-full grid lg:grid-cols-12 gap-0 items-center relative z-10">
        {/* Left - Text (overlaps slightly) */}
        <div className="lg:col-span-7 py-20 lg:pr-12 relative z-20">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 800, backgroundColor: `${cs.primary}10`, padding: "0.5rem 1rem", borderRadius: "2px" }}>
              Premium Experience
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: "clamp(3.5rem, 8vw, 6.5rem)", 
            fontWeight: 900, 
            lineHeight: 0.9, 
            letterSpacing: "-0.04em", 
            color: "#0a0a0a", 
            marginBottom: "2rem" 
          }} className="hero-animate-headline">
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ display: i === 1 ? "block" : "inline", color: i === 1 ? cs.primary : "inherit" }}>
                {word}{" "}
              </span>
            ))}
          </h1>
          
          <div style={{ width: "4rem", height: "4px", backgroundColor: cs.primary, marginBottom: "2rem" }} />
          
          {section.subheadline && (
            <p style={{ fontSize: "1.25rem", lineHeight: 1.6, color: "#444", marginBottom: "1rem", maxWidth: "520px", fontWeight: 500 }}>{section.subheadline}</p>
          )}
          {section.content && (
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#777", marginBottom: "3rem", maxWidth: "480px" }}>{section.content}</p>
          )}
          
          <div className="flex flex-wrap gap-5">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: "#0a0a0a", color: "#fff", padding: "1.25rem 3rem", fontSize: "0.95rem", fontWeight: 700, borderRadius: "0px", display: "inline-flex", alignItems: "center", gap: "0.75rem", transition: "transform 0.3s ease" }} 
                className="hover:scale-105 shadow-2xl">
                {section.ctaText} <ArrowRight className="h-5 w-5" />
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: "2px solid #0a0a0a", color: "#0a0a0a", padding: "1.25rem 3rem", fontSize: "0.95rem", fontWeight: 700, backgroundColor: "transparent" }} 
                className="hover:bg-black hover:text-white transition-all">
                Website aktivieren
              </button>
            )}
          </div>
        </div>

        {/* Right - Image (Editorial style) */}
        <div className="lg:col-span-5 relative h-full min-h-[600px] hidden lg:flex items-center">
          <div style={{ 
            position: "absolute", 
            left: "-10%", 
            top: "15%", 
            bottom: "15%", 
            right: "0", 
            backgroundColor: "#f8f8f8", 
            zIndex: 0 
          }} />
          <div className="premium-shadow-lg" style={{ position: "relative", zIndex: 1, width: "100%", height: "80%", overflow: "hidden" }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} className="hover:scale-110 transition-transform duration-1000" />
          </div>
          {/* Floating badge */}
          <div className="glass-card premium-shadow" style={{ position: "absolute", bottom: "20%", left: "-20%", padding: "2rem", zIndex: 30, maxWidth: "240px" }}>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />)}
            </div>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0a0a0a", lineHeight: 1.4 }}>"Die beste Entscheidung für unser Business."</p>
            <p style={{ fontSize: "0.7rem", color: "#888", marginTop: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Top Bewertung</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModernAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: "#fcfcfc", padding: "10rem 0", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-6 relative">
            <div style={{ 
              position: "absolute", 
              top: "-10%", 
              left: "-10%", 
              width: "100%", 
              height: "100%", 
              border: `1px solid ${cs.primary}20`, 
              zIndex: 0 
            }} />
            <div className="premium-shadow-lg" style={{ position: "relative", zIndex: 1 }}>
              <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }} />
            </div>
            {/* Big background number */}
            <div style={{ 
              position: "absolute", 
              bottom: "-15%", 
              right: "-10%", 
              fontSize: "12rem", 
              fontWeight: 900, 
              color: `${cs.primary}08`, 
              fontFamily: "sans-serif",
              lineHeight: 1,
              zIndex: 0
            }}>01</div>
          </div>
          
          <div className="lg:col-span-6">
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 800, display: "block", marginBottom: "1.5rem" }}>Über unser Team</span>
            <h2 data-reveal style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "2.5rem", lineHeight: 1 }}>{section.headline}</h2>
            
            <div className="space-y-8">
              {section.subheadline && (
                <div className="flex gap-6">
                  <div style={{ width: "2px", height: "auto", backgroundColor: cs.primary }} />
                  <p style={{ fontSize: "1.2rem", lineHeight: 1.6, color: "#333", fontWeight: 500 }}>{section.subheadline}</p>
                </div>
              )}
              {section.content && (
                <p style={{ fontSize: "1rem", lineHeight: 1.9, color: "#666" }}>{section.content}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div>
                <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0a0a0a", marginBottom: "0.25rem" }}>15+</p>
                <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Jahre Erfahrung</p>
              </div>
              <div>
                <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0a0a0a", marginBottom: "0.25rem" }}>100%</p>
                <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Leidenschaft</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModernServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#fff", padding: "10rem 0" }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 800, display: "block", marginBottom: "1rem" }}>Was wir bieten</span>
            <h2 data-reveal style={{ fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", lineHeight: 1 }}>{section.headline}</h2>
          </div>
          <div style={{ paddingBottom: "0.5rem" }}>
            <a href="#kontakt" style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0a0a0a", borderBottom: `2px solid ${cs.primary}`, paddingBottom: "4px" }} className="hover:opacity-60 transition-opacity">
              Alle Leistungen ansehen
            </a>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item, i) => (
            <div key={i} className="group premium-shadow transition-all duration-500 hover:-translate-y-2" style={{ backgroundColor: "#fff", padding: "3.5rem 2.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ 
                position: "absolute", 
                top: "0", 
                right: "0", 
                width: "4rem", 
                height: "4rem", 
                backgroundColor: `${cs.primary}08`, 
                clipPath: "polygon(100% 0, 0 0, 100% 100%)" 
              }} />
              
              <div style={{ 
                width: "3.5rem", 
                height: "3.5rem", 
                backgroundColor: `${cs.primary}10`, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "2rem",
                borderRadius: "0px"
              }} className="group-hover:bg-black transition-colors duration-300">
                <Zap className="h-6 w-6 group-hover:text-white transition-colors" style={{ color: cs.primary }} />
              </div>
              
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0a0a0a", marginBottom: "1rem" }}>{item.title}</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#666", marginBottom: "2rem" }}>{item.description}</p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 800, color: "#0a0a0a", textTransform: "uppercase", letterSpacing: "0.05em" }} className="opacity-40 group-hover:opacity-100 transition-opacity">
                <span>Details</span> <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModernMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories: Record<string, any[]> = {};
  items.forEach(item => {
    const cat = (item as any).category || "Allgemein";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  return (
    <section data-section="menu" style={{ backgroundColor: "#0a0a0a", color: "#fff", padding: "7rem 0" }}>
      <div className="max-w-5xl mx-auto px-8">
        <div className="mb-16">
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "1rem" }}>Speisekarte</span>
          <h2 data-reveal data-delay="100" style={{ fontSize: "clamp(2rem, 3.5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          {Object.entries(categories).map(([catName, catItems], idx) => (
            <div key={idx}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginBottom: "2rem", borderLeft: `4px solid ${cs.primary}`, paddingLeft: "1rem" }}>{catName}</h3>
              <div className="space-y-8">
                {catItems.map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-baseline gap-4 mb-1">
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>{item.title}</h4>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: cs.primary }}>{item.price}</span>
                    </div>
                    {item.description && <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "rgba(255,255,255,0.5)" }}>{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModernPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories: Record<string, any[]> = {};
  items.forEach(item => {
    const cat = (item as any).category || "Preise";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  return (
    <section data-section="pricelist" style={{ backgroundColor: "#f8f8f8", padding: "7rem 0" }}>
      <div className="max-w-4xl mx-auto px-8">
        <div className="mb-16 text-center">
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 700, display: "block", marginBottom: "1rem" }}>Preise</span>
          <h2 data-reveal data-delay="100" style={{ fontSize: "clamp(2rem, 3.5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a" }}>{section.headline}</h2>
        </div>
        <div className="space-y-16">
          {Object.entries(categories).map(([catName, catItems], idx) => (
            <div key={idx}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", marginBottom: "2rem", textAlign: "center" }}>{catName}</h3>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {catItems.map((item, i) => (
                  <div key={i} className={`flex justify-between items-center px-8 py-5 ${i !== catItems.length - 1 ? 'border-bottom: 1px solid #f5f5f5' : ''}`}>
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: "#0a0a0a" }}>{item.title}</span>
                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--site-primary-on-surface)" }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModernGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: "#fff", padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16">
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>Galerie</span>
          <h2 data-reveal data-delay="100" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", lineHeight: 1.05 }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "1/1", overflow: "hidden" }} className="group">
              <img src={`https://images.unsplash.com/photo-${1497366216548 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} className="group-hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModernTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const featured = items[0];
  const rest = items.slice(1);
  return (
    <section data-section="testimonials" style={{ backgroundColor: "#0a0a0a", padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-8">
        <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 700, display: "block", marginBottom: "3rem" }}>Was Kunden sagen</span>
        {featured && (
          <div style={{ marginBottom: "4rem" }}>
            <p style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 700, lineHeight: 1.3, color: "#fff", letterSpacing: "-0.02em", maxWidth: "800px", marginBottom: "2rem" }}>
              "{featured.description || featured.title}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "3rem", height: "3rem", backgroundColor: cs.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff" }}>{(featured.author || "K")[0]}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{featured.author || "Kunde"}</p>
                <div style={{ display: "flex", gap: "2px", marginTop: "2px" }}>
                  {Array.from({ length: featured.rating || 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5" style={{ fill: cs.primary, color: "var(--site-primary-on-surface)" }} />)}
                </div>
              </div>
            </div>
          </div>
        )}
        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "3rem" }}>
            {rest.map((item, i) => (
              <div key={i} style={{ padding: "2rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{item.author || "Kunde"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ModernFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#fff", padding: "7rem 0" }}>
      <div className="max-w-4xl mx-auto px-8">
        <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>FAQ</span>
        <h2 data-reveal data-delay="200" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "3rem", lineHeight: 1.05 }}>{section.headline}</h2>
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.01em" }}>{item.question || item.title}</span>
                <div style={{ width: "2rem", height: "2rem", backgroundColor: open === i ? "#0a0a0a" : "#f5f5f5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background-color 0.2s" }}>
                  {open === i ? <ChevronUp className="h-4 w-4" style={{ color: "#fff" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#666" }} />}
                </div>
              </button>
              {open === i && (
                <div style={{ paddingBottom: "1.5rem", fontSize: "0.95rem", lineHeight: 1.7, color: "#666" }}>
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

function ModernCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.05 }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", marginTop: "0.75rem" }}>{section.content}</p>}
        </div>
        <div style={{ display: "flex", gap: "1rem", flexShrink: 0, flexWrap: "wrap" }}>
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#fff", color: "var(--site-primary-on-white)", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: 800, letterSpacing: "-0.01em", display: "inline-flex", alignItems: "center", gap: "0.5rem" }} className="hover:opacity-80 transition-opacity">
              {section.ctaText} <ArrowRight className="h-4 w-4" />
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: "2px solid rgba(255,255,255,0.4)", color: "#fff", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:border-white transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ModernContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.surface, padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20">
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>Kontakt</span>
          <h2 data-reveal data-delay="300" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "2rem", lineHeight: 1.05 }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#666", marginBottom: "2.5rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Phone className="h-5 w-5" style={{ color: "var(--site-primary-on-surface)" }} /><a href={`tel:${phone}`} style={{ color: "#0a0a0a", fontSize: "1rem", fontWeight: 700 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><MapPin className="h-5 w-5 mt-0.5" style={{ color: "var(--site-primary-on-surface)" }} /><span style={{ color: "#555", fontSize: "0.95rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Mail className="h-5 w-5" style={{ color: "var(--site-primary-on-surface)" }} /><a href={`mailto:${email}`} style={{ color: "#0a0a0a", fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><Clock className="h-5 w-5 mt-0.5" style={{ color: "var(--site-primary-on-surface)" }} /><div>{hours.map((h, i) => <p key={i} style={{ color: "#555", fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", padding: "3rem" }}>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input type="text" placeholder="Name" style={{ backgroundColor: "#f8f8f8", border: "none", borderBottom: "2px solid #f0f0f0", padding: "0.85rem 0", color: "#0a0a0a", fontSize: "0.95rem", outline: "none" }} onFocus={e => (e.target.style.borderBottomColor = cs.primary)} onBlur={e => (e.target.style.borderBottomColor = "#f0f0f0")} />
            <input type="email" placeholder="E-Mail" style={{ backgroundColor: "#f8f8f8", border: "none", borderBottom: "2px solid #f0f0f0", padding: "0.85rem 0", color: "#0a0a0a", fontSize: "0.95rem", outline: "none" }} onFocus={e => (e.target.style.borderBottomColor = cs.primary)} onBlur={e => (e.target.style.borderBottomColor = "#f0f0f0")} />
            <textarea placeholder="Nachricht" rows={4} style={{ backgroundColor: "#f8f8f8", border: "none", borderBottom: "2px solid #f0f0f0", padding: "0.85rem 0", color: "#0a0a0a", fontSize: "0.95rem", outline: "none", resize: "vertical" }} onFocus={e => (e.target.style.borderBottomColor = cs.primary)} onBlur={e => (e.target.style.borderBottomColor = "#f0f0f0")} />
            <button type="submit" style={{ backgroundColor: "#0a0a0a", color: "#fff", padding: "1rem", fontSize: "0.9rem", fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "-0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} className="hover:opacity-80 transition-opacity">
              Senden <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ModernFooter({ websiteData, cs, slug }: { websiteData: WebsiteData; cs: ColorScheme; slug?: string | null }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: "#0a0a0a", padding: "2.5rem 0" }}>
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.3)" }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.2)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href={slug ? `/site/${slug}/${l.toLowerCase()}` : "#"} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

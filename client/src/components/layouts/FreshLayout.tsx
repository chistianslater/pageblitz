/**
 * FRESH Layout – Café, Bakery, Organic Shop, Wellness, Florist
 * Inspired by: Brew & Bloom template (light bg, blue accents, illustrated icons, scattered elements)
 * Typography: Playfair Display (headlines) + Nunito (body)
 * Feel: Warm, artisanal, handcrafted, inviting, playful
 * Structure: Centered hero with decorative elements, blue feature block, mosaic gallery, card services
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Heart, Coffee, Leaf, Sun, Zap, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";

const SERIF = "var(--site-font-headline, 'Plus Jakarta Sans', sans-serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Plus Jakarta Sans', sans-serif))";
const SANS = "var(--site-font-body, 'Instrument Sans', 'Inter', sans-serif)";

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

export default function FreshLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
}: Props) {
  useScrollReveal();
  const isDarkSurface = !!((cs.surface || "").match(/^#(?:[0-9a-f]{3}){1,2}$/i) && 
    (() => {
      const hex = cs.surface.replace("#", "");
      const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
      const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
      const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
    })());

  const surfaceText = isDarkSurface ? "#ffffff" : cs.text;
  const surfaceTextMuted = isDarkSurface ? "rgba(255,255,255,0.7)" : "#666";

  return (
    <div style={{ fontFamily: ROUND, backgroundColor: "#fafaf8", color: cs.text }}>
      <FreshNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <FreshHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <FreshAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} />}
          {section.type === "gallery" && <FreshGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <FreshServices section={section} cs={cs} />}
          {section.type === "menu" && <FreshMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <FreshPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <FreshTestimonials section={section} cs={cs} isDark={isDarkSurface} />}
          {section.type === "faq" && <FreshFAQ section={section} cs={cs} isDark={isDarkSurface} />}
                    {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <FreshContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} isDark={isDarkSurface} />
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
          {section.type === "cta" && <FreshCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <FreshFooter websiteData={websiteData} cs={cs} slug={slug} />
    </div>
  );
}

function FreshNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: "#fafaf8", borderBottom: "1px solid #e8e8e4", fontFamily: ROUND }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", fontWeight: 700, color: cs.text }}>{websiteData.businessName}</span>}
          {websiteData.tagline && <span style={{ fontSize: "0.65rem", color: cs.primary, letterSpacing: "0.1em", fontWeight: 600 }}>{websiteData.tagline.slice(0, 35)}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Angebot", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600 }} className="hover:text-black transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.55rem 1.25rem", fontSize: "0.8rem", borderRadius: "2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }} className="btn-premium transition-opacity">
            <Phone className="h-3.5 w-3.5" /> Reservieren
          </a>
        )}
      </div>
    </nav>
  );
}

function FreshHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ backgroundColor: "#fafaf8", padding: "8rem 0 4rem", overflow: "hidden", position: "relative" }}>
      {/* Playful background blobs */}
      <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "30vw", height: "30vw", backgroundColor: `${cs.primary}08`, borderRadius: "50%", filter: "blur(60px)", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "20vw", height: "20vw", backgroundColor: `${cs.secondary || cs.primary}05`, borderRadius: "50%", filter: "blur(40px)", zIndex: 0 }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }} className="hero-animate-badge">
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sun className="h-5 w-5" style={{ color: cs.primary }} />
              </div>
              <span style={{ fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>{websiteData.tagline?.split(" ")[0] || "Fresh"} & Local</span>
            </div>

            <h1 style={{ 
              fontFamily: SERIF, 
              fontSize: "clamp(3.5rem, 7vw, 6rem)", 
              fontWeight: 700, 
              color: cs.text, 
              lineHeight: 1.05, 
              letterSpacing: "-0.02em", 
              marginBottom: "2.5rem" 
            }} className="hero-animate-headline">
              {section.headline?.split(" ").map((word, i) => (
                <span key={i} style={{ display: i === 1 ? "block" : "inline", fontStyle: i === 1 ? "italic" : "normal", color: i === 1 ? cs.primary : "inherit" }}>
                  {word}{" "}
                </span>
              ))}
            </h1>

            <div style={{ display: "flex", gap: "2rem", marginBottom: "3.5rem" }} className="hero-animate-sub">
              <div className="max-w-md">
                {section.subheadline && <p style={{ fontSize: "1.2rem", color: "#444", lineHeight: 1.6, marginBottom: "1rem", fontWeight: 500 }}>{section.subheadline}</p>}
                {section.content && <p style={{ fontSize: "1rem", color: "#777", lineHeight: 1.8 }}>{section.content}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 hero-animate-cta">
              {section.ctaText && (
                <a href={section.ctaLink || "#kontakt"} 
                  style={{ backgroundColor: cs.text, color: "#fff", padding: "1.25rem 3.5rem", fontSize: "0.9rem", borderRadius: "100px", fontWeight: 800, transition: "all 0.4s ease" }} 
                  className="hover:scale-105 shadow-xl">
                  {section.ctaText}
                </a>
              )}
              {showActivateButton && (
                <button onClick={onActivate} 
                  style={{ border: `2px solid ${cs.text}`, color: cs.text, padding: "1.25rem 3.5rem", fontSize: "0.9rem", borderRadius: "100px", fontWeight: 700, backgroundColor: "transparent" }} 
                  className="hover:bg-black hover:text-white transition-all">
                  Website aktivieren
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative py-12 lg:py-0">
            <div style={{ position: "absolute", top: "10%", right: "-10%", bottom: "10%", left: "10%", backgroundColor: "#fff", borderRadius: "2rem", zIndex: 0 }} />
            <div className="premium-shadow-lg relative z-10 overflow-hidden" style={{ borderRadius: "2rem" }}>
              <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }} className="hover:scale-105 transition-transform duration-1000" />
            </div>
            
            {/* Scatted decorative element */}
            <div className="floating-element" style={{ position: "absolute", top: "-2rem", right: "2rem", zIndex: 20 }}>
              <div style={{ width: "4rem", height: "4rem", backgroundColor: cs.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(15deg)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FreshAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: cs.background, padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-24 items-center">
        <div className="lg:col-span-5 relative order-2 lg:order-1">
          <div style={{ position: "absolute", inset: "-1rem", border: `1px solid ${cs.primary}20`, borderRadius: "2rem", zIndex: 0 }} />
          <div className="premium-shadow-lg relative z-10 overflow-hidden" style={{ borderRadius: "2rem" }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
          </div>
        </div>
        
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Unsere Philosophie</span>
            <div style={{ width: "3rem", height: "1px", backgroundColor: `${cs.primary}40` }} />
          </div>
          
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 700, color: cs.onBackground, marginBottom: "2.5rem", lineHeight: 1.1 }}>{section.headline}</h2>
          
          <p style={{ fontSize: "1.15rem", lineHeight: 1.8, color: cs.onBackground, marginBottom: "2.5rem", fontWeight: 500, opacity: 0.9 }}>{section.subheadline}</p>
          <p style={{ fontSize: "1rem", lineHeight: 1.9, color: cs.onBackground, marginBottom: "3.5rem", opacity: 0.7 }}>{section.content}</p>
          
          <div className="grid grid-cols-2 gap-10">
            {[{ icon: Heart, label: "Mit Liebe" }, { icon: Leaf, label: "Nachhaltig" }].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-4">
                <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: `${cs.primary}10`, borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon className="h-6 w-6" style={{ color: cs.primary }} />
                </div>
                <span style={{ fontSize: "0.9rem", color: cs.text, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FreshServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: "#fafaf8", padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <span style={{ fontSize: "0.8rem", letterSpacing: "0.4em", textTransform: "uppercase", color: cs.primary, fontWeight: 800, display: "block", marginBottom: "1.5rem" }}>{section.subheadline || "Unser Angebot"}</span>
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 700, color: cs.text, lineHeight: 1.1 }}>
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ display: i === 2 ? "block" : "inline", fontStyle: i === 2 ? "italic" : "normal", color: i === 2 ? cs.primary : "inherit" }}>
                {word}{" "}
              </span>
            )) || "Handwerk trifft Inspiration."}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item, i) => (
            <div key={i} className="group premium-shadow transition-all duration-500 hover:-translate-y-2" style={{ backgroundColor: "#fff", borderRadius: "2rem", padding: "4rem 3rem", position: "relative" }}>
              <div style={{ 
                width: "4rem", 
                height: "4rem", 
                backgroundColor: `${cs.primary}10`, 
                borderRadius: "1.25rem", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "2.5rem",
                transition: "all 0.3s ease" 
              }} className="group-hover:bg-slate-900 group-hover:rotate-6">
                <Coffee className="h-7 w-7 group-hover:text-white transition-colors" style={{ color: cs.primary }} />
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 700, color: cs.text, marginBottom: "1.25rem" }}>{item.title}</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#666", marginBottom: "2rem" }}>{item.description}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em" }} className="opacity-0 group-hover:opacity-100 transition-all">
                Details <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FreshGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: "#fafaf8", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Inspirationen</span>
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: cs.text }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {items.map((item, i) => (
            <div key={i} style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: i % 2 === 0 ? "3/4" : "1/1", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", backgroundColor: cs.surface }}>
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1495474472287 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FreshTestimonials({ section, cs, isDark }: { section: WebsiteSection; cs: ColorScheme; isDark?: boolean }) {
  const items = section.items || [];
  const textColor = cs.onSurface;
  const subColor = cs.primary;

  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: subColor, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Was unsere Gäste sagen</span>
          <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: textColor }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.05)" : "#fff", padding: "2rem", borderRadius: "1rem", boxShadow: cs.onSurface === "#ffffff" ? "none" : "0 2px 12px rgba(0,0,0,0.06)", border: cs.onSurface === "#ffffff" ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4" style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                ))}
              </div>
              <p style={{ fontFamily: SERIF, fontSize: "0.95rem", lineHeight: 1.7, color: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.9)" : "#444", marginBottom: "1.25rem", fontStyle: "italic" }}>{item.description || item.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.1)" : `${cs.primary}20`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 700, color: cs.onSurface === "#ffffff" ? "#fff" : cs.primary }}>{(item.author || "K")[0]}</span>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: textColor }}>{item.author || "Gast"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FreshFAQ({ section, cs, isDark }: { section: WebsiteSection; cs: ColorScheme; isDark?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  const textColor = cs.onSurface;
  const subColor = cs.primary;

  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-3xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: subColor, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Häufige Fragen</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: textColor }}>{section.headline}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.05)" : "#fff", borderRadius: "0.75rem", border: cs.onSurface === "#ffffff" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e8e8e4", overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: textColor }}>{item.question || item.title}</span>
                <div style={{ width: "1.75rem", height: "1.75rem", backgroundColor: open === i ? cs.primary : (cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.1)" : "#f5f5f0"), borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background-color 0.2s" }}>
                  {open === i ? <ChevronUp className="h-4 w-4" style={{ color: cs.onPrimary }} /> : <ChevronDown className="h-4 w-4" style={{ color: cs.onSurface === "#ffffff" ? "#fff" : "#666" }} />}
                </div>
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", fontSize: "0.9rem", lineHeight: 1.7, color: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.7)" : "#666" }}>
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

function FreshCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.text, padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, color: cs.onBackground, marginBottom: "1.25rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: cs.onBackground === "#ffffff" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", marginBottom: "2.5rem" }}>{section.content}</p>}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1rem 3rem", fontSize: "0.9rem", borderRadius: "2rem", fontWeight: 700 }} className="btn-premium transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: `2px solid ${cs.onBackground === "#ffffff" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}`, color: cs.onBackground, padding: "1rem 3rem", fontSize: "0.9rem", borderRadius: "2rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:border-white transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function FreshMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: "#fafaf8", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: `${cs.primary}15`, padding: "0.4rem 1.25rem", borderRadius: "2rem", marginBottom: "1.5rem" }}>
            <Coffee className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--site-primary-on-surface)", fontWeight: 700 }}>Frisch & Hausgemacht</span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: cs.text, lineHeight: 1.15 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-[#e8e8e4] shadow-sm">
                <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 700, color: cs.text, marginBottom: "2rem", borderBottom: `2px solid ${cs.primary}30`, display: "inline-block", paddingBottom: "0.5rem" }}>{cat}</h3>
                <div className="space-y-6">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-4 mb-1">
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: cs.text }}>{item.title}</h4>
                        <div className="flex-1 border-b border-dotted border-[#e8e8e4] mx-2" />
                        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary-on-surface)" }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6 }}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 bg-white p-10 rounded-2xl border border-[#e8e8e4] shadow-sm">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline gap-4 mb-1">
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: cs.text }}>{item.title}</h4>
                  <div className="flex-1 border-b border-dotted border-[#e8e8e4] mx-2" />
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary-on-surface)" }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6 }}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FreshPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: cs.primary, padding: "0.4rem 1.25rem", borderRadius: "2rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--site-nav-text)", fontWeight: 700 }}>Angebot & Preise</span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: cs.text, lineHeight: 1.15 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 700, color: cs.text, marginBottom: "2rem", textAlign: "center" }}>{cat}</h3>
                <div className="bg-white rounded-2xl border border-[#e8e8e4] overflow-hidden shadow-sm">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center px-6 py-4 border-b border-[#e8e8e4] last:border-0 hover:bg-[#fafaf8] transition-colors">
                      <span style={{ fontSize: "1rem", color: cs.text, fontWeight: 600 }}>{item.title}</span>
                      <span style={{ fontSize: "1.1rem", color: "var(--site-primary-on-surface)", fontWeight: 800 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e8e8e4] overflow-hidden shadow-sm">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center px-8 py-5 border-b border-[#e8e8e4] last:border-0 hover:bg-[#fafaf8] transition-colors">
                <span style={{ fontSize: "1.1rem", color: cs.text, fontWeight: 700 }}>{item.title}</span>
                <span style={{ fontSize: "1.2rem", color: "var(--site-primary-on-surface)", fontWeight: 800 }}>{item.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FreshContact({ section, cs, phone, address, email, hours, isDark }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[]; isDark?: boolean }) {
  const textColor = cs.onSurface;
  const subColor = cs.primary;
  const mutedColor = cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.6)" : "#666";
  const iconBg = cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.1)" : `${cs.primary}15`;

  return (
    <section id="kontakt" style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: subColor, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Kontakt</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: textColor, marginBottom: "2rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: mutedColor, marginBottom: "2rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: iconBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone className="h-4 w-4" style={{ color: cs.primary }} /></div><a href={`tel:${phone}`} style={{ color: textColor, fontSize: "1rem", fontWeight: 600 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: iconBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MapPin className="h-4 w-4" style={{ color: cs.primary }} /></div><span style={{ color: mutedColor, fontSize: "0.95rem", marginTop: "0.5rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: iconBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail className="h-4 w-4" style={{ color: cs.primary }} /></div><a href={`mailto:${email}`} style={{ color: textColor, fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: iconBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Clock className="h-4 w-4" style={{ color: cs.primary }} /></div><div style={{ marginTop: "0.5rem" }}>{hours.map((h, i) => <p key={i} style={{ color: mutedColor, fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.05)" : "#fff", padding: "2.5rem", borderRadius: "1rem", boxShadow: cs.onSurface === "#ffffff" ? "none" : "0 4px 20px rgba(0,0,0,0.08)", border: cs.onSurface === "#ffffff" ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: textColor, marginBottom: "1.5rem" }}>Schreiben Sie uns</h3>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input type="text" placeholder="Ihr Name" style={{ backgroundColor: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.1)" : "#f5f5f0", border: cs.onSurface === "#ffffff" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e8e8e4", padding: "0.85rem 1rem", color: textColor, fontSize: "0.9rem", outline: "none", borderRadius: "0.5rem" }} />
            <input type="email" placeholder="Ihre E-Mail" style={{ backgroundColor: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.1)" : "#f5f5f0", border: cs.onSurface === "#ffffff" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e8e8e4", padding: "0.85rem 1rem", color: textColor, fontSize: "0.9rem", outline: "none", borderRadius: "0.5rem" }} />
            <textarea placeholder="Ihre Nachricht" rows={4} style={{ backgroundColor: cs.onSurface === "#ffffff" ? "rgba(255,255,255,0.1)" : "#f5f5f0", border: cs.onSurface === "#ffffff" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e8e8e4", padding: "0.85rem 1rem", color: textColor, fontSize: "0.9rem", outline: "none", resize: "none", borderRadius: "0.5rem" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1rem", fontSize: "0.9rem", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: "0.5rem" }} className="hover:opacity-90 transition-opacity">
              {section.ctaText || "Nachricht senden"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function FreshFooter({ websiteData, cs, slug }: { websiteData: WebsiteData; cs: ColorScheme; slug?: string | null }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: "#111111", padding: "2.5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href={slug ? `/site/${slug}/${l.toLowerCase()}` : "#"} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

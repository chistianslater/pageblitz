/**
 * ELEGANT Layout – Beauty, Friseur, Spa, Nail Studio
 * Typography: Cormorant Garamond (serif headlines) + Jost (body)
 * Feel: Luxurious, airy, feminine, editorial
 * Structure: Split hero, large imagery, generous whitespace, gold accents
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Scissors, Heart, Sparkles, Instagram, Quote } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const SERIF = "var(--site-font-headline, 'Cormorant Garamond', Georgia, serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Cormorant Garamond', Georgia, serif))";
const SANS = "var(--site-font-body, 'Jost', 'Inter', sans-serif)";

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

export default function ElegantLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: SANS, backgroundColor: cs.background, color: cs.text }}>
      <ElegantNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
        {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <ElegantHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <ElegantAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} businessCategory={businessCategory} />}
          {section.type === "gallery" && <ElegantGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <ElegantServices section={section} cs={cs} />}
          {section.type === "menu" && <ElegantMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <ElegantPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <ElegantTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <ElegantFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <ElegantContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <ElegantCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <ElegantFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function ElegantNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  const navRef = useRef<HTMLElement>(null);
  useNavbarScroll(navRef);
  return (
    <nav data-section="header" ref={navRef} style={{ backgroundColor: cs.background, borderBottom: `1px solid ${cs.primary}22`, fontFamily: SANS }} className="sticky top-0 z-50 backdrop-blur-md bg-opacity-95 hero-animate-nav transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex flex-col">
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.5rem", fontWeight: 600, letterSpacing: "0.05em", color: cs.text }}>{websiteData.businessName}</span>}
          {websiteData.tagline && <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 500 }}>{websiteData.tagline.split(" ").slice(0, 4).join(" ")}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.textLight, fontWeight: 500 }} className="hover:opacity-60 transition-opacity">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ fontSize: "0.8rem", color: cs.primary, letterSpacing: "0.05em", fontWeight: 500 }} className="hidden sm:flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Phone className="h-3.5 w-3.5" /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function ElegantHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ backgroundColor: "#fdfbf9", minHeight: "100vh", position: "relative", overflow: "hidden" }} className="flex items-center pt-24">
      {/* Organic Background Shape */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "50vw", height: "50vw", background: `radial-gradient(circle, ${cs.primary}08 0%, transparent 70%)`, borderRadius: "50%", zIndex: 0 }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-24 items-center relative z-10 w-full">
        {/* Left: Text Content */}
        <div className="order-2 lg:order-1 max-w-xl">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }} className="hero-animate-badge">
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Est. 2024</span>
            <div style={{ width: "4rem", height: "1px", backgroundColor: `${cs.primary}40` }} />
          </div>

          <h1 style={{ 
            fontFamily: SERIF, 
            fontSize: "clamp(3.5rem, 6vw, 5.5rem)", 
            fontWeight: 400, 
            lineHeight: 1.05, 
            color: cs.text, 
            marginBottom: "2.5rem", 
            letterSpacing: "-0.01em" 
          }} className="hero-animate-headline">
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ display: i === 2 ? "block" : "inline", fontStyle: i === 2 ? "italic" : "normal" }}>
                {word}{" "}
              </span>
            ))}
          </h1>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }} className="hero-animate-sub">
            <div style={{ width: "2px", backgroundColor: cs.primary, opacity: 0.3 }} />
            <div>
              {section.subheadline && (
                <p style={{ fontFamily: SANS, fontSize: "1.2rem", lineHeight: 1.6, color: "#444", marginBottom: "1rem", fontWeight: 400 }}>{section.subheadline}</p>
              )}
              {section.content && (
                <p style={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.8, color: "#777", fontWeight: 300 }}>{section.content}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-5 hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: cs.text, color: "#fff", padding: "1.25rem 3.5rem", fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, fontFamily: SANS, transition: "all 0.4s ease" }} 
                className="hover:tracking-[0.3em] shadow-xl">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `1px solid #1a1a1a`, color: cs.text, padding: "1.25rem 3.5rem", fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, fontFamily: SANS, backgroundColor: "transparent" }} 
                className="hover:bg-black hover:text-white transition-all">
                Aktivieren
              </button>
            )}
          </div>
        </div>

        {/* Right: Arch Image */}
        <div className="order-1 lg:order-2 relative hero-animate-image">
          <div className="arch-mask premium-shadow-lg" style={{ position: "relative", zIndex: 1, width: "100%", aspectRatio: "3/4" }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} className="hover:scale-110 transition-transform duration-1000" />
          </div>
          {/* Floating accent badge */}
          <div className="glass-card premium-shadow" style={{ position: "absolute", top: "15%", left: "-15%", padding: "2.5rem", zIndex: 30, borderRadius: "50%", width: "180px", height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Sparkles className="h-6 w-6 mb-2" style={{ color: cs.primary }} />
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.text, fontWeight: 800 }}>Premium</span>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>Quality</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ElegantAbout({ section, cs, heroImageUrl, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; businessCategory?: string | null }) {
  const stats = getIndustryStats(businessCategory || "");
  return (
    <section style={{ backgroundColor: "#fff", padding: "10rem 0", position: "relative", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-24 items-center">
          <div className="lg:col-span-5 relative">
            <div className="arch-mask-bottom premium-shadow-lg">
              <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
            </div>
          </div>
          
          <div className="lg:col-span-7">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary }} />
              <span style={{ fontSize: "0.8rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Unsere Philosophie</span>
            </div>
            
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)", fontWeight: 400, color: cs.text, marginBottom: "2.5rem", lineHeight: 1.1, fontStyle: "italic" }}>
              {section.headline}
            </h2>
            
            <p style={{ fontFamily: SANS, fontSize: "1.15rem", lineHeight: 1.8, color: "#444", marginBottom: "2.5rem", fontWeight: 300 }}>
              {section.subheadline}
            </p>
            
            <div className="grid sm:grid-cols-2 gap-12 mt-12 border-t border-slate-100 pt-10">
              {stats.slice(0, 2).map((stat, i) => (
                <div key={i}>
                  <p style={{ fontFamily: SERIF, fontSize: "2.5rem", color: cs.text, fontStyle: "italic", lineHeight: 1, marginBottom: "0.5rem" }}>{stat.n}</p>
                  <p style={{ fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", fontWeight: 600 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ElegantServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: "#fdfbf9", padding: "10rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <span style={{ fontSize: "0.8rem", letterSpacing: "0.4em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "1.5rem" }}>Exquisite Leistungen</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 400, color: cs.text, lineHeight: 1.1 }}>
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ fontStyle: i === (section.headline?.split(" ").length ?? 0) - 1 ? "italic" : "normal" }}>{word} </span>
            )) || "Erschaffen für Ihr Wohlbefinden"}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {items.map((item, i) => (
            <div key={i} 
              className="group text-center"
              style={{ 
                backgroundColor: "transparent", 
                padding: "2rem",
                transition: "all 0.5s ease"
              }}
            >
              <div style={{ 
                width: "4.5rem", 
                height: "6rem", 
                margin: "0 auto 2.5rem", 
                border: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.5s ease"
              }} className="arch-mask group-hover:border-black">
                <Sparkles className="h-6 w-6 transition-colors" style={{ color: cs.primary }} />
              </div>
              
              <h3 style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 400, color: cs.text, marginBottom: "1.25rem", fontStyle: "italic" }}>{item.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: "#666", fontWeight: 300, marginBottom: "2rem" }}>{item.description}</p>
              
              <div style={{ width: "20px", height: "1px", backgroundColor: cs.primary, margin: "0 auto" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ElegantGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: cs.background, padding: "7rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>Galerie</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: cs.text, fontStyle: "italic" }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "1/1", overflow: "hidden", border: `1px solid ${cs.primary}15`, backgroundColor: cs.surface }}>
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1560066984138 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ElegantTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>Stimmen unserer Kunden</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: cs.text, fontStyle: "italic" }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} style={{ padding: "2.5rem", border: `1px solid ${cs.primary}20`, position: "relative" }}>
              <Quote className="h-8 w-8 mb-4" style={{ color: `${cs.primary}40` }} />
              <p style={{ fontFamily: SERIF, fontSize: "1rem", lineHeight: 1.8, color: cs.text, fontStyle: "italic", marginBottom: "1.5rem" }}>{item.description || item.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SERIF, fontSize: "1rem", color: cs.primary }}>{(item.author || item.title || "K").charAt(0)}</span>
                </div>
                <div>
                  <p style={{ fontFamily: SANS, fontSize: "0.85rem", fontWeight: 600, color: cs.text }}>{item.author || item.title}</p>
                  <div className="flex gap-0.5 mt-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3 w-3 fill-current" style={{ color: cs.primary }} />)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ElegantFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>FAQ</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "2.5rem", fontWeight: 400, color: cs.text, fontStyle: "italic" }}>{section.headline}</h2>
        </div>
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${cs.primary}20` }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left py-5 flex items-center justify-between" style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text, fontWeight: 500 }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} />}
              </button>
              {open === i && <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.8, color: cs.textLight, paddingBottom: "1.25rem", fontWeight: 300 }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ElegantMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.surface, padding: "7rem 0" }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary, margin: "0 auto 2rem" }} />
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1.5rem" }}>
            Exquisite Auswahl
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: cs.text, fontStyle: "italic", lineHeight: 1 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-8">
                <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 400, color: cs.text, fontStyle: "italic", borderBottom: `1px solid ${cs.primary}30`, paddingBottom: "0.75rem", marginBottom: "1.5rem" }}>{cat}</h3>
                <div className="space-y-8">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-4 mb-2">
                        <h4 style={{ fontFamily: SANS, fontSize: "1.05rem", fontWeight: 500, color: cs.text, letterSpacing: "0.02em" }}>{item.title}</h4>
                        <div className="flex-1 border-b border-slate-200 mx-2" />
                        <span style={{ fontFamily: SANS, fontSize: "1.05rem", fontWeight: 600, color: cs.primary }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight, lineHeight: 1.6, fontWeight: 300 }}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-20 gap-y-12">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline gap-4 mb-2">
                  <h4 style={{ fontFamily: SANS, fontSize: "1.05rem", fontWeight: 500, color: cs.text, letterSpacing: "0.02em" }}>{item.title}</h4>
                  <div className="flex-1 border-b border-slate-200 mx-2" />
                  <span style={{ fontFamily: SANS, fontSize: "1.05rem", fontWeight: 600, color: cs.primary }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight, lineHeight: 1.6, fontWeight: 300 }}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ElegantPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "7rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary, margin: "0 auto 2rem" }} />
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: cs.text, fontStyle: "italic", lineHeight: 1 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-16">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 400, color: cs.text, fontStyle: "italic", textAlign: "center", marginBottom: "2.5rem" }}>{cat}</h3>
                <div className="grid gap-4">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-slate-200">
                      <span style={{ fontFamily: SANS, fontSize: "1rem", fontWeight: 400, color: cs.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>{item.title}</span>
                      <span style={{ fontFamily: SANS, fontSize: "1.1rem", fontWeight: 600, color: cs.primary }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: cs.surface, padding: "3rem", border: `1px solid ${cs.primary}20` }}>
            <div className="grid gap-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0">
                  <span style={{ fontFamily: SANS, fontSize: "1rem", fontWeight: 400, color: cs.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>{item.title}</span>
                  <span style={{ fontFamily: SANS, fontSize: "1.1rem", fontWeight: 600, color: cs.primary }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ElegantContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16">
        <div>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>Kontakt</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: cs.text, marginBottom: "2rem", fontStyle: "italic" }}>{section.headline}</h2>
          {section.content && <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: cs.textLight, marginBottom: "2.5rem", fontWeight: 300 }}>{section.content}</p>}
          <div className="space-y-4">
            {phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{phone}</a></div>}
            {address && <div className="flex items-start gap-3"><MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: cs.primary }} /><span style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{address}</span></div>}
            {email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.surface, padding: "3rem" }}>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.5rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <div style={{ borderBottom: `1px solid ${cs.primary}30`, paddingBottom: "0.5rem" }}>
              <input type="text" placeholder="IHR NAME" style={{ width: "100%", backgroundColor: "transparent", border: "none", color: cs.text, fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", outline: "none" }} />
            </div>
            <div style={{ borderBottom: `1px solid ${cs.primary}30`, paddingBottom: "0.5rem" }}>
              <input type="email" placeholder="IHRE E-MAIL-ADRESSE" style={{ width: "100%", backgroundColor: "transparent", border: "none", color: cs.text, fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", outline: "none" }} />
            </div>
            <div style={{ borderBottom: `1px solid ${cs.primary}30`, paddingBottom: "0.5rem" }}>
              <textarea placeholder="IHRE NACHRICHT" rows={4} style={{ width: "100%", backgroundColor: "transparent", border: "none", color: cs.text, fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", outline: "none", resize: "none" }} />
            </div>
            <button type="submit" style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1rem", fontFamily: SANS, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.2em", border: "none", cursor: "pointer", textTransform: "uppercase", marginTop: "1rem" }} className="hover:opacity-90 transition-opacity">
              {section.ctaText || "Senden"}
            </button>
          </form>

          <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 400, color: cs.text, marginBottom: "1.5rem", fontStyle: "italic" }}>Öffnungszeiten</h3>
          {hours.length > 0 ? (
            <div className="space-y-2">
              {hours.map((h, i) => <p key={i} style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight, fontWeight: 300 }}>{h}</p>)}
            </div>
          ) : (
            <div className="space-y-2">
              {["Mo – Fr: 09:00 – 18:00 Uhr", "Sa: 09:00 – 14:00 Uhr", "So: Geschlossen"].map((h, i) => (
                <p key={i} style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight, fontWeight: 300 }}>{h}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ElegantCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0" }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, color: cs.onPrimary, fontStyle: "italic", marginBottom: "1.5rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontFamily: SANS, fontSize: "1rem", color: cs.onPrimary === "#ffffff" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", marginBottom: "2.5rem", fontWeight: 300 }}>{section.content}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.onPrimary, color: cs.primary, padding: "0.9rem 2.5rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, fontFamily: SANS }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: `1px solid ${cs.onPrimary === "#ffffff" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}`, color: cs.onPrimary, padding: "0.9rem 2.5rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500, fontFamily: SANS, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Jetzt aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function ElegantFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: "#111111", padding: "3rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 600, color: "#fff", letterSpacing: "0.05em" }}>{websiteData.businessName}</p>
          <p style={{ fontFamily: SANS, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: `${cs.primary}`, marginTop: "0.25rem" }}>{websiteData.tagline?.split(" ").slice(0, 4).join(" ")}</p>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

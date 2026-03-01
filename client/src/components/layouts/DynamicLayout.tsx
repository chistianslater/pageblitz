/**
 * DYNAMIC Layout – Fitness, Sport, Yoga, Personal Training, Physiotherapie
 * Typography: Bebas Neue (headlines) + Rajdhani (body)
 * Feel: Energetic, motivating, action-oriented, high-performance
 * Structure: Diagonal cuts, full-bleed action photo, bold stats, vibrant accent colors
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Zap, Target, TrendingUp, Flame, Activity, Award, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const HEADING = "var(--site-font-headline, 'Syne', Impact, sans-serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Syne', Impact, sans-serif))";
const BODY = "var(--site-font-body, 'Plus Jakarta Sans', 'Inter', sans-serif)";

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

export default function DynamicLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();

  const darkCs = {
    ...cs,
    background: "#0a0a0a",
    surface: "#141414",
    text: "#ffffff",
    textLight: "rgba(255,255,255,0.65)",
  };

  return (
    <div style={{ fontFamily: BODY, backgroundColor: darkCs.background, color: darkCs.text }}>
      <DynamicNav websiteData={websiteData} cs={darkCs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <DynamicHero section={section} cs={darkCs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <DynamicAbout section={section} cs={darkCs} businessCategory={businessCategory} />}
          {section.type === "gallery" && <DynamicGallery section={section} cs={darkCs} />}
          {(section.type === "services" || section.type === "features") && <DynamicServices section={section} cs={darkCs} />}
          {section.type === "menu" && <DynamicMenu section={section} cs={darkCs} />}
          {section.type === "pricelist" && <DynamicPricelist section={section} cs={darkCs} />}
          {section.type === "testimonials" && <DynamicTestimonials section={section} cs={darkCs} />}
          {section.type === "faq" && <DynamicFAQ section={section} cs={darkCs} />}
          {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <DynamicContact section={section} cs={darkCs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <DynamicCTA section={section} cs={darkCs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <DynamicFooter websiteData={websiteData} cs={darkCs} />
    </div>
  );
}

function DynamicNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: "rgba(10,10,10,0.95)", backdropFilter: "blur(8px)" }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          ) : (
            <>
              <Zap className="h-5 w-5" style={{ color: cs.primary }} />
              <span style={{ fontFamily: LOGO_FONT, fontSize: "1.6rem", letterSpacing: "0.08em", color: "#fff" }}>{websiteData.businessName.toUpperCase()}</span>
            </>
          )}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Training", "Über uns", "Kontakt"].map(label => (
            <a key={label} href="#" style={{ fontFamily: BODY, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontWeight: 600 }} className="hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.6rem 1.25rem", fontFamily: HEADING, fontSize: "1rem", letterSpacing: "0.08em" }} className="hidden sm:flex items-center gap-2 btn-premium transition-opacity">
            <Phone className="h-4 w-4" /> Jetzt starten
          </a>
        )}
      </div>
    </nav>
  );
}

function DynamicHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ backgroundColor: "#050505", minHeight: "100vh", position: "relative", overflow: "hidden" }} className="flex items-center pt-24">
      {/* Tech Grid Background */}
      <div className="grid-pattern absolute inset-0 opacity-20" />
      
      {/* Massive Background Glow */}
      <div 
        className="tech-glow absolute"
        style={{ 
          top: "20%", 
          left: "50%", 
          width: "40vw", 
          height: "40vw", 
          background: cs.primary, 
          opacity: 0.15,
          transform: "translateX(-50%)",
          zIndex: 0 
        }} 
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10 w-full text-center">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 1.25rem", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "3rem" }} className="hero-animate-badge">
          <Zap className="h-4 w-4" style={{ color: cs.primary }} />
          <span style={{ fontFamily: BODY, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", fontWeight: 700 }}>Innovation & Leistung</span>
        </div>

        <h1 style={{ 
          fontFamily: HEADING, 
          fontSize: "clamp(4.5rem, 12vw, 10rem)", 
          fontWeight: 400, 
          lineHeight: 0.8, 
          letterSpacing: "0.02em", 
          color: "#fff", 
          marginBottom: "2.5rem", 
          textTransform: "uppercase" 
        }} className="hero-animate-headline">
          {section.headline?.split(" ").slice(0, 1).join(" ")}
          <br />
          <span style={{ 
            color: cs.primary, 
            background: `linear-gradient(to right, ${cs.primary}, #fff)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 20px ${cs.primary}40)`
          }}>
            {section.headline?.split(" ").slice(1).join(" ") || "JETZT"}
          </span>
        </h1>

        {section.subheadline && (
          <p style={{ fontFamily: BODY, fontSize: "1.25rem", color: "rgba(255,255,255,0.6)", maxWidth: "600px", lineHeight: 1.6, fontWeight: 500, margin: "0 auto 3.5rem auto" }} className="hero-animate-sub">
            {section.subheadline}
          </p>
        )}

        <div className="flex flex-wrap gap-6 justify-center hero-animate-cta">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} 
              style={{ backgroundColor: cs.primary, color: "#fff", padding: "1.25rem 4rem", fontFamily: HEADING, fontSize: "1.3rem", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.4s ease" }} 
              className="hover:scale-105 hover:tracking-[0.2em] shadow-2xl shadow-primary/20">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} 
              style={{ border: `2px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "1.25rem 4rem", fontFamily: HEADING, fontSize: "1.3rem", letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "transparent" }} 
              className="hover:bg-white hover:text-black transition-all">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function DynamicAbout({ section, cs, businessCategory }: { section: WebsiteSection; cs: ColorScheme; businessCategory?: string | null }) {
  const icons = [Target, Award, TrendingUp, Flame];
  const stats = getIndustryStats(businessCategory || "");
  const stats4 = stats.length >= 4 ? stats : [...stats, ...stats].slice(0, 4);
  
  return (
    <section style={{ backgroundColor: "#0a0a0a", padding: "10rem 0", position: "relative" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-24 items-center relative z-10">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <Activity className="h-6 w-6" style={{ color: cs.primary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Vision & Expertise</span>
          </div>
          <h2 data-reveal style={{ fontFamily: HEADING, fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.9, marginBottom: "2.5rem" }}>
            {section.headline}
          </h2>
          <div style={{ width: "80px", height: "4px", backgroundColor: cs.primary, marginBottom: "2.5rem" }} />
          
          <p style={{ fontFamily: BODY, fontSize: "1.15rem", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem", fontWeight: 500 }}>
            {section.subheadline}
          </p>
          <p style={{ fontFamily: BODY, fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.45)" }}>
            {section.content}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6 relative">
          {/* Subtle background glow for stats grid */}
          <div style={{ position: "absolute", top: "20%", left: "20%", right: "20%", bottom: "20%", background: cs.primary, opacity: 0.05, filter: "blur(60px)", zIndex: 0 }} />
          
          {stats4.map(({ n, label: l }, i) => { 
            const Icon = icons[i % icons.length]; 
            return (
              <div key={i} 
                className="group relative z-10"
                style={{ 
                  backgroundColor: i === 0 ? cs.primary : "rgba(255,255,255,0.02)", 
                  padding: "3.5rem 2.5rem", 
                  border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.4s ease"
                }}
              >
                <Icon className="h-8 w-8 mb-4 opacity-40 transition-transform group-hover:scale-110" style={{ color: i === 0 ? "#fff" : cs.primary }} />
                <p style={{ fontFamily: HEADING, fontSize: "3rem", color: i === 0 ? "#fff" : cs.primary, lineHeight: 1, marginBottom: "0.5rem" }}>{n}</p>
                <p style={{ fontFamily: BODY, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)", fontWeight: 700 }}>{l}</p>
              </div>
            ); 
          })}
        </div>
      </div>
    </section>
  );
}

function DynamicServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: "#050505", padding: "10rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <span style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "1.5rem" }}>Leistungsübersicht</span>
            <h2 data-reveal style={{ fontFamily: HEADING, fontSize: "clamp(3rem, 6vw, 6rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.85 }}>
              Was wir für Sie <span style={{ color: cs.primary }}>bewegen</span>
            </h2>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} 
              className="group relative overflow-hidden"
              style={{ 
                backgroundColor: "rgba(255,255,255,0.02)", 
                padding: "4rem 3rem", 
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.5s ease"
              }}
            >
              {/* Animated hover background */}
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${cs.primary}10 0%, transparent 100%)`, opacity: 0, transition: "opacity 0.5s ease" }} className="group-hover:opacity-100" />
              
              <div style={{ position: "absolute", top: "1rem", right: "2rem", fontFamily: HEADING, fontSize: "5rem", color: "rgba(255,255,255,0.03)", lineHeight: 1, pointerEvents: "none" }}>{String(i + 1).padStart(2, "0")}</div>
              
              <div style={{ 
                width: "4rem", 
                height: "4rem", 
                backgroundColor: `${cs.primary}15`, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "2.5rem",
                borderRadius: "2px"
              }} className="group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" style={{ color: cs.primary }} />
              </div>
              
              <h3 style={{ fontFamily: HEADING, fontSize: "1.8rem", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.25rem", position: "relative" }}>{item.title}</h3>
              <p style={{ fontFamily: BODY, fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)", fontWeight: 500, position: "relative" }}>{item.description}</p>
              
              <div style={{ marginTop: "2.5rem", display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.8rem", fontWeight: 700, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.5 }} className="group-hover:opacity-100 group-hover:gap-4 transition-all">
                Details <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DynamicGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: "#0a0a0a", padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <Activity className="h-6 w-6" style={{ color: cs.primary }} />
          <h2 data-reveal data-delay="100" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "1/1", overflow: "hidden", border: `1px solid ${cs.primary}40`, position: "relative", backgroundColor: cs.surface }} className="group">
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1534438327276 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} className="group-hover:scale-105 transition-transform duration-500" />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${cs.primary}40, transparent)`, opacity: 0 }} className="group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DynamicTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <h2 data-reveal data-delay="200" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "2rem", backdropFilter: "blur(4px)" }}>
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current text-yellow-300" />)}</div>
              <p style={{ fontFamily: BODY, fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem", fontWeight: 500 }}>{item.description || item.title}</p>
              <p style={{ fontFamily: HEADING, fontSize: "1rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}>{item.author || item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DynamicFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#111", padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${open === i ? cs.primary : "#333"}`, paddingLeft: "1.5rem", transition: "border-color 0.2s" }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left py-4 flex items-center justify-between" style={{ fontFamily: HEADING, fontSize: "1.1rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />}
              </button>
              {open === i && <p style={{ fontFamily: BODY, fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", paddingBottom: "1rem", fontWeight: 500 }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DynamicMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: "#0a0a0a", padding: "6rem 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "300px", backgroundColor: `${cs.primary}05`, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "4rem" }}>
          <Flame className="h-8 w-8" style={{ color: cs.primary }} />
          <h2 style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-8">
                <h3 style={{ fontFamily: HEADING, fontSize: "1.8rem", fontWeight: 400, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em", borderLeft: `4px solid ${cs.primary}`, paddingLeft: "1.5rem" }}>{cat}</h3>
                <div className="space-y-6">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="group flex justify-between items-baseline gap-4">
                      <div className="flex-1">
                        <h4 style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                        {item.description && (
                          <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>{item.description}</p>
                        )}
                      </div>
                      <span style={{ fontFamily: HEADING, fontSize: "1.3rem", fontWeight: 400, color: cs.primary }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-8">
            {items.map((item, i) => (
              <div key={i} className="group flex justify-between items-baseline gap-4">
                <div className="flex-1">
                  <h4 style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                  {item.description && (
                    <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>{item.description}</p>
                  )}
                </div>
                <span style={{ fontFamily: HEADING, fontSize: "1.3rem", fontWeight: 400, color: cs.primary }}>{item.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DynamicPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: "#111", padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", border: `1px solid ${cs.primary}`, padding: "0.4rem 1.25rem", marginBottom: "2rem" }}>
            <Activity className="h-4 w-4" style={{ color: cs.primary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Tarife & Optionen</span>
          </div>
          <h2 style={{ fontFamily: HEADING, fontSize: "clamp(3rem, 7vw, 5rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.9 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} style={{ backgroundColor: "#1a1a1a", padding: "2.5rem", borderTop: `4px solid ${cs.primary}` }}>
                <h3 style={{ fontFamily: HEADING, fontSize: "1.5rem", fontWeight: 400, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem", textAlign: "center" }}>{cat}</h3>
                <div className="space-y-4">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span style={{ fontFamily: BODY, fontSize: "1rem", color: "#fff", fontWeight: 600, textTransform: "uppercase" }}>{item.title}</span>
                      <span style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 400, color: cs.primary }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: "#1a1a1a", padding: "3rem", borderTop: `4px solid ${cs.primary}`, maxWidth: "800px", margin: "0 auto" }}>
            <div className="space-y-6">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                  <span style={{ fontFamily: BODY, fontSize: "1.15rem", color: "#fff", fontWeight: 600, textTransform: "uppercase" }}>{item.title}</span>
                  <span style={{ fontFamily: HEADING, fontSize: "1.4rem", fontWeight: 400, color: cs.primary }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function DynamicContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: "#0a0a0a", padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "2rem", lineHeight: 0.95 }}>{section.headline}</h2>
          <div className="space-y-4">
            {phone && <div className="flex items-center gap-3"><div style={{ width: "3rem", height: "3rem", backgroundColor: cs.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Phone className="h-5 w-5 text-white" /></div><a href={`tel:${phone}`} style={{ fontFamily: BODY, fontSize: "1.1rem", color: "#fff", fontWeight: 600 }}>{phone}</a></div>}
            {address && <div className="flex items-start gap-3"><div style={{ width: "3rem", height: "3rem", backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MapPin className="h-5 w-5" style={{ color: cs.primary }} /></div><span style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{address}</span></div>}
            {email && <div className="flex items-center gap-3"><div style={{ width: "3rem", height: "3rem", backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /></div><a href={`mailto:${email}`} style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#111", padding: "2.5rem", borderTop: `4px solid ${cs.primary}` }}>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.5rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input type="text" placeholder="NAME" style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "1rem", color: "#fff", fontFamily: HEADING, fontSize: "0.9rem", letterSpacing: "0.05em", outline: "none" }} />
            <input type="email" placeholder="E-MAIL" style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "1rem", color: "#fff", fontFamily: HEADING, fontSize: "0.9rem", letterSpacing: "0.05em", outline: "none" }} />
            <textarea placeholder="WIE KÖNNEN WIR DIR HELFEN?" rows={4} style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "1rem", color: "#fff", fontFamily: HEADING, fontSize: "0.9rem", letterSpacing: "0.05em", outline: "none", resize: "none" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: "#fff", padding: "1.1rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em", border: "none", cursor: "pointer", textTransform: "uppercase" }} className="hover:opacity-90 transition-opacity">
              {section.ctaText || "Jetzt anfragen"}
            </button>
          </form>

          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" style={{ color: cs.primary }} />
            <h3 style={{ fontFamily: HEADING, fontSize: "1.5rem", color: "#fff", letterSpacing: "0.05em" }}>Trainingszeiten</h3>
          </div>
          <div className="space-y-2">
            {(hours.length > 0 ? hours : ["Mo – Fr: 06:00 – 22:00 Uhr", "Sa – So: 08:00 – 20:00 Uhr"]).map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <div style={{ width: "6px", height: "6px", backgroundColor: cs.primary }} />
                <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DynamicCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: "#111", padding: "5rem 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "600px", height: "600px", borderRadius: "50%", backgroundColor: `${cs.primary}08` }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.95 }}>{section.headline}</h2>
          {section.content && <p style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.6)", marginTop: "1rem", fontWeight: 500 }}>{section.content}</p>}
        </div>
        <div className="flex flex-wrap gap-4 flex-shrink-0">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "1rem 3rem", fontFamily: HEADING, fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase" }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: `2px solid ${cs.primary}`, color: cs.primary, padding: "1rem 3rem", fontFamily: HEADING, fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function DynamicFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: "#000", padding: "2.5rem 0", borderTop: `3px solid ${cs.primary}` }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" style={{ color: cs.primary }} />
          <span style={{ fontFamily: HEADING, fontSize: "1.3rem", color: "#fff", letterSpacing: "0.08em" }}>{websiteData.businessName.toUpperCase()}</span>
        </div>
        <p style={{ fontFamily: BODY, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: BODY, fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

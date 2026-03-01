/**
 * BOLD Layout – Handwerk, Bau, Dachdecker, Elektriker, Sanitär
 * Typography: Space Grotesque (headlines) + Plus Jakarta Sans (body)
 * Feel: Strong, industrial, trustworthy, masculine
 * Structure: Full-bleed dark hero, large numbers, diagonal accents, high contrast
 */
import { useState } from "react";
import { Phone, MapPin, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Wrench, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import { useScrollReveal } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const HEADING = "var(--site-font-headline, 'Space Grotesque', sans-serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Space Grotesque', sans-serif))";
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

export default function BoldLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();

  return (
    <div style={{ fontFamily: BODY, backgroundColor: cs.background, color: cs.onBackground }}>
      <BoldNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <BoldHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} />}
          {section.type === "about" && <BoldAbout section={section} cs={cs} businessCategory={businessCategory} />}
          {section.type === "gallery" && <BoldGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <BoldServices section={section} cs={cs} />}
          {section.type === "menu" && <BoldMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <BoldPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <BoldTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <BoldFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <BoldContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <BoldCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <BoldFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function BoldNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: cs.background, borderBottom: `3px solid ${cs.primary}` }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: "4px", height: "2rem", backgroundColor: cs.primary }} />
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: cs.onBackground }}>{websiteData.businessName}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Angebot", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontFamily: BODY, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", color: cs.onBackground, opacity: 0.7, fontWeight: 600 }} className="hover:text-primary transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.6rem 1.5rem", fontFamily: HEADING, fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.08em" }} className="hidden sm:flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            <Phone className="h-4 w-4" /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function BoldHero({ section, cs, heroImageUrl, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", backgroundColor: cs.onBackground }}>
      {/* Background image with dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.7 }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${cs.onBackground} 30%, transparent 100%)` }} />
      
      {/* Large Decorative Text background */}
      <div style={{ position: "absolute", top: "50%", right: "-5%", transform: "translateY(-50%) rotate(-90deg)", fontSize: "15vw", fontWeight: 900, color: `${cs.background}10`, textTransform: "uppercase", whiteSpace: "nowrap", zIndex: 0, pointerEvents: "none" }}>
        EXCELLENCE
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full">
        <div className="max-w-4xl">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", backgroundColor: cs.primary, padding: "0.6rem 1.5rem", marginBottom: "3rem" }} className="hero-animate-badge">
            <div style={{ width: "8px", height: "8px", backgroundColor: cs.onPrimary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.onPrimary, fontWeight: 800 }}>Mastering the Craft</span>
          </div>

          <h1 style={{ 
            fontFamily: HEADING, 
            fontSize: "clamp(4rem, 10vw, 8.5rem)", 
            fontWeight: 700, 
            lineHeight: 0.85, 
            color: cs.background, 
            textTransform: "uppercase", 
            letterSpacing: "-0.02em", 
            marginBottom: "3rem" 
          }} className="hero-animate-headline">
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ display: "block", color: i === 1 ? cs.primary : cs.background }}>{word}</span>
            ))}
          </h1>

          <div style={{ display: "flex", gap: "3rem", marginBottom: "4rem" }} className="hero-animate-sub">
            <div style={{ width: "4px", backgroundColor: cs.primary }} />
            <p style={{ fontFamily: BODY, fontSize: "1.3rem", color: cs.background, opacity: 0.8, maxWidth: "550px", lineHeight: 1.6, fontWeight: 500 }}>{section.subheadline}</p>
          </div>

          <div className="flex flex-wrap gap-6 hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1.5rem 4rem", fontFamily: HEADING, fontSize: "1.3rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.4s ease" }} 
                className="hover:scale-105 hover:bg-primary transition-all shadow-2xl shadow-primary/30">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `2px solid ${cs.background}40`, color: cs.background, padding: "1.5rem 4rem", fontFamily: HEADING, fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "transparent" }} 
                className="hover:bg-primary hover:text-on-primary hover:border-primary transition-all">
                Aktivieren
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "12px", backgroundColor: cs.primary }} />
    </section>
  );
}

function BoldAbout({ section, cs, businessCategory }: { section: WebsiteSection; cs: ColorScheme; businessCategory?: string | null }) {
  const stats = getIndustryStats(businessCategory || "");
  return (
    <section style={{ backgroundColor: cs.background, padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      {/* Background large number */}
      <div style={{ position: "absolute", bottom: "-5%", left: "5%", fontSize: "20rem", fontWeight: 900, color: `${cs.onBackground}05`, lineHeight: 1 }}>01</div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-24 items-center relative z-10">
        <div className="lg:col-span-7">
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ width: "4rem", height: "4px", backgroundColor: cs.primary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.9rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Stärke & Verlässlichkeit</span>
          </div>
          
          <h2 data-reveal style={{ fontFamily: HEADING, fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3rem", lineHeight: 0.95 }}>{section.headline}</h2>
          
          <div className="space-y-8">
            <p style={{ fontFamily: BODY, fontSize: "1.2rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.9, fontWeight: 500 }}>{section.subheadline}</p>
            <p style={{ fontFamily: BODY, fontSize: "1.05rem", lineHeight: 1.8, color: cs.onBackground, opacity: 0.6 }}>{section.content}</p>
          </div>
          
          <div className="flex flex-wrap gap-10 mt-12 pt-12 border-t" style={{ borderColor: `${cs.onBackground}10` }}>
            {["Meisterbetrieb", "Termintreu", "Festpreisgarantie"].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5" style={{ color: cs.primary }} />
                <span style={{ fontFamily: HEADING, fontSize: "1.1rem", color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-5 grid grid-cols-2 gap-6">
          {stats.slice(0, 4).map(({ n, label }, i) => (
            <div key={i} style={{ backgroundColor: i === 0 ? cs.primary : `${cs.onBackground}05`, padding: "3rem 2rem", textAlign: "center", border: i === 0 ? "none" : `1px solid ${cs.onBackground}05` }}>
              <p style={{ fontFamily: HEADING, fontSize: "3.5rem", fontWeight: 700, color: i === 0 ? cs.onPrimary : cs.primary, lineHeight: 1 }}>{n}</p>
              <p style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: i === 0 ? cs.onPrimary : cs.onBackground, opacity: i === 0 ? 0.8 : 0.45, marginTop: "0.5rem", fontWeight: 700 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: cs.onBackground, padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-6 mb-24">
          <div style={{ width: "5rem", height: "12px", backgroundColor: cs.primary }} />
          <h2 data-reveal style={{ fontFamily: HEADING, fontSize: "clamp(3rem, 6vw, 6rem)", fontWeight: 700, color: cs.background, textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.9 }}>
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ color: i === 1 ? cs.primary : "inherit" }}>{word} </span>
            )) || "Unsere Kernkompetenzen"}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="group relative overflow-hidden" style={{ backgroundColor: cs.background, padding: "4rem 3rem", border: `1px solid ${cs.onBackground}10`, transition: "all 0.4s ease" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", backgroundColor: cs.primary, transform: "scaleY(0)", transition: "transform 0.4s ease" }} className="group-hover:scale-y-100" />
              
              <div style={{ position: "absolute", top: "1.5rem", right: "2rem", fontFamily: HEADING, fontSize: "5rem", fontWeight: 900, color: `${cs.onBackground}05`, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
              
              <div style={{ width: "4rem", height: "4rem", backgroundColor: `${cs.onBackground}05`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem", transition: "all 0.3s ease" }} className="group-hover:bg-primary">
                <Wrench className="h-7 w-7 group-hover:text-on-primary transition-colors" style={{ color: cs.primary }} />
              </div>
              
              <h3 style={{ fontFamily: HEADING, fontSize: "1.8rem", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.25rem" }}>{item.title}</h3>
              <p style={{ fontFamily: BODY, fontSize: "1rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.6, fontWeight: 500 }}>{item.description}</p>
              
              <div style={{ marginTop: "3rem", display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.15em" }} className="opacity-0 group-hover:opacity-100 transition-all group-hover:gap-4">
                Details ansehen <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
          <h2 data-reveal data-delay="100" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "1/1", overflow: "hidden", border: `1px solid ${cs.onBackground}10`, backgroundColor: cs.surface }}>
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1510000000000 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(10%) contrast(110%)" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
          <h2 data-reveal data-delay="200" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, padding: "2rem", borderTop: `3px solid ${cs.primary}`, borderLeft: `1px solid ${cs.onBackground}05`, borderRight: `1px solid ${cs.onBackground}05`, borderBottom: `1px solid ${cs.onBackground}05` }}>
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" style={{ color: cs.primary }} />)}</div>
              <p style={{ fontFamily: BODY, fontSize: "0.95rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.75, marginBottom: "1.5rem" }}>{item.description || item.title}</p>
              <p style={{ fontFamily: HEADING, fontSize: "0.9rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.author || item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase" }}>{section.headline}</h2>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.surface }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-4 flex items-center justify-between" style={{ fontFamily: HEADING, fontSize: "1rem", fontWeight: 700, color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.05em", border: "none", background: "none", cursor: "pointer" }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} />}
              </button>
              {open === i && <p style={{ fontFamily: BODY, fontSize: "0.9rem", lineHeight: 1.7, color: cs.onSurface, opacity: 0.7, padding: "0 1.5rem 1.5rem" }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
          <h2 style={{ fontFamily: HEADING, fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-12">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-6">
                <h3 style={{ fontFamily: HEADING, fontSize: "1.5rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `2px solid ${cs.primary}`, display: "inline-block", paddingBottom: "0.25rem", marginBottom: "1rem" }}>{cat}</h3>
                <div className="space-y-6">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between items-baseline gap-4 mb-1">
                        <h4 style={{ fontFamily: HEADING, fontSize: "1.1rem", fontWeight: 800, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                        <div className="flex-1 border-b border-dotted mx-2" style={{ borderColor: `${cs.onBackground}20` }} />
                        <span style={{ fontFamily: HEADING, fontSize: "1.1rem", fontWeight: 800, color: cs.primary }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: cs.onBackground, opacity: 0.5, lineHeight: 1.5 }}>{item.description}</p>
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
              <div key={i} className="group">
                <div className="flex justify-between items-baseline gap-4 mb-1">
                  <h4 style={{ fontFamily: HEADING, fontSize: "1.1rem", fontWeight: 800, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                  <div className="flex-1 border-b border-dotted mx-2" style={{ borderColor: `${cs.onBackground}20` }} />
                  <span style={{ fontFamily: HEADING, fontSize: "1.1rem", fontWeight: 800, color: cs.primary }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: cs.onBackground, opacity: 0.5, lineHeight: 1.5 }}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BoldPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", backgroundColor: cs.primary, padding: "0.4rem 1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: cs.onPrimary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.onPrimary, fontWeight: 700 }}>Unsere Preise</span>
          </div>
          <h2 style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 1 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map((cat, idx) => (
              <div key={idx} style={{ backgroundColor: cs.surface, padding: "2.5rem", borderLeft: `6px solid ${cs.primary}` }}>
                <h3 style={{ fontFamily: HEADING, fontSize: "1.6rem", fontWeight: 800, color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem" }}>{cat}</h3>
                <div className="grid gap-4">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b" style={{ borderColor: `${cs.onSurface}10` }}>
                      <span style={{ fontFamily: HEADING, fontSize: "1.1rem", fontWeight: 700, color: cs.onSurface, textTransform: "uppercase" }}>{item.title}</span>
                      <span style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 800, color: cs.primary }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: cs.surface, padding: "3rem", borderTop: `6px solid ${cs.primary}` }}>
            <div className="grid gap-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b last:border-0" style={{ borderColor: `${cs.onSurface}10` }}>
                  <span style={{ fontFamily: HEADING, fontSize: "1.1rem", fontWeight: 700, color: cs.onSurface, textTransform: "uppercase" }}>{item.title}</span>
                  <span style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 800, color: cs.primary }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BoldContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.onBackground, padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Kontakt</span>
          </div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, color: cs.background, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "2rem", lineHeight: 1.05 }}>{section.headline}</h2>
          <div className="space-y-4">
            {phone && <div className="flex items-center gap-3"><div style={{ backgroundColor: cs.primary, padding: "0.5rem" }}><Phone className="h-4 w-4" style={{ color: cs.onPrimary }} /></div><a href={`tel:${phone}`} style={{ fontFamily: BODY, fontSize: "1.1rem", color: cs.background, fontWeight: 700 }}>{phone}</a></div>}
            {address && <div className="flex items-start gap-3"><div style={{ backgroundColor: cs.primary, padding: "0.5rem", flexShrink: 0 }}><MapPin className="h-4 w-4" style={{ color: cs.onPrimary }} /></div><span style={{ fontFamily: BODY, fontSize: "1rem", color: cs.background, opacity: 0.8 }}>{address}</span></div>}
            {email && <div className="flex items-center gap-3"><div style={{ backgroundColor: cs.primary, padding: "0.5rem" }}><Mail className="h-4 w-4" style={{ color: cs.onPrimary }} /></div><a href={`mailto:${email}`} style={{ fontFamily: BODY, fontSize: "1rem", color: cs.background, opacity: 0.8 }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.background, padding: "2.5rem", borderTop: `4px solid ${cs.primary}`, borderLeft: `1px solid ${cs.onBackground}10`, borderRight: `1px solid ${cs.onBackground}10`, borderBottom: `1px solid ${cs.onBackground}10` }}>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.5rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input type="text" placeholder="NAME / UNTERNEHMEN" style={{ width: "100%", backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}10`, padding: "1rem", color: cs.onSurface, fontFamily: HEADING, fontSize: "0.9rem", letterSpacing: "0.05em", outline: "none" }} />
            <input type="email" placeholder="E-MAIL-ADRESSE" style={{ width: "100%", backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}10`, padding: "1rem", color: cs.onSurface, fontFamily: HEADING, fontSize: "0.9rem", letterSpacing: "0.05em", outline: "none" }} />
            <textarea placeholder="IHRE ANFRAGE" rows={4} style={{ width: "100%", backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}10`, padding: "1rem", color: cs.onSurface, fontFamily: HEADING, fontSize: "0.9rem", letterSpacing: "0.05em", outline: "none", resize: "none" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1.1rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 800, letterSpacing: "0.1em", border: "none", cursor: "pointer", textTransform: "uppercase" }} className="hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              {section.ctaText || "Anfrage senden"}
            </button>
          </form>

          <h3 style={{ fontFamily: HEADING, fontSize: "1.3rem", fontWeight: 800, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.5rem" }}>Öffnungszeiten</h3>
          <div className="space-y-2">
            {(hours.length > 0 ? hours : ["Mo – Fr: 07:00 – 17:00 Uhr", "Sa: 08:00 – 13:00 Uhr", "So: Notdienst"]).map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <div style={{ width: "6px", height: "6px", backgroundColor: cs.primary, flexShrink: 0 }} />
                <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: cs.onBackground, opacity: 0.65 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BoldCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "4rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, color: cs.onPrimary, textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
          {section.content && <p style={{ fontFamily: BODY, fontSize: "1rem", color: cs.onPrimary, opacity: 0.8, marginTop: "0.5rem" }}>{section.content}</p>}
        </div>
        <div className="flex flex-wrap gap-4 flex-shrink-0">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.onPrimary, color: cs.primary, padding: "1rem 2.5rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: `2px solid ${cs.onPrimary}33`, color: cs.onPrimary, padding: "1rem 2.5rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Jetzt aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function BoldFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: cs.onBackground, padding: "2.5rem 0", borderTop: `3px solid ${cs.primary}` }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 700, color: cs.background, textTransform: "uppercase", letterSpacing: "0.08em" }}>{websiteData.businessName}</span>
        <p style={{ fontFamily: BODY, fontSize: "0.8rem", color: cs.background, opacity: 0.5 }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: BODY, fontSize: "0.75rem", color: cs.background, opacity: 0.4 }}>Erstellt mit <span style={{ color: cs.primary, fontWeight: 700 }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

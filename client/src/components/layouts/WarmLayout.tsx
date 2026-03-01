/**
 * WARM Layout – Restaurant, Café, Bäckerei, Catering
 * Typography: Fraunces (serif headlines) + Instrument Sans (body)
 * Feel: Cozy, inviting, artisanal, food-forward
 * Structure: Full-bleed food photo hero, card-style menu sections, warm earthy palette
 */
import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Utensils, Coffee, Leaf, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import { useScrollReveal } from "@/hooks/useAnimations";

const SERIF = "var(--site-font-headline, 'Fraunces', Georgia, serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Fraunces', Georgia, serif))";
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

export default function WarmLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: SANS, backgroundColor: cs.background, color: cs.onBackground }}>
      <WarmNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <WarmHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <WarmAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} />}
          {section.type === "gallery" && <WarmGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <WarmServices section={section} cs={cs} />}
          {section.type === "menu" && <WarmMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <WarmPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <WarmTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <WarmFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <WarmContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <WarmCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <WarmFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function WarmNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: cs.background, backdropFilter: "blur(8px)", borderBottom: `1px solid ${cs.onBackground}10` }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        <div className="text-center">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5" style={{ color: cs.primary }} />
            {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", fontWeight: 700, color: cs.onBackground }}>{websiteData.businessName}</span>}
          </div>
          {websiteData.tagline && <p style={{ fontFamily: SANS, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.onBackground, opacity: 0.6 }}>{websiteData.tagline.split(" ").slice(0, 5).join(" ")}</p>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Speisekarte", "Über uns", "Reservierung"].map(label => (
            <a key={label} href="#" style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.onBackground, opacity: 0.8, fontWeight: 600 }} className="hover:opacity-70 transition-opacity">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.6rem 1.25rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.85rem", fontWeight: 700 }} className="hidden sm:flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            <Phone className="h-3.5 w-3.5" /> Reservieren
          </a>
        )}
      </div>
    </nav>
  );
}

function WarmHero({ section, cs, heroImageUrl, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", backgroundColor: cs.onBackground }}>
      {/* Full-bleed background image */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${cs.onBackground}F2 0%, ${cs.onBackground}66 50%, transparent 100%)` }} />
      
      <div className="tech-glow absolute" style={{ bottom: "-10%", left: "-5%", width: "40vw", height: "40vw", background: cs.primary, opacity: 0.1, zIndex: 1 }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="max-w-3xl">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }} className="hero-animate-badge">
            <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary }} />
            <span style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Tradition & Leidenschaft</span>
          </div>

          <h1 style={{ 
            fontFamily: SERIF, 
            fontSize: "clamp(3.5rem, 8vw, 6.5rem)", 
            fontWeight: 700, 
            color: cs.background, 
            lineHeight: 1, 
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
            <div className="max-w-xl">
              {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1.25rem", color: cs.background, opacity: 0.9, lineHeight: 1.6, marginBottom: "1rem", fontWeight: 500 }}>{section.subheadline}</p>}
              {section.content && <p style={{ fontFamily: SANS, fontSize: "1.05rem", color: cs.background, opacity: 0.6, lineHeight: 1.8 }}>{section.content}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1.25rem 3.5rem", borderRadius: "100px", fontFamily: SANS, fontSize: "1rem", fontWeight: 800, transition: "all 0.4s ease" }} 
                className="hover:scale-105 shadow-2xl shadow-primary/30">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `2px solid ${cs.background}30`, color: cs.background, padding: "1.25rem 3.5rem", borderRadius: "100px", fontFamily: SANS, fontSize: "1rem", fontWeight: 700, backgroundColor: "transparent" }} 
                className="hover:bg-white/10 transition-all">
                Jetzt aktivieren
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Curved bottom transition */}
      <div style={{ position: "absolute", bottom: "-1px", left: 0, width: "100%", height: "100px", background: cs.surface, clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 80%)" }} />
    </section>
  );
}

function WarmAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: cs.surface, padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", right: "-10%", width: "30vw", height: "30vw", background: cs.primary, opacity: 0.03, borderRadius: "50%", filter: "blur(80px)" }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-24 items-center">
        <div className="lg:col-span-5 relative">
          <div style={{ position: "absolute", inset: "-2rem", border: `1px solid ${cs.primary}20`, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", zIndex: 0 }} className="floating-element" />
          <div className="premium-shadow-lg relative z-10" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", overflow: "hidden" }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
          </div>
        </div>
        
        <div className="lg:col-span-7">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <span style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Unsere Geschichte</span>
            <div style={{ width: "4rem", height: "1px", backgroundColor: `${cs.primary}40` }} />
          </div>
          
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 700, color: cs.onSurface, marginBottom: "2.5rem", lineHeight: 1.1 }}>{section.headline}</h2>
          
          <p style={{ fontFamily: SANS, fontSize: "1.15rem", lineHeight: 1.8, color: cs.onSurface, marginBottom: "2rem", fontWeight: 500, opacity: 0.9 }}>{section.subheadline}</p>
          <p style={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.9, color: cs.onSurface, marginBottom: "3rem", opacity: 0.7 }}>{section.content}</p>
          
          <div className="grid grid-cols-3 gap-8 pt-10 border-t" style={{ borderColor: `${cs.onSurface}10` }}>
            {[{ icon: Leaf, text: "Frisch" }, { icon: Coffee, text: "Hausgemacht" }, { icon: Star, text: "Prämiert" }].map(({ icon: Icon, text }, i) => (
              <div key={i} className="text-center">
                <div style={{ width: "3rem", height: "3rem", backgroundColor: `${cs.primary}10`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                  <Icon className="h-5 w-5" style={{ color: cs.primary }} />
                </div>
                <span style={{ fontFamily: SANS, fontSize: "0.75rem", color: cs.onSurface, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WarmServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: cs.background, padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
            <Utensils className="h-5 w-5" style={{ color: cs.primary }} />
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
          </div>
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 700, color: cs.onBackground, lineHeight: 1.1 }}>
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ display: i === 2 ? "block" : "inline", fontStyle: i === 2 ? "italic" : "normal", color: i === 2 ? cs.primary : "inherit" }}>
                {word}{" "}
              </span>
            )) || "Handwerk, das man schmeckt."}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item, i) => (
            <div key={i} className="group transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-2xl" style={{ backgroundColor: cs.surface, borderRadius: "2rem", padding: "3.5rem 2.5rem", position: "relative", overflow: "hidden", border: `1px solid ${cs.onSurface}05` }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "8px", backgroundColor: cs.primary, opacity: 0.2 }} />
              <h3 style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 700, color: cs.onSurface, marginBottom: "1.25rem" }}>{item.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.7, color: cs.onSurface, marginBottom: "2rem", opacity: 0.7 }}>{item.description}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em" }} className="opacity-40 group-hover:opacity-100 transition-all">
                Entdecken <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WarmMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
            <Coffee className="h-5 w-5" style={{ color: cs.primary }} />
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: cs.onBackground, lineHeight: 1.15 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-8">
                <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 700, color: cs.onBackground, borderBottom: `2px solid ${cs.primary}`, display: "inline-block", paddingBottom: "0.5rem" }}>{cat}</h3>
                <div className="space-y-6">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-4 mb-1">
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: cs.onBackground }}>{item.title}</h4>
                        <div className="flex-1 border-b border-dotted mx-2" style={{ borderColor: `${cs.onBackground}20` }} />
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
                  <div className="flex-1 border-b border-dotted mx-2" style={{ borderColor: `${cs.onBackground}20` }} />
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

function WarmPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, color: cs.onSurface }}>{section.headline}</h2>
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map((cat, idx) => (
              <div key={idx} style={{ backgroundColor: cs.background, padding: "2.5rem", borderRadius: "1.5rem", border: `1px solid ${cs.onBackground}05` }}>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 700, color: cs.onBackground, marginBottom: "2rem", textAlign: "center" }}>{cat}</h3>
                <div className="grid gap-4">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b last:border-0" style={{ borderColor: `${cs.onBackground}10` }}>
                      <span style={{ fontSize: "1rem", color: cs.onBackground, fontWeight: 500 }}>{item.title}</span>
                      <span style={{ fontSize: "1.1rem", color: cs.primary, fontWeight: 700 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: cs.background, padding: "3rem", borderRadius: "1.5rem", border: `1px solid ${cs.onBackground}05`, maxWidth: "800px", margin: "0 auto" }}>
            <div className="grid gap-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b last:border-0" style={{ borderColor: `${cs.onBackground}10` }}>
                  <span style={{ fontSize: "1.1rem", color: cs.onBackground, fontWeight: 500 }}>{item.title}</span>
                  <span style={{ fontSize: "1.2rem", color: cs.primary, fontWeight: 700 }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function WarmGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
            <span style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Galerie</span>
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: cs.onBackground }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ borderRadius: "2rem", overflow: "hidden", aspectRatio: "1/1", border: `1px solid ${cs.onBackground}10`, backgroundColor: cs.surface }}>
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1414235077428 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WarmTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: cs.onPrimary, textAlign: "center", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: `${cs.onPrimary}15`, borderRadius: "1rem", padding: "2rem", backdropFilter: "blur(4px)" }}>
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current text-yellow-300" />)}</div>
              <p style={{ fontFamily: SERIF, fontSize: "0.95rem", lineHeight: 1.7, color: cs.onPrimary, fontStyle: "italic", marginBottom: "1rem", opacity: 0.9 }}>{item.description || item.title}</p>
              <p style={{ fontFamily: SANS, fontSize: "0.85rem", fontWeight: 700, color: cs.onPrimary, opacity: 0.7 }}>— {item.author || item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WarmFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: cs.onSurface, textAlign: "center", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, borderRadius: "0.75rem", overflow: "hidden", border: `1px solid ${cs.onBackground}05` }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-4 flex items-center justify-between" style={{ fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700, color: cs.onBackground }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} />}
              </button>
              {open === i && <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.7, padding: "0 1.5rem 1.5rem" }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WarmContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.background, padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: cs.onBackground, marginBottom: "2rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: cs.onBackground, opacity: 0.7, marginBottom: "2rem" }}>{section.content}</p>}
          <div className="space-y-4">
            {phone && <div className="flex items-center gap-3"><div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><Phone className="h-4 w-4" style={{ color: cs.primary }} /></div><a href={`tel:${phone}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.onBackground, fontWeight: 600 }}>{phone}</a></div>}
            {address && <div className="flex items-start gap-3"><div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MapPin className="h-4 w-4" style={{ color: cs.primary }} /></div><span style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.onBackground, opacity: 0.8 }}>{address}</span></div>}
            {email && <div className="flex items-center gap-3"><div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><Mail className="h-4 w-4" style={{ color: cs.primary }} /></div><a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.onBackground }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.surface, borderRadius: "1.5rem", padding: "2.5rem", border: `1px solid ${cs.onSurface}10` }}>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input type="text" placeholder="Ihr Name" style={{ width: "100%", padding: "0.85rem 1.25rem", borderRadius: "2rem", border: `1px solid ${cs.onSurface}10`, backgroundColor: cs.background, color: cs.onBackground, fontSize: "0.95rem", outline: "none" }} />
            <input type="email" placeholder="Ihre E-Mail-Adresse" style={{ width: "100%", padding: "0.85rem 1.25rem", borderRadius: "2rem", border: `1px solid ${cs.onSurface}10`, backgroundColor: cs.background, color: cs.onBackground, fontSize: "0.95rem", outline: "none" }} />
            <textarea placeholder="Ihre Nachricht an uns..." rows={4} style={{ width: "100%", padding: "0.85rem 1.25rem", borderRadius: "1.25rem", border: `1px solid ${cs.onSurface}10`, backgroundColor: cs.background, color: cs.onBackground, fontSize: "0.95rem", outline: "none", resize: "none" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.9rem", borderRadius: "2rem", fontSize: "1rem", fontWeight: 700, border: "none", cursor: "pointer" }} className="hover:opacity-90 transition-opacity">
              {section.ctaText || "Jetzt anfragen"}
            </button>
          </form>

          <div style={{ marginTop: "2.5rem", paddingTop: "2rem", borderTop: `1px solid ${cs.onSurface}10` }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" style={{ color: cs.primary }} />
              <h3 style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 700, color: cs.onSurface }}>Öffnungszeiten</h3>
            </div>
            <div className="space-y-2">
              {(hours.length > 0 ? hours : ["Mo – Fr: 08:00 – 22:00 Uhr", "Sa – So: 09:00 – 23:00 Uhr"]).map((h, i) => (
                <p key={i} style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.onSurface, opacity: 0.7 }}>{h}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WarmCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Utensils className="h-8 w-8 mx-auto mb-4" style={{ color: cs.primary }} />
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: cs.onSurface, marginBottom: "1rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontFamily: SANS, fontSize: "1rem", color: cs.onSurface, opacity: 0.7, marginBottom: "2.5rem" }}>{section.content}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.9rem 2.5rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700 }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: `2px solid ${cs.primary}`, color: cs.primary, padding: "0.9rem 2.5rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Jetzt aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function WarmFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: cs.onBackground, padding: "3rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5" style={{ color: cs.primary }} />
          <span style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 700, color: cs.background }}>{websiteData.businessName}</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: cs.background, opacity: 0.5 }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: SANS, fontSize: "0.75rem", color: cs.background, opacity: 0.4 }}>Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

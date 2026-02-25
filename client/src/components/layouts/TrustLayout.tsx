/**
 * TRUST Layout – Medical, Legal, Financial, Consulting, Insurance
 * Inspired by: GuardPest template (white/blue, 3-column features, trust badges, clean structure)
 * Typography: Lora (headlines) + Inter (body)
 * Feel: Professional, trustworthy, authoritative, calm
 * Structure: Split hero with image right, trust bar, 3-column features, clean testimonials
 */
import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Shield, Award, Users, ArrowRight } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";

const SERIF = "'Lora', Georgia, serif";
const BODY = "'Inter', 'Helvetica Neue', sans-serif";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  showActivateButton?: boolean;
  onActivate?: () => void;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessEmail?: string | null;
  openingHours?: string[];
}

export default function TrustLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [] }: Props) {
  return (
    <div style={{ fontFamily: BODY, backgroundColor: "#ffffff", color: "#1a2332" }}>
      <TrustNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <TrustHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} />}
          {section.type === "about" && <TrustAbout section={section} cs={cs} heroImageUrl={heroImageUrl} />}
          {(section.type === "services" || section.type === "features") && <TrustServices section={section} cs={cs} />}
          {section.type === "testimonials" && <TrustTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <TrustFAQ section={section} cs={cs} />}
          {section.type === "contact" && <TrustContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />}
          {section.type === "cta" && <TrustCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <TrustFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function TrustNav({ websiteData, cs, businessPhone }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null }) {
  return (
    <nav style={{ backgroundColor: "#fff", borderBottom: "1px solid #e8edf3", fontFamily: BODY }} className="sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          <span style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 700, color: "#1a2332" }}>{websiteData.businessName}</span>
          {websiteData.tagline && <p style={{ fontSize: "0.65rem", color: cs.primary, letterSpacing: "0.08em", marginTop: "1px" }}>{websiteData.tagline.slice(0, 40)}</p>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.85rem", color: "#5a6a7e", fontWeight: 500 }} className="hover:text-black transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.6rem 1.5rem", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "0.25rem" }} className="hover:opacity-90 transition-opacity">
            <Phone className="h-3.5 w-3.5" /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function TrustHero({ section, cs, heroImageUrl, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e8edf3" }}>
      <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: `${cs.primary}10`, border: `1px solid ${cs.primary}30`, padding: "0.35rem 0.9rem", borderRadius: "2rem", marginBottom: "1.5rem" }}>
            <Shield className="h-3.5 w-3.5" style={{ color: cs.primary }} />
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: cs.primary, fontWeight: 600 }}>Zertifiziert & Vertrauenswürdig</span>
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.2rem, 4vw, 3.5rem)", fontWeight: 700, lineHeight: 1.2, color: "#1a2332", marginBottom: "1.25rem" }}>
            {section.headline}
          </h1>
          {section.subheadline && (
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#5a6a7e", marginBottom: "1rem" }}>{section.subheadline}</p>
          )}
          {section.content && (
            <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#7a8a9e", marginBottom: "2rem" }}>{section.content}</p>
          )}
          <div className="flex flex-wrap gap-3">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.85rem 2rem", fontSize: "0.9rem", fontWeight: 600, borderRadius: "0.25rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }} className="hover:opacity-90 transition-opacity">
                {section.ctaText} <ArrowRight className="h-4 w-4" />
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} style={{ border: `1px solid ${cs.primary}`, color: cs.primary, padding: "0.85rem 2rem", fontSize: "0.9rem", fontWeight: 600, borderRadius: "0.25rem", backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">
                Website aktivieren
              </button>
            )}
          </div>
          {/* Trust indicators */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid #e8edf3" }}>
            {[["20+", "Jahre Erfahrung"], ["500+", "Kunden betreut"], ["98%", "Zufriedenheit"]].map(([num, label]) => (
              <div key={label}>
                <p style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: cs.primary }}>{num}</p>
                <p style={{ fontSize: "0.75rem", color: "#7a8a9e" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <img src={heroImageUrl} alt={section.headline || ""} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "0.5rem" }} />
          {/* Floating badge */}
          <div style={{ position: "absolute", bottom: "1.5rem", left: "-1.5rem", backgroundColor: "#fff", borderRadius: "0.5rem", padding: "1rem 1.25rem", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award className="h-5 w-5" style={{ color: cs.primary }} />
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a2332" }}>Top bewertet</p>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1,2,3,4,5].map(j => <Star key={j} className="h-3 w-3" style={{ fill: "#f59e0b", color: "#f59e0b" }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: "#fff", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Über uns</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, color: "#1a2332", marginBottom: "1.5rem", lineHeight: 1.25 }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#5a6a7e", marginBottom: "1rem" }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#7a8a9e", marginBottom: "2rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {["Persönliche Beratung & individuelle Lösungen", "Transparente Kommunikation", "Langjährige Erfahrung & Expertise"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <CheckCircle className="h-5 w-5" style={{ color: cs.primary, flexShrink: 0 }} />
                <span style={{ fontSize: "0.9rem", color: "#5a6a7e" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "0.5rem" }} />
          <div style={{ position: "absolute", bottom: "-1.5rem", right: "-1.5rem", backgroundColor: cs.primary, borderRadius: "0.5rem", padding: "1.5rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 700, color: "#fff" }}>20+</p>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em" }}>Jahre Erfahrung</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const icons = [Shield, Award, Users, CheckCircle, Star, Clock];
  return (
    <section style={{ backgroundColor: "#f8fafc", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Unsere Leistungen</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, color: "#1a2332" }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontSize: "1rem", color: "#5a6a7e", marginTop: "0.75rem" }}>{section.subheadline}</p>}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={i} style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "0.5rem", border: "1px solid #e8edf3", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }} className="hover:shadow-md transition-shadow">
                <div style={{ width: "3rem", height: "3rem", backgroundColor: `${cs.primary}10`, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <Icon className="h-6 w-6" style={{ color: cs.primary }} />
                </div>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 700, color: "#1a2332", marginBottom: "0.75rem" }}>{item.title}</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#5a6a7e" }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#fff", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Kundenstimmen</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, color: "#1a2332" }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#f8fafc", padding: "2rem", borderRadius: "0.5rem", border: "1px solid #e8edf3", position: "relative" }}>
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4" style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                ))}
              </div>
              <p style={{ fontFamily: SERIF, fontSize: "0.95rem", lineHeight: 1.7, color: "#3a4a5e", marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 700, color: cs.primary }}>{(item.author || "K")[0]}</span>
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2332" }}>{item.author || "Kunde"}</p>
                  <p style={{ fontSize: "0.75rem", color: "#7a8a9e" }}>Verifizierter Kunde</p>
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
    <section style={{ backgroundColor: "#f8fafc", padding: "6rem 0" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Häufige Fragen</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, color: "#1a2332" }}>{section.headline}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: "0.5rem", border: "1px solid #e8edf3", overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a2332" }}>{item.question || item.title}</span>
                {open === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "#9aa5b4" }} />}
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", fontSize: "0.9rem", lineHeight: 1.7, color: "#5a6a7e", borderTop: `1px solid #e8edf3` }}>
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

function TrustCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#fff", marginBottom: "1.25rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", marginBottom: "2.5rem" }}>{section.content}</p>}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#fff", color: cs.primary, padding: "1rem 3rem", fontSize: "0.9rem", fontWeight: 700, borderRadius: "0.25rem" }} className="hover:opacity-90 transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: "2px solid rgba(255,255,255,0.5)", color: "#fff", padding: "1rem 3rem", fontSize: "0.9rem", fontWeight: 700, borderRadius: "0.25rem", backgroundColor: "transparent" }} className="hover:border-white transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function TrustContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: "#fff", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Kontakt</span>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, color: "#1a2332", marginBottom: "2rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#5a6a7e", marginBottom: "2rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Phone className="h-5 w-5" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ color: "#1a2332", fontSize: "1rem", fontWeight: 600 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><MapPin className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><span style={{ color: "#5a6a7e", fontSize: "0.95rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ color: "#1a2332", fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><Clock className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><div>{hours.map((h, i) => <p key={i} style={{ color: "#5a6a7e", fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#f8fafc", padding: "2.5rem", borderRadius: "0.5rem", border: "1px solid #e8edf3" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: "#1a2332", marginBottom: "1.5rem" }}>Kostenlose Erstberatung</h3>
          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="text" placeholder="Ihr Name" style={{ backgroundColor: "#fff", border: "1px solid #d1d9e0", padding: "0.85rem 1rem", color: "#1a2332", fontSize: "0.9rem", outline: "none", borderRadius: "0.25rem" }} />
            <input type="email" placeholder="Ihre E-Mail" style={{ backgroundColor: "#fff", border: "1px solid #d1d9e0", padding: "0.85rem 1rem", color: "#1a2332", fontSize: "0.9rem", outline: "none", borderRadius: "0.25rem" }} />
            <input type="tel" placeholder="Ihre Telefonnummer" style={{ backgroundColor: "#fff", border: "1px solid #d1d9e0", padding: "0.85rem 1rem", color: "#1a2332", fontSize: "0.9rem", outline: "none", borderRadius: "0.25rem" }} />
            <textarea placeholder="Ihr Anliegen" rows={3} style={{ backgroundColor: "#fff", border: "1px solid #d1d9e0", padding: "0.85rem 1rem", color: "#1a2332", fontSize: "0.9rem", outline: "none", resize: "vertical", borderRadius: "0.25rem" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: "#fff", padding: "1rem", fontSize: "0.9rem", fontWeight: 600, border: "none", cursor: "pointer", borderRadius: "0.25rem" }} className="hover:opacity-90 transition-opacity">
              Beratungsgespräch anfragen
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function TrustFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer style={{ backgroundColor: "#1a2332", padding: "2.5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href="#" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

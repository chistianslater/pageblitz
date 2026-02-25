import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, ArrowRight, Scissors, Wrench, Heart, Shield, Zap, Users, Award, ThumbsUp, Briefcase, Home, Car, Utensils, Camera, Sparkles, Flame, Leaf, Sun, Moon, Coffee, Music, Palette, Hammer, Truck, Package, Globe, Lock, Key, Smile, Dumbbell, Bike, Stethoscope, Pill, Scale, Gavel, Calculator, PiggyBank, Building, Factory, Warehouse } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Scissors, Wrench, Heart, Shield, Zap, Users, Award, ThumbsUp, Briefcase, Home, Car, Utensils,
  Camera, Sparkles, Flame, Leaf, Sun, Moon, Coffee, Music, Palette, Hammer, Truck, Package,
  CheckCircle, ArrowRight, Globe, Lock, Key, Smile, Dumbbell, Bike, Stethoscope, Pill,
  Scale, Gavel, Calculator, PiggyBank, Building, Factory, Warehouse, Star, Phone, MapPin, Clock, Mail,
};

function Icon({ name, className, style }: { name?: string; className?: string; style?: React.CSSProperties }) {
  const Component = (name && ICON_MAP[name]) ? ICON_MAP[name] : Star;
  return <Component className={className} style={style} />;
}

interface WebsiteRendererProps {
  websiteData: WebsiteData;
  colorScheme: ColorScheme;
  heroImageUrl?: string | null;
  layoutStyle?: string | null;
  showActivateButton?: boolean;
  onActivate?: () => void;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessEmail?: string | null;
  openingHours?: string[];
}

// Client-side fallback images by industry keyword
const FALLBACK_IMAGES: Array<{ keywords: string[]; url: string }> = [
  { keywords: ["hair", "friseur", "salon", "barber", "beauty", "coiffeur"], url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=85&auto=format&fit=crop" },
  { keywords: ["restaurant", "food", "cafe", "bistro", "pizza", "sushi"], url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=85&auto=format&fit=crop" },
  { keywords: ["contractor", "roofing", "bau", "handwerk", "construction", "plumber", "painter"], url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85&auto=format&fit=crop" },
  { keywords: ["fitness", "gym", "sport", "yoga", "training"], url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=85&auto=format&fit=crop" },
  { keywords: ["doctor", "dental", "medical", "health", "clinic", "arzt", "zahnarzt"], url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=85&auto=format&fit=crop" },
  { keywords: ["real estate", "property", "immobilien", "makler"], url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=85&auto=format&fit=crop" },
  { keywords: ["law", "legal", "anwalt", "beratung", "consulting"], url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=85&auto=format&fit=crop" },
  { keywords: ["auto", "car", "vehicle", "garage", "mechanic"], url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1400&q=85&auto=format&fit=crop" },
];

function getFallbackImage(wd: WebsiteData): string {
  // Use business name + tagline as signal for industry detection
  const text = (wd.businessName + " " + (wd.tagline || "")).toLowerCase();
  for (const entry of FALLBACK_IMAGES) {
    if (entry.keywords.some(kw => text.includes(kw))) return entry.url;
  }
  return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85&auto=format&fit=crop";
}

function inferLayout(wd: WebsiteData): string {
  const text = (wd.businessName + " " + (wd.tagline || "")).toLowerCase();
  if (["restaurant", "food", "cafe", "bistro", "pizza", "hotel"].some(k => text.includes(k))) return "fullbleed";
  if (["hair", "friseur", "salon", "barber", "beauty", "spa", "nail"].some(k => text.includes(k))) return "elegant";
  if (["contractor", "roofing", "bau", "handwerk", "construction", "plumber"].some(k => text.includes(k))) return "bold";
  if (["fitness", "gym", "sport", "yoga", "training"].some(k => text.includes(k))) return "dynamic";
  if (["doctor", "dental", "medical", "health", "clinic", "arzt"].some(k => text.includes(k))) return "clean";
  if (["real estate", "property", "immobilien", "luxury"].some(k => text.includes(k))) return "premium";
  if (["law", "legal", "anwalt", "consulting"].some(k => text.includes(k))) return "professional";
  return "classic";
}

export default function WebsiteRenderer({
  websiteData, colorScheme: cs, heroImageUrl, layoutStyle = "classic",
  showActivateButton = false, onActivate,
  businessPhone, businessAddress, businessEmail, openingHours = [],
}: WebsiteRendererProps) {
  // Fallback: derive image and layout from business name/industry for old websites
  const effectiveHeroImage = heroImageUrl || getFallbackImage(websiteData);
  const layout = layoutStyle || inferLayout(websiteData);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: cs.background, color: cs.text, fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      <NavBar websiteData={websiteData} cs={cs} businessPhone={businessPhone} layout={layout} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <HeroSection section={section} cs={cs} heroImageUrl={effectiveHeroImage} layout={layout} showActivateButton={showActivateButton} onActivate={onActivate} />}
          {section.type === "about" && <AboutSection section={section} cs={cs} layout={layout} />}
          {(section.type === "services" || section.type === "features") && <ServicesSection section={section} cs={cs} layout={layout} />}
          {section.type === "testimonials" && <TestimonialsSection section={section} cs={cs} />}
          {section.type === "faq" && <FAQSection section={section} cs={cs} />}
          {section.type === "contact" && <ContactSection section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />}
          {section.type === "cta" && <CTASection section={section} cs={cs} />}
          {section.type === "gallery" && <GallerySection section={section} cs={cs} />}
          {section.type === "team" && <TeamSection section={section} cs={cs} />}
        </div>
      ))}
      <footer className="py-10 border-t" style={{ borderColor: `${cs.text}12`, backgroundColor: cs.surface }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg" style={{ color: cs.primary }}>{websiteData.businessName}</p>
            <p className="text-sm mt-1" style={{ color: cs.textLight }}>{websiteData.tagline}</p>
          </div>
          <p className="text-sm text-center" style={{ color: cs.textLight }}>{websiteData.footer?.text}</p>
          <p className="text-xs" style={{ color: `${cs.textLight}80` }}>
            Erstellt mit <span className="font-semibold" style={{ color: cs.primary }}>Pageblitz</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavBar({ websiteData, cs, businessPhone, layout }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; layout: string }) {
  const isElegant = layout === "elegant" || layout === "premium";
  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ backgroundColor: `${cs.background}ee`, borderColor: `${cs.text}10` }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: cs.gradient || cs.primary }}>
            {websiteData.businessName.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: cs.text, fontFamily: isElegant ? "Georgia, serif" : "inherit" }}>
            {websiteData.businessName}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {websiteData.sections.slice(0, 4).map((s, i) => (
            <a key={i} href={`#section-${i}`} className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: cs.textLight }}>
              {s.type === "hero" ? "Start" : s.type === "about" ? "Über uns" : s.type === "services" ? "Leistungen" : s.type === "contact" ? "Kontakt" : s.headline?.split(" ").slice(0, 2).join(" ") || s.type}
            </a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105" style={{ background: cs.gradient || cs.primary }}>
            <Phone className="h-3.5 w-3.5" /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function HeroSection({ section, cs, heroImageUrl, layout, showActivateButton, onActivate }: {
  section: WebsiteSection; cs: ColorScheme; heroImageUrl?: string | null; layout: string;
  showActivateButton?: boolean; onActivate?: () => void;
}) {
  const ctaButtons = (
    <div className="flex flex-wrap gap-4">
      {section.ctaText && (
        <a href={section.ctaLink || "#kontakt"} className="px-8 py-4 rounded-xl text-base font-bold shadow-xl transition-all hover:scale-105 hover:shadow-2xl text-white" style={{ background: cs.gradient || cs.primary }}>
          {section.ctaText}
        </a>
      )}
      {showActivateButton && (
        <button onClick={onActivate} className="px-8 py-4 rounded-xl text-base font-bold border-2 transition-all hover:opacity-80" style={{ borderColor: cs.primary, color: cs.primary, backgroundColor: "transparent" }}>
          Jetzt aktivieren – ab 490€
        </button>
      )}
    </div>
  );

  // FULLBLEED: large background image with dark overlay
  if (layout === "fullbleed" && heroImageUrl) {
    return (
      <section className="relative flex items-center" style={{ minHeight: "88vh" }}>
        <div className="absolute inset-0">
          <img src={heroImageUrl} alt={section.headline || ""} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 text-white/90" style={{ backgroundColor: `${cs.primary}99` }}>
              <Sparkles className="h-3 w-3" /> Premium Qualität
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              {section.headline}
            </h1>
            {section.subheadline && <p className="text-xl text-white/85 mb-4 leading-relaxed">{section.subheadline}</p>}
            {section.content && <p className="text-base text-white/70 mb-10 max-w-lg">{section.content}</p>}
            {ctaButtons}
          </div>
        </div>
      </section>
    );
  }

  // ELEGANT / PREMIUM: split layout, image right
  if ((layout === "elegant" || layout === "premium") && heroImageUrl) {
    return (
      <section className="min-h-[80vh] flex items-center" style={{ backgroundColor: cs.surface }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="w-12 h-1 rounded-full mb-8" style={{ backgroundColor: cs.primary }} />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: cs.text, fontFamily: "Georgia, serif" }}>
              {section.headline}
            </h1>
            {section.subheadline && <p className="text-lg leading-relaxed mb-4" style={{ color: cs.textLight }}>{section.subheadline}</p>}
            {section.content && <p className="text-base mb-10" style={{ color: cs.textLight }}>{section.content}</p>}
            {ctaButtons}
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl opacity-20" style={{ background: cs.gradient || cs.primary }} />
            <img src={heroImageUrl} alt={section.headline || ""} className="relative rounded-2xl shadow-2xl w-full object-cover aspect-square" />
          </div>
        </div>
      </section>
    );
  }

  // BOLD: dark background, accent color, image as subtle bg
  if (layout === "bold") {
    return (
      <section className="relative overflow-hidden py-24 sm:py-32" style={{ backgroundColor: cs.text }}>
        {heroImageUrl && (
          <div className="absolute inset-0 opacity-15">
            <img src={heroImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10" style={{ background: cs.gradient || cs.primary, clipPath: "polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 rounded-lg text-sm font-bold mb-6 text-white" style={{ backgroundColor: cs.primary }}>
              ✓ Professionell & Zuverlässig
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6 uppercase tracking-tight">
              {section.headline}
            </h1>
            {section.subheadline && <p className="text-xl text-white/80 mb-4">{section.subheadline}</p>}
            {section.content && <p className="text-base text-white/60 mb-10">{section.content}</p>}
            <div className="flex flex-wrap gap-4">
              {section.ctaText && (
                <a href={section.ctaLink || "#"} className="px-8 py-4 rounded-lg text-base font-bold transition-all hover:scale-105 text-white" style={{ backgroundColor: cs.primary }}>
                  {section.ctaText} →
                </a>
              )}
              {showActivateButton && (
                <button onClick={onActivate} className="px-8 py-4 rounded-lg text-base font-bold border-2 border-white/30 text-white hover:border-white/60 transition-all">
                  Jetzt aktivieren – ab 490€
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // DYNAMIC: diagonal split with image
  if (layout === "dynamic" && heroImageUrl) {
    return (
      <section className="relative overflow-hidden" style={{ minHeight: "80vh" }}>
        <div className="absolute inset-0 grid grid-cols-2">
          <div style={{ background: cs.gradient || cs.primary }} />
          <div><img src={heroImageUrl} alt="" className="w-full h-full object-cover" /></div>
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, transparent 45%, rgba(0,0,0,0.45) 45%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-xl">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">{section.headline}</h1>
            {section.subheadline && <p className="text-xl text-white/85 mb-4">{section.subheadline}</p>}
            {section.content && <p className="text-base text-white/70 mb-10">{section.content}</p>}
            <div className="flex flex-wrap gap-4">
              {section.ctaText && (
                <a href={section.ctaLink || "#"} className="px-8 py-4 rounded-xl text-base font-bold bg-white transition-all hover:scale-105 shadow-xl" style={{ color: cs.primary }}>
                  {section.ctaText}
                </a>
              )}
              {showActivateButton && (
                <button onClick={onActivate} className="px-8 py-4 rounded-xl text-base font-bold border-2 border-white text-white hover:bg-white/10 transition-all">
                  Jetzt aktivieren – ab 490€
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // CLEAN / PROFESSIONAL: minimal centered
  if (layout === "clean" || layout === "professional") {
    return (
      <section className="py-24 sm:py-32" style={{ backgroundColor: cs.background }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {heroImageUrl && (
            <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-8 shadow-lg">
              <img src={heroImageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ backgroundColor: `${cs.primary}15`, color: cs.primary }}>
            <CheckCircle className="h-4 w-4" /> Zertifiziert & Erfahren
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: cs.text }}>
            {section.headline}
          </h1>
          {section.subheadline && <p className="text-xl leading-relaxed mb-4 max-w-2xl mx-auto" style={{ color: cs.textLight }}>{section.subheadline}</p>}
          {section.content && <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: cs.textLight }}>{section.content}</p>}
          <div className="flex flex-wrap items-center justify-center gap-4">{ctaButtons}</div>
        </div>
      </section>
    );
  }

  // DEFAULT / CLASSIC: gradient background with dot pattern
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36" style={{ background: cs.gradient || cs.primary }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>
      {heroImageUrl && (
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 hidden lg:block">
          <img src={heroImageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent, rgba(0,0,0,0.5))" }} />
        </div>
      )}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">{section.headline}</h1>
        {section.subheadline && <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">{section.subheadline}</p>}
        {section.content && <p className="mt-4 text-base text-white/70 max-w-xl mx-auto">{section.content}</p>}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {section.ctaText && (
            <a href={section.ctaLink || "#"} className="px-8 py-3.5 rounded-full text-base font-semibold shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: "white", color: cs.primary }}>
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} className="px-8 py-3.5 rounded-full text-base font-semibold border-2 border-white text-white hover:bg-white/10 transition-all">
              Jetzt aktivieren – ab 490€
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function AboutSection({ section, cs, layout }: { section: WebsiteSection; cs: ColorScheme; layout: string }) {
  const isElegant = layout === "elegant" || layout === "premium";
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.background }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-12 items-center ${isElegant ? "lg:grid-cols-2" : ""}`}>
          <div>
            <div className="w-12 h-1 rounded-full mb-6" style={{ backgroundColor: cs.primary }} />
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: cs.text, fontFamily: isElegant ? "Georgia, serif" : "inherit" }}>
              {section.headline}
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: cs.textLight }}>{section.content}</p>
          </div>
          {isElegant && (
            <div className="grid grid-cols-2 gap-4">
              {[{ icon: "Award", label: "Jahrelange Erfahrung" }, { icon: "Users", label: "Zufriedene Kunden" }, { icon: "CheckCircle", label: "Qualitätsgarantie" }, { icon: "Heart", label: "Persönliche Betreuung" }].map((item, i) => (
                <div key={i} className="p-4 rounded-xl text-center" style={{ backgroundColor: cs.surface }}>
                  <Icon name={item.icon} className="h-6 w-6 mx-auto mb-2" style={{ color: cs.primary }} />
                  <p className="text-xs font-medium" style={{ color: cs.textLight }}>{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ section, cs, layout }: { section: WebsiteSection; cs: ColorScheme; layout: string }) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.surface }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: cs.text }}>{section.headline}</h2>
          <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundColor: cs.primary }} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item, i) => (
            <div key={i} className="group relative p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: cs.background, borderColor: `${cs.text}08` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ backgroundColor: `${cs.primary}15` }}>
                <Icon name={item.icon} className="h-6 w-6" style={{ color: cs.primary }} />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: cs.text }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: cs.textLight }}>{item.description}</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: cs.gradient || cs.primary }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section className="py-16 sm:py-24" style={{ background: cs.gradient || cs.primary }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">{section.headline}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item, i) => (
            <div key={i} className="p-6 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)" }}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating || 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              {item.title && <p className="font-semibold text-white mb-2">"{item.title}"</p>}
              <p className="text-sm text-white/80 leading-relaxed mb-4">{item.description}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
                  {item.author?.charAt(0) || "K"}
                </div>
                <p className="text-sm font-medium text-white/90">{item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.background }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text }}>{section.headline}</h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="space-y-3">
          {section.items?.map((item, i) => (
            <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: `${cs.text}10`, backgroundColor: cs.surface }}>
              <button className="w-full flex items-center justify-between p-5 text-left transition-colors hover:opacity-80" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <span className="font-medium pr-4" style={{ color: cs.text }}>{item.question || item.title}</span>
                {openIdx === i ? <ChevronUp className="h-5 w-5 shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 shrink-0" style={{ color: cs.textLight }} />}
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: cs.textLight }}>
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

function ContactSection({ section, cs, phone, address, email, hours }: {
  section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[];
}) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.surface }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text }}>{section.headline}</h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            {section.content && <p className="text-lg leading-relaxed mb-6" style={{ color: cs.textLight }}>{section.content}</p>}
            {[
              phone && { icon: "Phone", label: "Telefon", value: phone, href: `tel:${phone}` },
              address && { icon: "MapPin", label: "Adresse", value: address, href: undefined },
              email && { icon: "Mail", label: "E-Mail", value: email, href: `mailto:${email}` },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: cs.background }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cs.primary}15` }}>
                  <Icon name={item.icon} className="h-5 w-5" style={{ color: cs.primary }} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: cs.textLight }}>{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-semibold hover:opacity-80 transition-opacity" style={{ color: cs.text }}>{item.value}</a>
                  ) : (
                    <p className="font-semibold" style={{ color: cs.text }}>{item.value}</p>
                  )}
                </div>
              </div>
            ))}
            {hours && hours.length > 0 && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: cs.background }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cs.primary}15` }}>
                    <Clock className="h-5 w-5" style={{ color: cs.primary }} />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: cs.textLight }}>Öffnungszeiten</p>
                </div>
                {hours.map((h, i) => <p key={i} className="text-sm py-0.5" style={{ color: cs.text }}>{h}</p>)}
              </div>
            )}
          </div>
          <div className="rounded-2xl border p-6" style={{ backgroundColor: cs.background, borderColor: `${cs.text}08` }}>
            <h3 className="text-lg font-semibold mb-5" style={{ color: cs.text }}>Nachricht senden</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {["Ihr Name", "Ihre E-Mail", "Ihre Telefonnummer (optional)"].map((ph, i) => (
                <input key={i} type={i === 1 ? "email" : i === 2 ? "tel" : "text"} placeholder={ph}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ backgroundColor: cs.surface, borderColor: `${cs.text}15`, color: cs.text }} />
              ))}
              <textarea placeholder="Ihre Nachricht" rows={4} className="w-full px-4 py-3 rounded-xl border text-sm resize-none outline-none transition-all"
                style={{ backgroundColor: cs.surface, borderColor: `${cs.text}15`, color: cs.text }} />
              <button type="submit" className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg" style={{ background: cs.gradient || cs.primary }}>
                {section.ctaText || "Nachricht senden"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden" style={{ background: cs.gradient || cs.primary }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 50%, white 2px, transparent 2px)", backgroundSize: "80px 80px" }} />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{section.headline}</h2>
        {section.content && <p className="text-lg text-white/80 mb-8">{section.content}</p>}
        {section.ctaText && (
          <a href={section.ctaLink || "#"} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold shadow-xl transition-all hover:scale-105" style={{ backgroundColor: "white", color: cs.primary }}>
            {section.ctaText} <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </section>
  );
}

function GallerySection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const images = (section as any).images as string[] | undefined;
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.surface }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text }}>{section.headline}</h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(images || section.items || []).map((item: any, i: number) => (
            <div key={i} className="rounded-2xl overflow-hidden border group" style={{ borderColor: `${cs.text}08` }}>
              {typeof item === "string" ? (
                <img src={item} alt={`Galerie ${i + 1}`} className="w-full aspect-video object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: `${cs.primary}10` }}>
                  <Camera className="h-8 w-8" style={{ color: `${cs.primary}40` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text }}>{section.headline}</h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border" style={{ backgroundColor: cs.surface, borderColor: `${cs.text}08` }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white" style={{ background: cs.gradient || cs.primary }}>
                {item.title?.charAt(0) || "T"}
              </div>
              <h3 className="font-semibold" style={{ color: cs.text }}>{item.title}</h3>
              <p className="text-sm mt-1" style={{ color: cs.textLight }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

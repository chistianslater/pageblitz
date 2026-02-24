import { type WebsiteData, type WebsiteSection, type ColorScheme } from "@shared/types";
import { Star, Phone, MapPin, Clock, Mail, ChevronDown, ChevronUp, MessageSquare, Bot, Calendar, Globe, Scissors, Wrench, Heart, Shield, Zap, Award, ThumbsUp, Briefcase, Home, Car, Utensils, Camera, Users, Package, Sparkles, Lightbulb, Target, Palette, Music, BookOpen, Dumbbell, Stethoscope, GraduationCap, Hammer, Paintbrush, Truck, Coffee, ShoppingBag, Headphones, Wifi, Monitor, Smartphone, Leaf, Sun, Moon, Droplets, Flame, Wind } from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, any> = {
  Scissors, Wrench, Heart, Star, Shield, Zap, Clock, MapPin, Phone, Mail, Users, Award, ThumbsUp,
  Briefcase, Home, Car, Utensils, Camera, Package, Sparkles, Lightbulb, Target, Palette, Music,
  BookOpen, Dumbbell, Stethoscope, GraduationCap, Hammer, Paintbrush, Truck, Coffee, ShoppingBag,
  Headphones, Wifi, Monitor, Smartphone, Leaf, Sun, Moon, Droplets, Flame, Wind, MessageSquare, Bot, Calendar, Globe,
};

interface WebsiteRendererProps {
  websiteData: WebsiteData;
  colorScheme: ColorScheme;
  businessPhone?: string;
  businessAddress?: string;
  businessEmail?: string;
  openingHours?: string[];
  showActivateButton?: boolean;
  onActivate?: () => void;
}

export default function WebsiteRenderer({
  websiteData, colorScheme, businessPhone, businessAddress, businessEmail, openingHours, showActivateButton, onActivate,
}: WebsiteRendererProps) {
  const cs = colorScheme;

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif", color: cs.text, backgroundColor: cs.background }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: `${cs.background}ee`, borderColor: `${cs.text}10` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-bold" style={{ color: cs.primary }}>{websiteData.businessName}</span>
            <div className="hidden md:flex items-center gap-6">
              {websiteData.sections.map((s, i) => (
                <a key={i} href={`#section-${i}`} className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: cs.textLight }}>
                  {s.headline?.split(" ").slice(0, 2).join(" ") || s.type}
                </a>
              ))}
            </div>
            {businessPhone && (
              <a href={`tel:${businessPhone}`} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-transform hover:scale-105" style={{ background: cs.gradient || cs.primary }}>
                <Phone className="h-4 w-4" /> Anrufen
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Sections */}
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <HeroSection section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
          {section.type === "about" && <AboutSection section={section} cs={cs} />}
          {section.type === "services" && <ServicesSection section={section} cs={cs} />}
          {section.type === "features" && <ServicesSection section={section} cs={cs} />}
          {section.type === "testimonials" && <TestimonialsSection section={section} cs={cs} />}
          {section.type === "faq" && <FAQSection section={section} cs={cs} />}
          {section.type === "contact" && <ContactSection section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />}
          {section.type === "cta" && <CTASection section={section} cs={cs} />}
          {section.type === "gallery" && <GallerySection section={section} cs={cs} />}
          {section.type === "team" && <TeamSection section={section} cs={cs} />}
        </div>
      ))}

      {/* Footer */}
      <footer className="py-8 border-t" style={{ borderColor: `${cs.text}10`, backgroundColor: cs.surface }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm" style={{ color: cs.textLight }}>{websiteData.footer?.text}</p>
          <p className="text-xs mt-2" style={{ color: `${cs.textLight}80` }}>
            Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeroSection({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36" style={{ background: cs.gradient || cs.primary }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {section.headline}
        </h1>
        {section.subheadline && (
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">{section.subheadline}</p>
        )}
        {section.content && (
          <p className="mt-4 text-base text-white/70 max-w-xl mx-auto">{section.content}</p>
        )}
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

function AboutSection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.background }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6" style={{ color: cs.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {section.headline}
        </h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-8" style={{ backgroundColor: cs.primary }} />
        <p className="text-lg leading-relaxed text-center" style={{ color: cs.textLight }}>{section.content}</p>
      </div>
    </section>
  );
}

function ServicesSection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.surface }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {section.headline}
        </h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {section.items?.map((item, i) => {
            const Icon = iconMap[item.icon || "Star"] || Star;
            return (
              <div key={i} className="p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: cs.background, borderColor: `${cs.text}08` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${cs.primary}15` }}>
                  <Icon className="h-6 w-6" style={{ color: cs.primary }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: cs.text }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: cs.textLight }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {section.headline}
        </h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border" style={{ backgroundColor: cs.surface, borderColor: `${cs.text}08` }}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: cs.textLight }}>"{item.description}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: cs.primary }}>
                  {item.author?.charAt(0) || "K"}
                </div>
                <span className="text-sm font-medium" style={{ color: cs.text }}>{item.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.surface }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {section.headline}
        </h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="space-y-3">
          {section.items?.map((item, i) => (
            <div key={i} className="rounded-xl border overflow-hidden" style={{ backgroundColor: cs.background, borderColor: `${cs.text}08` }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium pr-4" style={{ color: cs.text }}>{item.question || item.title}</span>
                {open === i ? <ChevronUp className="h-5 w-5 shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 shrink-0" style={{ color: cs.textLight }} />}
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: cs.textLight }}>{item.answer || item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string; address?: string; email?: string; hours?: string[] }) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {section.headline}
        </h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {section.content && <p className="text-base leading-relaxed" style={{ color: cs.textLight }}>{section.content}</p>}
            {phone && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cs.primary}15` }}>
                  <Phone className="h-5 w-5" style={{ color: cs.primary }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: cs.textLight }}>Telefon</p>
                  <a href={`tel:${phone}`} className="font-medium" style={{ color: cs.text }}>{phone}</a>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cs.primary}15` }}>
                  <Mail className="h-5 w-5" style={{ color: cs.primary }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: cs.textLight }}>E-Mail</p>
                  <a href={`mailto:${email}`} className="font-medium" style={{ color: cs.text }}>{email}</a>
                </div>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cs.primary}15` }}>
                  <MapPin className="h-5 w-5" style={{ color: cs.primary }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: cs.textLight }}>Adresse</p>
                  <p className="font-medium" style={{ color: cs.text }}>{address}</p>
                </div>
              </div>
            )}
            {hours && hours.length > 0 && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cs.primary}15` }}>
                  <Clock className="h-5 w-5" style={{ color: cs.primary }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: cs.textLight }}>Öffnungszeiten</p>
                  {hours.map((h, i) => (
                    <p key={i} className="text-sm" style={{ color: cs.text }}>{h}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="rounded-2xl border p-6" style={{ backgroundColor: cs.surface, borderColor: `${cs.text}08` }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: cs.text }}>Nachricht senden</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Ihr Name" className="w-full px-4 py-3 rounded-lg border text-sm" style={{ backgroundColor: cs.background, borderColor: `${cs.text}15`, color: cs.text }} />
              <input type="email" placeholder="Ihre E-Mail" className="w-full px-4 py-3 rounded-lg border text-sm" style={{ backgroundColor: cs.background, borderColor: `${cs.text}15`, color: cs.text }} />
              <textarea placeholder="Ihre Nachricht" rows={4} className="w-full px-4 py-3 rounded-lg border text-sm resize-none" style={{ backgroundColor: cs.background, borderColor: `${cs.text}15`, color: cs.text }} />
              <button type="submit" className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02]" style={{ background: cs.gradient || cs.primary }}>
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
    <section className="py-16 sm:py-24" style={{ background: cs.gradient || cs.primary }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{section.headline}</h2>
        {section.content && <p className="text-lg text-white/80 mb-8">{section.content}</p>}
        {section.ctaText && (
          <a href={section.ctaLink || "#"} className="inline-block px-8 py-3.5 rounded-full text-base font-semibold shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: "white", color: cs.primary }}>
            {section.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function GallerySection({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: cs.surface }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{section.headline}</h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border" style={{ borderColor: `${cs.text}08` }}>
              <div className="aspect-video flex items-center justify-center" style={{ backgroundColor: `${cs.primary}10` }}>
                <Camera className="h-8 w-8" style={{ color: `${cs.primary}40` }} />
              </div>
              {item.title && <div className="p-4"><p className="text-sm font-medium" style={{ color: cs.text }}>{item.title}</p></div>}
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
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: cs.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{section.headline}</h2>
        <div className="w-16 h-1 rounded-full mx-auto mb-12" style={{ backgroundColor: cs.primary }} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border" style={{ backgroundColor: cs.surface, borderColor: `${cs.text}08` }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: cs.primary }}>
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

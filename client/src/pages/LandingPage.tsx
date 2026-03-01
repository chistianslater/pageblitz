import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Zap, 
  Globe, 
  MousePointer2, 
  Sparkles, 
  Rocket, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Smartphone, 
  Clock, 
  Star,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Pageblitz</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Ablauf</a>
          <a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Preise</a>
        </div>

        <Button 
          onClick={() => navigate("/start")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 shadow-lg shadow-indigo-500/20"
        >
          Jetzt starten
        </Button>
      </div>
    </motion.nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group"
  >
    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
      <Icon className="w-6 h-6 text-indigo-400" />
    </div>
    <h3 className="text-white text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const GhostHandCreation = () => {
  return (
    <div className="relative w-full aspect-video rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Browser UI */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2 z-10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <div className="flex-1 max-w-md mx-auto h-6 bg-slate-950 rounded-md border border-slate-800 flex items-center px-3">
          <div className="w-full h-2 bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* Website Mockup Creation Animation */}
      <div className="absolute inset-0 pt-10 flex flex-col">
        {/* Animated Blocks */}
        <div className="flex-1 p-8 relative overflow-hidden">
          {/* Section 1: Hero */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-2/3 h-32 bg-indigo-500/10 rounded-2xl mb-6 relative overflow-hidden border border-indigo-500/20"
          >
             <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute inset-0 bg-indigo-500/20 origin-left"
            />
            <div className="p-6 relative">
              <motion.div 
                className="w-full h-4 bg-white/20 rounded-full mb-3"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 1 }}
              />
              <motion.div 
                className="w-3/4 h-3 bg-white/10 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ delay: 1.8, duration: 1 }}
              />
            </div>
          </motion.div>

          {/* Section 2: Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + i * 0.3, duration: 0.5 }}
                className="aspect-square bg-slate-900 border border-slate-800 rounded-xl p-4"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 mb-3" />
                <div className="w-full h-2 bg-slate-800 rounded-full mb-2" />
                <div className="w-2/3 h-2 bg-slate-800 rounded-full" />
              </motion.div>
            ))}
          </div>

          {/* ghost mouse pointer following a path */}
          <motion.div
            initial={{ x: "100%", y: "100%" }}
            animate={{ 
              x: ["90%", "20%", "70%", "10%", "50%"],
              y: ["90%", "10%", "40%", "20%", "60%"]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute z-20 pointer-events-none"
          >
            <div className="relative">
              <MousePointer2 className="w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" fill="white" />
              {/* Click pulse effect */}
              <motion.div 
                animate={{ 
                  scale: [1, 2, 1],
                  opacity: [0, 0.8, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  times: [0, 0.1, 1]
                }}
                className="absolute top-0 left-0 w-10 h-10 bg-indigo-400 rounded-full -translate-x-1/2 -translate-y-1/2 blur-md"
              />
            </div>
          </motion.div>

          {/* Typing effect simulation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="absolute top-1/2 left-8 right-8 text-center"
          >
            <motion.span
              className="text-white/40 font-mono text-xs"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              |
            </motion.span>
          </motion.div>

          {/* Sparkles Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1] }}
            className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-indigo-500/5 to-transparent"
          />
        </div>
      </div>
    </div>
  );
};

// --- Page Component ---

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0" 
        />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>Weltklasse KI-Website-Generator</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight mb-8"
          >
            Websites wie von <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              Geisterhand erstellt.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Keine Arbeit. Keine Technik. Nur ein Link. Erhalte in 3 Minuten eine professionelle, 
            SEO-optimierte Website, die deine Kunden lieben werden.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button 
              size="lg" 
              onClick={() => navigate("/start")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-16 px-10 text-lg font-bold shadow-xl shadow-indigo-600/20 group w-full sm:w-auto"
            >
              Kostenlose Website erstellen
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <span className="text-slate-400 text-sm font-medium">4.9/5 Sterne (320+ Unternehmen)</span>
            </div>
          </motion.div>

          {/* Visual Creation Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <GhostHandCreation />
          </motion.div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Erstellte Websites", value: "1.2k+" },
              { label: "SEO Sichtbarkeit", value: "+85%" },
              { label: "Durchschn. Zeit", value: "3 Min." },
              { label: "Google Bewertung", value: "4.9/5" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">Warum Pageblitz?</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Deine digitale Wunderwaffe.</h3>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Wir haben die Technik wegrationalisiert. Was bleibt, ist pure Performance für dein Business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Sparkles} 
              title="Keine Arbeit für dich"
              description="Vergiss Page-Builder. Unsere KI erstellt Struktur, Texte und Bildauswahl komplett automatisch basierend auf deinem GMB-Profil."
              delay={0.1}
            />
            <FeatureCard 
              icon={Clock} 
              title="In 3 Minuten fertig"
              description="Von der Eingabe deines Namens bis zur fertigen, professionellen Website vergehen weniger als 180 Sekunden."
              delay={0.2}
            />
            <FeatureCard 
              icon={Rocket} 
              title="Modernste Technologie"
              description="Blitzschnelle Ladezeiten, Next-Gen Hosting und maximale Performance auf allen Endgeräten."
              delay={0.3}
            />
            <FeatureCard 
              icon={Search} 
              title="SEO optimiert"
              description="Suchmaschinenoptimierung ist im Kern verankert. Deine Website wird gefunden, ohne dass du einen Finger rühren musst."
              delay={0.4}
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Mobile First"
              description="Über 70% deiner Kunden kommen mobil. Deine Pageblitz Website sieht auf dem iPhone besser aus als auf dem Desktop."
              delay={0.5}
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Rechtssicher (DSGVO)"
              description="Impressum, Datenschutz und Cookie-Banner werden automatisch generiert und aktuell gehalten."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How it Works Animation */}
      <section id="how-it-works" className="py-32 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">Der Ablauf</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Vom Link zum <br />Live-Gang.</h3>
              
              <div className="space-y-12">
                {[
                  { step: "01", title: "Google Link einfügen", desc: "Gib einfach deinen Google My Business Link ein. Den Rest machen wir." },
                  { step: "02", title: "KI-Magie beobachten", desc: "Unsere KI analysiert deine Daten, schreibt Texte und wählt Bilder aus." },
                  { step: "03", title: "Details anpassen", desc: "Ändere Farben, Texte oder Bilder in Echtzeit mit unserem intuitiven Chat-Editor." },
                  { step: "04", title: "Website veröffentlichen", desc: "Mit einem Klick ist deine Website unter deiner Wunschdomain erreichbar." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-3xl font-black text-slate-800 shrink-0">{item.step}</div>
                    <div>
                      <h4 className="text-white text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative p-2 rounded-[2.5rem] bg-slate-800/30 border border-slate-700/50 overflow-hidden shadow-2xl">
                 <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop" 
                  alt="Website Dashboard"
                  className="rounded-[2rem] shadow-lg opacity-80"
                 />
                 <motion.div 
                   animate={{ 
                     y: [0, -10, 0],
                   }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-2xl bg-slate-950/90 border border-indigo-500/30 shadow-2xl backdrop-blur-md"
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                       <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                     </div>
                     <div>
                       <div className="text-white font-bold">SEO optimiert</div>
                       <div className="text-slate-500 text-xs">Ready for Google Search</div>
                     </div>
                   </div>
                 </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">Transparente Preise</h2>
             <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Unschlagbarer Wert.</h3>
          </div>

          <div className="max-w-2xl mx-auto relative">
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-25" />
             <div className="relative bg-slate-900 border border-slate-800 rounded-[3rem] p-12 flex flex-col items-center">
                <div className="px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-8 uppercase tracking-widest">Alles Inklusive</div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl md:text-8xl font-black text-white tracking-tighter">39€</span>
                  <span className="text-slate-500 font-bold">/ Monat</span>
                </div>
                <p className="text-slate-400 text-sm mb-12">Keine versteckten Kosten. Monatlich kündbar.</p>

                <div className="w-full space-y-4 mb-12">
                   {[
                     "KI-Generierte Website & SEO-Texte",
                     "Premium Cloud Hosting inklusive",
                     "Wunschdomain (.de, .com, etc.)",
                     "Professionelles SSL Zertifikat",
                     "Automatische DSGVO-Updates",
                     "Chat-Support rund um die Uhr",
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                       </div>
                       <span className="text-slate-300 text-sm md:text-base">{item}</span>
                     </div>
                   ))}
                </div>

                <Button 
                  size="lg"
                  onClick={() => navigate("/start")}
                  className="w-full h-16 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 text-lg font-black transition-all shadow-xl shadow-white/10"
                >
                  Jetzt risikofrei starten
                </Button>
                <p className="text-slate-500 text-xs mt-6">Kostenlos testen. Keine Kreditkarte erforderlich.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="p-12 md:p-24 rounded-[3.5rem] bg-indigo-600 relative overflow-hidden text-center flex flex-col items-center">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
             
             <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight max-w-3xl">
               Bist du bereit für deine <br />Weltklasse Website?
             </h2>
             <p className="text-indigo-100 text-lg md:text-xl max-w-xl mx-auto mb-12 font-medium">
               Überlass die Technik uns. Konzentrier dich auf dein Business. Starte heute in nur 3 Minuten.
             </p>
             <Button 
                size="lg"
                onClick={() => navigate("/start")}
                className="bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl h-16 px-12 text-xl font-black shadow-2xl transition-all"
             >
                Website jetzt generieren
                <ArrowRight className="ml-2 w-6 h-6" />
             </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Pageblitz</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Pageblitz. Alle Rechte vorbehalten. · <a href="#" className="hover:text-white transition-colors">Impressum</a> · <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Smartphone className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

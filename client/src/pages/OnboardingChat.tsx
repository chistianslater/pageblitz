import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Sparkles, Plus, Trash2, Send, ChevronRight, ChevronLeft, Clock, Zap, Check, Monitor, X, Pencil, Upload, ImageIcon, Save, Edit2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import MacbookMockup from "@/components/MacbookMockup";
import type { WebsiteData, ColorScheme } from "@shared/types";
import { convertOpeningHoursToGerman } from "@shared/hours";
import { translateGmbCategory } from "@shared/gmbCategories";

// ── Types ────────────────────────────────────────────────────────────────────

interface SubPage {
  id: string;
  name: string;
  description: string;
}

interface MenuItem {
  name: string;
  description: string;
  price: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface PriceListItem {
  name: string;
  price: string;
}

interface PriceListCategory {
  id: string;
  name: string;
  items: PriceListItem[];
}

interface OnboardingData {
  businessCategory: string;
  businessName: string;
  tagline: string;
  description: string;
  usp: string;
  topServices: { title: string; description: string }[];
  targetAudience: string;
  legalOwner: string;
  legalStreet: string;
  legalZip: string;
  legalCity: string;
  legalEmail: string;
  legalPhone: string;
  legalVatId: string;
  colorScheme: ColorScheme;
  heroPhotoUrl: string; // selected or uploaded hero photo URL
  aboutPhotoUrl: string; // selected or uploaded about/second photo URL
  brandLogo: string; // base64 or "font:<fontName>"
  headlineFont: string; // Serif or Sans-serif font name
  addOnContactForm: boolean;
  addOnGallery: boolean;
  addOnMenu: boolean;       // Speisekarte (Restaurant, Café, Bäckerei)
  addOnMenuData: { headline?: string; categories: MenuCategory[] };
  addOnPricelist: boolean;  // Preisliste (Friseur, Beauty, Fitness)
  addOnPricelistData: { headline?: string; categories: PriceListCategory[] };
  subPages: SubPage[];
  email: string; // for FOMO reminder
  topServicesSkipped?: boolean;
}

type ChatStep =
  | "welcome"
  | "businessCategory"
  | "businessName"
  | "tagline"
  | "description"
  | "usp"
  | "services"
  | "targetAudience"
  | "legalOwner"
  | "legalStreet"
  | "legalZipCity"
  | "legalEmail"
  | "legalPhone"
  | "legalVat"
  | "colorScheme"
  | "heroPhoto"
  | "aboutPhoto"
  | "brandLogo"
  | "headlineFont"
  | "addons"
  | "editMenu"
  | "editPricelist"
  | "subpages"
  | "email"
  | "hideSections"
  | "preview"
  | "checkout";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: number;
  step?: ChatStep; // which step this user message answered
}

// ── Constants ────────────────────────────────────────────────────────────────

const FOMO_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const COLOR_SCHEMES: { id: string; label: string; description: string; colors: ColorScheme }[] = [
  {
    id: "trust",
    label: "Vertrauen & Professionalität",
    description: "Seriöses Blau und Grau – ideal für Beratung, Recht und Handwerk.",
    colors: {
      primary: "#2563EB",
      secondary: "#1E3A8A",
      accent: "#60A5FA",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
      textLight: "#475569"
    }
  },
  {
    id: "warm",
    label: "Wärme & Geborgenheit",
    description: "Warme Gold- und Erdtöne – perfekt für Gastronomie und Wellness.",
    colors: {
      primary: "#D97706",
      secondary: "#78350F",
      accent: "#FCD34D",
      background: "#FFFBEB",
      surface: "#FFFFFF",
      text: "#451A03",
      textLight: "#92400E"
    }
  },
  {
    id: "modern",
    label: "Modern & Klar",
    description: "Klassisches Schwarz/Weiß mit blauem Akzent – für moderne Brands.",
    colors: {
      primary: "#111827",
      secondary: "#374151",
      accent: "#3B82F6",
      background: "#FFFFFF",
      surface: "#F3F4F6",
      text: "#111827",
      textLight: "#6B7280"
    }
  },
  {
    id: "vibrant",
    label: "Energie & Aktivität",
    description: "Dynamisches Orange und Rot – ideal für Fitness und Sport.",
    colors: {
      primary: "#EA580C",
      secondary: "#9A3412",
      accent: "#F97316",
      background: "#FFF7ED",
      surface: "#FFFFFF",
      text: "#431407",
      textLight: "#9A3412"
    }
  }
];

const STEP_ORDER: ChatStep[] = [
  "businessCategory",
  "colorScheme",
  "heroPhoto",
  "aboutPhoto",
  "brandLogo",
  "headlineFont",
  "businessName",
  "tagline",
  "description",
  "usp",
  "services",
  "targetAudience",
  "legalOwner",
  "legalStreet",
  "legalZipCity",
  "legalEmail",
  "legalPhone",
  "legalVat",
  "addons",
  "editMenu",
  "editPricelist",
  "subpages",
  "email",
  "hideSections",
  "preview",
  "checkout",
];

const STEP_TO_SECTION_ID: Record<ChatStep, string | null> = {
  welcome: null,
  businessCategory: "hero",
  colorScheme: "hero",
  heroPhoto: "hero",
  aboutPhoto: "about",
  brandLogo: "header",
  headlineFont: "hero",
  businessName: "header",
  tagline: "hero",
  description: "hero",
  usp: "features",
  services: "services",
  targetAudience: "cta",
  legalOwner: "footer",
  legalStreet: "footer",
  legalZipCity: "footer",
  legalEmail: "footer",
  legalPhone: "footer",
  legalVat: "footer",
  addons: null,
  editMenu: "menu",
  editPricelist: "pricelist",
  subpages: null,
  email: null,
  hideSections: null,
  preview: null,
  checkout: null,
};

// ── Helper ───────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2);
}

function useCountdown(expiresAt: number | null) {
  const [remaining, setRemaining] = useState<number>(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  previewToken?: string;
  websiteId?: number;
}

export default function OnboardingChat({ previewToken, websiteId: websiteIdProp }: Props) {
  const [, navigate] = useLocation();

  // ── Website data ────────────────────────────────────────────────────────
  const { data: siteData, isLoading: siteLoading } = trpc.website.get.useQuery(
    { token: previewToken, id: websiteIdProp },
    { enabled: !!(previewToken || websiteIdProp) }
  );

  const websiteId = siteData?.website?.id ? Number(siteData.website.id) : undefined;
  const business = siteData?.business;

  // ── Chat state ──────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>("welcome");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingServices, setIsGeneratingServices] = useState(false);
  const [serviceSuggestions, setServiceSuggestions] = useState<{ title: string; description: string }[]>([]);
  const [initialServices, setInitialServices] = useState<{ title: string; description: string }[]>([]);

  // ── Exit intent ──────────────────────────────────────────────────────────
  const [showExitIntent, setShowExitIntent] = useState(false);

  useEffect(() => {
    // Standard beforeunload alert (browser default)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep !== "checkout" && currentStep !== "preview") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    // Exit intent (mouse leaves window upwards)
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent && currentStep !== "checkout" && currentStep !== "preview") {
        setShowExitIntent(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [currentStep, showExitIntent]);
  const [showSkipServicesWarning, setShowSkipServicesWarning] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set<string>());
  const [gmbÜbernommenEditMode, setGmbÜbernommenEditMode] = useState(false);
  const [quickReplySelected, setQuickReplySelected] = useState(false);
  const [inPlaceEditId, setInPlaceEditId] = useState<string | null>(null);
  const [inPlaceEditValue, setInPlaceEditValue] = useState("");
  const [showIndividualColors, setShowIndividualColors] = useState(false);
  const [previewScrollTop, setPreviewScrollTop] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll preview to current section
  useEffect(() => {
    const sectionId = STEP_TO_SECTION_ID[currentStep];
    if (!sectionId || !previewInnerRef.current) return;

    const element = previewInnerRef.current.querySelector(`[data-section="${sectionId}"]`);
    if (!element) return;

    const el = previewInnerRef.current;
    const elementTop = (element as HTMLElement).offsetTop;
    const viewportHeight = 1280 * 0.62;
    
    // Calculate max scroll and cap targetScroll to avoid white space at bottom
    const maxScroll = Math.max(0, el.scrollHeight - viewportHeight);
    const targetScroll = Math.max(0, Math.min(elementTop - viewportHeight / 3, maxScroll));

    // Animate via transition
    el.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    setPreviewScrollTop(targetScroll);

    const timer = setTimeout(() => {
      el.style.transition = "";
    }, 600);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // ── Onboarding data ─────────────────────────────────────────────────────
  const [data, setData] = useState<OnboardingData>({
    businessCategory: "",
    businessName: "",
    tagline: "",
    description: "",
    usp: "",
    topServices: [],
    targetAudience: "",
    legalOwner: "",
    legalStreet: "",
    legalZip: "",
    legalCity: "",
    legalEmail: "",
    legalPhone: "",
    legalVatId: "",
    colorScheme: {
      primary: "#3B82F6",
      secondary: "#1E3A8A",
      accent: "#60A5FA",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
      textLight: "#475569"
    },
    heroPhotoUrl: "",
    aboutPhotoUrl: "",
    brandLogo: "",
    headlineFont: "",
    addOnContactForm: true,
    addOnGallery: false,
    addOnMenu: false,
    addOnMenuData: { headline: "Unsere Speisekarte", categories: [{ id: "cat1", name: "Hauptspeisen", items: [{ name: "", description: "", price: "" }] }] },
    addOnPricelist: false,
    addOnPricelistData: { headline: "Unsere Preise", categories: [{ id: "cat1", name: "Leistungen", items: [{ name: "", price: "" }] }] },
    subPages: [],
    email: "",
  });

  // ── FOMO timer ──────────────────────────────────────────────────────────
  const [fomoExpiresAt, setFomoExpiresAt] = useState<number | null>(null);
  const countdown = useCountdown(fomoExpiresAt);

  useEffect(() => {
    const key = `pageblitz_fomo_${previewToken || websiteIdProp}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setFomoExpiresAt(parseInt(stored));
    } else {
      const exp = Date.now() + FOMO_DURATION_MS;
      localStorage.setItem(key, String(exp));
      setFomoExpiresAt(exp);
    }
  }, [previewToken, websiteIdProp]);

  // ── tRPC mutations ──────────────────────────────────────────────────────
  const saveStepMutation = trpc.onboarding.saveStep.useMutation();
  const completeMutation = trpc.onboarding.complete.useMutation();
  const checkoutMutation = trpc.checkout.createSession.useMutation();
  const generateTextMutation = trpc.onboarding.generateText.useMutation();
  const suggestServicesMutation = trpc.onboarding.suggestServices.useMutation();
  const uploadLogoMutation = trpc.onboarding.uploadLogo.useMutation();
  const generateWebsiteMutation = trpc.selfService.generateWebsite.useMutation();
  const [isGeneratingInitialWebsite, setIsGeneratingInitialWebsite] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationPhase, setGenerationPhase] = useState("");


  // ── Pre-fill colors from existing colorScheme ───────────────────────────
  useEffect(() => {
    if (siteData?.website?.colorScheme && !initialized) {
      const cs = siteData.website.colorScheme as ColorScheme;
      setData((prev) => ({
        ...prev,
        colorScheme: {
          primary: cs.primary || prev.colorScheme.primary,
          secondary: cs.secondary || prev.colorScheme.secondary,
          accent: cs.accent || prev.colorScheme.accent,
          background: cs.background || prev.colorScheme.background,
          surface: cs.surface || prev.colorScheme.surface,
          text: cs.text || prev.colorScheme.text,
          textLight: cs.textLight || prev.colorScheme.textLight,
          gradient: cs.gradient || prev.colorScheme.gradient,
        }
      }));
    }
  }, [siteData?.website?.colorScheme, initialized]);

  // ── Pre-fill from existing websiteData ─────────────────────────────────
  useEffect(() => {
    if (siteData?.website?.websiteData && !initialized) {
      const wd = siteData.website.websiteData as WebsiteData;
      setData((prev) => ({
        ...prev,
        businessName: wd.businessName || prev.businessName,
        tagline: wd.tagline || prev.tagline,
        description: wd.description || prev.description,
        ...(wd.designTokens?.headlineFont ? { headlineFont: wd.designTokens.headlineFont } : {}),
        // If there's an AI-suggested logo font in designTokens, use it as default
        ...(wd.designTokens?.headlineFont && !prev.brandLogo ? { brandLogo: `font:${wd.designTokens.headlineFont}` } : {}),
      }));

      const svcSection = wd.sections?.find((s) => s.type === "services");
      if (svcSection?.items) {
        const svcs = svcSection.items.map((i) => ({ title: i.title || "", description: i.description || "" }));
        setInitialServices(svcs);
        setData((prev) => {
          if (prev.topServices.length === 0) {
            return { ...prev, topServices: svcs };
          }
          return prev;
        });
      }
    }
  }, [siteData?.website?.websiteData, initialized]);

  // ── Pre-fill from GMB data ──────────────────────────────────────────────
  useEffect(() => {
    if (business && !initialized) {
      setData((prev) => ({
        ...prev,
        businessName: business.name || prev.businessName,
        businessCategory: translateGmbCategory((business as any).category || "") || prev.businessCategory,
        legalEmail: business.email || prev.legalEmail,
        legalPhone: business.phone || prev.legalPhone,
        email: business.email || prev.email,
      }));
    }
  }, [business, initialized]);

  // ── Scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Bot message helper (word-by-word typing animation) ─────────────────
  const addBotMessage = useCallback((content: string, delay = 600) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      // Show 3-dot indicator for `delay` ms, then start word-by-word typing
      setTimeout(() => {
        const msgId = genId();
        const words = content.split(" ");
        // Insert empty message first
        setMessages((prev) => [
          ...prev,
          { id: msgId, role: "bot", content: "", timestamp: Date.now() },
        ]);
        // Type word by word
        const WPM = 280; // words per minute
        const msPerWord = Math.max(20, Math.min(60000 / WPM, 80));
        let wordIdx = 0;
        const interval = setInterval(() => {
          wordIdx++;
          const partial = words.slice(0, wordIdx).join(" ");
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, content: partial } : m))
          );
          if (wordIdx >= words.length) {
            clearInterval(interval);
            setIsTyping(false);
            resolve();
          }
        }, msPerWord);
      }, delay);
    });
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: genId(), role: "user", content, timestamp: Date.now(), step: currentStep },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // ── Quick-reply suggestions per step ──────────────────────────────────
  const getQuickReplies = useCallback(
    (step: ChatStep): string[] => {
      const name = data.businessName || business?.name || "";
      switch (step) {
        case "businessCategory":
          return [
            "Restaurant",
            "Friseur",
            "Bauunternehmen",
            "Fitness-Studio",
            "Anwaltskanzlei",
            "Zahnarzt",
            "Handwerk",
            "Bar/Tapas",
          ];
        case "businessName":
          return name ? ["Ja, stimmt!"] : [];
        case "tagline":
          return [
            `Qualität, die bleibt – seit ${new Date().getFullYear() - 10}`,
            "Ihr Partner für perfekte Ergebnisse",
            "Schnell. Zuverlässig. Fair.",
          ];
        case "usp":
          return [
            "Kostenloser Vor-Ort-Termin innerhalb 24h",
            "Über 15 Jahre Erfahrung in der Region",
            "Festpreisgarantie – keine versteckten Kosten",
          ];
        case "targetAudience":
          return [
            "Privathaushalte in der Region",
            "Gewerbliche Kunden & Unternehmen",
            "Privat- und Gewerbekunden",
          ];
        case "legalOwner": {
          // Suggest owner name from GMB if available (business name as fallback hint)
          const suggestions: string[] = [];
          if (business?.name) suggestions.push(business.name);
          return suggestions;
        }
        case "legalStreet": {
          // Extract street from GMB address (format: "Straße 12, PLZ Stadt, Land")
          const suggestions: string[] = [];
          if (business?.address) {
            const parts = business.address.split(",");
            if (parts.length >= 1) {
              const street = parts[0].trim();
              if (street && /\d/.test(street)) suggestions.push(street);
            }
          }
          return suggestions;
        }
        case "legalZipCity": {
          // Extract zip+city from GMB address
          const suggestions: string[] = [];
          if (business?.address) {
            const parts = business.address.split(",");
            if (parts.length >= 2) {
              // Try second part which often is "PLZ Stadt"
              const zipCity = parts[1].trim();
              if (/^\d{5}\s+.+/.test(zipCity)) suggestions.push(zipCity);
              else if (parts.length >= 3) {
                const alt = parts[2].trim();
                if (/^\d{5}\s+.+/.test(alt)) suggestions.push(alt);
              }
            }
          }
          return suggestions;
        }
        case "legalEmail":
          return data.legalEmail ? [data.legalEmail] : (business?.email ? [business.email] : []);
        case "legalPhone":
          return data.legalPhone ? [data.legalPhone] : (business?.phone ? [business.phone] : []);
        case "email":
          return data.legalEmail ? [data.legalEmail] : (business?.email ? [business.email] : []);
        default:
          return [];
      }
    },
    [data.businessName, data.businessCategory, data.legalEmail, business?.name, business?.address, business?.email]
  );
  // ── Step promptss ────────────────────────────────────────────────────────
  const getStepPrompt = useCallback(
    (step: ChatStep): string => {
      const name = data.businessName || business?.name || "dein Unternehmen";
      switch (step) {
        case "businessCategory":
          return `Hallo! Bevor wir starten – welche **Branche** ist dein Unternehmen?\n\nBeispiel: Restaurant, Friseur, Bauunternehmen, Fitness-Studio, Anwaltskanzlei, etc.\n\nDas hilft mir, deine Website perfekt auf deine Branche abzustimmen!`;
        case "welcome":
          return `Hey! 👋 Ich bin dein persönlicher Website-Assistent. Ich helfe dir in wenigen Minuten, deine Website mit echten Infos zu befüllen – damit sie nicht mehr generisch klingt, sondern wirklich nach **${name}** aussieht.\n\nKlingt gut? Dann lass uns starten! 🚀`;
        case "businessName":
          return `Wie lautet der offizielle Name deines Unternehmens? Ich habe **${data.businessName || "noch keinen Namen"}** vorausgefüllt – stimmt das so?`;
        case "tagline":
          return `Super! Jetzt brauchen wir einen knackigen Slogan für **${data.businessName}** – einen Satz, der sofort klar macht, was ihr macht und warum ihr besonders seid.\n\nBeispiel: *"Qualität, die bleibt – seit 1998"* oder *"Ihr Dach in besten Händen"*\n\nOder soll ich dir einen Vorschlag machen? 💡\n\n*💡 Keine Sorge: Du kannst alle Texte später jederzeit ändern.*`;
        case "description":
          return `Perfekt! Jetzt eine kurze Beschreibung deines Unternehmens – 2-3 Sätze, die erklären, was ihr macht, für wen und was euch auszeichnet.\n\nKein Stress, ich kann dir auch einen Entwurf generieren! ✨\n\n*📸 Fotos, Texte und Farben kannst du übrigens später jederzeit austauschen.*`;
        case "usp":
          return `Was macht **${data.businessName}** einzigartig? Was können Kunden bei euch bekommen, was sie woanders nicht finden?\n\nDein Alleinstellungsmerkmal (USP) – in einem Satz. Ich helfe dir gerne dabei! 🎯`;
        case "services":
          return `Welche sind eure Top-Leistungen? Nenn mir 2-4 Dinge, die ihr am häufigsten anbietet.\n\nIch habe unten Felder vorbereitet – füll sie aus oder lass mich Vorschläge machen! 🔧\n\n*✅ Du kannst Leistungen später jederzeit ergänzen oder ändern.*`;
        case "targetAudience": {
          const cat = (data.businessCategory || "Dienstleistung").toLowerCase();
          let example = "Privatkunden und kleine Unternehmen in der Region";
          if (cat.includes("friseur") || cat.includes("hair") || cat.includes("beauty")) {
            example = "Damen und Herren in Bocholt, die Wert auf einen modernen Haarschnitt legen";
          } else if (cat.includes("restaurant") || cat.includes("essen") || cat.includes("food") || cat.includes("café")) {
            example = "Feinschmecker und Familien, die gerne in gemütlicher Atmosphäre speisen";
          } else if (cat.includes("bau") || cat.includes("handwerk") || cat.includes("dach")) {
            example = "Privathaushalte in Bocholt, die ein neues Dach brauchen oder sanieren möchten";
          } else if (cat.includes("arzt") || cat.includes("zahnarzt") || cat.includes("medizin")) {
            example = "Patienten, die eine kompetente und einfühlsame zahnärztliche Betreuung suchen";
          } else if (cat.includes("anwalt") || cat.includes("beratung") || cat.includes("recht")) {
            example = "Unternehmen und Privatpersonen, die rechtliche Unterstützung im Arbeitsrecht benötigen";
          }
          return `Für wen macht ihr das alles? Beschreib kurz eure idealen Kunden – wer ruft euch an, wer schreibt euch?\n\nBeispiel: *"${example}"*`;
        }
        case "legalOwner":
          return `📋 **Abschnitt 2: Rechtliche Pflichtangaben**\n\nFür ein vollständiges Impressum und eine korrekte Datenschutzerklärung brauche ich noch ein paar Angaben. Das dauert nur 2 Minuten!\n\nWer ist der **Inhaber oder Geschäftsführer**? (Vollständiger Name, z.B. „Max Mustermann")\n\n*🔒 Diese Angaben sind gesetzlich vorgeschrieben und werden nur im Impressum angezeigt.*`;
        case "legalStreet":
          return `Wie lautet die **Straße und Hausnummer** der Geschäftsadresse?\n\nBeispiel: *Musterstraße 12*`;
        case "legalZipCity":
          return `Und die **Postleitzahl und Stadt**?\n\nBeispiel: *46395 Bocholt*`;
        case "legalEmail":
          return `Welche **E-Mail-Adresse** soll im Impressum stehen? (Pflichtangabe – muss erreichbar sein)\n\nBeispiel: *info@musterfirma.de*`;
        case "legalPhone":
          return `Welche **Telefonnummer** soll im Impressum und auf der Website stehen?\n\nBeispiel: *+49 2871 123456*`;
        case "legalVat":
          return `Hast du eine **Umsatzsteuer-ID**? (z.B. DE123456789)\n\nFalls nicht vorhanden oder du Kleinunternehmer bist, schreib einfach "Nein" oder lass das Feld leer.`;
        case "hideSections":
          return `Wir sind fast fertig! 🎉 Hier siehst du alle Bereiche, die wir für dich vorbereitet haben. Standardmäßig sind alle aktiv (**grüner Haken**).\n\nFalls du einen Bereich zum Start doch lieber ausblenden möchtest, klicke ihn einfach an. Keine Sorge – du kannst alles später jederzeit im Dashboard wieder ändern!`;
        case "colorScheme":
          return `🎨 **Gestalte den Look deiner Website!**\n\nWähle ein Farbschema, das zu deinem Unternehmen passt. Alle Schemen wurden nach farbpsychologischen Aspekten optimiert.\n\n*💡 Keine Angst: Du kannst jede einzelne Farbe später in deinem Dashboard noch feiner anpassen!*`;
        case "heroPhoto":
          return `Schön! Jetzt wählen wir ein **Hauptbild** für deine Website. Du kannst ein eigenes Foto hochladen oder aus unseren Vorschlägen wählen – passend zu deiner Branche.`;
        case "aboutPhoto":
          return `Super! Jetzt wählen wir noch ein **zweites Bild** für den "\u00dcber uns"-Bereich deiner Website. Dieses Bild erscheint im Abschnitt, der dein Unternehmen vorstellt.`;
        case "brandLogo":
          return `Hast du ein **Logo**? Du kannst es hier hochladen.\n\nFalls nicht – kein Problem! Ich zeige dir drei verschiedene Schriftarten, mit denen wir deinen Firmennamen als Logo darstellen können. Wähle einfach deinen Favoriten.`;
        case "headlineFont":
          return `Perfekt! Jetzt wählen wir noch die **Schriftart für deine Überschriften**. Das gibt deiner Website einen ganz eigenen Charakter!\n\nMöchtest du eine **elegante Serifenschrift** (klassisch, zeitlos) oder eine **moderne Serifenlose** (clean, aktuell)?`;
        case "addons":
          return `⚡ **Abschnitt 3: Extras & Fertigstellung**\n\nFast geschafft! Möchtest du deine Website noch um optionale Features erweitern? Du kannst diese später jederzeit dazu buchen oder wieder entfernen.`;
        case "editMenu":
          return `Du hast die **Speisekarte** aktiviert! 📖\n\nHier kannst du schon mal ein paar Gerichte eintragen. Keine Sorge, du kannst das später jederzeit vervollständigen oder jetzt einfach überspringen.`;
        case "editPricelist":
          return `Du hast die **Preisliste** aktiviert! 🏷️\n\nHier kannst du deine wichtigsten Leistungen und Preise eintragen. Du kannst das auch später machen oder jetzt ein paar Beispiele hinzufügen.`;
        case "subpages":
          return `Brauchst du zusätzliche Unterseiten? Zum Beispiel *"Projekte"*, *"Referenzen"* oder *"Team"*.\n\nDu kannst sie hier vormerken und nach der Freischaltung in deinem **Kunden-Dashboard** ganz einfach mit Inhalten füllen. Jede individuelle Unterseite kostet +9,90 €/Monat.\n\n*⚖️ Wichtig: Die rechtlich notwendigen Seiten wie **Impressum** und **Datenschutz** sind bereits kostenlos enthalten und müssen hier nicht hinzugefügt werden.*`;
        case "email":
          return `Fast fertig! 🎊 An welche E-Mail-Adresse sollen wir deine Website-Infos und die Freischalt-Bestätigung schicken?`;
        case "preview":
          return `🎉 **Deine Website ist fertig personalisiert!**\n\nSchau dir unten die Vorschau an – das ist deine echte Website mit deinen echten Daten. Wenn alles passt, kannst du sie freischalten!\n\n*💡 Keine Sorge: Fotos, Texte, Farben – alles kann nach der Freischaltung jederzeit geändert werden. Du bist nicht festgelegt!*`;
        case "checkout":
          return `Bereit zum Freischalten? 🚀 Wähle dein Paket und starte durch!`;
        default:
          return "Nächster Schritt...";
      }
    },
    [data.businessName, business?.name, data.headlineFont]
  );

  // ── Initialize chat ─────────────────────────────────────────────────────
  // ── Auto-generate website if websiteData is missing ────────────────────
  useEffect(() => {
    if (siteLoading || !websiteId || isGeneratingInitialWebsite) return;
    const hasWebsiteData = !!(siteData?.website?.websiteData);
    if (!hasWebsiteData) {
      setIsGeneratingInitialWebsite(true);
      const phases = [
        "Analysiere dein Unternehmen...",
        "Erstelle Texte...",
        "Generiere Design...",
        "Finalisiere deine Website...",
      ];
      let phaseIdx = 0;
      setGenerationPhase(phases[0]);
      setGenerationProgress(10);
      const phaseInterval = setInterval(() => {
        phaseIdx = Math.min(phaseIdx + 1, phases.length - 1);
        setGenerationPhase(phases[phaseIdx]);
        setGenerationProgress(Math.min(10 + phaseIdx * 22, 88));
      }, 8000);
      generateWebsiteMutation.mutateAsync({ websiteId }).then(() => {
        clearInterval(phaseInterval);
        setGenerationProgress(100);
        setGenerationPhase("Website bereit!");
        setTimeout(() => {
          setIsGeneratingInitialWebsite(false);
        }, 800);
        // Refetch site data
        window.location.reload();
      }).catch(() => {
        clearInterval(phaseInterval);
        setIsGeneratingInitialWebsite(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteLoading, websiteId, siteData?.website?.websiteData]);

  useEffect(() => {
    if (!siteLoading && !initialized && !isGeneratingInitialWebsite) {
      setInitialized(true);
      const initChat = async () => {
        setCurrentStep("businessCategory");
        await addBotMessage(getStepPrompt("businessCategory"), 800);
      };
      initChat();
    }
  }, [siteLoading, initialized, isGeneratingInitialWebsite, addBotMessage, getStepPrompt]);

  // ── AI text generation ──────────────────────────────────────────────────
  const generateWithAI = async (field: keyof OnboardingData) => {
    if (!websiteId) return;
    const validFields = ["tagline", "description", "usp", "targetAudience"] as const;
    type ValidField = typeof validFields[number];
    if (!validFields.includes(field as ValidField)) return;
    setIsGenerating(true);
    try {
      const context = `Unternehmensname: ${data.businessName || business?.name || ""}, Branche: ${data.businessCategory || business?.category || "Handwerk"}, Adresse: ${business?.address || ""}, Beschreibung: ${data.description || ""}`;
      const result = await generateTextMutation.mutateAsync({
        websiteId,
        field: field as ValidField,
        context,
      });
      if (result.text) {
        setInputValue(result.text);
        toast.success("Text generiert! Du kannst ihn noch anpassen.");
      }
    } catch {
      toast.error("KI-Generierung fehlgeschlagen");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateServicesWithAI = async () => {
    if (!websiteId || isGeneratingServices) return;
    setIsGeneratingServices(true);
    try {
      const context = `Unternehmensname: ${data.businessName || business?.name || ""}, Branche: ${data.businessCategory || business?.category || "Handwerk"}, Adresse: ${business?.address || ""}`;
      const result = await suggestServicesMutation.mutateAsync({ websiteId, context });
      if (result.services && result.services.length > 0) {
        const suggested = result.services.map((s: { title: string; description: string }) => ({ 
          title: s.title, 
          description: s.description 
        }));
        setServiceSuggestions(suggested);
        
        // If current services are empty, pre-fill them for convenience
        if (data.topServices.length === 0 || (data.topServices.length === 1 && !data.topServices[0].title)) {
          setData((p) => ({ ...p, topServices: suggested.slice(0, 3) }));
          toast.success("Vorschläge generiert und eingefügt! Du kannst sie noch anpassen.");
        } else {
          toast.success("Neue Vorschläge generiert! Du kannst sie unten auswählen.");
        }
      }
    } catch {
      toast.error("KI-Vorschläge konnten nicht geladen werden");
    } finally {
      setIsGeneratingServices(false);
    }
  };

  // ── Step advancement ────────────────────────────────────────────────────
  // Steps that get a visual section divider in the chat (instead of a chat bubble)
  const SECTION_DIVIDERS: Partial<Record<ChatStep, { icon: string; title: string; subtitle: string }>> = {
    legalOwner: { icon: "\uD83D\uDCCB", title: "Abschnitt 2: Rechtliche Angaben", subtitle: "Impressum & Datenschutz \u2013 dauert nur 2 Minuten" },
    addons: { icon: "\u26A1", title: "Abschnitt 3: Extras & Fertigstellung", subtitle: "Optionale Features und letzter Schliff" },
  };

  const advanceToStep = useCallback(
    async (nextStep: ChatStep) => {
      setCurrentStep(nextStep);

      // If this step has a section divider, inject it as a special message type
      const divider = SECTION_DIVIDERS[nextStep];
      if (divider) {
        setMessages((prev) => [
          ...prev,
          { id: genId(), role: "divider" as any, content: JSON.stringify(divider), timestamp: Date.now() },
        ]);
        await new Promise((r) => setTimeout(r, 400));
      }

      // Show step prompt
      await addBotMessage(getStepPrompt(nextStep), divider ? 200 : 800);
      setTimeout(() => {
        if (["tagline", "description", "usp", "targetAudience"].includes(nextStep)) {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 900);
    },
    [addBotMessage, getStepPrompt, SECTION_DIVIDERS]
  );

  // Helper to save step data without blocking chat advancement
  const trySaveStep = async (stepIdx: number, stepData: Record<string, unknown>) => {
    if (!websiteId) return;
    try {
      await saveStepMutation.mutateAsync({ websiteId, step: stepIdx, data: stepData });
    } catch (e) {
      console.warn("[Onboarding] saveStep failed (non-blocking):", e);
    }
  };

  const handleSubmit = async (value?: string) => {
    // value=undefined means use inputValue; value="" means explicit empty (e.g. businessName confirm)
    const val = value !== undefined ? value.trim() : inputValue.trim();
    const isExplicitEmpty = value === "";
    if (!val && !isExplicitEmpty && !["addons", "subpages", "preview", "checkout"].includes(currentStep)) return;

    setInputValue("");

    const stepIdx = STEP_ORDER.indexOf(currentStep);
    const nextStep = STEP_ORDER[stepIdx + 1] as ChatStep;

    try {
      switch (currentStep) {
        case "businessName": {
          const confirmationPattern = /^(ja|j|yes|y|yep|yup|stimmt|ok|okay|klar)$/i;
          if (val && confirmationPattern.test(val.trim())) {
            addUserMessage(`Ja, "${data.businessName}" stimmt! ✓`);
          } else if (val) {
            addUserMessage(val);
            setData((p) => ({ ...p, businessName: val }));
            await trySaveStep(stepIdx, { businessName: val });
          } else {
            addUserMessage(`Ja, "${data.businessName}" stimmt! ✓`);
          }
          break;
        }
        case "tagline":
        case "description":
        case "usp":
        case "targetAudience": {
          // AI intent detection: if user asks for a suggestion, trigger AI generation
          const aiIntentPattern = /vorschlag|generier|mach mir|erstell|schreib|idee|hilf|automatisch|ki|ai\b/i;
          if (aiIntentPattern.test(val)) {
            addUserMessage(val);
            addBotMessage("Klar, ich generiere dir einen Vorschlag! ✨", 200);
            await generateWithAI(currentStep as keyof OnboardingData);
            return; // Don't advance, let user review and submit
          }
          // Use submitted value or fallback to inputValue if empty
          const finalValue = val || inputValue;
          if (!finalValue) return; // Don't submit empty
          
          addUserMessage(finalValue);
          setData((p) => ({ ...p, [currentStep]: finalValue }));
          await trySaveStep(stepIdx, { [currentStep]: finalValue });
          break;
        }
        case "legalOwner": {
          if (val.trim().split(/\s+/).length < 2) {
            toast.error("Bitte gib deinen vollständigen Namen ein (Vor- und Nachname)");
            return;
          }
          addUserMessage(val);
          setData((p) => ({ ...p, legalOwner: val }));
          await trySaveStep(stepIdx, { legalOwner: val });
          break;
        }
        case "legalStreet": {
          if (!val.trim()) { toast.error("Bitte gib Straße und Hausnummer ein"); return; }
          if (!/\d/.test(val)) { toast.error("Bitte gib auch die Hausnummer an (z.B. Musterstraße 12)"); return; }
          addUserMessage(val);
          setData((p) => ({ ...p, legalStreet: val }));
          await trySaveStep(stepIdx, { legalStreet: val });
          break;
        }
        case "legalZipCity": {
          const zipCityMatch = val.trim().match(/^(\d{5})\s+(.+)$/);
          if (!zipCityMatch) { toast.error("Bitte im Format 'PLZ Stadt' eingeben, z.B. 46395 Bocholt"); return; }
          const zip = zipCityMatch[1];
          const city = zipCityMatch[2];
          addUserMessage(val);
          setData((p) => ({ ...p, legalZip: zip, legalCity: city }));
          await trySaveStep(stepIdx, { legalZip: zip, legalCity: city });
          break;
        }
        case "legalEmail": {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) { toast.error("Bitte gib eine gültige E-Mail-Adresse ein (z.B. info@firma.de)"); return; }
          addUserMessage(val);
          setData((p) => ({ ...p, legalEmail: val.trim() }));
          await trySaveStep(stepIdx, { legalEmail: val.trim() });
          break;
        }
        case "legalPhone": {
          const phoneVal = val.trim();
          if (!phoneVal) { toast.error("Bitte gib eine Telefonnummer ein"); return; }
          addUserMessage(phoneVal);
          setData((p) => ({ ...p, legalPhone: phoneVal }));
          await trySaveStep(stepIdx, { legalPhone: phoneVal });
          break;
        }
        case "legalVat": {
          // Empty input or explicit "no" = Kleinunternehmer (no VAT ID)
          const trimmed = val.trim();
          const skip = ["nein", "keine", "n/a", "-", ""].includes(trimmed.toLowerCase()) || trimmed === "";
          const vatRegex = /^DE\d{9}$/i;
          if (!skip && !vatRegex.test(trimmed)) { toast.error("USt-IdNr. muss das Format DE123456789 haben. Schreib 'Nein' oder lass das Feld leer, wenn du keine hast."); return; }
          const vatId = skip ? "" : trimmed.toUpperCase();
          addUserMessage(skip ? "Keine USt-IdNr. (Kleinunternehmer)" : vatId);
          setData((p) => ({ ...p, legalVatId: vatId }));
          await trySaveStep(stepIdx, { legalVatId: vatId });
          break;
        }
        case "email":
          addUserMessage(val);
          setData((p) => ({ ...p, email: val }));
          break;
        case "businessCategory":
          if (val) {
            addUserMessage(val);
            setData((p) => ({ ...p, businessCategory: val }));
            await trySaveStep(stepIdx, { businessCategory: val });
          }
          break;
        case "colorScheme":
        case "brandLogo":
        case "heroPhoto":
        case "aboutPhoto":
        case "services":
        case "addons":
        case "editMenu":
        case "editPricelist":
        case "subpages":
          // These are handled by the interactive UI below
          return;
        case "hideSections":
          // handled by interactive UI
          break;
        case "preview":
          addUserMessage("Sieht super aus! Jetzt freischalten 🚀");
          break;
        case "checkout":
          break;
      }
    } catch (e) {
      console.error("[Onboarding] handleSubmit error:", e);
    }

    // Always advance to next step, even if save failed
    if (nextStep) {
      await advanceToStep(nextStep);
    }
  };

  // ── Checkout ────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!websiteId) return;
    try {
      // Complete onboarding first
      await completeMutation.mutateAsync({ websiteId });
      // Then create checkout session
      const session = await checkoutMutation.mutateAsync({
        websiteId,
        addOns: {
          subpages: data.subPages.filter((p) => p.name.trim()).length,
          gallery: data.addOnGallery,
          contactForm: data.addOnContactForm,
        },
      });
      window.open(session.url, "_blank");
      toast.success("Du wirst zu Stripe weitergeleitet...");
    } catch (e: any) {
      toast.error(e.message || "Fehler beim Checkout");
    }
  };

  // ── Live preview data: merge chat inputs into websiteData in real-time ──
  const liveWebsiteData = useMemo((): WebsiteData | undefined => {
    const base = siteData?.website?.websiteData as WebsiteData | undefined;
    if (!base) return undefined;

    // Deep-clone to avoid mutating the original
    const patched: WebsiteData = JSON.parse(JSON.stringify(base));

    // Patch top-level fields
    if (data.businessName) patched.businessName = data.businessName;
    if (data.tagline) patched.tagline = data.tagline;
    if (data.description) patched.description = data.description;

    // Filter hidden sections
    if (hiddenSections.size > 0) {
      patched.sections = patched.sections.filter((s) => !hiddenSections.has(s.type));
    }

    // Patch sections
    patched.sections = patched.sections.map((section) => {
      if (section.type === "hero") {
        return {
          ...section,
          headline: data.tagline || section.headline,
          subheadline: data.description || section.subheadline,
        };
      }
      if (section.type === "about") {
        return {
          ...section,
          content: data.description || section.content,
          headline: data.businessName ? `Über ${data.businessName}` : section.headline,
        };
      }
      if (section.type === "services") {
        // If user explicitly skipped services (topServices is empty array after skip), remove section
        if (data.topServicesSkipped) return null;
        const filledServices = data.topServices.filter((s) => s.title.trim());
        if (filledServices.length > 0) {
          return {
            ...section,
            items: filledServices.map((s) => ({ title: s.title, description: s.description })),
          };
        }
      }
      if (section.type === "cta") {
        return {
          ...section,
          content: data.targetAudience || section.content,
        };
      }
      return section;
    }).filter(Boolean) as typeof patched.sections;

    // Add Menu section if active
    if (data.addOnMenu && !hiddenSections.has("menu")) {
      const filledCategories = data.addOnMenuData.categories.filter(c => c.name.trim() || c.items.some(i => i.name.trim()));
      if (filledCategories.length > 0) {
        patched.sections.push({
          type: "menu",
          headline: data.addOnMenuData.headline || "Unsere Speisekarte",
          items: filledCategories.flatMap(c => c.items.filter(i => i.name.trim()).map(i => ({
            title: i.name,
            description: i.description,
            price: i.price,
            category: c.name
          }))) as any
        });
      }
    }

    // Add Pricelist section if active
    if (data.addOnPricelist && !hiddenSections.has("pricelist")) {
      const filledCategories = data.addOnPricelistData.categories.filter(c => c.name.trim() || c.items.some(i => i.name.trim()));
      if (filledCategories.length > 0) {
        patched.sections.push({
          type: "pricelist",
          headline: data.addOnPricelistData.headline || "Unsere Preise",
          items: filledCategories.flatMap(c => c.items.filter(i => i.name.trim()).map(i => ({
            title: i.name,
            price: i.price,
            category: c.name
          }))) as any
        });
      }
    }

    // Add Gallery section if active
    if (data.addOnGallery && !hiddenSections.has("gallery") && !patched.sections.some(s => s.type === "gallery")) {
      patched.sections.push({
        type: "gallery",
        headline: "Unsere Galerie",
        content: "Entdecken Sie einige Einblicke in unsere Arbeit und Projekte.",
        items: [
          { title: "Projekt 1" },
          { title: "Projekt 2" },
          { title: "Projekt 3" },
          { title: "Projekt 4" },
          { title: "Projekt 5" },
          { title: "Projekt 6" }
        ]
      });
    }

    // Ensure contact section exists so it can be shown (locked or unlocked)
    if (!patched.sections.some(s => s.type === "contact") && !hiddenSections.has("contact")) {
      patched.sections.push({
        type: "contact",
        headline: "Kontaktier uns",
        content: "Hast du Fragen? Schreib uns einfach eine Nachricht.",
        ctaText: "Nachricht senden"
      });
    }

    // Patch colorScheme override
    if (data.colorScheme) {
      (patched as any)._colorSchemeOverride = data.colorScheme;
    }

    // Patch brandLogo font or URL
    if (data.brandLogo && data.brandLogo.startsWith("font:")) {
      (patched as any)._brandLogoFont = data.brandLogo.replace("font:", "");
      delete (patched as any)._brandLogoUrl;
    } else if (data.brandLogo && data.brandLogo.startsWith("url:")) {
      (patched as any)._brandLogoUrl = data.brandLogo.replace("url:", "");
      delete (patched as any)._brandLogoFont;
    }

    return patched;
  }, [
    siteData?.website?.websiteData,
    data.businessName,
    data.tagline,
    data.description,
    data.topServices,
    data.topServicesSkipped,
    data.colorScheme,
    data.brandLogo,
    data.addOnContactForm,
    data.addOnGallery,
    data.addOnMenu,
    data.addOnMenuData,
    data.addOnPricelist,
    data.addOnPricelistData,
    hiddenSections,
  ]);

  // ── Price calculation ───────────────────────────────────────────────────
  const BASE_PRICE_INTRO = 39;  // First month intro offer
  const BASE_PRICE_REGULAR = 79; // Regular monthly price
  
  const totalPrice = (isFirstMonth = false) => {
    let price = isFirstMonth ? BASE_PRICE_INTRO : BASE_PRICE_REGULAR;
    if (data.addOnContactForm) price += 4.9;
    if (data.addOnGallery) price += 4.9;
    if (data.addOnMenu) price += 4.9;
    if (data.addOnPricelist) price += 4.9;
    price += data.subPages.length * 9.9;
    return price.toFixed(2);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (siteLoading || isGeneratingInitialWebsite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Deine Website wird erstellt</h2>
          <p className="text-slate-400 text-sm mb-6">{generationPhase || "Bitte warte einen Moment..."}</p>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-1000"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-3">{Math.round(generationProgress)}% abgeschlossen</p>
        </div>
      </div>
    );
  }

  const websiteData = siteData?.website?.websiteData as WebsiteData | undefined;
  const colorScheme = siteData?.website?.colorScheme as ColorScheme | undefined;
  const heroImageUrl = (siteData?.website as any)?.heroImageUrl as string | undefined;
  const aboutImageUrl = (siteData?.website as any)?.aboutImageUrl as string | undefined;
  const layoutStyle = (siteData?.website as any)?.layoutStyle as string | undefined;
  const slug = siteData?.website?.slug;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* FOMO Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span>
          ⚡ Diese Website ist noch{" "}
          <strong className="font-bold tabular-nums">{countdown}</strong> für dich reserviert
        </span>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Chat panel – smooth slide */}
        <div
          className="flex w-full lg:w-[360px] flex-col border-r border-slate-700/50 flex-shrink-0 items-center overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxWidth: chatHidden ? 0 : 360,
            minWidth: chatHidden ? 0 : undefined,
            opacity: chatHidden ? 0 : 1,
            pointerEvents: chatHidden ? "none" : undefined,
          }}
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-sm">Pageblitz Assistent</h1>
              <p className="text-slate-400 text-xs">Personalisiert deine Website in Minuten</p>
            </div>
            {/* Price badge */}
            <div className="flex-shrink-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-center">
              <p className="text-amber-300 text-xs font-bold leading-tight">Ab 39 €</p>
              <p className="text-amber-400/70 text-[10px] leading-tight">/Monat</p>
            </div>

          </div>

          {/* Messages + Input: flex column, messages scroll, input sticky */}
          <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {messages.map((msg) => {
              // Section divider rendering
              if ((msg.role as string) === "divider") {
                let divInfo: { icon: string; title: string; subtitle: string } | null = null;
                try { divInfo = JSON.parse(msg.content); } catch {}
                if (!divInfo) return null;
                return (
                  <div key={msg.id} className="flex items-center gap-3 my-2 px-1">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                    <div className="flex items-center gap-2 bg-slate-700/80 border border-slate-600/60 rounded-xl px-4 py-2 flex-shrink-0 shadow-sm">
                      <span className="text-base">{divInfo.icon}</span>
                      <div>
                        <p className="text-white text-xs font-bold leading-tight">{divInfo.title}</p>
                        <p className="text-slate-400 text-xs leading-tight">{divInfo.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                  </div>
                );
              }

              return (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  {/* In-place edit mode */}
                  {msg.role === "user" && inPlaceEditId === msg.id ? (
                    <div className="flex flex-col gap-2 max-w-[85%]">
                      {/* Color picker for color steps */}
                      {(msg.step === "brandColor" || msg.step === "brandSecondaryColor") ? (
                        <div className="flex flex-col gap-3 bg-slate-700/80 rounded-xl p-3 border border-blue-500">
                          <p className="text-slate-300 text-xs">
                            {msg.step === "brandColor" ? "Hauptfarbe wählen:" : "Sekundärfarbe wählen:"}
                          </p>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/) ? inPlaceEditValue : "#3b82f6"}
                              onChange={(e) => setInPlaceEditValue(e.target.value)}
                              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-500 bg-transparent"
                              style={{ padding: "2px" }}
                            />
                            <div className="flex-1">
                              <div
                                className="w-full h-10 rounded-lg border border-slate-500"
                                style={{ backgroundColor: inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/) ? inPlaceEditValue : "#3b82f6" }}
                              />
                              <p className="text-slate-400 text-xs mt-1 font-mono">{inPlaceEditValue}</p>
                            </div>
                          </div>
                          {/* Quick presets */}
                          <div className="flex flex-wrap gap-1.5">
                            {["#2563eb","#16a34a","#dc2626","#d97706","#7c3aed","#0891b2","#db2777","#1a1a1a","#f5f5f5","#b8860b"].map((c) => (
                              <button
                                key={c}
                                onClick={() => setInPlaceEditValue(c)}
                                className="w-6 h-6 rounded-full border-2 transition-all"
                                style={{ backgroundColor: c, borderColor: inPlaceEditValue === c ? "white" : "transparent" }}
                                title={c}
                              />
                            ))}
                          </div>
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => setInPlaceEditId(null)}
                              className="px-2 py-1 text-xs rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
                            >Abbrechen</button>
                            <button
                              onClick={() => {
                                const step = msg.step;
                                if (!step || !inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/)) { setInPlaceEditId(null); return; }
                                const newVal = inPlaceEditValue;
                                setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                                setData((p) => ({ ...p, [step]: newVal }));
                                setInPlaceEditId(null);
                              }}
                              className="px-2 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                            >Übernehmen</button>
                          </div>
                        </div>
                      ) : (
                        <>
                        <textarea
                          className="bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-blue-500 outline-none resize-none min-h-[60px] w-full"
                          value={inPlaceEditValue}
                          onChange={(e) => setInPlaceEditValue(e.target.value)}
                          autoFocus
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              const step = msg.step;
                              if (!step || !inPlaceEditValue.trim()) { setInPlaceEditId(null); return; }
                              const newVal = inPlaceEditValue.trim();
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                              if (step === "legalZipCity") {
                                const m = newVal.match(/^(\d{5})\s+(.+)$/);
                                if (m) setData((p) => ({ ...p, legalZip: m[1], legalCity: m[2] }));
                              } else if (step in data) {
                                setData((p) => ({ ...p, [step]: newVal }));
                              }
                              setInPlaceEditId(null);
                            }
                            if (e.key === "Escape") setInPlaceEditId(null);
                          }}
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setInPlaceEditId(null)}
                            className="px-2 py-1 text-xs rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
                          >Abbrechen</button>
                          <button
                            onClick={() => {
                              const step = msg.step;
                              if (!step || !inPlaceEditValue.trim()) { setInPlaceEditId(null); return; }
                              const newVal = inPlaceEditValue.trim();
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                              if (step === "legalZipCity") {
                                const m = newVal.match(/^(\d{5})\s+(.+)$/);
                                if (m) setData((p) => ({ ...p, legalZip: m[1], legalCity: m[2] }));
                              } else if (step in data) {
                                setData((p) => ({ ...p, [step]: newVal }));
                              }
                              setInPlaceEditId(null);
                            }}
                            className="px-2 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                          >Speichern</button>
                        </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "bot"
                            ? "bg-slate-700/80 text-slate-100 rounded-tl-sm"
                            : "bg-blue-600 text-white rounded-tr-sm"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.+?)\*/g, "<em>$1</em>")
                            .replace(/\n/g, "<br/>"),
                        }}
                      />
                      {msg.role === "user" && msg.step && (
                        <button
                          onClick={() => {
                            setInPlaceEditId(msg.id);
                            setInPlaceEditValue(msg.content);
                          }}
                          className="w-6 h-6 rounded-md bg-slate-600/50 hover:bg-slate-500/50 flex items-center justify-center transition-colors flex-shrink-0"
                          title="Antwort bearbeiten"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-slate-700/80 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Interactive step UI */}
            {!isTyping && currentStep === "services" && (
              <div className="ml-9 space-y-3">
                {/* Suggestions Section */}
                {(serviceSuggestions.length > 0 || initialServices.length > 0) && (
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-4">
                    {/* Initial Suggestions */}
                    {initialServices.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3 h-3" /> Vorschläge aus Entwurf
                          </p>
                          <button 
                            onClick={() => {
                              const currentValid = data.topServices.filter(s => s.title.trim());
                              const toAdd = initialServices.filter(s => !currentValid.some(ts => ts.title === s.title));
                              setData(p => ({ ...p, topServices: [...currentValid, ...toAdd] }));
                              toast.success(`${toAdd.length} Leistungen hinzugefügt!`);
                            }}
                            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors uppercase font-bold tracking-wider underline underline-offset-2"
                          >
                            Alle übernehmen
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {initialServices.map((s, idx) => {
                            const currentValid = data.topServices.filter(ts => ts.title.trim());
                            const isAlreadyAdded = currentValid.some(ts => ts.title === s.title);
                            return (
                              <button
                                key={`init-${idx}`}
                                onClick={() => {
                                  if (isAlreadyAdded) {
                                    setData(p => ({ ...p, topServices: p.topServices.filter(ts => ts.title !== s.title) }));
                                    toast.success(`"${s.title}" entfernt`);
                                  } else {
                                    setData(p => ({ ...p, topServices: [...currentValid, s] }));
                                    toast.success(`"${s.title}" hinzugefügt!`);
                                  }
                                }}
                                className={`text-left p-2 rounded-xl border transition-all group ${
                                  isAlreadyAdded 
                                    ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.1)]" 
                                    : "bg-slate-700/40 border-slate-600/50 hover:border-slate-500"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-[11px] font-bold truncate ${isAlreadyAdded ? 'text-blue-300' : 'text-slate-300 group-hover:text-white'}`}>
                                    {s.title}
                                  </span>
                                  {isAlreadyAdded ? (
                                    <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                  ) : (
                                    <Plus className="w-3 h-3 text-slate-500 group-hover:text-blue-400 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* AI Suggestions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-violet-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" /> KI-Vorschläge
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={generateServicesWithAI}
                            disabled={isGeneratingServices}
                            className="text-[10px] text-violet-400 hover:text-violet-200 transition-colors uppercase font-bold tracking-wider"
                          >
                            {isGeneratingServices ? "Lädt..." : "Neu generieren"}
                          </button>
                          {serviceSuggestions.length > 0 && (
                            <button 
                              onClick={() => {
                                const currentValid = data.topServices.filter(s => s.title.trim());
                                const toAdd = serviceSuggestions.filter(s => !currentValid.some(ts => ts.title === s.title));
                                setData(p => ({ ...p, topServices: [...currentValid, ...toAdd] }));
                                toast.success(`${toAdd.length} Leistungen hinzugefügt!`);
                              }}
                              className="text-[10px] text-violet-400 hover:text-violet-200 transition-colors uppercase font-bold tracking-wider underline underline-offset-2"
                            >
                              Alle übernehmen
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {serviceSuggestions.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {serviceSuggestions.map((s, idx) => {
                            const currentValid = data.topServices.filter(ts => ts.title.trim());
                            const isAlreadyAdded = currentValid.some(ts => ts.title === s.title);
                            return (
                              <button
                                key={`ai-${idx}`}
                                onClick={() => {
                                  if (isAlreadyAdded) {
                                    setData(p => ({ ...p, topServices: p.topServices.filter(ts => ts.title !== s.title) }));
                                    toast.success(`"${s.title}" entfernt`);
                                  } else {
                                    setData(p => ({ ...p, topServices: [...currentValid, s] }));
                                    toast.success(`"${s.title}" hinzugefügt!`);
                                  }
                                }}
                                className={`text-left p-2 rounded-xl border transition-all group ${
                                  isAlreadyAdded 
                                    ? "bg-violet-500/10 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.1)]" 
                                    : "bg-slate-700/40 border-slate-600/50 hover:border-violet-500/40"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-[11px] font-bold truncate ${isAlreadyAdded ? 'text-violet-300' : 'text-slate-300 group-hover:text-violet-200'}`}>
                                    {s.title}
                                  </span>
                                  {isAlreadyAdded ? (
                                    <Check className="w-3 h-3 text-violet-400 flex-shrink-0" />
                                  ) : (
                                    <Plus className="w-3 h-3 text-slate-500 group-hover:text-violet-400 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-[9px] text-slate-500 line-clamp-1 leading-tight group-hover:text-slate-400">
                                  {s.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <button
                          onClick={generateServicesWithAI}
                          disabled={isGeneratingServices}
                          className="w-full py-3 rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 transition-colors flex flex-col items-center justify-center gap-1 group"
                        >
                          {isGeneratingServices ? (
                            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                              <span className="text-[11px] text-violet-300 font-bold uppercase tracking-wider">KI-Vorschläge generieren</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Manual List Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Deine Auswahl</p>
                    <button 
                      onClick={() => setData(p => ({ ...p, topServices: [] }))}
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase font-bold tracking-wider"
                    >
                      Alle leeren
                    </button>
                  </div>
                  
                  {data.topServices.length === 0 ? (
                    <div className="py-8 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl">
                      <p className="text-xs text-slate-500">Noch keine Leistungen hinzugefügt.</p>
                      <button 
                        onClick={() => setData(p => ({ ...p, topServices: [{ title: "", description: "" }] }))}
                        className="text-xs text-blue-400 font-bold mt-2 hover:underline"
                      >
                        Erste Leistung anlegen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.topServices.map((svc, i) => (
                        <div key={i} className="bg-slate-700/60 rounded-xl p-3 space-y-2 border border-slate-600/30">
                          <div className="flex items-center gap-2">
                            <input
                              className="flex-1 bg-slate-600/50 text-white text-sm px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder={`Name der Leistung (z.B. Haarschnitt)`}
                              value={svc.title}
                              onChange={(e) => {
                                const updated = [...data.topServices];
                                updated[i] = { ...updated[i], title: e.target.value };
                                setData((p) => ({ ...p, topServices: updated }));
                              }}
                            />
                            <button
                              onClick={() => {
                                const updated = data.topServices.filter((_, idx) => idx !== i);
                                setData((p) => ({ ...p, topServices: updated }));
                              }}
                              className="flex-shrink-0 text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-600/50"
                              title="Leistung entfernen"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            className="w-full bg-slate-600/50 text-white text-[11px] px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Kurze Beschreibung (optional)"
                            value={svc.description}
                            onChange={(e) => {
                              const updated = [...data.topServices];
                              updated[i] = { ...updated[i], description: e.target.value };
                              setData((p) => ({ ...p, topServices: updated }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skip warning dialog */}
                {showSkipServicesWarning && (
                  <div className="bg-amber-900/40 border border-amber-500/50 rounded-xl p-3 space-y-2">
                    <p className="text-amber-200 text-xs font-semibold">⚠️ Wirklich ohne Leistungen fortfahren?</p>
                    <p className="text-amber-300/80 text-xs leading-relaxed">
                      Websites ohne Leistungsübersicht konvertieren deutlich schlechter. Kunden wollen auf einen Blick sehen, was du anbietest – das ist oft der wichtigste Faktor für eine Anfrage.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSkipServicesWarning(false)}
                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Doch eintragen
                      </button>
                      <button
                        onClick={async () => {
                          setShowSkipServicesWarning(false);
                          addUserMessage("Keine Leistungen anzeigen");
                          setData((p) => ({ ...p, topServices: [], topServicesSkipped: true }));
                          await trySaveStep(STEP_ORDER.indexOf("services"), { topServices: [] });
                          await advanceToStep("targetAudience");
                        }}
                        className="flex-1 text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Trotzdem überspringen
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setData((p) => ({ ...p, topServices: [...p.topServices, { title: "", description: "" }] }))}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Leistung hinzufügen
                  </button>
                  {!showSkipServicesWarning && (
                    <button
                      onClick={() => setShowSkipServicesWarning(true)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                    >
                      Keine Leistungen anzeigen
                    </button>
                  )}
                  <button
                    disabled={isTyping || saveStepMutation.isPending}
                    onClick={async () => {
                      if (isTyping) return;
                      const filtered = data.topServices.filter((s) => s.title.trim());
                      if (filtered.length === 0) {
                        setShowSkipServicesWarning(true);
                        return;
                      }
                      addUserMessage(filtered.map((s) => `✓ ${s.title}`).join("\n"));
                      await trySaveStep(STEP_ORDER.indexOf("services"), { topServices: filtered });
                      await advanceToStep("targetAudience");
                    }}
                    className="ml-auto flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weiter <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {!isTyping && currentStep === "businessCategory" && (
              <div className="ml-9 space-y-3">
                {/* Show GMB category as pre-selected if available */}
                {data.businessCategory && (
                  <div className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/40 rounded-xl px-3 py-2">
                    <span className="text-emerald-400 text-xs">✓ Aus Google My Business:</span>
                    <span className="text-emerald-200 text-sm font-medium">{data.businessCategory}</span>
                    <button
                      onClick={async () => {
                        addUserMessage(`Branche: ${data.businessCategory} ✓`);
                        await trySaveStep(STEP_ORDER.indexOf("businessCategory"), { businessCategory: data.businessCategory });
                        await advanceToStep("colorScheme");
                      }}
                      className="ml-auto text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                      Übernehmen
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400">Branche auswählen:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Restaurant", icon: "🍽️" },
                    { label: "Bar / Tapas", icon: "🍷" },
                    { label: "Café / Bistro", icon: "☕" },
                    { label: "Bäckerei", icon: "🥐" },
                    { label: "Friseur", icon: "✂️" },
                    { label: "Beauty / Kosmetik", icon: "💅" },
                    { label: "Bauunternehmen", icon: "🏗️" },
                    { label: "Handwerk", icon: "🔧" },
                    { label: "Fitness-Studio", icon: "💪" },
                    { label: "Arzt / Zahnarzt", icon: "🏥" },
                    { label: "Rechtsanwalt", icon: "⚖️" },
                    { label: "Immobilien", icon: "🏠" },
                    { label: "IT / Software", icon: "💻" },
                    { label: "Fotografie", icon: "📷" },
                    { label: "Autowerkstatt", icon: "🚗" },
                    { label: "Hotel / Pension", icon: "🏨" },
                  ].map(({ label, icon }) => (
                    <button
                      key={label}
                      onClick={() => handleSubmit(label)}
                      className={`flex items-center gap-1.5 text-sm border px-3 py-2 rounded-xl transition-all ${
                        data.businessCategory === label
                          ? "bg-blue-600/40 border-blue-500/60 text-white"
                          : "bg-slate-700/60 hover:bg-blue-600/40 border-slate-600/50 hover:border-blue-500/60 text-slate-200 hover:text-white"
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                {/* Free-text input for custom category */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Andere Branche eintippen…"
                    className="flex-1 bg-slate-700/60 border border-slate-600/50 text-slate-200 placeholder-slate-500 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500/60 focus:bg-blue-600/10 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                        handleSubmit((e.target as HTMLInputElement).value.trim());
                      }
                    }}
                  />
                  <button
                    className="bg-slate-600 hover:bg-slate-500 text-white text-sm px-3 py-2 rounded-xl transition-colors flex-shrink-0"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      if (input?.value.trim()) handleSubmit(input.value.trim());
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
            {!isTyping && currentStep === "colorScheme" && (
              <div className="ml-9 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => {
                        setData((p) => ({ ...p, colorScheme: scheme.colors }));
                        setShowIndividualColors(false);
                      }}
                      className={`text-left p-4 rounded-2xl border-2 transition-all group ${
                        JSON.stringify(data.colorScheme) === JSON.stringify(scheme.colors)
                          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                          : "border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className={`text-sm font-bold transition-colors ${
                          JSON.stringify(data.colorScheme) === JSON.stringify(scheme.colors) ? "text-white" : "text-slate-200 group-hover:text-white"
                        }`}>
                          {scheme.label}
                        </p>
                        {JSON.stringify(data.colorScheme) === JSON.stringify(scheme.colors) && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mb-3 line-clamp-2 italic">
                        {scheme.description}
                      </p>
                      <div className="flex gap-1">
                        {[scheme.colors.primary, scheme.colors.secondary, scheme.colors.accent, scheme.colors.background].map((c, i) => (
                          <div key={i} className="h-6 flex-1 rounded-md border border-white/10" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowIndividualColors(!showIndividualColors)}
                    className={`w-full py-3 px-4 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider ${
                      showIndividualColors 
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-400" 
                        : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    <Settings2 className="w-4 h-4" />
                    Farben individuell anpassen
                  </button>

                  {showIndividualColors && (
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: "primary", label: "Hauptfarbe" },
                          { key: "secondary", label: "Sekundärfarbe" },
                          { key: "accent", label: "Akzentfarbe" },
                          { key: "background", label: "Hintergrund" },
                          { key: "surface", label: "Oberflächen" },
                          { key: "text", label: "Textfarbe" },
                        ].map((item) => (
                          <div key={item.key} className="space-y-1.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                            <div className="flex gap-2">
                              <div 
                                className="w-8 h-8 rounded-lg border border-slate-600 flex-shrink-0 cursor-pointer overflow-hidden relative"
                                style={{ backgroundColor: (data.colorScheme as any)[item.key] }}
                              >
                                <input 
                                  type="color" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  value={(data.colorScheme as any)[item.key]}
                                  onChange={(e) => setData(p => ({
                                    ...p,
                                    colorScheme: { ...p.colorScheme, [item.key]: e.target.value }
                                  }))}
                                />
                              </div>
                              <input 
                                type="text"
                                className="flex-1 bg-slate-700/60 text-white text-[11px] px-2 py-1 rounded-lg outline-none border border-slate-600/50 font-mono"
                                value={(data.colorScheme as any)[item.key]}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                                    setData(p => ({
                                      ...p,
                                      colorScheme: { ...p.colorScheme, [item.key]: v }
                                    }));
                                  }
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  disabled={isTyping}
                  onClick={async () => {
                    if (isTyping) return;
                    addUserMessage(`Farbschema ausgewählt ✓`);
                    await trySaveStep(STEP_ORDER.indexOf("colorScheme"), { colorScheme: data.colorScheme });
                    await advanceToStep("heroPhoto");
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  Farben übernehmen <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isTyping && currentStep === "heroPhoto" && (
              <HeroPhotoStep
                businessCategory={data.businessCategory}
                heroPhotoUrl={data.heroPhotoUrl}
                websiteId={websiteId}
                onSelect={(url) => setData((p) => ({ ...p, heroPhotoUrl: url }))}
                onNext={async () => {
                  const url = data.heroPhotoUrl || "";
                  const label = url ? "Hauptbild ausgewählt ✓" : "Bestehendes Hauptbild behalten ✓";
                  addUserMessage(label);
                  await trySaveStep(STEP_ORDER.indexOf("heroPhoto"), { heroPhotoUrl: url });
                  await advanceToStep("aboutPhoto");
                }}
              />
            )}
            {!isTyping && currentStep === "aboutPhoto" && (
              <HeroPhotoStep
                businessCategory={data.businessCategory}
                heroPhotoUrl={data.aboutPhotoUrl}
                websiteId={websiteId}
                isAboutPhoto
                onSelect={(url) => setData((p) => ({ ...p, aboutPhotoUrl: url }))}
                onNext={async () => {
                  const url = data.aboutPhotoUrl || "";
                  const label = url ? "Über-uns-Bild ausgewählt ✓" : "Bestehendes Bild behalten ✓";
                  addUserMessage(label);
                  await trySaveStep(STEP_ORDER.indexOf("aboutPhoto"), { aboutPhotoUrl: url });
                  await advanceToStep("brandLogo");
                }}
              />
            )}

            {!isTyping && currentStep === "brandLogo" && (
              <div className="ml-9 space-y-3">
                <p className="text-slate-400 text-xs">Wähle eine Schriftart für deinen Firmennamen als Logo:</p>
                {[
                  { font: "Playfair Display", label: "Elegant & Klassisch", style: { fontFamily: "'Playfair Display', serif", fontWeight: 700 } },
                  { font: "Oswald", label: "Stark & Modern", style: { fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const } },
                  { font: "Montserrat", label: "Sauber & Professionell", style: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "0.02em" } },
                ].map((opt) => (
                  <button
                    key={opt.font}
                    onClick={() => setData((p) => ({ ...p, brandLogo: `font:${opt.font}` }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${data.brandLogo === `font:${opt.font}` ? "border-blue-500 bg-blue-500/10" : "border-slate-600 bg-slate-700/40 hover:border-slate-500"}`}
                  >
                    <p className="text-white text-lg mb-1" style={opt.style}>{data.businessName || business?.name || "Mein Unternehmen"}</p>
                    <p className="text-slate-400 text-xs">{opt.label}</p>
                  </button>
                ))}

                {/* Logo upload option */}
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-xs mb-2">Oder eigenes Logo hochladen:</p>
                  {data.brandLogo?.startsWith("url:") ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-blue-500 bg-blue-500/10">
                      <img src={data.brandLogo.replace("url:", "")} alt="Logo" className="h-10 w-auto max-w-[120px] object-contain rounded" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Logo hochgeladen ✓</p>
                        <button
                          onClick={() => setData((p) => ({ ...p, brandLogo: "font:Montserrat" }))}
                          className="text-slate-400 text-xs hover:text-white transition-colors"
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-700/40 hover:border-slate-500 cursor-pointer transition-all ${uploadLogoMutation.isPending ? "opacity-50 pointer-events-none" : ""}`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !websiteId) return;
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("Logo darf maximal 2 MB groß sein.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = (reader.result as string).split(",")[1];
                            try {
                              const result = await uploadLogoMutation.mutateAsync({
                                websiteId,
                                imageData: base64,
                                mimeType: file.type,
                              });
                              setData((p) => ({ ...p, brandLogo: `url:${result.url}` }));
                              toast.success("Logo erfolgreich hochgeladen!");
                            } catch {
                              toast.error("Upload fehlgeschlagen. Bitte erneut versuchen.");
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      {uploadLogoMutation.isPending ? (
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="text-white text-sm">{uploadLogoMutation.isPending ? "Wird hochgeladen…" : "Bild auswählen"}</p>
                        <p className="text-slate-400 text-xs">PNG, JPG oder SVG · max. 2 MB</p>
                      </div>
                      <Upload className="w-4 h-4 text-slate-500 ml-auto" />
                    </label>
                  )}
                </div>

                <button
                  disabled={isTyping || uploadLogoMutation.isPending}
                  onClick={async () => {
                    if (isTyping) return;
                    const logo = data.brandLogo || "font:Montserrat";
                    const label = logo.startsWith("url:") ? "Eigenes Logo" : logo.replace("font:", "");
                    addUserMessage(`Logo gewählt: ${label} ✓`);
                    await trySaveStep(STEP_ORDER.indexOf("brandLogo"), { brandLogo: logo });
                    await advanceToStep("headlineFont");
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {!isTyping && currentStep === "headlineFont" && (
              <div className="ml-9 space-y-3">
                <p className="text-slate-400 text-xs">W\u00e4hle eine Schriftart f\u00fcr deine \u00dcberschriften – die Vorschau rechts \u00e4ndert sich sofort:</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-300 text-xs font-semibold mb-2">Serifenschriften (klassisch, elegant):</p>
                    {[
                      { font: "Georgia", label: "Georgia – Zeitlos & Elegant" },
                      { font: "Garamond", label: "Garamond – Traditionell & Fein" },
                      { font: "Playfair Display", label: "Playfair Display – Luxuriös & Modern" },
                    ].map((opt) => (
                      <button
                        key={opt.font}
                        onClick={() => setData((p) => ({ ...p, headlineFont: opt.font }))}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left mb-2 ${
                          data.headlineFont === opt.font
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-600 bg-slate-700/40 hover:border-slate-500"
                        }`}
                      >
                        <p className="text-white text-base" style={{ fontFamily: `'${opt.font}', serif`, fontWeight: 700 }}>
                          {opt.label}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-slate-300 text-xs font-semibold mb-2 mt-3">Serifenlose (modern, clean):</p>
                    {[
                      { font: "Inter", label: "Inter – Sauber & Minimal" },
                      { font: "Poppins", label: "Poppins – Freundlich & Dynamisch" },
                      { font: "Montserrat", label: "Montserrat – Stark & Geometrisch" },
                    ].map((opt) => (
                      <button
                        key={opt.font}
                        onClick={() => setData((p) => ({ ...p, headlineFont: opt.font }))}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left mb-2 ${
                          data.headlineFont === opt.font
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-600 bg-slate-700/40 hover:border-slate-500"
                        }`}
                      >
                        <p className="text-white text-base" style={{ fontFamily: `'${opt.font}', sans-serif`, fontWeight: 700 }}>
                          {opt.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={isTyping}
                  onClick={async () => {
                    if (isTyping) return;
                    const fontLabel = data.headlineFont;
                    addUserMessage(`Schriftart gewählt: ${fontLabel} ✓`);
                    await trySaveStep(STEP_ORDER.indexOf("headlineFont"), { headlineFont: data.headlineFont });
                    await advanceToStep("businessName");
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isTyping && currentStep === "addons" && (
              <div className="ml-9 space-y-2">
                {/* Build industry-specific addon list */}
                {(() => {
                  const cat = data.businessCategory.toLowerCase();
                  const isFood = /restaurant|café|cafe|bistro|bäckerei|bakery|bar|tapas|pizza|sushi|burger|imbiss|gastronomie/.test(cat);
                  const isBeauty = /friseur|hair|beauty|kosmetik|nail|spa|massage|barber|waxing|lash|brow/.test(cat);
                  const isFitness = /fitness|gym|sport|yoga|pilates|crossfit|kampfsport|personal trainer/.test(cat);
                  const showMenu = isFood;
                  const showPricelist = isBeauty || isFitness;

                  const addons: { key: keyof OnboardingData; label: string; price: string; desc: string; emoji: string }[] = [
                    { key: "addOnContactForm" as const, label: "Kontaktformular", price: "+4,90 €/Monat", desc: "Kunden können direkt anfragen", emoji: "📬" },
                    { key: "addOnGallery" as const, label: "Bildergalerie", price: "+4,90 €/Monat", desc: "Zeig deine Projekte & Fotos", emoji: "🖼️" },
                    ...(showMenu ? [{ key: "addOnMenu" as const, label: "Speisekarte", price: "+4,90 €/Monat", desc: "Deine Gerichte übersichtlich präsentieren", emoji: "📖" }] : []),
                    ...(showPricelist ? [{ key: "addOnPricelist" as const, label: "Preisliste", price: "+4,90 €/Monat", desc: "Deine Leistungen mit Preisen", emoji: "🏷️" }] : []),
                  ];

                  return addons.map((addon) => (
                    <button
                      key={addon.key}
                      onClick={() => setData((p) => ({ ...p, [addon.key]: !(p as any)[addon.key] }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        (data as any)[addon.key]
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-600 bg-slate-700/40 hover:border-slate-500"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${(data as any)[addon.key] ? "border-blue-500 bg-blue-500" : "border-slate-500"}`}>
                        {(data as any)[addon.key] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-lg">{addon.emoji}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{addon.label}</p>
                        <p className="text-slate-400 text-xs">{addon.desc}</p>
                      </div>
                      <span className="text-blue-400 text-xs font-medium">{addon.price}</span>
                    </button>
                  ));
                })()}
                <button
                  disabled={isTyping}
                  onClick={async () => {
                    if (isTyping) return;
                    const selected = [];
                    if (data.addOnContactForm) selected.push("Kontaktformular");
                    if (data.addOnGallery) selected.push("Bildergalerie");
                    if (data.addOnMenu) selected.push("Speisekarte");
                    if (data.addOnPricelist) selected.push("Preisliste");
                    addUserMessage(selected.length > 0 ? `Ich nehme: ${selected.join(", ")} ✓` : "Keine Extras nötig");
                    await trySaveStep(STEP_ORDER.indexOf("addons"), { 
                      addOnContactForm: data.addOnContactForm, 
                      addOnGallery: data.addOnGallery,
                      addOnMenu: data.addOnMenu,
                      addOnPricelist: data.addOnPricelist
                    });
                    
                    if (data.addOnMenu) {
                      await advanceToStep("editMenu");
                    } else if (data.addOnPricelist) {
                      await advanceToStep("editPricelist");
                    } else {
                      await advanceToStep("subpages");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isTyping && currentStep === "editMenu" && (
              <div className="ml-9 space-y-4">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Überschrift der Sektion</p>
                  <input
                    className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                    value={data.addOnMenuData.headline}
                    onChange={(e) => {
                      setData(p => ({ ...p, addOnMenuData: { ...p.addOnMenuData, headline: e.target.value } }));
                    }}
                    placeholder="z.B. Unsere Speisekarte"
                  />
                </div>

                {data.addOnMenuData.categories.map((cat, catIdx) => (
                  <div key={cat.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 bg-transparent text-white text-base font-bold outline-none border-b border-slate-700 focus:border-blue-500 pb-1"
                        value={cat.name}
                        onChange={(e) => {
                          const updated = { ...data.addOnMenuData };
                          updated.categories[catIdx].name = e.target.value;
                          setData(p => ({ ...p, addOnMenuData: updated }));
                        }}
                        placeholder="Kategorie (z.B. Hauptgerichte)"
                      />
                      <button 
                        onClick={() => {
                          const updated = { ...data.addOnMenuData };
                          updated.categories = updated.categories.filter((_, i) => i !== catIdx);
                          setData(p => ({ ...p, addOnMenuData: updated }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-slate-700/40 rounded-xl p-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              className="flex-1 bg-slate-600/50 text-white text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                              value={item.name}
                              onChange={(e) => {
                                const updated = { ...data.addOnMenuData };
                                updated.categories[catIdx].items[itemIdx].name = e.target.value;
                                setData(p => ({ ...p, addOnMenuData: updated }));
                              }}
                              placeholder="Name des Gerichts"
                            />
                            <input
                              className="w-20 bg-slate-600/50 text-white text-sm px-2 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-mono text-right"
                              value={item.price}
                              onChange={(e) => {
                                const updated = { ...data.addOnMenuData };
                                updated.categories[catIdx].items[itemIdx].price = e.target.value;
                                setData(p => ({ ...p, addOnMenuData: updated }));
                              }}
                              placeholder="12,50"
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              className="flex-1 bg-slate-600/30 text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                              value={item.description}
                              onChange={(e) => {
                                const updated = { ...data.addOnMenuData };
                                updated.categories[catIdx].items[itemIdx].description = e.target.value;
                                setData(p => ({ ...p, addOnMenuData: updated }));
                              }}
                              placeholder="Beschreibung (Zutaten, etc.)"
                            />
                            <button 
                              onClick={() => {
                                const updated = { ...data.addOnMenuData };
                                updated.categories[catIdx].items = updated.categories[catIdx].items.filter((_, i) => i !== itemIdx);
                                setData(p => ({ ...p, addOnMenuData: updated }));
                              }}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const updated = { ...data.addOnMenuData };
                          updated.categories[catIdx].items.push({ name: "", description: "", price: "" });
                          setData(p => ({ ...p, addOnMenuData: updated }));
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Gericht hinzufügen
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setData(p => ({ 
                        ...p, 
                        addOnMenuData: { 
                          categories: [...p.addOnMenuData.categories, { id: genId(), name: "", items: [{ name: "", description: "", price: "" }] }] 
                        } 
                      }));
                    }}
                    className="flex items-center justify-center gap-2 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 rounded-xl border border-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Weitere Kategorie hinzufügen
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        addUserMessage("Speisekarte später ausfüllen");
                        if (data.addOnPricelist) await advanceToStep("editPricelist");
                        else await advanceToStep("subpages");
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Mache ich später
                    </button>
                    <button
                      onClick={async () => {
                        const filledCategories = data.addOnMenuData.categories.filter(c => c.name.trim() || c.items.some(i => i.name.trim()));
                        addUserMessage(`Speisekarte gespeichert (${filledCategories.length} Kategorien) ✓`);
                        await trySaveStep(STEP_ORDER.indexOf("editMenu"), { addOnMenuData: { categories: filledCategories } });
                        if (data.addOnPricelist) await advanceToStep("editPricelist");
                        else await advanceToStep("subpages");
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      Speichern & weiter <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isTyping && currentStep === "editPricelist" && (
              <div className="ml-9 space-y-4">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Überschrift der Sektion</p>
                  <input
                    className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                    value={data.addOnPricelistData.headline}
                    onChange={(e) => {
                      setData(p => ({ ...p, addOnPricelistData: { ...p.addOnPricelistData, headline: e.target.value } }));
                    }}
                    placeholder="z.B. Unsere Preise"
                  />
                </div>

                {data.addOnPricelistData.categories.map((cat, catIdx) => (
                  <div key={cat.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 bg-transparent text-white text-base font-bold outline-none border-b border-slate-700 focus:border-blue-500 pb-1"
                        value={cat.name}
                        onChange={(e) => {
                          const updated = { ...data.addOnPricelistData };
                          updated.categories[catIdx].name = e.target.value;
                          setData(p => ({ ...p, addOnPricelistData: updated }));
                        }}
                        placeholder="Kategorie (z.B. Haarschnitte)"
                      />
                      <button 
                        onClick={() => {
                          const updated = { ...data.addOnPricelistData };
                          updated.categories = updated.categories.filter((_, i) => i !== catIdx);
                          setData(p => ({ ...p, addOnPricelistData: updated }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2 items-center">
                          <input
                            className="flex-1 bg-slate-600/50 text-white text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                            value={item.name}
                            onChange={(e) => {
                              const updated = { ...data.addOnPricelistData };
                              updated.categories[catIdx].items[itemIdx].name = e.target.value;
                              setData(p => ({ ...p, addOnPricelistData: updated }));
                            }}
                            placeholder="Leistung"
                          />
                          <input
                            className="w-20 bg-slate-600/50 text-white text-sm px-2 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-mono text-right"
                            value={item.price}
                            onChange={(e) => {
                              const updated = { ...data.addOnPricelistData };
                              updated.categories[catIdx].items[itemIdx].price = e.target.value;
                              setData(p => ({ ...p, addOnPricelistData: updated }));
                            }}
                            placeholder="ab 25,-"
                          />
                          <button 
                            onClick={() => {
                              const updated = { ...data.addOnPricelistData };
                              updated.categories[catIdx].items = updated.categories[catIdx].items.filter((_, i) => i !== itemIdx);
                              setData(p => ({ ...p, addOnPricelistData: updated }));
                            }}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const updated = { ...data.addOnPricelistData };
                          updated.categories[catIdx].items.push({ name: "", price: "" });
                          setData(p => ({ ...p, addOnPricelistData: updated }));
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Leistung hinzufügen
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => {
                      setData(p => ({ 
                        ...p, 
                        addOnPricelistData: { 
                          categories: [...p.addOnPricelistData.categories, { id: genId(), name: "", items: [{ name: "", price: "" }] }] 
                        } 
                      }));
                    }}
                    className="flex items-center justify-center gap-2 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 rounded-xl border border-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Weitere Kategorie hinzufügen
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        addUserMessage("Preisliste später ausfüllen");
                        await advanceToStep("subpages");
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Mache ich später
                    </button>
                    <button
                      onClick={async () => {
                        const filledCategories = data.addOnPricelistData.categories.filter(c => c.name.trim() || c.items.some(i => i.name.trim()));
                        addUserMessage(`Preisliste gespeichert (${filledCategories.length} Kategorien) ✓`);
                        await trySaveStep(STEP_ORDER.indexOf("editPricelist"), { addOnPricelistData: { categories: filledCategories } });
                        await advanceToStep("subpages");
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      Speichern & weiter <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isTyping && currentStep === "subpages" && (
              <div className="ml-9 space-y-4">
                {/* Info Card */}
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-white text-xs font-bold leading-tight">Später bearbeitbar</p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Hier markierst du deine Wunsch-Seiten. Den Inhalt (Texte, Bilder) kannst du nach der Freischaltung ganz entspannt im **Dashboard** pflegen.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-blue-500/20">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" /> Impressum & Datenschutz (inklusive)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {data.subPages.map((page, i) => (
                    <div key={page.id} className="bg-slate-700/60 rounded-xl p-3 flex gap-2 items-start group border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                      <div className="flex-1 space-y-1.5">
                        <input
                          className="w-full bg-slate-600/50 text-white text-sm px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Seitenname (z.B. Über uns)"
                          value={page.name}
                          onChange={(e) => {
                            const updated = [...data.subPages];
                            updated[i] = { ...updated[i], name: e.target.value };
                            setData((p) => ({ ...p, subPages: updated }));
                          }}
                        />
                        <input
                          className="w-full bg-slate-600/50 text-white text-[11px] px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Notiz zum Inhalt (optional)"
                          value={page.description}
                          onChange={(e) => {
                            const updated = [...data.subPages];
                            updated[i] = { ...updated[i], description: e.target.value };
                            setData((p) => ({ ...p, subPages: updated }));
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setData((p) => ({ ...p, subPages: p.subPages.filter((_, j) => j !== i) }))}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-600/50 mt-1"
                        title="Unterseite entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  <button
                    onClick={() => setData((p) => ({ ...p, subPages: [...p.subPages, { id: genId(), name: "", description: "" }] }))}
                    className="flex items-center justify-center gap-2 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl border border-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Neue Unterseite hinzufügen <span className="text-blue-400 font-bold">(+9,90 €)</span>
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      disabled={isTyping}
                      onClick={async () => {
                        if (isTyping) return;
                        const validPages = data.subPages.filter((p) => p.name.trim());
                        addUserMessage(validPages.length > 0 ? `Unterseiten: ${validPages.map((p) => p.name).join(", ")} ✓` : "Keine Unterseiten");
                        await trySaveStep(STEP_ORDER.indexOf("subpages"), { addOnSubpages: validPages.map((p) => p.name) });
                        await advanceToStep("email");
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-1"
                    >
                      {data.subPages.length > 0 ? "Speichern & weiter" : "Überspringen & weiter"} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isTyping && currentStep === "legalOwner" && business && (business.address || business.phone || business.email) && (
              <div className="ml-9 mt-2">
                {!gmbÜbernommenEditMode ? (
                  <button
                    onClick={async () => {
                      const parts = business.address ? business.address.split(",") : [];
                      const street = parts[0]?.trim() || "";
                      const zipCityRaw = parts[1]?.trim() || parts[2]?.trim() || "";
                      const zipCityMatch = zipCityRaw.match(/(\d{5})\s+(.+)$/);
                      const zip = zipCityMatch?.[1] || "";
                      const city = zipCityMatch?.[2] || "";
                      const phone = business.phone || "";
                      const email = business.email || "";
                      setData((p) => ({
                        ...p,
                        legalStreet: street || p.legalStreet,
                        legalZip: zip || p.legalZip,
                        legalCity: city || p.legalCity,
                        legalPhone: phone || p.legalPhone,
                        legalEmail: email || p.legalEmail,
                      }));
                      const summary = [
                        street && `Straße: ${street}`,
                        zip && city && `PLZ/Stadt: ${zip} ${city}`,
                        phone && `Telefon: ${phone}`,
                        email && `E-Mail: ${email}`,
                      ].filter(Boolean).join(" · ");
                      addUserMessage(`📍 GMB-Daten übernommen – ${summary}`);
                      const stepIdx = STEP_ORDER.indexOf("legalOwner");
                      if (street) await trySaveStep(stepIdx + 1, { legalStreet: street });
                      if (zip && city) await trySaveStep(stepIdx + 2, { legalZip: zip, legalCity: city });
                      if (email) await trySaveStep(stepIdx + 3, { legalEmail: email });
                      if (phone) await trySaveStep(stepIdx + 4, { legalPhone: phone });
                      await advanceToStep("legalVat");
                    }}
                    className="flex items-center gap-2 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl transition-all"
                  >
                    <span>📍</span> Adresse, Telefon & E-Mail aus Google My Business übernehmen
                  </button>
                ) : (
                  /* Edit mode: show fields inline */
                  <div className="bg-slate-800/80 border border-slate-600/50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-emerald-400 font-medium">📍 GMB-Daten bearbeiten</span>
                      <button
                        onClick={() => setGmbÜbernommenEditMode(false)}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {[
                      { label: "Straße", key: "legalStreet" as const, placeholder: "Musterstraße 1" },
                      { label: "PLZ", key: "legalZip" as const, placeholder: "12345" },
                      { label: "Stadt", key: "legalCity" as const, placeholder: "Musterstadt" },
                      { label: "Telefon", key: "legalPhone" as const, placeholder: "+49 123 456789" },
                      { label: "E-Mail", key: "legalEmail" as const, placeholder: "info@firma.de" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-14 flex-shrink-0">{label}</span>
                        <input
                          type="text"
                          value={data[key] || ""}
                          onChange={(e) => setData((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="flex-1 bg-slate-700/60 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-600/50 outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                        />
                      </div>
                    ))}
                    <button
                      onClick={async () => {
                        setGmbÜbernommenEditMode(false);
                        const stepIdx = STEP_ORDER.indexOf("legalOwner");
                        if (data.legalStreet) await trySaveStep(stepIdx + 1, { legalStreet: data.legalStreet });
                        if (data.legalZip && data.legalCity) await trySaveStep(stepIdx + 2, { legalZip: data.legalZip, legalCity: data.legalCity });
                        if (data.legalEmail) await trySaveStep(stepIdx + 3, { legalEmail: data.legalEmail });
                        if (data.legalPhone) await trySaveStep(stepIdx + 4, { legalPhone: data.legalPhone });
                        await advanceToStep("legalVat");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors mt-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Bestätigen & weiter
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Pencil to re-open edit mode after GMB data was confirmed */}
            {!isTyping && currentStep !== "legalOwner" && ["legalStreet","legalZipCity","legalEmail","legalPhone","legalVat"].includes(currentStep) && data.legalStreet && (
              <div className="ml-9 mt-1">
                <button
                  onClick={() => {
                    setGmbÜbernommenEditMode(true);
                    // Go back to legalOwner step to show the edit panel
                    setCurrentStep("legalOwner" as any);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  title="GMB-Daten nachträglich bearbeiten"
                >
                  <Pencil className="w-3 h-3" /> Angaben bearbeiten
                </button>
              </div>
            )}

            {!isTyping && currentStep === "hideSections" && (
              <div className="ml-9 space-y-2">
                {(() => {
                  const base = siteData?.website?.websiteData as any;
                  const sectionsFromBase = (base?.sections || []).filter((s: any) => s.type !== "hero");
                  
                  // Add dynamic sections if they are active in data
                  const sectionsToShow = [...sectionsFromBase];
                  if (data.addOnMenu && !sectionsToShow.some(s => s.type === "menu")) {
                    sectionsToShow.push({ type: "menu" });
                  }
                  if (data.addOnPricelist && !sectionsToShow.some(s => s.type === "pricelist")) {
                    sectionsToShow.push({ type: "pricelist" });
                  }
                  if (data.addOnGallery && !sectionsToShow.some(s => s.type === "gallery")) {
                    sectionsToShow.push({ type: "gallery" });
                  }
                  if (!sectionsToShow.some(s => s.type === "contact")) {
                    sectionsToShow.push({ type: "contact" });
                  }

                  const allSections: Array<{ type: string; label: string; emoji: string }> = sectionsToShow
                    .map((s: any) => {
                      const labels: Record<string, { label: string; emoji: string }> = {
                        about: { label: "Über uns", emoji: "👤" },
                        services: { label: "Leistungen", emoji: "🔧" },
                        testimonials: { label: "Kundenstimmen", emoji: "⭐" },
                        gallery: { label: "Bildergalerie", emoji: "🖼️" },
                        contact: { label: "Kontaktbereich", emoji: "📬" },
                        cta: { label: "Direktkontakt-Banner", emoji: "🎯" },
                        features: { label: "Vorteile", emoji: "✅" },
                        team: { label: "Team", emoji: "👥" },
                        faq: { label: "FAQ", emoji: "❓" },
                        menu: { label: "Speisekarte", emoji: "📖" },
                        pricelist: { label: "Preisliste", emoji: "🏷️" },
                      };
                      return { type: s.type, ...(labels[s.type] || { label: s.type, emoji: "📄" }) };
                    });
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {allSections.map((sec) => {
                          const isHidden = hiddenSections.has(sec.type);
                          return (
                            <button
                              key={sec.type}
                              onClick={() => {
                                setHiddenSections((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(sec.type)) next.delete(sec.type);
                                  else next.add(sec.type);
                                  return next;
                                });
                              }}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all text-left ${
                                isHidden
                                  ? "border-slate-700 bg-slate-800/40 text-slate-500 opacity-60"
                                  : "border-emerald-500/50 bg-emerald-500/10 text-emerald-50"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${isHidden ? 'border-slate-600 bg-slate-700' : 'border-emerald-500 bg-emerald-500'}`}>
                                {!isHidden && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span>{sec.emoji}</span>
                              <span className={isHidden ? "line-through" : ""}>{sec.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {hiddenSections.size > 0 && (
                        <p className="text-xs text-amber-400/80 mt-1">
                          {hiddenSections.size} Bereich{hiddenSections.size > 1 ? "e" : ""} ausgeblendet – du kannst sie jederzeit wieder aktivieren.
                        </p>
                      )}
                      <button
                        disabled={isTyping}
                        onClick={async () => {
                          if (isTyping) return;
                          const hidden = Array.from(hiddenSections);
                          addUserMessage(hidden.length === 0 ? "Alle Bereiche anzeigen ✓" : `Ausgeblendet: ${hidden.join(", ")}`);
                          await advanceToStep("preview");
                        }}
                        className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                      >
                        Weiter <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  );
                })()}
              </div>
            )}

            {!isTyping && currentStep === "preview" && (
              <div className="ml-9">
                <button
                  onClick={async () => {
                    addUserMessage("Sieht super aus! Jetzt freischalten 🚀");
                    await advanceToStep("checkout");
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Website freischalten
                </button>
              </div>
            )}

            {!isTyping && currentStep === "checkout" && (
              <div className="ml-9 space-y-3">
                <div className="bg-slate-700/60 rounded-xl p-4 space-y-2">
                  {/* Intro offer banner */}
                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg px-3 py-2 mb-2">
                    <p className="text-xs font-semibold text-amber-300">🎉 Einführungsangebot: Erster Monat nur 39€!</p>
                  </div>
                  
                  {/* First month pricing */}
                  <div className="space-y-2 pb-2 border-b border-slate-600">
                    <p className="text-xs text-slate-400 font-medium">1. Monat:</p>
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Basis-Website</span>
                      <span className="text-amber-400 font-semibold">39,00 €</span>
                    </div>
                  </div>
                  
                  {/* Regular pricing */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-slate-400 font-medium">Ab 2. Monat:</p>
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Basis-Website</span>
                      <span>79,00 €/Monat</span>
                    </div>
                    {data.addOnContactForm && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>Kontaktformular</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                    {data.addOnGallery && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>Bildergalerie</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                    {data.addOnMenu && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>Speisekarte</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                    {data.addOnPricelist && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>Preisliste</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                    {data.subPages.filter((p) => p.name).map((page) => (
                      <div key={page.id} className="flex justify-between text-sm text-slate-300">
                        <span>Unterseite: {page.name}</span>
                        <span>+9,90 €/Monat</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-600 pt-2 flex justify-between font-bold text-white">
                      <span>Gesamt ab Monat 2</span>
                      <span>{totalPrice(false)} €/Monat</span>
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setLegalConsent((v) => !v)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      legalConsent ? "border-green-500 bg-green-500" : "border-slate-500 bg-transparent group-hover:border-slate-400"
                    }`}
                  >
                    {legalConsent && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-slate-400 leading-relaxed" onClick={() => setLegalConsent((v) => !v)}>
                    Ich bestätige, dass alle Angaben (insbesondere Impressum & Datenschutz) korrekt und vollständig sind. Ich übernehme die alleinige Verantwortung für die Richtigkeit dieser Daten. Pageblitz haftet nicht für fehlerhafte oder unvollständige Angaben.
                  </span>
                </label>
                <button
                  onClick={handleCheckout}
                  disabled={completeMutation.isPending || checkoutMutation.isPending || !legalConsent}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold px-5 py-4 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completeMutation.isPending || checkoutMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>\n                      <Zap className="w-5 h-5" /> Jetzt für {totalPrice(true)} € freischalten (1. Monat)\n                    </>                 )}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Monatlich kündbar • Keine Einrichtungsgebühr • SSL inklusive
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          {/* Input area – sticky at bottom */}
          {!["services", "addons", "subpages", "preview", "checkout", "welcome", "colorScheme", "brandLogo", "businessCategory"].includes(currentStep) && (
            <div className="flex-shrink-0 px-4 pb-4 border-t border-slate-700/50">
              {/* Quick-reply chips – above input */}
              {!isTyping && !quickReplySelected && getQuickReplies(currentStep).length > 0 && (
                <div className="pt-3 pb-2">
                  <p className="text-xs text-slate-500 mb-2 font-medium">Schnellantworten:</p>
                  <div className="flex flex-wrap gap-2">
                    {getQuickReplies(currentStep).map((reply) => (
                      <button
                        key={reply}
                        onClick={() => {
                          setQuickReplySelected(true);
                          if (currentStep === "businessName" && reply === "Ja, stimmt!") {
                            handleSubmit("");
                          } else {
                            handleSubmit(reply);
                          }
                        }}
                        className="text-sm bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 hover:border-blue-400/70 text-blue-200 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium shadow-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {/* AI generate button for text fields */}
                {["tagline", "description", "usp", "targetAudience"].includes(currentStep) && (
                  <div className="relative flex-shrink-0 group/ai">
                    <button
                      onClick={() => generateWithAI(currentStep as keyof OnboardingData)}
                      disabled={isGenerating}
                      className="w-10 h-10 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/60 flex items-center justify-center transition-all ai-glow-btn"
                      title="Mit KI generieren"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 text-violet-300 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-violet-300" />
                      )}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 pointer-events-none opacity-0 group-hover/ai:opacity-100 transition-opacity duration-200 z-20">
                      <div className="bg-violet-900/95 border border-violet-500/50 text-violet-100 text-xs px-3 py-2 rounded-lg shadow-lg text-center leading-snug">
                        ✨ Automatisch von KI<br/>generieren lassen
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-violet-900/95" />
                      </div>
                    </div>
                  </div>
                )}
                {["tagline", "description", "usp", "targetAudience"].includes(currentStep) ? (
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    rows={3}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      // Auto-resize
                      const el = e.target as HTMLTextAreaElement;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 160) + "px";
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                    placeholder={
                      currentStep === "tagline"
                        ? `z.B. "Ihr ${(data as any).businessCategory || 'Fachbetrieb'} in ${data.legalCity || 'Ihrer Stadt'}"`
                        : currentStep === "description"
                        ? "Was macht dein Unternehmen besonders? (2-3 Sätze)"
                        : currentStep === "usp"
                        ? "z.B. 'Wir sind der einzige Anbieter in der Region, der...' "
                        : currentStep === "targetAudience"
                        ? `z.B. "Damen und Herren in ${data.legalCity || 'Bocholt'}, die Wert auf..."`
                        : "Deine Antwort... (Shift+Enter für neue Zeile)"
                    }
                    className="flex-1 bg-slate-700/60 text-white text-sm px-4 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50 resize-none leading-relaxed"
                    style={{ minHeight: "72px", maxHeight: "160px" }}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                    placeholder={
                      currentStep === "businessName"
                        ? data.businessName || "Unternehmensname eingeben..."
                        : currentStep === "legalOwner"
                        ? "Vorname Nachname"
                        : currentStep === "legalStreet"
                        ? "Musterstraße 12"
                        : currentStep === "legalZipCity"
                        ? "46395 Bocholt"
                        : currentStep === "legalEmail"
                        ? "info@musterfirma.de"
                        : currentStep === "legalVat"
                        ? "DE123456789 – oder leer lassen (Kleinunternehmer)"
                        : currentStep === "email"
                        ? "deine@email.de"
                        : "Deine Antwort..."
                    }
                    className="flex-1 bg-slate-700/60 text-white text-sm px-4 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                  />
                )}
                <button
                  onClick={() => handleSubmit()}
                  disabled={!inputValue.trim() && currentStep !== "businessName" && currentStep !== "legalVat"}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>


            </div>
          )}
          </div>{/* end messages+input wrapper */}
        </div>
        {/* Preview panell – MacBook mockup */}
        <div className="relative flex-1 overflow-y-auto bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col">
          {/* Preview top bar: chat toggle + progress bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/50">
            {/* Chat toggle button – always visible here */}
            <button
              onClick={() => setChatHidden((v) => !v)}
              className="flex items-center gap-1.5 text-xs bg-slate-700/60 hover:bg-slate-600/60 border border-slate-600/50 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              title={chatHidden ? "Chat einblenden" : "Chat ausblenden"}
            >
              {chatHidden ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              {chatHidden ? "Chat einblenden" : "Chat ausblenden"}
            </button>
            {/* Progress bar */}
            {currentStep !== "welcome" && currentStep !== "checkout" && (() => {
              const totalSteps = STEP_ORDER.filter((s) => s !== "welcome").length;
              const currentIdx = STEP_ORDER.indexOf(currentStep);
              const progress = Math.round((currentIdx / totalSteps) * 100);
              return (
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">Schritt {currentIdx} / {totalSteps}</span>
                </div>
              );
            })()}
          </div>
          {liveWebsiteData && colorScheme ? (
            <MacbookMockup
              label="Live-Vorschau deiner Website"
              innerRef={previewInnerRef}
              externalScrollTop={previewScrollTop}
              onScrollChange={setPreviewScrollTop}
            >
              <WebsiteRenderer
                websiteData={liveWebsiteData}
                colorScheme={{
                    ...colorScheme,
                    ...data.colorScheme,
                  } as any}
                heroImageUrl={data.heroPhotoUrl || heroImageUrl}
                aboutImageUrl={data.aboutPhotoUrl || aboutImageUrl}
                layoutStyle={layoutStyle}
                businessPhone={business?.phone || undefined}
                businessAddress={business?.address || undefined}
                businessEmail={business?.email || undefined}
                openingHours={business?.openingHours ? convertOpeningHoursToGerman(business.openingHours as string[]) : undefined}
                slug={slug}
                contactFormLocked={!data.addOnContactForm}
                logoFont={data.brandLogo?.startsWith("font:") ? data.brandLogo.replace("font:", "") : undefined}
                headlineFontOverride={data.headlineFont || undefined}
              />
            </MacbookMockup>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 min-h-[400px]">
              <div className="text-center">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-slate-600" />
                <p className="text-sm">Vorschau wird geladen...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exit intent modal */}
      {showExitIntent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-violet-700 p-8 text-center relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400/20 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-xl">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 leading-tight uppercase tracking-tight">Warte kurz! ⚡</h2>
                <p className="text-blue-100 text-sm font-medium leading-relaxed">
                  Deine Website ist nur noch <span className="text-white font-bold tabular-nums">{countdown}</span> für dich reserviert.
                </p>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed text-center">
                  Hinterlasse deine E-Mail-Adresse, damit wir deinen Bearbeitungsstand speichern können und du später weitermachen kannst.
                </p>
                
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="deine@email.de"
                    value={data.email}
                    onChange={(e) => setData(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
                  />
                  <button
                    onClick={async () => {
                      if (!data.email || !data.email.includes("@")) {
                        toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
                        return;
                      }
                      await trySaveStep(STEP_ORDER.indexOf("email"), { email: data.email });
                      toast.success("Fortschritt gespeichert! Du kannst nun jederzeit zurückkehren.");
                      setShowExitIntent(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    Fortschritt speichern & weiter
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowExitIntent(false)}
                className="w-full text-slate-500 hover:text-slate-300 text-xs font-semibold uppercase tracking-widest transition-colors"
              >
                Doch nicht schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HeroPhotoStep ─────────────────────────────────────────────────────────────

interface HeroPhotoStepProps {
  businessCategory: string;
  heroPhotoUrl: string;
  websiteId?: number;
  isAboutPhoto?: boolean;
  onSelect: (url: string) => void;
  onNext: () => Promise<void>;
}

function HeroPhotoStep({ businessCategory, heroPhotoUrl, websiteId, isAboutPhoto, onSelect, onNext }: HeroPhotoStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const uploadLogoMutation = trpc.onboarding.uploadLogo.useMutation();

  const { data: suggestionsData, isLoading: isLoadingSuggestions } = trpc.onboarding.getPhotoSuggestions.useQuery(
    { category: businessCategory },
    { enabled: !!businessCategory }
  );

  const photos = suggestionsData?.suggestions || [
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=70", alt: "Modernes Büro" },
    { url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=70", alt: "Helles Büro" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=70", alt: "Gebäude" },
  ];

  return (
    <div className="ml-9 space-y-3">
      <p className="text-slate-400 text-xs">
        {isAboutPhoto
          ? 'Wähle ein Foto für den "Über uns"-Bereich deiner Website:'
          : "Wähle ein passendes Foto für den Hero-Bereich deiner Website:"}
      </p>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {isLoadingSuggestions ? (
          <div className="col-span-3 py-12 flex flex-col items-center justify-center gap-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-xs">Passende Fotos werden geladen…</p>
          </div>
        ) : (
          (photos as any[]).filter(p => {
            const url = typeof p === "string" ? p : p.url;
            return !brokenImages.has(url);
          }).map((photo, idx) => {
            const url = typeof photo === "string" ? photo : photo.url;
            const thumb = typeof photo === "string" ? photo : photo.thumb || photo.url;
            const alt = typeof photo === "string" ? businessCategory : photo.alt;

            return (
              <button
                key={url + idx}
                onClick={() => onSelect(heroPhotoUrl === url ? "" : url)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  heroPhotoUrl === url
                    ? "border-blue-400 ring-2 ring-blue-400/40"
                    : "border-slate-600/40 hover:border-slate-400"
                }`}
                title={alt}
              >
                <img 
                  src={thumb} 
                  alt={alt} 
                  className="w-full h-full object-cover" 
                  loading="lazy" 
                  onError={() => {
                    setBrokenImages(prev => {
                      const next = new Set(prev);
                      next.add(url);
                      return next;
                    });
                  }}
                />
                {heroPhotoUrl === url && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Upload option */}
      <div className="border-t border-slate-700 pt-3">
        <p className="text-slate-400 text-xs mb-2">Oder eigenes Foto hochladen:</p>
        {heroPhotoUrl && !photos.some((p) => p.url === heroPhotoUrl) ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-blue-500 bg-blue-500/10">
            <img src={heroPhotoUrl} alt="Eigenes Foto" className="h-12 w-20 object-cover rounded" />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Eigenes Foto ✓</p>
              <button
                onClick={() => onSelect("")}
                className="text-slate-400 text-xs hover:text-white transition-colors"
              >
                Entfernen
              </button>
            </div>
          </div>
        ) : (
          <label className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-700/40 hover:border-slate-500 cursor-pointer transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !websiteId) return;
                if (file.size > 5 * 1024 * 1024) {
                  alert("Foto darf maximal 5 MB groß sein.");
                  return;
                }
                setIsUploading(true);
                const reader = new FileReader();
                reader.onload = async () => {
                  const base64 = (reader.result as string).split(",")[1];
                  try {
                    const result = await uploadLogoMutation.mutateAsync({
                      websiteId,
                      imageData: base64,
                      mimeType: file.type,
                    });
                    onSelect(result.url);
                  } catch {
                    alert("Upload fehlgeschlagen. Bitte erneut versuchen.");
                  } finally {
                    setIsUploading(false);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <p className="text-white text-sm">{isUploading ? "Wird hochgeladen…" : "Foto hochladen"}</p>
              <p className="text-slate-400 text-xs">JPG, PNG oder WebP · max. 5 MB</p>
            </div>
          </label>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { onSelect(""); onNext(); }}
          className="flex-1 text-xs text-slate-400 hover:text-slate-300 px-3 py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
        >
          Bestehendes behalten
        </button>
        <button
          disabled={isUploading}
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Weiter <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

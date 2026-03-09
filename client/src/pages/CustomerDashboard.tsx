import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Loader2, Globe, ExternalLink, Edit2, Check, X, Palette, Phone, Mail, MapPin, Image, RefreshCw, Settings, User, LayoutGrid, Type, Sparkles, Plus, Trash2 } from "lucide-react";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import type { WebsiteData, ColorScheme } from "@shared/types";

// ── Types ───────────────────────────────────────────
type Tab = "preview" | "content" | "design" | "addons";

// ── Helpers ───────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Aktiv", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    preview: { label: "Vorschau", cls: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
    sold: { label: "Verkauft", cls: "bg-violet-500/20 text-violet-300 border-violet-500/40" },
    inactive: { label: "Inaktiv", cls: "bg-slate-500/20 text-slate-400 border-slate-500/40" },
  };
  const { label, cls } = map[status] || { label: status, cls: "bg-slate-500/20 text-slate-400 border-slate-500/40" };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

interface EditableFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  onSave: (v: string) => Promise<void>;
}

function EditableField({ label, value, icon, multiline, onSave }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
      toast.success(`${label} gespeichert`);
    } catch {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group">
      <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </label>
      {editing ? (
        <div className="flex flex-col gap-2">
          {multiline ? (
            <textarea
              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-blue-500 outline-none resize-none min-h-[80px]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-blue-500 outline-none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { setDraft(value); setEditing(false); }}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300 transition-colors"
            >
              <X className="w-3 h-3" /> Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Speichern
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm text-slate-200 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/50 min-h-[36px] leading-relaxed">
            {value || <span className="text-slate-500 italic">Nicht angegeben</span>}
          </p>
          <button
            onClick={() => { setDraft(value); setEditing(true); }}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
            title={`${label} bearbeiten`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Services Editor ──────────────────────────────────
interface ServicesEditorProps {
  websiteId: number;
  initialServices: Array<{ title: string; description?: string }>;
  initialUsp?: string;
  onUpdate: () => void;
}

function ServicesEditor({ websiteId, initialServices, initialUsp, onUpdate }: ServicesEditorProps) {
  const [services, setServices] = useState(initialServices.length > 0 ? initialServices : [{ title: "", description: "" }]);
  const [usp, setUsp] = useState(initialUsp || "");
  const [saving, setSaving] = useState(false);

  const updateServices = trpc.customer.updateServices.useMutation({
    onSuccess: () => {
      toast.success("Leistungen gespeichert");
      onUpdate();
    },
    onError: () => toast.error("Speichern fehlgeschlagen"),
  });

  const handleSave = async () => {
    setSaving(true);
    const validServices = services.filter(s => s.title.trim() !== "");
    await updateServices.mutateAsync({
      websiteId,
      services: validServices,
      usp: usp.trim() || undefined,
    });
    setSaving(false);
  };

  const addService = () => setServices([...services, { title: "", description: "" }]);
  const removeService = (idx: number) => setServices(services.filter((_, i) => i !== idx));
  const updateService = (idx: number, field: "title" | "description", value: string) => {
    const newServices = [...services];
    newServices[idx] = { ...newServices[idx], [field]: value };
    setServices(newServices);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-400 font-medium mb-2 block">Unique Selling Proposition (USP)</label>
        <input
          type="text"
          value={usp}
          onChange={(e) => setUsp(e.target.value)}
          placeholder="Was macht Ihr Unternehmen besonders?"
          className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs text-slate-400 font-medium">Leistungen / Services</label>
        {services.map((service, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={service.title}
                onChange={(e) => updateService(idx, "title", e.target.value)}
                placeholder="Titel der Leistung"
                className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
              />
              <textarea
                value={service.description || ""}
                onChange={(e) => updateService(idx, "description", e.target.value)}
                placeholder="Beschreibung (optional)"
                className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500 resize-none h-16"
              />
            </div>
            <button
              onClick={() => removeService(idx)}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              disabled={services.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addService}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Leistung hinzufügen
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Leistungen speichern
      </button>
    </div>
  );
}

// ── Legal Data Editor ──────────────────────────────
interface LegalEditorProps {
  websiteId: number;
  initialData: {
    legalOwner?: string;
    legalStreet?: string;
    legalZip?: string;
    legalCity?: string;
    legalEmail?: string;
    legalPhone?: string;
    legalVatId?: string;
  };
  onUpdate: () => void;
}

function LegalEditor({ websiteId, initialData, onUpdate }: LegalEditorProps) {
  const [data, setData] = useState({
    legalOwner: initialData.legalOwner || "",
    legalStreet: initialData.legalStreet || "",
    legalZip: initialData.legalZip || "",
    legalCity: initialData.legalCity || "",
    legalEmail: initialData.legalEmail || "",
    legalPhone: initialData.legalPhone || "",
    legalVatId: initialData.legalVatId || "",
  });
  const [saving, setSaving] = useState(false);

  const updateLegal = trpc.customer.updateLegalData.useMutation({
    onSuccess: () => {
      toast.success("Impressum-Daten gespeichert");
      onUpdate();
    },
    onError: () => toast.error("Speichern fehlgeschlagen"),
  });

  const handleSave = async () => {
    setSaving(true);
    await updateLegal.mutateAsync({
      websiteId,
      legalData: data,
    });
    setSaving(false);
  };

  const updateField = (field: keyof typeof data, value: string) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Inhaber/Firma *</label>
          <input
            type="text"
            value={data.legalOwner}
            onChange={(e) => updateField("legalOwner", e.target.value)}
            placeholder="Max Mustermann"
            className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Straße & Hausnummer</label>
          <input
            type="text"
            value={data.legalStreet}
            onChange={(e) => updateField("legalStreet", e.target.value)}
            placeholder="Musterstraße 123"
            className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">PLZ</label>
          <input
            type="text"
            value={data.legalZip}
            onChange={(e) => updateField("legalZip", e.target.value)}
            placeholder="12345"
            className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Ort</label>
          <input
            type="text"
            value={data.legalCity}
            onChange={(e) => updateField("legalCity", e.target.value)}
            placeholder="Musterstadt"
            className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">E-Mail *</label>
          <input
            type="email"
            value={data.legalEmail}
            onChange={(e) => updateField("legalEmail", e.target.value)}
            placeholder="kontakt@beispiel.de"
            className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Telefon</label>
          <input
            type="tel"
            value={data.legalPhone}
            onChange={(e) => updateField("legalPhone", e.target.value)}
            placeholder="+49 123 456789"
            className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">USt-IdNr.</label>
          <input
            type="text"
            value={data.legalVatId}
            onChange={(e) => updateField("legalVatId", e.target.value)}
            placeholder="DE123456789"
            className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="text-xs text-slate-500">
        * Pflichtfelder für die Impressum-Generierung
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Impressum-Daten speichern
      </button>
    </div>
  );
}

// ── Design Editor ────────────────────────────────────
interface DesignEditorProps {
  websiteId: number;
  website: any;
  onUpdate: () => void;
}

function DesignEditor({ websiteId, website, onUpdate }: DesignEditorProps) {
  const colorScheme = (website.colorScheme as ColorScheme) || {};
  const websiteData = (website.websiteData as WebsiteData) || {};
  const designTokens = websiteData.designTokens || {};

  const [colors, setColors] = useState({
    primary: colorScheme.primary || "#3B82F6",
    secondary: colorScheme.secondary || "#F1F5F9",
    accent: colorScheme.accent || "#8B5CF6",
    background: colorScheme.background || "#FFFFFF",
    text: colorScheme.text || "#1E293B",
  });

  const [fonts, setFonts] = useState({
    headlineFont: designTokens.headlineFont || "Inter",
    bodyFont: designTokens.bodyFont || "Inter",
    headlineSize: designTokens.headlineSize || "text-4xl",
  });

  const [saving, setSaving] = useState(false);

  const updateDesign = trpc.customer.updateDesign.useMutation({
    onSuccess: () => {
      toast.success("Design-Einstellungen gespeichert");
      onUpdate();
    },
    onError: () => toast.error("Speichern fehlgeschlagen"),
  });

  const handleSave = async () => {
    setSaving(true);
    await updateDesign.mutateAsync({
      websiteId,
      colorScheme: colors,
      designTokens: fonts,
    });
    setSaving(false);
  };

  const headlineSizeOptions = ["text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl"];
  const fontOptions = ["Inter", "Poppins", "Playfair Display", "Roboto", "Open Sans", "Lato", "Montserrat"];

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div className="bg-slate-800/40 rounded-xl p-4 space-y-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-400" />
          Farbschema
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Primär</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs font-mono">{colors.primary}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Sekundär</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs font-mono">{colors.secondary}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Akzent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs font-mono">{colors.accent}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Hintergrund</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.background}
                onChange={(e) => setColors({ ...colors, background: e.target.value })}
                className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs font-mono">{colors.background}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Text</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.text}
                onChange={(e) => setColors({ ...colors, text: e.target.value })}
                className="w-8 h-8 rounded border-0 p-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs font-mono">{colors.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div className="bg-slate-800/40 rounded-xl p-4 space-y-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Type className="w-4 h-4 text-violet-400" />
          Schriftarten
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Überschriften</label>
            <select
              value={fonts.headlineFont}
              onChange={(e) => setFonts({ ...fonts, headlineFont: e.target.value })}
              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
            >
              {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Fließtext</label>
            <select
              value={fonts.bodyFont}
              onChange={(e) => setFonts({ ...fonts, bodyFont: e.target.value })}
              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
            >
              {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Überschriften-Größe</label>
            <select
              value={fonts.headlineSize}
              onChange={(e) => setFonts({ ...fonts, headlineSize: e.target.value })}
              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
            >
              {headlineSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Design speichern
      </button>
    </div>
  );
}

// ── Add-ons Editor ───────────────────────────────────
interface AddonsEditorProps {
  websiteId: number;
  website: any;
  onboarding: any;
  onUpdate: () => void;
}

function AddonsEditor({ websiteId, website, onboarding, onUpdate }: AddonsEditorProps) {
  const websiteData = (website.websiteData as WebsiteData) || {};

  const [addons, setAddons] = useState({
    gallery: {
      enabled: onboarding?.addOnGallery || false,
      photos: (websiteData.sections?.find((s: any) => s.type === "gallery")?.photos || []) as string[],
    },
    menu: {
      enabled: onboarding?.addOnMenu || false,
      items: (websiteData.sections?.find((s: any) => s.type === "menu")?.items || []) as any[],
    },
    pricelist: {
      enabled: onboarding?.addOnPricelist || false,
      items: (websiteData.sections?.find((s: any) => s.type === "pricelist")?.items || []) as any[],
    },
    contactForm: onboarding?.addOnContactForm || false,
  });

  const [saving, setSaving] = useState(false);

  const updateAddons = trpc.customer.updateAddons.useMutation({
    onSuccess: () => {
      toast.success("Add-ons gespeichert");
      onUpdate();
    },
    onError: () => toast.error("Speichern fehlgeschlagen"),
  });

  const handleSave = async () => {
    setSaving(true);
    await updateAddons.mutateAsync({
      websiteId,
      addOns: {
        gallery: addons.gallery.enabled ? { enabled: true, photos: addons.gallery.photos } : { enabled: false },
        menu: addons.menu.enabled ? { enabled: true, items: addons.menu.items } : { enabled: false },
        pricelist: addons.pricelist.enabled ? { enabled: true, items: addons.pricelist.items } : { enabled: false },
        contactForm: addons.contactForm,
      },
    });
    setSaving(false);
  };

  const toggleAddon = (key: keyof typeof addons) => {
    if (key === "contactForm") {
      setAddons({ ...addons, contactForm: !addons.contactForm });
    } else {
      setAddons({
        ...addons,
        [key]: { ...addons[key], enabled: !addons[key].enabled },
      });
    }
  };

  // Gallery functions
  const addGalleryPhoto = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Max. 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const result = await (window as any).__trpcUpload?.({ websiteId, imageData: base64, mimeType: file.type });
        if (result?.url) {
          setAddons({
            ...addons,
            gallery: { ...addons.gallery, photos: [...addons.gallery.photos, result.url] },
          });
        }
      } catch {
        toast.error("Upload fehlgeschlagen");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryPhoto = (idx: number) => {
    setAddons({
      ...addons,
      gallery: { ...addons.gallery, photos: addons.gallery.photos.filter((_, i) => i !== idx) },
    });
  };

  // Menu functions
  const addMenuItem = () => {
    setAddons({
      ...addons,
      menu: { ...addons.menu, items: [...(addons.menu.items || []), { name: "", description: "", price: "" }] },
    });
  };

  const updateMenuItem = (idx: number, field: string, value: string) => {
    const newItems = [...(addons.menu.items || [])];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setAddons({ ...addons, menu: { ...addons.menu, items: newItems } });
  };

  const removeMenuItem = (idx: number) => {
    setAddons({
      ...addons,
      menu: { ...addons.menu, items: addons.menu.items?.filter((_, i) => i !== idx) },
    });
  };

  // Pricelist functions
  const addPriceItem = () => {
    setAddons({
      ...addons,
      pricelist: { ...addons.pricelist, items: [...(addons.pricelist.items || []), { name: "", price: "", description: "" }] },
    });
  };

  const updatePriceItem = (idx: number, field: string, value: string) => {
    const newItems = [...(addons.pricelist.items || [])];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setAddons({ ...addons, pricelist: { ...addons.pricelist, items: newItems } });
  };

  const removePriceItem = (idx: number) => {
    setAddons({
      ...addons,
      pricelist: { ...addons.pricelist, items: addons.pricelist.items?.filter((_, i) => i !== idx) },
    });
  };

  return (
    <div className="space-y-6">
      {/* Gallery */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Image className="w-4 h-4 text-pink-400" />
            Bildergalerie
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={addons.gallery.enabled}
              onChange={() => toggleAddon("gallery")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
        {addons.gallery.enabled && (
          <div className="space-y-3">
            {addons.gallery.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {addons.gallery.photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={photo} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeGalleryPhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded bg-red-600/80 hover:bg-red-600 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 justify-center text-xs text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addGalleryPhoto(file);
                }}
              />
              <Plus className="w-4 h-4" />
              Bild hinzufügen
            </label>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Speisekarte
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={addons.menu.enabled}
              onChange={() => toggleAddon("menu")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
        {addons.menu.enabled && (
          <div className="space-y-3">
            {addons.menu.items?.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start bg-slate-700/30 rounded-lg p-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={item.name || ""}
                    onChange={(e) => updateMenuItem(idx, "name", e.target.value)}
                    placeholder="Name"
                    className="w-full bg-slate-700/60 text-white text-sm px-2 py-1 rounded border border-slate-600 outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) => updateMenuItem(idx, "description", e.target.value)}
                    placeholder="Beschreibung"
                    className="w-full bg-slate-700/60 text-white text-sm px-2 py-1 rounded border border-slate-600 outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={item.price || ""}
                    onChange={(e) => updateMenuItem(idx, "price", e.target.value)}
                    placeholder="Preis"
                    className="w-24 bg-slate-700/60 text-white text-sm px-2 py-1 rounded border border-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => removeMenuItem(idx)}
                  className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addMenuItem}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Menüpunkt hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Pricelist */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            Preisliste
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={addons.pricelist.enabled}
              onChange={() => toggleAddon("pricelist")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
        {addons.pricelist.enabled && (
          <div className="space-y-3">
            {addons.pricelist.items?.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start bg-slate-700/30 rounded-lg p-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={item.name || ""}
                    onChange={(e) => updatePriceItem(idx, "name", e.target.value)}
                    placeholder="Leistung"
                    className="w-full bg-slate-700/60 text-white text-sm px-2 py-1 rounded border border-slate-600 outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.price || ""}
                      onChange={(e) => updatePriceItem(idx, "price", e.target.value)}
                      placeholder="Preis"
                      className="w-24 bg-slate-700/60 text-white text-sm px-2 py-1 rounded border border-slate-600 outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) => updatePriceItem(idx, "description", e.target.value)}
                      placeholder="Beschreibung (optional)"
                      className="flex-1 bg-slate-700/60 text-white text-sm px-2 py-1 rounded border border-slate-600 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removePriceItem(idx)}
                  className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addPriceItem}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Preis hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Contact Form */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            Kontaktformular
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={addons.contactForm}
              onChange={() => toggleAddon("contactForm")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Add-ons speichern
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────
export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [previewKey, setPreviewKey] = useState(0);

  const { data: myWebsites, isLoading, refetch } = trpc.customer.getMyWebsites.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: onboardingData } = trpc.customer.getOnboardingData.useQuery(
    { websiteId: selectedWebsiteId || myWebsites?.[0]?.website.id || 0 },
    { enabled: !!selectedWebsiteId || !!myWebsites?.[0]?.website.id }
  );

  const updateMutation = trpc.customer.updateWebsiteContent.useMutation({
    onSuccess: () => {
      refetch();
      setPreviewKey((k) => k + 1);
    },
  });

  const handleUpdate = () => {
    refetch();
    setPreviewKey((k) => k + 1);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Meine Website</h1>
          <p className="text-slate-400 mb-6">Melde dich an, um deine Website zu verwalten.</p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Anmelden
          </a>
        </div>
      </div>
    );
  }

  if (!myWebsites || myWebsites.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Keine Website gefunden</h1>
          <p className="text-slate-400 mb-6">Du hast noch keine aktive Website. Erstelle jetzt deine erste Website!</p>
          <a
            href="/start"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Website erstellen
          </a>
        </div>
      </div>
    );
  }

  const selectedEntry = myWebsites.find((e) => e.website.id === selectedWebsiteId) || myWebsites[0];
  const { website, business } = selectedEntry;
  const websiteData = website.websiteData as WebsiteData | undefined;
  const colorScheme = website.colorScheme as ColorScheme | undefined;

  const makeUpdater = (field: string) => async (value: string) => {
    await updateMutation.mutateAsync({
      websiteId: website.id,
      patch: { [field]: value },
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "preview", label: "Vorschau", icon: <Globe className="w-4 h-4" /> },
    { id: "content", label: "Inhalte", icon: <Edit2 className="w-4 h-4" /> },
    { id: "design", label: "Design", icon: <Palette className="w-4 h-4" /> },
    { id: "addons", label: "Add-ons", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Meine Website</h1>
              <p className="text-slate-400 text-xs">Verwalte und bearbeite deine Website</p>
            </div>
          </div>
          {myWebsites.length > 1 && (
            <select
              value={selectedWebsiteId || myWebsites[0].website.id}
              onChange={(e) => setSelectedWebsiteId(Number(e.target.value))}
              className="bg-slate-700 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none"
            >
              {myWebsites.map((e) => (
                <option key={e.website.id} value={e.website.id}>
                  {e.business?.name || e.website.slug}
                </option>
              ))}
            </select>
          )}
          <StatusBadge status={website.status} />
          {website.status === "active" && (
            <a
              href={`/site/${website.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Website öffnen
            </a>
          )}
          <a
            href="/my-account"
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <User className="w-4 h-4" />
            Mein Konto
          </a>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-blue-400 border-blue-400 bg-blue-500/10"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 bg-slate-700/60 rounded-lg px-3 py-1 text-slate-400 text-xs font-mono">
                {website.slug}.pageblitz.de
              </div>
              {website.status === "active" && (
                <a href={`/site/${website.slug}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <div className="overflow-auto max-h-[calc(100vh-280px)]">
              {websiteData ? (
                <div key={previewKey} className="transform-gpu origin-top" style={{ transform: "scale(0.85)", transformOrigin: "top left", width: "117.65%", height: "117.65%" }}>
                  <WebsiteRenderer
                    websiteData={websiteData}
                    colorScheme={colorScheme}
                    heroImageUrl={website.heroImageUrl || undefined}
                    aboutImageUrl={(website as any).aboutImageUrl || undefined}
                    layoutStyle={(website as any).layoutStyle || undefined}
                    businessPhone={business?.phone || undefined}
                    businessAddress={business?.address || undefined}
                    businessEmail={business?.email || undefined}
                    slug={website.slug}
                    contactFormLocked={false}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-500">
                  <div className="text-center">
                    <Globe className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                    <p className="text-sm">Keine Vorschau verfügbar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Info */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                Unternehmensdaten
              </h2>
              <EditableField
                label="Unternehmensname"
                value={websiteData?.businessName || business?.name || ""}
                onSave={makeUpdater("businessName")}
              />
              <EditableField
                label="Tagline / Slogan"
                value={websiteData?.tagline || ""}
                multiline
                onSave={makeUpdater("tagline")}
              />
              <EditableField
                label="Beschreibung"
                value={websiteData?.description || ""}
                multiline
                onSave={makeUpdater("description")}
              />
            </div>

            {/* Contact Info */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                Kontaktdaten
              </h2>
              <EditableField
                label="Telefon"
                value={business?.phone || ""}
                icon={<Phone className="w-3 h-3" />}
                onSave={makeUpdater("phone")}
              />
              <EditableField
                label="E-Mail"
                value={business?.email || ""}
                icon={<Mail className="w-3 h-3" />}
                onSave={makeUpdater("email")}
              />
              <EditableField
                label="Adresse"
                value={business?.address || ""}
                icon={<MapPin className="w-3 h-3" />}
                onSave={makeUpdater("address")}
              />
            </div>

            {/* Services */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 lg:col-span-2">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Leistungen & USP
              </h2>
              <ServicesEditor
                websiteId={website.id}
                initialServices={onboardingData?.topServices || []}
                initialUsp={onboardingData?.usp || websiteData?.usp}
                onUpdate={handleUpdate}
              />
            </div>

            {/* Legal Data */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 lg:col-span-2">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-amber-400" />
                Impressum-Daten
              </h2>
              <LegalEditor
                websiteId={website.id}
                initialData={{
                  legalOwner: onboardingData?.legalOwner || "",
                  legalStreet: onboardingData?.legalStreet || "",
                  legalZip: onboardingData?.legalZip || "",
                  legalCity: onboardingData?.legalCity || "",
                  legalEmail: onboardingData?.legalEmail || "",
                  legalPhone: onboardingData?.legalPhone || "",
                  legalVatId: onboardingData?.legalVatId || "",
                }}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        )}

        {/* Design Tab */}
        {activeTab === "design" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                  <Palette className="w-4 h-4 text-blue-400" />
                  Design-Einstellungen
                </h2>
                <DesignEditor
                  websiteId={website.id}
                  website={website}
                  onUpdate={handleUpdate}
                />
              </div>
            </div>
            <div className="space-y-4">
              {/* Hero Image */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Image className="w-4 h-4 text-blue-400" />
                  Hauptbild
                </h3>
                {website.heroImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video">
                    <img src={website.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                    <button
                      onClick={() => updateMutation.mutate({ websiteId: website.id, patch: { heroPhotoUrl: "" } })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-slate-700/40 border-2 border-dashed border-slate-600 flex items-center justify-center">
                    <Image className="w-8 h-8 text-slate-500" />
                  </div>
                )}
                <label className="w-full flex items-center gap-2 justify-center text-xs text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { toast.error("Max. 5 MB"); return; }
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = (reader.result as string).split(",")[1];
                        try {
                          const result = await (window as any).__trpcUpload?.({ websiteId: website.id, imageData: base64, mimeType: file.type });
                          if (result?.url) {
                            await updateMutation.mutateAsync({ websiteId: website.id, patch: { heroPhotoUrl: result.url } });
                          }
                        } catch {
                          toast.error("Upload fehlgeschlagen");
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <RefreshCw className="w-3.5 h-3.5" />
                  Bild ändern
                </label>
              </div>

              {/* About Image */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Image className="w-4 h-4 text-violet-400" />
                  Über-uns-Bild
                </h3>
                {(website as any).aboutImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video">
                    <img src={(website as any).aboutImageUrl} alt="Über uns" className="w-full h-full object-cover" />
                    <button
                      onClick={() => updateMutation.mutate({ websiteId: website.id, patch: { aboutPhotoUrl: "" } })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-slate-700/40 border-2 border-dashed border-slate-600 flex items-center justify-center">
                    <Image className="w-8 h-8 text-slate-500" />
                  </div>
                )}
                <label className="w-full flex items-center gap-2 justify-center text-xs text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { toast.error("Max. 5 MB"); return; }
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = (reader.result as string).split(",")[1];
                        try {
                          const result = await (window as any).__trpcUpload?.({ websiteId: website.id, imageData: base64, mimeType: file.type });
                          if (result?.url) {
                            await updateMutation.mutateAsync({ websiteId: website.id, patch: { aboutPhotoUrl: result.url } });
                          }
                        } catch {
                          toast.error("Upload fehlgeschlagen");
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <RefreshCw className="w-3.5 h-3.5" />
                  Bild ändern
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Add-ons Tab */}
        {activeTab === "addons" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Add-ons verwalten
              </h2>
              <AddonsEditor
                websiteId={website.id}
                website={website}
                onboarding={onboardingData}
                onUpdate={handleUpdate}
              />
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-blue-400" />
                Erweiterte Bearbeitung
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Für detaillierte Bearbeitung von Galerie-Bildern, Menüpunkten und Preisen nutze das vollständige Onboarding.
              </p>
              <a
                href={`/preview/${website.previewToken}/onboarding`}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Vollständiges Onboarding öffnen
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

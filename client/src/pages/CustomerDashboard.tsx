import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Loader2, Globe, ExternalLink, Edit2, Check, X, Palette, Phone, Mail, MapPin, Image, RefreshCw, Settings, User, LayoutGrid, Type, Sparkles, Plus, Trash2, ChevronLeft, ChevronUp, ChevronDown, Upload, MessageSquare, GripVertical, Eye, EyeOff, Layers, BarChart2, Users, MousePointerClick, Clock, Lock, Calendar, CalendarCheck, CalendarX, CalendarDays } from "lucide-react";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import StockPhotoSearch from "@/components/StockPhotoSearch";
import type { WebsiteData, ColorScheme } from "@shared/types";
import { FONT_OPTIONS } from "@shared/layoutConfig";

// ── Types ───────────────────────────────────────────
type Tab = "preview" | "content" | "structure" | "design" | "addons" | "analytics" | "submissions" | "domain" | "leads" | "appointments";

interface SectionConfig {
  type: string;
  headline?: string;
  enabled: boolean;
}

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

// ── Contact Form Editor ───────────────────────────────
interface FormField {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "textarea" | "select";
  required: boolean;
  options?: string[]; // for select type
}

interface ContactFormEditorProps {
  websiteId: number;
}

function ContactFormEditor({ websiteId, initialFields, onSave }: ContactFormEditorProps & { initialFields?: FormField[], onSave?: (fields: FormField[]) => void }) {
  // Default form fields
  const defaultFields: FormField[] = [
    { id: "name", label: "Name", placeholder: "Max Mustermann", type: "text", required: true },
    { id: "email", label: "E-Mail", placeholder: "max@beispiel.de", type: "email", required: true },
    { id: "subject", label: "Betreff", placeholder: "Ihr Anliegen", type: "text", required: true },
    { id: "message", label: "Nachricht", placeholder: "Ihre Nachricht...", type: "textarea", required: true },
  ];

  const [fields, setFields] = useState<FormField[]>(initialFields || defaultFields);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Update fields when initialFields changes
  useEffect(() => {
    if (initialFields && initialFields.length > 0) {
      setFields(initialFields);
    }
  }, [initialFields]);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "Neues Feld",
      placeholder: "",
      type: "text",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (idx: number) => {
    if (fields.length <= 1) return;
    setFields(fields.filter((_, i) => i !== idx));
  };

  const moveField = (idx: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= newFields.length) return;
    [newFields[idx], newFields[swapWith]] = [newFields[swapWith], newFields[idx]];
    setFields(newFields);
  };

  const updateField = (idx: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    const updated = { ...newFields[idx], ...updates };
    // When type is changed to "email", auto-set id to "email" so form submission works.
    // Only do this if no other field already uses id "email".
    if (updates.type === 'email' && updated.id !== 'email') {
      const alreadyHasEmail = fields.some((f, i) => i !== idx && f.id === 'email');
      if (!alreadyHasEmail) updated.id = 'email';
    }
    newFields[idx] = updated;
    setFields(newFields);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave(fields);
      }
      setSaved(true);
      toast.success("Formularfelder gespeichert");
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-400 mb-3">
        Passe die Felde deines Kontaktformulars an. Die Änderungen werden auf der Website übernommen.
      </div>

      <div className="space-y-3">
        {fields.map((field, idx) => (
          <div key={field.id} className="bg-slate-800/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              {/* Up / Down reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveField(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-20"
                  title="Nach oben"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveField(idx, "down")}
                  disabled={idx === fields.length - 1}
                  className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-20"
                  title="Nach unten"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <span className="text-slate-500 text-xs font-mono">#{idx + 1}</span>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(idx, { label: e.target.value })}
                placeholder="Feldname"
                className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500 font-medium"
              />
              <button
                onClick={() => removeField(idx)}
                disabled={fields.length <= 1}
                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Feldtyp</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(idx, { type: e.target.value as FormField["type"] })}
                  className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="email">E-Mail</option>
                  <option value="textarea">Mehrzeilig</option>
                  <option value="select">Auswahl</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(idx, { required: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700/60 text-blue-600 focus:ring-blue-500"
                  />
                  Pflichtfeld
                </label>
              </div>
            </div>

            {field.type !== "textarea" && (
              <input
                type="text"
                value={field.placeholder}
                onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                placeholder="Platzhalter-Text"
                className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
              />
            )}

            {field.type === "select" && (
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Optionen (kommagetrennt)</label>
                <input
                  type="text"
                  value={field.options?.join(", ") || ""}
                  onChange={(e) => updateField(idx, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Option 1, Option 2, Option 3"
                  className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addField}
        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2"
      >
        <Plus className="w-4 h-4" />
        Feld hinzufügen
      </button>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        {saving ? "Speichern..." : saved ? "Gespeichert!" : "Formularfelder speichern"}
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
  // Helper: extract colors from website object
  const colorsFromWebsite = (w: any) => {
    const cs = (w.colorScheme as ColorScheme) || {};
    return {
      primary:    cs.primary    || "#3B82F6",
      secondary:  cs.secondary  || "#F1F5F9",
      accent:     cs.accent     || "#8B5CF6",
      background: cs.background || "#FFFFFF",
      text:       cs.text       || "#1E293B",
    };
  };

  // Helper: extract fonts – normalize old "text-4xl" headlineSize to "large"/"medium"/"small"
  const fontsFromWebsite = (w: any) => {
    const dt = ((w.websiteData as WebsiteData) || {}).designTokens || {};
    const rawSize = dt.headlineSize || "large";
    const headlineSize =
      ["small", "medium", "large"].includes(rawSize) ? rawSize
      : rawSize === "text-2xl" || rawSize === "text-3xl" ? "small"
      : rawSize === "text-5xl" || rawSize === "text-6xl" ? "large"
      : "large";
    return {
      headlineFont: (dt.headlineFont as string) || "",  // "" = keep layout default
      bodyFont:     (dt.bodyFont     as string) || "",
      headlineSize,
    };
  };

  const [colors, setColors] = useState(() => colorsFromWebsite(website));
  const [fonts,  setFonts]  = useState(() => fontsFromWebsite(website));
  const [saving, setSaving] = useState(false);

  // Sync form state whenever website prop changes (after onUpdate / refetch)
  useEffect(() => {
    setColors(colorsFromWebsite(website));
    setFonts(fontsFromWebsite(website));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [website.colorScheme, website.websiteData]);

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
      // only send font overrides when explicitly set (empty = keep layout default)
      designTokens: {
        ...(fonts.headlineFont ? { headlineFont: fonts.headlineFont } : {}),
        ...(fonts.bodyFont     ? { bodyFont:     fonts.bodyFont     } : {}),
        headlineSize: fonts.headlineSize,
      },
    });
    setSaving(false);
  };

  const headlineSizeOptions = [
    { value: "small",  label: "Normal" },
    { value: "medium", label: "Groß" },
    { value: "large",  label: "Extra groß" },
  ];
  // fontOptions rendered inline via FONT_OPTIONS from layoutConfig

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
              <option value="">Layout-Standard</option>
              <optgroup label="── Serifenschriften ──">
                {FONT_OPTIONS.serif.map(f => <option key={f.font} value={f.font}>{f.label}</option>)}
              </optgroup>
              <optgroup label="── Serifenlose ──">
                {FONT_OPTIONS.sans.map(f => <option key={f.font} value={f.font}>{f.label}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Fließtext</label>
            <select
              value={fonts.bodyFont}
              onChange={(e) => setFonts({ ...fonts, bodyFont: e.target.value })}
              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
            >
              <option value="">Layout-Standard</option>
              <optgroup label="── Serifenschriften ──">
                {FONT_OPTIONS.serif.map(f => <option key={f.font} value={f.font}>{f.label}</option>)}
              </optgroup>
              <optgroup label="── Serifenlose ──">
                {FONT_OPTIONS.sans.map(f => <option key={f.font} value={f.font}>{f.label}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Überschriften-Größe</label>
            <select
              value={fonts.headlineSize}
              onChange={(e) => setFonts({ ...fonts, headlineSize: e.target.value })}
              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-blue-500"
            >
              {headlineSizeOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
  purchasedAddOns: Record<string, boolean>;
  onGoToTermine: () => void;
}

function AddonsEditor({ websiteId, website, onboarding, onUpdate, purchasedAddOns, onGoToTermine }: AddonsEditorProps) {
  const websiteData = (website.websiteData as WebsiteData) || {};

  // Get existing data from website sections
  const existingMenu = websiteData.sections?.find((s: any) => s.type === "menu");
  const existingPricelist = websiteData.sections?.find((s: any) => s.type === "pricelist");
  const existingGallery = websiteData.sections?.find((s: any) => s.type === "gallery");

  // Get contact form fields from onboarding or website
  const contactFormFields = onboarding?.contactFormFields || websiteData?.contactFormFields || website?.contactFormFields;

  const [addons, setAddons] = useState({
    gallery: {
      enabled: onboarding?.addOnGallery || false,
      photos: (existingGallery?.items?.map((item: any) => item.imageUrl || item) || []) as string[],
    },
    menu: {
      enabled: onboarding?.addOnMenu || false,
      categories: (existingMenu?.items ?
        // Convert items back to categories format for editing
        Object.entries(existingMenu.items.reduce((acc: any, item: any) => {
          const cat = item.category || "Speisekarte";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push({ name: item.title, description: item.description, price: item.price });
          return acc;
        }, {})).map(([name, items]) => ({ name, items })) :
        [{ name: "Speisekarte", items: [] }]
      ) as any[],
    },
    pricelist: {
      enabled: onboarding?.addOnPricelist || false,
      categories: (existingPricelist?.items ?
        // Convert items back to categories format for editing
        Object.entries(existingPricelist.items.reduce((acc: any, item: any) => {
          const cat = item.category || "Leistungen";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push({ name: item.title, description: item.description, price: item.price });
          return acc;
        }, {})).map(([name, items]) => ({ name, items })) :
        [{ name: "Leistungen", items: [] }]
      ) as any[],
    },
    contactForm: onboarding?.addOnContactForm || false,
    contactFormFields: (contactFormFields as FormField[] | undefined) || [
      { id: "name", label: "Name", placeholder: "Max Mustermann", type: "text", required: true },
      { id: "email", label: "E-Mail", placeholder: "max@beispiel.de", type: "email", required: true },
      { id: "subject", label: "Betreff", placeholder: "Ihr Anliegen", type: "text", required: true },
      { id: "message", label: "Nachricht", placeholder: "Ihre Nachricht...", type: "textarea", required: true },
    ],
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [confirmAddon, setConfirmAddon] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialSavedRef = useRef(false);
  // Stable ref — initialized null here, assigned after updateAddons is declared below
  const updateAddonsRef = useRef<any>(null);

  const purchaseAddonMutation = trpc.customer.purchaseAddon.useMutation({
    onSuccess: (_, variables) => {
      const key = variables.addonKey;
      if (key === "contactForm") {
        setAddons(prev => ({ ...prev, contactForm: true }));
      } else {
        setAddons(prev => ({
          ...prev,
          [key]: { ...(prev as any)[key], enabled: true },
        }));
      }
      setConfirmAddon(null);
      onUpdate();
      toast.success("Add-on freigeschaltet! 🎉");
    },
    onError: (err: any) => {
      toast.error("Freischalten fehlgeschlagen: " + err.message);
      setConfirmAddon(null);
    },
  });

  const ADDON_LABELS: Record<string, { name: string; icon: string; color: string }> = {
    gallery:     { name: "Bildergalerie",   icon: "🖼️",  color: "text-pink-300" },
    menu:        { name: "Speisekarte",     icon: "🍽️",  color: "text-amber-300" },
    pricelist:   { name: "Preisliste",      icon: "💶",  color: "text-emerald-300" },
    contactForm: { name: "Kontaktformular", icon: "✉️",  color: "text-blue-300" },
  };

  const renderAddonLock = (addonKey: "gallery" | "menu" | "pricelist" | "contactForm") => (
    <button
      onClick={() => setConfirmAddon(addonKey)}
      className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 hover:text-blue-200 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0"
    >
      <Lock className="w-3 h-3" />
      Freischalten
    </button>
  );

  const uploadMutation = trpc.customer.uploadGalleryImage.useMutation();

  const updateAddons = trpc.customer.updateAddons.useMutation({
    onSuccess: () => {
      setSaveStatus("saved");
      setLastSaved(new Date());
      setSaving(false);
      onUpdate();
    },
    onError: () => {
      setSaveStatus("unsaved");
      setSaving(false);
      toast.error("Speichern fehlgeschlagen");
    },
  });
  // Keep ref in sync on every render — safe since refs are just mutable containers
  updateAddonsRef.current = updateAddons;

  // Auto-save effect - watches for changes in addons
  useEffect(() => {
    // Skip initial render
    if (!hasInitialSavedRef.current) {
      hasInitialSavedRef.current = true;
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setSaveStatus("unsaved");

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      setSaveStatus("saving");
      setSaving(true);
      updateAddonsRef.current.mutate({
        websiteId,
        addOns: {
          gallery: addons.gallery.enabled ? { enabled: true, photos: addons.gallery.photos } : { enabled: false },
          menu: addons.menu.enabled ? { enabled: true, categories: addons.menu.categories } : { enabled: false },
          pricelist: addons.pricelist.enabled ? { enabled: true, categories: addons.pricelist.categories } : { enabled: false },
          contactForm: addons.contactForm,
          contactFormFields: addons.contactFormFields || [
            { id: "name", label: "Name", placeholder: "Max Mustermann", type: "text", required: true },
            { id: "email", label: "E-Mail", placeholder: "max@beispiel.de", type: "email", required: true },
            { id: "subject", label: "Betreff", placeholder: "Ihr Anliegen", type: "text", required: true },
            { id: "message", label: "Nachricht", placeholder: "Ihre Nachricht...", type: "textarea", required: true },
          ],
        },
      });
    }, 800); // 800ms debounce

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [addons, websiteId]); // updateAddons intentionally excluded — stable via ref

  const handleSave = async () => {
    setSaving(true);
    await updateAddons.mutateAsync({
      websiteId,
      addOns: {
        gallery: addons.gallery.enabled ? { enabled: true, photos: addons.gallery.photos } : { enabled: false },
        menu: addons.menu.enabled ? { enabled: true, categories: addons.menu.categories } : { enabled: false },
        pricelist: addons.pricelist.enabled ? { enabled: true, categories: addons.pricelist.categories } : { enabled: false },
        contactForm: addons.contactForm,
        contactFormFields: addons.contactFormFields || [
          { id: "name", label: "Name", placeholder: "Max Mustermann", type: "text", required: true },
          { id: "email", label: "E-Mail", placeholder: "max@beispiel.de", type: "email", required: true },
          { id: "subject", label: "Betreff", placeholder: "Ihr Anliegen", type: "text", required: true },
          { id: "message", label: "Nachricht", placeholder: "Ihre Nachricht...", type: "textarea", required: true },
        ],
      },
    });
    setSaving(false);
  };

  const handleSaveContactFormFields = async (fields: FormField[]) => {
    const newAddons = { ...addons, contactFormFields: fields };
    setAddons(newAddons);
    await updateAddons.mutateAsync({
      websiteId,
      addOns: {
        gallery: addons.gallery.enabled ? { enabled: true, photos: addons.gallery.photos } : { enabled: false },
        menu: addons.menu.enabled ? { enabled: true, categories: addons.menu.categories } : { enabled: false },
        pricelist: addons.pricelist.enabled ? { enabled: true, categories: addons.pricelist.categories } : { enabled: false },
        contactForm: addons.contactForm,
        contactFormFields: fields,
      },
    });
  };

  const toggleAddon = (key: keyof typeof addons) => {
    // Build the updated addons object immediately so we can save it right away
    let newAddons: typeof addons;
    if (key === "contactForm") {
      newAddons = { ...addons, contactForm: !addons.contactForm };
    } else {
      const newEnabled = !addons[key].enabled;
      newAddons = { ...addons, [key]: { ...addons[key], enabled: newEnabled } };
      // No auto-expand — user navigates to detail via "Einstellungen" button
    }
    setAddons(newAddons);

    // Save immediately — do NOT rely on the debounce which gets cancelled on tab-switch
    setSaveStatus("saving");
    setSaving(true);
    updateAddonsRef.current.mutate({
      websiteId,
      addOns: {
        gallery: newAddons.gallery.enabled ? { enabled: true, photos: newAddons.gallery.photos } : { enabled: false },
        menu: newAddons.menu.enabled ? { enabled: true, categories: newAddons.menu.categories } : { enabled: false },
        pricelist: newAddons.pricelist.enabled ? { enabled: true, categories: newAddons.pricelist.categories } : { enabled: false },
        contactForm: newAddons.contactForm,
        contactFormFields: newAddons.contactFormFields || [
          { id: "name", label: "Name", placeholder: "Max Mustermann", type: "text", required: true },
          { id: "email", label: "E-Mail", placeholder: "max@beispiel.de", type: "email", required: true },
          { id: "subject", label: "Betreff", placeholder: "Ihr Anliegen", type: "text", required: true },
          { id: "message", label: "Nachricht", placeholder: "Ihre Nachricht...", type: "textarea", required: true },
        ],
      },
    });
  };

  // Gallery functions
  const addGalleryPhoto = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Max. 5 MB"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const result = await uploadMutation.mutateAsync({ websiteId, imageData: base64, mimeType: file.type });
        if (result?.url) {
          setAddons({
            ...addons,
            gallery: { ...addons.gallery, photos: [...addons.gallery.photos, result.url] },
          });
          toast.success("Bild hochgeladen");
          // Auto-save will be triggered by useEffect
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error("Upload fehlgeschlagen: " + (error.message || "Unbekannter Fehler"));
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error("Fehler beim Lesen der Datei");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryPhoto = (idx: number) => {
    setAddons({
      ...addons,
      gallery: { ...addons.gallery, photos: addons.gallery.photos.filter((_, i) => i !== idx) },
    });
    // Auto-save will be triggered by useEffect
  };

  // Menu category functions
  const addMenuCategory = () => {
    setAddons({
      ...addons,
      menu: { ...addons.menu, categories: [...addons.menu.categories, { name: "Neue Kategorie", items: [] }] },
    });
  };

  const updateMenuCategoryName = (catIdx: number, name: string) => {
    const newCategories = [...addons.menu.categories];
    newCategories[catIdx] = { ...newCategories[catIdx], name };
    setAddons({ ...addons, menu: { ...addons.menu, categories: newCategories } });
  };

  const removeMenuCategory = (catIdx: number) => {
    if (addons.menu.categories.length <= 1) return;
    setAddons({
      ...addons,
      menu: { ...addons.menu, categories: addons.menu.categories.filter((_, i) => i !== catIdx) },
    });
  };

  const addMenuItem = (catIdx: number) => {
    const newCategories = [...addons.menu.categories];
    newCategories[catIdx] = {
      ...newCategories[catIdx],
      items: [...(newCategories[catIdx].items || []), { name: "", description: "", price: "" }],
    };
    setAddons({ ...addons, menu: { ...addons.menu, categories: newCategories } });
  };

  const updateMenuItem = (catIdx: number, itemIdx: number, field: string, value: string) => {
    const newCategories = [...addons.menu.categories];
    const items = [...(newCategories[catIdx].items || [])];
    items[itemIdx] = { ...items[itemIdx], [field]: value };
    newCategories[catIdx] = { ...newCategories[catIdx], items };
    setAddons({ ...addons, menu: { ...addons.menu, categories: newCategories } });
  };

  const removeMenuItem = (catIdx: number, itemIdx: number) => {
    const newCategories = [...addons.menu.categories];
    newCategories[catIdx] = {
      ...newCategories[catIdx],
      items: newCategories[catIdx].items.filter((_: any, i: number) => i !== itemIdx),
    };
    setAddons({ ...addons, menu: { ...addons.menu, categories: newCategories } });
  };

  // Pricelist category functions
  const addPriceCategory = () => {
    setAddons({
      ...addons,
      pricelist: { ...addons.pricelist, categories: [...addons.pricelist.categories, { name: "Neue Kategorie", items: [] }] },
    });
  };

  const updatePriceCategoryName = (catIdx: number, name: string) => {
    const newCategories = [...addons.pricelist.categories];
    newCategories[catIdx] = { ...newCategories[catIdx], name };
    setAddons({ ...addons, pricelist: { ...addons.pricelist, categories: newCategories } });
  };

  const removePriceCategory = (catIdx: number) => {
    if (addons.pricelist.categories.length <= 1) return;
    setAddons({
      ...addons,
      pricelist: { ...addons.pricelist, categories: addons.pricelist.categories.filter((_, i) => i !== catIdx) },
    });
  };

  const addPriceItem = (catIdx: number) => {
    const newCategories = [...addons.pricelist.categories];
    newCategories[catIdx] = {
      ...newCategories[catIdx],
      items: [...(newCategories[catIdx].items || []), { name: "", description: "", price: "" }],
    };
    setAddons({ ...addons, pricelist: { ...addons.pricelist, categories: newCategories } });
  };

  const updatePriceItem = (catIdx: number, itemIdx: number, field: string, value: string) => {
    const newCategories = [...addons.pricelist.categories];
    const items = [...(newCategories[catIdx].items || [])];
    items[itemIdx] = { ...items[itemIdx], [field]: value };
    newCategories[catIdx] = { ...newCategories[catIdx], items };
    setAddons({ ...addons, pricelist: { ...addons.pricelist, categories: newCategories } });
  };

  const removePriceItem = (catIdx: number, itemIdx: number) => {
    const newCategories = [...addons.pricelist.categories];
    newCategories[catIdx] = {
      ...newCategories[catIdx],
      items: newCategories[catIdx].items.filter((_: any, i: number) => i !== itemIdx),
    };
    setAddons({ ...addons, pricelist: { ...addons.pricelist, categories: newCategories } });
  };

  // ── helper to render a consistent toggle switch ───────────────────────────
  const Toggle = ({ checked, onChange, color }: { checked: boolean; onChange: () => void; color: string }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className={`w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${color}`} />
    </label>
  );

  const SaveStatus = () => (
    <div className="flex items-center gap-1.5 text-xs">
      {saveStatus === "saving" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /><span className="text-amber-400">Speichern…</span></>}
      {saveStatus === "saved" && lastSaved && <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Gespeichert {lastSaved.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span></>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── DETAIL VIEW ────────────────────────────────────────────────── */}
      {activeDetail && (
        <div className="space-y-5">
          {/* Back + save status row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveDetail(null)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Zurück zu Add-ons
            </button>
            <SaveStatus />
          </div>

          {/* Gallery detail */}
          {activeDetail === "gallery" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                  <Image className="w-4 h-4 text-pink-400" />
                </div>
                Bildergalerie verwalten
              </h3>
              {addons.gallery.photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {addons.gallery.photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-700/50">
                      <img src={photo} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                      <button onClick={() => removeGalleryPhoto(idx)} className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className={`flex flex-col items-center gap-3 justify-center text-slate-400 hover:text-white bg-slate-700/30 hover:bg-slate-700/50 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-xl px-6 py-8 cursor-pointer transition-all ${uploading ? "opacity-50" : ""}`}>
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) addGalleryPhoto(file); }} />
                <div className="w-12 h-12 rounded-full bg-slate-600/50 flex items-center justify-center">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-pink-400" /> : <Upload className="w-6 h-6" />}
                </div>
                <div className="text-center">
                  <p className="font-medium">{uploading ? "Wird hochgeladen..." : "Bild hochladen"}</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG • Max. 5 MB</p>
                </div>
              </label>
            </div>
          )}

          {/* Menu detail */}
          {activeDetail === "menu" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                Speisekarte bearbeiten
              </h3>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {addons.menu.categories.map((category, catIdx) => (
                  <div key={catIdx} className="bg-slate-700/40 rounded-xl p-4 space-y-3 border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">Kategorie {catIdx + 1}</span>
                      <input type="text" value={category.name} onChange={(e) => updateMenuCategoryName(catIdx, e.target.value)} placeholder="Kategorie Name (z.B. Hauptgerichte)" className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-amber-500 font-medium" />
                      {addons.menu.categories.length > 1 && <button onClick={() => removeMenuCategory(catIdx)} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-slate-600/50">
                      {category.items?.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="flex gap-2 items-start bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <input type="text" value={item.name || ""} onChange={(e) => updateMenuItem(catIdx, itemIdx, "name", e.target.value)} placeholder="Gerichtname" className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-amber-500" />
                              <input type="text" value={item.price || ""} onChange={(e) => updateMenuItem(catIdx, itemIdx, "price", e.target.value)} placeholder="Preis (z.B. 12,90 €)" className="w-28 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-amber-500" />
                            </div>
                            <input type="text" value={item.description || ""} onChange={(e) => updateMenuItem(catIdx, itemIdx, "description", e.target.value)} placeholder="Beschreibung (optional)" className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-amber-500" />
                          </div>
                          <button onClick={() => removeMenuItem(catIdx, itemIdx)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => addMenuItem(catIdx)} className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors py-1"><Plus className="w-4 h-4" />Gericht hinzufügen</button>
                    </div>
                  </div>
                ))}
                <button onClick={addMenuCategory} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-dashed border-blue-500/30"><Plus className="w-4 h-4" />Neue Kategorie</button>
              </div>
            </div>
          )}

          {/* Pricelist detail */}
          {activeDetail === "pricelist" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                </div>
                Preisliste bearbeiten
              </h3>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {addons.pricelist.categories.map((category, catIdx) => (
                  <div key={catIdx} className="bg-slate-700/40 rounded-xl p-4 space-y-3 border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">Kategorie {catIdx + 1}</span>
                      <input type="text" value={category.name} onChange={(e) => updatePriceCategoryName(catIdx, e.target.value)} placeholder="Kategorie Name (z.B. Damen)" className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-emerald-500 font-medium" />
                      {addons.pricelist.categories.length > 1 && <button onClick={() => removePriceCategory(catIdx)} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-slate-600/50">
                      {category.items?.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="flex gap-2 items-start bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <input type="text" value={item.name || ""} onChange={(e) => updatePriceItem(catIdx, itemIdx, "name", e.target.value)} placeholder="Leistung" className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-emerald-500" />
                              <input type="text" value={item.price || ""} onChange={(e) => updatePriceItem(catIdx, itemIdx, "price", e.target.value)} placeholder="Preis" className="w-28 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-emerald-500" />
                            </div>
                            <input type="text" value={item.description || ""} onChange={(e) => updatePriceItem(catIdx, itemIdx, "description", e.target.value)} placeholder="Beschreibung (optional)" className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-emerald-500" />
                          </div>
                          <button onClick={() => removePriceItem(catIdx, itemIdx)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => addPriceItem(catIdx)} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors py-1"><Plus className="w-4 h-4" />Preis hinzufügen</button>
                    </div>
                  </div>
                ))}
                <button onClick={addPriceCategory} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-dashed border-blue-500/30"><Plus className="w-4 h-4" />Neue Kategorie</button>
              </div>
            </div>
          )}

          {/* ContactForm detail */}
          {activeDetail === "contactForm" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                Formularfelder bearbeiten
              </h3>
              <ContactFormEditor websiteId={websiteId} initialFields={addons.contactFormFields} onSave={handleSaveContactFormFields} />
            </div>
          )}

          {/* Booking detail */}
          {activeDetail === "booking" && (
            <BookingAddonSection websiteId={websiteId} website={website} onUpdate={onUpdate} onGoToTermine={onGoToTermine} purchasedAddOns={purchasedAddOns} />
          )}

          {/* AiChat detail */}
          {activeDetail === "aiChat" && (
            <AiChatAddonSection websiteId={websiteId} website={website} onUpdate={onUpdate} purchasedAddOns={purchasedAddOns} />
          )}
        </div>
      )}

      {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
      {!activeDetail && (
        <div className="space-y-3">
          {/* Save status row */}
          <div className="flex justify-end h-6">
            <SaveStatus />
          </div>

          {/* ── Gallery ── */}
          <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-200 ${addons.gallery.enabled ? "border-slate-600/50" : "border-slate-700/30"}`}>
            <div className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Image className="w-5 h-5 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">Bildergalerie</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium">+3,90 €/Mon</span>
                  {addons.gallery.enabled && addons.gallery.photos.length > 0 && <span className="text-xs text-pink-400">{addons.gallery.photos.length} Bilder</span>}
                </div>
                <p className="text-slate-400 text-xs">Präsentiere deine Arbeiten in einer Galerie.</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {addons.gallery.enabled && (
                  <button onClick={() => setActiveDetail("gallery")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap">
                    <Settings className="w-3.5 h-3.5" />Einstellungen
                  </button>
                )}
                {!purchasedAddOns["gallery"] ? (
                  <button onClick={() => setConfirmAddon("gallery")} className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap">
                    <Lock className="w-3 h-3" />Freischalten
                  </button>
                ) : (
                  <Toggle checked={addons.gallery.enabled} onChange={() => toggleAddon("gallery")} color="peer-checked:bg-pink-500" />
                )}
              </div>
            </div>
          </div>

          {/* ── Speisekarte ── */}
          <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-200 ${addons.menu.enabled ? "border-slate-600/50" : "border-slate-700/30"}`}>
            <div className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">Speisekarte</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">+3,90 €/Mon</span>
                  {addons.menu.enabled && <span className="text-xs text-amber-400">{addons.menu.categories.reduce((a, c) => a + (c.items?.length || 0), 0)} Gerichte</span>}
                </div>
                <p className="text-slate-400 text-xs">Ideal für Restaurants, Cafés und Bäckereien.</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {addons.menu.enabled && (
                  <button onClick={() => setActiveDetail("menu")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap">
                    <Settings className="w-3.5 h-3.5" />Einstellungen
                  </button>
                )}
                {!purchasedAddOns["menu"] ? (
                  <button onClick={() => setConfirmAddon("menu")} className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap">
                    <Lock className="w-3 h-3" />Freischalten
                  </button>
                ) : (
                  <Toggle checked={addons.menu.enabled} onChange={() => toggleAddon("menu")} color="peer-checked:bg-amber-500" />
                )}
              </div>
            </div>
          </div>

          {/* ── Preisliste ── */}
          <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-200 ${addons.pricelist.enabled ? "border-slate-600/50" : "border-slate-700/30"}`}>
            <div className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                <LayoutGrid className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">Preisliste</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">+3,90 €/Mon</span>
                  {addons.pricelist.enabled && <span className="text-xs text-emerald-400">{addons.pricelist.categories.reduce((a, c) => a + (c.items?.length || 0), 0)} Preise</span>}
                </div>
                <p className="text-slate-400 text-xs">Perfekt für Friseure, Beauty-Studios und Dienstleister.</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {addons.pricelist.enabled && (
                  <button onClick={() => setActiveDetail("pricelist")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap">
                    <Settings className="w-3.5 h-3.5" />Einstellungen
                  </button>
                )}
                {!purchasedAddOns["pricelist"] ? (
                  <button onClick={() => setConfirmAddon("pricelist")} className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap">
                    <Lock className="w-3 h-3" />Freischalten
                  </button>
                ) : (
                  <Toggle checked={addons.pricelist.enabled} onChange={() => toggleAddon("pricelist")} color="peer-checked:bg-emerald-500" />
                )}
              </div>
            </div>
          </div>

          {/* ── Kontaktformular ── */}
          <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-200 ${addons.contactForm ? "border-slate-600/50" : "border-slate-700/30"}`}>
            <div className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">Kontaktformular</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">+3,90 €/Mon</span>
                  {addons.contactForm && <span className="text-xs text-blue-400">{addons.contactFormFields?.length || 4} Felder</span>}
                </div>
                <p className="text-slate-400 text-xs">Ermögliche Besuchern, direkt Anfragen zu senden.</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {addons.contactForm && (
                  <button onClick={() => setActiveDetail("contactForm")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap">
                    <Settings className="w-3.5 h-3.5" />Einstellungen
                  </button>
                )}
                {!purchasedAddOns["contactForm"] ? (
                  <button onClick={() => setConfirmAddon("contactForm")} className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap">
                    <Lock className="w-3 h-3" />Freischalten
                  </button>
                ) : (
                  <Toggle checked={addons.contactForm} onChange={() => toggleAddon("contactForm")} color="peer-checked:bg-blue-500" />
                )}
              </div>
            </div>
          </div>

          {/* ── Terminbuchung ── */}
          <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-200 ${(website as any).addOnBooking ? "border-slate-600/50" : "border-slate-700/30"}`}>
            <div className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">Terminbuchung</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">+4,90 €/Mon</span>
                  {(website as any).addOnBooking && <span className="text-xs text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" />Aktiv</span>}
                </div>
                <p className="text-slate-400 text-xs">Kunden buchen direkt auf deiner Website einen Termin.</p>
              </div>
              <button onClick={() => setActiveDetail("booking")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap flex-shrink-0">
                <Settings className="w-3.5 h-3.5" />Einstellungen
              </button>
            </div>
          </div>

          {/* ── KI-Chat ── */}
          <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-200 ${(website as any).addOnAiChat ? "border-slate-600/50" : "border-slate-700/30"}`}>
            <div className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">KI-Chat</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-medium">+9,90 €/Mon</span>
                  {(website as any).addOnAiChat && <span className="text-xs text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" />Aktiv</span>}
                </div>
                <p className="text-slate-400 text-xs">KI beantwortet Kundenfragen & erfasst Leads automatisch.</p>
              </div>
              <button onClick={() => setActiveDetail("aiChat")} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap flex-shrink-0">
                <Settings className="w-3.5 h-3.5" />Einstellungen
              </button>
            </div>
          </div>

          {/* ── Purchase confirmation modal ── */}
          {confirmAddon && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">
                      {ADDON_LABELS[confirmAddon]?.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Add-on freischalten</h3>
                      <p className={`text-sm font-medium ${ADDON_LABELS[confirmAddon]?.color}`}>
                        {ADDON_LABELS[confirmAddon]?.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-1">
                    <span className="text-white font-semibold">+3,90 €/Monat</span> werden ab sofort anteilig deinem Abo hinzugefügt.
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    Du kannst das Add-on jederzeit über das Kundenportal wieder kündigen.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmAddon(null)} disabled={purchaseAddonMutation.isPending} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50">
                      Abbrechen
                    </button>
                    <button onClick={() => purchaseAddonMutation.mutate({ websiteId, addonKey: confirmAddon as any })} disabled={purchaseAddonMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                      {purchaseAddonMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Wird gebucht…</> : "Jetzt freischalten"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Structure Editor ─────────────────────────────────
// ── Structure Editor ─────────────────────────────────
interface StructureEditorProps {
  websiteId: number;
  websiteData: WebsiteData | undefined;
  onUpdate: () => void;
}

function StructureEditor({ websiteId, websiteData, onUpdate }: StructureEditorProps) {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updateMutation = trpc.customer.updateWebsiteContent.useMutation({
    onSuccess: () => {
      setSaveStatus("saved");
      onUpdate();
      toast.success("Reihenfolge gespeichert");
    },
    onError: () => {
      setSaveStatus("unsaved");
      toast.error("Speichern fehlgeschlagen");
    },
  });

  // Load sections from websiteData
  useEffect(() => {
    if (websiteData?.sections) {
      const loadedSections = websiteData.sections.map((s: any) => ({
        type: s.type,
        headline: s.headline || getDefaultHeadline(s.type),
        enabled: !websiteData?.hiddenSections?.includes(s.type),
      }));
      setSections(loadedSections);
    }
  }, [websiteData]);

  function getDefaultHeadline(type: string): string {
    const defaults: Record<string, string> = {
      hero: "Hero Bereich",
      about: "Über uns",
      services: "Leistungen",
      testimonials: "Kundenstimmen",
      menu: "Speisekarte",
      pricelist: "Preisliste",
      gallery: "Galerie",
      contact: "Kontakt",
      cta: "Call-to-Action",
    };
    return defaults[type] || type;
  }

  function getSectionIcon(type: string): React.ReactNode {
    const icons: Record<string, any> = {
      hero: <LayoutGrid className="w-4 h-4" />,
      about: <User className="w-4 h-4" />,
      services: <Sparkles className="w-4 h-4" />,
      testimonials: <MessageSquare className="w-4 h-4" />,
      menu: <LayoutGrid className="w-4 h-4" />,
      pricelist: <LayoutGrid className="w-4 h-4" />,
      gallery: <Image className="w-4 h-4" />,
      contact: <Phone className="w-4 h-4" />,
      cta: <ExternalLink className="w-4 h-4" />,
    };
    return icons[type] || <LayoutGrid className="w-4 h-4" />;
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const draggedItem = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedItem);

    setSections(newSections);
    setDraggedIndex(index);
    setSaveStatus("unsaved");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Auto-save after reorder
    saveSections(sections);
  };

  const toggleSection = (index: number) => {
    const newSections = sections.map((s, i) =>
      i === index ? { ...s, enabled: !s.enabled } : s
    );
    setSections(newSections);
    setSaveStatus("unsaved");
    saveSections(newSections);
  };

  const saveSections = (newSections: SectionConfig[]) => {
    setSaveStatus("saving");
    const hiddenSections = newSections.filter((s) => !s.enabled).map((s) => s.type);

    // Reorder sections in websiteData
    const reorderedSections = newSections.map((s) => {
      const original = websiteData?.sections?.find((orig: any) => orig.type === s.type);
      return original || { type: s.type, headline: s.headline };
    });

    updateMutation.mutate({
      websiteId,
      patch: {
        sections: reorderedSections,
        hiddenSections: hiddenSections.length > 0 ? hiddenSections : undefined,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            Sektionen verwalten
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Sortiere Sektionen per Drag & Drop und blende sie ein oder aus
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Wird gespeichert...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <Check className="w-3.5 h-3.5" />
              Gespeichert
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sections.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Keine Sektionen verfügbar</p>
          </div>
        ) : (
          sections.map((section, index) => (
            <div
              key={section.type}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 bg-slate-800/60 rounded-xl border transition-all cursor-move ${
                draggedIndex === index
                  ? "border-violet-500/50 ring-1 ring-violet-500/20 opacity-50"
                  : "border-slate-700/50 hover:border-slate-600"
              } ${!section.enabled ? "opacity-60" : ""}`}
            >
              {/* Drag Handle */}
              <div className="p-2 rounded-lg bg-slate-700/50 text-slate-400">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Icon */}
              <div className={`p-2 rounded-lg ${section.enabled ? "bg-violet-500/20 text-violet-400" : "bg-slate-700/50 text-slate-500"}`}>
                {getSectionIcon(section.type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium ${section.enabled ? "text-white" : "text-slate-400"}`}>
                  {section.headline}
                </h3>
                <p className="text-xs text-slate-500 capitalize">{section.type}</p>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => toggleSection(index)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  section.enabled
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                }`}
                title={section.enabled ? "Sektion ausblenden" : "Sektion einblenden"}
              >
                {section.enabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Sichtbar
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Ausgeblendet
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Setup Step Chip ───────────────────────────────────
function StepChip({ done, label, onClick }: { done: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={done ? undefined : onClick}
      disabled={done}
      className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ${
        done
          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 cursor-default"
          : "border-blue-400/40 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer"
      }`}
    >
      {done ? "✓" : "○"} {label}
    </button>
  );
}

// ── AI Chat Add-on Section ───────────────────────────
// ── Booking Add-on Section (in Add-ons tab) ────────────
function BookingAddonSection({ websiteId, website, onUpdate, onGoToTermine, purchasedAddOns }: {
  websiteId: number;
  website: any;
  onUpdate: () => void;
  onGoToTermine: () => void;
  purchasedAddOns: Record<string, boolean>;
}) {
  const [enabled, setEnabled] = useState<boolean>(!!(website as any).addOnBooking);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isPurchased = !!purchasedAddOns["booking"];

  const purchaseAddonMutation = trpc.customer.purchaseAddon.useMutation({
    onSuccess: () => { setConfirmOpen(false); setSaving(false); setEnabled(true); onUpdate(); toast.success("Terminbuchung freigeschaltet!"); },
    onError: (e: any) => { setSaving(false); toast.error("Fehler: " + e.message); },
  });

  const saveSettingsMutation = trpc.customer.saveBookingSettings.useMutation({
    onSuccess: () => { setSaving(false); onUpdate(); toast.success("Terminbuchung gespeichert"); },
    onError: () => { setSaving(false); toast.error("Speichern fehlgeschlagen"); },
  });

  const { data: bookingData } = trpc.customer.getBookingSettings.useQuery({ websiteId });

  const handleToggle = () => {
    if (!isPurchased) { setConfirmOpen(true); return; }
    const newVal = !enabled;
    setEnabled(newVal);
    setSaving(true);
    const s = bookingData?.settings;
    saveSettingsMutation.mutate({
      websiteId,
      enabled: newVal,
      weeklySchedule: (s?.weeklySchedule as any) ?? { mon: { enabled: true, start: "09:00", end: "17:00" }, tue: { enabled: true, start: "09:00", end: "17:00" }, wed: { enabled: true, start: "09:00", end: "17:00" }, thu: { enabled: true, start: "09:00", end: "17:00" }, fri: { enabled: true, start: "09:00", end: "17:00" }, sat: { enabled: false, start: "09:00", end: "12:00" }, sun: { enabled: false, start: "09:00", end: "12:00" } },
      durationMinutes: s?.durationMinutes ?? 30,
      bufferMinutes: s?.bufferMinutes ?? 0,
      advanceDays: s?.advanceDays ?? 30,
      title: s?.title ?? "Terminbuchung",
      description: s?.description ?? undefined,
      notificationEmail: s?.notificationEmail ?? null,
    });
  };

  return (
    <>
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-5">
          <CalendarDays className="w-4 h-4 text-blue-400" />
          Terminbuchung
          <span className="ml-auto text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">+4,90 €/Monat</span>
        </h2>

        {!isPurchased ? (
          <div className="space-y-4">
            <div className="text-slate-400 text-xs space-y-1.5">
              {["Eigenes Buchungssystem – kein externer Account nötig", "Wochenplan mit Uhrzeiten frei konfigurierbar", "Automatische Bestätigungs-E-Mails an Kunden", "Terminübersicht und Absagen im Dashboard"].map(f => (
                <div key={f} className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">✓</span><span>{f}</span></div>
              ))}
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              Für 4,90 €/Monat freischalten
            </button>
          </div>
        ) : (
          <div className={`rounded-xl p-4 border transition-all ${enabled ? "border-blue-500/40 bg-blue-500/10" : "border-slate-700/50 bg-slate-900/30"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">Terminbuchung aktivieren</div>
                <div className="text-slate-400 text-xs mt-0.5">Besucher können direkt auf deiner Website Termine buchen</div>
              </div>
              <button
                onClick={handleToggle}
                disabled={saving}
                className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${enabled ? "bg-blue-500" : "bg-slate-600"}`}
              >
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: enabled ? "22px" : "2px" }} />
              </button>
            </div>
            {enabled && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Aktiviert</span>
                <span className="text-slate-500">·</span>
                <button onClick={onGoToTermine} className="text-blue-400 hover:text-blue-300 transition-colors">
                  Verfügbarkeit & Termine verwalten →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kauf-Bestätigung Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">📅</div>
              <div>
                <h3 className="text-white font-semibold">Add-on freischalten</h3>
                <p className="text-blue-400 text-sm font-medium">Terminbuchung</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-1">
              <span className="text-white font-semibold">+4,90 €/Monat</span> werden ab sofort anteilig deinem Abo hinzugefügt.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Du kannst das Add-on jederzeit über das Kundenportal wieder kündigen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => { setSaving(true); purchaseAddonMutation.mutate({ websiteId, addonKey: "booking" }); }}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {purchaseAddonMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gebucht…</> : "Jetzt freischalten"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── AI Chat Add-on Section ─────────────────────────────
function AiChatAddonSection({ websiteId, website, onUpdate, purchasedAddOns }: {
  websiteId: number;
  website: any;
  onUpdate: () => void;
  purchasedAddOns: Record<string, boolean>;
}) {
  const [aiChat, setAiChat] = useState<boolean>(!!(website as any).addOnAiChat);
  const [welcomeMsg, setWelcomeMsg] = useState<string>((website as any).chatWelcomeMessage || "");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPurchased = !!purchasedAddOns["aiChat"];

  const usageCount = (website as any).chatUsageCount ?? 0;
  const usagePct = Math.min(100, Math.round((usageCount / 200) * 100));

  const purchaseAddonMutation = trpc.customer.purchaseAddon.useMutation({
    onSuccess: () => { setConfirmOpen(false); setSaving(false); setAiChat(true); onUpdate(); toast.success("KI-Chat freigeschaltet!"); },
    onError: (e: any) => { setSaving(false); toast.error("Fehler: " + e.message); },
  });

  const updateAddons = trpc.customer.updateAddons.useMutation({
    onSuccess: () => { setSaving(false); onUpdate(); toast.success("KI-Chat gespeichert"); },
    onError: () => { setSaving(false); toast.error("Speichern fehlgeschlagen"); },
  });

  const handleToggle = () => {
    if (!isPurchased) { setConfirmOpen(true); return; }
    const newVal = !aiChat;
    setAiChat(newVal);
    setSaving(true);
    // Auto-save toggle immediately so it persists on page reload
    updateAddons.mutate({
      websiteId,
      addOns: { gallery: { enabled: false }, aiChat: newVal, chatWelcomeMessage: welcomeMsg.trim() || undefined },
    });
  };

  const handleSave = () => {
    setSaving(true);
    updateAddons.mutate({
      websiteId,
      addOns: { gallery: { enabled: false }, aiChat, chatWelcomeMessage: welcomeMsg.trim() || undefined },
    });
  };

  return (
    <>
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-5">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          KI-Chat Add-on
          <span className="ml-auto text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">+9,90 €/Monat</span>
        </h2>

        {!isPurchased ? (
          <div className="space-y-4">
            <div className="text-slate-400 text-xs space-y-1.5">
              {["KI beantwortet Kundenfragen automatisch rund um die Uhr", "Lead-Erfassung: Name + Kontakt werden direkt gespeichert", "Proaktive Ansprache nach 8 Sekunden auf der Website", "200 Gespräche/Monat inklusive"].map(f => (
                <div key={f} className="flex items-start gap-2"><span className="text-violet-400 mt-0.5">✓</span><span>{f}</span></div>
              ))}
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              Für 9,90 €/Monat freischalten
            </button>
          </div>
        ) : (
          <>
            <div className={`rounded-xl p-4 border transition-all mb-4 ${aiChat ? "border-violet-500/40 bg-violet-500/10" : "border-slate-700/50 bg-slate-900/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-white text-sm font-medium">KI-Chat aktivieren</div>
                  <div className="text-slate-400 text-xs mt-0.5">Chat-Widget erscheint auf deiner Website</div>
                </div>
                <button
                  onClick={handleToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors ${aiChat ? "bg-violet-500" : "bg-slate-600"}`}
                >
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: aiChat ? "22px" : "2px" }} />
                </button>
              </div>
              {aiChat && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Gespräche diesen Monat</span>
                    <span className={usagePct >= 80 ? "text-orange-400" : "text-slate-400"}>{usageCount} / 200</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${usagePct >= 80 ? "bg-orange-400" : "bg-violet-500"}`} style={{ width: `${usagePct}%` }} />
                  </div>
                </div>
              )}
            </div>
            {aiChat && (
              <div className="mb-5">
                <label className="text-slate-300 text-sm font-medium block mb-1.5">
                  Begrüßungsnachricht <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={welcomeMsg}
                  onChange={e => setWelcomeMsg(e.target.value)}
                  placeholder="Hallo! Ich bin der Assistent – wie kann ich dir helfen?"
                  maxLength={256}
                  className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              KI-Chat speichern
            </button>
          </>
        )}
      </div>

      {/* Kauf-Bestätigung Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-lg flex-shrink-0">💬</div>
              <div>
                <h3 className="text-white font-semibold">Add-on freischalten</h3>
                <p className="text-violet-400 text-sm font-medium">KI-Chat</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-1">
              <span className="text-white font-semibold">+9,90 €/Monat</span> werden ab sofort anteilig deinem Abo hinzugefügt.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Du kannst das Add-on jederzeit über das Kundenportal wieder kündigen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => { setSaving(true); purchaseAddonMutation.mutate({ websiteId, addonKey: "aiChat" }); }}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {purchaseAddonMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gebucht…</> : "Jetzt freischalten"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Chat Leads Tab ────────────────────────────────────
function ChatLeadsTab({ websiteId, website, onGoToAddons }: { websiteId: number; website: any; onGoToAddons: () => void }) {
  const { data, isLoading } = trpc.customer.getChatLeads.useQuery({ websiteId });
  const markRead = trpc.customer.markChatLeadRead.useMutation();
  const aiChatEnabled = !!(website as any).addOnAiChat;

  if (!aiChatEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-violet-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">KI-Chat noch nicht aktiviert</h3>
        <p className="text-slate-400 text-sm max-w-sm mb-5">
          Aktiviere den KI-Chat, damit Besucher direkt auf deiner Website mit dir interagieren können – Leads landen dann hier.
        </p>
        <button
          onClick={onGoToAddons}
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Zu Add-ons → KI-Chat aktivieren
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const leads = data?.leads ?? [];

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Noch keine Leads</h3>
        <p className="text-slate-400 text-sm max-w-sm">
          Sobald Website-Besucher ihren Namen und Kontakt im Chat hinterlassen, erscheinen sie hier.
        </p>
      </div>
    );
  }

  const unread = leads.filter((l: any) => !l.readAt).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-400" />
          Chat-Leads
          {unread > 0 && (
            <span className="bg-violet-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} neu</span>
          )}
        </h2>
        <span className="text-slate-500 text-sm">{leads.length} insgesamt</span>
      </div>

      <div className="space-y-3">
        {leads.map((lead: any) => (
          <div
            key={lead.id}
            className={`bg-slate-800/60 border rounded-xl p-4 transition-all ${lead.readAt ? "border-slate-700/40" : "border-violet-500/40 ring-1 ring-violet-500/10"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-white font-medium text-sm">{lead.visitorName || "Unbekannt"}</span>
                  {!lead.readAt && (
                    <span className="bg-violet-500/20 text-violet-300 text-xs px-2 py-0.5 rounded-full border border-violet-500/30">Neu</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />{lead.email}
                    </a>
                  )}
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />{lead.phone}
                    </a>
                  )}
                </div>
                {lead.summary && (
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{lead.summary}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-slate-500 text-xs whitespace-nowrap">
                  {new Date(lead.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
                {!lead.readAt && (
                  <button
                    onClick={() => markRead.mutate({ leadId: lead.id, websiteId })}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Als gelesen markieren
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Appointments Tab ───────────────────────────────────
const DAY_LABELS: Record<string, string> = { mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr", sat: "Sa", sun: "So" };
const DAY_NAMES: Record<string, string> = { mon: "Montag", tue: "Dienstag", wed: "Mittwoch", thu: "Donnerstag", fri: "Freitag", sat: "Samstag", sun: "Sonntag" };
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DEFAULT_SCHEDULE = {
  mon: { enabled: true, start: "09:00", end: "17:00" },
  tue: { enabled: true, start: "09:00", end: "17:00" },
  wed: { enabled: true, start: "09:00", end: "17:00" },
  thu: { enabled: true, start: "09:00", end: "17:00" },
  fri: { enabled: true, start: "09:00", end: "17:00" },
  sat: { enabled: false, start: "09:00", end: "12:00" },
  sun: { enabled: false, start: "09:00", end: "12:00" },
};

function AppointmentsTab({ websiteId, website, onGoToAddons }: { websiteId: number; website: any; onGoToAddons: () => void }) {
  const { data: bookingData, isLoading: bookingLoading, refetch: refetchBooking } = trpc.customer.getBookingSettings.useQuery({ websiteId });
  const { data: appointmentsData, isLoading: appointmentsLoading, refetch: refetchAppointments } = trpc.customer.getAppointments.useQuery({ websiteId, upcoming: true });
  const saveSettingsMutation = trpc.customer.saveBookingSettings.useMutation({
    onSuccess: () => { toast.success("Einstellungen gespeichert"); refetchBooking(); },
    onError: (e: any) => toast.error("Fehler: " + e.message),
  });
  const cancelMutation = trpc.customer.cancelAppointmentByOwner.useMutation({
    onSuccess: () => { toast.success("Termin abgesagt"); refetchAppointments(); },
    onError: () => toast.error("Fehler beim Absagen"),
  });

  const [enabled, setEnabled] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean; start: string; end: string }>>(DEFAULT_SCHEDULE);
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [advance, setAdvance] = useState(30);
  const [title, setTitle] = useState("Terminbuchung");
  const [description, setDescription] = useState("");
  const [notifEmail, setNotifEmail] = useState("");
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [showPast, setShowPast] = useState(false);
  const { data: pastData, refetch: refetchPast } = trpc.customer.getAppointments.useQuery(
    { websiteId, upcoming: false },
    { enabled: showPast }
  );

  useEffect(() => {
    if (!bookingData) return;
    setEnabled(bookingData.addOnBooking);
    if (bookingData.settings) {
      const s = bookingData.settings;
      setSchedule((s.weeklySchedule as any) ?? DEFAULT_SCHEDULE);
      setDuration(s.durationMinutes ?? 30);
      setBuffer(s.bufferMinutes ?? 0);
      setAdvance(s.advanceDays ?? 30);
      setTitle(s.title ?? "Terminbuchung");
      setDescription(s.description ?? "");
      setNotifEmail(s.notificationEmail ?? "");
    }
  }, [bookingData]);

  const handleSave = () => {
    saveSettingsMutation.mutate({
      websiteId,
      enabled,
      weeklySchedule: schedule,
      durationMinutes: duration,
      bufferMinutes: buffer,
      advanceDays: advance,
      title: title.trim() || "Terminbuchung",
      description: description.trim() || undefined,
      notificationEmail: notifEmail.trim() || null,
    });
  };

  const setDay = (key: string, field: string, value: any) => {
    setSchedule(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  if (bookingLoading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>;

  const appts = appointmentsData?.appointments ?? [];
  const pastAppts = pastData?.appointments ?? [];

  return (
    <div className="space-y-6">
      {/* Settings card */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            Terminbuchung
            <span className="ml-1 text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">+4,90 €/Monat</span>
          </h2>
          <button
            onClick={() => {
              const newVal = !enabled;
              setEnabled(newVal);
              // Auto-save enabled/disabled state immediately
              saveSettingsMutation.mutate({
                websiteId,
                enabled: newVal,
                weeklySchedule: schedule,
                durationMinutes: duration,
                bufferMinutes: buffer,
                advanceDays: advance,
                title: title.trim() || "Terminbuchung",
                description: description.trim() || undefined,
                notificationEmail: notifEmail.trim() || null,
              });
            }}
            className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-blue-500" : "bg-slate-600"}`}
          >
            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: enabled ? "22px" : "2px" }} />
          </button>
        </div>

        {enabled && (
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Leistungsbezeichnung</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Terminbuchung"
                maxLength={255}
                className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Beschreibung <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Kurze Beschreibung der Leistung..."
                rows={2}
                maxLength={500}
                className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Duration / Buffer / Advance */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Termin-Dauer", value: duration, onChange: setDuration, options: [15, 20, 30, 45, 60, 90, 120], suffix: "Min" },
                { label: "Pufferzeit", value: buffer, onChange: setBuffer, options: [0, 5, 10, 15, 30], suffix: "Min" },
                { label: "Buchbar bis", value: advance, onChange: setAdvance, options: [7, 14, 21, 30, 60, 90], suffix: "Tage" },
              ].map(({ label, value, onChange, options, suffix }) => (
                <div key={label}>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">{label}</label>
                  <select
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {options.map(o => <option key={o} value={o}>{o} {suffix}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Weekly Schedule */}
            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-2">Verfügbarkeit</label>
              <div className="space-y-2">
                {DAY_ORDER.map(key => {
                  const day = schedule[key] ?? { enabled: false, start: "09:00", end: "17:00" };
                  return (
                    <div key={key} className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${day.enabled ? "bg-blue-500/10 border border-blue-500/20" : "bg-slate-900/40 border border-slate-700/30"}`}>
                      <button
                        onClick={() => setDay(key, "enabled", !day.enabled)}
                        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${day.enabled ? "bg-blue-500" : "bg-slate-600"}`}
                      >
                        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: day.enabled ? "18px" : "2px" }} />
                      </button>
                      <span className={`text-sm font-medium w-8 flex-shrink-0 ${day.enabled ? "text-white" : "text-slate-500"}`}>{DAY_LABELS[key]}</span>
                      {day.enabled ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={day.start}
                            onChange={e => setDay(key, "start", e.target.value)}
                            className="bg-slate-900/60 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-slate-500 text-xs">–</span>
                          <input
                            type="time"
                            value={day.end}
                            onChange={e => setDay(key, "end", e.target.value)}
                            className="bg-slate-900/60 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">Nicht verfügbar</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notification Email */}
            <div>
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Benachrichtigungs-E-Mail <span className="text-slate-600 normal-case font-normal">(für neue Buchungen)</span></label>
              <input
                type="email"
                value={notifEmail}
                onChange={e => setNotifEmail(e.target.value)}
                placeholder="deine@email.de (Standard: Account-E-Mail)"
                maxLength={320}
                className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {saveSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Einstellungen speichern
        </button>
      </div>

      {/* Appointments list */}
      {enabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              Kommende Termine
              {appts.length > 0 && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{appts.length}</span>}
            </h3>
          </div>

          {appointmentsLoading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
          ) : appts.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-10 text-center">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Keine kommenden Termine</p>
              <p className="text-slate-400 text-sm">Wenn Besucher einen Termin buchen, erscheint er hier.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appts.map((a: any) => {
                const isCancelling = cancelConfirmId === a.id;
                return (
                  <div
                    key={a.id}
                    className={`bg-slate-800/60 border rounded-xl p-4 flex items-start justify-between gap-4 ${
                      a.status === "cancelled" ? "border-slate-700/30 opacity-60" : "border-slate-700/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white font-medium text-sm">{a.visitorName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          a.status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                          a.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}>
                          {a.status === "cancelled" ? "Abgesagt" : a.status === "confirmed" ? "Bestätigt" : "Ausstehend"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-300 text-sm mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(a.appointmentDate + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}
                        {" · "}{a.appointmentTime} Uhr
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
                        <a href={`mailto:${a.email}`} className="text-slate-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />{a.email}
                        </a>
                        {a.phone && (
                          <a href={`tel:${a.phone}`} className="text-slate-400 hover:text-green-300 transition-colors flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />{a.phone}
                          </a>
                        )}
                      </div>
                      {a.message && <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{a.message}</p>}
                    </div>
                    {a.status !== "cancelled" && (
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {isCancelling ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Sicher?</span>
                            <button
                              onClick={() => { cancelMutation.mutate({ appointmentId: a.id, websiteId }); setCancelConfirmId(null); }}
                              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                              Ja, absagen
                            </button>
                            <button onClick={() => setCancelConfirmId(null)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                              Abbrechen
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancelConfirmId(a.id)}
                            className="flex items-center gap-1 text-slate-500 hover:text-red-400 text-xs transition-colors"
                          >
                            <CalendarX className="w-3.5 h-3.5" />Absagen
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Past appointments toggle */}
          <button
            onClick={() => { setShowPast(v => !v); if (!showPast) refetchPast(); }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showPast ? "rotate-180" : ""}`} />
            {showPast ? "Vergangene ausblenden" : "Vergangene Termine anzeigen"}
          </button>

          {showPast && pastAppts.length > 0 && (
            <div className="space-y-2 opacity-70">
              {pastAppts.filter((a: any) => a.appointmentDate < new Date().toISOString().slice(0, 10)).map((a: any) => (
                <div key={a.id} className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-3 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-300 text-sm font-medium">{a.visitorName}</span>
                    <span className="text-slate-500 text-xs ml-2">
                      {new Date(a.appointmentDate + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} {a.appointmentTime} Uhr
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "cancelled" ? "text-red-400" : "text-slate-400"}`}>
                    {a.status === "cancelled" ? "Abgesagt" : "Erledigt"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────
export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [previewKey, setPreviewKey] = useState(0);
  const [imagePicker, setImagePicker] = useState<{ slot: "hero" | "about"; websiteId: number } | null>(null);

  const { data: myWebsites, isLoading, refetch } = trpc.customer.getMyWebsites.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: onboardingData } = trpc.customer.getOnboardingData.useQuery(
    { websiteId: selectedWebsiteId || myWebsites?.[0]?.website.id || 0 },
    { enabled: !!selectedWebsiteId || !!myWebsites?.[0]?.website.id }
  );

  const { data: imageSuggestions } = trpc.customer.getImageSuggestions.useQuery(
    { websiteId: imagePicker?.websiteId || 0 },
    { enabled: !!imagePicker }
  );

  const updateMutation = trpc.customer.updateWebsiteContent.useMutation({
    onSuccess: () => {
      refetch();
      setPreviewKey((k) => k + 1);
    },
  });

  const activeWebsiteId = myWebsites?.[0]?.website.id;
  const { data: analyticsStats, isLoading: analyticsLoading } = trpc.customer.getAnalytics.useQuery(
    { websiteId: selectedWebsiteId || activeWebsiteId || 0 },
    { enabled: !!(selectedWebsiteId || activeWebsiteId) && activeTab === "analytics" }
  );

  const [showArchivedSubmissions, setShowArchivedSubmissions] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: submissionsData, isLoading: submissionsLoading, refetch: refetchSubmissions } = trpc.customer.getSubmissions.useQuery(
    { websiteId: selectedWebsiteId || activeWebsiteId || 0, includeArchived: showArchivedSubmissions },
    { enabled: !!(selectedWebsiteId || activeWebsiteId) }
  );

  const markReadMutation = trpc.customer.markSubmissionRead.useMutation({
    onSuccess: () => refetchSubmissions(),
  });

  const archiveMutation = trpc.customer.archiveSubmission.useMutation({
    onSuccess: () => refetchSubmissions(),
    onError: () => toast.error("Fehler beim Archivieren."),
  });

  const deleteMutation = trpc.customer.deleteSubmission.useMutation({
    onSuccess: () => { setDeleteConfirmId(null); refetchSubmissions(); },
    onError: () => toast.error("Fehler beim Löschen."),
  });

  const [contactEmailInput, setContactEmailInput] = useState("");
  const [contactEmailSaved, setContactEmailSaved] = useState(false);
  const contactEmailRef = useRef<HTMLInputElement>(null);
  const updateContactEmailMutation = trpc.customer.updateContactEmail.useMutation({
    onSuccess: () => { setContactEmailSaved(true); setTimeout(() => setContactEmailSaved(false), 2500); refetch(); },
    onError: (err: any) => { toast.error("Fehler beim Speichern: " + err.message); },
  });

  const handleUpdate = () => {
    refetch();
    setPreviewKey((k) => k + 1);
  };

  // ── useEffect + Setup-Hooks MÜSSEN vor allen Early-Returns stehen ───────
  const _selectedEntry = myWebsites?.find((e) => e.website.id === selectedWebsiteId) || myWebsites?.[0];
  const storedContactEmailEarly = (_selectedEntry?.website as any)?.contactEmail as string | null | undefined;
  useEffect(() => {
    setContactEmailInput(storedContactEmailEarly ?? "");
  }, [storedContactEmailEarly]);

  // ── Setup-Flow State ──────────────────────────────────────────────────────
  const [setupOpen, setSetupOpen] = useState(() =>
    new URLSearchParams(window.location.search).get("checkout") === "success"
  );
  const [setupStepIdx, setSetupStepIdx] = useState(0);
  const [slugInput, setSlugInput] = useState("");
  const [showDomainHint, setShowDomainHint] = useState(false);
  const [domainTabSlugInput, setDomainTabSlugInput] = useState("");
  const [domainTabSlugSaved, setDomainTabSlugSaved] = useState(false);
  const [showCustomDomainInfo, setShowCustomDomainInfo] = useState(false);
  const [legalOwnerInput, setLegalOwnerInput] = useState("");
  const [legalEmailInput2, setLegalEmailInput2] = useState("");

  const _activeWebsiteIdForSetup = _selectedEntry?.website.id ?? 0;
  const updateSlugMutation = trpc.customer.updateSlug.useMutation({
    onSuccess: () => { refetch(); },
  });
  const setLiveMutation = trpc.customer.setLive.useMutation({
    onSuccess: () => { refetch(); setSetupOpen(false); },
  });
  const generateLegalMutation = trpc.customer.generateLegalPages.useMutation({
    onSuccess: () => { refetch(); },
  });
  const { data: slugCheck, isFetching: slugChecking } = trpc.customer.checkSlugAvailability.useQuery(
    { slug: slugInput, websiteId: _activeWebsiteIdForSetup },
    { enabled: slugInput.length >= 3 }
  );
  const { data: domainSlugCheck, isFetching: domainSlugChecking } = trpc.customer.checkSlugAvailability.useQuery(
    { slug: domainTabSlugInput, websiteId: _activeWebsiteIdForSetup },
    { enabled: domainTabSlugInput.length >= 3 && domainTabSlugInput !== _selectedEntry?.website?.slug }
  );

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
  const { website, business, subscription } = selectedEntry;
  const websiteData = website.websiteData as WebsiteData | undefined;
  const colorScheme = website.colorScheme as ColorScheme | undefined;
  // Sync contactEmail – useEffect is above early returns to satisfy Rules of Hooks
  const storedContactEmail = (website as any).contactEmail as string | null | undefined;

  // ── Setup-Flow Status ─────────────────────────────────
  const addOns = (subscription?.addOns ?? {}) as Record<string, boolean>;
  const slugDone  = !website.slug.startsWith("preview-");
  const emailDone = !addOns.contactForm || !!(website as any).contactEmail;
  const legalDone = !!(website.websiteData as any)?.impressumHtml && !!(website.websiteData as any)?.datenschutzHtml;
  const liveDone  = website.status === "active";
  const allDone   = slugDone && emailDone && legalDone && liveDone;

  // Initialise slugInput when setupOpen opens for step 0
  function slugifyFE(text: string): string {
    return text.toLowerCase()
      .replace(/[äöüß]/g, (m) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[m] || m))
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  }
  const suggestedSlug = slugifyFE(business?.name || "");

  const openSetupStep = (idx: number) => {
    if (idx === 0 && !slugInput) setSlugInput(suggestedSlug);
    setSetupStepIdx(idx);
    setSetupOpen(true);
  };

  const makeUpdater = (field: string) => async (value: string) => {
    await updateMutation.mutateAsync({
      websiteId: website.id,
      patch: { [field]: value },
    });
  };

  const unreadCount = submissionsData?.unreadCount ?? 0;

  const aiChatEnabled = !!(website as any).addOnAiChat;
  const bookingEnabled = !!(website as any).addOnBooking;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "preview", label: "Vorschau", icon: <Globe className="w-4 h-4" /> },
    { id: "content", label: "Inhalte", icon: <Edit2 className="w-4 h-4" /> },
    { id: "structure", label: "Struktur", icon: <Layers className="w-4 h-4" /> },
    { id: "design", label: "Design", icon: <Palette className="w-4 h-4" /> },
    { id: "addons", label: "Add-ons", icon: <Sparkles className="w-4 h-4" /> },
    { id: "domain", label: "Domain", icon: <Globe className="w-4 h-4" /> },
    { id: "submissions", label: "Anfragen", icon: <MessageSquare className="w-4 h-4" />, badge: unreadCount },
    ...(aiChatEnabled ? [{ id: "leads" as Tab, label: "Chat-Leads", icon: <Users className="w-4 h-4" /> }] : []),
    ...(bookingEnabled ? [{ id: "appointments" as Tab, label: "Termine", icon: <CalendarDays className="w-4 h-4" /> }] : []),
    { id: "analytics", label: "Statistiken", icon: <BarChart2 className="w-4 h-4" /> },
  ];

  // ── Image upload helper (used by picker + direct upload) ────────────────
  const handleImageUpload = async (file: File, slot: "hero" | "about", websiteId: number) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Max. 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const result = await (window as any).__trpcUpload?.({ websiteId, imageData: base64, mimeType: file.type });
        if (result?.url) {
          await updateMutation.mutateAsync({ websiteId, patch: slot === "hero" ? { heroPhotoUrl: result.url } : { aboutPhotoUrl: result.url } });
          setImagePicker(null);
        }
      } catch { toast.error("Upload fehlgeschlagen"); }
    };
    reader.readAsDataURL(file);
  };

  const selectPickerImage = async (url: string) => {
    if (!imagePicker) return;
    await updateMutation.mutateAsync({
      websiteId: imagePicker.websiteId,
      patch: imagePicker.slot === "hero" ? { heroPhotoUrl: url } : { aboutPhotoUrl: url },
    });
    setImagePicker(null);
  };

  const gmbPhotos = (onboardingData?.photoUrls as string[] | null) || [];
  const stockPhotos = imageSuggestions?.stockPhotos || [];

  // Falls aktiver Tab durch deaktiviertes Add-on wegfällt → zurück zu Add-ons
  if (activeTab === "leads" && !aiChatEnabled) setActiveTab("addons");
  if (activeTab === "appointments" && !bookingEnabled) setActiveTab("addons");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* ── Image Picker Modal ── */}
      {imagePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setImagePicker(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">
                {imagePicker.slot === "hero" ? "Hauptbild" : "Über-uns-Bild"} auswählen
              </h3>
              <button onClick={() => setImagePicker(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GMB Photos */}
            {gmbPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Deine GMB-Fotos</p>
                <div className="grid grid-cols-3 gap-2">
                  {gmbPhotos.map((url, i) => (
                    <button key={i} onClick={() => selectPickerImage(url)}
                      className="aspect-video rounded-lg overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition-all">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Photos – industry suggestions */}
            {stockPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Vorgeschlagene Stock-Fotos</p>
                <div className="grid grid-cols-3 gap-2">
                  {stockPhotos.map((url, i) => (
                    <button key={i} onClick={() => selectPickerImage(url)}
                      className="aspect-video rounded-lg overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition-all">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Photo Search (Unsplash) */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Stock-Foto suchen</p>
              <StockPhotoSearch onSelect={selectPickerImage} />
            </div>

            {/* Upload */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Eigenes Foto hochladen</p>
              <label className="w-full flex items-center gap-2 justify-center text-xs text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-700 border border-slate-600 rounded-xl px-3 py-3 cursor-pointer transition-colors">
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, imagePicker.slot, imagePicker.websiteId); }} />
                <Upload className="w-4 h-4" />
                Bild vom Gerät wählen (max. 5 MB)
              </label>
            </div>
          </div>
        </div>
      )}

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
              href={`https://${website.slug}.pageblitz.de`}
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

      {/* ── Setup-Checkliste Banner (sticky, direkt unter dem Header) ── */}
      {!allDone && !setupOpen && (
        <div className="sticky top-[65px] z-10 bg-gradient-to-r from-blue-900/95 to-indigo-900/95 backdrop-blur-sm border-b border-blue-500/30 shadow-lg shadow-blue-950/20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 mr-1">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-white text-xs font-semibold">Website einrichten</span>
            </div>
            <div className="w-px h-4 bg-blue-400/30" />
            <StepChip done={slugDone}  label="Subdomain"   onClick={() => openSetupStep(0)} />
            {addOns.contactForm && (
              <StepChip done={emailDone} label="Kontakt-E-Mail" onClick={() => openSetupStep(1)} />
            )}
            <StepChip done={legalDone} label="Impressum & Datenschutz" onClick={() => openSetupStep(addOns.contactForm ? 2 : 1)} />
            <StepChip done={liveDone}  label="Live schalten" onClick={() => openSetupStep(addOns.contactForm ? 3 : 2)} />
            <button
              onClick={() => openSetupStep(!slugDone ? 0 : (addOns.contactForm && !emailDone) ? 1 : !legalDone ? (addOns.contactForm ? 2 : 1) : (addOns.contactForm ? 3 : 2))}
              className="ml-auto text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Einrichten →
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-blue-400 border-blue-400 bg-blue-500/10"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                ) : null}
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
                <div key={previewKey} style={{ zoom: 0.85 }}>
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
                <button
                  onClick={() => setImagePicker({ slot: "hero", websiteId: website.id })}
                  className="w-full flex items-center gap-2 justify-center text-xs text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Bild ändern
                </button>
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
                <button
                  onClick={() => setImagePicker({ slot: "about", websiteId: website.id })}
                  className="w-full flex items-center gap-2 justify-center text-xs text-slate-400 hover:text-white bg-slate-700/40 hover:bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Bild ändern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Structure Tab */}
        {activeTab === "structure" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <StructureEditor
                websiteId={website.id}
                websiteData={websiteData}
                onUpdate={handleUpdate}
              />
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-blue-400" />
                Hinweise
              </h2>
              <p className="text-slate-400 text-sm mb-3">
                <strong className="text-white">Sektionen sortieren:</strong> Ziehe die Sektionen per Drag & Drop in die gewünschte Reihenfolge.
              </p>
              <p className="text-slate-400 text-sm mb-3">
                <strong className="text-white">Sektionen ausblenden:</strong> Klicke auf das Augen-Icon, um eine Sektion vorübergehend auszublenden.
              </p>
              <p className="text-slate-400 text-sm">
                Ausgeblendete Sektionen werden auf der Website nicht angezeigt, bleiben aber gespeichert.
              </p>
            </div>
          </div>
        )}

        {/* Add-ons Tab */}
        {activeTab === "addons" && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-white font-semibold flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Add-ons
            </h2>
            {onboardingData !== undefined ? (
              <AddonsEditor
                websiteId={website.id}
                website={website}
                onboarding={onboardingData}
                onUpdate={handleUpdate}
                purchasedAddOns={(subscription?.addOns ?? {}) as Record<string, boolean>}
                onGoToTermine={() => setActiveTab("appointments")}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            )}
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <ChatLeadsTab websiteId={website.id} website={website} onGoToAddons={() => setActiveTab("addons")} />
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <AppointmentsTab websiteId={website.id} website={website} onGoToAddons={() => setActiveTab("addons")} />
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : analyticsStats ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Seitenaufrufe", value: analyticsStats.pageviews.toLocaleString("de-DE"), icon: <MousePointerClick className="w-5 h-5 text-blue-400" />, color: "text-blue-400" },
                    { label: "Besucher", value: analyticsStats.visitors.toLocaleString("de-DE"), icon: <Users className="w-5 h-5 text-violet-400" />, color: "text-violet-400" },
                    { label: "Absprungrate", value: `${analyticsStats.bounceRate} %`, icon: <BarChart2 className="w-5 h-5 text-amber-400" />, color: "text-amber-400" },
                    { label: "Ø Verweildauer", value: `${Math.floor(analyticsStats.avgDuration / 60)}:${String(analyticsStats.avgDuration % 60).padStart(2, "0")} Min`, icon: <Clock className="w-5 h-5 text-green-400" />, color: "text-green-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        {stat.icon}
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-slate-500 text-xs mt-1">Letzte 30 Tage</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                  <p className="text-slate-400 text-sm">
                    Diese Statistiken werden von <span className="text-white font-medium">Umami Analytics</span> erfasst –
                    cookielos, DSGVO-konform, keine persönlichen Daten.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-10 text-center">
                <BarChart2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Noch keine Statistiken verfügbar</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  Analytics werden aktiviert, sobald deine Website live ist und die ersten Besucher kommen.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Domain Tab */}
        {activeTab === "domain" && website && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-white text-lg font-semibold">Domain & Adresse</h2>
              <p className="text-slate-400 text-sm mt-0.5">Verwalte die Web-Adresse deiner Website.</p>
            </div>

            {/* Subdomain */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Pageblitz-Subdomain</p>
                  <p className="text-slate-400 text-xs">Kostenlos inklusive</p>
                </div>
              </div>

              {/* Current URL display */}
              <div className="flex items-center gap-2 bg-slate-900/60 rounded-xl px-4 py-2.5 border border-slate-700/50">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <a
                  href={`https://${website.slug}.pageblitz.de`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors truncate"
                >
                  {website.slug}.pageblitz.de
                </a>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 ml-auto shrink-0" />
              </div>

              {/* Slug change */}
              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Subdomain ändern</label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-colors">
                  <input
                    type="text"
                    value={domainTabSlugInput || website.slug}
                    onChange={(e) => {
                      setDomainTabSlugSaved(false);
                      setDomainTabSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+/, ""));
                    }}
                    className="flex-1 bg-transparent text-white outline-none text-sm font-mono"
                  />
                  <span className="text-slate-400 text-sm whitespace-nowrap">.pageblitz.de</span>
                </div>
                {domainTabSlugInput.length >= 3 && domainTabSlugInput !== website.slug && (
                  <p className={`text-xs flex items-center gap-1.5 ${
                    domainSlugChecking ? "text-slate-400" :
                    domainSlugCheck?.available ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {domainSlugChecking ? "⏳ Prüfe Verfügbarkeit..." :
                     domainSlugCheck?.available ? "✓ Verfügbar" : "✗ Bereits vergeben"}
                  </p>
                )}
                {domainTabSlugSaved && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">✓ Subdomain gespeichert</p>
                )}
                <button
                  disabled={
                    !domainTabSlugInput ||
                    domainTabSlugInput === website.slug ||
                    domainTabSlugInput.length < 3 ||
                    (!domainSlugCheck?.available && domainTabSlugInput !== website.slug) ||
                    domainSlugChecking ||
                    updateSlugMutation.isPending
                  }
                  onClick={async () => {
                    await updateSlugMutation.mutateAsync({ websiteId: website.id, slug: domainTabSlugInput });
                    setDomainTabSlugSaved(true);
                    toast.success("Subdomain gespeichert");
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                >
                  {updateSlugMutation.isPending ? "Speichern..." : "Subdomain speichern"}
                </button>
              </div>
            </div>

            {/* Custom Domain */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowCustomDomainInfo(v => !v)}
                className="w-full flex items-center gap-3 p-5 text-left hover:bg-slate-700/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">Eigene Domain verbinden</p>
                  <p className="text-slate-400 text-xs">z.B. www.mein-unternehmen.de</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showCustomDomainInfo ? "rotate-180" : ""}`} />
              </button>
              {showCustomDomainInfo && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-700/50 pt-4">
                  <p className="text-slate-300 text-sm">Setze diesen CNAME-Eintrag bei deinem Domain-Anbieter (IONOS, Strato, GoDaddy, etc.):</p>
                  <div className="space-y-2 bg-slate-900/60 rounded-xl p-4">
                    {[
                      { label: "Typ",  value: "CNAME" },
                      { label: "Name", value: "www" },
                      { label: "Ziel", value: "pageblitz.de" },
                      { label: "TTL",  value: "3600" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs w-12">{label}</span>
                        <span className="text-white text-xs font-mono bg-slate-800 px-3 py-1 rounded-lg">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <p className="text-amber-300 text-xs">⏱ DNS-Änderungen können bis zu 24 Stunden dauern, bis sie wirksam sind.</p>
                  </div>
                  <p className="text-slate-500 text-xs">Nach dem Setzen des CNAME-Eintrags melde dich beim Support — wir schalten die Domain für dich frei.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submissions (Anfragen) Tab */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-white text-lg font-semibold">
                  {showArchivedSubmissions ? "Archivierte Anfragen" : "Kontaktanfragen"}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  {submissionsData?.submissions.length ?? 0} {showArchivedSubmissions ? "archivierte" : "aktive"} Anfragen
                  {!showArchivedSubmissions && unreadCount > 0 && <span className="ml-2 text-rose-400 font-medium">· {unreadCount} ungelesen</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Archive toggle */}
                <button
                  onClick={() => setShowArchivedSubmissions(v => !v)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                    showArchivedSubmissions
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                      : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {showArchivedSubmissions ? "Aktive anzeigen" : "Archiv"}
                </button>
                {/* Custom recipient email */}
                {!showArchivedSubmissions && (
                  <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="email"
                      value={contactEmailInput}
                      onChange={(e) => setContactEmailInput(e.target.value)}
                      placeholder={business?.email || "Empfänger-E-Mail eintragen..."}
                      className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-48"
                    />
                    <button
                      onClick={() => updateContactEmailMutation.mutate({ websiteId: website.id, contactEmail: contactEmailInput })}
                      disabled={updateContactEmailMutation.isPending}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {contactEmailSaved ? "✓ Gespeichert" : "Speichern"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {submissionsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : !submissionsData?.submissions.length ? (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">
                  {showArchivedSubmissions ? "Keine archivierten Anfragen" : "Noch keine Anfragen"}
                </h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  {showArchivedSubmissions
                    ? "Archivierte Anfragen erscheinen hier."
                    : "Wenn Besucher das Kontaktformular auf deiner Website ausfüllen, erscheinen die Anfragen hier."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissionsData.submissions.map((sub) => {
                  const isUnread = !sub.readAt;
                  const isDeleting = deleteConfirmId === sub.id;
                  return (
                    <div
                      key={sub.id}
                      className={`bg-slate-800/60 border rounded-2xl p-5 transition-colors ${
                        showArchivedSubmissions
                          ? "border-slate-700/30 opacity-75"
                          : isUnread
                            ? "border-blue-500/40 bg-slate-800/80"
                            : "border-slate-700/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            {isUnread && !showArchivedSubmissions && (
                              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                            )}
                            <span className="text-white font-semibold truncate">{sub.name}</span>
                            <span className="text-slate-400 text-xs shrink-0">
                              {new Date(sub.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 mb-3">
                            <a
                              href={`mailto:${sub.email}`}
                              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {sub.email}
                            </a>
                            {sub.phone && (
                              <a
                                href={`tel:${sub.phone}`}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                {sub.phone}
                              </a>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                            {sub.message}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {!showArchivedSubmissions ? (
                            <>
                              <a
                                href={`mailto:${sub.email}?subject=Re: Kontaktanfrage`}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Mail className="w-3 h-3" />
                                Antworten
                              </a>
                              {isUnread && (
                                <button
                                  onClick={() => markReadMutation.mutate({ submissionId: sub.id })}
                                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
                                >
                                  Als gelesen markieren
                                </button>
                              )}
                              <button
                                onClick={() => archiveMutation.mutate({ submissionId: sub.id, archive: true })}
                                disabled={archiveMutation.isPending}
                                className="flex items-center gap-1 text-slate-500 hover:text-amber-400 text-xs transition-colors disabled:opacity-40"
                                title="Archivieren"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                Archivieren
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => archiveMutation.mutate({ submissionId: sub.id, archive: false })}
                                disabled={archiveMutation.isPending}
                                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors disabled:opacity-40"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                Wiederherstellen
                              </button>
                              {isDeleting ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-slate-400">Sicher?</span>
                                  <button
                                    onClick={() => deleteMutation.mutate({ submissionId: sub.id })}
                                    disabled={deleteMutation.isPending}
                                    className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
                                  >
                                    Ja, löschen
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                  >
                                    Abbrechen
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(sub.id)}
                                  className="flex items-center gap-1 text-slate-500 hover:text-red-400 text-xs transition-colors"
                                  title="Endgültig löschen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Löschen
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Setup-Modal ── */}
      {setupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-white font-bold text-lg">Website einrichten</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Schritt {setupStepIdx + 1} von {addOns.contactForm ? 4 : 3}
                </p>
              </div>
              <button
                onClick={() => setSetupOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Step 0 – Subdomain wählen */}
            {setupStepIdx === 0 && (
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🌐</div>
                  <h3 className="text-white font-semibold text-lg">Deine Website-Adresse</h3>
                  <p className="text-slate-400 text-sm mt-1">Wähle eine einfache, einprägsame Adresse für deine Website.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Subdomain</label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-colors">
                    <input
                      type="text"
                      value={slugInput}
                      onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+/, ""))}
                      placeholder={suggestedSlug || "mein-unternehmen"}
                      className="flex-1 bg-transparent text-white outline-none text-sm"
                      autoFocus
                    />
                    <span className="text-slate-400 text-sm whitespace-nowrap">.pageblitz.de</span>
                  </div>
                  {slugInput.length >= 3 && (
                    <p className={`text-xs flex items-center gap-1.5 ${
                      slugChecking ? "text-slate-400" :
                      slugCheck?.available ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {slugChecking ? "⏳ Prüfe Verfügbarkeit..." :
                       slugCheck?.available ? "✓ Verfügbar" : "✗ Bereits vergeben – anderen Namen wählen"}
                    </p>
                  )}
                  {slugInput.length > 0 && slugInput.length < 3 && (
                    <p className="text-xs text-slate-400">Mindestens 3 Zeichen</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSetupOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    Später
                  </button>
                  <button
                    disabled={!slugCheck?.available || slugInput.length < 3 || updateSlugMutation.isPending}
                    onClick={async () => {
                      await updateSlugMutation.mutateAsync({ websiteId: website.id, slug: slugInput });
                      setSetupStepIdx(1);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    {updateSlugMutation.isPending ? "Speichern..." : "Übernehmen →"}
                  </button>
                </div>
                {/* Eigene Domain – subtiler Accordion-Hinweis */}
                <div className="border-t border-slate-700/50 pt-3 mt-1">
                  <button
                    onClick={() => setShowDomainHint(v => !v)}
                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors w-full text-left"
                  >
                    <span>🔗</span>
                    <span>Du hast bereits eine Domain? So verbindest du sie</span>
                    <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${showDomainHint ? "rotate-180" : ""}`} />
                  </button>
                  {showDomainHint && (
                    <div className="mt-3 bg-slate-900 rounded-xl p-4 space-y-2">
                      <p className="text-slate-300 text-xs font-medium mb-2">CNAME-Eintrag bei deinem DNS-Anbieter setzen:</p>
                      {[
                        { label: "Typ",  value: "CNAME" },
                        { label: "Name", value: "www" },
                        { label: "Ziel", value: "pageblitz.de" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-1.5">
                          <span className="text-slate-400 text-xs">{label}</span>
                          <span className="text-white text-xs font-mono">{value}</span>
                        </div>
                      ))}
                      <p className="text-slate-500 text-xs text-center pt-1">DNS-Änderungen können bis zu 24h dauern</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1 – Kontakt-E-Mail (nur wenn contactForm Add-on) */}
            {setupStepIdx === 1 && addOns.contactForm && (
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">📧</div>
                  <h3 className="text-white font-semibold text-lg">Kontaktformular-E-Mail</h3>
                  <p className="text-slate-400 text-sm mt-1">Wohin sollen Kundenanfragen aus deinem Kontaktformular gesendet werden?</p>
                </div>
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wide">Empfänger-E-Mail</label>
                  <input
                    ref={contactEmailRef}
                    type="email"
                    defaultValue={contactEmailInput}
                    onChange={(e) => setContactEmailInput(e.target.value)}
                    onInput={(e) => setContactEmailInput((e.target as HTMLInputElement).value)}
                    placeholder="deine@email.de"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                    autoComplete="off"
                    autoFocus
                    id="setup-contact-email"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSetupStepIdx(2)}
                    className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    Überspringen
                  </button>
                  <button
                    disabled={updateContactEmailMutation.isPending}
                    onClick={async () => {
                      const val = contactEmailRef.current?.value || contactEmailInput;
                      if (!val.trim()) {
                        toast.error("Bitte eine E-Mail-Adresse eingeben.");
                        return;
                      }
                      try {
                        await updateContactEmailMutation.mutateAsync({ websiteId: website.id, contactEmail: val.trim() });
                        setContactEmailInput(val.trim());
                        setSetupStepIdx(2);
                      } catch { /* onError handler shows toast */ }
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    {updateContactEmailMutation.isPending ? "Speichern..." : "Speichern →"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 (contactForm) / Step 1 (no contactForm) – Impressum & Datenschutz */}
            {setupStepIdx === (addOns.contactForm ? 2 : 1) && (
              <div className="p-6 space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-white font-semibold text-lg">Impressum & Datenschutz</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Gesetzlich vorgeschrieben. Gib den Namen des Inhabers an – dauert 30 Sekunden.
                  </p>
                </div>
                {legalDone ? (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <span className="text-emerald-400 text-xl">✓</span>
                    <div>
                      <p className="text-emerald-400 text-sm font-medium">Impressum & Datenschutz generiert</p>
                      <p className="text-slate-400 text-xs mt-0.5">Erreichbar unter /impressum und /datenschutz</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Vor- und Nachname des Inhabers *</label>
                      <input
                        type="text"
                        value={legalOwnerInput}
                        onChange={(e) => setLegalOwnerInput(e.target.value)}
                        placeholder="Max Mustermann"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Impressum-E-Mail *</label>
                      <input
                        type="email"
                        value={legalEmailInput2}
                        onChange={(e) => setLegalEmailInput2(e.target.value)}
                        placeholder="info@beispiel.de"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {generateLegalMutation.isError && (
                      <p className="text-red-400 text-xs">{generateLegalMutation.error?.message || "Fehler beim Generieren"}</p>
                    )}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  {!legalDone && (
                    <button
                      disabled={
                        legalOwnerInput.trim().split(/\s+/).length < 2 ||
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legalEmailInput2) ||
                        generateLegalMutation.isPending
                      }
                      onClick={async () => {
                        await generateLegalMutation.mutateAsync({
                          websiteId: website.id,
                          legalOwner: legalOwnerInput.trim(),
                          legalEmail: legalEmailInput2.trim(),
                        });
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                    >
                      {generateLegalMutation.isPending ? "Generiere..." : "Generieren →"}
                    </button>
                  )}
                  {legalDone && (
                    <button
                      onClick={() => setSetupStepIdx(addOns.contactForm ? 3 : 2)}
                      className="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                      Weiter →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Final Step – Live schalten */}
            {setupStepIdx === (addOns.contactForm ? 3 : 2) && (
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-white font-semibold text-lg">Deine Website ist bereit!</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Schalte deine Website jetzt live. Sie wird öffentlich erreichbar unter:
                  </p>
                  <p className="text-blue-400 text-sm font-mono mt-2">
                    {website.slug}.pageblitz.de
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Subdomain",              done: slugDone  },
                    ...(addOns.contactForm ? [{ label: "Kontakt-E-Mail", done: emailDone }] : []),
                    { label: "Impressum & Datenschutz", done: legalDone },
                  ].map(({ label, done }) => (
                    <div key={label} className={`flex items-center gap-2 text-sm ${done ? "text-emerald-400" : "text-amber-400"}`}>
                      <span>{done ? "✓" : "⚠"}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                {!legalDone && (
                  <p className="text-amber-400 text-xs text-center bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                    ⚠ Impressum & Datenschutz fehlen noch – bitte erst generieren (vorheriger Schritt)
                  </p>
                )}
                <button
                  disabled={setLiveMutation.isPending || !legalDone}
                  onClick={() => setLiveMutation.mutateAsync({ websiteId: website.id })}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-emerald-900/30"
                >
                  {setLiveMutation.isPending ? "Wird live geschaltet..." : "⚡ Website jetzt live schalten"}
                </button>
              </div>
            )}

            {/* Step-Dots */}
            <div className="flex justify-center gap-2 pb-4">
              {Array.from({ length: addOns.contactForm ? 4 : 3 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                  i === setupStepIdx ? "bg-blue-400 w-4" : i < setupStepIdx ? "bg-emerald-400" : "bg-slate-600"
                }`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

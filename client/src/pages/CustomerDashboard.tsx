import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Loader2, Globe, ExternalLink, Edit2, Check, X, Palette, Phone, Mail, MapPin, Image, RefreshCw, Settings, User, LayoutGrid, Type, Sparkles, Plus, Trash2, ChevronUp, ChevronDown, Upload, MessageSquare, GripVertical, Eye, EyeOff, Layers, BarChart2, Users, MousePointerClick, Clock, Lock } from "lucide-react";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import type { WebsiteData, ColorScheme } from "@shared/types";
import { FONT_OPTIONS } from "@shared/layoutConfig";

// ── Types ───────────────────────────────────────────
type Tab = "preview" | "content" | "structure" | "design" | "addons" | "analytics" | "submissions" | "domain";

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
}

function AddonsEditor({ websiteId, website, onboarding, onUpdate, purchasedAddOns }: AddonsEditorProps) {
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
  const [expandedAddon, setExpandedAddon] = useState<string | null>(null);
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
    if (key === "contactForm") {
      setAddons({ ...addons, contactForm: !addons.contactForm });
    } else {
      const newEnabled = !addons[key].enabled;
      setAddons({
        ...addons,
        [key]: { ...addons[key], enabled: newEnabled },
      });
      // Auto-expand when enabling
      if (newEnabled) {
        setExpandedAddon(key);
      } else {
        setExpandedAddon(null);
      }
    }
    // Auto-save will be triggered by useEffect
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

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          Aktiviere Features für deine Website. Änderungen werden automatisch gespeichert.
        </p>
        {/* Auto-save Status Indicator */}
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Wird gespeichert...
            </span>
          )}
          {saveStatus === "saved" && lastSaved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <Check className="w-3.5 h-3.5" />
              Gespeichert {lastSaved.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-500/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              Warte auf Eingabe...
            </span>
          )}
          {/* Manual save button for instant save */}
          <button
            onClick={() => {
              if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
              setSaveStatus("saving");
              setSaving(true);
              updateAddons.mutate({
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
            }}
            disabled={saving || uploading || saveStatus === "saved"}
            className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            title="Jetzt sofort speichern"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {saving ? "Speichern..." : "Jetzt speichern"}
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-300 ${addons.gallery.enabled ? (expandedAddon === "gallery" ? "border-blue-500/50 ring-1 ring-blue-500/20" : "border-slate-600/50") : "border-slate-700/30 opacity-75"}`}>
        {/* Card Header */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0">
              <Image className="w-6 h-6 text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-semibold">Bildergalerie</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium">
                  +3,90 €/Mon
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Präsentiere deine Arbeiten und Projekte in einer ansprechenden Galerie. 
                {addons.gallery.enabled && addons.gallery.photos.length > 0 && (
                  <span className="text-pink-400 ml-1">{addons.gallery.photos.length} Bilder hochgeladen</span>
                )}
              </p>
            </div>
            {/* Toggle Switch / Paywall */}
            {!purchasedAddOns["gallery"] ? renderAddonLock("gallery") : (
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={addons.gallery.enabled}
                  onChange={() => toggleAddon("gallery")}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pink-500" />
              </label>
            )}
          </div>
        </div>

        {/* Expandable Content */}
        {addons.gallery.enabled && (
          <div className="border-t border-slate-700/50">
            <button
              onClick={() => setExpandedAddon(expandedAddon === "gallery" ? null : "gallery")}
              className="w-full flex items-center justify-between p-3 px-5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {expandedAddon === "gallery" ? "Weniger anzeigen" : "Bilder verwalten"}
              </span>
              {expandedAddon === "gallery" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedAddon === "gallery" && (
              <div className="p-5 pt-0 space-y-4">
                {addons.gallery.photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {addons.gallery.photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-700/50">
                        <img src={photo} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                        <button
                          onClick={() => removeGalleryPhoto(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`flex flex-col items-center gap-3 justify-center text-slate-400 hover:text-white bg-slate-700/30 hover:bg-slate-700/50 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-xl px-6 py-8 cursor-pointer transition-all ${uploading ? "opacity-50" : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addGalleryPhoto(file);
                    }}
                  />
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
          </div>
        )}
      </div>

      {/* Menu */}
      <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-300 ${addons.menu.enabled ? (expandedAddon === "menu" ? "border-amber-500/50 ring-1 ring-amber-500/20" : "border-slate-600/50") : "border-slate-700/30 opacity-75"}`}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-semibold">Speisekarte</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                  +3,90 €/Mon
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ideal für Restaurants, Cafés und Bäckereien. Präsentiere deine Gerichte mit Preisen und Beschreibungen.
                {addons.menu.enabled && (
                  <span className="text-amber-400 ml-1">
                    {addons.menu.categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0)} Gerichte
                  </span>
                )}
              </p>
            </div>
            {!purchasedAddOns["menu"] ? renderAddonLock("menu") : (
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={addons.menu.enabled}
                  onChange={() => toggleAddon("menu")}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500" />
              </label>
            )}
          </div>
        </div>

        {addons.menu.enabled && (
          <div className="border-t border-slate-700/50">
            <button
              onClick={() => setExpandedAddon(expandedAddon === "menu" ? null : "menu")}
              className="w-full flex items-center justify-between p-3 px-5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {expandedAddon === "menu" ? "Weniger anzeigen" : "Speisekarte bearbeiten"}
              </span>
              {expandedAddon === "menu" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedAddon === "menu" && (
              <div className="p-5 pt-0 space-y-4 max-h-[600px] overflow-y-auto">
                {addons.menu.categories.map((category, catIdx) => (
                  <div key={catIdx} className="bg-slate-700/40 rounded-xl p-4 space-y-3 border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">Kategorie {catIdx + 1}</span>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateMenuCategoryName(catIdx, e.target.value)}
                        placeholder="Kategorie Name (z.B. Hauptgerichte)"
                        className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-amber-500 font-medium"
                      />
                      {addons.menu.categories.length > 1 && (
                        <button
                          onClick={() => removeMenuCategory(catIdx)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 pl-4 border-l-2 border-slate-600/50">
                      {category.items?.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="flex gap-2 items-start bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.name || ""}
                                onChange={(e) => updateMenuItem(catIdx, itemIdx, "name", e.target.value)}
                                placeholder="Gerichtname"
                                className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-amber-500"
                              />
                              <input
                                type="text"
                                value={item.price || ""}
                                onChange={(e) => updateMenuItem(catIdx, itemIdx, "price", e.target.value)}
                                placeholder="Preis (z.B. 12,90 €)"
                                className="w-28 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-amber-500"
                              />
                            </div>
                            <input
                              type="text"
                              value={item.description || ""}
                              onChange={(e) => updateMenuItem(catIdx, itemIdx, "description", e.target.value)}
                              placeholder="Beschreibung (optional)"
                              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-amber-500"
                            />
                          </div>
                          <button
                            onClick={() => removeMenuItem(catIdx, itemIdx)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addMenuItem(catIdx)}
                        className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors py-2"
                      >
                        <Plus className="w-4 h-4" />
                        Gericht hinzufügen
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addMenuCategory}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-dashed border-blue-500/30"
                >
                  <Plus className="w-4 h-4" />
                  Neue Kategorie hinzufügen
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pricelist */}
      <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-300 ${addons.pricelist.enabled ? (expandedAddon === "pricelist" ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-slate-600/50") : "border-slate-700/30 opacity-75"}`}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
              <LayoutGrid className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-semibold">Preisliste</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  +3,90 €/Mon
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Zeige deine Leistungen mit Preisen übersichtlich an. Perfekt für Friseure, Beauty-Studios und Dienstleister.
                {addons.pricelist.enabled && (
                  <span className="text-emerald-400 ml-1">
                    {addons.pricelist.categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0)} Preise
                  </span>
                )}
              </p>
            </div>
            {!purchasedAddOns["pricelist"] ? renderAddonLock("pricelist") : (
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={addons.pricelist.enabled}
                  onChange={() => toggleAddon("pricelist")}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            )}
          </div>
        </div>

        {addons.pricelist.enabled && (
          <div className="border-t border-slate-700/50">
            <button
              onClick={() => setExpandedAddon(expandedAddon === "pricelist" ? null : "pricelist")}
              className="w-full flex items-center justify-between p-3 px-5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {expandedAddon === "pricelist" ? "Weniger anzeigen" : "Preisliste bearbeiten"}
              </span>
              {expandedAddon === "pricelist" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedAddon === "pricelist" && (
              <div className="p-5 pt-0 space-y-4 max-h-[600px] overflow-y-auto">
                {addons.pricelist.categories.map((category, catIdx) => (
                  <div key={catIdx} className="bg-slate-700/40 rounded-xl p-4 space-y-3 border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">Kategorie {catIdx + 1}</span>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updatePriceCategoryName(catIdx, e.target.value)}
                        placeholder="Kategorie Name (z.B. Damen)"
                        className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-emerald-500 font-medium"
                      />
                      {addons.pricelist.categories.length > 1 && (
                        <button
                          onClick={() => removePriceCategory(catIdx)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 pl-4 border-l-2 border-slate-600/50">
                      {category.items?.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="flex gap-2 items-start bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.name || ""}
                                onChange={(e) => updatePriceItem(catIdx, itemIdx, "name", e.target.value)}
                                placeholder="Leistung"
                                className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-emerald-500"
                              />
                              <input
                                type="text"
                                value={item.price || ""}
                                onChange={(e) => updatePriceItem(catIdx, itemIdx, "price", e.target.value)}
                                placeholder="Preis"
                                className="w-28 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-emerald-500"
                              />
                            </div>
                            <input
                              type="text"
                              value={item.description || ""}
                              onChange={(e) => updatePriceItem(catIdx, itemIdx, "description", e.target.value)}
                              placeholder="Beschreibung (optional)"
                              className="w-full bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:border-emerald-500"
                            />
                          </div>
                          <button
                            onClick={() => removePriceItem(catIdx, itemIdx)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addPriceItem(catIdx)}
                        className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors py-2"
                      >
                        <Plus className="w-4 h-4" />
                        Preis hinzufügen
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addPriceCategory}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-dashed border-blue-500/30"
                >
                  <Plus className="w-4 h-4" />
                  Neue Kategorie hinzufügen
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Form */}
      <div className={`bg-slate-800/60 rounded-2xl border transition-all duration-300 ${addons.contactForm ? (expandedAddon === "contactForm" ? "border-blue-500/50 ring-1 ring-blue-500/20" : "border-slate-600/50") : "border-slate-700/30 opacity-75"}`}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-semibold">Kontaktformular</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                  +3,90 €/Mon
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ermögliche Besuchern, direkt über deine Website Anfragen zu senden. 
                {addons.contactForm && (
                  <span className="text-blue-400 ml-1">
                    {addons.contactFormFields?.length || 4} Felder konfiguriert
                  </span>
                )}
              </p>
            </div>
            {!purchasedAddOns["contactForm"] ? renderAddonLock("contactForm") : (
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={addons.contactForm}
                  onChange={() => toggleAddon("contactForm")}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500" />
              </label>
            )}
          </div>
        </div>

        {addons.contactForm && (
          <div className="border-t border-slate-700/50">
            <button
              onClick={() => setExpandedAddon(expandedAddon === "contactForm" ? null : "contactForm")}
              className="w-full flex items-center justify-between p-3 px-5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {expandedAddon === "contactForm" ? "Weniger anzeigen" : "Formularfelder bearbeiten"}
              </span>
              {expandedAddon === "contactForm" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedAddon === "contactForm" && (
              <div className="p-5 pt-2">
                <ContactFormEditor
                  websiteId={websiteId}
                  initialFields={addons.contactFormFields}
                  onSave={handleSaveContactFormFields}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add-on Kauf-Bestätigung Modal ── */}
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
                <button
                  onClick={() => setConfirmAddon(null)}
                  disabled={purchaseAddonMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => purchaseAddonMutation.mutate({ websiteId, addonKey: confirmAddon as any })}
                  disabled={purchaseAddonMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {purchaseAddonMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gebucht…</>
                    : "Jetzt freischalten"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "preview", label: "Vorschau", icon: <Globe className="w-4 h-4" /> },
    { id: "content", label: "Inhalte", icon: <Edit2 className="w-4 h-4" /> },
    { id: "structure", label: "Struktur", icon: <Layers className="w-4 h-4" /> },
    { id: "design", label: "Design", icon: <Palette className="w-4 h-4" /> },
    { id: "addons", label: "Add-ons", icon: <Sparkles className="w-4 h-4" /> },
    { id: "domain", label: "Domain", icon: <Globe className="w-4 h-4" /> },
    { id: "submissions", label: "Anfragen", icon: <MessageSquare className="w-4 h-4" />, badge: unreadCount },
    { id: "analytics", label: "Statistiken", icon: <BarChart2 className="w-4 h-4" /> },
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Add-ons verwalten
              </h2>
              <AddonsEditor
                websiteId={website.id}
                website={website}
                onboarding={onboardingData}
                onUpdate={handleUpdate}
                purchasedAddOns={(subscription?.addOns ?? {}) as Record<string, boolean>}
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

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Loader2, Globe, ExternalLink, Edit2, Check, X, Palette, Phone, Mail, MapPin, Image, RefreshCw, Settings } from "lucide-react";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import type { WebsiteData, ColorScheme } from "@shared/types";

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

// ── Main Component ────────────────────────────────────

export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const { data: myWebsites, isLoading, refetch } = trpc.customer.getMyWebsites.useQuery(
    undefined,
    { enabled: !!user }
  );

  const updateMutation = trpc.customer.updateWebsiteContent.useMutation({
    onSuccess: () => {
      refetch();
      setPreviewKey((k) => k + 1);
    },
  });

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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left: Edit panel */}
        <div className="w-full lg:w-[380px] flex-shrink-0 space-y-4">
          {/* Status card */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Status</h2>
              <StatusBadge status={website.status} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Domain</span>
                <span className="text-slate-200 font-mono text-xs">{website.slug}.pageblitz.de</span>
              </div>
              {website.paidAt && (
                <div className="flex justify-between text-slate-400">
                  <span>Aktiv seit</span>
                  <span className="text-slate-200">{new Date(website.paidAt).toLocaleDateString("de-DE")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content editing */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-400" />
              Inhalte bearbeiten
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

          {/* Contact info */}
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

          {/* Colors */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-400" />
              Farben
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Hauptfarbe</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorScheme?.primary || "#3B82F6"}
                    onChange={(e) => {
                      updateMutation.mutate({ websiteId: website.id, patch: { brandColor: e.target.value } });
                    }}
                    className="w-10 h-10 rounded-lg border border-slate-600 cursor-pointer bg-transparent"
                  />
                  <span className="text-slate-300 text-sm font-mono">{colorScheme?.primary || "#3B82F6"}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Sekundärfarbe</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorScheme?.secondary || "#F1F5F9"}
                    onChange={(e) => {
                      updateMutation.mutate({ websiteId: website.id, patch: { brandSecondaryColor: e.target.value } });
                    }}
                    className="w-10 h-10 rounded-lg border border-slate-600 cursor-pointer bg-transparent"
                  />
                  <span className="text-slate-300 text-sm font-mono">{colorScheme?.secondary || "#F1F5F9"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero photo */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-400" />
              Hauptbild
            </h2>
            {website.heroImageUrl ? (
              <div className="relative rounded-xl overflow-hidden aspect-video">
                <img src={website.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                <button
                  onClick={() => updateMutation.mutate({ websiteId: website.id, patch: { heroPhotoUrl: "" } })}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                  title="Bild entfernen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-slate-700/40 border-2 border-dashed border-slate-600 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">Kein Hauptbild</p>
                </div>
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
              Bild ersetzen
            </label>
          </div>

          {/* Support */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-white font-semibold flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-blue-400" />
              Support & Einstellungen
            </h2>
            <div className="space-y-2">
              <a
                href={`/preview/${website.previewToken}/onboarding`}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Vollständiges Onboarding öffnen
              </a>
              <a
                href="mailto:support@pageblitz.de"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Support kontaktieren
              </a>
            </div>
          </div>
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 min-w-0">
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
            <div className="overflow-auto max-h-[calc(100vh-200px)]">
              {websiteData ? (
                <div key={previewKey} className="transform-gpu origin-top" style={{ transform: "scale(0.7)", transformOrigin: "top left", width: "142.86%", height: "142.86%" }}>
                  <WebsiteRenderer
                    websiteData={websiteData}
                    colorScheme={colorScheme}
                    heroImageUrl={website.heroImageUrl || undefined}
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
        </div>
      </div>
    </div>
  );
}

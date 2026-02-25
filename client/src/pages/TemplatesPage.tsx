/**
 * TemplatesPage – Admin page for batch-uploading template screenshots.
 * Flow: Drop files → auto-upload to S3 → AI classifies each → Review queue → Approve/correct → Active library
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload, Trash2, ImageIcon, CheckCircle, Clock, XCircle,
  Layers, Sparkles, ChevronDown, ChevronUp, Check, RefreshCw, X,
  Pencil, ExternalLink, ZoomIn
} from "lucide-react";
// TemplateUpload type (inline to avoid import path issues)
interface TemplateUpload {
  id: number;
  name: string;
  industry: string;
  industries: string | null;
  layoutPool: string;
  aiIndustries: string | null;
  aiLayoutPool: string | null;
  aiConfidence: string | null;
  aiReason: string | null;
  status: string;
  imageUrl: string;
  fileKey: string;
  notes: string | null;
  createdAt: Date;
}

// ── Constants ────────────────────────────────────────────
const INDUSTRIES = [
  { value: "beauty", label: "Beauty & Friseur" },
  { value: "restaurant", label: "Restaurant & Café" },
  { value: "fitness", label: "Fitness & Sport" },
  { value: "automotive", label: "Auto & KFZ" },
  { value: "medical", label: "Medizin & Gesundheit" },
  { value: "legal", label: "Recht & Beratung" },
  { value: "trades", label: "Handwerk & Bau" },
  { value: "retail", label: "Einzelhandel & Mode" },
  { value: "tech", label: "IT & Technologie" },
  { value: "education", label: "Bildung & Kurse" },
  { value: "hospitality", label: "Hotel & Tourismus" },
  { value: "other", label: "Sonstige" },
];

const LAYOUT_POOLS = [
  { value: "elegant", label: "Elegant" },
  { value: "bold", label: "Bold" },
  { value: "warm", label: "Warm" },
  { value: "clean", label: "Clean" },
  { value: "dynamic", label: "Dynamic" },
  { value: "luxury", label: "Luxury" },
  { value: "craft", label: "Craft" },
  { value: "fresh", label: "Fresh" },
  { value: "trust", label: "Trust" },
  { value: "modern", label: "Modern" },
  { value: "vibrant", label: "Vibrant" },
  { value: "natural", label: "Natural" },
];

const POOL_COLORS: Record<string, string> = {
  elegant: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  bold: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  warm: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  clean: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  dynamic: "bg-red-500/20 text-red-300 border-red-500/30",
  luxury: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  craft: "bg-stone-500/20 text-stone-300 border-stone-500/30",
  fresh: "bg-green-500/20 text-green-300 border-green-500/30",
  trust: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  modern: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  vibrant: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  natural: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-red-400",
};

// ── Types ────────────────────────────────────────────────
interface QueueItem {
  localId: string;
  file: File;
  previewUrl: string;
  name: string;
  // Upload state
  uploadState: "idle" | "uploading" | "uploaded" | "classifying" | "classified" | "error";
  errorMsg?: string;
  // After upload
  serverId?: number;
  imageUrl?: string;
  // After classification
  industries: string[];
  layoutPool: string;
  confidence?: string;
  reason?: string;
  notes: string;
  // Expanded in review
  expanded: boolean;
}

// ── Helper ───────────────────────────────────────────────
function industryLabel(v: string) { return INDUSTRIES.find(i => i.value === v)?.label ?? v; }

// ── Main Component ───────────────────────────────────────
export default function TemplatesPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [detailTemplate, setDetailTemplate] = useState<TemplateUpload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: savedTemplates, refetch } = trpc.templates.list.useQuery(
    { status: filterStatus === "all" ? "all" : filterStatus, industry: filterIndustry === "all" ? undefined : filterIndustry }
  );

  const uploadMutation = trpc.templates.upload.useMutation();
  const classifyMutation = trpc.templates.classify.useMutation();
  const updateMutation = trpc.templates.update.useMutation();
  const approveMutation = trpc.templates.approve.useMutation();
  const bulkApproveMutation = trpc.templates.bulkApprove.useMutation();
  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => { toast.success("Template gelöscht"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  // ── File handling ─────────────────────────────────────
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!arr.length) { toast.error("Nur Bilddateien erlaubt"); return; }
    const newItems: QueueItem[] = arr.map(file => ({
      localId: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name.replace(/\.[^.]+$/, ""),
      uploadState: "idle",
      industries: [],
      layoutPool: "clean",
      notes: "",
      expanded: false,
    }));
    setQueue(prev => [...prev, ...newItems]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  // ── Process queue: upload → classify ─────────────────
  const processItem = useCallback(async (localId: string) => {
    setQueue(prev => prev.map(i => i.localId === localId ? { ...i, uploadState: "uploading" } : i));

    const item = queue.find(i => i.localId === localId);
    if (!item) return;

    try {
      // 1. Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target!.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(item.file);
      });

      // 2. Upload to S3
      const uploaded = await uploadMutation.mutateAsync({
        name: item.name,
        imageData: base64,
        mimeType: item.file.type,
      });

      setQueue(prev => prev.map(i => i.localId === localId
        ? { ...i, uploadState: "classifying", serverId: uploaded.id, imageUrl: uploaded.imageUrl }
        : i));

      // 3. AI classify
      const classified = await classifyMutation.mutateAsync({ id: uploaded.id });

      setQueue(prev => prev.map(i => i.localId === localId
        ? {
            ...i,
            uploadState: "classified",
            industries: classified.industries,
            layoutPool: classified.layoutPool,
            confidence: classified.confidence,
            reason: classified.reason,
            expanded: true, // auto-open for review
          }
        : i));

    } catch (err: any) {
      setQueue(prev => prev.map(i => i.localId === localId
        ? { ...i, uploadState: "error", errorMsg: err.message || "Fehler" }
        : i));
    }
  }, [queue, uploadMutation, classifyMutation]);

  const processAll = useCallback(async () => {
    const idle = queue.filter(i => i.uploadState === "idle");
    for (const item of idle) {
      await processItem(item.localId);
    }
  }, [queue, processItem]);

  // ── Approve item ──────────────────────────────────────
  const approveItem = useCallback(async (item: QueueItem) => {
    if (!item.serverId) return;
    try {
      // Save latest edits first
      await updateMutation.mutateAsync({
        id: item.serverId,
        name: item.name,
        industries: item.industries,
        layoutPool: item.layoutPool,
        notes: item.notes || undefined,
        status: "approved",
      });
      toast.success(`"${item.name}" freigegeben`);
      setQueue(prev => prev.filter(i => i.localId !== item.localId));
      refetch();
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [updateMutation, refetch]);

  const approveAll = useCallback(async () => {
    const classified = queue.filter(i => i.uploadState === "classified" && i.serverId && i.industries.length > 0);
    if (!classified.length) { toast.error("Keine klassifizierten Templates zum Freigeben"); return; }
    // Save all edits first
    await Promise.all(classified.map(item =>
      updateMutation.mutateAsync({
        id: item.serverId!,
        name: item.name,
        industries: item.industries,
        layoutPool: item.layoutPool,
        notes: item.notes || undefined,
      })
    ));
    await bulkApproveMutation.mutateAsync({ ids: classified.map(i => i.serverId!) });
    toast.success(`${classified.length} Templates freigegeben`);
    setQueue(prev => prev.filter(i => !classified.find(c => c.localId === i.localId)));
    refetch();
  }, [queue, updateMutation, bulkApproveMutation, refetch]);

  const removeFromQueue = (localId: string) => {
    setQueue(prev => {
      const item = prev.find(i => i.localId === localId);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(i => i.localId !== localId);
    });
  };

  const updateQueueItem = (localId: string, patch: Partial<QueueItem>) => {
    setQueue(prev => prev.map(i => i.localId === localId ? { ...i, ...patch } : i));
  };

  // ── Stats ─────────────────────────────────────────────
  const idleCount = queue.filter(i => i.uploadState === "idle").length;
  const classifiedCount = queue.filter(i => i.uploadState === "classified").length;
  const processingCount = queue.filter(i => ["uploading", "classifying"].includes(i.uploadState)).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-400" />
            Template-Bibliothek
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Lade mehrere Templates auf einmal hoch. Die KI klassifiziert Branche und Layout-Pool automatisch – du kannst danach alles korrigieren.
          </p>
        </div>
      </div>

      {/* ── Drop Zone ── */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${isDragging ? "border-blue-400 bg-blue-500/10 scale-[1.01]" : "border-gray-700 hover:border-gray-500 bg-gray-900/50"}`}
        style={{ minHeight: "140px" }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500 pointer-events-none">
          <Upload className={`h-10 w-10 transition-colors ${isDragging ? "text-blue-400" : "text-gray-600"}`} />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-300">Mehrere Bilder hierher ziehen oder klicken</p>
            <p className="text-xs mt-1 text-gray-500">JPG, PNG, WebP – beliebig viele auf einmal</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* ── Upload Queue ── */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Upload-Queue
              <span className="ml-2 text-sm font-normal text-gray-400">
                {queue.length} Bild{queue.length !== 1 ? "er" : ""} · {classifiedCount} klassifiziert · {processingCount > 0 ? `${processingCount} in Bearbeitung` : ""}
              </span>
            </h2>
            <div className="flex gap-2">
              {idleCount > 0 && (
                <Button
                  size="sm"
                  onClick={processAll}
                  disabled={processingCount > 0}
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {idleCount} KI-analysieren
                </Button>
              )}
              {classifiedCount > 0 && (
                <Button
                  size="sm"
                  onClick={approveAll}
                  className="gap-1.5 bg-green-600 hover:bg-green-700 text-xs"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Alle {classifiedCount} freigeben
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {queue.map(item => (
              <QueueCard
                key={item.localId}
                item={item}
                onProcess={() => processItem(item.localId)}
                onApprove={() => approveItem(item)}
                onRemove={() => removeFromQueue(item.localId)}
                onUpdate={(patch) => updateQueueItem(item.localId, patch)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Saved Templates Library ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Gespeicherte Templates
            {savedTemplates && <span className="ml-2 text-sm font-normal text-gray-400">{savedTemplates.length} gesamt</span>}
          </h2>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-white h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="approved">Freigegeben</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-44 bg-gray-800 border-gray-700 text-white h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Branchen</SelectItem>
                {INDUSTRIES.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!savedTemplates || savedTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-900/50 rounded-xl border border-gray-800">
            <ImageIcon className="h-12 w-12 text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium">Noch keine Templates gespeichert</p>
            <p className="text-sm text-gray-600 mt-1">Lade Bilder hoch und gib sie nach der KI-Analyse frei.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {savedTemplates.map((t) => {
              const inds: string[] = (() => { try { return JSON.parse(t.industries || "[]"); } catch { return [t.industry]; } })();
              return (
                <div
                  key={t.id}
                  className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer"
                  onClick={() => setDetailTemplate(t)}
                >
                  <div className="relative" style={{ aspectRatio: "4/3" }}>
                    <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                        <ZoomIn className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      {t.status === "approved"
                        ? <span className="bg-green-600/80 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Aktiv</span>
                        : <span className="bg-yellow-600/80 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Ausstehend</span>
                      }
                    </div>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    <p className="text-xs font-medium text-white truncate">{t.name}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={`text-xs px-1.5 py-0 border ${POOL_COLORS[t.layoutPool] || "bg-gray-600 text-gray-300 border-gray-500"}`}>
                        {t.layoutPool}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {inds.slice(0, 3).map(ind => (
                        <span key={ind} className="text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">{industryLabel(ind)}</span>
                      ))}
                      {inds.length > 3 && <span className="text-xs text-gray-500">+{inds.length - 3}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Template Detail Modal ── */}
      {detailTemplate && (
        <TemplateDetailModal
          template={detailTemplate}
          onClose={() => setDetailTemplate(null)}
          onSaved={(updated) => { setDetailTemplate(updated); refetch(); }}
          onDeleted={() => { setDetailTemplate(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ── TemplateDetailModal Component ─────────────────────────────
interface TemplateDetailModalProps {
  template: TemplateUpload;
  onClose: () => void;
  onSaved: (updated: TemplateUpload) => void;
  onDeleted: () => void;
}

function TemplateDetailModal({ template, onClose, onSaved, onDeleted }: TemplateDetailModalProps) {
  const [name, setName] = useState(template.name);
  const [industries, setIndustries] = useState<string[]>(() => {
    try { return JSON.parse(template.industries || "[]"); } catch { return [template.industry]; }
  });
  const [layoutPool, setLayoutPool] = useState(template.layoutPool);
  const [notes, setNotes] = useState(template.notes || "");
  const [status, setStatus] = useState(template.status);
  const [saving, setSaving] = useState(false);

  const updateMutation = trpc.templates.update.useMutation();
  const approveMutation = trpc.templates.approve.useMutation();
  const deleteMutation = trpc.templates.delete.useMutation();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleIndustry = (val: string) => {
    setIndustries(prev =>
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: template.id,
        name,
        industries,
        layoutPool,
        notes: notes || undefined,
        status: status as any,
      });
      toast.success("Gespeichert");
      onSaved({ ...template, name, industries: JSON.stringify(industries), layoutPool, notes, status });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleApproval = async () => {
    const newStatus = status === "approved" ? "pending" : "approved";
    setSaving(true);
    try {
      await updateMutation.mutateAsync({ id: template.id, status: newStatus as any });
      setStatus(newStatus);
      toast.success(newStatus === "approved" ? "Freigegeben" : "Zurückgezogen");
      onSaved({ ...template, name, industries: JSON.stringify(industries), layoutPool, notes, status: newStatus });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    try {
      await deleteMutation.mutateAsync({ id: template.id });
      toast.success("Template gelöscht");
      onDeleted();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Pencil className="h-4 w-4 text-blue-400" />
            Template bearbeiten
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Large image preview */}
            <div className="relative bg-gray-950 flex items-center justify-center" style={{ minHeight: "320px" }}>
              <img
                src={template.imageUrl}
                alt={name}
                className="w-full h-full object-contain"
                style={{ maxHeight: "480px" }}
              />
              <a
                href={template.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Original öffnen
              </a>
              <div className="absolute top-3 left-3">
                {status === "approved"
                  ? <span className="bg-green-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Aktiv</span>
                  : <span className="bg-yellow-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Ausstehend</span>
                }
              </div>
            </div>

            {/* Right: Edit form */}
            <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "480px" }}>
              {/* Name */}
              <div>
                <Label className="text-gray-300 text-xs mb-1.5 block">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              {/* Layout Pool */}
              <div>
                <Label className="text-gray-300 text-xs mb-1.5 block">Layout-Pool</Label>
                <Select value={layoutPool} onValueChange={setLayoutPool}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_POOLS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${POOL_COLORS[p.value]?.split(" ")[0] || "bg-gray-500"}`} />
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Industries */}
              <div>
                <Label className="text-gray-300 text-xs mb-2 block">
                  Branchen
                  <span className="ml-1.5 text-gray-500">(mehrere wählbar)</span>
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {INDUSTRIES.map(ind => {
                    const selected = industries.includes(ind.value);
                    return (
                      <button
                        key={ind.value}
                        onClick={() => toggleIndustry(ind.value)}
                        className={`text-xs px-2 py-1.5 rounded text-left transition-colors flex items-center gap-1.5 ${
                          selected ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 flex-shrink-0" />}
                        {ind.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-gray-300 text-xs mb-1.5 block">Notizen (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="z.B. Besonders gutes Farbschema..."
                  className="bg-gray-800 border-gray-600 text-white resize-none text-sm"
                  rows={3}
                />
              </div>

              {/* AI info if available */}
              {template.aiReason && (
                <div className="text-xs text-gray-400 bg-gray-800/50 rounded p-2.5 flex gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-purple-300">KI-Analyse:</strong> {template.aiReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800 bg-gray-950/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Löschen
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleApproval}
              disabled={saving}
              className={`gap-1.5 border-gray-600 ${
                status === "approved"
                  ? "text-yellow-400 hover:bg-yellow-500/10"
                  : "text-green-400 hover:bg-green-500/10"
              }`}
            >
              {status === "approved"
                ? <><Clock className="h-4 w-4" /> Zurückziehen</>
                : <><CheckCircle className="h-4 w-4" /> Freigeben</>
              }
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || industries.length === 0}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Speichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QueueCard Component ───────────────────────────────────
interface QueueCardProps {
  item: QueueItem;
  onProcess: () => void;
  onApprove: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<QueueItem>) => void;
}

function QueueCard({ item, onProcess, onApprove, onRemove, onUpdate }: QueueCardProps) {
  const isProcessing = ["uploading", "classifying"].includes(item.uploadState);
  const isClassified = item.uploadState === "classified";
  const isError = item.uploadState === "error";

  const statusIcon = {
    idle: <Clock className="h-4 w-4 text-gray-500" />,
    uploading: <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />,
    uploaded: <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />,
    classifying: <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />,
    classified: <CheckCircle className="h-4 w-4 text-green-400" />,
    error: <XCircle className="h-4 w-4 text-red-400" />,
  }[item.uploadState];

  const statusLabel = {
    idle: "Wartet",
    uploading: "Wird hochgeladen...",
    uploaded: "Hochgeladen",
    classifying: "KI analysiert...",
    classified: "Klassifiziert",
    error: item.errorMsg || "Fehler",
  }[item.uploadState];

  return (
    <div className={`bg-gray-900 border rounded-lg overflow-hidden transition-colors ${isError ? "border-red-800" : isClassified ? "border-gray-700" : "border-gray-800"}`}>
      {/* Card header */}
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail */}
        <img src={item.previewUrl} alt={item.name} className="h-14 w-20 object-cover rounded flex-shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <input
            className="bg-transparent text-sm font-medium text-white w-full outline-none border-b border-transparent hover:border-gray-600 focus:border-blue-500 transition-colors"
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Name..."
          />
          <div className="flex items-center gap-2 mt-1">
            {statusIcon}
            <span className={`text-xs ${isError ? "text-red-400" : isClassified ? "text-green-400" : "text-gray-400"}`}>
              {statusLabel}
            </span>
            {item.confidence && (
              <span className={`text-xs ${CONFIDENCE_COLORS[item.confidence] || "text-gray-400"}`}>
                · KI-Konfidenz: {item.confidence}
              </span>
            )}
          </div>
          {isClassified && item.industries.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.industries.map(ind => (
                <span key={ind} className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">{industryLabel(ind)}</span>
              ))}
              <span className={`text-xs px-1.5 py-0.5 rounded border ${POOL_COLORS[item.layoutPool] || "bg-gray-700 text-gray-300 border-gray-600"}`}>
                {item.layoutPool}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.uploadState === "idle" && (
            <Button size="sm" onClick={onProcess} className="h-8 text-xs bg-blue-600 hover:bg-blue-700 gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Analysieren
            </Button>
          )}
          {isClassified && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdate({ expanded: !item.expanded })}
                className="h-8 text-xs text-gray-400 hover:text-white"
              >
                {item.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button size="sm" onClick={onApprove} className="h-8 text-xs bg-green-600 hover:bg-green-700 gap-1">
                <Check className="h-3.5 w-3.5" /> Freigeben
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={onRemove} className="h-8 w-8 p-0 text-gray-500 hover:text-red-400">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded review editor */}
      {item.expanded && isClassified && (
        <div className="border-t border-gray-800 p-4 grid md:grid-cols-2 gap-4 bg-gray-950/50">
          {/* AI reason */}
          {item.reason && (
            <div className="md:col-span-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2.5 flex gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-purple-300">KI-Begründung:</strong> {item.reason}</span>
            </div>
          )}

          {/* Industries multi-select */}
          <div>
            <Label className="text-gray-300 text-xs mb-2 block">Branchen (mehrere möglich)</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {INDUSTRIES.map(ind => {
                const selected = item.industries.includes(ind.value);
                return (
                  <button
                    key={ind.value}
                    onClick={() => {
                      const next = selected
                        ? item.industries.filter(i => i !== ind.value)
                        : [...item.industries, ind.value];
                      onUpdate({ industries: next });
                    }}
                    className={`text-xs px-2 py-1.5 rounded text-left transition-colors ${selected ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                  >
                    {selected && <Check className="h-3 w-3 inline mr-1" />}
                    {ind.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout pool + notes */}
          <div className="space-y-3">
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Layout-Pool</Label>
              <Select value={item.layoutPool} onValueChange={(v) => onUpdate({ layoutPool: v })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUT_POOLS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Notizen (optional)</Label>
              <Textarea
                value={item.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="z.B. Besonders gutes Farbschema..."
                className="bg-gray-800 border-gray-600 text-white resize-none text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

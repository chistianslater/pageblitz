/**
 * TemplatesPage – Admin page for managing template images per industry pool.
 * Allows uploading screenshots of website templates to improve the AI generation pool.
 */
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Trash2, ImageIcon, Filter, Plus, X, Layers } from "lucide-react";

// Industry + layout pool options (must match server-side getLayoutStyle pools)
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
  { value: "elegant", label: "Elegant (Beauty/Spa)" },
  { value: "bold", label: "Bold (Handwerk/Bau)" },
  { value: "warm", label: "Warm (Restaurant/Café)" },
  { value: "clean", label: "Clean (Medizin/Beratung)" },
  { value: "dynamic", label: "Dynamic (Fitness/Sport)" },
  { value: "luxury", label: "Luxury (Premium/Auto)" },
  { value: "craft", label: "Craft (Handwerk/Industrial)" },
  { value: "fresh", label: "Fresh (Café/Wellness)" },
  { value: "trust", label: "Trust (Medizin/Legal)" },
  { value: "modern", label: "Modern (Tech/Startup)" },
  { value: "vibrant", label: "Vibrant (Fitness/Energie)" },
  { value: "natural", label: "Natural (Öko/Natur)" },
];

interface UploadForm {
  name: string;
  industry: string;
  layoutPool: string;
  notes: string;
}

export default function TemplatesPage() {
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [form, setForm] = useState<UploadForm>({ name: "", industry: "", layoutPool: "", notes: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: templates, refetch, isLoading } = trpc.templates.list.useQuery(
    filterIndustry !== "all" ? { industry: filterIndustry } : undefined
  );

  const uploadMutation = trpc.templates.upload.useMutation({
    onSuccess: () => {
      toast.success("Template erfolgreich hochgeladen!");
      setShowUploadForm(false);
      setForm({ name: "", industry: "", layoutPool: "", notes: "" });
      setPreviewImage(null);
      setImageData(null);
      refetch();
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => { toast.success("Template gelöscht"); refetch(); },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Nur Bilddateien erlaubt (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Datei zu groß (max. 10 MB)");
      return;
    }
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      setImageData(result);
    };
    reader.readAsDataURL(file);
    // Auto-fill name if empty
    if (!form.name) {
      setForm(f => ({ ...f, name: file.name.replace(/\.[^.]+$/, "") }));
    }
  }, [form.name]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error("Bitte einen Namen eingeben");
    if (!form.industry) return toast.error("Bitte eine Branche wählen");
    if (!form.layoutPool) return toast.error("Bitte einen Layout-Pool wählen");
    if (!imageData) return toast.error("Bitte ein Bild hochladen");
    uploadMutation.mutate({
      name: form.name,
      industry: form.industry,
      layoutPool: form.layoutPool,
      notes: form.notes || undefined,
      imageData,
      mimeType,
      fileName: `${form.name}.${mimeType.split("/")[1] || "jpg"}`,
    });
  };

  const industryLabel = (v: string) => INDUSTRIES.find(i => i.value === v)?.label ?? v;
  const poolLabel = (v: string) => LAYOUT_POOLS.find(p => p.value === v)?.label ?? v;

  const poolColors: Record<string, string> = {
    elegant: "bg-purple-500/20 text-purple-300",
    bold: "bg-orange-500/20 text-orange-300",
    warm: "bg-amber-500/20 text-amber-300",
    clean: "bg-blue-500/20 text-blue-300",
    dynamic: "bg-red-500/20 text-red-300",
    luxury: "bg-yellow-500/20 text-yellow-300",
    craft: "bg-stone-500/20 text-stone-300",
    fresh: "bg-green-500/20 text-green-300",
    trust: "bg-cyan-500/20 text-cyan-300",
    modern: "bg-indigo-500/20 text-indigo-300",
    vibrant: "bg-pink-500/20 text-pink-300",
    natural: "bg-emerald-500/20 text-emerald-300",
  };

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
            Lade eigene Template-Screenshots hoch, um den KI-Generator zu verbessern.
            Jede Branche hat einen Pool von Layouts – je mehr Referenzen, desto besser die Ergebnisse.
          </p>
        </div>
        <Button onClick={() => setShowUploadForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Template hochladen
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-white text-lg">Neues Template hochladen</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowUploadForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Left: Image upload */}
              <div className="space-y-3">
                <Label className="text-gray-300">Screenshot / Vorschaubild *</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg transition-colors cursor-pointer ${isDragging ? "border-blue-400 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"}`}
                  style={{ minHeight: "220px" }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewImage ? (
                    <div className="relative">
                      <img src={previewImage} alt="Preview" className="w-full rounded-lg object-cover" style={{ maxHeight: "300px" }} />
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(null); setImageData(null); }}
                        className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-gray-500">
                      <Upload className="h-10 w-10" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Bild hierher ziehen oder klicken</p>
                        <p className="text-xs mt-1">JPG, PNG, WebP – max. 10 MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                />
              </div>

              {/* Right: Metadata */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="z.B. Luxus-Friseur Berlin"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Branche *</Label>
                  <Select value={form.industry} onValueChange={(v) => setForm(f => ({ ...f, industry: v }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Branche wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Layout-Pool *</Label>
                  <Select value={form.layoutPool} onValueChange={(v) => setForm(f => ({ ...f, layoutPool: v }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Layout-Pool wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LAYOUT_POOLS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Der Layout-Pool bestimmt, welche Firmen dieses Template als Referenz erhalten.
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300 mb-1.5 block">Notizen (optional)</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="z.B. Besonders gutes Farbschema, gute Typografie..."
                    className="bg-gray-800 border-gray-600 text-white resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowUploadForm(false)}>Abbrechen</Button>
              <Button
                onClick={handleSubmit}
                disabled={uploadMutation.isPending || !imageData}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {uploadMutation.isPending ? (
                  <><span className="animate-spin">⟳</span> Wird hochgeladen...</>
                ) : (
                  <><Upload className="h-4 w-4" /> Template speichern</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">Filtern nach Branche:</span>
        <Select value={filterIndustry} onValueChange={setFilterIndustry}>
          <SelectTrigger className="w-52 bg-gray-800 border-gray-700 text-white h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Branchen</SelectItem>
            {INDUSTRIES.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {templates && (
          <span className="text-sm text-gray-500 ml-2">{templates.length} Template{templates.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Templates grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg animate-pulse" style={{ aspectRatio: "4/3" }} />
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-16 w-16 text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-400">Noch keine Templates</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-sm">
            Lade Screenshots von Website-Templates hoch, die als Referenz für die KI-Generierung genutzt werden.
          </p>
          <Button onClick={() => setShowUploadForm(true)} className="mt-6 gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Erstes Template hochladen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors">
              {/* Image */}
              <div className="relative" style={{ aspectRatio: "4/3" }}>
                <img
                  src={t.imageUrl}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Delete button on hover */}
                <button
                  onClick={() => {
                    if (confirm(`Template "${t.name}" wirklich löschen?`)) {
                      deleteMutation.mutate({ id: t.id });
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="text-sm font-medium text-white truncate" title={t.name}>{t.name}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-gray-700 text-gray-300">
                    {industryLabel(t.industry)}
                  </Badge>
                  <Badge className={`text-xs px-1.5 py-0 border-0 ${poolColors[t.layoutPool] || "bg-gray-600 text-gray-300"}`}>
                    {t.layoutPool}
                  </Badge>
                </div>
                {t.notes && (
                  <p className="text-xs text-gray-500 line-clamp-2">{t.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

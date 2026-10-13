import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { toast } from "sonner";

/**
 * Musterbild für den Template-Bau bei HeyMail.
 *
 * Im Editor braucht man eine Bildadresse, die bleibt — ein Motiv eines
 * echten Betriebs gehört zu dessen Karte und wird ersetzt, sobald dessen
 * Seite neu erzeugt wird. Das Muster liegt unter einer festen Adresse und
 * ändert sich nur, wenn man hier erneut drückt.
 */
export default function MusterMotiv({ layout }: { layout: "standard" | "screenshot" }) {
  const [url, setUrl] = useState<string | null>(null);
  const muster = trpc.postkarten.musterMotiv.useMutation();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed p-3">
      <div className="text-sm">
        <div className="font-medium">Musterbild fürs HeyMail-Template</div>
        <div className="text-muted-foreground">
          Feste Adresse zum Einsetzen in den Editor — steht für{" "}
          <code>{"{{bildUrl}}"}</code>.{" "}
          {layout === "screenshot"
            ? "Layout Screenshot: komplette Vorderseite 214 × 109 mm (DIN lang + 2 mm Beschnitt), 2528 × 1287 px bei 300 dpi, JPEG."
            : "Laptop-Mockup, 1760 × 1760 px (quadratisch, wie HeyMail es für dynamische Bilder verlangt), PNG mit durchsichtigem Hintergrund."}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={muster.isPending}
        onClick={async () => {
          try {
            const { bildUrl, betrieb } = await muster.mutateAsync({ layout });
            setUrl(bildUrl);
            toast.success(`Muster von ${betrieb} aufgenommen.`);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
          }
        }}
      >
        <Image className="h-4 w-4" />
        {muster.isPending ? "nimmt auf …" : "Musterbild erzeugen"}
      </Button>
      {url && (
        <a
          className="font-mono text-xs underline"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          {url}
        </a>
      )}
    </div>
  );
}


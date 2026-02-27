import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft, Upload, Check } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  fields: { name: string; label: string; type: "text" | "textarea" | "number" | "file" | "checkbox" }[];
}

const STEPS: OnboardingStep[] = [
  {
    title: "Willkommen!",
    description: "Deine Website ist bereit. Jetzt personalisieren wir sie mit deinen echten Daten.",
    fields: [],
  },
  {
    title: "Unternehmensinfos",
    description: "Grundlegende Informationen über dein Unternehmen",
    fields: [
      { name: "businessName", label: "Unternehmensname", type: "text" },
      { name: "tagline", label: "Tagline / Slogan", type: "text" },
      { name: "description", label: "Kurzbeschreibung", type: "textarea" },
      { name: "foundedYear", label: "Gründungsjahr", type: "number" },
      { name: "teamSize", label: "Teamgröße", type: "text" },
    ],
  },
  {
    title: "Alleinstellungsmerkmal",
    description: "Was macht dein Unternehmen einzigartig?",
    fields: [
      { name: "usp", label: "Dein Alleinstellungsmerkmal (USP)", type: "textarea" },
      { name: "targetAudience", label: "Zielgruppe", type: "textarea" },
    ],
  },
  {
    title: "Top-Leistungen",
    description: "Deine 3 wichtigsten Services/Produkte",
    fields: [
      { name: "topServices", label: "Top Services (kommagetrennt)", type: "textarea" },
    ],
  },
  {
    title: "Logo hochladen",
    description: "Lade dein Unternehmenslogo hoch (PNG/SVG, max 2MB)",
    fields: [
      { name: "logoUrl", label: "Logo", type: "file" },
    ],
  },
  {
    title: "Fotos hochladen",
    description: "Lade bis zu 5 Fotos hoch (ersetzen Unsplash-Bilder)",
    fields: [
      { name: "photoUrls", label: "Fotos", type: "file" },
    ],
  },
  {
    title: "Rechtliche Daten",
    description: "Impressum und Datenschutz werden mit diesen Daten generiert",
    fields: [
      { name: "legalOwner", label: "Inhaber / Geschäftsführer", type: "text" },
      { name: "legalStreet", label: "Straße und Hausnummer", type: "text" },
      { name: "legalZip", label: "PLZ", type: "text" },
      { name: "legalCity", label: "Stadt", type: "text" },
      { name: "legalEmail", label: "E-Mail", type: "text" },
      { name: "legalPhone", label: "Telefon", type: "text" },
      { name: "legalVatId", label: "USt-IdNr. (optional)", type: "text" },
    ],
  },
  {
    title: "Add-ons",
    description: "Wähle optionale Features",
    fields: [
      { name: "addOnContactForm", label: "Kontaktformular (+0€)", type: "checkbox" },
      { name: "addOnGallery", label: "Bildergalerie (+4,90€/Monat)", type: "checkbox" },
    ],
  },
  {
    title: "Fertig!",
    description: "Deine Website wird jetzt aktualisiert...",
    fields: [],
  },
];

export default function OnboardingWizard({ websiteId }: { websiteId: number }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const saveStepMutation = trpc.onboarding.saveStep.useMutation();
  const completeMutation = trpc.onboarding.complete.useMutation();

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await saveStepMutation.mutateAsync({
        websiteId,
        step: currentStep,
        data: formData,
      });
      
      if (currentStep === STEPS.length - 1) {
        await completeMutation.mutateAsync({ websiteId });
        window.location.href = `/websites/${websiteId}`;
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error saving step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Onboarding</h1>
            <span className="text-sm text-slate-600">
              Schritt {currentStep + 1} von {STEPS.length}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{step.title}</CardTitle>
            <CardDescription className="text-base">{step.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="space-y-4 text-center py-8">
                <p className="text-lg text-slate-700">
                  Deine Website wurde erfolgreich generiert! Jetzt personalisieren wir sie mit deinen echten Daten.
                </p>
                <p className="text-slate-600">
                  Beantworte ein paar Fragen und lade dein Logo & Fotos hoch.
                </p>
              </div>
            )}

            {/* Step 8: Complete */}
            {currentStep === STEPS.length - 1 && (
              <div className="space-y-4 text-center py-8">
                <Check className="w-16 h-16 text-green-600 mx-auto" />
                <p className="text-lg text-slate-700">
                  Deine Website wird jetzt aktualisiert und aktiviert...
                </p>
              </div>
            )}

            {/* Regular Steps */}
            {currentStep > 0 && currentStep < STEPS.length - 1 && (
              <div className="space-y-6">
                {step.fields.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name} className="text-base font-medium">
                      {field.label}
                    </Label>
                    {field.type === "text" && (
                      <Input
                        id={field.name}
                        type="text"
                        placeholder={field.label}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="mt-2"
                      />
                    )}
                    {field.type === "number" && (
                      <Input
                        id={field.name}
                        type="number"
                        placeholder={field.label}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
                        className="mt-2"
                      />
                    )}
                    {field.type === "textarea" && (
                      <Textarea
                        id={field.name}
                        placeholder={field.label}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="mt-2 min-h-24"
                      />
                    )}
                    {field.type === "file" && (
                      <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">Datei hierher ziehen oder klicken</p>
                      </div>
                    )}
                    {field.type === "checkbox" && (
                      <div className="mt-2 flex items-center">
                        <input
                          id={field.name}
                          type="checkbox"
                          checked={formData[field.name] || false}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <label htmlFor={field.name} className="ml-2 text-sm text-slate-700">
                          {field.label}
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0 || isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Zurück
              </Button>
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="ml-auto flex items-center gap-2"
              >
                {currentStep === STEPS.length - 1 ? "Fertig" : "Weiter"}
                {currentStep < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

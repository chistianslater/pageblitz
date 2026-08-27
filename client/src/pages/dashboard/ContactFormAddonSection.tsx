import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, Loader2, Mail, Plus, Trash2 } from "lucide-react";
import type { ContactFormConfig } from "@shared/siteContract/types";

interface ContactFormAddonSectionProps {
  websiteId: number;
  website: any;
  businessEmail?: string | null;
  onUpdate: () => void;
  purchasedAddOns: Record<string, boolean>;
}

type CustomFieldDraft = {
  id: string;
  label: string;
  required: boolean;
};

function fieldIdFromLabel(label: string, used: Set<string>): string {
  const slug = label
    .toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[m] || m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  let base = /^[a-z]/.test(slug) ? slug : `feld-${slug || "extra"}`;
  let next = base;
  let i = 2;
  while (used.has(next)) {
    next = `${base.slice(0, 36)}-${i}`;
    i += 1;
  }
  used.add(next);
  return next;
}

function readConfig(website: any): ContactFormConfig {
  const data = website?.websiteData as {
    contactFormConfig?: ContactFormConfig;
  };
  return data?.contactFormConfig ?? {};
}

/** Kontaktformular: Empfänger, Felder, Labels — Dashboard, nicht Studio. */
export function ContactFormAddonSection({
  websiteId,
  website,
  businessEmail,
  onUpdate,
  purchasedAddOns,
}: ContactFormAddonSectionProps) {
  const stored = useMemo(() => readConfig(website), [website]);
  const [enabled, setEnabled] = useState(
    !!(website?.websiteData as { features?: { contactForm?: boolean } })
      ?.features?.contactForm
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isPurchased = !!purchasedAddOns["contactForm"];

  const [recipient, setRecipient] = useState(
    (website?.contactEmail as string | null | undefined) ?? ""
  );
  const [nameLabel, setNameLabel] = useState(stored.nameLabel ?? "");
  const [emailLabel, setEmailLabel] = useState(stored.emailLabel ?? "");
  const [messageLabel, setMessageLabel] = useState(stored.messageLabel ?? "");
  const [submitLabel, setSubmitLabel] = useState(stored.submitLabel ?? "");
  const [successMessage, setSuccessMessage] = useState(
    stored.successMessage ?? ""
  );
  const [phoneEnabled, setPhoneEnabled] = useState(
    stored.phoneEnabled !== false
  );
  const [phoneRequired, setPhoneRequired] = useState(!!stored.phoneRequired);
  const [phoneLabel, setPhoneLabel] = useState(stored.phoneLabel ?? "");
  const [customFields, setCustomFields] = useState<CustomFieldDraft[]>(
    (stored.customFields ?? []).map(field => ({
      id: field.id,
      label: field.label,
      required: !!field.required,
    }))
  );

  const purchaseAddonMutation = trpc.customer.purchaseAddon.useMutation({
    onSuccess: () => {
      setConfirmOpen(false);
      setSaving(false);
      setEnabled(true);
      onUpdate();
      toast.success("Kontaktformular freigeschaltet!");
    },
    onError: (e: any) => {
      setSaving(false);
      toast.error("Fehler: " + e.message);
    },
  });

  const updateAddons = trpc.customer.updateAddons.useMutation({
    onError: () => toast.error("Speichern fehlgeschlagen"),
  });
  const updateEmail = trpc.customer.updateContactEmail.useMutation();
  const updateConfig = trpc.customer.updateContactFormConfig.useMutation();

  const handleToggle = () => {
    if (!isPurchased) {
      setConfirmOpen(true);
      return;
    }
    const next = !enabled;
    setEnabled(next);
    updateAddons.mutate(
      { websiteId, addOns: { contactForm: next } },
      { onSuccess: () => onUpdate() }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const used = new Set<string>();
    const config: ContactFormConfig = {
      nameLabel: nameLabel.trim() || undefined,
      emailLabel: emailLabel.trim() || undefined,
      messageLabel: messageLabel.trim() || undefined,
      submitLabel: submitLabel.trim() || undefined,
      successMessage: successMessage.trim() || undefined,
      phoneEnabled,
      phoneRequired: phoneEnabled ? phoneRequired : false,
      phoneLabel: phoneEnabled ? phoneLabel.trim() || undefined : undefined,
      customFields: customFields
        .filter(field => field.label.trim())
        .slice(0, 3)
        .map(field => ({
          id: fieldIdFromLabel(field.label, used),
          label: field.label.trim(),
          required: field.required || undefined,
        })),
    };
    try {
      await Promise.all([
        updateEmail.mutateAsync({
          websiteId,
          contactEmail: recipient.trim(),
        }),
        updateConfig.mutateAsync({ websiteId, config }),
      ]);
      onUpdate();
      toast.success("Formular gespeichert");
    } catch (e: any) {
      toast.error(e?.message || "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-lp-line bg-lp-surface p-5">
        <h2 className="mb-5 flex items-center gap-2 font-semibold text-lp-ink">
          <Mail className="h-4 w-4 text-lp-accent" />
          Kontaktformular
          <span className="ml-auto rounded-full border border-lp-line bg-lp-canvas px-2 py-0.5 text-xs text-lp-muted">
            +3,90 €/Monat
          </span>
        </h2>

        {!isPurchased ? (
          <div className="space-y-4">
            <div className="space-y-1.5 text-xs text-lp-muted">
              {[
                "Anfragen landen im Tab Anfragen und per E-Mail bei dir",
                "Empfänger, Felder und Texte frei einstellbar",
                "Bis zu drei eigene Felder (z. B. Firma, Anlass)",
              ].map(f => (
                <div key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-lp-accent">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="w-full rounded-xl bg-lp-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-lp-accent/90"
            >
              Für 3,90 €/Monat freischalten
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              className={`rounded-xl border p-4 ${
                enabled
                  ? "border-lp-accent/30 bg-lp-accent/5"
                  : "border-lp-line bg-lp-canvas"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-lp-ink">
                    Formular auf der Website zeigen
                  </div>
                  <div className="mt-0.5 text-xs text-lp-muted">
                    Besucher können dir direkt schreiben
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    enabled ? "bg-lp-accent" : "bg-lp-line"
                  }`}
                  aria-pressed={enabled}
                  aria-label="Kontaktformular aktivieren"
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                    style={{ left: enabled ? "22px" : "2px" }}
                  />
                </button>
              </div>
            </div>

            {enabled && (
              <>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-lp-ink">
                    Empfänger
                  </h3>
                  <label className="block text-xs font-medium text-lp-muted">
                    Anfragen gehen an diese E-Mail
                    <input
                      type="email"
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      placeholder={businessEmail || "du@beispiel.de"}
                      className="mt-1.5 w-full rounded-lg border border-lp-line bg-lp-canvas px-3 py-2 text-sm text-lp-ink outline-none placeholder:text-lp-muted focus:border-lp-accent"
                    />
                  </label>
                  <p className="text-xs text-lp-muted">
                    Leer lassen, um die Geschäfts-E-Mail
                    {businessEmail ? ` (${businessEmail})` : ""} zu nutzen.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-lp-ink">Felder</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-lp-muted">
                      Name
                      <input
                        type="text"
                        value={nameLabel}
                        onChange={e => setNameLabel(e.target.value)}
                        placeholder="Name"
                        maxLength={80}
                        className="mt-1.5 w-full rounded-lg border border-lp-line bg-lp-canvas px-3 py-2 text-sm text-lp-ink outline-none focus:border-lp-accent"
                      />
                    </label>
                    <label className="block text-xs font-medium text-lp-muted">
                      E-Mail
                      <input
                        type="text"
                        value={emailLabel}
                        onChange={e => setEmailLabel(e.target.value)}
                        placeholder="E-Mail"
                        maxLength={80}
                        className="mt-1.5 w-full rounded-lg border border-lp-line bg-lp-canvas px-3 py-2 text-sm text-lp-ink outline-none focus:border-lp-accent"
                      />
                    </label>
                    <label className="block text-xs font-medium text-lp-muted sm:col-span-2">
                      Nachricht
                      <input
                        type="text"
                        value={messageLabel}
                        onChange={e => setMessageLabel(e.target.value)}
                        placeholder="Nachricht"
                        maxLength={80}
                        className="mt-1.5 w-full rounded-lg border border-lp-line bg-lp-canvas px-3 py-2 text-sm text-lp-ink outline-none focus:border-lp-accent"
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border border-lp-line bg-lp-canvas p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-lp-ink">
                          Telefonfeld
                        </div>
                        <div className="text-xs text-lp-muted">
                          Optional oder Pflicht
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhoneEnabled(v => !v)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          phoneEnabled ? "bg-lp-accent" : "bg-lp-line"
                        }`}
                        aria-pressed={phoneEnabled}
                        aria-label="Telefonfeld anzeigen"
                      >
                        <span
                          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                          style={{ left: phoneEnabled ? "22px" : "2px" }}
                        />
                      </button>
                    </div>
                    {phoneEnabled && (
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-medium text-lp-muted">
                          Bezeichnung
                          <input
                            type="text"
                            value={phoneLabel}
                            onChange={e => setPhoneLabel(e.target.value)}
                            placeholder="Telefon (optional)"
                            maxLength={80}
                            className="mt-1.5 w-full rounded-lg border border-lp-line bg-lp-surface px-3 py-2 text-sm text-lp-ink outline-none focus:border-lp-accent"
                          />
                        </label>
                        <label className="flex items-center gap-2 pt-6 text-sm text-lp-ink">
                          <input
                            type="checkbox"
                            checked={phoneRequired}
                            onChange={e => setPhoneRequired(e.target.checked)}
                            className="h-4 w-4 accent-lp-accent"
                          />
                          Pflichtfeld
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-lp-ink">
                        Eigene Felder
                      </h4>
                      <button
                        type="button"
                        disabled={customFields.length >= 3}
                        onClick={() =>
                          setCustomFields(prev => [
                            ...prev,
                            {
                              id: `feld-${prev.length + 1}`,
                              label: "",
                              required: false,
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-lp-accent disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Feld hinzufügen
                      </button>
                    </div>
                    {customFields.length === 0 && (
                      <p className="text-xs text-lp-muted">
                        z. B. Firma, Anlass oder Wunschtermin — maximal drei.
                      </p>
                    )}
                    {customFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 rounded-xl border border-lp-line bg-lp-canvas p-2.5"
                      >
                        <input
                          type="text"
                          value={field.label}
                          onChange={e =>
                            setCustomFields(prev =>
                              prev.map((item, i) =>
                                i === index
                                  ? { ...item, label: e.target.value }
                                  : item
                              )
                            )
                          }
                          placeholder="Feldbezeichnung"
                          maxLength={80}
                          className="min-w-0 flex-1 rounded-lg border border-lp-line bg-lp-surface px-3 py-2 text-sm text-lp-ink outline-none focus:border-lp-accent"
                        />
                        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-lp-muted">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={e =>
                              setCustomFields(prev =>
                                prev.map((item, i) =>
                                  i === index
                                    ? { ...item, required: e.target.checked }
                                    : item
                                )
                              )
                            }
                            className="h-4 w-4 accent-lp-accent"
                          />
                          Pflicht
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFields(prev =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="rounded-lg p-2 text-lp-muted hover:bg-lp-surface hover:text-lp-warn"
                          aria-label="Feld entfernen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-lp-muted">
                    Button-Text
                    <input
                      type="text"
                      value={submitLabel}
                      onChange={e => setSubmitLabel(e.target.value)}
                      placeholder="Nachricht senden"
                      maxLength={80}
                      className="mt-1.5 w-full rounded-lg border border-lp-line bg-lp-canvas px-3 py-2 text-sm text-lp-ink outline-none focus:border-lp-accent"
                    />
                  </label>
                  <label className="block text-xs font-medium text-lp-muted sm:col-span-2">
                    Danke-Text nach dem Senden
                    <input
                      type="text"
                      value={successMessage}
                      onChange={e => setSuccessMessage(e.target.value)}
                      placeholder="Danke — wir melden uns zeitnah."
                      maxLength={240}
                      className="mt-1.5 w-full rounded-lg border border-lp-line bg-lp-canvas px-3 py-2 text-sm text-lp-ink outline-none focus:border-lp-accent"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-lp-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lp-accent/90 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Formular speichern
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-lp-ink/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-lp-line bg-lp-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-lp-accent/10 text-lg">
                ✉️
              </div>
              <div>
                <h3 className="font-semibold text-lp-ink">
                  Add-on freischalten
                </h3>
                <p className="text-sm font-medium text-lp-accent">
                  Kontaktformular
                </p>
              </div>
            </div>
            <p className="mb-1 text-sm leading-relaxed text-lp-ink">
              <span className="font-semibold">+3,90 €/Monat</span> werden ab
              sofort anteilig deinem Abo hinzugefügt.
            </p>
            <p className="mb-6 text-xs leading-relaxed text-lp-muted">
              Du kannst das Add-on jederzeit über das Kundenportal wieder
              kündigen.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 rounded-xl border border-lp-line py-2.5 text-sm font-medium text-lp-ink transition-colors hover:bg-lp-canvas disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaving(true);
                  purchaseAddonMutation.mutate({
                    websiteId,
                    addonKey: "contactForm",
                  });
                }}
                disabled={purchaseAddonMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lp-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-lp-accent/90 disabled:opacity-50"
              >
                {purchaseAddonMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Wird gebucht…
                  </>
                ) : (
                  "Jetzt freischalten"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

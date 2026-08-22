import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import {
  LegalPatchSchema,
  type LegalPatch,
} from "@shared/onboardingV2/patches";
import type { StudioLegal } from "../../../../../server/onboardingV2/state";
import { PanelFrame } from "./PanelFrame";

interface TextFieldConfig {
  name:
    | "legalOwner"
    | "legalStreet"
    | "legalZip"
    | "legalCity"
    | "legalEmail"
    | "legalPhone"
    | "legalVatId";
  label: string;
  type: string;
}

const FIELDS: TextFieldConfig[] = [
  { name: "legalOwner", label: "Inhaber/Firma", type: "text" },
  { name: "legalStreet", label: "Straße und Hausnummer", type: "text" },
  { name: "legalZip", label: "PLZ", type: "text" },
  { name: "legalCity", label: "Ort", type: "text" },
  { name: "legalEmail", label: "E-Mail (für das Impressum)", type: "email" },
  { name: "legalPhone", label: "Telefon", type: "tel" },
  { name: "legalVatId", label: "USt-IdNr. (optional)", type: "text" },
];

interface LegalPanelProps {
  token: string;
  initial: StudioLegal;
  openingHours: { day: string; hours: string }[];
  onApplied: () => void;
  onClose: () => void;
}

/**
 * Rechtliches-Panel: Pflichtangaben für Impressum/Datenschutz + optionale
 * Öffnungszeiten als Zeilenliste. Validiert clientseitig mit demselben
 * Zod-Schema wie der Server (`LegalPatchSchema`), damit Fehler vor dem
 * Request sichtbar werden statt erst nach einem fehlgeschlagenen Save.
 */
export function LegalPanel({
  token,
  initial,
  openingHours,
  onApplied,
  onClose,
}: LegalPanelProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LegalPatch>({
    resolver: zodResolver(LegalPatchSchema),
    defaultValues: { ...initial, openingHours },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "openingHours",
  });

  const updateLegal = trpc.onboardingV2.updateLegal.useMutation();
  const busy = updateLegal.isPending;

  const submit = handleSubmit(values => {
    updateLegal.mutate({ token, legal: values }, { onSuccess: onApplied });
  });

  return (
    <PanelFrame
      step="Schritt 5"
      title="Rechtliches"
      intro="Pflichtangaben für Impressum und Datenschutz — beides wird daraus automatisch erzeugt."
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onClose}
          >
            Fertig
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            disabled={busy}
            onClick={submit}
          >
            {busy ? "Bitte warten…" : "Speichern"}
          </button>
        </>
      }
    >
      <div className="pb-studio-rows">
        {FIELDS.map(field => {
          const fieldId = `pb-legal-${field.name}`;
          const error = errors[field.name];
          return (
            <div className="pb-studio-field" key={field.name}>
              <label htmlFor={fieldId}>{field.label}</label>
              <input
                id={fieldId}
                type={field.type}
                className="pb-studio-input"
                aria-invalid={!!error}
                {...register(field.name)}
              />
              {error && (
                <p role="alert" style={{ color: "var(--st-warn)" }}>
                  {error.message}
                </p>
              )}
            </div>
          );
        })}
        <div className="pb-studio-field">
          <span>Öffnungszeiten (optional)</span>
          {fields.map((field, i) => (
            <div className="pb-studio-row" key={field.id}>
              <input
                aria-label="Tag"
                type="text"
                className="pb-studio-input"
                placeholder="z. B. Mo–Fr"
                {...register(`openingHours.${i}.day` as const)}
              />
              <input
                aria-label="Uhrzeiten"
                type="text"
                className="pb-studio-input"
                placeholder="z. B. 9–18 Uhr"
                {...register(`openingHours.${i}.hours` as const)}
              />
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                onClick={() => remove(i)}
              >
                Entfernen
              </button>
            </div>
          ))}
          {errors.openingHours && (
            <p role="alert" style={{ color: "var(--st-warn)" }}>
              Bitte jede Zeile ausfüllen oder entfernen.
            </p>
          )}
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            disabled={fields.length >= 14}
            onClick={() => append({ day: "", hours: "" })}
          >
            + Zeile
          </button>
        </div>
      </div>
      {updateLegal.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateLegal.error.message}
        </p>
      )}
    </PanelFrame>
  );
}

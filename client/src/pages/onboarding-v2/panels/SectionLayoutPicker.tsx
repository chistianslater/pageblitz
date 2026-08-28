import React, { useId } from "react";
import type { DesignProfile } from "@shared/siteContract/designProfile";
import { LAYOUT_FIELDS, type LayoutField } from "./layoutOptions";

interface SectionLayoutPickerProps<T extends string> {
  label: string;
  hint?: string;
  options: readonly { value: T; label: string }[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
}

/** Segmented Control für eine Layout-Variante — sofort sichtbar, kein verstecktes Select. */
export function SectionLayoutPicker<T extends string>({
  label,
  hint,
  options,
  value,
  disabled,
  onChange,
}: SectionLayoutPickerProps<T>) {
  const labelId = useId();
  return (
    <div className="pb-studio-section-layout">
      <p className="pb-studio-section-layout-label" id={labelId}>
        {label}
      </p>
      {hint ? (
        <p className="pb-studio-section-layout-hint">{hint}</p>
      ) : null}
      <div
        className="pb-studio-seg pb-studio-seg--fill"
        role="group"
        aria-labelledby={labelId}
      >
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            disabled={disabled}
            onClick={() => {
              if (option.value !== value) onChange(option.value);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DesignProfileLayoutPickerProps<K extends LayoutField> {
  field: K;
  profile: DesignProfile;
  busy?: boolean;
  onPick: (key: K, value: DesignProfile[K]) => void;
}

/** Profilfeld + Labels aus `LAYOUT_FIELDS` — eine Stelle für Copy und Optionen. */
export function DesignProfileLayoutPicker<K extends LayoutField>({
  field,
  profile,
  busy,
  onPick,
}: DesignProfileLayoutPickerProps<K>) {
  const meta = LAYOUT_FIELDS[field] as {
    label: string;
    hint: string;
    options: readonly { value: DesignProfile[K]; label: string }[];
  };
  return (
    <SectionLayoutPicker
      label={meta.label}
      hint={meta.hint}
      options={meta.options}
      value={profile[field]}
      disabled={busy}
      onChange={value => onPick(field, value)}
    />
  );
}

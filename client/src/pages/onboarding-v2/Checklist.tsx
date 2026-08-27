import React from "react";
import type {
  ChecklistItem,
  ChecklistItemId,
} from "@shared/onboardingV2/checklist";
import { ADDON_EDITORS } from "@shared/onboardingV2/addonEditors";
import {
  ADDON_NAMES,
  type AddOnKey,
} from "@shared/pricing";

interface ChecklistProps {
  items: ChecklistItem[];
  activeId: ChecklistItemId | null;
  onSelect: (id: ChecklistItemId) => void;
  activeAddOns?: AddOnKey[];
  onSelectAddOn?: (key: AddOnKey) => void;
  extraFocus?: AddOnKey | null;
  extraDone?: Partial<Record<AddOnKey, boolean>>;
}

export function Checklist({
  items,
  activeId,
  onSelect,
  activeAddOns = [],
  onSelectAddOn,
  extraFocus = null,
  extraDone = {},
}: ChecklistProps) {
  return (
    <ol className="pb-studio-check" aria-label="Checkliste">
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            id={`pb-checklist-${item.id}`}
            className="pb-studio-check-item"
            data-status={item.status}
            aria-current={
              extraFocus == null && activeId === item.id ? "step" : undefined
            }
            onClick={() => onSelect(item.id)}
          >
            <span className="pb-studio-check-num" aria-hidden="true">
              {item.status === "done"
                ? "✓"
                : String(index + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="pb-studio-check-title">{item.title}</span>
              <span className="pb-studio-check-hint">{item.hint}</span>
            </span>
            <span className="pb-studio-check-flag">
              {item.status === "done"
                ? "Erledigt"
                : item.required
                  ? "Pflicht"
                  : "Optional"}
            </span>
          </button>
          {item.id === "addons" && activeAddOns.length > 0 && (
            <ul className="pb-studio-addon-steps" aria-label="Aktive Extras">
              {activeAddOns.map(key => {
                const done = extraDone[key] === true;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      title={ADDON_EDITORS[key].hint}
                      aria-current={extraFocus === key ? "step" : undefined}
                      onClick={() => onSelectAddOn?.(key)}
                    >
                      <span aria-hidden="true">↳</span>
                      <span>
                        <span className="pb-studio-check-title">
                          {ADDON_NAMES[key]}
                        </span>
                        <span className="pb-studio-check-hint">
                          {ADDON_EDITORS[key].hint}
                        </span>
                      </span>
                      <small>{done ? "Erledigt" : "Bearbeiten"}</small>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

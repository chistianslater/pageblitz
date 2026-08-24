import React from "react";
import type {
  ChecklistItem,
  ChecklistItemId,
} from "@shared/onboardingV2/checklist";

interface ChecklistProps {
  items: ChecklistItem[];
  activeId: ChecklistItemId | null;
  onSelect: (id: ChecklistItemId) => void;
}

export function Checklist({ items, activeId, onSelect }: ChecklistProps) {
  return (
    <ol className="pb-studio-check" aria-label="Checkliste">
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            id={`pb-checklist-${item.id}`}
            className="pb-studio-check-item"
            data-status={item.status}
            aria-current={activeId === item.id ? "step" : undefined}
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
        </li>
      ))}
    </ol>
  );
}

import React from "react";
import { Undo2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { undoButtonState } from "./panels/versionsLogic";

/**
 * Verlauf (2026-09-03): „Rückgängig" in der Vorschau-Leiste — holt den
 * vorletzten Stand zurück (onboardingV2.undoLast). Der Schritt wird selbst
 * ein Stand, ein zweites „Rückgängig" wirkt damit als Wiederholen. Die
 * Liste kommt aus derselben Query wie das Verlaufs-Panel (StudioPage
 * invalidiert sie nach jeder Vorschau-Aktualisierung).
 */
export function UndoButton({
  token,
  onApplied,
}: {
  token: string;
  onApplied: () => void;
}) {
  const list = trpc.onboardingV2.listVersions.useQuery({ token });
  const undo = trpc.onboardingV2.undoLast.useMutation();
  const state = undoButtonState(list.data?.versions ?? []);
  return (
    <button
      type="button"
      className="pb-studio-btn pb-studio-undo"
      data-variant="ghost"
      disabled={!state.enabled || undo.isPending}
      title={state.title}
      onClick={() =>
        undo.mutate(
          { token },
          {
            onSuccess: () => {
              void list.refetch();
              onApplied();
            },
          }
        )
      }
    >
      <Undo2 aria-hidden="true" />
      {undo.isPending ? "Wird zurückgeholt …" : state.text}
    </button>
  );
}

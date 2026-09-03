import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { applyGoal, GOAL_KEYS, GOALS } from "../../shared/onboardingV2/goal";
import { loadStudioWebsite } from "./ownership";
import {
  buildState,
  mergeStudioProgress,
  persistDoc,
  requireDoc,
  tokenInput,
} from "./state";

/**
 * Ziel der Website (2026-09-03): einmalige Frage nach dem Design-Gate
 * (GoalStep) und Änderung im Extras-Panel. `updateGoal` schreibt Ziel +
 * Hero-Button (applyGoal) und markiert die Frage als gestellt; `skipGoal`
 * setzt nur das Flag, damit die Karte nicht wiederkommt.
 */
export const goalProcedures = {
  updateGoal: publicProcedure
    .input(tokenInput.extend({ goal: z.enum(GOAL_KEYS) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      return persistDoc(
        input.token,
        loaded,
        applyGoal(doc, input.goal),
        { trigger: "panel", label: `Ziel: ${GOALS[input.goal].label}` },
        { progress: { goalAsked: true } }
      );
    }),

  skipGoal: publicProcedure
    .input(tokenInput)
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const progress = await mergeStudioProgress(loaded.website.id, {
        goalAsked: true,
      });
      return buildState(input.token, loaded, progress);
    }),
};

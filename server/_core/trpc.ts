import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import "@shared/zodLocale";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { TrpcContext } from "./context";

/**
 * Baut aus den (dank shared/zodLocale bereits deutschen) zod-Issues eine
 * lesbare Fehlermeldung für den Client (Finding I2). Ohne diesen Override
 * würde tRPC bei einem Input-Parse-Fehler `error.message` unverändert
 * durchreichen — das ist bei zod v4 der JSON-stringifizierte Issues-Array
 * (inkl. Klammern/Anführungszeichen), keine für Endnutzer lesbare Meldung.
 */
export function formatZodTrpcMessage(error: ZodError): string {
  return error.issues.map(issue => issue.message).join(" ");
}

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        message: formatZodTrpcMessage(error.cause),
      };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);

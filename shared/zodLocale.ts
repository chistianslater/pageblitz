import { z } from "zod";

/**
 * Aktiviert die deutsche Fehlermeldungs-Locale global für alle zod-Schemas
 * (Finding I2). Muss importiert sein, bevor irgendein Schema validiert —
 * z.config wirkt global und rückwirkend für den gesamten Prozess, ein später
 * Import würde bereits gelaufene Validierungen mit der englischen
 * Default-Locale zurücklassen. Importiert von: server/_core/index.ts,
 * server/_core/trpc.ts und — seit B6 Task 8 statt client/src/main.tsx —
 * shared/siteContract/schema.ts (dem gemeinsamen Ursprung aller Client-
 * Schemas; so bleibt zod aus dem Entry-Chunk von "/" heraus).
 */
z.config(z.locales.de());

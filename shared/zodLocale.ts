import { z } from "zod";

/**
 * Aktiviert die deutsche Fehlermeldungs-Locale global für alle zod-Schemas
 * (Finding I2). Muss ganz oben in jedem Einstiegspunkt importiert werden
 * (server/_core/index.ts, client/src/main.tsx), bevor irgendein Schema
 * validiert — z.config wirkt global und rückwirkend für den gesamten
 * Prozess, ein später Import würde bereits gelaufene Validierungen mit der
 * englischen Default-Locale zurücklassen.
 */
z.config(z.locales.de());

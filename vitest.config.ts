import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    /**
     * Platzhalter-Schluessel fuer den Testlauf: server/routers.ts zieht ueber
     * onboardingV2/checkout.ts einen Stripe-Client, dessen Konstruktor ohne
     * Schluessel wirft. Ohne das brachen server/pageblitz.test.ts und
     * server/auth.logout.test.ts schon beim Einlesen ab — mit "0 test" im
     * Bericht, also lautlos. Der Wert ist erfunden und erreicht Stripe nie;
     * die Tests rufen keine API.
     */
    env: { STRIPE_SECRET_KEY: "sk_test_placeholder_fuer_tests" },
    include: [
      "server/**/*.test.ts",
      "server/**/*.test.tsx",
      "server/**/*.spec.ts",
      "shared/**/*.test.ts",
      "shared/**/*.test.tsx",
      "shared/**/*.spec.ts",
      "client/**/*.test.ts",
      "client/**/*.test.tsx",
    ],
  },
});

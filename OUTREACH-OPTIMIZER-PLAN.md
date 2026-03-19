# Outreach Auto-Optimizer — Implementierungsplan

## Ziel

Autonomer Experiment-Loop, der E-Mail-Copy automatisch verbessert, basierend auf messbaren Metriken (Open Rate, Reply Rate). Claude generiert Challenger-Varianten, der Orchestrator deployed A/B-Splits und wertet aus.

---

## Ist-Stand (Pageblitz-Codebase)

```
drizzle/schema.ts          → outreach_emails Tabelle (id, businessId, recipientEmail, subject, body, status, sentAt)
server/routers.ts          → outreach Router (send, list, count)
server/db.ts               → createOutreachEmail, listOutreachEmails, countOutreachEmails
server/_core/env.ts        → RESEND_API_KEY, RESEND_FROM_EMAIL bereits vorhanden
```

**Status-Enum in DB:** `draft | sent | opened | replied | bounced`
→ `opened` und `replied` sind bereits im Schema — müssen nur befüllt werden.

---

## Was fehlt (zu bauen)

### 1. DB-Migration — `variant`-Spalte + Experiments-Tabelle

**Datei:** `drizzle/schema.ts`

```ts
// In outreachEmails Tabelle hinzufügen:
variant: varchar("variant", { length: 100 }).default("baseline"),
resendEmailId: varchar("resendEmailId", { length: 255 }), // für Webhook-Mapping

// Neue Tabelle:
export const outreachExperiments = mysqlTable("outreach_experiments", {
  id: int("id").autoincrement().primaryKey(),
  baselineVariant: varchar("baselineVariant", { length: 100 }).notNull(),
  challengerVariant: varchar("challengerVariant", { length: 100 }).notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  winner: varchar("winner", { length: 100 }),
  status: mysqlEnum("status", ["running", "completed", "aborted"]).default("running").notNull(),
  hypothesis: text("hypothesis"), // Was Claude erwartet hat
  baselineSends: int("baselineSends").default(0),
  challengerSends: int("challengerSends").default(0),
  baselineOpens: int("baselineOpens").default(0),
  challengerOpens: int("challengerOpens").default(0),
  baselineReplies: int("baselineReplies").default(0),
  challengerReplies: int("challengerReplies").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

**Migration ausführen:** `npx drizzle-kit push` (oder Migration-Datei generieren)

---

### 2. Resend Webhook-Endpunkt

**Datei:** `server/routers.ts` (neuer public Endpunkt, kein Auth)

**Resend-Events die ankommen:**
- `email.opened` → `status = "opened"` setzen
- `email.clicked` → optional, auch als "opened" werten
- `email.bounced` → `status = "bounced"` setzen

```ts
// In routers.ts — als Express-Route AUSSERHALB des tRPC-Routers:
app.post("/api/webhooks/resend", express.json(), async (req, res) => {
  const { type, data } = req.body;
  // Optional: Resend Webhook-Signatur validieren mit RESEND_WEBHOOK_SECRET

  if (type === "email.opened" || type === "email.clicked") {
    await db.update(outreachEmails)
      .set({ status: "opened" })
      .where(eq(outreachEmails.resendEmailId, data.email_id));
  }
  if (type === "email.bounced") {
    await db.update(outreachEmails)
      .set({ status: "bounced" })
      .where(eq(outreachEmails.resendEmailId, data.email_id));
  }

  res.json({ ok: true });
});
```

**In Resend Dashboard konfigurieren:**
- Webhook-URL: `https://pageblitz.de/api/webhooks/resend`
- Events: `email.opened`, `email.clicked`, `email.bounced`

---

### 3. Resend Inbound für Reply-Tracking (Phase 2)

**Resend Inbound aktivieren** (kostenlos im Resend-Plan):
- Domain: `replies.pageblitz.de`
- Inbound-Webhook: `https://pageblitz.de/api/webhooks/resend-inbound`

Jede Outreach-E-Mail bekommt:
```
reply-to: tracking+{outreachEmailId}@replies.pageblitz.de
```

Webhook parst die ID aus der Adresse und setzt `status = "replied"`.

---

### 4. Skript-Ordner

```
scripts/outreach-optimizer/
  orchestrator.ts          # Haupt-Loop (Harvest → Generate → Deploy)
  db-client.ts             # Metriken aus MySQL lesen
  resend-client.ts         # E-Mails senden mit Variant-Tag
  claude-client.ts         # Challenger-Copy via Claude API generieren
  variants/
    baseline.md            # Erste Copy (manuell schreiben)
    challenger.md          # Aktueller Challenger (auto-generiert, wird überschrieben)
  results.json             # Experiment-Verlauf (wird angehängt)
  resources.md             # Learnings: Was hat funktioniert / was nicht
```

---

### 5. Orchestrator-Loop (`scripts/outreach-optimizer/orchestrator.ts`)

```
HARVEST-PHASE:
  - Lese aktives Experiment aus DB
  - Ist es ≥ 3 Tage alt UND hat ≥ 20 Sends pro Variante?
    → JA: Gewinner berechnen (Open Rate / Reply Rate)
           Experiment in DB als "completed" markieren
           Gewinner als neues Baseline in baseline.md schreiben
           Ergebnis in results.json loggen
    → NEIN: Phase überspringen

GENERATE-PHASE:
  - Claude liest: baseline.md + resources.md + results.json
  - Prompt: "Generiere eine neue E-Mail-Copy-Variante mit Hypothese.
             Betreff + Body auf Deutsch. Fokus: [Open Rate / Reply Rate]"
  - Antwort in challenger.md speichern
  - Neues Experiment in DB anlegen (status: "running")

DEPLOY-PHASE:
  - Alle businesses aus DB die noch kein Outreach bekommen haben
  - Nimm die nächsten N (z.B. 40 = 20 Baseline + 20 Challenger)
  - 50/50 Split zufällig zuweisen
  - Via Resend senden
  - In outreach_emails speichern mit variant + resendEmailId
  - Experiment-Counts updaten (baselineSends, challengerSends)
```

---

### 6. GitHub Actions Workflow

**Datei:** `.github/workflows/outreach-optimizer.yml`

```yaml
name: Outreach Auto-Optimizer

on:
  schedule:
    - cron: '0 8 * * *'   # Täglich 08:00 UTC
  workflow_dispatch:        # Manuell auslösbar

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npx tsx scripts/outreach-optimizer/orchestrator.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          RESEND_FROM_EMAIL: ${{ secrets.RESEND_FROM_EMAIL }}
```

**GitHub Secrets zu setzen:**
- `DATABASE_URL` (MySQL-Verbindung)
- `RESEND_API_KEY` (bereits in .env vorhanden)
- `ANTHROPIC_API_KEY` (neu)
- `RESEND_FROM_EMAIL` (bereits in .env vorhanden)

---

## Metrik-Reihenfolge

| Phase | Metrik | Voraussetzung |
|-------|--------|---------------|
| Sofort | Open Rate | Resend Webhook aktivieren |
| Phase 2 | Reply Rate | Resend Inbound + reply-to Tracking |
| Langfristig | Conversion Rate | Onboarding-Flow mit UTM-Tracking |

---

## Claude-Prompt für Challenger-Generierung

```
Du bist ein Conversion-Copywriter für B2B-Kaltakquise auf Deutsch.

KONTEXT:
- Produkt: Pageblitz — automatische Website-Erstellung für lokale Unternehmen
- Zielgruppe: Kleine lokale Unternehmen (Handwerk, Dienstleister) ohne Website oder mit veralteter Website
- Kanal: Kalt-E-Mail (kein vorheriger Kontakt)
- Absender: Christian Slater, Gründer Pageblitz

BISHERIGE ERGEBNISSE:
{results.json Inhalt}

AKTUELLE BASELINE:
{baseline.md Inhalt}

WAS FUNKTIONIERT / WAS NICHT:
{resources.md Inhalt}

AUFGABE:
Erstelle eine neue E-Mail-Variante (Betreff + Body).
- Formuliere eine klare Hypothese warum diese Variante besser sein sollte
- Ändere NUR eine Variable gegenüber der Baseline (Betreff ODER Opening ODER CTA)
- Schreibe professionell aber menschlich, kein Marketing-Sprech
- Maximal 150 Wörter Body

FORMAT:
## Hypothese
[Was du testest und warum]

## Betreff
[Betreff-Zeile]

## Body
[E-Mail-Text]
```

---

## Reihenfolge der Umsetzung

1. **DB-Migration** (variant + resendEmailId Spalte, experiments Tabelle)
2. **Resend Webhook** (`/api/webhooks/resend` Endpunkt + Resend Dashboard konfigurieren)
3. **baseline.md** schreiben (erste E-Mail-Copy manuell)
4. **resources.md** anlegen (leer, wird von Claude befüllt)
5. **db-client.ts** (Metriken-Abfragen)
6. **claude-client.ts** (Challenger generieren)
7. **resend-client.ts** (Senden mit Variant-Tag)
8. **orchestrator.ts** (Loop zusammenbauen)
9. **GitHub Actions** (Workflow + Secrets)
10. **Resend Inbound** für Reply-Tracking (Phase 2)

---

## Offene Entscheidungen

- [ ] Baseline E-Mail-Copy schreiben (Betreff + Text auf Deutsch)
- [ ] Wie viele E-Mails pro Experiment-Durchlauf? (Empfehlung: 20 pro Variante = 40 total)
- [ ] Mindest-Laufzeit pro Experiment? (Empfehlung: 3–5 Tage)
- [ ] Resend Inbound Domain `replies.pageblitz.de` einrichten?
- [ ] GitHub Actions bereits aktiviert im Repo?

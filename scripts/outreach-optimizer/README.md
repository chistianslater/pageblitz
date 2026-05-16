# Outreach Auto-Optimizer

Automated cold-email outreach system with A/B testing (experiment-driven optimization).

## How it works

Each Monday (via GitHub Actions), the orchestrator runs three phases:

1. **HARVEST** – if an active experiment is ≥3 days old with ≥10 sends per variant, determine the winner by open rate, mark the experiment as completed, and update `resources.md` and `results.json` with learnings.

2. **GENERATE** – read `baseline.md`, `resources.md`, and `results.json`, then call Claude to produce a new challenger variant saved as `variants/challenger-YYYY-MM-DD.md`. Create a new experiment record in the database.

3. **DEPLOY** – fetch up to `BATCH_SIZE` (default: 10) uncontacted businesses (those with an email address not yet in `outreach_emails`), split them 50/50 between the baseline and challenger variant, send personalized emails via Resend, and record everything in the database.

## Running manually

```bash
# Dry run (logs only, no emails sent, no DB writes)
DRY_RUN=true npx tsx scripts/outreach-optimizer/orchestrator.ts

# Real run
DATABASE_URL="mysql://..." \
RESEND_API_KEY="re_..." \
ANTHROPIC_API_KEY="sk-ant-..." \
RESEND_FROM_EMAIL="Christian Slater <christian@pageblitz.de>" \
npx tsx scripts/outreach-optimizer/orchestrator.ts

# Control batch size
BATCH_SIZE=5 npx tsx scripts/outreach-optimizer/orchestrator.ts
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string (`mysql://user:pass@host/db`) |
| `RESEND_API_KEY` | Yes | Resend API key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for challenger generation |
| `RESEND_FROM_EMAIL` | No | Sender address (default: `Christian Slater <christian@pageblitz.de>`) |
| `DRY_RUN` | No | Set to `true` to log only without sending or writing to DB |
| `BATCH_SIZE` | No | Number of emails per run (default: 10) |

## File structure

```
scripts/outreach-optimizer/
  variants/
    baseline.md          # The permanent baseline email template
    challenger-YYYY-MM-DD.md  # Auto-generated challenger variants
  resources.md           # Accumulated learnings (auto-updated)
  results.json           # Experiment results history (auto-updated)
  orchestrator.ts        # Main entry point
  db-client.ts           # MySQL helpers (uses mysql2 directly)
  resend-client.ts       # Resend email sending
  claude-client.ts       # Claude challenger generation
  README.md              # This file
```

## Variant file format

```markdown
## Hypothese
What is being tested and why it should work better.

## Betreff
Email subject line (use {businessName} as placeholder)

## Body
Email body text (use {businessName} as placeholder)
Max 120 words.
```

## Database tables

- `outreach_emails` – one row per sent email (with `variant` and `resendEmailId` columns)
- `outreach_experiments` – one row per A/B test, tracks send/open/reply counts

## Resend webhook

Open and bounce tracking is handled by the webhook at `POST /api/webhooks/resend`.
Register your domain webhook URL in the Resend dashboard pointing to:
`https://pageblitz.de/api/webhooks/resend`

Events handled: `email.opened`, `email.clicked`, `email.bounced`, `email.complained`

import type { Express, Request, Response } from "express";
import { getDb, upsertChatTranscript } from "../db";
import {
  generatedWebsites,
  chatLeads,
  businesses,
  users,
  subscriptions,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./llm";
import { sendEmail } from "./email";
import {
  emailFooter,
  emailInfoPanel,
  emailPrimaryButton,
  wrapPageblitzEmail,
} from "./emailDesign";

// ── In-memory IP rate limiter ────────────────────────────────────────────────
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

setInterval(
  () => {
    const now = Date.now();
    for (const [ip, data] of ipRateMap.entries()) {
      if (data.resetAt < now) ipRateMap.delete(ip);
    }
  },
  60 * 60 * 1000
); // cleanup every hour

function checkIpLimit(ip: string, maxPerDay = 10): boolean {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const entry = ipRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    ipRateMap.set(ip, { count: 1, resetAt: now + dayMs });
    return true;
  }
  if (entry.count >= maxPerDay) return false;
  entry.count++;
  return true;
}

// ── System-Prompt Generator ──────────────────────────────────────────────────
function buildSystemPrompt(website: any): string {
  const wd = (website.websiteData as any) || {};
  const name = wd.businessName || wd.name || "Unser Unternehmen";
  const industry = website.industry || wd.industry || "Dienstleistung";
  const city = wd.city || wd.location || "";
  const phone = wd.phone || "";
  const email = wd.email || "";
  const hasBooking = !!website.addOnBooking;
  const welcomeMsg = website.chatWelcomeMessage || "";

  // Extract services from sections
  const sections: any[] = wd.sections || [];
  const servicesSection = sections.find((s: any) => s.type === "services");
  const services =
    servicesSection?.items
      ?.slice(0, 5)
      .map((item: any) => item.title)
      .filter(Boolean)
      .join(", ") || industry;

  const ctaBlock = hasBooking
    ? `Terminbuchung: Weise den Besucher auf das Buchungsformular auf der Website hin – er kann dort direkt einen Termin buchen.`
    : `Terminbuchung: Empfehle den Besuchern, direkt anzurufen oder ihre Kontaktdaten zu hinterlassen.`;

  const welcomeBlock = welcomeMsg
    ? `Begrüßung: Starte das Gespräch mit: "${welcomeMsg}"`
    : "";

  return `Du bist der freundliche KI-Assistent von "${name}", ${industry.startsWith("ein") ? industry : "einem/einer " + industry}${city ? " in " + city : ""}. Du chattest auf deren Website mit Besuchern.

DEIN HAUPTZIEL: Führe jedes Gespräch sanft zur Kontaktaufnahme oder Terminbuchung.

Unternehmensdaten:
- Name: ${name}
- Branche: ${industry}
- Leistungen: ${services}${phone ? "\n- Telefon: " + phone : ""}${email ? "\n- Email: " + email : ""}
- ${ctaBlock}
${welcomeBlock}

GESPRÄCHSREGELN:
1. Beantworte Fragen kurz & freundlich (max. 2-3 Sätze pro Nachricht)
2. Nach spätestens 2 Fragen: schlage Termin oder Rückruf vor
3. Sammle aktiv Kontaktdaten: frage nach Vorname + Telefon ODER Email
4. Nenne keine konkreten Preise – verweise auf persönliches Gespräch
5. Sprache: Deutsch, Du-Form, warmherzig aber professionell
6. Wenn du etwas nicht weißt: "Das beantwortet das Team am besten direkt – darf ich deinen Kontakt aufnehmen?"

LEAD-ERKENNUNG: Sobald du Vorname UND (Email ODER Telefonnummer) des Besuchers kennst, füge am Ende deiner Nachricht exakt diesen Block an (nichts anderes dahinter):
[LEAD:{"name":"Max Muster","email":"max@example.com","phone":"0171123456","summary":"Interessiert an Termin für Haarschnitt"}]
Lasse Felder weg die du nicht kennst. Beende danach das Gespräch freundlich ohne weitere Fragen.`;
}

// ── Lead notification email ──────────────────────────────────────────────────
async function sendLeadNotification(
  websiteId: number,
  lead: any
): Promise<void> {
  try {
    // Find business owner email
    const db = await getDb();
    if (!db) return;
    const [row] = await db
      .select({ userEmail: users.email, businessName: businesses.name })
      .from(generatedWebsites)
      .innerJoin(
        subscriptions,
        eq(subscriptions.websiteId, generatedWebsites.id)
      )
      .innerJoin(users, eq(users.id, subscriptions.userId as any))
      .innerJoin(
        businesses,
        eq(businesses.id, generatedWebsites.businessId as any)
      )
      .where(eq(generatedWebsites.id, websiteId))
      .limit(1)
      .catch(() => [null]);

    if (!row?.userEmail) return;

    const contactLine = [
      lead.email && `E-Mail: ${lead.email}`,
      lead.phone && `Telefon: ${lead.phone}`,
    ]
      .filter(Boolean)
      .join(" · ");

    await sendEmail({
      to: row.userEmail,
      subject: `Neue Website-Anfrage – ${lead.visitorName || "Unbekannt"}`,
      html: wrapPageblitzEmail({
        eyebrow: "Neue Anfrage über den KI-Chat",
        content: `
          <h1 style="color:#1d1a17;font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0 0 10px;">Ein neuer Kontakt wartet.</h1>
          <p style="color:#3f3a34;font-size:15px;line-height:1.65;margin:0;">Jemand hat auf der Website von <strong>${row.businessName}</strong> Interesse signalisiert.</p>
          ${emailInfoPanel(
            "Kontaktdaten",
            `<p style="margin:0 0 6px;"><strong>Name:</strong> ${lead.visitorName || "–"}</p><p style="margin:0 0 6px;"><strong>Kontakt:</strong> ${contactLine || "–"}</p>${lead.summary ? `<p style="margin:0;"><strong>Anliegen:</strong> ${lead.summary}</p>` : ""}`
          )}
          <p style="color:#3f3a34;font-size:14px;line-height:1.65;margin:0;">Melde dich am besten zeitnah, solange die Anfrage frisch ist.</p>
          ${emailPrimaryButton(
            "Alle Anfragen ansehen",
            "https://pageblitz.de/my-website"
          )}
        `,
        footer: emailFooter({ note: "Gesendet von deiner Pageblitz-Website" }),
      }),
    });
  } catch (e) {
    console.warn("[chat] lead notification failed:", e);
  }
}

// ── Route Registration ───────────────────────────────────────────────────────
export function registerChatRoutes(app: Express) {
  app.post("/api/chat/:slug/message", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const { messages, sessionId } = req.body as {
        messages: Array<{ role: string; content: string }>;
        sessionId: string;
      };

      if (!slug || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "invalid_request" });
      }

      // Trim to last 15 messages to keep tokens low
      const trimmedMessages = messages.slice(-15);

      // IP rate limit
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
        req.socket?.remoteAddress ||
        "unknown";

      if (!checkIpLimit(ip)) {
        return res.status(429).json({
          error: "rate_limit_ip",
          message:
            "Zu viele Anfragen. Bitte versuche es später erneut oder kontaktiere uns direkt.",
        });
      }

      // Load website
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "db_unavailable" });

      const [website] = await db
        .select()
        .from(generatedWebsites)
        .where(eq(generatedWebsites.slug, slug))
        .limit(1);

      // Eine Quelle der Wahrheit ist die Spalte addOnAiChat NICHT mehr allein
      // (Final-Review Befund 4): v2-Dokumente können den Chat auch nur über
      // websiteData.features.aiChat freigeschaltet haben (z. B. wenn der
      // Studio-Schreibpfad die Spalte noch nicht nachgezogen hatte, oder für
      // v1-Kompatibilität umgekehrt). Beide Quellen ODER-verknüpft, damit
      // keine der beiden für sich allein den Widget-Zugriff sperrt.
      const featuresAiChat =
        (website?.websiteData as any)?.features?.aiChat === true;
      if (!website || (!website.addOnAiChat && !featuresAiChat)) {
        return res.status(404).json({ error: "chat_not_available" });
      }

      // Monthly usage check + auto-reset
      const now = new Date();
      let usageCount = website.chatUsageCount ?? 0;
      const resetAt = website.chatUsageResetAt;

      if (!resetAt || resetAt < now) {
        // New month – reset counter
        usageCount = 0;
        const nextMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1
        );
        await db
          .update(generatedWebsites)
          .set({ chatUsageCount: 0, chatUsageResetAt: nextMonthStart })
          .where(eq(generatedWebsites.id, website.id))
          .catch(() => {});
      }

      if (usageCount >= 200) {
        return res.status(429).json({
          error: "rate_limit_monthly",
          message:
            "Unser Chat-Kontingent ist diesen Monat ausgeschöpft. Ruf uns gerne direkt an!",
        });
      }

      // Build system prompt + call Kimi
      const systemPrompt = buildSystemPrompt(website);

      const llmResult = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...trimmedMessages.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        maxTokens: 500,
      });

      const rawContent =
        (llmResult.choices[0]?.message?.content as string) ||
        "Wie kann ich dir helfen?";

      // Extract lead block if present
      let leadData: {
        name?: string;
        email?: string;
        phone?: string;
        summary?: string;
      } | null = null;
      let cleanContent = rawContent;

      const leadMatch = rawContent.match(/\[LEAD:(\{[^[\]]*\})\]/s);
      if (leadMatch) {
        try {
          leadData = JSON.parse(leadMatch[1]);
          cleanContent = rawContent.replace(/\[LEAD:\{[^[\]]*\}\]/s, "").trim();
        } catch {
          // ignore parse errors
        }
      }

      // Save lead
      if (leadData && (leadData.email || leadData.phone)) {
        try {
          const [inserted] = await db
            .insert(chatLeads)
            .values({
              websiteId: website.id,
              sessionId: sessionId || "anonymous",
              visitorName: leadData.name || null,
              email: leadData.email || null,
              phone: leadData.phone || null,
              summary: leadData.summary || null,
            })
            .$returningId();

          if (inserted) {
            await db
              .update(chatLeads)
              .set({ notifiedAt: new Date() })
              .where(eq(chatLeads.id, inserted.id))
              .catch(() => {});

            sendLeadNotification(website.id, leadData).catch(() => {});
          }
        } catch (e) {
          console.error("[chat] lead insert error:", e);
        }
      }

      // Increment monthly usage
      await db
        .update(generatedWebsites)
        .set({ chatUsageCount: usageCount + 1 })
        .where(eq(generatedWebsites.id, website.id))
        .catch(() => {});

      // Save / update transcript (fire-and-forget)
      const fullMessages = [
        ...trimmedMessages,
        { role: "assistant", content: cleanContent },
      ];
      upsertChatTranscript(website.id, sessionId || "anonymous", fullMessages, {
        visitorName: leadData?.name ?? undefined,
        summary: leadData?.summary ?? undefined,
      }).catch(() => {});

      return res.json({
        content: cleanContent,
        leadCaptured: !!leadData,
      });
    } catch (err) {
      console.error("[chatRoutes] error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  });
}

import { Express, Request, Response } from "express";
import { invokeLLM } from "./llm";
import { sendEmail } from "./email";

const ipUsage = new Map<string, { count: number; reset: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of ipUsage) if (now > v.reset) ipUsage.delete(k);
}, 60 * 60 * 1000);

const SYSTEM_PROMPT = `Du bist der Pageblitz Support-Assistent. Du hilfst Nutzern, die gerade ihre Website mit Pageblitz erstellen oder verwalten.

ÜBER PAGEBLITZ:
- Website-Builder für deutsche Kleinunternehmen
- KI-generierte Website in wenigen Minuten
- Preis: 19,90 €/Monat (Jahreszahlung) oder 24,90 €/Monat (monatlich)
- 7 Tage kostenlos testen, monatlich kündbar

ONBOARDING-ABLAUF:
1. Branche und Unternehmensname eingeben
2. Design-Stil wählen (3 Layout-Vorschläge, passend zur Branche)
3. Ansprache wählen (Du/Sie)
4. Farben, Schriftarten, Bilder anpassen
5. Unternehmensinfos eingeben (Adresse, Telefon, Öffnungszeiten etc.)
6. Optionale Add-Ons wählen (KI-Chat, Terminbuchung, Kontaktformular etc.)
7. Vorschau prüfen und veröffentlichen

HÄUFIGE FRAGEN:
- "Wie lade ich ein Bild hoch?" → Im jeweiligen Schritt (Hauptbild, Über-uns-Bild) gibt es einen Upload-Button. Eigenes Foto hochladen oder aus den Vorschlägen wählen.
- "Kann ich die Farben ändern?" → Ja, im Farbschema-Schritt. Auch später im Dashboard jederzeit anpassbar.
- "Wie ändere ich den Text?" → Im Chat die jeweilige Frage beantworten. Nach Veröffentlichung über das Kunden-Dashboard editierbar.
- "Was passiert nach 7 Tagen?" → Ohne Bezahlung wird die Website-Vorschau gelöscht. Bei Bezahlung geht sie live.
- "Welche Layouts gibt es?" → 18 verschiedene Designs, sortiert nach Branche. Dunkel, hell, elegant, modern etc.
- "Eigene Domain?" → Ja, über das Dashboard anschließbar. Eine .pageblitz.de-Subdomain ist kostenlos inklusive.
- "Impressum/Datenschutz?" → Wird automatisch generiert aus den Angaben im Onboarding. Kostenlos inklusive.
- "Logo hochladen?" → Ja, im Logo-Schritt. Alternativ wird der Firmenname als Text-Logo dargestellt.

ADD-ONS:
- KI-Chat (+9,90 €/Mo): Chatbot auf der Website, beantwortet Besucherfragen 24/7
- Terminbuchung (+4,90 €/Mo): Online-Terminbuchung direkt auf der Website
- Kontaktformular (+3,90 €/Mo): Anpassbare Felder, DSGVO-konform
- Bildergalerie (+3,90 €/Mo): Bis zu 20 Fotos
- Speisekarte (+3,90 €/Mo): Für Restaurants/Cafés
- Preisliste (+3,90 €/Mo): Für Dienstleister

GESPRÄCHSREGELN:
- Deutsch, Du-Form, freundlich und hilfsbereit
- Kurze, klare Antworten (max. 3-4 Sätze)
- Wenn du die Antwort nicht sicher weißt: ehrlich sagen und auf den Support verweisen
- KEIN Verkaufsdruck – der User ist bereits Kunde/im Onboarding

ESKALATION:
Wenn der Nutzer nach 2-3 Nachrichten nicht zufrieden ist, das Problem technisch ist, oder der Nutzer explizit einen Menschen sprechen möchte, füge ans Ende deiner Antwort an:
[SUPPORT]
Das zeigt dem User einen "Direkt an Support schreiben"-Button.`;

export function registerSupportChatRoutes(app: Express) {
  app.post("/api/support-chat/message", async (req: Request, res: Response) => {
    try {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";

      const { messages, sessionId } = req.body as {
        messages: Array<{ role: "user" | "assistant"; content: string }>;
        sessionId?: string;
      };

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages" });
      }

      const now = Date.now();
      const usage = ipUsage.get(ip);
      if (usage && now < usage.reset) {
        if (usage.count >= 40) {
          return res.status(429).json({ error: "rate_limit" });
        }
        usage.count++;
      } else {
        ipUsage.set(ip, { count: 1, reset: now + 24 * 60 * 60 * 1000 });
      }

      const trimmed = messages.slice(-15);

      const llmResult = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...trimmed.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        maxTokens: 400,
      });

      let content =
        (llmResult.choices?.[0]?.message?.content as string) ||
        "Entschuldigung, ich bin gerade nicht erreichbar. Bitte schreibe uns direkt eine E-Mail an support@pageblitz.de!";

      let showSupportForm = false;
      if (content.includes("[SUPPORT]")) {
        content = content.replace("[SUPPORT]", "").trim();
        showSupportForm = true;
      }

      res.json({ content, showSupportForm });
    } catch (err) {
      console.error("[SupportChat] Error:", err);
      res.status(500).json({
        content: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder schreibe uns eine E-Mail.",
        showSupportForm: true,
      });
    }
  });

  app.post("/api/support-chat/ticket", async (req: Request, res: Response) => {
    try {
      const { name, email, message, chatHistory, page } = req.body as {
        name?: string;
        email: string;
        message: string;
        chatHistory?: Array<{ role: string; content: string }>;
        page?: string;
      };

      if (!email || !message) {
        return res.status(400).json({ error: "E-Mail und Nachricht sind erforderlich." });
      }

      const chatSummary = chatHistory?.length
        ? chatHistory.map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`).join("\n")
        : "Kein Chat-Verlauf";

      await sendEmail({
        to: "christian@schau-horch.de",
        subject: `🎫 Support-Ticket: ${name || email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
            <h2 style="color: #0a0a0a; margin-bottom: 16px;">🎫 Neues Support-Ticket</h2>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
              <tr style="background: #f3f4f6;">
                <td style="padding: 12px 16px; font-weight: bold; color: #374151; width: 120px;">Name</td>
                <td style="padding: 12px 16px; color: #111827;">${name || "–"}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-weight: bold; color: #374151;">E-Mail</td>
                <td style="padding: 12px 16px;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
              </tr>
              <tr style="background: #f3f4f6;">
                <td style="padding: 12px 16px; font-weight: bold; color: #374151;">Seite</td>
                <td style="padding: 12px 16px; color: #6b7280;">${page || "–"}</td>
              </tr>
            </table>
            <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <h3 style="color: #374151; margin: 0 0 8px;">Nachricht</h3>
              <p style="color: #111827; white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
            ${chatHistory?.length ? `
              <details style="background: white; border-radius: 8px; padding: 16px;">
                <summary style="cursor: pointer; color: #374151; font-weight: bold;">Chat-Verlauf (${chatHistory.length} Nachrichten)</summary>
                <pre style="margin-top: 12px; font-size: 12px; color: #6b7280; white-space: pre-wrap; overflow: auto;">${chatSummary}</pre>
              </details>
            ` : ""}
          </div>
        `,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("[SupportChat] Ticket error:", err);
      res.status(500).json({ error: "Ticket konnte nicht gesendet werden." });
    }
  });
}

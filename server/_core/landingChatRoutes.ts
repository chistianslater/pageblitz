import { Express, Request, Response } from "express";
import { invokeLLM } from "./llm";
import { sendEmail } from "./email";

// ── IP-based rate limit: 30 messages per IP per 24 h ───────────────────────
const ipUsage = new Map<string, { count: number; reset: number }>();

const SYSTEM_PROMPT = `Du bist Mika, die freundliche KI-Assistentin von Pageblitz – einem Service, der professionelle Websites für deutsche Kleinunternehmen in nur 3 Minuten erstellt.

PAGEBLITZ IM ÜBERBLICK:
- KI-generierte Website in 3 Minuten, vollständig fertig
- Preis: 19,90 €/Monat (bei Jahreszahlung) oder 24,90 €/Monat (monatlich)
- 7 Tage kostenlos testen – keine Kreditkarte nötig
- Monatlich kündbar, keine Mindestlaufzeit
- Inklusive: SSL-Zertifikat, Hosting, Impressum, Datenschutzerklärung, DSGVO-Cookie-Banner
- Eigene Domain nutzbar, kostenlose .pageblitz.de-Subdomain inklusive
- Änderungen jederzeit über das Kunden-Dashboard

OPTIONALE ADD-ONS:
1. 🤖 KI-Chat Assistent (+9,90 €/Mo): Ein KI-Chatbot direkt auf der Kunden-Website. Beantwortet Besucherfragen 24/7, benachrichtigt den Unternehmer bei Anfragen per E-Mail. Kein Personal nötig.
2. 📅 Terminbuchung (+4,90 €/Mo): Pageblitz-eigene Terminbuchungs-Lösung. Der Unternehmer trägt EINMALIG seinen bestehenden Calendly-Link im Dashboard ein – Pageblitz zeigt dann automatisch einen "Termin buchen"-Button auf der Website. Kunden buchen 24/7, Termine landen direkt im Kalender. Kein eigenes Buchungssystem nötig – ein kostenloser Calendly-Account reicht.
3. ✉️ Kontaktformular (+3,90 €/Mo): Individuell anpassbare Felder, DSGVO-konform, Anfragen kommen per E-Mail.
4. 🖼️ Bildergalerie (+3,90 €/Mo): Bis zu 20 Fotos direkt hochladen.
5. 🍽️ Speisekarte (+3,90 €/Mo): Kategorien, Gerichte, Preise – für Restaurants und Cafés.
6. 💶 Preisliste (+3,90 €/Mo): Für Friseure, Kosmetiker, Handwerker etc.

WIE DIE WEBSITE ERSTELLT WIRD:
1. Google My Business Link eingeben (oder manuell starten)
2. KI analysiert die Daten, schreibt alle Texte, wählt Bilder
3. Im Chat-Interface anpassen (Farben, Texte, Bilder, Stil)
4. Mit einem Klick veröffentlichen

DEINE HAUPTAUFGABE – CONVERSION:
- Ziel: Den Besucher dazu bringen, seine eigene Website kostenlos zu starten
- Beantworte Fragen ehrlich, freundlich und kurz (max. 3 Sätze)
- Betone: "7 Tage gratis, keine Kreditkarte nötig, in 3 Minuten fertig"
- NIEMALS nach E-Mail oder Name fragen – stattdessen: direkt zum Starten animieren
- Nach spätestens 2-3 Nachrichten immer auf den kostenlosen Start hinweisen
- Wenn Interesse erkennbar ist oder eine Frage gut beantwortet wurde: [CTA] an die Antwort hängen

GESPRÄCHSREGELN:
- Deutsch, Du-Form, warmherzig und enthusiastisch
- Kurze Antworten – nie mehr als 3 Sätze
- Verwende gelegentlich Emojis (1 pro Nachricht)
- Wenn du etwas nicht weißt: "Am besten schaust du das direkt live an – starte einfach kostenlos!"

CTA-TAG: Sobald du den Besucher zum Starten animieren möchtest (nach spätestens 2-3 Nachrichten), füge exakt ans Ende deiner Antwort an (nichts danach):
[CTA]`;

export function registerLandingChatRoutes(app: Express) {
  app.post("/api/landing-chat/message", async (req: Request, res: Response) => {
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

      // ── Rate-limit ──────────────────────────────────────────────────────────
      const now = Date.now();
      const usage = ipUsage.get(ip);
      if (usage && now < usage.reset) {
        if (usage.count >= 30) {
          return res.status(429).json({ error: "rate_limit" });
        }
        usage.count++;
      } else {
        ipUsage.set(ip, { count: 1, reset: now + 24 * 60 * 60 * 1000 });
      }

      // ── LLM call ────────────────────────────────────────────────────────────
      const trimmed = messages.slice(-12);

      const llmResult = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...trimmed.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        maxTokens: 350,
      });

      let content =
        (llmResult.choices?.[0]?.message?.content as string) ||
        "Ich bin gerade nicht erreichbar – bitte versuche es gleich nochmal!";

      // ── CTA-Tag detection ([CTA] → zeige "Jetzt starten"-Button im Widget) ──
      let leadCaptured = false;
      if (content.includes("[CTA]")) {
        content = content.replace("[CTA]", "").trim();
        leadCaptured = true;
      }

      // ── Optional: Lead-Email wenn Besucher freiwillig E-Mail teilt ([LEAD:{...}]) ──
      const leadMatch = content.match(/\[LEAD:(\{[^[\]]*\})\]/s);
      if (leadMatch) {
        try {
          const leadData = JSON.parse(leadMatch[1]) as {
            name?: string;
            email?: string;
            interest?: string;
          };
          content = content.replace(leadMatch[0], "").trim();
          leadCaptured = true;

          if (leadData.email) {
            await sendEmail({
              to: "christian@schau-horch.de",
              subject: `🎯 Neuer Landing-Page-Lead: ${leadData.name || "Unbekannt"}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
                  <h2 style="color: #0a0a0a; margin-bottom: 16px;">🎯 Neuer Lead von der Pageblitz Landing Page</h2>
                  <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                    <tr style="background: #f3f4f6;">
                      <td style="padding: 12px 16px; font-weight: bold; color: #374151; width: 140px;">Name</td>
                      <td style="padding: 12px 16px; color: #111827;">${leadData.name || "–"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 16px; font-weight: bold; color: #374151;">E-Mail</td>
                      <td style="padding: 12px 16px;"><a href="mailto:${leadData.email}" style="color: #2563eb;">${leadData.email}</a></td>
                    </tr>
                    <tr style="background: #f3f4f6;">
                      <td style="padding: 12px 16px; font-weight: bold; color: #374151;">Interesse</td>
                      <td style="padding: 12px 16px; color: #111827;">${leadData.interest || "–"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 16px; font-weight: bold; color: #374151;">Session</td>
                      <td style="padding: 12px 16px; color: #6b7280; font-size: 12px;">${sessionId || "–"}</td>
                    </tr>
                  </table>
                  <p style="margin-top: 16px; color: #6b7280; font-size: 13px;">Dieser Lead wurde über den KI-Chat auf pageblitz.de erfasst.</p>
                </div>
              `,
              replyTo: leadData.email,
            });
          }
        } catch {
          // ignore JSON parse errors
        }
      }

      return res.json({ content, leadCaptured });
    } catch (err) {
      console.error("[landing-chat] Error:", err);
      return res.status(500).json({ error: "server_error" });
    }
  });
}

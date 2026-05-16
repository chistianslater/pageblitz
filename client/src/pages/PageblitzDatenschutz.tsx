/**
 * Datenschutzerklärung für Pageblitz (eine Marke von Schau und Horch, Christian Nießing)
 * DSGVO-konform – inkl. aller eingesetzten Drittdienste.
 */

import { Zap } from "lucide-react";
import { Link } from "wouter";

export default function PageblitzDatenschutz() {
  const date = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold tracking-tight">Pageblitz</span>
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white/80 transition-colors">
            ← Zurück
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Datenschutzerklärung</h1>
        <p className="text-white/40 text-sm mb-12">Stand: {date}</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          {/* 1. Verantwortliche Stelle */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              1. Verantwortliche Stelle
            </h2>
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:</p>
            <div className="mt-3 p-4 rounded-lg bg-white/5 border border-white/10 text-sm">
              <p className="font-medium text-white">Pageblitz – eine Marke von Schau und Horch</p>
              <p className="mt-1">Christian Nießing, Diplom Designer</p>
              <p>Zum Waldschlösschen 19</p>
              <p>46395 Bocholt</p>
              <p>Deutschland</p>
              <p className="mt-2">
                Telefon: <a href="tel:+4928713492100" className="text-blue-400 hover:text-blue-300 transition-colors">+49 2871 349 2100</a>
              </p>
              <p>
                E-Mail: <a href="mailto:hello@pageblitz.de" className="text-blue-400 hover:text-blue-300 transition-colors">hello@pageblitz.de</a>
              </p>
            </div>
          </section>

          {/* 2. Allgemeines */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              2. Allgemeines zur Datenverarbeitung
            </h2>
            <h3 className="font-medium text-white/90 mb-2">Umfang der Verarbeitung</h3>
            <p>
              Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur
              Bereitstellung einer funktionsfähigen Website sowie unserer Dienste erforderlich ist. Die
              Verarbeitung erfolgt regelmäßig nur nach Einwilligung des Nutzers oder wenn eine
              gesetzliche Grundlage dies erlaubt.
            </p>
            <h3 className="font-medium text-white/90 mt-4 mb-2">Rechtsgrundlagen</h3>
            <p>
              Wir stützen die Datenverarbeitung auf folgende Rechtsgrundlagen der DSGVO:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li><strong className="text-white/90">Art. 6 Abs. 1 lit. a DSGVO</strong> – Einwilligung des Betroffenen</li>
              <li><strong className="text-white/90">Art. 6 Abs. 1 lit. b DSGVO</strong> – Vertragserfüllung oder vorvertragliche Maßnahmen</li>
              <li><strong className="text-white/90">Art. 6 Abs. 1 lit. c DSGVO</strong> – Erfüllung einer rechtlichen Verpflichtung</li>
              <li><strong className="text-white/90">Art. 6 Abs. 1 lit. f DSGVO</strong> – Wahrung berechtigter Interessen</li>
            </ul>
            <h3 className="font-medium text-white/90 mt-4 mb-2">Datenlöschung und Speicherdauer</h3>
            <p>
              Personenbezogene Daten werden gelöscht oder gesperrt, sobald der Zweck der Speicherung
              entfällt. Eine längere Speicherung erfolgt nur, wenn dies gesetzlich vorgeschrieben ist
              (z. B. steuer- oder handelsrechtliche Aufbewahrungsfristen von bis zu 10 Jahren).
            </p>
          </section>

          {/* 3. Hosting */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              3. Hosting
            </h2>
            <p>
              Diese Website wird auf einem VPS-Server von <strong className="text-white/90">Hostinger International Ltd.</strong>,
              61 Lordou Vironos str., 6023 Larnaca, Zypern, betrieben. Der Server ist in der Europäischen Union
              gehostet. Hostinger verarbeitet Zugriffsdaten (Server-Log-Dateien) ausschließlich zur
              Sicherstellung des technischen Betriebs.
            </p>
            <p className="mt-2 text-sm">
              <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren
              Bereitstellung der Website). Ein Auftragsverarbeitungsvertrag (AVV) ist geschlossen.
            </p>
          </section>

          {/* 4. Registrierung und Nutzerkonto */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              4. Registrierung und Nutzerkonto
            </h2>
            <p>
              Zur Nutzung unseres Dienstes können Sie ein Nutzerkonto anlegen. Dabei erheben wir folgende
              Daten:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Name und E-Mail-Adresse</li>
              <li>Unternehmensdaten (Name, Branche, Adresse, Kontakt)</li>
              <li>Inhalte der Website (Texte, Bilder, Öffnungszeiten etc.)</li>
              <li>IP-Adresse und Zeitpunkt der Registrierung</li>
            </ul>
            <p className="mt-3 text-sm">
              <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>
          </section>

          {/* 5. Zahlungsabwicklung (Stripe) */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              5. Zahlungsabwicklung – Stripe
            </h2>
            <p>
              Die Zahlungsabwicklung erfolgt über <strong className="text-white/90">Stripe Payments Europe Ltd.</strong>,
              1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland. Stripe verarbeitet Ihre
              Zahlungsdaten (z. B. Kreditkartennummer, IBAN) direkt und sicher. Wir erhalten keine
              vollständigen Zahlungsdaten – lediglich eine Bestätigung über den Erfolg oder Misserfolg
              der Zahlung.
            </p>
            <p className="mt-2 text-sm">
              <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO. Datenschutzerklärung von Stripe:{" "}
              <a
                href="https://stripe.com/de/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                stripe.com/de/privacy
              </a>
            </p>
          </section>

          {/* 6. Dateispeicherung (AWS S3) */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              6. Dateispeicherung – Amazon Web Services (S3)
            </h2>
            <p>
              Hochgeladene Bilder und Dateien (z. B. Logos, Fotos für Ihre Website) werden in einem
              Object-Storage-Dienst von <strong className="text-white/90">Amazon Web Services EMEA SARL</strong>,
              38 Avenue John F. Kennedy, L-1855 Luxemburg, gespeichert. Die Dateien werden ausschließlich
              zur Bereitstellung Ihrer Website verwendet.
            </p>
            <p className="mt-2 text-sm">
              <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO. Ein AVV ist
              geschlossen. Datenschutzhinweise von AWS:{" "}
              <a
                href="https://aws.amazon.com/de/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                aws.amazon.com/de/privacy
              </a>
            </p>
          </section>

          {/* 7. E-Mail-Versand (Resend) */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              7. Transaktionale E-Mails – Resend
            </h2>
            <p>
              Für den Versand von System-E-Mails (Bestätigungen, Benachrichtigungen) setzen wir den
              Dienst <strong className="text-white/90">Resend</strong> (Resend Inc., 2261 Market Street #5139,
              San Francisco, CA 94114, USA) ein. Dabei wird Ihre E-Mail-Adresse an Resend übermittelt.
            </p>
            <p className="mt-2 text-sm">
              <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b und f DSGVO. Ein AVV
              ist geschlossen. Datenschutzhinweise:{" "}
              <a
                href="https://resend.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                resend.com/legal/privacy-policy
              </a>
            </p>
          </section>

          {/* 8. Analytics und Tracking */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              8. Analyse und Tracking
            </h2>
            <p className="mb-4">
              Zur Analyse der Websitenutzung und zur Verbesserung unseres Angebots setzen wir folgende
              Dienste ein. Wir haben diese Dienste im Cookie-Banner konfiguriert – Sie können Ihre
              Einwilligung jederzeit widerrufen.
            </p>

            {/* Google Analytics */}
            <div className="mb-6">
              <h3 className="font-medium text-white/90 mb-2">Google Analytics 4</h3>
              <p className="text-sm">
                Wir nutzen Google Analytics 4, einen Webanalysedienst der{" "}
                <strong className="text-white/90">Google Ireland Limited</strong>, Gordon House, Barrow Street,
                Dublin 4, Irland. Google Analytics verwendet Cookies, um Ihre Nutzung der Website zu
                analysieren. Die erzeugten Informationen werden in der Regel an einen Server von Google in
                den USA übertragen und dort gespeichert. Die IP-Anonymisierung ist aktiviert. Google ist
                nach dem EU-US Data Privacy Framework zertifiziert.
              </p>
              <p className="mt-1 text-sm">
                <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
                Datenschutzerklärung:{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  policies.google.com/privacy
                </a>
              </p>
            </div>

            {/* Microsoft Clarity */}
            <div className="mb-6">
              <h3 className="font-medium text-white/90 mb-2">Microsoft Clarity</h3>
              <p className="text-sm">
                Wir nutzen Microsoft Clarity der <strong className="text-white/90">Microsoft Corporation</strong>,
                One Microsoft Way, Redmond, WA 98052-6399, USA. Clarity zeichnet Sitzungsaufnahmen und
                Heatmaps zur Analyse des Nutzerverhaltens auf. Dabei können Klicks, Scrollbewegungen und
                Mausbewegungen anonymisiert aufgezeichnet werden. Microsoft ist nach dem EU-US Data Privacy
                Framework zertifiziert.
              </p>
              <p className="mt-1 text-sm">
                <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
                Datenschutzerklärung:{" "}
                <a
                  href="https://privacy.microsoft.com/de-de/privacystatement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  privacy.microsoft.com
                </a>
              </p>
            </div>

            {/* Meta Pixel */}
            <div className="mb-6">
              <h3 className="font-medium text-white/90 mb-2">Meta Pixel (Facebook Pixel)</h3>
              <p className="text-sm">
                Wir nutzen das Meta Pixel der <strong className="text-white/90">Meta Platforms Ireland Ltd.</strong>,
                4 Grand Canal Square, Dublin 2, Irland. Das Meta Pixel ermöglicht es, die Wirksamkeit von
                Werbeanzeigen auf Facebook und Instagram zu messen und Zielgruppen für Remarketing zu
                erstellen. Dabei wird eine Verbindung zu den Meta-Servern hergestellt; bei eingeloggten
                Meta-Nutzern kann eine Zuordnung zu deren Profil erfolgen.
              </p>
              <p className="mt-1 text-sm">
                <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
                Datenschutzerklärung:{" "}
                <a
                  href="https://www.facebook.com/privacy/policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  facebook.com/privacy/policy
                </a>
              </p>
            </div>

            {/* Rybbit Analytics */}
            <div>
              <h3 className="font-medium text-white/90 mb-2">Rybbit Analytics</h3>
              <p className="text-sm">
                Wir nutzen Rybbit, ein datenschutzfreundliches Web-Analytics-Tool (Rybbit Inc.). Rybbit
                verzichtet auf Cookies und erfasst keine personenbezogenen Daten. Es werden nur
                anonymisierte Nutzungsstatistiken erhoben.
              </p>
              <p className="mt-1 text-sm">
                <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
                (berechtigtes Interesse an anonymer Nutzungsstatistik). Eine Einwilligung ist nicht
                erforderlich.
              </p>
            </div>
          </section>

          {/* 9. Cookies */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              9. Cookies
            </h2>
            <p>
              Unsere Website verwendet Cookies. Wir unterscheiden zwischen:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>
                <strong className="text-white/90">Technisch notwendige Cookies:</strong> Erforderlich für den
                Betrieb der Website (z. B. Session-Cookies, Authentifizierung). Keine Einwilligung
                erforderlich (Art. 6 Abs. 1 lit. f DSGVO).
              </li>
              <li>
                <strong className="text-white/90">Analyse- und Marketing-Cookies:</strong> Werden erst nach
                Ihrer Einwilligung gesetzt (Art. 6 Abs. 1 lit. a DSGVO). Sie können Ihre Einwilligung im
                Cookie-Banner verwalten oder jederzeit widerrufen.
              </li>
            </ul>
          </section>

          {/* 10. Server-Logfiles */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              10. Server-Log-Dateien
            </h2>
            <p>
              Unser Hosting-Anbieter erfasst und speichert automatisch Informationen in Server-Log-Dateien,
              die Ihr Browser übermittelt:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Browsertyp und -version</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer-URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Datum und Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse (anonymisiert)</li>
            </ul>
            <p className="mt-2 text-sm">
              Diese Daten werden nicht mit anderen Datenquellen zusammengeführt.{" "}
              <strong className="text-white/90">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          {/* 11. Betroffenenrechte */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              11. Ihre Rechte als betroffene Person
            </h2>
            <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li><strong className="text-white/90">Auskunft</strong> (Art. 15 DSGVO): Kostenlose Auskunft über gespeicherte Daten</li>
              <li><strong className="text-white/90">Berichtigung</strong> (Art. 16 DSGVO): Korrektur unrichtiger Daten</li>
              <li><strong className="text-white/90">Löschung</strong> (Art. 17 DSGVO): „Recht auf Vergessenwerden"</li>
              <li><strong className="text-white/90">Einschränkung</strong> (Art. 18 DSGVO): Einschränkung der Verarbeitung</li>
              <li><strong className="text-white/90">Datenübertragbarkeit</strong> (Art. 20 DSGVO): Übertragung in maschinenlesbarem Format</li>
              <li><strong className="text-white/90">Widerspruch</strong> (Art. 21 DSGVO): Widerspruch gegen Verarbeitung auf Basis berechtigter Interessen</li>
              <li><strong className="text-white/90">Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO): Jederzeit möglich, ohne Auswirkung auf die Rechtmäßigkeit bisheriger Verarbeitung</li>
            </ul>
            <p className="mt-3 text-sm">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{" "}
              <a href="mailto:hello@pageblitz.de" className="text-blue-400 hover:text-blue-300 transition-colors">
                hello@pageblitz.de
              </a>
            </p>
          </section>

          {/* 12. Beschwerderecht */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              12. Beschwerderecht bei der Aufsichtsbehörde
            </h2>
            <p>
              Sie haben gemäß Art. 77 DSGVO das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
              beschweren. Die für uns zuständige Aufsichtsbehörde ist die{" "}
              <strong className="text-white/90">Landesbeauftragte für Datenschutz und Informationsfreiheit
              Nordrhein-Westfalen (LDI NRW)</strong>:
            </p>
            <div className="mt-3 text-sm">
              <p>Postfach 20 04 44</p>
              <p>40102 Düsseldorf</p>
              <p>
                Website:{" "}
                <a
                  href="https://www.ldi.nrw.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  www.ldi.nrw.de
                </a>
              </p>
            </div>
          </section>

          {/* 13. SSL */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              13. SSL/TLS-Verschlüsselung
            </h2>
            <p>
              Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine
              verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von
              „http://" auf „https://" wechselt.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <span>© 2026 Pageblitz – eine Marke von Schau und Horch</span>
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-white/80 transition-colors">Impressum</Link>
            <span className="text-white/60">Datenschutz</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

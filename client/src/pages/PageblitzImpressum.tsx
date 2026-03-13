/**
 * Impressum für Pageblitz (eine Marke von Schau und Horch, Christian Nießing)
 */

import { Zap } from "lucide-react";
import { Link } from "wouter";

export default function PageblitzImpressum() {
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
        <h1 className="text-3xl font-bold mb-2">Impressum</h1>
        <p className="text-white/40 text-sm mb-12">Angaben gemäß § 5 DDG</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          {/* Anbieter */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              Anbieter
            </h2>
            <p className="font-medium text-white">Pageblitz</p>
            <p className="text-white/60 text-sm mt-0.5">Eine Marke von Schau und Horch</p>
            <p className="mt-3">Christian Nießing, Diplom Designer</p>
            <p>Zum Waldschlösschen 19</p>
            <p>46395 Bocholt</p>
            <p>Deutschland</p>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              Kontakt
            </h2>
            <p>Telefon: <a href="tel:+4928713492100" className="text-blue-400 hover:text-blue-300 transition-colors">+49 2871 349 2100</a></p>
            <p>E-Mail: <a href="mailto:kontakt@schauundhorch.de" className="text-blue-400 hover:text-blue-300 transition-colors">kontakt@schauundhorch.de</a></p>
            <p>Website: <a href="https://pageblitz.de" className="text-blue-400 hover:text-blue-300 transition-colors">pageblitz.de</a></p>
          </section>

          {/* USt-ID */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              Umsatzsteuer-ID
            </h2>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:</p>
            <p className="font-mono text-white mt-1">DE277120646</p>
          </section>

          {/* Verantwortlich */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>Christian Nießing</p>
            <p>Zum Waldschlösschen 19</p>
            <p>46395 Bocholt</p>
          </section>

          {/* Streitschlichtung */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              Streitschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          {/* Haftung für Inhalte */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              Haftung für Inhalte
            </h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
            <p className="mt-2">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
              entfernen.
            </p>
          </section>

          {/* Haftung für Links */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              Haftung für Links
            </h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
              Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
              Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
              Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
          </section>

          {/* Urheberrecht */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
              Urheberrecht
            </h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
              nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <span>© 2026 Pageblitz – eine Marke von Schau und Horch</span>
          <div className="flex gap-6">
            <span className="text-white/60">Impressum</span>
            <Link href="/datenschutz" className="hover:text-white/80 transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

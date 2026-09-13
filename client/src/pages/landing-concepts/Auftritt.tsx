import React from "react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { Logo, StartForm, DemoLink, Price, Questions, Footer } from "./shared";
export default function Auftritt() {
  return (
    <div className="concept concept-bold" id="top">
      <nav className="bold-nav lc-width">
        <Logo />
        <span>Für die, die ihr Ding machen.</span>
        <a href="#start" className="lc-button">
          Deinen Auftritt starten <ArrowUpRight size={18} />
        </a>
      </nav>
      <main>
        <section className="bold-hero lc-width">
          <div className="bold-hero-top">
            <p className="lc-eyebrow">
              Du hast das Geschäft. Wir haben die Website.
            </p>
            <a href="#beispiele">
              Das ist möglich <ArrowDown size={15} />
            </a>
          </div>
          <h1>
            GUTE ARBEIT.
            <br />
            <span>GROSSER</span>
            <br className="bold-mobile-break" /> AUFTRITT.
          </h1>
          <div className="bold-hero-bottom">
            <p>
              Dein Können verdient mehr als eine Telefonnummer bei Google. Zeig,
              was deinen Betrieb besonders macht. Mit einer Website von
              Pageblitz.
            </p>
            <div>
              <a href="#start" className="lc-button">
                Zeig mir meine Website <ArrowUpRight size={20} />
              </a>
              <span>Dein erster Entwurf ist kostenlos.</span>
            </div>
          </div>
          <div className="bold-photo-strip">
            <figure>
              <img
                src="/demo/salon-noir-hero.webp"
                alt="Arbeit im Friseursalon"
              />
              <figcaption>
                Für deinen Salon.<span>01</span>
              </figcaption>
            </figure>
            <figure>
              <img
                src="/demo/gusto-hero.webp"
                alt="Gericht in einem Restaurant"
              />
              <figcaption>
                Für dein Lokal.<span>02</span>
              </figcaption>
            </figure>
            <figure>
              <img
                src="/demo/werkbank-hero.webp"
                alt="Handwerk in einer Werkstatt"
              />
              <figcaption>
                Für dein Lebenswerk.<span>03</span>
              </figcaption>
            </figure>
          </div>
        </section>
        <section className="bold-manifesto lc-width">
          <p className="lc-eyebrow">Dein Ruf ist schon da.</p>
          <h2>
            Jetzt bekommt er
            <br />
            eine <span>Adresse.</span>
          </h2>
          <div>
            <p>
              Du steckst jeden Tag Zeit, Können und Herz in dein Geschäft.
              Online sollte man das sofort sehen.
            </p>
            <p>
              Pageblitz macht aus deinen Inhalten einen professionellen
              Auftritt. Mit Charakter. Auf dem Handy genauso wie auf dem großen
              Bildschirm.
            </p>
          </div>
        </section>
        <section className="bold-examples" id="beispiele">
          <div className="lc-width">
            <div className="bold-section-line">
              <p className="lc-eyebrow">So kann sich dein Betrieb zeigen</p>
              <span>Beispielwebsites / Mit Pageblitz gestaltet</span>
            </div>
            <article className="bold-featured">
              <div>
                <span className="bold-index">01 / SALON & BEAUTY</span>
                <h2>
                  Man sieht,
                  <br />
                  dass du
                  <br />
                  <span>es kannst.</span>
                </h2>
                <p>
                  Deine Arbeit im Mittelpunkt. Mit Bildern, die zeigen, was
                  deinen Stil ausmacht.
                </p>
                <DemoLink id="salon-noir">Salon-Website entdecken</DemoLink>
              </div>
              <a
                href="/demo/salon-noir"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Salon-Demo öffnen"
              >
                <img
                  src="/landing/salon-noir.webp"
                  width="1200"
                  height="833"
                  alt="Pageblitz Salon-Website"
                  loading="lazy"
                />
              </a>
            </article>
            <div className="bold-demo-pair">
              {[
                {
                  id: "gusto",
                  label: "02 / GASTRONOMIE",
                  title: "Lust auf einen Besuch.",
                },
                {
                  id: "raster",
                  label: "03 / ARCHITEKTUR",
                  title: "Raum für deine Arbeit.",
                },
              ].map(d => (
                <article key={d.id}>
                  <a
                    href={`/demo/${d.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`/landing/${d.id}.webp`}
                      alt={`Beispielwebsite ${d.id}`}
                      loading="lazy"
                      width="1200"
                      height="833"
                    />
                  </a>
                  <span className="bold-index">{d.label}</span>
                  <h3>{d.title}</h3>
                  <DemoLink id={d.id}>Website ansehen</DemoLink>
                </article>
              ))}
            </div>
            <p className="bold-example-note">
              20 Designrichtungen. Farben, Schriften und Inhalte, die deinen
              Auftritt zu deinem machen.
            </p>
          </div>
        </section>
        <section className="bold-process lc-width">
          <div>
            <p className="lc-eyebrow">Weniger organisieren. Mehr machen.</p>
            <h2>
              DU MACHST
              <br />
              DEIN DING.
              <br />
              <span>
                WIR DEN
                <br />
                ANFANG.
              </span>
            </h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <h3>Dein Betrieb ist der Ausgangspunkt.</h3>
                <p>
                  Firmenname eingeben, vorhandene Inhalte aus deinem
                  Google-Profil übernehmen. Du startest mit dem, was schon da
                  ist.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Dein Entwurf macht es sichtbar.</h3>
                <p>
                  Pageblitz verbindet Design, Texte und Bilder zu deiner
                  Website. Du siehst das Ergebnis, bevor du dich entscheidest.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Dein Auftritt bleibt in deiner Hand.</h3>
                <p>
                  Prüfen, anpassen, freischalten. Neue Bilder oder andere Texte?
                  Im Studio änderst du das selbst – auch später.
                </p>
              </div>
            </li>
          </ol>
        </section>
        <section className="bold-cost" id="preise">
          <div className="lc-width bold-cost-grid">
            <div>
              <p className="lc-eyebrow">Guter Auftritt. Klare Entscheidung.</p>
              <h2>
                DEIN ERSTER
                <br />
                ENTWURF?
                <br />
                <span>GEHT AUF UNS.</span>
              </h2>
              <p>
                Schau dir an, was aus deinem Betrieb werden kann. Die Vorschau
                ist kostenlos. Deinen Tarif wählst du erst, wenn dein Auftritt
                für dich stimmt.
              </p>
              <a className="lc-link" href="#start">
                Mit meinem Betrieb ausprobieren <ArrowRight size={18} />
              </a>
            </div>
            <Price dark />
          </div>
        </section>
        <section className="bold-questions lc-width">
          <div>
            <p className="lc-eyebrow">Klartext</p>
            <h2>
              GUT ZU
              <br />
              WISSEN.
            </h2>
          </div>
          <Questions />
        </section>
        <section className="bold-final" id="start">
          <div className="lc-width">
            <p className="lc-eyebrow">Dein Geschäft hat einen Namen.</p>
            <h2>
              MACHEN WIR
              <br />
              EINEN AUFTRITT
              <br />
              DARAUS.
            </h2>
            <StartForm id="bold-business" label="Meinen Auftritt entdecken" />
          </div>
        </section>
      </main>
      <div className="lc-width">
        <Footer />
      </div>
    </div>
  );
}

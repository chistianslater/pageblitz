import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import {
  photo,
  references,
  type Reference,
  type ReferenceId,
} from "./references";

function Photo({
  name,
  alt,
  hero = false,
}: {
  name: string;
  alt: string;
  hero?: boolean;
}) {
  return (
    <img
      src={photo(name)}
      alt={alt}
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : "auto"}
      width="1400"
      height="1000"
    />
  );
}

function Header({ r }: { r: Reference }) {
  return (
    <header className="ref-nav">
      <a href="#start" className="ref-logo" aria-label={`${r.name} Startseite`}>
        {r.name}
      </a>
      <nav aria-label="Hauptnavigation">
        <a href="#angebot">
          {r.theme === "restaurant" ? "Die Küche" : "Leistungen"}
        </a>
        <a href="#ueber">
          {r.theme === "architecture" ? "Arbeitsweise" : "Über uns"}
        </a>
        <a href="#kontakt" className="ref-nav-cta">
          {r.action}
          <ArrowUpRight size={16} />
        </a>
      </nav>
    </header>
  );
}

function Architecture({ r }: { r: Reference }) {
  const [study, setStudy] = useState(false);
  return (
    <>
      <section className="arch-hero" id="start">
        <div className="arch-heading">
          <p>Architektur im Bestand</p>
          <h1>
            Raum für das
            <br />
            Wesentliche.
          </h1>
          <div className="arch-intro">
            <p>{r.intro}</p>
            <a className="ref-link" href="#kontakt">
              {r.action}
              <ArrowUpRight />
            </a>
          </div>
        </div>
        <div className="arch-cover">
          <Photo
            name={r.hero}
            alt="Lichter Altbauraum mit hohen Fenstern und zurückhaltender Einrichtung"
            hero
          />
        </div>
      </section>
      <section className="arch-practice ref-section" id="ueber">
        <span className="ref-label">Unsere Haltung</span>
        <h2>{r.aboutTitle}</h2>
        <div className="arch-practice-grid">
          <Photo
            name={r.detail}
            alt="Architekturmodell auf einem Arbeitstisch im Atelier"
          />
          <p>{r.about}</p>
        </div>
      </section>
      <section className="arch-services ref-section" id="angebot">
        <h2>
          Vom ersten Gedanken
          <br />
          bis zum letzten Detail.
        </h2>
        <div>
          {r.services.map(([title, text]) => (
            <article key={title}>
              <Plus size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="arch-study ref-section">
        <div className="arch-study-heading">
          <p className="ref-label">Ein Raum, zwei Perspektiven</p>
          <h2>
            Vom Modell
            <br />
            zum Lebensraum.
          </h2>
          <div className="ref-switch" role="group" aria-label="Projektansicht">
            <button aria-pressed={!study} onClick={() => setStudy(false)}>
              Raumwirkung
            </button>
            <button aria-pressed={study} onClick={() => setStudy(true)}>
              Entwurfsarbeit
            </button>
          </div>
          <p>
            {study
              ? "Am Modell prüfen wir Proportionen, Blickachsen und das Zusammenspiel der Räume."
              : "Tageslicht und klare Sichtachsen geben dem Raum seine großzügige Wirkung."}
          </p>
        </div>
        <div className="arch-study-image" key={String(study)}>
          <Photo
            name={study ? r.detail : r.second}
            alt={
              study
                ? "Architekturmodell auf dem Entwurfstisch"
                : "Tageslicht in einem großzügigen Altbauraum"
            }
          />
        </div>
      </section>
    </>
  );
}

function Restaurant({ r }: { r: Reference }) {
  const [course, setCourse] = useState(0);
  const courses = [
    {
      name: "Pasta",
      title: "Frisch gedreht. Lang genossen.",
      image: r.hero,
      dishes: [
        ["Tagliatelle al ragù", "Langsam geschmortes Ragù, Parmesan"],
        ["Ravioli di ricotta", "Ricotta, Salbei, braune Butter"],
        ["Spaghetti al pomodoro", "Tomate, Basilikum, Olivenöl"],
      ],
    },
    {
      name: "Zum Teilen",
      title: "Für die Mitte des Tisches.",
      image: r.detail,
      dishes: [
        ["Burrata", "Saisonale Tomaten, Basilikum"],
        ["Verdure al forno", "Ofengemüse, Kräuter, Olivenöl"],
        ["Pane della casa", "Frisches Brot, gutes Olivenöl"],
      ],
    },
    {
      name: "Im Glas",
      title: "Ein guter Begleiter.",
      image: r.second,
      dishes: [
        ["Rosso", "Ein runder Rotwein zum kräftigen Gericht"],
        ["Bianco", "Ein frischer Weißwein für einen leichten Abend"],
        ["Senza alcol", "Fruchtige Aperitifs auch ohne Alkohol"],
      ],
    },
  ];
  const selected = courses[course];
  return (
    <>
      <section className="food-hero" id="start">
        <div className="food-heading">
          <p>Pasta, vino & gute Gesellschaft</p>
          <h1>
            Noch ein bisschen
            <br />
            <em>bleiben.</em>
          </h1>
          <p>{r.intro}</p>
          <a href="#kontakt" className="ref-button">
            {r.action}
            <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="food-cover">
          <Photo
            name={r.hero}
            alt="Frische Pasta auf einem Teller im warm beleuchteten Restaurant"
            hero
          />
        </div>
        <div className="food-wordmark" aria-hidden="true">
          SEMPRE
        </div>
      </section>
      <section className="food-menu ref-section" id="angebot">
        <p className="ref-label">Am liebsten zusammen</p>
        <h2>Auf den Tisch.</h2>
        <div
          className="food-menu-tabs"
          role="group"
          aria-label="Speisekartenbereich"
        >
          {courses.map((item, index) => (
            <button
              key={item.name}
              aria-pressed={course === index}
              onClick={() => setCourse(index)}
            >
              {item.name}
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>
        <div className="food-menu-grid">
          <div className="food-dish-image" key={selected.image}>
            <Photo
              name={selected.image}
              alt={`${selected.name}: Beispiel aus unserer Küche`}
            />
          </div>
          <div className="food-menu-paper" aria-live="polite">
            <p className="ref-label">Eine kleine Auswahl · Beispielkarte</p>
            <h3>{selected.title}</h3>
            {selected.dishes.map(([title, text]) => (
              <article key={title}>
                <h4>{title}</h4>
                <p>{text}</p>
              </article>
            ))}
            <p className="food-menu-note">
              Unsere Karte verändert sich mit der Saison.
            </p>
          </div>
        </div>
      </section>
      <section className="food-story ref-section" id="ueber">
        <div>
          <h2>{r.aboutTitle}</h2>
          <p>{r.about}</p>
          <a href="#kontakt" className="ref-link">
            Ein Abend bei uns
            <ArrowUpRight />
          </a>
        </div>
        <Photo
          name={r.detail}
          alt="Ein Pastagericht wird in der Küche frisch angerichtet"
        />
      </section>
    </>
  );
}

function Salon({ r }: { r: Reference }) {
  return (
    <>
      <section className="salon-hero" id="start">
        <div className="salon-heading">
          <p>Persönlich. Bis in die Spitzen.</p>
          <h1>
            Ein Schnitt.
            <br />
            <span>Ganz Sie.</span>
          </h1>
          <p>{r.intro}</p>
          <a href="#kontakt" className="ref-button">
            {r.action}
            <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="salon-cover">
          <Photo
            name={r.hero}
            alt="Persönliche Beratung und Haarschnitt im Salon"
            hero
          />
        </div>
        <div className="salon-inset">
          <Photo name={r.detail} alt="Detail der sorgfältigen Farbarbeit" />
        </div>
        <div className="salon-wordmark" aria-hidden="true">
          FORME
        </div>
      </section>
      <section className="salon-services ref-section" id="angebot">
        <h2>
          Eine gute Form
          <br />
          beginnt bei Ihnen.
        </h2>
        <div>
          {r.services.map(([title, text], i) => (
            <details key={title} open={i === 0}>
              <summary>
                {title}
                <Plus size={22} />
              </summary>
              <p>{text}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="salon-story ref-section" id="ueber">
        <Photo
          name={r.detail}
          alt="Eine Haarfarbe wird sorgfältig Strähne für Strähne aufgetragen"
        />
        <div>
          <p className="ref-label">Zeit für Ihren Stil</p>
          <h2>{r.aboutTitle}</h2>
          <p>{r.about}</p>
        </div>
      </section>
      <section className="salon-detail ref-section">
        <div>
          <h2>
            Gut aussehen.
            <br />
            Sich gut fühlen.
          </h2>
          <a href="#kontakt" className="ref-link">
            Wir nehmen uns Zeit
            <ArrowDown />
          </a>
        </div>
        <Photo
          name={r.second}
          alt="Werkzeuge und Details der Arbeit im Salon"
        />
      </section>
    </>
  );
}

function Contact({ r }: { r: Reference }) {
  const [sent, setSent] = useState(false);
  return (
    <section id="kontakt" className="ref-contact ref-section">
      <div>
        <p className="ref-label">Der nächste Schritt</p>
        <h2>{r.action}.</h2>
        <p>
          Diese Website ist eine fiktive Designstudie. Das Formular zeigt den
          Ablauf; es versendet und speichert keine Daten.
        </p>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <label>
          Ihr Name
          <input
            required
            name="name"
            autoComplete="name"
            placeholder="Vorname Nachname"
          />
        </label>
        <label>
          E-Mail
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@beispiel.de"
          />
        </label>
        <label>
          {r.theme === "restaurant"
            ? "Wunschtermin und Personenzahl"
            : "Was haben Sie vor?"}
          <textarea required name="message" rows={2} />
        </label>
        <button className="ref-button" type="submit">
          Anfrage ausprobieren
          <ArrowUpRight size={20} />
        </button>
        {sent && (
          <p role="status">
            So würde Ihre Bestätigung aussehen. Es wurde keine Anfrage
            versendet.
          </p>
        )}
      </form>
    </section>
  );
}

export function ReferenceSite({ id }: { id: ReferenceId }) {
  const r = references[id];
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("ref-entered");
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.12 }
    );
    root.current
      ?.querySelectorAll(".ref-section")
      .forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [id]);
  return (
    <div ref={root} className={`ref-site ref-${r.theme}`}>
      <a className="ref-skip" href="#start">
        Zum Inhalt
      </a>
      <Header r={r} />
      <main>
        {id === "architecture" ? (
          <Architecture r={r} />
        ) : id === "restaurant" ? (
          <Restaurant r={r} />
        ) : (
          <Salon r={r} />
        )}
        <Contact key={id} r={r} />
      </main>
      <footer className="ref-footer">
        <span className="ref-logo">{r.name}</span>
        <p>Fiktive Marke · Pageblitz Designstudie</p>
        <a href="#start">Nach oben ↑</a>
      </footer>
    </div>
  );
}

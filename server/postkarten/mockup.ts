/**
 * Laptop-Mockup für das Kartenmotiv (Betreiber-Wunsch 2026-09-13).
 *
 * Bis hierher lieferte die Aufnahme den nackten Seiten-Screenshot — den
 * Laptop malte das alte HeyMail-Template drumherum. Mit dem Template ist
 * der Rahmen verschwunden, und mit ihm die Aussage der Karte: Ein
 * randloser Screenshot sieht auf Papier aus wie ein Prospektbild, ein Bild
 * im Gerät sagt „das ist eine Website, und zwar deine".
 *
 * Deshalb entsteht der Rahmen jetzt hier. Als Vektor gezeichnet statt als
 * Foto eingekauft: Er bleibt in jeder Größe scharf, kostet keine Lizenz und
 * zeigt kein Markengerät, das auf einer Werbekarte Ärger machen könnte.
 *
 * Das Ergebnis ist ein PNG mit durchsichtigem Hintergrund — die Karte
 * bestimmt, worauf der Laptop steht, nicht dieses Modul.
 */
import sharp from "sharp";

/** Bildschirmfläche — 16:10, das Seitenverhältnis eines Notebooks. */
const SCHIRM_B = 1560;
const SCHIRM_H = 975;
/** Lage der Fläche im Deckel. */
const SCHIRM_X = 100;
const SCHIRM_Y = 22;
/** Deckel: unten mehr Rand als oben, wie bei einem echten Gerät. */
const DECKEL_X = 80;
const DECKEL_B = 1600;
const DECKEL_H = 1042;

const MOCKUP_BREITE = 1760;
const MOCKUP_HOEHE = 1136;

/**
 * Ausgeliefert wird quadratisch (Betreiber-Befund 2026-09-13).
 *
 * HeyMail erlaubt für dynamische Bilder nur quadratische Platzhalter und
 * zieht alles darauf — ein 1760x1136-Laptop käme gestaucht aus dem Drucker.
 * Der Rahmen liegt deshalb mittig auf einer quadratischen Fläche, der Rest
 * bleibt durchsichtig. Das Seitenverhältnis stimmt damit immer, egal wie
 * groß die Vorlage den Platzhalter zeichnet.
 */
export const MOCKUP_KANTE = MOCKUP_BREITE;
const RAND_OBEN = Math.round((MOCKUP_KANTE - MOCKUP_HOEHE) / 2);

/** Ecken der Bildschirmfläche — ohne sie stößt das Bild hart in den Rahmen. */
const SCHIRM_RADIUS = 6;

/**
 * Zwei Tonlagen. Die Karte hat einen dunklen Hintergrund — darauf
 * verschwindet ein schwarzer Laptop bis auf den Bildschirm, und übrig
 * bleibt ein schwebendes Rechteck (Betreiber-Befund 2026-09-13). Deshalb
 * ist Silber der Standard; `dunkel` bleibt für helle Karten.
 */
export type Tonlage = "hell" | "dunkel";

interface Palette {
  deckel: string;
  /** Kante des Deckels — auf dunklem Grund trennt sie Gerät und Karte. */
  kante: string;
  /** Schmaler Ring um die Bildschirmfläche. */
  ring: string;
  kamera: string;
  basisOben: string;
  basisUnten: string;
  mulde: string;
}

const PALETTEN: Record<Tonlage, Palette> = {
  hell: {
    deckel: "#e9e9ec",
    kante: "#c3c3cb",
    ring: "#b9b9c2",
    kamera: "#a8a8b2",
    basisOben: "#dededf",
    basisUnten: "#adadb6",
    mulde: "#c2c2cb",
  },
  dunkel: {
    deckel: "#17171a",
    kante: "#0d0d0f",
    ring: "#2c2c31",
    kamera: "#3a3a40",
    basisOben: "#3f3f46",
    basisUnten: "#232327",
    mulde: "#1b1b1f",
  },
};

function rahmenSvg(p: Palette): string {
  const basisOben = DECKEL_H + 2;
  const basisUnten = MOCKUP_HOEHE - 26;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${MOCKUP_BREITE}" height="${MOCKUP_HOEHE}">
  <defs>
    <linearGradient id="basis" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.basisOben}"/>
      <stop offset="1" stop-color="${p.basisUnten}"/>
    </linearGradient>
  </defs>
  <!-- Deckel -->
  <rect x="${DECKEL_X}" y="0" width="${DECKEL_B}" height="${DECKEL_H}" rx="22"
        fill="${p.deckel}" stroke="${p.kante}" stroke-width="2"/>
  <!-- Kamerapunkt: der kleine Beweis, dass es ein Gerät ist und kein Kasten -->
  <circle cx="${MOCKUP_BREITE / 2}" cy="12" r="3.5" fill="${p.kamera}"/>
  <!-- Ring um die Bildschirmfläche: Ohne ihn laufen helle Seiten in einen
       hellen Rahmen und der Bildschirm verliert seine Kante. -->
  <rect x="${SCHIRM_X - 1}" y="${SCHIRM_Y - 1}" width="${SCHIRM_B + 2}" height="${SCHIRM_H + 2}"
        rx="${SCHIRM_RADIUS + 1}" fill="none" stroke="${p.ring}" stroke-width="2"/>
  <!-- Scharnier und Unterteil, unten breiter als der Deckel -->
  <path d="M ${DECKEL_X - 40} ${basisOben}
           L ${DECKEL_X + DECKEL_B + 40} ${basisOben}
           L ${MOCKUP_BREITE - 4} ${basisUnten}
           Q ${MOCKUP_BREITE} ${basisUnten} ${MOCKUP_BREITE - 14} ${MOCKUP_HOEHE}
           L 14 ${MOCKUP_HOEHE}
           Q 0 ${basisUnten} 4 ${basisUnten} Z"
        fill="url(#basis)"/>
  <!-- Griffmulde -->
  <rect x="${MOCKUP_BREITE / 2 - 95}" y="${basisOben + 1}" width="190" height="11" rx="6" fill="${p.mulde}"/>
</svg>`;
}

function schirmMaske(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SCHIRM_B}" height="${SCHIRM_H}">
  <rect width="${SCHIRM_B}" height="${SCHIRM_H}" rx="${SCHIRM_RADIUS}" fill="#fff"/>
</svg>`;
}

/**
 * Setzt die Aufnahme in den Laptop.
 *
 * Der Ausschnitt wird zugeschnitten, nicht gestaucht (`fit: "cover"`, oben
 * ausgerichtet): Eine verzerrte Website auf einer Karte, die für Websites
 * wirbt, wäre die schlechteste aller Anzeigen.
 */
export async function laptopMockup(
  aufnahme: Buffer,
  tonlage: Tonlage = "hell"
): Promise<Buffer> {
  const schirm = await sharp(aufnahme)
    .resize({
      width: SCHIRM_B,
      height: SCHIRM_H,
      fit: "cover",
      position: "top",
    })
    .composite([{ input: Buffer.from(schirmMaske()), blend: "dest-in" }])
    .png()
    .toBuffer();

  const laptop = await sharp(Buffer.from(rahmenSvg(PALETTEN[tonlage])))
    .composite([{ input: schirm, left: SCHIRM_X, top: SCHIRM_Y }])
    .png()
    .toBuffer();

  // Auf quadratisch bringen, statt es HeyMail überlassen: Der Platzhalter
  // dort ist quadratisch und verzerrt, was nicht passt.
  return sharp({
    create: {
      width: MOCKUP_KANTE,
      height: MOCKUP_KANTE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: laptop, left: 0, top: RAND_OBEN }])
    .png()
    .toBuffer();
}

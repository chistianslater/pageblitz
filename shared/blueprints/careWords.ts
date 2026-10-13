/**
 * Branchen-Erkennung für Freundlich (2026-10-13): Kinder & Familie, Tiere,
 * Eis, Musik/Nachhilfe, Kinderfotografie. Nur GANZE Wörter (Kategorie bzw.
 * Name in Wörter zerlegt, jedes Wort gegen einen verankerten Ausdruck) —
 * kein Teilstring: „Arzt" ist kein Tierarzt, „Hundepension" kein Hundesalon,
 * „Café" keine Eisdiele, „Tagespflege" (Senioren) keine Kita. Komposita
 * zählen nur dort, wo der Ausdruck sie ausdrücklich nennt
 * („Waldkindergarten", „Tierarztpraxis"). Keine Lookbehind-Ausdrücke.
 */

/** Neue Bauplan-Familien: Kinder & Familie, Tiere. */
export type CareFamilyId = "family" | "pets";

/** Unterart der Familie Tiere — steuert Bauplan und Systemreihe. */
export type PetKind = "vet" | "grooming" | "school" | "shop";

/**
 * Kleinbuchstaben, Wörter aus Buchstaben/Ziffern (Bindestrich, _ und /
 * trennen). Akzente außer Umlauten fallen weg („Eiscafé" → „eiscafe").
 */
export function careWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[éèêë]/g, "e")
    .replace(/[áàâ]/g, "a")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòô]/g, "o")
    .replace(/[úùû]/g, "u")
    .replace(/ç/g, "c")
    .replace(/ñ/g, "n")
    .split(/[^a-zäöüß0-9]+/)
    .filter(Boolean);
}

/** Wortfolge als Text mit Rand-Leerzeichen — für englische Mehrwort-Begriffe. */
function phraseText(words: readonly string[]): string {
  return ` ${words.join(" ")} `;
}

const anyWord = (words: readonly string[], re: RegExp) => words.some(w => re.test(w));
const anyPhrase = (words: readonly string[], phrases: readonly string[]) => {
  const text = phraseText(words);
  return phrases.some(p => text.includes(` ${p} `));
};

/* ── Kinder & Familie ───────────────────────────────────────────────────── */

const CHILDCARE_WORD =
  /^(kitas?|kindertagesst(ä|ae)tten?|kindertagespflege[a-zäöüß]*|(gro(ß|ss))?tagespflegestelle|[a-zäöüß]*kindergarten|[a-zäöüß]*kindergärten|kinderkrippen?|krippen?|kinderhaus|kinderhäuser|kinderbetreuung[a-zäöüß]*|tagesm(u|ü)tter|tagesv(a|ä)ter|tageseltern|(gro(ß|ss))tagespflege|preschool|daycare|childcare)$/;
const CHILDCARE_PHRASES = ["child care", "nursery school", "family day care"];
/** „day care" nur für Kinder — nicht „adult/dog/pet day care". */
function isKidsDayCare(words: readonly string[]): boolean {
  const text = phraseText(words);
  return (
    text.includes(" day care ") &&
    !/ (adult|senior|seniors|dog|dogs|pet|pets|elderly) day care /.test(text)
  );
}

const MIDWIFE_WORD =
  /^(hebammen?[a-zäöüß]*|geburtsh(a|ä)us(er)?|geburtsvorbereitung[a-zäöüß]*|stillberatung|midwife|midwives|midwifery)$/;
const MIDWIFE_PHRASES = ["birth center", "birthing center"];

export function isChildcare(text: string): boolean {
  const w = careWords(text);
  return anyWord(w, CHILDCARE_WORD) || anyPhrase(w, CHILDCARE_PHRASES) || isKidsDayCare(w);
}

export function isMidwife(text: string): boolean {
  const w = careWords(text);
  return anyWord(w, MIDWIFE_WORD) || anyPhrase(w, MIDWIFE_PHRASES);
}

/* ── Tiere ──────────────────────────────────────────────────────────────── */

const VET_WORD =
  /^((klein|gro(ß|ss)|fach|pferde|nutz)?tier(arzt|ärzt|aerzt)[a-zäöüß]*|tierklinik[a-zäöüß]*|(klein)?tierpraxis|tiermedizin[a-zäöüß]*|tierheilprakti[a-zäöüß]*|tierphysiotherap[a-zäöüß]*|tierosteopath[a-zäöüß]*|veterin(ä|ae)r[a-zäöüß]*|veterinarian|veterinary|vet)$/;
const VET_PHRASES = ["animal hospital", "animal clinic"];

const GROOMING_WORD =
  /^(hunde|katzen|tier|haustier)(salons?|friseur[a-zäöüß]*|frisör[a-zäöüß]*|pflegesalon|pflegestudio|pflege)$/;
const GROOMING_PHRASES = ["dog groomer", "dog grooming", "pet groomer", "pet grooming", "cat groomer"];

const DOG_SCHOOL_WORD =
  /^((hunde|welpen)schule[a-zäöüß]*|hundetrain(er|erin|ing)|hundeerziehung)$/;
const DOG_SCHOOL_PHRASES = ["dog trainer", "dog training", "puppy school"];

const PET_SHOP_WORD =
  /^(tierbedarf|heimtierbedarf|haustierbedarf|hundebedarf|katzenbedarf|zoofachhandel|zoofachgeschäft|zoofachmarkt|zoohandlung|zooladen|zoogeschäft|tierhandlung|tierhandel|tierfutter[a-zäöüß]*|tiernahrung)$/;
const PET_SHOP_PHRASES = ["pet store", "pet shop", "pet supply", "pet supplies"];

export function petKind(text: string): PetKind | undefined {
  const w = careWords(text);
  if (anyWord(w, VET_WORD) || anyPhrase(w, VET_PHRASES)) return "vet";
  if (anyWord(w, GROOMING_WORD) || anyPhrase(w, GROOMING_PHRASES)) return "grooming";
  if (anyWord(w, DOG_SCHOOL_WORD) || anyPhrase(w, DOG_SCHOOL_PHRASES)) return "school";
  if (anyWord(w, PET_SHOP_WORD) || anyPhrase(w, PET_SHOP_PHRASES)) return "shop";
  return undefined;
}

/**
 * Neue Familie aus einem Text (Kategorie oder Name) — `undefined`, wenn
 * keins der Zielwörter vorkommt. Tiere vor Kindern („Hundekita" gibt es
 * nicht als Wort, „Tierarzt" schon).
 */
export function careFamily(text: string): CareFamilyId | undefined {
  if (!text.trim()) return undefined;
  if (petKind(text)) return "pets";
  if (isChildcare(text) || isMidwife(text)) return "family";
  return undefined;
}

/* ── Freundliche Unterarten bestehender Familien ────────────────────────── */

const ICE_CREAM_WORD =
  /^(eisdielen?|eiscafes?|eissalons?|eisladen|eismanufaktur|eiskonditorei|gelateria|gelaterie|gelato|speiseeis|softeis)$/;
const ICE_CREAM_PHRASES = ["ice cream", "frozen yogurt"];

/** Eisdiele, Eiscafé, Gelateria — nicht jedes Café. */
export function isIceCream(text: string): boolean {
  const w = careWords(text);
  return anyWord(w, ICE_CREAM_WORD) || anyPhrase(w, ICE_CREAM_PHRASES);
}

const KIDS_LESSONS_WORD =
  /^(musikschule[a-zäöüß]*|musikunterricht|musiklehrer(in)?|musikpädagog[a-zäöüß]*|früherziehung|instrumentalunterricht|klavierunterricht|gitarrenunterricht|gesangsunterricht|klavierlehrer(in)?|gitarrenlehrer(in)?|nachhilfe[a-zäöüß]*|lernstudio[a-zäöüß]*|lernförderung|lernfoerderung|lernzentrum|hausaufgabenbetreuung|hausaufgabenhilfe|schülerhilfe|schuelerhilfe|(kinder|baby)(turnen|yoga|tanz|tanzen|schwimmen|schwimmschule|ballett|sport|kurse?))$/;
const KIDS_LESSONS_PHRASES = ["music school", "music lessons", "music instructor", "music teacher", "tutoring", "private tutor", "tutor", "baby swimming"];

/** Musikschule, Nachhilfe, Lernstudio, Kinderkurse — nicht Fitness, Tanzschule, Fahrschule. */
export function isKidsLessons(text: string): boolean {
  const w = careWords(text);
  return anyWord(w, KIDS_LESSONS_WORD) || anyPhrase(w, KIDS_LESSONS_PHRASES);
}

const KIDS_PHOTO_WORD =
  /^(kinder|baby|babybauch|neugeborenen|newborn|familien|schwangerschafts)fotogra[a-zäöüß]*$/;
const KIDS_PHOTO_PHRASES = ["baby photographer", "newborn photographer", "family photographer", "child photographer"];

/** Kinder-, Baby-, Neugeborenen-, Familienfotografie — nicht jeder Fotograf. */
export function isKidsPhoto(text: string): boolean {
  const w = careWords(text);
  return anyWord(w, KIDS_PHOTO_WORD) || anyPhrase(w, KIDS_PHOTO_PHRASES);
}

const PEDIATRIC_WORD =
  /^(kinder(zahn)?(arzt|ärzt|aerzt)[a-zäöüß]*|kinder(zahn)?heilkunde|kindermedizin|jugendarzt[a-zäöüß]*|jugendärzt[a-zäöüß]*|jugendmedizin|pediatric[a-z]*|pediatrician|paediatric[a-z]*)$/;

/** Kinder- und Jugendarzt, Kinderzahnarzt — bleibt Gesundheit (Klar). */
export function isPediatric(text: string): boolean {
  return anyWord(careWords(text), PEDIATRIC_WORD);
}

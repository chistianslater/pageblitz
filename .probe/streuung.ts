import { pickPackColorWorld, pickPackFontPair } from "../shared/stylePacks/packVariants";
const namen = ["Friseur Bocholt by Aras","Haar Galerie","Friseur Marmaris","Hairlounge Hachtkemper","Infinity coiffeur & Barbier","Jaguar Friseur","Eleganz Friseursalon","Friseursalon ByMemo","Goldene Schere","Figaro Ingo Damhus","Salon Sondermann","Manfred Wagner"];
for (const pack of ["salon-noir", "patina", "werkbank"] as const) {
  console.log("\n" + pack);
  const paare = new Set<string>();
  for (const n of namen) {
    const f = pickPackFontPair(pack, n), w = pickPackColorWorld(pack, n);
    paare.add(`${f}|${w}`);
    console.log("  " + n.padEnd(30) + f.padEnd(12) + w);
  }
  console.log(`  → ${paare.size} verschiedene Kombinationen bei ${namen.length} Betrieben`);
}

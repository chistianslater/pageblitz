/**
 * Translates Google My Business category strings (English) to German.
 * GMB returns categories in the language of the API request; even with language=de
 * some categories come back in English. This map covers the most common ones.
 */
const GMB_CATEGORY_MAP: Record<string, string> = {
  // Food & Beverage
  "Restaurant": "Restaurant",
  "Italian restaurant": "Italienisches Restaurant",
  "Chinese restaurant": "Chinesisches Restaurant",
  "Japanese restaurant": "Japanisches Restaurant",
  "Mexican restaurant": "Mexikanisches Restaurant",
  "Indian restaurant": "Indisches Restaurant",
  "Thai restaurant": "Thailändisches Restaurant",
  "Greek restaurant": "Griechisches Restaurant",
  "Turkish restaurant": "Türkisches Restaurant",
  "Vietnamese restaurant": "Vietnamesisches Restaurant",
  "French restaurant": "Französisches Restaurant",
  "American restaurant": "Amerikanisches Restaurant",
  "Sushi restaurant": "Sushi-Restaurant",
  "Pizza restaurant": "Pizzeria",
  "Pizzeria": "Pizzeria",
  "Fast food restaurant": "Fast-Food-Restaurant",
  "Burger restaurant": "Burger-Restaurant",
  "Steakhouse": "Steakhouse",
  "Seafood restaurant": "Fischrestaurant",
  "Vegetarian restaurant": "Vegetarisches Restaurant",
  "Vegan restaurant": "Veganes Restaurant",
  "Café": "Café",
  "Cafe": "Café",
  "Coffee shop": "Café",
  "Bakery": "Bäckerei",
  "Pastry shop": "Konditorei",
  "Confectionery": "Konditorei",
  "Ice cream shop": "Eisdiele",
  "Bar": "Bar",
  "Pub": "Kneipe",
  "Wine bar": "Weinbar",
  "Cocktail bar": "Cocktailbar",
  "Nightclub": "Nachtclub",
  "Brewery": "Brauerei",
  "Catering service": "Catering",
  "Food delivery": "Lieferservice",
  "Meal delivery": "Lieferservice",
  "Meal takeaway": "Abholservice",
  "Bistro": "Bistro",
  "Tapas bar": "Tapas-Bar",
  "Cafeteria": "Kantine",
  "Diner": "Diner",
  "Snack bar": "Imbiss",
  "Pizza takeaway": "Pizzeria (Abholung)",
  "Pizza delivery": "Pizzaservice",
  "Steak house": "Steakhouse",
  "Seafood": "Fischspezialitäten",
  "Bakery and cake shop": "Bäckerei & Konditorei",
  "Cafe and restaurant": "Café & Restaurant",

  // Beauty & Wellness
  "Hair salon": "Friseursalon",
  "Hairdresser": "Friseur",
  "Hair care": "Friseur",
  "Haircare": "Friseur",
  "Barber shop": "Barbershop",
  "Beauty salon": "Beautysalon",
  "Beauty center": "Beauty-Center",
  "Beauty school": "Kosmetikschule",
  "Beauty supply store": "Kosmetikgeschäft",
  "Skin care clinic": "Hautpflege-Klinik",
  "Nail salon": "Nagelstudio",
  "Spa": "Spa",
  "Day spa": "Day Spa",
  "Massage therapist": "Massagepraxis",
  "Massage": "Massage",
  "Tattoo shop": "Tattoostudio",
  "Piercing shop": "Piercingstudio",
  "Tanning salon": "Sonnenstudio",
  "Eyebrow bar": "Augenbrauen-Studio",
  "Eyelash salon": "Wimpernstudio",
  "Cosmetics store": "Kosmetikgeschäft",
  "Cosmetics": "Kosmetik",
  "Esthetician": "Kosmetikerin",
  "Waxing hair removal service": "Waxing-Studio",
  "Wellness center": "Wellness-Center",
  "Wellness program": "Wellness-Programm",
  "Wellness": "Wellness",
  "Naturopath": "Heilpraktiker",
  "Yoga center": "Yogazentrum",
  "Pilates": "Pilates",

  // Health & Medical
  "Doctor": "Arzt",
  "General practitioner": "Allgemeinarzt",
  "Dentist": "Zahnarzt",
  "Dental clinic": "Zahnarztpraxis",
  "Orthodontist": "Kieferorthopäde",
  "Physiotherapist": "Physiotherapeut",
  "Physical therapist": "Physiotherapeut",
  "Chiropractor": "Chiropraktiker",
  "Optician": "Optiker",
  "Pharmacy": "Apotheke",
  "Hospital": "Krankenhaus",
  "Clinic": "Klinik",
  "Medical clinic": "Arztpraxis",
  "Psychologist": "Psychologe",
  "Therapist": "Therapeut",
  "Veterinarian": "Tierarzt",
  "Veterinary clinic": "Tierarztpraxis",
  "Nutritionist": "Ernährungsberater",

  // Fitness & Sports
  "Gym": "Fitnessstudio",
  "Fitness center": "Fitnessstudio",
  "Fitness studio": "Fitnessstudio",
  "Personal trainer": "Personal Trainer",
  "Yoga studio": "Yogastudio",
  "Pilates studio": "Pilates-Studio",
  "Martial arts school": "Kampfsportschule",
  "Dance school": "Tanzschule",
  "Swimming pool": "Schwimmbad",
  "Sports club": "Sportverein",
  "Golf club": "Golfclub",
  "Tennis club": "Tennisclub",
  "Crossfit gym": "CrossFit-Studio",
  "Boxing gym": "Boxstudio",

  // Construction & Trades
  "Contractor": "Bauunternehmen",
  "General contractor": "Generalunternehmer",
  "Construction company": "Bauunternehmen",
  "Electrician": "Elektriker",
  "Plumber": "Klempner",
  "Roofer": "Dachdecker",
  "Roofing contractor": "Dachdeckerbetrieb",
  "Painter": "Maler",
  "Painting contractor": "Malerbetrieb",
  "Carpenter": "Schreiner",
  "Joiner": "Schreiner",
  "Flooring contractor": "Bodenleger",
  "Tile contractor": "Fliesenleger",
  "Landscaper": "Gartenbauer",
  "Landscaping": "Gartengestaltung",
  "Heating contractor": "Heizungsbauer",
  "HVAC contractor": "Heizung & Klima",
  "Insulation contractor": "Dämmtechnik",
  "Window installation service": "Fensterbauer",
  "Locksmith": "Schlüsseldienst",
  "Moving company": "Umzugsunternehmen",
  "Cleaning service": "Reinigungsservice",
  "Janitorial service": "Gebäudereinigung",

  // Automotive
  "Auto repair shop": "Autowerkstatt",
  "Car repair": "Autowerkstatt",
  "Car dealership": "Autohaus",
  "Used car dealer": "Gebrauchtwagenhändler",
  "Car wash": "Autowaschanlage",
  "Tire shop": "Reifenservice",
  "Auto body shop": "Karosseriebau",
  "Motorcycle dealer": "Motorradhändler",

  // Legal & Finance
  "Lawyer": "Rechtsanwalt",
  "Law firm": "Anwaltskanzlei",
  "Attorney": "Rechtsanwalt",
  "Notary": "Notar",
  "Accountant": "Steuerberater",
  "Tax preparation service": "Steuerberatung",
  "Financial advisor": "Finanzberater",
  "Insurance agency": "Versicherungsagentur",
  "Bank": "Bank",
  "Credit union": "Kreditgenossenschaft",

  // Real Estate
  "Real estate agency": "Immobilienmakler",
  "Real estate agent": "Immobilienmakler",
  "Property management company": "Hausverwaltung",
  "Architect": "Architekt",
  "Interior designer": "Innenarchitekt",

  // IT & Technology
  "Software company": "Softwareunternehmen",
  "IT service": "IT-Dienstleister",
  "Computer repair service": "Computerreparatur",
  "Web design company": "Webdesign-Agentur",
  "Marketing agency": "Marketingagentur",
  "Advertising agency": "Werbeagentur",
  "Graphic designer": "Grafikdesigner",
  "Photographer": "Fotograf",
  "Photography studio": "Fotostudio",
  "Video production service": "Videoproduktion",

  // Education
  "School": "Schule",
  "Tutoring service": "Nachhilfe",
  "Language school": "Sprachschule",
  "Driving school": "Fahrschule",
  "Music school": "Musikschule",
  "Art school": "Kunstschule",
  "Preschool": "Kindergarten",
  "Kindergarten": "Kindergarten",
  "Day care center": "Kindertagesstätte",

  // Hospitality
  "Hotel": "Hotel",
  "Motel": "Motel",
  "Bed and breakfast": "Pension",
  "Guest house": "Gästehaus",
  "Hostel": "Hostel",
  "Vacation rental": "Ferienwohnung",
  "Resort": "Resort",
  "Event venue": "Veranstaltungsort",
  "Wedding venue": "Hochzeitslocation",

  // Retail
  "Clothing store": "Bekleidungsgeschäft",
  "Shoe store": "Schuhgeschäft",
  "Jewelry store": "Juwelier",
  "Bookstore": "Buchhandlung",
  "Electronics store": "Elektronikgeschäft",
  "Furniture store": "Möbelgeschäft",
  "Home goods store": "Haushaltswarengeschäft",
  "Supermarket": "Supermarkt",
  "Grocery store": "Lebensmittelgeschäft",
  "Butcher shop": "Metzgerei",
  "Florist": "Blumengeschäft",
  "Pet store": "Tierhandlung",
  "Toy store": "Spielzeuggeschäft",
  "Sports goods store": "Sportgeschäft",
  "Hardware store": "Baumarkt",
  "Garden center": "Gartencenter",

  // Services
  "Travel agency": "Reisebüro",
  "Event planner": "Eventplaner",
  "Wedding planner": "Hochzeitsplaner",
  "Funeral home": "Bestattungsunternehmen",
  "Laundry service": "Wäscherei",
  "Dry cleaner": "Reinigung",
  "Tailor": "Schneider",
  "Printing service": "Druckerei",
  "Courier service": "Kurierdienst",
  "Storage facility": "Lagerhaus",
};

/**
 * Translates a GMB category string to German.
 * Falls back to the original string if no translation is found.
 */
export function translateGmbCategory(category: string): string {
  if (!category) return category;
  
  // Direct match
  if (GMB_CATEGORY_MAP[category]) {
    return GMB_CATEGORY_MAP[category];
  }
  
  // Case-insensitive match
  const lower = category.toLowerCase();
  const key = Object.keys(GMB_CATEGORY_MAP).find(k => k.toLowerCase() === lower);
  if (key) return GMB_CATEGORY_MAP[key];
  
  // Partial match – check if any key is contained in the category string
  const partialKey = Object.keys(GMB_CATEGORY_MAP).find(k => 
    lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  );
  if (partialKey) return GMB_CATEGORY_MAP[partialKey];
  
  // Return original if no match found
  return category;
}

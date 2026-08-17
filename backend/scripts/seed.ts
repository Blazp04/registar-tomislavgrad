import { db } from "../src/core/database/db.js";
import { codebook, type CodebookType } from "../src/core/database/codebook-schema.js";

const values: Record<CodebookType, string[]> = {
  country: ["Bosna i Hercegovina", "Hrvatska", "Slovenija", "Srbija", "Crna Gora", "Austrija", "Njemačka"],
  city: ["Tomislavgrad", "Mostar", "Sarajevo", "Split", "Zagreb", "Banja Luka", "Tuzla", "Osijek", "Rijeka"],
  municipality_settlement: [
    "Tomislavgrad", "Bukovica", "Cebara", "Crvenice", "Ćavarov Stan", "Dobrići", "Eminovo Selo", "Galečić",
    "Grabovica", "Jošanica", "Kolo", "Kongora", "Korita", "Kovači", "Krnjin", "Kuk", "Letka", "Lipa", "Lug",
    "Mandino Selo", "Mesihovina", "Mokronoge", "Mrkodol", "Omerovići", "Omolje", "Oplećani", "Prisoje", "Radoši",
    "Rašćani", "Roško Polje", "Sarajlije", "Seonica", "Srđani", "Stipanići", "Šujica", "Vinica", "Vojkovići", "Zaljiće", "Zidine",
  ],
  high_school: ["Gimnazija Marka Marulića Tomislavgrad", "Srednja strukovna škola Tomislavgrad"],
  university: ["Sveučilište u Mostaru", "Univerzitet u Sarajevu", "Sveučilište u Splitu", "Sveučilište u Zagrebu", "Univerzitet u Banjoj Luci"],
  faculty: [],
  study_program: [],
  study_level: ["Preddiplomski studij", "Diplomski studij", "Integrirani studij", "Stručni studij", "Poslijediplomski studij"],
  scholarship_type: ["Općinska stipendija", "Županijska stipendija", "Državna stipendija", "Privatna stipendija"],
  scholarship_provider: ["Općina Tomislavgrad", "Hercegbosanska županija", "Federalno ministarstvo obrazovanja i znanosti"],
};

for (const [type, names] of Object.entries(values) as Array<[CodebookType, string[]]>) {
  if (names.length === 0) continue;
  await db.insert(codebook).values(names.map((name) => ({ type, name, isOfficial: true }))).onConflictDoNothing();
}

console.log("Početni šifrarnici su uneseni. Veliki šifrarnici podržavaju korisničku opciju 'Nije na popisu'.");
process.exit(0);

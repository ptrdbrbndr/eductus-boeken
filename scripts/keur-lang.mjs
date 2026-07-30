/**
 * Keurt aangeleverde lang-blokken voordat ze in de data komen.
 * Gebruik: node scripts/keur-lang.mjs <bestand.json> [meer.json ...]
 *
 * Controleert de structuur die build.mjs afdwingt, plus de afspraken die de
 * build niet kan zien: woordental per soort boek, verboden opmaak en de
 * frasen waar de anti-AI-lint op afgaat. Faalt met exit 1, zodat dit in een
 * keten te gebruiken is.
 */
import { readFileSync, readdirSync } from "node:fs";

const BOEKEN = readdirSync("data").filter(f => /^boeken-\d+\.json$/.test(f))
  .flatMap(f => JSON.parse(readFileSync("data/" + f, "utf8")));

const VERBODEN = [
  "krachtig", "uniek", "ongekend", "optimaal", "unlock", "essentieel",
  "fascinerend", "moeiteloos", "revolutionair", "transformeren", "kortom",
  "samenvattend", "onmisbaar", "naadloos", "baanbrekend", "cruciaal",
];

const kaal = s => String(s).replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&middot;/g, "·");

let fouten = 0;
const meld = (waar, tekst) => { console.error(`  ${waar}: ${tekst}`); fouten++; };

for (const pad of process.argv.slice(2)) {
  let data;
  try { data = JSON.parse(readFileSync(pad, "utf8")); }
  catch (e) { meld(pad, "ongeldige JSON: " + e.message); continue; }

  console.log(`\n${pad}`);
  for (const [sleutel, L] of Object.entries(data)) {
    const nr = Number(sleutel);
    const boek = BOEKEN.find(b => b.nr === nr);
    const waar = `nr ${nr}` + (boek ? ` (${kaal(boek.titel)})` : "");
    if (!boek) { meld(waar, "dit nummer bestaat niet in de lijst"); continue; }

    if (typeof L.stelling !== "string" || L.stelling.length < 200)
      meld(waar, "stelling ontbreekt of is korter dan 200 tekens");
    if (!Array.isArray(L.opbouw) || L.opbouw.length < 3)
      meld(waar, "opbouw heeft minder dan 3 delen");
    else for (const d of L.opbouw)
      if (!d.kop || !Array.isArray(d.tekst) || !d.tekst.length)
        meld(waar, `deel zonder kop of tekst: ${d.kop || "(geen kop)"}`);
    if (!Array.isArray(L.begrippen) || L.begrippen.length < 5)
      meld(waar, "minder dan 5 begrippen");
    else for (const g of L.begrippen)
      if (!g.term || !g.uitleg) meld(waar, "begrip zonder term of uitleg");
    for (const veld of ["bewijs", "kritiek", "toepassing"])
      if (L[veld] !== undefined && (!Array.isArray(L[veld]) || !L[veld].length))
        meld(waar, `${veld} is leeg`);
    for (const v of L.verder || []) {
      if (!BOEKEN.some(b => b.nr === v.nr)) meld(waar, `verder verwijst naar onbekend nr ${v.nr}`);
      if (v.nr === nr) meld(waar, "verder verwijst naar zichzelf");
      if (!v.tekst) meld(waar, "verder zonder tekst");
    }

    // Zelfde telling als build.mjs op de boekpagina toont, zodat het getal
    // hier overeenkomt met wat de lezer straks in de kop ziet staan.
    const lopend = kaal([
      L.stelling,
      ...(L.opbouw || []).flatMap(d => [d.kop, ...(d.tekst || [])]),
      ...(L.begrippen || []).map(g => g.term + " " + g.uitleg),
      ...(L.bewijs || []), ...(L.kritiek || []), ...(L.toepassing || []),
      ...(L.verder || []).map(v => v.tekst),
    ].join(" "));
    const woorden = lopend.split(/\s+/).filter(Boolean).length;
    // Te kort is een gebrek en blokkeert. Te lang is een signaal om te kijken
    // of er vulling in zit; is de tekst dicht en onderbouwd, dan mag hij lang
    // zijn. Kwaliteit gaat voor de bandbreedte.
    if (woorden < 850) meld(waar, `te kort: ${woorden} woorden`);
    if (woorden > 2200) console.log(`  let op: ${waar} is ${woorden} woorden, ` +
      `controleer op vulling voordat je het overneemt`);

    const alles = kaal(JSON.stringify(L));
    if (alles.includes("—")) meld(waar, "bevat een em-dash");
    for (const w of VERBODEN)
      if (new RegExp(w, "i").test(alles)) meld(waar, `bevat verboden woord: ${w}`);
    const tags = [...JSON.stringify(L).matchAll(/<(\/?)([a-z]+)[^>]*>/gi)].map(m => m[2].toLowerCase());
    for (const t of new Set(tags))
      if (!["i", "b"].includes(t)) meld(waar, `ongeldige html-tag: <${t}>`);

    console.log(`  ${String(nr).padStart(3)}  ${String(woorden).padStart(4)} woorden  ` +
      `${(L.opbouw || []).length} delen  ${(L.begrippen || []).length} begrippen  ` +
      `${L.toepassing ? "met" : "zonder"} toepassing`);
  }
}

if (fouten) { console.error(`\n${fouten} punt(en) om te herstellen.`); process.exit(1); }
console.log("\nGeen bezwaren.");

/**
 * Toont de voortgang van de uitgebreide samenvattingen als matrix.
 * Gebruik: node scripts/voortgang.mjs [--md]
 *
 * De prioriteit staat in data/prioriteit.json: een lijst van batches met een
 * naam en de nummers die erin horen. Titels die daar niet in staan vallen in
 * de laatste groep. Zo blijft de volgorde een keuze in de data en geen
 * afspraak in iemands hoofd.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lees = p => JSON.parse(readFileSync(join(root, p), "utf8"));

const BOEKEN = readdirSync(join(root, "data"))
  .filter(f => /^boeken-\d+\.json$/.test(f)).sort()
  .flatMap(f => lees(join("data", f)))
  .sort((a, b) => a.nr - b.nr);

const BATCHES = lees("data/prioriteit.json");
const inBatch = new Set(BATCHES.flatMap(b => b.nrs));
const rest = BOEKEN.filter(b => !inBatch.has(b.nr)).map(b => b.nr);
if (rest.length) BATCHES.push({ naam: "Nog in te delen", nrs: rest });

const md = process.argv.includes("--md");
const kaal = s => s.replace(/<[^>]+>/g, "");
const heeft = nr => !!(BOEKEN.find(b => b.nr === nr) || {}).lang;

let totKlaar = 0, totAl = 0;
const rijen = [];
for (const b of BATCHES) {
  const bestaand = b.nrs.filter(nr => BOEKEN.some(x => x.nr === nr));
  const klaar = bestaand.filter(heeft);
  const open = bestaand.filter(nr => !heeft(nr));
  totKlaar += klaar.length; totAl += bestaand.length;
  rijen.push({
    batch: b.naam,
    klaar: `${klaar.length}/${bestaand.length}`,
    gedaan: klaar.join(", ") || "-",
    tedoen: open.join(", ") || "-",
    status: open.length === 0 ? "klaar" : (klaar.length ? "bezig" : "open"),
  });
}

if (md) {
  console.log(`| Batch | Klaar | Al gedaan (nrs) | Nog te doen (nrs) | Status |`);
  console.log(`| --- | --- | --- | --- | --- |`);
  for (const r of rijen)
    console.log(`| ${r.batch} | ${r.klaar} | ${r.gedaan} | ${r.tedoen} | ${r.status} |`);
  console.log(`| **Totaal** | **${totKlaar}/${totAl}** | | | |`);
} else {
  const br = Math.max(...rijen.map(r => r.batch.length));
  for (const r of rijen)
    console.log(`${r.batch.padEnd(br)}  ${r.klaar.padStart(7)}  ${r.status.padEnd(6)}  te doen: ${r.tedoen}`);
  console.log(`\n${totKlaar} van de ${totAl} titels heeft een uitgebreide samenvatting ` +
    `(${Math.round(100 * totKlaar / totAl)}%).`);
  const woorden = BOEKEN.filter(b => b.lang).map(b =>
    kaal([b.lang.stelling, ...b.lang.opbouw.flatMap(d => d.tekst)].join(" ")).split(/\s+/).length);
  if (woorden.length)
    console.log(`Gemiddeld ${Math.round(woorden.reduce((a, x) => a + x, 0) / woorden.length)} woorden per uitgewerkte titel.`);
}

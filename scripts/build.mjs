/**
 * Bouwt index.html en boekenlijst.md uit data/boeken-*.json.
 * Gebruik: node scripts/build.mjs [--datum "29 juli 2026"]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lees = p => readFileSync(join(root, p), "utf8");
const leesJson = p => JSON.parse(lees(p));

const datumArg = process.argv.indexOf("--datum");
const DATUM = datumArg > -1 ? process.argv[datumArg + 1] : "29 juli 2026";

/* ---------- inlezen ---------- */
const bestanden = readdirSync(join(root, "data"))
  .filter(f => /^boeken-\d+\.json$/.test(f))
  .sort();

const BOEKEN = bestanden.flatMap(f => leesJson(join("data", f)))
  .sort((a, b) => a.nr - b.nr);

const RUBRIEKEN = leesJson("data/rubrieken.json");
const ROUTES = leesJson("data/routes.json");

/* ---------- controles ---------- */
const fouten = [];
const gezien = new Set();
const rubriekNamen = new Set(RUBRIEKEN.map(([n]) => n));

for (const b of BOEKEN) {
  const waar = `nr ${b.nr} (${b.titel})`;
  if (gezien.has(b.nr)) fouten.push(`dubbel nummer: ${waar}`);
  gezien.add(b.nr);
  for (const veld of ["titel", "auteur", "uitgave", "rubriek", "tags", "tekst"]) {
    if (!b[veld] || (Array.isArray(b[veld]) && !b[veld].length))
      fouten.push(`veld "${veld}" leeg bij ${waar}`);
  }
  if (!rubriekNamen.has(b.rubriek))
    fouten.push(`onbekende rubriek "${b.rubriek}" bij ${waar}`);
  if (b.tags && b.tags.length < 3)
    fouten.push(`minder dan 3 tags bij ${waar}`);
}
for (const r of ROUTES) {
  for (const nr of r.nrs) {
    if (!gezien.has(nr)) fouten.push(`leesroute "${r.titel}" verwijst naar onbekend nr ${nr}`);
  }
}
for (const [naam] of RUBRIEKEN) {
  if (!BOEKEN.some(b => b.rubriek === naam))
    fouten.push(`rubriek "${naam}" heeft geen titels`);
}
if (fouten.length) {
  console.error("BUILD GESTOPT:\n" + fouten.map(f => "  - " + f).join("\n"));
  process.exit(1);
}

/* ---------- index.html ---------- */
const routesHtml = ROUTES.map(r => `
    <div class="route">
      <h3>${r.titel} <span class="nrs">${r.nrs.join(" &middot; ")}</span></h3>
      <p>${r.tekst}</p>
    </div>`).join("\n");

const dataJs =
  "const RUBRIEKEN = " + JSON.stringify(RUBRIEKEN) + ";\n" +
  "const BOEKEN = " + JSON.stringify(BOEKEN) + ";";

const html = lees("src/template.html")
  .replace("{{ROUTES}}", routesHtml)
  .replace("{{DATA}}", dataJs)
  .replace("{{DATUM}}", DATUM);

writeFileSync(join(root, "index.html"), html, "utf8");

/* ---------- boekenlijst.md ---------- */
const ontHtml = s => s
  .replace(/<i>(.*?)<\/i>/g, "*$1*")
  .replace(/<b>(.*?)<\/b>/g, "**$1**")
  .replace(/&middot;/g, "·").replace(/&ndash;/g, "–").replace(/&hellip;/g, "…")
  .replace(/&amp;/g, "&");

const wikkel = (s, breedte = 78) => {
  const uit = [];
  let regel = "";
  for (const woord of s.split(" ")) {
    if (regel && (regel + " " + woord).length > breedte) { uit.push(regel); regel = woord; }
    else regel = regel ? regel + " " + woord : woord;
  }
  if (regel) uit.push(regel);
  return uit.join("\n");
};

const tagIndex = new Map();
for (const b of BOEKEN) for (const t of b.tags) {
  if (!tagIndex.has(t)) tagIndex.set(t, []);
  tagIndex.get(t).push(b.nr);
}
const tagRegel = [...tagIndex.keys()].sort((a, b) => a.localeCompare(b, "nl"))
  .map(t => `\`${t}\` ${tagIndex.get(t).join(", ")}`).join(" · ");

let md = `# Boekenlijst

${wikkel(`Leeslijst met samenvatting, rubriek en tags per titel. Engelse titels staan met hun Nederlandse uitgave erbij waar die is nagekeken. Status per ${DATUM}: ${BOEKEN.length} titels in ${RUBRIEKEN.length} rubrieken.`)}

Dit bestand wordt gegenereerd. Bewerk \`data/boeken-*.json\` en draai
\`node scripts/build.mjs\`; wijzigingen die hier direct worden gemaakt gaan
bij de volgende build verloren.

## Rubrieken

| Rubriek | Waar de rubriek over gaat | Titels |
| --- | --- | --- |
`;
for (const [naam, uitleg] of RUBRIEKEN) {
  const nrs = BOEKEN.filter(b => b.rubriek === naam).map(b => b.nr).join(", ");
  md += `| ${naam} | ${uitleg} | ${nrs} |\n`;
}
md += `
${wikkel("Een titel kan in één rubriek staan en toch tags uit een andere dragen. De tags zijn het fijnmazige zoekmiddel, de rubriek is de plek in de kast.")}
`;

for (const b of BOEKEN) {
  md += `\n## ${b.nr}. ${ontHtml(b.titel)}\n\n`;
  md += wikkel(`${ontHtml(b.auteur)}. ${ontHtml(b.uitgave)} Rubriek: ${b.rubriek.toLowerCase()}.`) + "\n";
  md += wikkel("Tags: " + b.tags.map(t => `\`${t}\``).join(", ")) + "\n";
  if (b.bron) md += `Bron: ${b.bron}.\n`;
  for (const p of b.tekst) md += "\n" + wikkel(ontHtml(p)) + "\n";
}

md += `\n## Tag-register\n\nAlfabetisch, met de nummers van de titels die de tag dragen.\n\n${wikkel(tagRegel)}\n`;

md += `\n## Leesroutes\n\n${wikkel("Lijnen die door meer dan één titel heen lopen.")}\n`;
for (const r of ROUTES) {
  md += `\n**${r.titel}** (${r.nrs.join(", ")}). ${""}`;
  md += "\n" + wikkel(ontHtml(r.tekst)) + "\n";
}

writeFileSync(join(root, "boekenlijst.md"), md, "utf8");

console.log(`gebouwd: ${BOEKEN.length} titels, ${RUBRIEKEN.length} rubrieken, ` +
  `${tagIndex.size} tags, ${ROUTES.length} leesroutes`);
console.log("  index.html");
console.log("  boekenlijst.md");

/**
 * Bouwt index.html en boekenlijst.md uit data/boeken-*.json.
 * Gebruik: node scripts/build.mjs [--datum "21 augustus 2026"]
 * Zonder --datum wordt de datum van vandaag gebruikt.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lees = p => readFileSync(join(root, p), "utf8");
const leesJson = p => JSON.parse(lees(p));

const datumArg = process.argv.indexOf("--datum");
const vandaag = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
const DATUM = datumArg > -1 ? process.argv[datumArg + 1] : vandaag;

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
for (const b of BOEKEN.filter(b => b.lang)) {
  const waar = `nr ${b.nr} (${b.titel})`;
  const L = b.lang;
  if (typeof L.stelling !== "string" || L.stelling.length < 200)
    fouten.push(`lang.stelling ontbreekt of is te kort bij ${waar}`);
  if (!Array.isArray(L.opbouw) || L.opbouw.length < 3)
    fouten.push(`lang.opbouw heeft minder dan 3 delen bij ${waar}`);
  else for (const d of L.opbouw) {
    if (!d.kop || !Array.isArray(d.tekst) || !d.tekst.length)
      fouten.push(`deel zonder kop of tekst in lang.opbouw bij ${waar}`);
  }
  if (!Array.isArray(L.begrippen) || L.begrippen.length < 5)
    fouten.push(`lang.begrippen heeft minder dan 5 termen bij ${waar}`);
  else for (const g of L.begrippen) {
    if (!g.term || !g.uitleg) fouten.push(`begrip zonder term of uitleg bij ${waar}`);
  }
  for (const veld of ["bewijs", "kritiek", "toepassing"]) {
    if (L[veld] !== undefined && (!Array.isArray(L[veld]) || !L[veld].length))
      fouten.push(`lang.${veld} is leeg bij ${waar}`);
  }
  for (const v of L.verder || []) {
    if (!gezien.has(v.nr)) fouten.push(`lang.verder verwijst naar onbekend nr ${v.nr} bij ${waar}`);
    if (!v.tekst) fouten.push(`lang.verder zonder tekst bij ${waar}`);
  }
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
      <h3>${r.titel} <span class="nrs">${
        r.nrs.map(n => `<b class="stap" data-nr="${n}">${n}</b>`).join(" &middot; ")
      }</span></h3>
      <p>${r.tekst}</p>
    </div>`).join("\n");

const dataJs =
  "const RUBRIEKEN = " + JSON.stringify(RUBRIEKEN) + ";\n" +
  "const ROUTES = " + JSON.stringify(ROUTES) + ";\n" +
  "const BOEKEN = " + JSON.stringify(BOEKEN) + ";";

const STIJL = lees("src/basis.css").trimEnd();
const VOORTGANG = lees("src/voortgang.js").trimEnd();

const html = lees("src/template.html")
  .replace("{{STIJL}}", STIJL)
  .replace("{{VOORTGANG}}", () => VOORTGANG)
  .replace("{{ROUTES}}", routesHtml)
  .replace("{{DATA}}", dataJs)
  .replace("{{DATUM}}", DATUM);

writeFileSync(join(root, "index.html"), html, "utf8");

/* ---------- boekpagina's met de uitgebreide samenvatting ---------- */
const plat = s => s.replace(/<[^>]+>/g, "")
  .replace(/&middot;/g, "·").replace(/&ndash;/g, "–")
  .replace(/&hellip;/g, "…").replace(/&amp;/g, "&");
const pad2 = n => String(n).padStart(2, "0");
const anker = b => "boek-" + b.nr;
const alinea = a => a.map(t => `      <p>${t}</p>`).join("\n");

const MET_LANG = BOEKEN.filter(b => b.lang);
if (MET_LANG.length) mkdirSync(join(root, "boek"), { recursive: true });

const boekTemplate = lees("src/boek.html");

for (const b of MET_LANG) {
  const L = b.lang;
  const woorden = plat([
    L.stelling,
    ...L.opbouw.flatMap(d => [d.kop, ...d.tekst]),
    ...L.begrippen.map(g => g.term + " " + g.uitleg),
    ...(L.bewijs || []), ...(L.kritiek || []), ...(L.toepassing || []),
    ...(L.verder || []).map(v => v.tekst),
  ].join(" ")).split(/\s+/).filter(Boolean).length;

  let hoofd = `      <h2>De stelling</h2>\n      <div class="stelling">\n  ${alinea([L.stelling])}\n      </div>\n\n`;
  hoofd += `      <h2>${L.opbouwkop || "De gang van het boek"}</h2>\n`;
  for (const d of L.opbouw)
    hoofd += `      <h3>${d.kop}</h3>\n${alinea(d.tekst)}\n`;
  hoofd += `\n      <h2>Kernbegrippen</h2>\n      <table class="begrippen">\n` +
    `        <thead><tr><th>Begrip</th><th>Wat de auteur ermee bedoelt</th></tr></thead>\n        <tbody>\n` +
    L.begrippen.map(g =>
      `          <tr><td class="term">${g.term}</td><td>${g.uitleg}</td></tr>`).join("\n") +
    `\n        </tbody>\n      </table>\n`;
  if (L.bewijs)
    hoofd += `\n      <h2>Waar het argument op rust</h2>\n${alinea(L.bewijs)}\n`;
  if (L.kritiek)
    hoofd += `\n      <h2>Wat er tegen in te brengen valt</h2>\n${alinea(L.kritiek)}\n`;
  if (L.toepassing)
    hoofd += `\n      <h2>Wat er concreet mee te doen is</h2>\n      <ul>\n` +
      L.toepassing.map(t => `        <li>${t}</li>`).join("\n") + `\n      </ul>\n`;

  let zij = `      <div class="blok">\n        <h2>Uitgave</h2>\n` +
    `        <p class="zij-uitgave">${b.uitgave}</p>\n      </div>\n`;
  zij += `      <div class="blok">\n        <h2>Kort gezegd</h2>\n` +
    `        <div class="kort">${b.tekst.map(t => `<p>${t}</p>`).join("")}</div>\n      </div>\n`;
  zij += `      <div class="blok">\n        <h2>Tags</h2>\n        <ul class="tags">` +
    b.tags.map(t => `<li>${t}</li>`).join("") + `</ul>\n      </div>\n`;
  if (L.verder && L.verder.length) {
    const items = L.verder.map(v => {
      const doel = BOEKEN.find(x => x.nr === v.nr);
      const link = doel.lang
        ? `<a href="${pad2(v.nr)}.html">${doel.titel}</a>`
        : `<a href="../index.html#${anker(doel)}">${doel.titel}</a>`;
      return `          <li value="${v.nr}">${link}. ${v.tekst}</li>`;
    }).join("\n");
    zij += `      <div class="blok">\n        <h2>Wat je hierna leest</h2>\n` +
      `        <ol>\n${items}\n        </ol>\n      </div>\n`;
  }

  const pagina = boekTemplate
    .replaceAll("{{STIJL}}", STIJL)
    .replaceAll("{{TITEL_PLAT}}", plat(b.titel))
    .replaceAll("{{META}}", plat(L.stelling).slice(0, 155).replace(/\s+\S*$/, "") + "…")
    .replaceAll("{{ANKER}}", anker(b))
    .replaceAll("{{NR}}", pad2(b.nr))
    .replaceAll("{{RUBRIEK}}", b.rubriek)
    .replaceAll("{{TITEL}}", b.titel)
    .replaceAll("{{AUTEUR}}", b.auteur)
    .replaceAll("{{WOORDEN}}", String(woorden))
    .replaceAll("{{DATUM}}", DATUM)
    .replace("{{VOORTGANG}}", () => VOORTGANG)
    .replace("{{HOOFD}}", hoofd.trimEnd())
    .replace("{{ZIJ}}", zij.trimEnd());

  writeFileSync(join(root, "boek", pad2(b.nr) + ".html"), pagina, "utf8");
}

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
  if (b.lang) {
    const L = b.lang;
    md += `\n### Uitgebreide samenvatting\n`;
    md += "\n" + wikkel("**De stelling.** " + ontHtml(L.stelling)) + "\n";
    md += `\n#### ${L.opbouwkop || "De gang van het boek"}\n`;
    for (const d of L.opbouw) {
      md += `\n**${ontHtml(d.kop)}**\n`;
      for (const t of d.tekst) md += "\n" + wikkel(ontHtml(t)) + "\n";
    }
    md += `\n#### Kernbegrippen\n\n| Begrip | Wat de auteur ermee bedoelt |\n| --- | --- |\n`;
    for (const g of L.begrippen) md += `| ${ontHtml(g.term)} | ${ontHtml(g.uitleg)} |\n`;
    for (const [kop, blok] of [["Waar het argument op rust", L.bewijs],
                               ["Wat er tegen in te brengen valt", L.kritiek]]) {
      if (!blok) continue;
      md += `\n#### ${kop}\n`;
      for (const t of blok) md += "\n" + wikkel(ontHtml(t)) + "\n";
    }
    if (L.toepassing) {
      md += `\n#### Wat er concreet mee te doen is\n\n`;
      for (const t of L.toepassing) md += wikkel("- " + ontHtml(t)) + "\n";
    }
    if (L.verder && L.verder.length) {
      md += `\n#### Wat je hierna leest\n\n`;
      for (const v of L.verder) {
        const doel = BOEKEN.find(x => x.nr === v.nr);
        md += wikkel(`- ${v.nr}. ${ontHtml(doel.titel)}. ${ontHtml(v.tekst)}`) + "\n";
      }
    }
  }
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
if (MET_LANG.length)
  console.log(`  boek/*.html (${MET_LANG.length} uitgebreid: ` +
    MET_LANG.map(b => b.nr).join(", ") + ")");

/**
 * Eenmalige patch: vervangt het uitgave-veld van titel 20 t/m 57 door de
 * gegevens die op 29 juli 2026 zijn nagekeken in bibliotheek.nl,
 * bibliotheek.be en Nederlandse boekhandelcatalogi.
 * Draai daarna scripts/build.mjs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pad = join(root, "data", "boeken-2.json");

const NIEUW = {
20:"Ondertitel <i>A Memoir by the Creator of Nike</i>; de lijst noemt de Young Readers Edition (2017). Nederlands als <i>Shoe dog: het verhaal van de oprichter van Nike</i>, vertaald door Rob de Ridder, bij Spectrum (2016).",
21:"Ondertitel <i>Timeless Lessons on Wealth, Greed, and Happiness</i> (Harriman House). Nederlands als <i>De psychologie van geld: tijdloze lessen over rijkdom, hebzucht en geluk</i> (ISBN 9789021590745).",
22:"Ondertitel <i>An Easy &amp; Proven Way to Build Good Habits &amp; Break Bad Ones</i>. Nederlands als <i>Elementaire gewoontes</i>, vertaald door Elisabeth van Borselen, bij Lev./A.W. Bruna (2022).",
23:"Ondertitel <i>The New Psychology of Success</i>. Nederlands als <i>Mindset, de weg naar een succesvol leven</i> bij SWP, eerste druk 2011 (ISBN 9789088508097).",
24:"Nederlands als <i>Hoe je vrienden maakt en mensen beïnvloedt</i> bij Pearson (herziene versie 2013); een oudere Nederlandse uitgave heette <i>Zo maakt u vrienden en goede relaties</i> (Omega Boek, 1984).",
25:"Bewerking voor jongeren van <i>The 7 Habits of Highly Effective People</i> van zijn vader Stephen Covey (1989). Nederlands als <i>Zeven eigenschappen die jou succesvol maken!</i> (ISBN 9789047003267); voor studenten verscheen <i>De zeven eigenschappen voor effectieve studenten</i>.",
26:"Ondertitel <i>Stories from a South African Childhood</i>. Nederlands als <i>Kleurenblind: en andere verhalen uit Zuid-Afrika</i>, vertaald door Annoesjka Oostindiër en Ineke van Bronswijk, bij A.W. Bruna (2017).",
27:"Ondertitel <i>A Practical Guide to Personal Freedom</i>. Nederlands als <i>De vier inzichten: wijsheid van de Tolteken</i> bij Ankh-Hermes (1999).",
28:"Ondertitel <i>The Power of Knowing What You Don't Know</i>. Nederlands als <i>Weten wat je niet weet</i> (ISBN 9789400514119), en als <i>Think again: de kracht van weten wat je niet weet</i> bij Rainbow (ISBN 9789041716606).",
29:"Ondertitel <i>The Power of Passion and Perseverance</i>. Nederlands als <i>De grit-factor: de kracht van passie en doorzettingsvermogen</i>, vertaald door Henk Popken, bij Bruna (2016).",
30:"Ondertitel <i>The Timeless Art of Turning Trials into Triumph</i>. Nederlands als <i>Het obstakel is de weg</i> bij A.W. Bruna (ISBN 9789400510159), in een herziene en uitgebreide editie.",
31:"Ondertitel <i>A World War II Story of Survival, Resilience, and Redemption</i>; de lijst noemt de bewerking voor jongeren. Nederlands eerst als <i>De Zamperini legende</i> bij Kok (2012), later als <i>Unbroken</i> bij Kosmos (2014).",
32:"Ondertitel <i>Let Go of Who You Think You're Supposed to Be and Embrace Who You Are</i>. Nederlands als <i>De moed van imperfectie</i> bij Lev., Utrecht (2013).",
33:"Ondertitel <i>The Power of Introverts in a World That Can't Stop Talking</i>. Nederlands als <i>Stil: de kracht van introvert zijn in een wereld die niet ophoudt met kletsen</i> bij De Arbeiderspers (ISBN 9789029589550).",
34:"Ondertitel <i>The Secret to Love That Lasts</i>. Nederlands als <i>De vijf talen van de liefde</i> (ISBN 9789033826979). In de bronlijst staat de aantekening dat deze titel vermoedelijk wordt vervangen door werk van John Gottman.",
35:"Ondertitel <i>A Language of Life</i>. Nederlands als <i>Geweldloze communicatie</i> bij Lemniscaat, eerste druk 2006, vertaald door Pieter van der Veen en Chiel van Soelen; herziene editie met een extra hoofdstuk in 2021.",
36:"Ondertitel <i>Shackleton's Incredible Voyage</i>. Nederlands als <i>Endurance: de ongelooflijke reis van Shackleton</i>, vertaald door Théo Buckinx, bij Prometheus (1999).",
37:"Nederlands als <i>Rijke pa arme pa</i> (ISBN 9789492665140); een oudere Nederlandse uitgave heette <i>Lessen van een arme en een rijke vader</i>, vertaald door Gerard Grasman, bij Elmar (2002).",
38:"Oorspronkelijk verschenen als losse pamfletten voor banken en verzekeraars. Nederlands als <i>De rijkste man van Babylon</i>: eerst vertaald door E.A. van Leent-Sieburgh bij de Nederlandse Boekenclub (1969), later in een bewerking van Sjors Sommer en Michael Pilarczyk (ISBN 9789079679621).",
39:"Ondertitel <i>The Surprising Secrets of America's Wealthy</i>. Geen Nederlandse uitgave gevonden; Nederlandse boekhandels verkopen de Engelse editie.",
40:"Ondertitel <i>Reinvent the Way You Make a Living, Do What You Love, and Create a New Future</i>. Nederlands als <i>De 100 euro Startup</i> (ISBN 9789021579450), waarin de bedragen naar euro's zijn omgerekend.",
41:"Ondertitel <i>Overcoming the Unseen Forces That Stand in the Way of True Inspiration</i>. De Nederlandse uitgave houdt de titel <i>Creativity, Inc.</i> aan, vertaald door Aad Markenstein (ISBN 9789400501201).",
42:"Ondertitel <i>A Leadership Fable</i>. Nederlands als <i>De vijf frustraties van teamwork</i>, ook uitgebracht als <i>De 5 frustraties van teamwork</i> (ISBN 9789047001966), met een apart werkboek.",
43:"Ondertitel <i>Tools for Talking When Stakes Are High</i>. De Nederlandse uitgave houdt de titel <i>Crucial Conversations</i> aan: eerst bij IMK Opleidingen (2010), daarna de herziene editie bij Business Contact (2022), vertaald door Robert Vernooy (ISBN 9789047016281).",
44:"Ondertitel <i>How the Courage to Be Vulnerable Transforms the Way We Live, Love, Parent, and Lead</i>. Nederlands als <i>De kracht van kwetsbaarheid: heb de moed om niet perfect te willen zijn</i>, vertaald door Marijke van der Horst, bij Lev. (ISBN 9789400502482).",
45:"Nederlands als <i>Leerschool</i> (ISBN 9789403166100).",
46:"Ondertitel <i>The Evolution of a Reckless Upstart into a Visionary Leader</i> (Crown Business, 2015). Geen Nederlandse uitgave gevonden; wel een Duitse. Let op: de Nederlandse <i>Steve Jobs: de biografie</i> is het boek van Walter Isaacson en niet dit boek.",
47:"Ondertitel <i>Building a Business When There Are No Easy Answers</i>. De Nederlandse uitgave houdt de Engelse titel aan (ISBN 9789047014683).",
48:"Oorspronkelijk <i>Ein Psychologe erlebt das Konzentrationslager</i>. Nederlands als <i>De zin van het bestaan: een inleiding tot de logotherapie</i>, vertaald door Liesbeth Swildens uit het Duits en het Amerikaans, bij Kooyker, Rotterdam (1978).",
49:"Postuum verschenen, met een nawoord van zijn vrouw Lucy Kalanithi. Nederlands als <i>Als adem lucht wordt</i>, vertaald door Anneke Bok, bij Hollands Diep (2016).",
50:"Ondertitel <i>Why Skills Trump Passion in the Quest for Work You Love</i>. Geen Nederlandse uitgave gevonden; van Newport verscheen wel <i>Deep work</i> in het Nederlands.",
51:"Ondertitel <i>Why Your Twenties Matter and How to Make the Most of Them Now</i>. Nederlands als <i>Het bepalende decennium: waarom je twintigerjaren ertoe doen</i>.",
52:"Scribner, 2017. Nederlands als <i>Slaap</i>, vertaald door Jan Willem Reitsma en Maarten van der Werf, bij De Geus (2018).",
53:"Ondertitel <i>How the Great Rewiring of Childhood Is Causing an Epidemic of Mental Illness</i>. Nederlands als <i>Generatie angststoornis</i> bij Ten Have.",
54:"Ondertitel <i>Public Discourse in the Age of Show Business</i>. Nederlands als <i>Wij amuseren ons kapot: de geestdodende werking van de beeldbuis</i>, vertaald door Aaldert van den Bogaard en anderen, met een voorwoord van Gerrit Komrij, bij Het Wereldvenster, Houten (1987).",
55:"Nederlands als <i>Ons feilbare denken</i> bij Business Contact (2011).",
56:"Ondertitel <i>A Brief History of Humankind</i>; oorspronkelijk in het Hebreeuws (2011), Engelse uitgave 2014. Nederlands als <i>Sapiens: een kleine geschiedenis van de mensheid</i>, vertaald door Inge Pieters, bij Thomas Rap (2014).",
57:"Essay dat de elfdelige reeks <i>The Story of Civilization</i> afsluit. Geen Nederlandse uitgave gevonden; in het Duits verscheen het als <i>Die Lehren der Geschichte</i>."
};

const boeken = JSON.parse(readFileSync(pad, "utf8"));
let geraakt = 0;
const ontbreekt = [];
for (const b of boeken) {
  if (NIEUW[b.nr]) { b.uitgave = NIEUW[b.nr]; geraakt++; }
  else ontbreekt.push(b.nr);
}
const overbodig = Object.keys(NIEUW).map(Number).filter(n => !boeken.some(b => b.nr === n));

writeFileSync(pad, JSON.stringify(boeken, null, 1) + "\n", "utf8");
console.log(`uitgave-veld bijgewerkt bij ${geraakt} van ${boeken.length} titels`);
if (ontbreekt.length) console.log("  niet in de patch:", ontbreekt.join(", "));
if (overbodig.length) console.log("  patch zonder titel:", overbodig.join(", "));

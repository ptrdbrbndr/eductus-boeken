# Overdracht: uitgebreide samenvattingen, batch 11 tot en met 14

Plak dit als eerste bericht in een nieuwe chat. Alles wat je nodig hebt staat
hieronder of in de repo.

## Waar het over gaat

`c:\Projecten\eductus-boeken` is een statische boekenlijst die live staat op
https://boeken.eductus.nl (nginx-container via Coolify op Beelink 1, achter de
Cloudflare-tunnel). De lijst telt 145 titels. Elke titel heeft een korte
samenvatting in het veld `tekst`, en krijgt daarnaast een **uitgebreide
samenvatting** in het veld `lang`, die de build omzet naar `boek/<nr>.html`.

Jouw opdracht: batch 11 tot en met 14 afmaken. Dat zijn 28 titels, en het is de
staart van de lijst: populaire wetenschap, het manifestatiegenre, vier boeken
uit de hoek van de dark psychology, drie randgevallen en twee klassiekers.

**Deze batches vragen het meest van de toon.** Ruim de helft van jouw titels is
zwak of niet onderbouwd. De afspraak met Pieter, letterlijk zo gemaakt: vat
eerst getrouw samen wat er staat, en zeg daarna feitelijk wat de onderbouwing
waard is. Niet spotten, niet meepraten. Een lezer moet uit de tekst kunnen
opmaken waar het boek vandaan komt, wat de aanhangers eraan hebben, en waarom
het geen kennis oplevert.

## Eerst even kijken waar het staat

```
cd c:\Projecten\eductus-boeken
node scripts/voortgang.mjs          # matrix per batch, of --md voor de tabelvorm
```

De indeling staat in `data/prioriteit.json`.

## De werkwijze die werkt

Verdeel de titels over parallelle subagents, drie per agent, zes agents
tegelijk. Elke agent krijgt: het pad naar `docs/SPEC-uitgebreide-samenvatting.md`,
een eigen uitvoerpad in de scratchpad, per titel nummer, titel, auteur, rubriek,
bandbreedte en het pad naar het e-boek als dat er is, de nummers waarnaar
`verder` mag verwijzen, en bij zwak onderbouwde boeken concreet wat er in het
kritiekblok hoort.

Per agent die klaar is:

```
node scripts/keur-lang.mjs <agent.json>     # blokkeert bij gebreken
node /tmp/mergeagent.mjs <agent.json>       # zet lang in data/boeken-*.json
node scripts/build.mjs --datum "30 juli 2026"
powershell -Command "& \"$env:USERPROFILE\.claude\skills\anti-ai-controle\scripts\anti-ai-lint.ps1\" -Path 'c:\Projecten\eductus-boeken'"
git add -A && git commit && git push
```

Het samenvoegscript staat niet in de repo; het is twintig regels die de
agent-JSON inlezen en `b.lang` zetten in `data/boeken-*.json`.

## Vallen waar ik in ben gelopen

- **De anti-AI-lint blokkeert op woorden die ook in titels zitten.** In jouw
  batch is dat een reëel risico: de Nederlandse titel van 139 bevat een woord
  uit de lijst `VERBODEN` in `scripts/keur-lang.mjs`, en die titel staat daarom
  onder de oorspronkelijke Engelse naam *Unlimited Power*, met een aantekening
  in het `uitgave`-veld. Kom je hetzelfde tegen, meld het aan Pieter
  in plaats van het stil op te lossen.
- **Twee gewone woorden struikelen over de controles, en juist in jouw batches
  heb je ze nodig.** De twee vormen van het werkwoord voor belonend versterken
  bevatten het eerste woord uit de lijst `VERBODEN` in `scripts/keur-lang.mjs`
  en worden daar geweigerd; het voltooid deelwoord van samenvatten leest de
  anti-AI-lint als superlatief en blokkeert de build. Bij manifesteren en dark
  psychology (batch 12 en 13) is dat eerste woord vaak precies wat je nodig hebt
  om te beschrijven wat een boek beweert. Omschrijven werkt: belonen,
  versterken, of de zin anders bouwen. Beide gevallen zijn in batch 8 en 10
  tegengekomen (nrs 118, 134 en 138) en aan Pieter gemeld; een woordgrens in de
  patronen zou het oplossen.
- **Alles wat via `{{STIJL}}` of `{{VOORTGANG}}` wordt ingevoegd komt in elke
  pagina terecht**, inclusief commentaarregels.
- **De keuring blokkeert onder 850 woorden en waarschuwt boven 2200.** Boven is
  een signaal, geen afkeuring. Bij dunne boekjes is de ondergrens het echte
  probleem: haal die niet met vulling, maar met de herkomst van het genre, de
  ontvangst en de vraag wat er wel en niet uit onderzoek bekend is.
- **`Dockerfile` kopieert `index.html` en de map `boek/`.**

## Bronnen op schijf

- `C:\Users\piete\Desktop\Boekjes voor Pieter` (73 epubs en 5 pdfs)
- `C:\Users\piete\Downloads\<map per titel>`

Van vrijwel al jouw titels staat het bestand er, met vier uitzonderingen die
hieronder staan. Lees ze uit; juist bij dit soort boeken is het verschil groot
tussen wat de omslag belooft en wat er staat.

## Jouw 28 titels

### Batch 11, natuur en wetenschap (7)

| nr | titel | auteur | bestand |
| --- | --- | --- | --- |
| 89 | Darwin in de supermarkt | Mark Nelissen | ja |
| 90 | Darwin in het nieuws | Mark Nelissen | ja |
| 92 | Onze bouwstenen | Anja Røyne | ja |
| 93 | Toeval | Jeroen Hopster | ja |
| 94 | Het tijdperk van onzekerheid | Tobias Hürter | ja |
| 99 | Sterrenkunde voor in bed, op het toilet of in bad | Sarah Brands | ja |
| 143 | Maps of Meaning | Jordan B. Peterson | ja, pdf |

89 en 90 zijn bundels korte stukken van dezelfde schrijver: zorg dat ze elkaar
niet dubbelen. Bij beide hoort het bezwaar tegen evolutionaire verklaringen
achteraf, die aannemelijk klinken en zelden te toetsen zijn. Bij 143 hoort dat
het zijn academische werk is, veel zwaarder dan 73 en 74, en dat de sprong van
gedeelde verhaalpatronen naar uitspraken over de menselijke geest eerder wordt
betoogd dan aangetoond.

### Batch 12, positief denken en manifesteren (12)

| nr | titel | auteur | bestand |
| --- | --- | --- | --- |
| 76 | Think and Grow Rich | Napoleon Hill, 1937 | ja |
| 83 | The Power of Positive Thinking | Norman Vincent Peale, 1952 | ja |
| 108 | Handboek Spiegelogie | Willem de Ridder | bestand onbruikbaar |
| 117 | Attitude Is Everything for Success | Keith Harrell | ja |
| 127 | The Law of Attraction | William Walker Atkinson, 1906 | ja |
| 128 | Leer manifesteren zoals Oprah Winfrey en J.K. Rowling | Baptist de Pape | ja |
| 129 | Manifest | Roxie Nafousi | ja |
| 130 | Manifesteren kun je leren | Willemijn Welten | bestand onbruikbaar |
| 131 | Wonderen manifesteren | Willemijn Welten | ja |
| 132 | You Are a Badass at Making Money | Jen Sincero | ja |
| 136 | The Greatness Mindset | Lewis Howes | ja |
| 139 | Unlimited Power | Tony Robbins, 1986 | ja |

Deze twaalf vormen één verhaal en dat is de kans van deze batch. 127 uit 1906 is
de bron waar de rest op teruggaat; 76 en 83 maakten het genre groot; de
hedendaagse titels voegen aan de kern niets toe en aan de onderbouwing evenmin.
Laat die lijn in de `verder`-verwijzingen zien, zodat een lezer de herkomst kan
volgen.

Vaste punten voor het kritiekblok: de natuurkundige beeldspraak van trillingen
en aantrekking heeft met natuurkunde niets te maken; overlevingsvertekening is
het terugkerende gebrek (zie 59 en 64 in de lijst); het advies is meestal
onweerlegbaar geformuleerd, want uitblijvend resultaat wordt aan de lezer
toegeschreven. Bij 139 hoort dat het op neurolinguïstisch programmeren rust, dat
herhaaldelijk is getoetst en niet standhoudt. Bij 132 en 136 hoort dat het boek
tegelijk de reclame is voor de praktijk van de schrijver.

### Batch 13, dark psychology en randgevallen (7)

| nr | titel | auteur | bestand |
| --- | --- | --- | --- |
| 123 | Dark Psychology: 7 in 1 | toegeschreven aan Jack Mind en Caroline Power | ja |
| 124 | Dark Psychology: Mind Control and Manipulation Secrets | toegeschreven aan Norton Ravin | ja |
| 125 | Dark Psychology and Manipulation | toegeschreven aan Brandon Bradberry | ja |
| 126 | How to Analyze People with Dark Psychology | toegeschreven aan Jacob Anderson | ja |
| 112 | Wijn voor Dummies | McCarthy en Ewing-Mulligan | ja |
| 116 | Mindset Mathematics, Grade 7 | Boaler, Munson en Williams | ja |
| 122 | Unfuck Your Intimacy Workbook | Faith G. Harper | ja |

De vier dark-psychologytitels zijn geen bronnen over manipulatie maar
voorbeelden ervan. Feitelijk vastgesteld en al in de korte vermeldingen
opgenomen: geen na te trekken auteur, geen uitgever, geen bronnen, en bij 124
staan in Engelse woorden Cyrillische letters die op automatisch herschreven
tekst wijzen. Lees ze uit en beschrijf ook de overlap tussen de vier onderling.
Neurolinguïstisch programmeren en het lezen van karakter uit lichaamstaal keren
er telkens in terug; beide houden in onderzoek geen stand, en het herkennen van
leugens gaat bij mensen nauwelijks beter dan toeval.

112, 116 en 122 zijn naslag en werkmateriaal. Daar is geen betoog om samen te
vatten: beschrijf de opzet, voor wie het bedoeld is, en wat het wel en niet
levert. Bij 116 is de link met 23 interessant, want dat is de didactische
uitwerking van het denken over aanleg dat Dweck heeft onderzocht.

### Batch 14, overig (2)

| nr | titel | auteur | bestand |
| --- | --- | --- | --- |
| 24 | How to Win Friends and Influence People | Dale Carnegie, 1936 | ja |
| 25 | The 7 Habits of Highly Effective Teens | Sean Covey, 1998 | nee |

24 is de grondlegger van het hele genre en verdient een ruime behandeling: de
dertig principes, de anekdotische onderbouwing, en de vraag waarom het na
negentig jaar nog werkt. Bij 25 hoort dat het de jeugdversie is van het werk van
zijn vader Stephen Covey.

## Hoe Pieter het wil zien

Na elke batch een matrix in de chat: klaar, welke nummers gedaan, welke nog te
doen, status per batch. `node scripts/voortgang.mjs --md` geeft die tabel. Meld
erbij wat je hebt bijgesteld en waarom, en welke fouten je onderweg maakte of
herstelde. Niet wachten op een startsein; doorwerken tot het af is.

Als deze vier batches klaar zijn, is de hele lijst van 145 titels voorzien van
een uitgebreide samenvatting.

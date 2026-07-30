# Overdracht: uitgebreide samenvattingen, batch 8, 9 en 10

Plak dit als eerste bericht in een nieuwe chat. Alles wat je nodig hebt staat
hieronder of in de repo.

## Waar het over gaat

`c:\Projecten\eductus-boeken` is een statische boekenlijst die live staat op
https://boeken.eductus.nl (nginx-container via Coolify op Beelink 1, achter de
Cloudflare-tunnel). De lijst telt 145 titels. Elke titel heeft een korte
samenvatting van twee alinea's in het veld `tekst`. Daarnaast krijgt elke titel
een **uitgebreide samenvatting** in het veld `lang`, die de build omzet naar een
eigen pagina `boek/<nr>.html`.

Het doel van die uitgebreide samenvattingen: een lezer moet kunnen kiezen tussen
het boek zelf lezen en het bij de samenvatting houden. Daar hoort bij dat er
eerlijk in staat waar de onderbouwing van een boek op rust en wat er tegen in te
brengen valt, ook bij populaire schrijvers.

Jouw opdracht: batch 8, 9 en 10 afmaken. Dat zijn 43 titels.

## Eerst even kijken waar het staat

```
cd c:\Projecten\eductus-boeken
node scripts/voortgang.mjs          # matrix per batch, of --md voor de tabelvorm
```

De indeling in batches staat in `data/prioriteit.json`. Wil Pieter een andere
volgorde, dan verplaatst hij daar een nummer.

## De werkwijze die werkt

Verdeel de titels over parallelle subagents, drie titels per agent. Elke agent
krijgt in zijn opdracht:

1. het pad naar de spec: `docs/SPEC-uitgebreide-samenvatting.md` (lees die zelf
   ook een keer, dan weet je waarop je keurt);
2. zijn eigen uitvoerpad, bijvoorbeeld
   `C:\Users\piete\AppData\Local\Temp\claude\...\scratchpad\agent-a.json`;
3. per titel: nummer, titel, auteur, rubriek, de bandbreedte in woorden, en het
   pad naar het e-boek als dat er is;
4. de nummers waarnaar `verder` mag verwijzen (kies er ruim twintig die
   inhoudelijk in de buurt liggen);
5. bij dunne of zwak onderbouwde boeken: wat er in het kritiekblok hoort te
   staan. Wees daar concreet in, dat scheelt een ronde.

Zes agents tegelijk werkt goed. Laat ze in Git Bash werken en alleen hun eigen
uitvoerbestand aanraken.

Als een agent klaar is:

```
node scripts/keur-lang.mjs <pad naar agent.json>     # blokkeert bij gebreken
node /tmp/mergeagent.mjs <pad naar agent.json>       # zet lang in data/boeken-*.json
node scripts/build.mjs --datum "30 juli 2026"
```

Het samenvoegscript staat niet in de repo. Het is twintig regels: lees de
agent-JSON, loop `data/boeken-*.json` langs, zet `b.lang` op het blok met
hetzelfde nummer, schrijf terug met `JSON.stringify(arr, null, 1)`.

Daarna altijd:

```
powershell -Command "& \"$env:USERPROFILE\.claude\skills\anti-ai-controle\scripts\anti-ai-lint.ps1\" -Path 'c:\Projecten\eductus-boeken'"
git add -A && git commit && git push
```

Push naar `main` deployt vanzelf via de GitHub-webhook. Controleer daarna live
met een verzoek naar `https://boeken.eductus.nl/boek/<nr>.html`.

## Vallen waar ik in ben gelopen

- **De anti-AI-lint blokkeert de build op woorden die ook in echte titels en
  in gewone samenstellingen zitten.** Twee voorbeelden die ik tegenkwam staan in
  `scripts/keur-lang.mjs` in de lijst `VERBODEN`; het eerste woord daaruit zit
  bijvoorbeeld verstopt in een gewoon Nederlands woord voor vermogend, en de
  Nederlandse titel van boek 139 struikelt over een ander woord uit die lijst.
  Herschrijf de zin, of gebruik de oorspronkelijke titel, en meld het aan
  Pieter.
- **Alles wat via `{{STIJL}}` of `{{VOORTGANG}}` wordt ingevoegd komt in elke
  pagina terecht**, inclusief commentaarregels. Eén em-dash in een
  commentaarregel van `src/voortgang.js` blokkeerde de lint in 62 bestanden.
- **De keuring blokkeert onder 850 woorden en waarschuwt boven 2200.** Boven is
  een signaal, geen afkeuring: kijk of er vulling in zit en laat het anders
  staan. Pieter heeft expliciet gezegd dat kwaliteit voor de bandbreedte gaat.
- **Verhalend werk krijgt geen toepassingsblok** en als `opbouwkop` "De gang van
  het verhaal". Dat geldt voor romans en memoirs (in jouw batch: 4, 5, 10, 26,
  31, 36, 45, 49, 100, 101, 110, 113, 114, 115).
- **`Dockerfile` kopieert `index.html` en de map `boek/`.** Blijft die tweede
  regel weg, dan komen boekpagina's stil op de 404-fallback naar de lijst uit.

## Bronnen op schijf

Van veel titels staat het e-boek op de machine. Uitlezen levert aantoonbaar
betere samenvattingen op, met hoofdstuktitels en cijfers uit de tekst zelf.

- `C:\Users\piete\Desktop\Boekjes voor Pieter` (73 epubs en 5 pdfs)
- `C:\Users\piete\Downloads\<map per titel>` (zes losse titels)

Zoek per titel op auteursnaam. De uitpakwijze staat in de spec.

## Jouw 43 titels

### Batch 8, brein, lichaam en gezondheid (13)

| nr | titel | auteur | bestand op schijf |
| --- | --- | --- | --- |
| 52 | Why We Sleep | Matthew Walker | nee |
| 84 | Laat je hersenen niet zitten | Erik Scherder | ja |
| 85 | Singing in the brain | Erik Scherder | ja |
| 86 | Hart voor je brein | Scherder en Hofstra | ja |
| 87 | Activeer je nervus vagus | Luc Swinnen | ja |
| 88 | Gewoontedieren | Nicklas Brendborg | ja |
| 103 | De psychologie van eetgedrag | Agaath Zondervan | ja |
| 104 | Oud zeer | Bram Bakker | ja |
| 118 | Coping Skills | Faith G. Harper | ja |
| 119 | Unfuck Your Brain | Faith G. Harper | ja |
| 120 | Unfuck Your Anger | Faith G. Harper | ja |
| 121 | Unfuck Your Worth | Faith G. Harper | ja |
| 138 | The Shift | Gary Foster | ja |

Let op: bij 52 hoort in het kritiekblok de discussie over de feitelijke fouten
die Alexey Guzey in 2019 aanwees en de reactie daarop. Bij de vier delen van
Harper: de reeks drijft op herhaling, zorg dat de vier samenvattingen elkaar
niet dubbelen en leg in elke uit wat dat deel toevoegt. Bij 138 hoort dat de
schrijver wetenschappelijk directeur is bij het bedrijf achter Weight Watchers.

### Batch 9, verhalend werk (16)

| nr | titel | auteur | bestand |
| --- | --- | --- | --- |
| 4 | The Tender Bar | J.R. Moehringer | nee |
| 5 | Lonesome Dove | Larry McMurtry | nee |
| 10 | Ten oosten van Eden | John Steinbeck | nee |
| 18 | On Writing | Stephen King | nee |
| 19 | Bird by Bird | Anne Lamott | nee |
| 26 | Born a Crime | Trevor Noah | nee |
| 31 | Unbroken | Laura Hillenbrand | nee |
| 36 | Endurance | Alfred Lansing | nee |
| 45 | Educated | Tara Westover | nee |
| 49 | When Breath Becomes Air | Paul Kalanithi | nee |
| 100 | Echte porno | Thom Wijenberg | ja |
| 101 | Loslaten | Loes den Hollander | ja |
| 110 | Op het allerlaatste moment | Claire Keegan | ja |
| 113 | Aangeraakt | Emma Fasol | ja |
| 114 | De quiltclub | Jennifer Chiaverini | ja |
| 115 | At the Hour Between Dog and Wolf | Tara Ison | bestand beschadigd |

18 en 19 zijn schrijfboeken en geen fictie: die krijgen wel een toepassingsblok.
Bij 115 kon de tekst niet worden gelezen; in het `uitgave`-veld staat dat de
vermelding niet op het boek zelf rust. Houd die samenvatting kort en zeg erbij
wat er niet is nagegaan.

### Batch 10, levenskunst en spiritualiteit (14)

| nr | titel | auteur | bestand |
| --- | --- | --- | --- |
| 3 | The Will to Change | bell hooks | nee |
| 7 | We Need to Hang Out | Billy Baker | nee |
| 77 | Ikigai | García en Miralles | ja |
| 91 | Eindelijk oud | Mark Nelissen | ja |
| 95 | Het uur van het hart | Irvin en Benjamin Yalom | ja |
| 102 | Ingangen tot Een cursus in wonderen | Willem Glaudemans | ja |
| 105 | Zo ongelukkig mogelijk in 8 stappen | Niels den Daas | ja |
| 107 | Alles draait om angst | Wiljo van Gassel | ja |
| 109 | Elke dag zelfzorg | Nina Mouton | ja |
| 111 | Dingen die je hoop geven | Haemin Sunim | ja |
| 134 | The Everyday Hero Manifesto | Robin Sharma | ja |
| 135 | The Monk Who Sold His Ferrari | Robin Sharma | ja |
| 141 | Voorbij de vorm | Stephan Bodian | ja, pdf |
| 145 | Unfuck Your Intimacy | Faith G. Harper | nee |

Bij 77 hoort dat de vier overlappende cirkels uit een westers schema komen en
niet uit het Japanse gebruik van het woord. Bij 107 en 109 gaat het om werk van
praktiserende begeleiders zonder onderzoek eronder; vat getrouw samen en zeg
feitelijk wat de onderbouwing waard is. Bij 102 geldt hetzelfde voor de
metafysische aannames van *Een cursus in wonderen*.

## Hoe Pieter het wil zien

Na elke batch een matrix in de chat met per batch: klaar, welke nummers gedaan,
welke nog te doen, en de status. `node scripts/voortgang.mjs --md` geeft die
tabel. Meld daarbij wat er is bijgesteld en waarom, en welke fouten je
onderweg hebt gemaakt of hersteld. Niet wachten op een startsein voor de
volgende batch; doorwerken tot de opdracht af is.

# Opdracht: uitgebreide samenvattingen voor boeken.eductus.nl

Je schrijft Nederlandstalige uitgebreide samenvattingen voor een boekenlijst.
Lees deze hele spec voordat je begint. Lever één JSON-bestand op en verder niets.

## Uitvoer

Schrijf naar het pad dat in je opdracht staat, een JSON-object met het
boeknummer als sleutel:

```json
{
  "70": {
    "stelling": "…",
    "opbouwkop": "De gang van het boek",
    "opbouw": [ { "kop": "…", "tekst": ["…", "…"] } ],
    "begrippen": [ { "term": "…", "uitleg": "…" } ],
    "bewijs": ["…", "…"],
    "kritiek": ["…", "…"],
    "toepassing": ["…"],
    "verder": [ { "nr": 22, "tekst": "…" } ]
  }
}
```

Eisen die de build afdwingt (bij overtreding stopt de build):

- `stelling`: één alinea, minimaal 200 tekens. De these van het boek, zo scherp
  dat er iets tegenover te zetten valt.
- `opbouw`: minimaal 3 delen, elk met `kop` en `tekst` (array van alinea's).
  Streef naar 5 tot 7 delen van elk 1 tot 3 alinea's.
- `begrippen`: minimaal 5, streef naar 7 tot 10. Elk `term` + `uitleg` van één
  zin. Alleen begrippen die de auteur zelf hanteert.
- `bewijs`, `kritiek`: arrays van alinea's, verplicht in de praktijk. `bewijs`
  gaat over waar het argument op rust en hoe stevig dat is; `kritiek` over wat
  er tegen in te brengen valt en wat het boek niet doet.
- `toepassing`: array van korte punten. **Laat weg bij verhalend werk.**
- `verder`: 2 tot 4 verwijzingen naar andere nummers uit de lijst die je in je
  opdracht krijgt. Verwijs alleen naar nummers die daar staan.
- `opbouwkop`: laat weg (dan wordt het "De gang van het boek"), of gebruik
  "De gang van het verhaal" bij romans.

## Omvang

Tel alles: `stelling`, alle `opbouw`-tekst, de begrippen, `bewijs`, `kritiek`,
`toepassing` en `verder`. Dat is dezelfde telling als `scripts/keur-lang.mjs`
gebruikt en als in de kop van de boekpagina komt te staan.

- concept- en methodeboeken: 1400 tot 1900 woorden
- verhalend werk, memoir, roman: 1100 tot 1600 woorden
- dunne boeken (onder ~150 bladzijden) en essaybundels: 900 tot 1400 woorden

De keuring weigert alles onder 850 en boven 2200 woorden. De bovengrens stond
eerst op 2000 en is verruimd toen bleek dat goed onderbouwde samenvattingen van
dikke boeken daar net overheen gaan; inkorten kostte dan inhoud met bronnen
erin.

Liever iets korter dan opgevuld. Vulling herken je hieraan: een alinea die
niets toevoegt dat de vorige niet al zei.

## Bronnen: eerst het bestand, dan je kennis

Staat er in je opdracht een bestandspad bij een titel, dan **lees je dat boek
eerst uit**. Zo doe je dat (Git Bash):

```bash
rm -rf /tmp/ex && mkdir -p /tmp/ex
unzip -o -q "PAD.epub" -d /tmp/ex
# inhoudsopgave:
find /tmp/ex \( -iname "toc.ncx" -o -iname "*nav*.xhtml" \) | head -1 | \
  xargs -I{} sh -c 'tr -d "\n" < "{}" | grep -o "<text>[^<]*</text>" | sed "s/<[^>]*>//g"'
# tekst van de eerste hoofdstukken:
find /tmp/ex \( -iname "*.xhtml" -o -iname "*.html" \) | sort | sed -n '3,12p' | \
  while read p; do tr '\n' ' ' < "$p" | sed 's/<[^>]*>/ /g; s/  */ /g'; echo; done | head -c 20000
```

Voor pdf: `pdftotext -f 1 -l 25 "PAD.pdf" -` en anders `strings`.

Lees genoeg om de opbouw en de kernbegrippen juist te krijgen. Verzin nooit een
hoofdstuktitel, een naam, een jaartal of een onderzoek. Weet je iets niet zeker,
laat het weg of schrijf op wat er wel vaststaat.

## Toon: dit is de belangrijkste eis

De teksten worden gecontroleerd door een anti-AI-lint die de build blokkeert.
Houd je aan het volgende:

- **Geen em-dashes.** Gebruik een komma, een dubbele punt of een punt.
- Geen marketingtaal. De lint blokkeert onder meer deze woorden, ook binnen
  samenstellingen; let op woorden waarin een verboden woord verstopt zit:

```
krachtig  uniek  ongekend  optimaal  unlock  essentieel  fascinerend
moeiteloos  revolutionair  transformeren  kortom  samenvattend  onmisbaar
naadloos  baanbrekend  cruciaal
```

- Geen antithese-ritme ("niet X, maar Y") als vaste zinsvorm, geen drieslagen
  om het ritme, geen retorische vragen als overgang.
- Geen aansporingen aan de lezer en geen enthousiasme over het boek. Nuchter
  vaststellen wat er staat en wat het waard is.
- Schrijf zonder directe aanspreekvorm waar dat kan. In `toepassing` mag de
  gebiedende wijs ("Schrijf op wat…").
- Nederlands, geen Engelse leenwoorden waar een Nederlands woord bestaat.
  Boektitels blijven in het Engels, in `<i>`-tags.
- HTML: alleen `<i>` en `<b>` zijn toegestaan in de tekst. Ampersand als
  `&amp;`.

## Inhoud: waar het om gaat

Deze samenvattingen moeten de lezer laten kiezen tussen het boek zelf lezen en
het bij de samenvatting houden. Dat betekent:

- Noem de voorbeelden waar het argument op rust, met naam en getal als je die
  zeker weet.
- Wees eerlijk over de onderbouwing. Staat er geen onderzoek in, schrijf dat.
  Is onderzoek later niet herhaalbaar gebleken, schrijf dat.
- `kritiek` is geen beleefdheidsformule. Noem het sterkste bezwaar dat er
  tegen het boek bestaat, ook als de schrijver populair is.
- Bij zwak onderbouwde genres (zelfhulp, manifesteren, populaire psychologie)
  vat je eerst getrouw samen wat er staat, en zeg je daarna feitelijk wat de
  onderbouwing waard is. Niet spotten, niet meepraten.

## Controle voordat je oplevert

1. Is het JSON geldig? (`node -e "JSON.parse(require('fs').readFileSync('PAD','utf8'))"`)
2. Klopt het woordental per titel met de band hierboven?
3. Staan er em-dashes of woorden uit de verboden lijst in?
4. Heb je iets beweerd dat je niet kunt verantwoorden?

Antwoord daarna met alleen: het pad van je bestand, de nummers die erin staan,
en per nummer het woordental. Geen samenvatting van je werk, geen toelichting.

# eductus-boeken

Boekenlijst met samenvatting, rubriek en tags per titel. Live op
`https://boeken.eductus.nl` (statische nginx-site via Coolify op Beelink 1,
achter de Cloudflare-tunnel).

## Waarom een eigen subdomein

`eductus.nl` is de AI Kennisbibliotheek en `leren.eductus.nl` draait de vijftien
SAP-leermodules. Beide zijn andere proposities met een ander publiek, dus de
boekenlijst staat los daarnaast. Niet op de root deployen.

## Een titel toevoegen of wijzigen

De JSON in `data/` is de enige bron. `index.html` en `boekenlijst.md` worden
daaruit gegenereerd en horen niet met de hand bewerkt te worden.

1. Voeg een object toe aan het laatste `data/boeken-<n>.json`, of begin een
   nieuw bestand `data/boeken-<n+1>.json` (de build leest alle
   `boeken-*.json` en sorteert op `nr`).
2. Draai `node scripts/build.mjs`. De build stopt met een foutmelding bij een
   dubbel nummer, een leeg veld, een onbekende rubriek, minder dan drie tags,
   een leesroute die naar een onbekend nummer verwijst, of een rubriek zonder
   titels.
3. Commit en push naar `main`. Coolify bouwt de container opnieuw.

Velden per titel:

| Veld | Verplicht | Inhoud |
| --- | --- | --- |
| `nr` | ja | doorlopend nummer, wordt niet hergebruikt |
| `titel` | ja | titel zoals de lijst hem aanhaalt |
| `auteur` | ja | auteur en jaar van eerste uitgave |
| `uitgave` | ja | ondertitel, uitgever, Nederlandse uitgave of de mededeling dat die niet is nagekeken |
| `rubriek` | ja | exact een naam uit `data/rubrieken.json` |
| `tags` | ja | minimaal drie, kleine letters, koppelteken in plaats van spatie |
| `tekst` | ja | array van alinea's; `<i>` en `<b>` mogen erin |
| `bron` | nee | herkomst van de titel, bijvoorbeeld `40-lijst` |
| `lang` | nee | de uitgebreide samenvatting; levert een eigen pagina `boek/<nr>.html` op |

## Een uitgebreide samenvatting toevoegen

Het veld `lang` is de uitgebreide samenvatting van drie tot vijf bladzijden. Is
het aanwezig, dan genereert de build `boek/<nr>.html` en krijgt de kaart in de
lijst een knop ernaartoe. Titels zonder `lang` blijven werken zoals ze waren.

| Sleutel | Verplicht | Inhoud |
| --- | --- | --- |
| `stelling` | ja | de these van het boek in één alinea, minimaal 200 tekens |
| `opbouwkop` | nee | kop boven het middendeel, standaard "De gang van het boek" |
| `opbouw` | ja | minimaal drie delen, elk met `kop` en `tekst` (array van alinea's) |
| `begrippen` | ja | minimaal vijf paren van `term` en `uitleg` |
| `bewijs` | nee | array van alinea's over waar het argument op rust |
| `kritiek` | nee | array van alinea's over wat er tegen in te brengen valt |
| `toepassing` | nee | array van punten; laat weg bij verhalend werk |
| `verder` | nee | array van `{nr, tekst}`; het nummer moet bestaan |

Richtlijn voor de omvang: concept- en methodeboeken 1200 tot 1800 woorden,
verhalend werk 900 tot 1400, essaybundels 1000 tot 1500. De boekpagina toont het
werkelijke woordental in de kop, dus de maat is controleerbaar.

Let op: `Dockerfile` kopieert zowel `index.html` als de map `boek/`. Zonder die
tweede regel komen de boekpagina's door de 404-fallback stil op de lijst uit.

Een nieuwe rubriek zet je in `data/rubrieken.json` als paar van naam en
uitleg; de volgorde in dat bestand is de volgorde op de pagina. Leesroutes
staan in `data/routes.json`.

## Toon

Teksten worden getoetst met de anti-AI-controle-skill: geen em-dashes, geen
marketingfrases, geen drieledige opsommingen, en geen claim zonder cijfer,
naam of datum. Er staat bewust geen directe aanspreekvorm in, omdat
`docs/VOICE.md` in de eductus-repo voor Eductus nog op OPEN staat wat je of u
betreft.

## Deploy

- Dockerfile op basis van `nginx:alpine`, poort 80, build pack `dockerfile`.
- Coolify-project `eductus`, server Beelink 1.
- Cloudflare: DNS-CNAME naar de tunnel, ingress via
  `cf-tunnel-add-hostname.mjs`. Nooit met een handmatige PUT op de
  volledige ingress-lijst.

# Tijd en Maten

Dit project bevat statische HTML-oefeningen voor tijd en maten, met kloklezen en herleidingen.

## Bestanden

- `index.html`: startpagina met kaarten naar de verschillende onderdelen.
- `klok.html`: omzetting van `klok.twig` naar een standalone HTML-pagina.
- `klok-oefenen.html`: omzetting van `klokOefenen.twig` naar een standalone HTML-oefenpagina.
- `klok-vergelijken.html`: omzetting van `klokVergelijken.twig` naar een standalone HTML-pagina.
- `herleidingen.html`: oefenpagina voor inhoud, gewicht en lengte.
- `herleidingen.js`: client-side logica voor willekeurige herleidingsoefeningen.
- `klok.css`: gedeelde styling voor alle pagina's.
- `klok.js`: bestaand scriptbestand uit het project.

## Gebruik

Open `index.html` in de browser en kies daarna:

- `kloklezen`
- `klok oefenenen`
- `klok vergelijken`
- `herleidingen oefenen`

## Opmerking

De originele Twig-bestanden gebruikten Craft CMS/Twig-functionaliteit. In de HTML-versies is die serverafhankelijkheid verwijderd en vervangen door client-side JavaScript zodat de pagina's lokaal werken.

## Publiceren op GitHub

1. Maak op GitHub een nieuwe repository aan, bijvoorbeeld `tijd-en-maten`.
2. Laat de repository leeg: geen extra README, `.gitignore` of license aanvinken.
3. Koppel daarna lokaal je map aan GitHub:

```bash
git add .
git commit -m "Initial static site"
git remote add origin https://github.com/JOUW_GEBRUIKERSNAAM/tijd-en-maten.git
git push -u origin master
```

4. Zet daarna GitHub Pages aan:
   - open je repository op GitHub
   - ga naar `Settings` > `Pages`
   - kies bij `Source`: `Deploy from a branch`
   - kies branch `master` en folder `/ (root)`
   - klik `Save`

5. Je site komt daarna normaal online op:

```text
https://JOUW_GEBRUIKERSNAAM.github.io/tijd-en-maten/
```

De startpagina van de site is `index.html`.

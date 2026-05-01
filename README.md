# Kloklezen

Dit project bevat een statische HTML-versie van de kloklezen-pagina's.

## Bestanden

- `index.html`: startpagina met 2 kaarten naar de onderdelen.
- `klok.html`: omzetting van `klok.twig` naar een standalone HTML-pagina.
- `klok-oefenen.html`: omzetting van `klokOefenen.twig` naar een standalone HTML-oefenpagina.
- `klok-vergelijken.html`: omzetting van `klokVergelijken.twig` naar een standalone HTML-pagina.
- `klok.css`: gedeelde styling voor alle pagina's.
- `klok.js`: bestaand scriptbestand uit het project.

## Gebruik

Open `index.html` in de browser en kies daarna:

- `kloklezen`
- `klok oefenenen`
- `klok vergelijken`

## Opmerking

De originele Twig-bestanden gebruikten Craft CMS/Twig-functionaliteit. In de HTML-versies is die serverafhankelijkheid verwijderd en vervangen door client-side JavaScript zodat de pagina's lokaal werken.

## Publiceren op GitHub

1. Maak op GitHub een nieuwe repository aan, bijvoorbeeld `kloklezen`.
2. Laat de repository leeg: geen extra README, `.gitignore` of license aanvinken.
3. Koppel daarna lokaal je map aan GitHub:

```bash
git add .
git commit -m "Initial static site"
git remote add origin https://github.com/JOUW_GEBRUIKERSNAAM/kloklezen.git
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
https://JOUW_GEBRUIKERSNAAM.github.io/kloklezen/
```

De startpagina van de site is `index.html`.

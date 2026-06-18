# WM 2026 Live Turnierbaum

Live-Webapp für die FIFA WM 2026 mit dynamischem Turnierbaum, Gruppenständen und Annex-C-Berechnung.

## Features

- **Live-Daten** aus TheSportsDB, openfootball und wcup2026.org
- **12 Gruppentabellen** mit FIFA-Tiebreakern (inkl. Fair-Play-Punkte)
- **Dynamischer K.-o.-Baum** mit FIFA Annex C (495 Kombinationen für Drittplatzierte)
- **Responsive UI**: Desktop mit Pan/Zoom-Gesamtbild, Mobile mit Runden-Swiper
- **Spieldetails** mit Thumbnails und externen Highlight-Links

## Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Datenquellen

- [TheSportsDB](https://www.thesportsdb.com/) – Spiele, Ergebnisse, Badges, Thumbnails
- [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) – Fixtures & Ergebnisse
- [wcup2026.org](https://wcup2026.org/) – Live-Status
- Annex C: FIFA WM 2026 Reglement (via tournamental-Datensatz)

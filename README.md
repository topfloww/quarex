**QUAREX**

Finance-Manager:
- **Übersicht** — Gesamtbilanz, Charts, letzte Aktivitäten
- **Führerschein** — Kostentracking mit Budget & Kategorien
- **Budget** — Einnahmen & Ausgaben mit Analyse
- **Trading P&L** — Trade Journal, Kalender & Equity Kurve

### Voraussetzungen
- [Node.js](https://nodejs.org/) installieren (LTS Version)

## 📁 Projektstruktur

```
src/
├── App.js              # Haupt-App mit Navigation
├── index.js            # Entry Point
├── index.css           # Globale Styles
├── components/
│   └── Sidebar.js      # Navigation
├── pages/
│   ├── Overview.js     # Übersicht
│   ├── DrivingPage.js  # Führerschein
│   ├── BudgetPage.js   # Budget
│   └── TradingPage.js  # Trading P&L
└── utils/
    └── storage.js      # localStorage Utility

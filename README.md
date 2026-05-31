# 💰 fintrack — Persönliches Finance Dashboard

Ein lokales Finance-Dashboard mit 4 Seiten:
- **Übersicht** — Gesamtbilanz, Charts, letzte Aktivitäten
- **Führerschein** — Kostentracking mit Budget & Kategorien
- **Budget** — Einnahmen & Ausgaben mit Analyse
- **Trading P&L** — Trade Journal, Kalender & Equity Kurve

Daten werden im Browser (localStorage) gespeichert — kein Server nötig.

---

## 🚀 Setup (einmalig)

### Voraussetzungen
- [Node.js](https://nodejs.org/) installieren (LTS Version)

### Starten
```bash
# 1. In den Projektordner wechseln
cd finance-dashboard

# 2. Abhängigkeiten installieren (nur beim ersten Mal)
npm install

# 3. App starten
npm start
```

Die App öffnet sich automatisch unter **http://localhost:3000**

---

## 🌐 Kostenlos hosten

### Option A: Netlify (empfohlen, kostenlos)
1. Konto erstellen auf [netlify.com](https://netlify.com)
2. `npm run build` ausführen → erzeugt `build/` Ordner
3. Den `build/` Ordner per Drag & Drop auf Netlify hochladen
4. Fertig! Du bekommst eine URL wie `deindashboard.netlify.app`

### Option B: GitHub Pages
1. Code auf GitHub pushen
2. In den Repo-Settings: Pages → Source → GitHub Actions
3. `.github/workflows/deploy.yml` mit CRA-Deploy-Action erstellen
4. Automatischer Deploy bei jedem Push

### Option C: Vercel (auch kostenlos)
1. `npm install -g vercel`
2. `vercel` im Projektordner ausführen
3. Folge den Anweisungen

---

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
```

---

## 💡 Daten exportieren / sichern

Da die Daten im Browser liegen, gelegentlich sichern:
1. Öffne die Browser-DevTools (F12)
2. Console → `JSON.stringify(localStorage)` eingeben
3. Ergebnis kopieren und als `.json` Datei speichern

Später kannst du eine Export-Funktion in die App einbauen.

---

## 🔧 Geplante Features (später)
- [ ] CSV/JSON Export & Import
- [ ] Wiederkehrende Ausgaben (monatlich)
- [ ] Mehrere Konten / Portfolios
- [ ] Bilder/Belege hochladen
- [ ] Dark/Light Mode Toggle
- [ ] Passwortschutz (einfach per PIN)

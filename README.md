# 🎄 Calendario dell'Avvento - React Version

Ein interaktiver Adventskalender zum Lernen von italienischem medizinischem Vokabular für Arztbesuche in Bruneck/Südtirol - jetzt als statische React App!

## Features

- ✨ 24 Türchen mit täglichen Rätseln
- 🇮🇹 Italienische medizinische Begriffe mit deutscher Übersetzung
- 🔊 Text-to-Speech Aussprache (Web Speech API)
- 💡 Progressives Tippsystem bei falschen Antworten
- 🎨 Weihnachtliches Design mit Animationen
- 📱 Responsive Design für alle Geräte

## Lokale Entwicklung

```bash
cd react-app
npm install
npm run dev
```

Die App läuft dann auf `http://localhost:5173`

## Build für Produktion

```bash
npm run build
```

Die fertige App liegt dann im `dist/` Ordner.

## Deployment auf Hugging Face Spaces

### Option 1: Static Space (empfohlen)

1. Erstelle einen neuen Space auf [Hugging Face](https://huggingface.co/new-space)
2. Wähle SDK: **Static**
3. Clone dein Space Repository:
   ```bash
   git clone https://huggingface.co/spaces/username/space-name
   cd space-name
   ```

4. Baue die React App:
   ```bash
   cd react-app
   npm install
   npm run build
   ```

5. Kopiere den Build-Inhalt in dein Space Repo:
   ```bash
   cp -r dist/* ../
   ```

6. Erstelle/aktualisiere die `README.md` im Space Root:
   ```yaml
   ---
   title: Calendario dell'Avvento
   emoji: 🎄
   colorFrom: red
   colorTo: green
   sdk: static
   pinned: false
   ---
   ```

7. Commit und push:
   ```bash
   git add .
   git commit -m "Add React advent calendar"
   git push
   ```

### Option 2: Docker Space

Wenn du mehr Kontrolle brauchst, kannst du auch ein Docker Space nutzen. Erstelle dazu ein `Dockerfile`:

```dockerfile
FROM node:18 as build
WORKDIR /app
COPY react-app/package*.json ./
RUN npm install
COPY react-app/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Technologie Stack

- ⚛️ React 18
- ⚡ Vite
- 🎨 Vanilla CSS (keine externen Dependencies für maximale Kompatibilität)
- 🔊 Web Speech API für Aussprache

## Struktur

```
react-app/
├── src/
│   ├── App.jsx          # Hauptkomponente
│   ├── App.css          # Styling
│   ├── data.js          # Alle 24 Tage Content
│   └── main.jsx         # Entry Point
├── index.html
├── package.json
└── vite.config.js
```

## Features im Detail

### Tageslogik
- Automatische Erkennung des aktuellen Dezember-Tages
- Türchen sind nur am richtigen Tag freigeschaltet
- Dev-Tools zum Testen aller Tage

### Rätsel-System
- Eingabefeld für Antworten
- Fuzzy-Matching (Teilstrings werden akzeptiert)
- Bis zu 3 Tipps pro Tag
- Versuchszähler

### Audio
- Browser-native Text-to-Speech
- Keine externe API nötig
- Spielt automatisch bei richtiger Antwort

## Browser-Unterstützung

- Chrome/Edge: ✅ Vollständig
- Firefox: ✅ Vollständig
- Safari: ✅ Vollständig
- Mobile Browser: ✅ Responsive Design

Viel Spaß beim Italienisch lernen! 🎄🇮🇹

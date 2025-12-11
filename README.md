# Gutmann Kompass

## Projektübersicht

Der **Financial Health Check** ist ein mehrstufiges Analysetool zur Erfassung eines ganzheitlichen Kundenprofils. Das System nutzt eine Large Language Model (LLM)-Integration zur dynamischen Inhaltserstellung und zur Durchführung der finalen Finanzanalyse. Das Frontend ist für die nahtlose Einbettung **per iFrame** in Host-Anwendungen konzipiert.

### Kernfunktionen

* **Datenerfassung:** Erfasst finanzielle Fakten, Ziele und das Risikoverhalten.

* **Dynamische Szenarien:** Erstellung personalisierter Entscheidungssimulationen durch das LLM, um das Kundenverhalten zu testen (`step4`, `app/actions/analyze.ts`).

* **Strukturierte Analyse:** Generierung einer kategorisierten Analyse (Score, Chart-Daten, Detailerklärungen).

* **Persistenz:** Speicherung aller Analysen in der Datenbank. Jeder Check erhält einen eindeutigen `consultationCode` (`app/api/data/route.ts`).

* **Reporting:** On-Demand-Erstellung eines PDF-Berichts der Analyseergebnisse (`app/api/pdf/route.ts`).

## Technischer Aufbau

Das Projekt basiert auf einer modernen Serverless-Architektur mit Next.js.

### Technologiestack

| **Komponente** | **Technologie** | **Zweck** | 
| :--- | :--- | :--- | 
| **Framework** | Next.js (React) | Full-Stack-Entwicklung; nutzt Server Actions für die Backend-Kommunikation. | 
| **LLM** | Google GenAI | Generierung von Szenarien und Durchführung der finalen Analyse. | 
| **Datenbank** | PostgreSQL | Persistente und relationale Datenspeicherung (`lib/db/schema.ts`). | 
| **ORM** | Drizzle ORM | Type-safe und performante Datenbankinteraktion. | 
| **Reporting** | `@react-pdf/renderer` | Server-seitige Erstellung von PDF-Dokumenten. | 

### Datenfluss (API & Integration)

1. **Client-Flow:** Der Client (im iFrame) sammelt Daten in 6 Schritten.

2. **LLM-Analyse:** Ausgelöst via Server Actions, sendet der Server strukturierte Prompts an das LLM (`app/actions/analyze.ts`).

3. **Speicherung:** Die vollständigen Daten werden über den Endpoint `POST /api/data` gespeichert, wobei der `consultationCode` erzeugt und an den Client zurückgegeben wird.

4. **Externer Zugriff:** Interne Systeme können abgeschlossene Analysen über den Endpoint `GET /api/data?code=...` (mit Authentifizierung) abrufen.

## Einbettung (iFrame-Beispiel)

Ein Beispiel für die Einbettung ist in der Datei `gutmann_embedded.html` enthalten. Die Anwendung ist darauf optimiert, über iFrames in andere Portale integriert zu werden, wobei der `CheckRouter` den gesamten Zustand verwaltet.

## Entwicklung

### Voraussetzungen

* Node.js

* PostgreSQL-Datenbank

* Google Gemini API Key

### Umgebungsvariablen

Die folgenden Variablen müssen in der `.env.local` Datei konfiguriert werden:

```
DATABASE_URL="postgres://user:password@host:port/database"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

# Starten der Datenbank
`docker compose up`

# Abhängigkeiten installieren
`pnpm install`

# Lokalen Entwicklungsserver starten
`pnpm run dev`


Hinweis: Drizzle Migration-Befehle müssen separat ausgeführt werden, um das Schema zu initialisieren.

# Auction Backend (Railway)

Separates Backend fuer das Speichern/Laden von Auktionen ausserhalb von Vercel Functions.

## Endpunkte

- `GET /health`
- `GET|POST /api/auctions/init-db`
- `GET /api/save-auction`
- `GET /api/expired-auctions`

## Lokal starten

1. `.env.example` nach `.env` kopieren und Variablen setzen.
2. Abhaengigkeiten installieren:
   - `npm install`
3. Entwicklermodus:
   - `npm run dev`

## Deployment auf Railway

1. Diesen Ordner als eigenes Repo pushen oder als `root directory` in Railway auswaehlen.
2. In Railway Umgebungsvariablen setzen:
   - `DATABASE_URL`
   - `ALLOWED_ORIGINS` (z. B. `https://deine-vercel-domain.vercel.app`)
3. Optional einmalig DB initialisieren:
   - `POST https://<dein-backend>/api/auctions/init-db`
4. Save-Trigger einrichten:
   - Entweder Railway Cron Job auf `GET /api/save-auction`
   - Oder GitHub Action/externen Cron auf dieselbe URL

## Frontend-Anbindung

Im Next.js Frontend:

- `NEXT_PUBLIC_AUCTION_BACKEND_URL=https://<dein-backend>`

Dann laufen Abfragen fuer abgelaufene Auktionen direkt ueber dieses Backend.

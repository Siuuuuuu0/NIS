# Run NIS with Docker

## Requirements
- Docker Desktop installed

## Option A: Dev mode (Expo web + backend)
From the `NIS` folder run:

```bash
docker compose up --build
```

Open:
- Web app: `http://localhost:8081`
- API health check: `http://localhost:3001/api/health`

Stop:
```bash
docker compose down
```

## Option B: Production-like mode (Nginx + backend)
This builds static web files and serves them via Nginx.

Start:
```bash
docker compose -f docker-compose.prod.yml up --build
```

Open:
- Web app (Nginx): `http://localhost:8080`
- API goes through same host via `/api` proxy

Stop:
```bash
docker compose -f docker-compose.prod.yml down
```

## Share with friends
Send them the full `NIS` folder (or repo) and one command:

```bash
docker compose -f docker-compose.prod.yml up --build
```

They do not need to install Node.js or npm locally.

# Docker Local Stack

This repo can be run entirely in Docker for local testing:

- PostgreSQL 16
- Medusa backend on `http://localhost:9000`
- Next storefront on `http://localhost:3000`

## Prerequisite

Install Docker Desktop.

## Start

From the repo root:

```bash
docker compose up --build
```

## Stop

```bash
docker compose down
```

## Reset database

```bash
docker compose down -v
docker compose up --build
```

## Notes

- The Medusa container runs migrations on startup.
- The storefront talks to Medusa over the internal Docker network.
- PostgreSQL data is persisted in the `postgres_data` volume.
- The Medusa admin is disabled by default in Docker because the project currently uses the custom storefront instead.

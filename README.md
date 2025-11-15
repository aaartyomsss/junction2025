# junction2025

## Backend (FastAPI)

```
cd backend
uv sync
docker-compose up -d          # optional: start postgres
uv run alembic upgrade head   # optional: when DB is running
uv run uvicorn main:app --reload --port 8080
```

Swagger UI: http://localhost:8080/docs

The Expo app (`saunsei`) already points to `http://localhost:8080/api/v1`, so once the command above is running the mobile client can consume mock sauna + ML endpoints without any further changes.

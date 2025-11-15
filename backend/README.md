# Junction Backend

Unified FastAPI backend that now powers every API surface in this repo:

- `/api/v1/...` mock sauna devices + user CRUD (ported from the Go service)
- `/api/harvia/...` **Harvia Cloud API integration** for real device authentication and control
- `/api/models/...` machine-learning endpoints (KNN, SVM, Decision Tree, Random Forest)
- PostgreSQL/SQLModel stack with Alembic migrations

## Quickstart

```bash
cd backend

# 1. Install dependencies (creates .venv if needed)
uv sync

# 2. (Optional) start postgres for SQLModel features
docker-compose up -d

# 3. Apply migrations when DB is running
uv run python -m alembic upgrade head

# 4. Run the API on the port expected by saunsei
uv run python scripts/generate_saunas.py --count 20
```

Swagger UI + ReDoc live at `http://localhost:8080/docs` / `http://localhost:8080/redoc`.

> The Expo client already calls `http://localhost:8080/api/v1/...`, so no frontend changes are necessary after starting this service.

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── models.py            # ML model implementations
├── schemas.py           # Pydantic schemas for API
├── database.py          # Database connection setup
├── db_models/           # SQLModel database models
├── routes/              # API routes (ML + sauna backend)
├── scripts/             # Data generators / helpers
├── alembic/             # Database migrations
├── docker-compose.yaml  # PostgreSQL container setup
└── test_main.py         # Integration-style tests
```

## Harvia Cloud API Integration

The backend now includes full integration with the Harvia Cloud API for real device authentication and control. See [HARVIA_API_GUIDE.md](HARVIA_API_GUIDE.md) for detailed usage instructions.

### Key Features
- **Authentication**: Login with user credentials (not stored on backend)
- **Device Management**: Fetch real devices from user's Harvia account
- **Device Control**: Send commands and set target temperatures
- **Telemetry**: Get real-time device state and sensor data
- **Token Management**: Automatic token refresh support

### Quick Example

```python
# 1. Authenticate
POST /api/harvia/auth/login
{ "username": "user@example.com", "password": "password" }

# 2. Get devices (with Authorization: Bearer <token>)
GET /api/harvia/devices

# 3. Set device target
PATCH /api/harvia/devices/target
{ "deviceId": "device-123", "temperature": 85.0 }
```

See the [complete guide](HARVIA_API_GUIDE.md) for more examples and best practices.

## Unified Sauna Backend (migrated from Go)

The legacy Go service has been fully re-implemented inside FastAPI. All responses still match the JSON envelope (`success`, `data`, `error`) that `saunsei/services/backendApi.ts` expects.

### Available endpoints

```
GET  /health
GET  /api/v1/ping
GET  /api/v1/devices
GET  /api/v1/devices?type=fenix|smart_sensor
GET  /api/v1/devices/{deviceId}
GET  /api/v1/devices/{deviceId}/reading
PUT  /api/v1/devices/{deviceId}/target  (body: { "targetTemp": 75-100 })
GET  /api/v1/devices/stats

GET  /api/v1/users
GET  /api/v1/users/{id}
POST /api/v1/users               (body: { "id", "name", "email" })
PUT  /api/v1/users/{id}          (body: { "name", "email" })
DELETE /api/v1/users/{id}
```

All responses match the JSON envelope that the Go handlers returned (`success`, `data`, `error`, etc.), so no changes are needed in `saunsei`'s `backendApi.ts`.

## Available Models

- K-Nearest Neighbors (KNN)
- Support Vector Machine (SVM)
- Decision Tree
- Random Forest

## Example Usage

```python
import requests

# Health check
response = requests.get("http://localhost:8080/health")

# Train a model
train_data = {
    "X": [[1, 2], [2, 3], [3, 4], [4, 5]],
    "y": [0, 0, 1, 1]
}
response = requests.post("http://localhost:8080/api/models/knn/train", json=train_data)

# Make predictions
predict_data = {
    "X": [[2.5, 3.5]]
}
response = requests.post("http://localhost:8080/api/models/knn/predict", json=predict_data)
```

## Database

The project uses PostgreSQL with SQLModel ORM. See [DATABASE.md](DATABASE.md) for:

- Database setup and configuration
- Working with models
- Running migrations with Alembic
- Query examples

# AI Service

A FastAPI service with machine learning models (K-Nearest Neighbors, SVM, Decision Tree, Random Forest) and PostgreSQL database integration using SQLModel.

## Setup

### 1. Install dependencies using uv:

```bash
uv sync
```

### 2. Start PostgreSQL database:

```bash
docker-compose up -d
```

### 3. Run database migrations:

```bash
uv run alembic upgrade head
```

## Run the Application

```bash
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## Project Structure

```
ai-service/
├── main.py              # FastAPI application entry point
├── models.py            # ML model implementations
├── schemas.py           # Pydantic schemas for API
├── database.py          # Database connection setup
├── db_models/           # SQLModel database models
├── routes/              # API routes organized by model type
├── alembic/             # Database migrations
└── docker-compose.yaml  # PostgreSQL container setup
```

## Documentation

- **API Documentation**: See [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
- **Database Guide**: See [DATABASE.md](DATABASE.md) for SQLModel and migration instructions

## API Documentation

Once running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Available Models

- K-Nearest Neighbors (KNN)
- Support Vector Machine (SVM)
- Decision Tree
- Random Forest

## Example Usage

```python
import requests

# Health check
response = requests.get("http://localhost:8000/health")

# Train a model
train_data = {
    "X": [[1, 2], [2, 3], [3, 4], [4, 5]],
    "y": [0, 0, 1, 1]
}
response = requests.post("http://localhost:8000/models/knn/train", json=train_data)

# Make predictions
predict_data = {
    "X": [[2.5, 3.5]]
}
response = requests.post("http://localhost:8000/models/knn/predict", json=predict_data)
```

## Database

The project uses PostgreSQL with SQLModel ORM. See [DATABASE.md](DATABASE.md) for:

- Database setup and configuration
- Working with models
- Running migrations with Alembic
- Query examples

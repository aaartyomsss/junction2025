# AI Service

A simple FastAPI service with machine learning models including K-Nearest Neighbors and Support Vector Machines.

## Setup

Install dependencies using uv:

```bash
uv sync
```

## Run the Application

```bash
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

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

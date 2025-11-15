from fastapi import APIRouter, HTTPException
from schemas import TrainRequest, PredictRequest, PredictResponse, TrainResponse
from models import model_manager

router = APIRouter(prefix="/models/knn", tags=["K-Nearest Neighbors"])


@router.post("/train", response_model=TrainResponse)
async def train_knn(request: TrainRequest, n_neighbors: int = 3):
    """Train K-Nearest Neighbors model"""
    try:
        model_manager.train_knn(request.X, request.y, n_neighbors=n_neighbors)
        return TrainResponse(
            message="KNN model trained successfully",
            model_type="KNN",
            samples_trained=len(request.y)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Training failed: {str(e)}")


@router.post("/predict", response_model=PredictResponse)
async def predict_knn(request: PredictRequest):
    """Make predictions using KNN model"""
    try:
        predictions = model_manager.predict("knn", request.X)
        return PredictResponse(predictions=predictions, model_type="KNN")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

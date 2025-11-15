from fastapi import APIRouter, HTTPException
from schemas import TrainRequest, PredictRequest, PredictResponse, TrainResponse
from models import model_manager

router = APIRouter(prefix="/models/random_forest", tags=["Random Forest"])


@router.post("/train", response_model=TrainResponse)
async def train_random_forest(request: TrainRequest, n_estimators: int = 100):
    """Train Random Forest model"""
    try:
        model_manager.train_random_forest(request.X, request.y, n_estimators=n_estimators)
        return TrainResponse(
            message="Random Forest model trained successfully",
            model_type="Random Forest",
            samples_trained=len(request.y)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Training failed: {str(e)}")


@router.post("/predict", response_model=PredictResponse)
async def predict_random_forest(request: PredictRequest):
    """Make predictions using Random Forest model"""
    try:
        predictions = model_manager.predict("random_forest", request.X)
        return PredictResponse(predictions=predictions, model_type="Random Forest")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

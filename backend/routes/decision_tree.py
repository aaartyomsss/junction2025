from fastapi import APIRouter, HTTPException
from schemas import TrainRequest, PredictRequest, PredictResponse, TrainResponse
from models import model_manager

router = APIRouter(prefix="/models/decision_tree", tags=["Decision Tree"])


@router.post("/train", response_model=TrainResponse)
async def train_decision_tree(request: TrainRequest, max_depth: int = None):
    """Train Decision Tree model"""
    try:
        model_manager.train_decision_tree(request.X, request.y, max_depth=max_depth)
        return TrainResponse(
            message="Decision Tree model trained successfully",
            model_type="Decision Tree",
            samples_trained=len(request.y)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Training failed: {str(e)}")


@router.post("/predict", response_model=PredictResponse)
async def predict_decision_tree(request: PredictRequest):
    """Make predictions using Decision Tree model"""
    try:
        predictions = model_manager.predict("decision_tree", request.X)
        return PredictResponse(predictions=predictions, model_type="Decision Tree")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

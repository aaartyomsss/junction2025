from fastapi import APIRouter, HTTPException
from schemas import TrainRequest, PredictRequest, PredictResponse, TrainResponse
from models import model_manager

router = APIRouter(prefix="/models/svm", tags=["Support Vector Machine"])


@router.post("/train", response_model=TrainResponse)
async def train_svm(request: TrainRequest, kernel: str = 'rbf'):
    """Train Support Vector Machine model"""
    try:
        model_manager.train_svm(request.X, request.y, kernel=kernel)
        return TrainResponse(
            message="SVM model trained successfully",
            model_type="SVM",
            samples_trained=len(request.y)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Training failed: {str(e)}")


@router.post("/predict", response_model=PredictResponse)
async def predict_svm(request: PredictRequest):
    """Make predictions using SVM model"""
    try:
        predictions = model_manager.predict("svm", request.X)
        return PredictResponse(predictions=predictions, model_type="SVM")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

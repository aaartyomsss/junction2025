from pydantic import BaseModel, Field, ConfigDict
from typing import List


class TrainRequest(BaseModel):
    """Request model for training ML models"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "X": [[1.0, 2.0], [2.0, 3.0], [3.0, 4.0], [4.0, 5.0]],
                "y": [0, 0, 1, 1]
            }
        }
    )
    
    X: List[List[float]] = Field(..., description="Training features (2D array)")
    y: List[int] = Field(..., description="Training labels (1D array)")


class PredictRequest(BaseModel):
    """Request model for making predictions"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "X": [[2.5, 3.5], [3.5, 4.5]]
            }
        }
    )
    
    X: List[List[float]] = Field(..., description="Features for prediction (2D array)")


class PredictResponse(BaseModel):
    """Response model for predictions"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "predictions": [0, 1],
                "model_type": "KNN"
            }
        }
    )
    
    predictions: List[int] = Field(..., description="Predicted class labels")
    model_type: str = Field(..., description="Type of model used")


class TrainResponse(BaseModel):
    """Response model for training"""
    message: str
    model_type: str
    samples_trained: int

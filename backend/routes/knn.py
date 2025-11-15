from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from schemas import TrainRequest, PredictRequest, PredictResponse, TrainResponse, SaunaRecommendationResponse
from models import model_manager
from database import get_session
from db_models import SaunaSession
import statistics

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


@router.get("/recommend-session", response_model=SaunaRecommendationResponse)
async def recommend_session(session: Session = Depends(get_session)):
    """Recommend optimal sauna session parameters using KNN model
    
    Uses K-Nearest Neighbors to predict optimal session parameters based on:
    - Historical session patterns (duration, temperature)
    - Clusters sessions into "categories" (short/medium/long, cool/warm/hot)
    - Finds the most common pattern using KNN classification
    """
    try:
        # Fetch all sessions (assuming all belong to same user)
        statement = select(SaunaSession)
        sessions_data = session.exec(statement).all()
        
        if not sessions_data:
            # Default recommendations if no history
            return SaunaRecommendationResponse(
                recommended_duration_minutes=45,
                recommended_temperature=80.0,
                confidence=0.0,
                based_on_sessions=0,
                insights=[
                    "No historical data available",
                    "These are default recommended values for beginners",
                    "Start your first session to get personalized recommendations"
                ]
            )
        
        if len(sessions_data) < 3:
            # Need at least 3 sessions for KNN (k=3)
            durations = [s.duration_seconds / 60 for s in sessions_data]
            avg_temps = [s.average_temperature for s in sessions_data]
            return SaunaRecommendationResponse(
                recommended_duration_minutes=round(statistics.mean(durations)),
                recommended_temperature=round(statistics.mean(avg_temps), 1),
                confidence=len(sessions_data) / 10.0,
                based_on_sessions=len(sessions_data),
                insights=[
                    f"Based on {len(sessions_data)} sessions",
                    "Need more sessions for AI predictions",
                    "Currently using simple averaging"
                ]
            )
        
        # Prepare training data: [duration_minutes, avg_temperature]
        X = []
        y = []  # Label: session quality category (0=short/cool, 1=medium, 2=long/hot)
        
        for s in sessions_data:
            duration_min = s.duration_seconds / 60
            avg_temp = s.average_temperature
            X.append([duration_min, avg_temp])
            
            # Classify sessions into categories based on duration and temp
            # This is a simplified "quality" score
            if duration_min < 30 or avg_temp < 75:
                y.append(0)  # Quick/cool session
            elif duration_min > 60 or avg_temp > 85:
                y.append(2)  # Long/hot session
            else:
                y.append(1)  # Medium session
        
        # Train KNN model with k=min(3, len(sessions))
        k = min(3, len(sessions_data))
        model_manager.train_knn(X, y, n_neighbors=k)
        
        # Find the most common session type by predicting on all historical sessions
        predictions = model_manager.predict("knn", X)
        most_common_type = max(set(predictions), key=predictions.count)
        
        # Get sessions of the preferred type
        preferred_sessions = [sessions_data[i] for i, pred in enumerate(predictions) if pred == most_common_type]
        
        if not preferred_sessions:
            preferred_sessions = sessions_data
        
        # Calculate recommendations from preferred session type
        durations = [s.duration_seconds / 60 for s in preferred_sessions]
        avg_temps = [s.average_temperature for s in preferred_sessions]
        
        recommended_duration = round(statistics.mean(durations))
        recommended_temp = round(statistics.mean(avg_temps), 1)
        
        # Calculate confidence based on consistency and sample size
        confidence = min(len(sessions_data) / 10.0, 1.0)
        if len(preferred_sessions) >= len(sessions_data) * 0.6:
            confidence = min(confidence + 0.1, 1.0)  # Bonus for consistent pattern
        
        # Generate insights
        insights = []
        insights.append(f"KNN model analyzed {len(sessions_data)} sessions")
        
        type_names = {0: "quick & efficient", 1: "balanced", 2: "extended & intense"}
        insights.append(f"Your preferred style: {type_names.get(most_common_type, 'balanced')} sessions")
        
        if recommended_duration < 30:
            insights.append("You prefer shorter, intense sessions")
        elif recommended_duration > 60:
            insights.append("You enjoy long, relaxing sessions")
        else:
            insights.append("You prefer moderate session lengths")
        
        if recommended_temp < 75:
            insights.append("You prefer lower temperatures")
        elif recommended_temp > 85:
            insights.append("You enjoy high heat sessions")
        else:
            insights.append("Traditional Finnish sauna temperatures suit you")
        
        return SaunaRecommendationResponse(
            recommended_duration_minutes=recommended_duration,
            recommended_temperature=recommended_temp,
            confidence=round(confidence, 2),
            based_on_sessions=len(sessions_data),
            insights=insights
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

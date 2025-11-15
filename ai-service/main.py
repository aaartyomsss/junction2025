from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import model_manager
from routes import knn_router, svm_router, decision_tree_router, random_forest_router, users_router
from database import create_db_and_tables


app = FastAPI(
    title="AI Service API",
    description="FastAPI service with ML models including KNN, SVM, Decision Tree, and Random Forest",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(knn_router, prefix="/api")
app.include_router(svm_router, prefix="/api")
app.include_router(decision_tree_router, prefix="/api")
app.include_router(random_forest_router, prefix="/api")
app.include_router(users_router, prefix="/api")


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup"""
    create_db_and_tables()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to AI Service API",
        "documentation": "/docs",
        "available_models": ["knn", "svm", "decision_tree", "random_forest"]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-service"}


@app.get("/models/status")
async def models_status():
    """Get training status of all models"""
    return {
        "knn": model_manager.is_trained("knn"),
        "svm": model_manager.is_trained("svm"),
        "decision_tree": model_manager.is_trained("decision_tree"),
        "random_forest": model_manager.is_trained("random_forest")
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

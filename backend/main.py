import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import model_manager
from routes import (
    decision_tree_router,
    knn_router,
    random_forest_router,
    sauna_backend_router,
    saunas_router,
    svm_router,
    users_router,
)
from database import create_db_and_tables


app = FastAPI(
    title="Junction Backend API",
    description=(
        "Unified FastAPI backend serving ML models, mock sauna devices, and user APIs"
    ),
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sauna backend (migrated from Go service)
app.include_router(sauna_backend_router)

# ML/DB routes remain under /api for backwards compatibility
app.include_router(knn_router, prefix="/api")
app.include_router(svm_router, prefix="/api")
app.include_router(decision_tree_router, prefix="/api")
app.include_router(random_forest_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(saunas_router, prefix="/api")


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup (optional - app works without DB)"""
    db_initialized = create_db_and_tables()
    if not db_initialized:
        print("⚠️  Database not available. /api/v1/devices endpoints work without PostgreSQL.")
        print("   To enable database features, start PostgreSQL: docker-compose up -d")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Junction Backend API",
        "documentation": "/docs",
        "available_models": ["knn", "svm", "decision_tree", "random_forest"],
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Server is running", "service": "backend"}


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

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)

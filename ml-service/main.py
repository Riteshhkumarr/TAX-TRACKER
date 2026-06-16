"""
TaxTracker AI - ML Service
Main FastAPI application entry point.
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.model_store import ModelStore
from routers import categorize, predict, anomaly, insights, chat

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Global model store instance
model_store = ModelStore()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler - trains/loads models on startup."""
    logger.info("Starting TaxTracker AI ML Service...")
    try:
        model_store.load_or_train_models()
        logger.info("ML models loaded/trained successfully.")
    except Exception as e:
        logger.error(f"Failed to load/train models: {e}")
        raise

    # Make model_store available to routers via app state
    app.state.model_store = model_store

    yield

    logger.info("Shutting down TaxTracker AI ML Service...")


# Create FastAPI app
app = FastAPI(
    title="TaxTracker AI - ML Service",
    description=(
        "AI-powered ML microservice for tax tracking, expense categorization, "
        "anomaly detection, financial insights, and tax predictions."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(categorize.router, prefix="/categorize", tags=["Categorization"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(anomaly.router, prefix="/anomaly", tags=["Anomaly Detection"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Returns service status and model loading state.
    """
    models_loaded = (
        model_store.expense_classifier is not None
        and model_store.anomaly_detector is not None
        and model_store.tax_predictor is not None
    )
    return {
        "status": "ok",
        "models_loaded": models_loaded,
        "service": "TaxTracker AI - ML Service",
        "version": "1.0.0",
    }


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint returning service information.
    """
    return {
        "service": "TaxTracker AI - ML Service",
        "version": "1.0.0",
        "description": "AI-powered ML microservice for tax and expense intelligence",
        "endpoints": {
            "health": "/health",
            "categorize": "/categorize",
            "predict": "/predict",
            "anomaly": "/anomaly/detect",
            "insights": "/insights/generate",
            "chat": "/chat",
            "docs": "/docs",
            "redoc": "/redoc",
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

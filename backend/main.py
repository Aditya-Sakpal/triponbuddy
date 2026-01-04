"""
Main FastAPI application for TripOnBuddy
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import mongodb
from routers import feedback, forum, payments, trips, users, upload, join_requests
from routers import issues

from utils.cache import get_cache_info

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting TripOnBuddy Backend...")

    try:
        await mongodb.connect()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down TripOnBuddy Backend...")
    await mongodb.disconnect()


# Create FastAPI application
app = FastAPI(
    title="TripOnBuddy Backend API",
    description="AI-powered travel planning platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
# Split comma-separated origins and strip whitespace
cors_origins_list = [origin.strip() for origin in settings.cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(feedback.router)
app.include_router(forum.router)
app.include_router(payments.router)
app.include_router(users.router)
app.include_router(trips.router)
app.include_router(upload.router)
app.include_router(join_requests.router)
app.include_router(issues.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to TripOnBuddy Backend API",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        # You could add more health checks here
        cache_info = get_cache_info()

        return {
            "status": "healthy",
            "database": "connected",
            "cache": cache_info,
            "service": "TripOnBuddy Backend"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": str(exc) if settings.debug else "Internal server error"
            }
        }
    )


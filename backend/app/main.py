from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.firebase import get_firebase_admin
from app.api.routes import auth, rag, materials, assignments
from app.api import quote, scout


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    print("🚀 Starting up Educational Dashboard API...")
    
    # Initialize Firebase Admin SDK (optional - will warn if not configured)
    try:
        firebase_admin = get_firebase_admin()
        firebase_admin.initialize()
        print("✅ Firebase Admin SDK initialized successfully")
    except Exception as e:
        print(f"⚠️  Firebase Admin SDK not configured: {str(e)}")
        print("   You can still use the API, but Firebase authentication won't work")
    
    # Connect to MongoDB
    await connect_to_mongo()
    
    print("✅ Application started successfully")
    
    yield
    
    # Shutdown
    print("🔄 Shutting down...")
    await close_mongo_connection()
    print("👋 Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Educational Dashboard with Firebase Auth and MongoDB",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(rag.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")
app.include_router(quote.router, prefix="/api")
app.include_router(scout.router, prefix="/api")


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Educational Dashboard API",
        "docs": "/api/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

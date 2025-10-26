from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.assignment import Assignment
from app.models.material import Material
from app.models.course import Course
from app.models.submission import Submission
from app.models.performance import Performance


class Database:
    client: AsyncIOMotorClient = None
    

db = Database()


async def connect_to_mongo():
    """Connect to MongoDB"""
    try:
        # Add tlsAllowInvalidCertificates parameter to handle SSL certificate issues
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tlsAllowInvalidCertificates=True
        )
        
        # Initialize Beanie with document models
        await init_beanie(
            database=db.client[settings.MONGODB_DB_NAME],
            document_models=[
                User,
                Assignment,
                Material,
                Course,
                Submission,
                Performance
            ]
        )
        print("✅ Connected to MongoDB successfully")
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {str(e)}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("🔌 MongoDB connection closed")


def get_database():
    """Get database instance"""
    return db.client[settings.MONGODB_DB_NAME]

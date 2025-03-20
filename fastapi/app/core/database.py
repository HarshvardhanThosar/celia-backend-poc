# app/core/database.py

from app.core.logger import logger
from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient
from enum import Enum

MONGO_URI = f"mongodb+srv://{settings.MONGO_USERNAME}:{settings.MONGO_PASSWORD}@{settings.MONGO_HOST}/?retryWrites=true&w=majority&appName={settings.MONGO_CLUSTER}"

client = None
db = None

def connect_db():
    """Initialize MongoDB connection."""
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[settings.MONGO_DATABASE]
        logger.info("Connected to MongoDB Atlas!")
    except Exception as e:
        logger.warning(f"MongoDB Connection Error: {e}")

def get_db():
    """Return the MongoDB database instance."""
    return db

def close_db():
    """Close MongoDB connection."""
    if client:
        client.close()
        logger.info("MongoDB connection closed.")

class Collection(str, Enum):
    TASKS = "tasks"
    TASK_TYPES = "task_types"
    SKILLS = "skills"
    COUPONS = "coupons"
    RETAIL_BATCHES = "retail_batches"
    RETAIL_ITEMS = "retail_items"
    PROFILES = 'profiles'

def get_collection(_collection: Collection):
    """Return a predefined collection instance."""
    if db is None:
        raise Exception("Database connection is not initialized. Call `connect_db()` first.")
    
    return db[_collection.value]
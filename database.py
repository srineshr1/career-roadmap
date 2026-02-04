"""
MongoDB Atlas Database Layer for Career Roadmap Scout
Provides database operations for user data and roadmap storage.
Users are identified by name for cross-device access.
"""
import os
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

# Global MongoDB client
_client = None
_db = None

def get_db_connection():
    """
    Initialize and return MongoDB database connection.
    Uses MongoDB Atlas connection string from environment.
    """
    global _client, _db
    
    if _db is not None:
        return _db
    
    try:
        mongodb_uri = os.getenv("MONGODB_URI")
        if not mongodb_uri:
            raise ValueError("MONGODB_URI not found in environment variables")
        
        _client = MongoClient(mongodb_uri)
        # Test connection
        _client.admin.command('ping')
        
        _db = _client.get_database()  # Uses database from connection string
        
        # Create indexes for efficient queries
        _db.users.create_index("name_lower", unique=True)
        _db.roadmaps.create_index("user_name_lower")
        
        print("✓ Connected to MongoDB Atlas")
        return _db
    
    except ConnectionFailure as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        print(f"✗ Database error: {e}")
        raise

def get_users_collection():
    """Get users collection."""
    db = get_db_connection()
    return db.users

def get_roadmaps_collection():
    """Get roadmaps collection."""
    db = get_db_connection()
    return db.roadmaps

def create_or_get_user(name, career, level):
    """
    Create a new user or get existing user by name (case-insensitive).
    Users can access their data from any device using their name.
    
    Args:
        name: User's name (used as unique identifier)
        career: Career path chosen
        level: Experience level
        
    Returns:
        User document with user_id
    """
    users = get_users_collection()
    name_lower = name.strip().lower()
    
    # Try to find existing user
    user = users.find_one({"name_lower": name_lower})
    
    if user:
        # Update career and level if changed
        users.update_one(
            {"name_lower": name_lower},
            {
                "$set": {
                    "career": career,
                    "level": level,
                    "last_login": datetime.utcnow()
                }
            }
        )
        return user
    
    # Create new user
    user_id = str(uuid.uuid4())
    user_doc = {
        "user_id": user_id,
        "name": name.strip(),
        "name_lower": name_lower,
        "career": career,
        "level": level,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
    
    users.insert_one(user_doc)
    return user_doc

def save_roadmap(user_name, roadmap_data):
    """
    Save or update user's roadmap in database.
    
    Args:
        user_name: User's name
        roadmap_data: Complete roadmap data from AI
        
    Returns:
        Success status and roadmap_id
    """
    roadmaps = get_roadmaps_collection()
    users = get_users_collection()
    
    name_lower = user_name.strip().lower()
    
    # Get user
    user = users.find_one({"name_lower": name_lower})
    if not user:
        raise ValueError(f"User {user_name} not found")
    
    # Add task IDs and completion status to each task
    if "daily_tasks" in roadmap_data:
        for day in roadmap_data["daily_tasks"]:
            if "tasks" in day:
                for i, task in enumerate(day["tasks"]):
                    task["id"] = f"{day['date']}_task_{i}"
                    task["completed"] = False
    
    # Create or update roadmap
    roadmap_doc = {
        "user_id": user["user_id"],
        "user_name": user["name"],
        "user_name_lower": name_lower,
        "roadmap": roadmap_data,
        "updated_at": datetime.utcnow()
    }
    
    # Upsert roadmap
    result = roadmaps.update_one(
        {"user_name_lower": name_lower},
        {"$set": roadmap_doc, "$setOnInsert": {"created_at": datetime.utcnow()}},
        upsert=True
    )
    
    return {
        "success": True,
        "roadmap_id": str(result.upserted_id) if result.upserted_id else "updated"
    }

def get_roadmap(user_name):
    """
    Retrieve user's roadmap by name.
    
    Args:
        user_name: User's name
        
    Returns:
        Roadmap document or None
    """
    roadmaps = get_roadmaps_collection()
    name_lower = user_name.strip().lower()
    
    roadmap = roadmaps.find_one({"user_name_lower": name_lower})
    return roadmap

def update_task_completion(user_name, date, task_id, completed):
    """
    Update completion status of a specific task.
    
    Args:
        user_name: User's name
        date: Date of the task (YYYY-MM-DD)
        task_id: Task identifier
        completed: Boolean completion status
        
    Returns:
        Success status
    """
    roadmaps = get_roadmaps_collection()
    name_lower = user_name.strip().lower()
    
    # Update the specific task's completion status
    result = roadmaps.update_one(
        {
            "user_name_lower": name_lower,
            "roadmap.daily_tasks.date": date,
            "roadmap.daily_tasks.tasks.id": task_id
        },
        {
            "$set": {
                "roadmap.daily_tasks.$[day].tasks.$[task].completed": completed,
                "updated_at": datetime.utcnow()
            }
        },
        array_filters=[
            {"day.date": date},
            {"task.id": task_id}
        ]
    )
    
    return {"success": result.modified_count > 0}

def get_user_statistics(user_name):
    """
    Calculate user statistics from their roadmap.
    
    Args:
        user_name: User's name
        
    Returns:
        Dictionary with statistics
    """
    roadmap_doc = get_roadmap(user_name)
    
    if not roadmap_doc or "roadmap" not in roadmap_doc:
        return {
            "total_tasks": 0,
            "completed_tasks": 0,
            "completion_percentage": 0,
            "current_streak": 0
        }
    
    roadmap = roadmap_doc["roadmap"]
    total = 0
    completed = 0
    
    if "daily_tasks" in roadmap:
        for day in roadmap["daily_tasks"]:
            if "tasks" in day:
                for task in day["tasks"]:
                    total += 1
                    if task.get("completed", False):
                        completed += 1
    
    completion_percentage = (completed / total * 100) if total > 0 else 0
    
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "completion_percentage": round(completion_percentage, 1),
        "current_streak": 0  # TODO: Calculate actual streak
    }

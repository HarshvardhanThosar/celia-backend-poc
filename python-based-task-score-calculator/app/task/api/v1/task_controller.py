from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import textstat
import math
import random
from datetime import datetime, timezone
from bson import ObjectId
import requests
from app import constants
from app.core.database import Collection, get_collection

retail_router = APIRouter(prefix="/task", tags=["Task APIs"])
IRELAND_LOCATION = (53.425046, -7.944624)


distance_cache = {}


class TaskScoreRequest(BaseModel):
    task_id: str


def round_to_factor(value: float, factor: int) -> int:
    """Rounds value to nearest multiple of `factor`."""
    return math.ceil(value / factor) * factor


def calculate_description_complexity_score(description: str) -> int:
    """Calculates readability complexity score."""
    flesch_score = max(textstat.flesch_reading_ease(description), 0)
    smog_index = textstat.smog_index(description)
    fog_index = textstat.gunning_fog(description)
    ari_index = textstat.automated_readability_index(description)

    complexity_score = (
        (123 - flesch_score) + ((smog_index + fog_index + ari_index) / 3)
    ) / 2

    return math.ceil(complexity_score)


async def get_task_type_skills_score(task_type_id: str) -> int:
    """Fetch the skill complexity score from the task type."""
    try:
        task_types_collection = get_collection(Collection.TASK_TYPES)
        skills_collection = get_collection(Collection.SKILLS)

        task_type = await task_types_collection.find_one({"_id": ObjectId(task_type_id)})
        if not task_type:
            return 0

        skill_ids = task_type.get("required_skills", [])
        total_skill_score = 0

        for skill_id in skill_ids:
            skill = await skills_collection.find_one({"_id": ObjectId(skill_id)})
            if skill:
                total_skill_score += skill.get("score", 0)

        return total_skill_score
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching task type skills: {str(e)}")


def get_distance_km(lat1, lon1, lat2, lon2):
    """Uses a cache to store GPS distances and avoids unnecessary API calls."""
    location_key = (lat2, lon2)

    if location_key in distance_cache:
        return distance_cache[location_key]  

    try:
        API_KEY = "5b3ce3597851110001cf62482b67bae7dd504ae6bf893c0dad6eeb26"
        url = f"https://api.openrouteservice.org/v2/directions/driving-car?api_key={API_KEY}&start={lon1},{lat1}&end={lon2},{lat2}"

        response = requests.get(url)
        response_data = response.json()

        if "routes" in response_data and len(response_data["routes"]) > 0:
            distance_km = response_data["routes"][0]["summary"]["distance"] / 1000
            distance_cache[location_key] = distance_km  
            return distance_km
        else:
            return None

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating distance: {str(e)}")


@retail_router.post("/calculate-score")
async def calculate_task_score(payload: TaskScoreRequest):
    """Fetches task details from MongoDB, calculates the score, and returns the score range."""
    try:
        tasks_collection = get_collection(Collection.TASKS)
        task = await tasks_collection.find_one({"_id": ObjectId(payload.task_id)})

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if isinstance(task["starts_at"], datetime):
            task["starts_at"] = task["starts_at"].timestamp()

        if isinstance(task["completes_at"], datetime):
            task["completes_at"] = task["completes_at"].timestamp()

        start_date = datetime.fromtimestamp(task["starts_at"], tz=timezone.utc)
        end_date = datetime.fromtimestamp(task["completes_at"], tz=timezone.utc)
        days_factor = max((end_date - start_date).days, 1)

        skill_complexity = round_to_factor(
            await get_task_type_skills_score(task["task_type"]) * constants.SKILL_COMPLEXITY_FACTOR,
            constants.ROUNDING_FACTOR
        )

        volunteer_factor = round_to_factor(
            min(task["volunteers_required"], constants.MAX_VOLUNTEERS_REQUIRED) * constants.VOLUNTEERING_FACTOR,
            constants.ROUNDING_FACTOR
        )

        hours_factor = round_to_factor(
            min(task["hours_required_per_day"], constants.MAX_HOURS_REQUIRED_PER_DAY) * days_factor * constants.DURATION_FACTOR,
            constants.ROUNDING_FACTOR
        )

        description_complexity = round_to_factor(
            calculate_description_complexity_score(task["description"]) * constants.DESCRIPTION_COMPLEXITY_FACTOR,
            constants.ROUNDING_FACTOR
        )

        distance_score = 0
        if not task.get("is_remote", True) and "location" in task:
            lat, lon = task["location"]["latitude"], task["location"]["longitude"]
            distance_km = get_distance_km(IRELAND_LOCATION[0], IRELAND_LOCATION[1], lat, lon)

            if distance_km:
                distance_score = round_to_factor(distance_km * constants.DISTANCE_FACTOR, constants.ROUNDING_FACTOR)

        random_hook = round_to_factor(random.randint(10, 50) * 10, constants.ROUNDING_FACTOR)

        min_score = round_to_factor(
            (skill_complexity + volunteer_factor + hours_factor + description_complexity + distance_score) * constants.MIN_RATING,
            constants.ROUNDING_FACTOR
        )

        additional_component = round_to_factor(min_score * 0.25, constants.ROUNDING_FACTOR)
        max_score = round_to_factor(
            min_score + (additional_component * (constants.MAX_RATING - 1)),
            constants.ROUNDING_FACTOR
        )

        min_score += random_hook
        max_score += random_hook

        
        priority = task.get("priority", "medium").lower()
        if priority == "low":
            min_score = round_to_factor(min_score * 0.9, constants.ROUNDING_FACTOR)  
            max_score = round_to_factor(max_score * 0.9, constants.ROUNDING_FACTOR)
        elif priority == "high":
            min_score = round_to_factor(min_score * 1.15, constants.ROUNDING_FACTOR)  
            max_score = round_to_factor(max_score * 1.15, constants.ROUNDING_FACTOR)

        return {
            "task_id": payload.task_id,
            "min_score": min_score,
            "max_score": max_score
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating score: {str(e)}")
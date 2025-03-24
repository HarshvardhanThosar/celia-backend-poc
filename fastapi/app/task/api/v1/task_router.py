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


task_router = APIRouter(prefix="/task", tags=["Task APIs"])
IRELAND_LOCATION = (53.425046, -7.944624)

distance_cache = {}


class TaskScoreRequest(BaseModel):
    task_id: str

def round_to_factor(value: float, factor: int) -> int:
    return math.ceil(value / factor) * factor

def calculate_description_complexity_score(description: str) -> int:
    flesch_score = max(textstat.flesch_reading_ease(description), 0)
    smog_index = textstat.smog_index(description)
    fog_index = textstat.gunning_fog(description)
    ari_index = textstat.automated_readability_index(description)
    complexity_score = ((123 - flesch_score) + ((smog_index + fog_index + ari_index) / 3)) / 2
    return math.ceil(complexity_score)

async def get_task_type_skills_score(task_type_id):
    try:
        task_types_collection = get_collection(Collection.TASK_TYPES)
        skills_collection = get_collection(Collection.SKILLS)

        if isinstance(task_type_id, dict) and "_id" in task_type_id:
            task_type_id = task_type_id["_id"]

        if not isinstance(task_type_id, (str, ObjectId)):
            raise ValueError("Invalid task_type_id format")

        task_type_id = ObjectId(task_type_id) if isinstance(task_type_id, str) else task_type_id

        task_type = await task_types_collection.find_one({"_id": task_type_id})
        if not task_type:
            return 0

        skill_ids = task_type.get("required_skills", [])
        total_skill_score = 0

        for skill_id in skill_ids:
            if isinstance(skill_id, dict) and "_id" in skill_id:
                skill_id = skill_id["_id"]
            if isinstance(skill_id, str):
                skill_id = ObjectId(skill_id)

            skill = await skills_collection.find_one({"_id": skill_id})
            if skill:
                total_skill_score += skill.get("score", 0)

        return total_skill_score
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching task type skills: {str(e)}")

def get_distance_km(lat1, lon1, lat2, lon2):
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

@task_router.post("/calculate-score")
async def calculate_task_score(payload: TaskScoreRequest):
    try:
        tasks_collection = get_collection(Collection.TASKS)
        task = await tasks_collection.find_one({"_id": ObjectId(payload.task_id)})

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        start_date = task["starts_at"] if isinstance(task["starts_at"], datetime) else datetime.fromtimestamp(task["starts_at"], tz=timezone.utc)
        end_date = task["completes_at"] if isinstance(task["completes_at"], datetime) else datetime.fromtimestamp(task["completes_at"], tz=timezone.utc)
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

        score_breakdown = [
            {"label": "Skill Complexity", "key": "skill_complexity", "score": skill_complexity},
            {"label": "Volunteer Requirement", "key": "volunteer_factor", "score": volunteer_factor},
            {"label": "Hours Required", "key": "hours_factor", "score": hours_factor},
            {"label": "Description Complexity", "key": "description_complexity", "score": description_complexity},
            {"label": "Distance to Location", "key": "distance_score", "score": distance_score},
            {"label": "Random Hook", "key": "random_hook", "score": random_hook},
        ]

        return {"task_id": payload.task_id, "score_breakdown": score_breakdown}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating score: {str(e)}")
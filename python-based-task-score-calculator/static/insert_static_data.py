from bson.objectid import ObjectId
from app.core.database import get_collection, Collection
from datetime import datetime
from app.core.logger import logger
from app.models.task_model import BaseSkillModel, BaseTaskTypeModel

async def insert_skill(name: str, description: str, score: int):
    """Insert a skill if it does not exist, return its ObjectId."""
    skills_collection = get_collection(Collection.SKILLS)
    
    existing_skill = await skills_collection.find_one({"name": name})
    if existing_skill:
        return existing_skill["_id"]
    
  
    skill_data: BaseSkillModel = {
        "name": name,
        "description": description,
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "score": score
    }
    inserted_skill = await skills_collection.insert_one(skill_data)
    return inserted_skill.inserted_id

async def insert_task_type(name: str, description: str, skill_ids: list[ObjectId]):
    """Insert a task type if it does not exist, linked to skills via ObjectIds."""
    task_types_collection = get_collection(Collection.TASK_TYPES)
    
    existing_task_type = await task_types_collection.find_one({"name": name})
    if existing_task_type:
        return existing_task_type["_id"]

  
    task_type_data: BaseTaskTypeModel = {
        "name": name,
        "description": description,
        "status": "active",
        "required_skills": skill_ids,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    inserted_task_type = await task_types_collection.insert_one(task_type_data)
    return inserted_task_type.inserted_id

async def insert_static_data():
    """Insert predefined skills and task types into MongoDB with ObjectId linking."""

    first_aid_id = await insert_skill("First Aid", "Basic emergency medical care training", 50)
    teaching_id = await insert_skill("Teaching", "Providing educational support and tutoring", 50)
    leadership_id = await insert_skill("Leadership", "Guiding and managing teams effectively", 50)
    event_mgmt_id = await insert_skill("Event Management", "Planning and organizing community events", 50)
    disaster_relief_id = await insert_skill("Disaster Relief", "Assisting in emergency disaster situations", 50)
    fundraising_id = await insert_skill("Fundraising", "Managing and executing fundraising initiatives", 50)
    animal_welfare_id = await insert_skill("Animal Welfare", "Rescuing and rehabilitating animals", 50)
    elderly_care_id = await insert_skill("Elderly Care", "Providing assistance to elderly citizens", 50)
    technical_support_id = await insert_skill("Technical Support", "Helping communities with technology", 50)
    environmental_conservation_id = await insert_skill("Environmental Conservation", "Preserving the environment", 50)
  
    await insert_task_type("Medical Assistance", "Helping patients and medical staff", [first_aid_id])
    await insert_task_type("Educational Support", "Tutoring and mentoring students", [teaching_id])
    await insert_task_type("Community Service", "General volunteering for community welfare", [leadership_id, event_mgmt_id])
    await insert_task_type("Emergency Response", "Helping during crises like floods or fires", [first_aid_id, disaster_relief_id])
    await insert_task_type("Environmental Cleanup", "Cleaning public spaces and parks", [environmental_conservation_id])
    await insert_task_type("Fundraising Events", "Organizing charity and donation drives", [fundraising_id])
    await insert_task_type("Animal Rescue", "Saving and rehabilitating stray animals", [animal_welfare_id])
    await insert_task_type("Elderly Assistance", "Helping elderly citizens with daily tasks", [elderly_care_id])
    await insert_task_type("Health Awareness Campaign", "Spreading awareness on health issues", [teaching_id, leadership_id])
    await insert_task_type("Food Distribution", "Helping in food drives and soup kitchens", [event_mgmt_id])
    await insert_task_type("Shelter Assistance", "Supporting homeless shelters and rehabilitation centers", [leadership_id])
    await insert_task_type("Technical Training", "Providing IT and vocational training to communities", [technical_support_id])

    logger.info("Static skills and task types inserted successfully!")
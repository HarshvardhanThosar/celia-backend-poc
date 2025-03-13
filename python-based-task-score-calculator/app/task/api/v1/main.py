# app/community/api/v1/main.py

from fastapi import APIRouter
from app.task.api.v1.task_router import task_router

v1_router = APIRouter(prefix="/v1")

v1_router.include_router(task_router)

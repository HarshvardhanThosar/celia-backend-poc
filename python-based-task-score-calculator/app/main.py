# app/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager

# C O N F I G
from app.core.database import connect_db, close_db

# R O U T E R S
from app.task.api.v1.main import v1_router as task_v1_router

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup & shutdown for MongoDB connection."""
    connect_db()
    # await insert_static_data()
    yield
    close_db()

app = FastAPI(lifespan=lifespan, root_path='/api')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_v1_router)

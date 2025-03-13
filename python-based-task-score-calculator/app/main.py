# python-based-task-score-calculator/app/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager

# C O N F I G
from app.core.database import connect_db, close_db

# R O U T E R S
from app.task.api.v1.main import v1_router

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup & shutdown for MongoDB connection."""
    connect_db()
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

@app.get("/")
def root():
    return {"message": "Root endpoint"}

@app.get("/api/")
def api_root():
    return {"message": "API root is working!"}

app.include_router(v1_router)

# app/utils/response.py

from typing import Any
from app.models.response_model import ResponseModel

def create_response(status: int, message: str, data: Any = None, metadata: Any = None):
    """Creates a consistent API response format."""
    return ResponseModel(
        status=status,
        message=message,
        data=data or [],
        metadata=metadata or {}
    )
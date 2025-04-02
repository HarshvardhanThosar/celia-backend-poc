# app/utils/mongo_id.py

async def serialize_doc(doc):
    """Converts MongoDB ObjectId to string for JSON response."""
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc
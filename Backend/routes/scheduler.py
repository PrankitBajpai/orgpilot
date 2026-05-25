from fastapi import APIRouter, HTTPException, status
from database import meetings_collection
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

# --- PYDANTIC SCHEMAS ---
class MeetingSchema(BaseModel):
    title: str = Field(..., example="Q2 Sync Meeting")
    description: str = Field(None, example="Align team expectations and progress")
    date_time: datetime = Field(..., example="2026-06-01T10:00:00") # ISO 8601 parsing format
    duration_minutes: int = Field(30, ge=5, le=480) # Bound between 5 mins and 8 hours
    attendees: List[str] # List of real attendee emails

@router.post("/meetings", status_code=status.HTTP_201_CREATED)
async def schedule_meeting(meeting: MeetingSchema):
    # Convert Pydantic object into standard dictionary dataset format
    meeting_dict = meeting.model_dump()
    
    # Write cleanly to MongoDB meetings collection
    result = await meetings_collection.insert_one(meeting_dict)
    return {"id": str(result.inserted_id), "message": "Meeting scheduled successfully"}

@router.get("/meetings")
async def get_meetings():
    meetings = []
    # Stream database cursor documents
    async for meeting in meetings_collection.find().sort("date_time", 1): # Sorted chronologically
        meeting["id"] = str(meeting["_id"])
        del meeting["_id"]
        
        # Format datetime back to string for easier frontend parsing readability if preferred
        if isinstance(meeting["date_time"], datetime):
            meeting["date_time"] = meeting["date_time"].isoformat()
            
        meetings.append(meeting)
    return meetings

@router.delete("/meetings/{id}")
async def cancel_meeting(id: str):
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid target Meeting ID structure format")

    result = await meetings_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meeting event not found in database records")
        
    return {"message": "Meeting canceled successfully"}
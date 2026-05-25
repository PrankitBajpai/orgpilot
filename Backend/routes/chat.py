from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import os
import httpx
from datetime import datetime

# --- CONFIG ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL     = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
MONGO_URL      = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# --- DB ---
client          = AsyncIOMotorClient(MONGO_URL)
db              = client["orgpilot"]
chat_collection = db["chats"]

# --- ROUTER ---
router = APIRouter(prefix="/api/chat", tags=["chat"])

# --- MODELS ---
class Message(BaseModel):
    role:    str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message:    str
    history:    list[Message] = []

# --- ROUTE: Send message ---
@router.post("/send")
async def send_message(req: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    # Build Gemini conversation history
    contents = []
    for msg in req.history:
        contents.append({
            "role": "user" if msg.role == "user" else "model",
            "parts": [{"text": msg.content}]
        })
    # Add current message
    contents.append({
        "role": "user",
        "parts": [{"text": req.message}]
    })

    # Call Gemini API
    async with httpx.AsyncClient() as client_http:
        response = await client_http.post(
            GEMINI_URL,
            json={
                "system_instruction": {
                    "parts": [{"text": "You are OrgPilot, a helpful AI assistant for organizations. Help with communication, scheduling, emails, and organizational tasks."}]
                },
                "contents": contents
            },
            timeout=30.0
        )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Gemini error: {response.text}")

    data        = response.json()
    reply       = data["candidates"][0]["content"]["parts"][0]["text"]

    # Save to MongoDB
    await chat_collection.insert_one({
        "session_id": req.session_id,
        "user_msg":   req.message,
        "bot_reply":  reply,
        "timestamp":  datetime.utcnow()
    })

    return {"reply": reply}


# --- ROUTE: Get chat history ---
@router.get("/history/{session_id}")
async def get_history(session_id: str):
    cursor = chat_collection.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1)

    history = []
    async for doc in cursor:
        history.append({
            "user":      doc["user_msg"],
            "assistant": doc["bot_reply"],
            "timestamp": doc["timestamp"].isoformat()
        })

    return {"history": history}
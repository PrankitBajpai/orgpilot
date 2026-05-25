from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import httpx
import os
from datetime import datetime

# --- CONFIG ---
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# --- DB ---
client          = AsyncIOMotorClient(MONGO_URL)
db              = client["orgpilot"]
chat_collection = db["chats"]

# --- ROUTER ---
router = APIRouter(prefix="/chat", tags=["chat"])

# --- MODELS ---
class Message(BaseModel):
    role:    str
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message:    str
    history:    list[Message] = []
    system:     str = "You are OrgPilot, a helpful AI assistant for organizations. Help with communication, scheduling, emails, and organizational tasks."

# --- ROUTE: Send message ---
@router.post("/send")
async def send_message(req: ChatRequest):
    # Read key fresh on every request
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_api_key}"

    if not gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    contents = []
    for msg in req.history:
        contents.append({
            "role":  "user" if msg.role == "user" else "model",
            "parts": [{"text": msg.content}]
        })

    contents.append({
        "role":  "user",
        "parts": [{"text": req.message}]
    })

    payload = {
        "system_instruction": {
            "parts": [{"text": req.system}]
        },
        "contents": contents
    }

    async with httpx.AsyncClient() as client_http:
        res = await client_http.post(
            gemini_url,
            json=payload,
            timeout=30.0,
        )

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Gemini error: {res.text}")

    data  = res.json()
    reply = data["candidates"][0]["content"]["parts"][0]["text"]

    await chat_collection.insert_one({
        "session_id": req.session_id,
        "user_msg":   req.message,
        "bot_reply":  reply,
        "timestamp":  datetime.utcnow()
    })

    return {"content": [{"text": reply}]}


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
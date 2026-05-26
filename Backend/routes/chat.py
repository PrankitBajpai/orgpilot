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
    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")

    # Build messages — system first, then history, then new message
    messages = [{"role": "system", "content": req.system}]

    for msg in req.history:
        messages.append({
            "role":    msg.role,
            "content": msg.content
        })

    messages.append({
        "role":    "user",
        "content": req.message
    })

    async with httpx.AsyncClient() as client_http:
        res = await client_http.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type":  "application/json",
            },
            json={
                "model":      "llama-3.3-70b-versatile",
                "messages":   messages,
                "max_tokens": 800,
            },
            timeout=30.0,
        )

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Groq error: {res.text}")

    reply = res.json()["choices"][0]["message"]["content"]

    # Save to MongoDB
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
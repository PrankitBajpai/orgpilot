from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os

router = APIRouter(prefix="/ai", tags=["ai"])

class AIRequest(BaseModel):
    messages:   list[dict]
    system:     str = ""
    max_tokens: int = 1000

@router.post("/chat")
async def ai_chat(req: AIRequest):
    # Read key fresh on every request — fixes the startup timing bug
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_api_key}"

    if not gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    contents = []
    for msg in req.messages:
        contents.append({
            "role":  "user" if msg["role"] == "user" else "model",
            "parts": [{"text": msg["content"]}]
        })

    payload = {"contents": contents}

    if req.system:
        payload["system_instruction"] = {
            "parts": [{"text": req.system}]
        }

    async with httpx.AsyncClient() as client:
        res = await client.post(
            gemini_url,
            json=payload,
            timeout=30.0,
        )

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Gemini error: {res.text}")

    data  = res.json()
    reply = data["candidates"][0]["content"]["parts"][0]["text"]

    return {"content": [{"text": reply}]}
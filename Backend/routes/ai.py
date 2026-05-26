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
    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")

    # Build messages — system first, then the rest
    messages = []
    if req.system:
        messages.append({"role": "system", "content": req.system})
    messages.extend(req.messages)

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type":  "application/json",
            },
            json={
                "model":      "llama-3.3-70b-versatile",
                "messages":   messages,
                "max_tokens": req.max_tokens,
            },
            timeout=30.0,
        )

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Groq error: {res.text}")

    reply = res.json()["choices"][0]["message"]["content"]

    return {"content": [{"text": reply}]}
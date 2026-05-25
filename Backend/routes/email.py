from fastapi import APIRouter, HTTPException
import anthropic, resend, os, json
from pydantic import BaseModel

router = APIRouter()

class EmailRequest(BaseModel):
    topic: str
    department: str
    tone: str
    recipients: list[str]

@router.post("/generate-email")
async def generate_email(req: EmailRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Anthropic API key missing")

    client = anthropic.Anthropic(api_key=api_key)
    
    # Using system instruction guidelines to lock in pure JSON responses cleanly
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022", # Updated stable production API model
        max_tokens=1000,
        system="You are an AI assistant that only outputs valid JSON objects containing 'subject' and 'body' keys. Do not include markdown formatting or backticks.",
        messages=[{
            "role": "user",
            "content": f"Write a {req.tone} email about: {req.topic} targeting the {req.department} department."
        }]
    )
    
    try:
        raw_text = message.content[0].text.strip()
        # Fallback sanitation if Claude still returns markdown blocks
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```json")[-1].split("```")[0].strip()
            
        email_data = json.loads(raw_text)
        return {"email": email_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate valid email configuration schema: {str(e)}")

@router.post("/send-email")
async def send_email(req: EmailRequest):
    resend.api_key = os.getenv("RESEND_API_KEY")
    if not resend.api_key:
        raise HTTPException(status_code=500, detail="Resend API key missing")

    sent_count = 0
    for recipient in req.recipients:
        try:
            resend.Emails.send({
                "from": "OrgPilot <onboarding@resend.dev>",
                "to": recipient,
                "subject": f"Update regarding {req.topic}",
                "text": f"This is an update distributed to the {req.department} department."
            })
            sent_count += 1
        except Exception as e:
            print(f"Failed sending to {recipient}: {str(e)}")
            
    return {"sent": sent_count}
import os
import resend
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional

router = APIRouter()

resend.api_key = os.getenv("RESEND_API_KEY")


class SendEmailRequest(BaseModel):
    topic: Optional[str] = None
    department: Optional[str] = None
    tone: Optional[str] = None
    recipients: List[EmailStr]
    subject: str
    body: str


@router.post("/email/send")
async def send_email(payload: SendEmailRequest):
    if not resend.api_key:
        raise HTTPException(
            status_code=500,
            detail="RESEND_API_KEY is missing in .env"
        )

    if not payload.recipients:
        raise HTTPException(
            status_code=400,
            detail="No recipients provided"
        )

    results = []
    failed = []
    sent = 0

    for recipient in payload.recipients:
        try:
            response = resend.Emails.send({
                "from": os.getenv("FROM_EMAIL", "OrgPilot <onboarding@resend.dev>"),
                "to": [str(recipient)],
                "subject": payload.subject,
                "html": payload.body.replace("\n", "<br/>"),
            })

            results.append({
                "email": str(recipient),
                "status": "sent",
                "id": response.get("id")
            })
            sent += 1

        except Exception as e:
            failed.append(str(recipient))
            results.append({
                "email": str(recipient),
                "status": "failed",
                "error": str(e)
            })

    return {
        "message": "Email sending completed",
        "total": len(payload.recipients),
        "sent": sent,
        "failed": failed,
        "results": results
    }
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import resend, os, textwrap, base64

from database import meetings_collection

router = APIRouter(prefix="/meetings", tags=["meetings"])


class AttendeeInfo(BaseModel):
    name:  str
    email: str
    role:  Optional[str] = ""

class MeetingSchema(BaseModel):
    title:            str      = Field(...,  example="Q2 Sync Meeting")
    description:      str      = Field(None, example="Align team expectations")
    date_time:        datetime = Field(...,  example="2026-06-01T10:00:00")
    duration_minutes: int      = Field(30, ge=5, le=480)
    attendees:        list[str]

class MeetingInviteRequest(BaseModel):
    title:          str
    date:           Optional[str] = ""
    time:           Optional[str] = ""
    context:        Optional[str] = ""
    agenda:         Optional[str] = ""
    attendees:      list[str]
    attendee_names: list[AttendeeInfo] = []


@router.post("", status_code=status.HTTP_201_CREATED)
async def schedule_meeting(meeting: MeetingSchema):
    meeting_dict = meeting.model_dump()
    result = await meetings_collection.insert_one(meeting_dict)
    return {"id": str(result.inserted_id), "message": "Meeting scheduled successfully"}


@router.get("")
async def get_meetings():
    meetings = []
    async for meeting in meetings_collection.find().sort("date_time", 1):
        meeting["id"] = str(meeting["_id"])
        del meeting["_id"]
        if isinstance(meeting["date_time"], datetime):
            meeting["date_time"] = meeting["date_time"].isoformat()
        meetings.append(meeting)
    return meetings


@router.delete("/{id}")
async def cancel_meeting(id: str):
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Meeting ID format")

    result = await meetings_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return {"message": "Meeting canceled successfully"}


@router.post("/invite")
async def send_meeting_invites(req: MeetingInviteRequest):
    resend.api_key = os.getenv("RESEND_API_KEY")
    if not resend.api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not set")

    name_map: dict[str, str] = {a.email: a.name for a in req.attendee_names}

    date_str = req.date or "TBD"
    time_str = req.time or "TBD"
    dt_label = f"{date_str} at {time_str}" if (date_str != "TBD" and time_str != "TBD") else "TBD"

    ics_content = _build_ics(req)
    ics_b64     = base64.b64encode(ics_content.encode()).decode()

    sent_count = 0
    failed:    list[str]  = []
    results:   list[dict] = []

    for recipient_email in req.attendees:
        recipient_name = name_map.get(recipient_email, "Team Member")
        try:
            plain, html = _build_invite_email(
                recipient_name=recipient_name,
                title=req.title,
                dt_label=dt_label,
                context=req.context or "",
                agenda=req.agenda or "",
                all_attendees=req.attendee_names,
            )
            resend.Emails.send({
                "from":    "OrgPilot <onboarding@resend.dev>",
                "to":      [recipient_email],
                "subject": f"Meeting Invite: {req.title} — {dt_label}",
                "text":    plain,
                "html":    html,
                "attachments": [
                    {
                        "filename":     "invite.ics",
                        "content":      ics_b64,
                        "content_type": "text/calendar; charset=utf-8; method=REQUEST",
                    }
                ],
            })
            sent_count += 1
            results.append({"email": recipient_email, "status": "sent"})
        except Exception as e:
            print(f"[meetings/invite] Failed → {recipient_email}: {e}")
            failed.append(recipient_email)
            results.append({"email": recipient_email, "status": "failed", "error": str(e)})

    return {
        "sent":    sent_count,
        "failed":  failed,
        "total":   len(req.attendees),
        "results": results,
    }


def _build_invite_email(
    recipient_name: str,
    title: str,
    dt_label: str,
    context: str,
    agenda: str,
    all_attendees: list[AttendeeInfo],
) -> tuple[str, str]:

    # Build attendee lines BEFORE the f-string — no backslash inside {}
    attendee_line_parts = []
    for a in all_attendees:
        if a.role:
            attendee_line_parts.append(f"  • {a.name} ({a.role})")
        else:
            attendee_line_parts.append(f"  • {a.name}")
    attendee_lines = "\n".join(attendee_line_parts) or "  • (see attendee list)"

    context_block = ("About this meeting:\n" + context) if context else ""
    agenda_block  = ("Agenda:\n" + agenda) if agenda else ""

    plain = textwrap.dedent(f"""
        Hi {recipient_name},

        You're invited to: {title}
        When: {dt_label}

        {context_block}

        {agenda_block}

        Attendees:
        {attendee_lines}

        An .ics calendar file is attached — open it to add this meeting to your calendar.

        Best regards,
        OrgPilot AI
    """).strip()

    agenda_html = ""
    if agenda:
        items = [line.strip() for line in agenda.split("\n") if line.strip()]
        item_divs = "".join(
            "<div style='display:flex;gap:10px;padding:6px 0;"
            "border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;'>"
            + item + "</div>"
            for item in items
        )
        agenda_html = (
            "<h3 style='margin:20px 0 10px;font-size:14px;color:#111827;'>Agenda</h3>"
            + item_divs
        )

    attendee_divs = "".join(
        "<div style='display:flex;align-items:center;gap:8px;padding:6px 0;"
        "border-bottom:1px solid #f3f4f6;'>"
        "<div style='width:28px;height:28px;border-radius:6px;"
        "background:#ede9fe;display:flex;align-items:center;justify-content:center;"
        "font-size:11px;font-weight:600;color:#6d28d9;'>"
        + (a.name or "?")[0].upper()
        + "</div>"
        "<div><div style='font-size:13px;font-weight:500;color:#111827;'>" + a.name + "</div>"
        "<div style='font-size:11px;color:#6b7280;'>" + (a.role or a.email) + "</div></div></div>"
        for a in all_attendees
    ) or f"<p style='font-size:13px;color:#6b7280;'>{recipient_name}</p>"

    context_html = (
        "<div style='background:#f0f9ff;border-left:3px solid #4f8ef7;"
        "border-radius:0 8px 8px 0;padding:12px 14px;margin:16px 0;"
        "font-size:13px;color:#374151;line-height:1.7;'>" + context + "</div>"
        if context else ""
    )

    attendee_count = len(all_attendees)

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
             background:#f9fafb;padding:32px 16px;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;
              border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(135deg,#4f8ef7,#7c6af7);padding:24px 28px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <span style="font-size:22px;">⬡</span>
        <span style="font-size:17px;font-weight:700;color:#fff;">OrgPilot</span>
      </div>
      <div style="background:rgba(255,255,255,0.15);border-radius:8px;
                  padding:14px 16px;display:flex;gap:12px;align-items:center;">
        <span style="font-size:24px;">◫</span>
        <div>
          <div style="font-size:16px;font-weight:700;color:#fff;">{title}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:2px;">
            📅 {dt_label}
          </div>
        </div>
      </div>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 14px;font-size:14px;color:#374151;line-height:1.7;">
        Hi <strong>{recipient_name}</strong>,<br>
        You've been invited to the meeting above.
        An <strong>.ics</strong> file is attached — open it to save to your calendar.
      </p>
      {context_html}
      {agenda_html}
      <h3 style="margin:20px 0 10px;font-size:14px;color:#111827;">
        Attendees ({attendee_count})
      </h3>
      {attendee_divs}
    </div>
    <div style="padding:16px 28px;border-top:1px solid #f3f4f6;background:#f9fafb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Sent via OrgPilot AI &nbsp;·&nbsp; Manage notifications
      </p>
    </div>
  </div>
</body>
</html>"""

    return plain, html


def _build_ics(req: MeetingInviteRequest) -> str:
    try:
        dt_start = datetime.strptime(
            f"{req.date} {req.time}", "%Y-%m-%d %H:%M"
        ).replace(tzinfo=timezone.utc)
    except Exception:
        dt_start = datetime.now(timezone.utc)

    dt_end = dt_start + timedelta(minutes=60)

    def fmt(dt: datetime) -> str:
        return dt.strftime("%Y%m%dT%H%M%SZ")

    uid        = f"orgpilot-{int(dt_start.timestamp())}@orgpilot.ai"
    dtstamp    = fmt(datetime.now(timezone.utc))
    dtstart    = fmt(dt_start)
    dtend      = fmt(dt_end)
    summary    = req.title

    # Build attendee lines BEFORE the f-string — no backslash inside {}
    attendee_line_list = [
        f"ATTENDEE;CN={a.name};ROLE=REQ-PARTICIPANT:mailto:{a.email}"
        for a in req.attendee_names
    ]
    attendee_lines = "\n".join(attendee_line_list)

    description = ""
    if req.context:
        description += req.context.replace("\n", "\\n")
    if req.agenda:
        description += "\\n\\nAgenda:\\n" + req.agenda.replace("\n", "\\n")

    return textwrap.dedent(f"""\
        BEGIN:VCALENDAR
        VERSION:2.0
        PRODID:-//OrgPilot//OrgPilot AI//EN
        METHOD:REQUEST
        BEGIN:VEVENT
        UID:{uid}
        DTSTAMP:{dtstamp}
        DTSTART:{dtstart}
        DTEND:{dtend}
        SUMMARY:{summary}
        DESCRIPTION:{description}
        ORGANIZER;CN=OrgPilot AI:mailto:onboarding@resend.dev
        {attendee_lines}
        STATUS:CONFIRMED
        END:VEVENT
        END:VCALENDAR
    """).strip()
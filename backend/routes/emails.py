from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional, List
from backend.db import get_active_user_session
from backend.services.gmail_service import gmail_service
from backend.services.classifier import classifier_service
from backend.services.email_analyzer import email_analyzer
from backend.models.schemas import EmailItem, AIDraftRequest, AIDraftResponse

router = APIRouter(prefix="/emails", tags=["Emails"])

@router.get("", response_model=List[EmailItem])
def get_emails(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    needs_action: Optional[bool] = Query(None),
    is_unread: Optional[bool] = Query(None),
    q: Optional[str] = Query(None),
    sort: str = Query("newest")
):
    return gmail_service.get_all_emails(
        category=category,
        priority=priority,
        needs_action=needs_action,
        is_unread=is_unread,
        search_query=q,
        sort_by=sort
    )

@router.get("/important", response_model=List[EmailItem])
def get_important_emails(timeframe: Optional[str] = Query("all")):
    """Emails the AI flagged as Urgent or Important."""
    emails = gmail_service.get_all_emails()
    return [e for e in emails if e.priority in ("Urgent", "Important")]

@router.get("/needs-action", response_model=List[EmailItem])
def get_needs_action_emails():
    return gmail_service.get_all_emails(needs_action=True)

@router.get("/{email_id}", response_model=EmailItem)
def get_email_detail(email_id: str):
    email = gmail_service.get_email_by_id(email_id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email

@router.patch("/{email_id}/read")
def mark_read_status(email_id: str, is_read: bool = Body(..., embed=True)):
    email = gmail_service.mark_email_read(email_id, is_read)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"status": "success", "is_read": is_read}

@router.patch("/{email_id}/category")
def update_category(email_id: str, category: str = Body(..., embed=True)):
    email = gmail_service.update_email_category(email_id, category)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"status": "success", "category": category}

@router.post("/classify")
def classify_email(
    sender_email: str = Body(...),
    sender_name: str = Body(...),
    subject: str = Body(...),
    body: str = Body(...)
):
    category, reasons, confidence = classifier_service.classify(sender_email, sender_name, subject, body)
    priority, needs_action, action_text, deadline = email_analyzer.detect_priority_and_action(subject, body)
    return {
        "category": category,
        "reasons": reasons,
        "confidence": confidence,
        "priority": priority,
        "needs_action": needs_action,
        "action_text": action_text,
        "action_deadline": deadline
    }

@router.post("/draft-reply", response_model=AIDraftResponse)
def generate_draft(req: AIDraftRequest):
    subject = "Follow up"
    sender_name = "there"
    body = ""

    if req.email_id:
        email = gmail_service.get_email_by_id(req.email_id)
        if email:
            subject = email.subject
            sender_name = email.sender.name
            body = email.body_text

    # Sign the draft with the connected user's own name.
    session = get_active_user_session()
    signature = (session or {}).get("name")

    return email_analyzer.generate_ai_draft(
        subject=subject,
        sender_name=sender_name,
        body=body,
        intent=req.intent,
        signature=signature,
    )

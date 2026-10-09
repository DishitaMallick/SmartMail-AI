from fastapi import APIRouter, HTTPException

from backend.services.gmail_service import gmail_service, GmailServiceError
from backend.db import get_active_user_session

router = APIRouter(prefix="/gmail", tags=["Gmail"])


@router.get("/status")
def get_gmail_status():
    """
    Returns the live connection status shown in the dashboard header
    (connected account, last sync time, how many emails are stored).
    """
    return gmail_service.get_connection_status()


@router.get("/profile")
def get_gmail_profile():
    """Returns the connected Gmail account profile."""
    status = gmail_service.get_connection_status()
    if not status.get("connected"):
        return {
            "connected": False,
            "emailAddress": None,
            "name": None,
            "avatar": None,
            "last_synced_at": None,
            "messagesTotal": 0,
        }

    return {
        "connected": True,
        "emailAddress": status.get("email"),
        "name": status.get("name"),
        "avatar": status.get("avatar"),
        "last_synced_at": status.get("last_synced_at"),
        "messagesTotal": status.get("email_count", 0),
    }


@router.post("/sync")
def sync_gmail():
    """
    Fetches the 10 most recent messages from the connected Gmail account,
    runs them through the SmartMail AI processing pipeline, stores them in
    SQLite (no duplicates, keyed by Gmail message ID) and returns the result.
    """
    session = get_active_user_session()
    if not session:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "not_connected",
                "message": "Your Gmail account is not connected. Please connect it to continue.",
            },
        )

    try:
        synced_emails = gmail_service.sync_latest_10_emails()
    except GmailServiceError as err:
        raise HTTPException(
            status_code=err.status_code,
            detail={"code": err.code, "message": err.message},
        )

    summary = gmail_service.get_dashboard_summary()
    status = gmail_service.get_connection_status()

    return {
        "status": "success",
        "synced_count": len(synced_emails),
        "message": (
            f"Your {len(synced_emails)} most recent emails are up to date."
            if synced_emails
            else "No emails found in this Gmail account yet."
        ),
        "emails": synced_emails,
        "summary": summary,
        "last_synced_at": status.get("last_synced_at"),
    }


@router.get("/recent-10")
def get_recent_10_emails():
    """Returns the 10 most recent emails stored for the connected account."""
    return gmail_service.get_all_emails(sort_by="newest")

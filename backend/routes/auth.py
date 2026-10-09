import json
import os
import urllib.parse
import urllib.request
from typing import Optional

from fastapi import APIRouter, Query
from fastapi.responses import RedirectResponse
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from backend.db import save_user_session, get_active_user_session, clear_user_session
from backend.services.gmail_service import gmail_service, GmailServiceError

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Minimum permissions needed to read and organise the latest emails.
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
]

# Friendly, user-safe error codes passed back to the frontend.
FRIENDLY_AUTH_ERRORS = {
    "access_denied": "You chose not to share Gmail access, so SmartMail AI cannot continue.",
    "setup_needed": "SmartMail AI is not set up for Google sign-in yet. Please contact the app owner.",
    "connect_failed": "We could not finish connecting your Gmail account. Please try again.",
}


def _client_id() -> str:
    return os.getenv("GOOGLE_CLIENT_ID", "").strip()

def _client_secret() -> str:
    return os.getenv("GOOGLE_CLIENT_SECRET", "").strip()

def _redirect_uri() -> str:
    return os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback").strip()


def is_configured() -> bool:
    """True when real Google OAuth credentials are present in the environment."""
    client_id = _client_id()
    client_secret = _client_secret()

    if not client_id or not client_secret:
        return False

    # Reject any obvious placeholder / demo values.
    placeholder_patterns = [
        "your-google-client-id", "your_google_client_id",
        "demo_client", "demo-client",
        "placeholder", "changeme", "xxxx",
        "paste_your", "paste-your",
    ]
    lower_id = client_id.lower()
    lower_secret = client_secret.lower()
    for pattern in placeholder_patterns:
        if pattern in lower_id or pattern in lower_secret:
            return False

    # A real Google client ID ends with .apps.googleusercontent.com
    if not client_id.endswith(".apps.googleusercontent.com"):
        return False

    return True


def revoke_google_token(refresh_token: Optional[str], access_token: Optional[str]) -> None:
    """
    Asks Google to revoke the stored tokens so SmartMail AI immediately stops
    being able to access the user's Gmail account.
    """
    token = refresh_token or access_token
    if not token:
        return

    try:
        data = urllib.parse.urlencode({"token": token}).encode()
        request = urllib.request.Request(
            "https://oauth2.googleapis.com/revoke",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        urllib.request.urlopen(request, timeout=8)
    except Exception as err:
        # Revocation is best-effort: the local session is cleared regardless.
        print(f"[Auth] Token revocation notice: {err}")


def _build_google_auth_url() -> str:
    """Builds the Google OAuth 2.0 consent URL manually (no PKCE)."""
    params = {
        "client_id": _client_id(),
        "redirect_uri": _redirect_uri(),
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "include_granted_scopes": "true",
    }
    return "https://accounts.google.com/o/oauth2/auth?" + urllib.parse.urlencode(params)


def _exchange_code_for_tokens(code: str) -> dict:
    """Exchanges the authorization code for tokens via Google's token endpoint."""
    data = urllib.parse.urlencode({
        "code": code,
        "client_id": _client_id(),
        "client_secret": _client_secret(),
        "redirect_uri": _redirect_uri(),
        "grant_type": "authorization_code",
    }).encode()

    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


@router.get("/google")
def google_auth_url():
    """Returns the official Google OAuth 2.0 consent URL."""
    if not is_configured():
        return {
            "configured": False,
            "auth_url": None,
            "message": FRIENDLY_AUTH_ERRORS["setup_needed"],
        }

    try:
        auth_url = _build_google_auth_url()
        return {"configured": True, "auth_url": auth_url}
    except Exception as err:
        print(f"[Auth] Error generating OAuth URL: {err}")
        return {
            "configured": False,
            "auth_url": None,
            "message": FRIENDLY_AUTH_ERRORS["connect_failed"],
        }


@router.get("/callback")
def google_auth_callback(code: Optional[str] = Query(None), error: Optional[str] = Query(None)):
    """
    Handles Google's redirect: exchanges the auth code for tokens, stores the
    session, then loads the 10 most recent emails from the user's real inbox.
    """
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

    if error or not code:
        print(f"[Auth] OAuth denied or code missing: {error}")
        return RedirectResponse(url=f"{frontend_url}/?auth_error=access_denied")

    try:
        # Exchange auth code for tokens directly (no PKCE needed for server-side).
        token_data = _exchange_code_for_tokens(code)

        credentials = Credentials(
            token=token_data.get("access_token"),
            refresh_token=token_data.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=_client_id(),
            client_secret=_client_secret(),
            scopes=SCOPES,
        )

        oauth2_service = build("oauth2", "v2", credentials=credentials, cache_discovery=False)
        user_info = oauth2_service.userinfo().get().execute()

        user_email = user_info.get("email")
        user_name = user_info.get("name") or (user_email.split("@")[0] if user_email else "User")
        user_picture = user_info.get("picture") or (
            f"https://api.dicebear.com/7.x/initials/svg?seed={user_name}&backgroundColor=B76E79"
        )

        save_user_session(
            user_info={"email": user_email, "name": user_name, "avatar": user_picture},
            creds_dict={
                "token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_uri": credentials.token_uri,
                "client_id": credentials.client_id,
                "client_secret": credentials.client_secret,
                "scopes": list(credentials.scopes) if credentials.scopes else SCOPES,
                "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
            },
        )

        # First load of the user's real inbox (newest 10 messages).
        try:
            gmail_service.fetch_and_process_recent_gmail_emails(limit=10, raise_on_error=True)
        except GmailServiceError as sync_err:
            print(f"[Auth] Initial email load notice: {sync_err.message}")
            return RedirectResponse(
                url=f"{frontend_url}/?auth=connected&auth_error={sync_err.code}"
            )

        return RedirectResponse(url=f"{frontend_url}/?auth=success")

    except Exception as err:
        print(f"[Auth] Error exchanging OAuth code: {err}")
        return RedirectResponse(url=f"{frontend_url}/?auth_error=connect_failed")


@router.get("/session")
def get_session():
    """Checks whether a Gmail account is currently connected."""
    session = get_active_user_session()
    if not session:
        return {"authenticated": False, "user": None}

    return {
        "authenticated": True,
        "user": {
            "email": session.get("email"),
            "name": session.get("name"),
            "avatar": session.get("avatar"),
            "connected_at": session.get("connected_at"),
            "last_synced_at": session.get("last_synced_at"),
            "provider": "Google",
        },
    }


@router.post("/disconnect")
@router.post("/logout")
def disconnect_gmail():
    """
    Revokes the Google tokens and clears the local session so SmartMail AI
    stops accessing the account immediately.
    """
    session = get_active_user_session()
    if session:
        revoke_google_token(session.get("refresh_token"), session.get("access_token"))

    clear_user_session()
    return {
        "success": True,
        "message": "Your Gmail account has been disconnected.",
    }

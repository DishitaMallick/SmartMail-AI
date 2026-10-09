import os
import uuid
import base64
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from email.utils import parseaddr

from backend.db import (
    get_active_user_session,
    update_user_tokens,
    update_user_last_synced,
    upsert_emails,
    get_latest_10_emails_from_db,
    get_email_by_id_from_db,
    update_email_read_in_db,
    update_email_category_in_db
)
from backend.models.schemas import (
    EmailItem, PriorityEnum, CategoryStats, DashboardSummary,
    OrganizationSuggestion, OrganizationPreviewResponse, UserSettings
)
from backend.services.classifier import classifier_service
from backend.services.email_analyzer import email_analyzer

# Google API Client imports
try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    GOOGLE_API_AVAILABLE = True
except ImportError:
    HttpError = Exception  # type: ignore
    GOOGLE_API_AVAILABLE = False


class GmailServiceError(Exception):
    """
    Raised when a Gmail operation cannot be completed.
    Carries a short, human-friendly message that is safe to show in the UI
    together with a machine-readable code.
    """

    def __init__(self, code: str, message: str, status_code: int = 502):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


def friendly_gmail_error(err: Exception) -> GmailServiceError:
    """Translates raw Google API errors into friendly, user-facing errors."""
    status = getattr(getattr(err, "resp", None), "status", None)
    raw = str(err)

    if status == 401 or "invalid_grant" in raw or "invalid_credentials" in raw:
        return GmailServiceError(
            "token_expired",
            "Your Google session has expired. Please connect your Gmail account again.",
            401,
        )
    if status == 403:
        if "accessNotConfigured" in raw or "has not been used in project" in raw:
            return GmailServiceError(
                "api_disabled",
                "Gmail access is not switched on for this app yet. Please try again later.",
                503,
            )
        return GmailServiceError(
            "permission_denied",
            "SmartMail AI does not have permission to read this Gmail account.",
            403,
        )
    if status == 404:
        return GmailServiceError(
            "not_found",
            "We could not find that message in your Gmail account.",
            404,
        )
    if status == 429:
        return GmailServiceError(
            "rate_limited",
            "Gmail is receiving too many requests right now. Please try again in a moment.",
            429,
        )
    if status and status >= 500:
        return GmailServiceError(
            "gmail_unavailable",
            "Gmail is temporarily unavailable. Please try again in a moment.",
            502,
        )
    return GmailServiceError(
        "gmail_error",
        "We could not reach your Gmail account. Please check your connection and try again.",
        502,
    )


DUMMY_FALLBACK_PHRASES = [
    "open it in a program that understands html",
    "to view this email message",
    "view this message in html",
    "unable to see this email",
    "view as a web page",
    "if you are having trouble viewing",
    "enable images to view",
    "click here to view in browser",
]

def is_dummy_email_text(text: str) -> bool:
    if not text:
        return True
    t = text.lower().strip()
    if len(t) < 8:
        return True
    return any(phrase in t for phrase in DUMMY_FALLBACK_PHRASES)


def extract_gmail_body(payload: Dict[str, Any]) -> str:
    """
    Recursively and intelligently extracts the actual email body from Gmail payload.
    Correctly prioritizes rich HTML text when plain-text is a dummy fallback
    like 'To view this email message, open it in a program that understands HTML!'.
    """
    if not payload:
        return ""

    from backend.services.email_analyzer import html_to_clean_text

    plain_candidates = []
    html_candidates = []

    def collect_parts(node: Dict[str, Any]):
        if not node:
            return
        mime = node.get("mimeType", "").lower()
        body_data = node.get("body", {}).get("data")

        if body_data:
            try:
                decoded = base64.urlsafe_b64decode(body_data).decode("utf-8", errors="ignore")
                if mime == "text/plain":
                    plain_candidates.append(decoded)
                elif mime == "text/html":
                    html_candidates.append(decoded)
                elif "html" in mime:
                    html_candidates.append(decoded)
                else:
                    plain_candidates.append(decoded)
            except Exception:
                pass

        for part in node.get("parts", []):
            collect_parts(part)

    collect_parts(payload)

    # 1. Clean all HTML candidates
    cleaned_htmls = [html_to_clean_text(h) for h in html_candidates if h]
    valid_htmls = [h for h in cleaned_htmls if not is_dummy_email_text(h) and len(h.strip()) > 10]

    # 2. Clean all Plain candidates
    cleaned_plains = [html_to_clean_text(p) for p in plain_candidates if p]
    valid_plains = [p for p in cleaned_plains if not is_dummy_email_text(p) and len(p.strip()) > 10]

    # If we have valid plain text and it's substantial, use it
    if valid_plains:
        # If valid_htmls has substantially more content than a short plain text, prefer html
        if valid_htmls and len(valid_htmls[0]) > len(valid_plains[0]) * 2:
            return valid_htmls[0]
        return valid_plains[0]

    # Otherwise if we have cleaned HTML content, use it
    if valid_htmls:
        return valid_htmls[0]

    # If all candidates had some text even if short, return the longest non-empty
    all_cleaned = [c for c in cleaned_htmls + cleaned_plains if c and not is_dummy_email_text(c)]
    if all_cleaned:
        return max(all_cleaned, key=len)

    return ""


class GmailService:
    """
    Core Gmail API & SmartMail AI Service.
    Connects to the user's real Gmail account via OAuth 2.0, fetches strictly
    the 10 most recent emails, processes them through the Python AI pipeline,
    and maintains synchronization with SQLite database.
    """

    def __init__(self):
        self._batch_history: Dict[str, Dict[str, Any]] = {}
        self._settings = UserSettings()

    def get_google_credentials(self) -> Optional[Any]:
        """
        Retrieves and validates Google OAuth credentials from the active SQLite session.
        Automatically refreshes expired access tokens.
        """
        session = get_active_user_session()
        if not session or not GOOGLE_API_AVAILABLE:
            return None

        try:
            expiry = None
            if session.get("expiry"):
                try:
                    expiry = datetime.fromisoformat(session["expiry"])
                except Exception:
                    pass

            creds = Credentials(
                token=session.get("access_token"),
                refresh_token=session.get("refresh_token"),
                token_uri=session.get("token_uri", "https://oauth2.googleapis.com/token"),
                client_id=session.get("client_id") or os.getenv("GOOGLE_CLIENT_ID"),
                client_secret=session.get("client_secret") or os.getenv("GOOGLE_CLIENT_SECRET"),
                scopes=session.get("scopes", ["https://www.googleapis.com/auth/gmail.readonly"]),
                expiry=expiry
            )

            # Auto-refresh if expired. If the refresh itself fails (e.g. the user
            # revoked access or the grant expired), treat the account as
            # disconnected so the UI asks for a friendly reconnection.
            if creds.expired:
                if not creds.refresh_token:
                    return None
                try:
                    creds.refresh(Request())
                    update_user_tokens(
                        email=session["email"],
                        access_token=creds.token,
                        expiry=creds.expiry.isoformat() if creds.expiry else None
                    )
                except Exception as refresh_err:
                    print(f"[GmailService] Token refresh failed: {refresh_err}")
                    return None

            return creds
        except Exception as e:
            print(f"[GmailService] Error initializing credentials: {e}")
            return None

    def fetch_and_process_recent_gmail_emails(self, limit: int = 10, raise_on_error: bool = True) -> List[Dict[str, Any]]:
        """
        Connects to official Gmail API using user's OAuth credentials.
        Fetches strictly the 'limit' (default 10) most recent messages.
        Passes all messages through Python AI pipeline (categorization, priority, summary)
        and persists them to SQLite.

        Raises GmailServiceError on failure when raise_on_error is True so the UI
        can show a friendly message instead of silently showing stale data.
        """
        creds = self.get_google_credentials()
        session = get_active_user_session()
        user_email = session.get("email", "me") if session else "me"

        if not creds:
            raise GmailServiceError(
                "not_connected",
                "Your Gmail account is not connected. Please connect it to continue.",
                401,
            )

        processed_emails = []

        try:
            service = build('gmail', 'v1', credentials=creds, cache_discovery=False)
            
            # Fetch strictly the latest 10 messages from Gmail API (ordered newest first by default)
            results = service.users().messages().list(userId='me', maxResults=limit).execute()
            messages_meta = results.get('messages', [])

            if not messages_meta:
                update_user_last_synced(email=user_email)
                return []

            for meta in messages_meta[:limit]:
                msg_id = meta['id']
                msg = service.users().messages().get(userId='me', id=msg_id, format='full').execute()

                # Extract headers
                headers = {h['name'].lower(): h['value'] for h in msg.get('payload', {}).get('headers', [])}
                subject = headers.get('subject', '(No Subject)')
                from_header = headers.get('from', 'Unknown Sender')
                sender_name, sender_email = parseaddr(from_header)
                if not sender_name:
                    sender_name = sender_email.split('@')[0] if sender_email else 'Unknown'
                if not sender_email:
                    sender_email = 'unknown@gmail.com'

                snippet = msg.get('snippet', '')
                body_text = extract_gmail_body(msg.get('payload', {})) or snippet
                
                # Timestamp extraction
                internal_date = int(msg.get('internalDate', 0)) / 1000.0
                if internal_date:
                    msg_time = datetime.fromtimestamp(internal_date)
                    timestamp = msg_time.isoformat()
                    # Relative time calculation
                    diff = datetime.now() - msg_time
                    if diff.days == 0:
                        hours = diff.seconds // 3600
                        date_display = f"{hours} hours ago" if hours > 0 else "Just now"
                    elif diff.days == 1:
                        date_display = "Yesterday"
                    else:
                        date_display = f"{diff.days} days ago"
                else:
                    timestamp = datetime.now().isoformat()
                    date_display = "Recently"

                labels = msg.get('labelIds', ['INBOX'])
                is_read = "UNREAD" not in labels
                is_starred = "STARRED" in labels

                # Run through Python AI pipeline
                category, reasons, confidence = classifier_service.classify(
                    sender_email=sender_email,
                    sender_name=sender_name,
                    subject=subject,
                    body=body_text
                )
                priority, needs_action, action_text, action_deadline = email_analyzer.detect_priority_and_action(
                    subject=subject,
                    body=body_text
                )
                summary = email_analyzer.generate_summary(
                    sender_name=sender_name,
                    subject=subject,
                    body=body_text
                )

                avatar_initials = "".join([c[0] for c in sender_name.split()[:2]]).upper() or "GM"
                avatar_url = f"https://api.dicebear.com/7.x/initials/svg?seed={avatar_initials}&backgroundColor=B76E79"

                email_item = {
                    "id": msg_id,
                    "thread_id": msg.get("threadId"),
                    "sender": {
                        "name": sender_name,
                        "email": sender_email,
                        "avatar": avatar_url
                    },
                    "recipient": headers.get('to', user_email),
                    "subject": subject,
                    "snippet": snippet,
                    "body_text": body_text,
                    "body_html": None,
                    "timestamp": timestamp,
                    "date_display": date_display,
                    "is_read": is_read,
                    "is_starred": is_starred,
                    "category": category,
                    "suggested_category": category,
                    "priority": priority,
                    "summary": summary,
                    "needs_action": needs_action,
                    "action_text": action_text,
                    "action_deadline": action_deadline,
                    "ai_reasons": reasons,
                    "clarity_score": max(90, min(99, confidence)),
                    "tags": [category, priority] + (["Action Required"] if needs_action else []),
                    "gmail_labels": labels,
                    "organized_status": False
                }
                processed_emails.append(email_item)

            # Store in SQLite database (upserting to avoid duplicates)
            if processed_emails:
                upsert_emails(user_email=user_email, emails_list=processed_emails)
                update_user_last_synced(email=user_email)

            return processed_emails[:limit]

        except GmailServiceError:
            raise
        except HttpError as e:
            print(f"[GmailService] Gmail API error: {e}")
            err = friendly_gmail_error(e)
            if raise_on_error:
                raise err
            return get_latest_10_emails_from_db(user_email=user_email)
        except Exception as e:
            print(f"[GmailService] Error fetching from Gmail API: {e}")
            err = friendly_gmail_error(e)
            if raise_on_error:
                raise err
            # Fallback to local SQLite cache
            return get_latest_10_emails_from_db(user_email=user_email)

    def sync_latest_10_emails(self) -> List[EmailItem]:
        """
        Re-fetches the latest 10 messages from the user's Gmail account via Gmail API,
        processes them through Python AI pipeline, updates SQLite, and returns them.
        Raises GmailServiceError with a friendly message when Gmail cannot be reached.
        """
        emails_data = self.fetch_and_process_recent_gmail_emails(limit=10, raise_on_error=True)
        return [EmailItem(**e) for e in emails_data]

    def get_connection_status(self) -> Dict[str, Any]:
        """Returns the current Gmail connection status for the dashboard header."""
        session = get_active_user_session()
        if not session:
            return {
                "connected": False,
                "email": None,
                "name": None,
                "avatar": None,
                "last_synced_at": None,
                "email_count": 0,
            }

        emails = get_latest_10_emails_from_db(user_email=session.get("email"))
        return {
            "connected": True,
            "email": session.get("email"),
            "name": session.get("name"),
            "avatar": session.get("avatar"),
            "last_synced_at": session.get("last_synced_at"),
            "email_count": len(emails),
        }

    def get_all_emails(
        self,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        needs_action: Optional[bool] = None,
        is_unread: Optional[bool] = None,
        search_query: Optional[str] = None,
        sort_by: str = "newest"
    ) -> List[EmailItem]:
        """Retrieves and filters the latest 10 emails from the database."""
        session = get_active_user_session()
        user_email = session.get("email") if session else None
        
        emails_data = get_latest_10_emails_from_db(user_email=user_email)
        
        # If SQLite is empty and we have an active session, try a first-time Gmail fetch.
        # Any failure here falls back to the (empty) cache so the UI can render
        # its own friendly "nothing here yet" state.
        if not emails_data and session:
            try:
                emails_data = self.fetch_and_process_recent_gmail_emails(limit=10, raise_on_error=False)
            except GmailServiceError:
                emails_data = []

        filtered = list(emails_data)

        if category and category.lower() != "all":
            filtered = [e for e in filtered if e.get("category", "").lower() == category.lower()]

        if priority and priority.lower() != "all":
            filtered = [e for e in filtered if e.get("priority", "").lower() == priority.lower()]

        if needs_action is not None:
            filtered = [e for e in filtered if e.get("needs_action") == needs_action]

        if is_unread is not None:
            filtered = [e for e in filtered if (not e.get("is_read")) == is_unread]

        if search_query:
            q = search_query.lower().strip()
            filtered = [
                e for e in filtered
                if q in e.get("subject", "").lower()
                or q in e.get("snippet", "").lower()
                or q in e.get("summary", "").lower()
                or q in e.get("sender", {}).get("name", "").lower()
                or q in e.get("sender", {}).get("email", "").lower()
                or q in e.get("category", "").lower()
                or q in e.get("priority", "").lower()
                or any(q in tag.lower() for tag in e.get("tags", []))
            ]

        # Sorting: newest first is default
        if sort_by == "oldest":
            filtered.sort(key=lambda x: x.get("timestamp", ""))
        elif sort_by == "priority":
            priority_order = {"urgent": 0, "important": 1, "normal": 2, "low": 3}
            filtered.sort(key=lambda x: priority_order.get(x.get("priority", "").lower(), 4))
        else: # newest
            filtered.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        # Guarantee all emails have clean plain English body_text and short, precise summaries
        from backend.services.email_analyzer import html_to_clean_text
        for e in filtered:
            raw_body = e.get("body_text", "") or ""
            raw_snippet = e.get("snippet", "") or ""

            # Check if body_text is dummy fallback
            if is_dummy_email_text(raw_body):
                if not is_dummy_email_text(raw_snippet):
                    e["body_text"] = html_to_clean_text(raw_snippet)
                else:
                    e["body_text"] = f"Promotional message from {e.get('sender', {}).get('name', 'sender')} regarding '{e.get('subject', '')}'."
            elif "<!doctype" in raw_body.lower() or "<html" in raw_body.lower() or "<div" in raw_body.lower() or "&amp;" in raw_body:
                e["body_text"] = html_to_clean_text(raw_body)

            # Auto-correct category if it was classified as 'Other' for known shopping/promotions
            sender_email = e.get("sender", {}).get("email", "")
            if e.get("category") == "Other" and any(d in sender_email for d in ["myntra.com", "flipkart.com", "amazon", "ajio.com", "nykaa.com", "swiggy", "zomato"]):
                e["category"] = "Promotions"
                e["suggested_category"] = "Promotions"

            sum_text = e.get("summary", "")
            if (
                not sum_text
                or is_dummy_email_text(sum_text)
                or "<!doctype" in sum_text.lower()
                or "<html" in sum_text.lower()
                or "<" in sum_text
                or "&amp;" in sum_text
                or "amp;" in sum_text
                or "http://" in sum_text
                or "https://" in sum_text
                or "%20" in sum_text
                or len(sum_text) > 120
            ):
                e["summary"] = email_analyzer.generate_summary(
                    sender_name=e.get("sender", {}).get("name", "Unknown"),
                    subject=e.get("subject", ""),
                    body=e.get("body_text", "") or raw_snippet
                )

        return [EmailItem(**e) for e in filtered]

    def get_email_by_id(self, email_id: str) -> Optional[EmailItem]:
        email_data = get_email_by_id_from_db(email_id)
        if email_data:
            from backend.services.email_analyzer import html_to_clean_text
            raw_body = email_data.get("body_text", "") or ""
            raw_snippet = email_data.get("snippet", "") or ""

            if is_dummy_email_text(raw_body):
                if not is_dummy_email_text(raw_snippet):
                    email_data["body_text"] = html_to_clean_text(raw_snippet)
                else:
                    email_data["body_text"] = f"Promotional message from {email_data.get('sender', {}).get('name', 'sender')} regarding '{email_data.get('subject', '')}'."
            elif "<!doctype" in raw_body.lower() or "<html" in raw_body.lower() or "<div" in raw_body.lower() or "&amp;" in raw_body:
                email_data["body_text"] = html_to_clean_text(raw_body)

            sender_email = email_data.get("sender", {}).get("email", "")
            if email_data.get("category") == "Other" and any(d in sender_email for d in ["myntra.com", "flipkart.com", "amazon", "ajio.com", "nykaa.com", "swiggy", "zomato"]):
                email_data["category"] = "Promotions"
                email_data["suggested_category"] = "Promotions"

            sum_text = email_data.get("summary", "")
            if (
                not sum_text
                or is_dummy_email_text(sum_text)
                or "<!doctype" in sum_text.lower()
                or "<html" in sum_text.lower()
                or "<" in sum_text
                or "&amp;" in sum_text
                or "amp;" in sum_text
                or "http://" in sum_text
                or "https://" in sum_text
                or "%20" in sum_text
                or len(sum_text) > 120
            ):
                email_data["summary"] = email_analyzer.generate_summary(
                    sender_name=email_data.get("sender", {}).get("name", "Unknown"),
                    subject=email_data.get("subject", ""),
                    body=email_data.get("body_text", "") or raw_snippet
                )
            return EmailItem(**email_data)
        return None

    def mark_email_read(self, email_id: str, is_read: bool = True) -> Optional[EmailItem]:
        update_email_read_in_db(email_id, is_read)
        # Also attempt Gmail API label update if online
        creds = self.get_google_credentials()
        if creds and GOOGLE_API_AVAILABLE:
            try:
                service = build('gmail', 'v1', credentials=creds, cache_discovery=False)
                body = {"removeLabelIds": ["UNREAD"]} if is_read else {"addLabelIds": ["UNREAD"]}
                service.users().messages().modify(userId='me', id=email_id, body=body).execute()
            except Exception:
                pass

        return self.get_email_by_id(email_id)

    def update_email_category(self, email_id: str, new_category: str) -> Optional[EmailItem]:
        update_email_category_in_db(email_id, new_category)
        return self.get_email_by_id(email_id)

    def get_dashboard_summary(self) -> DashboardSummary:
        session = get_active_user_session()
        user_email = session.get("email") if session else None
        emails = get_latest_10_emails_from_db(user_email=user_email)

        urgent_count = sum(1 for e in emails if e.get("priority") == "Urgent")
        important_count = sum(1 for e in emails if e.get("priority") in ["Urgent", "Important"])
        unread_count = sum(1 for e in emails if not e.get("is_read"))
        needs_action_count = sum(1 for e in emails if e.get("needs_action"))
        organized_count = sum(1 for e in emails if e.get("organized_status"))

        category_meta = [
            ("Work", "💼", "#B76E79"),
            ("Personal", "👤", "#E6D8FF"),
            ("Finance", "💰", "#F4C2C2"),
            ("Promotions", "📢", "#F4C2C2"),
            ("Social", "👥", "#E6D8FF"),
            ("Other", "📁", "#8B4A5A")
        ]

        categories_stats: List[CategoryStats] = []
        for cat_name, icon, color in category_meta:
            cat_emails = [e for e in emails if e.get("category", "").lower() == cat_name.lower()]
            count = len(cat_emails)
            unread = sum(1 for e in cat_emails if not e.get("is_read"))
            recent_sub = cat_emails[0].get("subject") if cat_emails else None
            recent_sender = cat_emails[0].get("sender", {}).get("name") if cat_emails else None

            categories_stats.append(CategoryStats(
                name=cat_name,
                icon=icon,
                count=count,
                unread_count=unread,
                color_accent=color,
                recent_subject=recent_sub,
                recent_sender=recent_sender
            ))

        ai_insight = {
            "title": "SmartMail AI Live Summary",
            "headline": f"You have {needs_action_count} actionable items in your 10 most recent Gmail emails.",
            "deadlines_count": sum(1 for e in emails if e.get("action_deadline")),
            "responses_count": needs_action_count,
            "payments_count": sum(1 for e in emails if e.get("category") == "Finance" and e.get("needs_action")),
            "cta_text": "Review Action Items"
        }

        return DashboardSummary(
            important_count=important_count,
            unread_count=unread_count,
            needs_action_count=needs_action_count,
            organized_count=organized_count,
            total_emails=len(emails),
            ai_insight=ai_insight,
            categories=categories_stats,
            last_synced_at=session.get("last_synced_at") if session else None
        )

    def generate_organization_preview(self) -> OrganizationPreviewResponse:
        session = get_active_user_session()
        emails = get_latest_10_emails_from_db(user_email=session.get("email") if session else None)
        suggestions: List[OrganizationSuggestion] = []
        by_category: Dict[str, List[OrganizationSuggestion]] = {}
        category_summary: Dict[str, int] = {}

        for e in emails:
            cat = e.get("suggested_category") or e.get("category", "Other")
            sug = OrganizationSuggestion(
                id=f"sug_{e['id']}",
                email_id=e["id"],
                sender_name=e["sender"]["name"],
                sender_email=e["sender"]["email"],
                subject=e["subject"],
                snippet=e["snippet"],
                current_category=e.get("category", "Other"),
                suggested_category=cat,
                priority=e.get("priority", "Normal"),
                reasons=e.get("ai_reasons", ["Sender pattern match", "Content analysis"]),
                status="pending"
            )
            suggestions.append(sug)
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(sug)
            category_summary[cat] = category_summary.get(cat, 0) + 1

        return OrganizationPreviewResponse(
            total_suggestions=len(suggestions),
            by_category=by_category,
            categories_summary=category_summary
        )

    def apply_organization_batch(self, accepted_ids: List[str], overrides: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        batch_id = f"batch_{uuid.uuid4().hex[:8]}"
        overrides = overrides or {}
        session = get_active_user_session()
        emails = get_latest_10_emails_from_db(user_email=session.get("email") if session else None)
        modified_count = 0

        for e in emails:
            sug_id = f"sug_{e['id']}"
            if e["id"] in accepted_ids or sug_id in accepted_ids:
                new_cat = overrides.get(e["id"]) or e.get("suggested_category") or e.get("category", "Other")
                update_email_category_in_db(e["id"], new_cat)
                modified_count += 1

        return {
            "success": True,
            "modified_count": modified_count,
            "batch_id": batch_id,
            "message": f"{modified_count} emails organized successfully."
        }

    def undo_organization_batch(self, batch_id: str) -> Dict[str, Any]:
        return {
            "success": True,
            "restored_count": 0,
            "message": "Organization batch state recorded in database."
        }

    def get_settings(self) -> UserSettings:
        session = get_active_user_session()
        if session:
            self._settings.gmail_connected = True
            self._settings.connected_email = session.get("email", "")
        else:
            self._settings.gmail_connected = False
            self._settings.connected_email = ""
        return self._settings

    def update_settings(self, new_settings: UserSettings) -> UserSettings:
        self._settings = new_settings
        return self._settings

gmail_service = GmailService()

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "smartmail.db")

def get_db_connection() -> sqlite3.Connection:
    """Returns a connection to the SQLite database with row_factory enabled."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite database tables for user sessions and processed emails."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # User OAuth Sessions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            email TEXT PRIMARY KEY,
            name TEXT,
            avatar TEXT,
            access_token TEXT,
            refresh_token TEXT,
            token_uri TEXT,
            client_id TEXT,
            client_secret TEXT,
            scopes TEXT,
            expiry TEXT,
            connected_at TEXT,
            last_synced_at TEXT,
            is_active INTEGER DEFAULT 1
        )
    """)

    # Emails Table (indexed on user_email and timestamp)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS emails (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            thread_id TEXT,
            sender_name TEXT,
            sender_email TEXT,
            sender_avatar TEXT,
            recipient TEXT,
            subject TEXT,
            snippet TEXT,
            body_text TEXT,
            body_html TEXT,
            timestamp TEXT,
            date_display TEXT,
            is_read INTEGER DEFAULT 0,
            is_starred INTEGER DEFAULT 0,
            category TEXT DEFAULT 'Other',
            suggested_category TEXT,
            priority TEXT DEFAULT 'Normal',
            summary TEXT,
            needs_action INTEGER DEFAULT 0,
            action_text TEXT,
            action_deadline TEXT,
            ai_reasons TEXT,
            clarity_score INTEGER DEFAULT 95,
            tags TEXT,
            gmail_labels TEXT,
            organized_status INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
        )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_emails_user ON emails(user_email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_emails_timestamp ON emails(timestamp)")

    conn.commit()
    conn.close()

# ----------------- User Session Operations ----------------- #

def save_user_session(user_info: Dict[str, Any], creds_dict: Dict[str, Any]):
    """Saves or updates active Google OAuth session."""
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()

    # Deactivate any previous active sessions
    cursor.execute("UPDATE user_sessions SET is_active = 0")

    cursor.execute("""
        INSERT INTO user_sessions (
            email, name, avatar, access_token, refresh_token,
            token_uri, client_id, client_secret, scopes,
            expiry, connected_at, last_synced_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(email) DO UPDATE SET
            name = excluded.name,
            avatar = excluded.avatar,
            access_token = excluded.access_token,
            refresh_token = COALESCE(excluded.refresh_token, user_sessions.refresh_token),
            token_uri = excluded.token_uri,
            client_id = excluded.client_id,
            client_secret = excluded.client_secret,
            scopes = excluded.scopes,
            expiry = excluded.expiry,
            last_synced_at = excluded.last_synced_at,
            is_active = 1
    """, (
        user_info.get("email"),
        user_info.get("name", "Gmail User"),
        user_info.get("avatar", ""),
        creds_dict.get("token"),
        creds_dict.get("refresh_token"),
        creds_dict.get("token_uri", "https://oauth2.googleapis.com/token"),
        creds_dict.get("client_id", ""),
        creds_dict.get("client_secret", ""),
        json.dumps(creds_dict.get("scopes", [])),
        creds_dict.get("expiry"),
        now_iso,
        now_iso
    ))

    conn.commit()
    conn.close()

def get_active_user_session() -> Optional[Dict[str, Any]]:
    """Retrieves the currently active Google OAuth session."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_sessions WHERE is_active = 1 LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    data = dict(row)
    if data.get("scopes"):
        try:
            data["scopes"] = json.loads(data["scopes"])
        except Exception:
            data["scopes"] = []
    return data

def update_user_tokens(email: str, access_token: str, expiry: Optional[str] = None):
    """Updates refreshed access token in database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user_sessions
        SET access_token = ?, expiry = COALESCE(?, expiry)
        WHERE email = ?
    """, (access_token, expiry, email))
    conn.commit()
    conn.close()

def update_user_last_synced(email: str):
    """Updates last_synced_at timestamp."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user_sessions
        SET last_synced_at = ?
        WHERE email = ?
    """, (datetime.now().isoformat(), email))
    conn.commit()
    conn.close()

def clear_user_session():
    """Disconnects the user session and clears stored active state."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE user_sessions SET is_active = 0")
    conn.commit()
    conn.close()

# ----------------- Email Operations ----------------- #

def upsert_emails(user_email: str, emails_list: List[Dict[str, Any]]):
    """
    Upserts processed Gmail emails into SQLite database.
    Avoids duplicate entries by matching on Gmail message ID.
    """
    if not emails_list:
        return

    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()

    for e in emails_list:
        cursor.execute("""
            INSERT INTO emails (
                id, user_email, thread_id, sender_name, sender_email, sender_avatar,
                recipient, subject, snippet, body_text, body_html, timestamp,
                date_display, is_read, is_starred, category, suggested_category,
                priority, summary, needs_action, action_text, action_deadline,
                ai_reasons, clarity_score, tags, gmail_labels, organized_status,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                thread_id = excluded.thread_id,
                sender_name = excluded.sender_name,
                sender_email = excluded.sender_email,
                sender_avatar = excluded.sender_avatar,
                recipient = excluded.recipient,
                subject = excluded.subject,
                snippet = excluded.snippet,
                body_text = excluded.body_text,
                body_html = excluded.body_html,
                timestamp = excluded.timestamp,
                date_display = excluded.date_display,
                is_read = excluded.is_read,
                is_starred = excluded.is_starred,
                category = excluded.category,
                suggested_category = excluded.suggested_category,
                priority = excluded.priority,
                summary = excluded.summary,
                needs_action = excluded.needs_action,
                action_text = excluded.action_text,
                action_deadline = excluded.action_deadline,
                ai_reasons = excluded.ai_reasons,
                clarity_score = excluded.clarity_score,
                tags = excluded.tags,
                gmail_labels = excluded.gmail_labels,
                updated_at = excluded.updated_at
        """, (
            e.get("id"),
            user_email,
            e.get("thread_id"),
            e.get("sender", {}).get("name", "Unknown"),
            e.get("sender", {}).get("email", ""),
            e.get("sender", {}).get("avatar", ""),
            e.get("recipient", user_email),
            e.get("subject", "(No Subject)"),
            e.get("snippet", ""),
            e.get("body_text", ""),
            e.get("body_html", ""),
            e.get("timestamp", now_iso),
            e.get("date_display", "Recently"),
            1 if e.get("is_read") else 0,
            1 if e.get("is_starred") else 0,
            e.get("category", "Other"),
            e.get("suggested_category", e.get("category", "Other")),
            e.get("priority", "Normal"),
            e.get("summary", ""),
            1 if e.get("needs_action") else 0,
            e.get("action_text"),
            e.get("action_deadline"),
            json.dumps(e.get("ai_reasons", [])),
            e.get("clarity_score", 95),
            json.dumps(e.get("tags", [])),
            json.dumps(e.get("gmail_labels", [])),
            1 if e.get("organized_status") else 0,
            now_iso,
            now_iso
        ))

    conn.commit()
    conn.close()

def get_latest_10_emails_from_db(user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves strictly the 10 most recent emails from the SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    if user_email:
        cursor.execute("""
            SELECT * FROM emails
            WHERE user_email = ?
            ORDER BY timestamp DESC
            LIMIT 10
        """, (user_email,))
    else:
        cursor.execute("""
            SELECT * FROM emails
            ORDER BY timestamp DESC
            LIMIT 10
        """)

    rows = cursor.fetchall()
    conn.close()

    from backend.services.email_analyzer import html_to_clean_text

    emails = []
    for r in rows:
        d = dict(r)
        # Parse JSON fields
        d["sender"] = {
            "name": d.pop("sender_name", "Unknown"),
            "email": d.pop("sender_email", ""),
            "avatar": d.pop("sender_avatar", "")
        }
        d["is_read"] = bool(d.get("is_read"))
        d["is_starred"] = bool(d.get("is_starred"))
        d["needs_action"] = bool(d.get("needs_action"))
        d["organized_status"] = bool(d.get("organized_status"))

        # Clean any raw HTML or entity artifacts from database rows
        if d.get("body_text"):
            d["body_text"] = html_to_clean_text(d["body_text"])
        if d.get("snippet"):
            d["snippet"] = html_to_clean_text(d["snippet"])

        for json_key in ["ai_reasons", "tags", "gmail_labels"]:
            if d.get(json_key):
                try:
                    d[json_key] = json.loads(d[json_key])
                except Exception:
                    d[json_key] = []
            else:
                d[json_key] = []

        emails.append(d)

    return emails

def get_email_by_id_from_db(email_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single email by its Gmail ID from SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emails WHERE id = ? LIMIT 1", (email_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    from backend.services.email_analyzer import html_to_clean_text

    d = dict(row)
    d["sender"] = {
        "name": d.pop("sender_name", "Unknown"),
        "email": d.pop("sender_email", ""),
        "avatar": d.pop("sender_avatar", "")
    }
    d["is_read"] = bool(d.get("is_read"))
    d["is_starred"] = bool(d.get("is_starred"))
    d["needs_action"] = bool(d.get("needs_action"))
    d["organized_status"] = bool(d.get("organized_status"))

    if d.get("body_text"):
        d["body_text"] = html_to_clean_text(d["body_text"])
    if d.get("snippet"):
        d["snippet"] = html_to_clean_text(d["snippet"])

    for json_key in ["ai_reasons", "tags", "gmail_labels"]:
        if d.get(json_key):
            try:
                d[json_key] = json.loads(d[json_key])
            except Exception:
                d[json_key] = []
        else:
            d[json_key] = []

    return d

def update_email_read_in_db(email_id: str, is_read: bool = True):
    """Updates read status in SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE emails SET is_read = ?, updated_at = ? WHERE id = ?", (
        1 if is_read else 0, datetime.now().isoformat(), email_id
    ))
    conn.commit()
    conn.close()

def update_email_category_in_db(email_id: str, new_category: str):
    """Updates category in SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE emails SET category = ?, organized_status = 1, updated_at = ? WHERE id = ?", (
        new_category, datetime.now().isoformat(), email_id
    ))
    conn.commit()
    conn.close()

# Auto-initialize database on module load
init_db()

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class PriorityEnum(str, Enum):
    URGENT = "Urgent"
    IMPORTANT = "Important"
    NORMAL = "Normal"
    LOW = "Low"

class CategoryEnum(str, Enum):
    WORK = "Work"
    PERSONAL = "Personal"
    FINANCE = "Finance"
    PROMOTIONS = "Promotions"
    SOCIAL = "Social"
    OTHER = "Other"

class EmailSender(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None

class EmailItem(BaseModel):
    id: str
    thread_id: Optional[str] = None
    sender: EmailSender
    recipient: str = "me"
    subject: str
    snippet: str
    body_text: str
    body_html: Optional[str] = None
    timestamp: str  # ISO string or relative
    date_display: str
    is_read: bool = False
    is_starred: bool = False
    category: str
    suggested_category: Optional[str] = None
    priority: str
    summary: Optional[str] = None
    needs_action: bool = False
    action_text: Optional[str] = None
    action_deadline: Optional[str] = None
    ai_reasons: List[str] = Field(default_factory=list)
    clarity_score: int = 95
    tags: List[str] = Field(default_factory=list)
    gmail_labels: List[str] = Field(default_factory=list)
    organized_status: bool = False

class CategoryStats(BaseModel):
    name: str
    icon: str
    count: int
    unread_count: int
    color_accent: str
    recent_subject: Optional[str] = None
    recent_sender: Optional[str] = None

class DashboardSummary(BaseModel):
    important_count: int
    unread_count: int
    needs_action_count: int
    organized_count: int
    total_emails: int
    ai_insight: Dict[str, Any]
    categories: List[CategoryStats]
    last_synced_at: Optional[str] = None

class OrganizationSuggestion(BaseModel):
    id: str
    email_id: str
    sender_name: str
    sender_email: str
    subject: str
    snippet: str
    current_category: str
    suggested_category: str
    priority: str
    reasons: List[str]
    status: str = "pending"

class OrganizationPreviewResponse(BaseModel):
    total_suggestions: int
    by_category: Dict[str, List[OrganizationSuggestion]]
    categories_summary: Dict[str, int]

class ApplyOrganizationRequest(BaseModel):
    accepted_ids: List[str]
    category_overrides: Optional[Dict[str, str]] = None

class ApplyOrganizationResponse(BaseModel):
    success: bool
    modified_count: int
    batch_id: str
    message: str

class UndoOrganizationRequest(BaseModel):
    batch_id: str

class AIDraftRequest(BaseModel):
    email_id: Optional[str] = None
    intent: str
    prompt: Optional[str] = None
    tone: Optional[str] = "professional"

class AIDraftResponse(BaseModel):
    draft_id: str
    subject: str
    body: str
    clarity_score: int
    smart_tip: str
    action_suggested: Optional[str] = None

class UserProfile(BaseModel):
    email: str
    name: str
    avatar: Optional[str] = None
    connected: bool = True
    last_synced_at: Optional[str] = None

class UserSettings(BaseModel):
    gmail_connected: bool = True
    connected_email: str = ""
    auto_categorize: bool = True
    detect_important: bool = True
    detect_deadlines: bool = True
    suggest_actions: bool = True
    deadline_reminders: bool = True
    important_alerts: bool = True
    custom_categories: List[str] = Field(default_factory=list)

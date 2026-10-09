from fastapi import APIRouter
from backend.services.gmail_service import gmail_service
from backend.models.schemas import UserSettings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=UserSettings)
def get_settings():
    return gmail_service.get_settings()

@router.put("", response_model=UserSettings)
def update_settings(settings: UserSettings):
    return gmail_service.update_settings(settings)

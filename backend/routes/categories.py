from fastapi import APIRouter
from backend.services.gmail_service import gmail_service

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("")
def get_categories():
    summary = gmail_service.get_dashboard_summary()
    return {
        "categories": summary.categories,
        "total_categories": len(summary.categories)
    }

@router.get("/summary")
def get_dashboard_summary():
    return gmail_service.get_dashboard_summary()

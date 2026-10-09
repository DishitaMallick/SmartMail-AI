from fastapi import APIRouter, Body
from backend.services.gmail_service import gmail_service
from backend.models.schemas import (
    OrganizationPreviewResponse, ApplyOrganizationRequest, ApplyOrganizationResponse, UndoOrganizationRequest
)

router = APIRouter(prefix="/organization", tags=["Organization"])

@router.get("/preview", response_model=OrganizationPreviewResponse)
def get_organization_preview():
    return gmail_service.generate_organization_preview()

@router.post("/apply", response_model=ApplyOrganizationResponse)
def apply_organization(req: ApplyOrganizationRequest):
    res = gmail_service.apply_organization_batch(req.accepted_ids, req.category_overrides)
    return ApplyOrganizationResponse(**res)

@router.post("/undo")
def undo_organization(req: UndoOrganizationRequest):
    res = gmail_service.undo_organization_batch(req.batch_id)
    return res

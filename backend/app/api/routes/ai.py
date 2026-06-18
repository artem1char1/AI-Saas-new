from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.api_errors import forbidden
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.ai import FollowupGenerateRequest, FollowupListItem, FollowupResponse
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


def get_current_organization_for_ai(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Organization:
    member = db.scalar(
        select(OrganizationMember).where(
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.is_active.is_(True),
        )
    )
    if member is None:
        raise forbidden("no_organization", "Organization required")

    organization = db.get(Organization, member.organization_id)
    if organization is None:
        raise forbidden("no_organization", "Organization required")

    return organization


@router.post("/followups/generate", response_model=FollowupResponse)
async def generate_followup(
    payload: FollowupGenerateRequest,
    organization: Organization = Depends(get_current_organization_for_ai),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FollowupResponse:
    followup = await ai_service.generate_followup(
        db,
        organization=organization,
        current_user=current_user,
        deal_id=payload.deal_id,
    )
    return FollowupResponse.model_validate(followup)


@router.get("/followups/deal/{deal_id}", response_model=list[FollowupListItem])
def list_deal_followups(
    deal_id: UUID,
    organization: Organization = Depends(get_current_organization_for_ai),
    db: Session = Depends(get_db),
) -> list[FollowupListItem]:
    followups = ai_service.list_followups_for_deal(
        db,
        organization=organization,
        deal_id=deal_id,
    )
    return [FollowupListItem.model_validate(item) for item in followups]

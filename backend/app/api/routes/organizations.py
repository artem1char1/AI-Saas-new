from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_current_organization
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.organization import OrganizationCreate, OrganizationResponse

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/me", response_model=OrganizationResponse | None)
def get_my_organization(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Organization | None:
    member = db.scalar(
        select(OrganizationMember).where(
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.is_active.is_(True),
        )
    )
    if member is None:
        return None

    return db.get(Organization, member.organization_id)


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Organization:
    existing_member = db.scalar(
        select(OrganizationMember).where(OrganizationMember.user_id == current_user.id)
    )
    if existing_member is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already belongs to an organization",
        )

    organization = Organization(name=payload.name)
    db.add(organization)
    db.flush()

    member = OrganizationMember(
        user_id=current_user.id,
        organization_id=organization.id,
        role="owner",
        is_active=True,
        joined_at=datetime.now(timezone.utc),
    )
    db.add(member)
    db.commit()
    db.refresh(organization)
    return organization


@router.get("/current", response_model=OrganizationResponse)
def get_current_org(organization: Organization = Depends(get_current_organization)) -> Organization:
    return organization

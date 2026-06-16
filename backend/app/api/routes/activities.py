from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_current_organization
from app.models.activity import Activity
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.organization import Organization
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityResponse, ActivityUpdate

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("", response_model=list[ActivityResponse])
def list_activities(
    deal_id: UUID | None = Query(default=None),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> list[Activity]:
    query = select(Activity).where(Activity.organization_id == organization.id)

    if deal_id is not None:
        query = query.where(Activity.deal_id == deal_id)

    return list(db.scalars(query.order_by(Activity.happened_at.desc())).all())


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    payload: ActivityCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Activity:
    _ensure_deal_in_org(db, organization.id, payload.deal_id)
    _ensure_contact_in_org(db, organization.id, payload.contact_id)

    activity = Activity(
        organization_id=organization.id,
        deal_id=payload.deal_id,
        contact_id=payload.contact_id,
        user_id=current_user.id,
        type=payload.type,
        content=payload.content,
        happened_at=payload.happened_at,
    )
    db.add(activity)

    deal = db.scalar(
        select(Deal).where(
            Deal.id == payload.deal_id,
            Deal.organization_id == organization.id,
        )
    )
    if deal is not None and (
        deal.last_contact_at is None or payload.happened_at > deal.last_contact_at
    ):
        deal.last_contact_at = payload.happened_at
        db.add(deal)

    db.commit()
    db.refresh(activity)
    return activity


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Activity:
    return _get_activity_or_404(db, organization.id, activity_id)


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: UUID,
    payload: ActivityUpdate,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Activity:
    activity = _get_activity_or_404(db, organization.id, activity_id)
    updates = payload.model_dump(exclude_unset=True)

    if "deal_id" in updates and updates["deal_id"] is not None:
        _ensure_deal_in_org(db, organization.id, updates["deal_id"])
    if "contact_id" in updates and updates["contact_id"] is not None:
        _ensure_contact_in_org(db, organization.id, updates["contact_id"])

    for field, value in updates.items():
        setattr(activity, field, value)

    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> None:
    activity = _get_activity_or_404(db, organization.id, activity_id)
    db.delete(activity)
    db.commit()


def _get_activity_or_404(db: Session, organization_id: UUID, activity_id: UUID) -> Activity:
    activity = db.scalar(
        select(Activity).where(
            Activity.id == activity_id,
            Activity.organization_id == organization_id,
        )
    )
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


def _ensure_deal_in_org(db: Session, organization_id: UUID, deal_id: UUID) -> None:
    deal = db.scalar(
        select(Deal).where(
            Deal.id == deal_id,
            Deal.organization_id == organization_id,
        )
    )
    if deal is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Deal not found")


def _ensure_contact_in_org(db: Session, organization_id: UUID, contact_id: UUID) -> None:
    contact = db.scalar(
        select(Contact).where(
            Contact.id == contact_id,
            Contact.organization_id == organization_id,
        )
    )
    if contact is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Contact not found")

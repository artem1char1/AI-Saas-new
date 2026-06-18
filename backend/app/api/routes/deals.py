from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_organization
from app.models.activity import Activity
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.organization import Organization
from app.schemas.deal import DealCreate, DealPatch, DealResponse, DealUpdate
from app.schemas.deal_risk import DealRiskResponse
from app.services.deal_risk_service import calculate_deal_risk

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("", response_model=list[DealResponse])
def list_deals(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> list[Deal]:
    return list(
        db.scalars(
            select(Deal)
            .where(Deal.organization_id == organization.id)
            .order_by(Deal.created_at.desc())
        ).all()
    )


@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
def create_deal(
    payload: DealCreate,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Deal:
    _ensure_contact_in_org(db, organization.id, payload.contact_id)

    deal = Deal(
        organization_id=organization.id,
        contact_id=payload.contact_id,
        title=payload.title,
        amount=payload.amount,
        status=payload.status,
        priority=payload.priority,
        expected_close_date=payload.expected_close_date,
        next_action=payload.next_action,
        next_action_at=payload.next_action_at,
        loss_reason=payload.loss_reason if payload.status == "lost" else None,
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.get("/{deal_id}/risk", response_model=DealRiskResponse)
def get_deal_risk(
    deal_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> DealRiskResponse:
    deal = _get_deal_or_404(db, organization.id, deal_id)
    activities = list(
        db.scalars(
            select(Activity)
            .where(
                Activity.organization_id == organization.id,
                Activity.deal_id == deal.id,
            )
            .order_by(Activity.happened_at.desc())
        ).all()
    )
    risk = calculate_deal_risk(deal, activities)
    return DealRiskResponse(
        deal_id=deal.id,
        risk_score=risk.risk_score,
        risk_level=risk.risk_level,
        factors=[
            {"kind": factor.kind, "points": factor.points, "days": factor.days}
            for factor in risk.factors
        ],
        reasons=risk.reasons,
        next_best_action=risk.next_best_action,
        days_since_last_contact=risk.days_since_last_contact,
        is_closed=risk.is_closed,
    )


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(
    deal_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Deal:
    return _get_deal_or_404(db, organization.id, deal_id)


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: UUID,
    payload: DealUpdate,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Deal:
    return _apply_deal_update(db, organization.id, deal_id, payload)


@router.patch("/{deal_id}", response_model=DealResponse)
def patch_deal(
    deal_id: UUID,
    payload: DealPatch,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Deal:
    return _apply_deal_update(db, organization.id, deal_id, payload)


def _apply_deal_update(
    db: Session,
    organization_id: UUID,
    deal_id: UUID,
    payload: DealUpdate,
) -> Deal:
    deal = _get_deal_or_404(db, organization_id, deal_id)
    updates = payload.model_dump(exclude_unset=True)

    if "contact_id" in updates and updates["contact_id"] is not None:
        _ensure_contact_in_org(db, organization_id, updates["contact_id"])

    new_status = updates.get("status")
    if new_status is not None and new_status != "lost":
        updates["loss_reason"] = None
    elif new_status == "lost" and "loss_reason" not in updates:
        pass

    for field, value in updates.items():
        setattr(deal, field, value)

    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(
    deal_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> None:
    deal = _get_deal_or_404(db, organization.id, deal_id)
    db.delete(deal)
    db.commit()


def _get_deal_or_404(db: Session, organization_id: UUID, deal_id: UUID) -> Deal:
    deal = db.scalar(
        select(Deal).where(
            Deal.id == deal_id,
            Deal.organization_id == organization_id,
        )
    )
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found")
    return deal


def _ensure_contact_in_org(db: Session, organization_id: UUID, contact_id: UUID) -> None:
    contact = db.scalar(
        select(Contact).where(
            Contact.id == contact_id,
            Contact.organization_id == organization_id,
        )
    )
    if contact is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Contact not found")

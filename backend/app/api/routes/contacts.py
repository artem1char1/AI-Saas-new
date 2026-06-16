from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.api_errors import conflict, not_found
from app.core.database import get_db
from app.core.deps import get_current_organization
from app.models.activity import Activity
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.organization import Organization
from app.schemas.contact import ContactCreate, ContactResponse, ContactUpdate

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactResponse])
def list_contacts(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> list[Contact]:
    return list(
        db.scalars(
            select(Contact)
            .where(Contact.organization_id == organization.id)
            .order_by(Contact.created_at.desc())
        ).all()
    )


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    payload: ContactCreate,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Contact:
    contact = Contact(
        organization_id=organization.id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        company_name=payload.company_name,
        position=payload.position,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Contact:
    contact = _get_contact_or_404(db, organization.id, contact_id)
    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: UUID,
    payload: ContactUpdate,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> Contact:
    contact = _get_contact_or_404(db, organization.id, contact_id)
    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(contact, field, value)

    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> None:
    contact = _get_contact_or_404(db, organization.id, contact_id)

    deals_count = db.scalar(
        select(func.count())
        .select_from(Deal)
        .where(
            Deal.organization_id == organization.id,
            Deal.contact_id == contact.id,
        )
    )
    if deals_count:
        raise conflict(
            "contact_has_deals",
            "Cannot delete contact with existing deals",
        )

    activities_count = db.scalar(
        select(func.count())
        .select_from(Activity)
        .where(
            Activity.organization_id == organization.id,
            Activity.contact_id == contact.id,
        )
    )
    if activities_count:
        raise conflict(
            "contact_has_activities",
            "Cannot delete contact with existing activities",
        )

    db.delete(contact)
    db.commit()


def _get_contact_or_404(db: Session, organization_id: UUID, contact_id: UUID) -> Contact:
    contact = db.scalar(
        select(Contact).where(
            Contact.id == contact_id,
            Contact.organization_id == organization_id,
        )
    )
    if contact is None:
        raise not_found("contact_not_found", "Contact not found")
    return contact

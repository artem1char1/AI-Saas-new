from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_organization
from app.models.activity import Activity
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.organization import Organization
from app.schemas.search import SearchResponse, SearchResultItem

router = APIRouter(prefix="/search", tags=["search"])

RESULT_LIMIT = 5


def _ilike_pattern(query: str) -> str:
    escaped = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def _contact_matches(pattern: str):
    return or_(
        Contact.name.ilike(pattern),
        Contact.email.ilike(pattern),
        Contact.phone.ilike(pattern),
        Contact.company_name.ilike(pattern),
        Contact.position.ilike(pattern),
    )


def _deal_matches(pattern: str):
    return or_(
        Deal.title.ilike(pattern),
        Deal.status.ilike(pattern),
        Deal.priority.ilike(pattern),
        Deal.next_action.ilike(pattern),
        Deal.loss_reason.ilike(pattern),
    )


def _activity_matches(pattern: str):
    return or_(
        Activity.type.ilike(pattern),
        Activity.content.ilike(pattern),
    )


@router.get("", response_model=SearchResponse)
def global_search(
    q: str = Query(min_length=1, max_length=200),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> SearchResponse:
    query = q.strip()
    if not query:
        return SearchResponse(query=q, results=[])

    pattern = _ilike_pattern(query)
    results: list[SearchResultItem] = []

    if organization.name.lower().find(query.lower()) >= 0:
        results.append(
            SearchResultItem(
                id=organization.id,
                entity_type="organization",
                title=organization.name,
                subtitle=None,
            )
        )

    contacts = db.scalars(
        select(Contact)
        .where(Contact.organization_id == organization.id, _contact_matches(pattern))
        .order_by(Contact.updated_at.desc())
        .limit(RESULT_LIMIT)
    ).all()
    for contact in contacts:
        subtitle = contact.company_name or contact.email or contact.phone
        results.append(
            SearchResultItem(
                id=contact.id,
                entity_type="contact",
                title=contact.name,
                subtitle=subtitle,
            )
        )

    deals = db.scalars(
        select(Deal)
        .where(Deal.organization_id == organization.id, _deal_matches(pattern))
        .order_by(Deal.updated_at.desc())
        .limit(RESULT_LIMIT)
    ).all()
    for deal in deals:
        subtitle_parts = [part for part in (deal.status, str(deal.amount) if deal.amount else None) if part]
        results.append(
            SearchResultItem(
                id=deal.id,
                entity_type="deal",
                title=deal.title,
                subtitle=" · ".join(subtitle_parts) if subtitle_parts else None,
            )
        )

    rows = db.execute(
        select(Activity, Deal.title)
        .join(Deal, Activity.deal_id == Deal.id)
        .where(
            Activity.organization_id == organization.id,
            _activity_matches(pattern),
        )
        .order_by(Activity.happened_at.desc())
        .limit(RESULT_LIMIT)
    ).all()
    for activity, deal_title in rows:
        content_preview = (activity.content or "").strip()
        if len(content_preview) > 80:
            content_preview = f"{content_preview[:77]}..."

        results.append(
            SearchResultItem(
                id=activity.id,
                entity_type="activity",
                title=f"{activity.type} — {deal_title}",
                subtitle=content_preview or None,
                deal_id=activity.deal_id,
            )
        )

    return SearchResponse(query=query, results=results)

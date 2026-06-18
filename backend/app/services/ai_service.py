from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.api_errors import bad_request, not_found
from app.models.activity import Activity
from app.models.ai_followup import AiFollowup
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.organization import Organization
from app.models.user import User
from app.prompts.followup_prompt import build_followup_prompt
from app.services.ai_providers.groq_provider import GroqProvider

SYSTEM_PROMPT = (
    "Ты AI-помощник менеджера по продажам. "
    "Пиши follow-up строго по переданным фактам: используй имена, детали активностей, "
    "статус сделки и сроки. Не выдумывай события и не используй шаблонные фразы без опоры на контекст."
)
ACTIVITY_LIMIT = 10


def _get_provider() -> GroqProvider:
    return GroqProvider()


def _get_deal_or_404(db: Session, organization_id: UUID, deal_id: UUID) -> Deal:
    deal = db.scalar(
        select(Deal).where(
            Deal.id == deal_id,
            Deal.organization_id == organization_id,
        )
    )
    if deal is None:
        raise not_found("deal_not_found", "Deal not found")
    return deal


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


def list_followups_for_deal(
    db: Session,
    *,
    organization: Organization,
    deal_id: UUID,
) -> list[AiFollowup]:
    _get_deal_or_404(db, organization.id, deal_id)

    return list(
        db.scalars(
            select(AiFollowup)
            .where(
                AiFollowup.organization_id == organization.id,
                AiFollowup.deal_id == deal_id,
                AiFollowup.status == "generated",
            )
            .order_by(AiFollowup.created_at.desc())
            .limit(20)
        ).all()
    )


async def generate_followup(
    db: Session,
    *,
    organization: Organization,
    current_user: User,
    deal_id: UUID,
) -> AiFollowup:
    deal = _get_deal_or_404(db, organization.id, deal_id)
    contact = _get_contact_or_404(db, organization.id, deal.contact_id)

    activities = list(
        db.scalars(
            select(Activity)
            .where(
                Activity.organization_id == organization.id,
                Activity.deal_id == deal.id,
            )
            .order_by(Activity.happened_at.desc())
            .limit(ACTIVITY_LIMIT)
        ).all()
    )

    prompt = build_followup_prompt(deal=deal, contact=contact, activities=activities)

    try:
        provider = _get_provider()
        result_text = await provider.complete(system_prompt=SYSTEM_PROMPT, user_prompt=prompt)
    except Exception as exc:
        raise bad_request(
            "followup_generation_failed",
            "Failed to generate follow-up",
        ) from exc

    if len(result_text) > 1200:
        result_text = result_text[:1200].rstrip()

    followup = AiFollowup(
        organization_id=organization.id,
        deal_id=deal.id,
        contact_id=contact.id,
        user_id=current_user.id,
        prompt=prompt,
        result_text=result_text,
        status="generated",
    )
    db.add(followup)
    db.commit()
    db.refresh(followup)
    return followup

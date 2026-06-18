from collections import defaultdict
from datetime import date, datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.activity import Activity
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.organization import Organization
from app.schemas.dashboard import (
    AiInsightItem,
    DashboardSummaryResponse,
    TodayStatItem,
    TopDealDashboardItem,
    UpcomingActionItem,
)
from app.schemas.deal_risk import TopRiskyDealItem
from app.services.deal_risk_service import (
    OUTCOME_STATUSES,
    calculate_deal_risk,
    days_without_contact,
    factor_label,
    has_next_action,
    is_close_date_overdue,
    is_next_action_overdue,
    now_utc,
    to_utc,
)


def _is_active_deal(deal: Deal) -> bool:
    return deal.status.lower() not in OUTCOME_STATUSES


def _activities_by_deal(db: Session, organization_id: UUID) -> dict[UUID, list[Activity]]:
    activities = db.scalars(
        select(Activity)
        .where(Activity.organization_id == organization_id)
        .order_by(Activity.happened_at.desc())
    ).all()

    grouped: dict[UUID, list[Activity]] = defaultdict(list)
    for activity in activities:
        grouped[activity.deal_id].append(activity)
    return grouped


def _days_to_close(deal: Deal, today: date) -> int | None:
    if deal.expected_close_date is None:
        return None
    return (deal.expected_close_date - today).days


def _top_deal_subtitle(
    deal: Deal,
    risk_score: int,
    today: date,
) -> tuple[str, int | None]:
    days = _days_to_close(deal, today)
    if days is not None and days <= 14:
        return "closing", days
    if risk_score > 30:
        return "risk", None
    return "status", None


def _upcoming_sort_key(item: tuple[Deal, datetime | None, bool]) -> tuple[int, datetime, str]:
    deal, action_at, is_overdue = item
    if is_overdue:
        priority = 0
    elif action_at is not None and action_at.date() == now_utc().date():
        priority = 1
    else:
        priority = 2

    sort_at = action_at if action_at is not None else datetime.max.replace(tzinfo=timezone.utc)
    return priority, sort_at, deal.title


def build_dashboard_summary(
    db: Session,
    organization: Organization,
) -> DashboardSummaryResponse:
    deals = list(
        db.scalars(
            select(Deal)
            .where(Deal.organization_id == organization.id)
            .options(joinedload(Deal.contact))
            .order_by(Deal.updated_at.desc())
        )
        .unique()
        .all()
    )

    activities_map = _activities_by_deal(db, organization.id)
    active_deals = [deal for deal in deals if _is_active_deal(deal)]
    now = now_utc()
    today = now.date()

    high_count = 0
    medium_count = 0
    low_count = 0
    ranked: list[tuple[Deal, object]] = []
    risk_by_deal: dict[UUID, object] = {}

    overdue_next_action_count = 0
    no_contact_7d_count = 0
    needs_attention_count = 0
    no_next_step_count = 0
    overdue_close_count = 0

    for deal in active_deals:
        activities = activities_map.get(deal.id, [])
        risk = calculate_deal_risk(deal, activities)
        risk_by_deal[deal.id] = risk

        if risk.risk_level == "high":
            high_count += 1
        elif risk.risk_level == "medium":
            medium_count += 1
        else:
            low_count += 1

        if risk.risk_level in {"high", "medium"}:
            needs_attention_count += 1

        if not has_next_action(deal):
            no_next_step_count += 1

        if is_next_action_overdue(deal, now):
            overdue_next_action_count += 1

        if is_close_date_overdue(deal, today):
            overdue_close_count += 1

        days_no_contact = days_without_contact(deal, activities, now)
        if days_no_contact is None or days_no_contact > 7:
            no_contact_7d_count += 1

        ranked.append((deal, risk))

    ranked.sort(key=lambda item: item[1].risk_score, reverse=True)

    top_risky_deals: list[TopRiskyDealItem] = []
    for deal, risk in ranked[:10]:
        if risk.risk_score == 0:
            continue

        contact: Contact | None = deal.contact
        top_risky_deals.append(
            TopRiskyDealItem(
                deal_id=deal.id,
                title=deal.title,
                contact_name=contact.name if contact else None,
                company_name=contact.company_name if contact else None,
                amount=deal.amount,
                risk_score=risk.risk_score,
                risk_level=risk.risk_level,
                main_reason=factor_label(risk.factors[0]) if risk.factors else None,
            )
        )

    upcoming_candidates: list[tuple[Deal, datetime | None, bool]] = []
    for deal in active_deals:
        if not has_next_action(deal):
            continue

        action_at = to_utc(deal.next_action_at) if deal.next_action_at else None
        is_overdue = is_next_action_overdue(deal, now)
        if action_at is None or is_overdue or action_at.date() <= today:
            upcoming_candidates.append((deal, action_at, is_overdue))

    upcoming_candidates.sort(key=_upcoming_sort_key)

    upcoming_actions: list[UpcomingActionItem] = []
    for deal, action_at, is_overdue in upcoming_candidates[:10]:
        contact = deal.contact
        upcoming_actions.append(
            UpcomingActionItem(
                deal_id=deal.id,
                title=deal.title,
                next_action=deal.next_action.strip() if deal.next_action else "",
                next_action_at=action_at,
                is_overdue=is_overdue,
                company_name=contact.company_name if contact else None,
                contact_name=contact.name if contact else None,
            )
        )

    top_by_amount = sorted(active_deals, key=lambda d: d.amount or 0, reverse=True)[:4]
    top_deals: list[TopDealDashboardItem] = []
    for deal in top_by_amount:
        risk = risk_by_deal[deal.id]
        subtitle_kind, days_to_close = _top_deal_subtitle(deal, risk.risk_score, today)
        top_deals.append(
            TopDealDashboardItem(
                deal_id=deal.id,
                title=deal.title,
                amount=deal.amount,
                status=deal.status,
                risk_score=risk.risk_score,
                risk_level=risk.risk_level,
                subtitle_kind=subtitle_kind,
                days_to_close=days_to_close,
            )
        )

    today_stats = [
        TodayStatItem(kind="high_risk", count=high_count),
        TodayStatItem(kind="overdue_next_action", count=overdue_next_action_count),
        TodayStatItem(kind="no_contact_7d", count=no_contact_7d_count),
    ]

    ai_insights = [
        AiInsightItem(kind="needs_attention", count=needs_attention_count),
        AiInsightItem(kind="no_next_step", count=no_next_step_count),
        AiInsightItem(kind="overdue_close", count=overdue_close_count),
    ]

    return DashboardSummaryResponse(
        total_active_deals=len(active_deals),
        high_risk_count=high_count,
        medium_risk_count=medium_count,
        low_risk_count=low_count,
        top_risky_deals=top_risky_deals[:5],
        today_stats=today_stats,
        ai_insights=[item for item in ai_insights if item.count > 0],
        upcoming_actions=upcoming_actions,
        top_deals=top_deals,
    )

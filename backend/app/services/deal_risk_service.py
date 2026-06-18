from dataclasses import dataclass
from datetime import date, datetime, timezone

from app.models.activity import Activity
from app.models.deal import Deal

OUTCOME_STATUSES = frozenset({"won", "lost"})

RISK_FACTOR_KINDS = frozenset({
    "no_next_step",
    "next_action_overdue",
    "close_date_overdue",
    "no_contact",
    "no_contact_days",
    "high_priority",
    "status_negotiation",
    "status_proposal",
})


@dataclass(frozen=True)
class RiskFactor:
    kind: str
    points: int
    days: int | None = None


@dataclass(frozen=True)
class DealRiskResult:
    risk_score: int
    risk_level: str
    factors: list[RiskFactor]
    reasons: list[str]
    next_best_action: str
    days_since_last_contact: int | None
    is_closed: bool = False


def to_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def resolve_last_contact_at(deal: Deal, activities: list[Activity]) -> datetime | None:
    timestamps: list[datetime] = []

    if deal.last_contact_at is not None:
        timestamps.append(to_utc(deal.last_contact_at))

    for activity in activities:
        timestamps.append(to_utc(activity.happened_at))

    if not timestamps:
        return None

    return max(timestamps)


def days_without_contact(deal: Deal, activities: list[Activity], now: datetime) -> int | None:
    last_contact_at = resolve_last_contact_at(deal, activities)
    if last_contact_at is None:
        return None
    return (now.date() - to_utc(last_contact_at).date()).days


def _risk_level_from_score(score: int) -> str:
    if score <= 30:
        return "low"
    if score <= 65:
        return "medium"
    return "high"


def has_next_action(deal: Deal) -> bool:
    return bool(deal.next_action and deal.next_action.strip())


def is_next_action_overdue(deal: Deal, now: datetime) -> bool:
    if deal.next_action_at is None:
        return False
    return to_utc(deal.next_action_at) < now


def is_close_date_overdue(deal: Deal, today: date) -> bool:
    if deal.expected_close_date is None:
        return False
    return deal.expected_close_date < today


def factor_label(factor: RiskFactor) -> str:
    labels = {
        "no_next_step": "Нет следующего шага",
        "next_action_overdue": "Следующий шаг просрочен",
        "close_date_overdue": "Дата закрытия просрочена",
        "no_contact": "Нет контакта с клиентом",
        "no_contact_days": f"Нет контакта {factor.days} дней",
        "high_priority": "Высокий приоритет",
        "status_negotiation": "Статус: переговоры",
        "status_proposal": "Статус: предложение",
    }
    return labels.get(factor.kind, factor.kind)


def _build_next_best_action(
    *,
    has_next_action: bool,
    next_action_overdue: bool,
    close_date_overdue: bool,
    days_without_contact: int | None,
) -> str:
    if not has_next_action:
        return "Назначить и зафиксировать следующий шаг по сделке"
    if next_action_overdue:
        return "Связаться с клиентом и согласовать следующий шаг"
    if close_date_overdue:
        return "Связаться с клиентом и согласовать новый срок"
    if days_without_contact is None or days_without_contact > 14:
        return "Связаться с клиентом и восстановить коммуникацию"
    if days_without_contact > 7:
        return "Связаться с клиентом и уточнить актуальность сделки"
    return "Продолжить работу по текущему плану и обновить статус сделки"


def calculate_deal_risk(deal: Deal, activities: list[Activity]) -> DealRiskResult:
    status = deal.status.lower()

    if status in OUTCOME_STATUSES:
        return DealRiskResult(
            risk_score=0,
            risk_level="low",
            factors=[],
            reasons=[],
            next_best_action="",
            days_since_last_contact=None,
            is_closed=True,
        )

    now = now_utc()
    today = now.date()
    score = 0
    factors: list[RiskFactor] = []

    has_action = has_next_action(deal)
    next_action_overdue = is_next_action_overdue(deal, now)
    close_date_overdue = is_close_date_overdue(deal, today)
    days_no_contact = days_without_contact(deal, activities, now)

    if not has_action:
        score += 25
        factors.append(RiskFactor(kind="no_next_step", points=25))

    if next_action_overdue:
        score += 25
        factors.append(RiskFactor(kind="next_action_overdue", points=25))

    if close_date_overdue:
        score += 25
        factors.append(RiskFactor(kind="close_date_overdue", points=25))

    if days_no_contact is None:
        score += 25
        factors.append(RiskFactor(kind="no_contact", points=25))
    elif days_no_contact > 14:
        score += 25
        factors.append(RiskFactor(kind="no_contact_days", points=25, days=days_no_contact))
    elif days_no_contact > 7:
        score += 15
        factors.append(RiskFactor(kind="no_contact_days", points=15, days=days_no_contact))

    if deal.priority and deal.priority.lower() == "high":
        score += 10
        factors.append(RiskFactor(kind="high_priority", points=10))

    if status == "negotiation":
        score += 10
        factors.append(RiskFactor(kind="status_negotiation", points=10))
    elif status == "proposal":
        score += 5
        factors.append(RiskFactor(kind="status_proposal", points=5))

    score = min(score, 100)
    reasons = [factor_label(factor) for factor in factors]

    return DealRiskResult(
        risk_score=score,
        risk_level=_risk_level_from_score(score),
        factors=factors,
        reasons=reasons,
        next_best_action=_build_next_best_action(
            has_next_action=has_action,
            next_action_overdue=next_action_overdue,
            close_date_overdue=close_date_overdue,
            days_without_contact=days_no_contact,
        ),
        days_since_last_contact=days_no_contact,
        is_closed=False,
    )

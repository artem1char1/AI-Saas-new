from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.deal_risk import TopRiskyDealItem


class TodayStatItem(BaseModel):
    kind: Literal["high_risk", "overdue_next_action", "no_contact_7d"]
    count: int


class AiInsightItem(BaseModel):
    kind: Literal["needs_attention", "no_next_step", "overdue_close"]
    count: int


class UpcomingActionItem(BaseModel):
    deal_id: UUID
    title: str
    next_action: str
    next_action_at: datetime | None
    is_overdue: bool
    company_name: str | None
    contact_name: str | None


class TopDealDashboardItem(BaseModel):
    deal_id: UUID
    title: str
    amount: Decimal | None
    status: str
    risk_score: int
    risk_level: str
    subtitle_kind: Literal["status", "closing", "risk"]
    days_to_close: int | None = None


class DashboardSummaryResponse(BaseModel):
    total_active_deals: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    top_risky_deals: list[TopRiskyDealItem]
    today_stats: list[TodayStatItem]
    ai_insights: list[AiInsightItem]
    upcoming_actions: list[UpcomingActionItem]
    top_deals: list[TopDealDashboardItem]

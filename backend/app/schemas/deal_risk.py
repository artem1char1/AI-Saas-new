from dataclasses import dataclass
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class RiskFactorResponse(BaseModel):
    kind: str
    points: int
    days: int | None = None


class DealRiskResponse(BaseModel):
    deal_id: UUID
    risk_score: int
    risk_level: str
    factors: list[RiskFactorResponse]
    reasons: list[str]
    next_best_action: str
    days_since_last_contact: int | None = None
    is_closed: bool = False


class TopRiskyDealItem(BaseModel):
    deal_id: UUID
    title: str
    contact_name: str | None
    company_name: str | None
    amount: Decimal | None
    risk_score: int
    risk_level: str
    main_reason: str | None


class DashboardRiskSummaryResponse(BaseModel):
    total_active_deals: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    top_risky_deals: list[TopRiskyDealItem]

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_organization
from app.models.organization import Organization
from app.schemas.dashboard import DashboardSummaryResponse
from app.schemas.deal_risk import DashboardRiskSummaryResponse
from app.services.dashboard_service import build_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> DashboardSummaryResponse:
    return build_dashboard_summary(db, organization)


@router.get("/risk-summary", response_model=DashboardRiskSummaryResponse)
def get_risk_summary(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
) -> DashboardRiskSummaryResponse:
    summary = build_dashboard_summary(db, organization)
    return DashboardRiskSummaryResponse(
        total_active_deals=summary.total_active_deals,
        high_risk_count=summary.high_risk_count,
        medium_risk_count=summary.medium_risk_count,
        low_risk_count=summary.low_risk_count,
        top_risky_deals=summary.top_risky_deals,
    )

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

DEAL_STATUSES = frozenset(
    {
        "new",
        "qualification",
        "proposal",
        "negotiation",
        "won",
        "lost",
    }
)


class DealCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    amount: Decimal | None = Field(default=None, ge=0)
    status: str = Field(default="new", min_length=1, max_length=50)
    priority: str | None = Field(default=None, max_length=50)
    contact_id: UUID
    expected_close_date: date | None = None
    next_action: str | None = Field(default=None, max_length=2000)
    next_action_at: datetime | None = None
    loss_reason: str | None = Field(default=None, max_length=500)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        normalized = value.lower()
        if normalized not in DEAL_STATUSES:
            raise ValueError(f"Invalid deal status: {value}")
        return normalized


class DealUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = Field(default=None, min_length=1, max_length=50)
    priority: str | None = Field(default=None, max_length=50)
    contact_id: UUID | None = None
    expected_close_date: date | None = None
    next_action: str | None = Field(default=None, max_length=2000)
    next_action_at: datetime | None = None
    loss_reason: str | None = Field(default=None, max_length=500)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.lower()
        if normalized not in DEAL_STATUSES:
            raise ValueError(f"Invalid deal status: {value}")
        return normalized


class DealPatch(DealUpdate):
    pass


class DealResponse(BaseModel):
    id: UUID
    organization_id: UUID
    contact_id: UUID
    title: str
    amount: Decimal | None
    currency: str | None
    status: str
    priority: str | None
    expected_close_date: date | None
    last_contact_at: datetime | None
    next_action: str | None
    next_action_at: datetime | None
    loss_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

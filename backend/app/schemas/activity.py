from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ActivityCreate(BaseModel):
    type: str = Field(min_length=1, max_length=50)
    content: str | None = None
    deal_id: UUID
    contact_id: UUID
    happened_at: datetime


class ActivityUpdate(BaseModel):
    type: str | None = Field(default=None, min_length=1, max_length=50)
    content: str | None = None
    deal_id: UUID | None = None
    contact_id: UUID | None = None
    happened_at: datetime | None = None


class ActivityResponse(BaseModel):
    id: UUID
    organization_id: UUID
    deal_id: UUID
    contact_id: UUID
    user_id: UUID
    type: str
    content: str | None
    happened_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}

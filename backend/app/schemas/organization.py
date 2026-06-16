from datetime import datetime, timezone
from uuid import UUID

from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

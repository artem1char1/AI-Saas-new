from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class FollowupGenerateRequest(BaseModel):
    deal_id: UUID


class FollowupResponse(BaseModel):
    id: UUID
    deal_id: UUID
    contact_id: UUID
    result_text: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FollowupListItem(BaseModel):
    id: UUID
    result_text: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

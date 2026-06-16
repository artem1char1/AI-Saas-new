from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=50)
    company_name: str | None = Field(default=None, max_length=255)
    position: str | None = Field(default=None, max_length=255)


class ContactUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=50)
    company_name: str | None = Field(default=None, max_length=255)
    position: str | None = Field(default=None, max_length=255)


class ContactResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    email: str | None
    phone: str | None
    company_name: str | None
    position: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

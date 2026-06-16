from uuid import UUID

from pydantic import BaseModel, Field


class SearchResultItem(BaseModel):
    id: UUID
    entity_type: str = Field(description="contact | deal | activity | organization")
    title: str
    subtitle: str | None = None
    deal_id: UUID | None = None


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]

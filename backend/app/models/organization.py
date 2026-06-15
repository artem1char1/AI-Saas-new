import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, uuid_pk


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    members: Mapped[list["OrganizationMember"]] = relationship(back_populates="organization")
    contacts: Mapped[list["Contact"]] = relationship(back_populates="organization")
    deals: Mapped[list["Deal"]] = relationship(back_populates="organization")
    activities: Mapped[list["Activity"]] = relationship(back_populates="organization")
    ai_insights: Mapped[list["AiInsight"]] = relationship(back_populates="organization")
    ai_followups: Mapped[list["AiFollowup"]] = relationship(back_populates="organization")

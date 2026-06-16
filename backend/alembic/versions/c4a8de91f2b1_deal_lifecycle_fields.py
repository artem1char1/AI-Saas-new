"""deal lifecycle fields

Revision ID: c4a8de91f2b1
Revises: 730745e3f736
Create Date: 2026-06-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c4a8de91f2b1'
down_revision: Union[str, Sequence[str], None] = '730745e3f736'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('deals', sa.Column('next_action', sa.Text(), nullable=True))
    op.add_column('deals', sa.Column('loss_reason', sa.String(length=500), nullable=True))
    op.execute("UPDATE deals SET status = 'won' WHERE status = 'closed'")


def downgrade() -> None:
    op.execute("UPDATE deals SET status = 'closed' WHERE status = 'won'")
    op.drop_column('deals', 'loss_reason')
    op.drop_column('deals', 'next_action')

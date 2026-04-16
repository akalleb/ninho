"""add professional access overrides

Revision ID: c7f9d3f1a2b4
Revises: 082bd2f2a6ab
Create Date: 2026-04-15 11:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c7f9d3f1a2b4"
down_revision: Union[str, None] = "082bd2f2a6ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("professionals", schema=None) as batch_op:
        batch_op.add_column(sa.Column("access_overrides", sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("professionals", schema=None) as batch_op:
        batch_op.drop_column("access_overrides")

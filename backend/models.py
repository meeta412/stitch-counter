import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def new_id() -> str:
    return str(uuid.uuid4())


class Project(Base):
    __tablename__ = 'projects'

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    craft_type: Mapped[str] = mapped_column(String, default='knitting')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    counters: Mapped[list['Counter']] = relationship(
        back_populates='project',
        cascade='all, delete-orphan',
    )
    pattern_items: Mapped[list['PatternItem']] = relationship(
        back_populates='project',
        cascade='all, delete-orphan',
    )


class Counter(Base):
    __tablename__ = 'counters'

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(String, ForeignKey('projects.id'), index=True)
    label: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[int] = mapped_column(Integer, default=0)
    type: Mapped[str] = mapped_column(String, default='stitch')

    project: Mapped['Project'] = relationship(back_populates='counters')


class PatternItem(Base):
    __tablename__ = 'pattern_items'

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(String, ForeignKey('projects.id'), index=True)
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    instruction: Mapped[str] = mapped_column(Text, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, default='')
    stitch_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    project: Mapped['Project'] = relationship(back_populates='pattern_items')

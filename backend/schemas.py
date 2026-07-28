from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class CounterCreate(BaseModel):
    label: str
    type: Literal['stitch', 'row'] = 'stitch'


class CounterUpdate(BaseModel):
    value: int


class CounterRead(BaseModel):
    id: str
    label: str
    value: int
    type: Literal['stitch', 'row']

    model_config = {'from_attributes': True}


class PatternItemCreate(BaseModel):
    row_number: int
    instruction: str
    stitch_count: int | None = None


class PatternItemUpdate(BaseModel):
    instruction: str | None = None
    completed: bool | None = None
    notes: str | None = None
    stitch_count: int | None = None


class PatternItemRead(BaseModel):
    id: str
    row_number: int
    instruction: str
    completed: bool
    notes: str
    stitch_count: int | None = None

    model_config = {'from_attributes': True}


class PatternItemBulkCreate(BaseModel):
    items: list[PatternItemCreate]


class ProjectCreate(BaseModel):
    name: str
    craft_type: str = 'knitting'


class ProjectUpdate(BaseModel):
    name: str


class ProjectRead(BaseModel):
    id: str
    name: str
    craft_type: str
    created_at: datetime
    counters: list[CounterRead] = Field(default_factory=list)
    pattern_items: list[PatternItemRead] = Field(default_factory=list)

    model_config = {'from_attributes': True}


class CounterMigrate(BaseModel):
    label: str
    value: int = 0
    type: Literal['stitch', 'row'] = 'stitch'


class PatternItemMigrate(BaseModel):
    row_number: int
    instruction: str
    completed: bool = False
    notes: str = ''
    stitch_count: int | None = None


class ProjectMigrate(BaseModel):
    name: str
    craft_type: str = 'knitting'
    counters: list[CounterMigrate] = Field(default_factory=list)
    pattern_items: list[PatternItemMigrate] = Field(default_factory=list)


class MigrateRequest(BaseModel):
    projects: list[ProjectMigrate]

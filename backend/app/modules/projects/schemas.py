from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import date, datetime
from .models import ProjectStatus, ProjectTaskStatus

class ProjectParticipant(BaseModel):
    name: str
    role: Optional[str] = None

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = ProjectStatus.PROGRESS
    category: Optional[str] = None
    progress: Optional[int] = 0
    total_tasks: Optional[int] = 0
    completed_tasks: Optional[int] = 0
    budget: Optional[float] = None
    spendings: Optional[float] = None
    hours_spent: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    owner: Optional[str] = None
    participants: Optional[List[ProjectParticipant]] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {s.value for s in ProjectStatus}
        if v not in allowed:
            raise ValueError("status inválido")
        return v

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        if v < 0:
            return 0
        if v > 100:
            return 100
        return v

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    progress: Optional[int] = None
    total_tasks: Optional[int] = None
    completed_tasks: Optional[int] = None
    budget: Optional[float] = None
    spendings: Optional[float] = None
    hours_spent: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    owner: Optional[str] = None
    participants: Optional[List[ProjectParticipant]] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {s.value for s in ProjectStatus}
        if v not in allowed:
            raise ValueError("status inválido")
        return v

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        if v < 0:
            return 0
        if v > 100:
            return 100
        return v

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {s.value for s in ProjectTaskStatus}
        if v not in allowed:
            raise ValueError("status inválido")
        return v

class ProjectTaskCreate(ProjectTaskBase):
    pass

class ProjectTaskUpdate(ProjectTaskBase):
    pass

class ProjectTaskResponse(ProjectTaskBase):
    id: int
    project_id: int
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

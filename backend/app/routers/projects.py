from datetime import date, datetime
from typing import List, Optional
import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator

from .. import database, models


router = APIRouter(prefix="/projects", tags=["Projects"])


class ProjectParticipant(BaseModel):
    name: str
    role: Optional[str] = None


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = models.ProjectStatus.PROGRESS
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


class Project(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


def _serialize_participants(participants: Optional[List[ProjectParticipant] | List[dict]]) -> Optional[str]:
    if not participants:
        return None
    normalized = []
    for item in participants:
        if isinstance(item, ProjectParticipant):
            normalized.append(item.model_dump())
        elif isinstance(item, dict):
            normalized.append(
                {
                    "name": item.get("name"),
                    "role": item.get("role"),
                }
            )
    if not normalized:
        return None
    return json.dumps(normalized)


def _deserialize_participants(raw: Optional[str]) -> List[ProjectParticipant]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [ProjectParticipant(**item) for item in data if isinstance(item, dict)]
        return []
    except Exception:
        return []


def _project_to_response(project: models.Project) -> Project:
    return Project(
        id=project.id,
        title=project.title,
        description=project.description,
        status=project.status,
        category=project.category,
        progress=project.progress,
        total_tasks=project.total_tasks,
        completed_tasks=project.completed_tasks,
        budget=project.budget,
        spendings=project.spendings,
        hours_spent=project.hours_spent,
        start_date=project.start_date,
        end_date=project.end_date,
        owner=project.owner,
        participants=_deserialize_participants(project.participants),
        created_at=project.created_at,
    )


@router.post("/", response_model=Project)
def create_project(project: ProjectCreate, db: Session = Depends(database.get_db)):
    data = project.model_dump()
    participants = data.pop("participants", None)

    db_project = models.Project(
        title=data["title"],
        description=data.get("description"),
        status=data.get("status") or models.ProjectStatus.PROGRESS,
        category=data.get("category"),
        progress=data.get("progress") or 0,
        total_tasks=data.get("total_tasks") or 0,
        completed_tasks=data.get("completed_tasks") or 0,
        budget=data.get("budget"),
        spendings=data.get("spendings"),
        hours_spent=data.get("hours_spent"),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        owner=data.get("owner"),
        participants=_serialize_participants(participants),
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return _project_to_response(db_project)


@router.get("/", response_model=List[Project])
def list_projects(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(database.get_db),
):
    query = db.query(models.Project)

    if status:
        query = query.filter(models.Project.status == status)

    if search:
        like = f"%{search}%"
        query = query.filter(models.Project.title.ilike(like))

    projects = query.order_by(models.Project.created_at.desc()).all()
    return [_project_to_response(p) for p in projects]


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: int, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return _project_to_response(project)


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    db.delete(project)
    db.commit()
    return None

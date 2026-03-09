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


class ProjectTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None


class ProjectTaskCreate(ProjectTaskBase):
    pass


class ProjectTask(ProjectTaskBase):
    id: int
    project_id: int
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


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


def _recalculate_project_progress(db: Session, project_id: int) -> None:
    tasks = db.query(models.ProjectTask).filter(models.ProjectTask.project_id == project_id).all()
    total = len(tasks)
    completed = len([t for t in tasks if t.status == models.ProjectTaskStatus.COMPLETED])
    progress = 0
    if total > 0:
        progress = int((completed / total) * 100)
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        return
    project.total_tasks = total
    project.completed_tasks = completed
    project.progress = progress
    if completed == total and total > 0:
        project.status = models.ProjectStatus.COMPLETE
    db.commit()


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


@router.put("/{project_id}", response_model=Project)
def update_project(project_id: int, update: ProjectUpdate, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    data = update.model_dump(exclude_unset=True)
    participants = data.pop("participants", None)

    for key, value in data.items():
        if key == "participants":
            continue
        setattr(project, key, value)

    if participants is not None:
        project.participants = _serialize_participants(participants)

    db.commit()
    db.refresh(project)
    return _project_to_response(project)


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    db.delete(project)
    db.commit()
    return None


@router.post("/{project_id}/tasks/", response_model=ProjectTask)
def create_project_task(project_id: int, task: ProjectTaskCreate, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")

    status = task.status or models.ProjectTaskStatus.PENDING
    if status not in (
        models.ProjectTaskStatus.PENDING,
        models.ProjectTaskStatus.IN_PROGRESS,
        models.ProjectTaskStatus.COMPLETED,
    ):
        status = models.ProjectTaskStatus.PENDING

    completed_at = None
    if status == models.ProjectTaskStatus.COMPLETED:
        completed_at = datetime.utcnow()

    db_task = models.ProjectTask(
        project_id=project_id,
        title=task.title,
        description=task.description,
        status=status,
        due_date=task.due_date,
        completed_at=completed_at,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    _recalculate_project_progress(db, project_id)
    return ProjectTask.model_validate(db_task)


@router.get("/{project_id}/tasks/", response_model=List[ProjectTask])
def list_project_tasks(project_id: int, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    tasks = db.query(models.ProjectTask).filter(models.ProjectTask.project_id == project_id).order_by(
        models.ProjectTask.created_at.asc()
    )
    return [ProjectTask.model_validate(t) for t in tasks]


@router.put("/{project_id}/tasks/{task_id}", response_model=ProjectTask)
def update_project_task(
    project_id: int,
    task_id: int,
    task: ProjectTaskBase,
    db: Session = Depends(database.get_db),
):
    db_task = (
        db.query(models.ProjectTask)
        .filter(models.ProjectTask.id == task_id, models.ProjectTask.project_id == project_id)
        .first()
    )
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    data = task.model_dump(exclude_unset=True)

    status = data.get("status")
    if status:
        if status not in (
            models.ProjectTaskStatus.PENDING,
            models.ProjectTaskStatus.IN_PROGRESS,
            models.ProjectTaskStatus.COMPLETED,
        ):
            status = models.ProjectTaskStatus.PENDING
        db_task.status = status
        if status == models.ProjectTaskStatus.COMPLETED and not db_task.completed_at:
            db_task.completed_at = datetime.utcnow()

    if "title" in data:
        db_task.title = data["title"]
    if "description" in data:
        db_task.description = data["description"]
    if "due_date" in data:
        db_task.due_date = data["due_date"]

    db.commit()
    db.refresh(db_task)

    _recalculate_project_progress(db, project_id)
    return ProjectTask.model_validate(db_task)


@router.delete("/{project_id}/tasks/{task_id}", status_code=204)
def delete_project_task(project_id: int, task_id: int, db: Session = Depends(database.get_db)):
    db_task = (
        db.query(models.ProjectTask)
        .filter(models.ProjectTask.id == task_id, models.ProjectTask.project_id == project_id)
        .first()
    )
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    db.delete(db_task)
    db.commit()
    _recalculate_project_progress(db, project_id)
    return None

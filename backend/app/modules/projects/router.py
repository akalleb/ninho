from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from ... import database
from ...core.security import get_current_admin_or_operational

from .schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, 
    ProjectTaskCreate, ProjectTaskUpdate, ProjectTaskResponse
)
from .services import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"], dependencies=[Depends(get_current_admin_or_operational)])

def _project_to_response(project) -> ProjectResponse:
    # Handle the JSON deserialization here or in schema. 
    # Since schema has from_attributes=True, we need to ensure the `participants` attribute 
    # is a list of objects, not a JSON string.
    # The service methods return the DB object which has a string.
    # We can use a helper to convert it.
    participants = ProjectService._deserialize_participants(project.participants)
    
    return ProjectResponse(
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
        participants=participants,
        created_at=project.created_at,
    )

@router.post("/", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(database.get_db)):
    db_project = ProjectService.create_project(db, project)
    return _project_to_response(db_project)

@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(database.get_db),
):
    projects = ProjectService.list_projects(db, status, search)
    return [_project_to_response(p) for p in projects]

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(database.get_db)):
    project = ProjectService.get_project(db, project_id)
    return _project_to_response(project)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, update: ProjectUpdate, db: Session = Depends(database.get_db)):
    project = ProjectService.update_project(db, project_id, update)
    return _project_to_response(project)

@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int, 
    force: bool = Query(False),
    db: Session = Depends(database.get_db)
):
    ProjectService.delete_project(db, project_id, force)
    return None

@router.post("/{project_id}/tasks/", response_model=ProjectTaskResponse)
def create_project_task(project_id: int, task: ProjectTaskCreate, db: Session = Depends(database.get_db)):
    return ProjectService.create_task(db, project_id, task)

@router.get("/{project_id}/tasks/", response_model=List[ProjectTaskResponse])
def list_project_tasks(project_id: int, db: Session = Depends(database.get_db)):
    return ProjectService.list_tasks(db, project_id)

@router.put("/{project_id}/tasks/{task_id}", response_model=ProjectTaskResponse)
def update_project_task(
    project_id: int,
    task_id: int,
    task: ProjectTaskUpdate,
    db: Session = Depends(database.get_db),
):
    return ProjectService.update_task(db, project_id, task_id, task)

@router.delete("/{project_id}/tasks/{task_id}", status_code=204)
def delete_project_task(project_id: int, task_id: int, db: Session = Depends(database.get_db)):
    ProjectService.delete_task(db, project_id, task_id)
    return None

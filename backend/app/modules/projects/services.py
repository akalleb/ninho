from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import json
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from .models import Project, ProjectTask, ProjectStatus, ProjectTaskStatus
from .schemas import ProjectCreate, ProjectUpdate, ProjectParticipant, ProjectTaskCreate, ProjectTaskUpdate

class ProjectService:
    @staticmethod
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

    @staticmethod
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

    @staticmethod
    def _recalculate_project_progress(db: Session, project_id: int) -> None:
        tasks = db.query(ProjectTask).filter(ProjectTask.project_id == project_id).all()
        total = len(tasks)
        completed = len([t for t in tasks if t.status == ProjectTaskStatus.COMPLETED])
        progress = 0
        if total > 0:
            progress = int((completed / total) * 100)
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return
        project.total_tasks = total
        project.completed_tasks = completed
        project.progress = progress
        if completed == total and total > 0:
            project.status = ProjectStatus.COMPLETE
        db.commit()

    @staticmethod
    def create_project(db: Session, project: ProjectCreate) -> Project:
        data = project.model_dump()
        participants = data.pop("participants", None)

        db_project = Project(
            title=data["title"],
            description=data.get("description"),
            status=data.get("status") or ProjectStatus.PROGRESS,
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
            participants=ProjectService._serialize_participants(participants),
        )

        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        # Hydrate participants for response
        # Note: The response model expects a list of ProjectParticipant, but the DB model has a JSON string.
        # We handle this transformation in the router or schema level, but let's make sure the object is ready.
        return db_project

    @staticmethod
    def list_projects(db: Session, status: Optional[str] = None, search: Optional[str] = None):
        query = db.query(Project)

        if status:
            query = query.filter(Project.status == status)

        if search:
            like = f"%{search}%"
            query = query.filter(Project.title.ilike(like))

        return query.order_by(Project.created_at.desc()).all()

    @staticmethod
    def get_project(db: Session, project_id: int) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        return project

    @staticmethod
    def update_project(db: Session, project_id: int, update: ProjectUpdate) -> Project:
        project = ProjectService.get_project(db, project_id)

        data = update.model_dump(exclude_unset=True)
        participants = data.pop("participants", None)

        for key, value in data.items():
            if key == "participants":
                continue
            setattr(project, key, value)

        if participants is not None:
            project.participants = ProjectService._serialize_participants(participants)

        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete_project(db: Session, project_id: int, force: bool = False):
        project = ProjectService.get_project(db, project_id)
        try:
            if force:
                # Delete all associated tasks
                db.query(ProjectTask).filter(ProjectTask.project_id == project_id).delete()
            db.delete(project)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Não é possível excluir este projeto pois existem tarefas ou registros dependentes vinculados. Use a exclusão forçada para remover tudo."
            )

    @staticmethod
    def create_task(db: Session, project_id: int, task: ProjectTaskCreate) -> ProjectTask:
        project = ProjectService.get_project(db, project_id)

        status = task.status or ProjectTaskStatus.PENDING
        if status not in (
            ProjectTaskStatus.PENDING,
            ProjectTaskStatus.IN_PROGRESS,
            ProjectTaskStatus.COMPLETED,
        ):
            status = ProjectTaskStatus.PENDING

        completed_at = None
        if status == ProjectTaskStatus.COMPLETED:
            completed_at = datetime.utcnow()

        db_task = ProjectTask(
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

        ProjectService._recalculate_project_progress(db, project_id)
        return db_task

    @staticmethod
    def list_tasks(db: Session, project_id: int):
        ProjectService.get_project(db, project_id) # Ensure project exists
        return db.query(ProjectTask).filter(ProjectTask.project_id == project_id).order_by(
            ProjectTask.created_at.asc()
        ).all()

    @staticmethod
    def update_task(db: Session, project_id: int, task_id: int, task: ProjectTaskUpdate) -> ProjectTask:
        db_task = (
            db.query(ProjectTask)
            .filter(ProjectTask.id == task_id, ProjectTask.project_id == project_id)
            .first()
        )
        if not db_task:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada")

        data = task.model_dump(exclude_unset=True)

        status = data.get("status")
        if status:
            if status not in (
                ProjectTaskStatus.PENDING,
                ProjectTaskStatus.IN_PROGRESS,
                ProjectTaskStatus.COMPLETED,
            ):
                status = ProjectTaskStatus.PENDING
            db_task.status = status
            if status == ProjectTaskStatus.COMPLETED and not db_task.completed_at:
                db_task.completed_at = datetime.utcnow()

        if "title" in data:
            db_task.title = data["title"]
        if "description" in data:
            db_task.description = data["description"]
        if "due_date" in data:
            db_task.due_date = data["due_date"]

        db.commit()
        db.refresh(db_task)

        ProjectService._recalculate_project_progress(db, project_id)
        return db_task

    @staticmethod
    def delete_task(db: Session, project_id: int, task_id: int):
        db_task = (
            db.query(ProjectTask)
            .filter(ProjectTask.id == task_id, ProjectTask.project_id == project_id)
            .first()
        )
        if not db_task:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada")
        db.delete(db_task)
        db.commit()
        ProjectService._recalculate_project_progress(db, project_id)

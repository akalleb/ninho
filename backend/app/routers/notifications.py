from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import database, models
from ..core.security import get_current_user, get_current_admin_or_operational


router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"
    expires_at: datetime | None = None
    target_audience: str = "all"
    target_professional_id: int | None = None
    is_active: bool = True


class NotificationCreate(NotificationBase):
    created_by_id: int | None = None


class Notification(NotificationBase):
    id: int
    created_at: datetime
    created_by_id: int | None = None

    class Config:
        from_attributes = True


@router.post("/", response_model=Notification)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_admin_or_operational),
):
    payload = notification.model_dump()
    payload["created_by_id"] = current_user.id
    db_notification = models.Notification(**payload)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


@router.get("/", response_model=List[Notification])
def read_notifications(
    active_only: bool = False,
    target: Optional[str] = None,
    professional_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    if current_user.role == "health":
        target = "health"
        professional_id = current_user.id
    elif target is None:
        target = current_user.role

    query = db.query(models.Notification)

    if active_only:
        now = datetime.now()
        query = query.filter(models.Notification.is_active == True)
        query = query.filter(
            (models.Notification.expires_at == None) | (models.Notification.expires_at > now)
        )

    if target:
        conditions = [models.Notification.target_audience == "all", models.Notification.target_audience == target]
        if professional_id:
            conditions.append(models.Notification.target_professional_id == professional_id)
        query = query.filter(or_(*conditions))
    elif professional_id:
        query = query.filter(
            or_(
                models.Notification.target_audience == "all",
                models.Notification.target_professional_id == professional_id,
            )
        )

    return query.order_by(models.Notification.created_at.desc()).limit(limit).all()


@router.put("/{notification_id}", response_model=Notification)
def update_notification(
    notification_id: int,
    active: bool,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_admin_or_operational),
):
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_active = active
    db.commit()
    db.refresh(notification)
    return notification


@router.delete("/{notification_id}", status_code=204)
def delete_notification(
    notification_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_admin_or_operational),
):
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return None

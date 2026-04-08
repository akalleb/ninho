from typing import List, Optional
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from .. import database, models
from ..modules.children.schemas import EvolutionResponse as Evolution
from ..core.security import get_current_user, get_current_admin_or_operational


router = APIRouter(prefix="/evolutions", tags=["Evolutions"])


@router.get("/summary_by_service_type")
def get_evolutions_summary_by_service(
    months: int = 3,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_admin_or_operational),
):
    today = date.today()
    start_date = today - timedelta(days=months * 30)

    results = (
        db.query(
            models.MultidisciplinaryEvolution.service_type,
            func.count(models.MultidisciplinaryEvolution.id),
        )
        .filter(models.MultidisciplinaryEvolution.date_service >= start_date)
        .group_by(models.MultidisciplinaryEvolution.service_type)
        .all()
    )

    return [{"service": row[0], "count": row[1]} for row in results]


@router.get("/", response_model=List[Evolution])
def list_all_evolutions(
    professional_id: Optional[int] = None,
    child_id: Optional[int] = None,
    limit: int = 100,
    sort: str = "created_at_desc",
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    if current_user.role == "health":
        if professional_id and professional_id != current_user.id:
            raise HTTPException(status_code=403, detail="Acesso não autorizado")
        professional_id = current_user.id

    query = db.query(models.MultidisciplinaryEvolution).options(
        joinedload(models.MultidisciplinaryEvolution.child)
    )

    if professional_id:
        query = query.filter(models.MultidisciplinaryEvolution.professional_id == professional_id)
    if child_id:
        query = query.filter(models.MultidisciplinaryEvolution.child_id == child_id)

    if sort == "created_at_desc":
        query = query.order_by(models.MultidisciplinaryEvolution.created_at.desc())
    else:
        query = query.order_by(models.MultidisciplinaryEvolution.date_service.desc())

    return query.limit(limit).all()

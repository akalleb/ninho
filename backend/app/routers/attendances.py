from datetime import date, datetime, timezone
from typing import List, Optional
import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, field_validator

from .. import database, models
from ..modules.children.schemas import ChildResponse as Child, EvolutionResponse as Evolution, EvolutionCreate
from ..core.security import get_current_user


router = APIRouter(tags=["Attendances"], dependencies=[Depends(get_current_user)])


def apply_auto_charge_for_attendance(db: Session, attendance: models.Attendance) -> None:
    return

    # Legacy logic kept below for reference; auto-charge feature desativada
    if not attendance.wallet_id:
        return

    existing = (
        db.query(models.Expense)
        .filter(
            models.Expense.attendance_id == attendance.id,
            models.Expense.is_auto_generated == True,
        )
        .first()
    )
    if existing:
        return

    wallet = db.query(models.Wallet).filter(models.Wallet.id == attendance.wallet_id).first()
    if not wallet or not getattr(wallet, "auto_charge_enabled", False):
        return

    mode = (wallet.auto_charge_mode or "").strip()
    if not mode:
        return

    def parse_rates(value):
        if not value:
            return {}
        if isinstance(value, dict):
            return value
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, dict) else {}
            except Exception:
                return {}
        return {}

    amount = None
    if mode == "flat_per_attendance":
        amount = wallet.auto_charge_flat_amount
    elif mode == "service_type":
        rates = parse_rates(wallet.auto_charge_service_type_rates)
        evo = (
            db.query(models.MultidisciplinaryEvolution)
            .filter(models.MultidisciplinaryEvolution.attendance_id == attendance.id)
            .order_by(models.MultidisciplinaryEvolution.created_at.desc())
            .first()
        )
        service_type = evo.service_type if evo else None
        amount = rates.get(service_type) if service_type else None
        if amount is None:
            amount = wallet.auto_charge_flat_amount
    elif mode == "professional":
        rates = parse_rates(wallet.auto_charge_professional_rates)
        prof_key = str(attendance.professional_id) if attendance.professional_id else None
        amount = rates.get(prof_key) if prof_key else None
        if amount is None:
            amount = wallet.auto_charge_flat_amount
    else:
        return

    try:
        amount_value = float(amount) if amount is not None else 0.0
    except Exception:
        amount_value = 0.0
    if amount_value <= 0:
        return

    child = attendance.child or db.query(models.Child).filter(models.Child.id == attendance.child_id).first()
    professional = (
        attendance.professional
        or (
            db.query(models.Professional)
            .filter(models.Professional.id == attendance.professional_id)
            .first()
            if attendance.professional_id
            else None
        )
    )

    class SafeDict(dict):
        def __missing__(self, key):
            return ""

    template = wallet.auto_charge_expense_description or "Atendimento #{attendance_id} - {child_name}"
    description = template.format_map(
        SafeDict(
            attendance_id=attendance.id,
            child_name=getattr(child, "name", "") or "",
            professional_name=getattr(professional, "name", "") or "",
            service_type=getattr(getattr(attendance, "evolution", None), "service_type", "") or "",
            wallet_name=wallet.name or "",
        )
    )

    destination = wallet.auto_charge_expense_destination or "Atendimento"
    status = "pendente"
    paid_at = None

    db_expense = models.Expense(
        amount=amount_value,
        paid_at=paid_at,
        wallet_id=wallet.id,
        category_id=wallet.auto_charge_expense_category_id,
        destination=destination,
        description=description,
        status=status,
        attendance_id=attendance.id,
        is_auto_generated=True,
        auto_charge_mode=mode,
    )
    db.add(db_expense)


class AttendanceBase(BaseModel):
    child_id: int
    professional_id: int | None = None
    wallet_id: int | None = None
    scheduled_time: datetime | None = None
    notes: str | None = None


class AttendanceCreate(AttendanceBase):
    pass


class Attendance(AttendanceBase):
    id: int
    status: str
    check_in_time: datetime | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    child: Optional[Child] = None

    class Config:
        from_attributes = True


class AttendanceUpdate(AttendanceBase):
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None):
        if v is None:
            return v
        allowed = {"agendado", "em_espera", "em_atendimento", "finalizado", "falta"}
        if v not in allowed:
            raise ValueError("status inválido")
        return v


class AttendanceUpdateStatus(BaseModel):
    status: str
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str):
        allowed = {"agendado", "em_espera", "em_atendimento", "finalizado", "falta"}
        if v not in allowed:
            raise ValueError("status inválido")
        return v


@router.get("/attendances/", response_model=List[Attendance])
def list_attendances(
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    query = db.query(models.Attendance)
    if current_user.role == "health":
        query = query.filter(models.Attendance.professional_id == current_user.id)

    if status:
        query = query.filter(models.Attendance.status == status)
    if start_date:
        query = query.filter(func.date(models.Attendance.scheduled_time) >= start_date)
    if end_date:
        query = query.filter(func.date(models.Attendance.scheduled_time) <= end_date)

    return query.order_by(models.Attendance.scheduled_time.desc()).offset(skip).limit(limit).all()


@router.post("/attendances/", response_model=Attendance)
def create_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    if current_user.role == "health":
        if attendance.professional_id and attendance.professional_id != current_user.id:
            raise HTTPException(status_code=403, detail="Acesso não autorizado")

    status = "agendado" if attendance.scheduled_time else "em_espera"
    check_in = datetime.now(timezone.utc) if status == "em_espera" else None

    db_attendance = models.Attendance(
        child_id=attendance.child_id,
        professional_id=attendance.professional_id,
        wallet_id=attendance.wallet_id,
        scheduled_time=attendance.scheduled_time,
        check_in_time=check_in,
        status=status,
        notes=attendance.notes,
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


@router.get("/queue/", response_model=List[Attendance])
def read_queue(
    professional_id: Optional[int] = None,
    date_filter: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    if current_user.role == "health":
        if professional_id and professional_id != current_user.id:
            raise HTTPException(status_code=403, detail="Acesso não autorizado")
        query_filter = or_(
            models.Attendance.professional_id == None,
            models.Attendance.professional_id == current_user.id,
        )
    else:
        query_filter = None

    query = db.query(models.Attendance).options(
        joinedload(models.Attendance.child),
        joinedload(models.Attendance.professional),
        joinedload(models.Attendance.wallet),
    )
    if query_filter is not None:
        query = query.filter(query_filter)

    if status:
        query = query.filter(models.Attendance.status == status)
    else:
        today = date.today()
        effective_date = func.date(
            func.coalesce(
                models.Attendance.scheduled_time,
                models.Attendance.check_in_time,
                models.Attendance.start_time,
            )
        )
        query = query.filter(
            (models.Attendance.status == "em_espera")
            | ((models.Attendance.status == "agendado") & (effective_date == today))
            | ((models.Attendance.status == "em_atendimento") & (effective_date == today))
        )

    if professional_id:
        query = query.filter(models.Attendance.professional_id == professional_id)

    if date_filter:
        effective_date = func.date(
            func.coalesce(
                models.Attendance.scheduled_time,
                models.Attendance.check_in_time,
                models.Attendance.start_time,
            )
        )
        query = query.filter(effective_date == date_filter)

    effective_order = func.coalesce(
        models.Attendance.scheduled_time,
        models.Attendance.check_in_time,
        models.Attendance.start_time,
    )
    return query.order_by(effective_order.asc()).all()


@router.get("/attendances/my-day", response_model=List[Attendance])
def get_professional_daily_list(
    professional_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    if current_user.role == "health" and professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    today = date.today()
    effective_date = func.date(
        func.coalesce(
            models.Attendance.scheduled_time,
            models.Attendance.check_in_time,
            models.Attendance.start_time,
        )
    )
    effective_order = func.coalesce(
        models.Attendance.scheduled_time,
        models.Attendance.check_in_time,
        models.Attendance.start_time,
    )
    return (
        db.query(models.Attendance)
        .filter(models.Attendance.professional_id == professional_id)
        .filter(
            (models.Attendance.status == "em_espera")
            | ((models.Attendance.status == "agendado") & (effective_date == today))
            | ((models.Attendance.status == "em_atendimento") & (effective_date == today))
        )
        .order_by(effective_order.asc())
        .all()
    )


@router.put("/attendances/{attendance_id}/status", response_model=Attendance)
def update_attendance_status(
    attendance_id: int,
    status_update: AttendanceUpdateStatus,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado")
    if current_user and current_user.role == "health" and attendance.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    new_status = status_update.status
    attendance.status = new_status
    if status_update.notes:
        attendance.notes = status_update.notes

    if new_status == "em_espera" and not attendance.check_in_time:
        attendance.check_in_time = datetime.now(timezone.utc)
    elif new_status == "em_atendimento":
        attendance.start_time = datetime.now(timezone.utc)
    elif new_status == "finalizado":
        attendance.end_time = datetime.now(timezone.utc)
        apply_auto_charge_for_attendance(db, attendance)

    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("/attendances/{attendance_id}", response_model=Attendance)
def read_attendance(
    attendance_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    if current_user.role == "health":
        if attendance.professional_id != current_user.id:
            if not (attendance.professional_id is None and attendance.status == "em_espera"):
                raise HTTPException(status_code=403, detail="Acesso não autorizado")
    return attendance


@router.put("/attendances/{attendance_id}/start", response_model=Attendance)
def start_attendance(
    attendance_id: int,
    professional_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    if current_user.role == "health" and professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    if current_user.role == "health" and attendance.professional_id not in (None, current_user.id):
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    attendance.status = "em_atendimento"
    attendance.professional_id = professional_id
    attendance.start_time = datetime.now(timezone.utc)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.put("/attendances/{attendance_id}/finish", response_model=Attendance)
def finish_attendance(
    attendance_id: int,
    notes: str,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado")
    if current_user.role == "health" and attendance.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    if attendance.status != "em_atendimento":
        raise HTTPException(status_code=400, detail="Apenas atendimentos 'Em Atendimento' podem ser finalizados.")

    attendance.status = "finalizado"
    attendance.end_time = datetime.now(timezone.utc)
    attendance.notes = notes
    apply_auto_charge_for_attendance(db, attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.put("/attendances/{attendance_id}", response_model=Attendance)
def update_attendance(
    attendance_id: int,
    update: AttendanceUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    if current_user.role == "health" and attendance.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(attendance, key, value)

    db.commit()
    db.refresh(attendance)
    return attendance


@router.delete("/attendances/{attendance_id}", status_code=204)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    if current_user.role == "health":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    try:
        db.delete(attendance)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir este atendimento pois existem evoluções vinculadas a ele.",
        )
    return None


@router.patch("/attendances/{attendance_id}/status", response_model=Attendance)
def patch_attendance_status(
    attendance_id: int,
    status_update: AttendanceUpdateStatus,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    return update_attendance_status(attendance_id, status_update, db, current_user)


@router.post("/attendances/{attendance_id}/evolution", response_model=Evolution)
def create_attendance_evolution(
    attendance_id: int,
    evolution: EvolutionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Professional = Depends(get_current_user),
):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    if current_user.role == "health" and attendance.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    if evolution.attendance_id and evolution.attendance_id != attendance_id:
        raise HTTPException(status_code=400, detail="Attendance ID mismatch")

    if evolution.child_id != attendance.child_id:
        raise HTTPException(status_code=400, detail="Child ID mismatch with attendance")

    if attendance.status != "em_atendimento":
        raise HTTPException(
            status_code=400,
            detail="Evolução só pode ser registrada em atendimentos 'Em Atendimento'",
        )

    evolution_data = evolution.model_dump()
    evolution_data['attendance_id'] = attendance_id

    db_evo = models.MultidisciplinaryEvolution(**evolution_data)
    db.add(db_evo)
    db.commit()
    db.refresh(db_evo)
    return db_evo

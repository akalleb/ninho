from datetime import date, datetime, timedelta
from typing import List, Optional
import os

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, computed_field, field_validator

from .. import database, models
from ..core.security import encrypt_data, decrypt_data
from ..core.config import MEDIA_ROOT
from ..utils.uploads import save_upload


router = APIRouter(prefix="/children", tags=["Children"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ChildBase(BaseModel):
    name: str
    birth_date: datetime
    gender: str | None = None
    guardian_name: str | None = None
    family_id: str | None = None
    blood_type: str | None = None
    emergency_contact: str | None = None
    diagnosis: str | None = None
    is_diagnosis_closed: bool = False
    severity_level: str | None = None
    assistance_needs: str | None = None
    has_medical_report: bool = False
    allergies: str | None = None
    gestational_history: str | None = None
    weight: float | None = None
    height: float | None = None
    cephalic_perimeter: float | None = None
    current_school: str | None = None
    current_year: str | None = None
    service_shift: str | None = None
    has_access_treatment: bool = True
    difficulty_reason: str | None = None
    notes: str | None = None


class ChildCreate(ChildBase):
    pass


class Child(ChildBase):
    id: int
    created_at: datetime
    report_url: str | None = None
    child_id_url: str | None = None
    vaccination_card_url: str | None = None
    school_history_url: str | None = None

    @field_validator(
        "diagnosis",
        "allergies",
        "gestational_history",
        "notes",
        "emergency_contact",
        mode="before",
    )
    @classmethod
    def decrypt_sensitive_data(cls, v):
        return decrypt_data(v) if v else None

    class Config:
        from_attributes = True


class ChildMedicationBase(BaseModel):
    med_name: str
    dosage: str | None = None
    schedule: str | None = None
    frequency: str | None = None
    status: str = "continuo"
    child_id: int


class ChildMedicationCreate(ChildMedicationBase):
    pass


class ChildMedicationUpdate(BaseModel):
    med_name: str | None = None
    dosage: str | None = None
    schedule: str | None = None
    frequency: str | None = None
    status: str | None = None


class ChildMedication(ChildMedicationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class EvolutionBase(BaseModel):
    child_id: int
    professional_id: int | None = None
    attendance_id: int | None = None
    service_type: str
    evolution_report: str
    intermittences: str | None = None
    protocol_scores: str | None = None


class EvolutionCreate(EvolutionBase):
    pass


class Evolution(EvolutionBase):
    id: int
    date_service: datetime
    created_at: datetime
    child: Optional[Child] = None

    class Config:
        from_attributes = True


@router.get("/count")
def count_children(db: Session = Depends(get_db)):
    return {"count": db.query(models.Child).count()}


@router.get("/summary_by_severity_level")
def get_children_summary_by_severity(db: Session = Depends(get_db)):
    results = (
        db.query(models.Child.severity_level, models.func.count(models.Child.id))
        .group_by(models.Child.severity_level)
        .all()
    )
    return [{"severity": row[0] or "Não informado", "count": row[1]} for row in results]


@router.post("/", response_model=Child)
def create_child(child: ChildCreate, db: Session = Depends(get_db)):
    child_data = child.model_dump()
    child_data["emergency_contact"] = encrypt_data(child.emergency_contact) if child.emergency_contact else None
    child_data["diagnosis"] = encrypt_data(child.diagnosis) if child.diagnosis else None
    child_data["allergies"] = encrypt_data(child.allergies) if child.allergies else None
    child_data["gestational_history"] = encrypt_data(child.gestational_history) if child.gestational_history else None
    child_data["notes"] = encrypt_data(child.notes) if child.notes else None

    db_child = models.Child(**child_data)
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child


@router.get("/", response_model=List[Child])
def read_children(
    family_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Child)

    if family_id:
        query = query.filter(models.Child.family_id == family_id)

    if search:
        query = query.filter(models.Child.name.ilike(f"%{search}%"))

    return query.offset(skip).limit(limit).all()


@router.get("/{child_id}", response_model=Child)
def read_child(child_id: int, db: Session = Depends(get_db)):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Criança não encontrada")
    return child


@router.put("/{child_id}", response_model=Child)
def update_child(child_id: int, child_update: ChildCreate, db: Session = Depends(get_db)):
    db_child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not db_child:
        raise HTTPException(status_code=404, detail="Criança não encontrada")

    update_data = child_update.model_dump(exclude_unset=True)

    if "emergency_contact" in update_data and update_data["emergency_contact"]:
        update_data["emergency_contact"] = encrypt_data(update_data["emergency_contact"])

    if "diagnosis" in update_data and update_data["diagnosis"]:
        update_data["diagnosis"] = encrypt_data(update_data["diagnosis"])

    if "allergies" in update_data and update_data["allergies"]:
        update_data["allergies"] = encrypt_data(update_data["allergies"])

    if "gestational_history" in update_data and update_data["gestational_history"]:
        update_data["gestational_history"] = encrypt_data(update_data["gestational_history"])

    if "notes" in update_data and update_data["notes"]:
        update_data["notes"] = encrypt_data(update_data["notes"])

    for key, value in update_data.items():
        setattr(db_child, key, value)

    db.commit()
    db.refresh(db_child)
    return db_child


@router.post("/{child_id}/docs")
async def upload_child_doc(
    child_id: int,
    doc_type: str = Query(..., enum=["report", "child_id", "vaccination", "school"]),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Criança não encontrada")

    docs_dir = os.path.join(MEDIA_ROOT, "children")
    filename = await save_upload(
        file,
        docs_dir,
        f"{child_id}_{doc_type}",
        5 * 1024 * 1024,
        {"image/png", "image/jpeg", "application/pdf"},
    )

    public_url = f"/media/children/{filename}"

    if doc_type == "report":
        child.report_url = public_url
    elif doc_type == "child_id":
        child.child_id_url = public_url
    elif doc_type == "vaccination":
        child.vaccination_card_url = public_url
    elif doc_type == "school":
        child.school_history_url = public_url

    db.commit()
    return {"url": public_url, "type": doc_type}


@router.post("/{child_id}/medications", response_model=ChildMedication)
def add_medication(child_id: int, med: ChildMedicationCreate, db: Session = Depends(get_db)):
    db_med = models.ChildMedication(**med.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med


@router.get("/{child_id}/medications", response_model=List[ChildMedication])
def get_medications(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.ChildMedication).filter(models.ChildMedication.child_id == child_id).all()


@router.put("/medications/{med_id}", response_model=ChildMedication)
def update_medication(med_id: int, med_update: ChildMedicationUpdate, db: Session = Depends(get_db)):
    med = db.query(models.ChildMedication).filter(models.ChildMedication.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")
    update_data = med_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(med, key, value)
    db.commit()
    db.refresh(med)
    return med


@router.delete("/medications/{med_id}", status_code=204)
def delete_medication(med_id: int, db: Session = Depends(get_db)):
    med = db.query(models.ChildMedication).filter(models.ChildMedication.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")
    try:
        db.delete(med)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro de integridade ao excluir medicação.")
    return None


@router.post("/{child_id}/evolutions", response_model=Evolution)
def add_evolution(child_id: int, evo: EvolutionCreate, db: Session = Depends(get_db)):
    if evo.attendance_id:
        attendance = db.query(models.Attendance).filter(models.Attendance.id == evo.attendance_id).first()
        if not attendance:
            raise HTTPException(status_code=404, detail="Attendance not found")
        if attendance.status != "em_atendimento":
            raise HTTPException(
                status_code=400,
                detail="Evolução só pode ser registrada em atendimentos 'Em Atendimento'",
            )

    db_evo = models.MultidisciplinaryEvolution(**evo.model_dump())
    db.add(db_evo)
    db.commit()
    db.refresh(db_evo)
    return db_evo


@router.get("/{child_id}/evolutions", response_model=List[Evolution])
def get_evolutions(child_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.MultidisciplinaryEvolution)
        .filter(models.MultidisciplinaryEvolution.child_id == child_id)
        .order_by(models.MultidisciplinaryEvolution.date_service.desc())
        .all()
    )


@router.get("/evolutions", response_model=List[Evolution])
def list_all_evolutions(
    professional_id: Optional[int] = None,
    child_id: Optional[int] = None,
    limit: int = 100,
    sort: str = "created_at_desc",
    db: Session = Depends(get_db),
):
    query = db.query(models.MultidisciplinaryEvolution).options(joinedload(models.MultidisciplinaryEvolution.child))

    if professional_id:
        query = query.filter(models.MultidisciplinaryEvolution.professional_id == professional_id)
    if child_id:
        query = query.filter(models.MultidisciplinaryEvolution.child_id == child_id)

    if sort == "created_at_desc":
        query = query.order_by(models.MultidisciplinaryEvolution.created_at.desc())
    else:
        query = query.order_by(models.MultidisciplinaryEvolution.date_service.desc())

    return query.limit(limit).all()


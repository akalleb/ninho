from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, UploadFile
import os
from ...core.security import encrypt_data
from ...core.config import MEDIA_ROOT
from ...utils.uploads import save_upload
from .models import Child, ChildMedication, MultidisciplinaryEvolution, HealthReferral
from ...models import Attendance # Keep importing Attendance from main models
from .schemas import ChildCreate, ChildMedicationCreate, ChildMedicationUpdate, EvolutionCreate

class ChildService:
    @staticmethod
    def create(db: Session, child: ChildCreate) -> Child:
        child_data = child.model_dump()
        child_data["emergency_contact"] = encrypt_data(child.emergency_contact) if child.emergency_contact else None
        child_data["diagnosis"] = encrypt_data(child.diagnosis) if child.diagnosis else None
        child_data["allergies"] = encrypt_data(child.allergies) if child.allergies else None
        child_data["gestational_history"] = encrypt_data(child.gestational_history) if child.gestational_history else None
        child_data["notes"] = encrypt_data(child.notes) if child.notes else None

        db_child = Child(**child_data)
        db.add(db_child)
        db.commit()
        db.refresh(db_child)
        return db_child

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100, family_id: str = None, search: str = None):
        query = db.query(Child)

        if family_id:
            query = query.filter(Child.family_id == family_id)

        if search:
            query = query.filter(Child.name.ilike(f"%{search}%"))

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, child_id: int) -> Child:
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            raise HTTPException(status_code=404, detail="Criança não encontrada")
        return child

    @staticmethod
    def update(db: Session, child_id: int, child_update: ChildCreate) -> Child:
        db_child = ChildService.get_by_id(db, child_id)

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

    @staticmethod
    async def upload_doc(db: Session, child_id: int, doc_type: str, file: UploadFile):
        child = ChildService.get_by_id(db, child_id)

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

    # Medications
    @staticmethod
    def add_medication(db: Session, child_id: int, med: ChildMedicationCreate):
        db_med = ChildMedication(**med.model_dump())
        db.add(db_med)
        db.commit()
        db.refresh(db_med)
        return db_med

    @staticmethod
    def get_medications(db: Session, child_id: int):
        return db.query(ChildMedication).filter(ChildMedication.child_id == child_id).all()

    @staticmethod
    def update_medication(db: Session, med_id: int, med_update: ChildMedicationUpdate):
        med = db.query(ChildMedication).filter(ChildMedication.id == med_id).first()
        if not med:
            raise HTTPException(status_code=404, detail="Medicação não encontrada")
        update_data = med_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(med, key, value)
        db.commit()
        db.refresh(med)
        return med

    @staticmethod
    def delete_medication(db: Session, med_id: int):
        med = db.query(ChildMedication).filter(ChildMedication.id == med_id).first()
        if not med:
            raise HTTPException(status_code=404, detail="Medicação não encontrada")
        try:
            db.delete(med)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Erro de integridade ao excluir medicação.")

    # Evolutions
    @staticmethod
    def add_evolution(db: Session, child_id: int, evo: EvolutionCreate):
        if evo.attendance_id:
            attendance = db.query(Attendance).filter(Attendance.id == evo.attendance_id).first()
            if not attendance:
                raise HTTPException(status_code=404, detail="Attendance not found")
            if attendance.status != "em_atendimento":
                raise HTTPException(
                    status_code=400,
                    detail="Evolução só pode ser registrada em atendimentos 'Em Atendimento'",
                )

        db_evo = MultidisciplinaryEvolution(**evo.model_dump())
        db.add(db_evo)
        db.commit()
        db.refresh(db_evo)
        return db_evo

    @staticmethod
    def get_evolutions(db: Session, child_id: int):
        return (
            db.query(MultidisciplinaryEvolution)
            .filter(MultidisciplinaryEvolution.child_id == child_id)
            .order_by(MultidisciplinaryEvolution.date_service.desc())
            .all()
        )
    
    @staticmethod
    def list_all_evolutions(db: Session, professional_id: int = None, child_id: int = None, limit: int = 100, sort: str = "created_at_desc"):
        query = db.query(MultidisciplinaryEvolution).options(joinedload(MultidisciplinaryEvolution.child))

        if professional_id:
            query = query.filter(MultidisciplinaryEvolution.professional_id == professional_id)
        if child_id:
            query = query.filter(MultidisciplinaryEvolution.child_id == child_id)

        if sort == "created_at_desc":
            query = query.order_by(MultidisciplinaryEvolution.created_at.desc())
        else:
            query = query.order_by(MultidisciplinaryEvolution.date_service.desc())

        return query.limit(limit).all()

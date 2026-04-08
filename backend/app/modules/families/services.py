import uuid
from typing import List
import re
import os
import time
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, UploadFile
from ...core.security import encrypt_data, get_data_hash
from ...core.config import MEDIA_ROOT
from ..children.models import Child, ChildMedication, MultidisciplinaryEvolution, HealthReferral
from ...models import Attendance # From main models as it's not moved yet
from ..finances.models import Expense
from .models import Family, FamilyAssistance, Group, family_groups
from .schemas import FamilyCreate, FamilyUpdate, FamilyAssistanceCreate, GroupCreate, BulkAssistanceRequest
from ..professionals.models import Professional

class FamilyService:
    @staticmethod
    def create(db: Session, family: FamilyCreate) -> Family:
        normalized_cpf = re.sub(r"\D", "", family.cpf or "")
        cpf_hash_normalized = get_data_hash(normalized_cpf)
        cpf_hash_raw = get_data_hash(family.cpf)

        existing = (
            db.query(Family)
            .filter(Family.cpf_hash.in_([cpf_hash_normalized, cpf_hash_raw]))
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="CPF do responsável já cadastrado")

        family_data = family.model_dump()
        family_data.pop("nis_family", None)
        family_data["cpf"] = encrypt_data(family.cpf)
        family_data["cpf_hash"] = cpf_hash_normalized
        family_data["rg"] = encrypt_data(family.rg) if family.rg else None
        family_data["rg_hash"] = get_data_hash(family.rg) if family.rg else None
        family_data["nis_responsible"] = encrypt_data(family.nis_responsible) if family.nis_responsible else None
        family_data["address_full"] = encrypt_data(family.address_full) if family.address_full else None
        family_data["phone"] = encrypt_data(family.phone) if family.phone else None
        family_data["email"] = encrypt_data(family.email) if family.email else None
        family_data["family_observations"] = encrypt_data(family.family_observations) if family.family_observations else None

        db_family = Family(id=str(uuid.uuid4()), **family_data)
        db.add(db_family)
        db.commit()
        db.refresh(db_family)
        return db_family

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100, neighborhood: str = None, vulnerability: str = None, search: str = None):
        query = db.query(Family)

        if neighborhood:
            query = query.filter(Family.neighborhood == neighborhood)

        if vulnerability:
            query = query.filter(Family.vulnerability_status == vulnerability)

        if search:
            query = query.filter(
                (Family.name_responsible.ilike(f"%{search}%"))
                | (Family.cpf.ilike(f"%{search}%"))
            )

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, family_id: str) -> Family:
        family = db.query(Family).filter(Family.id == family_id).first()
        if not family:
            raise HTTPException(status_code=404, detail="Família não encontrada")
        return family

    @staticmethod
    def update(db: Session, family_id: str, family_update: FamilyUpdate) -> Family:
        db_family = FamilyService.get_by_id(db, family_id)

        update_data = family_update.model_dump(exclude_unset=True)
        update_data.pop("nis_family", None)

        if "cpf" in update_data:
            normalized_cpf = re.sub(r"\D", "", update_data["cpf"] or "")
            cpf_hash_normalized = get_data_hash(normalized_cpf)
            cpf_hash_raw = get_data_hash(update_data["cpf"])

            existing = (
                db.query(Family)
                .filter(
                    Family.id != family_id,
                    Family.cpf_hash.in_([cpf_hash_normalized, cpf_hash_raw]),
                )
                .first()
            )
            if existing:
                raise HTTPException(
                    status_code=400, detail="CPF do responsável já cadastrado em outra família"
                )

            update_data["cpf_hash"] = cpf_hash_normalized
            update_data["cpf"] = encrypt_data(update_data["cpf"])

        if "rg" in update_data and update_data["rg"]:
            update_data["rg_hash"] = get_data_hash(update_data["rg"])
            update_data["rg"] = encrypt_data(update_data["rg"])

        if "nis_responsible" in update_data and update_data["nis_responsible"]:
            update_data["nis_responsible"] = encrypt_data(update_data["nis_responsible"])

        if "address_full" in update_data and update_data["address_full"]:
            update_data["address_full"] = encrypt_data(update_data["address_full"])

        if "phone" in update_data and update_data["phone"]:
            update_data["phone"] = encrypt_data(update_data["phone"])

        if "email" in update_data and update_data["email"]:
            update_data["email"] = encrypt_data(update_data["email"])

        if "family_observations" in update_data and update_data["family_observations"]:
            update_data["family_observations"] = encrypt_data(update_data["family_observations"])

        for key, value in update_data.items():
            setattr(db_family, key, value)

        db.commit()
        db.refresh(db_family)
        return db_family

    @staticmethod
    def delete(db: Session, family_id: str, force: bool = False):
        db_family = FamilyService.get_by_id(db, family_id)

        try:
            if force:
                children = db.query(Child).filter(Child.family_id == family_id).all()

                for child in children:
                    # 1. Delete medications
                    db.query(ChildMedication).filter(ChildMedication.child_id == child.id).delete()
                    
                    # 2. Delete referrals
                    db.query(HealthReferral).filter(HealthReferral.child_id == child.id).delete()
                    
                    # 3. Delete evolutions linked to this child
                    db.query(MultidisciplinaryEvolution).filter(
                        MultidisciplinaryEvolution.child_id == child.id
                    ).delete()
                    
                    # 4. Delete expenses linked to this child's attendances
                    child_attendance_ids = [a.id for a in db.query(Attendance.id).filter(Attendance.child_id == child.id).all()]
                    if child_attendance_ids:
                        db.query(Expense).filter(Expense.attendance_id.in_(child_attendance_ids)).delete(synchronize_session=False)

                    # 5. Delete attendances
                    db.query(Attendance).filter(Attendance.child_id == child.id).delete()
                    
                    # 6. Delete the child
                    db.delete(child)

                # 7. Delete assistance history
                db.query(FamilyAssistance).filter(FamilyAssistance.family_id == family_id).delete()

                db.delete(db_family)
                db.commit()
            else:
                db.delete(db_family)
                db.commit()

        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail="Não é possível excluir esta família pois existem registros dependentes. Use a exclusão forçada para remover tudo.",
            )
    
    @staticmethod
    def create_assistance(db: Session, family_id: str, assistance: FamilyAssistanceCreate) -> FamilyAssistance:
        FamilyService.get_by_id(db, family_id) # Ensure family exists
        
        db_assistance = FamilyAssistance(
            family_id=family_id,
            **assistance.model_dump()
        )
        db.add(db_assistance)
        db.commit()
        db.refresh(db_assistance)
        return db_assistance

    @staticmethod
    def get_family_history(db: Session, family_id: str):
        # Join with Professional to get the name
        results = db.query(
            FamilyAssistance,
            Professional.name.label("professional_name")
        ).outerjoin(
            Professional, FamilyAssistance.professional_id == Professional.id
        ).filter(
            FamilyAssistance.family_id == family_id
        ).order_by(
            FamilyAssistance.date_provided.desc()
        ).all()

        history = []
        for assistance, prof_name in results:
            # Add virtual field for pydantic response
            assistance.professional_name = prof_name
            history.append(assistance)
        
        return history
    
    @staticmethod
    def bulk_add_assistance(db: Session, request: BulkAssistanceRequest):
        new_records = []
        for family_id in request.family_ids:
            db_assistance = FamilyAssistance(
                family_id=family_id,
                **request.assistance.model_dump()
            )
            db.add(db_assistance)
            new_records.append(db_assistance)
        
        db.commit()
        return {"count": len(new_records)}
    
    @staticmethod
    async def upload_doc(db: Session, family_id: str, doc_type: str, file: UploadFile):
        family = FamilyService.get_by_id(db, family_id)
        
        docs_dir = os.path.join(MEDIA_ROOT, "families")
        os.makedirs(docs_dir, exist_ok=True)

        filename = f"{family_id}_{doc_type}_{int(time.time())}_{file.filename}"
        file_path = os.path.join(docs_dir, filename)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        public_url = f"/media/families/{filename}"

        if doc_type == "residence":
            family.residence_proof_url = public_url
        elif doc_type == "income":
            family.income_proof_url = public_url
        elif doc_type == "vaccination":
            family.vaccination_card_url = public_url
        elif doc_type == "others":
            family.others_docs_url = public_url

        db.commit()
        return {"url": public_url, "type": doc_type}

class GroupService:
    @staticmethod
    def create_group(db: Session, group_in: GroupCreate) -> Group:
        db_group = Group(**group_in.model_dump())
        db.add(db_group)
        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def list_groups(db: Session) -> List[Group]:
        return db.query(Group).all()

    @staticmethod
    def get_group(db: Session, group_id: int) -> Group:
        group = db.query(Group).filter(Group.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Grupo não encontrado")
        return group

    @staticmethod
    def add_family_to_group(db: Session, group_id: int, family_id: str):
        group = GroupService.get_group(db, group_id)
        family = FamilyService.get_by_id(db, family_id)
        
        # Check if already in group
        exists = db.query(family_groups).filter_by(family_id=family_id, group_id=group_id).first()
        if not exists:
            stmt = family_groups.insert().values(family_id=family_id, group_id=group_id)
            db.execute(stmt)
            db.commit()
        return {"message": "Família adicionada ao grupo com sucesso"}

    @staticmethod
    def remove_family_from_group(db: Session, group_id: int, family_id: str):
        stmt = family_groups.delete().where(
            family_groups.c.family_id == family_id,
            family_groups.c.group_id == group_id
        )
        db.execute(stmt)
        db.commit()
        return {"message": "Família removida do grupo com sucesso"}

    @staticmethod
    def get_group_families(db: Session, group_id: int) -> List[Family]:
        group = GroupService.get_group(db, group_id)
        return group.families

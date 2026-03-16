import uuid
import re
import os
import time
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, UploadFile
from ...core.security import encrypt_data, get_data_hash
from ...core.config import MEDIA_ROOT
from .models import Family
from ..children.models import Child, ChildMedication, MultidisciplinaryEvolution
from ...models import Attendance # From main models as it's not moved yet
from .schemas import FamilyCreate, FamilyUpdate

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
                    db.query(ChildMedication).filter(ChildMedication.child_id == child.id).delete()
                    db.query(MultidisciplinaryEvolution).filter(
                        MultidisciplinaryEvolution.child_id == child.id
                    ).delete()
                    db.query(Attendance).filter(Attendance.child_id == child.id).delete()
                    db.delete(child)

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

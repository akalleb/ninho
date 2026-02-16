from datetime import date, datetime
from typing import List, Optional
import os
import time
import uuid
import re

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel, computed_field, field_validator

from .. import database, models
from ..core.security import encrypt_data, decrypt_data, get_data_hash
from ..core.config import MEDIA_ROOT


router = APIRouter(prefix="/families", tags=["Families"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


class FamilyBase(BaseModel):
    name_responsible: str
    nis_family: str | None = None
    rg: str | None = None
    cpf: str
    nis_responsible: str | None = None
    birth_date: date | None = None
    gender: str | None = None
    nationality: str | None = "Brasileira"
    marital_status: str | None = None
    profession: str | None = None
    address_full: str | None = None
    neighborhood: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    reference_point: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    is_whatsapp: bool = False
    email: str | None = None
    composition_familiar: str | None = None
    monthly_income: float = 0.0
    dependents_count: int = 0
    vulnerability_status: str | None = "baixa_renda"
    housing_conditions: str | None = None
    assistance_status: str | None = "active"
    family_observations: str | None = None
    residence_proof_url: str | None = None
    income_proof_url: str | None = None
    vaccination_card_url: str | None = None
    others_docs_url: str | None = None


class FamilyCreate(FamilyBase):
    pass


class FamilyUpdate(FamilyBase):
    pass


class Family(FamilyBase):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

    @field_validator(
        "cpf",
        "rg",
        "nis_responsible",
        "address_full",
        "phone",
        "email",
        "family_observations",
        mode="before",
    )
    @classmethod
    def decrypt_sensitive_data(cls, v):
        return decrypt_data(v) if v else None

    @computed_field
    @property
    def per_capita_income(self) -> float:
        total_members = 1 + (self.dependents_count or 0)
        return self.monthly_income / total_members if total_members > 0 else 0

    class Config:
        from_attributes = True


@router.post("/", response_model=Family)
def create_family(family: FamilyCreate, db: Session = Depends(get_db)):
    normalized_cpf = re.sub(r"\D", "", family.cpf or "")
    cpf_hash_normalized = get_data_hash(normalized_cpf)
    cpf_hash_raw = get_data_hash(family.cpf)

    existing = (
        db.query(models.Family)
        .filter(models.Family.cpf_hash.in_([cpf_hash_normalized, cpf_hash_raw]))
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

    db_family = models.Family(id=str(uuid.uuid4()), **family_data)
    db.add(db_family)
    db.commit()
    db.refresh(db_family)
    return db_family


@router.get("/count")
def count_families(db: Session = Depends(get_db)):
    return {"count": db.query(models.Family).count()}


@router.get("/", response_model=List[Family])
def read_families(
    neighborhood: Optional[str] = None,
    vulnerability: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Family)

    if neighborhood:
        query = query.filter(models.Family.neighborhood == neighborhood)

    if vulnerability:
        query = query.filter(models.Family.vulnerability_status == vulnerability)

    if search:
        query = query.filter(
            (models.Family.name_responsible.ilike(f"%{search}%"))
            | (models.Family.cpf.ilike(f"%{search}%"))
        )

    return query.offset(skip).limit(limit).all()


@router.get("/{family_id}", response_model=Family)
def read_family(family_id: str, db: Session = Depends(get_db)):
    family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Família não encontrada")
    return family


@router.put("/{family_id}", response_model=Family)
def update_family(family_id: str, family_update: FamilyUpdate, db: Session = Depends(get_db)):
    db_family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not db_family:
        raise HTTPException(status_code=404, detail="Família não encontrada")

    update_data = family_update.model_dump(exclude_unset=True)
    update_data.pop("nis_family", None)

    if "cpf" in update_data:
        normalized_cpf = re.sub(r"\D", "", update_data["cpf"] or "")
        cpf_hash_normalized = get_data_hash(normalized_cpf)
        cpf_hash_raw = get_data_hash(update_data["cpf"])

        existing = (
            db.query(models.Family)
            .filter(
                models.Family.id != family_id,
                models.Family.cpf_hash.in_([cpf_hash_normalized, cpf_hash_raw]),
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


@router.delete("/{family_id}", status_code=204)
def delete_family(
    family_id: str,
    force: bool = Query(False),
    db: Session = Depends(get_db),
):
    db_family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not db_family:
        raise HTTPException(status_code=404, detail="Família não encontrada")

    try:
        if force:
            children = db.query(models.Child).filter(models.Child.family_id == family_id).all()

            for child in children:
                db.query(models.ChildMedication).filter(models.ChildMedication.child_id == child.id).delete()
                db.query(models.MultidisciplinaryEvolution).filter(
                    models.MultidisciplinaryEvolution.child_id == child.id
                ).delete()
                db.query(models.Attendance).filter(models.Attendance.child_id == child.id).delete()
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
    return None


@router.post("/{family_id}/docs")
async def upload_family_doc(
    family_id: str,
    doc_type: str = Query(..., enum=["residence", "income", "vaccination", "others"]),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Família não encontrada")

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

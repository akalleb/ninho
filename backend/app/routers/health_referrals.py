from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, field_validator
from .. import database, models
from ..core.security import get_current_user, get_current_admin_or_operational

router = APIRouter(prefix="/health-referrals", tags=["Health Referrals"], dependencies=[Depends(get_current_user)])

# Pydantic Models
class HealthReferralBase(BaseModel):
    child_id: int
    specialty: str
    professional_name: Optional[str] = None
    referral_date: date
    status: str = "pending"
    priority: str = "medium"
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "scheduled", "completed", "canceled"}
        if v not in allowed:
            raise ValueError("status inválido")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        allowed = {"low", "medium", "high"}
        if v not in allowed:
            raise ValueError("priority inválido")
        return v

class HealthReferralCreate(HealthReferralBase):
    pass

class HealthReferralUpdate(BaseModel):
    specialty: Optional[str] = None
    professional_name: Optional[str] = None
    referral_date: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is None:
            return v
        allowed = {"pending", "scheduled", "completed", "canceled"}
        if v not in allowed:
            raise ValueError("status inválido")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str | None) -> str | None:
        if v is None:
            return v
        allowed = {"low", "medium", "high"}
        if v not in allowed:
            raise ValueError("priority inválido")
        return v

class HealthReferral(HealthReferralBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Routes

@router.post("/", response_model=HealthReferral)
def create_referral(referral: HealthReferralCreate, db: Session = Depends(database.get_db)):
    # Verify child exists
    child = db.query(models.Child).filter(models.Child.id == referral.child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Criança não encontrada")
    
    db_referral = models.HealthReferral(**referral.model_dump())
    db.add(db_referral)
    db.commit()
    db.refresh(db_referral)
    return db_referral

@router.get("/", response_model=List[HealthReferral])
def list_referrals(
    child_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
):
    query = db.query(models.HealthReferral)
    if child_id:
        query = query.filter(models.HealthReferral.child_id == child_id)
    if status:
        query = query.filter(models.HealthReferral.status == status)
    
    return query.order_by(models.HealthReferral.referral_date.desc()).offset(skip).limit(limit).all()

@router.get("/{referral_id}", response_model=HealthReferral)
def get_referral(referral_id: int, db: Session = Depends(database.get_db)):
    referral = db.query(models.HealthReferral).filter(models.HealthReferral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Encaminhamento não encontrado")
    return referral

@router.put("/{referral_id}", response_model=HealthReferral)
def update_referral(referral_id: int, update_data: HealthReferralUpdate, db: Session = Depends(database.get_db)):
    referral = db.query(models.HealthReferral).filter(models.HealthReferral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Encaminhamento não encontrado")
    
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(referral, key, value)
    
    db.commit()
    db.refresh(referral)
    return referral

@router.delete("/{referral_id}", status_code=204)
def delete_referral(
    referral_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    referral = db.query(models.HealthReferral).filter(models.HealthReferral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Encaminhamento não encontrado")
    
    db.delete(referral)
    db.commit()
    return None

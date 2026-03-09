from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel
from .. import database, models

router = APIRouter(prefix="/health-referrals", tags=["Health Referrals"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models
class HealthReferralBase(BaseModel):
    child_id: int
    specialty: str
    professional_name: Optional[str] = None
    referral_date: date
    status: str = "pending"
    priority: str = "medium"
    notes: Optional[str] = None

class HealthReferralCreate(HealthReferralBase):
    pass

class HealthReferralUpdate(BaseModel):
    specialty: Optional[str] = None
    professional_name: Optional[str] = None
    referral_date: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

class HealthReferral(HealthReferralBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Routes

@router.post("/", response_model=HealthReferral)
def create_referral(referral: HealthReferralCreate, db: Session = Depends(get_db)):
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
    db: Session = Depends(get_db)
):
    query = db.query(models.HealthReferral)
    if child_id:
        query = query.filter(models.HealthReferral.child_id == child_id)
    if status:
        query = query.filter(models.HealthReferral.status == status)
    
    return query.order_by(models.HealthReferral.referral_date.desc()).offset(skip).limit(limit).all()

@router.get("/{referral_id}", response_model=HealthReferral)
def get_referral(referral_id: int, db: Session = Depends(get_db)):
    referral = db.query(models.HealthReferral).filter(models.HealthReferral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Encaminhamento não encontrado")
    return referral

@router.put("/{referral_id}", response_model=HealthReferral)
def update_referral(referral_id: int, update_data: HealthReferralUpdate, db: Session = Depends(get_db)):
    referral = db.query(models.HealthReferral).filter(models.HealthReferral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Encaminhamento não encontrado")
    
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(referral, key, value)
    
    db.commit()
    db.refresh(referral)
    return referral

@router.delete("/{referral_id}", status_code=204)
def delete_referral(referral_id: int, db: Session = Depends(get_db)):
    referral = db.query(models.HealthReferral).filter(models.HealthReferral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Encaminhamento não encontrado")
    
    db.delete(referral)
    db.commit()
    return None

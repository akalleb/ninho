from typing import List, Optional
from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.orm import Session
from ...database import SessionLocal
from .schemas import FamilyCreate, FamilyUpdate, FamilyResponse
from .services import FamilyService

router = APIRouter(prefix="/families", tags=["Families"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=FamilyResponse)
def create_family(family: FamilyCreate, db: Session = Depends(get_db)):
    return FamilyService.create(db, family)

@router.get("/count")
def count_families(db: Session = Depends(get_db)):
    # This was a simple query in original, could be in service too but fine here for now
    from .models import Family
    return {"count": db.query(Family).count()}

@router.get("/", response_model=List[FamilyResponse])
def read_families(
    neighborhood: Optional[str] = None,
    vulnerability: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return FamilyService.get_all(db, skip, limit, neighborhood, vulnerability, search)

@router.get("/{family_id}", response_model=FamilyResponse)
def read_family(family_id: str, db: Session = Depends(get_db)):
    return FamilyService.get_by_id(db, family_id)

@router.put("/{family_id}", response_model=FamilyResponse)
def update_family(family_id: str, family_update: FamilyUpdate, db: Session = Depends(get_db)):
    return FamilyService.update(db, family_id, family_update)

@router.delete("/{family_id}", status_code=204)
def delete_family(
    family_id: str,
    force: bool = Query(False),
    db: Session = Depends(get_db),
):
    return FamilyService.delete(db, family_id, force)

@router.post("/{family_id}/docs")
async def upload_family_doc(
    family_id: str,
    doc_type: str = Query(..., enum=["residence", "income", "vaccination", "others"]),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await FamilyService.upload_doc(db, family_id, doc_type, file)

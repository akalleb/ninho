from typing import List, Optional
from fastapi import APIRouter, Depends, File, Query, UploadFile, HTTPException
from sqlalchemy.orm import Session
from ...database import SessionLocal
from .schemas import (
    ChildCreate, 
    ChildResponse, 
    ChildMedicationCreate, 
    ChildMedicationUpdate, 
    ChildMedicationResponse,
    EvolutionCreate,
    EvolutionResponse
)
from .services import ChildService
from .models import Child, MultidisciplinaryEvolution

router = APIRouter(prefix="/children", tags=["Children"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/count")
def count_children(db: Session = Depends(get_db)):
    return {"count": db.query(Child).count()}

@router.get("/summary_by_severity_level")
def get_children_summary_by_severity(db: Session = Depends(get_db)):
    from sqlalchemy import func
    results = (
        db.query(Child.severity_level, func.count(Child.id))
        .group_by(Child.severity_level)
        .all()
    )
    return [{"severity": row[0] or "Não informado", "count": row[1]} for row in results]

@router.get("/evolutions", response_model=List[EvolutionResponse])
def list_all_evolutions(
    professional_id: Optional[int] = None,
    child_id: Optional[int] = None,
    limit: int = 100,
    sort: str = "created_at_desc",
    db: Session = Depends(get_db),
):
    return ChildService.list_all_evolutions(db, professional_id, child_id, limit, sort)

@router.post("/", response_model=ChildResponse)
def create_child(child: ChildCreate, db: Session = Depends(get_db)):
    return ChildService.create(db, child)

@router.get("/", response_model=List[ChildResponse])
def read_children(
    family_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return ChildService.get_all(db, skip, limit, family_id, search)

@router.get("/{child_id}", response_model=ChildResponse)
def read_child(child_id: int, db: Session = Depends(get_db)):
    return ChildService.get_by_id(db, child_id)

@router.put("/{child_id}", response_model=ChildResponse)
def update_child(child_id: int, child_update: ChildCreate, db: Session = Depends(get_db)):
    return ChildService.update(db, child_id, child_update)

@router.post("/{child_id}/docs")
async def upload_child_doc(
    child_id: int,
    doc_type: str = Query(..., enum=["report", "child_id", "vaccination", "school"]),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await ChildService.upload_doc(db, child_id, doc_type, file)

@router.post("/{child_id}/medications", response_model=ChildMedicationResponse)
def add_medication(child_id: int, med: ChildMedicationCreate, db: Session = Depends(get_db)):
    return ChildService.add_medication(db, child_id, med)

@router.get("/{child_id}/medications", response_model=List[ChildMedicationResponse])
def get_medications(child_id: int, db: Session = Depends(get_db)):
    return ChildService.get_medications(db, child_id)

@router.put("/medications/{med_id}", response_model=ChildMedicationResponse)
def update_medication(med_id: int, med_update: ChildMedicationUpdate, db: Session = Depends(get_db)):
    return ChildService.update_medication(db, med_id, med_update)

@router.delete("/medications/{med_id}", status_code=204)
def delete_medication(med_id: int, db: Session = Depends(get_db)):
    return ChildService.delete_medication(db, med_id)

@router.post("/{child_id}/evolutions", response_model=EvolutionResponse)
def add_evolution(child_id: int, evo: EvolutionCreate, db: Session = Depends(get_db)):
    return ChildService.add_evolution(db, child_id, evo)

@router.get("/{child_id}/evolutions", response_model=List[EvolutionResponse])
def get_evolutions(child_id: int, db: Session = Depends(get_db)):
    return ChildService.get_evolutions(db, child_id)

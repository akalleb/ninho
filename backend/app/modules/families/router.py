from typing import List, Optional
from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.orm import Session
from ... import database
from ...core.security import get_current_user, get_current_admin_or_operational
from .schemas import (
    FamilyCreate, FamilyUpdate, FamilyResponse, 
    FamilyAssistanceCreate, FamilyAssistanceResponse,
    GroupCreate, GroupResponse, BulkAssistanceRequest
)
from .services import FamilyService, GroupService

router = APIRouter(prefix="/families", tags=["Families"], dependencies=[Depends(get_current_user)])

@router.post("/", response_model=FamilyResponse)
def create_family(
    family: FamilyCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    return FamilyService.create(db, family)

@router.get("/count")
def count_families(db: Session = Depends(database.get_db)):
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
    db: Session = Depends(database.get_db),
):
    return FamilyService.get_all(db, skip, limit, neighborhood, vulnerability, search)

@router.post("/{family_id}/docs")
async def upload_family_doc(
    family_id: str,
    doc_type: str = Query(..., enum=["residence", "income", "vaccination", "others"]),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    return await FamilyService.upload_doc(db, family_id, doc_type, file)

# Groups and Bulk Actions (Must be before path parameter routes)
@router.get("/groups", response_model=List[GroupResponse])
def list_groups(db: Session = Depends(database.get_db)):
    return GroupService.list_groups(db)

@router.post("/groups", response_model=GroupResponse)
def create_group(
    group: GroupCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    return GroupService.create_group(db, group)

@router.post("/bulk-assistance")
def bulk_add_assistance(
    request: BulkAssistanceRequest,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    # Set professional_id from current_user if not provided
    if not request.assistance.professional_id and hasattr(current_user, 'id'):
        request.assistance.professional_id = current_user.id
    
    return FamilyService.bulk_add_assistance(db, request)

@router.get("/groups/{group_id}/families", response_model=List[FamilyResponse])
def get_group_families(group_id: int, db: Session = Depends(database.get_db)):
    families = GroupService.get_group_families(db, group_id)
    return families

@router.post("/groups/{group_id}/families/{family_id}")
def add_family_to_group(
    group_id: int,
    family_id: str,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    return GroupService.add_family_to_group(db, group_id, family_id)

@router.delete("/groups/{group_id}/families/{family_id}")
def remove_family_from_group(
    group_id: int,
    family_id: str,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    return GroupService.remove_family_from_group(db, group_id, family_id)

# ID-based routes (Must be last)
@router.get("/{family_id}", response_model=FamilyResponse)
def read_family(family_id: str, db: Session = Depends(database.get_db)):
    return FamilyService.get_by_id(db, family_id)

@router.put("/{family_id}", response_model=FamilyResponse)
def update_family(
    family_id: str,
    family_update: FamilyUpdate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    return FamilyService.update(db, family_id, family_update)

@router.delete("/{family_id}", status_code=204)
def delete_family(
    family_id: str,
    force: bool = Query(False),
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    return FamilyService.delete(db, family_id, force)

@router.post("/{family_id}/assistance", response_model=FamilyAssistanceResponse)
def add_family_assistance(
    family_id: str,
    assistance: FamilyAssistanceCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin_or_operational),
):
    # Set professional_id from current_user if not provided
    if not assistance.professional_id and hasattr(current_user, 'id'):
        assistance.professional_id = current_user.id
    
    return FamilyService.create_assistance(db, family_id, assistance)

@router.get("/{family_id}/assistance", response_model=List[FamilyAssistanceResponse])
def get_family_assistance_history(
    family_id: str,
    db: Session = Depends(database.get_db)
):
    return FamilyService.get_family_history(db, family_id)

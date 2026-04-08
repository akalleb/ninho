from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...database import get_db
from ...core.security import get_current_user, get_current_admin, get_current_admin_or_operational
from . import schemas, models
from .services import ProfessionalService
from ...modules.auth.schemas import PasswordChangeRequest
from pydantic import EmailStr
from datetime import date, timedelta
from sqlalchemy import func

router = APIRouter(prefix="/professionals", tags=["Professionals"])

@router.post("/", response_model=schemas.Professional)
def create_professional(
    professional: schemas.ProfessionalCreate, 
    background_tasks: BackgroundTasks,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return ProfessionalService.create(db, professional)

@router.put("/{professional_id}", response_model=schemas.Professional)
def update_professional(
    professional_id: int,
    professional: schemas.ProfessionalUpdate,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return ProfessionalService.update(db, professional_id, professional)

@router.get("/", response_model=List[schemas.Professional])
def read_professionals(
    skip: int = 0,
    limit: int = 100,
    email: Optional[EmailStr] = None,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(models.Professional)
    if email:
        query = query.filter(models.Professional.email == email)
    return query.offset(skip).limit(limit).all()

@router.get("/basic", response_model=List[schemas.ProfessionalBasic])
def read_professionals_basic(
    limit: int = 1000,
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Professional)
        .order_by(models.Professional.name.asc())
        .limit(limit)
        .all()
    )
    return rows

@router.get("/me", response_model=schemas.Professional)
def read_my_profile(
    current_user: models.Professional = Depends(get_current_user),
):
    return current_user

@router.put("/{professional_id}/status", response_model=schemas.Professional)
def update_professional_status(
    professional_id: int,
    status_update: schemas.ProfessionalStatusUpdate,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
    professional.status = status_update.status
    db.commit()
    db.refresh(professional)
    return professional

@router.post("/{professional_id}/password", status_code=204)
def change_professional_password(
    professional_id: int,
    payload: PasswordChangeRequest,
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from ...modules.auth.services import AuthService
    
    if current_user.id != professional_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    
    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
        
    AuthService.change_password(db, professional, payload)
    return None

@router.get("/{professional_id}", response_model=schemas.Professional)
def read_professional(
    professional_id: int,
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != professional_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional

@router.delete("/{professional_id}")
def delete_professional(
    professional_id: int,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return ProfessionalService.delete(db, professional_id)

@router.get("/{professional_id}/delete-impact", response_model=schemas.ProfessionalDeleteImpact)
def get_professional_delete_impact(
    professional_id: int,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return ProfessionalService.get_delete_impact(db, professional_id)

@router.post("/{professional_id}/force-delete")
def force_delete_professional(
    professional_id: int,
    payload: schemas.ProfessionalForceDeleteRequest,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return ProfessionalService.force_delete(db, professional_id, payload.confirm)

@router.post("/{professional_id}/avatar", response_model=schemas.Professional)
async def upload_professional_avatar(
    professional_id: int,
    file: UploadFile = File(...),
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != professional_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    return await ProfessionalService.upload_avatar(db, professional_id, file)

@router.post("/{professional_id}/cover", response_model=schemas.Professional)
async def upload_professional_cover(
    professional_id: int,
    file: UploadFile = File(...),
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != professional_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    return await ProfessionalService.upload_cover(db, professional_id, file)

@router.get("/{professional_id}/dashboard")
def get_professional_dashboard(
    professional_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Professional = Depends(get_current_user)
):
    if current_user.id != professional_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    from ...models import Attendance

    today = date.today()
    start_of_month = date(today.year, today.month, 1)
    start_of_year = date(today.year, 1, 1)
    
    # Base query for this professional's finished attendances
    base_query = db.query(Attendance).filter(
        Attendance.professional_id == professional_id,
        Attendance.status == "finalizado"
    )
    
    # Counts
    count_today = base_query.filter(func.date(Attendance.end_time) == today).count()
    count_month = base_query.filter(func.date(Attendance.end_time) >= start_of_month).count()
    count_year = base_query.filter(func.date(Attendance.end_time) >= start_of_year).count()
    
    # Average Time (Simple approximation in minutes)
    last_attendances = base_query.order_by(Attendance.end_time.desc()).limit(100).all()
    total_minutes = 0
    valid_count = 0
    for att in last_attendances:
        if att.start_time and att.end_time:
            delta = att.end_time - att.start_time
            total_minutes += delta.total_seconds() / 60
            valid_count += 1
            
    avg_time = int(total_minutes / valid_count) if valid_count > 0 else 0
    
    # Activity Timeline (Last 20)
    timeline = []
    for att in last_attendances[:20]:
        timeline.append({
            "id": att.id,
            "child_name": att.child.name if att.child else "Desconhecido",
            "date": att.end_time,
            "duration": f"{int((att.end_time - att.start_time).total_seconds() / 60)} min" if (att.start_time and att.end_time) else "-",
            "notes": att.notes
        })

    # Charts Data
    six_months_ago = today - timedelta(days=180)
    
    db_url = str(db.get_bind().url)
    if "postgresql" in db_url:
        month_func = func.to_char(Attendance.end_time, 'YYYY-MM')
    else:
        month_func = func.strftime('%Y-%m', Attendance.end_time)

    monthly_query = db.query(
        month_func.label("month"),
        func.count(Attendance.id)
    ).filter(
        Attendance.professional_id == professional_id,
        Attendance.status == "finalizado",
        Attendance.end_time >= six_months_ago
    ).group_by("month").order_by("month").all()
    
    monthly_stats = [{"month": row[0], "count": row[1]} for row in monthly_query]

    # Status Distribution
    status_query = db.query(
        Attendance.status,
        func.count(Attendance.id)
    ).filter(
        Attendance.professional_id == professional_id
    ).group_by(Attendance.status).all()
    
    status_stats = [{"status": row[0], "count": row[1]} for row in status_query]

    return {
        "overview": {
            "today": count_today,
            "month": count_month,
            "year": count_year,
            "avg_time_minutes": avg_time
        },
        "timeline": timeline,
        "charts": {
            "monthly": monthly_stats,
            "status": status_stats
        }
    }

@router.get("/reports/production", response_model=List[schemas.ProductionReport])
def get_production_report(
    start_date: Optional[date] = None, 
    end_date: Optional[date] = None, 
    db: Session = Depends(get_db),
    current_user: models.Professional = Depends(get_current_admin_or_operational),
):
    from ...models import Attendance
    
    query = db.query(
        models.Professional.name.label("professional_name"),
        func.count(Attendance.id).label("total_attendances")
    ).join(Attendance, models.Professional.id == Attendance.professional_id)\
     .filter(Attendance.status == "finalizado")
    
    if start_date:
        query = query.filter(func.date(Attendance.end_time) >= start_date)
    if end_date:
        query = query.filter(func.date(Attendance.end_time) <= end_date)
        
    results = query.group_by(models.Professional.id).all()
    
    return [
        schemas.ProductionReport(professional_name=row.professional_name, total_attendances=row.total_attendances) 
        for row in results
    ]

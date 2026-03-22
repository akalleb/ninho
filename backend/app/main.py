from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, or_
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from . import models, database
from .routers import reports, attendances, inventory, health_referrals
from .modules.families.router import router as families_router
from .modules.children.router import router as children_router
from .modules.finances.router import router as finances_router
from .modules.projects.router import router as projects_router
from .modules.professionals.router import router as professionals_router
from .modules.auth.router import router as auth_router
from .modules.children.schemas import EvolutionResponse as Evolution
from pydantic import BaseModel, EmailStr
from datetime import datetime, date, timedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi import Request
from fastapi.staticfiles import StaticFiles
import os
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ninho_api")



app = FastAPI(title="Sistema Ninho API")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    return response

app.include_router(auth_router)
app.include_router(professionals_router)
app.include_router(families_router)
app.include_router(children_router)
app.include_router(projects_router)
app.include_router(finances_router)
app.include_router(reports.router)
app.include_router(attendances.router)
app.include_router(inventory.router)
app.include_router(health_referrals.router)

origins = os.getenv(
    "CORS_ALLOW_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

# Remover temporariamente o TrustedHostMiddleware que está bloqueando conexões do Nginx
# app.add_middleware(
#     TrustedHostMiddleware,
#     allowed_hosts=os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,187.77.54.131,ninho.pluckstudio.cloud,api-ninho.pluckstudio.cloud,*").split(",")
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir de qualquer lugar temporariamente para resolver o bloqueio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded media
MEDIA_ROOT = os.path.join(os.path.dirname(__file__), "media")
AVATAR_DIR = os.path.join(MEDIA_ROOT, "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Sistema Ninho API"}

# --- Multidisciplinary Evolution Endpoints ---
@app.get("/evolutions/summary_by_service_type")
def get_evolutions_summary_by_service(
    months: int = 3,
    db: Session = Depends(get_db)
):
    # Calculate start date
    today = date.today()
    start_date = today - timedelta(days=months*30)
    
    results = db.query(
        models.MultidisciplinaryEvolution.service_type,
        func.count(models.MultidisciplinaryEvolution.id)
    ).filter(
        models.MultidisciplinaryEvolution.date_service >= start_date
    ).group_by(models.MultidisciplinaryEvolution.service_type).all()
    
    return [{"service": row[0], "count": row[1]} for row in results]

@app.get("/evolutions/", response_model=List[Evolution])
def list_all_evolutions(
    professional_id: Optional[int] = None,
    child_id: Optional[int] = None,
    limit: int = 100,
    sort: str = "created_at_desc",
    db: Session = Depends(get_db)
):
    query = db.query(models.MultidisciplinaryEvolution).options(joinedload(models.MultidisciplinaryEvolution.child))
    
    if professional_id:
        query = query.filter(models.MultidisciplinaryEvolution.professional_id == professional_id)
    if child_id:
        query = query.filter(models.MultidisciplinaryEvolution.child_id == child_id)
        
    if sort == "created_at_desc":
        query = query.order_by(models.MultidisciplinaryEvolution.created_at.desc())
    else:
        query = query.order_by(models.MultidisciplinaryEvolution.date_service.desc())
        
    return query.limit(limit).all()

# --- Dashboard & Reports Endpoints ---
@app.get("/admin/dashboard/stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Counts
    total_families = db.query(models.Family).count()
    total_children = db.query(models.Child).count()
    
    # Children with at least one finished attendance
    attended_children_count = db.query(models.Attendance.child_id)\
        .filter(models.Attendance.status == "finalizado")\
        .distinct().count()
        
    total_attendances = db.query(models.Attendance).filter(models.Attendance.status == "finalizado").count()

    # 2. Charts Data
    
    # Children by Severity
    severity_query = db.query(
        models.Child.severity_level,
        func.count(models.Child.id)
    ).group_by(models.Child.severity_level).all()
    
    children_by_severity = [
        {"label": row[0] or "Não informado", "value": row[1]} 
        for row in severity_query
    ]

    # Families by Vulnerability
    vul_query = db.query(
        models.Family.vulnerability_status,
        func.count(models.Family.id)
    ).group_by(models.Family.vulnerability_status).all()
    
    families_by_vulnerability = [
        {"label": row[0] or "Não informado", "value": row[1]}
        for row in vul_query
    ]
    
    # Attendances last 6 months
    today = date.today()
    six_months_ago = today - timedelta(days=180)
    
    db_url = str(db.get_bind().url)
    if "postgresql" in db_url:
        month_func = func.to_char(models.Attendance.end_time, 'YYYY-MM')
    else:
        month_func = func.strftime('%Y-%m', models.Attendance.end_time)

    att_query = db.query(
        month_func.label("month"),
        func.count(models.Attendance.id)
    ).filter(
        models.Attendance.status == "finalizado",
        models.Attendance.end_time >= six_months_ago
    ).group_by("month").order_by("month").all()
    
    attendances_by_month = [{"month": row[0], "count": row[1]} for row in att_query]

    return {
        "counts": {
            "families": total_families,
            "children": total_children,
            "attended_children": attended_children_count,
            "total_attendances": total_attendances
        },
        "charts": {
            "children_severity": children_by_severity,
            "families_vulnerability": families_by_vulnerability,
            "attendances_month": attendances_by_month
        }
    }

# --- Notifications Endpoints ---

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"
    expires_at: datetime | None = None
    target_audience: str = "all"
    target_professional_id: int | None = None
    is_active: bool = True

class NotificationCreate(NotificationBase):
    created_by_id: int | None = None

class Notification(NotificationBase):
    id: int
    created_at: datetime
    created_by_id: int | None = None
    
    class Config:
        from_attributes = True

@app.post("/notifications/", response_model=Notification)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    db_notification = models.Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@app.get("/notifications/", response_model=List[Notification])
def read_notifications(
    active_only: bool = False,
    target: Optional[str] = None,
    professional_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(models.Notification)
    
    if active_only:
        now = datetime.now()
        query = query.filter(models.Notification.is_active == True)
        # Filter expiration if set
        query = query.filter((models.Notification.expires_at == None) | (models.Notification.expires_at > now))
        
    if target:
        conditions = [models.Notification.target_audience == "all", models.Notification.target_audience == target]
        if professional_id:
             conditions.append(models.Notification.target_professional_id == professional_id)
        query = query.filter(or_(*conditions))
    elif professional_id:
         query = query.filter(or_(
             models.Notification.target_audience == "all",
             models.Notification.target_professional_id == professional_id
         ))
        
    return query.order_by(models.Notification.created_at.desc()).limit(limit).all()

@app.put("/notifications/{notification_id}", response_model=Notification)
def update_notification(notification_id: int, active: bool, db: Session = Depends(get_db)):
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_active = active
    db.commit()
    db.refresh(notification)
    return notification

@app.delete("/notifications/{notification_id}", status_code=204)
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.delete(notification)
    db.commit()
    return None

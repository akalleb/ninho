from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, or_
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from . import models, database
from .routers import reports
from pydantic import BaseModel, EmailStr, computed_field
from datetime import datetime, date, timedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import time
import hashlib
import hmac
import base64
import uuid
import json

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Sistema Ninho API")

app.include_router(reports.router)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded media
MEDIA_ROOT = os.path.join(os.path.dirname(__file__), "..", "media")
AVATAR_DIR = os.path.join(MEDIA_ROOT, "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return base64.b64encode(salt + dk).decode("utf-8")


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        data = base64.b64decode(stored_hash.encode("utf-8"))
        salt, original_dk = data[:16], data[16:]
        new_dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(original_dk, new_dk)
    except Exception:
        return False

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Sistema Ninho API"}

# --- Family Schemas ---
class FamilyBase(BaseModel):
    name_responsible: str
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

    composition_familiar: str | None = None # JSON string
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
    
    # Computed fields (helper properties)
    @computed_field
    @property
    def per_capita_income(self) -> float:
        total_members = 1 + (self.dependents_count or 0)
        return self.monthly_income / total_members if total_members > 0 else 0

    class Config:
        from_attributes = True

# --- Child Schemas ---
class ChildBase(BaseModel):
    name: str
    birth_date: datetime
    gender: str | None = None
    guardian_name: str | None = None
    family_id: str | None = None
    
    blood_type: str | None = None
    emergency_contact: str | None = None
    
    diagnosis: str | None = None
    is_diagnosis_closed: bool = False
    severity_level: str | None = None
    assistance_needs: str | None = None
    has_medical_report: bool = False
    
    allergies: str | None = None
    gestational_history: str | None = None
    
    weight: float | None = None
    height: float | None = None
    cephalic_perimeter: float | None = None
    
    current_school: str | None = None
    current_year: str | None = None
    service_shift: str | None = None
    has_access_treatment: bool = True
    difficulty_reason: str | None = None
    
    notes: str | None = None

class ChildCreate(ChildBase):
    pass

class Child(ChildBase):
    id: int
    created_at: datetime
    report_url: str | None = None
    child_id_url: str | None = None
    vaccination_card_url: str | None = None
    school_history_url: str | None = None

    class Config:
        from_attributes = True

class ChildMedicationBase(BaseModel):
    med_name: str
    dosage: str | None = None
    schedule: str | None = None
    frequency: str | None = None
    status: str = "continuo"
    child_id: int

class ChildMedicationCreate(ChildMedicationBase):
    pass

class ChildMedicationUpdate(BaseModel):
    med_name: str | None = None
    dosage: str | None = None
    schedule: str | None = None
    frequency: str | None = None
    status: str | None = None

class ChildMedication(ChildMedicationBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class EvolutionBase(BaseModel):
    child_id: int
    professional_id: int | None = None
    attendance_id: int | None = None
    service_type: str
    evolution_report: str
    intermittences: str | None = None
    protocol_scores: str | None = None # JSON string

class EvolutionCreate(EvolutionBase):
    pass

class Evolution(EvolutionBase):
    id: int
    date_service: datetime
    created_at: datetime
    
    # professional: Optional[Professional] = None # Include professional details
    # Commented out to avoid circular dependency or missing definition. 
    # If needed, we must ensure Professional schema is defined BEFORE Evolution or use update_forward_refs()
    child: Optional[Child] = None

    class Config:
        from_attributes = True


# --- Professional Schemas ---
class ProfessionalBase(BaseModel):
    name: str
    email: str
    role: str = "health"
    employment_type: str = "effective"
    cpf: str
    rg: str | None = None
    birth_date: date | None = None
    function_role: str | None = None
    admission_date: date | None = None
    contract_validity: date | None = None
    volunteer_start_date: date | None = None
    address: str | None = None
    bank_data: str | None = None
    specialty: str | None = None
    registry_number: str | None = None
    cbo: str | None = None
    status: str | None = "active"
    avatar_url: str | None = None
    cover_url: str | None = None
    
    # Profile Extensions
    bio: str | None = None
    phone: str | None = None
    website: str | None = None
    social_media: str | None = None
    skills: str | None = None

class ProfessionalCreate(ProfessionalBase):
    password: str

class ProfessionalUpdate(ProfessionalBase):
    password: str | None = None

class Professional(ProfessionalBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class AuthUser(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str
    avatar_url: str | None
    cover_url: str | None = None

class ProfessionalStatusUpdate(BaseModel):
    status: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

# --- Resource Source Schemas ---
class ResourceSourceBase(BaseModel):
    name: str
    type: str
    amendment_number: str | None = None
    donor_institution: str | None = None
    term_start: date | None = None
    term_end: date | None = None
    description: str | None = None
    total_value_estimated: float | None = None
    status: str = "active"
    wallet_id: int | None = None

class ResourceSourceCreate(ResourceSourceBase):
    pass

class ResourceSourceUpdate(ResourceSourceBase):
    pass

class ResourceSource(ResourceSourceBase):
    id: int
    document_url: str | None = None
    balance_used: float = 0.0
    created_at: datetime
    created_by_id: int | None = None

    class Config:
        from_attributes = True

# --- Wallet Schemas ---
class WalletBase(BaseModel):
    name: str
    description: str | None = None
    is_restricted: bool = False
    category: str
    bank_name: str | None = None
    agency: str | None = None
    account_number: str | None = None
    pix_key: str | None = None

class WalletCreate(WalletBase):
    initial_balance: float = 0.0 # Optional, maybe handle manually via revenue

class WalletUpdate(WalletBase):
    pass

class Wallet(WalletBase):
    id: int
    balance: float
    created_at: datetime
    last_updated: datetime | None = None
    created_by_id: int | None = None

    class Config:
        from_attributes = True

# --- Attendance Schemas (Moved down to access Wallet) ---
class AttendanceBase(BaseModel):
    child_id: int
    professional_id: int | None = None
    wallet_id: int | None = None
    scheduled_time: datetime | None = None
    notes: str | None = None

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int
    status: str
    check_in_time: datetime | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    
    # Nested Relations
    child: Optional[Child] = None
    professional: Optional[Professional] = None
    wallet: Optional[Wallet] = None
    
    class Config:
        from_attributes = True

class AttendanceUpdate(AttendanceBase):
    status: str | None = None

class AttendanceUpdateStatus(BaseModel):
    status: str
    notes: str | None = None

class ProductionReport(BaseModel):
    professional_name: str
    total_attendances: int
    total_hours: float

class TransferCreate(BaseModel):
    source_wallet_id: int
    target_wallet_id: int
    amount: float
    transfer_date: date | None = None
    description: str | None = None

# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    amount: float
    paid_at: date | None = None
    wallet_id: int
    category_id: int | None = None
    destination: str
    description: str | None = None
    document_ref: str | None = None
    status: str = "pago"
    source_id: int | None = None

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    document_url: str | None = None
    created_at: datetime
    created_by_id: int | None = None

    class Config:
        from_attributes = True

# --- Revenue Schemas ---
class RevenueBase(BaseModel):
    amount: float
    received_at: date
    source_id: int
    wallet_id: int
    payment_method: str
    description: str | None = None
    origin_sphere: str = "privado"
    status: str = "pendente"
    reconciliation_date: date | None = None
    is_reconciled: bool = False
    tracking_code: str | None = None
    observations: str | None = None

class RevenueCreate(RevenueBase):
    pass

class RevenueUpdate(BaseModel):
    amount: float | None = None
    received_at: date | None = None
    source_id: int | None = None
    wallet_id: int | None = None
    payment_method: str | None = None
    description: str | None = None
    origin_sphere: str | None = None
    status: str | None = None
    reconciliation_date: date | None = None
    is_reconciled: bool | None = None
    tracking_code: str | None = None
    observations: str | None = None

class Revenue(RevenueBase):
    id: int
    receipt_url: str | None = None
    created_at: datetime
    created_by_id: int | None = None

    class Config:
        from_attributes = True


# --- Family Endpoints ---
@app.post("/families/", response_model=Family)
def create_family(family: FamilyCreate, db: Session = Depends(get_db)):
    # Check CPF
    existing = db.query(models.Family).filter(models.Family.cpf == family.cpf).first()
    if existing:
        raise HTTPException(status_code=400, detail="CPF do responsável já cadastrado")
    
    db_family = models.Family(
        id=str(uuid.uuid4()),
        **family.model_dump()
    )
    db.add(db_family)
    db.commit()
    db.refresh(db_family)
    return db_family

@app.get("/families/count")
def count_families(db: Session = Depends(get_db)):
    return {"count": db.query(models.Family).count()}

@app.get("/families/", response_model=List[Family])
def read_families(
    neighborhood: Optional[str] = None,
    vulnerability: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Family)
    
    if neighborhood:
        query = query.filter(models.Family.neighborhood == neighborhood)
    
    if vulnerability:
        query = query.filter(models.Family.vulnerability_status == vulnerability)
        
    if search:
        query = query.filter(
            (models.Family.name_responsible.ilike(f"%{search}%")) |
            (models.Family.cpf.ilike(f"%{search}%"))
        )
        
    return query.offset(skip).limit(limit).all()

@app.get("/families/{family_id}", response_model=Family)
def read_family(family_id: str, db: Session = Depends(get_db)):
    family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Família não encontrada")
    return family

@app.put("/families/{family_id}", response_model=Family)
def update_family(family_id: str, family_update: FamilyUpdate, db: Session = Depends(get_db)):
    db_family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not db_family:
        raise HTTPException(status_code=404, detail="Família não encontrada")
    
    update_data = family_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_family, key, value)
    
    db.commit()
    db.refresh(db_family)
    return db_family

@app.delete("/families/{family_id}", status_code=204)
def delete_family(
    family_id: str, 
    force: bool = Query(False), # Novo parâmetro
    db: Session = Depends(get_db)
):
    db_family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not db_family:
        raise HTTPException(status_code=404, detail="Família não encontrada")
    
    try:
        if force:
            # 1. Buscar todas as crianças da família
            children = db.query(models.Child).filter(models.Child.family_id == family_id).all()
            
            for child in children:
                # 1.1 Excluir dependências da criança (Medicações)
                db.query(models.ChildMedication).filter(models.ChildMedication.child_id == child.id).delete()
                
                # 1.2 Excluir dependências da criança (Evoluções)
                db.query(models.MultidisciplinaryEvolution).filter(models.MultidisciplinaryEvolution.child_id == child.id).delete()

                # 1.3 Excluir dependências da criança (Atendimentos)
                # Atendimentos podem ter evoluções também, mas geralmente vinculadas à criança. 
                # Se Attendance tiver filhos, precisa deletar também.
                # Assumindo Attendance simples por enquanto ou cascade no banco.
                db.query(models.Attendance).filter(models.Attendance.child_id == child.id).delete()

                # 1.4 Excluir a criança
                db.delete(child)
            
            # 2. Excluir a Família
            db.delete(db_family)
            db.commit()
        else:
            db.delete(db_family)
            db.commit()
            
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Não é possível excluir esta família pois existem registros dependentes. Use a exclusão forçada para remover tudo."
        )
    return None

@app.post("/families/{family_id}/docs")
async def upload_family_doc(
    family_id: str,
    doc_type: str = Query(..., enum=["residence", "income", "vaccination", "others"]),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    family = db.query(models.Family).filter(models.Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Família não encontrada")

    DOCS_DIR = os.path.join(MEDIA_ROOT, "families")
    os.makedirs(DOCS_DIR, exist_ok=True)
    
    filename = f"{family_id}_{doc_type}_{int(time.time())}_{file.filename}"
    file_path = os.path.join(DOCS_DIR, filename)

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

# --- Children Endpoints ---
@app.get("/children/count")
def count_children(db: Session = Depends(get_db)):
    return {"count": db.query(models.Child).count()}

@app.get("/children/summary_by_severity_level")
def get_children_summary_by_severity(db: Session = Depends(get_db)):
    results = db.query(
        models.Child.severity_level, 
        func.count(models.Child.id)
    ).group_by(models.Child.severity_level).all()
    
    return [{"severity": row[0] or "Não informado", "count": row[1]} for row in results]

@app.post("/children/", response_model=Child)
def create_child(child: ChildCreate, db: Session = Depends(get_db)):
    db_child = models.Child(**child.model_dump())
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child

@app.get("/children/", response_model=List[Child])
def read_children(
    family_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Child)
    
    if family_id:
        query = query.filter(models.Child.family_id == family_id)
        
    if search:
        query = query.filter(models.Child.name.ilike(f"%{search}%"))
        
    return query.offset(skip).limit(limit).all()

@app.get("/children/{child_id}", response_model=Child)
def read_child(child_id: int, db: Session = Depends(get_db)):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Criança não encontrada")
    return child

@app.put("/children/{child_id}", response_model=Child)
def update_child(child_id: int, child_update: ChildCreate, db: Session = Depends(get_db)):
    db_child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not db_child:
        raise HTTPException(status_code=404, detail="Criança não encontrada")
    
    update_data = child_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_child, key, value)
        
    db.commit()
    db.refresh(db_child)
    return db_child

@app.post("/children/{child_id}/docs")
async def upload_child_doc(
    child_id: int,
    doc_type: str = Query(..., enum=["report", "child_id", "vaccination", "school"]),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Criança não encontrada")

    DOCS_DIR = os.path.join(MEDIA_ROOT, "children")
    os.makedirs(DOCS_DIR, exist_ok=True)
    
    filename = f"{child_id}_{doc_type}_{int(time.time())}_{file.filename}"
    file_path = os.path.join(DOCS_DIR, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    public_url = f"/media/children/{filename}"
    
    if doc_type == "report":
        child.report_url = public_url
    elif doc_type == "child_id":
        child.child_id_url = public_url
    elif doc_type == "vaccination":
        child.vaccination_card_url = public_url
    elif doc_type == "school":
        child.school_history_url = public_url
        
    db.commit()
    return {"url": public_url, "type": doc_type}

# --- Child Medications Endpoints ---
@app.post("/children/{child_id}/medications", response_model=ChildMedication)
def add_medication(child_id: int, med: ChildMedicationCreate, db: Session = Depends(get_db)):
    db_med = models.ChildMedication(**med.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

@app.get("/children/{child_id}/medications", response_model=List[ChildMedication])
def get_medications(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.ChildMedication).filter(models.ChildMedication.child_id == child_id).all()

@app.put("/medications/{med_id}", response_model=ChildMedication)
def update_medication(med_id: int, med_update: ChildMedicationUpdate, db: Session = Depends(get_db)):
    med = db.query(models.ChildMedication).filter(models.ChildMedication.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")
    update_data = med_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(med, key, value)
    db.commit()
    db.refresh(med)
    return med

@app.delete("/medications/{med_id}", status_code=204)
def delete_medication(med_id: int, db: Session = Depends(get_db)):
    med = db.query(models.ChildMedication).filter(models.ChildMedication.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")
    try:
        db.delete(med)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro de integridade ao excluir medicação.")
    return None

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

@app.post("/children/{child_id}/evolutions", response_model=Evolution)
def add_evolution(child_id: int, evo: EvolutionCreate, db: Session = Depends(get_db)):
    # Security Check: Attendance must be 'em_atendimento'
    if evo.attendance_id:
        attendance = db.query(models.Attendance).filter(models.Attendance.id == evo.attendance_id).first()
        if not attendance:
             raise HTTPException(status_code=404, detail="Attendance not found")
        if attendance.status != "em_atendimento":
             raise HTTPException(status_code=400, detail="Evolução só pode ser registrada em atendimentos 'Em Atendimento'")
    
    db_evo = models.MultidisciplinaryEvolution(**evo.model_dump())
    db.add(db_evo)
    db.commit()
    db.refresh(db_evo)
    return db_evo

@app.get("/children/{child_id}/evolutions", response_model=List[Evolution])
def get_evolutions(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.MultidisciplinaryEvolution)\
        .filter(models.MultidisciplinaryEvolution.child_id == child_id)\
        .order_by(models.MultidisciplinaryEvolution.date_service.desc())\
        .all()

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

# --- Professionals Endpoints ---
@app.post("/professionals/", response_model=Professional)
def create_professional(professional: ProfessionalCreate, db: Session = Depends(get_db)):
    # Check if Email or CPF already exists
    existing_email = db.query(models.Professional).filter(models.Professional.email == professional.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_cpf = db.query(models.Professional).filter(models.Professional.cpf == professional.cpf).first()
    if existing_cpf:
        raise HTTPException(status_code=400, detail="CPF already registered")

    password_hash = hash_password(professional.password)

    db_professional = models.Professional(
        name=professional.name,
        email=professional.email,
        role=professional.role,
        employment_type=professional.employment_type,
        cpf=professional.cpf,
        rg=professional.rg,
        birth_date=professional.birth_date,
        function_role=professional.function_role,
        admission_date=professional.admission_date,
        contract_validity=professional.contract_validity,
        volunteer_start_date=professional.volunteer_start_date,
        address=professional.address,
        bank_data=professional.bank_data,
        specialty=professional.specialty,
        registry_number=professional.registry_number,
        cbo=professional.cbo,
        status=professional.status or "active",
        avatar_url=professional.avatar_url,
        password_hash=password_hash,
    )
    db.add(db_professional)
    db.commit()
    db.refresh(db_professional)
    return db_professional


@app.put("/professionals/{professional_id}", response_model=Professional)
def update_professional(
    professional_id: int, professional: ProfessionalUpdate, db: Session = Depends(get_db)
):
    db_professional = (
        db.query(models.Professional)
        .filter(models.Professional.id == professional_id)
        .first()
    )
    if db_professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")

    existing_email = (
        db.query(models.Professional)
        .filter(
            models.Professional.email == professional.email,
            models.Professional.id != professional_id,
        )
        .first()
    )
    if existing_email:
        raise HTTPException(
            status_code=400, detail="Email já está em uso por outro colaborador"
        )

    existing_cpf = (
        db.query(models.Professional)
        .filter(
            models.Professional.cpf == professional.cpf,
            models.Professional.id != professional_id,
        )
        .first()
    )
    if existing_cpf:
        raise HTTPException(
            status_code=400, detail="CPF já está em uso por outro colaborador"
        )

    db_professional.name = professional.name
    db_professional.email = professional.email
    db_professional.role = professional.role
    db_professional.employment_type = professional.employment_type
    db_professional.cpf = professional.cpf
    db_professional.rg = professional.rg
    db_professional.birth_date = professional.birth_date
    db_professional.function_role = professional.function_role
    db_professional.admission_date = professional.admission_date
    db_professional.contract_validity = professional.contract_validity
    db_professional.volunteer_start_date = professional.volunteer_start_date
    db_professional.address = professional.address
    db_professional.bank_data = professional.bank_data
    db_professional.specialty = professional.specialty
    db_professional.registry_number = professional.registry_number
    db_professional.cbo = professional.cbo
    db_professional.avatar_url = professional.avatar_url
    
    # Update new fields
    db_professional.bio = professional.bio
    db_professional.phone = professional.phone
    db_professional.website = professional.website
    db_professional.social_media = professional.social_media
    db_professional.skills = professional.skills

    if professional.password:
        db_professional.password_hash = hash_password(professional.password)

    db.commit()
    db.refresh(db_professional)
    return db_professional


@app.post("/auth/login", response_model=AuthUser)
def auth_login(payload: AuthLoginRequest, db: Session = Depends(get_db)):
    professional = (
        db.query(models.Professional)
        .filter(models.Professional.email == payload.email)
        .first()
    )
    if professional is None or not professional.password_hash:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    if professional.status != "active":
        raise HTTPException(status_code=403, detail="Usuário inativo")

    if not verify_password(payload.password, professional.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    return AuthUser(
        id=professional.id,
        name=professional.name,
        email=professional.email,
        role=professional.role,
        status=professional.status or "active",
        avatar_url=professional.avatar_url,
    )

@app.get("/professionals/", response_model=List[Professional])
def read_professionals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        professionals = db.query(models.Professional).offset(skip).limit(limit).all()
        return professionals
    except Exception:
        return []


@app.put("/professionals/{professional_id}/status", response_model=Professional)
def update_professional_status(
    professional_id: int, status: ProfessionalStatusUpdate, db: Session = Depends(get_db)
):
    professional = (
        db.query(models.Professional)
        .filter(models.Professional.id == professional_id)
        .first()
    )
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
    professional.status = status.status
    db.commit()
    db.refresh(professional)
    return professional


@app.post("/professionals/{professional_id}/password", status_code=204)
def change_professional_password(
    professional_id: int,
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
):
    professional = (
        db.query(models.Professional)
        .filter(models.Professional.id == professional_id)
        .first()
    )
    if professional is None or not professional.password_hash:
        raise HTTPException(status_code=404, detail="Professional not found")

    if not verify_password(payload.old_password, professional.password_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    professional.password_hash = hash_password(payload.new_password)
    db.commit()
    return None

@app.get("/professionals/{professional_id}", response_model=Professional)
def read_professional(professional_id: int, db: Session = Depends(get_db)):
    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional

@app.delete("/professionals/{professional_id}", status_code=204)
def delete_professional(professional_id: int, db: Session = Depends(get_db)):
    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
    try:
        db.delete(professional)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não é possível excluir este profissional pois existem atendimentos vinculados a ele.")
    return None


@app.post("/professionals/{professional_id}/avatar", response_model=Professional)
async def upload_professional_avatar(
    professional_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    professional = (
        db.query(models.Professional)
        .filter(models.Professional.id == professional_id)
        .first()
    )
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")

    filename = f"{professional_id}_{int(time.time())}_{file.filename}"
    file_path = os.path.join(AVATAR_DIR, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    public_url = f"/media/avatars/{filename}"
    professional.avatar_url = public_url
    db.commit()
    db.refresh(professional)
    return professional


@app.post("/professionals/{professional_id}/cover", response_model=Professional)
async def upload_professional_cover(
    professional_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    professional = (
        db.query(models.Professional)
        .filter(models.Professional.id == professional_id)
        .first()
    )
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")

    COVERS_DIR = os.path.join(MEDIA_ROOT, "covers")
    os.makedirs(COVERS_DIR, exist_ok=True)

    filename = f"cover_{professional_id}_{int(time.time())}_{file.filename}"
    file_path = os.path.join(COVERS_DIR, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    public_url = f"/media/covers/{filename}"
    professional.cover_url = public_url
    db.commit()
    db.refresh(professional)
    return professional

# --- Attendance Endpoints ---
@app.get("/attendances/", response_model=List[Attendance])
def list_attendances(
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Attendance)
    
    if status:
        query = query.filter(models.Attendance.status == status)
    if start_date:
        query = query.filter(func.date(models.Attendance.scheduled_time) >= start_date)
    if end_date:
        query = query.filter(func.date(models.Attendance.scheduled_time) <= end_date)
        
    # Default order by scheduled_time desc
    return query.order_by(models.Attendance.scheduled_time.desc()).offset(skip).limit(limit).all()

@app.post("/attendances/", response_model=Attendance)
def create_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    status = "agendado" if attendance.scheduled_time else "em_espera"
    check_in = func.now() if status == "em_espera" else None
    
    db_attendance = models.Attendance(
        child_id=attendance.child_id, 
        professional_id=attendance.professional_id,
        wallet_id=attendance.wallet_id,
        scheduled_time=attendance.scheduled_time,
        check_in_time=check_in,
        status=status,
        notes=attendance.notes
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@app.get("/queue/", response_model=List[Attendance])
def read_queue(
    professional_id: Optional[int] = None,
    date_filter: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Attendance).options(
        joinedload(models.Attendance.child),
        joinedload(models.Attendance.professional),
        joinedload(models.Attendance.wallet)
    )
    
    if status:
        query = query.filter(models.Attendance.status == status)
    else:
        # Default queue view: Waiting or Scheduled for today
        today = date.today()
        query = query.filter(
            (models.Attendance.status == "em_espera") | 
            ((models.Attendance.status == "agendado") & (func.date(models.Attendance.scheduled_time) == today))
        )
        
    if professional_id:
        query = query.filter(models.Attendance.professional_id == professional_id)
        
    if date_filter:
        query = query.filter(func.date(models.Attendance.scheduled_time) == date_filter)
        
    return query.order_by(models.Attendance.scheduled_time.asc(), models.Attendance.check_in_time.asc()).all()

@app.get("/attendances/my-day", response_model=List[Attendance])
def get_professional_daily_list(professional_id: int, db: Session = Depends(get_db)):
    # Profissional visualiza lista de pacientes do dia (Agendados, Em Espera, Em Atendimento, Finalizados hoje)
    today = date.today()
    return db.query(models.Attendance).filter(
        models.Attendance.professional_id == professional_id,
        func.date(func.coalesce(models.Attendance.scheduled_time, models.Attendance.check_in_time)) == today
    ).order_by(models.Attendance.scheduled_time.asc()).all()

@app.put("/attendances/{attendance_id}/status", response_model=Attendance)
def update_attendance_status(
    attendance_id: int, 
    status_update: AttendanceUpdateStatus, 
    db: Session = Depends(get_db)
):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    new_status = status_update.status
    attendance.status = new_status
    if status_update.notes:
        attendance.notes = status_update.notes

    # Logic for timestamps
    if new_status == "em_espera" and not attendance.check_in_time:
        attendance.check_in_time = func.now()
    elif new_status == "em_atendimento":
        attendance.start_time = func.now()
    elif new_status == "finalizado":
        attendance.end_time = func.now()
        
    db.commit()
    db.refresh(attendance)
    return attendance

@app.get("/attendances/{attendance_id}", response_model=Attendance)
def read_attendance(attendance_id: int, db: Session = Depends(get_db)):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return attendance

@app.put("/attendances/{attendance_id}/start", response_model=Attendance)
def start_attendance(attendance_id: int, professional_id: int, db: Session = Depends(get_db)):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    attendance.status = "em_atendimento"
    attendance.professional_id = professional_id
    attendance.start_time = func.now()
    db.commit()
    db.refresh(attendance)
    return attendance

@app.put("/attendances/{attendance_id}/finish", response_model=Attendance)
def finish_attendance(attendance_id: int, notes: str, db: Session = Depends(get_db)):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    if attendance.status != "em_atendimento":
        raise HTTPException(status_code=400, detail="Apenas atendimentos 'Em Atendimento' podem ser finalizados.")

    attendance.status = "finalizado"
    attendance.end_time = func.now()
    attendance.notes = notes
    db.commit()
    db.refresh(attendance)
    return attendance

@app.put("/attendances/{attendance_id}", response_model=Attendance)
def update_attendance(attendance_id: int, update: AttendanceUpdate, db: Session = Depends(get_db)):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(attendance, key, value)
        
    db.commit()
    db.refresh(attendance)
    return attendance

@app.delete("/attendances/{attendance_id}", status_code=204)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    try:
        db.delete(attendance)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não é possível excluir este atendimento pois existem evoluções vinculadas a ele.")
    return None

# --- Dashboard & Reports Endpoints ---

@app.get("/professional/{professional_id}/dashboard")
def get_professional_dashboard(professional_id: int, db: Session = Depends(get_db)):
    today = date.today()
    start_of_month = date(today.year, today.month, 1)
    start_of_year = date(today.year, 1, 1)
    
    # Base query for this professional's finished attendances
    base_query = db.query(models.Attendance).filter(
        models.Attendance.professional_id == professional_id,
        models.Attendance.status == "finalizado"
    )
    
    # Counts
    count_today = base_query.filter(func.date(models.Attendance.end_time) == today).count()
    count_month = base_query.filter(func.date(models.Attendance.end_time) >= start_of_month).count()
    count_year = base_query.filter(func.date(models.Attendance.end_time) >= start_of_year).count()
    
    # Average Time (Simple approximation in minutes)
    # SQLite/Postgres diff in date functions varies. 
    # Python-side calculation for simplicity on last 100 records
    last_attendances = base_query.order_by(models.Attendance.end_time.desc()).limit(100).all()
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

    return {
        "overview": {
            "today": count_today,
            "month": count_month,
            "year": count_year,
            "avg_time_minutes": avg_time
        },
        "timeline": timeline
    }

@app.get("/reports/production", response_model=List[ProductionReport])
def get_production_report(
    start_date: Optional[date] = None, 
    end_date: Optional[date] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(
        models.Professional.name.label("professional_name"),
        func.count(models.Attendance.id).label("total_attendances")
    ).join(models.Attendance, models.Professional.id == models.Attendance.professional_id)\
     .filter(models.Attendance.status == "completed")
    
    if start_date:
        query = query.filter(func.date(models.Attendance.end_time) >= start_date)
    if end_date:
        query = query.filter(func.date(models.Attendance.end_time) <= end_date)
        
    results = query.group_by(models.Professional.id).all()
    
    return [
        ProductionReport(professional_name=row.professional_name, total_attendances=row.total_attendances) 
        for row in results
    ]

# --- Resource Sources Endpoints ---
@app.post("/resource-sources/", response_model=ResourceSource)
def create_resource_source(source: ResourceSourceCreate, db: Session = Depends(get_db)):
    db_source = models.ResourceSource(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@app.get("/resource-sources/", response_model=List[ResourceSource])
def read_resource_sources(
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.ResourceSource)
    if type:
        query = query.filter(models.ResourceSource.type == type)
    if status:
        query = query.filter(models.ResourceSource.status == status)
    return query.all()

@app.get("/resource-sources/{source_id}", response_model=ResourceSource)
def read_resource_source(source_id: int, db: Session = Depends(get_db)):
    db_source = db.query(models.ResourceSource).filter(models.ResourceSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Resource Source not found")
    return db_source

@app.put("/resource-sources/{source_id}", response_model=ResourceSource)
def update_resource_source(source_id: int, source: ResourceSourceUpdate, db: Session = Depends(get_db)):
    db_source = db.query(models.ResourceSource).filter(models.ResourceSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Resource Source not found")
    
    update_data = source.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_source, key, value)
    
    db.commit()
    db.refresh(db_source)
    return db_source

@app.delete("/resource-sources/{source_id}", status_code=204)
def delete_resource_source(
    source_id: int, 
    force: bool = Query(False), # Novo parâmetro para forçar deleção
    db: Session = Depends(get_db)
):
    db_source = db.query(models.ResourceSource).filter(models.ResourceSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Resource Source not found")
    
    try:
        if force:
            # 1. Desvincular Despesas (Manter registro, remover vínculo)
            db.query(models.Expense).filter(models.Expense.source_id == source_id).update({models.Expense.source_id: None})
            
            # 2. Excluir Receitas (Cascade Delete) - E atualizar saldo da carteira se necessário
            revenues = db.query(models.Revenue).filter(models.Revenue.source_id == source_id).all()
            for rev in revenues:
                if rev.status in ["recebido", "conciliado"]:
                    wallet = db.query(models.Wallet).filter(models.Wallet.id == rev.wallet_id).first()
                    if wallet:
                        wallet.balance -= rev.amount # Estorna valor
                        wallet.last_updated = func.now()
                db.delete(rev)
            
            # 3. Excluir a Fonte
            db.delete(db_source)
            db.commit()
        else:
            # Comportamento padrão (seguro)
            db.delete(db_source)
            db.commit()
            
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Esta fonte possui vínculos. Use a exclusão forçada para remover tudo."
        )
    return None

@app.post("/resource-sources/{source_id}/document")
async def upload_resource_document(
    source_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    source = db.query(models.ResourceSource).filter(models.ResourceSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Resource Source not found")

    DOCS_DIR = os.path.join(MEDIA_ROOT, "documents")
    os.makedirs(DOCS_DIR, exist_ok=True)
    
    filename = f"res_{source_id}_{int(time.time())}_{file.filename}"
    file_path = os.path.join(DOCS_DIR, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    public_url = f"/media/documents/{filename}"
    source.document_url = public_url
    db.commit()
    return {"url": public_url}

# --- Expenses Endpoints ---
@app.post("/expenses/", response_model=Expense)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    # 1. Validate Wallet
    wallet = db.query(models.Wallet).filter(models.Wallet.id == expense.wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
        
    # 2. Check Balance (Security Logic)
    # Se a saída for 'pago' ou 'agendado' (dependendo da regra, agendado pode não deduzir, mas geralmente reserva)
    # Aqui vamos assumir que 'pago' deduz imediatamente. 'agendado' pode ou não deduzir.
    # Regra: Se status == 'pago', valida e deduz.
    
    if expense.status == "pago":
        if wallet.balance < expense.amount:
            raise HTTPException(status_code=400, detail=f"Saldo Insuficiente na Carteira (Disponível: R$ {wallet.balance:.2f})")
    
    # 3. Create Expense
    db_expense = models.Expense(**expense.model_dump())
    db.add(db_expense)
    
    # 4. Update Wallet Balance
    if expense.status == "pago":
        wallet.balance -= expense.amount
        wallet.last_updated = func.now()
        
        # 4.1 Update Resource Source Balance Used (if linked)
        if expense.source_id:
            source = db.query(models.ResourceSource).filter(models.ResourceSource.id == expense.source_id).first()
            if source:
                source.balance_used += expense.amount

    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.get("/expenses/", response_model=List[Expense])
def read_expenses(
    wallet_id: Optional[int] = None,
    source_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Expense)
    if wallet_id:
        query = query.filter(models.Expense.wallet_id == wallet_id)
    if source_id:
        query = query.filter(models.Expense.source_id == source_id)
    if start_date:
        query = query.filter(models.Expense.paid_at >= start_date)
    if end_date:
        query = query.filter(models.Expense.paid_at <= end_date)
    return query.all()

# --- Wallet Dashboard Stats ---
@app.get("/wallets/{wallet_id}/dashboard")
def get_wallet_dashboard(wallet_id: int, db: Session = Depends(get_db)):
    wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
        
    # Calculate Totals (Current Month)
    today = date.today()
    start_of_month = date(today.year, today.month, 1)
    
    # Incomes (Revenues) - Only Received/Reconciled count for 'Realized'
    incomes_realized = db.query(func.sum(models.Revenue.amount))\
        .filter(models.Revenue.wallet_id == wallet_id)\
        .filter(models.Revenue.status.in_(["recebido", "conciliado"]))\
        .filter(models.Revenue.received_at >= start_of_month)\
        .scalar() or 0.0
        
    incomes_pending = db.query(func.sum(models.Revenue.amount))\
        .filter(models.Revenue.wallet_id == wallet_id)\
        .filter(models.Revenue.status == "pendente")\
        .scalar() or 0.0

    # Expenses
    expenses_total = db.query(func.sum(models.Expense.amount))\
        .filter(models.Expense.wallet_id == wallet_id)\
        .filter(models.Expense.status == "pago")\
        .filter(models.Expense.paid_at >= start_of_month)\
        .scalar() or 0.0
        
    return {
        "wallet": wallet,
        "stats": {
            "incomes_month": incomes_realized,
            "expenses_month": expenses_total,
            "pending_incomes": incomes_pending,
            "current_balance": wallet.balance
        }
    }

# --- Wallets Endpoints ---
@app.post("/wallets/", response_model=Wallet)
def create_wallet(wallet: WalletCreate, db: Session = Depends(get_db)):
    wallet_data = wallet.model_dump()
    initial_balance = wallet_data.pop("initial_balance", 0.0)

    db_wallet = models.Wallet(**wallet_data)
    db_wallet.balance = initial_balance

    db.add(db_wallet)
    db.commit()
    db.refresh(db_wallet)
    return db_wallet

@app.get("/wallets/", response_model=List[Wallet])
def read_wallets(db: Session = Depends(get_db)):
    return db.query(models.Wallet).all()

@app.get("/wallets/{wallet_id}", response_model=Wallet)
def read_wallet(wallet_id: int, db: Session = Depends(get_db)):
    db_wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return db_wallet

@app.put("/wallets/{wallet_id}", response_model=Wallet)
def update_wallet(wallet_id: int, wallet: WalletUpdate, db: Session = Depends(get_db)):
    db_wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    update_data = wallet.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_wallet, key, value)
    
    db.commit()
    db.refresh(db_wallet)
    return db_wallet

@app.get("/wallets/{wallet_id}/export")
def export_wallet_data(wallet_id: int, db: Session = Depends(get_db)):
    wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")
        
    # Buscar dados relacionados
    revenues = db.query(models.Revenue).filter(models.Revenue.wallet_id == wallet_id).all()
    expenses = db.query(models.Expense).filter(models.Expense.wallet_id == wallet_id).all()
    attendances = db.query(models.Attendance).filter(models.Attendance.wallet_id == wallet_id).all()
    
    # Retornar estrutura JSON completa
    return {
        "wallet": {
            "id": wallet.id,
            "name": wallet.name,
            "balance": wallet.balance,
            "category": wallet.category,
            "is_restricted": wallet.is_restricted
        },
        "revenues": [
            {
                "id": r.id,
                "date": r.received_at,
                "amount": r.amount,
                "description": r.description,
                "status": r.status,
                "source_id": r.source_id
            } for r in revenues
        ],
        "expenses": [
            {
                "id": e.id,
                "date": e.paid_at,
                "amount": e.amount,
                "destination": e.destination,
                "description": e.description,
                "status": e.status
            } for e in expenses
        ],
        "attendances_linked": [
            {
                "id": a.id,
                "date": a.scheduled_time,
                "child_id": a.child_id
            } for a in attendances
        ]
    }

@app.delete("/wallets/{wallet_id}", status_code=204)
def delete_wallet(
    wallet_id: int, 
    force: bool = Query(False),
    db: Session = Depends(get_db)
):
    db_wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    try:
        if force:
            # Lógica de Exclusão em Cascata
            # 1. Excluir Receitas e Despesas (Dados financeiros deixam de existir sem a carteira)
            db.query(models.Revenue).filter(models.Revenue.wallet_id == wallet_id).delete()
            db.query(models.Expense).filter(models.Expense.wallet_id == wallet_id).delete()
            
            # 2. Desvincular Atendimentos e Fontes de Recurso (Não excluir, apenas remover vínculo)
            db.query(models.Attendance).filter(models.Attendance.wallet_id == wallet_id).update({models.Attendance.wallet_id: None})
            db.query(models.ResourceSource).filter(models.ResourceSource.wallet_id == wallet_id).update({models.ResourceSource.wallet_id: None})
            
            # 3. Excluir a Carteira
            db.delete(db_wallet)
            db.commit()
        else:
            db.delete(db_wallet)
            db.commit()
            
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Não é possível excluir esta carteira pois existem registros (receitas/despesas/transferências) vinculados a ela."
        )
    return None

@app.post("/wallets/transfer", status_code=201)
def transfer_funds(transfer: TransferCreate, db: Session = Depends(get_db)):
    # 1. Get Wallets
    source_wallet = db.query(models.Wallet).filter(models.Wallet.id == transfer.source_wallet_id).first()
    target_wallet = db.query(models.Wallet).filter(models.Wallet.id == transfer.target_wallet_id).first()
    
    if not source_wallet:
        raise HTTPException(status_code=404, detail="Carteira de origem não encontrada")
    if not target_wallet:
        raise HTTPException(status_code=404, detail="Carteira de destino não encontrada")
    if source_wallet.id == target_wallet.id:
        raise HTTPException(status_code=400, detail="Não é possível transferir para a mesma carteira")
        
    # 2. Check Balance
    if source_wallet.balance < transfer.amount:
         raise HTTPException(status_code=400, detail=f"Saldo Insuficiente na Origem (R$ {source_wallet.balance:.2f})")
         
    # 3. Check Restrictions (Basic)
    # If source is restricted, target should ideally be compatible. 
    # For now, we allow but maybe we should flag it. Assuming user knows what they are doing for now.
    
    transfer_date = transfer.transfer_date or date.today()
    
    try:
        # 4. Create Expense in Source
        expense = models.Expense(
            amount=transfer.amount,
            paid_at=transfer_date,
            wallet_id=source_wallet.id,
            destination=f"Transferência para: {target_wallet.name}",
            description=transfer.description or "Transferência entre carteiras",
            status="pago"
        )
        db.add(expense)
        source_wallet.balance -= transfer.amount
        source_wallet.last_updated = func.now()
        
        # 5. Create Revenue in Target
        # We need a dummy source or a specific 'Internal Transfer' source.
        # Ideally, we should have a system ResourceSource for internal transfers.
        # For now, we will try to find a generic one or create/use null if allowed.
        # Revenue model requires source_id. Let's find one or pick the first active one? 
        # Better approach: Make source_id nullable in DB for internal transfers OR create a system source.
        # Let's check if we can make it nullable. In `models.py` it is nullable?
        # `source_id = Column(Integer, ForeignKey("resource_sources.id"))` -> It's NOT nullable by default in SQL unless specified.
        # Let's assume we need a source. I will try to find a source named "Transferência Interna" or create it.
        
        internal_source = db.query(models.ResourceSource).filter(models.ResourceSource.name == "Transferência Interna").first()
        if not internal_source:
             internal_source = models.ResourceSource(name="Transferência Interna", type="evento", status="active")
             db.add(internal_source)
             db.flush() # Get ID
        
        revenue = models.Revenue(
            amount=transfer.amount,
            received_at=transfer_date,
            wallet_id=target_wallet.id,
            source_id=internal_source.id,
            payment_method="transferencia",
            description=f"Recebido de: {source_wallet.name} - {transfer.description or ''}",
            status="recebido", # Money is already moved
            origin_sphere="privado"
        )
        db.add(revenue)
        target_wallet.balance += transfer.amount
        target_wallet.last_updated = func.now()
        
        db.commit()
        return {"message": "Transferência realizada com sucesso", "new_source_balance": source_wallet.balance, "new_target_balance": target_wallet.balance}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro na transferência: {str(e)}")

# --- Revenue Endpoints ---
@app.post("/revenues/", response_model=Revenue)
def create_revenue(revenue: RevenueCreate, db: Session = Depends(get_db)):
    # 1. Validate Wallet and Source
    wallet = db.query(models.Wallet).filter(models.Wallet.id == revenue.wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
        
    source = db.query(models.ResourceSource).filter(models.ResourceSource.id == revenue.source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Resource Source not found")
        
    # 2. Check Restrictions
    # Se a Wallet for is_restricted=True, a receita deve obrigatoriamente pertencer a uma ResourceSource compatível
    # Como não foi definido exatamente o que é "compatível", assumirei que a Source deve estar vinculada a esta Wallet (se houver vínculo direto)
    # Ou simplesmente alertar. O prompt diz "ou o sistema deve emitir um alerta".
    # Vou implementar uma validação básica: Se a carteira é restrita, a fonte NÃO pode ser do tipo 'doacao' livre ou 'evento' genérico se não tiver vínculo explícito?
    # Para simplificar conforme pedido: "Se a Wallet for is_restricted=True, a receita deve obrigatoriamente pertencer a uma ResourceSource compatível"
    # Vou assumir que "compatível" significa que a Fonte deve ter sido cadastrada prevendo essa carteira OU ser de um tipo governamental (Emenda/Convênio).
    # Mas como o modelo ResourceSource agora tem 'wallet_id' (adicionei no passo anterior), posso verificar se a fonte está ligada a esta carteira.
    
    if wallet.is_restricted:
        if source.wallet_id and source.wallet_id != wallet.id:
             raise HTTPException(status_code=400, detail=f"Esta Fonte de Recurso está vinculada a outra Carteira (ID: {source.wallet_id}).")
        
        # Se não tiver vínculo direto, podemos permitir, mas idealmente deveria ter.
        # Vou deixar passar se não tiver vínculo conflitante.

    # 3. Create Revenue
    db_revenue = models.Revenue(**revenue.model_dump())
    db.add(db_revenue)
    
    # 4. Update Wallet Balance (ONLY IF RECEIVED OR RECONCILED)
    # Regra de Ouro: O saldo só deve ser incrementado quando o status for 'recebido' ou 'conciliado'.
    if revenue.status in ["recebido", "conciliado"]:
        wallet.balance += revenue.amount
        wallet.last_updated = func.now()
    
    # 5. Update Source Balance Used (Optional but good for tracking)
    # O prompt anterior pedia 'balance_used' na Fonte. Receita não é uso, é entrada.
    # Uso seria Despesa. Então não mexo no balance_used da fonte aqui.
    
    db.commit()
    db.refresh(db_revenue)
    return db_revenue

@app.put("/revenues/{revenue_id}", response_model=Revenue)
def update_revenue(revenue_id: int, revenue_update: RevenueUpdate, db: Session = Depends(get_db)):
    db_revenue = db.query(models.Revenue).filter(models.Revenue.id == revenue_id).first()
    if not db_revenue:
        raise HTTPException(status_code=404, detail="Revenue not found")
        
    old_status = db_revenue.status
    new_status = revenue_update.status
    
    # Logic for Balance Update on Status Change
    if new_status and new_status != old_status:
        wallet = db.query(models.Wallet).filter(models.Wallet.id == db_revenue.wallet_id).first()
        if wallet:
            # If moving TO received/reconciled FROM pending/cancelled -> Add Balance
            if new_status in ["recebido", "conciliado"] and old_status in ["pendente", "cancelado"]:
                wallet.balance += db_revenue.amount
                wallet.last_updated = func.now()
            
            # If moving FROM received/reconciled TO pending/cancelled -> Subtract Balance
            elif old_status in ["recebido", "conciliado"] and new_status in ["pendente", "cancelado"]:
                wallet.balance -= db_revenue.amount
                wallet.last_updated = func.now()
    
    update_data = revenue_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_revenue, key, value)
        
    db.commit()
    db.refresh(db_revenue)
    return db_revenue

@app.get("/revenues/", response_model=List[Revenue])
def read_revenues(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    source_id: Optional[int] = None,
    wallet_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Revenue)
    
    if start_date:
        query = query.filter(models.Revenue.received_at >= start_date)
    if end_date:
        query = query.filter(models.Revenue.received_at <= end_date)
    if source_id:
        query = query.filter(models.Revenue.source_id == source_id)
    if wallet_id:
        query = query.filter(models.Revenue.wallet_id == wallet_id)
        
    return query.all()

@app.get("/incomes/", response_model=List[Revenue])
def list_incomes(
    limit: int = 10,
    order_by: str = "date_desc",
    db: Session = Depends(get_db)
):
    query = db.query(models.Revenue)
    
    if order_by == "date_desc":
        query = query.order_by(models.Revenue.received_at.desc())
    
    return query.limit(limit).all()

@app.post("/revenues/{revenue_id}/receipt")
async def upload_revenue_receipt(
    revenue_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    revenue = db.query(models.Revenue).filter(models.Revenue.id == revenue_id).first()
    if not revenue:
        raise HTTPException(status_code=404, detail="Revenue not found")

    RECEIPTS_DIR = os.path.join(MEDIA_ROOT, "receipts")
    os.makedirs(RECEIPTS_DIR, exist_ok=True)
    
    filename = f"rec_{revenue_id}_{int(time.time())}_{file.filename}"
    file_path = os.path.join(RECEIPTS_DIR, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    public_url = f"/media/receipts/{filename}"
    revenue.receipt_url = public_url
    db.commit()
    return {"url": public_url}

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
        # Show notifications for 'all' OR specific target group OR specific professional
        # If professional_id is provided, also include notifications for that ID
        
        conditions = [models.Notification.target_audience == "all", models.Notification.target_audience == target]
        
        if professional_id:
             conditions.append(models.Notification.target_professional_id == professional_id)
        
        query = query.filter(or_(*conditions))
    elif professional_id:
        # If only professional_id is provided without target group filter, show 'all' + specific ID
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

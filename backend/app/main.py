from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, or_
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from . import models, database
from .routers import reports, auth, families, children, finances, attendances
from .routers.children import Evolution
from pydantic import BaseModel, EmailStr, computed_field, field_validator
from datetime import datetime, date, timedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from .core.supabase import supabase, supabase_admin
from .core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from .utils.uploads import save_upload
import httpx
import os
import time
import hashlib
import hmac
import base64
import uuid
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ninho_api")

models.Base.metadata.create_all(bind=database.engine)
database.ensure_schema()

app = FastAPI(title="Sistema Ninho API")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    return response

app.include_router(reports.router)
app.include_router(auth.router)
app.include_router(families.router)
app.include_router(children.router)
app.include_router(finances.router)
app.include_router(attendances.router)

origins = os.getenv(
    "CORS_ALLOW_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
)

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


from .core.security import (
    hash_password,
    verify_password,
    create_access_token,
    oauth2_scheme,
    verify_supabase_token,
    encrypt_data,
    decrypt_data,
    get_data_hash,
    get_current_user,
    get_current_admin,
    get_current_admin_or_operational,
)

# Note: hash_password and verify_password in main.py are now deprecated in favor of core.security
# but kept here if used locally. The import above brings the centralized ones.

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Sistema Ninho API"}

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
    
    @field_validator('cpf', 'rg', 'address', 'bank_data', mode='before')
    @classmethod
    def decrypt_sensitive_data(cls, v):
        return decrypt_data(v) if v else None

    class Config:
        from_attributes = True


class ProfessionalBasic(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str | None = None
    avatar_url: str | None = None
    registry_number: str | None = None

class ProfessionalStatusUpdate(BaseModel):
    status: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class ProfessionalForceDeleteRequest(BaseModel):
    confirm: str

class ProfessionalDeleteImpact(BaseModel):
    id: int
    name: str
    email: str
    references: dict

class ProductionReport(BaseModel):
    professional_name: str
    total_attendances: int

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

def create_supabase_user(email: str, password: str, metadata: dict):
    try:
        if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
            target_email = (email or "").strip().lower()
            if not target_email:
                raise HTTPException(status_code=400, detail="Email inválido")

            headers = {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
            }

            def _find_user_id_by_email() -> str | None:
                try:
                    def _scan(params: dict) -> str | None:
                        resp = httpx.get(
                            f"{SUPABASE_URL}/auth/v1/admin/users",
                            headers=headers,
                            params=params,
                            timeout=15,
                        )
                        if resp.status_code != 200:
                            return None
                        payload = resp.json()
                        users = payload.get("users") if isinstance(payload, dict) else None
                        if not isinstance(users, list):
                            return None
                        for u in users:
                            if not isinstance(u, dict):
                                continue
                            if (u.get("email") or "").strip().lower() == target_email and u.get("id"):
                                return u["id"]
                        return None

                    user_id = _scan({"page": 1, "per_page": 200, "filter": target_email})
                    if user_id:
                        return user_id

                    for page in range(1, 11):
                        user_id = _scan({"page": page, "per_page": 200})
                        if user_id:
                            return user_id
                    return None
                except Exception:
                    return None

            def _update_user(user_id: str) -> None:
                resp = httpx.put(
                    f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                    headers=headers,
                    json={"password": password, "email_confirm": True, "user_metadata": metadata},
                    timeout=15,
                )
                if resp.status_code not in (200, 201):
                    detail = ""
                    try:
                        detail = json.dumps(resp.json())
                    except Exception:
                        detail = resp.text or ""
                    raise HTTPException(status_code=400, detail=f"Supabase update_user falhou ({resp.status_code}). {detail}")

            user_id = _find_user_id_by_email()
            if user_id:
                _update_user(user_id)
                logger.info(f"Supabase user updated (admin) for {target_email}")
                return

            create_resp = httpx.post(
                f"{SUPABASE_URL}/auth/v1/admin/users",
                headers=headers,
                json={"email": target_email, "password": password, "email_confirm": True, "user_metadata": metadata},
                timeout=15,
            )
            if create_resp.status_code in (200, 201):
                logger.info(f"Supabase user created (admin) for {target_email}")
                return

            message = ""
            try:
                message = json.dumps(create_resp.json())
            except Exception:
                message = create_resp.text or ""

            if create_resp.status_code in (400, 409, 422):
                user_id = _find_user_id_by_email()
                if user_id:
                    _update_user(user_id)
                    logger.info(f"Supabase user updated (admin) for {target_email}")
                    return

            raise HTTPException(
                status_code=400,
                detail=f"Supabase create_user falhou ({create_resp.status_code}). {message}",
            )

        if not supabase:
            logger.warning("Supabase client not initialized. Skipping Auth user creation.")
            return

        supabase.auth.sign_up(
            {
                "email": email,
                "password": password,
                "options": {"data": metadata},
            }
        )
        logger.info(f"Supabase user created (signup) for {email}")
    except Exception as e:
        logger.error(f"Failed to create Supabase user: {e}")
        raise HTTPException(status_code=400, detail="Não foi possível criar/atualizar o usuário no Supabase Auth. Verifique se o e-mail já existe no Supabase.")


def delete_supabase_auth_user(email: str) -> bool:
    if not (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY):
        return False

    target_email = (email or "").strip().lower()
    if not target_email:
        return False

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }

    def _scan(params: dict) -> str | None:
        resp = httpx.get(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            headers=headers,
            params=params,
            timeout=15,
        )
        if resp.status_code != 200:
            return None
        payload = resp.json()
        users = payload.get("users") if isinstance(payload, dict) else None
        if not isinstance(users, list):
            return None
        for u in users:
            if not isinstance(u, dict):
                continue
            if (u.get("email") or "").strip().lower() == target_email and u.get("id"):
                return u["id"]
        return None

    user_id = None
    try:
        user_id = _scan({"page": 1, "per_page": 200, "filter": target_email}) or None
        if not user_id:
            for page in range(1, 11):
                user_id = _scan({"page": page, "per_page": 200}) or None
                if user_id:
                    break
    except Exception:
        user_id = None

    if not user_id:
        return False

    resp = httpx.delete(
        f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
        headers=headers,
        timeout=15,
    )
    if resp.status_code in (200, 202, 204):
        return True

    detail = ""
    try:
        detail = json.dumps(resp.json())
    except Exception:
        detail = resp.text or ""
    logger.error(f"Supabase delete_user falhou ({resp.status_code}) para {target_email}: {detail}")
    return False

# --- Professionals Endpoints ---
@app.post("/professionals/", response_model=Professional)
def create_professional(
    professional: ProfessionalCreate, 
    background_tasks: BackgroundTasks,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    email_normalized = professional.email.strip().lower()
    password_plain = (professional.password or "").strip()
    if len(password_plain) < 6:
        raise HTTPException(status_code=400, detail="Senha inválida (mínimo 6 caracteres).")

    existing_email = db.query(models.Professional).filter(models.Professional.email == email_normalized).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Use Blind Index (Hash) for CPF uniqueness check
    cpf_hash = get_data_hash(professional.cpf)
    existing_cpf = db.query(models.Professional).filter(models.Professional.cpf_hash == cpf_hash).first()
    if existing_cpf:
        raise HTTPException(status_code=400, detail="CPF already registered")

    password_hash = hash_password(password_plain)
    
    # Compute Hashes
    rg_hash = get_data_hash(professional.rg) if professional.rg else None

    allowed_roles = {"admin", "operational", "health"}
    if professional.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Role inválida")

    db_professional = models.Professional(
        name=professional.name,
        email=email_normalized,
        role=professional.role,
        employment_type=professional.employment_type,
        
        # Encrypt sensitive data + Hash for search
        cpf=encrypt_data(professional.cpf),
        cpf_hash=cpf_hash,
        rg=encrypt_data(professional.rg) if professional.rg else None,
        rg_hash=rg_hash,
        
        birth_date=professional.birth_date,
        function_role=professional.function_role,
        admission_date=professional.admission_date,
        contract_validity=professional.contract_validity,
        volunteer_start_date=professional.volunteer_start_date,
        address=encrypt_data(professional.address) if professional.address else None,
        bank_data=encrypt_data(professional.bank_data) if professional.bank_data else None,
        specialty=professional.specialty,
        registry_number=professional.registry_number,
        cbo=professional.cbo,
        status=professional.status or "active",
        avatar_url=professional.avatar_url,
        password_hash=password_hash,
    )
    metadata = {
        "name": professional.name,
        "role": professional.role
    }
    try:
        create_supabase_user(email_normalized, password_plain, metadata)
        db.add(db_professional)
        db.commit()
        db.refresh(db_professional)
        return db_professional
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao criar colaborador.")


@app.put("/professionals/{professional_id}", response_model=Professional)
def update_professional(
    professional_id: int,
    professional: ProfessionalUpdate,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    db_professional = (
        db.query(models.Professional)
        .filter(models.Professional.id == professional_id)
        .first()
    )
    if db_professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")

    email_normalized = professional.email.strip().lower() if professional.email else None

    if email_normalized:
        existing_email = (
            db.query(models.Professional)
            .filter(
                models.Professional.email == email_normalized,
                models.Professional.id != professional_id,
            )
            .first()
        )
    else:
        existing_email = None

    if existing_email:
        raise HTTPException(
            status_code=400, detail="Email já está em uso por outro colaborador"
        )

    existing_cpf = (
        db.query(models.Professional)
        .filter(
            models.Professional.cpf_hash == get_data_hash(professional.cpf),
            models.Professional.id != professional_id,
        )
        .first()
    )
    if existing_cpf:
        raise HTTPException(
            status_code=400, detail="CPF já está em uso por outro colaborador"
        )

    db_professional.name = professional.name
    if email_normalized:
        db_professional.email = email_normalized
    allowed_roles = {"admin", "operational", "health"}
    if professional.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Role inválida")
    db_professional.role = professional.role
    db_professional.employment_type = professional.employment_type
    
    # Encrypt & Hash Update
    db_professional.cpf = encrypt_data(professional.cpf)
    db_professional.cpf_hash = get_data_hash(professional.cpf)
    
    db_professional.rg = encrypt_data(professional.rg) if professional.rg else None
    db_professional.rg_hash = get_data_hash(professional.rg) if professional.rg else None
    
    db_professional.birth_date = professional.birth_date
    db_professional.function_role = professional.function_role
    db_professional.admission_date = professional.admission_date
    db_professional.contract_validity = professional.contract_validity
    db_professional.volunteer_start_date = professional.volunteer_start_date
    
    # Encrypt sensitive updates
    db_professional.address = encrypt_data(professional.address) if professional.address else None
    db_professional.bank_data = encrypt_data(professional.bank_data) if professional.bank_data else None
    
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
        password_plain = (professional.password or "").strip()
        if len(password_plain) < 6:
            raise HTTPException(status_code=400, detail="Senha inválida (mínimo 6 caracteres).")
        db_professional.password_hash = hash_password(password_plain)
        metadata = {
            "name": db_professional.name,
            "role": db_professional.role,
        }
        try:
            create_supabase_user(db_professional.email, password_plain, metadata)
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=400, detail="Não foi possível sincronizar a senha no Supabase Auth.")

    db.commit()
    db.refresh(db_professional)
    return db_professional

@app.get("/professionals/", response_model=List[Professional])
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


@app.get("/professionals/basic", response_model=List[ProfessionalBasic])
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
    return [
        ProfessionalBasic(
            id=p.id,
            name=p.name,
            email=p.email,
            role=p.role,
            status=p.status,
            avatar_url=p.avatar_url,
            registry_number=p.registry_number,
        )
        for p in rows
    ]


@app.get("/professionals/me", response_model=Professional)
def read_my_profile(
    current_user: models.Professional = Depends(get_current_user),
):
    return current_user


@app.put("/professionals/{professional_id}/status", response_model=Professional)
def update_professional_status(
    professional_id: int,
    status: ProfessionalStatusUpdate,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
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
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != professional_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
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

@app.delete("/professionals/{professional_id}")
def delete_professional(
    professional_id: int,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")
    try:
        target_email = professional.email
        db.delete(professional)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não é possível excluir este profissional pois existem atendimentos vinculados a ele.")
    auth_deleted = False
    try:
        auth_deleted = delete_supabase_auth_user(target_email)
    except Exception:
        auth_deleted = False
    return {"message": "Colaborador excluído com sucesso", "auth_deleted": auth_deleted}


@app.get("/professionals/{professional_id}/delete-impact", response_model=ProfessionalDeleteImpact)
def get_professional_delete_impact(
    professional_id: int,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")

    references = {
        "attendances": db.query(models.Attendance).filter(models.Attendance.professional_id == professional_id).count(),
        "evolutions": db.query(models.MultidisciplinaryEvolution).filter(models.MultidisciplinaryEvolution.professional_id == professional_id).count(),
        "resource_sources_created": db.query(models.ResourceSource).filter(models.ResourceSource.created_by_id == professional_id).count(),
        "wallets_created": db.query(models.Wallet).filter(models.Wallet.created_by_id == professional_id).count(),
        "wallets_target": db.query(models.Wallet).filter(models.Wallet.target_professional_id == professional_id).count(),
        "revenues_created": db.query(models.Revenue).filter(models.Revenue.created_by_id == professional_id).count(),
        "expenses_created": db.query(models.Expense).filter(models.Expense.created_by_id == professional_id).count(),
        "notifications_created": db.query(models.Notification).filter(models.Notification.created_by_id == professional_id).count(),
        "notifications_target": db.query(models.Notification).filter(models.Notification.target_professional_id == professional_id).count(),
    }

    return ProfessionalDeleteImpact(
        id=professional.id,
        name=professional.name,
        email=professional.email,
        references=references,
    )


@app.post("/professionals/{professional_id}/force-delete")
def force_delete_professional(
    professional_id: int,
    payload: ProfessionalForceDeleteRequest,
    current_user: models.Professional = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")

    expected = (professional.email or "").strip().lower()
    provided = (payload.confirm or "").strip().lower()
    if not expected or provided != expected:
        raise HTTPException(status_code=400, detail="Confirmação inválida. Digite o e-mail do colaborador para confirmar a exclusão.")

    if professional.role == "admin":
        remaining_admins = (
            db.query(models.Professional)
            .filter(models.Professional.role == "admin", models.Professional.id != professional_id, models.Professional.status == "active")
            .count()
        )
        if remaining_admins == 0:
            raise HTTPException(status_code=400, detail="Não é possível excluir o último administrador ativo do sistema.")

    try:
        target_email = professional.email
        db.query(models.Attendance).filter(models.Attendance.professional_id == professional_id).update(
            {models.Attendance.professional_id: None}, synchronize_session=False
        )
        db.query(models.MultidisciplinaryEvolution).filter(models.MultidisciplinaryEvolution.professional_id == professional_id).update(
            {models.MultidisciplinaryEvolution.professional_id: None}, synchronize_session=False
        )
        db.query(models.ResourceSource).filter(models.ResourceSource.created_by_id == professional_id).update(
            {models.ResourceSource.created_by_id: None}, synchronize_session=False
        )
        db.query(models.Wallet).filter(models.Wallet.created_by_id == professional_id).update(
            {models.Wallet.created_by_id: None}, synchronize_session=False
        )
        db.query(models.Wallet).filter(models.Wallet.target_professional_id == professional_id).update(
            {models.Wallet.target_professional_id: None}, synchronize_session=False
        )
        db.query(models.Revenue).filter(models.Revenue.created_by_id == professional_id).update(
            {models.Revenue.created_by_id: None}, synchronize_session=False
        )
        db.query(models.Expense).filter(models.Expense.created_by_id == professional_id).update(
            {models.Expense.created_by_id: None}, synchronize_session=False
        )
        db.query(models.Notification).filter(models.Notification.created_by_id == professional_id).update(
            {models.Notification.created_by_id: None}, synchronize_session=False
        )
        db.query(models.Notification).filter(models.Notification.target_professional_id == professional_id).update(
            {models.Notification.target_professional_id: None}, synchronize_session=False
        )

        db.delete(professional)
        db.commit()
        auth_deleted = False
        try:
            auth_deleted = delete_supabase_auth_user(target_email)
        except Exception:
            auth_deleted = False
        return {"message": "Colaborador excluído com sucesso", "auth_deleted": auth_deleted}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não foi possível excluir este colaborador devido a vínculos no banco.")


@app.post("/professionals/{professional_id}/avatar", response_model=Professional)
async def upload_professional_avatar(
    professional_id: int,
    file: UploadFile = File(...),
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != professional_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    professional = (
        db.query(models.Professional)
        .filter(models.Professional.id == professional_id)
        .first()
    )
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")

    filename = await save_upload(
        file,
        AVATAR_DIR,
        str(professional_id),
        5 * 1024 * 1024,
        {"image/png", "image/jpeg"},
    )

    public_url = f"/media/avatars/{filename}"
    professional.avatar_url = public_url
    db.commit()
    db.refresh(professional)
    return professional


@app.post("/professionals/{professional_id}/cover", response_model=Professional)
async def upload_professional_cover(
    professional_id: int,
    file: UploadFile = File(...),
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != professional_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    professional = (
        db.query(models.Professional)
        .filter(models.Professional.id == professional_id)
        .first()
    )
    if professional is None:
        raise HTTPException(status_code=404, detail="Professional not found")

    COVERS_DIR = os.path.join(MEDIA_ROOT, "covers")
    filename = await save_upload(
        file,
        COVERS_DIR,
        f"cover_{professional_id}",
        5 * 1024 * 1024,
        {"image/png", "image/jpeg"},
    )

    public_url = f"/media/covers/{filename}"
    professional.cover_url = public_url
    db.commit()
    db.refresh(professional)
    return professional

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

    # Charts Data
    # 1. Monthly Performance (Last 6 months)
    six_months_ago = today - timedelta(days=180)
    
    # Check if we are using PostgreSQL or SQLite to use correct date function
    db_url = str(db.get_bind().url)
    if "postgresql" in db_url:
        # PostgreSQL
        month_func = func.to_char(models.Attendance.end_time, 'YYYY-MM')
    else:
        # SQLite
        month_func = func.strftime('%Y-%m', models.Attendance.end_time)

    monthly_query = db.query(
        month_func.label("month"),
        func.count(models.Attendance.id)
    ).filter(
        models.Attendance.professional_id == professional_id,
        models.Attendance.status == "finalizado",
        models.Attendance.end_time >= six_months_ago
    ).group_by("month").order_by("month").all()
    
    monthly_stats = [{"month": row[0], "count": row[1]} for row in monthly_query]

    # 2. Status Distribution (All time or last year)
    status_query = db.query(
        models.Attendance.status,
        func.count(models.Attendance.id)
    ).filter(
        models.Attendance.professional_id == professional_id
    ).group_by(models.Attendance.status).all()
    
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

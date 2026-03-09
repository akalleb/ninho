import os
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from pydantic import EmailStr

from .. import models
from ..database import get_db
from ..schemas.professional import (
    Professional, ProfessionalCreate, ProfessionalUpdate, ProfessionalBasic,
    ProfessionalStatusUpdate, PasswordChangeRequest, ProfessionalDeleteImpact,
    ProfessionalForceDeleteRequest
)
from ..services.auth_service import create_supabase_user, delete_supabase_auth_user
from ..core.security import (
    get_current_user, get_current_admin, hash_password, verify_password,
    encrypt_data, get_data_hash
)
from ..utils.uploads import save_upload

router = APIRouter(prefix="/professionals", tags=["Professionals"])
MEDIA_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "media")
AVATAR_DIR = os.path.join(MEDIA_ROOT, "avatars")

@router.post("/", response_model=Professional)
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
    
    cpf_hash = get_data_hash(professional.cpf)
    existing_cpf = db.query(models.Professional).filter(models.Professional.cpf_hash == cpf_hash).first()
    if existing_cpf:
        raise HTTPException(status_code=400, detail="CPF already registered")

    password_hash = hash_password(password_plain)
    rg_hash = get_data_hash(professional.rg) if professional.rg else None
    
    allowed_roles = {"admin", "operational", "health"}
    if professional.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Role inválida")

    db_professional = models.Professional(
        name=professional.name,
        email=email_normalized,
        role=professional.role,
        employment_type=professional.employment_type,
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


@router.put("/{professional_id}", response_model=Professional)
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
        if existing_email:
            raise HTTPException(status_code=400, detail="Email já está em uso por outro colaborador")

    existing_cpf = (
        db.query(models.Professional)
        .filter(
            models.Professional.cpf_hash == get_data_hash(professional.cpf),
            models.Professional.id != professional_id,
        )
        .first()
    )
    if existing_cpf:
        raise HTTPException(status_code=400, detail="CPF já está em uso por outro colaborador")

    db_professional.name = professional.name
    if email_normalized:
        db_professional.email = email_normalized
    allowed_roles = {"admin", "operational", "health"}
    if professional.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Role inválida")
    db_professional.role = professional.role
    db_professional.employment_type = professional.employment_type
    
    db_professional.cpf = encrypt_data(professional.cpf)
    db_professional.cpf_hash = get_data_hash(professional.cpf)
    db_professional.rg = encrypt_data(professional.rg) if professional.rg else None
    db_professional.rg_hash = get_data_hash(professional.rg) if professional.rg else None
    
    db_professional.birth_date = professional.birth_date
    db_professional.function_role = professional.function_role
    db_professional.admission_date = professional.admission_date
    db_professional.contract_validity = professional.contract_validity
    db_professional.volunteer_start_date = professional.volunteer_start_date
    db_professional.address = encrypt_data(professional.address) if professional.address else None
    db_professional.bank_data = encrypt_data(professional.bank_data) if professional.bank_data else None
    db_professional.specialty = professional.specialty
    db_professional.registry_number = professional.registry_number
    db_professional.cbo = professional.cbo
    db_professional.avatar_url = professional.avatar_url
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


@router.get("/", response_model=List[Professional])
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


@router.get("/basic", response_model=List[ProfessionalBasic])
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


@router.get("/me", response_model=Professional)
def read_my_profile(
    current_user: models.Professional = Depends(get_current_user),
):
    return current_user


@router.put("/{professional_id}/status", response_model=Professional)
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


@router.post("/{professional_id}/password", status_code=204)
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


@router.get("/{professional_id}", response_model=Professional)
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


@router.get("/{professional_id}/delete-impact", response_model=ProfessionalDeleteImpact)
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


@router.post("/{professional_id}/force-delete")
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


@router.post("/{professional_id}/avatar", response_model=Professional)
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


@router.post("/{professional_id}/cover", response_model=Professional)
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

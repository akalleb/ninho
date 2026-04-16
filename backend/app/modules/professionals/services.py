from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from typing import Optional, List, Dict
from datetime import date
from . import models, schemas
from ...core.security import hash_password, verify_password, encrypt_data, get_data_hash, decrypt_data
from ...core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from ...core.supabase import supabase
from ...utils.uploads import save_upload
from ...models import (
    Attendance, 
    MultidisciplinaryEvolution, 
    ResourceSource, 
    Wallet, 
    Revenue, 
    Expense, 
    Notification
)
import httpx
import json
import os
import logging
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger("ninho_api")
APP_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEDIA_ROOT = os.path.join(APP_DIR, "media")
AVATAR_DIR = os.path.join(MEDIA_ROOT, "avatars")
COVERS_DIR = os.path.join(MEDIA_ROOT, "covers")
os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(COVERS_DIR, exist_ok=True)

class ProfessionalService:
    @staticmethod
    def normalize_access_overrides(access_overrides: Optional[dict]) -> dict:
        if not isinstance(access_overrides, dict):
            return {
                "allow_pages": [],
                "deny_pages": [],
                "allow_features": [],
                "deny_features": [],
            }
        return {
            "allow_pages": [str(x) for x in access_overrides.get("allow_pages", []) if x],
            "deny_pages": [str(x) for x in access_overrides.get("deny_pages", []) if x],
            "allow_features": [str(x) for x in access_overrides.get("allow_features", []) if x],
            "deny_features": [str(x) for x in access_overrides.get("deny_features", []) if x],
        }

    @staticmethod
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
                        logger.error(f"Supabase update_user falhou ({resp.status_code}) para {target_email}: {detail}")
                        raise HTTPException(status_code=400, detail="Não foi possível sincronizar o usuário no Supabase Auth")

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
                logger.error(f"Supabase create_user falhou ({create_resp.status_code}) para {target_email}: {message}")

                if create_resp.status_code in (400, 409, 422):
                    user_id = _find_user_id_by_email()
                    if user_id:
                        _update_user(user_id)
                        logger.info(f"Supabase user updated (admin) for {target_email}")
                        return

                raise HTTPException(
                    status_code=400,
                    detail="Não foi possível sincronizar o usuário no Supabase Auth",
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

    @staticmethod
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

    @classmethod
    def create(cls, db: Session, professional: schemas.ProfessionalCreate) -> models.Professional:
        email_normalized = professional.email.strip().lower()
        password_plain = (professional.password or "").strip()
        
        # Fortalecer validação de senha: mínimo 8 chars + complexidade
        if len(password_plain) < 8:
            raise HTTPException(status_code=400, detail="Senha deve ter no mínimo 8 caracteres.")
        
        # Verificar complexidade
        has_upper = any(c.isupper() for c in password_plain)
        has_lower = any(c.islower() for c in password_plain)
        has_digit = any(c.isdigit() for c in password_plain)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password_plain)
        
        if not (has_upper and has_lower and has_digit):
            raise HTTPException(
                status_code=400, 
                detail="Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número."
            )

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
            access_overrides=json.dumps(cls.normalize_access_overrides(professional.access_overrides))
            if professional.access_overrides
            else None,
        )
        metadata = {
            "name": professional.name,
            "role": professional.role
        }
        try:
            cls.create_supabase_user(email_normalized, password_plain, metadata)
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

    @classmethod
    def update(cls, db: Session, professional_id: int, professional: schemas.ProfessionalUpdate) -> models.Professional:
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
                raise HTTPException(
                    status_code=400, detail="Email já está em uso por outro colaborador"
                )
        else:
            existing_email = None

        if professional.cpf:
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
        if professional.access_overrides is not None:
            db_professional.access_overrides = json.dumps(
                cls.normalize_access_overrides(professional.access_overrides)
            )

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
                cls.create_supabase_user(db_professional.email, password_plain, metadata)
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(status_code=400, detail="Não foi possível sincronizar a senha no Supabase Auth.")

        db.commit()
        db.refresh(db_professional)
        return db_professional

    @classmethod
    def get_access_overrides(cls, db: Session, professional_id: int) -> dict:
        professional = (
            db.query(models.Professional)
            .filter(models.Professional.id == professional_id)
            .first()
        )
        if professional is None:
            raise HTTPException(status_code=404, detail="Professional not found")

        parsed = None
        if professional.access_overrides:
            try:
                parsed = json.loads(professional.access_overrides)
            except Exception:
                parsed = None
        return cls.normalize_access_overrides(parsed)

    @classmethod
    def update_access_overrides(cls, db: Session, professional_id: int, access_overrides: dict) -> dict:
        professional = (
            db.query(models.Professional)
            .filter(models.Professional.id == professional_id)
            .first()
        )
        if professional is None:
            raise HTTPException(status_code=404, detail="Professional not found")

        normalized = cls.normalize_access_overrides(access_overrides)
        professional.access_overrides = json.dumps(normalized)
        db.commit()
        return normalized

    @classmethod
    def delete(cls, db: Session, professional_id: int) -> dict:
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
            auth_deleted = cls.delete_supabase_auth_user(target_email)
        except Exception:
            auth_deleted = False
        return {"message": "Colaborador excluído com sucesso", "auth_deleted": auth_deleted}

    @classmethod
    def force_delete(cls, db: Session, professional_id: int, confirm_email: str) -> dict:
        professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
        if professional is None:
            raise HTTPException(status_code=404, detail="Professional not found")

        expected = (professional.email or "").strip().lower()
        provided = (confirm_email or "").strip().lower()
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
            # Nullify references
            db.query(Attendance).filter(Attendance.professional_id == professional_id).update(
                {Attendance.professional_id: None}, synchronize_session=False
            )
            db.query(MultidisciplinaryEvolution).filter(MultidisciplinaryEvolution.professional_id == professional_id).update(
                {MultidisciplinaryEvolution.professional_id: None}, synchronize_session=False
            )
            db.query(ResourceSource).filter(ResourceSource.created_by_id == professional_id).update(
                {ResourceSource.created_by_id: None}, synchronize_session=False
            )
            db.query(Wallet).filter(Wallet.created_by_id == professional_id).update(
                {Wallet.created_by_id: None}, synchronize_session=False
            )
            db.query(Wallet).filter(Wallet.target_professional_id == professional_id).update(
                {Wallet.target_professional_id: None}, synchronize_session=False
            )
            db.query(Revenue).filter(Revenue.created_by_id == professional_id).update(
                {Revenue.created_by_id: None}, synchronize_session=False
            )
            db.query(Expense).filter(Expense.created_by_id == professional_id).update(
                {Expense.created_by_id: None}, synchronize_session=False
            )
            db.query(Notification).filter(Notification.created_by_id == professional_id).update(
                {Notification.created_by_id: None}, synchronize_session=False
            )
            db.query(Notification).filter(Notification.target_professional_id == professional_id).update(
                {Notification.target_professional_id: None}, synchronize_session=False
            )

            db.delete(professional)
            db.commit()
            auth_deleted = False
            try:
                auth_deleted = cls.delete_supabase_auth_user(target_email)
            except Exception:
                auth_deleted = False
            return {"message": "Colaborador excluído com sucesso", "auth_deleted": auth_deleted}
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Não foi possível excluir este colaborador devido a vínculos no banco.")

    @staticmethod
    def get_delete_impact(db: Session, professional_id: int) -> schemas.ProfessionalDeleteImpact:
        professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
        if professional is None:
            raise HTTPException(status_code=404, detail="Professional not found")

        references = {
            "attendances": db.query(Attendance).filter(Attendance.professional_id == professional_id).count(),
            "evolutions": db.query(MultidisciplinaryEvolution).filter(MultidisciplinaryEvolution.professional_id == professional_id).count(),
            "resource_sources_created": db.query(ResourceSource).filter(ResourceSource.created_by_id == professional_id).count(),
            "wallets_created": db.query(Wallet).filter(Wallet.created_by_id == professional_id).count(),
            "wallets_target": db.query(Wallet).filter(Wallet.target_professional_id == professional_id).count(),
            "revenues_created": db.query(Revenue).filter(Revenue.created_by_id == professional_id).count(),
            "expenses_created": db.query(Expense).filter(Expense.created_by_id == professional_id).count(),
            "notifications_created": db.query(Notification).filter(Notification.created_by_id == professional_id).count(),
            "notifications_target": db.query(Notification).filter(Notification.target_professional_id == professional_id).count(),
        }

        return schemas.ProfessionalDeleteImpact(
            id=professional.id,
            name=professional.name,
            email=professional.email,
            references=references,
        )

    @staticmethod
    async def upload_avatar(db: Session, professional_id: int, file: UploadFile) -> models.Professional:
        professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
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

    @staticmethod
    async def upload_cover(db: Session, professional_id: int, file: UploadFile) -> models.Professional:
        professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
        if professional is None:
            raise HTTPException(status_code=404, detail="Professional not found")

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

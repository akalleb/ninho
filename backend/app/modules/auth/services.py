from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import timedelta
from . import schemas
from ..professionals.models import Professional
from ...core.security import verify_password, create_access_token, hash_password, ACCESS_TOKEN_EXPIRE_MINUTES

class AuthService:
    @staticmethod
    def login(db: Session, payload: schemas.LoginRequest):
        professional = db.query(Professional).filter(
            Professional.email == payload.email
        ).first()
        
        if professional is None or not professional.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas"
            )
        
        if professional.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo"
            )
        
        if not verify_password(payload.password, professional.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas"
            )
        
        # Create JWT token
        access_token = create_access_token(
            data={
                "sub": str(professional.id),
                "email": professional.email,
                "role": professional.role
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": professional.id,
                "name": professional.name,
                "email": professional.email,
                "role": professional.role,
                "status": professional.status or "active",
                "avatar_url": professional.avatar_url,
                "cover_url": professional.cover_url
            }
        }

    @staticmethod
    def change_password(db: Session, current_user: Professional, payload: schemas.PasswordChangeRequest):
        if not current_user.password_hash:
            raise HTTPException(status_code=400, detail="Usuário sem senha cadastrada")
        
        if not verify_password(payload.old_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Senha atual incorreta")
        
        current_user.password_hash = hash_password(payload.new_password)
        db.commit()

"""
Authentication Router
/auth/login, /auth/me, /auth/change-password
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from .. import models
from ..core.security import (
    verify_password, hash_password, create_access_token,
    get_current_user, Token, ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..core.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str
    avatar_url: str | None
    cover_url: str | None = None

    class Config:
        from_attributes = True


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    professional = db.query(models.Professional).filter(
        models.Professional.email == payload.email
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
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": professional.id,
            "name": professional.name,
            "email": professional.email,
            "role": professional.role,
            "status": professional.status or "active",
            "avatar_url": professional.avatar_url,
            "cover_url": professional.cover_url
        }
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: models.Professional = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user


@router.post("/change-password", status_code=204)
def change_password(
    payload: PasswordChangeRequest,
    current_user: models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password"""
    if not current_user.password_hash:
        raise HTTPException(status_code=400, detail="Usuário sem senha cadastrada")
    
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return None

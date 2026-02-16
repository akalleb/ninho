"""
Security utilities: password hashing, JWT tokens
"""
import os
import hashlib
import hmac
import base64
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, ENCRYPTION_KEY
from .supabase import verify_supabase_token
from ..database import get_db
from .. import models
from cryptography.fernet import Fernet

fernet = Fernet(ENCRYPTION_KEY) if ENCRYPTION_KEY else None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def encrypt_data(data: str) -> str:
    """Encrypt sensitive data"""
    if not fernet or not data:
        return data
    return fernet.encrypt(data.encode()).decode()


def decrypt_data(data: str) -> str:
    """Decrypt sensitive data"""
    if not fernet or not data:
        return data
    try:
        return fernet.decrypt(data.encode()).decode()
    except Exception:
        # If decryption fails (e.g. data was not encrypted), return original
        return data



def get_data_hash(data: str) -> str:
    """Generate deterministic hash for blind indexing (searchable encrypted data)"""
    if not data:
        return None
    # Use HMAC-SHA256 with SECRET_KEY as salt
    return hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()



class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


def hash_password(password: str) -> str:
    """Hash password with PBKDF2"""
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return base64.b64encode(salt + dk).decode("utf-8")


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        data = base64.b64decode(stored_hash.encode("utf-8"))
        salt, original_dk = data[:16], data[16:]
        new_dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(original_dk, new_dk)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token (Legacy/Local)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[TokenData]:
    """Decode and validate JWT token (Legacy/Local)"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")
        if user_id is None:
            return None
        return TokenData(user_id=int(user_id), email=email, role=role)
    except JWTError:
        return None


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.Professional:
    """Get current authenticated user from Supabase token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Try to verify as Supabase Token
    supabase_user = verify_supabase_token(token)
    
    if supabase_user:
        # Use email from Supabase to find local user
        email = supabase_user.email
        if not email:
            raise credentials_exception
            
        user = db.query(models.Professional).filter(
            models.Professional.email == email
        ).first()
        
    else:
        # 2. Fallback to Local Token (for backward compatibility during migration)
        token_data = decode_token(token)
        if token_data is None:
            raise credentials_exception
            
        user = db.query(models.Professional).filter(
            models.Professional.id == token_data.user_id
        ).first()
    
    if user is None:
        raise credentials_exception
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    return user


async def get_current_admin(
    current_user: models.Professional = Depends(get_current_user)
) -> models.Professional:
    """Require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores"
        )
    return current_user


async def get_current_admin_or_operational(
    current_user: models.Professional = Depends(get_current_user),
) -> models.Professional:
    if current_user.role not in {"admin", "operational"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a gestores e operacionais",
        )
    return current_user

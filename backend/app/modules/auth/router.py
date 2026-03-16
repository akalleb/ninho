from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...database import get_db
from ...core.security import get_current_user
from . import schemas, services
from ...modules.professionals import models as prof_models

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    return services.AuthService.login(db, payload)

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: prof_models.Professional = Depends(get_current_user)):
    return current_user

@router.post("/change-password", status_code=204)
def change_password(
    payload: schemas.PasswordChangeRequest,
    current_user: prof_models.Professional = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    services.AuthService.change_password(db, current_user, payload)
    return None

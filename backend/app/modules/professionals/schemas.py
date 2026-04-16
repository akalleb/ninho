from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, date
from typing import Optional, Dict, List
import json

from ...core.security import decrypt_data

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
    access_overrides: Dict[str, List[str]] | None = None

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

    @field_validator('access_overrides', mode='before')
    @classmethod
    def parse_access_overrides(cls, v):
        if v is None:
            return None
        if isinstance(v, dict):
            return v
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                return parsed if isinstance(parsed, dict) else None
            except Exception:
                return None
        return None

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
    
    class Config:
        from_attributes = True

class ProfessionalStatusUpdate(BaseModel):
    status: str

class ProfessionalAccessOverridesUpdate(BaseModel):
    access_overrides: Dict[str, List[str]]

class ProfessionalForceDeleteRequest(BaseModel):
    confirm: str

class ProfessionalDeleteImpact(BaseModel):
    id: int
    name: str
    email: str
    references: Dict[str, int]

class ProductionReport(BaseModel):
    professional_name: str
    total_attendances: int

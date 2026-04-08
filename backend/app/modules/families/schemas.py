from pydantic import BaseModel, computed_field, field_validator
from datetime import date, datetime
from typing import Optional, List
from ...core.security import decrypt_data

class FamilyBase(BaseModel):
    name_responsible: str
    nis_family: str | None = None
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
    composition_familiar: str | None = None
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


class FamilyResponse(FamilyBase):
    id: str
    created_at: datetime
    updated_at: datetime | None = None

    @field_validator(
        "cpf",
        "rg",
        "nis_responsible",
        "address_full",
        "phone",
        "email",
        "family_observations",
        mode="before",
    )
    @classmethod
    def decrypt_sensitive_data(cls, v):
        return decrypt_data(v) if v else None

    @computed_field
    @property
    def per_capita_income(self) -> float:
        total_members = 1 + (self.dependents_count or 0)
        return self.monthly_income / total_members if total_members > 0 else 0

    class Config:
        from_attributes = True

class FamilyAssistanceBase(BaseModel):
    assistance_type: str
    description: Optional[str] = None
    date_provided: Optional[datetime] = None
    quantity: Optional[float] = 1.0
    professional_id: Optional[int] = None

class FamilyAssistanceCreate(FamilyAssistanceBase):
    pass

class FamilyAssistanceResponse(FamilyAssistanceBase):
    id: int
    family_id: str
    created_at: datetime
    professional_name: Optional[str] = None

    class Config:
        from_attributes = True

class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BulkAssistanceRequest(BaseModel):
    family_ids: List[str]
    assistance: FamilyAssistanceCreate

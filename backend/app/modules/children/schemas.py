from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from ...core.security import decrypt_data

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


class ChildResponse(ChildBase):
    id: int
    created_at: datetime
    report_url: str | None = None
    child_id_url: str | None = None
    vaccination_card_url: str | None = None
    school_history_url: str | None = None

    @field_validator(
        "diagnosis",
        "allergies",
        "gestational_history",
        "notes",
        "emergency_contact",
        mode="before",
    )
    @classmethod
    def decrypt_sensitive_data(cls, v):
        return decrypt_data(v) if v else None

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


class ChildMedicationResponse(ChildMedicationBase):
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
    protocol_scores: str | None = None


class EvolutionCreate(EvolutionBase):
    pass


class EvolutionResponse(EvolutionBase):
    id: int
    date_service: datetime
    created_at: datetime
    child: Optional[ChildResponse] = None

    class Config:
        from_attributes = True

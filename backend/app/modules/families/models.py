from sqlalchemy import Column, Integer, String, Date, Float, Boolean, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ...database import Base

class VulnerabilityStatus(str, enum.Enum):
    UNEMPLOYMENT = "desemprego"
    LOW_INCOME = "baixa_renda"
    FOOD_INSECURITY = "inseguranca_alimentar"
    OTHERS = "outros"

class Family(Base):
    __tablename__ = "families"

    id = Column(String, primary_key=True, index=True) # UUID stored as string
    
    # Responsible Data
    name_responsible = Column(String, index=True)
    rg = Column(String, nullable=True) # Encrypted
    rg_hash = Column(String, nullable=True, index=True) # Blind Index
    cpf = Column(String, index=True) # Encrypted
    cpf_hash = Column(String, unique=True, index=True) # Blind Index
    nis_responsible = Column(String, nullable=True) # Encrypted
    birth_date = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    nationality = Column(String, default="Brasileira")
    marital_status = Column(String, nullable=True)
    profession = Column(String, nullable=True)

    # Address & Geolocation
    address_full = Column(Text, nullable=True)
    neighborhood = Column(String, index=True) # Indexed for filtering
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    reference_point = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Contacts
    phone = Column(String, nullable=True)
    is_whatsapp = Column(Boolean, default=False)
    email = Column(String, nullable=True)

    # Socioeconomic Profile
    composition_familiar = Column(Text, nullable=True) # JSON stored as Text
    monthly_income = Column(Float, default=0.0)
    dependents_count = Column(Integer, default=0)
    vulnerability_status = Column(String, default=VulnerabilityStatus.LOW_INCOME)
    housing_conditions = Column(Text, nullable=True)

    # Assistance & Observations
    assistance_status = Column(String, default="active") # active, inactive, suspended
    family_observations = Column(Text, nullable=True)

    # Documentation URLs
    residence_proof_url = Column(String, nullable=True)
    income_proof_url = Column(String, nullable=True)
    vaccination_card_url = Column(String, nullable=True)
    others_docs_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

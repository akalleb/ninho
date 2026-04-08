from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ...database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"  # Gestor
    OPERATIONAL = "operational"  # Almoxarifado/Social
    HEALTH = "health"  # Médico/Terapeuta

class EmploymentType(str, enum.Enum):
    EFFECTIVE = "effective" # Efetivo
    VOLUNTEER = "volunteer" # Voluntário

class Professional(Base):
    __tablename__ = "professionals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default=UserRole.HEALTH)  # admin, operational, health
    
    # Common fields
    cpf = Column(String, index=True) # Encrypted
    cpf_hash = Column(String, unique=True, index=True) # Blind Index for search
    rg = Column(String, nullable=True) # Encrypted
    rg_hash = Column(String, nullable=True, index=True) # Blind Index for search
    birth_date = Column(Date, nullable=True)
    function_role = Column(String, nullable=True) # Função
    
    # Employment Type
    employment_type = Column(String, default=EmploymentType.EFFECTIVE) # effective, volunteer

    # Specific Fields
    admission_date = Column(Date, nullable=True)
    contract_validity = Column(Date, nullable=True)
    volunteer_start_date = Column(Date, nullable=True) # Data do Voluntariado
    
    # Sensitive Data (Should be encrypted in a real production env at app level before saving if required strictly)
    address = Column(Text, nullable=True)
    bank_data = Column(Text, nullable=True)

    # Auth / Access Control
    status = Column(String, default="active")
    password_hash = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    
    # Health Professional Specifics
    specialty = Column(String, nullable=True) 
    registry_number = Column(String, nullable=True) # CRM, CRP, etc.
    cbo = Column(String, nullable=True) # CBO
    cns = Column(String, nullable=True) # CNS do Profissional
    
    # Profile Extensions
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    social_media = Column(Text, nullable=True) # JSON stored as string: { "facebook": "...", "linkedin": "..." }
    skills = Column(Text, nullable=True) # Comma separated or JSON

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # String references to avoid circular imports during definition
    attendances = relationship("Attendance", back_populates="professional")
    resource_sources = relationship("ResourceSource", back_populates="created_by")

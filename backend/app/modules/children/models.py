from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Float, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ...database import Base

class HealthReferralStatus(str, enum.Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELED = "canceled"


class HealthReferralPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    birth_date = Column(DateTime)
    gender = Column(String, nullable=True)
    blood_type = Column(String, nullable=True) # A+, O-, etc.
    emergency_contact = Column(String, nullable=True)
    
    guardian_name = Column(String) # Pode ser redundante se tiver family_id, mas mantemos
    
    # Family Link
    family_id = Column(String, ForeignKey("families.id"), nullable=True)
    
    # Clinical & Classification
    diagnosis = Column(String, nullable=True) # CID
    is_diagnosis_closed = Column(Boolean, default=False)
    severity_level = Column(String, nullable=True) # leve, media, grave
    assistance_needs = Column(Text, nullable=True) # JSON list
    has_medical_report = Column(Boolean, default=False)
    report_url = Column(String, nullable=True)
    
    # Medical History
    allergies = Column(Text, nullable=True)
    gestational_history = Column(Text, nullable=True)
    
    # Biometrics (Latest)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    cephalic_perimeter = Column(Float, nullable=True)
    
    # Education & Social
    current_school = Column(String, nullable=True)
    current_year = Column(String, nullable=True)
    service_shift = Column(String, nullable=True) # matutino, vespertino
    has_access_treatment = Column(Boolean, default=True)
    difficulty_reason = Column(String, nullable=True)
    
    # Documents
    child_id_url = Column(String, nullable=True)
    vaccination_card_url = Column(String, nullable=True)
    school_history_url = Column(String, nullable=True)
    cns = Column(String, nullable=True) # CNS do Paciente
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family = relationship("Family")
    attendances = relationship("Attendance", back_populates="child")
    medications = relationship("ChildMedication", back_populates="child")
    evolutions = relationship("MultidisciplinaryEvolution", back_populates="child")
    referrals = relationship("HealthReferral", back_populates="child")

class ChildMedication(Base):
    __tablename__ = "child_medications"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    
    med_name = Column(String, index=True)
    dosage = Column(String, nullable=True)
    schedule = Column(String, nullable=True) # Horários
    frequency = Column(String, nullable=True)
    status = Column(String, default="continuo") # continuo, interrompido, sos
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    child = relationship("Child", back_populates="medications")

class MultidisciplinaryEvolution(Base):
    __tablename__ = "multidisciplinary_evolutions"
    
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    attendance_id = Column(Integer, ForeignKey("attendances.id"), nullable=True)
    
    date_service = Column(DateTime(timezone=True), server_default=func.now())
    service_type = Column(String) # Fisioterapia, Fonoaudiologia, etc.
    procedure_code = Column(String, nullable=True) # Código SIGTAP
    evolution_report = Column(Text) # Relato detalhado
    intermittences = Column(Text, nullable=True) # Intercorrências
    
    # Optional: Protocol Scores Snapshot
    protocol_scores = Column(Text, nullable=True) # JSON
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    child = relationship("Child", back_populates="evolutions")
    professional = relationship("Professional")
    attendance = relationship("Attendance", back_populates="evolution")

class HealthReferral(Base):
    __tablename__ = "health_referrals"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    
    specialty = Column(String, nullable=False) # Psicólogo, Dentista, etc.
    professional_name = Column(String, nullable=True) # Nome do profissional se já souber
    referral_date = Column(Date, nullable=False, default=func.now())
    
    status = Column(String, default=HealthReferralStatus.PENDING)
    priority = Column(String, default=HealthReferralPriority.MEDIUM)
    
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    child = relationship("Child", back_populates="referrals")

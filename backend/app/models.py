from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Date, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"  # Gestor
    OPERATIONAL = "operational"  # Almoxarifado/Social
    HEALTH = "health"  # Médico/Terapeuta

class EmploymentType(str, enum.Enum):
    EFFECTIVE = "effective" # Efetivo
    VOLUNTEER = "volunteer" # Voluntário

class ResourceSourceType(str, enum.Enum):
    AMENDMENT = "emenda"
    DONATION = "doacao"
    AGREEMENT = "convenio"
    EVENT = "evento"
    CROWDFUNDING = "crowdfunding"

class ResourceSourceStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    IN_PROGRESS = "in_progress" # Em Vigência

class WalletCategory(str, enum.Enum):
    EDUCATION = "educacao"
    HEALTH = "saude"
    SOCIAL_ASSISTANCE = "assistencia_social"
    INFRASTRUCTURE = "infraestrutura"
    FREE = "livre"

class PaymentMethod(str, enum.Enum):
    TRANSFER = "transferencia"
    PIX = "pix"
    BOLETO = "boleto"
    DEPOSIT = "deposito"
    CHECK = "cheque"

class RevenueStatus(str, enum.Enum):
    PENDING = "pendente"
    RECEIVED = "recebido"
    RECONCILED = "conciliado"
    CANCELLED = "cancelado"

class ExpenseStatus(str, enum.Enum):
    SCHEDULED = "agendado"
    PAID = "pago"
    REVERSED = "estornado"

class OriginSphere(str, enum.Enum):
    FEDERAL = "federal"
    STATE = "estadual"
    MUNICIPAL = "municipal"
    PRIVATE = "privado"

class Professional(Base):
    __tablename__ = "professionals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default=UserRole.HEALTH)  # admin, operational, health
    
    # Common fields
    cpf = Column(String, unique=True, index=True) # Sensitive
    rg = Column(String, nullable=True) # Sensitive
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

    attendances = relationship("Attendance", back_populates="professional")
    resource_sources = relationship("ResourceSource", back_populates="created_by")

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

class AttendanceStatus(str, enum.Enum):
    SCHEDULED = "agendado"
    WAITING = "em_espera"
    IN_PROGRESS = "em_atendimento"
    FINISHED = "finalizado"
    NO_SHOW = "falta"

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=True) # Nullable if just in queue without assigned professional yet
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=True) # Recurso que paga o atendimento
    
    status = Column(String, default=AttendanceStatus.SCHEDULED) 
    
    check_in_time = Column(DateTime(timezone=True), nullable=True) # Chegada na recepção
    scheduled_time = Column(DateTime(timezone=True), nullable=True) # Horário Agendado
    start_time = Column(DateTime(timezone=True), nullable=True) # Início do atendimento
    end_time = Column(DateTime(timezone=True), nullable=True) # Fim do atendimento
    
    notes = Column(Text, nullable=True)

    child = relationship("Child", back_populates="attendances")
    professional = relationship("Professional", back_populates="attendances")
    wallet = relationship("Wallet")
    evolution = relationship("MultidisciplinaryEvolution", back_populates="attendance", uselist=False)

# Update Evolution to link back to Attendance
MultidisciplinaryEvolution.attendance_id = Column(Integer, ForeignKey("attendances.id"), nullable=True)
MultidisciplinaryEvolution.attendance = relationship("Attendance", back_populates="evolution")

class ResourceSource(Base):
    __tablename__ = "resource_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # Store enum value
    
    # Conditional Fields
    amendment_number = Column(String, nullable=True)
    donor_institution = Column(String, nullable=True)
    term_start = Column(Date, nullable=True)
    term_end = Column(Date, nullable=True)
    
    description = Column(Text, nullable=True)
    total_value_estimated = Column(Float, nullable=True)
    
    status = Column(String, default="active")
    
    # Improvements
    document_url = Column(String, nullable=True)
    balance_used = Column(Float, default=0.0)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("professionals.id"))
    
    created_by = relationship("Professional", back_populates="resource_sources")

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    is_restricted = Column(Boolean, default=False) # Recurso Carimbado
    category = Column(String) # WalletCategory Enum
    
    balance = Column(Float, default=0.0)
    
    # Bank Details
    bank_name = Column(String, nullable=True) # Ex: Banco do Brasil
    agency = Column(String, nullable=True) # Ex: 1234-5
    account_number = Column(String, nullable=True) # Ex: 56789-0
    pix_key = Column(String, nullable=True) # Ex: 12.345.678/0001-90
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    created_by_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    target_professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    
    created_by = relationship("Professional", foreign_keys=[created_by_id])
    target_professional = relationship("Professional", foreign_keys=[target_professional_id])
    resource_sources = relationship("ResourceSource", back_populates="wallet")

# Add Relationship to ResourceSource
ResourceSource.wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=True)
ResourceSource.wallet = relationship("Wallet", back_populates="resource_sources")

class Revenue(Base):
    __tablename__ = "revenues"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False) # Decimal(15,2) handled as Float for simplicity in SQLite/PG usually, but can use Numeric
    received_at = Column(Date, nullable=False)
    
    source_id = Column(Integer, ForeignKey("resource_sources.id"))
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    
    payment_method = Column(String) # PaymentMethod Enum
    description = Column(Text, nullable=True)
    receipt_url = Column(String, nullable=True)
    chart_of_accounts_id = Column(Integer, nullable=True) # Placeholder for Plan of Accounts
    
    # New Fields
    origin_sphere = Column(String, default=OriginSphere.PRIVATE)
    status = Column(String, default=RevenueStatus.PENDING)
    
    # Reconciliation
    reconciliation_date = Column(Date, nullable=True)
    is_reconciled = Column(Boolean, default=False)
    
    # Tracking
    tracking_docs_url = Column(Text, nullable=True) # JSON or Comma separated links
    tracking_code = Column(String, nullable=True)
    observations = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)

    source = relationship("ResourceSource")
    wallet = relationship("Wallet")
    created_by = relationship("Professional")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    paid_at = Column(Date, nullable=True) # Data do Pagamento (ou agendamento)
    
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    category_id = Column(Integer, nullable=True) # Plano de Contas
    
    destination = Column(String, nullable=False) # Favorecido (CNPJ/Nome)
    description = Column(Text, nullable=True)
    document_ref = Column(String, nullable=True) # NF/Recibo
    document_url = Column(String, nullable=True)
    
    status = Column(String, default=ExpenseStatus.PAID)
    
    # Tracking Source (Rastreabilidade do Recurso Original)
    # Em um modelo complexo, seria many-to-many. Aqui simplificaremos:
    # Opcional: vincular a uma fonte específica se for recurso carimbado estrito
    source_id = Column(Integer, ForeignKey("resource_sources.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)

    wallet = relationship("Wallet")
    source = relationship("ResourceSource")
    created_by = relationship("Professional")

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
    rg = Column(String, nullable=True)
    cpf = Column(String, unique=True, index=True)
    nis_responsible = Column(String, nullable=True)
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

class NotificationType(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default=NotificationType.INFO)
    
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    target_audience = Column(String, default="all") # all, health, admin, operational
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    target_professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    
    created_by = relationship("Professional", foreign_keys=[created_by_id])
    target_professional = relationship("Professional", foreign_keys=[target_professional_id])

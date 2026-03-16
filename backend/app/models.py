from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Date, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

# Re-export models from modules to maintain backward compatibility
from .modules.families.models import (
    Family, 
    VulnerabilityStatus
)
from .modules.children.models import (
    Child, 
    ChildMedication, 
    MultidisciplinaryEvolution, 
    HealthReferral, 
    HealthReferralStatus, 
    HealthReferralPriority
)
from .modules.finances.models import (
    ResourceSource,
    ResourceSourceType,
    ResourceSourceStatus,
    Wallet,
    WalletCategory,
    Revenue,
    RevenueStatus,
    PaymentMethod,
    OriginSphere,
    Expense,
    ExpenseStatus
)
from .modules.projects.models import (
    Project,
    ProjectStatus,
    ProjectTask,
    ProjectTaskStatus
)
from .modules.professionals.models import (
    Professional,
    UserRole,
    EmploymentType
)

class InventoryCategory(str, enum.Enum):
    CLEANING = "cleaning"
    FOOD = "food"
    SUPPLY = "supply"
    EQUIPMENT = "equipment"
    OTHER = "other"

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

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    min_stock = Column(Float, nullable=True)
    current_stock = Column(Float, nullable=False, default=0)
    location = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InventoryMovementType(str, enum.Enum):
    IN = "entrada"
    OUT = "saida"


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    type = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    reference = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("InventoryItem")

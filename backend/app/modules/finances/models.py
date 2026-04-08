from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ...database import Base

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
    PENDING = "pendente"
    SCHEDULED = "agendado"
    PAID = "pago"
    REVERSED = "estornado"

class OriginSphere(str, enum.Enum):
    FEDERAL = "federal"
    STATE = "estadual"
    MUNICIPAL = "municipal"
    PRIVATE = "privado"

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
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=True)
    
    created_by = relationship("Professional", back_populates="resource_sources")
    wallet = relationship("Wallet", back_populates="resource_sources")

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

    auto_charge_enabled = Column(Boolean, default=False)
    auto_charge_mode = Column(String, nullable=True)
    auto_charge_flat_amount = Column(Float, nullable=True)
    auto_charge_service_type_rates = Column(Text, nullable=True)
    auto_charge_professional_rates = Column(Text, nullable=True)
    auto_charge_expense_destination = Column(String, nullable=True)
    auto_charge_expense_description = Column(Text, nullable=True)
    auto_charge_expense_category_id = Column(Integer, nullable=True)
    payroll_fixed_staff = Column(Text, nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    created_by_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    target_professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)
    
    created_by = relationship("Professional", foreign_keys=[created_by_id])
    target_professional = relationship("Professional", foreign_keys=[target_professional_id])
    resource_sources = relationship("ResourceSource", back_populates="wallet")

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

    attendance_id = Column(Integer, ForeignKey("attendances.id"), nullable=True)
    is_auto_generated = Column(Boolean, default=False)
    auto_charge_mode = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("professionals.id"), nullable=True)

    wallet = relationship("Wallet")
    source = relationship("ResourceSource")
    created_by = relationship("Professional")

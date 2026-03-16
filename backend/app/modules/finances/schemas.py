from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional, List, Dict

class ResourceSourceBase(BaseModel):
    name: str
    type: str
    amendment_number: str | None = None
    donor_institution: str | None = None
    term_start: date | None = None
    term_end: date | None = None
    description: str | None = None
    total_value_estimated: float | None = None
    status: str = "active"
    wallet_id: int | None = None

class ResourceSourceCreate(ResourceSourceBase):
    create_initial_revenue: bool = False
    initial_revenue_status: str | None = "pendente"

class ResourceSourceUpdate(ResourceSourceBase):
    pass

class ResourceSourceResponse(ResourceSourceBase):
    id: int
    document_url: str | None = None
    balance_used: float = 0.0
    created_at: datetime
    created_by_id: int | None = None

    class Config:
        from_attributes = True

class WalletBase(BaseModel):
    name: str
    description: str | None = None
    is_restricted: bool = False
    category: str
    bank_name: str | None = None
    agency: str | None = None
    account_number: str | None = None
    pix_key: str | None = None
    auto_charge_enabled: bool = False
    auto_charge_mode: str | None = None
    auto_charge_flat_amount: float | None = None
    auto_charge_service_type_rates: Dict[str, float] | None = None
    auto_charge_professional_rates: Dict[str, float] | None = None
    auto_charge_expense_destination: str | None = None
    auto_charge_expense_description: str | None = None
    auto_charge_expense_category_id: int | None = None
    payroll_fixed_staff: Dict[str, dict] | None = None

class WalletCreate(WalletBase):
    initial_balance: float = 0.0

class WalletUpdate(WalletBase):
    pass

class WalletResponse(WalletBase):
    id: int
    balance: float
    created_at: datetime
    last_updated: datetime | None = None
    created_by_id: int | None = None

    class Config:
        from_attributes = True

    @field_validator(
        "auto_charge_service_type_rates",
        "auto_charge_professional_rates",
        "payroll_fixed_staff",
        mode="before",
    )
    @classmethod
    def parse_rates_json(cls, v):
        if v is None:
            return None
        if isinstance(v, dict):
            return v
        if isinstance(v, str) and v.strip():
            try:
                import json
                parsed = json.loads(v)
                return parsed if isinstance(parsed, dict) else None
            except Exception:
                return None
        return None

class WalletDashboardStats(BaseModel):
    incomes_month: float
    expenses_month: float
    pending_incomes: float
    pending_expenses: float
    current_balance: float

class WalletDashboardResponse(BaseModel):
    wallet: WalletResponse
    stats: WalletDashboardStats

class TransferCreate(BaseModel):
    source_wallet_id: int
    target_wallet_id: int
    amount: float
    transfer_date: date | None = None
    description: str | None = None

class ExpenseBase(BaseModel):
    amount: float
    paid_at: date | None = None
    wallet_id: int
    category_id: int | None = None
    destination: str
    description: str | None = None
    document_ref: str | None = None
    status: str = "pago"
    source_id: int | None = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    document_url: str | None = None
    attendance_id: int | None = None
    is_auto_generated: bool | None = None
    auto_charge_mode: str | None = None
    created_at: datetime
    created_by_id: int | None = None

    class Config:
        from_attributes = True

class ExpensePayRequest(BaseModel):
    paid_at: date | None = None

class AttendancePayrollBulkPayRequest(BaseModel):
    expense_ids: List[int]
    month_key: str | None = None
    paid_at: date | None = None

class RevenueBase(BaseModel):
    amount: float
    received_at: date
    source_id: int | None = None
    wallet_id: int | None = None
    payment_method: str
    description: str | None = None
    origin_sphere: str = "privado"
    status: str = "pendente"
    reconciliation_date: date | None = None
    is_reconciled: bool = False
    tracking_code: str | None = None
    observations: str | None = None

class RevenueCreate(RevenueBase):
    source_id: int
    wallet_id: int

class RevenueUpdate(BaseModel):
    amount: float | None = None
    received_at: date | None = None
    source_id: int | None = None
    wallet_id: int | None = None
    payment_method: str | None = None
    description: str | None = None
    origin_sphere: str | None = None
    status: str | None = None
    reconciliation_date: date | None = None
    is_reconciled: bool | None = None
    tracking_code: str | None = None
    observations: str | None = None

class RevenueResponse(RevenueBase):
    id: int
    receipt_url: str | None = None
    created_at: datetime
    created_by_id: int | None = None

    class Config:
        from_attributes = True

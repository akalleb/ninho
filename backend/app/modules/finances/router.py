from typing import List, Optional
from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.orm import Session
from datetime import date
from ...database import SessionLocal

from .schemas import (
    ResourceSourceCreate, ResourceSourceUpdate, ResourceSourceResponse,
    WalletCreate, WalletUpdate, WalletResponse, WalletDashboardResponse,
    TransferCreate, ExpenseCreate, ExpenseResponse, ExpensePayRequest,
    AttendancePayrollBulkPayRequest, RevenueCreate, RevenueUpdate, RevenueResponse
)
from .services import FinanceService

router = APIRouter(tags=["Finances"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Resource Sources ---
@router.post("/resource-sources/", response_model=ResourceSourceResponse)
def create_resource_source(source: ResourceSourceCreate, db: Session = Depends(get_db)):
    return FinanceService.create_resource_source(db, source)

@router.get("/resource-sources/", response_model=List[ResourceSourceResponse])
def read_resource_sources(
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return FinanceService.get_resource_sources(db, type, status)

@router.get("/resource-sources/{source_id}", response_model=ResourceSourceResponse)
def read_resource_source(source_id: int, db: Session = Depends(get_db)):
    return FinanceService.get_resource_source_by_id(db, source_id)

@router.put("/resource-sources/{source_id}", response_model=ResourceSourceResponse)
def update_resource_source(source_id: int, source: ResourceSourceUpdate, db: Session = Depends(get_db)):
    return FinanceService.update_resource_source(db, source_id, source)

@router.delete("/resource-sources/{source_id}", status_code=204)
def delete_resource_source(
    source_id: int,
    force: bool = Query(False),
    db: Session = Depends(get_db),
):
    return FinanceService.delete_resource_source(db, source_id, force)

@router.post("/resource-sources/{source_id}/document")
async def upload_resource_document(
    source_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await FinanceService.upload_resource_document(db, source_id, file)

# --- Wallets ---
@router.post("/wallets/", response_model=WalletResponse)
def create_wallet(wallet: WalletCreate, db: Session = Depends(get_db)):
    return FinanceService.create_wallet(db, wallet)

@router.get("/wallets/", response_model=List[WalletResponse])
def read_wallets(db: Session = Depends(get_db)):
    return FinanceService.get_wallets(db)

@router.get("/wallets/{wallet_id}", response_model=WalletResponse)
def read_wallet(wallet_id: int, db: Session = Depends(get_db)):
    return FinanceService.get_wallet_by_id(db, wallet_id)

@router.put("/wallets/{wallet_id}", response_model=WalletResponse)
def update_wallet(wallet_id: int, wallet: WalletUpdate, db: Session = Depends(get_db)):
    return FinanceService.update_wallet(db, wallet_id, wallet)

@router.delete("/wallets/{wallet_id}", status_code=204)
def delete_wallet(
    wallet_id: int,
    force: bool = Query(False),
    db: Session = Depends(get_db),
):
    return FinanceService.delete_wallet(db, wallet_id, force)

@router.get("/wallets/{wallet_id}/dashboard", response_model=WalletDashboardResponse)
def get_wallet_dashboard(wallet_id: int, db: Session = Depends(get_db)):
    return FinanceService.get_wallet_dashboard(db, wallet_id)

@router.get("/wallets/{wallet_id}/export")
def export_wallet_data(wallet_id: int, db: Session = Depends(get_db)):
    return FinanceService.export_wallet_data(db, wallet_id)

@router.post("/wallets/transfer", status_code=201)
def transfer_funds(transfer: TransferCreate, db: Session = Depends(get_db)):
    return FinanceService.transfer_funds(db, transfer)

# --- Expenses ---
@router.post("/expenses/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    return FinanceService.create_expense(db, expense)

@router.get("/expenses/", response_model=List[ExpenseResponse])
def read_expenses(
    wallet_id: Optional[int] = None,
    source_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    return FinanceService.get_expenses(db, wallet_id, source_id, start_date, end_date)

@router.post("/expenses/{expense_id}/pay", response_model=ExpenseResponse)
def pay_expense(
    expense_id: int,
    payload: ExpensePayRequest,
    db: Session = Depends(get_db),
):
    return FinanceService.pay_expense(db, expense_id, payload)

@router.post("/expenses/payroll/attendance/bulk", response_model=ExpenseResponse)
def pay_attendance_payroll_bulk(
    payload: AttendancePayrollBulkPayRequest,
    db: Session = Depends(get_db),
):
    return FinanceService.pay_attendance_payroll_bulk(db, payload)

# --- Revenues ---
@router.post("/revenues/", response_model=RevenueResponse)
def create_revenue(revenue: RevenueCreate, db: Session = Depends(get_db)):
    return FinanceService.create_revenue(db, revenue)

@router.get("/revenues/", response_model=List[RevenueResponse])
def read_revenues(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    source_id: Optional[int] = None,
    wallet_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return FinanceService.get_revenues(db, start_date, end_date, source_id, wallet_id)

@router.put("/revenues/{revenue_id}", response_model=RevenueResponse)
def update_revenue(revenue_id: int, revenue_update: RevenueUpdate, db: Session = Depends(get_db)):
    return FinanceService.update_revenue(db, revenue_id, revenue_update)

@router.get("/incomes/", response_model=List[RevenueResponse])
def list_incomes(
    limit: int = 10,
    order_by: str = "date_desc",
    db: Session = Depends(get_db),
):
    return FinanceService.list_incomes(db, limit, order_by)

@router.post("/revenues/{revenue_id}/receipt")
async def upload_revenue_receipt(
    revenue_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await FinanceService.upload_revenue_receipt(db, revenue_id, file)

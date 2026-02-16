from datetime import date, datetime
from typing import List, Optional
import os

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator

from .. import database, models
from ..core.config import MEDIA_ROOT
from ..utils.uploads import save_upload


router = APIRouter(tags=["Finances"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


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


class ResourceSource(ResourceSourceBase):
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
    auto_charge_service_type_rates: dict[str, float] | None = None
    auto_charge_professional_rates: dict[str, float] | None = None
    auto_charge_expense_destination: str | None = None
    auto_charge_expense_description: str | None = None
    auto_charge_expense_category_id: int | None = None
    payroll_fixed_staff: dict[str, dict] | None = None


class WalletCreate(WalletBase):
    initial_balance: float = 0.0


class WalletUpdate(WalletBase):
    pass


class Wallet(WalletBase):
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
    wallet: Wallet
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


class Expense(ExpenseBase):
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


class Revenue(RevenueBase):
    id: int
    receipt_url: str | None = None
    created_at: datetime
    created_by_id: int | None = None

    class Config:
        from_attributes = True


@router.post("/resource-sources/", response_model=ResourceSource)
def create_resource_source(source: ResourceSourceCreate, db: Session = Depends(get_db)):
    if source.create_initial_revenue:
        if not source.wallet_id:
            raise HTTPException(
                status_code=400,
                detail="Selecione uma Carteira para gerar a Receita automaticamente.",
            )
        if not source.total_value_estimated or source.total_value_estimated <= 0:
            raise HTTPException(
                status_code=400,
                detail="Informe um Valor Total Estimado maior que zero para gerar a Receita automaticamente.",
            )

    source_data = source.model_dump(exclude={"create_initial_revenue", "initial_revenue_status"})
    db_source = models.ResourceSource(**source_data)
    db.add(db_source)
    db.flush()

    if source.create_initial_revenue:
        new_revenue = models.Revenue(
            description=f"Receita Inicial - {db_source.name}",
            amount=source.total_value_estimated,
            received_at=db_source.term_start or date.today(),
            source_id=db_source.id,
            wallet_id=db_source.wallet_id,
            status=source.initial_revenue_status or "pendente",
            payment_method="transferencia",
            is_reconciled=False,
        )

        if new_revenue.status in ["recebido", "conciliado"]:
            new_revenue.is_reconciled = new_revenue.status == "conciliado"
            wallet = db.query(models.Wallet).filter(models.Wallet.id == db_source.wallet_id).first()
            if wallet:
                wallet.balance += new_revenue.amount
                wallet.last_updated = datetime.now()

        db.add(new_revenue)

    db.commit()
    db.refresh(db_source)
    return db_source


@router.get("/resource-sources/", response_model=List[ResourceSource])
def read_resource_sources(
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.ResourceSource)
    if type:
        query = query.filter(models.ResourceSource.type == type)
    if status:
        query = query.filter(models.ResourceSource.status == status)
    return query.all()


@router.get("/resource-sources/{source_id}", response_model=ResourceSource)
def read_resource_source(source_id: int, db: Session = Depends(get_db)):
    db_source = db.query(models.ResourceSource).filter(models.ResourceSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Resource Source not found")
    return db_source


@router.put("/resource-sources/{source_id}", response_model=ResourceSource)
def update_resource_source(source_id: int, source: ResourceSourceUpdate, db: Session = Depends(get_db)):
    db_source = db.query(models.ResourceSource).filter(models.ResourceSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Resource Source not found")

    update_data = source.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_source, key, value)

    db.commit()
    db.refresh(db_source)
    return db_source


@router.delete("/resource-sources/{source_id}", status_code=204)
def delete_resource_source(
    source_id: int,
    force: bool = Query(False),
    db: Session = Depends(get_db),
):
    db_source = db.query(models.ResourceSource).filter(models.ResourceSource.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Resource Source not found")

    try:
        if force:
            db.query(models.Expense).filter(models.Expense.source_id == source_id).update(
                {models.Expense.source_id: None}
            )

            revenues = db.query(models.Revenue).filter(models.Revenue.source_id == source_id).all()
            for rev in revenues:
                if rev.status in ["recebido", "conciliado"]:
                    wallet = db.query(models.Wallet).filter(models.Wallet.id == rev.wallet_id).first()
                    if wallet:
                        wallet.balance -= rev.amount
                        wallet.last_updated = func.now()
                db.delete(rev)

            db.delete(db_source)
            db.commit()
        else:
            db.delete(db_source)
            db.commit()

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Esta fonte possui vínculos. Use a exclusão forçada para remover tudo.",
        )
    return None


@router.post("/resource-sources/{source_id}/document")
async def upload_resource_document(
    source_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    source = db.query(models.ResourceSource).filter(models.ResourceSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Resource Source not found")

    docs_dir = os.path.join(MEDIA_ROOT, "documents")
    filename = await save_upload(
        file,
        docs_dir,
        f"res_{source_id}",
        10 * 1024 * 1024,
        {"image/png", "image/jpeg", "application/pdf"},
    )

    public_url = f"/media/documents/{filename}"
    source.document_url = public_url
    db.commit()
    return {"url": public_url}


@router.post("/expenses/", response_model=Expense)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    wallet = db.query(models.Wallet).filter(models.Wallet.id == expense.wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    if expense.status == "pago":
        if wallet.balance < expense.amount:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo Insuficiente na Carteira (Disponível: R$ {wallet.balance:.2f})",
            )

    db_expense = models.Expense(**expense.model_dump())
    db.add(db_expense)

    if expense.status == "pago":
        wallet.balance -= expense.amount
        wallet.last_updated = func.now()

        if expense.source_id:
            source = db.query(models.ResourceSource).filter(models.ResourceSource.id == expense.source_id).first()
            if source:
                source.balance_used += expense.amount

    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.get("/expenses/", response_model=List[Expense])
def read_expenses(
    wallet_id: Optional[int] = None,
    source_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Expense)
    if wallet_id:
        query = query.filter(models.Expense.wallet_id == wallet_id)
    if source_id:
        query = query.filter(models.Expense.source_id == source_id)
    if start_date:
        query = query.filter(models.Expense.paid_at >= start_date)
    if end_date:
        query = query.filter(models.Expense.paid_at <= end_date)
    return query.all()


@router.post("/expenses/{expense_id}/pay", response_model=Expense)
def pay_expense(
    expense_id: int,
    payload: ExpensePayRequest,
    db: Session = Depends(get_db),
):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.status == "pago":
        return expense

    wallet = db.query(models.Wallet).filter(models.Wallet.id == expense.wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    if (wallet.balance or 0.0) < (expense.amount or 0.0):
        raise HTTPException(
            status_code=400,
            detail=f"Saldo Insuficiente na Carteira (Disponível: R$ {(wallet.balance or 0.0):.2f})",
        )

    expense.status = "pago"
    expense.paid_at = payload.paid_at or date.today()
    wallet.balance = (wallet.balance or 0.0) - (expense.amount or 0.0)
    wallet.last_updated = func.now()

    if expense.source_id:
        source = db.query(models.ResourceSource).filter(models.ResourceSource.id == expense.source_id).first()
        if source:
            source.balance_used += expense.amount or 0.0

    db.commit()
    db.refresh(expense)
    return expense


@router.post("/expenses/payroll/attendance/bulk", response_model=Expense)
def pay_attendance_payroll_bulk(
    payload: AttendancePayrollBulkPayRequest,
    db: Session = Depends(get_db),
):
    expense_ids = [int(x) for x in (payload.expense_ids or []) if x]
    if not expense_ids:
        raise HTTPException(status_code=400, detail="Nenhuma despesa informada")

    expenses = db.query(models.Expense).filter(models.Expense.id.in_(expense_ids)).all()
    if len(expenses) != len(set(expense_ids)):
        raise HTTPException(status_code=404, detail="Uma ou mais despesas não foram encontradas")

    wallet_ids = {e.wallet_id for e in expenses}
    if len(wallet_ids) != 1:
        raise HTTPException(status_code=400, detail="Despesas devem pertencer à mesma carteira")
    wallet_id = list(wallet_ids)[0]

    for e in expenses:
        if e.status != "pendente":
            raise HTTPException(status_code=400, detail="Todas as despesas devem estar pendentes")
        if not e.attendance_id:
            raise HTTPException(status_code=400, detail="Todas as despesas devem estar vinculadas a um atendimento")
        if not e.is_auto_generated:
            raise HTTPException(
                status_code=400,
                detail="Apenas despesas auto-geradas de atendimento podem ser liquidadas",
            )

    attendance_ids = [e.attendance_id for e in expenses if e.attendance_id]
    attendances = db.query(models.Attendance).filter(models.Attendance.id.in_(attendance_ids)).all()
    attendance_map = {a.id: a for a in attendances}
    if len(attendance_map) != len(set(attendance_ids)):
        raise HTTPException(status_code=400, detail="Um ou mais atendimentos não foram encontrados")

    professional_ids = {attendance_map[e.attendance_id].professional_id for e in expenses}
    professional_ids.discard(None)
    if len(professional_ids) != 1:
        raise HTTPException(status_code=400, detail="Despesas devem pertencer ao mesmo profissional")
    professional_id = list(professional_ids)[0]

    professional = db.query(models.Professional).filter(models.Professional.id == professional_id).first()
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")

    wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    total_amount = sum(float(e.amount or 0.0) for e in expenses)
    if total_amount <= 0:
        raise HTTPException(status_code=400, detail="Total inválido para pagamento")

    if (wallet.balance or 0.0) < total_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Saldo Insuficiente na Carteira (Disponível: R$ {(wallet.balance or 0.0):.2f})",
        )

    paid_at = payload.paid_at or date.today()
    month_key = (payload.month_key or "").strip() or paid_at.strftime("%Y-%m")
    doc_ref = f"payroll:health:{professional_id}:{month_key}"

    consolidated = models.Expense(
        amount=total_amount,
        paid_at=paid_at,
        wallet_id=wallet_id,
        destination=f"{professional.name} (Prof. Saúde)",
        description=f"Pagamento Profissional de Saúde (Atendimentos) - {month_key}",
        document_ref=doc_ref,
        status="pago",
    )
    db.add(consolidated)

    wallet.balance = (wallet.balance or 0.0) - total_amount
    wallet.last_updated = func.now()

    for e in expenses:
        e.status = "liquidado"
        e.paid_at = paid_at
        if not e.document_ref:
            e.document_ref = doc_ref

    db.commit()
    db.refresh(consolidated)
    return consolidated


@router.get("/wallets/{wallet_id}/dashboard", response_model=WalletDashboardResponse)
def get_wallet_dashboard(wallet_id: int, db: Session = Depends(get_db)):
    wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    today = date.today()
    start_of_month = date(today.year, today.month, 1)

    incomes_realized = (
        db.query(func.sum(models.Revenue.amount))
        .filter(models.Revenue.wallet_id == wallet_id)
        .filter(models.Revenue.status.in_(["recebido", "conciliado"]))
        .filter(models.Revenue.received_at >= start_of_month)
        .scalar()
        or 0.0
    )

    incomes_pending = (
        db.query(func.sum(models.Revenue.amount))
        .filter(models.Revenue.wallet_id == wallet_id)
        .filter(models.Revenue.status == "pendente")
        .scalar()
        or 0.0
    )

    expenses_total = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.wallet_id == wallet_id)
        .filter(models.Expense.status == "pago")
        .filter(models.Expense.paid_at >= start_of_month)
        .scalar()
        or 0.0
    )

    expenses_pending = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.wallet_id == wallet_id)
        .filter(models.Expense.status == "pendente")
        .scalar()
        or 0.0
    )

    return WalletDashboardResponse(
        wallet=wallet,
        stats=WalletDashboardStats(
            incomes_month=incomes_realized,
            expenses_month=expenses_total,
            pending_incomes=incomes_pending,
            pending_expenses=expenses_pending,
            current_balance=wallet.balance,
        ),
    )


@router.post("/wallets/", response_model=Wallet)
def create_wallet(wallet: WalletCreate, db: Session = Depends(get_db)):
    wallet_data = wallet.model_dump()
    initial_balance = wallet_data.pop("initial_balance", 0.0)
    import json

    for key in ("auto_charge_service_type_rates", "auto_charge_professional_rates", "payroll_fixed_staff"):
        if isinstance(wallet_data.get(key), dict):
            wallet_data[key] = json.dumps(wallet_data[key], ensure_ascii=False)

    db_wallet = models.Wallet(**wallet_data)
    db_wallet.balance = initial_balance

    db.add(db_wallet)
    db.commit()
    db.refresh(db_wallet)
    return db_wallet


@router.get("/wallets/", response_model=List[Wallet])
def read_wallets(db: Session = Depends(get_db)):
    return db.query(models.Wallet).all()


@router.get("/wallets/{wallet_id}", response_model=Wallet)
def read_wallet(wallet_id: int, db: Session = Depends(get_db)):
    db_wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return db_wallet


@router.put("/wallets/{wallet_id}", response_model=Wallet)
def update_wallet(wallet_id: int, wallet: WalletUpdate, db: Session = Depends(get_db)):
    db_wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    update_data = wallet.model_dump(exclude_unset=True)
    import json

    for key in ("auto_charge_service_type_rates", "auto_charge_professional_rates", "payroll_fixed_staff"):
        if isinstance(update_data.get(key), dict):
            update_data[key] = json.dumps(update_data[key], ensure_ascii=False)
    for key, value in update_data.items():
        setattr(db_wallet, key, value)

    db.commit()
    db.refresh(db_wallet)
    return db_wallet


@router.get("/wallets/{wallet_id}/export")
def export_wallet_data(wallet_id: int, db: Session = Depends(get_db)):
    wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")

    revenues = db.query(models.Revenue).filter(models.Revenue.wallet_id == wallet_id).all()
    expenses = db.query(models.Expense).filter(models.Expense.wallet_id == wallet_id).all()
    attendances = db.query(models.Attendance).filter(models.Attendance.wallet_id == wallet_id).all()

    return {
        "wallet": {
            "id": wallet.id,
            "name": wallet.name,
            "balance": wallet.balance,
            "category": wallet.category,
            "is_restricted": wallet.is_restricted,
        },
        "revenues": [
            {
                "id": r.id,
                "date": r.received_at,
                "amount": r.amount,
                "description": r.description,
                "status": r.status,
                "source_id": r.source_id,
            }
            for r in revenues
        ],
        "expenses": [
            {
                "id": e.id,
                "date": e.paid_at,
                "amount": e.amount,
                "destination": e.destination,
                "description": e.description,
                "status": e.status,
            }
            for e in expenses
        ],
        "attendances_linked": [
            {
                "id": a.id,
                "date": a.scheduled_time,
                "child_id": a.child_id,
            }
            for a in attendances
        ],
    }


@router.delete("/wallets/{wallet_id}", status_code=204)
def delete_wallet(
    wallet_id: int,
    force: bool = Query(False),
    db: Session = Depends(get_db),
):
    db_wallet = db.query(models.Wallet).filter(models.Wallet.id == wallet_id).first()
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    try:
        if force:
            db.query(models.Revenue).filter(models.Revenue.wallet_id == wallet_id).delete()
            db.query(models.Expense).filter(models.Expense.wallet_id == wallet_id).delete()

            db.query(models.Attendance).filter(models.Attendance.wallet_id == wallet_id).update(
                {models.Attendance.wallet_id: None}
            )
            db.query(models.ResourceSource).filter(models.ResourceSource.wallet_id == wallet_id).update(
                {models.ResourceSource.wallet_id: None}
            )

            db.delete(db_wallet)
            db.commit()
        else:
            db.delete(db_wallet)
            db.commit()

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir esta carteira pois existem registros (receitas/despesas/transferências) vinculados a ela.",
        )
    return None


@router.post("/wallets/transfer", status_code=201)
def transfer_funds(transfer: TransferCreate, db: Session = Depends(get_db)):
    source_wallet = db.query(models.Wallet).filter(models.Wallet.id == transfer.source_wallet_id).first()
    target_wallet = db.query(models.Wallet).filter(models.Wallet.id == transfer.target_wallet_id).first()

    if not source_wallet:
        raise HTTPException(status_code=404, detail="Carteira de origem não encontrada")
    if not target_wallet:
        raise HTTPException(status_code=404, detail="Carteira de destino não encontrada")
    if source_wallet.id == target_wallet.id:
        raise HTTPException(status_code=400, detail="Não é possível transferir para a mesma carteira")

    if source_wallet.balance < transfer.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Saldo Insuficiente na Origem (R$ {source_wallet.balance:.2f})",
        )

    transfer_date = transfer.transfer_date or date.today()

    try:
        expense = models.Expense(
            amount=transfer.amount,
            paid_at=transfer_date,
            wallet_id=source_wallet.id,
            destination=f"Transferência para: {target_wallet.name}",
            description=transfer.description or "Transferência entre carteiras",
            status="pago",
        )
        db.add(expense)
        source_wallet.balance -= transfer.amount
        source_wallet.last_updated = func.now()

        internal_source = (
            db.query(models.ResourceSource)
            .filter(models.ResourceSource.name == "Transferência Interna")
            .first()
        )
        if not internal_source:
            internal_source = models.ResourceSource(name="Transferência Interna", type="evento", status="active")
            db.add(internal_source)
            db.flush()

        revenue = models.Revenue(
            amount=transfer.amount,
            received_at=transfer_date,
            wallet_id=target_wallet.id,
            source_id=internal_source.id,
            payment_method="transferencia",
            description=f"Recebido de: {source_wallet.name} - {transfer.description or ''}",
            status="recebido",
            origin_sphere="privado",
        )
        db.add(revenue)
        target_wallet.balance += transfer.amount
        target_wallet.last_updated = func.now()

        db.commit()
        return {
            "message": "Transferência realizada com sucesso",
            "new_source_balance": source_wallet.balance,
            "new_target_balance": target_wallet.balance,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro na transferência: {str(e)}")


@router.post("/revenues/", response_model=Revenue)
def create_revenue(revenue: RevenueCreate, db: Session = Depends(get_db)):
    wallet = db.query(models.Wallet).filter(models.Wallet.id == revenue.wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    source = db.query(models.ResourceSource).filter(models.ResourceSource.id == revenue.source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Resource Source not found")

    if wallet.is_restricted:
        if source.wallet_id and source.wallet_id != wallet.id:
            raise HTTPException(
                status_code=400,
                detail=f"Esta Fonte de Recurso está vinculada a outra Carteira (ID: {source.wallet_id}).",
            )

    db_revenue = models.Revenue(**revenue.model_dump())
    db.add(db_revenue)

    if revenue.status in ["recebido", "conciliado"]:
        wallet.balance += revenue.amount
        wallet.last_updated = func.now()

    db.commit()
    db.refresh(db_revenue)
    return db_revenue


@router.put("/revenues/{revenue_id}", response_model=Revenue)
def update_revenue(revenue_id: int, revenue_update: RevenueUpdate, db: Session = Depends(get_db)):
    db_revenue = db.query(models.Revenue).filter(models.Revenue.id == revenue_id).first()
    if not db_revenue:
        raise HTTPException(status_code=404, detail="Revenue not found")

    old_status = db_revenue.status
    new_status = revenue_update.status

    if new_status and new_status != old_status:
        wallet = db.query(models.Wallet).filter(models.Wallet.id == db_revenue.wallet_id).first()
        if wallet:
            if new_status in ["recebido", "conciliado"] and old_status in ["pendente", "cancelado"]:
                wallet.balance += db_revenue.amount
                wallet.last_updated = func.now()
            elif old_status in ["recebido", "conciliado"] and new_status in ["pendente", "cancelado"]:
                wallet.balance -= db_revenue.amount
                wallet.last_updated = func.now()

    update_data = revenue_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_revenue, key, value)

    db.commit()
    db.refresh(db_revenue)
    return db_revenue


@router.get("/revenues/", response_model=List[Revenue])
def read_revenues(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    source_id: Optional[int] = None,
    wallet_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Revenue)

    if start_date:
        query = query.filter(models.Revenue.received_at >= start_date)
    if end_date:
        query = query.filter(models.Revenue.received_at <= end_date)
    if source_id:
        query = query.filter(models.Revenue.source_id == source_id)
    if wallet_id:
        query = query.filter(models.Revenue.wallet_id == wallet_id)

    return query.all()


@router.get("/incomes/", response_model=List[Revenue])
def list_incomes(
    limit: int = 10,
    order_by: str = "date_desc",
    db: Session = Depends(get_db),
):
    query = db.query(models.Revenue)

    if order_by == "date_desc":
        query = query.order_by(models.Revenue.received_at.desc())

    return query.limit(limit).all()


@router.post("/revenues/{revenue_id}/receipt")
async def upload_revenue_receipt(
    revenue_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    revenue = db.query(models.Revenue).filter(models.Revenue.id == revenue_id).first()
    if not revenue:
        raise HTTPException(status_code=404, detail="Revenue not found")

    receipts_dir = os.path.join(MEDIA_ROOT, "receipts")
    filename = await save_upload(
        file,
        receipts_dir,
        f"rec_{revenue_id}",
        10 * 1024 * 1024,
        {"image/png", "image/jpeg", "application/pdf"},
    )

    public_url = f"/media/receipts/{filename}"
    revenue.receipt_url = public_url
    db.commit()
    return {"url": public_url}


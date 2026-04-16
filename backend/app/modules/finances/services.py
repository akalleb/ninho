from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from fastapi import HTTPException, UploadFile
from datetime import date, datetime
import os
import json
from typing import List, Optional

from ...core.config import MEDIA_ROOT
from ...utils.uploads import save_upload
from .models import Wallet, ResourceSource, Revenue, Expense
from ...models import Attendance, Professional # Cross-module imports

from .schemas import (
    ResourceSourceCreate, ResourceSourceUpdate,
    WalletCreate, WalletUpdate, WalletDashboardStats,
    TransferCreate, ExpenseCreate, ExpensePayRequest,
    AttendancePayrollBulkPayRequest, RevenueCreate, RevenueUpdate
)

class FinanceService:
    # --- Resource Sources ---
    @staticmethod
    def create_resource_source(db: Session, source: ResourceSourceCreate) -> ResourceSource:
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
        db_source = ResourceSource(**source_data)
        db.add(db_source)
        db.flush()

        if source.create_initial_revenue:
            new_revenue = Revenue(
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
                wallet = db.query(Wallet).filter(Wallet.id == db_source.wallet_id).first()
                if wallet:
                    wallet.balance += new_revenue.amount
                    wallet.last_updated = datetime.now()

            db.add(new_revenue)

        db.commit()
        db.refresh(db_source)
        return db_source

    @staticmethod
    def get_resource_sources(db: Session, type: Optional[str] = None, status: Optional[str] = None):
        query = db.query(ResourceSource)
        if type:
            query = query.filter(ResourceSource.type == type)
        if status:
            query = query.filter(ResourceSource.status == status)
        return query.all()

    @staticmethod
    def get_resource_source_by_id(db: Session, source_id: int):
        db_source = db.query(ResourceSource).filter(ResourceSource.id == source_id).first()
        if not db_source:
            raise HTTPException(status_code=404, detail="Resource Source not found")
        return db_source

    @staticmethod
    def update_resource_source(db: Session, source_id: int, source: ResourceSourceUpdate):
        db_source = FinanceService.get_resource_source_by_id(db, source_id)
        update_data = source.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_source, key, value)
        db.commit()
        db.refresh(db_source)
        return db_source

    @staticmethod
    def delete_resource_source(db: Session, source_id: int, force: bool = False):
        db_source = FinanceService.get_resource_source_by_id(db, source_id)
        try:
            if force:
                db.query(Expense).filter(Expense.source_id == source_id).update(
                    {Expense.source_id: None}
                )

                revenues = db.query(Revenue).filter(Revenue.source_id == source_id).all()
                for rev in revenues:
                    if rev.status in ["recebido", "conciliado"]:
                        wallet = db.query(Wallet).filter(Wallet.id == rev.wallet_id).first()
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

    @staticmethod
    async def upload_resource_document(db: Session, source_id: int, file: UploadFile):
        source = FinanceService.get_resource_source_by_id(db, source_id)
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

    # --- Wallets ---
    @staticmethod
    def create_wallet(db: Session, wallet: WalletCreate):
        wallet_data = wallet.model_dump()
        initial_balance = wallet_data.pop("initial_balance", 0.0)
        
        for key in ("auto_charge_service_type_rates", "auto_charge_professional_rates", "payroll_fixed_staff"):
            if isinstance(wallet_data.get(key), dict):
                wallet_data[key] = json.dumps(wallet_data[key], ensure_ascii=False)

        db_wallet = Wallet(**wallet_data)
        db_wallet.balance = initial_balance

        db.add(db_wallet)
        db.commit()
        db.refresh(db_wallet)
        return db_wallet

    @staticmethod
    def get_wallets(db: Session):
        return db.query(Wallet).all()

    @staticmethod
    def get_wallet_by_id(db: Session, wallet_id: int):
        db_wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
        if not db_wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        return db_wallet

    @staticmethod
    def update_wallet(db: Session, wallet_id: int, wallet: WalletUpdate):
        db_wallet = FinanceService.get_wallet_by_id(db, wallet_id)
        update_data = wallet.model_dump(exclude_unset=True)
        
        for key in ("auto_charge_service_type_rates", "auto_charge_professional_rates", "payroll_fixed_staff"):
            if isinstance(update_data.get(key), dict):
                update_data[key] = json.dumps(update_data[key], ensure_ascii=False)
        for key, value in update_data.items():
            setattr(db_wallet, key, value)

        db.commit()
        db.refresh(db_wallet)
        return db_wallet

    @staticmethod
    def delete_wallet(db: Session, wallet_id: int, force: bool = False):
        db_wallet = FinanceService.get_wallet_by_id(db, wallet_id)
        try:
            if force:
                db.query(Revenue).filter(Revenue.wallet_id == wallet_id).delete()
                db.query(Expense).filter(Expense.wallet_id == wallet_id).delete()

                db.query(Attendance).filter(Attendance.wallet_id == wallet_id).update(
                    {Attendance.wallet_id: None}
                )
                db.query(ResourceSource).filter(ResourceSource.wallet_id == wallet_id).update(
                    {ResourceSource.wallet_id: None}
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

    @staticmethod
    def get_wallet_dashboard(db: Session, wallet_id: int):
        wallet = FinanceService.get_wallet_by_id(db, wallet_id)
        today = date.today()
        start_of_month = date(today.year, today.month, 1)

        incomes_realized = (
            db.query(func.sum(Revenue.amount))
            .filter(Revenue.wallet_id == wallet_id)
            .filter(Revenue.status.in_(["recebido", "conciliado"]))
            .filter(Revenue.received_at >= start_of_month)
            .scalar()
            or 0.0
        )

        incomes_pending = (
            db.query(func.sum(Revenue.amount))
            .filter(Revenue.wallet_id == wallet_id)
            .filter(Revenue.status == "pendente")
            .scalar()
            or 0.0
        )

        expenses_total = (
            db.query(func.sum(Expense.amount))
            .filter(Expense.wallet_id == wallet_id)
            .filter(Expense.status == "pago")
            .filter(Expense.paid_at >= start_of_month)
            .scalar()
            or 0.0
        )

        expenses_pending = (
            db.query(func.sum(Expense.amount))
            .filter(Expense.wallet_id == wallet_id)
            .filter(Expense.status == "pendente")
            .scalar()
            or 0.0
        )

        return {
            "wallet": wallet,
            "stats": WalletDashboardStats(
                incomes_month=incomes_realized,
                expenses_month=expenses_total,
                pending_incomes=incomes_pending,
                pending_expenses=expenses_pending,
                current_balance=wallet.balance,
            ),
        }

    @staticmethod
    def transfer_funds(db: Session, transfer: TransferCreate):
        from sqlalchemy import with_for_update
        
        # Lock wallets to prevent race condition (double-spend)
        source_wallet = (
            db.query(models.Wallet)
            .filter(models.Wallet.id == transfer.source_wallet_id)
            .with_for_update()
            .first()
        )
        if not source_wallet:
            raise HTTPException(status_code=404, detail="Carteira de origem não encontrada")
            
        target_wallet = (
            db.query(models.Wallet)
            .filter(models.Wallet.id == transfer.target_wallet_id)
            .with_for_update()
            .first()
        )
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
            expense = Expense(
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
                db.query(ResourceSource)
                .filter(ResourceSource.name == "Transferência Interna")
                .first()
            )
            if not internal_source:
                internal_source = ResourceSource(name="Transferência Interna", type="evento", status="active")
                db.add(internal_source)
                db.flush()

            revenue = Revenue(
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

        except Exception:
            db.rollback()
            raise HTTPException(status_code=500, detail="Erro na transferência")
            
    @staticmethod
    def export_wallet_data(db: Session, wallet_id: int):
        wallet = FinanceService.get_wallet_by_id(db, wallet_id)
        revenues = db.query(Revenue).filter(Revenue.wallet_id == wallet_id).all()
        expenses = db.query(Expense).filter(Expense.wallet_id == wallet_id).all()
        attendances = db.query(Attendance).filter(Attendance.wallet_id == wallet_id).all()

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

    # --- Expenses ---
    @staticmethod
    def create_expense(db: Session, expense: ExpenseCreate):
        wallet = FinanceService.get_wallet_by_id(db, expense.wallet_id)
        if expense.status == "pago":
            if wallet.balance < expense.amount:
                raise HTTPException(
                    status_code=400,
                    detail=f"Saldo Insuficiente na Carteira (Disponível: R$ {wallet.balance:.2f})",
                )

        db_expense = Expense(**expense.model_dump())
        db.add(db_expense)

        if expense.status == "pago":
            wallet.balance -= expense.amount
            wallet.last_updated = func.now()

            if expense.source_id:
                source = db.query(ResourceSource).filter(ResourceSource.id == expense.source_id).first()
                if source:
                    source.balance_used += expense.amount

        db.commit()
        db.refresh(db_expense)
        return db_expense

    @staticmethod
    def get_expenses(db: Session, wallet_id: int = None, source_id: int = None, start_date: date = None, end_date: date = None):
        query = db.query(Expense)
        if wallet_id:
            query = query.filter(Expense.wallet_id == wallet_id)
        if source_id:
            query = query.filter(Expense.source_id == source_id)
        if start_date:
            query = query.filter(Expense.paid_at >= start_date)
        if end_date:
            query = query.filter(Expense.paid_at <= end_date)
        return query.all()

    @staticmethod
    def pay_expense(db: Session, expense_id: int, payload: ExpensePayRequest):
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        if expense.status == "pago":
            return expense

        wallet = db.query(Wallet).filter(Wallet.id == expense.wallet_id).first()
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
            source = db.query(ResourceSource).filter(ResourceSource.id == expense.source_id).first()
            if source:
                source.balance_used += expense.amount or 0.0

        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def pay_attendance_payroll_bulk(db: Session, payload: AttendancePayrollBulkPayRequest):
        expense_ids = [int(x) for x in (payload.expense_ids or []) if x]
        if not expense_ids:
            raise HTTPException(status_code=400, detail="Nenhuma despesa informada")

        expenses = db.query(Expense).filter(Expense.id.in_(expense_ids)).all()
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
        attendances = db.query(Attendance).filter(Attendance.id.in_(attendance_ids)).all()
        attendance_map = {a.id: a for a in attendances}
        if len(attendance_map) != len(set(attendance_ids)):
            raise HTTPException(status_code=400, detail="Um ou mais atendimentos não foram encontrados")

        professional_ids = {attendance_map[e.attendance_id].professional_id for e in expenses}
        professional_ids.discard(None)
        if len(professional_ids) != 1:
            raise HTTPException(status_code=400, detail="Despesas devem pertencer ao mesmo profissional")
        professional_id = list(professional_ids)[0]

        professional = db.query(Professional).filter(Professional.id == professional_id).first()
        if not professional:
            raise HTTPException(status_code=404, detail="Professional not found")

        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
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

        consolidated = Expense(
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

    # --- Revenues ---
    @staticmethod
    def create_revenue(db: Session, revenue: RevenueCreate):
        wallet = FinanceService.get_wallet_by_id(db, revenue.wallet_id)
        source = FinanceService.get_resource_source_by_id(db, revenue.source_id)

        if wallet.is_restricted:
            if source.wallet_id and source.wallet_id != wallet.id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Esta Fonte de Recurso está vinculada a outra Carteira (ID: {source.wallet_id}).",
                )

        db_revenue = Revenue(**revenue.model_dump())
        db.add(db_revenue)

        if revenue.status in ["recebido", "conciliado"]:
            wallet.balance += revenue.amount
            wallet.last_updated = func.now()

        db.commit()
        db.refresh(db_revenue)
        return db_revenue

    @staticmethod
    def update_revenue(db: Session, revenue_id: int, revenue_update: RevenueUpdate):
        db_revenue = db.query(Revenue).filter(Revenue.id == revenue_id).first()
        if not db_revenue:
            raise HTTPException(status_code=404, detail="Revenue not found")

        old_status = db_revenue.status
        new_status = revenue_update.status

        if new_status and new_status != old_status:
            wallet = db.query(Wallet).filter(Wallet.id == db_revenue.wallet_id).first()
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

    @staticmethod
    def get_revenues(db: Session, start_date: date = None, end_date: date = None, source_id: int = None, wallet_id: int = None):
        query = db.query(Revenue)
        if start_date:
            query = query.filter(Revenue.received_at >= start_date)
        if end_date:
            query = query.filter(Revenue.received_at <= end_date)
        if source_id:
            query = query.filter(Revenue.source_id == source_id)
        if wallet_id:
            query = query.filter(Revenue.wallet_id == wallet_id)
        return query.all()

    @staticmethod
    def list_incomes(db: Session, limit: int = 10, order_by: str = "date_desc"):
        query = db.query(Revenue)
        if order_by == "date_desc":
            query = query.order_by(Revenue.received_at.desc())
        return query.limit(limit).all()

    @staticmethod
    async def upload_revenue_receipt(db: Session, revenue_id: int, file: UploadFile):
        revenue = db.query(Revenue).filter(Revenue.id == revenue_id).first()
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

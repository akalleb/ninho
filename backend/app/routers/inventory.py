from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from .. import database, models
from ..core.security import get_current_admin_or_operational


router = APIRouter(prefix="/inventory", tags=["Inventory"], dependencies=[Depends(get_current_admin_or_operational)])


class InventoryItemBase(BaseModel):
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    min_stock: Optional[float] = None
    location: Optional[str] = None


class InventoryItemCreate(InventoryItemBase):
    initial_stock: Optional[float] = 0

    @field_validator("initial_stock")
    @classmethod
    def validate_initial_stock(cls, v: Optional[float]) -> float:
        return max(v or 0, 0)


class InventoryItemUpdate(InventoryItemBase):
    pass


class InventoryItemOut(InventoryItemBase):
    id: int
    current_stock: float
    created_at: datetime

    class Config:
        from_attributes = True


class InventoryMovementCreate(BaseModel):
    item_id: int
    type: str
    quantity: float
    reference: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("entrada", "saida"):
            raise ValueError("type must be 'entrada' or 'saida'")
        return v

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("quantity must be positive")
        return v


class InventoryMovementOut(BaseModel):
    id: int
    item_id: int
    type: str
    quantity: float
    reference: Optional[str]
    notes: Optional[str]
    created_at: datetime
    item_name: str
    unit: Optional[str]


@router.post("/items/", response_model=InventoryItemOut)
def create_item(item: InventoryItemCreate, db: Session = Depends(database.get_db)):
    db_item = models.InventoryItem(
        name=item.name,
        category=item.category,
        unit=item.unit,
        description=item.description,
        min_stock=item.min_stock,
        current_stock=item.initial_stock or 0,
        location=item.location,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/items/", response_model=List[InventoryItemOut])
def list_items(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db),
):
    query = db.query(models.InventoryItem)
    if category:
        query = query.filter(models.InventoryItem.category == category)
    if search:
        like = f"%{search}%"
        query = query.filter(models.InventoryItem.name.ilike(like))
    return query.order_by(models.InventoryItem.name.asc()).all()


@router.put("/items/{item_id}", response_model=InventoryItemOut)
def update_item(item_id: int, item: InventoryItemUpdate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    data = item.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.post("/movements/", response_model=InventoryMovementOut)
def create_movement(movement: InventoryMovementCreate, db: Session = Depends(database.get_db)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == movement.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    quantity = movement.quantity
    if movement.type == "saida":
        if item.current_stock < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente. Atual: {item.current_stock}",
            )
        item.current_stock -= quantity
    else:
        item.current_stock += quantity

    db_movement = models.InventoryMovement(
        item_id=item.id,
        type=movement.type,
        quantity=quantity,
        reference=movement.reference,
        notes=movement.notes,
    )
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)

    return InventoryMovementOut(
        id=db_movement.id,
        item_id=db_movement.item_id,
        type=db_movement.type,
        quantity=db_movement.quantity,
        reference=db_movement.reference,
        notes=db_movement.notes,
        created_at=db_movement.created_at,
        item_name=item.name,
        unit=item.unit,
    )


@router.get("/movements/", response_model=List[InventoryMovementOut])
def list_movements(
    item_id: Optional[int] = None,
    db: Session = Depends(database.get_db),
):
    query = db.query(models.InventoryMovement, models.InventoryItem).join(
        models.InventoryItem, models.InventoryItem.id == models.InventoryMovement.item_id
    )
    if item_id:
        query = query.filter(models.InventoryMovement.item_id == item_id)

    rows = query.order_by(models.InventoryMovement.created_at.desc()).limit(200).all()
    result: List[InventoryMovementOut] = []
    for m, item in rows:
        result.append(
            InventoryMovementOut(
                id=m.id,
                item_id=m.item_id,
                type=m.type,
                quantity=m.quantity,
                reference=m.reference,
                notes=m.notes,
                created_at=m.created_at,
                item_name=item.name,
                unit=item.unit,
            )
        )
    return result


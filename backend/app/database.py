from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)


def get_engine():
    if SQLALCHEMY_DATABASE_URL:
        try:
            engine = create_engine(SQLALCHEMY_DATABASE_URL)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return engine
        except Exception:
            pass
    return create_engine("sqlite:///./sql_app.db")


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_schema():
    if engine.dialect.name == "sqlite":
        with engine.begin() as connection:
            cols = connection.execute(text("PRAGMA table_info(wallets)")).fetchall()
            existing = {row[1] for row in cols}
            if "payroll_fixed_staff" not in existing:
                connection.execute(text("ALTER TABLE wallets ADD COLUMN payroll_fixed_staff TEXT"))
        return
    if engine.dialect.name != "postgresql":
        return
    statements = [
        "ALTER TABLE IF EXISTS resource_sources ADD COLUMN IF NOT EXISTS wallet_id INTEGER",
        "ALTER TABLE IF EXISTS revenues ADD COLUMN IF NOT EXISTS receipt_url VARCHAR",
        "ALTER TABLE IF EXISTS revenues ADD COLUMN IF NOT EXISTS origin_sphere VARCHAR",
        "ALTER TABLE IF EXISTS revenues ADD COLUMN IF NOT EXISTS status VARCHAR",
        "ALTER TABLE IF EXISTS revenues ADD COLUMN IF NOT EXISTS reconciliation_date DATE",
        "ALTER TABLE IF EXISTS revenues ADD COLUMN IF NOT EXISTS is_reconciled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE IF EXISTS revenues ADD COLUMN IF NOT EXISTS tracking_docs_url TEXT",
        "ALTER TABLE IF EXISTS revenues ADD COLUMN IF NOT EXISTS tracking_code VARCHAR",
        "ALTER TABLE IF EXISTS revenues ADD COLUMN IF NOT EXISTS observations TEXT",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS auto_charge_enabled BOOLEAN DEFAULT FALSE",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS auto_charge_mode VARCHAR",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS auto_charge_flat_amount DOUBLE PRECISION",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS auto_charge_service_type_rates TEXT",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS auto_charge_professional_rates TEXT",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS auto_charge_expense_destination VARCHAR",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS auto_charge_expense_description TEXT",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS auto_charge_expense_category_id INTEGER",
        "ALTER TABLE IF EXISTS wallets ADD COLUMN IF NOT EXISTS payroll_fixed_staff TEXT",
        "ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS attendance_id INTEGER",
        "ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT FALSE",
        "ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS auto_charge_mode VARCHAR",
    ]
    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL, ENCRYPTION_KEY, SECRET_KEY
from app import models
from app.core.security import encrypt_data, decrypt_data, get_data_hash, fernet
import logging

# Configurar conexão
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migration")

def is_encrypted(data: str) -> bool:
    """Simple check if data seems to be Fernet encrypted"""
    if not data:
        return False
    try:
        # Tenta descriptografar. Se funcionar e for diferente do input (ou se o input já era cifrado), ok.
        # Mas Fernet.decrypt lanca exceção se não for válido.
        # Melhor: se começa com gAAAAA (padrão comum Fernet)
        return data.startswith("gAAAAA")
    except:
        return False

def migrate_professionals():
    logger.info("--- Migrando Profissionais ---")
    profs = db.query(models.Professional).all()
    count = 0
    for p in profs:
        changed = False
        
        # CPF
        if p.cpf and not is_encrypted(p.cpf):
            logger.info(f"Criptografando CPF de {p.email}")
            p.cpf_hash = get_data_hash(p.cpf)
            p.cpf = encrypt_data(p.cpf)
            changed = True
        elif p.cpf and is_encrypted(p.cpf) and not p.cpf_hash:
             # Caso já esteja cifrado mas sem hash (migração parcial)
             # Precisaríamos descriptografar para gerar o hash.
             plain = decrypt_data(p.cpf)
             p.cpf_hash = get_data_hash(plain)
             changed = True

        # RG
        if p.rg and not is_encrypted(p.rg):
            p.rg_hash = get_data_hash(p.rg)
            p.rg = encrypt_data(p.rg)
            changed = True

        # Address & Bank Data (Já eram tratados, mas reforçando)
        if p.address and not is_encrypted(p.address):
            p.address = encrypt_data(p.address)
            changed = True
            
        if p.bank_data and not is_encrypted(p.bank_data):
            p.bank_data = encrypt_data(p.bank_data)
            changed = True
            
        if changed:
            count += 1
            
    db.commit()
    logger.info(f"Profissionais atualizados: {count}")

def migrate_families():
    logger.info("--- Migrando Famílias ---")
    families = db.query(models.Family).all()
    count = 0
    for f in families:
        changed = False
        
        # CPF
        if f.cpf and not is_encrypted(f.cpf):
            f.cpf_hash = get_data_hash(f.cpf)
            f.cpf = encrypt_data(f.cpf)
            changed = True
            
        # RG
        if f.rg and not is_encrypted(f.rg):
            f.rg_hash = get_data_hash(f.rg)
            f.rg = encrypt_data(f.rg)
            changed = True
            
        # Sensitive Fields
        fields = ['nis_responsible', 'address_full', 'phone', 'email', 'family_observations']
        for field in fields:
            val = getattr(f, field)
            if val and not is_encrypted(val):
                setattr(f, field, encrypt_data(val))
                changed = True
        
        if changed:
            count += 1
            
    db.commit()
    logger.info(f"Famílias atualizadas: {count}")

def migrate_children():
    logger.info("--- Migrando Crianças ---")
    children = db.query(models.Child).all()
    count = 0
    for c in children:
        changed = False
        
        fields = ['diagnosis', 'allergies', 'gestational_history', 'notes']
        for field in fields:
            val = getattr(c, field)
            if val and not is_encrypted(val):
                setattr(c, field, encrypt_data(val))
                changed = True
                
        if changed:
            count += 1
            
    db.commit()
    logger.info(f"Crianças atualizadas: {count}")

def run_migration():
    try:
        # Atualizar Schema primeiro (Adicionar colunas se não existirem)
        # O SQLAlchemy create_all geralmente não adiciona colunas em tabelas existentes,
        # mas vamos assumir que o ambiente de dev pode recriar ou o usuário rodou alembic.
        # Como é dev local, vamos forçar create_all para garantir que o metadata saiba das colunas,
        # mas se a tabela existe, ele ignora.
        # O ideal seria usar ALTER TABLE direto aqui se não tiver alembic.
        
        logger.info("Verificando colunas...")
        with engine.connect() as conn:
            # PostgreSQL syntax check
            # Professional
            try:
                conn.execute(text("ALTER TABLE professionals ADD COLUMN IF NOT EXISTS cpf_hash VARCHAR"))
                conn.execute(text("ALTER TABLE professionals ADD COLUMN IF NOT EXISTS rg_hash VARCHAR"))
            except Exception as e:
                logger.warning(f"Erro ao alterar professionals: {e}")

            # Family
            try:
                conn.execute(text("ALTER TABLE families ADD COLUMN IF NOT EXISTS cpf_hash VARCHAR"))
                conn.execute(text("ALTER TABLE families ADD COLUMN IF NOT EXISTS rg_hash VARCHAR"))
            except Exception as e:
                logger.warning(f"Erro ao alterar families: {e}")

            conn.commit()

        migrate_professionals()
        migrate_families()
        migrate_children()
        
        logger.info("✅ Migração de Criptografia Concluída!")
        
    except Exception as e:
        logger.error(f"❌ Erro na migração: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()

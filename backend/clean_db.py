
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL
from app import models

# Configurar conexão
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def clean_database(keep_email="akalleb@tutamail.com"):
    print(f"--- Iniciando limpeza do banco de dados ---")
    print(f"Preservando admin: {keep_email}")
    
    try:
        # 1. Encontrar o ID do admin para preservar
        admin = db.query(models.Professional).filter(models.Professional.email == keep_email).first()
        admin_id = admin.id if admin else None
        
        if admin_id:
            print(f"Admin encontrado com ID: {admin_id}")
        else:
            print("Admin não encontrado! A limpeza apagará TODOS os profissionais.")
            # Opcional: abortar se não achar admin?
            # return

        # 2. Ordem de limpeza (tabelas dependentes primeiro)
        
        # --- Nível 4 (Folhas profundas) ---
        print("Limpando Medicações...")
        db.query(models.ChildMedication).delete()
        
        print("Limpando Evoluções Multidisciplinares...")
        db.query(models.MultidisciplinaryEvolution).delete()
        
        # --- Nível 3 ---
        print("Limpando Atendimentos...")
        db.query(models.Attendance).delete()
        
        # --- Nível 2 ---
        print("Limpando Crianças...")
        db.query(models.Child).delete()
        
        print("Limpando Receitas e Despesas...")
        db.query(models.Revenue).delete()
        db.query(models.Expense).delete()
        
        print("Limpando Notificações...")
        db.query(models.Notification).delete()

        # --- Nível 1 ---
        print("Limpando Fontes de Recurso...")
        db.query(models.ResourceSource).delete()
        
        print("Limpando Carteiras...")
        db.query(models.Wallet).delete()
        
        print("Limpando Famílias...")
        db.query(models.Family).delete()
        
        # --- Nível 0 (Profissionais) ---
        if admin_id:
            print(f"Limpando Profissionais (exceto ID {admin_id})...")
            # Deletar todos exceto o admin
            db.query(models.Professional).filter(models.Professional.id != admin_id).delete()
        else:
            print("Limpando TODOS os Profissionais...")
            db.query(models.Professional).delete()
            
        db.commit()
        print("✅ Banco de dados limpo com sucesso!")
        
        if not admin_id:
            print("⚠️ ATENÇÃO: O usuário admin não existia e foi apagado (ou tabela estava vazia).")
            print("Execute o script 'fix_admin_role.py' para recriá-lo.")
            
    except Exception as e:
        print(f"❌ Erro durante a limpeza: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()

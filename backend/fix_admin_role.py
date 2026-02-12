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

def fix_user_role(email, new_role="admin"):
    print(f"--- Verificando usuário: {email} ---")
    
    # 1. Buscar profissional pelo email
    try:
        professional = db.query(models.Professional).filter(models.Professional.email == email).first()
        
        if not professional:
            print(f"❌ ERRO: Usuário com email '{email}' NÃO ENCONTRADO na tabela 'professionals'.")
            print("Isso explica por que ele está entrando como 'health' (fallback do frontend).")
            print("Você precisa CRIAR este profissional na tabela 'professionals' primeiro.")
            
            # Opção de criar automaticamente
            print("\nCriando usuário automaticamente com dados básicos...")
            try:
                new_prof = models.Professional(
                    name="Admin Recuperado",
                    email=email,
                    role=new_role,
                    employment_type="effective",
                    cpf="00000000000", # CPF fictício para passar na constraint se houver
                    status="active"
                )
                db.add(new_prof)
                db.commit()
                print(f"✅ Usuário criado com sucesso! ID: {new_prof.id}, Role: {new_prof.role}")
            except Exception as e:
                print(f"❌ Falha ao criar usuário: {e}")
                db.rollback()
            return

        print(f"✅ Usuário ENCONTRADO! ID: {professional.id}")
        print(f"Role atual: '{professional.role}'")
        
        if professional.role == new_role:
            print(f"O usuário já é '{new_role}'. Nenhuma alteração necessária.")
        else:
            print(f"Atualizando role de '{professional.role}' para '{new_role}'...")
            professional.role = new_role
            db.commit()
            print("✅ Atualização concluída com sucesso!")
            
    except Exception as e:
        print(f"Erro ao acessar banco de dados: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    target_email = "akalleb@tutamail.com"
    if len(sys.argv) > 1:
        target_email = sys.argv[1]
        
    fix_user_role(target_email)

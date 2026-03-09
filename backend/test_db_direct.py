from app.database import SessionLocal
from app.models import Professional, Attendance, MultidisciplinaryEvolution
from app.core.security import encrypt_data, get_data_hash, hash_password
import uuid

def run_tests():
    db = SessionLocal()
    print("--- Início dos Testes de Banco de Dados ---")
    
    unique_email = f"audit.tester.{uuid.uuid4().hex[:8]}@example.com"
    cpf_teste = "999.999.999-99"
    
    # 1. DELETE cleanup (if exists)
    db.query(Professional).filter(Professional.email == unique_email).delete()
    db.commit()

    # 2. INSERT
    print(f"\n[INSERT] Criando profissional: {unique_email}")
    novo_prof = Professional(
        name="Auditor Teste",
        email=unique_email,
        role="health",
        employment_type="effective",
        cpf=encrypt_data(cpf_teste),
        cpf_hash=get_data_hash(cpf_teste),
        password_hash=hash_password("senha_segura"),
        status="active"
    )
    db.add(novo_prof)
    try:
        db.commit()
        db.refresh(novo_prof)
        print(f"Sucesso! ID inserido: {novo_prof.id}")
    except Exception as e:
        db.rollback()
        print(f"Falha no INSERT: {e}")
        return

    # 3. QUERY
    print(f"\n[QUERY] Buscando profissional recém-criado...")
    prof_buscado = db.query(Professional).filter(Professional.id == novo_prof.id).first()
    if prof_buscado:
        print(f"Encontrado: {prof_buscado.name}, CPF Hash: {prof_buscado.cpf_hash}")
    else:
        print("Falha: não encontrado na busca.")

    # 4. UPDATE
    print(f"\n[UPDATE] Atualizando cargo e especialidade...")
    prof_buscado.function_role = "Auditoria Chefe"
    prof_buscado.specialty = "Segurança de Software"
    try:
        db.commit()
        db.refresh(prof_buscado)
        print(f"Atualizado! function_role: {prof_buscado.function_role}, specialty: {prof_buscado.specialty}")
    except Exception as e:
        db.rollback()
        print(f"Falha no UPDATE: {e}")

    # 5. DELETE
    print(f"\n[DELETE] Removendo profissional de teste...")
    try:
        db.delete(prof_buscado)
        db.commit()
        
        verify_deleted = db.query(Professional).filter(Professional.id == novo_prof.id).first()
        if not verify_deleted:
             print("Sucesso! Registro deletado.")
        else:
             print("Falha: registro não foi deletado.")
    except Exception as e:
        db.rollback()
        print(f"Falha no DELETE: {e}")

    db.close()
    print("\n--- Testes de Banco de Dados Concluídos ---")

if __name__ == "__main__":
    run_tests()

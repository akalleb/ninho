import os
from app.database import SessionLocal
from app import models
from app.core.security import hash_password, encrypt_data, get_data_hash
from app.modules.professionals.services import ProfessionalService


def seed_admin():
    db = SessionLocal()
    try:
        email = "admin@ninho.local"
        password = "123456"
        name = "Admin Ninho"
        cpf_plain = "00000000000"

        print(f"Seeding admin user: {email}")

        professional = (
            db.query(models.Professional)
            .filter(models.Professional.email == email)
            .first()
        )

        password_hash = hash_password(password)
        cpf_hash = get_data_hash(cpf_plain)

        if professional:
            print("Profissional já existe. Atualizando dados para admin ativo...")
            professional.name = name
            professional.role = "admin"
            professional.employment_type = "effective"
            professional.status = "active"
            professional.cpf = encrypt_data(cpf_plain)
            professional.cpf_hash = cpf_hash
            professional.password_hash = password_hash
        else:
            print("Criando novo profissional admin...")
            professional = models.Professional(
                name=name,
                email=email,
                role="admin",
                employment_type="effective",
                cpf=encrypt_data(cpf_plain),
                cpf_hash=cpf_hash,
                status="active",
                password_hash=password_hash,
            )
            db.add(professional)

        metadata = {
            "name": name,
            "role": "admin",
        }

        try:
            ProfessionalService.create_supabase_user(email, password, metadata)
        except Exception as e:
            print(f"Aviso: falha ao sincronizar com Supabase Auth: {e}")

        db.commit()
        db.refresh(professional)
        print(f"✅ Admin pronto! ID: {professional.id}, email: {professional.email}")
        print("Use estas credenciais para login na API/frontend:")
        print(f"  email: {email}")
        print(f"  senha: {password}")
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar/atualizar admin: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()

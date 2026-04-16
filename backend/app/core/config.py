"""
Application Configuration
"""
import os
from pathlib import Path
from dotenv import load_dotenv

_repo_root = Path(__file__).resolve().parents[3]
_env_path = _repo_root / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# JWT
_SECRET_KEY_ENV = os.getenv("SECRET_KEY")

# Em produção, SECRET_KEY deve ser obrigatório
_env = os.getenv("ENVIRONMENT", "").strip().lower()
_is_prod = _env in ("prod", "production")

if _is_prod and not _SECRET_KEY_ENV:
    raise ValueError(
        "SECRET_KEY deve ser definido em ambiente de produção. "
        "Gere uma chave segura com: openssl rand -base64 32"
    )

SECRET_KEY = _SECRET_KEY_ENV or "ninho-secret-key-change-in-production-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Encryption
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")


# CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://localhost:8000",
    "*"  # Temporary for dev, consider removing in production
]

# Add production origins from env
PROD_ORIGINS = os.getenv("CORS_ORIGINS", "")
if PROD_ORIGINS:
    ALLOWED_ORIGINS.extend([o.strip() for o in PROD_ORIGINS.split(",") if o.strip()])

# Media
MEDIA_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media")

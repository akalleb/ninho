from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import socket
from pathlib import Path
from dotenv import load_dotenv

_repo_root = Path(__file__).resolve().parents[2]
_env_path = _repo_root / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)


def get_engine():
    if not SQLALCHEMY_DATABASE_URL:
        raise ValueError("DATABASE_URL is not set in environment or .env file.")
    url = SQLALCHEMY_DATABASE_URL
    connect_args: dict = {}

    if url.startswith("postgresql://"):
        if "sslmode=" not in url:
            url += ("&" if "?" in url else "?") + "sslmode=require"
        try:
            host = url.split("@", 1)[1].split("/", 1)[0].split(":", 1)[0]
            port = 5432
            if ":" in url.split("@", 1)[1].split("/", 1)[0]:
                port_str = url.split("@", 1)[1].split("/", 1)[0].split(":", 1)[1]
                port = int(port_str)
            infos = socket.getaddrinfo(host, port, family=socket.AF_INET, type=socket.SOCK_STREAM)
            if infos:
                connect_args["hostaddr"] = infos[0][4][0]
        except Exception:
            pass

    return create_engine(url, connect_args=connect_args)


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Pega a URL do .env
dsn = os.getenv("DATABASE_URL")

# Limpeza automática para o teste não falhar por causa do driver
if dsn and "+psycopg2" in dsn:
    dsn = dsn.replace("+psycopg2", "")

try:
    print(f"Tentando conectar em: {dsn.split('@')[1]}") # Mostra o host sem a senha
    conn = psycopg2.connect(dsn)
    print("✅ CONEXÃO COM SUPABASE BATEU COM SUCESSO!")
    conn.close()
except Exception as e:
    print("❌ ERRO DE CONEXÃO:")
    print(e)
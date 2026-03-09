import os
from sqlalchemy import create_engine

url = "postgresql://postgres.wujtrlwpaowwpmpkhdmu:L6BNM9_X7GQfUA1R8M9yKP4M7VaCrRF4300XNsLS@db.wujtrlwpaowwpmpkhdmu.supabase.co:6543/postgres"

print("Testing connection to:", url)
try:
    engine = create_engine(url)
    with engine.connect() as conn:
        print("Success!")
except Exception as e:
    print("Error:", e)

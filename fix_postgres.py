import sys
import os
from sqlalchemy import text

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import database

def fix_postgres():
    engine = database.engine
    print(f"Connecting to: {engine.url}")
    
    with engine.connect() as conn:
        # 1. Add attendance_id to multidisciplinary_evolutions
        print("Checking multidisciplinary_evolutions...")
        try:
            conn.execute(text("ALTER TABLE multidisciplinary_evolutions ADD COLUMN attendance_id INTEGER REFERENCES attendances(id)"))
            print("Added attendance_id column.")
        except Exception as e:
            print(f"Column might already exist or error: {e}")
            
        # 2. Update status values in attendances
        print("Updating status values in attendances...")
        try:
            conn.execute(text("UPDATE attendances SET status = 'em_espera' WHERE status = 'waiting'"))
            conn.execute(text("UPDATE attendances SET status = 'em_atendimento' WHERE status = 'in_progress'"))
            conn.execute(text("UPDATE attendances SET status = 'finalizado' WHERE status = 'completed'"))
            print("Status values updated.")
        except Exception as e:
            print(f"Error updating status: {e}")
            
        conn.commit()
        print("Done.")

if __name__ == "__main__":
    fix_postgres()

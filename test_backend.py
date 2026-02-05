import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import models, database
from sqlalchemy import inspect

def check_db():
    print("Checking database...")
    engine = database.engine
    print(f"Database URL: {engine.url}")
    
    # Create tables if not exist
    models.Base.metadata.create_all(bind=engine)
    print("Tables created (if not existed).")
    
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('multidisciplinary_evolutions')]
    print(f"Columns in multidisciplinary_evolutions: {columns}")
    
    if 'attendance_id' in columns:
        print("SUCCESS: attendance_id exists.")
    else:
        print("FAILURE: attendance_id MISSING.")
        
    att_columns = [c['name'] for c in inspector.get_columns('attendances')]
    print(f"Columns in attendances: {att_columns}")

if __name__ == "__main__":
    check_db()

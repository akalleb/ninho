from app.database import SessionLocal
from app import models
import sys

def debug_professional(prof_id):
    db = SessionLocal()
    try:
        print(f"Querying professional {prof_id}...")
        prof = db.query(models.Professional).filter(models.Professional.id == prof_id).first()
        if prof:
            print(f"Found: {prof.name}")
            print(f"Bio: {prof.bio}")
            print(f"Phone: {prof.phone}")
            print(f"Social: {prof.social_media}")
        else:
            print("Professional not found.")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_professional(5)

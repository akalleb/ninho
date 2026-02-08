from app.database import engine
from sqlalchemy import text

def migrate():
    # Use autocommit to avoid transaction block issues on error
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as connection:
        print("Migrating 'families' table...")
        
        columns = [
            ("gender", "VARCHAR"),
            ("nationality", "VARCHAR DEFAULT 'Brasileira'"),
            ("marital_status", "VARCHAR"),
            ("profession", "VARCHAR"),
            ("assistance_status", "VARCHAR DEFAULT 'active'")
        ]

        for col_name, col_type in columns:
            try:
                print(f"Attempting to add '{col_name}'...")
                connection.execute(text(f"ALTER TABLE families ADD COLUMN {col_name} {col_type}"))
                print(f" -> Success: Added '{col_name}'")
            except Exception as e:
                if "already exists" in str(e):
                    print(f" -> Skipped: '{col_name}' already exists.")
                else:
                    print(f" -> Error adding '{col_name}': {e}")

        # Migration for Professional Profile
        print("Migrating 'professionals' table...")
        prof_columns = [
            ("cover_url", "VARCHAR"),
            ("bio", "TEXT"),
            ("phone", "VARCHAR"),
            ("website", "VARCHAR"),
            ("social_media", "TEXT"),
            ("skills", "TEXT")
        ]

        for col_name, col_type in prof_columns:
            try:
                print(f"Attempting to add '{col_name}' to professionals...")
                connection.execute(text(f"ALTER TABLE professionals ADD COLUMN {col_name} {col_type}"))
                print(f" -> Success: Added '{col_name}'")
            except Exception as e:
                if "already exists" in str(e) or "duplicate column" in str(e):
                    print(f" -> Skipped: '{col_name}' already exists.")
                else:
                    print(f" -> Error adding '{col_name}': {e}")


if __name__ == "__main__":
    migrate()

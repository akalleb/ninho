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

        # Update defaults
        try:
            print("Updating default values...")
            connection.execute(text("UPDATE families SET assistance_status = 'active' WHERE assistance_status IS NULL"))
            connection.execute(text("UPDATE families SET nationality = 'Brasileira' WHERE nationality IS NULL"))
            print(" -> Defaults updated.")
        except Exception as e:
            print(f" -> Error updating defaults: {e}")

if __name__ == "__main__":
    migrate()

from sqlalchemy import create_engine, inspect
import os

db_path = "sqlite:///sql_app.db"
if not os.path.exists("sql_app.db"):
    print("Database file not found.")
else:
    engine = create_engine(db_path)
    insp = inspect(engine)
    print("Tables:", insp.get_table_names())

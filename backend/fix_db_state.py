from sqlalchemy import create_engine, text
engine = create_engine("sqlite:///sql_app.db")
with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS projects"))
    print("Dropped projects table")

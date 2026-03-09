from sqlalchemy import create_engine, text
engine = create_engine("sqlite:///sql_app.db")
try:
    with engine.connect() as conn:
        print(conn.execute(text("SELECT * FROM alembic_version")).fetchall())
except Exception as e:
    print(e)

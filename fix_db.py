import sqlite3
import os

# Use absolute path to be sure
DB_FILE = os.path.join(os.getcwd(), "sql_app.db")

def fix_database():
    print(f"Current Working Directory: {os.getcwd()}")
    print(f"Looking for DB at: {DB_FILE}")
    
    if not os.path.exists(DB_FILE):
        print(f"Database file not found at {DB_FILE}")
        # List files in cwd
        print("Files in CWD:", os.listdir(os.getcwd()))
        
        # Try looking in backend/app just in case (though it shouldn't be there based on LS)
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # 1. Fix MultidisciplinaryEvolution (add attendance_id)
    try:
        cursor.execute("SELECT attendance_id FROM multidisciplinary_evolutions LIMIT 1")
    except sqlite3.OperationalError:
        print("Adding attendance_id to multidisciplinary_evolutions...")
        try:
            cursor.execute("ALTER TABLE multidisciplinary_evolutions ADD COLUMN attendance_id INTEGER")
            print("Done.")
        except Exception as e:
            print(f"Error adding column: {e}")
    else:
        print("Column attendance_id already exists.")

    # 2. Fix Attendance (add wallet_id, scheduled_time)
    try:
        cursor.execute("SELECT wallet_id FROM attendances LIMIT 1")
    except sqlite3.OperationalError:
        print("Adding wallet_id to attendances...")
        try:
            cursor.execute("ALTER TABLE attendances ADD COLUMN wallet_id INTEGER")
            print("Done.")
        except Exception as e:
            print(f"Error adding column: {e}")
    else:
        print("Column wallet_id already exists.")

    try:
        cursor.execute("SELECT scheduled_time FROM attendances LIMIT 1")
    except sqlite3.OperationalError:
        print("Adding scheduled_time to attendances...")
        try:
            cursor.execute("ALTER TABLE attendances ADD COLUMN scheduled_time TIMESTAMP")
            print("Done.")
        except Exception as e:
            print(f"Error adding column: {e}")
    else:
        print("Column scheduled_time already exists.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_database()

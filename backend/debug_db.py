import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def debug_db():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()
        
        print(f"Connecting to database: {DB_NAME}")
        
        # Check if admin table exists
        cursor.execute("SHOW TABLES LIKE 'admin'")
        if not cursor.fetchone():
            print("Table 'admin' DOES NOT EXIST!")
            return
        
        # Get column details
        cursor.execute("DESCRIBE admin")
        columns = cursor.fetchall()
        print("\nColumns in 'admin' table:")
        for col in columns:
            print(f"- {col[0]} ({col[1]})")
            
        # Check current data
        cursor.execute("SELECT username, password FROM admin")
        rows = cursor.fetchall()
        print("\nUsernames and Password info in 'admin' table:")
        for row in rows:
            is_hashed = row[1].startswith("pbkdf2:sha256")
            print(f"- '{row[0]}': Length: {len(row[1])}, Hashed: {is_hashed}")
        
        print(f"\nTotal rows in 'admin' table: {len(rows)}")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_db()

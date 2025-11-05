import mysql.connector
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

def get_db_connection():
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    return conn

# ✅ IMPORTANT: Get connection first
conn = get_db_connection()
cursor = conn.cursor()

# Create teams table
cursor.execute("""
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL
);
""")

# Create players table
cursor.execute("""
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    cod_name VARCHAR(100) NOT NULL,
    team_id INT,
    photo VARCHAR(255),
    FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL
);
""")

conn.commit()
conn.close()

print("Database setup completed ✅")

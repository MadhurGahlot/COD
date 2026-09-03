import os
import sqlite3
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "cod_tournament")


class SQLiteCursorWrapper:
    def __init__(self, cursor, dictionary=False):
        self._cursor = cursor
        self._dictionary = dictionary

    def execute(self, query, params=None):
        # Convert MySQL %s placeholder to SQLite ? placeholder
        query = query.replace("%s", "?")
        query = query.replace("INT AUTO_INCREMENT", "INTEGER")
        query = query.replace("AUTO_INCREMENT", "")
        query = query.replace("ENUM('player', 'admin', 'team')", "TEXT")
        query = query.replace("ENUM('active', 'pending')", "TEXT")
        query = query.replace("CURDATE()", "DATE('now')")

        if params is not None:
            if isinstance(params, (list, tuple)):
                return self._cursor.execute(query, params)
            else:
                return self._cursor.execute(query, (params,))
        return self._cursor.execute(query)

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        if self._dictionary:
            return dict(row)
        return row

    def fetchall(self):
        rows = self._cursor.fetchall()
        if self._dictionary:
            return [dict(r) for r in rows]
        return rows

    @property
    def rowcount(self):
        return self._cursor.rowcount


class SQLiteConnWrapper:
    def __init__(self, sqlite_conn):
        self._conn = sqlite_conn
        self._conn.row_factory = sqlite3.Row

    def cursor(self, dictionary=False):
        return SQLiteCursorWrapper(self._conn.cursor(), dictionary=dictionary)

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()


def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connection_timeout=2
        )
        return conn
    except Exception as e:
        db_path = os.path.join(os.path.dirname(__file__), "cod_tournament.db")
        sqlite_conn = sqlite3.connect(db_path, check_same_thread=False)
        return SQLiteConnWrapper(sqlite_conn)


# ✅ Setup tables safely on import
try:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role ENUM('player', 'admin', 'team') DEFAULT 'player',
        team_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(100) NOT NULL,
        year INT DEFAULT 2024
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        player_name VARCHAR(100) NOT NULL,
        cod_name VARCHAR(100),
        email VARCHAR(100),
        team_id INT,
        photo VARCHAR(255),
        year INT DEFAULT 2024,
        kills INT DEFAULT 0,
        deaths INT DEFAULT 0,
        assists INT DEFAULT 0,
        kd_ratio FLOAT DEFAULT 0.0,
        total_matches INT DEFAULT 0,
        is_mvp TINYINT DEFAULT 0,
        status ENUM('active', 'pending') DEFAULT 'pending',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS matchesresult (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_id INT,
        opponent_id INT NULL,
        kills INT,
        deaths INT,
        assists INT,
        kd_ratio FLOAT,
        match_date DATE,
        year INT,
        FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE,
        FOREIGN KEY(opponent_id) REFERENCES teams(id) ON DELETE SET NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS winners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year INT,
        winner_team_id INT,
        runnerup_team_id INT,
        winner_photo VARCHAR(255),
        final_score VARCHAR(50),
        mvp_name VARCHAR(100),
        mvp_photo VARCHAR(255),
        FOREIGN KEY(winner_team_id) REFERENCES teams(id),
        FOREIGN KEY(runnerup_team_id) REFERENCES teams(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS home_settings (
        year INT PRIMARY KEY,
        hero_title VARCHAR(255),
        hero_subtitle TEXT,
        hero_background VARCHAR(255),
        college_logo VARCHAR(255)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS home_featured_players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_id INT,
        rank_number INT,
        year INT,
        FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS home_highlights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(255),
        title VARCHAR(255),
        description TEXT,
        year INT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS home_hero_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(255),
        year INT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS match_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_a_id INT,
        team_b_id INT,
        match_time DATETIME,
        description VARCHAR(255),
        year INT,
        FOREIGN KEY(team_a_id) REFERENCES teams(id),
        FOREIGN KEY(team_b_id) REFERENCES teams(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        content TEXT,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        year INT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        action VARCHAR(255),
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(admin_id) REFERENCES admin(id) ON DELETE SET NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tournament_matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        round_name VARCHAR(100),
        team_a_id INT,
        team_b_id INT,
        winner_team_id INT NULL,
        next_match_id INT NULL,
        match_index INT,
        year INT,
        FOREIGN KEY(team_a_id) REFERENCES teams(id),
        FOREIGN KEY(team_b_id) REFERENCES teams(id),
        FOREIGN KEY(winner_team_id) REFERENCES teams(id)
    );
    """)

    conn.commit()
    conn.close()

    print("Database setup completed!")
except Exception as e:
    print(f"Warning: Could not perform initial DB setup on import: {e}")

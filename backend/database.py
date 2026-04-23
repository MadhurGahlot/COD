import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def get_db_connection():
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    return conn

# ✅ IMPORTANT: Get connection and setup tables
conn = get_db_connection()
cursor = conn.cursor()

# Create users table
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

# Create admin table
cursor.execute("""
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

# Create teams table
cursor.execute("""
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    year INT DEFAULT 2024
);
""")

# Create players table
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

# Create matchesresult table
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

# Create winners table
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

# Create home_settings table
cursor.execute("""
CREATE TABLE IF NOT EXISTS home_settings (
    year INT PRIMARY KEY,
    hero_title VARCHAR(255),
    hero_subtitle TEXT,
    hero_background VARCHAR(255),
    college_logo VARCHAR(255)
);
""")

# Create home_featured_players table
cursor.execute("""
CREATE TABLE IF NOT EXISTS home_featured_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT,
    rank_number INT,
    year INT,
    FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
);
""")

# Create home_highlights table
cursor.execute("""
CREATE TABLE IF NOT EXISTS home_highlights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    year INT
);
""")

# Create home_hero_images table for multi-photo support
cursor.execute("""
CREATE TABLE IF NOT EXISTS home_hero_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    year INT
);
""")

# Create match_schedules table
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

# Create news table
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

# Create audit_logs table for technical depth
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

# Create tournament_matches table for Brackets
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

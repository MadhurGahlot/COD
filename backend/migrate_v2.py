import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    cursor = conn.cursor()

    print("Starting migration...")

    # 1. Update users table: role and team_id
    try:
        cursor.execute("ALTER TABLE users MODIFY COLUMN role ENUM('player', 'admin', 'team') DEFAULT 'player'")
        print("Updated users role enum.")
    except Exception as e:
        print(f"Role update error (might already be updated): {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN team_id INT NULL AFTER email")
        cursor.execute("ALTER TABLE users ADD CONSTRAINT fk_user_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL")
        print("Added team_id to users.")
    except Exception as e:
        print(f"team_id add error: {e}")

    # 1.5. Update players table: user_id and status
    try:
        cursor.execute("ALTER TABLE players ADD COLUMN user_id INT NULL AFTER id")
        cursor.execute("ALTER TABLE players ADD CONSTRAINT fk_player_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL")
        print("Added user_id to players.")
    except Exception as e:
        print(f"user_id add error: {e}")

    try:
        cursor.execute("ALTER TABLE players ADD COLUMN status ENUM('active', 'pending') DEFAULT 'pending' AFTER total_matches")
        print("Added status to players.")
    except Exception as e:
        print(f"status add error: {e}")

    # 2. Update matchesresult table: opponent -> opponent_id
    try:
        cursor.execute("ALTER TABLE matchesresult ADD COLUMN opponent_id INT NULL AFTER player_id")
        cursor.execute("ALTER TABLE matchesresult ADD CONSTRAINT fk_match_opponent FOREIGN KEY (opponent_id) REFERENCES teams(id) ON DELETE SET NULL")
        # Try to drop old opponent column if it exists
        cursor.execute("ALTER TABLE matchesresult DROP COLUMN opponent")
        print("Updated matchesresult to use opponent_id.")
    except Exception as e:
        print(f"matchesresult update error: {e}")

    # 3. Update winners table: extra columns
    extra_cols = [
        ("final_score", "VARCHAR(50)"),
        ("mvp_name", "VARCHAR(100)"),
        ("mvp_photo", "VARCHAR(255)")
    ]
    for col, ctype in extra_cols:
        try:
            cursor.execute(f"ALTER TABLE winners ADD COLUMN {col} {ctype}")
            print(f"Added {col} to winners.")
        except Exception as e:
            print(f"Winner update error for {col}: {e}")

    conn.commit()
    conn.close()
    print("Migration finished.")

if __name__ == "__main__":
    migrate()

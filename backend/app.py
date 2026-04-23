from flask import Flask, render_template, request, redirect, session, send_from_directory, url_for, flash
from database import get_db_connection
import os
import mysql.connector
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "prod_secret_key_123")

# Upload folder absolute path (ensures no FileNotFoundError)
UPLOAD_FOLDER = os.path.join(app.root_path, "static")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PLAYER_PHOTOS_FOLDER = os.path.join(UPLOAD_FOLDER, "player_photos")
if not os.path.exists(PLAYER_PHOTOS_FOLDER):
    os.makedirs(PLAYER_PHOTOS_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["PLAYER_PHOTOS"] = PLAYER_PHOTOS_FOLDER

# ------------------ Auth Decorators ------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "role" not in session or session["role"] != "admin":
            flash("Admin access required.", "danger")
            return redirect(url_for("homepage"))
        return f(*args, **kwargs)
    return decorated_function

def team_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "role" not in session or session["role"] != "team":
            flash("Team access required.", "danger")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

@app.before_request
def ensure_selected_year():
    if "selected_year" not in session:
        session["selected_year"] = datetime.now().year

@app.context_processor
def inject_now():
    return {'now': datetime.now()}

def get_selected_year():
    if "selected_year" not in session:
        session["selected_year"] = datetime.now().year
    return int(session["selected_year"])

def log_action(action, details=""):
    """Utilities for Technical Depth: Log admin actions."""
    if "user_id" in session and session.get("role") == "admin":
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO audit_logs (admin_id, action, details) VALUES (%s, %s, %s)", 
                       (session["user_id"], action, details))
        conn.commit()
        conn.close()

@app.route("/set_year", methods=["POST"])
def set_year():
    selected = request.form.get("year")
    if selected:
        try:
            session["selected_year"] = int(selected)
            flash(f"Switched to season {selected}", "success")
        except ValueError:
            pass
    # Redirect back to where they were, or home
    return redirect(request.referrer or url_for("homepage"))


# -------- HOMEPAGE (dynamic) ----------
@app.route("/")
def homepage():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    year = get_selected_year()

    # Home settings (for selected year)
    cursor.execute("SELECT * FROM home_settings WHERE year = %s LIMIT 1", (year,))
    settings = cursor.fetchone()

    # Top Featured Players for selected year
    cursor.execute("""
        SELECT hfp.id, hfp.rank_number, p.player_name, p.photo, p.kd_ratio, p.kills
        FROM home_featured_players hfp
        LEFT JOIN players p ON hfp.player_id = p.id
        WHERE hfp.year = %s
        ORDER BY hfp.rank_number ASC
    """, (year,))
    top_players = cursor.fetchall()

    # Highlights for selected year
    cursor.execute("SELECT * FROM home_highlights WHERE year = %s", (year,))
    highlights = cursor.fetchall()
    
    # Hero images for carousel
    cursor.execute("SELECT * FROM home_hero_images WHERE year = %s", (year,))
    hero_images = cursor.fetchall()

    # Stats (counts for selected year)
    cursor.execute("SELECT COUNT(*) AS c FROM teams WHERE year = %s", (year,))
    teams = cursor.fetchone()["c"]
    cursor.execute("SELECT COUNT(*) AS c FROM players WHERE year = %s", (year,))
    players_count = cursor.fetchone()["c"]
    cursor.execute("SELECT COUNT(*) AS c FROM matchesresult WHERE year = %s", (year,))
    matches = cursor.fetchone()["c"]

    conn.close()

    return render_template(
        "home.html",
        settings=settings,
        top_players=top_players,
        highlights=highlights,
        hero_images=hero_images,
        teams=teams,
        players=players_count,
        matches=matches
    )

# -------- SERVE OTHER FRONTEND FILES (HTML, JS, images) ----------
#@app.route("/frontend/<path:filename>")
#def serve_frontend(filename):
  #  return send_from_directory("../frontend", filename)

# -------- STATIC FILES (CSS, JS, IMAGES) ----------
# Note: Flask by default serves /static/, but we keep this route consistent
#@app.route("/static/<path:filename>")
#def serve_static_files(filename):
 #   return send_from_directory(os.path.join(app.root_path, "static"), filename)

# -------------------- AUTHENTICATION --------------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        hashed_password = generate_password_hash(password)

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO users (username, password, email, role) VALUES (%s, %s, %s, 'player')",
                           (username, hashed_password, email))
            conn.commit()
            flash("Registration successful! Please login.", "success")
            return redirect(url_for("login"))
        except mysql.connector.Error as err:
            flash(f"Error: {err.msg}", "danger")
        finally:
            conn.close()

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Check admin table
        cursor.execute("SELECT * FROM admin WHERE username = %s", (username.strip(),))
        admins = cursor.fetchall()
        
        for admin in admins:
            if admin and (check_password_hash(admin["password"], password) or admin["password"] == password):
                session["user_id"] = admin["id"]
                session["username"] = admin["username"]
                session["role"] = "admin"
                session["selected_year"] = datetime.now().year
                conn.close()
                return redirect(url_for("admin_dashboard"))

        # 2. Check users table (players/teams)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        conn.close()

        if user and (check_password_hash(user["password"], password) or user["password"] == password):
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]
            session["selected_year"] = datetime.now().year
            
            if user["role"] == "admin":
                return redirect(url_for("admin_dashboard"))
            elif user["role"] == "team":
                return redirect(url_for("team_dashboard"))
            return redirect(url_for("homepage"))
        else:
            flash("Invalid credentials", "danger")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("Logged out successfully.", "info")
    return redirect(url_for("homepage"))

# -------------------- ADMIN DASHBOARD --------------------
@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    get_selected_year()
    return render_template("admin_dashboard.html")

# ---------------- Admin: set year (switch season) ----------------
@app.route("/admin/set_year", methods=["POST"])
@admin_required
def admin_set_year():
    selected = request.form.get("year")
    try:
        session["selected_year"] = int(selected)
    except:
        session["selected_year"] = datetime.now().year
    return redirect(url_for("admin_dashboard"))

# ------------------- Teams CRUD -----------------------
@app.route("/admin/teams", methods=["GET", "POST"])
@admin_required
def admin_teams():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == "POST":
        team_name = request.form["team_name"]
        year = int(request.form.get("year", get_selected_year()))
        cursor.execute("INSERT INTO teams (team_name, year) VALUES (%s, %s)", (team_name, year))
        conn.commit()
        log_action("Upload Team", f"Added team: {team_name} for season {year}")
        flash("Team uploaded successfully!", "success")
        return redirect(url_for("admin_teams"))

    cursor.execute("SELECT * FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()
    conn.close()
    return render_template("admin_teams.html", teams=teams)

@app.route("/admin/teams/edit/<int:team_id>", methods=["GET", "POST"])
@admin_required
def edit_team(team_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if request.method == "POST":
        team_name = request.form["team_name"]
        cursor.execute("UPDATE teams SET team_name = %s WHERE id = %s", (team_name, team_id))
        conn.commit()
        conn.close()
        flash("Team updated!", "success")
        return redirect(url_for("admin_teams"))
    
    cursor.execute("SELECT * FROM teams WHERE id = %s", (team_id,))
    team = cursor.fetchone()
    conn.close()
    return render_template("edit_team.html", team=team)

@app.route("/admin/teams/delete/<int:team_id>")
@admin_required
def delete_team(team_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Unlink team from winners
        cursor.execute("UPDATE winners SET winner_team_id = NULL WHERE winner_team_id = %s", (team_id,))
        cursor.execute("UPDATE winners SET runnerup_team_id = NULL WHERE runnerup_team_id = %s", (team_id,))
        
        # Unlink team from match_schedules
        cursor.execute("UPDATE match_schedules SET team_a_id = NULL WHERE team_a_id = %s", (team_id,))
        cursor.execute("UPDATE match_schedules SET team_b_id = NULL WHERE team_b_id = %s", (team_id,))
        
        # Unlink team from tournament_matches
        cursor.execute("UPDATE tournament_matches SET team_a_id = NULL WHERE team_a_id = %s", (team_id,))
        cursor.execute("UPDATE tournament_matches SET team_b_id = NULL WHERE team_b_id = %s", (team_id,))
        cursor.execute("UPDATE tournament_matches SET winner_team_id = NULL WHERE winner_team_id = %s", (team_id,))
        
        # Unlink from users
        cursor.execute("UPDATE users SET team_id = NULL WHERE team_id = %s", (team_id,))

        # Finally delete team
        cursor.execute("DELETE FROM teams WHERE id = %s", (team_id,))
        conn.commit()
        flash("Team deleted successfully!", "danger")
    except mysql.connector.Error as err:
        conn.rollback()
        flash(f"Error deleting team: {err.msg}", "danger")
    finally:
        conn.close()
    return redirect(url_for("admin_teams"))

# ----------------------------- ADMIN PLAYER CRUD -----------------------------
@app.route("/admin/players", methods=["GET", "POST"])
@admin_required
def admin_players():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == "POST":
        player_name = request.form["player_name"]
        cod_name = request.form.get("cod_name", "")
        email = request.form["email"]
        team_id = request.form.get("team_id") or None
        year = int(request.form.get("year", get_selected_year()))
        user_id = request.form.get("user_id") or None

        filename = None
        if "photo" in request.files:
            photo = request.files["photo"]
            if photo and photo.filename != "":
                filename = secure_filename(photo.filename)
                photo.save(os.path.join(app.config["PLAYER_PHOTOS"], filename))

        cursor.execute("""
            INSERT INTO players (player_name, cod_name, email, team_id, photo, year, user_id, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'active')
        """, (player_name, cod_name, email, team_id, filename, year, user_id))
        conn.commit()
        log_action("Upload Player", f"Added player: {player_name} ({cod_name})")
        flash("Player uploaded successfully!", "success")
        return redirect(url_for("admin_players"))

    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()

    cursor.execute("SELECT id, username FROM users WHERE role = 'player'")
    unlinked_users = cursor.fetchall()

    cursor.execute("""
        SELECT p.*, t.team_name, u.username
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.year = %s
    """, (get_selected_year(),))
    players = cursor.fetchall()

    conn.close()
    return render_template("admin_players.html", teams=teams, players=players, users=unlinked_users)

@app.route("/admin/players/edit/<int:player_id>", methods=["GET", "POST"])
@admin_required
def edit_player(player_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if request.method == "POST":
        p_name = request.form["player_name"]
        cod_name = request.form["cod_name"]
        team_id = request.form.get("team_id") or None
        
        photo = request.files.get("photo")
        if photo and photo.filename != "":
            filename = secure_filename(photo.filename)
            photo.save(os.path.join(app.config["PLAYER_PHOTOS"], filename))
            cursor.execute("UPDATE players SET photo = %s WHERE id = %s", (filename, player_id))

        cursor.execute("""
            UPDATE players SET player_name=%s, cod_name=%s, team_id=%s 
            WHERE id=%s
        """, (p_name, cod_name, team_id, player_id))
        conn.commit()
        flash("Player profile updated!", "success")
        return redirect(url_for("admin_players"))

    cursor.execute("SELECT * FROM players WHERE id=%s", (player_id,))
    player = cursor.fetchone()
    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()
    conn.close()
    return render_template("edit_player.html", player=player, teams=teams)

@app.route("/admin/players/delete/<int:player_id>")
@admin_required
def delete_player(player_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM players WHERE id = %s", (player_id,))
    conn.commit()
    conn.close()
    flash("Player deleted!", "danger")
    return redirect(url_for("admin_players"))

# ----------------- Assign Pending Players -----------------
@app.route("/admin/assign_players", methods=["GET", "POST"])
@admin_required
def assign_players():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    if request.method == "POST":
        player_id = request.form["player_id"]
        team_id = request.form["team_id"]
        cursor.execute("UPDATE players SET team_id = %s, status = 'active' WHERE id = %s", (team_id, player_id))
        conn.commit()
        flash("Player assigned to team!", "success")
    
    cursor.execute("SELECT p.*, u.username FROM players p JOIN users u ON p.user_id = u.id WHERE p.status = 'pending'")
    pending_players = cursor.fetchall()
    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()
    conn.close()
    return render_template("assign_players.html", pending=pending_players, teams=teams)

@app.route("/admin/logout")
def admin_logout():
    return redirect(url_for("logout"))

# ----------------------- Team Dashboard -----------------------
@app.route("/team/dashboard")
@team_required
def team_dashboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get team linked to this user
    cursor.execute("SELECT team_id FROM users WHERE id = %s", (session["user_id"],))
    u = cursor.fetchone()
    
    if not u or not u["team_id"]:
        conn.close()
        flash("Account not linked to any team.", "warning")
        return redirect(url_for("homepage"))
        
    team_id = u["team_id"]
    year = get_selected_year()
    
    # Get team info
    cursor.execute("SELECT * FROM teams WHERE id = %s", (team_id,))
    team = cursor.fetchone()
    
    # Get roster
    cursor.execute("""
        SELECT * FROM players 
        WHERE team_id = %s AND year = %s
    """, (team_id, year))
    roster = cursor.fetchall()
    
    # Get team's recent matches (where they were either team_a or team_b)
    cursor.execute("""
        SELECT s.*, t1.team_name as team_a_name, t2.team_name as team_b_name 
        FROM match_schedules s 
        JOIN teams t1 ON s.team_a_id = t1.id 
        JOIN teams t2 ON s.team_b_id = t2.id 
        WHERE (s.team_a_id = %s OR s.team_b_id = %s) AND s.year = %s
        ORDER BY s.match_time DESC LIMIT 5
    """, (team_id, team_id, year))
    matches = cursor.fetchall()
    
    conn.close()
    return render_template("team_dashboard.html", team=team, roster=roster, matches=matches)
@app.route("/home")
def public_home():
    return render_template("home.html")

@app.route("/teams")
def public_teams():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT teams.id, teams.team_name, COUNT(players.id) AS player_count
        FROM teams
        LEFT JOIN players ON players.team_id = teams.id AND players.year = teams.year
        WHERE teams.year = %s
        GROUP BY teams.id
    """, (get_selected_year(),))
    teams = cursor.fetchall()

    conn.close()
    return render_template("teams.html", teams=teams)

@app.route("/players")
def public_players():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT p.*, t.team_name 
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        WHERE p.year = %s AND p.status = 'active'
        ORDER BY p.player_name ASC
    """, (get_selected_year(),))
    players = cursor.fetchall()

    conn.close()
    return render_template("players.html", players=players)

@app.route("/team/<int:team_id>")
def team_details(team_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get team info (ensure correct year)
    cursor.execute("SELECT * FROM teams WHERE id=%s AND year=%s", (team_id, get_selected_year()))
    team = cursor.fetchone()

    # Get players of that team for selected year
    cursor.execute("""
    SELECT id AS player_id, player_name, cod_name, email, photo, kills, deaths, assists, kd_ratio
    FROM players
    WHERE team_id=%s AND year=%s
    """, (team_id, get_selected_year()))

    players = cursor.fetchall()

    conn.close()
    return render_template("team_details.html", team=team, players=players)

@app.route("/player/register_profile", methods=["GET", "POST"])
@login_required
def register_player_profile():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Check if already registered
    cursor.execute("SELECT * FROM players WHERE user_id = %s AND year = %s", (session["user_id"], get_selected_year()))
    if cursor.fetchone():
        flash("You have already registered for this year.", "info")
        return redirect(url_for("player_profile_self"))

    if request.method == "POST":
        player_name = request.form["player_name"]
        cod_name = request.form["cod_name"]
        email = request.form["email"]
        
        filename = None
        if "photo" in request.files:
            photo = request.files["photo"]
            if photo and photo.filename != "":
                filename = secure_filename(photo.filename)
                photo.save(os.path.join(app.config["PLAYER_PHOTOS"], filename))

        cursor.execute("""
            INSERT INTO players (player_name, cod_name, email, user_id, photo, year, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'pending')
        """, (player_name, cod_name, email, session["user_id"], filename, get_selected_year()))
        conn.commit()
        conn.close()
        flash("Registration submitted! Admin will assign you to a team soon.", "success")
        return redirect(url_for("homepage"))

    conn.close()
    return render_template("register_player.html")

@app.route("/player/me")
@login_required
def player_profile_self():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM players WHERE user_id = %s AND year = %s", (session["user_id"], get_selected_year()))
    player = cursor.fetchone()
    conn.close()
    if not player:
        return redirect(url_for("register_player_profile"))
    return render_template("player_profile.html", player=player)

@app.route("/player/<int:player_id>")
def player_profile(player_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get player info (by id and year)
    cursor.execute("""
        SELECT players.*, teams.team_name 
        FROM players
        LEFT JOIN teams ON players.team_id = teams.id
        WHERE players.id=%s AND players.year = %s
    """, (player_id, get_selected_year()))
    player = cursor.fetchone()

    # Get AUTO MVP for selected year
    cursor.execute("""
        SELECT * FROM players
        WHERE year = %s
        ORDER BY kd_ratio DESC, kills DESC
        LIMIT 1
    """, (get_selected_year(),))
    mvp = cursor.fetchone()

    p_kd = player["kd_ratio"] if player["kd_ratio"] else 0
    
    # Advanced Stats: Performance by Opponent
    cursor.execute("""
        SELECT t.team_name, 
               SUM(m.kills) as total_kills, 
               SUM(m.deaths) as total_deaths,
               SUM(m.assists) as total_assists,
               COUNT(m.id) as match_count
        FROM matchesresult m
        JOIN teams t ON m.opponent_id = t.id
        WHERE m.player_id = %s
        GROUP BY t.id
    """, (player_id,))
    opponent_stats = cursor.fetchall()
    
    # Achievements
    if player and player["team_id"]:
        cursor.execute("SELECT COUNT(*) as win_count FROM winners WHERE winner_team_id = %s", (player["team_id"],))
        result = cursor.fetchone()
        team_wins = result["win_count"] if result else 0
    else:
        team_wins = 0
    
    if player and player["player_name"]:
        cursor.execute("SELECT COUNT(*) as mvp_count FROM winners WHERE mvp_name = %s", (player["player_name"],))
        result = cursor.fetchone()
        mvp_awards = result["mvp_count"] if result else 0
    else:
        mvp_awards = 0

    conn.close()
    return render_template("player_profile.html", 
                           player=player, mvp=mvp, p_kd=p_kd, 
                           opponent_stats=opponent_stats,
                           team_wins=team_wins, mvp_awards=mvp_awards)

# ---------------- Admin: matches selection and entering per team ----------------
@app.route("/admin/matches", methods=["GET", "POST"])
@admin_required
def admin_matches():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get all teams for selected year
    cursor.execute("SELECT * FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()

    if request.method == "POST":
        team_a = request.form["team_a"]
        team_b = request.form["team_b"]

        # Get players of both teams for selected year
        cursor.execute("SELECT * FROM players WHERE team_id = %s AND year = %s", (team_a, get_selected_year()))
        players_a = cursor.fetchall()

        cursor.execute("SELECT * FROM players WHERE team_id = %s AND year = %s", (team_b, get_selected_year()))
        players_b = cursor.fetchall()

        conn.close()

        return render_template("enter_match_result.html", 
                               players_a=players_a, players_b=players_b,
                               team_a_id=team_a, team_b_id=team_b)

    conn.close()
    return render_template("select_teams.html", teams=teams)

#-------- MATCH RESULT (single player result entry) -----------
@app.route("/admin/add_match", methods=["GET", "POST"])
@admin_required
def add_match():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == "POST":
        player_id = request.form["player_id"]
        opponent_id = request.form.get("opponent_id")
        kills = int(request.form["kills"])
        deaths = int(request.form["deaths"])
        assists = int(request.form.get("assists", 0))
        match_date = request.form["match_date"]
        year = get_selected_year()

        # Ensure deaths is at least 1 for KD calculation
        kd_ratio = kills / max(deaths, 1)

        cursor.execute("""
            INSERT INTO matchesresult
            (player_id, opponent_id, kills, deaths, assists, kd_ratio, match_date, year)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (player_id, opponent_id, kills, deaths, assists, kd_ratio, match_date, year))

        cursor.execute("""
            UPDATE players
            SET kills = kills + %s,
                deaths = deaths + %s,
                assists = assists + %s,
                total_matches = total_matches + 1,
                kd_ratio = (kills + %s) / NULLIF((deaths + %s), 0)
            WHERE id = %s AND year = %s
        """, (kills, deaths, assists, kills, deaths, player_id, year))

        conn.commit()
        flash("Match result uploaded!", "success")
        return redirect(url_for("add_match"))

    cursor.execute("SELECT id, player_name FROM players WHERE year = %s", (get_selected_year(),))
    players = cursor.fetchall()

    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()

    cursor.execute("""
        SELECT m.*, p.player_name, t.team_name as opponent_name
        FROM matchesresult m 
        JOIN players p ON m.player_id = p.id 
        LEFT JOIN teams t ON m.opponent_id = t.id
        WHERE m.year = %s 
        ORDER BY m.match_date DESC
    """, (get_selected_year(),))
    matches = cursor.fetchall()
    
    conn.close()
    return render_template("add_match.html", players=players, matches=matches, teams=teams)

@app.route("/admin/matches/delete/<int:match_id>")
@admin_required
def delete_match(match_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Deduct stats before deleting? (Optional but good practice)
    cursor.execute("SELECT * FROM matchesresult WHERE id = %s", (match_id,))
    match = cursor.fetchone()
    if match:
        cursor.execute("""
            UPDATE players SET 
            kills = kills - %s, deaths = deaths - %s, assists = assists - %s, 
            total_matches = total_matches - 1,
            kd_ratio = (kills - %s) / NULLIF((deaths - %s), 0)
            WHERE id = %s
        """, (match["kills"], match["deaths"], match["assists"], match["kills"], match["deaths"], match["player_id"]))
        
        cursor.execute("DELETE FROM matchesresult WHERE id = %s", (match_id,))
        conn.commit()
    conn.close()
    flash("Match deleted and stats adjusted!", "danger")
    return redirect(url_for("add_match"))

# ---------------------- SAVE TEAM-VS-TEAM TO DATABASE ---------------
@app.route("/admin/save_match", methods=["POST"])
@admin_required
def save_match():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    year = get_selected_year()
    team_a_id = request.form.get("team_a_id")
    team_b_id = request.form.get("team_b_id")

    # Get all player IDs again to iterate over submitted form data
    cursor.execute("SELECT id FROM players WHERE team_id IN (%s, %s) AND year = %s", (team_a_id, team_b_id, year))
    player_ids = [row["id"] for row in cursor.fetchall()]

    for pid in player_ids:
        kills = request.form.get(f"kills_{pid}")
        if kills is not None:
            kills = int(kills)
            deaths = int(request.form.get(f"deaths_{pid}", 0))
            assists = int(request.form.get(f"assists_{pid}", 0))
            
            # Determine opponent_id: if player is in team_a, opponent is team_b
            cursor.execute("SELECT team_id FROM players WHERE id = %s", (pid,))
            p_team = cursor.fetchone()["team_id"]
            opponent_id = team_b_id if str(p_team) == str(team_a_id) else team_a_id

            # Update player cumulative stats
            cursor.execute("""
                UPDATE players 
                SET kills = kills + %s, deaths = deaths + %s, assists = assists + %s, 
                    total_matches = total_matches + 1,
                    kd_ratio = (kills + %s) / NULLIF((deaths + %s), 0)
                WHERE id = %s
            """, (kills, deaths, assists, kills, deaths, pid))

            # Record match result with opponent tracking
            cursor.execute("""
                INSERT INTO matchesresult (player_id, opponent_id, kills, deaths, assists, kd_ratio, match_date, year)
                VALUES (%s, %s, %s, %s, %s, %s, CURDATE(), %s)
            """, (pid, opponent_id, kills, deaths, assists, kills / max(deaths, 1), year))

    conn.commit()
    conn.close()
    flash("Match results uploaded successfully!", "success")
    return redirect(url_for("leaderboard"))

#------------------- LEADER BOARD --------------------------
@app.route("/leaderboard")
def leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # UPDATED QUERY:
    # 1. Sorts by K/D Ratio
    # 2. Tie-breaker: Higher Kills
    # 3. Tie-breaker: Lower Deaths (Skill check)
    # 4. Tie-breaker: More Matches Played (Dedication check)
    cursor.execute("""
        SELECT players.*, teams.team_name 
        FROM players
        LEFT JOIN teams ON players.team_id = teams.id AND teams.year = players.year
        WHERE players.year = %s
        ORDER BY kd_ratio DESC, kills DESC, deaths ASC, total_matches DESC
    """, (get_selected_year(),))

    leaderboard = cursor.fetchall()
    conn.close()

    # We don't actually need to pass 'mvp' separately because 
    # the HTML loops through 'leaderboard' and checks 'p.is_mvp'
    # but we can keep it if you want to display the MVP in a hero section later.
    mvp = leaderboard[0] if leaderboard else None

    return render_template("leaderboard.html", leaderboard=leaderboard, mvp=mvp)

# ------------------------- ADMIN HALL OF FAME ----------- (Winners)
@app.route("/admin/winners", methods=["GET", "POST"])
@admin_required
def admin_winners():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Add Winner Entry
    if request.method == "POST":
        year = request.form.get("year")
        # Use provided year or selected_year
        year_to_save = int(year) if year else get_selected_year()
        winner_team_id = request.form["winner_team_id"]
        runnerup_team_id = request.form["runnerup_team_id"]
        final_score = request.form.get("final_score")
        mvp_name = request.form.get("mvp_name")
        
        winner_photo = None
        if "winner_photo" in request.files:
            wp = request.files["winner_photo"]
            if wp and wp.filename != "":
                winner_photo = secure_filename(wp.filename)
                wp.save(os.path.join(app.config["PLAYER_PHOTOS"], winner_photo))

        mvp_photo = None
        if "mvp_photo" in request.files:
            mp = request.files["mvp_photo"]
            if mp and mp.filename != "":
                mvp_photo = secure_filename(mp.filename)
                mp.save(os.path.join(app.config["PLAYER_PHOTOS"], mvp_photo))

        cursor.execute("""
            INSERT INTO winners (year, winner_team_id, runnerup_team_id, winner_photo, final_score, mvp_name, mvp_photo)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (year_to_save, winner_team_id, runnerup_team_id, winner_photo, final_score, mvp_name, mvp_photo))

        conn.commit()

    # Load Teams for dropdown (for selected year)
    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()

    # Load Winners List (filter by session year)
    cursor.execute("""
    SELECT winners.*,
           t1.team_name AS winner_team,
           t2.team_name AS runnerup_team
    FROM winners
    LEFT JOIN teams t1 ON winners.winner_team_id = t1.id
    LEFT JOIN teams t2 ON winners.runnerup_team_id = t2.id
    WHERE winners.year = %s
    ORDER BY winners.year DESC
     """, (get_selected_year(),))
    winners = cursor.fetchall()

    conn.close()
    return render_template("admin_winners.html", teams=teams, winners=winners)

@app.route("/admin/winners/delete/<int:wid>")
@admin_required
def delete_winner(wid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM winners WHERE id = %s", (wid,))
    conn.commit()
    conn.close()
    flash("Hall of Fame entry removed.", "info")
    return redirect(url_for("admin_winners"))

# -------------------- Public Hall of fame -----------------
@app.route("/winners")
def public_winners():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT winners.*,
               t1.team_name AS winner_team,
               t2.team_name AS runnerup_team
        FROM winners
        LEFT JOIN teams t1 ON winners.winner_team_id = t1.id
        LEFT JOIN teams t2 ON winners.runnerup_team_id = t2.id
        WHERE winners.year = %s
        ORDER BY winners.year DESC
    """, (get_selected_year(),))
    winners = cursor.fetchall()

    conn.close()
    return render_template("winners.html", winners=winners)

#------ - HALL OF FAME TEMPLATE-------
@app.route("/hall_of_fame")
def hall_of_fame():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT w.year, w.winner_photo,
               t1.team_name AS winner_team,
               t2.team_name AS runnerup_team
        FROM winners w
        LEFT JOIN teams t1 ON w.winner_team_id = t1.id
        LEFT JOIN teams t2 ON w.runnerup_team_id = t2.id
        WHERE w.year = %s
        ORDER BY w.year DESC
    """, (get_selected_year(),))
    winners = cursor.fetchall()
    conn.close()
    return render_template("hall_of_fame.html", winners=winners)

# ---------------------------- SELECT MVP ------------------------------
@app.route("/admin/select_mvp", methods=["GET", "POST"])
@admin_required
def select_mvp():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # If admin selected MVP
    if request.method == "POST":
        selected_player = request.form.get("mvp_player")

        # Reset any previous MVP for that year
        cursor.execute("UPDATE players SET is_mvp = 0 WHERE year = %s", (get_selected_year(),))

        # Set new MVP
        cursor.execute("UPDATE players SET is_mvp = 1 WHERE id = %s AND year = %s", (selected_player, get_selected_year()))
        conn.commit()
        conn.close()
        return redirect("/leaderboard")

    # Get top 3 suggested MVP for selected year
    cursor.execute("""
        SELECT id, player_name, cod_name, kills, deaths, kd_ratio, total_matches
        FROM players
        WHERE year = %s
        ORDER BY kd_ratio DESC, kills DESC, deaths ASC
        LIMIT 3
    """, (get_selected_year(),))
    suggestions = cursor.fetchall()
    conn.close()

    return render_template("select_mvp.html", suggestions=suggestions)

# Static serving is handled by Flask's default static_folder='/static'

# ---------------------- ADMIN HOME SETTINGS --------------------------
@app.route("/admin/home_settings", methods=["GET", "POST"])
@admin_required
def admin_home_settings():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    year = get_selected_year()

    if request.method == "POST":
        hero_title = request.form.get("hero_title")
        hero_subtitle = request.form.get("hero_subtitle")

        cursor.execute("SELECT * FROM home_settings WHERE year = %s LIMIT 1", (year,))
        old_settings = cursor.fetchone()

        old_bg = old_settings["hero_background"] if old_settings else None
        old_logo = old_settings["college_logo"] if old_settings else None

        # ===== SAVE HERO BACKGROUND FILE =====
        hero_bg_file = request.files.get("hero_background")
        if hero_bg_file and hero_bg_file.filename != "":
            filename_bg = secure_filename(hero_bg_file.filename)
            hero_bg_file.save(os.path.join(UPLOAD_FOLDER, filename_bg))
        else:
            filename_bg = old_bg

        # ===== SAVE COLLEGE LOGO FILE =====
        college_logo_file = request.files.get("college_logo")
        if college_logo_file and college_logo_file.filename != "":
            filename_logo = secure_filename(college_logo_file.filename)
            college_logo_file.save(os.path.join(UPLOAD_FOLDER, filename_logo))
        else:
            filename_logo = old_logo

        # Remove current year settings then insert new (keeps single row per year)
        cursor.execute("DELETE FROM home_settings WHERE year = %s", (year,))
        cursor.execute("""
            INSERT INTO home_settings(year, hero_title, hero_subtitle, hero_background, college_logo)
            VALUES (%s, %s, %s, %s, %s)
        """, (year, hero_title, hero_subtitle, filename_bg, filename_logo))

        conn.commit()

    cursor.execute("SELECT * FROM home_settings WHERE year = %s LIMIT 1", (year,))
    settings = cursor.fetchone()

    cursor.execute("SELECT id, player_name FROM players WHERE year = %s", (year,))
    players = cursor.fetchall()

    cursor.execute("SELECT hfp.id, hfp.rank_number, p.player_name FROM home_featured_players hfp LEFT JOIN players p ON hfp.player_id = p.id WHERE hfp.year = %s ORDER BY hfp.rank_number ASC", (year,))
    featured_players = cursor.fetchall()

    cursor.execute("SELECT * FROM home_highlights WHERE year = %s", (year,))
    highlights = cursor.fetchall()
    
    cursor.execute("SELECT * FROM home_hero_images WHERE year = %s", (year,))
    hero_images = cursor.fetchall()

    conn.close()

    return render_template(
        "admin_home_settings.html",
        settings=settings,
        players=players,
        featured_players=featured_players,
        highlights=highlights,
        hero_images=hero_images
    )

# --- Add/Delete Featured Player ---
@app.route("/admin/home_featured_player_add", methods=["POST"])
@admin_required
def admin_home_featured_player_add():
    rank = request.form.get("rank_number")
    player_id = request.form.get("player_id")
    year = get_selected_year()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    # Check if rank already taken for this year
    cursor.execute("SELECT id FROM home_featured_players WHERE rank_number = %s AND year = %s", (rank, year))
    if cursor.fetchone():
        flash(f"Rank {rank} is already taken for this year.", "warning")
    else:
        cursor.execute("INSERT INTO home_featured_players (player_id, rank_number, year) VALUES (%s, %s, %s)",
                       (player_id, rank, year))
        conn.commit()
        flash("Featured player added!", "success")
    conn.close()
    return redirect(url_for("admin_home_settings"))

@app.route("/admin/home_featured_player_delete/<int:fid>")
@admin_required
def admin_home_featured_player_delete(fid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM home_featured_players WHERE id = %s", (fid,))
    conn.commit()
    conn.close()
    flash("Featured player removed.", "info")
    return redirect(url_for("admin_home_settings"))

# --- Add/Delete Highlights ---
@app.route("/admin/home_highlight_add", methods=["POST"])
@admin_required
def admin_home_highlight_add():
    title = request.form.get("title")
    desc = request.form.get("description")
    year = get_selected_year()
    
    filename = None
    if "image" in request.files:
        img = request.files["image"]
        if img and img.filename != "":
            filename = secure_filename(img.filename)
            img.save(os.path.join(UPLOAD_FOLDER, filename))
            
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO home_highlights (title, description, image, year) VALUES (%s, %s, %s, %s)",
                   (title, desc, filename, year))
    conn.commit()
    conn.close()
    flash("Highlight added!", "success")
    return redirect(url_for("admin_home_settings"))

@app.route("/admin/home_highlight_delete/<int:hid>")
@admin_required
def admin_home_highlight_delete(hid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM home_highlights WHERE id = %s", (hid,))
    conn.commit()
    conn.close()
    flash("Highlight removed.", "info")
    return redirect(url_for("admin_home_settings"))

# --- Hero Carousel ---
@app.route("/admin/home_hero_add", methods=["POST"])
@admin_required
def admin_home_hero_add():
    year = get_selected_year()
    if "image" in request.files:
        img = request.files["image"]
        if img and img.filename != "":
            filename = secure_filename(img.filename)
            img.save(os.path.join(UPLOAD_FOLDER, filename))
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO home_hero_images (image, year) VALUES (%s, %s)", (filename, year))
            conn.commit()
            conn.close()
            flash("Hero photo added!", "success")
    return redirect(url_for("admin_home_settings"))

@app.route("/admin/home_hero_delete/<int:hid>")
@admin_required
def admin_home_hero_delete(hid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM home_hero_images WHERE id = %s", (hid,))
    conn.commit()
    conn.close()
    flash("Hero photo removed.", "info")
    return redirect(url_for("admin_home_settings"))

@app.route("/admin/audit_logs")
@admin_required
def admin_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.*, admin.username 
        FROM audit_logs a 
        LEFT JOIN admin ON a.admin_id = admin.id 
        ORDER BY a.timestamp DESC 
        LIMIT 100
    """)
    logs = cursor.fetchall()
    conn.close()
    return render_template("admin_audit_logs.html", logs=logs)

# ------------------- DATA ANALYTICS (PUBLIC JSON) -------------------
@app.route("/api/player_stats/<int:player_id>")
def api_player_stats(player_id):
    """API for Chart.js performance visualization."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT match_date, kd_ratio, kills 
        FROM matchesresult 
        WHERE player_id = %s 
        ORDER BY match_date ASC
    """, (player_id,))
    stats = cursor.fetchall()
    conn.close()
    return {"stats": stats}

# ------------------- PLAYER COMPARISON -------------------
@app.route("/compare")
def compare():
    """Public page for player head-to-head comparison."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, cod_name, player_name FROM players WHERE status = 'active' ORDER BY player_name")
    players = cursor.fetchall()
    conn.close()
    return render_template("compare.html", players=players)

@app.route("/api/compare_data")
def api_compare_data():
    """Fetch stats for two players for comparison."""
    p1_id = request.args.get("p1")
    p2_id = request.args.get("p2")
    
    if not p1_id or not p2_id:
        return {"error": "Two players required"}, 400
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    def get_stats(pid):
        cursor.execute("""
            SELECT p.*, t.team_name,
                   (SELECT COUNT(*) FROM matchesresult WHERE player_id = p.id) as total_matches,
                   (SELECT SUM(kills) FROM matchesresult WHERE player_id = p.id) as total_kills,
                   (SELECT SUM(deaths) FROM matchesresult WHERE player_id = p.id) as total_deaths,
                   (SELECT SUM(assists) FROM matchesresult WHERE player_id = p.id) as total_assists
            FROM players p
            LEFT JOIN teams t ON p.team_id = t.id
            WHERE p.id = %s
        """, (pid,))
        return cursor.fetchone()
        
    p1_stats = get_stats(p1_id)
    p2_stats = get_stats(p2_id)
    conn.close()
    
    return {"p1": p1_stats, "p2": p2_stats}

# ------------------- TOURNAMENT BRACKETS -------------------
@app.route("/brackets")
def brackets():
    """Public view for Visual Brackets."""
    year = get_selected_year()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT tm.*, t1.team_name as team_a_name, t2.team_name as team_b_name, tw.team_name as winner_name
        FROM tournament_matches tm
        LEFT JOIN teams t1 ON tm.team_a_id = t1.id
        LEFT JOIN teams t2 ON tm.team_b_id = t2.id
        LEFT JOIN teams tw ON tm.winner_team_id = tw.id
        WHERE tm.year = %s
        ORDER BY tm.match_index ASC
    """, (year,))
    matches = cursor.fetchall()
    conn.close()
    return render_template("brackets.html", matches=matches)

@app.route("/admin/brackets", methods=["GET", "POST"])
@admin_required
def admin_brackets():
    year = get_selected_year()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == "POST":
        action = request.form.get("action")
        if action == "add":
            round_name = request.form.get("round_name")
            team_a_id = request.form.get("team_a")
            team_b_id = request.form.get("team_b")
            match_index = request.form.get("match_index")
            next_match_id = request.form.get("next_match_id") or None
            
            cursor.execute("""
                INSERT INTO tournament_matches (round_name, team_a_id, team_b_id, match_index, next_match_id, year)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (round_name, team_a_id, team_b_id, match_index, next_match_id, year))
            conn.commit()
            log_action("Define Bracket Match", f"Added {round_name} match index {match_index}")
            flash("Bracket match defined!", "success")
        
        elif action == "set_winner":
            match_id = request.form.get("match_id")
            winner_id = request.form.get("winner_id")
            
            # Update winner
            cursor.execute("UPDATE tournament_matches SET winner_team_id = %s WHERE id = %s", (winner_id, match_id))
            
            # Move to next match if applicable
            cursor.execute("SELECT next_match_id FROM tournament_matches WHERE id = %s", (match_id,))
            nxt = cursor.fetchone()
            if nxt and nxt["next_match_id"]:
                # Check if this winner goes to slot A or B of the next match
                # Simple logic: odd match_index go to slot A, even to slot B
                cursor.execute("SELECT match_index FROM tournament_matches WHERE id = %s", (match_id,))
                curr_idx = int(cursor.fetchone()["match_index"])
                if curr_idx % 2 != 0:
                    cursor.execute("UPDATE tournament_matches SET team_a_id = %s WHERE id = %s", (winner_id, nxt["next_match_id"]))
                else:
                    cursor.execute("UPDATE tournament_matches SET team_b_id = %s WHERE id = %s", (winner_id, nxt["next_match_id"]))
            
            conn.commit()
            log_action("Set Bracket Winner", f"Match {match_id} won by team {winner_id}")
            flash("Winner promoted to next round!", "success")

    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (year,))
    teams = cursor.fetchall()
    
    cursor.execute("""
        SELECT tm.*, t1.team_name as team_a_name, t2.team_name as team_b_name, tw.team_name as winner_name
        FROM tournament_matches tm
        LEFT JOIN teams t1 ON tm.team_a_id = t1.id
        LEFT JOIN teams t2 ON tm.team_b_id = t2.id
        LEFT JOIN teams tw ON tm.winner_team_id = tw.id
        WHERE tm.year = %s
        ORDER BY tm.match_index ASC
    """, (year,))
    matches = cursor.fetchall()
    
    conn.close()
    return render_template("admin_brackets.html", teams=teams, matches=matches)
@app.route("/admin/schedules", methods=["GET", "POST"])
@admin_required
def admin_schedules():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if request.method == "POST":
        team_a = request.form["team_a"]
        team_b = request.form["team_b"]
        match_time = request.form["match_time"]
        description = request.form["description"]
        year = get_selected_year()
        cursor.execute("INSERT INTO match_schedules (team_a_id, team_b_id, match_time, description, year) VALUES (%s, %s, %s, %s, %s)",
                       (team_a, team_b, match_time, description, year))
        conn.commit()
        flash("Match scheduled!", "success")
        return redirect(url_for("admin_schedules"))
    
    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()
    cursor.execute("""
        SELECT s.*, t1.team_name as team_a_name, t2.team_name as team_b_name 
        FROM match_schedules s 
        JOIN teams t1 ON s.team_a_id = t1.id 
        JOIN teams t2 ON s.team_b_id = t2.id 
        WHERE s.year = %s
    """, (get_selected_year(),))
    schedules = cursor.fetchall()
    conn.close()
    return render_template("admin_schedules.html", teams=teams, schedules=schedules)

@app.route("/admin/schedules/delete/<int:sid>")
@admin_required
def delete_schedule(sid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM match_schedules WHERE id = %s", (sid,))
    conn.commit()
    conn.close()
    flash("Schedule removed.", "info")
    return redirect(url_for("admin_schedules"))

# ------------------- News (Admin) -------------------
@app.route("/admin/news", methods=["GET", "POST"])
@admin_required
def admin_news():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if request.method == "POST":
        title = request.form["title"]
        content = request.form["content"]
        year = get_selected_year()
        
        filename = None
        if "image" in request.files:
            img = request.files["image"]
            if img and img.filename != "":
                filename = secure_filename(img.filename)
                img.save(os.path.join(UPLOAD_FOLDER, filename))
        
        cursor.execute("INSERT INTO news (title, content, image, year) VALUES (%s, %s, %s, %s)", (title, content, filename, year))
        conn.commit()
        flash("News posted!", "success")
        return redirect(url_for("admin_news"))
    
    cursor.execute("SELECT * FROM news WHERE year = %s ORDER BY created_at DESC", (get_selected_year(),))
    news_items = cursor.fetchall()
    conn.close()
    return render_template("admin_news.html", news=news_items)

@app.route("/admin/news/delete/<int:nid>")
@admin_required
def delete_news(nid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM news WHERE id = %s", (nid,))
    conn.commit()
    conn.close()
    flash("News deleted.", "info")
    return redirect(url_for("admin_news"))

# ------------------- Public Schedule & News -------------------
@app.route("/schedule")
def public_schedule():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.*, t1.team_name as team_a_name, t2.team_name as team_b_name 
        FROM match_schedules s 
        JOIN teams t1 ON s.team_a_id = t1.id 
        JOIN teams t2 ON s.team_b_id = t2.id 
        WHERE s.year = %s
        ORDER BY s.match_time ASC
    """, (get_selected_year(),))
    schedules = cursor.fetchall()
    conn.close()
    return render_template("schedule.html", schedules=schedules)

@app.route("/news")
def public_news():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM news WHERE year = %s ORDER BY created_at DESC", (get_selected_year(),))
    news_items = cursor.fetchall()
    conn.close()
    return render_template("news.html", news=news_items)


@app.route("/set_year", methods=["POST"])
def set_year_public():
    year = request.form.get("year")
    try:
        session["selected_year"] = int(year)
    except:
        session["selected_year"] = datetime.now().year
    return redirect(request.referrer or "/")

if __name__ == "__main__":
    app.run(debug=True)

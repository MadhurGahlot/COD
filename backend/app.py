from flask import Flask, render_template, request, redirect, session, send_from_directory, url_for
from database import get_db_connection
import os
import mysql.connector
from werkzeug.utils import secure_filename
from datetime import datetime


app = Flask(__name__)
app.secret_key = "your_secret_key"

# Upload folder absolute path (ensures no FileNotFoundError)
UPLOAD_FOLDER = os.path.join(app.root_path, "static")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PLAYER_PHOTOS_FOLDER = os.path.join(UPLOAD_FOLDER, "player_photos")
if not os.path.exists(PLAYER_PHOTOS_FOLDER):
    os.makedirs(PLAYER_PHOTOS_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["PLAYER_PHOTOS"] = PLAYER_PHOTOS_FOLDER

# ------------------ Helpers ------------------
@app.before_request
def ensure_selected_year():
    if "selected_year" not in session:
        session["selected_year"] = datetime.now().year

def get_selected_year():
    # Ensure selected year exists in session
    if "selected_year" not in session:
        session["selected_year"] = datetime.now().year
    return int(session["selected_year"])


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
        teams=teams,
        players=players_count,
        matches=matches
    )

# -------- SERVE OTHER FRONTEND FILES (HTML, JS, images) ----------
@app.route("/frontend/<path:filename>")
def serve_frontend(filename):
    return send_from_directory("../frontend", filename)

# -------- STATIC FILES (CSS, JS, IMAGES) ----------
# Note: Flask by default serves /static/, but we keep this route consistent
@app.route("/static/<path:filename>")
def serve_static_files(filename):
    return send_from_directory(os.path.join(app.root_path, "static"), filename)

# -------------------- ADMIN LOGIN --------------------
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    error = None
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM admin WHERE username=%s AND password=%s", (username, password))
        admin = cursor.fetchone()
        conn.close()

        if admin:
            session["admin_logged_in"] = True
            session["selected_year"] = datetime.now().year
            return redirect("/admin/dashboard")
        else:
            error = "Invalid Username or Password"

    return render_template("admin_login.html", error=error)

# Redirect /admin -> /admin/login for convenience
@app.route("/admin")
def admin_redirect():
    return redirect("/admin/login")

# -------------------- ADMIN DASHBOARD --------------------
@app.route("/admin/dashboard")
def admin_dashboard():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")
    # ensure selected_year exists
    get_selected_year()
    return render_template("admin_dashboard.html")

# ---------------- Admin: set year (switch season) ----------------
@app.route("/admin/set_year", methods=["POST"])
def admin_set_year():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")
    selected = request.form.get("year")
    try:
        session["selected_year"] = int(selected)
    except:
        session["selected_year"] = datetime.now().year
    return redirect("/admin/dashboard")

# ------------------- Teams -----------------------
@app.route("/admin/teams", methods=["GET", "POST"])
def admin_teams():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = mysql.connector.connect(host="localhost", user="root", password="Madhur", database="cod_tournament")
    cursor = conn.cursor(dictionary=True)

    if request.method == "POST":
        team_name = request.form["team_name"]
        # allow explicit year from form or use session selected year
        year = request.form.get("year")
        year_to_save = int(year) if year else get_selected_year()

        cursor.execute("INSERT INTO teams (team_name, year) VALUES (%s, %s)", (team_name, year_to_save))
        conn.commit()
        conn.close()
        return redirect("/admin/teams")

    cursor.execute("SELECT id, team_name, year FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()
    conn.close()

    return render_template("admin_teams.html", teams=teams)

# ----------------------------- ADMIN PLAYER -----------------------------
@app.route("/admin/players", methods=["GET", "POST"])
def admin_players():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = mysql.connector.connect(host="localhost", user="root", password="Madhur", database="cod_tournament")
    cursor = conn.cursor(dictionary=True)

    # --- ADD PLAYER ---
    if request.method == "POST":
        player_name = request.form["player_name"]
        cod_name = request.form.get("cod_name", "")
        email = request.form["email"]
        team_id = request.form.get("team_id") or None
        # prefer form year if provided else selected session year
        year = request.form.get("year")
        year = int(year) if year else get_selected_year()

        # Photo upload
        filename = None
        if "photo" in request.files:
            photo = request.files["photo"]
            if photo and photo.filename != "":
                filename = secure_filename(photo.filename)
                photo.save(os.path.join(app.config["PLAYER_PHOTOS"], filename))

        cursor.execute("""
            INSERT INTO players (player_name, cod_name, email, team_id, photo, year)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (player_name, cod_name, email, team_id, filename, year))

        conn.commit()
        conn.close()
        return redirect("/admin/players")

    # --- LOAD TEAMS (for selected year) ---
    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()

    # --- LOAD PLAYERS (for selected year) ---
    cursor.execute("""
        SELECT players.id, players.player_name, players.cod_name, players.email, 
               teams.team_name, players.photo
        FROM players 
        LEFT JOIN teams ON players.team_id = teams.id
        WHERE players.year = %s
    """, (get_selected_year(),))
    players = cursor.fetchall()

    conn.close()

    return render_template("admin_players.html", teams=teams, players=players)

@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_logged_in", None)
    return redirect("/admin/login")

# ----------------------- Public pages -----------------------
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

    conn.close()

    return render_template("player_profile.html", player=player, mvp=mvp)

# ---------------- Admin: matches selection and entering per team ----------------
@app.route("/admin/matches", methods=["GET", "POST"])
def admin_matches():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

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

        return render_template("enter_match_result.html", players_a=players_a, players_b=players_b)

    conn.close()
    return render_template("select_teams.html", teams=teams)

#-------- MATCH RESULT (single player result entry) -----------
@app.route("/admin/add_match", methods=["GET", "POST"])
def add_match():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == "POST":
        player_id = request.form["player_id"]
        opponent = request.form["opponent"]
        kills = int(request.form["kills"])
        deaths = int(request.form["deaths"])
        assists = int(request.form.get("assists", 0))
        match_date = request.form["match_date"]
        year = get_selected_year()

        # Insert match record (with year)
        cursor.execute("""
            INSERT INTO matchesresult (player_id, opponent, kills, deaths, assists, match_date, year)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (player_id, opponent, kills, deaths, assists, match_date, year))

        # Update player stats (these stats remain global per year)
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
        conn.close()
        return redirect("/admin/add_match")

    # Get players for dropdown (selected year)
    cursor.execute("SELECT id, player_name FROM players WHERE year = %s", (get_selected_year(),))
    players = cursor.fetchall()
    conn.close()

    return render_template("add_match.html", players=players)

# ---------------------- SAVE TEAM-VS-TEAM TO DATABASE ---------------
@app.route("/admin/save_match", methods=["POST"])
def save_match():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Year for this save operation
    year = get_selected_year()

    cursor.execute("SELECT id FROM players WHERE year = %s", (year,))
    players = cursor.fetchall()

    for (player_id,) in players:
        kills = request.form.get(f"kills_{player_id}")
        deaths = request.form.get(f"deaths_{player_id}")
        assists = request.form.get(f"assists_{player_id}")

        if kills:
            cursor.execute("""
                UPDATE players
                SET kills = kills + %s, deaths = deaths + %s, assists = assists + %s,
                    total_matches = total_matches + 1,
                    kd_ratio = (kills + %s) / NULLIF((deaths + %s),0)
                WHERE id = %s AND year = %s
            """, (kills, deaths, assists, kills, deaths, player_id, year))

    conn.commit()
    conn.close()

    return redirect("/admin/leaderboard")

#------------------- LEADER BOARD --------------------------
@app.route("/leaderboard")
def leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Use year filter
    cursor.execute("""
        SELECT players.*, teams.team_name 
        FROM players
        LEFT JOIN teams ON players.team_id = teams.id AND teams.year = players.year
        WHERE players.year = %s
        ORDER BY kd_ratio DESC
    """, (get_selected_year(),))

    leaderboard = cursor.fetchall()
    conn.close()

    # MVP is the top player in KD ratio for the year
    mvp = leaderboard[0] if leaderboard else None

    return render_template("leaderboard.html", leaderboard=leaderboard, mvp=mvp)

# ------------------------- ADMIN HALL OF FAME ----------- (Winners)
@app.route("/admin/winners", methods=["GET", "POST"])
def admin_winners():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Add Winner Entry
    if request.method == "POST":
        year = request.form.get("year")
        # Use provided year or selected_year
        year_to_save = int(year) if year else get_selected_year()
        winner_team_id = request.form["winner_team_id"]
        runnerup_team_id = request.form["runnerup_team_id"]
        
        photo_file = request.files.get("winner_photo")
        filename = None
        if photo_file and photo_file.filename != "":
            filename = secure_filename(photo_file.filename)
            # save in player_photos folder to keep uploads organized
            photo_file.save(os.path.join(app.config["PLAYER_PHOTOS"], filename))

        cursor.execute("""
            INSERT INTO winners (year, winner_team_id, runnerup_team_id, winner_photo)
            VALUES (%s, %s, %s, %s)
        """, (year_to_save, winner_team_id, runnerup_team_id, filename))

        conn.commit()

    # Load Teams for dropdown (for selected year)
    cursor.execute("SELECT id, team_name FROM teams WHERE year = %s", (get_selected_year(),))
    teams = cursor.fetchall()

    # Load Winners List (filter by session year)
    cursor.execute("""
    SELECT winners.year, winners.winner_photo,
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

# -------------------- Public Hall of fame -----------------
@app.route("/winners")
def public_winners():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT winners.year, winners.winner_photo,
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
def select_mvp():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

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

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('frontend', path)

# ---------------------- ADMIN HOME SETTINGS --------------------------
@app.route("/admin/home_settings", methods=["GET", "POST"])
def admin_home_settings():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

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

    conn.close()

    return render_template(
        "admin_home_settings.html",
        settings=settings,
        players=players,
        featured_players=featured_players,
        highlights=highlights
    )

# -------------------- FEATURED PLAYERS & HIGHLIGHTS ROUTES ----------------

@app.route("/admin/home_featured_player_add", methods=["POST"])
def admin_home_featured_player_add():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    player_id = request.form.get("player_id")
    rank_number = request.form.get("rank_number")
    year = get_selected_year()

    conn = get_db_connection()
    cursor = conn.cursor()

    # If rank already taken for this year, replace it
    cursor.execute("DELETE FROM home_featured_players WHERE rank_number = %s AND year = %s", (rank_number, year))

    cursor.execute("INSERT INTO home_featured_players (player_id, rank_number, year) VALUES (%s, %s, %s)", (player_id, rank_number, year))
    conn.commit()
    conn.close()

    return redirect("/admin/home_settings")

@app.route("/admin/home_featured_player_delete/<int:fp_id>")
def admin_home_featured_player_delete(fp_id):
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM home_featured_players WHERE id = %s", (fp_id,))
    conn.commit()
    conn.close()
    return redirect("/admin/home_settings")

@app.route("/admin/home_highlight_add", methods=["POST"])
def admin_home_highlight_add():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    title = request.form.get("title")
    description = request.form.get("description")
    year = get_selected_year()

    image_file = request.files.get("image")
    filename = None
    if image_file and image_file.filename != "":
        filename = secure_filename(image_file.filename)
        image_file.save(os.path.join(UPLOAD_FOLDER, filename))

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO home_highlights (image, title, description, year) VALUES (%s, %s, %s, %s)", (filename, title, description, year))
    conn.commit()
    conn.close()

    return redirect("/admin/home_settings")

@app.route("/admin/home_highlight_delete/<int:hid>")
def admin_home_highlight_delete(hid):
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM home_highlights WHERE id = %s", (hid,))
    conn.commit()
    conn.close()
    return redirect("/admin/home_settings")


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

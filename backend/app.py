from flask import Flask, render_template, request, redirect, session ,send_from_directory
from database import get_db_connection
import os
#from database import mydb
import mysql.connector

app = Flask(__name__)
app.secret_key = "your_secret_key"  # change later

# Serve frontend files
@app.route("/")
def home():
    frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
    return send_from_directory(frontend_path, "index.html")


@app.route("/<path:filename>")
def serve_static_site(filename):
    return send_from_directory("frontend", filename)


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
            return redirect("/admin/dashboard")
        else:
            error = "Invalid Username or Password"

    return render_template("admin_login.html", error=error)

# -------------------- ADMIN DASHBOARD --------------------

@app.route("/admin/dashboard")
def admin_dashboard():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")
    return render_template("admin_dashboard.html")

# ------------------- Teams -----------------------
@app.route("/admin/teams", methods=["GET", "POST"])
def admin_teams():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    if request.method == "POST":
        team_name = request.form["team_name"]

        conn = mysql.connector.connect(host="localhost", user="root", password="Madhur", database="cod_tournament")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO teams (team_name) VALUES (%s)", (team_name,))
        conn.commit()
        conn.close()

        return redirect("/admin/teams")

    conn = mysql.connector.connect(host="localhost", user="root", password="Madhur", database="cod_tournament")
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, team_name FROM teams")
    teams = cursor.fetchall()
    conn.close()

    return render_template("admin_teams.html", teams=teams)


from werkzeug.utils import secure_filename
UPLOAD_FOLDER = "static/player_photos"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

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
        cod_name = request.form["cod_name"]
        email = request.form["email"]
        team_id = request.form["team_id"]
        year = request.form["year"]

        # Photo upload
        filename = None
        if "photo" in request.files:
            photo = request.files["photo"]
            if photo.filename != "":
                filename = secure_filename(photo.filename)
                photo.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        cursor.execute("""
            INSERT INTO players (player_name, cod_name, email, team_id, photo, year)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (player_name, cod_name, email, team_id, filename, year))

        conn.commit()   # ✅ IMPORTANT
        return redirect("/admin/players")  # ✅ Refresh page after adding

    # --- LOAD TEAMS ---
    cursor.execute("SELECT id, team_name FROM teams")
    teams = cursor.fetchall()

    # --- LOAD PLAYERS ---
    cursor.execute("""
        SELECT players.id, players.player_name, players.cod_name, players.email, 
               teams.team_name, players.photo
        FROM players 
        LEFT JOIN teams ON players.team_id = teams.id
    """)
    players = cursor.fetchall()

    conn.close()

    return render_template("admin_players.html", teams=teams, players=players)


@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_logged_in", None)
    return redirect("/admin/login")
# --------------------------------------------------------

# ----------------------- Home HTML ----------------
@app.route("/home")
def public_home():
    return render_template("home.html")

# -------------------TEAMS HTML -------------------
@app.route("/teams")
def public_teams():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT teams.id, teams.team_name, COUNT(players.id) AS player_count
        FROM teams
        LEFT JOIN players ON players.team_id = teams.id
        GROUP BY teams.id
    """)
    teams = cursor.fetchall()

    conn.close()
    return render_template("teams.html", teams=teams)
# -------------------- Teams details ---------- 

@app.route("/team/<int:team_id>")
def team_details(team_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get team info
    cursor.execute("SELECT * FROM teams WHERE id=%s", (team_id,))
    team = cursor.fetchone()

    # Get players of that team
    cursor.execute("""
    SELECT id AS player_id, player_name, cod_name, email, photo, kills, deaths, assists, kd_ratio
    FROM players
    WHERE team_id=%s
""", (team_id,))

    players = cursor.fetchall()

    conn.close()
    return render_template("team_details.html", team=team, players=players)


#------------------- Player Profile route ------------------
@app.route("/player/<int:player_id>")
def player_profile(player_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get player info
    cursor.execute("""
        SELECT players.*, teams.team_name 
        FROM players
        LEFT JOIN teams ON players.team_id = teams.id
        WHERE players.id=%s
    """, (player_id,))
    player = cursor.fetchone()

    # Get AUTO MVP (Top K/D ratio in all players)
    cursor.execute("""
        SELECT * FROM players
        ORDER BY kd_ratio DESC, kills DESC
        LIMIT 1
    """)
    mvp = cursor.fetchone()

    conn.close()

    return render_template("player_profile.html", player=player, mvp=mvp)




# Team vs Team Rsult --------------------

@app.route("/admin/matches", methods=["GET", "POST"])
def admin_matches():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get all teams
    cursor.execute("SELECT * FROM teams")
    teams = cursor.fetchall()

    if request.method == "POST":
        team_a = request.form["team_a"]
        team_b = request.form["team_b"]

        # Get players of both teams
        cursor.execute("SELECT * FROM players WHERE team_id = %s", (team_a,))
        players_a = cursor.fetchall()

        cursor.execute("SELECT * FROM players WHERE team_id = %s", (team_b,))
        players_b = cursor.fetchall()

        conn.close()

        return render_template("enter_match_result.html", players_a=players_a, players_b=players_b)

    conn.close()
    return render_template("select_teams.html", teams=teams)


#--------           MATCHES RESULT-----------
@app.route("/admin/add_match", methods=["GET", "POST"])
def add_match():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == "POST":
        player_id = request.form["player_id"]
        opponent = request.form["opponent"]
        kills = int(request.form["kills"])
        deaths = int(request.form["deaths"])
        assists = int(request.form["assists"])
        match_date = request.form["match_date"]

        # Insert match record
        cursor.execute("""
            INSERT INTO matchesresult (player_id, opponent, kills, deaths, assists, match_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (player_id, opponent, kills, deaths, assists, match_date))

        # Update player stats
        cursor.execute("""
            UPDATE players 
            SET kills = kills + %s,
                deaths = deaths + %s,
                assists = assists + %s,
                total_matches = total_matches + 1,
                kd_ratio = (kills + %s) / NULLIF((deaths + %s), 0)
            WHERE id = %s
        """, (kills, deaths, assists, kills, deaths, player_id))

        conn.commit()
        conn.close()
        return redirect("/admin/add_match")

    # Get players for dropdown
    cursor.execute("SELECT id, player_name FROM players")
    players = cursor.fetchall()
    conn.close()

    return render_template("add_match.html", players=players)

# ---------------------- SAVE DAT OF TEAM VS TEAM TO DATABASE ---------------
@app.route("/admin/save_match", methods=["POST"])
def save_match():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM players")
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
                WHERE id = %s
            """, (kills, deaths, assists, kills, deaths, player_id))

    conn.commit()
    conn.close()

    return redirect("/admin/leaderboard")

#------------------- LEADER BOARD --------------------------
@app.route("/leaderboard")
def leaderboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT players.*, teams.team_name 
        FROM players
        LEFT JOIN teams ON players.team_id = teams.id
        ORDER BY kd_ratio DESC
    """)

    leaderboard = cursor.fetchall()
    conn.close()

    # MVP is the top player in KD ratio
    mvp = leaderboard[0] if leaderboard else None

    return render_template("leaderboard.html", leaderboard=leaderboard, mvp=mvp)

# ------------------------- ADMIN HALL OF FAME -----------
@app.route("/admin/winners", methods=["GET", "POST"])
def admin_winners():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Add Winner Entry
    if request.method == "POST":
        year = request.form["year"]
        winner_team_id = request.form["winner_team_id"]
        runnerup_team_id = request.form["runnerup_team_id"]
        
        photo_file = request.files.get("winner_photo")
        filename = None
        if photo_file and photo_file.filename != "":
            filename = secure_filename(photo_file.filename)
            photo_file.save(os.path.join("static/player_photos", filename))

        cursor.execute("""
            INSERT INTO winners (year, winner_team_id, runnerup_team_id, winner_photo)
            VALUES (%s, %s, %s, %s)
        """, (year, winner_team_id, runnerup_team_id, filename))

        conn.commit()

    # Load Teams for dropdown
    cursor.execute("SELECT id, team_name FROM teams")
    teams = cursor.fetchall()

    # Load Winners List
    cursor.execute("""
    SELECT winners.year, winners.winner_photo,
           t1.team_name AS winner_team,
           t2.team_name AS runnerup_team
    FROM winners
    LEFT JOIN teams t1 ON winners.winner_team_id = t1.id
    LEFT JOIN teams t2 ON winners.runnerup_team_id = t2.id
    ORDER BY winners.year DESC
     """)
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
        ORDER BY winners.year DESC
    """)
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
        ORDER BY w.year DESC
    """)
    winners = cursor.fetchall()
    return render_template("hall_of_fame.html", winners=winners)

# ---------------------------- SELECT MYP ------------------------------
@app.route("/admin/select_mvp", methods=["GET", "POST"])
def select_mvp():
    if "admin_logged_in" not in session:
        return redirect("/admin/login")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # If admin selected MVP
    if request.method == "POST":
        selected_player = request.form.get("mvp_player")

        # Reset any previous MVP
        cursor.execute("UPDATE players SET is_mvp = 0")

        # Set new MVP
        cursor.execute("UPDATE players SET is_mvp = 1 WHERE id = %s", (selected_player,))
        conn.commit()
        conn.close()
        return redirect("/leaderboard")

    # Get top 3 suggested MVP
    cursor.execute("""
        SELECT id, player_name, cod_name, kills, deaths, kd_ratio, total_matches
        FROM players
        ORDER BY kd_ratio DESC, kills DESC, deaths ASC
        LIMIT 3
    """)
    suggestions = cursor.fetchall()
    conn.close()

    return render_template("select_mvp.html", suggestions=suggestions)



@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('frontend', path)




if __name__ == "__main__":
    app.run(debug=True)

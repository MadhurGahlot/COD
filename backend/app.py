from flask import Flask, render_template, request, redirect, session
from database import get_db_connection
import mysql.connector

app = Flask(__name__)
app.secret_key = "your_secret_key"  # change later

@app.route("/")
def home():
    return "COD Tournament Website Running ✅"

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

import os
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

if __name__ == "__main__":
    app.run(debug=True)

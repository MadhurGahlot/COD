from flask import Flask, render_template, request, redirect, session
from database import get_db_connection

app = Flask(__name__)
app.secret_key = "your_secret_key"  # change later

@app.route("/")
def home():
    return "COD Tournament Website Running Successfully ✅"

if __name__ == "__main__":
    app.run(debug=True)
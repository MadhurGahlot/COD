# 🎮 COD Tournament Management System (GKV)

This project is a web-based system to manage **Call of Duty Multiplayer Tournament** events for our college (GKV). The system allows player registration, team formation, match result entry, and displays stats such as kills, deaths, assists, KD ratio, and yearly winners.

---

## ✅ Features

| Feature | Description |
|--------|-------------|
| Player Registration | Only allows emails with `@gkv.ac.in` domain |
| Player Profiles | Shows stats, photo, team & performance |
| Team Creation & Joining | Registered players can join or form teams |
| Match Statistics | Admin can enter kills, deaths, assists, match scores |
| Leaderboards | Shows top performing players and teams |
| Compare Players | Compare two players head-to-head |
| Year-wise Tournament History | View winners, runner-ups and final match photos |
| Admin Panel | Secure login for entering data and managing tournament |

---

## 🏗️ Tech Stack

| Component | Technology |
|----------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python Flask |
| Database | MySQL |
| Hosting (future) | IBM Cloud / College Server |
| Version Control | Git & GitHub |
 
 SKELETION :
 cod-tournament/
│── backend/
│   ├── app.py
│   ├── database.py
│   ├── config.py
│   ├── static/
│   │    └── (optional images or winner photos later)
│   └── templates/
│        ├── admin_login.html
│        ├── admin_dashboard.html
│        ├── manage_players.html
│        ├── manage_teams.html
│        ├── enter_match_results.html
│        └── hall_of_fame.html
│
│── frontend/
│   ├── index.html
│   ├── teams.html
│   ├── players.html
│   ├── matches.html
│   ├── leaderboard.html
│   ├── compare.html
│   ├── style.css
│   └── script.js
│
│── database/
│   └── create_tables.sql   (empty for now)
│
└── README.txt

Contact info:
Email: 236301126@gmail.com

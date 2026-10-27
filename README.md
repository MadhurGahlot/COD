# 🎮 COD Tournament Management System (GKV)

A modern web-based **Call of Duty Multiplayer Tournament Management System** built for **Gurukul Kangri Vishwavidyalaya (GKV)**.

This project is the **next-generation version of the original COD Tournament Management System**, redesigned to provide a more scalable, modular, and maintainable architecture.

---

# 🔄 Migration & Rebuild

This project is being **migrated and rebuilt from the original Flask + MySQL application** into a modern full-stack architecture.

### 🕰️ Original Version

```text
Frontend  → HTML / CSS / JavaScript
Backend   → Python Flask
Database  → MySQL
```

The original version provided the initial tournament-management functionality, including:

* Player registration
* Team management
* Match result management
* Player statistics
* Leaderboards
* Player comparison
* Year-wise tournament history
* Admin panel

### 🚀 New Version

```text
Frontend  → React
Backend   → FastAPI
Database  → PostgreSQL / Neon
ORM       → SQLAlchemy
Validation → Pydantic
Auth      → JWT
API Docs  → OpenAPI / Swagger
```

The new version is **not a direct database migration**. The application is being **redesigned and rebuilt from scratch**, using the original system as a functional reference.

Existing MySQL data does not need to be migrated.

The goal is to improve:

* 🏗️ Backend architecture
* 📦 Modularity
* 🔐 Authentication and authorization
* 🗄️ Database design
* 📊 Statistics and analytics
* ⚡ API performance and scalability
* 🧪 Testing
* 🔄 Maintainability
* 🎨 Frontend experience

---

## 🏏 Architecture Evolution

### Version 1 — Flask

```text
Browser
   │
   ▼
Flask
   │
   ├── Templates
   ├── Static Files
   └── MySQL
```

### Version 2 — FastAPI

```text
React
   │
   │ REST API
   ▼
FastAPI
   │
   ├── Routes
   ├── Schemas
   ├── Services
   ├── Models
   ├── Authentication
   └── PostgreSQL / Neon
```

The new architecture also introduces an **IPL-inspired tournament structure**:

```text
Season
   │
   ├── Teams
   │     │
   │     └── Players
   │             │
   │             └── User Account
   │
   ├── Matches
   ├── Match Results
   ├── Schedule
   ├── Tournament Bracket
   └── Winners
```

---

## 🎯 Project Goal

The goal of this migration is not simply to replace Flask with FastAPI.

The objective is to **redesign the COD Tournament Management System as a scalable application** that can continue to evolve as more tournament seasons, teams, players, matches, and features are added.

The old Flask implementation will remain available as a **reference and backup**, while the new FastAPI version becomes the primary application.

---



# 🎮 COD Tournament Management System (GKV)

This project is a web-based system to manage **Call of Duty Multiplayer Tournament** events for our college (GKV). The system allows player registration, team formation, match result entry, and displays stats such as kills, deaths, assists, KD ratio, and yearly winners.

---
# 🎮 COD Tournament Management System (GKV)

A modern web-based **Call of Duty Multiplayer Tournament Management System** built for **Gurukul Kangri Vishwavidyalaya (GKV)**.

The system is designed to manage college COD tournaments with an IPL-inspired structure for **seasons, teams, squads, players, matches, statistics, leaderboards, tournament brackets, schedules, winners, and player accounts**.

The project is being rebuilt from the earlier Flask + MySQL version into a scalable **FastAPI + PostgreSQL + React** application.

---

## 🎯 Project Goal

The goal of this project is to provide a centralized platform for managing COD tournaments at GKV.

The system will allow administrators to:

* Create and manage tournament seasons
* Create teams for each season
* Manage team squads and players
* Manage player accounts
* Enter match results
* Track individual player performance
* Generate player and team leaderboards
* Manage tournament brackets
* Manage match schedules
* Record winners, runner-ups and MVPs
* Publish tournament news
* Maintain yearly tournament history

Players will have their own accounts and will automatically be associated with their registered team.

---

# ✅ Features

| Feature                | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| 🔐 Authentication      | Secure player and admin authentication using JWT             |
| 👤 Player Accounts     | Players can create and access their tournament accounts      |
| 🏏 Season Management   | Separate tournament data by year/season                      |
| 👥 Team Management     | Create and manage teams for each season                      |
| 🎮 Squad Management    | Add and manage players belonging to a team                   |
| 👤 Player Profiles     | Display player information, team, photo and statistics       |
| 📊 Match Statistics    | Record kills, deaths, assists and match performance          |
| 🏆 Leaderboards        | Display top-performing players and teams                     |
| ⚔️ Player Comparison   | Compare two players using their tournament statistics        |
| 🗓️ Match Schedule     | Manage upcoming and completed matches                        |
| 🌳 Tournament Bracket  | Manage tournament rounds and match progression               |
| 🥇 Winners             | Record champions, runner-ups and MVPs                        |
| 📰 News                | Publish tournament-related announcements                     |
| 🏠 Homepage Management | Manage featured players, matches, highlights and hero images |
| 📋 Audit Logs          | Track important administrative actions                       |
| 📥 Player/Team Import  | Support importing tournament registration data               |
| 📅 Year-wise History   | View tournament history across different seasons             |

---

# 🏏 IPL-Inspired Tournament Structure

The system follows a franchise/squad-style architecture.

```text
Season
   │
   ├── Team
   │     │
   │     ├── Player
   │     ├── Player
   │     └── Player
   │
   ├── Matches
   ├── Schedule
   ├── Tournament Bracket
   └── Winners
```

A player's account is connected to their registered player record:

```text
User Account
     ↓
Player
     ↓
Team
     ↓
Season
```

Therefore, a player does **not** need to select a team every time they log in.

---

# 📋 Registration Workflow

Tournament registrations can initially be collected through a college Google Form.

```text
Google Form
     ↓
Google Sheet
     ↓
Admin
     ↓
Create Season
     ↓
Create Teams
     ↓
Create Team Squads
     ↓
Register Players
     ↓
Player Account
     ↓
Player Dashboard
```

This prevents players from arbitrarily selecting or changing their tournament team.

---

# 📊 Match & Statistics System

The system records match-level and player-level performance.

Example:

```text
Team Alpha vs Team Bravo

Team Alpha
Kills: 25

Team Bravo
Kills: 18

Winner: Team Alpha
```

Individual statistics:

```text
Player: Madhur

Kills:   10
Deaths:   2
Assists:  5
KD Ratio: 5.00
```

These results can be used to generate:

* Player leaderboards
* Team standings
* Player comparison
* Performance statistics
* MVP selection

---

# 🏗️ Tech Stack

| Component         | Technology           |
| ----------------- | -------------------- |
| Frontend          | React                |
| Styling           | CSS / Tailwind CSS   |
| Backend           | FastAPI              |
| API Server        | Uvicorn              |
| Validation        | Pydantic             |
| ORM               | SQLAlchemy           |
| Database          | PostgreSQL           |
| Database Hosting  | Neon                 |
| Authentication    | JWT                  |
| Password Hashing  | bcrypt               |
| API Documentation | Swagger UI / OpenAPI |
| Version Control   | Git & GitHub         |
| Deployment        | To be decided        |

---

# 🏛️ Backend Architecture

The backend follows a modular FastAPI architecture.

```text
backend/
│
├── app/
│   │
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── security.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── core/
│
├── uploads/
├── tests/
├── docs/
│
├── .env
├── .env.example
├── requirements.txt
└── Dockerfile
```

### Architecture Pattern

```text
React Frontend
      │
      │ HTTP / REST API
      ▼
FastAPI Routes
      │
      ▼
Pydantic Schemas
      │
      ▼
Services
      │
      ▼
SQLAlchemy Models
      │
      ▼
PostgreSQL / Neon
```

---

# 📁 Project Structure

```text
cod-tournament/
│
├── backend/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── season.py
│   │   │   ├── team.py
│   │   │   ├── player.py
│   │   │   ├── match.py
│   │   │   ├── match_result.py
│   │   │   ├── schedule.py
│   │   │   ├── tournament.py
│   │   │   ├── winner.py
│   │   │   ├── news.py
│   │   │   ├── home.py
│   │   │   └── audit_log.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user_schema.py
│   │   │   ├── auth_schema.py
│   │   │   ├── season_schema.py
│   │   │   ├── team_schema.py
│   │   │   ├── player_schema.py
│   │   │   ├── match_schema.py
│   │   │   ├── match_result_schema.py
│   │   │   ├── schedule_schema.py
│   │   │   ├── tournament_schema.py
│   │   │   ├── winner_schema.py
│   │   │   ├── news_schema.py
│   │   │   ├── home_schema.py
│   │   │   └── audit_log_schema.py
│   │   │
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── seasons.py
│   │   │   ├── teams.py
│   │   │   ├── players.py
│   │   │   ├── matches.py
│   │   │   ├── match_results.py
│   │   │   ├── schedules.py
│   │   │   ├── tournament.py
│   │   │   ├── leaderboard.py
│   │   │   ├── winners.py
│   │   │   ├── news.py
│   │   │   ├── home.py
│   │   │   └── admin.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── season_service.py
│   │   │   ├── team_service.py
│   │   │   ├── player_service.py
│   │   │   ├── match_service.py
│   │   │   ├── match_result_service.py
│   │   │   ├── schedule_service.py
│   │   │   ├── tournament_service.py
│   │   │   ├── leaderboard_service.py
│   │   │   ├── winner_service.py
│   │   │   ├── news_service.py
│   │   │   └── home_service.py
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── file_handler.py
│   │   │   ├── pagination.py
│   │   │   ├── validators.py
│   │   │   └── helpers.py
│   │   │
│   │   └── core/
│   │       ├── __init__.py
│   │       ├── constants.py
│   │       └── exceptions.py
│   │
│   ├── uploads/
│   │   ├── players/
│   │   ├── teams/
│   │   ├── news/
│   │   └── heroes/
│   │
│   ├── tests/
│   ├── docs/
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── database/
│   └── README.md
│
└── README.md
```

---

# 🔐 Authentication

Authentication is JWT-based.

The system will support different user roles.

```text
User
 │
 ├── Player
 │
 └── Admin
```

The backend will control permissions using authentication and authorization dependencies.

Players will only be able to access operations permitted for their account.

Administrators will have access to tournament management operations.

---

# 🗄️ Database

The new system uses **PostgreSQL hosted on Neon**.

The database will be designed from scratch rather than migrating the old MySQL database.

Core entities include:

```text
users
seasons
teams
players
matches
match_results
schedules
tournament_matches
winners
news
home_settings
home_featured_players
home_featured_matches
home_hero_images
home_highlights
audit_logs
```

The database structure will be finalized before implementing the complete application.

---

# 📘 API Documentation

FastAPI automatically generates OpenAPI documentation and Swagger UI.

Run the backend:

```bash
uvicorn app.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000/docs
```

Swagger will allow developers to:

* View available API endpoints
* View request schemas
* View response schemas
* Test API endpoints
* Authenticate using JWT
* Debug API responses

---

# ⚙️ Development Setup

Clone the repository:

```bash
git clone <repository-url>
cd cod-tournament
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables using `.env`:

```env
DATABASE_URL=your_neon_postgresql_connection_string
SECRET_KEY=your_secret_key
```

Run the server:

```bash
uvicorn app.main:app --reload
```

---

# 🧪 Testing

The project will contain automated backend tests.

```text
tests/
├── test_auth.py
├── test_users.py
├── test_seasons.py
├── test_teams.py
├── test_players.py
└── test_matches.py
```

Testing will cover:

* Authentication
* Authorization
* User management
* Season management
* Team management
* Player management
* Match management
* Statistics
* API validation

---

# 🚀 Development Roadmap

### Phase 1 — Architecture

* [x] Define FastAPI backend
* [x] Select PostgreSQL/Neon
* [x] Define modular project structure
* [ ] Finalize database relationships

### Phase 2 — Backend Foundation

* [x] FastAPI setup
* [x] Neon PostgreSQL connection
* [x] SQLAlchemy setup
* [ ] Configuration management
* [ ] Authentication system

### Phase 3 — Tournament Management

* [ ] Season management
* [ ] Team management
* [ ] Player management
* [ ] Squad management
* [ ] Player account linking

### Phase 4 — Matches & Statistics

* [ ] Match creation
* [ ] Match results
* [ ] Player statistics
* [ ] Team statistics
* [ ] Leaderboards
* [ ] Player comparison

### Phase 5 — Tournament

* [ ] Match schedules
* [ ] Tournament bracket
* [ ] Tournament rounds
* [ ] Winners
* [ ] MVP

### Phase 6 — Content

* [ ] News
* [ ] Homepage settings
* [ ] Featured players
* [ ] Featured matches
* [ ] Highlights
* [ ] Hero images

### Phase 7 — Frontend

* [ ] React application
* [ ] Public homepage
* [ ] Teams
* [ ] Players
* [ ] Matches
* [ ] Leaderboards
* [ ] Player dashboard
* [ ] Admin dashboard

### Phase 8 — Production

* [ ] Automated tests
* [ ] Docker
* [ ] Backend deployment
* [ ] Frontend deployment
* [ ] Production database configuration
* [ ] Monitoring and logging

---

# 🔄 Previous Version

The original version of this project was built using:

```text
Frontend: HTML / CSS / JavaScript
Backend: Flask
Database: MySQL
```

The new version is being redesigned using:

```text
Frontend: React
Backend: FastAPI
Database: PostgreSQL / Neon
ORM: SQLAlchemy
Authentication: JWT
```

The old Flask + MySQL implementation is retained as a **reference/backup**. Existing data does not need to be migrated into the new system.

---

# 🎓 Project

**COD Tournament Management System (GKV)**

Developed for managing Call of Duty Multiplayer Tournament events at:

**Gurukul Kangri Vishwavidyalaya (GKV)**

---

# 📬 Contact

**Email:** [236301126@gmail.com]

---

⭐ If you find this project useful, consider giving the repository a star!

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
